import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRedirect = vi.hoisted(() =>
  vi.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  })
);

const mockService = vi.hoisted(() => ({
  inviteMember: vi.fn(),
  changeMemberRole: vi.fn(),
  removeMember: vi.fn(),
  leaveWorkspace: vi.fn(),
  cancelInvitation: vi.fn(),
  changeInvitationRole: vi.fn(),
  acceptInvitation: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

vi.mock("../member-service", () => mockService);

import {
  inviteMemberAction,
  changeMemberRoleAction,
  removeMemberAction,
  leaveWorkspaceAction,
  cancelInvitationAction,
  changeInvitationRoleAction,
  acceptInvitationAction,
} from "../member-actions";
import { revalidatePath } from "next/cache";
import { AuthError } from "@/features/auth/auth-errors";
import {
  MemberNotFoundError,
  MemberPermissionError,
  MemberAlreadyExistsError,
  MemberCannotModifyOwnerError,
  InvitationAlreadySentError,
  InvitationNotFoundError,
  InvitationExpiredError,
  InvitationInvalidError,
} from "../member-errors";

describe("member-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedirect.mockImplementation((url: string) => {
      throw new Error(`NEXT_REDIRECT:${url}`);
    });
  });

  describe("inviteMemberAction", () => {
    it("should return success on successful invite", async () => {
      mockService.inviteMember.mockResolvedValue(undefined);

      const result = await inviteMemberAction({
        workspaceId: "ws-1",
        email: "new@example.com",
        role: "member",
      });

      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    });

    it("should return AUTHENTICATION_ERROR when AuthError is thrown", async () => {
      mockService.inviteMember.mockRejectedValue(new AuthError());

      const result = await inviteMemberAction({
        workspaceId: "ws-1",
        email: "new@example.com",
        role: "member",
      });

      expect(result).toEqual({
        error: { code: "AUTHENTICATION_ERROR", message: "User not logged in" },
      });
    });

    it("should return ALREADY_EXISTS when MemberAlreadyExistsError is thrown", async () => {
      mockService.inviteMember.mockRejectedValue(new MemberAlreadyExistsError());

      const result = await inviteMemberAction({
        workspaceId: "ws-1",
        email: "existing@example.com",
        role: "member",
      });

      expect(result).toEqual({
        error: {
          code: "ALREADY_EXISTS",
          message: "Cet utilisateur est déjà membre de ce workspace",
        },
      });
    });

    it("should return INVITATION_ALREADY_SENT when InvitationAlreadySentError is thrown", async () => {
      mockService.inviteMember.mockRejectedValue(new InvitationAlreadySentError());

      const result = await inviteMemberAction({
        workspaceId: "ws-1",
        email: "pending@example.com",
        role: "member",
      });

      expect(result).toEqual({
        error: {
          code: "INVITATION_ALREADY_SENT",
          message: "Une invitation a déjà été envoyée à cette adresse email",
        },
      });
    });

    it("should return UNKNOWN_ERROR for unexpected errors", async () => {
      mockService.inviteMember.mockRejectedValue(new Error("fail"));

      const result = await inviteMemberAction({
        workspaceId: "ws-1",
        email: "new@example.com",
        role: "member",
      });

      expect(result).toEqual({
        error: { code: "UNKNOWN_ERROR", message: "Une erreur est survenue" },
      });
    });
  });

  describe("changeMemberRoleAction", () => {
    it("should return success on successful role change", async () => {
      mockService.changeMemberRole.mockResolvedValue(undefined);

      const result = await changeMemberRoleAction({
        workspaceId: "ws-1",
        userId: "u-2",
        role: "admin",
      });

      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    });

    it("should return CANNOT_MODIFY_OWNER when MemberCannotModifyOwnerError is thrown", async () => {
      mockService.changeMemberRole.mockRejectedValue(new MemberCannotModifyOwnerError());

      const result = await changeMemberRoleAction({
        workspaceId: "ws-1",
        userId: "u-2",
        role: "member",
      });

      expect(result).toEqual({
        error: {
          code: "CANNOT_MODIFY_OWNER",
          message: "Impossible de modifier le propriétaire du workspace",
        },
      });
    });
  });

  describe("removeMemberAction", () => {
    it("should return success on successful removal", async () => {
      mockService.removeMember.mockResolvedValue(undefined);

      const result = await removeMemberAction({
        workspaceId: "ws-1",
        userId: "u-2",
      });

      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    });

    it("should return NOT_FOUND when MemberNotFoundError is thrown", async () => {
      mockService.removeMember.mockRejectedValue(new MemberNotFoundError());

      const result = await removeMemberAction({
        workspaceId: "ws-1",
        userId: "u-2",
      });

      expect(result).toEqual({
        error: { code: "NOT_FOUND", message: "Membre introuvable" },
      });
    });
  });

  describe("leaveWorkspaceAction", () => {
    it("should revalidate and redirect on success", async () => {
      mockService.leaveWorkspace.mockResolvedValue(undefined);

      await expect(leaveWorkspaceAction("ws-1")).rejects.toThrow(
        "NEXT_REDIRECT:/"
      );

      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    });

    it("should return PERMISSION_ERROR when MemberPermissionError is thrown", async () => {
      mockService.leaveWorkspace.mockRejectedValue(new MemberPermissionError());

      const result = await leaveWorkspaceAction("ws-1");

      expect(result).toEqual({
        error: {
          code: "PERMISSION_ERROR",
          message: "Vous n'avez pas la permission d'effectuer cette action",
        },
      });
    });
  });

  describe("cancelInvitationAction", () => {
    it("should return success on successful cancellation", async () => {
      mockService.cancelInvitation.mockResolvedValue(undefined);

      const result = await cancelInvitationAction({
        workspaceId: "ws-1",
        invitationId: "inv-1",
      });

      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    });

    it("should return INVITATION_NOT_FOUND when InvitationNotFoundError is thrown", async () => {
      mockService.cancelInvitation.mockRejectedValue(new InvitationNotFoundError());

      const result = await cancelInvitationAction({
        workspaceId: "ws-1",
        invitationId: "inv-bad",
      });

      expect(result).toEqual({
        error: { code: "INVITATION_NOT_FOUND", message: "Invitation introuvable" },
      });
    });
  });

  describe("changeInvitationRoleAction", () => {
    it("should return success on successful role change", async () => {
      mockService.changeInvitationRole.mockResolvedValue(undefined);

      const result = await changeInvitationRoleAction({
        workspaceId: "ws-1",
        invitationId: "inv-1",
        role: "admin",
      });

      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    });

    it("should return INVITATION_INVALID when InvitationInvalidError is thrown", async () => {
      mockService.changeInvitationRole.mockRejectedValue(new InvitationInvalidError());

      const result = await changeInvitationRoleAction({
        workspaceId: "ws-1",
        invitationId: "inv-1",
        role: "admin",
      });

      expect(result).toEqual({
        error: {
          code: "INVITATION_INVALID",
          message: "Cette invitation n'est pas valide pour votre compte",
        },
      });
    });
  });

  describe("acceptInvitationAction", () => {
    it("should return success with slug on successful acceptance", async () => {
      mockService.acceptInvitation.mockResolvedValue({ slug: "my-workspace" });

      const result = await acceptInvitationAction("valid-token");

      expect(result).toEqual({ success: true, slug: "my-workspace" });
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    });

    it("should return INVITATION_EXPIRED when InvitationExpiredError is thrown", async () => {
      mockService.acceptInvitation.mockRejectedValue(new InvitationExpiredError());

      const result = await acceptInvitationAction("expired-token");

      expect(result).toEqual({
        error: { code: "INVITATION_EXPIRED", message: "Cette invitation a expiré" },
      });
    });

    it("should return UNKNOWN_ERROR for unexpected errors", async () => {
      mockService.acceptInvitation.mockRejectedValue(new Error("fail"));

      const result = await acceptInvitationAction("token");

      expect(result).toEqual({
        error: { code: "UNKNOWN_ERROR", message: "Une erreur est survenue" },
      });
    });
  });
});
