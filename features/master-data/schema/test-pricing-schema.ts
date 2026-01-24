import z from "zod";

// ----------------- Data Access Layer -----------------

// Local Test
export const GetLocalTestsSchema = z.object({
  laboratoryId: z.string().trim().min(1),
  count: z.number().positive().optional(),
});

export const GetLocalTestSchema = z.object({
  id: z.string().trim().min(1),
  priceCount: z.number().positive().optional(),
});

export const MarkLocalTestOrderableSchema = z.object({
  id: z.string().trim().min(1),
});

export const MarkLocalTestNotOrderableSchema = z.object({
  id: z.string().trim().min(1),
  reason: z.string().trim().min(1),
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
  id: z.string().trim().min(1),
});

// Local Test Group
export const GetLocalTestGroupsSchema = z.object({
  laboratoryId: z.string().trim().min(1),
  count: z.number().positive().optional(),
});

export const GetLocalTestGroupSchema = z.object({
  id: z.string().trim().min(1),
  priceCount: z.number().positive().optional(),
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

export const MarkLocalTestGroupOrderableSchema = z.object({
  id: z.string().trim().min(1),
});

export const MarkLocalTestGroupNotOrderableSchema = z.object({
  id: z.string().trim().min(1),
  reason: z.string().trim().min(1),
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

// Local Test
export const GetLocalTestsActionSchema = GetLocalTestsSchema.omit({
  laboratoryId: true,
}).optional();

export const GetLocalTestActionSchema = GetLocalTestSchema;

export const MarkLocalTestOrderableActionSchema = MarkLocalTestOrderableSchema;

export const MarkLocalTestNotOrderableActionSchema =
  MarkLocalTestNotOrderableSchema;

export const SaveLocalTestPricesActionSchema = SaveLocalTestPricesSchema;

// Local Test Group
export const GetLocalTestGroupsActionSchema = GetLocalTestGroupsSchema.omit({
  laboratoryId: true,
}).optional();

export const GetLocalTestGroupActionSchema = GetLocalTestGroupSchema;

export const CreateLocalTestGroupActionSchema = CreateLocalTestGroupSchema.omit(
  {
    laboratoryId: true,
  },
);

export const ArchiveLocalTestGroupActionSchema = ArchiveLocalTestGroupSchema;

export const UnarchiveLocalTestGroupActionSchema =
  UnarchiveLocalTestGroupSchema;

export const MarkLocalTestGroupOrderableActionSchema =
  MarkLocalTestGroupOrderableSchema;

export const MarkLocalTestGroupNotOrderableActionSchema =
  MarkLocalTestGroupNotOrderableSchema;

export const SaveLocalTestGroupPricesActionSchema =
  SaveLocalTestGroupPricesSchema;

// ---------------------- Helper -----------------------

export const GetLocalTestGroupsByCodeSchema = z.object({
  code: z.string().trim().min(1),
  count: z.number().positive().optional(),
});

// -------------------- Client Form --------------------

/* c8 ignore start */
export const ConfigureLocalTestPricingForm =
  SaveLocalTestPricesActionSchema.extend({
    basePrice: z.string().trim().min(1, "Base price cannot be empty."),
    prices: z
      .array(
        z.object({
          price: z.preprocess(
            (v) => (v ? Number(v) : null),
            z.number().nonnegative().nullable(),
          ),
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
  });

export const MarkLocalTestOrderableForm = MarkLocalTestOrderableActionSchema;

export const MarkLocalTestNotOrderableForm =
  MarkLocalTestNotOrderableActionSchema;

export const ConfigureLocalTestGroupPricingForm =
  SaveLocalTestGroupPricesActionSchema.extend({
    basePrice: z.string().trim().min(1, "Base price cannot be empty."),
    prices: z
      .array(
        z.object({
          price: z.preprocess(
            (v) => (v ? Number(v) : null),
            z.number().nonnegative().nullable(),
          ),
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
  });

export const MarkLocalTestGroupOrderableForm =
  MarkLocalTestGroupOrderableActionSchema;

export const MarkLocalTestGroupNotOrderableForm =
  MarkLocalTestGroupNotOrderableActionSchema;

export const ArchiveLocalTestGroupForm = ArchiveLocalTestGroupActionSchema;

export const UnarchiveLocalTestGroupForm = UnarchiveLocalTestGroupActionSchema;

/* c8 ignore stop */
