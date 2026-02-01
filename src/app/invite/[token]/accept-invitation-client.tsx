"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { acceptInvitationAction } from "@/features/member/member-actions";

export function AcceptInvitationClient({ token }: { token: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAccept() {
    startTransition(async () => {
      const result = await acceptInvitationAction(token);

      if ("error" in result) {
        setError(result.error.message);
        return;
      }

      router.push(`/w/${result.slug}/members`);
    });
  }

  return (
    <div>
      <Button onClick={handleAccept} disabled={isPending} className="w-full">
        {isPending ? "Acceptation en cours…" : "Accepter l'invitation"}
      </Button>
      {error && (
        <p className="text-destructive mt-3 text-sm">{error}</p>
      )}
    </div>
  );
}
