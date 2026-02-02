import { getWorkspaceBySlugDal } from "@/features/workspace/workspace-dal";
import { getProjectByIdDal } from "@/features/project/project-dal";
import { notFound } from "next/navigation";
import UpdateProjectForm from "@/features/project/components/update-project-form";
import DeleteProjectDialog from "@/features/project/components/delete-project-dialog";
import ArchiveProjectDialog from "@/features/project/components/archive-project-dialog";

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Paramètres du projet</h1>
        <p className="text-muted-foreground">
          Gérez les paramètres de votre projet
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold">Informations générales</h2>
        <UpdateProjectForm project={project} />
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="mb-2 text-lg font-semibold">Archivage</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          {project.status === "archived"
            ? "Ce projet est archivé. Vous pouvez le restaurer."
            : "Le projet sera masqué mais pourra être restauré."}
        </p>
        <ArchiveProjectDialog project={project} />
      </div>

      <div className="rounded-lg border border-destructive/50 p-6">
        <h2 className="mb-2 text-lg font-semibold text-destructive">
          Zone dangereuse
        </h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Cette action est irréversible. Toutes les tâches seront
          définitivement supprimées.
        </p>
        <DeleteProjectDialog project={project} workspaceSlug={slug} />
      </div>
    </div>
  );
}
