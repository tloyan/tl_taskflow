import Link from "next/link";
import type { Project } from "../project-types";

type ProjectCardProps = {
  project: Project;
  workspaceSlug: string;
};

export default function ProjectCard({
  project,
  workspaceSlug,
}: ProjectCardProps) {
  return (
    <Link
      href={`/w/${workspaceSlug}/p/${project.id}`}
      className="block rounded-lg border p-4 transition-colors hover:bg-muted"
    >
      <div className="flex items-center gap-3">
        <span
          className="size-3 shrink-0 rounded-full"
          style={{ backgroundColor: project.color }}
        />
        <span className="font-medium">{project.name}</span>
        {project.status === "archived" && (
          <span className="text-muted-foreground text-xs">(archivé)</span>
        )}
      </div>
      {project.description && (
        <p className="text-muted-foreground mt-1 pl-6 text-sm">
          {project.description}
        </p>
      )}
    </Link>
  );
}
