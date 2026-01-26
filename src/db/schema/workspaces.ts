import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid().defaultRandom().primaryKey(),
    name: text().notNull(),
    slug: text().notNull().unique(),
    description: text(),
    ownerId: text()
      .notNull()
      .references(() => user.id, { onDelete: "no action" }),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("workspaces_ownerId_idx").on(table.ownerId)]
);

export type NewWorkspace = typeof workspaces.$inferInsert;

// export const roleEnum = pgEnum("role", ["OWNER", "ADMIN", "MEMBER", "VIEWER"]);

// export const workspace_members = pgTable("workspace_members", {
//   userId: text()
//     .notNull()
//     .references(() => user.id),
//   workspaceId: uuid()
//     .notNull()
//     .references(() => workspaces.id),
//   role: roleEnum(),
//   join_at: timestamp().defaultNow(),
// });
