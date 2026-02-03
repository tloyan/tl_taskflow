"use server";

import { redirect } from "next/navigation";
import { sendOtp, verifyOtp } from "./auth-service";
import { ActionState } from "./auth-types";
import { AuthValidationError } from "./auth-errors";

function sanitizeCallbackUrl(url: string | null): string {
  if (!url) return "/";
  if (url.startsWith("/") && !url.startsWith("//") && !url.includes("\\")) {
    return url;
  }
  return "/";
}

export async function sendOtpAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let email = "";
  try {
    const data = await sendOtp({
      email: formData.get("email"),
    });
    email = data.email;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if (error instanceof AuthValidationError) {
        return {
          error: {
            code: "VALIDATION_ERROR",
            field: error.field,
            message: error.message,
          },
        };
      }
    }
    return {
      error: { code: "UNKNOWN_ERROR", message: "Une erreur est survenue" },
    };
  }
  const callbackUrl = sanitizeCallbackUrl(
    formData.get("callbackUrl") as string | null
  );
  const params = new URLSearchParams({ email });
  if (callbackUrl !== "/") {
    params.set("callbackUrl", callbackUrl);
  }
  // could not be in try catch
  redirect(`/verify-otp?${params.toString()}`);
}

export async function resendOtpAction(email: unknown): Promise<ActionState> {
  try {
    await sendOtp({ email });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if (error instanceof AuthValidationError) {
        return {
          error: {
            code: "VALIDATION_ERROR",
            field: error.field,
            message: error.message,
          },
        };
      }
    }
    return {
      error: { code: "UNKNOWN_ERROR", message: "Une erreur est survenue" },
    };
  }
  return {};
}

export async function verifyOtpAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await verifyOtp({
      email: formData.get("email"),
      otp: formData.get("otp"),
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if (error instanceof AuthValidationError) {
        return {
          error: {
            code: "VALIDATION_ERROR",
            field: error.field,
            message: error.message,
          },
        };
      }
      if (error.message.includes("Invalid")) {
        return {
          error: { code: "INVALID_OTP", message: "Code incorrect" },
        };
      }
      if (error.message.includes("expired")) {
        return {
          error: {
            code: "EXPIRED_OTP",
            message: "Code expiré, redemandez-en un",
          },
        };
      }
    }
    return {
      error: { code: "UNKNOWN_ERROR", message: "Une erreur est survenue" },
    };
  }
  const callbackUrl = sanitizeCallbackUrl(
    formData.get("callbackUrl") as string | null
  );
  redirect(callbackUrl);
}
