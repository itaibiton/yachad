"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { Newspaper, ExternalLink } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Link } from "@/i18n/routing";

export function FeedNewsSidebar() {
  const t = useTranslations("feed");
  const result = useQuery(api.modules.news.queries.listNewsArticles, {
    paginationOpts: { numItems: 6, cursor: null },
  });

  const articles = result?.page ?? [];

  return (
    <div className="sticky top-4">
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Newspaper className="size-4 text-muted-foreground" aria-hidden />
          <h2 className="text-sm font-semibold">{t("latestNews")}</h2>
        </div>

        {articles.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            {t("latestNews")}...
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {articles.map((article) => (
              <li key={article._id}>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-1 rounded-lg p-2 -mx-2 transition-colors hover:bg-muted/50"
                >
                  <span className="text-xs font-medium leading-snug line-clamp-2 group-hover:text-foreground">
                    {article.title}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="truncate">{article.sourceName}</span>
                    <span aria-hidden>·</span>
                    <span className="shrink-0">
                      {formatDistanceToNow(new Date(article.publishedAt), {
                        addSuffix: true,
                      })}
                    </span>
                    <ExternalLink className="size-2.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/news"
          className="block text-xs text-brand hover:underline mt-3 pt-3 border-t text-center"
        >
          {t("seeAllNews")}
        </Link>
      </div>
    </div>
  );
}
