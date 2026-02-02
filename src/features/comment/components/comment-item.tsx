"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { CommentWithAuthor } from "../comment-types";

type CommentItemProps = {
  comment: CommentWithAuthor;
  canDelete: boolean;
  onDelete: (id: string) => void;
};

export default function CommentItem({
  comment,
  canDelete,
  onDelete,
}: CommentItemProps) {
  return (
    <div className="flex gap-3">
      <Avatar className="size-7 shrink-0">
        <AvatarImage src={comment.author.image ?? undefined} />
        <AvatarFallback className="text-xs">
          {comment.author.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{comment.author.name}</span>
          <span className="text-muted-foreground text-xs">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
              locale: fr,
            })}
          </span>
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => onDelete(comment.id)}
            >
              <Trash2Icon className="size-3" />
            </Button>
          )}
        </div>
        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
      </div>
    </div>
  );
}
