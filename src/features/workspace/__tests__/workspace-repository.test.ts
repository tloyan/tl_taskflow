import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockWorkspace } from "@/test/mocks/workspace.fixtures";

// Create persistent mock functions
const mockFindFirst = vi.fn();
const mockFindMany = vi.fn();
const mockReturning = vi.fn().mockResolvedValue([{ id: "ws-123" }]);
const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
const mockValues = vi.fn().mockResolvedValue(undefined);

// Use vi.hoisted to define mocks before they are hoisted
const mockGroupBy = vi.fn();
const mockSelectWhere = vi.fn();
const mockLeftJoin = vi.fn();
const mockSelectFrom = vi.fn();
const mockSelect = vi.fn();

const mockDb = vi.hoisted(() => ({
  query: {
    workspaces: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
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

// Mock workspaces table for eq() comparisons
vi.mock("@/db/schema/workspaces", () => ({
  workspaces: { id: "id", name: "name", slug: "slug", description: "description", ownerId: "ownerId", createdAt: "createdAt", updatedAt: "updatedAt" },
  NewWorkspace: {},
}));

vi.mock("@/db/schema/workspace-members", () => ({
  workspaceMembers: { workspaceId: "workspaceId", userId: "userId" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((field, value) => ({ field, value })),
  inArray: vi.fn((field, values) => ({ field, values })),
  count: vi.fn((field) => ({ fn: "count", field })),
}));

// Import after mocking
import {
  createWorkspaceRepository,
  getWorkspaceBySlugRepository,
  getWorkspaceByIdRepository,
  getWorkspacesByOwnerIdRepository,
  updateWorkspaceRepository,
  deleteWorkspaceRepository,
  getWorkspacesWithCountsByUserIdRepository,
} from "../workspace-repository";

describe("workspace-repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-setup chainable mocks after clearAllMocks
    mockDb.insert.mockReturnValue({ values: mockValues });
    mockDb.update.mockReturnValue({ set: mockSet });
    mockDb.delete.mockReturnValue({ where: mockWhere });
    mockSet.mockReturnValue({ where: mockWhere });
    mockValues.mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: "ws-new" }]) });
    mockReturning.mockResolvedValue([{ id: "ws-123" }]);
    mockWhere.mockReturnValue({ returning: mockReturning });
    // Setup select chain: select().from().where() and select().from().leftJoin().where().groupBy()
    mockGroupBy.mockResolvedValue([]);
    mockSelectWhere.mockReturnValue({ groupBy: mockGroupBy });
    mockLeftJoin.mockReturnValue({ where: mockSelectWhere });
    mockSelectFrom.mockReturnValue({ where: vi.fn().mockResolvedValue([]), leftJoin: mockLeftJoin });
    mockDb.select.mockReturnValue({ from: mockSelectFrom });
  });

  describe("createWorkspaceRepository", () => {
    it("should insert a new workspace into the database", async () => {
      const workspace = {
        name: "Test",
        slug: "test",
        description: "desc",
        ownerId: "user-1",
      };

      const result = await createWorkspaceRepository(workspace);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual({ id: "ws-new" });
    });
  });

  describe("getWorkspaceBySlugRepository", () => {
    it("should return workspace when slug exists", async () => {
      const mockWorkspace = createMockWorkspace();
      mockDb.query.workspaces.findFirst.mockResolvedValue(mockWorkspace);

      const result = await getWorkspaceBySlugRepository("test-workspace");

      expect(result).toEqual(mockWorkspace);
      expect(mockDb.query.workspaces.findFirst).toHaveBeenCalledWith({
        where: { slug: "test-workspace" },
      });
    });

    it("should return undefined when slug does not exist", async () => {
      mockDb.query.workspaces.findFirst.mockResolvedValue(undefined);

      const result = await getWorkspaceBySlugRepository("nonexistent");

      expect(result).toBeUndefined();
    });
  });

  describe("getWorkspaceByIdRepository", () => {
    it("should return workspace when id exists", async () => {
      const mockWorkspace = createMockWorkspace();
      mockDb.query.workspaces.findFirst.mockResolvedValue(mockWorkspace);

      const result = await getWorkspaceByIdRepository("ws-123");

      expect(result).toEqual(mockWorkspace);
      expect(mockDb.query.workspaces.findFirst).toHaveBeenCalledWith({
        where: { id: "ws-123" },
      });
    });

    it("should return undefined when id does not exist", async () => {
      mockDb.query.workspaces.findFirst.mockResolvedValue(undefined);

      const result = await getWorkspaceByIdRepository("nonexistent");

      expect(result).toBeUndefined();
    });
  });

  describe("getWorkspacesByOwnerIdRepository", () => {
    it("should return all workspaces for the owner", async () => {
      const mockWorkspaces = [
        createMockWorkspace({ id: "ws-1" }),
        createMockWorkspace({ id: "ws-2" }),
      ];
      mockDb.query.workspaces.findMany.mockResolvedValue(mockWorkspaces);

      const result = await getWorkspacesByOwnerIdRepository("user-123");

      expect(result).toEqual(mockWorkspaces);
      expect(mockDb.query.workspaces.findMany).toHaveBeenCalledWith({
        where: { ownerId: "user-123" },
      });
    });

    it("should return empty array when owner has no workspaces", async () => {
      mockDb.query.workspaces.findMany.mockResolvedValue([]);

      const result = await getWorkspacesByOwnerIdRepository("user-no-ws");

      expect(result).toEqual([]);
    });
  });

  describe("updateWorkspaceRepository", () => {
    it("should update workspace with correct data", async () => {
      const updateData = {
        name: "Updated",
        slug: "updated",
        description: "Updated desc",
      };

      await updateWorkspaceRepository("ws-123", updateData);

      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe("deleteWorkspaceRepository", () => {
    it("should delete workspace by id", async () => {
      await deleteWorkspaceRepository("ws-123");

      expect(mockDb.delete).toHaveBeenCalled();
    });
  });

  describe("getWorkspacesWithCountsByUserIdRepository", () => {
    it("should return empty array when user has no memberships", async () => {
      const mockFromWhere = vi.fn().mockResolvedValue([]);
      mockSelectFrom.mockReturnValue({ where: mockFromWhere, leftJoin: mockLeftJoin });

      const result = await getWorkspacesWithCountsByUserIdRepository("user-1");

      expect(result).toEqual([]);
    });

    it("should return workspaces with member counts", async () => {
      const mockFromWhere = vi.fn().mockResolvedValue([{ workspaceId: "ws-1" }]);
      mockSelectFrom.mockReturnValueOnce({ where: mockFromWhere, leftJoin: mockLeftJoin });

      mockGroupBy.mockResolvedValue([
        {
          id: "ws-1",
          name: "Test",
          slug: "test",
          description: null,
          ownerId: "user-1",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          membersCount: 3,
        },
      ]);

      const result = await getWorkspacesWithCountsByUserIdRepository("user-1");

      expect(result).toEqual([
        {
          id: "ws-1",
          name: "Test",
          slug: "test",
          description: null,
          ownerId: "user-1",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          membersCount: 3,
        },
      ]);
    });
  });
});
