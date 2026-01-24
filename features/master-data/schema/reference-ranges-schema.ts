import z from "zod";

const genderLabel = {
  B: "Both",
  M: "Male",
  F: "Female",
} as const;

// ----------------- Data Access Layer -----------------

export const GetLocalTestsWithReferenceRangesSchema = z.object({
  count: z.number().positive().optional(),
  laboratoryId: z.string().trim().min(1),
});

export const SaveLocalTestReferenceRangesSchema = z.object({
  refRanges: z
    .array(
      z.discriminatedUnion("kind", [
        z
          .object({
            kind: z.literal("numeric"),
            ageMax: z.coerce.number(),
            ageMaxUnit: z.enum(["M", "Y"]),
            ageMin: z.coerce.number(),
            ageMinUnit: z.enum(["M", "Y"]),
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
          ageMaxUnit: z.enum(["M", "Y"]),
          ageMin: z.coerce.number(),
          ageMinUnit: z.enum(["M", "Y"]),
          gender: z.enum(["M", "F", "B"]),
          normalValues: z.array(z.string().trim().min(1)).min(1),
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
  laboratoriesOnLabTestsId: z.string().trim().min(1),
});

// ------------------ Server Function ------------------

export const GetLocalTestsWithReferenceRangesActionSchema =
  GetLocalTestsWithReferenceRangesSchema.omit({ laboratoryId: true });

export const SaveLocalTestReferenceRangesActionSchema =
  SaveLocalTestReferenceRangesSchema;

// ---------------------- Helper -----------------------

export const GetSupportedUnitsForTestSchema = z.object({
  laboratoriesOnLabTestsId: z.string().trim().min(1),
});
