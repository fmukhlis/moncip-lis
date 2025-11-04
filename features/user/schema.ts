import z from "zod";

import { Prisma } from "@/generated/prisma";

export const CreateUserSchema = z.object({
  role: z.enum(["lab_tech", "doctor"]),
  name: z.string().max(50).nonempty(),
  image: z
    .string()
    .refine((value) => value.endsWith(".jpg"))
    .optional(),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(
      /^[a-z0-9_]+$/,
      "Username must contain only lowercase letters, numbers and underscores.",
    ),
  password: z.string().min(8, "Password must be at least 8 characters."),
  imageFile: z
    .instanceof(File)
    .refine(
      (file) => file.type === "image/jpeg",
      "Only .jpg or .jpeg files are allowed",
    )
    .refine(
      (file) => file.size <= 1 * 1024 * 1024,
      "Image must be less than 1 MB",
    )
    .optional(),
}) satisfies z.ZodType<Prisma.UserCreateInput>;

export const UpdateUserSchema = z.object({
  role: z.enum(["lab_tech", "doctor"]),
  name: z.union([
    z.string().max(50).nonempty().optional(),
    z.literal("").transform(() => undefined),
  ]),
  image: z
    .string()
    .refine((value) => value.endsWith(".jpg"))
    .optional(),
  username: z.union([
    z
      .string()
      .min(3)
      .max(20)
      .regex(
        /^[a-z0-9_]+$/,
        "Username must contain only lowercase letters, numbers and underscores.",
      )
      .optional(),
    z.literal("").transform(() => undefined),
  ]),
  password: z.union([
    z.string().min(8, "Password must be at least 8 characters.").optional(),
    z.literal("").transform(() => undefined),
  ]),
  imageFile: z
    .instanceof(File)
    .refine(
      (file) => file.type === "image/jpeg",
      "Only .jpg or .jpeg files are allowed",
    )
    .refine(
      (file) => file.size <= 1 * 1024 * 1024,
      "Image must be less than 1 MB",
    )
    .optional(),
}) satisfies z.ZodType<Prisma.UserUpdateInput>;
