"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "../authentication/authentication.policy";
import { getLabOrder } from "../lab-order/lab-order.service";
import { AUDIT_ACTIONS } from "../audit-log/audit-log.constant";
import { createAuditLog } from "../audit-log/audit-log.service";
import { GetLabOrderSchema } from "../lab-order/lab-order.schema";
import { UnauthorizedError } from "../authentication/authentication.error";
import { CreateAuditLogSchema } from "../audit-log/audit-log.schema";
import { ensureUserAuthenticated } from "@/lib/ensure-user-authenticated";
import { ensureLabOrderIsEditable } from "../lab-order/lab-order.policy";
import {
  ensureSpecimenIsEditable,
  ensureSpecimenCanBeCollected,
  ensureSpecimenCanBeReceived,
  resolveCollectedStatus,
  resolveReceivedStatus,
} from "./specimen.policy";
import {
  getSpecimenPersonnelCandidate,
  getSpecimenPersonnelCandidates,
} from "../user/user.service";
import {
  GetUserSchema,
  GetSpecimenPersonnelCandidatesSchema,
} from "../user/user.schema";
import { updateManyLabOrderItemSpecimen } from "../lab-order-item-specimen/lab-order-item-specimen.service";
import { UpdateManyLabOrderItemSpecimenSchema } from "../lab-order-item-specimen/lab-order-item-specimen.schema";
import { ensureLabOrderItemHasNoActiveSpecimen } from "../lab-order-item/lab-order-item.policy";
import {
  SpecimenStatus,
  AuditLogEntityType,
  SpecimenAssignmentEndReason,
} from "@/generated/prisma";
import {
  getSpecimen,
  createSpecimen,
  updateSpecimen,
  collectSpecimen,
  receiveSpecimen,
  reserveSpecimenNo,
} from "./specimen.service";
import {
  GetSpecimenSchema,
  CreateSpecimenSchema,
  UpdateSpecimenSchema,
  CollectSpecimenSchema,
  GetSpecimenActionSchema,
  ReserveSpecimenNoSchema,
  CreateSpecimenActionSchema,
  UpdateSpecimenActionSchema,
  CollectSpecimenActionSchema,
  SpecimenReceiptActionSchema,
  SpecimenReceiptSchema,
} from "./specimen.schema";

/**
 * Serializes the dates of a specimen so the client doesn't have to do it
 * manually.
 */
function serializeSpecimen(
  specimen: NonNullable<Awaited<ReturnType<typeof getSpecimen>>>,
) {
  return {
    ...specimen,
    orderItems: specimen.orderItems.map(({ assignedAt, endedAt, ...rest }) => ({
      ...rest,
      endedAt: endedAt?.toISOString(),
      assignedAt: assignedAt.toISOString(),
    })),
    createdAt: specimen.createdAt.toISOString(),
    updatedAt: specimen.updatedAt.toISOString(),
    receivedAt: specimen.receivedAt?.toISOString(),
    rejectedAt: specimen.rejectedAt?.toISOString(),
    cancelledAt: specimen.cancelledAt?.toISOString(),
    collectedAt: specimen.collectedAt?.toISOString(),
  };
}

export async function createSpecimenAction(
  params: z.infer<typeof CreateSpecimenActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "SPECIMEN:CREATE")) {
    throw new UnauthorizedError(
      "You don't have permission to create a specimen.",
    );
  }

  const { id: actorId, laboratoryId } = user;

  const specimen = await prisma.$transaction(async (tx) => {
    // Load the order first.
    // Then, make sure it's editable before creating a specimen and ensure
    // none of the order items are already assigned to an active specimen.
    const parsedGetLabOrderParams = GetLabOrderSchema.parse({
      laboratoryId,
      id: params.labOrderId,
    });

    const labOrder = await getLabOrder(tx, parsedGetLabOrderParams);

    if (!labOrder) {
      throw new Error("Order is not found");
    }

    ensureLabOrderIsEditable(labOrder);

    for (const labOrderItem of labOrder.items) {
      if (params.orderItemIds.includes(labOrderItem.id)) {
        ensureLabOrderItemHasNoActiveSpecimen(labOrderItem);
      }
    }

    // Reserve a specimen number within the current numbering period.
    const parsedReserveSpecimenNoParams = ReserveSpecimenNoSchema.parse({
      date: new Date(),
    });

    const { no, period, sequence } = await reserveSpecimenNo(
      tx,
      parsedReserveSpecimenNoParams,
    );

    // Create the specimen.
    const parsedCreateSpecimenParams = CreateSpecimenSchema.parse({
      ...params,
      no,
      period,
      sequence,
      laboratoryId,
    });

    const specimen = await createSpecimen(tx, parsedCreateSpecimenParams);

    // Create a new audit log entry for the specimen creation action.
    const parsedCreateAuditLogParams = CreateAuditLogSchema.parse({
      action: "SPECIMEN_CREATED",
      actorId,
      entityId: specimen.id,
      entityType: AuditLogEntityType.SPECIMEN,
      laboratoryId,
    });

    await createAuditLog(tx, parsedCreateAuditLogParams);

    return specimen;
  });

  return { data: serializeSpecimen(specimen) };
}

export async function getSpecimenAction(
  params: z.infer<typeof GetSpecimenActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "SPECIMEN:READ")) {
    throw new UnauthorizedError(
      "You don't have permission to view this specimen.",
    );
  }

  const { laboratoryId } = user;

  const parsedGetSpecimenParams = GetSpecimenSchema.parse({
    ...params,
    laboratoryId,
  });

  const specimen = await getSpecimen(prisma, parsedGetSpecimenParams);

  return {
    data: specimen ? serializeSpecimen(specimen) : null,
  };
}

export async function updateSpecimenAction(
  params: z.infer<typeof UpdateSpecimenActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "SPECIMEN:UPDATE")) {
    throw new UnauthorizedError(
      "You don't have permission to update this specimen.",
    );
  }

  const { id: actorId, laboratoryId } = user;

  const specimen = await prisma.$transaction(async (tx) => {
    // Load the order first and make sure it's editable before updating a specimen.
    const parsedGetLabOrderParams = GetLabOrderSchema.parse({
      laboratoryId,
      id: params.labOrderId,
    });

    const labOrder = await getLabOrder(tx, parsedGetLabOrderParams);

    if (!labOrder) {
      throw new Error("Order is not found");
    }

    ensureLabOrderIsEditable(labOrder);

    // Load the specimen first and make sure it's editable before updating it.
    const parsedGetSpecimenParams = GetSpecimenSchema.parse({
      id: params.id,
      laboratoryId,
    });

    const specimen = await getSpecimen(tx, parsedGetSpecimenParams);

    if (!specimen) {
      throw new Error("Specimen is not found");
    }

    ensureSpecimenIsEditable(specimen);

    const parsedUpdateSpecimenParams = UpdateSpecimenSchema.parse({
      ...params,
      laboratoryId,
    });

    // Reassignment flow.
    if (parsedUpdateSpecimenParams.orderItemIds) {
      const labOrderItemIdsToCreate = new Set(
        parsedUpdateSpecimenParams.orderItemIds,
      );

      const labOrderItemIdsToExclude: string[] = [];
      const endedLabOrderItemSpecimenIds: string[] = [];

      // We loop over the old specimen order item relations to determine which items
      // should be created, kept or ended. This will loop over all relations, including
      // those that have ended.
      for (const { id, endedAt, labOrderItem } of specimen.orderItems) {
        if (parsedUpdateSpecimenParams.orderItemIds.includes(labOrderItem.id)) {
          if (!endedAt) {
            labOrderItemIdsToCreate.delete(labOrderItem.id);
          }
          labOrderItemIdsToExclude.push(labOrderItem.id);
        } else {
          endedLabOrderItemSpecimenIds.push(id);
        }
      }

      parsedUpdateSpecimenParams.orderItemIds = [...labOrderItemIdsToCreate];

      // End all active relations that are no longer used.
      const reassignmentTimestamp = new Date();

      const parsedUpdateManyLabOrderItemSpecimenParams =
        UpdateManyLabOrderItemSpecimenSchema.parse({
          endedAt: reassignmentTimestamp,
          endReason: SpecimenAssignmentEndReason.REASSIGNED,
          onlyActive: true,
          specimenId: specimen.id,
          laboratoryId,
          excludedLabOrderItemIds: labOrderItemIdsToExclude,
        });

      await updateManyLabOrderItemSpecimen(
        tx,
        parsedUpdateManyLabOrderItemSpecimenParams,
      );

      // Update the specimen and create new specimen order items.
      const updatedSpecimen = await updateSpecimen(
        tx,
        parsedUpdateSpecimenParams,
      );

      // Create an audit log.
      const createdLabOrderItemSpecimenIds = updatedSpecimen.orderItems
        .filter(
          ({ endedAt, labOrderItem }) =>
            !endedAt && labOrderItemIdsToCreate.has(labOrderItem.id),
        )
        .map(({ id }) => id);

      const parsedCreateAuditLogParams = CreateAuditLogSchema.parse({
        action: AUDIT_ACTIONS.SPECIMEN_REASSIGNED,
        actorId,
        entityId: updatedSpecimen.id,
        metadata: {
          endedLabOrderItemSpecimenIds,
          createdLabOrderItemSpecimenIds,
        },
        entityType: AuditLogEntityType.SPECIMEN,
        laboratoryId,
      });

      await createAuditLog(tx, parsedCreateAuditLogParams);

      return updatedSpecimen;
    }

    // Cancellation flow.
    if (parsedUpdateSpecimenParams.cancellationReason) {
      const cancellationTimestamp = new Date();

      parsedUpdateSpecimenParams.status = SpecimenStatus.CANCELLED;
      parsedUpdateSpecimenParams.cancelledAt = cancellationTimestamp;

      // Update the specimen.
      const updatedSpecimen = await updateSpecimen(
        tx,
        parsedUpdateSpecimenParams,
      );

      // End all active relations.
      const parsedUpdateManyLabOrderItemSpecimenParams =
        UpdateManyLabOrderItemSpecimenSchema.parse({
          endedAt: cancellationTimestamp,
          endReason: SpecimenAssignmentEndReason.SPECIMEN_CANCELLED,
          onlyActive: true,
          specimenId: specimen.id,
          laboratoryId,
        });

      await updateManyLabOrderItemSpecimen(
        tx,
        parsedUpdateManyLabOrderItemSpecimenParams,
      );

      // Create an audit log.
      const parsedCreateAuditLogParams = CreateAuditLogSchema.parse({
        action: AUDIT_ACTIONS.SPECIMEN_CANCELLED,
        reason: parsedUpdateSpecimenParams.additionalReason,
        actorId,
        entityId: updatedSpecimen.id,
        metadata: { previousStatus: specimen.status },
        entityType: AuditLogEntityType.SPECIMEN,
        laboratoryId,
      });

      await createAuditLog(tx, parsedCreateAuditLogParams);

      return updatedSpecimen;
    }

    // Rejection flow.
    if (parsedUpdateSpecimenParams.rejectionReason) {
      const rejectionTimestamp = new Date();

      parsedUpdateSpecimenParams.status = SpecimenStatus.REJECTED;
      parsedUpdateSpecimenParams.rejectedAt = rejectionTimestamp;

      // Update the specimen.
      const updatedSpecimen = await updateSpecimen(
        tx,
        parsedUpdateSpecimenParams,
      );

      // End all active relations.
      const parsedUpdateManyLabOrderItemSpecimenParams =
        UpdateManyLabOrderItemSpecimenSchema.parse({
          endedAt: rejectionTimestamp,
          endReason: SpecimenAssignmentEndReason.SPECIMEN_REJECTED,
          onlyActive: true,
          specimenId: specimen.id,
          laboratoryId,
        });

      await updateManyLabOrderItemSpecimen(
        tx,
        parsedUpdateManyLabOrderItemSpecimenParams,
      );

      // Create an audit log.
      const parsedCreateAuditLogParams = CreateAuditLogSchema.parse({
        action: AUDIT_ACTIONS.SPECIMEN_REJECTED,
        reason: parsedUpdateSpecimenParams.additionalReason,
        actorId,
        entityId: updatedSpecimen.id,
        metadata: { previousStatus: specimen.status },
        entityType: AuditLogEntityType.SPECIMEN,
        laboratoryId,
      });

      await createAuditLog(tx, parsedCreateAuditLogParams);

      return updatedSpecimen;
    }

    return await updateSpecimen(tx, parsedUpdateSpecimenParams);
  });

  return { data: serializeSpecimen(specimen) };
}

export async function collectSpecimenAction(
  params: z.infer<typeof CollectSpecimenActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "SPECIMEN:UPDATE")) {
    throw new UnauthorizedError(
      "You don't have permission to collect this specimen.",
    );
  }

  const { id: actorId, laboratoryId } = user;

  const specimen = await prisma.$transaction(async (tx) => {
    // Load the order first and make sure it's editable before collecting.
    const parsedGetLabOrderParams = GetLabOrderSchema.parse({
      laboratoryId,
      id: params.labOrderId,
    });

    const labOrder = await getLabOrder(tx, parsedGetLabOrderParams);

    if (!labOrder) {
      throw new Error("Order is not found");
    }

    ensureLabOrderIsEditable(labOrder);

    const parsedGetSpecimenParams = GetSpecimenSchema.parse({
      id: params.id,
      laboratoryId,
    });

    const existingSpecimen = await getSpecimen(tx, parsedGetSpecimenParams);

    if (!existingSpecimen) {
      throw new Error("Specimen is not found");
    }

    ensureSpecimenIsEditable(existingSpecimen);
    ensureSpecimenCanBeCollected(existingSpecimen);

    const parsedCollectSpecimenParams = CollectSpecimenSchema.parse({
      ...params,
      laboratoryId,
    });

    // The specimen must belong to the order supplied by the caller.
    if (existingSpecimen.labOrderId !== parsedGetLabOrderParams.id) {
      throw new Error("Specimen is not part of this order");
    }

    // A specimen cannot be collected after it was received.
    if (
      existingSpecimen.receivedAt &&
      parsedCollectSpecimenParams.collectedAt > existingSpecimen.receivedAt
    ) {
      throw new Error(
        "Collection time cannot be after the specimen is received",
      );
    }

    // The collector must be an active user of the same laboratory.
    const collector = await getSpecimenPersonnelCandidate(
      tx,
      GetUserSchema.parse({
        id: parsedCollectSpecimenParams.collectedById,
        laboratoryId,
      }),
    );

    if (!collector) {
      throw new Error("Collector is not found");
    }

    const updatedSpecimen = await collectSpecimen(tx, {
      ...parsedCollectSpecimenParams,
      status: resolveCollectedStatus(existingSpecimen.status),
    });

    // Create a new audit log entry for the collection action.
    const parsedCreateAuditLogParams = CreateAuditLogSchema.parse({
      action: AUDIT_ACTIONS.SPECIMEN_COLLECTED,
      actorId,
      entityId: updatedSpecimen.id,
      metadata: {
        previousStatus: existingSpecimen.status,
        status: updatedSpecimen.status,
        previousCollectedAt:
          existingSpecimen.collectedAt?.toISOString() ?? null,
        collectedAt: updatedSpecimen.collectedAt?.toISOString() ?? null,
        collectedById: updatedSpecimen.collectedById,
        collectedByName: collector.name ?? collector.username,
      },
      entityType: AuditLogEntityType.SPECIMEN,
      laboratoryId,
    });

    await createAuditLog(tx, parsedCreateAuditLogParams);

    return updatedSpecimen;
  });

  return { data: serializeSpecimen(specimen) };
}

export async function receiveSpecimenAction(
  params: z.infer<typeof SpecimenReceiptActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "SPECIMEN:UPDATE")) {
    throw new UnauthorizedError(
      "You don't have permission to receive this specimen.",
    );
  }

  const { id: actorId, laboratoryId } = user;

  const specimen = await prisma.$transaction(async (tx) => {
    // Load the order first and make sure it's editable before receiving.
    const parsedGetLabOrderParams = GetLabOrderSchema.parse({
      laboratoryId,
      id: params.labOrderId,
    });

    const labOrder = await getLabOrder(tx, parsedGetLabOrderParams);

    if (!labOrder) {
      throw new Error("Order is not found");
    }

    ensureLabOrderIsEditable(labOrder);

    const parsedGetSpecimenParams = GetSpecimenSchema.parse({
      id: params.id,
      laboratoryId,
    });

    const existingSpecimen = await getSpecimen(tx, parsedGetSpecimenParams);

    if (!existingSpecimen) {
      throw new Error("Specimen is not found");
    }

    ensureSpecimenIsEditable(existingSpecimen);
    ensureSpecimenCanBeReceived(existingSpecimen);

    const parsedSpecimenReceiptParams = SpecimenReceiptSchema.parse({
      ...params,
      laboratoryId,
    });

    // The specimen must belong to the order supplied by the caller.
    if (existingSpecimen.labOrderId !== parsedGetLabOrderParams.id) {
      throw new Error("Specimen is not part of this order");
    }

    // A specimen cannot be received before it was collected.
    if (
      existingSpecimen.collectedAt &&
      parsedSpecimenReceiptParams.receivedAt < existingSpecimen.collectedAt
    ) {
      throw new Error(
        "Received time cannot be before the specimen is collected",
      );
    }

    // The receiver must be an active user of the same laboratory.
    const receiver = await getSpecimenPersonnelCandidate(
      tx,
      GetUserSchema.parse({
        id: parsedSpecimenReceiptParams.receivedById,
        laboratoryId,
      }),
    );

    if (!receiver) {
      throw new Error("Receiver is not found");
    }

    const updatedSpecimen = await receiveSpecimen(tx, {
      ...parsedSpecimenReceiptParams,
      // A collected specimen becomes received, while a received specimen keeps
      // its status so correcting the receipt record never moves it backwards.
      status: resolveReceivedStatus(existingSpecimen.status),
    });

    // Create a new audit log entry for the receipt action.
    const parsedCreateAuditLogParams = CreateAuditLogSchema.parse({
      action: AUDIT_ACTIONS.SPECIMEN_RECEIVED,
      actorId,
      entityId: updatedSpecimen.id,
      metadata: {
        previousStatus: existingSpecimen.status,
        status: updatedSpecimen.status,
        previousReceivedAt: existingSpecimen.receivedAt?.toISOString() ?? null,
        receivedAt: updatedSpecimen.receivedAt?.toISOString() ?? null,
        previousReceivedById: existingSpecimen.receivedById,
        receivedById: updatedSpecimen.receivedById,
        receivedByName: receiver.name ?? receiver.username,
        previousNote: existingSpecimen.note,
        note: updatedSpecimen.note,
      },
      entityType: AuditLogEntityType.SPECIMEN,
      laboratoryId,
    });

    await createAuditLog(tx, parsedCreateAuditLogParams);

    return updatedSpecimen;
  });

  return { data: serializeSpecimen(specimen) };
}

export async function getSpecimenPersonnelCandidatesAction() {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "SPECIMEN:UPDATE")) {
    throw new UnauthorizedError(
      "You don't have permission to view specimen personnel.",
    );
  }

  const { laboratoryId } = user;

  const parsedGetSpecimenPersonnelCandidatesParams =
    GetSpecimenPersonnelCandidatesSchema.parse({ laboratoryId });

  const candidates = await getSpecimenPersonnelCandidates(
    prisma,
    parsedGetSpecimenPersonnelCandidatesParams,
  );

  return { data: candidates };
}
