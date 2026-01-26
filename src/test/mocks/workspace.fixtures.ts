import type { Workspace } from "@/features/workspace/workspace-types";

export function createMockWorkspace(
  overrides: Partial<Workspace> = {}
): Workspace {
  return {
    id: "ws-123",
    name: "Test Workspace",
    slug: "test-workspace",
    description: "A test workspace",
    ownerId: "user-123",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

export const validCreateInput = {
  name: "New Workspace",
  slug: "new-workspace",
  description: "My new workspace",
};

export const validUpdateInput = {
  id: "ws-123",
  name: "Updated Workspace",
  slug: "updated-workspace",
  description: "Updated description",
};

export const validDeleteInput = {
  id: "ws-123",
  confirmName: "Test Workspace",
};
