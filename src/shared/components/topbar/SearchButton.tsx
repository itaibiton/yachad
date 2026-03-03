"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SearchButton() {
  const t = useTranslations("topbar");
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when expanded
  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  const handleClose = () => {
    setExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  return (
    <div className="relative flex items-center">
      {expanded ? (
        <div className="flex items-center gap-1">
          <Input
            ref={inputRef}
            type="search"
            placeholder={t("search")}
            onKeyDown={handleKeyDown}
            className="h-9 w-48 rounded-lg text-sm md:w-64"
            aria-label={t("search")}
          />
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            onClick={handleClose}
            aria-label="Close search"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          onClick={() => setExpanded(true)}
          aria-label={t("search")}
        >
          <Search className="size-4" />
        </Button>
      )}
    </div>
  );
}
