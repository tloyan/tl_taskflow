import { SparklesIcon, UserIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HireMeFooter, HireMeSection } from "@/shared/components/hire-me";

export default function AccountPage() {
  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col gap-8 p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <Avatar className="size-24 border-4 border-primary/20">
          <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png" />
          <AvatarFallback>
            <UserIcon className="size-12" />
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Bienvenue, utilisateur VIP !</h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Vous faites partie des rares personnes a explorer cette demo. Merci
            de votre curiosité !
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-3 dark:from-yellow-900/20 dark:to-orange-900/20">
          <SparklesIcon className="size-5 text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm">
            Statut : <span className="font-semibold">Early Adopter</span> (et
            potentiel recruteur ?)
          </span>
        </div>
      </div>

      <HireMeSection />
      <HireMeFooter />
    </div>
  );
}
