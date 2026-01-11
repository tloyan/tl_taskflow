export type ActionState = {
  error?: AuthActionError;
};

export type AuthActionError = {
  code: AuthErrorCode;
  message: string;
  field?: string;
};

export type AuthErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_OTP"
  | "EXPIRED_OTP"
  | "RATE_LIMITED"
  | "UNKNOWN_ERROR";
