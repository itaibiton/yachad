import { Doc } from "../../../../convex/_generated/dataModel";

/**
 * PostWithAuthor — enriched post type returned by listPosts query.
 * Author fields are denormalized by the query handler.
 */
export type PostWithAuthor = Doc<"posts"> & {
  authorName: string;
  authorImageUrl: string | null;
  authorClerkId: string | null;
  authorRole: "user" | "agent" | "admin";
  likeCount: number;
  commentCount: number;
  repostOf: {
    _id: string;
    content: string;
    authorName: string;
    authorImageUrl: string | null;
    _creationTime: number;
  } | null;
};

/**
 * CommentWithAuthor — enriched comment type returned by listPostComments.
 */
export type CommentWithAuthor = Doc<"postComments"> & {
  authorName: string;
  authorImageUrl: string | null;
};

/**
 * Category badge configuration.
 */
export function getCategoryConfig(category: string): {
  labelKey: string;
  className: string;
} {
  switch (category) {
    case "help_needed":
      return {
        labelKey: "categoryHelp",
        className:
          "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30",
      };
    case "offering_help":
      return {
        labelKey: "categoryOffering",
        className:
          "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30",
      };
    case "info":
      return {
        labelKey: "categoryInfo",
        className:
          "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
      };
    case "warning":
      return {
        labelKey: "categoryWarning",
        className:
          "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
      };
    case "safety_check":
      return {
        labelKey: "categorySafety",
        className:
          "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30",
      };
    default:
      return {
        labelKey: "categoryInfo",
        className: "bg-muted text-muted-foreground border-border",
      };
  }
}
