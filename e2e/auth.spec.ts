import { test, expect } from "./fixtures/base";
import { test as baseTest } from "@playwright/test";

baseTest.describe("Authentication", () => {
  baseTest("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome to TaskFlow" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  });

  baseTest("unauthenticated user visiting / is redirected to /home", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(/\/home/);
    await expect(
      page.getByRole("heading", { name: /Gérez vos projets en équipe/ })
    ).toBeVisible();
  });
});

test.describe("Authenticated user", () => {
  test("is redirected from /login to /", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/login");
    await authenticatedPage.waitForURL("/");
    await expect(
      authenticatedPage.getByRole("heading", { name: "All Workspaces" })
    ).toBeVisible();
  });

  test("can access the dashboard at /", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/");
    await expect(
      authenticatedPage.getByRole("heading", { name: "All Workspaces" })
    ).toBeVisible();
    await expect(
      authenticatedPage.getByText("Select a workspace to get started")
    ).toBeVisible();
  });
});
