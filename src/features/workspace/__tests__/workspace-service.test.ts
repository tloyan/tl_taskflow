import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAuthenticatedSession } from "@/test/mocks/auth.mock";
import {
  createMockWorkspace,
  validCreateInput,
  validUpdateInput,
  validDeleteInput,
} from "@/test/mocks/workspace.fixtures";

// Use vi.hoisted for mocks that need to be available before hoisting
const mockAuth = vi.hoisted(() => ({
  api: {
    getSession: vi.fn(),
  },
}));

const mockRepository = vi.hoisted(() => ({
  createWorkspaceRepository: vi.fn(),
  getWorkspaceBySlugRepository: vi.fn(),
  getWorkspaceByIdRepository: vi.fn(),
  updateWorkspaceRepository: vi.fn(),
  deleteWorkspaceRepository: vi.fn(),
  getWorkspacesByOwnerIdRepository: vi.fn(),
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

// Mock repository functions
vi.mock("../workspace-repository", () => mockRepository);

// Import after mocking
import {
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
} from "../workspace-service";
import { AuthError } from "@/features/auth/auth-errors";
import {
  WorkspaceValidationError,
  WorkspaceNotFoundError,
  WorkspacePermissionError,
} from "../workspace-errors";

describe("workspace-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createWorkspace", () => {
    it("should create workspace and return slug when valid data provided", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getWorkspaceBySlugRepository.mockResolvedValue(undefined);
      mockRepository.createWorkspaceRepository.mockResolvedValue(undefined);

      const result = await createWorkspace(validCreateInput);

      expect(result).toBe("new-workspace");
      expect(mockRepository.createWorkspaceRepository).toHaveBeenCalledWith({
        ...validCreateInput,
        ownerId: "user-123",
      });
    });

    it("should throw AuthError when session is null", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      await expect(createWorkspace(validCreateInput)).rejects.toThrow(
        AuthError
      );
    });

    it("should throw WorkspaceValidationError when name is too short", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());

      await expect(
        createWorkspace({ ...validCreateInput, name: "ab" })
      ).rejects.toThrow(WorkspaceValidationError);
    });

    it("should throw WorkspaceValidationError when slug is invalid", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());

      await expect(
        createWorkspace({ ...validCreateInput, slug: "INVALID SLUG!" })
      ).rejects.toThrow(WorkspaceValidationError);
    });

    it("should throw WorkspaceValidationError when slug already exists", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getWorkspaceBySlugRepository.mockResolvedValue(
        createMockWorkspace()
      );

      await expect(createWorkspace(validCreateInput)).rejects.toThrow(
        WorkspaceValidationError
      );
    });
  });

  describe("updateWorkspace", () => {
    it("should update workspace and return new slug when valid data provided", async () => {
      const workspaceId = "550e8400-e29b-41d4-a716-446655440000";
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getWorkspaceByIdRepository.mockResolvedValue(
        createMockWorkspace({ id: workspaceId })
      );
      mockRepository.getWorkspaceBySlugRepository.mockResolvedValue(undefined);
      mockRepository.updateWorkspaceRepository.mockResolvedValue(undefined);

      const input = { ...validUpdateInput, id: workspaceId };
      const result = await updateWorkspace(input);

      expect(result).toBe("updated-workspace");
      expect(mockRepository.updateWorkspaceRepository).toHaveBeenCalledWith(
        workspaceId,
        {
          name: "Updated Workspace",
          slug: "updated-workspace",
          description: "Updated description",
        }
      );
    });

    it("should throw AuthError when session is null", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      await expect(updateWorkspace(validUpdateInput)).rejects.toThrow(
        AuthError
      );
    });

    it("should throw WorkspaceValidationError when id is not a valid UUID", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());

      await expect(
        updateWorkspace({ ...validUpdateInput, id: "invalid-id" })
      ).rejects.toThrow(WorkspaceValidationError);
    });

    it("should throw WorkspaceNotFoundError when workspace does not exist", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getWorkspaceByIdRepository.mockResolvedValue(undefined);

      const input = {
        ...validUpdateInput,
        id: "550e8400-e29b-41d4-a716-446655440000",
      };
      await expect(updateWorkspace(input)).rejects.toThrow(
        WorkspaceNotFoundError
      );
    });

    it("should throw WorkspacePermissionError when user is not owner", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getWorkspaceByIdRepository.mockResolvedValue(
        createMockWorkspace({ ownerId: "other-user" })
      );

      const input = {
        ...validUpdateInput,
        id: "550e8400-e29b-41d4-a716-446655440000",
      };
      await expect(updateWorkspace(input)).rejects.toThrow(
        WorkspacePermissionError
      );
    });

    it("should throw WorkspaceValidationError when new slug already exists", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getWorkspaceByIdRepository.mockResolvedValue(
        createMockWorkspace({ id: "550e8400-e29b-41d4-a716-446655440000" })
      );
      mockRepository.getWorkspaceBySlugRepository.mockResolvedValue(
        createMockWorkspace({ slug: "updated-workspace" })
      );

      const input = {
        ...validUpdateInput,
        id: "550e8400-e29b-41d4-a716-446655440000",
      };
      await expect(updateWorkspace(input)).rejects.toThrow(
        WorkspaceValidationError
      );
    });
  });

  describe("deleteWorkspace", () => {
    it("should delete workspace when valid data and confirmation provided", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getWorkspaceByIdRepository.mockResolvedValue(
        createMockWorkspace()
      );
      mockRepository.deleteWorkspaceRepository.mockResolvedValue(undefined);

      const input = {
        ...validDeleteInput,
        id: "550e8400-e29b-41d4-a716-446655440000",
      };
      await deleteWorkspace(input, "Test Workspace");

      expect(mockRepository.deleteWorkspaceRepository).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440000"
      );
    });

    it("should throw AuthError when session is null", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      await expect(
        deleteWorkspace(validDeleteInput, "Test Workspace")
      ).rejects.toThrow(AuthError);
    });

    it("should throw WorkspaceValidationError when id is not a valid UUID", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());

      await expect(
        deleteWorkspace(
          { ...validDeleteInput, id: "invalid" },
          "Test Workspace"
        )
      ).rejects.toThrow(WorkspaceValidationError);
    });

    it("should throw WorkspaceNotFoundError when workspace does not exist", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getWorkspaceByIdRepository.mockResolvedValue(undefined);

      const input = {
        ...validDeleteInput,
        id: "550e8400-e29b-41d4-a716-446655440000",
      };
      await expect(deleteWorkspace(input, "Test Workspace")).rejects.toThrow(
        WorkspaceNotFoundError
      );
    });

    it("should throw WorkspacePermissionError when user is not owner", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getWorkspaceByIdRepository.mockResolvedValue(
        createMockWorkspace({ ownerId: "other-user" })
      );

      const input = {
        ...validDeleteInput,
        id: "550e8400-e29b-41d4-a716-446655440000",
      };
      await expect(deleteWorkspace(input, "Test Workspace")).rejects.toThrow(
        WorkspacePermissionError
      );
    });

    it("should throw WorkspaceValidationError when confirmName does not match", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockRepository.getWorkspaceByIdRepository.mockResolvedValue(
        createMockWorkspace()
      );

      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        confirmName: "Wrong Name",
      };
      await expect(deleteWorkspace(input, "Test Workspace")).rejects.toThrow(
        WorkspaceValidationError
      );
    });
  });
});
