import z from "zod";

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
});
