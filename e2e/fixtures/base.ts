import { test as base, type Page } from "@playwright/test";
import { createHmac } from "crypto";
import {
  seedUser,
  seedSession,
  seedWorkspace,
  seedProject,
  seedTask,
  seedComment,
  seedMember,
  seedInvitation,
} from "../helpers/seed";
import { truncateAllTables } from "../helpers/db";

const BETTER_AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET ||
  "e2e-test-secret-key-at-least-32-chars-long";

function signCookie(value: string, secret: string): string {
  const signature = createHmac("sha256", secret)
    .update(value)
    .digest("base64");
  return `${value}.${signature}`;
}

type TestUser = {
  id: string;
  name: string;
  email: string;
};

type TestFixtures = {
  authenticatedPage: Page;
  testUser: TestUser;
};

export const test = base.extend<TestFixtures>({
  testUser: async ({}, use) => {
    const user = await seedUser();
    await use(user);
  },

  authenticatedPage: async ({ browser, testUser }, use) => {
    const session = await seedSession(testUser.id);
    const signedToken = signCookie(session.token, BETTER_AUTH_SECRET);

    const context = await browser.newContext();
    await context.addCookies([
      {
        name: "better-auth.session_token",
        value: signedToken,
        domain: "localhost",
        path: "/",
      },
    ]);

    const page = await context.newPage();
    await use(page);
    await context.close();
    await truncateAllTables();
  },
});

export { expect } from "@playwright/test";
export { seedWorkspace, seedProject, seedTask, seedComment, seedMember, seedInvitation };
