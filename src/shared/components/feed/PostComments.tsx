"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { Send, Loader2, Trash2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface PostCommentsProps {
  postId: Id<"posts">;
}

export function PostComments({ postId }: PostCommentsProps) {
  const t = useTranslations("feed");
  const { isSignedIn } = useAuth();
  const comments = useQuery(api.modules.feed.queries.listPostComments, {
    postId,
  });
  const addComment = useMutation(api.modules.feed.mutations.addComment);
  const deleteComment = useMutation(api.modules.feed.mutations.deleteComment);

  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (newComment.trim().length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment({ postId, content: newComment.trim() });
      setNewComment("");
    } catch {
      // Error handled by Convex
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-3 border-t pt-3">
      {/* Comments list */}
      {comments && comments.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-2.5">
              <Avatar className="size-7 shrink-0">
                <AvatarImage src={comment.authorImageUrl ?? undefined} />
                <AvatarFallback className="text-xs">
                  {comment.authorName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium">
                    {comment.authorName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(
                      new Date(comment._creationTime),
                      { addSuffix: true }
                    )}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 mt-0.5">
                  {comment.content}
                </p>
              </div>
              {/* Delete own comments — button shown via CSS on hover */}
              <button
                onClick={() => deleteComment({ commentId: comment._id })}
                className="opacity-0 group-hover/comment:opacity-100 shrink-0 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                title={t("deleteComment")}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{t("noComments")}</p>
      )}

      {/* Comment input */}
      {isSignedIn && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("commentPlaceholder")}
            maxLength={1000}
            className="flex-1 rounded-lg border bg-muted/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSubmit}
            disabled={newComment.trim().length === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
