import {
  test,
  expect,
  seedWorkspace,
  seedProject,
  seedTask,
  seedComment,
} from "./fixtures/base";

test.describe("Comment management", () => {
  test("adds a comment to a task", async ({
    authenticatedPage,
    testUser,
  }) => {
    const workspace = await seedWorkspace(testUser.id, {
      name: "WS Comment Add",
      slug: "ws-comment-add",
    });
    const project = await seedProject(workspace.id, {
      name: "Projet Comment Add",
    });
    await seedTask(project.id, testUser.id, {
      title: "Tâche avec commentaire",
    });

    await authenticatedPage.goto(`/w/ws-comment-add/p/${project.id}`);
    await authenticatedPage.getByText("Tâche avec commentaire").click();

    // Fill and submit comment
    await authenticatedPage
      .getByPlaceholder("Ajouter un commentaire...")
      .fill("Mon commentaire E2E");
    await authenticatedPage
      .locator('[role="dialog"]')
      .locator("button[type='submit']")
      .last()
      .click();

    // Verify comment appears
    await expect(
      authenticatedPage.getByText("Mon commentaire E2E")
    ).toBeVisible();
  });

  test("displays existing comments", async ({
    authenticatedPage,
    testUser,
  }) => {
    const workspace = await seedWorkspace(testUser.id, {
      name: "WS Comment Display",
      slug: "ws-comment-display",
    });
    const project = await seedProject(workspace.id, {
      name: "Projet Comment Display",
    });
    const task = await seedTask(project.id, testUser.id, {
      title: "Tâche commentée",
    });
    await seedComment(task.id, testUser.id, {
      content: "Commentaire existant",
    });

    await authenticatedPage.goto(`/w/ws-comment-display/p/${project.id}`);
    await authenticatedPage.getByText("Tâche commentée").click();

    // Verify seeded comment is visible
    await expect(
      authenticatedPage.getByText("Commentaire existant")
    ).toBeVisible();
  });

  test("deletes a comment", async ({ authenticatedPage, testUser }) => {
    const workspace = await seedWorkspace(testUser.id, {
      name: "WS Comment Delete",
      slug: "ws-comment-delete",
    });
    const project = await seedProject(workspace.id, {
      name: "Projet Comment Delete",
    });
    const task = await seedTask(project.id, testUser.id, {
      title: "Tâche suppression commentaire",
    });
    await seedComment(task.id, testUser.id, {
      content: "Commentaire à supprimer",
    });

    await authenticatedPage.goto(`/w/ws-comment-delete/p/${project.id}`);
    await authenticatedPage
      .getByText("Tâche suppression commentaire")
      .click();

    // Verify comment is visible
    await expect(
      authenticatedPage.getByText("Commentaire à supprimer")
    ).toBeVisible();

    // Click delete button on the comment (Trash2 icon)
    const commentSection = authenticatedPage.locator('[role="dialog"]');
    await commentSection
      .locator("text=Commentaire à supprimer")
      .locator("..")
      .locator("..")
      .getByRole("button")
      .filter({ has: authenticatedPage.locator(".lucide-trash-2") })
      .click();

    // Verify comment is removed
    await expect(
      authenticatedPage.getByText("Commentaire à supprimer")
    ).not.toBeVisible();
  });
});
