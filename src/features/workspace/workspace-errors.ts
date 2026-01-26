export class WorkspaceValidationError extends Error {
  constructor(
    public field: string,
    message: string
  ) {
    super(message);
    this.name = "WorkspaceValidationError";
  }
}

export class WorkspaceNotFoundError extends Error {
  constructor(message = "Workspace introuvable") {
    super(message);
    this.name = "WorkspaceNotFoundError";
  }
}

export class WorkspacePermissionError extends Error {
  constructor(message = "Vous n'avez pas la permission d'effectuer cette action") {
    super(message);
    this.name = "WorkspacePermissionError";
  }
}
