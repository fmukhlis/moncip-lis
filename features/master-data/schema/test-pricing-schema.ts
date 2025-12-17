import z from "zod";

// ----------------- Data Access Layer -----------------

export const GetLocalTestsWithPricesSchema = z.object({
  laboratoryId: z.string().trim().min(1),
  count: z.number().positive().optional(),
});

export const GetLocalTestGroupsWithPricesSchema = z.object({
  laboratoryId: z.string().trim().min(1),
  count: z.number().positive().optional(),
});

export const SaveLocalTestPricesSchema = z.object({
  prices: z
    .array(
      z.object({
        price: z.coerce.number().nonnegative(),
        tariffGroupId: z.string().trim().min(1),
      }),
    )
    .superRefine((val, ctx) => {
      const seen = new Set<string>();

      for (let i = 0; i < val.length; i++) {
        if (seen.has(val[i].tariffGroupId)) {
          ctx.addIssue({
            code: "custom",
            message: `Duplicate tariff group.`,
            path: [i, "tariffGroupId"],
          });
        }
        seen.add(val[i].tariffGroupId);
      }
    }),
  laboratoriesOnLabTestsId: z.string().trim().min(1),
});

export const CreateLocalTestGroupSchema = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
  description: z.string().optional(),
  laboratoryId: z.string().trim().min(1),
  laboratoriesOnLabTestsIds: z.array(z.string().trim().min(1)).min(1),
});

export const ArchiveLocalTestGroupSchema = z.object({
  labTestGroupId: z.string().trim().min(1),
});

export const UnarchiveLocalTestGroupSchema = z.object({
  labTestGroupId: z.string().trim().min(1),
});

export const SaveLocalTestGroupPricesSchema = z.object({
  prices: z
    .array(
      z.object({
        price: z.coerce.number().nonnegative(),
        tariffGroupId: z.string().trim().min(1),
      }),
    )
    .superRefine((val, ctx) => {
      const seen = new Set<string>();

      for (let i = 0; i < val.length; i++) {
        if (seen.has(val[i].tariffGroupId)) {
          ctx.addIssue({
            code: "custom",
            message: `Duplicate tariff group.`,
            path: [i, "tariffGroupId"],
          });
        }
        seen.add(val[i].tariffGroupId);
      }
    }),
  labTestGroupId: z.string().trim().min(1),
});

// ------------------ Server Function ------------------

export const GetLocalTestsWithPricesActionSchema =
  GetLocalTestsWithPricesSchema.omit({
    laboratoryId: true,
  });

export const GetLocalTestGroupsWithPricesActionSchema =
  GetLocalTestGroupsWithPricesSchema.omit({
    laboratoryId: true,
  });

export const SaveLocalTestPricesActionSchema = SaveLocalTestPricesSchema;

export const CreateLocalTestGroupActionSchema = CreateLocalTestGroupSchema.omit(
  {
    laboratoryId: true,
  },
);

export const UpdateLocalTestGroupActionSchema = CreateLocalTestGroupSchema.omit(
  { laboratoryId: true },
).extend({ labTestGroupId: z.string().trim().min(1) });

export const ArchiveLocalTestGroupActionSchema = ArchiveLocalTestGroupSchema;

export const UnarchiveLocalTestGroupActionSchema =
  UnarchiveLocalTestGroupSchema;

export const SaveLocalTestGroupPricesActionSchema =
  SaveLocalTestGroupPricesSchema;

// ---------------------- Helper -----------------------

export const GetLocalTestGroupsByIdSchema = z.object({
  id: z.string().trim().min(1),
});

export const GetLocalTestGroupsByCodeSchema = z.object({
  code: z.string().trim().min(1),
});
