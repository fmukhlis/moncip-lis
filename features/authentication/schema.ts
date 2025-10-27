import z from "zod";

export const SignInWithCredentialsSchema = z.object({
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
