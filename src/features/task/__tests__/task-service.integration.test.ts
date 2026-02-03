import { describe, it, expect, beforeEach } from "vitest";
import { setupAuthMock } from "@/test/helpers/auth.integration";
import {
  createTestUser,
  createTestWorkspace,
  createTestMember,
  createTestProject,
  createTestTask,
} from "@/test/factories";
import { testDb } from "@/test/helpers/test-db";
import { tasks } from "@/db/schema/tasks";
import { eq } from "drizzle-orm";
import { TaskPermissionError } from "../task-errors";

const { setSession, clearSession } = setupAuthMock();

const {
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskAssignee,
} = await import("../task-service");

describe("Task Service (integration)", () => {
  beforeEach(() => {
    clearSession();
  });

  describe("createTask", () => {
    it("member peut créer une tâche", async () => {
      const owner = await createTestUser();
      const member = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: member.id,
        role: "member",
      });
      const project = await createTestProject({
        workspaceId: workspace.id,
      });

      setSession(member);

      const taskId = await createTask({
        projectId: project.id,
        title: "Ma tâche",
        description: "Description",
        status: "backlog",
        priority: "medium",
      });

      expect(taskId).toBeDefined();

      const created = await testDb.query.tasks.findFirst({
        where: { id: taskId },
      });
      expect(created).toBeDefined();
      expect(created!.title).toBe("Ma tâche");
      expect(created!.creatorId).toBe(member.id);
    });

    it("viewer ne peut pas créer une tâche", async () => {
      const owner = await createTestUser();
      const viewer = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: viewer.id,
        role: "viewer",
      });
      const project = await createTestProject({
        workspaceId: workspace.id,
      });

      setSession(viewer);

      await expect(
        createTask({
          projectId: project.id,
          title: "Interdit",
          status: "backlog",
          priority: "medium",
        })
      ).rejects.toThrow(TaskPermissionError);
    });

    it("non-membre ne peut pas créer une tâche", async () => {
      const owner = await createTestUser();
      const outsider = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      const project = await createTestProject({
        workspaceId: workspace.id,
      });

      setSession(outsider);

      await expect(
        createTask({
          projectId: project.id,
          title: "Interdit",
          status: "backlog",
          priority: "medium",
        })
      ).rejects.toThrow(TaskPermissionError);
    });

    it("la position est auto-incrémentée", async () => {
      const owner = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      const project = await createTestProject({
        workspaceId: workspace.id,
      });

      // Créer une tâche existante avec position 5
      await createTestTask({
        projectId: project.id,
        creatorId: owner.id,
        status: "backlog",
        position: 5,
      });

      setSession(owner);

      const taskId = await createTask({
        projectId: project.id,
        title: "Nouvelle tâche",
        status: "backlog",
        priority: "medium",
      });

      const created = await testDb.query.tasks.findFirst({
        where: { id: taskId },
      });
      expect(created!.position).toBe(6);
    });
  });

  describe("updateTask", () => {
    it("member peut mettre à jour une tâche", async () => {
      const owner = await createTestUser();
      const member = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: member.id,
        role: "member",
      });
      const project = await createTestProject({
        workspaceId: workspace.id,
      });
      const task = await createTestTask({
        projectId: project.id,
        creatorId: owner.id,
        title: "Ancien titre",
      });

      setSession(member);

      await updateTask({
        id: task.id,
        title: "Nouveau titre",
        description: "Nouvelle description",
      });

      const updated = await testDb.query.tasks.findFirst({
        where: { id: task.id },
      });
      expect(updated!.title).toBe("Nouveau titre");
      expect(updated!.description).toBe("Nouvelle description");
    });

    it("viewer ne peut pas mettre à jour une tâche", async () => {
      const owner = await createTestUser();
      const viewer = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: viewer.id,
        role: "viewer",
      });
      const project = await createTestProject({
        workspaceId: workspace.id,
      });
      const task = await createTestTask({
        projectId: project.id,
        creatorId: owner.id,
      });

      setSession(viewer);

      await expect(
        updateTask({
          id: task.id,
          title: "Interdit",
        })
      ).rejects.toThrow(TaskPermissionError);
    });
  });

  describe("deleteTask", () => {
    it("owner peut supprimer n'importe quelle tâche", async () => {
      const owner = await createTestUser();
      const member = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: member.id,
        role: "member",
      });
      const project = await createTestProject({
        workspaceId: workspace.id,
      });
      const task = await createTestTask({
        projectId: project.id,
        creatorId: member.id,
      });

      setSession(owner);

      const projectId = await deleteTask({ id: task.id });

      expect(projectId).toBe(project.id);

      const deleted = await testDb.query.tasks.findFirst({
        where: { id: task.id },
      });
      expect(deleted).toBeUndefined();
    });

    it("member peut supprimer sa propre tâche", async () => {
      const owner = await createTestUser();
      const member = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: member.id,
        role: "member",
      });
      const project = await createTestProject({
        workspaceId: workspace.id,
      });
      const task = await createTestTask({
        projectId: project.id,
        creatorId: member.id,
      });

      setSession(member);

      await deleteTask({ id: task.id });

      const deleted = await testDb.query.tasks.findFirst({
        where: { id: task.id },
      });
      expect(deleted).toBeUndefined();
    });

    it("member ne peut pas supprimer la tâche d'un autre", async () => {
      const owner = await createTestUser();
      const member = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: member.id,
        role: "member",
      });
      const project = await createTestProject({
        workspaceId: workspace.id,
      });
      const task = await createTestTask({
        projectId: project.id,
        creatorId: owner.id,
      });

      setSession(member);

      await expect(deleteTask({ id: task.id })).rejects.toThrow(
        TaskPermissionError
      );
    });
  });

  describe("updateTaskStatus", () => {
    it("member peut changer le status", async () => {
      const owner = await createTestUser();
      const member = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: member.id,
        role: "member",
      });
      const project = await createTestProject({
        workspaceId: workspace.id,
      });
      const task = await createTestTask({
        projectId: project.id,
        creatorId: owner.id,
        status: "backlog",
      });

      setSession(member);

      await updateTaskStatus({ id: task.id, status: "in_progress" });

      const updated = await testDb.query.tasks.findFirst({
        where: { id: task.id },
      });
      expect(updated!.status).toBe("in_progress");
    });
  });

  describe("updateTaskAssignee", () => {
    it("member peut changer l'assignee", async () => {
      const owner = await createTestUser();
      const member = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: member.id,
        role: "member",
      });
      const project = await createTestProject({
        workspaceId: workspace.id,
      });
      const task = await createTestTask({
        projectId: project.id,
        creatorId: owner.id,
      });

      setSession(member);

      await updateTaskAssignee({ id: task.id, assigneeId: member.id });

      const updated = await testDb.query.tasks.findFirst({
        where: { id: task.id },
      });
      expect(updated!.assigneeId).toBe(member.id);
    });

    it("peut désassigner (null)", async () => {
      const owner = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      const project = await createTestProject({
        workspaceId: workspace.id,
      });
      const task = await createTestTask({
        projectId: project.id,
        creatorId: owner.id,
        assigneeId: owner.id,
      });

      setSession(owner);

      await updateTaskAssignee({ id: task.id, assigneeId: null });

      const updated = await testDb.query.tasks.findFirst({
        where: { id: task.id },
      });
      expect(updated!.assigneeId).toBeNull();
    });
  });
});
