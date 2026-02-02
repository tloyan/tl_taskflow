import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardLayoutClient from "@/shared/components/layouts/dashboard-layout-client";
import { getCurrentUserDal } from "@/features/auth/auth-dal";
import { AuthProvider } from "@/features/auth/auth-context";
import { getAllWorkspacesWithCountsDal } from "@/features/workspace/workspace-dal";
import { getAllProjectsDal } from "@/features/project/project-dal";

type DashboardLayoutProps = {
  children: Readonly<React.ReactNode>;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await getCurrentUserDal();
  const [workspaces, projects] = await Promise.all([
    getAllWorkspacesWithCountsDal(),
    getAllProjectsDal(),
  ]);

  return (
    <div className="flex min-h-dvh w-full">
      <SidebarProvider>
        <AuthProvider user={user}>
          <DashboardLayoutClient workspaces={workspaces} projects={projects}>
            {children}
          </DashboardLayoutClient>
        </AuthProvider>
      </SidebarProvider>
    </div>
  );
}
