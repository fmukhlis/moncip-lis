import { z } from "zod";
import { requiredCuid2 } from "@/lib/custom-zod-types";
import { PaginationSchema } from "@/lib/pagination";
import { LabOrderItemStatus, LabOrderPriority } from "@/generated/prisma";

export const CreateLabOrderItemSchema = z.object({
  note: z.string().trim().min(1).optional(),
  status: z.enum(LabOrderItemStatus).optional(),
  priority: z.enum(LabOrderPriority).optional(),
  sortOrder: z.coerce.number().min(0),
  performableId: requiredCuid2("Performable"),
  externalOrderItemId: z.string().trim().min(1),
  externalLabOrderableId: requiredCuid2("External Lab Orderable"),
});

export const ResolveLabOrderItemSchema = z.object({
  connectionId: requiredCuid2("Connection"),
  labOrderItems: z
    .array(z.looseObject({ externalOrderableId: z.string().trim().min(1) }))
    .min(1),
});

export const GetLabOrderItemsActionSchema = z.object({
  search: z.string().trim().optional(),
  status: z.array(z.enum(LabOrderItemStatus)).optional(),
  priority: z.array(z.enum(LabOrderPriority)).optional(),
  ...PaginationSchema.shape,
});

export const GetLabOrderItemsSchema = GetLabOrderItemsActionSchema.extend({
  laboratoryId: requiredCuid2("Laboratory"),
});
