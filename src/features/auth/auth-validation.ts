import z from "zod";

export const loginSchema = z.object({
  email: z.email(),
});

export const otpSchema = z.object({
  email: z.email(),
  otp: z.string().regex(/^\d+$/).min(6).max(6),
});
