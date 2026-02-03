import type { Comment, CommentWithAuthor } from "../comment-types";

export function createMockComment(
  overrides: Partial<Comment> = {}
): Comment {
  return {
    id: "comment-123",
    content: "Un commentaire de test",
    taskId: "task-123",
    authorId: "user-123",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

export function createMockCommentWithAuthor(
  overrides: Partial<CommentWithAuthor> = {}
): CommentWithAuthor {
  return {
    ...createMockComment(),
    author: {
      id: "user-123",
      name: "Test User",
      email: "test@example.com",
      image: null,
    },
    ...overrides,
  };
}

export const validCreateCommentInput = {
  taskId: "550e8400-e29b-41d4-a716-446655440000",
  content: "Un nouveau commentaire",
};

export const validDeleteCommentInput = {
  id: "550e8400-e29b-41d4-a716-446655440001",
};
