import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockProject } from "./project.fixtures";

const mockWhere = vi.fn().mockResolvedValue(undefined);
const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
const mockValues = vi.fn();
const mockSelectFromWhere = vi.fn();
const mockSelectFrom = vi.fn();

const mockDb = vi.hoisted(() => ({
  query: {
    projects: {
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

vi.mock("@/db/schema/projects", () => ({
  projects: {
    id: "id",
    name: "name",
    description: "description",
    workspaceId: "workspaceId",
    color: "color",
    status: "status",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
  NewProject: {},
}));

vi.mock("@/db/schema/workspace-members", () => ({
  workspaceMembers: { workspaceId: "workspaceId", userId: "userId" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((field, value) => ({ field, value })),
}));

import {
  createProjectRepository,
  getProjectByIdRepository,
  getProjectsByWorkspaceIdRepository,
  updateProjectRepository,
  deleteProjectRepository,
  archiveProjectRepository,
  unarchiveProjectRepository,
} from "../project-repository";

describe("project-repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.insert.mockReturnValue({ values: mockValues });
    mockValues.mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ id: "project-new" }]),
    });
    mockDb.update.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockWhere });
    mockDb.delete.mockReturnValue({ where: mockWhere });
    mockWhere.mockResolvedValue(undefined);
    mockSelectFrom.mockReturnValue({ where: mockSelectFromWhere });
    mockDb.select.mockReturnValue({ from: mockSelectFrom });
    mockSelectFromWhere.mockResolvedValue([]);
  });

  describe("createProjectRepository", () => {
    it("should insert a new project and return id", async () => {
      const result = await createProjectRepository({
        name: "Test",
        workspaceId: "ws-1",
        color: "#000",
      });

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual({ id: "project-new" });
    });
  });

  describe("getProjectByIdRepository", () => {
    it("should return project when id exists", async () => {
      const mockProject = createMockProject();
      mockDb.query.projects.findFirst.mockResolvedValue(mockProject);

      const result = await getProjectByIdRepository("project-123");

      expect(result).toEqual(mockProject);
      expect(mockDb.query.projects.findFirst).toHaveBeenCalledWith({
        where: { id: "project-123" },
      });
    });

    it("should return undefined when id does not exist", async () => {
      mockDb.query.projects.findFirst.mockResolvedValue(undefined);

      const result = await getProjectByIdRepository("nonexistent");

      expect(result).toBeUndefined();
    });
  });

  describe("getProjectsByWorkspaceIdRepository", () => {
    it("should return all projects for the workspace", async () => {
      const mockProjects = [
        createMockProject({ id: "p-1" }),
        createMockProject({ id: "p-2" }),
      ];
      mockDb.query.projects.findMany.mockResolvedValue(mockProjects);

      const result = await getProjectsByWorkspaceIdRepository("ws-123");

      expect(result).toEqual(mockProjects);
    });

    it("should return empty array when workspace has no projects", async () => {
      mockDb.query.projects.findMany.mockResolvedValue([]);

      const result = await getProjectsByWorkspaceIdRepository("ws-empty");

      expect(result).toEqual([]);
    });
  });

  describe("updateProjectRepository", () => {
    it("should update project with correct data", async () => {
      await updateProjectRepository("project-123", {
        name: "Updated",
        description: "Updated desc",
        color: "#fff",
      });

      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe("deleteProjectRepository", () => {
    it("should delete project by id", async () => {
      await deleteProjectRepository("project-123");

      expect(mockDb.delete).toHaveBeenCalled();
    });
  });

  describe("archiveProjectRepository", () => {
    it("should set project status to archived", async () => {
      await archiveProjectRepository("project-123");

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({ status: "archived" });
    });
  });

  describe("unarchiveProjectRepository", () => {
    it("should set project status to active", async () => {
      await unarchiveProjectRepository("project-123");

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({ status: "active" });
    });
  });
});
