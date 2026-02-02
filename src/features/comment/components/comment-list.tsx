"use client";

import { useState } from "react";
import type { CommentWithAuthor } from "../comment-types";
import CommentItem from "./comment-item";
import DeleteCommentDialog from "./delete-comment-dialog";

type CommentListProps = {
  comments: CommentWithAuthor[];
  currentUserId: string;
  currentUserRole: string;
  pathToRevalidate: string;
};

export default function CommentList({
  comments,
  currentUserId,
  currentUserRole,
  pathToRevalidate,
}: CommentListProps) {
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

  if (comments.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">Aucun commentaire</p>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {comments.map((comment) => {
          const canDelete =
            comment.authorId === currentUserId ||
            currentUserRole === "owner" ||
            currentUserRole === "admin";

          return (
            <CommentItem
              key={comment.id}
              comment={comment}
              canDelete={canDelete}
              onDelete={setDeleteCommentId}
            />
          );
        })}
      </div>

      {deleteCommentId && (
        <DeleteCommentDialog
          commentId={deleteCommentId}
          pathToRevalidate={pathToRevalidate}
          open={!!deleteCommentId}
          onOpenChange={(open) => {
            if (!open) setDeleteCommentId(null);
          }}
        />
      )}
    </>
  );
}
