"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQuery } from "convex/react";
import { Send, Loader2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  roomId: Id<"chatRooms">;
}

export function ChatInput({ roomId }: ChatInputProps) {
  const t = useTranslations("chat");
  const sendMessage = useMutation(api.modules.chat.mutations.sendMessage);
  const updatePresence = useMutation(
    api.modules.chat.mutations.updatePresence
  );

  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Typing indicator
  const handleTyping = useCallback(() => {
    updatePresence({ roomId, isTyping: true }).catch(() => {});

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      updatePresence({ roomId, isTyping: false }).catch(() => {});
    }, 2000);
  }, [roomId, updatePresence]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async () => {
    if (content.trim().length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await sendMessage({ roomId, content: content.trim() });
      setContent("");
      inputRef.current?.focus();
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

  // Typing indicator display
  const presence = useQuery(api.modules.chat.queries.listPresence, { roomId });
  const typingUsers = presence?.filter((p) => p.isTyping) ?? [];

  return (
    <div className="shrink-0 border-t bg-card p-3">
      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-1 pb-1.5 text-xs text-muted-foreground">
          {typingUsers.map((u) => u.userName).join(", ")} {t("typing")}
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder={t("typePlaceholder")}
          maxLength={5000}
          rows={1}
          className="flex-1 resize-none rounded-lg border bg-muted/50 px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring max-h-32"
          style={{ minHeight: "2.5rem" }}
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={content.trim().length === 0 || isSubmitting}
          className="shrink-0"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
