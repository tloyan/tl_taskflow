import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { relations } from "./relations";
import * as auth from "./schema/auth-schema";
import * as workspaces from "./schema/workspaces";

export const db = drizzle({
  client: sql,
  schema: { ...auth, ...workspaces },
  relations,
});
