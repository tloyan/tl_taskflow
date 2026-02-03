import { vi, beforeAll, afterEach, afterAll } from "vitest";

// Set test database URL BEFORE any module imports @/db
process.env.POSTGRES_URL =
  "postgresql://postgres:postgres@localhost:5433/taskflow_test";

// Stub server-only
vi.mock("server-only", () => ({}));

// Dynamic import to ensure POSTGRES_URL is set before pool creation
const { runMigrations, truncateAllTables, closeTestDb } = await import(
  "./helpers/test-db"
);

beforeAll(async () => {
  await runMigrations();
});

afterEach(async () => {
  await truncateAllTables();
});

afterAll(async () => {
  await closeTestDb();
});
