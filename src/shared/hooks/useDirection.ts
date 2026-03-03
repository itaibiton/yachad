"use client";

import { useLocale } from "next-intl";

const RTL_LOCALES = ["he", "ar"];

export function useDirection() {
  const locale = useLocale();
  const isRTL = RTL_LOCALES.includes(locale);
  return { isRTL, dir: isRTL ? "rtl" : "ltr" } as const;
}
