"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { TaskWithAssignee, TaskStatus } from "../task-types";
import type { MemberWithUser } from "@/features/member/member-types";
import type { CommentWithAuthor } from "@/features/comment/comment-types";
import TaskToolbar from "./task-toolbar";
import TaskBoard from "./task-board";
import TaskTable from "./task-table";
import CreateTaskForm from "./create-task-form";
import TaskDetailModal from "./task-detail-modal";
import type { TaskFilters } from "./task-filters";

type TaskViewProps = {
  tasks: TaskWithAssignee[];
  members: MemberWithUser[];
  comments: CommentWithAuthor[];
  projectId: string;
  currentUserId: string;
  currentUserRole: string;
  pathToRevalidate: string;
};

export default function TaskView({
  tasks,
  members,
  comments,
  projectId,
  currentUserId,
  currentUserRole,
  pathToRevalidate,
}: TaskViewProps) {
  const [view, setView] = useState<"board" | "table">("board");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<TaskFilters>({
    status: null,
    priority: null,
    assigneeId: null,
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] =
    useState<TaskStatus>("backlog");
  const [selectedTask, setSelectedTask] = useState<TaskWithAssignee | null>(
    null
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps -- selectedTask omis volontairement pour éviter une boucle infinie
  useEffect(() => {
    if (selectedTask) {
      const updated = tasks.find((t) => t.id === selectedTask.id);
      if (updated) {
        setSelectedTask(updated);
      } else {
        setSelectedTask(null);
      }
    }
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (search && !task.title.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (filters.status && task.status !== filters.status) {
        return false;
      }
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }
      if (filters.assigneeId && task.assigneeId !== filters.assigneeId) {
        return false;
      }
      return true;
    });
  }, [tasks, search, filters]);

  const selectedTaskComments = useMemo(() => {
    if (!selectedTask) return [];
    return comments.filter((c) => c.taskId === selectedTask.id);
  }, [comments, selectedTask]);

  const handleTaskClick = useCallback((task: TaskWithAssignee) => {
    setSelectedTask(task);
  }, []);

  const handleAddClick = useCallback((status: TaskStatus) => {
    setCreateDefaultStatus(status);
    setCreateOpen(true);
  }, []);

  return (
    <div className="space-y-4">
      <TaskToolbar
        view={view}
        onViewChange={setView}
        filters={filters}
        onFiltersChange={setFilters}
        search={search}
        onSearchChange={setSearch}
        members={members}
        onCreateClick={() => {
          setCreateDefaultStatus("backlog");
          setCreateOpen(true);
        }}
      />

      {view === "board" ? (
        <TaskBoard
          tasks={filteredTasks}
          onTaskClick={handleTaskClick}
          onAddClick={handleAddClick}
        />
      ) : (
        <TaskTable tasks={filteredTasks} onTaskClick={handleTaskClick} />
      )}

      <CreateTaskForm
        projectId={projectId}
        pathToRevalidate={pathToRevalidate}
        members={members}
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultStatus={createDefaultStatus}
      />

      <TaskDetailModal
        task={selectedTask}
        members={members}
        comments={selectedTaskComments}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        pathToRevalidate={pathToRevalidate}
        open={!!selectedTask}
        onOpenChange={(open) => {
          if (!open) setSelectedTask(null);
        }}
      />
    </div>
  );
}
