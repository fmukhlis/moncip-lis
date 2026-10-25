import { z } from "zod";
import { PatientSex } from "@/generated/prisma";
import { requiredCuid2 } from "@/lib/custom-zod-types";

export const PatientSnapshotSchema = z.object({
  id: z.string().trim().min(1),
  sex: z.enum(PatientSex),
  mrn: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(1).max(20).regex(/^\d+$/).optional(),
  address: z.string().trim().min(1).max(500).optional(),
  dateOfBirth: z.coerce.date(),
});

export const UpsertPatientSchema = z.object({
  laboratoryId: requiredCuid2("Laboratory"),
  lastSnapshot: PatientSnapshotSchema,
  sourceSystem: z.string().trim().min(1).max(100),
  externalPatientId: z.string().trim().min(1).max(100),
});
