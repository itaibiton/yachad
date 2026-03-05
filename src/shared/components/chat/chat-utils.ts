import { Doc, Id } from "../../../../convex/_generated/dataModel";

/**
 * RoomWithMeta — enriched room type returned by listRooms query.
 */
export type RoomWithMeta = Doc<"chatRooms"> & {
  displayName: string;
  lastMessagePreview: {
    content: string;
    authorName: string;
    createdAt: number;
  } | null;
};

/**
 * MessageWithAuthor — enriched message type returned by listMessages query.
 */
export type MessageWithAuthor = Doc<"chatMessages"> & {
  authorName: string;
  authorImageUrl: string | null;
  reactions: {
    emoji: string;
    count: number;
    userIds: string[];
  }[];
};

/**
 * Room type icon/color configuration.
 */
export function getRoomTypeConfig(type: string): {
  labelKey: string;
  className: string;
} {
  switch (type) {
    case "country":
      return {
        labelKey: "countryRoom",
        className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      };
    case "emergency":
      return {
        labelKey: "countryRoom",
        className: "bg-red-500/10 text-red-600 dark:text-red-400",
      };
    case "dm":
      return {
        labelKey: "directMessage",
        className: "bg-green-500/10 text-green-600 dark:text-green-400",
      };
    case "group":
      return {
        labelKey: "group",
        className: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      };
    default:
      return {
        labelKey: "countryRoom",
        className: "bg-muted text-muted-foreground",
      };
  }
}
