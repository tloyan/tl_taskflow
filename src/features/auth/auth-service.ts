import "server-only";

import { auth } from "@/lib/auth";
import { loginSchema, otpSchema } from "./auth-validation";
import { AuthValidationError, AuthError } from "./auth-errors";
import { headers } from "next/headers";

export async function sendOtp(data: unknown) {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new AuthValidationError(err.path[0] as string, err.message);
  }
  await auth.api.sendVerificationOTP({
    body: { email: parsed.data.email, type: "sign-in" },
  });
  return { email: parsed.data.email };
}

export async function verifyOtp(data: unknown) {
  const parsed = otpSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new AuthValidationError(err.path[0] as string, err.message);
  }
  await auth.api.signInEmailOTP({
    body: {
      email: parsed.data.email,
      otp: parsed.data.otp,
    },
  });
}

export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new AuthError();
  return session.user;
}
