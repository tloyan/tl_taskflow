import { testDb } from "../helpers/test-db";
import { user } from "@/db/schema/auth-schema";
import { randomUUID } from "crypto";

type UserOverrides = {
  id?: string;
  name?: string;
  email?: string;
  emailVerified?: boolean;
  image?: string | null;
};

export async function createTestUser(overrides: UserOverrides = {}) {
  const id = overrides.id ?? randomUUID();
  const data = {
    id,
    name: overrides.name ?? `User ${id.slice(0, 6)}`,
    email: overrides.email ?? `user-${id.slice(0, 6)}@test.com`,
    emailVerified: overrides.emailVerified ?? true,
    image: overrides.image ?? null,
  };

  const [created] = await testDb.insert(user).values(data).returning();
  return created;
}
