import { describe, it, expect, vi, beforeEach } from "vitest";

const mockService = vi.hoisted(() => ({
  createComment: vi.fn(),
  deleteComment: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("../comment-service", () => mockService);

import { createCommentAction, deleteCommentAction } from "../comment-actions";
import { revalidatePath } from "next/cache";
import { AuthError } from "@/features/auth/auth-errors";
import {
  CommentValidationError,
  CommentNotFoundError,
  CommentPermissionError,
} from "../comment-errors";

describe("comment-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCommentAction", () => {
    it("should return success and revalidate path on success", async () => {
      mockService.createComment.mockResolvedValue("comment-new");

      const result = await createCommentAction(
        { taskId: "task-1", content: "Hello" },
        "/w/test/p/project-1"
      );

      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/w/test/p/project-1");
    });

    it("should return AUTHENTICATION_ERROR when AuthError is thrown", async () => {
      mockService.createComment.mockRejectedValue(new AuthError());

      const result = await createCommentAction(
        { taskId: "task-1", content: "Hello" },
        "/path"
      );

      expect(result).toEqual({
        error: { code: "AUTHENTICATION_ERROR", message: "User not logged in" },
      });
    });

    it("should return VALIDATION_ERROR with field when CommentValidationError is thrown", async () => {
      mockService.createComment.mockRejectedValue(
        new CommentValidationError("content", "Le commentaire est requis")
      );

      const result = await createCommentAction(
        { taskId: "task-1", content: "" },
        "/path"
      );

      expect(result).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          field: "content",
          message: "Le commentaire est requis",
        },
      });
    });

    it("should return NOT_FOUND when CommentNotFoundError is thrown", async () => {
      mockService.createComment.mockRejectedValue(
        new CommentNotFoundError("Tâche introuvable")
      );

      const result = await createCommentAction(
        { taskId: "task-1", content: "Hello" },
        "/path"
      );

      expect(result).toEqual({
        error: { code: "NOT_FOUND", message: "Tâche introuvable" },
      });
    });

    it("should return PERMISSION_ERROR when CommentPermissionError is thrown", async () => {
      mockService.createComment.mockRejectedValue(
        new CommentPermissionError()
      );

      const result = await createCommentAction(
        { taskId: "task-1", content: "Hello" },
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
      mockService.createComment.mockRejectedValue(new Error("DB error"));

      const result = await createCommentAction(
        { taskId: "task-1", content: "Hello" },
        "/path"
      );

      expect(result).toEqual({
        error: { code: "UNKNOWN_ERROR", message: "Une erreur est survenue" },
      });
    });
  });

  describe("deleteCommentAction", () => {
    it("should return success and revalidate path on success", async () => {
      mockService.deleteComment.mockResolvedValue(undefined);

      const result = await deleteCommentAction(
        { id: "comment-1" },
        "/w/test/p/project-1"
      );

      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/w/test/p/project-1");
    });

    it("should return AUTHENTICATION_ERROR when AuthError is thrown", async () => {
      mockService.deleteComment.mockRejectedValue(new AuthError());

      const result = await deleteCommentAction({ id: "comment-1" }, "/path");

      expect(result).toEqual({
        error: { code: "AUTHENTICATION_ERROR", message: "User not logged in" },
      });
    });

    it("should return NOT_FOUND when CommentNotFoundError is thrown", async () => {
      mockService.deleteComment.mockRejectedValue(new CommentNotFoundError());

      const result = await deleteCommentAction({ id: "comment-1" }, "/path");

      expect(result).toEqual({
        error: { code: "NOT_FOUND", message: "Commentaire introuvable" },
      });
    });

    it("should return PERMISSION_ERROR when CommentPermissionError is thrown", async () => {
      mockService.deleteComment.mockRejectedValue(
        new CommentPermissionError()
      );

      const result = await deleteCommentAction({ id: "comment-1" }, "/path");

      expect(result).toEqual({
        error: {
          code: "PERMISSION_ERROR",
          message: "Vous n'avez pas la permission d'effectuer cette action",
        },
      });
    });

    it("should return UNKNOWN_ERROR for unexpected errors", async () => {
      mockService.deleteComment.mockRejectedValue(new Error("Unexpected"));

      const result = await deleteCommentAction({ id: "comment-1" }, "/path");

      expect(result).toEqual({
        error: { code: "UNKNOWN_ERROR", message: "Une erreur est survenue" },
      });
    });
  });
});
