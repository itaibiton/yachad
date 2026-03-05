"use client";

import { useTranslations } from "next-intl";
import { useMutation } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MessageWithAuthor } from "./chat-utils";

interface ChatMessageProps {
  message: MessageWithAuthor;
  isOwnMessage: boolean;
  showAuthor: boolean;
}

export function ChatMessage({
  message,
  isOwnMessage,
  showAuthor,
}: ChatMessageProps) {
  const t = useTranslations("chat");
  const deleteMessage = useMutation(
    api.modules.chat.mutations.deleteMessage
  );
  const toggleReaction = useMutation(
    api.modules.chat.mutations.toggleReaction
  );

  if (message.isDeleted) {
    return (
      <div className="flex justify-center py-1">
        <span className="text-xs text-muted-foreground italic">
          {t("messageDeleted")}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`group flex gap-2.5 px-4 py-0.5 hover:bg-muted/50 transition-colors ${
        isOwnMessage ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar — only show when author changes */}
      {showAuthor ? (
        <Avatar className="size-8 shrink-0 mt-0.5">
          <AvatarImage src={message.authorImageUrl ?? undefined} />
          <AvatarFallback className="text-xs">
            {message.authorName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-8 shrink-0" />
      )}

      <div
        className={`flex flex-col max-w-[75%] min-w-0 ${
          isOwnMessage ? "items-end" : "items-start"
        }`}
      >
        {/* Author name + timestamp */}
        {showAuthor && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-xs font-medium">{message.authorName}</span>
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(message._creationTime), {
                addSuffix: true,
              })}
            </span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`rounded-2xl px-3 py-2 text-sm ${
            isOwnMessage
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted rounded-bl-md"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Reactions */}
        {message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() =>
                  toggleReaction({
                    messageId: message._id,
                    emoji: reaction.emoji,
                  })
                }
                className="flex items-center gap-0.5 rounded-full border bg-card px-1.5 py-0.5 text-xs hover:bg-muted transition-colors"
              >
                <span>{reaction.emoji}</span>
                <span className="text-muted-foreground">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Delete own messages */}
      {isOwnMessage && (
        <button
          onClick={() => deleteMessage({ messageId: message._id })}
          className="opacity-0 group-hover:opacity-100 self-center p-1 text-muted-foreground hover:text-destructive transition-opacity"
        >
          <Trash2 className="size-3.5" />
        </button>
      )}
    </div>
  );
}
