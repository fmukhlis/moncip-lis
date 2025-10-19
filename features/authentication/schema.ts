import z from "zod";

export const SignInWithCredentialsSchema = z.object({
  email: z.email("Please provide a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});
