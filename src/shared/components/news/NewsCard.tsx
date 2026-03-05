"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale/he";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  NewsArticleWithSource,
  getTrustTierConfig,
  extractDomain,
} from "./news-utils";

interface NewsCardProps {
  article: NewsArticleWithSource;
  /** "hero" renders a larger, more prominent card; "compact" is the default dense card */
  variant?: "hero" | "compact";
}

/**
 * SourceBadge — favicon + trust dot + source name, reused across variants.
 */
function SourceBadge({
  article,
  faviconUrl,
  faviconError,
  onFaviconError,
  trustConfig,
}: {
  article: NewsArticleWithSource;
  faviconUrl: string;
  faviconError: boolean;
  onFaviconError: () => void;
  trustConfig: ReturnType<typeof getTrustTierConfig>;
}) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      {/* Favicon with trust dot overlay */}
      <div className="relative shrink-0">
        {!faviconError ? (
          <img
            src={faviconUrl}
            alt=""
            width={16}
            height={16}
            className="size-4 rounded-sm object-contain"
            onError={onFaviconError}
          />
        ) : (
          <div className="size-4 rounded-sm bg-muted flex items-center justify-center">
            <span className="text-[8px] font-bold text-muted-foreground uppercase">
              {article.sourceName.charAt(0)}
            </span>
          </div>
        )}
        {/* Trust tier dot — positioned at bottom-end corner */}
        <span
          className={cn(
            "absolute -bottom-0.5 -end-0.5 size-[7px] rounded-full ring-[1.5px] ring-card",
            trustConfig.dotClassName
          )}
          aria-hidden
        />
      </div>

      {/* Source name */}
      <span className="text-xs text-muted-foreground font-medium truncate">
        {article.sourceName}
      </span>
    </div>
  );
}

export function NewsCard({ article, variant = "compact" }: NewsCardProps) {
  const t = useTranslations("news");
  const locale = useLocale();
  const [faviconError, setFaviconError] = useState(false);
  const [imgError, setImgError] = useState(false);

  const domain = extractDomain(article.url);
  const faviconUrl =
    article.sourceFaviconUrl ||
    `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  const trustConfig = getTrustTierConfig(article.sourceTrustTier);

  const relativeTime = formatDistanceToNow(new Date(article.publishedAt), {
    addSuffix: true,
    locale: locale === "he" ? he : undefined,
  });

  const isHero = variant === "hero";
  const hasImage = !!article.imageUrl && !imgError;

  // ── Hero variant — editorial/premium card with banner image ──
  if (isHero) {
    return (
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "group relative block rounded-xl border bg-card no-underline transition-all overflow-hidden",
          "hover:shadow-lg hover:border-foreground/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          "shadow-sm"
        )}
      >
        {/* Hero image — proportional banner */}
        {hasImage && (
          <div className="relative w-full overflow-hidden bg-muted h-40 md:h-48">
            <img
              src={article.imageUrl!}
              alt=""
              className="size-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
              loading="eager"
              onError={() => setImgError(true)}
            />
            {/* Gradient overlay for text legibility over image edge */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        <div className="p-4 md:p-5">
          {/* Meta row */}
          <div className="flex items-center gap-2 mb-2">
            <SourceBadge
              article={article}
              faviconUrl={faviconUrl}
              faviconError={faviconError}
              onFaviconError={() => setFaviconError(true)}
              trustConfig={trustConfig}
            />
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] h-[18px] px-1.5",
                trustConfig.badgeClassName
              )}
            >
              {t(
                trustConfig.labelKey as
                  | "trustOfficial"
                  | "trustVerified"
                  | "trustCommunity"
              )}
            </Badge>
            <div className="flex-1" />
            <span
              className={cn(
                "shrink-0 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                article.language === "he"
                  ? "bg-blue-500/8 text-blue-600 dark:text-blue-400"
                  : "bg-purple-500/8 text-purple-600 dark:text-purple-400"
              )}
            >
              {article.language === "he" ? "HE" : "EN"}
            </span>
            <time
              dateTime={new Date(article.publishedAt).toISOString()}
              className="text-xs text-muted-foreground tabular-nums shrink-0"
            >
              {relativeTime}
            </time>
          </div>

          {/* Headline */}
          <h3 className="text-lg md:text-xl font-semibold leading-snug text-foreground line-clamp-3 mb-1.5">
            {article.title}
          </h3>

          {/* Description */}
          {article.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
              {article.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground/70 truncate">
              {domain}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              {t("openOriginal")}
              <ExternalLink className="size-3" aria-hidden />
            </span>
          </div>
        </div>
      </a>
    );
  }

  // ── Compact variant — full-height image on the end side ──
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative flex rounded-xl border bg-card no-underline transition-all overflow-hidden",
        "hover:shadow-lg hover:border-foreground/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        "shadow-[0_1px_3px_0_rgb(0_0_0/.06)] min-h-[120px]"
      )}
    >
      {/* Text content — takes 2/3 on desktop, more on mobile */}
      <div className="flex flex-1 flex-col justify-between p-3.5 md:p-4 min-w-0">
        {/* Meta row */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <SourceBadge
              article={article}
              faviconUrl={faviconUrl}
              faviconError={faviconError}
              onFaviconError={() => setFaviconError(true)}
              trustConfig={trustConfig}
            />
            <div className="flex-1" />
            <span
              className={cn(
                "shrink-0 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                article.language === "he"
                  ? "bg-blue-500/8 text-blue-600 dark:text-blue-400"
                  : "bg-purple-500/8 text-purple-600 dark:text-purple-400"
              )}
            >
              {article.language === "he" ? "HE" : "EN"}
            </span>
          </div>

          {/* Headline */}
          <h3 className="text-[15px] font-semibold leading-snug text-foreground line-clamp-2 mb-1">
            {article.title}
          </h3>

          {/* Description — only show on desktop for density */}
          {article.description && (
            <p className="hidden md:line-clamp-2 text-sm text-muted-foreground leading-relaxed mb-1.5">
              {article.description}
            </p>
          )}
        </div>

        {/* Footer — pushed to bottom */}
        <div className="flex items-center gap-2 mt-2">
          <time
            dateTime={new Date(article.publishedAt).toISOString()}
            className="text-[11px] text-muted-foreground tabular-nums shrink-0"
          >
            {relativeTime}
          </time>
          <span className="text-muted-foreground/30 text-[11px]" aria-hidden>
            |
          </span>
          <span className="text-[11px] text-muted-foreground/70 truncate">
            {domain}
          </span>
          <div className="flex-1" />
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {t("openOriginal")}
            <ExternalLink className="size-3" aria-hidden />
          </span>
        </div>
      </div>

      {/* Full-height image on the end side — 1/3 width desktop, slightly narrower on mobile */}
      {hasImage && (
        <div className="relative shrink-0 w-28 md:w-1/3 max-w-[220px] bg-muted">
          <img
            src={article.imageUrl!}
            alt=""
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        </div>
      )}
    </a>
  );
}
