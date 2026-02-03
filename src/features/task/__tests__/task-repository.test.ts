import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockTask } from "./task.fixtures";

const mockReturning = vi.fn().mockResolvedValue([{ id: "task-123" }]);
const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
const mockValues = vi.fn();
const mockOrderBy = vi.fn();
const mockLeftJoinWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
const mockLeftJoin = vi.fn().mockReturnValue({ where: mockLeftJoinWhere });
const mockFrom = vi.fn().mockReturnValue({ leftJoin: mockLeftJoin, where: vi.fn() });

const mockDb = vi.hoisted(() => ({
  query: {
    tasks: {
      findFirst: vi.fn(),
    },
  },
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  select: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: mockDb,
}));

vi.mock("@/db/schema/tasks", () => ({
  tasks: {
    id: "id",
    title: "title",
    description: "description",
    projectId: "projectId",
    assigneeId: "assigneeId",
    creatorId: "creatorId",
    status: "status",
    priority: "priority",
    dueDate: "dueDate",
    position: "position",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
  NewTask: {},
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
  and: vi.fn((...args) => ({ fn: "and", args })),
  desc: vi.fn((field) => ({ fn: "desc", field })),
  max: vi.fn((field) => ({ fn: "max", field })),
}));

import {
  createTaskRepository,
  getTaskByIdRepository,
  updateTaskRepository,
  deleteTaskRepository,
  getMaxPositionByStatusRepository,
} from "../task-repository";

describe("task-repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.insert.mockReturnValue({ values: mockValues });
    mockValues.mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ id: "task-new" }]),
    });
    mockDb.update.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockWhere });
    mockDb.delete.mockReturnValue({ where: mockWhere });
    mockReturning.mockResolvedValue([{ id: "task-123" }]);
    mockWhere.mockReturnValue({ returning: mockReturning });
    mockOrderBy.mockResolvedValue([]);
    mockLeftJoinWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockLeftJoin.mockReturnValue({ where: mockLeftJoinWhere });
    mockFrom.mockReturnValue({ leftJoin: mockLeftJoin, where: vi.fn().mockResolvedValue([]) });
    mockDb.select.mockReturnValue({ from: mockFrom });
  });

  describe("createTaskRepository", () => {
    it("should insert a new task and return id", async () => {
      const result = await createTaskRepository({
        title: "Test",
        projectId: "p-1",
        creatorId: "u-1",
        status: "todo",
        priority: "medium",
        position: 1,
        assigneeId: null,
        dueDate: null,
      });

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual({ id: "task-new" });
    });
  });

  describe("getTaskByIdRepository", () => {
    it("should return task when id exists", async () => {
      const mockTask = createMockTask();
      mockDb.query.tasks.findFirst.mockResolvedValue(mockTask);

      const result = await getTaskByIdRepository("task-123");

      expect(result).toEqual(mockTask);
      expect(mockDb.query.tasks.findFirst).toHaveBeenCalledWith({
        where: { id: "task-123" },
      });
    });

    it("should return undefined when id does not exist", async () => {
      mockDb.query.tasks.findFirst.mockResolvedValue(undefined);

      const result = await getTaskByIdRepository("nonexistent");

      expect(result).toBeUndefined();
    });
  });

  describe("updateTaskRepository", () => {
    it("should update task with correct data", async () => {
      await updateTaskRepository("task-123", {
        title: "Updated",
        status: "done",
      });

      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe("deleteTaskRepository", () => {
    it("should delete task by id", async () => {
      await deleteTaskRepository("task-123");

      expect(mockDb.delete).toHaveBeenCalled();
    });
  });

  describe("getMaxPositionByStatusRepository", () => {
    it("should return max position for given project and status", async () => {
      const mockFromWhere = vi.fn().mockResolvedValue([{ maxPos: 5 }]);
      mockFrom.mockReturnValue({ where: mockFromWhere });

      const result = await getMaxPositionByStatusRepository("p-1", "todo");

      expect(result).toBe(5);
    });

    it("should return 0 when no tasks exist", async () => {
      const mockFromWhere = vi.fn().mockResolvedValue([{ maxPos: null }]);
      mockFrom.mockReturnValue({ where: mockFromWhere });

      const result = await getMaxPositionByStatusRepository("p-1", "todo");

      expect(result).toBe(0);
    });
  });
});
