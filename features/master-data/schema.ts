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

const genderLabel = {
  B: "Both",
  M: "Male",
  F: "Female",
} as const;

export const SaveLocalTestReferenceRangesSchema = z.object({
  refRanges: z
    .array(
      z.discriminatedUnion("kind", [
        z
          .object({
            kind: z.literal("numeric"),
            ageMax: z.coerce.number(),
            ageMin: z.coerce.number(),
            gender: z.enum(["M", "F", "B"]),
            valueLow: z.coerce.number(),
            valueHigh: z.coerce.number(),
          })
          .superRefine((val, ctx) => {
            if (val.ageMax < val.ageMin) {
              ctx.addIssue({
                code: "custom",
                message: "Age max must be greater than age min",
                path: ["ageMax"],
              });
            }
            if (val.valueHigh < val.valueLow) {
              ctx.addIssue({
                code: "custom",
                message: "Value high must be greater than value low",
                path: ["valueHigh"],
              });
            }
          }),
        z.object({
          kind: z.literal("non-numeric"),
          ageMax: z.coerce.number(),
          ageMin: z.coerce.number(),
          gender: z.enum(["M", "F", "B"]),
          normalValues: z.array(z.string()).min(1),
        }),
      ]),
    )
    .min(1)
    .superRefine((val, ctx) => {
      const grouped = val.reduce(
        (prev, curr, i) => {
          (prev[curr.gender] ??= []).push({ ...curr, __i: i });
          return prev;
        },
        {} as Record<string, ((typeof val)[number] & { __i: number })[]>,
      );

      for (const gender of ["B", "M", "F"]) {
        const valByGender = grouped[gender];

        if (valByGender) {
          valByGender.sort((a, b) => a.ageMin - b.ageMin);

          for (let i = 1; i < valByGender.length; i++) {
            const prev = valByGender[i - 1];
            const curr = valByGender[i];

            if (curr.ageMin <= prev.ageMax) {
              ctx.addIssue({
                code: "custom",
                message: `Age ranges for "${genderLabel[gender as "B" | "M" | "F"]}" overlap.`,
                path: [curr.__i, "ageMin"],
              });
            }
          }
        }
      }
    }),
  defaultUnitId: z.string().optional(),
  laboratoriesOnLabTestsId: z.string(),
});

export const SaveLocalTestReferenceRangesActionSchema =
  SaveLocalTestReferenceRangesSchema;

export const GetSupportedUnitsForTest = z.object({
  laboratoriesOnLabTestsId: z.string(),
});
