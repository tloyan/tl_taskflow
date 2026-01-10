import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { relations } from "./relations";
import * as auth from "./schema/auth-schema";

export const db = drizzle({ client: sql, schema: { ...auth }, relations });
