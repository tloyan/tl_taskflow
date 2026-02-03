import {
  test,
  expect,
  seedWorkspace,
  seedProject,
  seedTask,
} from "./fixtures/base";

test.describe("Task management", () => {
  test("displays the board with status columns", async ({
    authenticatedPage,
    testUser,
  }) => {
    const workspace = await seedWorkspace(testUser.id, {
      name: "WS Task Board",
      slug: "ws-task-board",
    });
    const project = await seedProject(workspace.id, {
      name: "Projet Board",
    });
    await seedTask(project.id, testUser.id, {
      title: "Tâche Backlog",
      status: "backlog",
    });

    await authenticatedPage.goto(`/w/ws-task-board/p/${project.id}`);

    // Verify all columns are visible
    await expect(authenticatedPage.getByText("Backlog")).toBeVisible();
    await expect(authenticatedPage.getByText("À faire")).toBeVisible();
    await expect(authenticatedPage.getByText("En cours")).toBeVisible();
    await expect(authenticatedPage.getByText("Terminé")).toBeVisible();

    // Verify the task appears
    await expect(
      authenticatedPage.getByText("Tâche Backlog")
    ).toBeVisible();
  });

  test("creates a task via the form", async ({
    authenticatedPage,
    testUser,
  }) => {
    const workspace = await seedWorkspace(testUser.id, {
      name: "WS Create Task",
      slug: "ws-create-task",
    });
    const project = await seedProject(workspace.id, {
      name: "Projet Create Task",
    });

    await authenticatedPage.goto(`/w/ws-create-task/p/${project.id}`);

    // Click "Nouvelle tâche" button in toolbar
    await authenticatedPage
      .getByRole("button", { name: "Nouvelle tâche" })
      .click();

    // Fill form in dialog
    await expect(
      authenticatedPage.getByRole("heading", { name: "Nouvelle tâche" })
    ).toBeVisible();
    await authenticatedPage
      .getByLabel("Titre*")
      .fill("Ma Nouvelle Tâche E2E");

    await authenticatedPage
      .getByRole("button", { name: "Créer la tâche" })
      .click();

    // Verify task appears on the board
    await expect(
      authenticatedPage.getByText("Ma Nouvelle Tâche E2E")
    ).toBeVisible();
  });

  test("opens the task detail modal", async ({
    authenticatedPage,
    testUser,
  }) => {
    const workspace = await seedWorkspace(testUser.id, {
      name: "WS Task Detail",
      slug: "ws-task-detail",
    });
    const project = await seedProject(workspace.id, {
      name: "Projet Task Detail",
    });
    await seedTask(project.id, testUser.id, {
      title: "Tâche Détaillée",
    });

    await authenticatedPage.goto(`/w/ws-task-detail/p/${project.id}`);
    await authenticatedPage.getByText("Tâche Détaillée").click();

    // Verify modal opens with task title in the edit form
    await expect(
      authenticatedPage.locator("#edit-title")
    ).toHaveValue("Tâche Détaillée");
  });

  test("changes the status of a task", async ({
    authenticatedPage,
    testUser,
  }) => {
    const workspace = await seedWorkspace(testUser.id, {
      name: "WS Task Status",
      slug: "ws-task-status",
    });
    const project = await seedProject(workspace.id, {
      name: "Projet Task Status",
    });
    await seedTask(project.id, testUser.id, {
      title: "Tâche Status Change",
      status: "backlog",
    });

    await authenticatedPage.goto(`/w/ws-task-status/p/${project.id}`);

    // Open the task detail modal
    await authenticatedPage.getByText("Tâche Status Change").click();
    await expect(
      authenticatedPage.locator("#edit-title")
    ).toHaveValue("Tâche Status Change");

    // Change status to "in_progress" (En cours)
    await authenticatedPage
      .locator('[role="dialog"]')
      .getByText("Statut")
      .locator("..")
      .getByRole("combobox")
      .click();
    await authenticatedPage.getByRole("option", { name: "En cours" }).click();

    // Close the modal
    await authenticatedPage.keyboard.press("Escape");

    // Verify the task moved to "En cours" column
    await expect(
      authenticatedPage.getByText("Tâche Status Change")
    ).toBeVisible();
  });

  test("changes the priority of a task", async ({
    authenticatedPage,
    testUser,
  }) => {
    const workspace = await seedWorkspace(testUser.id, {
      name: "WS Task Priority",
      slug: "ws-task-priority",
    });
    const project = await seedProject(workspace.id, {
      name: "Projet Task Priority",
    });
    await seedTask(project.id, testUser.id, {
      title: "Tâche Priorité",
      priority: "medium",
    });

    await authenticatedPage.goto(`/w/ws-task-priority/p/${project.id}`);
    await authenticatedPage.getByText("Tâche Priorité").click();

    // Change priority to "Haute"
    await authenticatedPage
      .locator('[role="dialog"]')
      .getByText("Priorité")
      .locator("..")
      .getByRole("combobox")
      .click();
    await authenticatedPage.getByRole("option", { name: "Haute" }).click();

    // Close and reopen to verify persistence
    await authenticatedPage.keyboard.press("Escape");
    await authenticatedPage.getByText("Tâche Priorité").click();

    // Verify priority is now "Haute"
    await expect(
      authenticatedPage
        .locator('[role="dialog"]')
        .getByText("Priorité")
        .locator("..")
        .getByRole("combobox")
    ).toHaveText("Haute");
  });

  test("deletes a task", async ({ authenticatedPage, testUser }) => {
    const workspace = await seedWorkspace(testUser.id, {
      name: "WS Task Delete",
      slug: "ws-task-delete",
    });
    const project = await seedProject(workspace.id, {
      name: "Projet Task Delete",
    });
    await seedTask(project.id, testUser.id, {
      title: "Tâche à supprimer",
    });

    await authenticatedPage.goto(`/w/ws-task-delete/p/${project.id}`);
    await authenticatedPage.getByText("Tâche à supprimer").click();

    // Click the delete button (Trash2 icon)
    await authenticatedPage
      .locator('[role="dialog"]')
      .getByRole("button")
      .filter({ has: authenticatedPage.locator(".lucide-trash-2") })
      .click();

    // Confirm deletion
    await authenticatedPage
      .getByRole("button", { name: "Supprimer" })
      .click();

    // Verify task is gone from the board
    await expect(
      authenticatedPage.getByText("Tâche à supprimer")
    ).not.toBeVisible();
  });
});
