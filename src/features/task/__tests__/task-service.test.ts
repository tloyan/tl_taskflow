import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAuthenticatedSession } from "@/test/mocks/auth.mock";
import {
  createMockTask,
  validCreateTaskInput,
  validUpdateTaskInput,
  validDeleteTaskInput,
  mockProject,
} from "./task.fixtures";

const mockAuth = vi.hoisted(() => ({
  api: {
    getSession: vi.fn(),
  },
}));

const mockTaskRepository = vi.hoisted(() => ({
  createTaskRepository: vi.fn(),
  getTaskByIdRepository: vi.fn(),
  updateTaskRepository: vi.fn(),
  deleteTaskRepository: vi.fn(),
  getMaxPositionByStatusRepository: vi.fn(),
}));

const mockProjectRepository = vi.hoisted(() => ({
  getProjectByIdRepository: vi.fn(),
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

vi.mock("../task-repository", () => mockTaskRepository);
vi.mock("../../project/project-repository", () => mockProjectRepository);
vi.mock("../../member/member-repository", () => mockMemberRepository);

import {
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskPriority,
  updateTaskAssignee,
  updateTaskDueDate,
} from "../task-service";
import { AuthError } from "@/features/auth/auth-errors";
import {
  TaskValidationError,
  TaskNotFoundError,
  TaskPermissionError,
} from "../task-errors";

const memberOwner = { role: "owner", userId: "user-123", workspaceId: "ws-123" };
const memberMember = { role: "member", userId: "user-123", workspaceId: "ws-123" };
const memberViewer = { role: "viewer", userId: "user-123", workspaceId: "ws-123" };

describe("task-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTask", () => {
    it("should create task and return id when valid data provided", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(mockProject);
      mockMemberRepository.getMemberRepository.mockResolvedValue(memberMember);
      mockTaskRepository.getMaxPositionByStatusRepository.mockResolvedValue(3);
      mockTaskRepository.createTaskRepository.mockResolvedValue({ id: "task-new" });

      const result = await createTask(validCreateTaskInput);

      expect(result).toBe("task-new");
      expect(mockTaskRepository.createTaskRepository).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Task",
          projectId: "550e8400-e29b-41d4-a716-446655440000",
          creatorId: "user-123",
          position: 4,
        })
      );
    });

    it("should throw AuthError when session is null", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      await expect(createTask(validCreateTaskInput)).rejects.toThrow(AuthError);
    });

    it("should throw TaskValidationError when title is too short", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      await expect(
        createTask({ ...validCreateTaskInput, title: "a" })
      ).rejects.toThrow(TaskValidationError);
    });

    it("should throw TaskValidationError when projectId is invalid UUID", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      await expect(
        createTask({ ...validCreateTaskInput, projectId: "invalid" })
      ).rejects.toThrow(TaskValidationError);
    });

    it("should throw TaskNotFoundError when project does not exist", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(undefined);
      await expect(createTask(validCreateTaskInput)).rejects.toThrow(TaskNotFoundError);
    });

    it("should throw TaskPermissionError when user is not a member", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(mockProject);
      mockMemberRepository.getMemberRepository.mockResolvedValue(undefined);
      await expect(createTask(validCreateTaskInput)).rejects.toThrow(TaskPermissionError);
    });

    it("should throw TaskPermissionError when user is a viewer", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(mockProject);
      mockMemberRepository.getMemberRepository.mockResolvedValue(memberViewer);
      await expect(createTask(validCreateTaskInput)).rejects.toThrow(TaskPermissionError);
    });
  });

  describe("updateTask", () => {
    it("should update task when valid data provided", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(
        createMockTask({ id: "550e8400-e29b-41d4-a716-446655440001" })
      );
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(mockProject);
      mockMemberRepository.getMemberRepository.mockResolvedValue(memberMember);
      mockTaskRepository.updateTaskRepository.mockResolvedValue(undefined);

      await updateTask(validUpdateTaskInput);

      expect(mockTaskRepository.updateTaskRepository).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440001",
        expect.objectContaining({ title: "Updated Task" })
      );
    });

    it("should throw AuthError when session is null", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      await expect(updateTask(validUpdateTaskInput)).rejects.toThrow(AuthError);
    });

    it("should throw TaskValidationError when id is not a valid UUID", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      await expect(
        updateTask({ ...validUpdateTaskInput, id: "invalid" })
      ).rejects.toThrow(TaskValidationError);
    });

    it("should throw TaskNotFoundError when task does not exist", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(undefined);
      await expect(updateTask(validUpdateTaskInput)).rejects.toThrow(TaskNotFoundError);
    });

    it("should throw TaskPermissionError when user is a viewer", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(
        createMockTask({ id: "550e8400-e29b-41d4-a716-446655440001" })
      );
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(mockProject);
      mockMemberRepository.getMemberRepository.mockResolvedValue(memberViewer);
      await expect(updateTask(validUpdateTaskInput)).rejects.toThrow(TaskPermissionError);
    });
  });

  describe("deleteTask", () => {
    it("should delete task when user is owner", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(
        createMockTask({ id: "550e8400-e29b-41d4-a716-446655440001", creatorId: "other-user" })
      );
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(mockProject);
      mockMemberRepository.getMemberRepository.mockResolvedValue(memberOwner);
      mockTaskRepository.deleteTaskRepository.mockResolvedValue(undefined);

      const result = await deleteTask(validDeleteTaskInput);

      expect(result).toBe("project-123");
      expect(mockTaskRepository.deleteTaskRepository).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440001"
      );
    });

    it("should delete task when user is the creator and is member role", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(
        createMockTask({ id: "550e8400-e29b-41d4-a716-446655440001", creatorId: "user-123" })
      );
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(mockProject);
      mockMemberRepository.getMemberRepository.mockResolvedValue(memberMember);
      mockTaskRepository.deleteTaskRepository.mockResolvedValue(undefined);

      const result = await deleteTask(validDeleteTaskInput);

      expect(result).toBe("project-123");
    });

    it("should throw TaskPermissionError when member tries to delete another user's task", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(
        createMockTask({ id: "550e8400-e29b-41d4-a716-446655440001", creatorId: "other-user" })
      );
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(mockProject);
      mockMemberRepository.getMemberRepository.mockResolvedValue(memberMember);

      await expect(deleteTask(validDeleteTaskInput)).rejects.toThrow(TaskPermissionError);
    });

    it("should throw AuthError when session is null", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      await expect(deleteTask(validDeleteTaskInput)).rejects.toThrow(AuthError);
    });

    it("should throw TaskNotFoundError when task does not exist", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(undefined);
      await expect(deleteTask(validDeleteTaskInput)).rejects.toThrow(TaskNotFoundError);
    });
  });

  describe("updateTaskStatus", () => {
    const validInput = {
      id: "550e8400-e29b-41d4-a716-446655440001",
      status: "in_progress",
    };

    it("should update task status when valid", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(
        createMockTask({ id: validInput.id })
      );
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(mockProject);
      mockMemberRepository.getMemberRepository.mockResolvedValue(memberMember);
      mockTaskRepository.updateTaskRepository.mockResolvedValue(undefined);

      await updateTaskStatus(validInput);

      expect(mockTaskRepository.updateTaskRepository).toHaveBeenCalledWith(
        validInput.id,
        { status: "in_progress" }
      );
    });

    it("should throw AuthError when session is null", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      await expect(updateTaskStatus(validInput)).rejects.toThrow(AuthError);
    });

    it("should throw TaskValidationError when status is invalid", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      await expect(
        updateTaskStatus({ ...validInput, status: "invalid_status" })
      ).rejects.toThrow(TaskValidationError);
    });

    it("should throw TaskNotFoundError when task does not exist", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(undefined);
      await expect(updateTaskStatus(validInput)).rejects.toThrow(TaskNotFoundError);
    });
  });

  describe("updateTaskPriority", () => {
    const validInput = {
      id: "550e8400-e29b-41d4-a716-446655440001",
      priority: "urgent",
    };

    it("should update task priority when valid", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(
        createMockTask({ id: validInput.id })
      );
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(mockProject);
      mockMemberRepository.getMemberRepository.mockResolvedValue(memberMember);
      mockTaskRepository.updateTaskRepository.mockResolvedValue(undefined);

      await updateTaskPriority(validInput);

      expect(mockTaskRepository.updateTaskRepository).toHaveBeenCalledWith(
        validInput.id,
        { priority: "urgent" }
      );
    });

    it("should throw TaskValidationError when priority is invalid", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      await expect(
        updateTaskPriority({ ...validInput, priority: "invalid" })
      ).rejects.toThrow(TaskValidationError);
    });
  });

  describe("updateTaskAssignee", () => {
    const validInput = {
      id: "550e8400-e29b-41d4-a716-446655440001",
      assigneeId: "550e8400-e29b-41d4-a716-446655440002",
    };

    it("should update task assignee when valid", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(
        createMockTask({ id: validInput.id })
      );
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(mockProject);
      mockMemberRepository.getMemberRepository
        .mockResolvedValueOnce(memberMember)
        .mockResolvedValueOnce({ role: "member", userId: "550e8400-e29b-41d4-a716-446655440002", workspaceId: "ws-123" });
      mockTaskRepository.updateTaskRepository.mockResolvedValue(undefined);

      await updateTaskAssignee(validInput);

      expect(mockTaskRepository.updateTaskRepository).toHaveBeenCalledWith(
        validInput.id,
        { assigneeId: "550e8400-e29b-41d4-a716-446655440002" }
      );
    });

    it("should allow setting assignee to null", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(
        createMockTask({ id: validInput.id })
      );
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(mockProject);
      mockMemberRepository.getMemberRepository.mockResolvedValue(memberMember);
      mockTaskRepository.updateTaskRepository.mockResolvedValue(undefined);

      await updateTaskAssignee({ id: validInput.id, assigneeId: null });

      expect(mockTaskRepository.updateTaskRepository).toHaveBeenCalledWith(
        validInput.id,
        { assigneeId: null }
      );
    });
  });

  describe("updateTaskDueDate", () => {
    const validInput = {
      id: "550e8400-e29b-41d4-a716-446655440001",
      dueDate: "2025-06-01",
    };

    it("should update task due date when valid", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(
        createMockTask({ id: validInput.id })
      );
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(mockProject);
      mockMemberRepository.getMemberRepository.mockResolvedValue(memberMember);
      mockTaskRepository.updateTaskRepository.mockResolvedValue(undefined);

      await updateTaskDueDate(validInput);

      expect(mockTaskRepository.updateTaskRepository).toHaveBeenCalledWith(
        validInput.id,
        { dueDate: expect.any(Date) }
      );
    });

    it("should allow setting dueDate to null", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(
        createMockTask({ id: validInput.id })
      );
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(mockProject);
      mockMemberRepository.getMemberRepository.mockResolvedValue(memberMember);
      mockTaskRepository.updateTaskRepository.mockResolvedValue(undefined);

      await updateTaskDueDate({ id: validInput.id, dueDate: null });

      expect(mockTaskRepository.updateTaskRepository).toHaveBeenCalledWith(
        validInput.id,
        { dueDate: null }
      );
    });

    it("should throw AuthError when session is null", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      await expect(updateTaskDueDate(validInput)).rejects.toThrow(AuthError);
    });
  });
});
