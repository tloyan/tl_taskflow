"use client";

import {
  CheckIcon,
  ChevronsUpDownIcon,
  LayoutGridIcon,
  PlusIcon,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { WorkspaceWithCounts } from "@/shared/mocks";

type SidebarWorkspaceSwitcherProps = {
  workspaces: WorkspaceWithCounts[];
  currentWorkspace?: WorkspaceWithCounts;
};

export default function SidebarWorkspaceSwitcher({
  workspaces,
  currentWorkspace,
}: SidebarWorkspaceSwitcherProps) {
  const { isMobile } = useSidebar();

  const isAllWorkspacesView = !currentWorkspace;

  const displayName = isAllWorkspacesView
    ? "All Workspaces"
    : currentWorkspace.name;

  const displayInitial = isAllWorkspacesView
    ? "A"
    : currentWorkspace.name[0].toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-semibold">{displayInitial}</span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{displayName}</span>
                {!isAllWorkspacesView && (
                  <span className="truncate text-xs text-muted-foreground">
                    {currentWorkspace?.projectsCount} projects ·{" "}
                    {currentWorkspace?.membersCount} members
                  </span>
                )}
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Switch Workspace
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.slug}
                  className="gap-3 p-2"
                  asChild
                >
                  <Link href={`/w/${workspace.slug}`}>
                    <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <span className="text-sm font-semibold">
                        {workspace.name[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium">
                        {workspace.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {workspace.projectsCount} projects ·{" "}
                        {workspace.membersCount} members
                      </span>
                    </div>
                    {currentWorkspace?.id === workspace.id && (
                      <CheckIcon className="size-4 text-primary" />
                    )}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-3 p-2" asChild>
              <Link href="/">
                <LayoutGridIcon className="size-4" />
                <span className="flex-1 text-sm">All Workspaces</span>
                {isAllWorkspacesView && (
                  <CheckIcon className="size-4 text-primary" />
                )}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3 p-2" asChild>
              <Link href="/w/new">
                <PlusIcon className="size-4" />
                <span className="text-sm">New Workspace</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
