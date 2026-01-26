import { vi } from "vitest";

// Stub "server-only" to prevent errors in test environment
vi.mock("server-only", () => ({}));
