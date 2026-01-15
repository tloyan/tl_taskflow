"use client";

import SidebarUserDropdown from "./sidebar-user-dropdown";
import SidebarWorkspaceSwitcher from "./sidebar-workspace-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  PlusIcon,
  SettingsIcon,
  SquareIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import SidebarNavGroup, { MenuItem } from "./sidebar-nav-group";
import { Project, WorkspaceWithCounts } from "@/shared/mocks";

type AppSidebarProps = {
  workspaces: WorkspaceWithCounts[];
  currentWorkspace?: WorkspaceWithCounts;
  projects?: Project[];
  membersCount?: number;
};

export default function AppSidebar({
  workspaces,
  currentWorkspace,
  projects = [],
  membersCount = 0,
}: AppSidebarProps) {
  const workspaceSlug = currentWorkspace?.slug;

  // Menu items - only shown when a workspace is selected
  const menuItems: MenuItem[] = workspaceSlug
    ? [
        {
          icon: LayoutDashboardIcon,
          label: "Dashboard",
          href: `/w/${workspaceSlug}`,
        },
      ]
    : [];

  // Project items from props
  const projectItems: MenuItem[] = [
    ...projects
      .filter((p) => p.status === "active")
      .map((project) => ({
        icon: SquareIcon,
        iconColor: project.color ?? "#6a7282",
        label: project.name,
        href: `/w/${workspaceSlug}/p/${project.id}`,
      })),
    ...(workspaceSlug
      ? [
          {
            icon: PlusIcon,
            iconColor: "var(--color-muted-foreground)",
            label: "New Project",
            href: `/w/${workspaceSlug}/p/new`,
          },
        ]
      : []),
  ];

  // Settings items - only shown when a workspace is selected
  const settingsItems: MenuItem[] = workspaceSlug
    ? [
        {
          icon: UserIcon,
          label: "Members",
          href: `/w/${workspaceSlug}/members`,
          badge: membersCount > 0 ? String(membersCount) : undefined,
        },
        {
          icon: SettingsIcon,
          label: "Settings",
          href: `/w/${workspaceSlug}/settings`,
        },
      ]
    : [];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarWorkspaceSwitcher
          workspaces={workspaces}
          currentWorkspace={currentWorkspace}
        />
      </SidebarHeader>
      <SidebarContent>
        {menuItems.length > 0 && <SidebarNavGroup data={menuItems} />}
        {projectItems.length > 0 && (
          <SidebarNavGroup data={projectItems} groupLabel="Projects" />
        )}
        {settingsItems.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarNavGroup data={settingsItems} />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="New workspace" asChild>
            <Link href="/w/new">
              <PlusIcon />
              <span>New Workspace</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarUserDropdown />
      </SidebarFooter>
    </Sidebar>
  );
}
