import "server-only";

import { db } from "@/db";
import {
  workspaceMembers,
  type NewWorkspaceMember,
} from "@/db/schema/workspace-members";
import { user } from "@/db/schema/auth-schema";
import { and, count, eq } from "drizzle-orm";
import type { MemberWithUser } from "./member-types";
import type { MemberRole } from "./member-types";

export async function getMembersByWorkspaceIdRepository(
  workspaceId: string
): Promise<MemberWithUser[]> {
  const rows = await db
    .select({
      workspaceId: workspaceMembers.workspaceId,
      userId: workspaceMembers.userId,
      role: workspaceMembers.role,
      joinedAt: workspaceMembers.joinedAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(workspaceMembers)
    .innerJoin(user, eq(workspaceMembers.userId, user.id))
    .where(eq(workspaceMembers.workspaceId, workspaceId));

  return rows as MemberWithUser[];
}

export async function getMemberRepository(
  workspaceId: string,
  userId: string
): Promise<MemberWithUser | undefined> {
  const rows = await db
    .select({
      workspaceId: workspaceMembers.workspaceId,
      userId: workspaceMembers.userId,
      role: workspaceMembers.role,
      joinedAt: workspaceMembers.joinedAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(workspaceMembers)
    .innerJoin(user, eq(workspaceMembers.userId, user.id))
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      )
    );

  return rows[0] as MemberWithUser | undefined;
}

export async function addMemberRepository(
  data: NewWorkspaceMember
): Promise<{ workspaceId: string; userId: string }> {
  const [created] = await db
    .insert(workspaceMembers)
    .values(data)
    .returning({
      workspaceId: workspaceMembers.workspaceId,
      userId: workspaceMembers.userId,
    });
  return created;
}

export async function updateMemberRoleRepository(
  workspaceId: string,
  userId: string,
  role: MemberRole
): Promise<{ workspaceId: string; userId: string }> {
  const [updated] = await db
    .update(workspaceMembers)
    .set({ role })
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      )
    )
    .returning({
      workspaceId: workspaceMembers.workspaceId,
      userId: workspaceMembers.userId,
    });
  return updated;
}

export async function removeMemberRepository(
  workspaceId: string,
  userId: string
): Promise<{ workspaceId: string; userId: string }> {
  const [deleted] = await db
    .delete(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      )
    )
    .returning({
      workspaceId: workspaceMembers.workspaceId,
      userId: workspaceMembers.userId,
    });
  return deleted;
}

export async function getMembersCountByWorkspaceIdRepository(
  workspaceId: string
): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.workspaceId, workspaceId));

  return result[0]?.count ?? 0;
}

export async function getUserByEmailRepository(
  email: string
): Promise<{ id: string; name: string; email: string } | undefined> {
  return await db.query.user.findFirst({
    where: { email },
    columns: { id: true, name: true, email: true },
  });
}
