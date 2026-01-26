import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockWorkspace } from "@/test/mocks/workspace.fixtures";

// Use vi.hoisted for mocks that need to be available before hoisting
const mockRedirect = vi.hoisted(() =>
  vi.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  })
);

const mockService = vi.hoisted(() => ({
  createWorkspace: vi.fn(),
  updateWorkspace: vi.fn(),
  deleteWorkspace: vi.fn(),
}));

const mockRepository = vi.hoisted(() => ({
  getWorkspaceBySlugRepository: vi.fn(),
}));

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock next/navigation - redirect throws a special error
vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

// Mock service functions
vi.mock("../workspace-service", () => mockService);

// Mock repository for checkSlugAvailability
vi.mock("../workspace-repository", () => mockRepository);

// Import after mocking
import {
  createWorkspaceAction,
  updateWorkspaceAction,
  deleteWorkspaceAction,
  checkSlugAvailability,
} from "../workspace-actions";
import { revalidatePath } from "next/cache";
import { AuthError } from "@/features/auth/auth-errors";
import {
  WorkspaceValidationError,
  WorkspaceNotFoundError,
  WorkspacePermissionError,
} from "../workspace-errors";

describe("workspace-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-setup redirect mock after clearAllMocks
    mockRedirect.mockImplementation((url: string) => {
      throw new Error(`NEXT_REDIRECT:${url}`);
    });
  });

  describe("createWorkspaceAction", () => {
    it("should call revalidatePath and redirect on success", async () => {
      mockService.createWorkspace.mockResolvedValue("my-workspace");

      await expect(
        createWorkspaceAction({
          name: "My Workspace",
          slug: "my-workspace",
        })
      ).rejects.toThrow("NEXT_REDIRECT:/w/my-workspace");

      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    });

    it("should return AUTHENTICATION_ERROR when AuthError is thrown", async () => {
      mockService.createWorkspace.mockRejectedValue(new AuthError());

      const result = await createWorkspaceAction({
        name: "Test",
        slug: "test",
      });

      expect(result).toEqual({
        error: { code: "AUTHENTICATION_ERROR", message: "User not logged in" },
      });
    });

    it("should return VALIDATION_ERROR with field when WorkspaceValidationError is thrown", async () => {
      mockService.createWorkspace.mockRejectedValue(
        new WorkspaceValidationError("slug", "Ce slug est déjà utilisé")
      );

      const result = await createWorkspaceAction({
        name: "Test",
        slug: "test",
      });

      expect(result).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          field: "slug",
          message: "Ce slug est déjà utilisé",
        },
      });
    });

    it("should return UNKNOWN_ERROR for unexpected errors", async () => {
      mockService.createWorkspace.mockRejectedValue(
        new Error("Unexpected error")
      );

      const result = await createWorkspaceAction({
        name: "Test",
        slug: "test",
      });

      expect(result).toEqual({
        error: { code: "UNKNOWN_ERROR", message: "Une erreur est survenue" },
      });
    });
  });

  describe("updateWorkspaceAction", () => {
    it("should return success with slug on successful update", async () => {
      mockService.updateWorkspace.mockResolvedValue("updated-slug");

      const result = await updateWorkspaceAction({
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Updated",
        slug: "updated-slug",
      });

      expect(result).toEqual({ success: true, slug: "updated-slug" });
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    });

    it("should return AUTHENTICATION_ERROR when AuthError is thrown", async () => {
      mockService.updateWorkspace.mockRejectedValue(new AuthError());

      const result = await updateWorkspaceAction({
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Test",
        slug: "test",
      });

      expect(result).toEqual({
        error: { code: "AUTHENTICATION_ERROR", message: "User not logged in" },
      });
    });

    it("should return VALIDATION_ERROR with field when WorkspaceValidationError is thrown", async () => {
      mockService.updateWorkspace.mockRejectedValue(
        new WorkspaceValidationError("name", "Le nom est trop court")
      );

      const result = await updateWorkspaceAction({
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "ab",
        slug: "test",
      });

      expect(result).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          field: "name",
          message: "Le nom est trop court",
        },
      });
    });

    it("should return NOT_FOUND when WorkspaceNotFoundError is thrown", async () => {
      mockService.updateWorkspace.mockRejectedValue(
        new WorkspaceNotFoundError()
      );

      const result = await updateWorkspaceAction({
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Test",
        slug: "test",
      });

      expect(result).toEqual({
        error: { code: "NOT_FOUND", message: "Workspace introuvable" },
      });
    });

    it("should return PERMISSION_ERROR when WorkspacePermissionError is thrown", async () => {
      mockService.updateWorkspace.mockRejectedValue(
        new WorkspacePermissionError()
      );

      const result = await updateWorkspaceAction({
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Test",
        slug: "test",
      });

      expect(result).toEqual({
        error: {
          code: "PERMISSION_ERROR",
          message: "Vous n'avez pas la permission d'effectuer cette action",
        },
      });
    });

    it("should return UNKNOWN_ERROR for unexpected errors", async () => {
      mockService.updateWorkspace.mockRejectedValue(new Error("DB error"));

      const result = await updateWorkspaceAction({
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Test",
        slug: "test",
      });

      expect(result).toEqual({
        error: { code: "UNKNOWN_ERROR", message: "Une erreur est survenue" },
      });
    });
  });

  describe("deleteWorkspaceAction", () => {
    it("should call revalidatePath and redirect to / on success", async () => {
      mockService.deleteWorkspace.mockResolvedValue(undefined);

      await expect(
        deleteWorkspaceAction(
          { id: "550e8400-e29b-41d4-a716-446655440000", confirmName: "Test" },
          "Test"
        )
      ).rejects.toThrow("NEXT_REDIRECT:/");

      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    });

    it("should return AUTHENTICATION_ERROR when AuthError is thrown", async () => {
      mockService.deleteWorkspace.mockRejectedValue(new AuthError());

      const result = await deleteWorkspaceAction(
        { id: "550e8400-e29b-41d4-a716-446655440000", confirmName: "Test" },
        "Test"
      );

      expect(result).toEqual({
        error: { code: "AUTHENTICATION_ERROR", message: "User not logged in" },
      });
    });

    it("should return VALIDATION_ERROR with field when WorkspaceValidationError is thrown", async () => {
      mockService.deleteWorkspace.mockRejectedValue(
        new WorkspaceValidationError("confirmName", "Le nom ne correspond pas")
      );

      const result = await deleteWorkspaceAction(
        { id: "550e8400-e29b-41d4-a716-446655440000", confirmName: "Wrong" },
        "Test"
      );

      expect(result).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          field: "confirmName",
          message: "Le nom ne correspond pas",
        },
      });
    });

    it("should return NOT_FOUND when WorkspaceNotFoundError is thrown", async () => {
      mockService.deleteWorkspace.mockRejectedValue(
        new WorkspaceNotFoundError()
      );

      const result = await deleteWorkspaceAction(
        { id: "550e8400-e29b-41d4-a716-446655440000", confirmName: "Test" },
        "Test"
      );

      expect(result).toEqual({
        error: { code: "NOT_FOUND", message: "Workspace introuvable" },
      });
    });

    it("should return PERMISSION_ERROR when WorkspacePermissionError is thrown", async () => {
      mockService.deleteWorkspace.mockRejectedValue(
        new WorkspacePermissionError()
      );

      const result = await deleteWorkspaceAction(
        { id: "550e8400-e29b-41d4-a716-446655440000", confirmName: "Test" },
        "Test"
      );

      expect(result).toEqual({
        error: {
          code: "PERMISSION_ERROR",
          message: "Vous n'avez pas la permission d'effectuer cette action",
        },
      });
    });

    it("should return UNKNOWN_ERROR for unexpected errors", async () => {
      mockService.deleteWorkspace.mockRejectedValue(new Error("DB error"));

      const result = await deleteWorkspaceAction(
        { id: "550e8400-e29b-41d4-a716-446655440000", confirmName: "Test" },
        "Test"
      );

      expect(result).toEqual({
        error: { code: "UNKNOWN_ERROR", message: "Une erreur est survenue" },
      });
    });
  });

  describe("checkSlugAvailability", () => {
    it("should return available true when slug does not exist", async () => {
      mockRepository.getWorkspaceBySlugRepository.mockResolvedValue(undefined);

      const result = await checkSlugAvailability("new-slug");

      expect(result).toEqual({ available: true, suggestion: "new-slug" });
    });

    it("should return available false with suggestion when slug exists", async () => {
      mockRepository.getWorkspaceBySlugRepository.mockResolvedValue(
        createMockWorkspace()
      );

      const result = await checkSlugAvailability("existing-slug");

      expect(result.available).toBe(false);
      expect(result.suggestion).toMatch(/^existing-slug-\d{4}$/);
    });
  });
});
