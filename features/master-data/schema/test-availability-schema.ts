import z from "zod";

// ----------------- Data Access Layer -----------------

export const GetTestCategoriesWithTestsSchema = z.object({
  count: z.number().positive().optional(),
});

export const GetLocalTestsSchema = z.object({
  count: z.number().positive().optional(),
  laboratoryId: z.string().trim().min(1),
});

export const SaveLocalTestsSchema = z.object({
  labTestIds: z
    .array(z.string().trim().min(1))
    .min(1, "No tests are selected."),
  laboratoryId: z.string().trim().min(1),
});

// ------------------ Server Function ------------------

export const GetTestCategoriesWithTestsActionSchema =
  GetTestCategoriesWithTestsSchema;

export const GetLocalTestsActionSchema = GetLocalTestsSchema.omit({
  laboratoryId: true,
});

export const SaveLocalTestsActionSchema = SaveLocalTestsSchema.omit({
  laboratoryId: true,
});

// ---------------------- Helper -----------------------

export const GetTestsSchema = z.object({
  count: z.number().positive().optional(),
});
