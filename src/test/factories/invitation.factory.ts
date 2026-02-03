import { testDb } from "../helpers/test-db";
import { workspaceInvitations } from "@/db/schema/workspace-invitations";
import { randomUUID } from "crypto";
import crypto from "crypto";

type InvitationOverrides = {
  id?: string;
  workspaceId: string;
  email: string;
  role?: string;
  invitedById: string;
  token?: string;
  status?: string;
  expiresAt?: Date;
};

export async function createTestInvitation(overrides: InvitationOverrides) {
  const id = overrides.id ?? randomUUID();

  const [created] = await testDb
    .insert(workspaceInvitations)
    .values({
      id,
      workspaceId: overrides.workspaceId,
      email: overrides.email,
      role: overrides.role ?? "member",
      token: overrides.token ?? crypto.randomBytes(32).toString("hex"),
      invitedById: overrides.invitedById,
      status: overrides.status ?? "pending",
      expiresAt:
        overrides.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })
    .returning();

  return created;
}
