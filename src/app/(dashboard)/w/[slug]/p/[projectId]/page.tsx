import { getWorkspaceBySlug, getProjectById } from "@/shared/mocks";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; projectId: string }>;
}) {
  const { slug, projectId } = await params;
  const workspace = await getWorkspaceBySlug(slug);

  if (!workspace) {
    notFound();
  }

  const project = await getProjectById(projectId);

  if (!project || project.workspaceId !== workspace.id) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{project.name}</h1>
      {project.description && (
        <p className="text-muted-foreground">{project.description}</p>
      )}

      <div className="mt-6">
        <div className="flex items-center gap-2">
          <span
            className="size-3 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <span className="text-sm capitalize text-muted-foreground">
            {project.status.replace("_", " ")}
          </span>
        </div>
      </div>
    </div>
  );
}
