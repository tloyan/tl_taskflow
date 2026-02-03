import { describe, it, expect, vi, beforeEach } from "vitest";

const mockService = vi.hoisted(() => ({
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  updateTaskStatus: vi.fn(),
  updateTaskPriority: vi.fn(),
  updateTaskAssignee: vi.fn(),
  updateTaskDueDate: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("../task-service", () => mockService);

import {
  createTaskAction,
  updateTaskAction,
  deleteTaskAction,
  updateTaskStatusAction,
  updateTaskPriorityAction,
  updateTaskAssigneeAction,
  updateTaskDueDateAction,
} from "../task-actions";
import { revalidatePath } from "next/cache";
import { AuthError } from "@/features/auth/auth-errors";
import {
  TaskValidationError,
  TaskNotFoundError,
  TaskPermissionError,
} from "../task-errors";

describe("task-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTaskAction", () => {
    it("should return success with id and revalidate path on success", async () => {
      mockService.createTask.mockResolvedValue("task-new");

      const result = await createTaskAction(
        { projectId: "p-1", title: "Test" },
        "/w/test/p/project-1"
      );

      expect(result).toEqual({ success: true, id: "task-new" });
      expect(revalidatePath).toHaveBeenCalledWith("/w/test/p/project-1");
    });

    it("should return AUTHENTICATION_ERROR when AuthError is thrown", async () => {
      mockService.createTask.mockRejectedValue(new AuthError());

      const result = await createTaskAction(
        { projectId: "p-1", title: "Test" },
        "/path"
      );

      expect(result).toEqual({
        error: { code: "AUTHENTICATION_ERROR", message: "User not logged in" },
      });
    });

    it("should return VALIDATION_ERROR with field when TaskValidationError is thrown", async () => {
      mockService.createTask.mockRejectedValue(
        new TaskValidationError("title", "Le titre est trop court")
      );

      const result = await createTaskAction(
        { projectId: "p-1", title: "a" },
        "/path"
      );

      expect(result).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          field: "title",
          message: "Le titre est trop court",
        },
      });
    });

    it("should return NOT_FOUND when TaskNotFoundError is thrown", async () => {
      mockService.createTask.mockRejectedValue(new TaskNotFoundError("Projet introuvable"));

      const result = await createTaskAction(
        { projectId: "p-1", title: "Test" },
        "/path"
      );

      expect(result).toEqual({
        error: { code: "NOT_FOUND", message: "Projet introuvable" },
      });
    });

    it("should return PERMISSION_ERROR when TaskPermissionError is thrown", async () => {
      mockService.createTask.mockRejectedValue(new TaskPermissionError());

      const result = await createTaskAction(
        { projectId: "p-1", title: "Test" },
        "/path"
      );

      expect(result).toEqual({
        error: {
          code: "PERMISSION_ERROR",
          message: "Vous n'avez pas la permission d'effectuer cette action",
        },
      });
    });

    it("should return UNKNOWN_ERROR for unexpected errors", async () => {
      mockService.createTask.mockRejectedValue(new Error("DB error"));

      const result = await createTaskAction(
        { projectId: "p-1", title: "Test" },
        "/path"
      );

      expect(result).toEqual({
        error: { code: "UNKNOWN_ERROR", message: "Une erreur est survenue" },
      });
    });
  });

  describe("updateTaskAction", () => {
    it("should return success and revalidate path on success", async () => {
      mockService.updateTask.mockResolvedValue(undefined);

      const result = await updateTaskAction(
        { id: "t-1", title: "Updated" },
        "/path"
      );

      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/path");
    });

    it("should return AUTHENTICATION_ERROR when AuthError is thrown", async () => {
      mockService.updateTask.mockRejectedValue(new AuthError());

      const result = await updateTaskAction(
        { id: "t-1", title: "Test" },
        "/path"
      );

      expect(result).toEqual({
        error: { code: "AUTHENTICATION_ERROR", message: "User not logged in" },
      });
    });
  });

  describe("deleteTaskAction", () => {
    it("should return success and revalidate path on success", async () => {
      mockService.deleteTask.mockResolvedValue("project-123");

      const result = await deleteTaskAction({ id: "t-1" }, "/path");

      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/path");
    });

    it("should return NOT_FOUND when TaskNotFoundError is thrown", async () => {
      mockService.deleteTask.mockRejectedValue(new TaskNotFoundError());

      const result = await deleteTaskAction({ id: "t-1" }, "/path");

      expect(result).toEqual({
        error: { code: "NOT_FOUND", message: "Tâche introuvable" },
      });
    });
  });

  describe("updateTaskStatusAction", () => {
    it("should return success on successful update", async () => {
      mockService.updateTaskStatus.mockResolvedValue(undefined);

      const result = await updateTaskStatusAction(
        { id: "t-1", status: "done" },
        "/path"
      );

      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/path");
    });

    it("should return UNKNOWN_ERROR for unexpected errors", async () => {
      mockService.updateTaskStatus.mockRejectedValue(new Error("fail"));

      const result = await updateTaskStatusAction(
        { id: "t-1", status: "done" },
        "/path"
      );

      expect(result).toEqual({
        error: { code: "UNKNOWN_ERROR", message: "Une erreur est survenue" },
      });
    });
  });

  describe("updateTaskPriorityAction", () => {
    it("should return success on successful update", async () => {
      mockService.updateTaskPriority.mockResolvedValue(undefined);

      const result = await updateTaskPriorityAction(
        { id: "t-1", priority: "urgent" },
        "/path"
      );

      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/path");
    });
  });

  describe("updateTaskAssigneeAction", () => {
    it("should return success on successful update", async () => {
      mockService.updateTaskAssignee.mockResolvedValue(undefined);

      const result = await updateTaskAssigneeAction(
        { id: "t-1", assigneeId: "user-2" },
        "/path"
      );

      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/path");
    });
  });

  describe("updateTaskDueDateAction", () => {
    it("should return success on successful update", async () => {
      mockService.updateTaskDueDate.mockResolvedValue(undefined);

      const result = await updateTaskDueDateAction(
        { id: "t-1", dueDate: "2025-06-01" },
        "/path"
      );

      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/path");
    });
  });
});
