import { defineRelations } from "drizzle-orm";
import * as auth from "./schema/auth-schema";
import * as workspaces from "./schema/workspaces";
import * as workspaceMembers from "./schema/workspace-members";
import * as workspaceInvitations from "./schema/workspace-invitations";
import * as projects from "./schema/projects";

export const relations = defineRelations(
  { ...auth, ...workspaces, ...workspaceMembers, ...workspaceInvitations, ...projects },
  (r) => ({
    user: {
      session: r.many.session(),
      account: r.many.account(),
      workspaceMembers: r.many.workspaceMembers(),
      invitationsSent: r.many.workspaceInvitations(),
    },
    session: {
      user: r.one.user({
        from: r.session.userId,
        to: r.user.id,
      }),
    },
    account: {
      user: r.one.user({
        from: r.account.userId,
        to: r.user.id,
      }),
    },
    workspace: {
      owner: r.one.user({
        from: r.workspaces.ownerId,
        to: r.user.id,
      }),
      members: r.many.workspaceMembers(),
      invitations: r.many.workspaceInvitations(),
      projects: r.many.projects(),
    },
    workspaceMembers: {
      workspace: r.one.workspaces({
        from: r.workspaceMembers.workspaceId,
        to: r.workspaces.id,
      }),
      user: r.one.user({
        from: r.workspaceMembers.userId,
        to: r.user.id,
      }),
    },
    workspaceInvitations: {
      workspace: r.one.workspaces({
        from: r.workspaceInvitations.workspaceId,
        to: r.workspaces.id,
      }),
      invitedBy: r.one.user({
        from: r.workspaceInvitations.invitedById,
        to: r.user.id,
      }),
    },
    projects: {
      workspace: r.one.workspaces({
        from: r.projects.workspaceId,
        to: r.workspaces.id,
      }),
    },
  })
);
