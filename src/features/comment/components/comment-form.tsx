"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon } from "lucide-react";
import { createCommentAction } from "../comment-actions";
import { toast } from "sonner";
import { useState } from "react";

type CommentFormProps = {
  taskId: string;
  pathToRevalidate: string;
};

export default function CommentForm({
  taskId,
  pathToRevalidate,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    const result = await createCommentAction(
      { taskId, content: content.trim() },
      pathToRevalidate
    );

    if ("error" in result) {
      toast.error(result.error.message);
      setIsSubmitting(false);
      return;
    }

    setContent("");
    setIsSubmitting(false);
  };

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Ajouter un commentaire..."
        className="min-h-10"
      />
      <Button
        type="submit"
        size="icon"
        disabled={isSubmitting || !content.trim()}
      >
        <SendIcon className="size-4" />
      </Button>
    </form>
  );
}
