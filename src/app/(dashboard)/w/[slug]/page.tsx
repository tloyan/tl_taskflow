import { getWorkspaceBySlugDal } from "@/features/workspace/workspace-dal";
import ProjectList from "@/features/project/components/project-list";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workspace = await getWorkspaceBySlugDal(slug);

  return (
    <div>
      <h1 className="text-2xl font-bold">{workspace.name}</h1>
      {workspace.description && (
        <p className="text-muted-foreground">{workspace.description}</p>
      )}

      <div className="mt-6">
        <ProjectList workspaceId={workspace.id} workspaceSlug={slug} />
      </div>
    </div>
  );
}
