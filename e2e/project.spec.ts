import { test, expect, seedWorkspace, seedProject } from "./fixtures/base";

test.describe("Project management", () => {
  test("displays the project list for a workspace", async ({
    authenticatedPage,
    testUser,
  }) => {
    const workspace = await seedWorkspace(testUser.id, {
      name: "WS Projets",
      slug: "ws-projets",
    });
    await seedProject(workspace.id, { name: "Projet Alpha" });
    await seedProject(workspace.id, { name: "Projet Beta" });

    await authenticatedPage.goto(`/w/ws-projets`);
    await expect(authenticatedPage.getByText("Projet Alpha")).toBeVisible();
    await expect(authenticatedPage.getByText("Projet Beta")).toBeVisible();
  });

  test("creates a project via the form", async ({
    authenticatedPage,
    testUser,
  }) => {
    await seedWorkspace(testUser.id, {
      name: "WS Create Project",
      slug: "ws-create-project",
    });

    await authenticatedPage.goto("/w/ws-create-project/p/new");

    await authenticatedPage.getByLabel("Nom du projet*").fill("Mon Projet E2E");
    await authenticatedPage
      .getByLabel("Description")
      .fill("Description du projet");

    await authenticatedPage
      .getByRole("button", { name: "Créer le projet" })
      .click();

    // Should redirect to the project page
    await authenticatedPage.waitForURL(/\/w\/ws-create-project\/p\//);
    await expect(
      authenticatedPage.getByText("Mon Projet E2E")
    ).toBeVisible();
  });

  test("navigates to a project from the list", async ({
    authenticatedPage,
    testUser,
  }) => {
    const workspace = await seedWorkspace(testUser.id, {
      name: "WS Nav Project",
      slug: "ws-nav-project",
    });
    const project = await seedProject(workspace.id, {
      name: "Projet Navigation",
    });

    await authenticatedPage.goto("/w/ws-nav-project");
    await authenticatedPage.getByText("Projet Navigation").click();
    await authenticatedPage.waitForURL(
      `/w/ws-nav-project/p/${project.id}`
    );
    await expect(
      authenticatedPage.getByText("Projet Navigation")
    ).toBeVisible();
  });

  test("updates a project in settings", async ({
    authenticatedPage,
    testUser,
  }) => {
    const workspace = await seedWorkspace(testUser.id, {
      name: "WS Update Project",
      slug: "ws-update-project",
    });
    const project = await seedProject(workspace.id, {
      name: "Projet Original",
    });

    await authenticatedPage.goto(
      `/w/ws-update-project/p/${project.id}/settings`
    );
    await expect(
      authenticatedPage.getByRole("heading", {
        name: "Paramètres du projet",
      })
    ).toBeVisible();

    const nameInput = authenticatedPage.getByLabel("Nom du projet*");
    await nameInput.clear();
    await nameInput.fill("Projet Modifié");

    await authenticatedPage
      .getByRole("button", { name: "Enregistrer" })
      .click();

    await expect(
      authenticatedPage.getByText("Projet mis à jour")
    ).toBeVisible();
  });

  test("archives and unarchives a project", async ({
    authenticatedPage,
    testUser,
  }) => {
    const workspace = await seedWorkspace(testUser.id, {
      name: "WS Archive Project",
      slug: "ws-archive-project",
    });
    const project = await seedProject(workspace.id, {
      name: "Projet Archivable",
    });

    await authenticatedPage.goto(
      `/w/ws-archive-project/p/${project.id}/settings`
    );

    // Archive
    await authenticatedPage
      .getByRole("button", { name: "Archiver ce projet" })
      .click();
    await authenticatedPage
      .getByRole("button", { name: "Archiver" })
      .click();
    await expect(
      authenticatedPage.getByText("Projet archivé")
    ).toBeVisible();

    // Verify restore button is now visible
    await expect(
      authenticatedPage.getByRole("button", { name: "Restaurer ce projet" })
    ).toBeVisible();

    // Unarchive
    await authenticatedPage
      .getByRole("button", { name: "Restaurer ce projet" })
      .click();
    await authenticatedPage
      .getByRole("button", { name: "Restaurer" })
      .click();
    await expect(
      authenticatedPage.getByText("Projet restauré")
    ).toBeVisible();

    // Verify archive button is back
    await expect(
      authenticatedPage.getByRole("button", { name: "Archiver ce projet" })
    ).toBeVisible();
  });

  test("deletes a project", async ({ authenticatedPage, testUser }) => {
    const workspace = await seedWorkspace(testUser.id, {
      name: "WS Delete Project",
      slug: "ws-delete-project",
    });
    const project = await seedProject(workspace.id, {
      name: "Projet Supprimable",
    });

    await authenticatedPage.goto(
      `/w/ws-delete-project/p/${project.id}/settings`
    );

    await authenticatedPage
      .getByRole("button", { name: "Supprimer ce projet" })
      .click();

    // Fill confirmation dialog
    await expect(
      authenticatedPage.getByRole("heading", {
        name: "Supprimer ce projet ?",
      })
    ).toBeVisible();

    await authenticatedPage.getByLabel(/Tapez/).fill("Projet Supprimable");
    await authenticatedPage
      .getByRole("button", { name: "Supprimer" })
      .click();

    // Should redirect to workspace
    await authenticatedPage.waitForURL(/\/w\/ws-delete-project$/);
  });
});
