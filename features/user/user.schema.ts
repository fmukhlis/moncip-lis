import { z } from "zod";
import { requiredCuid2 } from "@/lib/custom-zod-types";
import { PaginationSchema } from "@/lib/pagination";

const roleSchema = z.enum(["STAFF", "DOCTOR", "LAB_ADMIN"]);
const nameSchema = z.string().trim().max(50).nonempty();
const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(20)
  .regex(
    /^[a-z0-9_]+$/,
    "Username must contain only lowercase letters, numbers and underscores.",
  );
const passwordSchema = z
  .string()
  .trim()
  .min(8, "Password must be at least 8 characters.");
const imageSchema = z
  .string()
  .trim()
  .refine((value) => value.endsWith(".jpg"))
  .optional();
const imageFileSchema = z
  .instanceof(File)
  .refine(
    (file) => file.type === "image/jpeg",
    "Only .jpg or .jpeg files are allowed",
  )
  .refine(
    (file) => file.size <= 1 * 1024 * 1024,
    "Image must be less than 1 MB",
  )
  .optional();

export const CreateUserActionSchema = z.object({
  role: roleSchema,
  name: nameSchema,
  image: imageSchema,
  username: usernameSchema,
  password: passwordSchema,
  imageFile: imageFileSchema,
  departmentId: requiredCuid2("Department").optional(),
});

export const CreateUserSchema = CreateUserActionSchema.extend({
  laboratoryId: requiredCuid2("Laboratory"),
});

export const GetUsersActionSchema = z.object({
  ...PaginationSchema.shape,
  role: roleSchema.optional(),
  search: z.string().trim().optional(),
  departmentId: requiredCuid2("Department").optional(),
});

export const GetUsersSchema = GetUsersActionSchema.extend({
  laboratoryId: requiredCuid2("Laboratory"),
});

export const GetUserActionSchema = z.object({
  id: requiredCuid2("User"),
});

export const GetUserSchema = GetUserActionSchema.extend({
  laboratoryId: requiredCuid2("Laboratory"),
});

export const UpdateUserActionSchema = CreateUserActionSchema.partial()
  .extend({
    id: requiredCuid2("User"),
    password: passwordSchema,
  })
  .refine(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ id, password, ...updates }) =>
      Object.values(updates).some((u) => u !== undefined),
    { error: "At least one field must be updated." },
  );

export const UpdateUserSchema = UpdateUserActionSchema.safeExtend({
  laboratoryId: requiredCuid2("Laboratory"),
});

export const DeleteUserActionSchema = z.object({
  id: requiredCuid2("User"),
});

export const DeleteUserSchema = DeleteUserActionSchema.extend({
  laboratoryId: requiredCuid2("Laboratory"),
});
