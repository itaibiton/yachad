"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Plus, Hash, User, Users } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { RoomWithMeta } from "./chat-utils";

interface ChatRoomListProps {
  selectedRoomId: Id<"chatRooms"> | null;
  onSelectRoom: (roomId: Id<"chatRooms">) => void;
  onNewChat: () => void;
  country?: string;
}

function RoomIcon({ type }: { type: string }) {
  switch (type) {
    case "country":
    case "emergency":
      return <Hash className="size-4" />;
    case "dm":
      return <User className="size-4" />;
    case "group":
      return <Users className="size-4" />;
    default:
      return <MessageSquare className="size-4" />;
  }
}

export function ChatRoomList({
  selectedRoomId,
  onSelectRoom,
  onNewChat,
  country,
}: ChatRoomListProps) {
  const t = useTranslations("chat");
  const rooms = useQuery(api.modules.chat.queries.listRooms, { country });

  if (rooms === undefined) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 flex flex-col gap-1.5">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-3 w-40 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{t("rooms")}</h2>
        <Button size="sm" variant="ghost" onClick={onNewChat}>
          <Plus className="size-4" />
          <span className="ms-1">{t("newChat")}</span>
        </Button>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
            <MessageSquare className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">{t("noRooms")}</p>
            <p className="text-xs text-muted-foreground">
              {t("noRoomsDescription")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col py-1">
            {(rooms as RoomWithMeta[]).map((room) => (
              <button
                key={room._id}
                onClick={() => onSelectRoom(room._id)}
                className={`flex items-center gap-3 px-4 py-2.5 text-start transition-colors hover:bg-muted/60 ${
                  selectedRoomId === room._id ? "bg-muted" : ""
                }`}
              >
                <Avatar className="size-10 shrink-0">
                  <AvatarFallback className="text-xs">
                    <RoomIcon type={room.type} />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium truncate">
                      {room.displayName}
                    </span>
                    {room.lastMessagePreview && (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatDistanceToNow(
                          new Date(room.lastMessagePreview.createdAt),
                          { addSuffix: false }
                        )}
                      </span>
                    )}
                  </div>
                  {room.lastMessagePreview && (
                    <p className="text-xs text-muted-foreground truncate">
                      <span className="font-medium">
                        {room.lastMessagePreview.authorName}:
                      </span>{" "}
                      {room.lastMessagePreview.content}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
