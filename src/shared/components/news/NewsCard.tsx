"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale/he";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NewsArticleWithSource, getTrustTierConfig, extractDomain } from "./news-utils";

interface NewsCardProps {
  article: NewsArticleWithSource;
}

export function NewsCard({ article }: NewsCardProps) {
  const t = useTranslations("news");
  const locale = useLocale();
  const [faviconError, setFaviconError] = useState(false);

  const domain = extractDomain(article.url);
  const faviconUrl =
    article.sourceFaviconUrl ||
    `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  const trustConfig = getTrustTierConfig(article.sourceTrustTier);

  const relativeTime = formatDistanceToNow(new Date(article.publishedAt), {
    addSuffix: true,
    locale: locale === "he" ? he : undefined,
  });

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer no-underline"
    >
      {/* Top row: source info + badges + timestamp */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        {/* Favicon */}
        {!faviconError ? (
          <img
            src={faviconUrl}
            alt=""
            width={16}
            height={16}
            className="size-4 rounded-sm object-contain shrink-0"
            onError={() => setFaviconError(true)}
          />
        ) : (
          <div className="size-4 rounded-sm bg-muted flex items-center justify-center shrink-0">
            <span className="text-[8px] font-bold text-muted-foreground uppercase">
              {article.sourceName.charAt(0)}
            </span>
          </div>
        )}

        {/* Source name */}
        <span className="text-xs text-muted-foreground font-medium truncate max-w-[120px]">
          {article.sourceName}
        </span>

        {/* Trust tier badge */}
        <Badge className={trustConfig.className} variant="outline">
          {t(trustConfig.labelKey as "trustOfficial" | "trustVerified" | "trustCommunity")}
        </Badge>

        {/* Language badge */}
        <Badge variant="outline" className="text-[10px] uppercase shrink-0">
          {article.language}
        </Badge>

        {/* Relative timestamp */}
        <span className="text-xs text-muted-foreground ms-auto shrink-0">
          {relativeTime}
        </span>
      </div>

      {/* Headline */}
      <h3 className="text-base font-semibold leading-snug line-clamp-2 text-foreground mb-1">
        {article.title}
      </h3>

      {/* Description snippet */}
      {article.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {article.description}
        </p>
      )}

      {/* Bottom: external link icon */}
      <div className="flex justify-end">
        <ExternalLink className="size-3.5 text-muted-foreground" aria-hidden />
      </div>
    </a>
  );
}
