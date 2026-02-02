import { getWorkspaceBySlugDal } from "@/features/workspace/workspace-dal";
import { getProjectByIdDal } from "@/features/project/project-dal";
import { getTasksByProjectIdDal } from "@/features/task/task-dal";
import { getCommentsByTaskIdDal } from "@/features/comment/comment-dal";
import {
  getWorkspaceMembersDal,
  getCurrentMemberDal,
} from "@/features/member/member-dal";
import { getCurrentUserDal } from "@/features/auth/auth-dal";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskView from "@/features/task/components/task-view";

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

  const [tasks, members, currentMember, currentUser] = await Promise.all([
    getTasksByProjectIdDal(projectId),
    getWorkspaceMembersDal(slug),
    getCurrentMemberDal(slug),
    getCurrentUserDal(),
  ]);

  // Fetch comments for all tasks
  const allComments = (
    await Promise.all(
      tasks.map((task) => getCommentsByTaskIdDal(task.id))
    )
  ).flat();

  const pathToRevalidate = `/w/${slug}/p/${projectId}`;

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

      <div className="mt-6">
        <TaskView
          tasks={tasks}
          members={members}
          comments={allComments}
          projectId={projectId}
          currentUserId={currentUser?.id ?? ""}
          currentUserRole={currentMember?.role ?? "viewer"}
          pathToRevalidate={pathToRevalidate}
        />
      </div>
    </div>
  );
}
