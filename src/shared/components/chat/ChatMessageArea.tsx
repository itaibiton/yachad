"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { usePaginatedQuery, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useInView } from "react-intersection-observer";
import { ArrowLeft, Loader2, MessageSquare } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import type { MessageWithAuthor } from "./chat-utils";

interface ChatMessageAreaProps {
  roomId: Id<"chatRooms">;
  onBack: () => void;
}

export function ChatMessageArea({ roomId, onBack }: ChatMessageAreaProps) {
  const t = useTranslations("chat");
  const { user } = useUser();
  const roomInfo = useQuery(api.modules.chat.queries.getRoomInfo, { roomId });

  const { results, status, loadMore } = usePaginatedQuery(
    api.modules.chat.queries.listMessages,
    { roomId },
    { initialNumItems: 30 }
  );

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: "100px 0px",
  });

  // Load more when scrolling up (older messages)
  useEffect(() => {
    if (inView && status === "CanLoadMore") {
      loadMore(20);
    }
  }, [inView, status, loadMore]);

  // Auto-scroll to bottom on new messages
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevResultCountRef = useRef(0);

  useEffect(() => {
    // Only auto-scroll when new messages arrive (not when loading older)
    if (results.length > prevResultCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevResultCountRef.current = results.length;
  }, [results.length]);

  // Messages come in desc order from query, reverse for display
  const messages = [...results].reverse() as unknown as MessageWithAuthor[];

  // Find the current user's Convex ID by matching Clerk user
  const currentUserId = user?.id; // This is Clerk ID, we need to compare differently

  return (
    <div className="flex h-full flex-col">
      {/* Room header */}
      <div className="flex items-center gap-3 border-b px-4 py-3 shrink-0">
        <Button
          size="icon"
          variant="ghost"
          className="lg:hidden shrink-0"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold truncate">
            {roomInfo?.name ?? "..."}
          </h2>
          {roomInfo && roomInfo.participantCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {t("participants", { count: roomInfo.participantCount })}
            </p>
          )}
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {status === "LoadingFirstPage" ? (
          <div className="flex-1 flex flex-col gap-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-2.5">
                <Skeleton className="size-8 rounded-full shrink-0" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-3 w-20 rounded-md" />
                  <Skeleton className="h-8 w-48 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
            <MessageSquare className="size-10 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{t("noMessages")}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("noMessagesDescription")}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col py-2">
            {/* Load older sentinel */}
            <div ref={loadMoreRef} className="h-1" aria-hidden />
            {status === "LoadingMore" && (
              <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                <span>{t("loadingMore")}</span>
              </div>
            )}

            {messages.map((msg, i) => {
              const prevMsg = i > 0 ? messages[i - 1] : null;
              const showAuthor =
                !prevMsg ||
                prevMsg.authorId !== msg.authorId ||
                prevMsg.isDeleted === true;

              // We use authorId to determine ownership since we have it in the message
              // The current user's message will be identified by matching author name
              // with Clerk user's name as a fallback
              const isOwnMessage =
                user?.fullName === msg.authorName ||
                user?.firstName === msg.authorName;

              return (
                <ChatMessage
                  key={msg._id}
                  message={msg}
                  isOwnMessage={isOwnMessage}
                  showAuthor={showAuthor}
                />
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput roomId={roomId} />
    </div>
  );
}
