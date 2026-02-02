import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { relations } from "./relations";
import * as auth from "./schema/auth-schema";
import * as workspaces from "./schema/workspaces";
import * as workspaceMembers from "./schema/workspace-members";
import * as workspaceInvitations from "./schema/workspace-invitations";
import * as projects from "./schema/projects";

export const db = drizzle({
  client: sql,
  schema: { ...auth, ...workspaces, ...workspaceMembers, ...workspaceInvitations, ...projects },
  relations,
});
