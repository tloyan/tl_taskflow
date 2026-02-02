"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  updateTaskStatusAction,
  updateTaskPriorityAction,
  updateTaskAssigneeAction,
} from "../task-actions";
import { TASK_STATUSES, TASK_PRIORITIES } from "../task-types";
import type { TaskWithAssignee } from "../task-types";
import type { MemberWithUser } from "@/features/member/member-types";
import type { CommentWithAuthor } from "@/features/comment/comment-types";
import EditTaskForm from "./edit-task-form";
import DeleteTaskDialog from "./delete-task-dialog";
import CommentList from "@/features/comment/components/comment-list";
import CommentForm from "@/features/comment/components/comment-form";

type TaskDetailModalProps = {
  task: TaskWithAssignee | null;
  members: MemberWithUser[];
  comments: CommentWithAuthor[];
  currentUserId: string;
  currentUserRole: string;
  pathToRevalidate: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function TaskDetailModal({
  task,
  members,
  comments,
  currentUserId,
  currentUserRole,
  pathToRevalidate,
  open,
  onOpenChange,
}: TaskDetailModalProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!task) return null;

  const handleStatusChange = async (status: string) => {
    const result = await updateTaskStatusAction(
      { id: task.id, status },
      pathToRevalidate
    );
    if ("error" in result) {
      toast.error(result.error.message);
    }
  };

  const handlePriorityChange = async (priority: string) => {
    const result = await updateTaskPriorityAction(
      { id: task.id, priority },
      pathToRevalidate
    );
    if ("error" in result) {
      toast.error(result.error.message);
    }
  };

  const handleAssigneeChange = async (assigneeId: string) => {
    const result = await updateTaskAssigneeAction(
      { id: task.id, assigneeId: assigneeId === "unassigned" ? null : assigneeId },
      pathToRevalidate
    );
    if ("error" in result) {
      toast.error(result.error.message);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Détail de la tâche</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <EditTaskForm
                taskId={task.id}
                defaultValues={{
                  title: task.title,
                  description: task.description,
                }}
                pathToRevalidate={pathToRevalidate}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-muted-foreground text-xs font-medium">
                  Statut
                </label>
                <Select
                  value={task.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-muted-foreground text-xs font-medium">
                  Priorité
                </label>
                <Select
                  value={task.priority}
                  onValueChange={handlePriorityChange}
                >
                  <SelectTrigger size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-muted-foreground text-xs font-medium">
                  Assigné
                </label>
                <Select
                  value={task.assigneeId ?? "unassigned"}
                  onValueChange={handleAssigneeChange}
                >
                  <SelectTrigger size="sm">
                    <SelectValue placeholder="Non assigné" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Non assigné</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.userId} value={m.userId}>
                        {m.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <Button
                variant="destructive"
                size="icon"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Commentaires</h4>
            <CommentForm
              taskId={task.id}
              pathToRevalidate={pathToRevalidate}
            />
            <CommentList
              comments={comments}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              pathToRevalidate={pathToRevalidate}
            />
          </div>
        </DialogContent>
      </Dialog>

      <DeleteTaskDialog
        taskId={task.id}
        taskTitle={task.title}
        pathToRevalidate={pathToRevalidate}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => onOpenChange(false)}
      />
    </>
  );
}
