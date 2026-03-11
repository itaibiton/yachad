"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@clerk/nextjs";
import { ArrowUpDown, Plus, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CountryCombobox } from "@/shared/components/CountryCombobox";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReservationsGrid, type ReservationSort } from "./ReservationsGrid";
import { ReservationUploadForm } from "./ReservationUploadForm";

const SORT_OPTIONS: ReservationSort[] = [
  "soonest",
  "newest",
  "price_asc",
  "price_desc",
];

const SORT_LABEL_KEYS: Record<ReservationSort, string> = {
  soonest: "sortSoonest",
  newest: "sortNewest",
  price_asc: "sortPriceAsc",
  price_desc: "sortPriceDesc",
};

export function ReservationsClientPage() {
  const t = useTranslations("reservations");
  const { isSignedIn } = useAuth();
  const isMobile = useIsMobile();
  const [sort, setSort] = useState<ReservationSort>("soonest");
  const [country, setCountry] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const filters = {
    country: country ?? undefined,
  };

  const formContent = (
    <ReservationUploadForm onSuccess={() => setFormOpen(false)} />
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Hotel className="size-6" />
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="size-4 text-muted-foreground" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as ReservationSort)}
              className="h-8 rounded-lg border bg-background px-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t(SORT_LABEL_KEYS[option])}
                </option>
              ))}
            </select>
          </div>

          {/* Post button */}
          {isSignedIn && (
            <Button
              size="sm"
              onClick={() => setFormOpen(true)}
              className="gap-1.5"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">{t("postListing")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Country filter */}
      <div className="flex items-center gap-2">
        <CountryCombobox
          value={country}
          onChange={setCountry}
          placeholder={t("filterCountry")}
          clearable
          showAll
        />
      </div>

      {/* Grid */}
      <ReservationsGrid filters={filters} sort={sort} />

      {/* Upload form — Drawer on mobile, Dialog on desktop */}
      {isMobile ? (
        <Drawer open={formOpen} onOpenChange={setFormOpen}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader>
              <DrawerTitle>{t("postListing")}</DrawerTitle>
            </DrawerHeader>
            <ScrollArea className="px-4 pb-6 overflow-y-auto max-h-[calc(90vh-4rem)]">
              {formContent}
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("postListing")}</DialogTitle>
            </DialogHeader>
            {formContent}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
