import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAuthenticatedSession } from "@/test/mocks/auth.mock";
import {
  createMockComment,
  validCreateCommentInput,
  validDeleteCommentInput,
} from "./comment.fixtures";

const mockAuth = vi.hoisted(() => ({
  api: {
    getSession: vi.fn(),
  },
}));

const mockCommentRepository = vi.hoisted(() => ({
  createCommentRepository: vi.fn(),
  getCommentByIdRepository: vi.fn(),
  deleteCommentRepository: vi.fn(),
}));

const mockTaskRepository = vi.hoisted(() => ({
  getTaskByIdRepository: vi.fn(),
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

vi.mock("../comment-repository", () => mockCommentRepository);
vi.mock("../../task/task-repository", () => mockTaskRepository);
vi.mock("../../project/project-repository", () => mockProjectRepository);
vi.mock("../../member/member-repository", () => mockMemberRepository);

import { createComment, deleteComment } from "../comment-service";
import { AuthError } from "@/features/auth/auth-errors";
import {
  CommentValidationError,
  CommentNotFoundError,
  CommentPermissionError,
} from "../comment-errors";

const mockTask = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  projectId: "project-123",
  title: "Test Task",
  creatorId: "user-123",
  status: "todo",
  priority: "medium",
  position: 1,
  assigneeId: null,
  description: null,
  dueDate: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockProject = {
  id: "project-123",
  name: "Test Project",
  workspaceId: "ws-123",
  description: null,
  color: "#000000",
  status: "active",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("comment-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createComment", () => {
    it("should create comment and return id when valid data provided", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(mockTask);
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(mockProject);
      mockMemberRepository.getMemberRepository.mockResolvedValue({
        role: "member",
        userId: "user-123",
        workspaceId: "ws-123",
      });
      mockCommentRepository.createCommentRepository.mockResolvedValue({
        id: "comment-new",
      });

      const result = await createComment(validCreateCommentInput);

      expect(result).toBe("comment-new");
      expect(mockCommentRepository.createCommentRepository).toHaveBeenCalledWith({
        content: "Un nouveau commentaire",
        taskId: "550e8400-e29b-41d4-a716-446655440000",
        authorId: "user-123",
      });
    });

    it("should throw AuthError when session is null", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      await expect(createComment(validCreateCommentInput)).rejects.toThrow(
        AuthError
      );
    });

    it("should throw CommentValidationError when taskId is not a valid UUID", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());

      await expect(
        createComment({ ...validCreateCommentInput, taskId: "invalid" })
      ).rejects.toThrow(CommentValidationError);
    });

    it("should throw CommentValidationError when content is empty", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());

      await expect(
        createComment({ ...validCreateCommentInput, content: "" })
      ).rejects.toThrow(CommentValidationError);
    });

    it("should throw CommentNotFoundError when task does not exist", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(undefined);

      await expect(createComment(validCreateCommentInput)).rejects.toThrow(
        CommentNotFoundError
      );
    });

    it("should throw CommentNotFoundError when project does not exist", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(mockTask);
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(undefined);

      await expect(createComment(validCreateCommentInput)).rejects.toThrow(
        CommentNotFoundError
      );
    });

    it("should throw CommentPermissionError when user is not a member", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(mockTask);
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(mockProject);
      mockMemberRepository.getMemberRepository.mockResolvedValue(undefined);

      await expect(createComment(validCreateCommentInput)).rejects.toThrow(
        CommentPermissionError
      );
    });

    it("should throw CommentPermissionError when user is a viewer", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(mockTask);
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(mockProject);
      mockMemberRepository.getMemberRepository.mockResolvedValue({
        role: "viewer",
        userId: "user-123",
        workspaceId: "ws-123",
      });

      await expect(createComment(validCreateCommentInput)).rejects.toThrow(
        CommentPermissionError
      );
    });
  });

  describe("deleteComment", () => {
    const mockComment = createMockComment({
      id: "550e8400-e29b-41d4-a716-446655440001",
      taskId: "550e8400-e29b-41d4-a716-446655440000",
      authorId: "user-123",
    });

    it("should delete comment when user is the author", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockCommentRepository.getCommentByIdRepository.mockResolvedValue(mockComment);
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(mockTask);
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(mockProject);
      mockMemberRepository.getMemberRepository.mockResolvedValue({
        role: "member",
        userId: "user-123",
        workspaceId: "ws-123",
      });
      mockCommentRepository.deleteCommentRepository.mockResolvedValue(undefined);

      await deleteComment(validDeleteCommentInput);

      expect(mockCommentRepository.deleteCommentRepository).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440001"
      );
    });

    it("should delete comment when user is owner (not author)", async () => {
      mockAuth.api.getSession.mockResolvedValue(
        mockAuthenticatedSession("other-user")
      );
      mockCommentRepository.getCommentByIdRepository.mockResolvedValue(mockComment);
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(mockTask);
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(mockProject);
      mockMemberRepository.getMemberRepository.mockResolvedValue({
        role: "owner",
        userId: "other-user",
        workspaceId: "ws-123",
      });
      mockCommentRepository.deleteCommentRepository.mockResolvedValue(undefined);

      await deleteComment(validDeleteCommentInput);

      expect(mockCommentRepository.deleteCommentRepository).toHaveBeenCalled();
    });

    it("should delete comment when user is admin (not author)", async () => {
      mockAuth.api.getSession.mockResolvedValue(
        mockAuthenticatedSession("other-user")
      );
      mockCommentRepository.getCommentByIdRepository.mockResolvedValue(mockComment);
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(mockTask);
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(mockProject);
      mockMemberRepository.getMemberRepository.mockResolvedValue({
        role: "admin",
        userId: "other-user",
        workspaceId: "ws-123",
      });
      mockCommentRepository.deleteCommentRepository.mockResolvedValue(undefined);

      await deleteComment(validDeleteCommentInput);

      expect(mockCommentRepository.deleteCommentRepository).toHaveBeenCalled();
    });

    it("should throw AuthError when session is null", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      await expect(deleteComment(validDeleteCommentInput)).rejects.toThrow(
        AuthError
      );
    });

    it("should throw CommentValidationError when id is not a valid UUID", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());

      await expect(
        deleteComment({ id: "invalid" })
      ).rejects.toThrow(CommentValidationError);
    });

    it("should throw CommentNotFoundError when comment does not exist", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockCommentRepository.getCommentByIdRepository.mockResolvedValue(undefined);

      await expect(deleteComment(validDeleteCommentInput)).rejects.toThrow(
        CommentNotFoundError
      );
    });

    it("should throw CommentPermissionError when user is not author and is a regular member", async () => {
      mockAuth.api.getSession.mockResolvedValue(
        mockAuthenticatedSession("other-user")
      );
      mockCommentRepository.getCommentByIdRepository.mockResolvedValue(mockComment);
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(mockTask);
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(mockProject);
      mockMemberRepository.getMemberRepository.mockResolvedValue({
        role: "member",
        userId: "other-user",
        workspaceId: "ws-123",
      });

      await expect(deleteComment(validDeleteCommentInput)).rejects.toThrow(
        CommentPermissionError
      );
    });

    it("should throw CommentPermissionError when user is not a member", async () => {
      mockAuth.api.getSession.mockResolvedValue(mockAuthenticatedSession());
      mockCommentRepository.getCommentByIdRepository.mockResolvedValue(mockComment);
      mockTaskRepository.getTaskByIdRepository.mockResolvedValue(mockTask);
      mockProjectRepository.getProjectByIdRepository.mockResolvedValue(mockProject);
      mockMemberRepository.getMemberRepository.mockResolvedValue(undefined);

      await expect(deleteComment(validDeleteCommentInput)).rejects.toThrow(
        CommentPermissionError
      );
    });
  });
});
