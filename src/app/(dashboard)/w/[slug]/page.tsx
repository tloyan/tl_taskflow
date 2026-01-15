import { getWorkspaceBySlug, getProjectsByWorkspaceId } from "@/shared/mocks";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);

  if (!workspace) {
    notFound();
  }

  const projects = await getProjectsByWorkspaceId(workspace.id);

  return (
    <div>
      <h1 className="text-2xl font-bold">{workspace.name}</h1>
      {workspace.description && (
        <p className="text-muted-foreground">{workspace.description}</p>
      )}

      <h2 className="mt-6 text-xl font-semibold">
        Projects ({projects.length})
      </h2>
      <ul className="mt-2 space-y-2">
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              href={`/w/${slug}/p/${project.id}`}
              className="block rounded border p-3 transition-colors hover:bg-muted"
            >
              <span className="font-medium">{project.name}</span>
              {project.description && (
                <p className="text-sm text-muted-foreground">
                  {project.description}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
