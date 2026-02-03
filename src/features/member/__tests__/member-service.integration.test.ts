import { describe, it, expect, vi, beforeEach } from "vitest";
import { setupAuthMock } from "@/test/helpers/auth.integration";
import {
  createTestUser,
  createTestWorkspace,
  createTestMember,
  createTestInvitation,
} from "@/test/factories";
import { testDb } from "@/test/helpers/test-db";
import { workspaceMembers } from "@/db/schema/workspace-members";
import { workspaceInvitations } from "@/db/schema/workspace-invitations";
import { and, eq } from "drizzle-orm";
import {
  MemberPermissionError,
  MemberAlreadyExistsError,
  MemberCannotModifyOwnerError,
  InvitationAlreadySentError,
  InvitationExpiredError,
  InvitationInvalidError,
} from "../member-errors";

vi.mock("@/features/member/member-emails", () => ({
  sendInvitationEmail: vi.fn(),
}));

const { setSession, clearSession } = setupAuthMock();

const {
  getWorkspaceMembers,
  inviteMember,
  acceptInvitation,
  cancelInvitation,
  changeInvitationRole,
  changeMemberRole,
  removeMember,
  leaveWorkspace,
} = await import("../member-service");

describe("Member Service (integration)", () => {
  beforeEach(() => {
    clearSession();
  });

  describe("getWorkspaceMembers", () => {
    it("retourne les membres pour un membre du workspace", async () => {
      const owner = await createTestUser();
      const member = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: member.id,
        role: "member",
      });

      setSession(owner);
      const members = await getWorkspaceMembers(workspace.id);

      expect(members).toHaveLength(2);
    });

    it("refuse l'accès à un non-membre", async () => {
      const owner = await createTestUser();
      const outsider = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });

      setSession(outsider);

      await expect(getWorkspaceMembers(workspace.id)).rejects.toThrow(
        MemberPermissionError
      );
    });
  });

  describe("inviteMember", () => {
    it("owner peut inviter un membre", async () => {
      const owner = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });

      setSession(owner);

      await inviteMember({
        workspaceId: workspace.id,
        email: "invite@test.com",
        role: "member",
      });

      const invitations = await testDb
        .select()
        .from(workspaceInvitations)
        .where(eq(workspaceInvitations.workspaceId, workspace.id));

      expect(invitations).toHaveLength(1);
      expect(invitations[0].email).toBe("invite@test.com");
      expect(invitations[0].role).toBe("member");
      expect(invitations[0].status).toBe("pending");
      expect(invitations[0].invitedById).toBe(owner.id);
    });

    it("admin peut inviter un membre", async () => {
      const owner = await createTestUser();
      const admin = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: admin.id,
        role: "admin",
      });

      setSession(admin);

      await inviteMember({
        workspaceId: workspace.id,
        email: "invite@test.com",
        role: "member",
      });

      const invitations = await testDb
        .select()
        .from(workspaceInvitations)
        .where(eq(workspaceInvitations.workspaceId, workspace.id));

      expect(invitations).toHaveLength(1);
    });

    it("member ne peut pas inviter", async () => {
      const owner = await createTestUser();
      const member = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: member.id,
        role: "member",
      });

      setSession(member);

      await expect(
        inviteMember({
          workspaceId: workspace.id,
          email: "invite@test.com",
          role: "member",
        })
      ).rejects.toThrow(MemberPermissionError);
    });

    it("refuse si l'utilisateur est déjà membre", async () => {
      const owner = await createTestUser();
      const existing = await createTestUser({
        email: "existing@test.com",
      });
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: existing.id,
        role: "member",
      });

      setSession(owner);

      await expect(
        inviteMember({
          workspaceId: workspace.id,
          email: "existing@test.com",
          role: "member",
        })
      ).rejects.toThrow(MemberAlreadyExistsError);
    });

    it("refuse si une invitation pending existe déjà", async () => {
      const owner = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });

      await createTestInvitation({
        workspaceId: workspace.id,
        email: "invite@test.com",
        invitedById: owner.id,
        status: "pending",
      });

      setSession(owner);

      await expect(
        inviteMember({
          workspaceId: workspace.id,
          email: "invite@test.com",
          role: "member",
        })
      ).rejects.toThrow(InvitationAlreadySentError);
    });
  });

  describe("acceptInvitation", () => {
    it("accepte une invitation valide et ajoute le membre", async () => {
      const owner = await createTestUser();
      const invitee = await createTestUser({ email: "invitee@test.com" });
      const workspace = await createTestWorkspace({ ownerId: owner.id });

      const invitation = await createTestInvitation({
        workspaceId: workspace.id,
        email: "invitee@test.com",
        invitedById: owner.id,
        role: "member",
        token: "valid-token-123",
      });

      setSession(invitee);

      const result = await acceptInvitation("valid-token-123");

      expect(result.slug).toBe(workspace.slug);

      // Vérifie que le membre a été ajouté
      const members = await testDb
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspace.id),
            eq(workspaceMembers.userId, invitee.id)
          )
        );
      expect(members).toHaveLength(1);
      expect(members[0].role).toBe("member");

      // Vérifie que l'invitation est marquée comme accepted
      const updated = await testDb
        .select()
        .from(workspaceInvitations)
        .where(eq(workspaceInvitations.id, invitation.id));
      expect(updated[0].status).toBe("accepted");
    });

    it("refuse une invitation expirée", async () => {
      const owner = await createTestUser();
      const invitee = await createTestUser({ email: "invitee@test.com" });
      const workspace = await createTestWorkspace({ ownerId: owner.id });

      await createTestInvitation({
        workspaceId: workspace.id,
        email: "invitee@test.com",
        invitedById: owner.id,
        token: "expired-token",
        expiresAt: new Date(Date.now() - 1000),
      });

      setSession(invitee);

      await expect(acceptInvitation("expired-token")).rejects.toThrow(
        InvitationExpiredError
      );
    });

    it("refuse si l'email ne correspond pas au user authentifié", async () => {
      const owner = await createTestUser();
      const wrongUser = await createTestUser({ email: "wrong@test.com" });
      const workspace = await createTestWorkspace({ ownerId: owner.id });

      await createTestInvitation({
        workspaceId: workspace.id,
        email: "other@test.com",
        invitedById: owner.id,
        token: "mismatch-token",
      });

      setSession(wrongUser);

      await expect(acceptInvitation("mismatch-token")).rejects.toThrow(
        InvitationInvalidError
      );
    });

    it("marque comme accepted si déjà membre", async () => {
      const owner = await createTestUser();
      const existing = await createTestUser({ email: "existing@test.com" });
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: existing.id,
        role: "member",
      });

      const invitation = await createTestInvitation({
        workspaceId: workspace.id,
        email: "existing@test.com",
        invitedById: owner.id,
        token: "already-member-token",
      });

      setSession(existing);

      const result = await acceptInvitation("already-member-token");

      expect(result.slug).toBe(workspace.slug);

      const updated = await testDb
        .select()
        .from(workspaceInvitations)
        .where(eq(workspaceInvitations.id, invitation.id));
      expect(updated[0].status).toBe("accepted");
    });
  });

  describe("cancelInvitation", () => {
    it("owner peut annuler une invitation pending", async () => {
      const owner = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });

      const invitation = await createTestInvitation({
        workspaceId: workspace.id,
        email: "invite@test.com",
        invitedById: owner.id,
      });

      setSession(owner);

      await cancelInvitation({
        workspaceId: workspace.id,
        invitationId: invitation.id,
      });

      const updated = await testDb
        .select()
        .from(workspaceInvitations)
        .where(eq(workspaceInvitations.id, invitation.id));
      expect(updated[0].status).toBe("cancelled");
    });

    it("refuse l'annulation d'une invitation non-pending", async () => {
      const owner = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });

      const invitation = await createTestInvitation({
        workspaceId: workspace.id,
        email: "invite@test.com",
        invitedById: owner.id,
        status: "accepted",
      });

      setSession(owner);

      await expect(
        cancelInvitation({
          workspaceId: workspace.id,
          invitationId: invitation.id,
        })
      ).rejects.toThrow(InvitationInvalidError);
    });
  });

  describe("changeInvitationRole", () => {
    it("owner peut changer le rôle d'une invitation pending", async () => {
      const owner = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });

      const invitation = await createTestInvitation({
        workspaceId: workspace.id,
        email: "invite@test.com",
        invitedById: owner.id,
        role: "member",
      });

      setSession(owner);

      await changeInvitationRole({
        workspaceId: workspace.id,
        invitationId: invitation.id,
        role: "admin",
      });

      const updated = await testDb
        .select()
        .from(workspaceInvitations)
        .where(eq(workspaceInvitations.id, invitation.id));
      expect(updated[0].role).toBe("admin");
    });

    it("refuse si invitation non-pending", async () => {
      const owner = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });

      const invitation = await createTestInvitation({
        workspaceId: workspace.id,
        email: "invite@test.com",
        invitedById: owner.id,
        status: "cancelled",
      });

      setSession(owner);

      await expect(
        changeInvitationRole({
          workspaceId: workspace.id,
          invitationId: invitation.id,
          role: "admin",
        })
      ).rejects.toThrow(InvitationInvalidError);
    });
  });

  describe("changeMemberRole", () => {
    it("owner peut changer le rôle d'un member", async () => {
      const owner = await createTestUser();
      const member = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: member.id,
        role: "member",
      });

      setSession(owner);

      await changeMemberRole({
        workspaceId: workspace.id,
        userId: member.id,
        role: "admin",
      });

      const updated = await testDb
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspace.id),
            eq(workspaceMembers.userId, member.id)
          )
        );
      expect(updated[0].role).toBe("admin");
    });

    it("admin peut changer le rôle d'un member mais pas d'un admin", async () => {
      const owner = await createTestUser();
      const admin = await createTestUser();
      const otherAdmin = await createTestUser();
      const member = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: admin.id,
        role: "admin",
      });
      await createTestMember({
        workspaceId: workspace.id,
        userId: otherAdmin.id,
        role: "admin",
      });
      await createTestMember({
        workspaceId: workspace.id,
        userId: member.id,
        role: "member",
      });

      setSession(admin);

      // Admin peut changer le rôle d'un member
      await changeMemberRole({
        workspaceId: workspace.id,
        userId: member.id,
        role: "viewer",
      });

      const updated = await testDb
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspace.id),
            eq(workspaceMembers.userId, member.id)
          )
        );
      expect(updated[0].role).toBe("viewer");

      // Admin ne peut pas changer le rôle d'un autre admin
      await expect(
        changeMemberRole({
          workspaceId: workspace.id,
          userId: otherAdmin.id,
          role: "member",
        })
      ).rejects.toThrow(MemberPermissionError);
    });

    it("refuse de modifier le owner", async () => {
      const owner = await createTestUser();
      const admin = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: admin.id,
        role: "admin",
      });

      setSession(admin);

      await expect(
        changeMemberRole({
          workspaceId: workspace.id,
          userId: owner.id,
          role: "member",
        })
      ).rejects.toThrow(MemberCannotModifyOwnerError);
    });

    it("refuse de modifier son propre rôle", async () => {
      const owner = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });

      setSession(owner);

      await expect(
        changeMemberRole({
          workspaceId: workspace.id,
          userId: owner.id,
          role: "admin",
        })
      ).rejects.toThrow();
    });
  });

  describe("removeMember", () => {
    it("owner peut retirer un member", async () => {
      const owner = await createTestUser();
      const member = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: member.id,
        role: "member",
      });

      setSession(owner);

      await removeMember({
        workspaceId: workspace.id,
        userId: member.id,
      });

      const remaining = await testDb
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspace.id),
            eq(workspaceMembers.userId, member.id)
          )
        );
      expect(remaining).toHaveLength(0);
    });

    it("refuse de retirer le owner", async () => {
      const owner = await createTestUser();
      const admin = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: admin.id,
        role: "admin",
      });

      setSession(admin);

      await expect(
        removeMember({
          workspaceId: workspace.id,
          userId: owner.id,
        })
      ).rejects.toThrow(MemberCannotModifyOwnerError);
    });

    it("admin ne peut pas retirer un autre admin", async () => {
      const owner = await createTestUser();
      const admin1 = await createTestUser();
      const admin2 = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: admin1.id,
        role: "admin",
      });
      await createTestMember({
        workspaceId: workspace.id,
        userId: admin2.id,
        role: "admin",
      });

      setSession(admin1);

      await expect(
        removeMember({
          workspaceId: workspace.id,
          userId: admin2.id,
        })
      ).rejects.toThrow(MemberPermissionError);
    });

    it("refuse de se retirer soi-même", async () => {
      const owner = await createTestUser();
      const admin = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: admin.id,
        role: "admin",
      });

      setSession(admin);

      await expect(
        removeMember({
          workspaceId: workspace.id,
          userId: admin.id,
        })
      ).rejects.toThrow(MemberPermissionError);
    });
  });

  describe("leaveWorkspace", () => {
    it("un member peut quitter le workspace", async () => {
      const owner = await createTestUser();
      const member = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: member.id,
        role: "member",
      });

      setSession(member);

      await leaveWorkspace(workspace.id);

      const remaining = await testDb
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspace.id),
            eq(workspaceMembers.userId, member.id)
          )
        );
      expect(remaining).toHaveLength(0);
    });

    it("le owner ne peut pas quitter", async () => {
      const owner = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });

      setSession(owner);

      await expect(leaveWorkspace(workspace.id)).rejects.toThrow(
        MemberPermissionError
      );
    });
  });
});
