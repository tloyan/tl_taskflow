import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "./relations";
import * as auth from "./schema/auth-schema";
import * as workspaces from "./schema/workspaces";
import * as workspaceMembers from "./schema/workspace-members";
import * as workspaceInvitations from "./schema/workspace-invitations";
import * as projects from "./schema/projects";
import * as tasks from "./schema/tasks";
import * as comments from "./schema/comments";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

export const db = drizzle({
  client: pool,
  schema: { ...auth, ...workspaces, ...workspaceMembers, ...workspaceInvitations, ...projects, ...tasks, ...comments },
  relations,
});
