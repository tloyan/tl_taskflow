import { testDb } from "./db";
import { sql } from "drizzle-orm";
import { randomUUID } from "crypto";

type UserOverrides = {
  id?: string;
  name?: string;
  email?: string;
};

export async function seedUser(overrides: UserOverrides = {}) {
  const id = overrides.id ?? randomUUID();
  const name = overrides.name ?? `User ${id.slice(0, 6)}`;
  const email = overrides.email ?? `user-${id.slice(0, 6)}@test.com`;

  const [user] = await testDb
    .execute(
      sql`INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at)
          VALUES (${id}, ${name}, ${email}, true, NOW(), NOW())
          RETURNING *`
    )
    .then((r) => r.rows as Record<string, unknown>[]);

  return { id: user.id as string, name: user.name as string, email: user.email as string };
}

export async function seedSession(userId: string) {
  const id = randomUUID();
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

  await testDb.execute(
    sql`INSERT INTO session (id, token, expires_at, created_at, updated_at, user_id, ip_address, user_agent)
        VALUES (${id}, ${token}, ${expiresAt}, NOW(), NOW(), ${userId}, '127.0.0.1', 'Playwright')`
  );

  return { id, token };
}

type WorkspaceOverrides = {
  name?: string;
  slug?: string;
  description?: string;
};

export async function seedWorkspace(
  ownerId: string,
  overrides: WorkspaceOverrides = {}
) {
  const id = randomUUID();
  const name = overrides.name ?? `Workspace ${id.slice(0, 6)}`;
  const slug = overrides.slug ?? `workspace-${id.slice(0, 6)}`;
  const description = overrides.description ?? null;

  const [workspace] = await testDb
    .execute(
      sql`INSERT INTO workspaces (id, name, slug, description, "ownerId", "createdAt", "updatedAt")
          VALUES (${id}, ${name}, ${slug}, ${description}, ${ownerId}, NOW(), NOW())
          RETURNING *`
    )
    .then((r) => r.rows as Record<string, unknown>[]);

  // Add owner as member
  await testDb.execute(
    sql`INSERT INTO workspace_members (workspace_id, user_id, role, joined_at)
        VALUES (${id}, ${ownerId}, 'owner', NOW())`
  );

  return {
    id: workspace.id as string,
    name: workspace.name as string,
    slug: workspace.slug as string,
    description: workspace.description as string | null,
  };
}

type ProjectOverrides = {
  name?: string;
  description?: string;
  color?: string;
  status?: string;
};

export async function seedProject(
  workspaceId: string,
  overrides: ProjectOverrides = {}
) {
  const id = randomUUID();
  const name = overrides.name ?? `Project ${id.slice(0, 6)}`;
  const description = overrides.description ?? null;
  const color = overrides.color ?? "#6a7282";
  const status = overrides.status ?? "active";

  const [project] = await testDb
    .execute(
      sql`INSERT INTO projects (id, name, description, "workspaceId", status, color, "createdAt", "updatedAt")
          VALUES (${id}, ${name}, ${description}, ${workspaceId}, ${status}, ${color}, NOW(), NOW())
          RETURNING *`
    )
    .then((r) => r.rows as Record<string, unknown>[]);

  return {
    id: project.id as string,
    name: project.name as string,
    workspaceId: project.workspaceId as string,
  };
}

type TaskOverrides = {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  position?: number;
};

export async function seedTask(
  projectId: string,
  creatorId: string,
  overrides: TaskOverrides = {}
) {
  const id = randomUUID();
  const title = overrides.title ?? `Task ${id.slice(0, 6)}`;
  const description = overrides.description ?? null;
  const status = overrides.status ?? "backlog";
  const priority = overrides.priority ?? "medium";
  const position = overrides.position ?? 0;

  const [task] = await testDb
    .execute(
      sql`INSERT INTO tasks (id, title, description, "projectId", "creatorId", status, priority, position, "createdAt", "updatedAt")
          VALUES (${id}, ${title}, ${description}, ${projectId}, ${creatorId}, ${status}, ${priority}, ${position}, NOW(), NOW())
          RETURNING *`
    )
    .then((r) => r.rows as Record<string, unknown>[]);

  return {
    id: task.id as string,
    title: task.title as string,
    projectId: task.projectId as string,
  };
}

type CommentOverrides = {
  content?: string;
};

export async function seedComment(
  taskId: string,
  authorId: string,
  overrides: CommentOverrides = {}
) {
  const id = randomUUID();
  const content = overrides.content ?? `Comment ${id.slice(0, 6)}`;

  const [comment] = await testDb
    .execute(
      sql`INSERT INTO comments (id, content, "taskId", "authorId", "createdAt", "updatedAt")
          VALUES (${id}, ${content}, ${taskId}, ${authorId}, NOW(), NOW())
          RETURNING *`
    )
    .then((r) => r.rows as Record<string, unknown>[]);

  return {
    id: comment.id as string,
    content: comment.content as string,
    taskId: comment.taskId as string,
  };
}

export async function seedMember(
  workspaceId: string,
  userId: string,
  role: string = "member"
) {
  await testDb.execute(
    sql`INSERT INTO workspace_members (workspace_id, user_id, role, joined_at)
        VALUES (${workspaceId}, ${userId}, ${role}, NOW())`
  );
}

type InvitationOverrides = {
  email?: string;
  role?: string;
  token?: string;
  status?: string;
  expiresAt?: Date;
};

export async function seedInvitation(
  workspaceId: string,
  invitedById: string,
  overrides: InvitationOverrides = {}
) {
  const id = randomUUID();
  const email = overrides.email ?? `invite-${id.slice(0, 6)}@test.com`;
  const role = overrides.role ?? "member";
  const token = overrides.token ?? randomUUID();
  const status = overrides.status ?? "pending";
  const expiresAt = overrides.expiresAt ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  const [invitation] = await testDb
    .execute(
      sql`INSERT INTO workspace_invitations (id, workspace_id, email, role, token, invited_by_id, status, expires_at, created_at)
          VALUES (${id}, ${workspaceId}, ${email}, ${role}, ${token}, ${invitedById}, ${status}, ${expiresAt}, NOW())
          RETURNING *`
    )
    .then((r) => r.rows as Record<string, unknown>[]);

  return {
    id: invitation.id as string,
    token: invitation.token as string,
    email: invitation.email as string,
  };
}
