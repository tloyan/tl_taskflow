"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "../auth/auth-errors";
import {
  MemberValidationError,
  MemberNotFoundError,
  MemberPermissionError,
  MemberAlreadyExistsError,
  MemberCannotModifyOwnerError,
  InvitationAlreadySentError,
  InvitationNotFoundError,
  InvitationExpiredError,
  InvitationInvalidError,
} from "./member-errors";
import {
  inviteMember,
  changeMemberRole,
  removeMember,
  leaveWorkspace,
  cancelInvitation,
  changeInvitationRole,
  acceptInvitation,
} from "./member-service";
import type {
  InviteMemberInput,
  ChangeMemberRoleInput,
  RemoveMemberInput,
  CancelInvitationInput,
  ChangeInvitationRoleInput,
  InviteMemberActionResult,
  ChangeMemberRoleActionResult,
  RemoveMemberActionResult,
  LeaveWorkspaceActionResult,
  CancelInvitationActionResult,
  ChangeInvitationRoleActionResult,
  AcceptInvitationResult,
  MemberActionResultError,
} from "./member-types";

function handleMemberError(err: unknown): MemberActionResultError {
  console.error(err);

  if (err instanceof AuthError) {
    return {
      error: { code: "AUTHENTICATION_ERROR", message: err.message },
    };
  }
  if (err instanceof MemberValidationError) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        field: err.field,
        message: err.message,
      },
    };
  }
  if (err instanceof MemberNotFoundError) {
    return {
      error: { code: "NOT_FOUND", message: err.message },
    };
  }
  if (err instanceof MemberPermissionError) {
    return {
      error: { code: "PERMISSION_ERROR", message: err.message },
    };
  }
  if (err instanceof MemberAlreadyExistsError) {
    return {
      error: { code: "ALREADY_EXISTS", message: err.message },
    };
  }
  if (err instanceof MemberCannotModifyOwnerError) {
    return {
      error: { code: "CANNOT_MODIFY_OWNER", message: err.message },
    };
  }
  if (err instanceof InvitationAlreadySentError) {
    return {
      error: { code: "INVITATION_ALREADY_SENT", message: err.message },
    };
  }
  if (err instanceof InvitationNotFoundError) {
    return {
      error: { code: "INVITATION_NOT_FOUND", message: err.message },
    };
  }
  if (err instanceof InvitationExpiredError) {
    return {
      error: { code: "INVITATION_EXPIRED", message: err.message },
    };
  }
  if (err instanceof InvitationInvalidError) {
    return {
      error: { code: "INVITATION_INVALID", message: err.message },
    };
  }
  return {
    error: { code: "UNKNOWN_ERROR", message: "Une erreur est survenue" },
  };
}

export async function inviteMemberAction(
  data: InviteMemberInput
): Promise<InviteMemberActionResult> {
  try {
    await inviteMember(data);
  } catch (err) {
    return handleMemberError(err);
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function changeMemberRoleAction(
  data: ChangeMemberRoleInput
): Promise<ChangeMemberRoleActionResult> {
  try {
    await changeMemberRole(data);
  } catch (err) {
    return handleMemberError(err);
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function removeMemberAction(
  data: RemoveMemberInput
): Promise<RemoveMemberActionResult> {
  try {
    await removeMember(data);
  } catch (err) {
    return handleMemberError(err);
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function leaveWorkspaceAction(
  workspaceId: string
): Promise<LeaveWorkspaceActionResult> {
  try {
    await leaveWorkspace(workspaceId);
  } catch (err) {
    return handleMemberError(err);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function cancelInvitationAction(
  data: CancelInvitationInput
): Promise<CancelInvitationActionResult> {
  try {
    await cancelInvitation(data);
  } catch (err) {
    return handleMemberError(err);
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function changeInvitationRoleAction(
  data: ChangeInvitationRoleInput
): Promise<ChangeInvitationRoleActionResult> {
  try {
    await changeInvitationRole(data);
  } catch (err) {
    return handleMemberError(err);
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function acceptInvitationAction(
  token: string
): Promise<AcceptInvitationResult> {
  try {
    const result = await acceptInvitation(token);
    revalidatePath("/", "layout");
    return { success: true, slug: result.slug };
  } catch (err) {
    return handleMemberError(err);
  }
}
