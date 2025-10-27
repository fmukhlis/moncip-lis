import z from "zod";

import { Prisma } from "@/generated/prisma";

export const CreateUserSchema = z.object({
  role: z.enum(["lab_tech", "doctor"]),
  name: z.string().max(50).nonempty(),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(
      /^[a-z0-9_]+$/,
      "Username must contain only lowercase letters, numbers and underscores.",
    ),
  password: z.string().min(8, "Password must be at least 8 characters."),
}) satisfies z.ZodType<Prisma.UserCreateInput>;

export const UpdateUserSchema = z.object({
  role: z.enum(["lab_tech", "doctor"]),
  name: z.union([
    z.string().max(50).nonempty().optional(),
    z.literal("").transform(() => undefined),
  ]),
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
}) satisfies z.ZodType<Prisma.UserUpdateInput>;
