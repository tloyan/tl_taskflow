# Architecture

Structure complète du projet par feature.

```
src/
├── app/
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                          # Landing page
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── verify/
│   │       └── page.tsx                      # Vérification OTP
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx                        # Layout avec sidebar
│   │   ├── page.tsx                          # Liste des workspaces
│   │   └── w/
│   │       └── [slug]/
│   │           ├── layout.tsx                # Layout workspace
│   │           ├── page.tsx                  # Vue workspace (projets)
│   │           ├── settings/
│   │           │   └── page.tsx
│   │           ├── members/
│   │           │   └── page.tsx
│   │           └── p/
│   │               └── [projectId]/
│   │                   ├── page.tsx          # Vue projet (tâches)
│   │                   └── settings/
│   │                       └── page.tsx
│   │
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts                  # Better-auth API routes
│   │
│   ├── layout.tsx                            # Root layout
│   └── globals.css
│
├── features/
│   │
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── OtpForm.tsx
│   │   │   ├── LogoutButton.tsx
│   │   │   └── UserAvatar.tsx
│   │   ├── actions/
│   │   │   └── auth.actions.ts
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   ├── dal/
│   │   │   └── index.ts                      # getCurrentUser, etc.
│   │   ├── dto/
│   │   │   └── auth.dto.ts
│   │   ├── types.ts
│   │   └── index.ts                          # Exports publics
│   │
│   ├── workspaces/
│   │   ├── components/
│   │   │   ├── WorkspaceCard.tsx
│   │   │   ├── WorkspaceList.tsx
│   │   │   ├── WorkspaceSwitcher.tsx         # Dropdown pour changer de workspace
│   │   │   ├── CreateWorkspaceModal.tsx
│   │   │   ├── EditWorkspaceModal.tsx
│   │   │   ├── DeleteWorkspaceDialog.tsx
│   │   │   ├── WorkspaceSettingsForm.tsx
│   │   │   └── WorkspaceSidebar.tsx
│   │   ├── actions/
│   │   │   └── workspace.actions.ts
│   │   ├── services/
│   │   │   └── workspace.service.ts
│   │   ├── repositories/
│   │   │   └── workspace.repository.ts
│   │   ├── dal/
│   │   │   └── index.ts
│   │   ├── dto/
│   │   │   └── workspace.dto.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── members/
│   │   ├── components/
│   │   │   ├── MemberList.tsx
│   │   │   ├── MemberRow.tsx
│   │   │   ├── InviteMemberModal.tsx
│   │   │   ├── ChangeMemberRoleDialog.tsx
│   │   │   ├── RemoveMemberDialog.tsx
│   │   │   └── RoleBadge.tsx
│   │   ├── actions/
│   │   │   └── member.actions.ts
│   │   ├── services/
│   │   │   └── member.service.ts
│   │   ├── repositories/
│   │   │   └── member.repository.ts
│   │   ├── dal/
│   │   │   └── index.ts
│   │   ├── dto/
│   │   │   └── member.dto.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── projects/
│   │   ├── components/
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectList.tsx
│   │   │   ├── CreateProjectModal.tsx
│   │   │   ├── EditProjectModal.tsx
│   │   │   ├── DeleteProjectDialog.tsx
│   │   │   ├── ArchiveProjectDialog.tsx
│   │   │   ├── ProjectHeader.tsx
│   │   │   ├── ProjectSettingsForm.tsx
│   │   │   └── ProjectColorPicker.tsx
│   │   ├── actions/
│   │   │   └── project.actions.ts
│   │   ├── services/
│   │   │   └── project.service.ts
│   │   ├── repositories/
│   │   │   └── project.repository.ts
│   │   ├── dal/
│   │   │   └── index.ts
│   │   ├── dto/
│   │   │   └── project.dto.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── tasks/
│   │   ├── components/
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskBoard.tsx                 # Vue Kanban
│   │   │   ├── TaskBoardColumn.tsx
│   │   │   ├── TaskTable.tsx                 # Vue Table (TanStack)
│   │   │   ├── TaskTableColumns.tsx
│   │   │   ├── CreateTaskModal.tsx
│   │   │   ├── EditTaskModal.tsx
│   │   │   ├── TaskDetailModal.tsx
│   │   │   ├── DeleteTaskDialog.tsx
│   │   │   ├── TaskFilters.tsx
│   │   │   ├── TaskSearch.tsx
│   │   │   ├── TaskViewToggle.tsx            # Switch Board/Table
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── StatusSelect.tsx
│   │   │   ├── PriorityBadge.tsx
│   │   │   ├── PrioritySelect.tsx
│   │   │   ├── AssigneeSelect.tsx
│   │   │   └── DueDatePicker.tsx
│   │   ├── actions/
│   │   │   └── task.actions.ts
│   │   ├── services/
│   │   │   └── task.service.ts
│   │   ├── repositories/
│   │   │   └── task.repository.ts
│   │   ├── dal/
│   │   │   └── index.ts
│   │   ├── dto/
│   │   │   └── task.dto.ts
│   │   ├── hooks/
│   │   │   ├── useTaskFilters.ts
│   │   │   └── useTaskSearch.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   └── comments/
│       ├── components/
│       │   ├── CommentList.tsx
│       │   ├── CommentItem.tsx
│       │   ├── CommentForm.tsx
│       │   └── DeleteCommentDialog.tsx
│       ├── actions/
│       │   └── comment.actions.ts
│       ├── services/
│       │   └── comment.service.ts
│       ├── repositories/
│       │   └── comment.repository.ts
│       ├── dal/
│       │   └── index.ts
│       ├── dto/
│       │   └── comment.dto.ts
│       ├── types.ts
│       └── index.ts
│
├── shared/
│   ├── components/
│   │   ├── ui/                               # Shadcn components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── command.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   ├── layouts/
│   │   │   ├── MarketingLayout.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── DashboardSidebar.tsx
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── WorkspaceLayout.tsx
│   │   │   └── WorkspaceSidebar.tsx
│   │   └── common/
│   │       ├── Logo.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── LoadingPage.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorState.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── PageHeader.tsx
│   │       └── UserMenu.tsx
│   │
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useMediaQuery.ts
│   │   └── useClickOutside.ts
│   │
│   ├── utils/
│   │   ├── formatDate.ts
│   │   ├── generateSlug.ts
│   │   ├── generateId.ts
│   │   └── cn.ts                             # clsx + tailwind-merge
│   │
│   └── constants/
│       ├── roles.ts
│       ├── taskStatus.ts
│       ├── taskPriority.ts
│       └── projectColors.ts
│
├── db/
│   ├── index.ts                              # DB connection
│   ├── schema/
│   │   ├── users.ts
│   │   ├── workspaces.ts
│   │   ├── workspaceMembers.ts
│   │   ├── projects.ts
│   │   ├── tasks.ts
│   │   ├── comments.ts
│   │   ├── relations.ts
│   │   └── index.ts                          # Export all schemas
│   └── migrations/
│
├── lib/
│   ├── auth.ts                               # Better-auth config
│   ├── auth-client.ts                        # Client-side auth
│   └── permissions.ts                        # Fonctions de vérification des rôles
│
├── middleware.ts                             # Auth middleware
│
└── env.ts                                    # Type-safe env variables
```
