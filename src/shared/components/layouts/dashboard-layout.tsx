import { SidebarProvider } from "@/components/ui/sidebar";
import { getAllWorkspacesWithCounts, getAllProjects } from "@/shared/mocks";
import DashboardLayoutClient from "@/shared/components/layouts/dashboard-layout-client";

type DashboardLayoutProps = {
  children: Readonly<React.ReactNode>;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const workspaces = await getAllWorkspacesWithCounts();
  const projects = await getAllProjects();

  return (
    <div className="flex min-h-dvh w-full">
      <SidebarProvider>
        <DashboardLayoutClient workspaces={workspaces} projects={projects}>
          {children}
        </DashboardLayoutClient>
      </SidebarProvider>
    </div>
  );
}
