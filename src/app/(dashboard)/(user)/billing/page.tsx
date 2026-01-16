import { CreditCardIcon, PartyPopperIcon } from "lucide-react";

import { HireMeFooter, HireMeSection } from "@/shared/components/hire-me";

export default function BillingPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-8 p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/20">
          <PartyPopperIcon className="size-12 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">C&apos;est gratuit !</h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Pas de facture, pas de stress. Ce projet est une demo open-source.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-3">
          <CreditCardIcon className="size-5 text-muted-foreground" />
          <span className="text-sm">
            Votre solde : <span className="font-mono font-bold text-green-600">infini</span>
          </span>
        </div>
      </div>

      <HireMeSection />
      <HireMeFooter />
    </div>
  );
}
