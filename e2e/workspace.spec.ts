import { test, expect, seedWorkspace } from "./fixtures/base";

test.describe("Workspace management", () => {
  test("displays seeded workspaces on the dashboard", async ({
    authenticatedPage,
    testUser,
  }) => {
    await seedWorkspace(testUser.id, {
      name: "Mon Workspace",
      slug: "mon-workspace",
    });
    await seedWorkspace(testUser.id, {
      name: "Autre Workspace",
      slug: "autre-workspace",
    });

    await authenticatedPage.goto("/");
    await expect(authenticatedPage.getByText("Mon Workspace")).toBeVisible();
    await expect(authenticatedPage.getByText("Autre Workspace")).toBeVisible();
  });

  test("creates a workspace via the form", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/w/new");

    await authenticatedPage.getByLabel("Nom*").fill("Test Workspace E2E");
    // Wait for slug to auto-generate and be checked
    await expect(authenticatedPage.getByLabel("Slug*")).toHaveValue(
      "test-workspace-e2e"
    );
    await authenticatedPage
      .getByText("Slug disponible")
      .waitFor({ state: "visible", timeout: 10000 });

    await authenticatedPage
      .getByRole("button", { name: "Créer Workspace" })
      .click();

    // Should redirect to the new workspace page
    await authenticatedPage.waitForURL(/\/w\/test-workspace-e2e/);
    await expect(
      authenticatedPage.getByRole("heading", { name: "Test Workspace E2E" })
    ).toBeVisible();
  });

  test("navigates to a workspace", async ({
    authenticatedPage,
    testUser,
  }) => {
    await seedWorkspace(testUser.id, {
      name: "Navigate Workspace",
      slug: "navigate-workspace",
    });

    await authenticatedPage.goto("/");
    await authenticatedPage.getByText("Navigate Workspace").click();
    await authenticatedPage.waitForURL(/\/w\/navigate-workspace/);
    await expect(
      authenticatedPage.getByRole("heading", { name: "Navigate Workspace" })
    ).toBeVisible();
  });

  test("updates workspace settings", async ({
    authenticatedPage,
    testUser,
  }) => {
    await seedWorkspace(testUser.id, {
      name: "Settings Workspace",
      slug: "settings-workspace",
    });

    await authenticatedPage.goto("/w/settings-workspace/settings");
    await expect(
      authenticatedPage.getByRole("heading", {
        name: "Paramètres du workspace",
      })
    ).toBeVisible();

    const nameInput = authenticatedPage.getByLabel("Nom du workspace*");
    await nameInput.clear();
    await nameInput.fill("Updated Workspace Name");

    await authenticatedPage
      .getByRole("button", { name: "Enregistrer" })
      .click();

    await expect(
      authenticatedPage.getByText("Workspace mis à jour")
    ).toBeVisible();
  });

  test("deletes a workspace", async ({ authenticatedPage, testUser }) => {
    await seedWorkspace(testUser.id, {
      name: "Delete Me",
      slug: "delete-me",
    });

    await authenticatedPage.goto("/w/delete-me/settings");

    await authenticatedPage
      .getByRole("button", { name: "Supprimer ce workspace" })
      .click();

    // Fill confirmation dialog
    await expect(
      authenticatedPage.getByRole("heading", {
        name: "Supprimer ce workspace ?",
      })
    ).toBeVisible();

    await authenticatedPage.getByLabel(/Tapez/).fill("Delete Me");
    await authenticatedPage
      .getByRole("button", { name: "Supprimer" })
      .click();

    // Should redirect to dashboard after deletion
    await authenticatedPage.waitForURL("/");
    await expect(
      authenticatedPage.getByRole("heading", { name: "All Workspaces" })
    ).toBeVisible();
    // Deleted workspace should not appear
    await expect(authenticatedPage.getByText("Delete Me")).not.toBeVisible();
  });
});
