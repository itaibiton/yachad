"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { Send, Loader2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCategoryConfig } from "./feed-utils";

const CATEGORIES = [
  "help_needed",
  "offering_help",
  "info",
  "warning",
  "safety_check",
] as const;

type Category = (typeof CATEGORIES)[number];

interface PostComposerProps {
  country?: string;
}

export function PostComposer({ country }: PostComposerProps) {
  const t = useTranslations("feed");
  const { isSignedIn } = useAuth();
  const createPost = useMutation(api.modules.feed.mutations.createPost);

  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isSignedIn) return null;

  const handleSubmit = async () => {
    if (content.trim().length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createPost({
        content: content.trim(),
        country,
        category,
      });
      setContent("");
      setCategory(undefined);
    } catch {
      // Error will be displayed via Convex error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("composePlaceholder")}
        maxLength={2000}
        rows={3}
        className="w-full resize-none rounded-lg border-0 bg-muted/50 p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      {/* Category selector */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => {
          const config = getCategoryConfig(cat);
          const isSelected = category === cat;
          return (
            <Badge
              key={cat}
              variant="outline"
              className={`cursor-pointer transition-colors ${
                isSelected ? config.className : "opacity-50 hover:opacity-75"
              }`}
              onClick={() => setCategory(isSelected ? undefined : cat)}
            >
              {t(config.labelKey)}
            </Badge>
          );
        })}
      </div>

      {/* Footer: char count + submit */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {t("charCount", { count: content.length })}
        </span>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={content.trim().length === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          <span className="ms-1.5">
            {isSubmitting ? t("posting") : t("post")}
          </span>
        </Button>
      </div>
    </div>
  );
}
