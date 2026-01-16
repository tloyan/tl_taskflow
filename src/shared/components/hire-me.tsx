import { GithubIcon, LinkedinIcon, MailIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const CONTACT_LINKS = {
  linkedin: "https://linkedin.com/in/thomas-loyan",
  github: "https://github.com/tloyan",
  email: "mailto:thomas.loyan@gmail.com",
};

export function HireMeFooter() {
  return (
    <footer className="mt-auto border-t pt-6">
      <div className="flex flex-col items-center gap-3 text-center text-sm text-muted-foreground">
        <p>
          Ce projet est une demo.{" "}
          <span className="font-medium text-foreground">
            Envie de voir ce que je peux faire pour vous ?
          </span>
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link
              href={CONTACT_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkedinIcon className="size-4" />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link
              href={CONTACT_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon className="size-4" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link
              href={`${CONTACT_LINKS.email}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MailIcon className="size-4" />
              <span className="sr-only">Email</span>
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}

export function HireMeSection() {
  return (
    <section className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-primary/10 p-3">
          <MailIcon className="size-6 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Disponible pour un CDI</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Fullstack developer passionné par React, Next.js et TypeScript. Ce
            projet démontre mes compétences en développement moderne.
            Contactez-moi !
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link
              href={CONTACT_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkedinIcon className="mr-2 size-4" />
              LinkedIn
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link
              href={CONTACT_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon className="mr-2 size-4" />
              GitHub
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={CONTACT_LINKS.email} rel="noopener noreferrer">
              <MailIcon className="mr-2 size-4" />
              Email
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
