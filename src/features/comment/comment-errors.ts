export class CommentValidationError extends Error {
  constructor(
    public field: string,
    message: string
  ) {
    super(message);
    this.name = "CommentValidationError";
  }
}

export class CommentNotFoundError extends Error {
  constructor(message = "Commentaire introuvable") {
    super(message);
    this.name = "CommentNotFoundError";
  }
}

export class CommentPermissionError extends Error {
  constructor(
    message = "Vous n'avez pas la permission d'effectuer cette action"
  ) {
    super(message);
    this.name = "CommentPermissionError";
  }
}
