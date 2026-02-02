import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tasks } from "./tasks";
import { user } from "./auth-schema";

export const comments = pgTable(
  "comments",
  {
    id: uuid().defaultRandom().primaryKey(),
    content: text().notNull(),
    taskId: uuid()
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    authorId: text()
      .notNull()
      .references(() => user.id),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("comments_taskId_idx").on(table.taskId)]
);

export type NewComment = typeof comments.$inferInsert;
