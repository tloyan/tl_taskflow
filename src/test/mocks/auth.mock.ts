import { vi } from "vitest";

export type MockSession = {
  user: {
    id: string;
    email: string;
    name: string;
  };
} | null;

export function createAuthMock(session: MockSession = null) {
  return {
    api: {
      getSession: vi.fn().mockResolvedValue(session),
    },
  };
}

export function mockAuthenticatedSession(userId = "user-123") {
  return {
    user: {
      id: userId,
      email: "test@example.com",
      name: "Test User",
    },
  };
}
