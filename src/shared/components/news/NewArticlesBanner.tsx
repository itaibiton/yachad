"use client";

import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";

interface NewArticlesBannerProps {
  count: number;
  onShow: () => void;
}

export function NewArticlesBanner({ count, onShow }: NewArticlesBannerProps) {
  const t = useTranslations("news");

  return (
    <button
      type="button"
      onClick={onShow}
      className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-lg px-4 py-2.5 cursor-pointer hover:bg-primary/20 transition-colors animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <RefreshCw className="size-4 shrink-0" aria-hidden />
      <span className="text-sm font-medium">
        {count === 1 ? t("newArticle") : t("newArticles", { count })}
      </span>
    </button>
  );
}
