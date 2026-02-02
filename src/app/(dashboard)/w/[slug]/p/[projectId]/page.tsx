import { getWorkspaceBySlugDal } from "@/features/workspace/workspace-dal";
import { getProjectByIdDal } from "@/features/project/project-dal";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; projectId: string }>;
}) {
  const { slug, projectId } = await params;
  const workspace = await getWorkspaceBySlugDal(slug);
  const project = await getProjectByIdDal(projectId);

  if (project.workspaceId !== workspace.id) {
    notFound();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="size-3 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.status === "archived" && (
            <span className="text-muted-foreground text-sm">(archivé)</span>
          )}
        </div>
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/w/${slug}/p/${projectId}/settings`}>
            <SettingsIcon className="size-4" />
          </Link>
        </Button>
      </div>
      {project.description && (
        <p className="text-muted-foreground mt-1">{project.description}</p>
      )}

      <div className="text-muted-foreground mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-lg">Tâches</p>
        <p className="text-sm">
          Les tâches seront disponibles prochainement.
        </p>
      </div>
    </div>
  );
}
