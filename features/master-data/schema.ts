import z from "zod";

export const SaveLocalTestsSchema = z.object({
  labTestCodes: z.string().array().min(1, "No tests are selected."),
});
