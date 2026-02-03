import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/features/**/*.ts"],
      exclude: [
        "src/features/**/*.test.ts",
        "src/features/**/*.integration.test.ts",
        "src/features/**/index.ts",
      ],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.integration.test.ts"],
          setupFiles: ["./src/test/setup.ts"],
          mockReset: true,
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["src/**/*.integration.test.ts"],
          setupFiles: ["./src/test/setup.integration.ts"],
          maxWorkers: 1,
          testTimeout: 15000,
        },
      },
    ],
  },
});
