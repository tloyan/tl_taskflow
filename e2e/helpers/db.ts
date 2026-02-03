import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";

const pool = new Pool({
  connectionString:
    "postgresql://postgres:postgres@localhost:5433/taskflow_test",
});

export const testDb = drizzle({ client: pool });

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

export async function closeDb() {
  await pool.end();
}
