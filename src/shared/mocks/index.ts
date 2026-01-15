// Mock data - will be replaced with real data from database

// ============================================================================
// Types (matching database schema)
// ============================================================================

export type User = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: Date;
};

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WorkspaceMemberRole = "owner" | "admin" | "member" | "viewer";

export type WorkspaceMember = {
  workspaceId: string;
  userId: string;
  role: WorkspaceMemberRole;
  joinedAt: Date;
};

export type ProjectStatus = "active" | "archived";

export type Project = {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
  status: ProjectStatus;
  color: string;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================================================
// Mock Users
// ============================================================================

export const users: User[] = [
  {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    image: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "user-2",
    name: "Marie Martin",
    email: "marie@example.com",
    image: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png",
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "user-3",
    name: "Pierre Durand",
    email: "pierre@example.com",
    image: null,
    createdAt: new Date("2024-03-01"),
  },
];

// ============================================================================
// Mock Workspaces
// ============================================================================

export const workspaces: Workspace[] = [
  {
    id: "ws-1",
    name: "Acme Corp",
    slug: "acme-corp",
    description: "Workspace de l'équipe Acme",
    ownerId: "user-1",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "ws-2",
    name: "Perso",
    slug: "perso",
    description: null,
    ownerId: "user-1",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
];

// ============================================================================
// Mock Workspace Members
// ============================================================================

export const workspaceMembers: WorkspaceMember[] = [
  {
    workspaceId: "ws-1",
    userId: "user-1",
    role: "owner",
    joinedAt: new Date("2024-01-15"),
  },
  {
    workspaceId: "ws-1",
    userId: "user-2",
    role: "admin",
    joinedAt: new Date("2024-01-20"),
  },
  {
    workspaceId: "ws-1",
    userId: "user-3",
    role: "member",
    joinedAt: new Date("2024-02-01"),
  },
  {
    workspaceId: "ws-2",
    userId: "user-1",
    role: "owner",
    joinedAt: new Date("2024-02-01"),
  },
];

// ============================================================================
// Mock Projects
// ============================================================================

export const projects: Project[] = [
  {
    id: "proj-1",
    name: "Website Redesign",
    description: "Refonte complète du site web corporate",
    workspaceId: "ws-1",
    status: "active",
    color: "#4287f5",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "proj-2",
    name: "Mobile App",
    description: "Application mobile iOS et Android",
    workspaceId: "ws-1",
    status: "active",
    color: "#42f58a",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
  {
    id: "proj-3",
    name: "API v2",
    description: "Nouvelle version de l'API REST",
    workspaceId: "ws-1",
    status: "archived",
    color: "#bf42f5",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-03-15"),
  },
  {
    id: "proj-4",
    name: "Side Project",
    description: null,
    workspaceId: "ws-2",
    status: "active",
    color: "#f58742",
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-15"),
  },
  {
    id: "proj-5",
    name: "Blog Personnel",
    description: "Mon blog tech",
    workspaceId: "ws-2",
    status: "active",
    color: "#f542f2",
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01"),
  },
];

// ============================================================================
// Helper functions (simulating async database queries)
// ============================================================================

// Simulate network delay (50-150ms)
const simulateDelay = () =>
  new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100));

export async function getWorkspaceBySlug(
  slug: string
): Promise<Workspace | undefined> {
  await simulateDelay();
  return workspaces.find((w) => w.slug === slug);
}

export async function getProjectsByWorkspaceId(
  workspaceId: string
): Promise<Project[]> {
  await simulateDelay();
  return projects.filter((p) => p.workspaceId === workspaceId);
}

export async function getProjectById(
  projectId: string
): Promise<Project | undefined> {
  await simulateDelay();
  return projects.find((p) => p.id === projectId);
}

export async function getMembersByWorkspaceId(
  workspaceId: string
): Promise<WorkspaceMember[]> {
  await simulateDelay();
  return workspaceMembers.filter((m) => m.workspaceId === workspaceId);
}

export type WorkspaceWithCounts = Workspace & {
  projectsCount: number;
  membersCount: number;
};

export async function getWorkspaceWithCounts(
  workspace: Workspace
): Promise<WorkspaceWithCounts> {
  await simulateDelay();
  const projectsCount = projects.filter(
    (p) => p.workspaceId === workspace.id
  ).length;
  const membersCount = workspaceMembers.filter(
    (m) => m.workspaceId === workspace.id
  ).length;

  return {
    ...workspace,
    projectsCount,
    membersCount,
  };
}

export async function getAllWorkspacesWithCounts(): Promise<
  WorkspaceWithCounts[]
> {
  await simulateDelay();
  return workspaces.map((workspace) => {
    const projectsCount = projects.filter(
      (p) => p.workspaceId === workspace.id
    ).length;
    const membersCount = workspaceMembers.filter(
      (m) => m.workspaceId === workspace.id
    ).length;
    return { ...workspace, projectsCount, membersCount };
  });
}

export async function getAllProjects(): Promise<Project[]> {
  await simulateDelay();
  return projects;
}

export async function getCurrentUser(): Promise<User> {
  await simulateDelay();
  return users[0];
}
