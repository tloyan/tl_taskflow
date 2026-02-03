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
import { projects } from "@/db/schema/projects";
import { tasks } from "@/db/schema/tasks";
import { eq } from "drizzle-orm";
import { ProjectPermissionError } from "../project-errors";

const { setSession, clearSession } = setupAuthMock();

const {
  createProject,
  updateProject,
  deleteProject,
  archiveProject,
  unarchiveProject,
} = await import("../project-service");

describe("Project Service (integration)", () => {
  beforeEach(() => {
    clearSession();
  });

  describe("createProject", () => {
    it("permet la création par un owner", async () => {
      const owner = await createTestUser();
      setSession(owner);

      const workspace = await createTestWorkspace({ ownerId: owner.id });

      const projectId = await createProject({
        workspaceId: workspace.id,
        name: "Mon Projet",
        description: "Description",
        color: "#ff0000",
      });

      expect(projectId).toBeDefined();

      const created = await testDb.query.projects.findFirst({
        where: { id: projectId },
      });
      expect(created).toBeDefined();
      expect(created!.name).toBe("Mon Projet");
      expect(created!.workspaceId).toBe(workspace.id);
    });

    it("permet la création par un admin", async () => {
      const owner = await createTestUser();
      const admin = await createTestUser();

      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: admin.id,
        role: "admin",
      });

      setSession(admin);

      const projectId = await createProject({
        workspaceId: workspace.id,
        name: "Projet Admin",
        description: "Créé par admin",
        color: "#00ff00",
      });

      expect(projectId).toBeDefined();
    });

    it("refuse la création par un member", async () => {
      const owner = await createTestUser();
      const member = await createTestUser();

      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: member.id,
        role: "member",
      });

      setSession(member);

      await expect(
        createProject({
          workspaceId: workspace.id,
          name: "Projet Interdit",
          description: "Non autorisé",
          color: "#000000",
        })
      ).rejects.toThrow(ProjectPermissionError);
    });

    it("refuse la création par un viewer", async () => {
      const owner = await createTestUser();
      const viewer = await createTestUser();

      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: viewer.id,
        role: "viewer",
      });

      setSession(viewer);

      await expect(
        createProject({
          workspaceId: workspace.id,
          name: "Projet Interdit",
          description: "Non autorisé",
          color: "#000000",
        })
      ).rejects.toThrow(ProjectPermissionError);
    });

    it("refuse la création par un non-membre", async () => {
      const owner = await createTestUser();
      const outsider = await createTestUser();

      const workspace = await createTestWorkspace({ ownerId: owner.id });

      setSession(outsider);

      await expect(
        createProject({
          workspaceId: workspace.id,
          name: "Projet Interdit",
          description: "Non autorisé",
          color: "#000000",
        })
      ).rejects.toThrow(ProjectPermissionError);
    });
  });

  describe("deleteProject", () => {
    it("supprime un projet et ses tâches en cascade", async () => {
      const owner = await createTestUser();
      setSession(owner);

      const workspace = await createTestWorkspace({ ownerId: owner.id });
      const project = await createTestProject({
        workspaceId: workspace.id,
        name: "Projet à supprimer",
      });

      await createTestTask({
        projectId: project.id,
        creatorId: owner.id,
        title: "Tâche 1",
      });
      await createTestTask({
        projectId: project.id,
        creatorId: owner.id,
        title: "Tâche 2",
      });

      const workspaceId = await deleteProject(
        { id: project.id, confirmName: project.name }
      );

      expect(workspaceId).toBe(workspace.id);

      const deleted = await testDb.query.projects.findFirst({
        where: { id: project.id },
      });
      expect(deleted).toBeUndefined();

      const remainingTasks = await testDb
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, project.id));
      expect(remainingTasks).toHaveLength(0);
    });

    it("refuse la suppression par un member", async () => {
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
        name: "Projet protégé",
      });

      setSession(member);

      await expect(
        deleteProject(
          { id: project.id, confirmName: project.name }
        )
      ).rejects.toThrow(ProjectPermissionError);
    });
  });

  describe("updateProject", () => {
    it("met à jour un projet existant", async () => {
      const owner = await createTestUser();
      setSession(owner);

      const workspace = await createTestWorkspace({ ownerId: owner.id });
      const project = await createTestProject({
        workspaceId: workspace.id,
        name: "Ancien Nom",
      });

      await updateProject({
        id: project.id,
        name: "Nouveau Nom",
        description: "Nouvelle description",
        color: "#abcdef",
      });

      const updated = await testDb.query.projects.findFirst({
        where: { id: project.id },
      });
      expect(updated!.name).toBe("Nouveau Nom");
      expect(updated!.description).toBe("Nouvelle description");
      expect(updated!.color).toBe("#abcdef");
    });
  });

  describe("archiveProject", () => {
    it("owner peut archiver un projet", async () => {
      const owner = await createTestUser();
      setSession(owner);

      const workspace = await createTestWorkspace({ ownerId: owner.id });
      const project = await createTestProject({
        workspaceId: workspace.id,
        status: "active",
      });

      await archiveProject({ id: project.id });

      const updated = await testDb.query.projects.findFirst({
        where: { id: project.id },
      });
      expect(updated!.status).toBe("archived");
    });

    it("member ne peut pas archiver un projet", async () => {
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

      await expect(archiveProject({ id: project.id })).rejects.toThrow(
        ProjectPermissionError
      );
    });
  });

  describe("unarchiveProject", () => {
    it("owner peut désarchiver un projet", async () => {
      const owner = await createTestUser();
      setSession(owner);

      const workspace = await createTestWorkspace({ ownerId: owner.id });
      const project = await createTestProject({
        workspaceId: workspace.id,
        status: "archived",
      });

      await unarchiveProject({ id: project.id });

      const updated = await testDb.query.projects.findFirst({
        where: { id: project.id },
      });
      expect(updated!.status).toBe("active");
    });

    it("member ne peut pas désarchiver un projet", async () => {
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
        status: "archived",
      });

      setSession(member);

      await expect(unarchiveProject({ id: project.id })).rejects.toThrow(
        ProjectPermissionError
      );
    });
  });
});
