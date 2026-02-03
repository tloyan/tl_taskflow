import type { MemberWithUser } from "../member-types";

export function createMockMember(
  overrides: Partial<MemberWithUser> = {}
): MemberWithUser {
  return {
    workspaceId: "ws-123",
    userId: "user-123",
    role: "member",
    joinedAt: new Date("2024-01-01"),
    user: {
      id: "user-123",
      name: "Test User",
      email: "test@example.com",
      image: null,
    },
    ...overrides,
  } as MemberWithUser;
}

export const mockOwner = createMockMember({ role: "owner", userId: "user-123" });
export const mockAdmin = createMockMember({ role: "admin", userId: "user-123" });
export const mockMember = createMockMember({ role: "member", userId: "user-123" });
export const mockViewer = createMockMember({ role: "viewer", userId: "user-123" });
