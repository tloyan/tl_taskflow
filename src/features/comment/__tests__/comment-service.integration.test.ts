import { describe, it, expect, beforeEach } from "vitest";
import { setupAuthMock } from "@/test/helpers/auth.integration";
import {
  createTestUser,
  createTestWorkspace,
  createTestMember,
  createTestProject,
  createTestTask,
  createTestComment,
} from "@/test/factories";
import { testDb } from "@/test/helpers/test-db";
import { comments } from "@/db/schema/comments";
import { eq } from "drizzle-orm";
import { CommentPermissionError } from "../comment-errors";

const { setSession, clearSession } = setupAuthMock();

const { createComment, deleteComment } = await import("../comment-service");

describe("Comment Service (integration)", () => {
  beforeEach(() => {
    clearSession();
  });

  describe("createComment", () => {
    it("member peut créer un commentaire", async () => {
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

      const commentId = await createComment({
        taskId: task.id,
        content: "Mon commentaire",
      });

      expect(commentId).toBeDefined();

      const created = await testDb.query.comments.findFirst({
        where: { id: commentId },
      });
      expect(created).toBeDefined();
      expect(created!.content).toBe("Mon commentaire");
      expect(created!.authorId).toBe(member.id);
    });

    it("owner peut créer un commentaire", async () => {
      const owner = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      const project = await createTestProject({
        workspaceId: workspace.id,
      });
      const task = await createTestTask({
        projectId: project.id,
        creatorId: owner.id,
      });

      setSession(owner);

      const commentId = await createComment({
        taskId: task.id,
        content: "Commentaire owner",
      });

      expect(commentId).toBeDefined();
    });

    it("viewer ne peut pas créer un commentaire", async () => {
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
        createComment({
          taskId: task.id,
          content: "Interdit",
        })
      ).rejects.toThrow(CommentPermissionError);
    });

    it("non-membre ne peut pas créer un commentaire", async () => {
      const owner = await createTestUser();
      const outsider = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      const project = await createTestProject({
        workspaceId: workspace.id,
      });
      const task = await createTestTask({
        projectId: project.id,
        creatorId: owner.id,
      });

      setSession(outsider);

      await expect(
        createComment({
          taskId: task.id,
          content: "Interdit",
        })
      ).rejects.toThrow(CommentPermissionError);
    });
  });

  describe("deleteComment", () => {
    it("l'auteur peut supprimer son propre commentaire", async () => {
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
      const comment = await createTestComment({
        taskId: task.id,
        authorId: member.id,
        content: "À supprimer",
      });

      setSession(member);

      await deleteComment({ id: comment.id });

      const deleted = await testDb.query.comments.findFirst({
        where: { id: comment.id },
      });
      expect(deleted).toBeUndefined();
    });

    it("owner peut supprimer le commentaire d'un autre", async () => {
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
      const comment = await createTestComment({
        taskId: task.id,
        authorId: member.id,
      });

      setSession(owner);

      await deleteComment({ id: comment.id });

      const deleted = await testDb.query.comments.findFirst({
        where: { id: comment.id },
      });
      expect(deleted).toBeUndefined();
    });

    it("un member ne peut pas supprimer le commentaire d'un autre member", async () => {
      const owner = await createTestUser();
      const member1 = await createTestUser();
      const member2 = await createTestUser();
      const workspace = await createTestWorkspace({ ownerId: owner.id });
      await createTestMember({
        workspaceId: workspace.id,
        userId: member1.id,
        role: "member",
      });
      await createTestMember({
        workspaceId: workspace.id,
        userId: member2.id,
        role: "member",
      });
      const project = await createTestProject({
        workspaceId: workspace.id,
      });
      const task = await createTestTask({
        projectId: project.id,
        creatorId: owner.id,
      });
      const comment = await createTestComment({
        taskId: task.id,
        authorId: member1.id,
      });

      setSession(member2);

      await expect(deleteComment({ id: comment.id })).rejects.toThrow(
        CommentPermissionError
      );
    });
  });
});
