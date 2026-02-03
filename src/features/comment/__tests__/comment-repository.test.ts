import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockComment, createMockCommentWithAuthor } from "./comment.fixtures";

const mockReturning = vi.fn().mockResolvedValue([{ id: "comment-123" }]);
const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
const mockValues = vi.fn();
const mockOrderBy = vi.fn();
const mockInnerJoinWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
const mockInnerJoin = vi.fn().mockReturnValue({ where: mockInnerJoinWhere });
const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin });

const mockDb = vi.hoisted(() => ({
  query: {
    comments: {
      findFirst: vi.fn(),
    },
  },
  insert: vi.fn(),
  delete: vi.fn(),
  select: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: mockDb,
}));

vi.mock("@/db/schema/comments", () => ({
  comments: {
    id: "id",
    content: "content",
    taskId: "taskId",
    authorId: "authorId",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
  NewComment: {},
}));

vi.mock("@/db/schema/auth-schema", () => ({
  user: {
    id: "id",
    name: "name",
    email: "email",
    image: "image",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((field, value) => ({ field, value })),
  desc: vi.fn((field) => ({ fn: "desc", field })),
}));

import {
  createCommentRepository,
  getCommentByIdRepository,
  getCommentsByTaskIdRepository,
  deleteCommentRepository,
} from "../comment-repository";

describe("comment-repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.insert.mockReturnValue({ values: mockValues });
    mockValues.mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ id: "comment-new" }]),
    });
    mockDb.delete.mockReturnValue({ where: mockWhere });
    mockReturning.mockResolvedValue([{ id: "comment-123" }]);
    mockWhere.mockReturnValue({ returning: mockReturning });
    mockOrderBy.mockResolvedValue([]);
    mockInnerJoinWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockInnerJoin.mockReturnValue({ where: mockInnerJoinWhere });
    mockFrom.mockReturnValue({ innerJoin: mockInnerJoin });
    mockDb.select.mockReturnValue({ from: mockFrom });
  });

  describe("createCommentRepository", () => {
    it("should insert a new comment and return id", async () => {
      const result = await createCommentRepository({
        content: "Test",
        taskId: "task-1",
        authorId: "user-1",
      });

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual({ id: "comment-new" });
    });
  });

  describe("getCommentByIdRepository", () => {
    it("should return comment when id exists", async () => {
      const mockComment = createMockComment();
      mockDb.query.comments.findFirst.mockResolvedValue(mockComment);

      const result = await getCommentByIdRepository("comment-123");

      expect(result).toEqual(mockComment);
      expect(mockDb.query.comments.findFirst).toHaveBeenCalledWith({
        where: { id: "comment-123" },
      });
    });

    it("should return undefined when id does not exist", async () => {
      mockDb.query.comments.findFirst.mockResolvedValue(undefined);

      const result = await getCommentByIdRepository("nonexistent");

      expect(result).toBeUndefined();
    });
  });

  describe("getCommentsByTaskIdRepository", () => {
    it("should return comments for a task with author details", async () => {
      const mockComments = [createMockCommentWithAuthor()];
      mockOrderBy.mockResolvedValue(mockComments);

      const result = await getCommentsByTaskIdRepository("task-123");

      expect(result).toEqual(mockComments);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it("should return empty array when task has no comments", async () => {
      mockOrderBy.mockResolvedValue([]);

      const result = await getCommentsByTaskIdRepository("task-no-comments");

      expect(result).toEqual([]);
    });
  });

  describe("deleteCommentRepository", () => {
    it("should delete comment by id", async () => {
      await deleteCommentRepository("comment-123");

      expect(mockDb.delete).toHaveBeenCalled();
    });
  });
});
