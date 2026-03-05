"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "convex/react";
import { Search, Loader2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomCreated: (roomId: Id<"chatRooms">) => void;
}

export function NewChatDialog({
  open,
  onOpenChange,
  onRoomCreated,
}: NewChatDialogProps) {
  const t = useTranslations("chat");
  const createDM = useMutation(api.modules.chat.mutations.createDM);
  const createGroup = useMutation(
    api.modules.chat.mutations.createGroupChat
  );

  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"dm" | "group">("dm");
  const [groupName, setGroupName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Id<"users">[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const searchResults = useQuery(
    api.modules.chat.queries.searchUsers,
    search.trim().length >= 2 ? { search: search.trim() } : "skip"
  );

  const handleSelectUser = async (userId: Id<"users">) => {
    if (mode === "dm") {
      setIsCreating(true);
      try {
        const roomId = await createDM({ otherUserId: userId });
        onRoomCreated(roomId);
        onOpenChange(false);
        resetState();
      } catch {
        // Error handled by Convex
      } finally {
        setIsCreating(false);
      }
    } else {
      // Group mode — toggle selection
      setSelectedUserIds((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId]
      );
    }
  };

  const handleCreateGroup = async () => {
    if (groupName.trim().length === 0 || selectedUserIds.length === 0) return;

    setIsCreating(true);
    try {
      const roomId = await createGroup({
        name: groupName.trim(),
        participantIds: selectedUserIds,
      });
      onRoomCreated(roomId);
      onOpenChange(false);
      resetState();
    } catch {
      // Error handled by Convex
    } finally {
      setIsCreating(false);
    }
  };

  const resetState = () => {
    setSearch("");
    setMode("dm");
    setGroupName("");
    setSelectedUserIds([]);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) resetState();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("newChat")}</DialogTitle>
        </DialogHeader>

        {/* Mode toggle */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === "dm" ? "default" : "outline"}
            onClick={() => {
              setMode("dm");
              setSelectedUserIds([]);
            }}
          >
            {t("directMessage")}
          </Button>
          <Button
            size="sm"
            variant={mode === "group" ? "default" : "outline"}
            onClick={() => setMode("group")}
          >
            {t("newGroup")}
          </Button>
        </div>

        {/* Group name input */}
        {mode === "group" && (
          <Input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder={t("groupNamePlaceholder")}
          />
        )}

        {/* Search input */}
        <div className="relative">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchUsers")}
            className="ps-9"
          />
        </div>

        {/* User results */}
        <div className="max-h-60 overflow-y-auto rounded-lg border">
          {search.trim().length < 2 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              {t("searchUsers")}
            </p>
          ) : searchResults === undefined ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="size-4 animate-spin" />
            </div>
          ) : searchResults.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              {t("noRooms")}
            </p>
          ) : (
            <div className="flex flex-col">
              {searchResults.map((u) => {
                const isSelected = selectedUserIds.includes(u._id as Id<"users">);
                return (
                  <button
                    key={u._id}
                    onClick={() => handleSelectUser(u._id as Id<"users">)}
                    disabled={isCreating}
                    className={`flex items-center gap-3 px-3 py-2.5 text-start transition-colors hover:bg-muted/60 ${
                      isSelected ? "bg-primary/10" : ""
                    }`}
                  >
                    <Avatar className="size-8">
                      <AvatarImage src={u.imageUrl ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {u.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium flex-1">
                      {u.name}
                    </span>
                    {mode === "group" && isSelected && (
                      <div className="size-4 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Create group button */}
        {mode === "group" && (
          <Button
            onClick={handleCreateGroup}
            disabled={
              groupName.trim().length === 0 ||
              selectedUserIds.length === 0 ||
              isCreating
            }
          >
            {isCreating && <Loader2 className="size-4 animate-spin me-1.5" />}
            {t("createGroup")} ({selectedUserIds.length})
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
