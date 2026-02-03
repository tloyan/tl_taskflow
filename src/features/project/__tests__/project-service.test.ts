import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAuthenticatedSession } from "@/test/mocks/auth.mock";
import {
  createMockProject,
  validCreateProjectInput,
  validUpdateProjectInput,
  validDeleteProjectInput,
  validArchiveProjectInput,
} from "./project.fixtures";

const mockAuth = vi.hoisted(() => ({
  api: {
    getSession: vi.fn(),
  },
}));

const mockRepository = vi.hoisted(() => ({
  createProjectRepository: vi.fn(),
  getProjectByIdRepository: vi.fn(),
  updateProjectRepository: vi.fn(),
  deleteProjectRepository: vi.fn(),
  archiveProjectRepository: vi.fn(),
  unarchiveProjectRepository: vi.fn(),
}));

const mockMemberRepository = vi.hoisted(() => ({
  getMemberRepository: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

vi.mock("../project-repository", () => mockRepository);
vi.mock("../../member/member-repository", () => mockMemberRepository);

import {
  createProject,
  updateProject,
  deleteProject,
  archiveProject,
  unarchiveProject,
} from "../project-service";
import { AuthError } from "@/features/auth/auth-errors";
import {
  ProjectValidationError,
  ProjectNotFoundError,
  ProjectPermissionError,
} from "../project-errors";

describe("project-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createProject", () => {
    it("should create project and return id when valid data provided", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository.mockResolvedValue({
        role: "owner",
        userId: "user-123",
        workspaceId: "550e8400-e29b-41d4-a716-446655440000",
      });
      mockRepository.createProjectRepository.mockResolvedValue({
        id: "project-new",
      });

      const result = await createProject(validCreateProjectInput);

      expect(result).toBe("project-new");
      expect(mockRepository.createProjectRepository).toHaveBeenCalledWith({
        name: "New Project",
        description: "A new project",
        workspaceId: "550e8400-e29b-41d4-a716-446655440000",
        color: "#3b82f6",
      });
    });

    it("should throw AuthError when session is null", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      await expect(createProject(validCreateProjectInput)).rejects.toThrow(
        AuthError
      );
    });

    it("should throw ProjectValidationError when name is too short", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());

      await expect(
        createProject({ ...validCreateProjectInput, name: "a" })
      ).rejects.toThrow(ProjectValidationError);
    });

    it("should throw ProjectValidationError when workspaceId is invalid UUID", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());

      await expect(
        createProject({ ...validCreateProjectInput, workspaceId: "invalid" })
      ).rejects.toThrow(ProjectValidationError);
    });

    it("should throw ProjectPermissionError when user is not a member", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository.mockResolvedValue(undefined);

      await expect(createProject(validCreateProjectInput)).rejects.toThrow(
        ProjectPermissionError
      );
    });

    it("should throw ProjectPermissionError when user is a viewer", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository.mockResolvedValue({
        role: "viewer",
        userId: "user-123",
        workspaceId: "550e8400-e29b-41d4-a716-446655440000",
      });

      await expect(createProject(validCreateProjectInput)).rejects.toThrow(
        ProjectPermissionError
      );
    });

    it("should throw ProjectPermissionError when user is a member (not admin/owner)", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockMemberRepository.getMemberRepository.mockResolvedValue({
        role: "member",
        userId: "user-123",
        workspaceId: "550e8400-e29b-41d4-a716-446655440000",
      });

      await expect(createProject(validCreateProjectInput)).rejects.toThrow(
        ProjectPermissionError
      );
    });
  });

  describe("updateProject", () => {
    it("should update project when valid data provided", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getProjectByIdRepository.mockResolvedValue(
        createMockProject({ id: "550e8400-e29b-41d4-a716-446655440001" })
      );
      mockMemberRepository.getMemberRepository.mockResolvedValue({
        role: "owner",
        userId: "user-123",
        workspaceId: "ws-123",
      });
      mockRepository.updateProjectRepository.mockResolvedValue(undefined);

      await updateProject(validUpdateProjectInput);

      expect(mockRepository.updateProjectRepository).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440001",
        {
          name: "Updated Project",
          description: "Updated description",
          color: "#ef4444",
        }
      );
    });

    it("should throw AuthError when session is null", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      await expect(updateProject(validUpdateProjectInput)).rejects.toThrow(
        AuthError
      );
    });

    it("should throw ProjectValidationError when id is not a valid UUID", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());

      await expect(
        updateProject({ ...validUpdateProjectInput, id: "invalid" })
      ).rejects.toThrow(ProjectValidationError);
    });

    it("should throw ProjectNotFoundError when project does not exist", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getProjectByIdRepository.mockResolvedValue(undefined);

      await expect(updateProject(validUpdateProjectInput)).rejects.toThrow(
        ProjectNotFoundError
      );
    });

    it("should throw ProjectPermissionError when user is not a member", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getProjectByIdRepository.mockResolvedValue(
        createMockProject({ id: "550e8400-e29b-41d4-a716-446655440001" })
      );
      mockMemberRepository.getMemberRepository.mockResolvedValue(undefined);

      await expect(updateProject(validUpdateProjectInput)).rejects.toThrow(
        ProjectPermissionError
      );
    });

    it("should throw ProjectPermissionError when user is a viewer", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getProjectByIdRepository.mockResolvedValue(
        createMockProject({ id: "550e8400-e29b-41d4-a716-446655440001" })
      );
      mockMemberRepository.getMemberRepository.mockResolvedValue({
        role: "viewer",
        userId: "user-123",
        workspaceId: "ws-123",
      });

      await expect(updateProject(validUpdateProjectInput)).rejects.toThrow(
        ProjectPermissionError
      );
    });
  });

  describe("deleteProject", () => {
    it("should delete project when valid data and confirmation provided", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getProjectByIdRepository.mockResolvedValue(
        createMockProject({
          id: "550e8400-e29b-41d4-a716-446655440001",
          name: "Test Project",
        })
      );
      mockMemberRepository.getMemberRepository.mockResolvedValue({
        role: "owner",
        userId: "user-123",
        workspaceId: "ws-123",
      });
      mockRepository.deleteProjectRepository.mockResolvedValue(undefined);

      const result = await deleteProject(validDeleteProjectInput, "Test Project");

      expect(result).toBe("ws-123");
      expect(mockRepository.deleteProjectRepository).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440001"
      );
    });

    it("should throw AuthError when session is null", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      await expect(
        deleteProject(validDeleteProjectInput, "Test Project")
      ).rejects.toThrow(AuthError);
    });

    it("should throw ProjectValidationError when id is not a valid UUID", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());

      await expect(
        deleteProject({ ...validDeleteProjectInput, id: "invalid" }, "Test Project")
      ).rejects.toThrow(ProjectValidationError);
    });

    it("should throw ProjectNotFoundError when project does not exist", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getProjectByIdRepository.mockResolvedValue(undefined);

      await expect(
        deleteProject(validDeleteProjectInput, "Test Project")
      ).rejects.toThrow(ProjectNotFoundError);
    });

    it("should throw ProjectPermissionError when user is not a member", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getProjectByIdRepository.mockResolvedValue(
        createMockProject({ id: "550e8400-e29b-41d4-a716-446655440001" })
      );
      mockMemberRepository.getMemberRepository.mockResolvedValue(undefined);

      await expect(
        deleteProject(validDeleteProjectInput, "Test Project")
      ).rejects.toThrow(ProjectPermissionError);
    });

    it("should throw ProjectValidationError when confirmName does not match", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getProjectByIdRepository.mockResolvedValue(
        createMockProject({
          id: "550e8400-e29b-41d4-a716-446655440001",
          name: "Test Project",
        })
      );
      mockMemberRepository.getMemberRepository.mockResolvedValue({
        role: "owner",
        userId: "user-123",
        workspaceId: "ws-123",
      });

      await expect(
        deleteProject(
          { ...validDeleteProjectInput, confirmName: "Wrong Name" },
          "Test Project"
        )
      ).rejects.toThrow(ProjectValidationError);
    });
  });

  describe("archiveProject", () => {
    it("should archive project when valid data provided", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getProjectByIdRepository.mockResolvedValue(
        createMockProject({ id: "550e8400-e29b-41d4-a716-446655440001" })
      );
      mockMemberRepository.getMemberRepository.mockResolvedValue({
        role: "admin",
        userId: "user-123",
        workspaceId: "ws-123",
      });
      mockRepository.archiveProjectRepository.mockResolvedValue(undefined);

      await archiveProject(validArchiveProjectInput);

      expect(mockRepository.archiveProjectRepository).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440001"
      );
    });

    it("should throw AuthError when session is null", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      await expect(archiveProject(validArchiveProjectInput)).rejects.toThrow(
        AuthError
      );
    });

    it("should throw ProjectNotFoundError when project does not exist", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getProjectByIdRepository.mockResolvedValue(undefined);

      await expect(archiveProject(validArchiveProjectInput)).rejects.toThrow(
        ProjectNotFoundError
      );
    });

    it("should throw ProjectPermissionError when user is a member", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getProjectByIdRepository.mockResolvedValue(
        createMockProject({ id: "550e8400-e29b-41d4-a716-446655440001" })
      );
      mockMemberRepository.getMemberRepository.mockResolvedValue({
        role: "member",
        userId: "user-123",
        workspaceId: "ws-123",
      });

      await expect(archiveProject(validArchiveProjectInput)).rejects.toThrow(
        ProjectPermissionError
      );
    });
  });

  describe("unarchiveProject", () => {
    it("should unarchive project when valid data provided", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getProjectByIdRepository.mockResolvedValue(
        createMockProject({
          id: "550e8400-e29b-41d4-a716-446655440001",
          status: "archived",
        })
      );
      mockMemberRepository.getMemberRepository.mockResolvedValue({
        role: "owner",
        userId: "user-123",
        workspaceId: "ws-123",
      });
      mockRepository.unarchiveProjectRepository.mockResolvedValue(undefined);

      await unarchiveProject(validArchiveProjectInput);

      expect(mockRepository.unarchiveProjectRepository).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440001"
      );
    });

    it("should throw AuthError when session is null", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      await expect(unarchiveProject(validArchiveProjectInput)).rejects.toThrow(
        AuthError
      );
    });

    it("should throw ProjectPermissionError when user is a viewer", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getProjectByIdRepository.mockResolvedValue(
        createMockProject({ id: "550e8400-e29b-41d4-a716-446655440001" })
      );
      mockMemberRepository.getMemberRepository.mockResolvedValue({
        role: "viewer",
        userId: "user-123",
        workspaceId: "ws-123",
      });

      await expect(unarchiveProject(validArchiveProjectInput)).rejects.toThrow(
        ProjectPermissionError
      );
    });
  });
});
