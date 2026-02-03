import { testDb } from "../helpers/test-db";
import { comments } from "@/db/schema/comments";
import { randomUUID } from "crypto";

type CommentOverrides = {
  id?: string;
  content?: string;
  taskId: string;
  authorId: string;
};

export async function createTestComment(overrides: CommentOverrides) {
  const id = overrides.id ?? randomUUID();

  const [created] = await testDb
    .insert(comments)
    .values({
      id,
      content: overrides.content ?? `Comment ${id.slice(0, 6)}`,
      taskId: overrides.taskId,
      authorId: overrides.authorId,
    })
    .returning();

  return created;
}
