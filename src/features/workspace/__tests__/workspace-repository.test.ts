import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockWorkspace } from "@/test/mocks/workspace.fixtures";

// Create persistent mock functions
const mockFindFirst = vi.fn();
const mockFindMany = vi.fn();
const mockWhere = vi.fn().mockResolvedValue(undefined);
const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
const mockValues = vi.fn().mockResolvedValue(undefined);

// Use vi.hoisted to define mocks before they are hoisted
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
}));

vi.mock("@/db", () => ({
  db: mockDb,
}));

// Mock workspaces table for eq() comparisons
vi.mock("@/db/schema/workspaces", () => ({
  workspaces: { id: "id" },
  NewWorkspace: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((field, value) => ({ field, value })),
}));

// Import after mocking
import {
  createWorkspaceRepository,
  getWorkspaceBySlugRepository,
  getWorkspaceByIdRepository,
  getWorkspacesByOwnerIdRepository,
  updateWorkspaceRepository,
  deleteWorkspaceRepository,
} from "../workspace-repository";

describe("workspace-repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-setup chainable mocks after clearAllMocks
    mockDb.insert.mockReturnValue({ values: mockValues });
    mockDb.update.mockReturnValue({ set: mockSet });
    mockDb.delete.mockReturnValue({ where: mockWhere });
    mockSet.mockReturnValue({ where: mockWhere });
    mockValues.mockResolvedValue(undefined);
    mockWhere.mockResolvedValue(undefined);
  });

  describe("createWorkspaceRepository", () => {
    it("should insert a new workspace into the database", async () => {
      const workspace = {
        name: "Test",
        slug: "test",
        description: "desc",
        ownerId: "user-1",
      };

      await createWorkspaceRepository(workspace);

      expect(mockDb.insert).toHaveBeenCalled();
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
});
