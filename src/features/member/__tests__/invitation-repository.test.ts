import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockInvitation } from "./invitation.fixtures";

const mockWhere = vi.fn().mockResolvedValue(undefined);
const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
const mockValues = vi.fn().mockResolvedValue(undefined);
const mockInnerJoinWhere = vi.fn();
const mockInnerJoin2 = vi.fn().mockReturnValue({ where: mockInnerJoinWhere });
const mockInnerJoin = vi.fn().mockReturnValue({ where: mockInnerJoinWhere, innerJoin: mockInnerJoin2 });
const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin, where: vi.fn() });

const mockDb = vi.hoisted(() => ({
  insert: vi.fn(),
  update: vi.fn(),
  select: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: mockDb,
}));

vi.mock("@/db/schema/workspace-invitations", () => ({
  workspaceInvitations: {
    id: "id",
    workspaceId: "workspaceId",
    email: "email",
    role: "role",
    token: "token",
    invitedById: "invitedById",
    status: "status",
    expiresAt: "expiresAt",
    createdAt: "createdAt",
  },
  NewWorkspaceInvitation: {},
}));

vi.mock("@/db/schema/workspaces", () => ({
  workspaces: {
    id: "id",
    name: "name",
    slug: "slug",
  },
}));

vi.mock("@/db/schema/auth-schema", () => ({
  user: {
    id: "id",
    name: "name",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((field, value) => ({ field, value })),
  and: vi.fn((...args) => ({ fn: "and", args })),
  gt: vi.fn((field, value) => ({ fn: "gt", field, value })),
}));

import {
  createInvitationRepository,
  getInvitationByTokenRepository,
  getInvitationByIdRepository,
  updateInvitationStatusRepository,
  updateInvitationRoleRepository,
} from "../invitation-repository";

describe("invitation-repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.insert.mockReturnValue({ values: mockValues });
    mockValues.mockResolvedValue(undefined);
    mockDb.update.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockWhere });
    mockWhere.mockResolvedValue(undefined);
    mockInnerJoinWhere.mockResolvedValue([]);
    mockInnerJoin.mockReturnValue({ where: mockInnerJoinWhere, innerJoin: mockInnerJoin2 });
    mockInnerJoin2.mockReturnValue({ where: mockInnerJoinWhere });
    mockFrom.mockReturnValue({ innerJoin: mockInnerJoin, where: vi.fn().mockResolvedValue([]) });
    mockDb.select.mockReturnValue({ from: mockFrom });
  });

  describe("createInvitationRepository", () => {
    it("should insert a new invitation", async () => {
      await createInvitationRepository({
        workspaceId: "ws-1",
        email: "new@example.com",
        role: "member",
        token: "token-123",
        invitedById: "user-1",
        expiresAt: new Date(),
      });

      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe("getInvitationByTokenRepository", () => {
    it("should return invitation when token exists", async () => {
      const invitation = createMockInvitation();
      mockInnerJoinWhere.mockResolvedValue([invitation]);

      const result = await getInvitationByTokenRepository("abc123token");

      expect(result).toEqual(invitation);
    });

    it("should return null when token does not exist", async () => {
      mockInnerJoinWhere.mockResolvedValue([]);

      const result = await getInvitationByTokenRepository("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("getInvitationByIdRepository", () => {
    it("should return invitation when id exists", async () => {
      const invitation = createMockInvitation();
      const mockFromWhere = vi.fn().mockResolvedValue([invitation]);
      mockFrom.mockReturnValue({ innerJoin: mockInnerJoin, where: mockFromWhere });

      const result = await getInvitationByIdRepository("inv-123");

      expect(result).toEqual(invitation);
    });

    it("should return null when id does not exist", async () => {
      const mockFromWhere = vi.fn().mockResolvedValue([]);
      mockFrom.mockReturnValue({ innerJoin: mockInnerJoin, where: mockFromWhere });

      const result = await getInvitationByIdRepository("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("updateInvitationStatusRepository", () => {
    it("should update invitation status", async () => {
      await updateInvitationStatusRepository("inv-1", "accepted");

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({ status: "accepted" });
    });
  });

  describe("updateInvitationRoleRepository", () => {
    it("should update invitation role", async () => {
      await updateInvitationRoleRepository("inv-1", "admin");

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({ role: "admin" });
    });
  });
});
