import "server-only";

import crypto from "crypto";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AuthError } from "../auth/auth-errors";
import type { MemberRole, MemberWithUser } from "./member-types";
import {
  inviteMemberSchema,
  changeMemberRoleSchema,
  removeMemberSchema,
  cancelInvitationSchema,
  changeInvitationRoleSchema,
} from "./member-validation";
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
  getMembersByWorkspaceIdRepository,
  getMemberRepository,
  addMemberRepository,
  updateMemberRoleRepository,
  removeMemberRepository,
  getUserByEmailRepository,
} from "./member-repository";
import {
  createInvitationRepository,
  getInvitationByTokenRepository,
  getInvitationDetailsByTokenRepository,
  getPendingInvitationByEmailRepository,
  getInvitationByIdRepository,
  updateInvitationStatusRepository,
  updateInvitationRoleRepository,
} from "./invitation-repository";
import { getWorkspaceByIdRepository } from "../workspace/workspace-repository";
import { sendInvitationEmail } from "./member-emails";
import type { z } from "zod";

function getFieldFromZodError(issue: z.ZodIssue): string {
  const field = issue.path[0];
  return typeof field === "string" ? field : String(field);
}

function assertMemberPermission(
  currentMember: MemberWithUser,
  requiredRoles: MemberRole[]
): void {
  if (!requiredRoles.includes(currentMember.role as MemberRole)) {
    throw new MemberPermissionError();
  }
}

export async function getWorkspaceMembers(
  workspaceId: string
): Promise<MemberWithUser[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new AuthError();

  const currentMember = await getMemberRepository(
    workspaceId,
    session.user.id
  );
  if (!currentMember) throw new MemberPermissionError();

  return await getMembersByWorkspaceIdRepository(workspaceId);
}

export async function inviteMember(data: unknown): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new AuthError();

  const parsed = inviteMemberSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new MemberValidationError(getFieldFromZodError(err), err.message);
  }

  const currentMember = await getMemberRepository(
    parsed.data.workspaceId,
    session.user.id
  );
  if (!currentMember) throw new MemberPermissionError();
  assertMemberPermission(currentMember, ["owner", "admin"]);

  // Only owners can invite as admin
  if (currentMember.role === "admin" && parsed.data.role === "admin") {
    throw new MemberPermissionError(
      "Seul le propriétaire peut inviter en tant qu'administrateur"
    );
  }

  const email = parsed.data.email.toLowerCase();

  // If user already exists and is already a member, reject
  const targetUser = await getUserByEmailRepository(email);
  if (targetUser) {
    const existingMember = await getMemberRepository(
      parsed.data.workspaceId,
      targetUser.id
    );
    if (existingMember) {
      throw new MemberAlreadyExistsError();
    }
  }

  // Check for existing pending invitation
  const existingInvitation = await getPendingInvitationByEmailRepository(
    parsed.data.workspaceId,
    email
  );
  if (existingInvitation) {
    throw new InvitationAlreadySentError();
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await createInvitationRepository({
    workspaceId: parsed.data.workspaceId,
    email,
    role: parsed.data.role,
    token,
    invitedById: session.user.id,
    expiresAt,
  });

  const workspace = await getWorkspaceByIdRepository(parsed.data.workspaceId);

  await sendInvitationEmail({
    to: email,
    workspaceName: workspace?.name ?? "Workspace",
    inviterName: session.user.name,
    role: parsed.data.role,
    token,
  });
}

const roleLabels: Record<string, string> = {
  admin: "Administrateur",
  member: "Membre",
  viewer: "Observateur",
};

export type InvitationDetails = {
  workspaceName: string;
  inviterName: string;
  roleLabel: string;
};

export async function getInvitationDetails(
  token: string
): Promise<InvitationDetails> {
  const invitation = await getInvitationDetailsByTokenRepository(token);
  if (!invitation) throw new InvitationNotFoundError();

  if (invitation.status !== "pending") {
    throw new InvitationInvalidError();
  }

  if (new Date() > invitation.expiresAt) {
    throw new InvitationExpiredError();
  }

  return {
    workspaceName: invitation.workspaceName,
    inviterName: invitation.inviterName,
    roleLabel: roleLabels[invitation.role] ?? invitation.role,
  };
}

export async function acceptInvitation(
  token: string
): Promise<{ slug: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new AuthError();

  const invitation = await getInvitationByTokenRepository(token);
  if (!invitation) throw new InvitationNotFoundError();

  if (invitation.status !== "pending") {
    throw new InvitationInvalidError();
  }

  if (new Date() > invitation.expiresAt) {
    throw new InvitationExpiredError();
  }

  // Verify the authenticated user's email matches the invitation
  if (session.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    throw new InvitationInvalidError(
      "Cette invitation est destinée à une autre adresse email"
    );
  }

  // Check if already a member
  const existingMember = await getMemberRepository(
    invitation.workspaceId,
    session.user.id
  );
  if (existingMember) {
    // Already a member — mark invitation as accepted and redirect
    await updateInvitationStatusRepository(invitation.id, "accepted");
    return { slug: invitation.workspaceSlug };
  }

  await addMemberRepository({
    workspaceId: invitation.workspaceId,
    userId: session.user.id,
    role: invitation.role,
  });

  await updateInvitationStatusRepository(invitation.id, "accepted");

  return { slug: invitation.workspaceSlug };
}

export async function cancelInvitation(data: unknown): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new AuthError();

  const parsed = cancelInvitationSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new MemberValidationError(getFieldFromZodError(err), err.message);
  }

  const currentMember = await getMemberRepository(
    parsed.data.workspaceId,
    session.user.id
  );
  if (!currentMember) throw new MemberPermissionError();
  assertMemberPermission(currentMember, ["owner", "admin"]);

  const invitation = await getInvitationByIdRepository(
    parsed.data.invitationId
  );
  if (!invitation) throw new InvitationNotFoundError();

  if (invitation.workspaceId !== parsed.data.workspaceId) {
    throw new InvitationNotFoundError();
  }

  if (invitation.status !== "pending") {
    throw new InvitationInvalidError(
      "Cette invitation ne peut plus être annulée"
    );
  }

  await updateInvitationStatusRepository(invitation.id, "cancelled");
}

export async function changeInvitationRole(data: unknown): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new AuthError();

  const parsed = changeInvitationRoleSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new MemberValidationError(getFieldFromZodError(err), err.message);
  }

  const currentMember = await getMemberRepository(
    parsed.data.workspaceId,
    session.user.id
  );
  if (!currentMember) throw new MemberPermissionError();
  assertMemberPermission(currentMember, ["owner", "admin"]);

  // Only owners can set invitation role to admin
  if (currentMember.role === "admin" && parsed.data.role === "admin") {
    throw new MemberPermissionError(
      "Seul le propriétaire peut attribuer le rôle administrateur"
    );
  }

  const invitation = await getInvitationByIdRepository(
    parsed.data.invitationId
  );
  if (!invitation) throw new InvitationNotFoundError();

  if (invitation.workspaceId !== parsed.data.workspaceId) {
    throw new InvitationNotFoundError();
  }

  if (invitation.status !== "pending") {
    throw new InvitationInvalidError(
      "Cette invitation ne peut plus être modifiée"
    );
  }

  await updateInvitationRoleRepository(invitation.id, parsed.data.role);
}

export async function changeMemberRole(data: unknown): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new AuthError();

  const parsed = changeMemberRoleSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new MemberValidationError(getFieldFromZodError(err), err.message);
  }

  const currentMember = await getMemberRepository(
    parsed.data.workspaceId,
    session.user.id
  );
  if (!currentMember) throw new MemberPermissionError();
  assertMemberPermission(currentMember, ["owner", "admin"]);

  const targetMember = await getMemberRepository(
    parsed.data.workspaceId,
    parsed.data.userId
  );
  if (!targetMember) throw new MemberNotFoundError();

  if (targetMember.role === "owner") {
    throw new MemberCannotModifyOwnerError();
  }

  // Admins cannot modify other admins — only owners can
  if (currentMember.role === "admin" && targetMember.role === "admin") {
    throw new MemberPermissionError(
      "Seul le propriétaire peut modifier le rôle d'un administrateur"
    );
  }

  if (parsed.data.userId === session.user.id) {
    throw new MemberPermissionError(
      "Vous ne pouvez pas modifier votre propre rôle"
    );
  }

  await updateMemberRoleRepository(
    parsed.data.workspaceId,
    parsed.data.userId,
    parsed.data.role as MemberRole
  );
}

export async function removeMember(data: unknown): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new AuthError();

  const parsed = removeMemberSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new MemberValidationError(getFieldFromZodError(err), err.message);
  }

  const currentMember = await getMemberRepository(
    parsed.data.workspaceId,
    session.user.id
  );
  if (!currentMember) throw new MemberPermissionError();
  assertMemberPermission(currentMember, ["owner", "admin"]);

  const targetMember = await getMemberRepository(
    parsed.data.workspaceId,
    parsed.data.userId
  );
  if (!targetMember) throw new MemberNotFoundError();

  if (targetMember.role === "owner") {
    throw new MemberCannotModifyOwnerError();
  }

  // Admins cannot remove other admins — only owners can
  if (currentMember.role === "admin" && targetMember.role === "admin") {
    throw new MemberPermissionError(
      "Seul le propriétaire peut retirer un administrateur"
    );
  }

  if (parsed.data.userId === session.user.id) {
    throw new MemberPermissionError(
      "Utilisez la fonction quitter pour vous retirer du workspace"
    );
  }

  await removeMemberRepository(parsed.data.workspaceId, parsed.data.userId);
}

export async function leaveWorkspace(workspaceId: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new AuthError();

  const currentMember = await getMemberRepository(
    workspaceId,
    session.user.id
  );
  if (!currentMember) throw new MemberNotFoundError();

  if (currentMember.role === "owner") {
    throw new MemberPermissionError(
      "Le propriétaire ne peut pas quitter le workspace"
    );
  }

  await removeMemberRepository(workspaceId, session.user.id);
}
