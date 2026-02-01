import { sendEmail } from "@/lib/email";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const roleLabels: Record<string, string> = {
  admin: "Administrateur",
  member: "Membre",
  viewer: "Observateur",
};

export async function sendInvitationEmail({
  to,
  workspaceName,
  inviterName,
  role,
  token,
}: {
  to: string;
  workspaceName: string;
  inviterName: string;
  role: string;
  token: string;
}) {
  const acceptUrl = `${process.env.BETTER_AUTH_URL}/invite/${token}`;
  const roleLabel = roleLabels[role] ?? role;

  const safeInviterName = escapeHtml(inviterName);
  const safeWorkspaceName = escapeHtml(workspaceName);
  const safeRoleLabel = escapeHtml(roleLabel);

  await sendEmail({
    to,
    subject: `Invitation à rejoindre ${safeWorkspaceName} sur TaskFlow`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="margin-bottom: 16px;">Vous êtes invité(e) !</h2>
        <p>
          <strong>${safeInviterName}</strong> vous invite à rejoindre le workspace
          <strong>${safeWorkspaceName}</strong> en tant que <strong>${safeRoleLabel}</strong>.
        </p>
        <div style="margin: 32px 0; text-align: center;">
          <a
            href="${acceptUrl}"
            style="
              display: inline-block;
              padding: 12px 24px;
              background-color: #171717;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
            "
          >
            Accepter l'invitation
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          Cette invitation expire dans 7 jours. Si vous n'avez pas de compte,
          vous devrez d'abord en créer un avec cette adresse email.
        </p>
      </div>
    `,
  });
}
