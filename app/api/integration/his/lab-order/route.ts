import prisma from "@/lib/prisma";
import APIError from "@/lib/custom-errors/api-error";
import getBearerToken from "@/lib/get-bearer-token";
import { NextResponse } from "next/server";
import { upsertPatient } from "@/features/patient/patient.service";
import { resolveLabOrderItem } from "@/features/lab-order-item/lab-order-item.service";
import { UpsertPatientSchema } from "@/features/patient/patient.schema";
import { verifyIntegrationToken } from "@/features/integration-token/integration-token.service";
import { ResolveLabOrderItemSchema } from "@/features/lab-order-item/lab-order-item.schema";
import { InboundIntegrationEventStatus } from "@/generated/prisma";
import {
  createLabOrder,
  getLabOrder,
  reserveLabOrderNo,
  updateLabOrder,
} from "@/features/lab-order/lab-order.service";
import {
  CreateInboundIntegrationEventSchema,
  UpdateInboundIntegrationEventSchema,
  ValidateInboundIntegrationEventIdentifiersSchema,
} from "@/features/inbound-integration-event/inbound-integration-event.schema";
import {
  getInboundIntegrationEvent,
  createInboundIntegrationEvent,
  updateInboundIntegrationEvent,
  validateInboundIntegrationEventIdentifiers,
} from "@/features/inbound-integration-event/inbound-integration-event.service";
import {
  CreateLabOrderSchema,
  GetLabOrderSchema,
  UpdateLabOrderSchema,
} from "@/features/lab-order/lab-order.schema";
import { LabOrderUncancellableError } from "@/features/lab-order/lab-order.error";

export async function POST(request: Request) {
  const bearerToken = getBearerToken(request);

  if (!bearerToken) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Missing integration token.",
        },
      },
      { status: 401, headers: { "Cache-Control": "no-cache" } },
    );
  }

  const token = await verifyIntegrationToken(prisma, {
    plaintext: bearerToken,
  });

  if (!token) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid integration token.",
        },
      },
      { status: 401, headers: { "Cache-Control": "no-cache" } },
    );
  }

  let receivedInboundIntegrationEvent: Awaited<
    ReturnType<typeof getInboundIntegrationEvent>
  > | null = null;

  try {
    const body = await request.json();

    const parsedValidateInboundIntegrationEventIdentifiersParams =
      ValidateInboundIntegrationEventIdentifiersSchema.parse({
        messageId: body.messageId,
        laboratoryId: token.laboratoryId,
        connectionId: token.connection.id,
        idempotencyKey: body.idempotencyKey,
      });

    const existingInboundIntegrationEvent =
      await validateInboundIntegrationEventIdentifiers(
        prisma,
        parsedValidateInboundIntegrationEventIdentifiersParams,
      );

    if (existingInboundIntegrationEvent) {
      return NextResponse.json(
        {
          success: true,
          messageId:
            parsedValidateInboundIntegrationEventIdentifiersParams.messageId,
          idempotencyKey:
            parsedValidateInboundIntegrationEventIdentifiersParams.idempotencyKey,
          data: {
            labOrderId: existingInboundIntegrationEvent.labOrder?.id,
            labOrderNo: existingInboundIntegrationEvent.labOrder?.no,
          },
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const parsedCreateInboundIntegrationEventParams =
      CreateInboundIntegrationEventSchema.parse({
        tokenId: token.id,
        connectionId: token.connection.id,
        laboratoryId: token.laboratoryId,
        requestPayload: body,
      });

    receivedInboundIntegrationEvent = await createInboundIntegrationEvent(
      prisma,
      parsedCreateInboundIntegrationEventParams,
    );

    const res = await prisma.$transaction(async (tx) => {
      const parsedUpsertPatientParams = UpsertPatientSchema.parse({
        laboratoryId: token.laboratoryId,
        lastSnapshot: body.patient,
        sourceSystem: token.connection.sourceSystem,
        externalPatientId: body.patient.id,
      });

      const patient = await upsertPatient(tx, parsedUpsertPatientParams);

      const parsedResolveLabOrderItemParams = ResolveLabOrderItemSchema.parse({
        connectionId: token.connection.id,
        labOrderItems: body.items.map(
          (item: {
            id: unknown;
            note: unknown;
            status: unknown;
            priority: unknown;
            sortOrder: unknown;
            orderableId: unknown;
          }) => ({
            note: item.note,
            status: item.status,
            priority: item.priority,
            sortOrder: item.sortOrder,
            externalOrderableId: item.orderableId,
            externalOrderItemId: item.id,
          }),
        ),
      });

      const itemsData = await resolveLabOrderItem(
        tx,
        parsedResolveLabOrderItemParams,
      );

      const { no, period, sequence } = await reserveLabOrderNo(tx, {
        date: new Date(),
      });

      const parsedGetLabOrderParams = GetLabOrderSchema.parse({
        externalId: body.order.id,
        sourceSystem: body.order.sourceSystem,
        laboratoryId: token.laboratoryId,
      });

      const existingLabOrder = await getLabOrder(tx, parsedGetLabOrderParams);

      if (existingLabOrder) {
        if (existingLabOrder.status === "ORDERED") {
          const parsedUpdateLabOrderParams = UpdateLabOrderSchema.parse({
            ...body.order,
            items: itemsData,
            patientId: patient.id,
            externalId: body.order.id,
            externalNo: body.order.no,
            laboratoryId: token.laboratoryId,
            externalPatientId: body.patient.id,
            externalEncounterId: body.encounter.id,
            externalOrderingProviderId: body.orderingProvider.id,
          });

          const labOrder = await updateLabOrder(tx, parsedUpdateLabOrderParams);

          return {
            labOrder: {
              ...labOrder,
              patient: {
                ...labOrder.patient,
                dateOfBirth: labOrder.patient?.dateOfBirth.toISOString(),
              },
              orderedAt: labOrder.orderedAt.toISOString(),
              createdAt: labOrder.createdAt.toISOString(),
              updatedAt: labOrder.updatedAt.toISOString(),
              receivedAt: labOrder.receivedAt.toISOString(),
            },
          };
        }

        if (
          body.order.status === "CANCELLED" &&
          existingLabOrder.status === "CANCELLED"
        ) {
          return {
            labOrder: {
              ...existingLabOrder,
              patient: {
                ...existingLabOrder.patient,
                dateOfBirth:
                  existingLabOrder.patient?.dateOfBirth.toISOString(),
              },
              orderedAt: existingLabOrder.orderedAt.toISOString(),
              createdAt: existingLabOrder.createdAt.toISOString(),
              updatedAt: existingLabOrder.updatedAt.toISOString(),
              receivedAt: existingLabOrder.receivedAt.toISOString(),
            },
          };
        }

        throw new LabOrderUncancellableError(existingLabOrder.externalId);
      }

      const parsedCreateLabOrderParams = CreateLabOrderSchema.parse({
        ...body.order,
        no,
        items: itemsData,
        period,
        sequence,
        patientId: patient.id,
        externalId: body.order.id,
        externalNo: body.order.no,
        laboratoryId: token.laboratoryId,
        externalPatientId: body.patient.id,
        externalEncounterId: body.encounter.id,
        externalOrderingProviderId: body.orderingProvider.id,
      });

      const labOrder = await createLabOrder(tx, parsedCreateLabOrderParams);

      return {
        labOrder: {
          ...labOrder,
          patient: {
            ...labOrder.patient,
            dateOfBirth: labOrder.patient?.dateOfBirth.toISOString(),
          },
          orderedAt: labOrder.orderedAt.toISOString(),
          createdAt: labOrder.createdAt.toISOString(),
          updatedAt: labOrder.updatedAt.toISOString(),
          receivedAt: labOrder.receivedAt.toISOString(),
        },
      };
    });

    const responsePayload = {
      success: true,
      messageId: receivedInboundIntegrationEvent.messageId,
      idempotencyKey: receivedInboundIntegrationEvent.idempotencyKey,
      data: {
        labOrderId: res.labOrder.id,
        labOrderNo: res.labOrder.no,
      },
    };

    const parsedUpdateInboundIntegrationEventParams =
      UpdateInboundIntegrationEventSchema.parse({
        id: receivedInboundIntegrationEvent.id,
        status: InboundIntegrationEventStatus.PROCESSED,
        labOrderId: res.labOrder.id,
        proccessedAt: new Date(),
        responsePayload,
      });

    await updateInboundIntegrationEvent(
      prisma,
      parsedUpdateInboundIntegrationEventParams,
    );

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    let status = 500;
    let responsePayload = {
      error: {
        code: "UNKNOWN_ERROR",
        message: "Unknown error",
      },
    };

    if (error instanceof Error) {
      responsePayload = {
        error: {
          code: "UNKNOWN_ERROR",
          message: error.message,
        },
      };
    }

    if (error instanceof APIError) {
      status = error.statusCode;
      responsePayload = {
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }

    const { success, data: parsedUpdateInboundIntegrationEventParams } =
      UpdateInboundIntegrationEventSchema.safeParse({
        id: receivedInboundIntegrationEvent?.id,
        status: InboundIntegrationEventStatus.FAILED,
        responsePayload,
      });

    if (success) {
      await updateInboundIntegrationEvent(
        prisma,
        parsedUpdateInboundIntegrationEventParams,
      );
    }

    return NextResponse.json(responsePayload, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
