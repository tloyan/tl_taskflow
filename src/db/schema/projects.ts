import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";

export const projects = pgTable(
  "projects",
  {
    id: uuid().defaultRandom().primaryKey(),
    name: text().notNull(),
    description: text(),
    workspaceId: uuid()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    status: text().notNull().default("active"),
    color: text().notNull().default("#6a7282"),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("projects_workspaceId_idx").on(table.workspaceId)]
);

export type NewProject = typeof projects.$inferInsert;
