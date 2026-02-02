export class TaskValidationError extends Error {
  constructor(
    public field: string,
    message: string
  ) {
    super(message);
    this.name = "TaskValidationError";
  }
}

export class TaskNotFoundError extends Error {
  constructor(message = "Tâche introuvable") {
    super(message);
    this.name = "TaskNotFoundError";
  }
}

export class TaskPermissionError extends Error {
  constructor(
    message = "Vous n'avez pas la permission d'effectuer cette action"
  ) {
    super(message);
    this.name = "TaskPermissionError";
  }
}
