import { describe, it, expect, beforeEach } from "vitest";
import { setupAuthMock } from "@/test/helpers/auth.integration";
import {
  createTestUser,
  createTestWorkspace,
  createTestMember,
} from "@/test/factories";
import { testDb } from "@/test/helpers/test-db";
import { workspaces } from "@/db/schema/workspaces";
import { workspaceMembers } from "@/db/schema/workspace-members";
import { eq } from "drizzle-orm";
import { WorkspaceValidationError, WorkspacePermissionError } from "../workspace-errors";

const { setSession, clearSession } = setupAuthMock();

// Import services after mocks are set up
const { createWorkspace, updateWorkspace, deleteWorkspace } = await import(
  "../workspace-service"
);
const { getWorkspacesWithCountsByUserIdRepository } = await import(
  "../workspace-repository"
);

describe("Workspace Service (integration)", () => {
  beforeEach(() => {
    clearSession();
  });

  describe("createWorkspace", () => {
    it("crée un workspace et ajoute le membre owner", async () => {
      const user = await createTestUser();
      setSession(user);

      const slug = await createWorkspace({
        name: "Mon Workspace",
        slug: "mon-workspace",
        description: "Description test",
      });

      expect(slug).toBe("mon-workspace");

      const created = await testDb.query.workspaces.findFirst({
        where: { slug: "mon-workspace" },
      });
      expect(created).toBeDefined();
      expect(created!.name).toBe("Mon Workspace");
      expect(created!.ownerId).toBe(user.id);

      const members = await testDb
        .select()
        .from(workspaceMembers)
        .where(eq(workspaceMembers.workspaceId, created!.id));
      expect(members).toHaveLength(1);
      expect(members[0].userId).toBe(user.id);
      expect(members[0].role).toBe("owner");
    });

    it("refuse un slug déjà utilisé", async () => {
      const user = await createTestUser();
      setSession(user);

      await createTestWorkspace({ ownerId: user.id, slug: "existing-slug" });

      await expect(
        createWorkspace({
          name: "Autre Workspace",
          slug: "existing-slug",
        })
      ).rejects.toThrow(WorkspaceValidationError);
    });

    it("refuse les données invalides", async () => {
      const user = await createTestUser();
      setSession(user);

      await expect(
        createWorkspace({ name: "ab", slug: "ab" })
      ).rejects.toThrow(WorkspaceValidationError);
    });
  });

  describe("updateWorkspace", () => {
    it("met à jour un workspace existant", async () => {
      const user = await createTestUser();
      setSession(user);

      const workspace = await createTestWorkspace({
        ownerId: user.id,
        name: "Ancien Nom",
        slug: "ancien-nom",
      });

      const newSlug = await updateWorkspace({
        id: workspace.id,
        name: "Nouveau Nom",
        slug: "nouveau-nom",
        description: "Nouvelle description",
      });

      expect(newSlug).toBe("nouveau-nom");

      const updated = await testDb.query.workspaces.findFirst({
        where: { id: workspace.id },
      });
      expect(updated!.name).toBe("Nouveau Nom");
      expect(updated!.slug).toBe("nouveau-nom");
      expect(updated!.description).toBe("Nouvelle description");
    });

    it("refuse la mise à jour par un non-owner", async () => {
      const owner = await createTestUser();
      const other = await createTestUser();
      setSession(other);

      const workspace = await createTestWorkspace({ ownerId: owner.id });

      await expect(
        updateWorkspace({
          id: workspace.id,
          name: "Hijacked",
          slug: "hijacked",
        })
      ).rejects.toThrow(WorkspacePermissionError);
    });

    it("refuse un slug déjà utilisé par un autre workspace", async () => {
      const user = await createTestUser();
      setSession(user);

      await createTestWorkspace({ ownerId: user.id, slug: "taken-slug" });
      const workspace = await createTestWorkspace({
        ownerId: user.id,
        slug: "my-slug",
      });

      await expect(
        updateWorkspace({
          id: workspace.id,
          name: "Updated",
          slug: "taken-slug",
        })
      ).rejects.toThrow(WorkspaceValidationError);
    });
  });

  describe("deleteWorkspace", () => {
    it("supprime un workspace et ses membres en cascade", async () => {
      const user = await createTestUser();
      setSession(user);

      const workspace = await createTestWorkspace({ ownerId: user.id });

      await deleteWorkspace(
        { id: workspace.id, confirmName: workspace.name }
      );

      const deleted = await testDb.query.workspaces.findFirst({
        where: { id: workspace.id },
      });
      expect(deleted).toBeUndefined();

      const members = await testDb
        .select()
        .from(workspaceMembers)
        .where(eq(workspaceMembers.workspaceId, workspace.id));
      expect(members).toHaveLength(0);
    });

    it("refuse la suppression par un non-owner", async () => {
      const owner = await createTestUser();
      const other = await createTestUser();
      setSession(other);

      const workspace = await createTestWorkspace({ ownerId: owner.id });

      await expect(
        deleteWorkspace(
          { id: workspace.id, confirmName: workspace.name }
        )
      ).rejects.toThrow(WorkspacePermissionError);
    });
  });

  describe("getWorkspacesWithCountsByUserIdRepository", () => {
    it("retourne les workspaces avec le nombre de membres", async () => {
      const owner = await createTestUser();
      const member = await createTestUser();

      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: member.id,
        role: "member",
      });

      const result = await getWorkspacesWithCountsByUserIdRepository(owner.id);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(workspace.id);
      expect(result[0].membersCount).toBe(2);
    });

    it("retourne une liste vide si aucun workspace", async () => {
      const user = await createTestUser();
      const result = await getWorkspacesWithCountsByUserIdRepository(user.id);
      expect(result).toHaveLength(0);
    });
  });
});
