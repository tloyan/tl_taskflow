import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { sql } from "drizzle-orm";
import { relations } from "@/db/relations";
import * as auth from "@/db/schema/auth-schema";
import * as workspaces from "@/db/schema/workspaces";
import * as workspaceMembers from "@/db/schema/workspace-members";
import * as workspaceInvitations from "@/db/schema/workspace-invitations";
import * as projects from "@/db/schema/projects";
import * as tasks from "@/db/schema/tasks";
import * as comments from "@/db/schema/comments";

const testPool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export const testDb = drizzle({
  client: testPool,
  schema: {
    ...auth,
    ...workspaces,
    ...workspaceMembers,
    ...workspaceInvitations,
    ...projects,
    ...tasks,
    ...comments,
  },
  relations,
});

export async function runMigrations() {
  await migrate(testDb, { migrationsFolder: "./drizzle" });
}

export async function truncateAllTables() {
  await testDb.execute(sql`
    TRUNCATE TABLE
      comments,
      tasks,
      projects,
      workspace_invitations,
      workspace_members,
      workspaces,
      verification,
      account,
      session,
      "user"
    CASCADE
  `);
}

export async function closeTestDb() {
  await testPool.end();
}
