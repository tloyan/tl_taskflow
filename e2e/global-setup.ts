import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

export default async function globalSetup() {
  const pool = new Pool({
    connectionString:
      "postgresql://postgres:postgres@localhost:5433/taskflow_test",
  });

  const db = drizzle({ client: pool });

  await migrate(db, { migrationsFolder: "./drizzle" });
  await pool.end();
}
