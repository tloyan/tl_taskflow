export class AuthError extends Error {
  constructor(message = "User not logged in") {
    super(message);
    this.name = "AuthError";
  }
}

export class AuthValidationError extends Error {
  constructor(
    public field: string,
    message: string
  ) {
    super(message);
    this.name = "AuthValidationError";
  }
}
