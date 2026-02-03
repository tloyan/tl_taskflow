import type { Task, TaskWithAssignee } from "../task-types";

export function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-123",
    title: "Test Task",
    description: "A test task",
    projectId: "project-123",
    assigneeId: null,
    creatorId: "user-123",
    status: "todo",
    priority: "medium",
    dueDate: null,
    position: 1,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

export function createMockTaskWithAssignee(
  overrides: Partial<TaskWithAssignee> = {}
): TaskWithAssignee {
  return {
    ...createMockTask(),
    assignee: null,
    ...overrides,
  };
}

export const validCreateTaskInput = {
  projectId: "550e8400-e29b-41d4-a716-446655440000",
  title: "New Task",
  description: "A new task",
  status: "todo",
  priority: "medium",
};

export const validUpdateTaskInput = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  title: "Updated Task",
  description: "Updated description",
  status: "in_progress",
  priority: "high",
};

export const validDeleteTaskInput = {
  id: "550e8400-e29b-41d4-a716-446655440001",
};

export const mockProject = {
  id: "project-123",
  name: "Test Project",
  workspaceId: "ws-123",
  description: null,
  color: "#000000",
  status: "active",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};
