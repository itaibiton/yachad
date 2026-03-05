"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePaginatedQuery } from "convex/react";
import { useInView } from "react-intersection-observer";
import { Users, Loader2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { PostSkeleton } from "@/shared/components/LoadingSkeleton";
import { PostCard } from "./PostCard";
import type { PostWithAuthor } from "./feed-utils";

interface FeedListProps {
  country?: string;
  category?: "help_needed" | "offering_help" | "info" | "warning" | "safety_check";
}

export function FeedList({ country, category }: FeedListProps) {
  const t = useTranslations("feed");

  const { results, status, loadMore } = usePaginatedQuery(
    api.modules.feed.queries.listPosts,
    { country, category },
    { initialNumItems: 10 }
  );

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "200px 0px",
  });

  useEffect(() => {
    if (inView && status === "CanLoadMore") {
      loadMore(10);
    }
  }, [inView, status, loadMore]);

  if (status === "LoadingFirstPage") {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (results.length === 0 && status === "Exhausted") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-card py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <Users className="size-8 text-muted-foreground" aria-hidden />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-foreground">
            {t("noPosts")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("noPostsDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {results.map((post) => (
        <PostCard key={post._id} post={post as unknown as PostWithAuthor} />
      ))}

      {/* Infinite scroll sentinel */}
      <div ref={ref} className="h-1" aria-hidden />

      {status === "LoadingMore" && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          <span>{t("loadingMore")}</span>
        </div>
      )}

      {status === "Exhausted" && results.length > 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          {t("endOfResults")}
        </p>
      )}
    </div>
  );
}
