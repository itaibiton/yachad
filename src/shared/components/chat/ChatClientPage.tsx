"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { ChatRoomList } from "./ChatRoomList";
import { ChatMessageArea } from "./ChatMessageArea";
import { NewChatDialog } from "./NewChatDialog";

export function ChatClientPage() {
  const t = useTranslations("chat");
  const [selectedRoomId, setSelectedRoomId] =
    useState<Id<"chatRooms"> | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);

  return (
    <div className="-m-4 md:-m-6 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* ── Page header ── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 md:px-6 md:pt-6 md:pb-3 shrink-0">
        <div className="flex size-9 items-center justify-center rounded-lg bg-teal-500/10 dark:bg-teal-500/20 shrink-0">
          <MessageSquare
            className="size-4 text-teal-600 dark:text-teal-400"
            aria-hidden
          />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="text-xs text-muted-foreground truncate">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* ── Split panel ── */}
      <div className="flex flex-1 min-h-0 border-t">
        {/* Room list — always visible on desktop, toggles on mobile */}
        <div
          className={`w-full lg:w-80 lg:border-e shrink-0 ${
            selectedRoomId ? "hidden lg:flex lg:flex-col" : "flex flex-col"
          }`}
        >
          <ChatRoomList
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
            onNewChat={() => setShowNewChat(true)}
          />
        </div>

        {/* Message area */}
        <div
          className={`flex-1 min-w-0 ${
            selectedRoomId ? "flex flex-col" : "hidden lg:flex lg:flex-col"
          }`}
        >
          {selectedRoomId ? (
            <ChatMessageArea
              roomId={selectedRoomId}
              onBack={() => setSelectedRoomId(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
              <MessageSquare className="size-12 text-muted-foreground/50" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("selectRoom")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("selectRoomDescription")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New chat dialog */}
      <NewChatDialog
        open={showNewChat}
        onOpenChange={setShowNewChat}
        onRoomCreated={(roomId) => {
          setSelectedRoomId(roomId);
          setShowNewChat(false);
        }}
      />
    </div>
  );
}
