import z from "zod";

// Data Access Layer ---------------------------------------------------
export const GetLocalPatientsSchema = z.object({
  count: z.number().positive().optional(),
  laboratoryId: z.string().trim().min(1),
});

export const GetLocalPatientSchema = z.object({
  id: z.string().trim().min(1),
});

export const GetPatientFromHISSchema = z
  .object({
    count: z.number().positive().optional(),
    nameOrMrn: z.string().trim().min(1).optional(),
    patientId: z.string().trim().min(1).optional(),
  })
  .optional()
  .superRefine((val, ctx) => {
    const filled = [
      val?.nameOrMrn && "nameOrMrn",
      val?.patientId && "patientId",
    ].filter(Boolean);

    if (filled.length > 1) {
      ctx.addIssue({
        code: "custom",
        input: val,
        message: "Only one of id, name, or email may be provided.",
      });
    }
  });

export const CreateLocalPatientSchema = z.object({
  laboratoryId: z.string().trim().min(1),
  name: z.string().trim().min(1),
  gender: z.enum(["M", "F"]),
  source: z.enum(["MANUAL", "HIS"]),
  dateOfBirth: z.coerce.date(),
  externalSystemId: z.string().trim().min(1).optional(),
  linkedAt: z.coerce.date().optional(),
});

export const UpdateLocalPatientSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1).optional(),
  gender: z.enum(["M", "F"]).optional(),
  source: z.enum(["MANUAL", "HIS"]).optional(),
  dateOfBirth: z.coerce.date().optional(),
  externalSystemId: z.string().trim().min(1).optional(),
  linkedAt: z.coerce.date().optional(),
});

export const DeleteLocalPatientSchema = z.object({
  id: z.string().trim().min(1),
});
// --------------------------------------------------- Data Access Layer

// Server Function -----------------------------------------------------
export const GetLocalPatientsActionSchema = GetLocalPatientsSchema.omit({
  laboratoryId: true,
}).optional();

export const GetLocalPatientActionSchema = GetLocalPatientSchema;

export const GetPatientFromHISActionSchema = GetPatientFromHISSchema;

export const CreateLocalPatientManualActionSchema =
  CreateLocalPatientSchema.omit({
    source: true,
    linkedAt: true,
    laboratoryId: true,
    externalSystemId: true,
  });

export const CreateLocalPatientHISActionSchema = CreateLocalPatientSchema.omit({
  name: true,
  gender: true,
  source: true,
  linkedAt: true,
  dateOfBirth: true,
  laboratoryId: true,
}).extend({ externalSystemId: z.string().trim().min(1) });

export const UpdateLocalPatientManualActionSchema =
  UpdateLocalPatientSchema.omit({
    source: true,
    linkedAt: true,
    externalSystemId: true,
  });

export const SyncLocalPatientHISActionSchema = UpdateLocalPatientSchema.omit({
  name: true,
  gender: true,
  source: true,
  linkedAt: true,
  dateOfBirth: true,
  externalSystemId: true,
});

export const DeleteLocalPatientActionSchema = DeleteLocalPatientSchema;
// -----------------------------------------------------  Server Function

// Client Form ----------------------------------------------------------
export const CreateLocalPatientHISForm = CreateLocalPatientHISActionSchema;
export const CreateLocalPatientManualForm =
  CreateLocalPatientManualActionSchema;
export const UpdateLocalPatientManualForm =
  UpdateLocalPatientManualActionSchema.extend({
    name: z.string(),
    gender: z.enum(["M", "F"]),
    dateOfBirth: z.coerce.string(),
  });
// ---------------------------------------------------------  Client Form
