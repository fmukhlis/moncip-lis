import { z } from "zod";
import { requiredCuid2 } from "@/lib/custom-zod-types";
import { PaginationSchema } from "@/lib/pagination";
import { RawOrderSnapshotSchema } from "../inbound-integration-event/inbound-integration-event.schema";
import { CreateLabOrderItemSchema } from "../lab-order-item/lab-order-item.schema";

export const ReserveLabOrderNoSchema = z.object({
  date: z.coerce.date(),
});

export const CreateLabOrderSchema = RawOrderSnapshotSchema.omit({
  id: true,
  no: true,
  status: true,
}).extend({
  no: z.string().trim().min(1),
  items: z
    .array(
      z.object({
        ...CreateLabOrderItemSchema.omit({ status: true }).shape,
      }),
    )
    .min(1)
    .refine((items) => {
      const orders = items.map((item) => item.sortOrder);
      return new Set(orders).size === orders.length;
    }),
  period: z.string().trim().min(1),
  sequence: z.int().positive(),
  patientId: requiredCuid2("Patient"),
  externalId: z.string().trim().min(1),
  externalNo: z.string().trim().min(1),
  laboratoryId: requiredCuid2("Laboratory"),
  externalPatientId: z.string().trim().min(1),
  externalEncounterId: z.string().trim().min(1),
  externalOrderingProviderId: z.string().trim().min(1),
});

export const GetLabOrdersActionSchema = z
  .object({
    ...PaginationSchema.shape,
    status: RawOrderSnapshotSchema.shape.status.optional(),
    priority: RawOrderSnapshotSchema.shape.priority.optional(),
    patientId: z.string().trim().min(1).optional(),
    externalPatientId: z.string().trim().min(1).optional(),
  })
  .refine(
    (data) => (data.status === undefined) === (data.priority === undefined),
  );

export const GetLabOrdersSchema = GetLabOrdersActionSchema.safeExtend({
  laboratoryId: requiredCuid2("Laboratory"),
});

export const GetLabOrderActionSchema = z
  .object({
    id: requiredCuid2("Lab Order").optional(),
    no: z.string().trim().min(1).optional(),
    externalId: z.string().trim().min(1).optional(),
    externalNo: z.string().trim().min(1).optional(),
    sourceSystem: z.string().trim().min(1).optional(),
  })
  .refine((data) => {
    if (data.id !== undefined || data.no !== undefined) {
      return true;
    }

    return (
      data.sourceSystem !== undefined &&
      (data.externalId !== undefined || data.externalNo !== undefined)
    );
  });

export const GetLabOrderSchema = GetLabOrderActionSchema.safeExtend({
  laboratoryId: requiredCuid2("Laboratory"),
});

export const EnsureLabOrderItemsHaveNoSpecimenActionSchema = z.object({
  id: requiredCuid2("Lab Order"),
  orderItemIds: z.array(requiredCuid2("Order Item")).min(1),
});

export const EnsureLabOrderItemsHaveNoSpecimenSchema =
  EnsureLabOrderItemsHaveNoSpecimenActionSchema.safeExtend({
    laboratoryId: requiredCuid2("Laboratory"),
  });

export const UpdateLabOrderSchema = RawOrderSnapshotSchema.omit({
  id: true,
  no: true,
}).extend({
  items: z
    .array(
      z.object({
        ...CreateLabOrderItemSchema.omit({ status: true }).shape,
      }),
    )
    .min(1)
    .refine((items) => {
      const orders = items.map((item) => item.sortOrder);
      return new Set(orders).size === orders.length;
    }),
  patientId: requiredCuid2("Patient"),
  externalId: z.string().trim().min(1),
  externalNo: z.string().trim().min(1),
  laboratoryId: requiredCuid2("Laboratory"),
  externalPatientId: z.string().trim().min(1),
  externalEncounterId: z.string().trim().min(1),
  externalOrderingProviderId: z.string().trim().min(1),
});
