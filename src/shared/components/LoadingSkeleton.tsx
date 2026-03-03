import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// CardSkeleton — Rectangle with shimmer for card-shaped content
// ─────────────────────────────────────────────────────────────────────────────
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card p-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="h-3 w-1/2 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-3 w-16 rounded-md" />
        <Skeleton className="h-3 w-16 rounded-md" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ListSkeleton — Multiple rows of skeleton lines
// ─────────────────────────────────────────────────────────────────────────────
interface ListSkeletonProps {
  rows?: number;
  className?: string;
}

export function ListSkeleton({ rows = 5, className }: ListSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border bg-card p-3">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-3/4 rounded-md" />
            <Skeleton className="h-3 w-1/2 rounded-md" />
          </div>
          <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PageSkeleton — Full page loading state with header + content area
// ─────────────────────────────────────────────────────────────────────────────
export function PageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-48 rounded-md" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>

      {/* Stats cards row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl border bg-card p-4">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        ))}
      </div>

      {/* Content cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton className="md:col-span-2" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SidebarSkeleton — Navigation item-shaped skeletons
// ─────────────────────────────────────────────────────────────────────────────
interface SidebarSkeletonProps {
  items?: number;
  collapsed?: boolean;
}

export function SidebarSkeleton({ items = 7, collapsed = false }: SidebarSkeletonProps) {
  return (
    <div className="flex flex-col gap-1 p-2">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-3 rounded-lg p-2",
            collapsed ? "justify-center" : ""
          )}
        >
          <Skeleton className="size-5 shrink-0 rounded-md" />
          {!collapsed && <Skeleton className="h-4 flex-1 rounded-md" />}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FlightCardSkeleton — Skeleton matching the flight card shape (Phase 2)
// ─────────────────────────────────────────────────────────────────────────────
export function FlightCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card p-4",
        className
      )}
    >
      {/* Flight route header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-5 w-12 rounded-md" />
          <Skeleton className="h-3 w-20 rounded-md" />
        </div>
        <div className="flex flex-1 flex-col items-center gap-1">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-1 w-full rounded-full" />
        </div>
        <div className="flex flex-col gap-1.5 items-end">
          <Skeleton className="h-5 w-12 rounded-md" />
          <Skeleton className="h-3 w-20 rounded-md" />
        </div>
      </div>

      {/* Flight details */}
      <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-4 w-16 rounded-full" />
        <div className="ms-auto flex gap-2">
          <Skeleton className="h-4 w-12 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PostSkeleton — Skeleton matching the community feed post shape (Phase 6)
// ─────────────────────────────────────────────────────────────────────────────
export function PostSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card p-4",
        className
      )}
    >
      {/* Author header */}
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Post content */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-5/6 rounded-md" />
        <Skeleton className="h-4 w-4/6 rounded-md" />
      </div>

      {/* Optional image placeholder */}
      <Skeleton className="h-48 w-full rounded-lg" />

      {/* Post actions */}
      <div className="flex items-center gap-4 pt-1">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <div className="ms-auto">
          <Skeleton className="h-6 w-6 rounded-md" />
        </div>
      </div>
    </div>
  );
}
