import z from "zod";

// Data Access Layer ---------------------------------------------------
export const GetLocalPatientsSchema = z.object({
  count: z.number().positive().optional(),
  laboratoryId: z.string().trim().min(1),
});

export const GetLocalPatientSchema = z.object({
  id: z.string().trim().min(1),
});

export const CreateLocalPatientSchema = z.object({
  name: z.string().trim().min(1),
  gender: z.enum(["M", "F"]),
  source: z.enum(["MANUAL", "HIS"]),
  dateOfBirth: z.preprocess((val) => {
    if (val instanceof Date || typeof val === "string") {
      return new Date(val);
    }
    return val;
  }, z.date()),
  externalSystemId: z.string().trim().min(1).optional(),
  linkedAt: z
    .preprocess((val) => {
      if (val instanceof Date || typeof val === "string") {
        return new Date(val);
      }
      return val;
    }, z.date())
    .optional(),
});

export const UpdateLocalPatientSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1).optional(),
  gender: z.enum(["M", "F"]).optional(),
  source: z.enum(["MANUAL", "HIS"]).optional(),
  dateOfBirth: z
    .preprocess((val) => {
      if (val instanceof Date || typeof val === "string") {
        return new Date(val);
      }
      return val;
    }, z.date())
    .optional(),
  externalSystemId: z.string().trim().min(1).optional(),
  linkedAt: z
    .preprocess((val) => {
      if (val instanceof Date || typeof val === "string") {
        return new Date(val);
      }
      return val;
    }, z.date())
    .optional(),
});

export const DeleteLocalPatientSchema = z.object({
  id: z.string().trim().min(1),
});

export const UndeleteLocalPatientSchema = z.object({
  id: z.string().trim().min(1),
});
// --------------------------------------------------- Data Access Layer

// Server Function -----------------------------------------------------
export const GetLocalPatientsActionSchema = GetLocalPatientsSchema.omit({
  laboratoryId: true,
});

export const GetLocalPatientActionSchema = GetLocalPatientSchema;

export const CreateLocalPatientManualActionSchema =
  CreateLocalPatientSchema.omit({
    source: true,
    linkedAt: true,
    externalSystemId: true,
  });

export const CreateLocalPatientHISActionSchema = CreateLocalPatientSchema.omit({
  name: true,
  gender: true,
  source: true,
  linkedAt: true,
  dateOfBirth: true,
}).extend({ externalSystemId: z.string().trim().min(1) });

export const UpdateLocalPatientManualActionSchema =
  UpdateLocalPatientSchema.omit({
    source: true,
    linkedAt: true,
    externalSystemId: true,
  });

export const LinkLocalTestPatientActionSchema = UpdateLocalPatientSchema.omit({
  name: true,
  gender: true,
  source: true,
  linkedAt: true,
  dateOfBirth: true,
}).extend({ externalSystemId: z.string().trim().min(1) });

export const RelinkLocalPatientActionSchema = UpdateLocalPatientSchema.omit({
  name: true,
  gender: true,
  source: true,
  linkedAt: true,
  dateOfBirth: true,
}).extend({ externalSystemId: z.string().trim().min(1) });

export const DeleteLocalPatientActionSchema = DeleteLocalPatientSchema;

export const UndeleteLocalPatientActionSchema = UndeleteLocalPatientSchema;
// -----------------------------------------------------  Server Function
