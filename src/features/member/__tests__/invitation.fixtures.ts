export function createMockInvitation(overrides: Record<string, unknown> = {}) {
  return {
    id: "inv-123",
    workspaceId: "ws-123",
    email: "invite@example.com",
    role: "member",
    token: "abc123token",
    invitedById: "user-123",
    status: "pending",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date("2024-01-01"),
    workspaceSlug: "test-workspace",
    ...overrides,
  };
}

export function createMockInvitationDetails(overrides: Record<string, unknown> = {}) {
  return {
    id: "inv-123",
    email: "invite@example.com",
    role: "member",
    status: "pending",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    workspaceName: "Test Workspace",
    workspaceSlug: "test-workspace",
    inviterName: "Test User",
    ...overrides,
  };
}
