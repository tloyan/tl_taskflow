import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { workspaces } from "./workspaces";

export const workspaceInvitations = pgTable(
  "workspace_invitations",
  {
    id: uuid().defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    email: text().notNull(),
    role: text().notNull().default("member"),
    token: text().notNull().unique(),
    invitedById: text("invited_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text().notNull().default("pending"),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("workspace_invitations_workspace_id_email_idx").on(
      table.workspaceId,
      table.email
    ),
    index("workspace_invitations_email_idx").on(table.email),
    uniqueIndex("workspace_invitations_token_idx").on(table.token),
  ]
);

export type WorkspaceInvitation = typeof workspaceInvitations.$inferSelect;
export type NewWorkspaceInvitation = typeof workspaceInvitations.$inferInsert;
