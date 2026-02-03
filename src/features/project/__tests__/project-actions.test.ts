import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRedirect = vi.hoisted(() =>
  vi.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  })
);

const mockService = vi.hoisted(() => ({
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  archiveProject: vi.fn(),
  unarchiveProject: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

vi.mock("../project-service", () => mockService);

import {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
  archiveProjectAction,
  unarchiveProjectAction,
} from "../project-actions";
import { revalidatePath } from "next/cache";
import { AuthError } from "@/features/auth/auth-errors";
import {
  ProjectValidationError,
  ProjectNotFoundError,
  ProjectPermissionError,
} from "../project-errors";

describe("project-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedirect.mockImplementation((url: string) => {
      throw new Error(`NEXT_REDIRECT:${url}`);
    });
  });

  describe("createProjectAction", () => {
    it("should call revalidatePath and redirect on success", async () => {
      mockService.createProject.mockResolvedValue("project-new");

      await expect(
        createProjectAction(
          { workspaceId: "ws-1", name: "Test", color: "#000" },
          "my-workspace"
        )
      ).rejects.toThrow("NEXT_REDIRECT:/w/my-workspace/p/project-new");

      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    });

    it("should return AUTHENTICATION_ERROR when AuthError is thrown", async () => {
      mockService.createProject.mockRejectedValue(new AuthError());

      const result = await createProjectAction(
        { workspaceId: "ws-1", name: "Test", color: "#000" },
        "my-workspace"
      );

      expect(result).toEqual({
        error: { code: "AUTHENTICATION_ERROR", message: "User not logged in" },
      });
    });

    it("should return VALIDATION_ERROR with field when ProjectValidationError is thrown", async () => {
      mockService.createProject.mockRejectedValue(
        new ProjectValidationError("name", "Le nom est trop court")
      );

      const result = await createProjectAction(
        { workspaceId: "ws-1", name: "a", color: "#000" },
        "my-workspace"
      );

      expect(result).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          field: "name",
          message: "Le nom est trop court",
        },
      });
    });

    it("should return PERMISSION_ERROR when ProjectPermissionError is thrown", async () => {
      mockService.createProject.mockRejectedValue(
        new ProjectPermissionError()
      );

      const result = await createProjectAction(
        { workspaceId: "ws-1", name: "Test", color: "#000" },
        "my-workspace"
      );

      expect(result).toEqual({
        error: {
          code: "PERMISSION_ERROR",
          message: "Vous n'avez pas la permission d'effectuer cette action",
        },
      });
    });

    it("should return UNKNOWN_ERROR for unexpected errors", async () => {
      mockService.createProject.mockRejectedValue(new Error("DB error"));

      const result = await createProjectAction(
        { workspaceId: "ws-1", name: "Test", color: "#000" },
        "my-workspace"
      );

      expect(result).toEqual({
        error: { code: "UNKNOWN_ERROR", message: "Une erreur est survenue" },
      });
    });
  });

  describe("updateProjectAction", () => {
    it("should return success on successful update", async () => {
      mockService.updateProject.mockResolvedValue(undefined);

      const result = await updateProjectAction({
        id: "project-1",
        name: "Updated",
        color: "#fff",
      });

      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    });

    it("should return AUTHENTICATION_ERROR when AuthError is thrown", async () => {
      mockService.updateProject.mockRejectedValue(new AuthError());

      const result = await updateProjectAction({
        id: "project-1",
        name: "Test",
        color: "#000",
      });

      expect(result).toEqual({
        error: { code: "AUTHENTICATION_ERROR", message: "User not logged in" },
      });
    });

    it("should return NOT_FOUND when ProjectNotFoundError is thrown", async () => {
      mockService.updateProject.mockRejectedValue(new ProjectNotFoundError());

      const result = await updateProjectAction({
        id: "project-1",
        name: "Test",
        color: "#000",
      });

      expect(result).toEqual({
        error: { code: "NOT_FOUND", message: "Projet introuvable" },
      });
    });

    it("should return UNKNOWN_ERROR for unexpected errors", async () => {
      mockService.updateProject.mockRejectedValue(new Error("DB error"));

      const result = await updateProjectAction({
        id: "project-1",
        name: "Test",
        color: "#000",
      });

      expect(result).toEqual({
        error: { code: "UNKNOWN_ERROR", message: "Une erreur est survenue" },
      });
    });
  });

  describe("deleteProjectAction", () => {
    it("should call revalidatePath and redirect on success", async () => {
      mockService.deleteProject.mockResolvedValue("ws-123");

      await expect(
        deleteProjectAction(
          { id: "project-1", confirmName: "Test" },
          "my-workspace"
        )
      ).rejects.toThrow("NEXT_REDIRECT:/w/my-workspace");

      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    });

    it("should return AUTHENTICATION_ERROR when AuthError is thrown", async () => {
      mockService.deleteProject.mockRejectedValue(new AuthError());

      const result = await deleteProjectAction(
        { id: "project-1", confirmName: "Test" },
        "my-workspace"
      );

      expect(result).toEqual({
        error: { code: "AUTHENTICATION_ERROR", message: "User not logged in" },
      });
    });

    it("should return VALIDATION_ERROR when confirmName does not match", async () => {
      mockService.deleteProject.mockRejectedValue(
        new ProjectValidationError("confirmName", "Le nom ne correspond pas")
      );

      const result = await deleteProjectAction(
        { id: "project-1", confirmName: "Wrong" },
        "my-workspace"
      );

      expect(result).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          field: "confirmName",
          message: "Le nom ne correspond pas",
        },
      });
    });

    it("should return UNKNOWN_ERROR for unexpected errors", async () => {
      mockService.deleteProject.mockRejectedValue(new Error("DB error"));

      const result = await deleteProjectAction(
        { id: "project-1", confirmName: "Test" },
        "my-workspace"
      );

      expect(result).toEqual({
        error: { code: "UNKNOWN_ERROR", message: "Une erreur est survenue" },
      });
    });
  });

  describe("archiveProjectAction", () => {
    it("should return success on successful archive", async () => {
      mockService.archiveProject.mockResolvedValue(undefined);

      const result = await archiveProjectAction({ id: "project-1" });

      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    });

    it("should return PERMISSION_ERROR when ProjectPermissionError is thrown", async () => {
      mockService.archiveProject.mockRejectedValue(
        new ProjectPermissionError()
      );

      const result = await archiveProjectAction({ id: "project-1" });

      expect(result).toEqual({
        error: {
          code: "PERMISSION_ERROR",
          message: "Vous n'avez pas la permission d'effectuer cette action",
        },
      });
    });
  });

  describe("unarchiveProjectAction", () => {
    it("should return success on successful unarchive", async () => {
      mockService.unarchiveProject.mockResolvedValue(undefined);

      const result = await unarchiveProjectAction({ id: "project-1" });

      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    });

    it("should return PERMISSION_ERROR when ProjectPermissionError is thrown", async () => {
      mockService.unarchiveProject.mockRejectedValue(
        new ProjectPermissionError()
      );

      const result = await unarchiveProjectAction({ id: "project-1" });

      expect(result).toEqual({
        error: {
          code: "PERMISSION_ERROR",
          message: "Vous n'avez pas la permission d'effectuer cette action",
        },
      });
    });
  });
});
