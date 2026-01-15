"use client";

import { Project, WorkspaceWithCounts } from "@/shared/mocks";
import AppSidebar from "@/shared/components/sidebar/app-sidebar";
import DashboardHeader from "@/shared/components/layouts/dashboard-header";
import { useParams } from "next/navigation";

type DashboardLayoutClientProps = {
  children: Readonly<React.ReactNode>;
  workspaces: WorkspaceWithCounts[];
  projects: Project[];
};

export default function DashboardLayoutClient({
  workspaces,
  projects,
  children,
}: DashboardLayoutClientProps) {
  const { slug, projectId } = useParams();
  const currentWorkspace = workspaces.find((w) => w.slug === slug);
  const workspaceProjects = projects.filter(
    ({ workspaceId }) => workspaceId === currentWorkspace?.id
  );
  const currentProject = workspaceProjects.find(({ id }) => id === projectId);
  return (
    <>
      <AppSidebar
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
        projects={workspaceProjects}
        membersCount={currentWorkspace?.membersCount}
      />

      <div className="flex flex-1 flex-col">
        <DashboardHeader
          currentWorkspace={currentWorkspace}
          currentProject={currentProject}
        />
        <main className="mx-auto size-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </>
  );
}
