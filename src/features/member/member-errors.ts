export class MemberValidationError extends Error {
  constructor(
    public field: string,
    message: string
  ) {
    super(message);
    this.name = "MemberValidationError";
  }
}

export class MemberNotFoundError extends Error {
  constructor(message = "Membre introuvable") {
    super(message);
    this.name = "MemberNotFoundError";
  }
}

export class MemberPermissionError extends Error {
  constructor(
    message = "Vous n'avez pas la permission d'effectuer cette action"
  ) {
    super(message);
    this.name = "MemberPermissionError";
  }
}

export class MemberAlreadyExistsError extends Error {
  constructor(message = "Cet utilisateur est déjà membre de ce workspace") {
    super(message);
    this.name = "MemberAlreadyExistsError";
  }
}

export class MemberCannotModifyOwnerError extends Error {
  constructor(message = "Impossible de modifier le propriétaire du workspace") {
    super(message);
    this.name = "MemberCannotModifyOwnerError";
  }
}

export class InvitationAlreadySentError extends Error {
  constructor(
    message = "Une invitation a déjà été envoyée à cette adresse email"
  ) {
    super(message);
    this.name = "InvitationAlreadySentError";
  }
}

export class InvitationNotFoundError extends Error {
  constructor(message = "Invitation introuvable") {
    super(message);
    this.name = "InvitationNotFoundError";
  }
}

export class InvitationExpiredError extends Error {
  constructor(message = "Cette invitation a expiré") {
    super(message);
    this.name = "InvitationExpiredError";
  }
}

export class InvitationInvalidError extends Error {
  constructor(
    message = "Cette invitation n'est pas valide pour votre compte"
  ) {
    super(message);
    this.name = "InvitationInvalidError";
  }
}
