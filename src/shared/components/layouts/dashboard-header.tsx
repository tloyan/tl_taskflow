"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Workspace } from "@/features/workspace/workspace-types";
import { Project } from "@/shared/mocks";
import Link from "next/link";

type DashboardHeaderProps = {
  currentWorkspace?: Workspace;
  currentProject?: Project;
};

export default function DashboardHeader({
  currentWorkspace,
  currentProject,
}: DashboardHeaderProps) {
  return (
    <header className="bg-card sticky top-0 z-50 border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2 sm:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="[&_svg]:!size-5" />
          <Separator orientation="vertical" className="hidden !h-4 sm:block" />
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              {currentWorkspace && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {currentProject ? (
                      <BreadcrumbLink asChild>
                        <Link href={`/w/${currentWorkspace.slug}`}>
                          {currentWorkspace.name}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{currentWorkspace.name}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </>
              )}

              {currentProject && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{currentProject.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
    </header>
  );
}
