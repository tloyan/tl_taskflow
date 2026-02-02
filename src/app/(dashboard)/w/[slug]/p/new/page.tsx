import { getWorkspaceBySlugDal } from "@/features/workspace/workspace-dal";
import CreateProjectForm from "@/features/project/components/create-project-form";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workspace = await getWorkspaceBySlugDal(slug);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nouveau projet</h1>
        <p className="text-muted-foreground">
          Créez un projet pour organiser vos tâches
        </p>
      </div>

      <div className="max-w-lg rounded-lg border p-6">
        <CreateProjectForm
          workspaceId={workspace.id}
          workspaceSlug={slug}
        />
      </div>
    </div>
  );
}
