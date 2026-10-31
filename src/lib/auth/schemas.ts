import { z } from "zod";

export const LoginInputSchema = z.object({
  email: z.string().email("Invalid email address").min(5).max(100),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export const DemoLoginInputSchema = z.object({
  role: z.enum(["planner", "couple", "host", "admin"]),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;
export type DemoLoginInput = z.infer<typeof DemoLoginInputSchema>;
