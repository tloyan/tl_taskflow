import { getAllWorkspacesWithCountsDal } from "@/features/workspace/workspace-dal";
import Link from "next/link";

export default async function Page() {
  const workspaces = await getAllWorkspacesWithCountsDal();

  return (
    <div>
      <h1 className="text-2xl font-bold">All Workspaces</h1>
      <p className="text-muted-foreground">Select a workspace to get started</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((workspace) => (
          <Link
            key={workspace.id}
            href={`/w/${workspace.slug}`}
            className="rounded-lg border p-4 transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-semibold">
                  {workspace.name[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{workspace.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {workspace.projectsCount} projects · {workspace.membersCount}{" "}
                  members
                </p>
              </div>
            </div>
            {workspace.description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {workspace.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
