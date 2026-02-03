import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockMember } from "./member.fixtures";

const mockReturning = vi.fn().mockResolvedValue([{ workspaceId: "ws-1", userId: "u-1" }]);
const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
const mockValues = vi.fn();
const mockInnerJoinWhere = vi.fn();
const mockInnerJoin = vi.fn().mockReturnValue({ where: mockInnerJoinWhere });
const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin, where: vi.fn() });

const mockDb = vi.hoisted(() => ({
  query: {
    user: {
      findFirst: vi.fn(),
    },
  },
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  select: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: mockDb,
}));

vi.mock("@/db/schema/workspace-members", () => ({
  workspaceMembers: {
    workspaceId: "workspaceId",
    userId: "userId",
    role: "role",
    joinedAt: "joinedAt",
  },
  NewWorkspaceMember: {},
}));

vi.mock("@/db/schema/auth-schema", () => ({
  user: {
    id: "id",
    name: "name",
    email: "email",
    image: "image",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((field, value) => ({ field, value })),
  and: vi.fn((...args) => ({ fn: "and", args })),
  count: vi.fn(() => ({ fn: "count" })),
}));

import {
  getMembersByWorkspaceIdRepository,
  getMemberRepository,
  addMemberRepository,
  updateMemberRoleRepository,
  removeMemberRepository,
  getMembersCountByWorkspaceIdRepository,
  getUserByEmailRepository,
} from "../member-repository";

describe("member-repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.insert.mockReturnValue({ values: mockValues });
    mockValues.mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ workspaceId: "ws-1", userId: "u-1" }]),
    });
    mockDb.update.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockWhere });
    mockDb.delete.mockReturnValue({ where: mockWhere });
    mockReturning.mockResolvedValue([{ workspaceId: "ws-1", userId: "u-1" }]);
    mockWhere.mockReturnValue({ returning: mockReturning });
    mockInnerJoinWhere.mockResolvedValue([]);
    mockInnerJoin.mockReturnValue({ where: mockInnerJoinWhere });
    mockFrom.mockReturnValue({ innerJoin: mockInnerJoin, where: vi.fn().mockResolvedValue([]) });
    mockDb.select.mockReturnValue({ from: mockFrom });
  });

  describe("getMembersByWorkspaceIdRepository", () => {
    it("should return members with user details", async () => {
      const members = [createMockMember()];
      mockInnerJoinWhere.mockResolvedValue(members);

      const result = await getMembersByWorkspaceIdRepository("ws-123");

      expect(result).toEqual(members);
      expect(mockDb.select).toHaveBeenCalled();
    });
  });

  describe("getMemberRepository", () => {
    it("should return member when exists", async () => {
      const member = createMockMember();
      mockInnerJoinWhere.mockResolvedValue([member]);

      const result = await getMemberRepository("ws-123", "user-123");

      expect(result).toEqual(member);
    });

    it("should return undefined when member does not exist", async () => {
      mockInnerJoinWhere.mockResolvedValue([]);

      const result = await getMemberRepository("ws-123", "nonexistent");

      expect(result).toBeUndefined();
    });
  });

  describe("addMemberRepository", () => {
    it("should insert a new member", async () => {
      await addMemberRepository({
        workspaceId: "ws-1",
        userId: "u-1",
        role: "member",
      });

      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe("updateMemberRoleRepository", () => {
    it("should update member role", async () => {
      await updateMemberRoleRepository("ws-1", "u-1", "admin");

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({ role: "admin" });
    });
  });

  describe("removeMemberRepository", () => {
    it("should remove member", async () => {
      await removeMemberRepository("ws-1", "u-1");

      expect(mockDb.delete).toHaveBeenCalled();
    });
  });

  describe("getMembersCountByWorkspaceIdRepository", () => {
    it("should return member count", async () => {
      const mockFromWhere = vi.fn().mockResolvedValue([{ count: 5 }]);
      mockFrom.mockReturnValue({ where: mockFromWhere });

      const result = await getMembersCountByWorkspaceIdRepository("ws-1");

      expect(result).toBe(5);
    });

    it("should return 0 when no members", async () => {
      const mockFromWhere = vi.fn().mockResolvedValue([{}]);
      mockFrom.mockReturnValue({ where: mockFromWhere });

      const result = await getMembersCountByWorkspaceIdRepository("ws-empty");

      expect(result).toBe(0);
    });
  });

  describe("getUserByEmailRepository", () => {
    it("should return user when email exists", async () => {
      const mockUser = { id: "u-1", name: "Test", email: "test@example.com" };
      mockDb.query.user.findFirst.mockResolvedValue(mockUser);

      const result = await getUserByEmailRepository("test@example.com");

      expect(result).toEqual(mockUser);
    });

    it("should return undefined when email does not exist", async () => {
      mockDb.query.user.findFirst.mockResolvedValue(undefined);

      const result = await getUserByEmailRepository("nonexistent@example.com");

      expect(result).toBeUndefined();
    });
  });
});
