import { z } from "zod";
import { requiredCuid2 } from "@/lib/custom-zod-types";
import { PaginationSchema } from "@/lib/pagination";

const colorSchema = z
  .string()
  .trim()
  .length(7, "Color must be a valid hex color (e.g. #3B82F6)");

const descriptionSchema = z.preprocess(
  (v) => (v === "" ? null : v),
  z
    .string()
    .trim()
    .max(300, "Description must be at most 300 characters")
    .nullable(),
);

const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Display name is required")
  .max(100, "Display name must be at most 100 characters");

export const CreateDepartmentActionSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(50, "Code must be at most 50 characters"),
  color: colorSchema,
  isActive: z.boolean(),
  description: descriptionSchema,
  displayName: displayNameSchema,
});

export const CreateDepartmentSchema = CreateDepartmentActionSchema.extend({
  laboratoryId: requiredCuid2("Laboratory"),
});

export const GetDepartmentsActionSchema = z.object({
  ...PaginationSchema.shape,
  search: z.string().optional(),
  isActive: z
    .union([
      z.boolean(),
      z.enum(["true", "false"]).transform((v) => v === "true"),
    ])
    .optional(),
});

export const GetDepartmentsSchema = GetDepartmentsActionSchema.extend({
  laboratoryId: requiredCuid2("Laboratory"),
});

export const GetDepartmentActionSchema = z.object({
  id: requiredCuid2("Department"),
});

export const GetDepartmentSchema = GetDepartmentActionSchema.extend({
  laboratoryId: requiredCuid2("Laboratory"),
});

export const UpdateDepartmentActionSchema = z.object({
  id: requiredCuid2("Department"),
  color: colorSchema.optional(),
  isActive: z.boolean(),
  description: descriptionSchema,
  displayName: displayNameSchema.optional(),
});

export const UpdateDepartmentSchema = UpdateDepartmentActionSchema.extend({
  laboratoryId: requiredCuid2("Laboratory"),
});
