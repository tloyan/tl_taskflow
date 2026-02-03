import type { Project } from "../project-types";

export function createMockProject(
  overrides: Partial<Project> = {}
): Project {
  return {
    id: "project-123",
    name: "Test Project",
    description: "A test project",
    workspaceId: "ws-123",
    color: "#3b82f6",
    status: "active",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

export const validCreateProjectInput = {
  workspaceId: "550e8400-e29b-41d4-a716-446655440000",
  name: "New Project",
  description: "A new project",
  color: "#3b82f6",
};

export const validUpdateProjectInput = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  name: "Updated Project",
  description: "Updated description",
  color: "#ef4444",
};

export const validDeleteProjectInput = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  confirmName: "Test Project",
};

export const validArchiveProjectInput = {
  id: "550e8400-e29b-41d4-a716-446655440001",
};
