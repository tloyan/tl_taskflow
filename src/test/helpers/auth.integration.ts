import { vi } from "vitest";

type SessionUser = {
  id: string;
  email: string;
  name: string;
};

const mockSession = vi.hoisted(() => {
  return {
    current: null as { user: SessionUser } | null,
  };
});

/**
 * Sets up mocks for `@/lib/auth` and `next/headers`.
 * Call this at the top level of your test file (before imports).
 *
 * Usage:
 * ```ts
 * const { setSession } = setupAuthMock();
 * // then in tests:
 * setSession(user);
 * ```
 */
export function setupAuthMock() {
  vi.mock("@/lib/auth", () => ({
    auth: {
      api: {
        getSession: vi.fn(() => mockSession.current),
      },
    },
  }));

  vi.mock("next/headers", () => ({
    headers: vi.fn(() => new Headers()),
  }));

  return {
    setSession(user: SessionUser) {
      mockSession.current = { user };
    },
    clearSession() {
      mockSession.current = null;
    },
  };
}
