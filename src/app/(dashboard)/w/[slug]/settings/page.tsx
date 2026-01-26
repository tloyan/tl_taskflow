import { getWorkspaceBySlugDal } from "@/features/workspace/workspace-dal";
import UpdateWorkspaceForm from "@/features/workspace/components/update-workspace-form";
import DeleteWorkspaceDialog from "@/features/workspace/components/delete-workspace-dialog";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workspace = await getWorkspaceBySlugDal(slug);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Paramètres du workspace</h1>
        <p className="text-muted-foreground">
          Gérez les paramètres de votre workspace
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold">Informations générales</h2>
        <UpdateWorkspaceForm workspace={workspace} />
      </div>

      <div className="rounded-lg border border-destructive/50 p-6">
        <h2 className="mb-2 text-lg font-semibold text-destructive">
          Zone dangereuse
        </h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Cette action est irréversible. Tous les projets et tâches seront
          définitivement supprimés.
        </p>
        <DeleteWorkspaceDialog workspace={workspace} />
      </div>
    </div>
  );
}
