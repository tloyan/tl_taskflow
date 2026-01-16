import { SettingsIcon, WrenchIcon } from "lucide-react";

import { HireMeFooter, HireMeSection } from "@/shared/components/hire-me";

export default function SettingsPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-8 p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="rounded-full bg-orange-100 p-4 dark:bg-orange-900/20">
          <WrenchIcon className="size-12 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Bientot disponible...</h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Les settings arrivent dans une future version.
            Ou pas ? Tout dépend si vous me recrutez !
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-3">
          <SettingsIcon className="size-5 animate-spin text-muted-foreground [animation-duration:3s]" />
          <span className="text-sm">
            Configuration en cours... depuis <span className="font-mono">undefined</span> jours
          </span>
        </div>
      </div>

      <HireMeSection />
      <HireMeFooter />
    </div>
  );
}
