import { testDb } from "../helpers/test-db";
import { workspaceMembers } from "@/db/schema/workspace-members";

type MemberData = {
  workspaceId: string;
  userId: string;
  role?: string;
};

export async function createTestMember(data: MemberData) {
  const [created] = await testDb
    .insert(workspaceMembers)
    .values({
      workspaceId: data.workspaceId,
      userId: data.userId,
      role: data.role ?? "member",
    })
    .returning();

  return created;
}
