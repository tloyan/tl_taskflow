export class ProjectValidationError extends Error {
  constructor(
    public field: string,
    message: string
  ) {
    super(message);
    this.name = "ProjectValidationError";
  }
}

export class ProjectNotFoundError extends Error {
  constructor(message = "Projet introuvable") {
    super(message);
    this.name = "ProjectNotFoundError";
  }
}

export class ProjectPermissionError extends Error {
  constructor(
    message = "Vous n'avez pas la permission d'effectuer cette action"
  ) {
    super(message);
    this.name = "ProjectPermissionError";
  }
}
