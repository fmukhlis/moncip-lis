import z from "zod";

export const GetTestCategoriesWithTests = z.object({
  count: z.number().optional(),
});

export const GetTestsSchema = z.object({
  count: z.number().optional(),
});

export const GetLocalTestsSchema = z.object({
  count: z.number().optional(),
  laboratoryId: z.string(),
});

export const SaveLocalTestsSchema = z.object({
  labTestIds: z.array(z.string()).min(1, "No tests are selected."),
  laboratoryId: z.string(),
});

export const SaveLocalTestsActionSchema = SaveLocalTestsSchema.omit({
  laboratoryId: true,
});

export const GetLocalTestsWithReferenceRangesSchema = z.object({
  count: z.number().optional(),
  laboratoryId: z.string(),
});

export const SaveLocalTestReferenceRangesSchema = z.object({
  refRanges: z
    .array(
      z.discriminatedUnion("kind", [
        z
          .object({
            kind: z.literal("numeric"),
            ageMax: z.number(),
            ageMin: z.number(),
            gender: z.enum(["M", "F", "B"]),
            unitId: z.string(),
            valueLow: z
              .string()
              .regex(/^-?\d+(\.\d+)?$/, "Value low is invalid."),
            valueHigh: z
              .string()
              .regex(/^-?\d+(\.\d+)?$/, "Value low is invalid."),
          })
          .superRefine((val, ctx) => {
            if (val.ageMax < val.ageMin) {
              ctx.addIssue({
                code: "custom",
                message: "Age max must be greater than age min",
                path: ["ageMax"],
              });
            }
            if (Number(val.valueHigh) < Number(val.valueLow)) {
              ctx.addIssue({
                code: "custom",
                message: "Value high must be greater than value low",
                path: ["valueHigh"],
              });
            }
          }),
        z.object({
          kind: z.literal("non-numeric"),
          ageMax: z.number(),
          ageMin: z.number(),
          gender: z.enum(["M", "F", "B"]),
          normalValues: z.array(z.string()).min(1),
        }),
      ]),
    )
    .min(1),
  defaultUnitId: z.string().optional(),
  laboratoriesOnLabTestsId: z.string(),
});

export const SaveLocalTestReferenceRangesActionSchema =
  SaveLocalTestReferenceRangesSchema;

export const GetSupportedUnitsForTest = z.object({
  laboratoriesOnLabTestsId: z.string(),
});
