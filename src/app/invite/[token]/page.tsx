import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getInvitationDetails } from "@/features/member/member-service";
import {
  InvitationNotFoundError,
  InvitationExpiredError,
  InvitationInvalidError,
} from "@/features/member/member-errors";
import { AcceptInvitationClient } from "./accept-invitation-client";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`);
  }

  try {
    const details = await getInvitationDetails(token);

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-xl border p-8 text-center">
          <h1 className="mb-2 text-xl font-bold">Vous êtes invité(e) !</h1>
          <p className="text-muted-foreground mb-6 text-sm">
            <strong>{details.inviterName}</strong> vous invite à rejoindre le
            workspace <strong>{details.workspaceName}</strong> en tant que{" "}
            <strong>{details.roleLabel}</strong>.
          </p>
          <AcceptInvitationClient token={token} />
        </div>
      </div>
    );
  } catch (error) {
    let message = "Une erreur est survenue";

    if (error instanceof InvitationNotFoundError) {
      message = "Cette invitation est introuvable";
    } else if (error instanceof InvitationExpiredError) {
      message = "Cette invitation a expiré";
    } else if (error instanceof InvitationInvalidError) {
      message = error.message;
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-xl border p-8 text-center">
          <h1 className="mb-2 text-xl font-bold">Invitation invalide</h1>
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>
      </div>
    );
  }
}
