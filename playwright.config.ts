import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3002",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev --port 3002",
    url: "http://localhost:3002",
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      POSTGRES_URL:
        "postgresql://postgres:postgres@localhost:5433/taskflow_test",
      BETTER_AUTH_URL: "http://localhost:3002",
    },
  },
  globalSetup: "./e2e/global-setup.ts",
});
