import {
  test,
  expect,
  seedWorkspace,
  seedMember,
} from "./fixtures/base";
import { seedUser } from "./helpers/seed";

test.describe("Member management", () => {
  test("displays the member list", async ({
    authenticatedPage,
    testUser,
  }) => {
    const workspace = await seedWorkspace(testUser.id, {
      name: "WS Members List",
      slug: "ws-members-list",
    });

    // Add a second member
    const otherUser = await seedUser({
      name: "Autre Membre",
      email: "autre-membre@test.com",
    });
    await seedMember(workspace.id, otherUser.id, "member");

    await authenticatedPage.goto("/w/ws-members-list/members");
    await expect(
      authenticatedPage.getByRole("heading", { name: "Membres" })
    ).toBeVisible();
    await expect(
      authenticatedPage.getByText(testUser.name)
    ).toBeVisible();
    await expect(
      authenticatedPage.getByText("Autre Membre")
    ).toBeVisible();
  });

  test("invites a member", async ({ authenticatedPage, testUser }) => {
    await seedWorkspace(testUser.id, {
      name: "WS Invite Member",
      slug: "ws-invite-member",
    });

    await authenticatedPage.goto("/w/ws-invite-member/members");

    await authenticatedPage
      .getByRole("button", { name: "Inviter un membre" })
      .click();

    // Fill invitation form
    await expect(
      authenticatedPage.getByRole("heading", { name: "Inviter un membre" })
    ).toBeVisible();
    await authenticatedPage
      .getByLabel("Email")
      .fill("invite-test@exemple.com");

    await authenticatedPage
      .getByRole("button", { name: "Inviter" })
      .filter({ hasNotText: "un membre" })
      .click();

    // Verify success toast
    await expect(
      authenticatedPage.getByText("Invitation envoyée")
    ).toBeVisible();

    // Verify the invitation appears in the pending section
    await expect(
      authenticatedPage.getByText("invite-test@exemple.com")
    ).toBeVisible();
  });

  test("changes a member role", async ({
    authenticatedPage,
    testUser,
  }) => {
    const workspace = await seedWorkspace(testUser.id, {
      name: "WS Change Role",
      slug: "ws-change-role",
    });

    const otherUser = await seedUser({
      name: "Membre Role",
      email: "membre-role@test.com",
    });
    await seedMember(workspace.id, otherUser.id, "member");

    await authenticatedPage.goto("/w/ws-change-role/members");

    // Open the actions dropdown for the other member
    const memberRow = authenticatedPage
      .getByText("Membre Role")
      .locator("../..");
    await memberRow.getByRole("button").last().click();

    // Click "Modifier le rôle"
    await authenticatedPage.getByText("Modifier le rôle").click();

    // Select new role in the dialog
    await expect(
      authenticatedPage.getByRole("heading", { name: "Modifier le rôle" })
    ).toBeVisible();
    await authenticatedPage.getByLabel("Nouveau rôle").click();
    await authenticatedPage
      .getByRole("option", { name: "Administrateur" })
      .click();

    await authenticatedPage
      .getByRole("button", { name: "Confirmer" })
      .click();

    // Verify success toast
    await expect(
      authenticatedPage.getByText("Rôle modifié avec succès")
    ).toBeVisible();
  });

  test("removes a member from the workspace", async ({
    authenticatedPage,
    testUser,
  }) => {
    const workspace = await seedWorkspace(testUser.id, {
      name: "WS Remove Member",
      slug: "ws-remove-member",
    });

    const otherUser = await seedUser({
      name: "Membre Retirable",
      email: "membre-retirable@test.com",
    });
    await seedMember(workspace.id, otherUser.id, "member");

    await authenticatedPage.goto("/w/ws-remove-member/members");
    await expect(
      authenticatedPage.getByText("Membre Retirable")
    ).toBeVisible();

    // Open the actions dropdown for the member
    const memberRow = authenticatedPage
      .getByText("Membre Retirable")
      .locator("../..");
    await memberRow.getByRole("button").last().click();

    // Click "Retirer du workspace"
    await authenticatedPage.getByText("Retirer du workspace").click();

    // Confirm removal
    await expect(
      authenticatedPage.getByRole("heading", {
        name: "Retirer ce membre ?",
      })
    ).toBeVisible();
    await authenticatedPage
      .getByRole("button", { name: "Retirer" })
      .click();

    // Verify success toast
    await expect(
      authenticatedPage.getByText("Membre retiré avec succès")
    ).toBeVisible();

    // Verify member is no longer visible
    await expect(
      authenticatedPage.getByText("Membre Retirable")
    ).not.toBeVisible();
  });
});
