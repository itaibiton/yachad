"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  MessageCircle,
  Repeat2,
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PostComments } from "./PostComments";
import { getCategoryConfig, type PostWithAuthor } from "./feed-utils";

interface PostCardProps {
  post: PostWithAuthor;
}

export function PostCard({ post }: PostCardProps) {
  const t = useTranslations("feed");
  const { user } = useUser();
  const toggleLike = useMutation(api.modules.feed.mutations.toggleLike);
  const deletePost = useMutation(api.modules.feed.mutations.deletePost);
  const editPostMutation = useMutation(api.modules.feed.mutations.editPost);
  const repost = useMutation(api.modules.feed.mutations.repost);

  const hasLiked = useQuery(api.modules.feed.queries.hasUserLikedPost, {
    postId: post._id,
  });

  const [showComments, setShowComments] = useState(false);
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
  const [optimisticLikeCount, setOptimisticLikeCount] = useState(
    post.likeCount
  );

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isOwnPost = user?.id != null && user.id === post.authorClerkId;
  const liked = optimisticLiked ?? hasLiked ?? false;

  const handleToggleLike = async () => {
    if (!user) return;
    const wasLiked = liked;
    setOptimisticLiked(!wasLiked);
    setOptimisticLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    try {
      await toggleLike({ postId: post._id });
    } catch {
      setOptimisticLiked(wasLiked);
      setOptimisticLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  };

  const handleRepost = async () => {
    if (!user) return;
    try {
      await repost({ postId: post._id });
    } catch {
      // Error handled by Convex
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost({ postId: post._id });
    } catch {
      // Error handled by Convex
    }
    setShowDeleteDialog(false);
  };

  const handleSaveEdit = async () => {
    if (editContent.trim().length === 0 || editContent.length > 2000) return;
    setIsSaving(true);
    try {
      await editPostMutation({ postId: post._id, content: editContent });
      setIsEditing(false);
    } catch {
      // Error handled by Convex
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(post.content);
    setIsEditing(false);
  };

  const categoryConfig = post.category
    ? getCategoryConfig(post.category)
    : null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-card/80">
      {/* Author header */}
      <div className="flex items-start gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarImage src={post.authorImageUrl ?? undefined} />
          <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate">
              {post.authorName}
            </span>
            {categoryConfig && (
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 ${categoryConfig.className}`}
              >
                {t(categoryConfig.labelKey)}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post._creationTime), {
              addSuffix: true,
            })}
          </span>
        </div>

        {/* Three-dot menu for own posts */}
        {isOwnPost && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                aria-label="Post options"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditContent(post.content);
                  setIsEditing(true);
                }}
              >
                <Pencil className="size-4 me-2" />
                {t("editPost")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4 me-2" />
                {t("deletePost")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Post content — inline editing or display */}
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[80px] w-full rounded-lg border bg-background px-3 py-2 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            maxLength={2000}
            autoFocus
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              disabled={isSaving}
            >
              {t("editCancel")}
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              disabled={isSaving || editContent.trim().length === 0}
            >
              {t("editSave")}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {/* Repost embed */}
      {post.repostOf && (
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Avatar className="size-6">
              <AvatarImage src={post.repostOf.authorImageUrl ?? undefined} />
              <AvatarFallback className="text-xs">
                {post.repostOf.authorName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">
              {post.repostOf.authorName}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(
                new Date(post.repostOf._creationTime),
                { addSuffix: true }
              )}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {post.repostOf.content}
          </p>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-1 -mx-1">
        <button
          onClick={handleToggleLike}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
            liked
              ? "text-red-500 hover:bg-red-500/10"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Heart
            className={`size-4 ${liked ? "fill-red-500" : ""}`}
          />
          <span>{optimisticLikeCount > 0 ? optimisticLikeCount : ""}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <MessageCircle className="size-4" />
          <span>{post.commentCount > 0 ? post.commentCount : ""}</span>
          {showComments ? (
            <ChevronUp className="size-3" />
          ) : (
            <ChevronDown className="size-3" />
          )}
        </button>

        <button
          onClick={handleRepost}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Repeat2 className="size-4" />
          <span>{t("repost")}</span>
        </button>
      </div>

      {/* Expandable comments */}
      {showComments && <PostComments postId={post._id} />}

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deletePost")}</DialogTitle>
            <DialogDescription>{t("confirmDelete")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteDialog(false)}
            >
              {t("editCancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t("deletePost")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
