"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../../convex/_generated/api";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FlightUploadForm } from "@/shared/components/flights/FlightUploadForm";
import { FlightEditForm } from "@/shared/components/flights/FlightEditForm";
import { AgentFlightCard } from "@/shared/components/flights/AgentFlightCard";
import { AgentFlightsMap } from "@/shared/components/flights/AgentFlightsMap";
import { GoogleMapsProvider } from "@/shared/components/GoogleMapsProvider";
import { TimeFormatContext, type TimeFormat } from "@/shared/components/flights/flight-utils";
import { getCountryFlag } from "@/shared/data/countries";
import { FlightCardSkeleton } from "@/shared/components/LoadingSkeleton";
import {
  Plus,
  Plane,
  Users,
  PhoneCall,
  DollarSign,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

function formatDate(ts: number, locale: string) {
  return new Date(ts).toLocaleDateString(locale === "he" ? "he-IL" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex size-10 items-center justify-center rounded-full ${accent}`}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function AgentPortalPage() {
  const t = useTranslations("agent");
  const locale = useLocale();
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string | undefined;
  const isAgent = isAuthenticated && (role === "agent" || role === "admin");
  const flights = useQuery(
    api.modules.flights.queries.listAgentFlights,
    isAgent ? undefined : "skip"
  );
  const stats = useQuery(
    api.modules.flights.queries.getAgentFlightStats,
    isAgent ? undefined : "skip"
  );
  const updateFlightStatus = useMutation(
    api.modules.flights.mutations.updateFlightStatus
  );
  const deleteFlightMutation = useMutation(
    api.modules.flights.mutations.deleteFlight
  );

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Doc<"flights"> | null>(
    null
  );
  const [deletingFlight, setDeletingFlight] = useState<Doc<"flights"> | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("24");

  const handleStatusChange = async (
    flightId: Doc<"flights">["_id"],
    status: "available" | "full" | "cancelled"
  ) => {
    try {
      await updateFlightStatus({ flightId, status });
      toast.success(t("statusUpdated"));
    } catch {
      toast.error(t("statusUpdateError"));
    }
  };

  const handleDelete = async () => {
    if (!deletingFlight) return;
    setIsDeleting(true);
    try {
      await deleteFlightMutation({ flightId: deletingFlight._id });
      toast.success(t("flightDeleted"));
      setDeletingFlight(null);
    } catch {
      toast.error(t("flightDeleteError"));
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    try {
      return new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(price);
    } catch {
      return `${currency} ${price}`;
    }
  };

  return (
    <GoogleMapsProvider>
      <TimeFormatContext.Provider value={timeFormat}>
        {/* Break out of parent padding + kill parent scroll */}
        <div className="-m-4 md:-m-6 flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
          {/* Header + stats — fixed top area */}
          <div className="shrink-0 flex flex-col gap-4 px-4 pt-4 pb-3">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {t("portalTitle")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t("portalSubtitle")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={() => setShowUploadForm(true)}>
                  <Plus className="me-2 size-4" />
                  {t("uploadFlight")}
                </Button>

                {/* 12/24h toggle */}
                <div className="flex items-center gap-1.5">
                  <Clock className="size-4 text-muted-foreground" />
                  <div className="flex rounded-lg border bg-muted p-0.5">
                    <button
                      type="button"
                      onClick={() => setTimeFormat("24")}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        timeFormat === "24"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      24h
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeFormat("12")}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        timeFormat === "12"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      12h
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats cards */}
            {stats && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  icon={Plane}
                  label={t("statActiveFlights")}
                  value={stats.activeFlights}
                  accent="bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                />
                <StatCard
                  icon={Users}
                  label={t("statTotalSeats")}
                  value={stats.totalSeats}
                  accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                />
                <StatCard
                  icon={PhoneCall}
                  label={t("statTotalContacts")}
                  value={stats.totalContacts}
                  accent="bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
                />
                <StatCard
                  icon={DollarSign}
                  label={t("statAvgPrice")}
                  value={
                    stats.avgPrice > 0
                      ? formatPrice(stats.avgPrice, stats.primaryCurrency)
                      : "—"
                  }
                  accent="bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                />
              </div>
            )}
          </div>

          {/* Map + scrollable card grid — fills remaining height */}
          <div className="flex min-h-0 flex-1">
            {/* Map — hidden below lg, 50% width */}
            <aside className="hidden lg:block w-1/2 shrink-0">
              <div className="h-full overflow-hidden">
                <AgentFlightsMap flights={flights} />
              </div>
            </aside>

            {/* Flight cards — scrollable */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4 min-w-0 overflow-y-auto p-4 md:p-6">
              {flights === undefined ? (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <FlightCardSkeleton key={i} />
                  ))}
                </div>
              ) : flights.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16">
                  <Plane className="size-10 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("noFlightsYet")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("noFlightsDescription")}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setShowUploadForm(true)}
                  >
                    <Plus className="me-2 size-4" />
                    {t("uploadFlight")}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {flights.map((flight) => (
                    <AgentFlightCard
                      key={flight._id}
                      flight={flight}
                      onEdit={setEditingFlight}
                      onDelete={setDeletingFlight}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Flight Sheet */}
        <Sheet open={showUploadForm} onOpenChange={setShowUploadForm}>
          <SheetContent
            side="right"
            className="w-full sm:max-w-xl overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle>{t("uploadFlight")}</SheetTitle>
              <SheetDescription>{t("portalSubtitle")}</SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)] px-6">
              <div className="py-6">
                <FlightUploadForm
                  onSuccess={() => setShowUploadForm(false)}
                />
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Edit Flight Sheet */}
        <Sheet
          open={editingFlight !== null}
          onOpenChange={(open) => {
            if (!open) setEditingFlight(null);
          }}
        >
          <SheetContent
            side="right"
            className="w-full sm:max-w-xl overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle>{t("editFlight")}</SheetTitle>
              <SheetDescription>
                {t("editFlightDescription")}
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)] px-6">
              <div className="py-6">
                {editingFlight && (
                  <FlightEditForm
                    key={editingFlight._id}
                    flight={editingFlight}
                    onSuccess={() => setEditingFlight(null)}
                    onCancel={() => setEditingFlight(null)}
                  />
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deletingFlight !== null}
          onOpenChange={(open) => {
            if (!open) setDeletingFlight(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("deleteFlightTitle")}</DialogTitle>
              <DialogDescription>
                {t("deleteFlightDescription")}
              </DialogDescription>
            </DialogHeader>
            {deletingFlight && (
              <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
                <span>
                  {getCountryFlag(deletingFlight.departureCountry)}
                </span>
                <span className="text-muted-foreground">&rarr;</span>
                <span>{getCountryFlag(deletingFlight.destination)}</span>
                <span className="ms-2 text-muted-foreground">
                  {formatDate(deletingFlight.departureDate, locale)}
                </span>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeletingFlight(null)}
                disabled={isDeleting}
              >
                {t("cancelDelete")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? t("saving") : t("confirmDelete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TimeFormatContext.Provider>
    </GoogleMapsProvider>
  );
}
