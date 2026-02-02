import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { user } from "./auth-schema";

export const tasks = pgTable(
  "tasks",
  {
    id: uuid().defaultRandom().primaryKey(),
    title: text().notNull(),
    description: text(),
    projectId: uuid()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    assigneeId: text().references(() => user.id, { onDelete: "set null" }),
    creatorId: text()
      .notNull()
      .references(() => user.id),
    status: text().notNull().default("backlog"),
    priority: text().notNull().default("medium"),
    dueDate: timestamp(),
    position: integer().notNull().default(0),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("tasks_projectId_idx").on(table.projectId),
    index("tasks_assigneeId_idx").on(table.assigneeId),
    index("tasks_creatorId_idx").on(table.creatorId),
  ]
);

export type NewTask = typeof tasks.$inferInsert;
