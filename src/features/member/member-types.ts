import type { WorkspaceMember } from "@/db/schema/workspace-members";

export type MemberRole = "owner" | "admin" | "member" | "viewer";

export type MemberWithUser = WorkspaceMember & {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

export type InvitationWithInviter = {
  id: string;
  workspaceId: string;
  email: string;
  role: string;
  token: string;
  invitedById: string;
  status: string;
  expiresAt: Date;
  createdAt: Date;
  invitedBy: {
    id: string;
    name: string;
  };
};

export type InviteMemberInput = {
  workspaceId: string;
  email: string;
  role: string;
};

export type ChangeMemberRoleInput = {
  workspaceId: string;
  userId: string;
  role: string;
};

export type RemoveMemberInput = {
  workspaceId: string;
  userId: string;
};

export type CancelInvitationInput = {
  workspaceId: string;
  invitationId: string;
};

export type ChangeInvitationRoleInput = {
  workspaceId: string;
  invitationId: string;
  role: string;
};

export const MemberErrorCode = {
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  PERMISSION_ERROR: "PERMISSION_ERROR",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  CANNOT_MODIFY_OWNER: "CANNOT_MODIFY_OWNER",
  INVITATION_ALREADY_SENT: "INVITATION_ALREADY_SENT",
  INVITATION_NOT_FOUND: "INVITATION_NOT_FOUND",
  INVITATION_EXPIRED: "INVITATION_EXPIRED",
  INVITATION_INVALID: "INVITATION_INVALID",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type MemberErrorCode =
  (typeof MemberErrorCode)[keyof typeof MemberErrorCode];

type BaseMemberError = {
  code: Exclude<MemberErrorCode, "VALIDATION_ERROR">;
  message: string;
};

type ValidationMemberError = {
  code: "VALIDATION_ERROR";
  field: string;
  message: string;
};

export type MemberActionError = BaseMemberError | ValidationMemberError;

export type MemberActionResultError = { error: MemberActionError };

export type InviteMemberActionResult =
  | MemberActionResultError
  | { success: true };

export type ChangeMemberRoleActionResult =
  | MemberActionResultError
  | { success: true };

export type RemoveMemberActionResult =
  | MemberActionResultError
  | { success: true };

export type LeaveWorkspaceActionResult = MemberActionResultError;

export type CancelInvitationActionResult =
  | MemberActionResultError
  | { success: true };

export type ChangeInvitationRoleActionResult =
  | MemberActionResultError
  | { success: true };

export type AcceptInvitationResult =
  | MemberActionResultError
  | { success: true; slug: string };
