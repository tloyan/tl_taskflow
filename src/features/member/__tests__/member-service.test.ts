import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAuthenticatedSession } from "@/test/mocks/auth.mock";
import { createMockMember, mockOwner, mockMember } from "./member.fixtures";
import { createMockInvitation, createMockInvitationDetails } from "./invitation.fixtures";

const mockAuth = vi.hoisted(() => ({
  api: {
    getSession: vi.fn(),
  },
}));

const mockMemberRepository = vi.hoisted(() => ({
  getMembersByWorkspaceIdRepository: vi.fn(),
  getMemberRepository: vi.fn(),
  addMemberRepository: vi.fn(),
  updateMemberRoleRepository: vi.fn(),
  removeMemberRepository: vi.fn(),
  getUserByEmailRepository: vi.fn(),
}));

const mockInvitationRepository = vi.hoisted(() => ({
  createInvitationRepository: vi.fn(),
  getInvitationByTokenRepository: vi.fn(),
  getInvitationDetailsByTokenRepository: vi.fn(),
  getPendingInvitationByEmailRepository: vi.fn(),
  getInvitationByIdRepository: vi.fn(),
  updateInvitationStatusRepository: vi.fn(),
  updateInvitationRoleRepository: vi.fn(),
}));

const mockWorkspaceRepository = vi.hoisted(() => ({
  getWorkspaceByIdRepository: vi.fn(),
}));

const mockEmails = vi.hoisted(() => ({
  sendInvitationEmail: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

vi.mock("crypto", () => ({
  default: {
    randomBytes: () => Buffer.from("a".repeat(32)),
  },
  randomBytes: () => Buffer.from("a".repeat(32)),
}));

vi.mock("../member-repository", () => mockMemberRepository);
vi.mock("../invitation-repository", () => mockInvitationRepository);
vi.mock("../../workspace/workspace-repository", () => mockWorkspaceRepository);
vi.mock("../member-emails", () => mockEmails);

import {
  getWorkspaceMembers,
  inviteMember,
  acceptInvitation,
  cancelInvitation,
  changeInvitationRole,
  changeMemberRole,
  removeMember,
  leaveWorkspace,
  getInvitationDetails,
} from "../member-service";
import { AuthError } from "@/features/auth/auth-errors";
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
} from "../member-errors";

const UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("member-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getWorkspaceMembers", () => {
    it("should return members when user is a member", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository.mockResolvedValue(mockMember);
      const members = [mockMember];
      mockMemberRepository.getMembersByWorkspaceIdRepository.mockResolvedValue(members);

      const result = await getWorkspaceMembers("ws-123");

      expect(result).toEqual(members);
    });

    it("should throw AuthError when session is null", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      await expect(getWorkspaceMembers("ws-123")).rejects.toThrow(AuthError);
    });

    it("should throw MemberPermissionError when user is not a member", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository.mockResolvedValue(undefined);
      await expect(getWorkspaceMembers("ws-123")).rejects.toThrow(MemberPermissionError);
    });
  });

  describe("inviteMember", () => {
    const validInput = {
      workspaceId: UUID,
      email: "new@example.com",
      role: "member",
    };

    it("should create invitation and send email when valid", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository.mockResolvedValue(mockOwner);
      mockMemberRepository.getUserByEmailRepository.mockResolvedValue(undefined);
      mockInvitationRepository.getPendingInvitationByEmailRepository.mockResolvedValue(null);
      mockInvitationRepository.createInvitationRepository.mockResolvedValue(undefined);
      mockWorkspaceRepository.getWorkspaceByIdRepository.mockResolvedValue({
        id: UUID,
        name: "Test Workspace",
      });
      mockEmails.sendInvitationEmail.mockResolvedValue(undefined);

      await inviteMember(validInput);

      expect(mockInvitationRepository.createInvitationRepository).toHaveBeenCalled();
      expect(mockEmails.sendInvitationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "new@example.com",
          workspaceName: "Test Workspace",
        })
      );
    });

    it("should throw AuthError when session is null", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      await expect(inviteMember(validInput)).rejects.toThrow(AuthError);
    });

    it("should throw MemberValidationError when email is invalid", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      await expect(
        inviteMember({ ...validInput, email: "not-an-email" })
      ).rejects.toThrow(MemberValidationError);
    });

    it("should throw MemberPermissionError when user is not a member", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository.mockResolvedValue(undefined);
      await expect(inviteMember(validInput)).rejects.toThrow(MemberPermissionError);
    });

    it("should throw MemberPermissionError when user is a viewer", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository.mockResolvedValue(
        createMockMember({ role: "viewer" })
      );
      await expect(inviteMember(validInput)).rejects.toThrow(MemberPermissionError);
    });

    it("should throw MemberAlreadyExistsError when user is already a member", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository
        .mockResolvedValueOnce(mockOwner) // current user
        .mockResolvedValueOnce(mockMember); // target user already member
      mockMemberRepository.getUserByEmailRepository.mockResolvedValue({
        id: "target-user",
        name: "Target",
        email: "new@example.com",
      });

      await expect(inviteMember(validInput)).rejects.toThrow(MemberAlreadyExistsError);
    });

    it("should throw InvitationAlreadySentError when pending invitation exists", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository.mockResolvedValue(mockOwner);
      mockMemberRepository.getUserByEmailRepository.mockResolvedValue(undefined);
      mockInvitationRepository.getPendingInvitationByEmailRepository.mockResolvedValue(
        createMockInvitation()
      );

      await expect(inviteMember(validInput)).rejects.toThrow(InvitationAlreadySentError);
    });
  });

  describe("getInvitationDetails", () => {
    it("should return invitation details when valid", async () => {
      mockInvitationRepository.getInvitationDetailsByTokenRepository.mockResolvedValue(
        createMockInvitationDetails()
      );

      const result = await getInvitationDetails("valid-token");

      expect(result).toEqual({
        workspaceName: "Test Workspace",
        inviterName: "Test User",
        roleLabel: "Membre",
      });
    });

    it("should throw InvitationNotFoundError when token is invalid", async () => {
      mockInvitationRepository.getInvitationDetailsByTokenRepository.mockResolvedValue(null);
      await expect(getInvitationDetails("bad-token")).rejects.toThrow(InvitationNotFoundError);
    });

    it("should throw InvitationInvalidError when invitation is not pending", async () => {
      mockInvitationRepository.getInvitationDetailsByTokenRepository.mockResolvedValue(
        createMockInvitationDetails({ status: "accepted" })
      );
      await expect(getInvitationDetails("token")).rejects.toThrow(InvitationInvalidError);
    });

    it("should throw InvitationExpiredError when invitation has expired", async () => {
      mockInvitationRepository.getInvitationDetailsByTokenRepository.mockResolvedValue(
        createMockInvitationDetails({
          expiresAt: new Date("2020-01-01"),
        })
      );
      await expect(getInvitationDetails("token")).rejects.toThrow(InvitationExpiredError);
    });
  });

  describe("acceptInvitation", () => {
    it("should accept invitation and add member when valid", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockInvitationRepository.getInvitationByTokenRepository.mockResolvedValue(
        createMockInvitation({ email: "test@example.com" })
      );
      mockMemberRepository.getMemberRepository.mockResolvedValue(undefined);
      mockMemberRepository.addMemberRepository.mockResolvedValue(undefined);
      mockInvitationRepository.updateInvitationStatusRepository.mockResolvedValue(undefined);

      const result = await acceptInvitation("abc123token");

      expect(result).toEqual({ slug: "test-workspace" });
      expect(mockMemberRepository.addMemberRepository).toHaveBeenCalled();
      expect(mockInvitationRepository.updateInvitationStatusRepository).toHaveBeenCalledWith(
        "inv-123",
        "accepted"
      );
    });

    it("should mark as accepted if already a member", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockInvitationRepository.getInvitationByTokenRepository.mockResolvedValue(
        createMockInvitation({ email: "test@example.com" })
      );
      mockMemberRepository.getMemberRepository.mockResolvedValue(mockMember);
      mockInvitationRepository.updateInvitationStatusRepository.mockResolvedValue(undefined);

      const result = await acceptInvitation("abc123token");

      expect(result).toEqual({ slug: "test-workspace" });
      expect(mockMemberRepository.addMemberRepository).not.toHaveBeenCalled();
    });

    it("should throw AuthError when session is null", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      await expect(acceptInvitation("token")).rejects.toThrow(AuthError);
    });

    it("should throw InvitationNotFoundError when token is invalid", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockInvitationRepository.getInvitationByTokenRepository.mockResolvedValue(null);
      await expect(acceptInvitation("bad-token")).rejects.toThrow(InvitationNotFoundError);
    });

    it("should throw InvitationInvalidError when invitation is not pending", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockInvitationRepository.getInvitationByTokenRepository.mockResolvedValue(
        createMockInvitation({ status: "cancelled" })
      );
      await expect(acceptInvitation("token")).rejects.toThrow(InvitationInvalidError);
    });

    it("should throw InvitationExpiredError when invitation has expired", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockInvitationRepository.getInvitationByTokenRepository.mockResolvedValue(
        createMockInvitation({ expiresAt: new Date("2020-01-01") })
      );
      await expect(acceptInvitation("token")).rejects.toThrow(InvitationExpiredError);
    });

    it("should throw InvitationInvalidError when email does not match", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockInvitationRepository.getInvitationByTokenRepository.mockResolvedValue(
        createMockInvitation({ email: "other@example.com" })
      );
      await expect(acceptInvitation("token")).rejects.toThrow(InvitationInvalidError);
    });
  });

  describe("cancelInvitation", () => {
    const validInput = {
      workspaceId: UUID,
      invitationId: UUID,
    };

    it("should cancel invitation when valid", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository.mockResolvedValue(mockOwner);
      mockInvitationRepository.getInvitationByIdRepository.mockResolvedValue(
        createMockInvitation({ id: UUID, workspaceId: UUID })
      );
      mockInvitationRepository.updateInvitationStatusRepository.mockResolvedValue(undefined);

      await cancelInvitation(validInput);

      expect(mockInvitationRepository.updateInvitationStatusRepository).toHaveBeenCalledWith(
        UUID,
        "cancelled"
      );
    });

    it("should throw AuthError when session is null", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      await expect(cancelInvitation(validInput)).rejects.toThrow(AuthError);
    });

    it("should throw MemberPermissionError when user is a member role", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository.mockResolvedValue(mockMember);
      await expect(cancelInvitation(validInput)).rejects.toThrow(MemberPermissionError);
    });

    it("should throw InvitationNotFoundError when invitation does not exist", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository.mockResolvedValue(mockOwner);
      mockInvitationRepository.getInvitationByIdRepository.mockResolvedValue(null);
      await expect(cancelInvitation(validInput)).rejects.toThrow(InvitationNotFoundError);
    });

    it("should throw InvitationNotFoundError when invitation workspaceId does not match", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository.mockResolvedValue(mockOwner);
      mockInvitationRepository.getInvitationByIdRepository.mockResolvedValue(
        createMockInvitation({ id: UUID, workspaceId: "other-ws" })
      );
      await expect(cancelInvitation(validInput)).rejects.toThrow(InvitationNotFoundError);
    });

    it("should throw InvitationInvalidError when invitation is not pending", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository.mockResolvedValue(mockOwner);
      mockInvitationRepository.getInvitationByIdRepository.mockResolvedValue(
        createMockInvitation({ id: UUID, workspaceId: UUID, status: "accepted" })
      );
      await expect(cancelInvitation(validInput)).rejects.toThrow(InvitationInvalidError);
    });
  });

  describe("changeInvitationRole", () => {
    const validInput = {
      workspaceId: UUID,
      invitationId: UUID,
      role: "admin",
    };

    it("should change invitation role when valid", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository.mockResolvedValue(mockOwner);
      mockInvitationRepository.getInvitationByIdRepository.mockResolvedValue(
        createMockInvitation({ id: UUID, workspaceId: UUID })
      );
      mockInvitationRepository.updateInvitationRoleRepository.mockResolvedValue(undefined);

      await changeInvitationRole(validInput);

      expect(mockInvitationRepository.updateInvitationRoleRepository).toHaveBeenCalledWith(
        UUID,
        "admin"
      );
    });

    it("should throw MemberPermissionError when user is a viewer", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository.mockResolvedValue(
        createMockMember({ role: "viewer" })
      );
      await expect(changeInvitationRole(validInput)).rejects.toThrow(MemberPermissionError);
    });
  });

  describe("changeMemberRole", () => {
    const validInput = {
      workspaceId: UUID,
      userId: "target-user",
      role: "admin",
    };

    it("should change member role when owner changes member to admin", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository
        .mockResolvedValueOnce(createMockMember({ role: "owner" })) // current
        .mockResolvedValueOnce(createMockMember({ role: "member", userId: "target-user" })); // target
      mockMemberRepository.updateMemberRoleRepository.mockResolvedValue(undefined);

      await changeMemberRole(validInput);

      expect(mockMemberRepository.updateMemberRoleRepository).toHaveBeenCalledWith(
        UUID,
        "target-user",
        "admin"
      );
    });

    it("should throw AuthError when session is null", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      await expect(changeMemberRole(validInput)).rejects.toThrow(AuthError);
    });

    it("should throw MemberPermissionError when user is not owner/admin", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository.mockResolvedValue(mockMember);
      await expect(changeMemberRole(validInput)).rejects.toThrow(MemberPermissionError);
    });

    it("should throw MemberNotFoundError when target does not exist", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository
        .mockResolvedValueOnce(createMockMember({ role: "owner" }))
        .mockResolvedValueOnce(undefined);
      await expect(changeMemberRole(validInput)).rejects.toThrow(MemberNotFoundError);
    });

    it("should throw MemberCannotModifyOwnerError when target is owner", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository
        .mockResolvedValueOnce(createMockMember({ role: "owner" }))
        .mockResolvedValueOnce(createMockMember({ role: "owner", userId: "target-user" }));
      await expect(changeMemberRole(validInput)).rejects.toThrow(MemberCannotModifyOwnerError);
    });

    it("should throw MemberPermissionError when admin tries to modify another admin", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository
        .mockResolvedValueOnce(createMockMember({ role: "admin" }))
        .mockResolvedValueOnce(createMockMember({ role: "admin", userId: "target-user" }));
      await expect(changeMemberRole(validInput)).rejects.toThrow(MemberPermissionError);
    });

    it("should throw MemberPermissionError when trying to change own role", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository
        .mockResolvedValueOnce(createMockMember({ role: "owner" }))
        .mockResolvedValueOnce(createMockMember({ role: "admin", userId: "user-123" }));
      await expect(
        changeMemberRole({ ...validInput, userId: "user-123" })
      ).rejects.toThrow(MemberPermissionError);
    });
  });

  describe("removeMember", () => {
    const validInput = {
      workspaceId: UUID,
      userId: "target-user",
    };

    it("should remove member when owner removes a member", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository
        .mockResolvedValueOnce(createMockMember({ role: "owner" }))
        .mockResolvedValueOnce(createMockMember({ role: "member", userId: "target-user" }));
      mockMemberRepository.removeMemberRepository.mockResolvedValue(undefined);

      await removeMember(validInput);

      expect(mockMemberRepository.removeMemberRepository).toHaveBeenCalledWith(
        UUID,
        "target-user"
      );
    });

    it("should throw AuthError when session is null", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      await expect(removeMember(validInput)).rejects.toThrow(AuthError);
    });

    it("should throw MemberPermissionError when user is a member", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository.mockResolvedValue(mockMember);
      await expect(removeMember(validInput)).rejects.toThrow(MemberPermissionError);
    });

    it("should throw MemberNotFoundError when target does not exist", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository
        .mockResolvedValueOnce(createMockMember({ role: "owner" }))
        .mockResolvedValueOnce(undefined);
      await expect(removeMember(validInput)).rejects.toThrow(MemberNotFoundError);
    });

    it("should throw MemberCannotModifyOwnerError when target is owner", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository
        .mockResolvedValueOnce(createMockMember({ role: "owner" }))
        .mockResolvedValueOnce(createMockMember({ role: "owner", userId: "target-user" }));
      await expect(removeMember(validInput)).rejects.toThrow(MemberCannotModifyOwnerError);
    });

    it("should throw MemberPermissionError when admin tries to remove another admin", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository
        .mockResolvedValueOnce(createMockMember({ role: "admin" }))
        .mockResolvedValueOnce(createMockMember({ role: "admin", userId: "target-user" }));
      await expect(removeMember(validInput)).rejects.toThrow(MemberPermissionError);
    });

    it("should throw MemberPermissionError when trying to remove self", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository
        .mockResolvedValueOnce(createMockMember({ role: "owner" }))
        .mockResolvedValueOnce(createMockMember({ role: "member", userId: "user-123" }));
      await expect(
        removeMember({ ...validInput, userId: "user-123" })
      ).rejects.toThrow(MemberPermissionError);
    });
  });

  describe("leaveWorkspace", () => {
    it("should remove member when leaving workspace", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository.mockResolvedValue(mockMember);
      mockMemberRepository.removeMemberRepository.mockResolvedValue(undefined);

      await leaveWorkspace("ws-123");

      expect(mockMemberRepository.removeMemberRepository).toHaveBeenCalledWith(
        "ws-123",
        "user-123"
      );
    });

    it("should throw AuthError when session is null", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      await expect(leaveWorkspace("ws-123")).rejects.toThrow(AuthError);
    });

    it("should throw MemberNotFoundError when user is not a member", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository.mockResolvedValue(undefined);
      await expect(leaveWorkspace("ws-123")).rejects.toThrow(MemberNotFoundError);
    });

    it("should throw MemberPermissionError when owner tries to leave", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository.mockResolvedValue(mockOwner);
      await expect(leaveWorkspace("ws-123")).rejects.toThrow(MemberPermissionError);
    });
  });
});
