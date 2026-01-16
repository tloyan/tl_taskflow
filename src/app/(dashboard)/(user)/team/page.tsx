import { UserPlusIcon, UsersIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { HireMeFooter, HireMeSection } from "@/shared/components/hire-me";

export default function TeamPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-8 p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/20">
          <UsersIcon className="size-12 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Équipe de 1</h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Pour l&apos;instant, je suis seul sur ce projet.
            Mais avec une bonne équipe, on peut aller loin !
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-lg border bg-muted/50 p-6">
          <div className="flex items-center gap-3">
            <Avatar className="size-12 border-2 border-primary">
              <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png" />
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="font-medium">Moi-meme</p>
              <p className="text-sm text-muted-foreground">
                Fullstack Developer & CEO & CTO & Stagiaire cafe
              </p>
            </div>
          </div>
          <Button variant="outline" className="gap-2" disabled>
            <UserPlusIcon className="size-4" />
            Ajouter un membre (recrutez-moi d&apos;abord !)
          </Button>
        </div>
      </div>

      <HireMeSection />
      <HireMeFooter />
    </div>
  );
}
