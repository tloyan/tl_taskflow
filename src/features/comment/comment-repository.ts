import "server-only";

import { db } from "@/db";
import { comments, type NewComment } from "@/db/schema/comments";
import { user } from "@/db/schema/auth-schema";
import { eq, desc } from "drizzle-orm";
import type { Comment, CommentWithAuthor } from "./comment-types";

export async function createCommentRepository(
  comment: NewComment
): Promise<{ id: string }> {
  const [created] = await db
    .insert(comments)
    .values(comment)
    .returning({ id: comments.id });
  return created;
}

export async function getCommentByIdRepository(
  id: string
): Promise<Comment | undefined> {
  return await db.query.comments.findFirst({
    where: { id },
  });
}

export async function getCommentsByTaskIdRepository(
  taskId: string
): Promise<CommentWithAuthor[]> {
  const rows = await db
    .select({
      id: comments.id,
      content: comments.content,
      taskId: comments.taskId,
      authorId: comments.authorId,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      author: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(comments)
    .innerJoin(user, eq(comments.authorId, user.id))
    .where(eq(comments.taskId, taskId))
    .orderBy(desc(comments.createdAt));

  return rows as CommentWithAuthor[];
}

export async function deleteCommentRepository(id: string): Promise<void> {
  await db.delete(comments).where(eq(comments.id, id));
}
