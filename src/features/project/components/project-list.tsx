import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { getProjectsByWorkspaceIdDal } from "../project-dal";
import ProjectCard from "./project-card";

type ProjectListProps = {
  workspaceId: string;
  workspaceSlug: string;
};

export default async function ProjectList({
  workspaceId,
  workspaceSlug,
}: ProjectListProps) {
  const projects = await getProjectsByWorkspaceIdDal(workspaceId);
  const activeProjects = projects.filter((p) => p.status === "active");
  const archivedProjects = projects.filter((p) => p.status === "archived");

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-muted-foreground mb-4 text-lg">Aucun projet</p>
        <p className="text-muted-foreground mb-6 text-sm">
          Créez votre premier projet pour organiser vos tâches.
        </p>
        <Button asChild>
          <Link href={`/w/${workspaceSlug}/p/new`}>
            <PlusIcon className="mr-2 size-4" />
            Créer un projet
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Projets ({activeProjects.length})
        </h2>
        <Button asChild size="sm">
          <Link href={`/w/${workspaceSlug}/p/new`}>
            <PlusIcon className="mr-2 size-4" />
            Nouveau projet
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        {activeProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            workspaceSlug={workspaceSlug}
          />
        ))}
      </div>

      {archivedProjects.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-muted-foreground text-sm font-medium">
            Archivés ({archivedProjects.length})
          </h3>
          {archivedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              workspaceSlug={workspaceSlug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
