# Phase 2: Extraction Flights Marketplace - Research

**Researched:** 2026-03-03
**Domain:** Convex paginated queries, real-time flight listing UI, RTL-first card components, WhatsApp contact integration
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Flight card layout:**
- Full cards showing all key info at a glance — no click needed for essentials
- Each card displays: departure/destination with country flags, date/time, seats left, price per seat with currency, status badge (available/full/cancelled), urgency badge for flights departing within 24h, agent name with verified badge
- Two-column grid on desktop, single column on mobile
- WhatsApp contact button directly on card for one-tap access
- Tapping the card body opens a slide-over detail panel (Sheet component) with full description, agent profile, all contact options

**Urgency treatment:**
- Flights departing within 24 hours: pinned to top of results regardless of sort order
- Red/orange urgency banner strip at top of card with countdown text (e.g., "Departs in 8 hours")
- Maximum visual priority — impossible to miss in the grid

**Filter & search UX:**
- Horizontal sticky filter bar at top of flights list, always visible
- Dropdowns: departure country, destination, date range, seat availability
- Sort control: default to soonest departure; other options available
- Departure country auto-populates from user's selected country (useAppStore().selectedCountry) — user can clear or change
- Type filter chip: All / Flights Only / Packages Only
- Mobile: scrollable chip row, tap chip to open its dropdown

**Contact flow:**
- WhatsApp button on card: one tap opens WhatsApp with pre-filled Hebrew message including flight route and date
- Phone number hidden by default; "Show Phone" button reveals it on tap (increments contactCount for agent analytics)
- Contact requires authentication — non-authenticated users see "Sign in to contact" prompt
- Detail panel (Sheet slide-over from right/RTL-aware) shows full description, agent profile, all contact options

**Package presentation:**
- Package listings displayed in same grid as simple flights — no separate tab
- "Package Deal" badge on card, plus small icons showing included components (hotel, bus/ferry transfer, insurance)
- Detail panel shows itemized breakdown: each component as a row with icon, name, brief details
- One bundled pricePerSeat — no individual component pricing
- Type filter allows isolating packages from simple flights

### Claude's Discretion
- Exact card spacing, shadows, typography, and responsive breakpoints
- Loading skeleton animation details (FlightCardSkeleton already exists)
- Empty state design (no flights matching filters)
- Error state handling
- Exact urgency countdown format and refresh interval
- Filter dropdown styling and interaction details
- Detail panel layout and spacing
- Sort option labels and additional sort options beyond soonest departure

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FLIT-01 | User can search and filter flights by departure country, destination, date range, and seats available | Convex withIndex + .filter() pattern; by_status_departure and by_country_departure indexes already defined |
| FLIT-02 | User can view clear pricing per seat with currency display | Schema has pricePerSeat + currency fields; format with locale-aware number formatting |
| FLIT-03 | User can see flight status indicator (available / full / cancelled) | Badge component with variant styling; status is indexed in schema |
| FLIT-04 | User can contact agent via WhatsApp click-to-chat or phone number reveal | wa.me URL format + encodeURIComponent for Hebrew; contactCount patch mutation |
| FLIT-05 | User can see seat availability counter ("X seats left") | seats field on flight document; display directly |
| FLIT-06 | User can see listing creation date and "updated X ago" timestamp | Convex _creationTime system field; date-fns formatDistanceToNow with he locale |
| FLIT-07 | User can view mobile-first RTL flight cards scannable in 3 seconds | FlightCardSkeleton already exists; logical CSS ms-/me-/ps-/pe- required throughout |
| FLIT-08 | User can view package bundles (flight + hotel + transfer + insurance) as single listings | isPackage + hotelIncluded + transferIncluded + insuranceIncluded in schema |
| FLIT-09 | User can see urgency badge on flights departing in less than 24 hours | Client-side: departureDate - Date.now() < 86400000; pin urgents to top in query result ordering |
| FLIT-10 | User can see default sort by soonest departure date | by_status_departure index orders by departureDate; .order("asc") on departurDate |
| FLIT-11 | User can see verified agent badge on admin-approved agents | isApproved field on users table; denormalize into flight query result |
| FLIT-12 | User can see destination country flag and city on each listing | COUNTRIES data (30 entries with flag emoji) already in src/shared/data/countries.ts |
</phase_requirements>

---

## Summary

Phase 2 builds on a solid foundation. The Convex schema for `flights` is fully defined with all needed fields and two relevant indexes (`by_status_departure` and `by_country_departure`). All major UI primitives exist: `FlightCardSkeleton`, `Badge`, `Sheet`, `Button`, `ScrollArea`, and the `COUNTRIES` data with flags. The `useAppStore` has `selectedCountry` for auto-populating the departure filter, and `useDirection` handles RTL Sheet side.

The primary technical challenges are: (1) building a Convex paginated query that handles multi-field filtering efficiently across the existing indexes, (2) pinning urgency flights to the top regardless of sort (requires a two-bucket query strategy), (3) incrementing `contactCount` atomically when phone is revealed, and (4) the RTL-aware detail panel that slides in from the correct edge.

The key architectural decision is that Convex indexes only support equality then range in defined field order. This means complex filtering (e.g., status + country + date range + seats) cannot all be satisfied by a single index scan. The recommended pattern is: use the most selective index (by_status_departure or by_country_departure) for the primary filter, then apply post-index TypeScript filtering for additional conditions. For the urgency pinning requirement, fetch urgent flights separately and merge at the component level.

**Primary recommendation:** Build three Convex query functions (listFlights for paginated browse, listUrgentFlights for the pinned top section, incrementContactCount for phone reveal), wire them into a single FlightsPage that uses preloadQuery for first-load SSR + usePaginatedQuery for client-side infinite scroll.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| convex | ^1.32.0 | Database + real-time subscriptions | Already installed; schema defined |
| convex/react | (bundled) | usePaginatedQuery, usePreloadedQuery hooks | Official Convex React client |
| convex/nextjs | (bundled) | preloadQuery for SSR initial data | Official Next.js server rendering |
| react-intersection-observer | ^9.x | Infinite scroll sentinel detection | Lightest API; useInView hook; thebuilder/react-intersection-observer |
| date-fns | ^4.1.0 | "Updated X ago" timestamps with Hebrew locale | Already installed; heIL locale built in |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| convex-helpers | ^0.1.114 | filter() helper for post-index TypeScript filtering | When filtering on non-indexed fields (seats, destination, date range) |
| zustand | ^5.0.11 | useAppStore for selectedCountry auto-filter | Already installed; selectedCountry drives departure filter |
| lucide-react | ^0.576.0 | Plane, Hotel, Bus, Shield icons for package components | Already installed |
| shadcn Sheet | installed | RTL-aware slide-over detail panel | Radix Dialog with logical CSS side property |
| shadcn Badge | installed | status, urgency, verified, package badges | Variant system via CVA |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-intersection-observer | Native IntersectionObserver | Library handles server-side rendering edge cases, cleanup, and multiple-observer deduplication — use the library |
| date-fns heIL locale | Intl.RelativeTimeFormat | date-fns already installed; heIL has more granular output than Intl API |
| usePaginatedQuery | useQuery with manual cursor | usePaginatedQuery is the standard Convex pattern; manual cursor management adds complexity with no benefit |

**Installation:**
```bash
npm install react-intersection-observer
```
(All other packages already installed)

---

## Architecture Patterns

### Recommended Project Structure
```
convex/
└── modules/flights/
    ├── queries.ts       # listFlights (paginated), listUrgentFlights, getFlightWithAgent
    └── mutations.ts     # incrementContactCount

src/app/[locale]/(dashboard)/flights/
├── page.tsx             # Server Component: preloadQuery + Suspense
├── loading.tsx          # Already exists (skeleton)
└── error.tsx            # Already exists

src/shared/components/flights/
├── FlightCard.tsx        # Card component (all display fields)
├── FlightDetailSheet.tsx # Slide-over detail panel (Sheet)
├── FlightFilterBar.tsx   # Sticky horizontal filter bar
└── FlightsGrid.tsx       # Paginated grid + intersection observer sentinel
```

### Pattern 1: Paginated Convex Query with Post-Index Filter

**What:** Use by_status_departure or by_country_departure index for primary filter, then apply TypeScript filter for additional conditions.

**When to use:** When filters span fields not jointly covered by a single index.

**Backend query:**
```typescript
// convex/modules/flights/queries.ts
// Source: https://docs.convex.dev/database/pagination
import { paginationOptsValidator } from "convex/server";
import { filter } from "convex-helpers/server/filter";

export const listFlights = query({
  args: {
    paginationOpts: paginationOptsValidator,
    departureCountry: v.optional(v.string()),
    destination: v.optional(v.string()),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
    minSeats: v.optional(v.number()),
    isPackage: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Use by_status_departure for approved+available primary scan
    // Index: ["status", "departureDate"] — scan available flights ordered by departure
    const baseQuery = args.departureCountry
      ? ctx.db
          .query("flights")
          .withIndex("by_country_departure", (q) =>
            q.eq("departureCountry", args.departureCountry!)
          )
      : ctx.db
          .query("flights")
          .withIndex("by_status_departure", (q) =>
            q.eq("status", "available")
          );

    return await filter(
      baseQuery,
      (flight) =>
        !flight.isDeleted &&
        flight.approvalStatus === "approved" &&
        (args.departureCountry ? flight.status === "available" : true) &&
        (args.destination ? flight.destination === args.destination : true) &&
        (args.dateFrom ? flight.departureDate >= args.dateFrom : true) &&
        (args.dateTo ? flight.departureDate <= args.dateTo : true) &&
        (args.minSeats ? flight.seats >= args.minSeats : true) &&
        (args.isPackage !== undefined ? (flight.isPackage ?? false) === args.isPackage : true)
    ).paginate(args.paginationOpts);
  },
});
```

### Pattern 2: Urgency Pinning (Two-Bucket Strategy)

**What:** Fetch urgent flights (departureDate within 24h) separately, render them pinned at top, then render paginated normal results below.

**When to use:** When "pin to top regardless of sort" is required — single paginated query cannot guarantee this ordering.

**Backend query:**
```typescript
// Separate non-paginated query for urgency bucket (24h window, limited count)
export const listUrgentFlights = query({
  args: {
    departureCountry: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const in24h = now + 24 * 60 * 60 * 1000;
    // Scan by_status_departure with date range for next 24h
    return await ctx.db
      .query("flights")
      .withIndex("by_status_departure", (q) =>
        q.eq("status", "available").gte("departureDate", now).lte("departureDate", in24h)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("approvalStatus"), "approved"),
          q.eq(q.field("isDeleted"), undefined)
        )
      )
      .order("asc")
      .take(10); // Cap at 10 urgent flights maximum
  },
});
```

**Note:** The `by_status_departure` index supports this date range scan perfectly: equality on `status` followed by range on `departureDate` (gte + lte) is valid per Convex index rules.

### Pattern 3: Infinite Scroll with useInView

**What:** Sentinel div at bottom of list triggers loadMore when it enters viewport.

**When to use:** Replacing load-more button with automatic scroll-triggered loading.

```typescript
// src/shared/components/flights/FlightsGrid.tsx
"use client";
import { useInView } from "react-intersection-observer";
import { usePaginatedQuery } from "convex/react";

export function FlightsGrid({ filters }) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.flights.queries.listFlights,
    filters,  // passed as args; query re-runs when filters change
    { initialNumItems: 12 }
  );

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "200px",  // trigger 200px before sentinel reaches viewport
  });

  // Auto-load when sentinel enters view
  useEffect(() => {
    if (inView && status === "CanLoadMore") {
      loadMore(12);
    }
  }, [inView, status, loadMore]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {results.map((flight) => (
          <FlightCard key={flight._id} flight={flight} />
        ))}
      </div>
      {/* Sentinel — invisible div that triggers infinite scroll */}
      <div ref={ref} className="h-1" />
      {status === "Exhausted" && <EmptyOrEndState />}
    </>
  );
}
```

### Pattern 4: SSR with preloadQuery

**What:** Server Component fetches initial data so page is not blank on first load.

```typescript
// src/app/[locale]/(dashboard)/flights/page.tsx
// Source: https://docs.convex.dev/client/nextjs/app-router/server-rendering
import { preloadQuery } from "convex/nextjs";

export default async function FlightsPage() {
  const preloadedFlights = await preloadQuery(
    api.flights.queries.listFlights,
    { /* initial args: no filters */ },
    { initialNumItems: 12 }  // Note: preloadQuery args object, not options
  );

  return (
    <Suspense fallback={<FlightGridSkeleton />}>
      <FlightsClientPage preloadedFlights={preloadedFlights} />
    </Suspense>
  );
}
```

**Limitation:** preloadQuery does not support pagination continuation — it loads the first page only. usePaginatedQuery on the client picks up real-time from there. This is the correct Convex pattern (confirmed by official docs).

### Pattern 5: WhatsApp Click-to-Chat URL

**What:** Standard wa.me URL with Hebrew pre-filled message.

```typescript
// Source: https://faq.whatsapp.com/5913398998672934
function buildWhatsAppUrl(phone: string, flight: Flight): string {
  const departure = getCountryByCode(flight.departureCountry)?.nameHe ?? flight.departureCountry;
  const destination = getCountryByCode(flight.destination)?.nameHe ?? flight.destination;
  const date = new Date(flight.departureDate).toLocaleDateString("he-IL");

  const message = `שלום, אני מעוניין/ת בטיסה מ${departure} ל${destination} בתאריך ${date}`;

  // Strip non-digits from phone, remove leading +
  const cleanPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
```

### Pattern 6: contactCount Increment Mutation

**What:** Atomic read-modify-write on contactCount when user reveals phone number.

```typescript
// convex/modules/flights/mutations.ts
export const incrementContactCount = mutation({
  args: { flightId: v.id("flights") },
  handler: async (ctx, args) => {
    await requireUser(ctx);  // must be authenticated
    const flight = await ctx.db.get(args.flightId);
    if (!flight) throw new Error("Flight not found");
    await ctx.db.patch(args.flightId, {
      contactCount: (flight.contactCount ?? 0) + 1,
    });
  },
});
```

**Note:** Convex mutations are ACID-atomic. Read + patch within a single mutation is safe from race conditions.

### Pattern 7: RTL-Aware Sheet Side

**What:** Sheet slides in from left on RTL (Hebrew), from right on LTR (English).

```typescript
// Source: Sheet component already uses logical CSS (end-0, start-0, border-s, border-e)
import { useDirection } from "@/shared/hooks/useDirection";

function FlightDetailSheet({ flight, open, onOpenChange }) {
  const { isRTL } = useDirection();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isRTL ? "left" : "right"}>
        {/* Panel content */}
      </SheetContent>
    </Sheet>
  );
}
```

**Note:** In RTL layouts, "left" visually appears on the right side of the screen because the document direction flips. Verify empirically. Alternatively, always use "right" and rely on the logical CSS in SheetContent — the existing sheet.tsx already uses `end-0` and `start-0` which flip with RTL.

### Pattern 8: Agent Denormalization for Verified Badge

**What:** The flight document has agentId but not agent name or isApproved. Join in query.

```typescript
// In listFlights query handler — denormalize agent data
export const getFlightWithAgent = query({
  args: { flightId: v.id("flights") },
  handler: async (ctx, args) => {
    const flight = await ctx.db.get(args.flightId);
    if (!flight) return null;
    const agent = await ctx.db.get(flight.agentId);
    return {
      ...flight,
      agentName: agent?.name ?? "Unknown",
      agentIsVerified: agent?.isApproved === true,
      agentImageUrl: agent?.imageUrl,
    };
  },
});
```

For the list query, denormalize inline to avoid N+1:
```typescript
// In listFlights paginate, after getting page:
const result = await filter(baseQuery, ...).paginate(args.paginationOpts);
const page = await Promise.all(
  result.page.map(async (flight) => {
    const agent = await ctx.db.get(flight.agentId);
    return { ...flight, agentName: agent?.name, agentIsVerified: agent?.isApproved === true };
  })
);
return { ...result, page };
```

### Anti-Patterns to Avoid

- **Filter after collect on large tables:** Never `.collect()` then filter in JS — always use index + paginate or filter() helper with paginate.
- **.filter() on paginated query directly:** Convex's built-in `.filter()` (not the convex-helpers one) applied before `.paginate()` can produce undersized pages. Use `filter` from `convex-helpers/server/filter` which wraps paginate correctly.
- **Physical directional CSS:** All layout must use `ms-`, `me-`, `ps-`, `pe-` — never `ml-`, `mr-`, `pl-`, `pr-`. This is a project-wide hard rule (established in Phase 1).
- **Hardcoded Sheet side="right":** Must use `useDirection()` or always use "right" and confirm it works in RTL context.
- **String concatenation for WhatsApp URL:** Always use `encodeURIComponent()` — Hebrew characters must be URL-encoded.
- **Filtering urgency client-side only:** Urgent flights must be fetched with a dedicated query using the date range index, not filtered from the main paginated results (those could be paginated to a later page).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Infinite scroll trigger | Custom scroll event listener | react-intersection-observer useInView | Handles SSR, cleanup, multiple observers, and performance |
| "Updated X ago" display | Manual date arithmetic | date-fns formatDistanceToNow with heIL locale | Handles all edge cases, RTL-aware output, already installed |
| Paginated list with real-time | Manual cursor state + useQuery | usePaginatedQuery | Handles cursor management, page merging, reactive updates |
| Post-index multi-field filter | Manual Array.filter() after collect | filter() from convex-helpers/server/filter | Works correctly with .paginate(), avoids collect-all-then-filter |
| WhatsApp URL construction | Custom URL builder | Standard wa.me + encodeURIComponent pattern | One-liner; no library needed |

**Key insight:** Convex's reactive pagination (usePaginatedQuery) already handles all the real-time complexity — new flights that arrive go to the top automatically, status changes reflect immediately, no polling needed.

---

## Common Pitfalls

### Pitfall 1: Index Field Order Violation

**What goes wrong:** Trying to filter by `departureDate` range without first providing equality on all preceding index fields, or using a range condition and then adding another equality condition.

**Why it happens:** `by_status_departure` is defined as `["status", "departureDate"]`. You can do `.eq("status", "available").gte("departureDate", x)` but NOT `.gte("departureDate", x).eq("status", "available")` — Convex TypeScript types enforce this at compile time.

**How to avoid:** Always structure index queries as: equality conditions first (in index order), then at most one range condition (gte/gt + lte/lt) on the next field.

**Warning signs:** TypeScript compile error in query handler — type error on index range builder.

### Pitfall 2: Post-Pagination Page Size Shrinkage

**What goes wrong:** Using `.filter()` after paginate returns fewer items than requested. If 3 of 12 items pass the filter, you get a page of 3 even though 12 were requested.

**Why it happens:** Convex pagination fetches N items from the index, then your filter runs on those N — but the cursor advances past the filtered-out items. The next page starts after item N, not after the last matching item.

**How to avoid:** Use `filter()` from `convex-helpers/server/filter` — it wraps paginate correctly to ensure pages are filled. Or denormalize filter fields into the index.

**Warning signs:** Infinite scroll loads but pages are inconsistently sized; some appear empty even when data exists.

### Pitfall 3: Urgency Pinning in a Single Paginated Query

**What goes wrong:** Attempting to order results so urgency flights always appear first in a single usePaginatedQuery call. Convex pagination uses a single ordered scan — you can't have "urgent first, then by date" in one paginated query.

**Why it happens:** Paginated queries must follow a single consistent index order. You cannot apply conditional ordering.

**How to avoid:** Use two separate queries: `listUrgentFlights` (non-paginated, max 10, by_status_departure with date range) + `listFlights` (paginated, normal browse). Render urgents section above the paginated grid.

**Warning signs:** Urgency flights appear in the middle of paginated results rather than pinned at top.

### Pitfall 4: preloadQuery Does Not Paginate

**What goes wrong:** Expecting preloadQuery to handle pagination state or multiple pages.

**Why it happens:** preloadQuery is for SSR hydration of a single query result. It does not support the paginated query protocol.

**How to avoid:** Use preloadQuery only for the first page of data (or for non-paginated queries like getFlightWithAgent). The client-side usePaginatedQuery handles all subsequent pages.

**Warning signs:** "Pagination is not supported in preloaded queries" error, or page always shows only the initial load count regardless of scroll.

### Pitfall 5: Authentication Check on Contact Buttons

**What goes wrong:** Non-authenticated users can tap WhatsApp or phone reveal buttons and either see nothing or get an error.

**Why it happens:** Contact buttons are client components; Clerk auth state needs to be checked before showing or triggering.

**How to avoid:** Use `useAuth()` from `@clerk/nextjs` (already established pattern) to check `isSignedIn`. If not signed in, render "Sign in to contact" prompt instead of the WhatsApp button.

**Warning signs:** Console errors from Convex mutations called without auth token; WhatsApp URL opens but agent gets no message.

### Pitfall 6: RTL Sheet Direction

**What goes wrong:** Sheet always slides from the right visually, which is the "start" of the screen in RTL — this is correct in LTR but reads as "behind" the content in RTL contexts.

**Why it happens:** In RTL, the right side is the start (where content begins). A detail panel should ideally slide in from the start edge (which is the right edge in RTL). The existing SheetContent already uses `end-0` and `start-0` logical properties — side="right" maps to `end-0` which IS the correct logical end in both LTR and RTL.

**How to avoid:** Keep `side="right"` always — the logical CSS in the existing Sheet component already handles RTL correctly. Do not switch to "left" based on isRTL, as that would slide from the wrong edge in RTL.

**Warning signs:** Detail panel appears on wrong side; content flows out of view direction.

---

## Code Examples

Verified patterns from official sources:

### usePaginatedQuery Basic Usage
```typescript
// Source: https://docs.convex.dev/database/pagination
"use client";
import { usePaginatedQuery } from "convex/react";

const { results, status, loadMore } = usePaginatedQuery(
  api.flights.queries.listFlights,
  { departureCountry: "IL", status: "available" },
  { initialNumItems: 12 }
);
// status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted"
// loadMore(12) fetches next 12 items
```

### Index Range Query with Date Bounds
```typescript
// Source: https://docs.convex.dev/database/reading-data/indexes/
// Valid: equality on index field 1, then range on index field 2
ctx.db
  .query("flights")
  .withIndex("by_status_departure", (q) =>
    q
      .eq("status", "available")           // equality on field 1
      .gte("departureDate", now)            // range lower bound on field 2
      .lte("departureDate", now + 86400000) // range upper bound on field 2
  )
  .order("asc")
  .take(10);
```

### filter() Helper with paginate
```typescript
// Source: https://stack.convex.dev/complex-filters-in-convex
import { filter } from "convex-helpers/server/filter";

return await filter(
  ctx.db.query("flights").withIndex("by_country_departure", (q) =>
    q.eq("departureCountry", args.departureCountry)
  ),
  (flight) =>
    !flight.isDeleted &&
    flight.approvalStatus === "approved" &&
    flight.seats >= (args.minSeats ?? 1)
).paginate(args.paginationOpts);
```

### useInView Infinite Scroll Sentinel
```typescript
// Source: https://github.com/thebuilder/react-intersection-observer
import { useInView } from "react-intersection-observer";

const { ref, inView } = useInView({
  threshold: 0,
  rootMargin: "200px 0px",  // trigger 200px before element enters viewport
});

// Attach ref to sentinel element at bottom of list
// When inView becomes true, call loadMore(12)
```

### WhatsApp URL with Hebrew
```typescript
// Source: https://faq.whatsapp.com/5913398998672934
const departure = getCountryByCode(flight.departureCountry)?.nameHe;
const destination = getCountryByCode(flight.destination)?.nameHe;
const dateStr = new Date(flight.departureDate).toLocaleDateString("he-IL", {
  day: "numeric", month: "long", year: "numeric"
});
const msg = `שלום, אני מעוניין/ת בטיסה מ${departure} ל${destination} בתאריך ${dateStr}. אנא ספרו לי עוד פרטים.`;
const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
```

### date-fns Hebrew Relative Time
```typescript
// Source: date-fns docs, package already installed
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

// Displays "לפני 3 שעות" for Hebrew locale
const relativeTime = formatDistanceToNow(new Date(flight._creationTime), {
  addSuffix: true,
  locale: he,  // note: "he" not "heIL" in date-fns v4
});
```

### preloadQuery in Server Component
```typescript
// Source: https://docs.convex.dev/client/nextjs/app-router/server-rendering
import { preloadQuery } from "convex/nextjs";

// Server Component
const preloaded = await preloadQuery(
  api.flights.queries.listFlights,
  {} // initial args — no filters
);
// Pass to Client Component as prop
```

### Badge Variants for Status
```typescript
// status badge — using existing Badge component
const statusVariant = {
  available: "default",   // green-ish primary
  full: "secondary",      // muted
  cancelled: "destructive", // red
} as const;

// For urgency: use className override since no "warning" variant exists
<Badge className="bg-orange-500 text-white">
  טסים תוך {hoursLeft} שעות
</Badge>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| useQuery with manual offset | usePaginatedQuery with cursor-based pagination | Convex launch | Reactive — new items appear automatically without refetch |
| Load more button | Intersection Observer sentinel | React ecosystem standard (2022+) | Better UX; no click required |
| Moment.js for dates | date-fns (already installed) | 2022+ | Smaller bundle, tree-shakeable, Hebrew locale built in |

**Deprecated/outdated:**
- Manual `.filter()` before `.paginate()` in Convex: The built-in `.filter()` before paginate can produce undersized pages. Use `filter()` from convex-helpers instead.

---

## Open Questions

1. **Sheet RTL slide direction**
   - What we know: Sheet uses logical CSS (`end-0`, `start-0`); `side="right"` uses `end-0` which maps to visual-right in LTR and visual-right in RTL too (logical "end" = right in LTR, left in RTL).
   - What's unclear: Whether "end" visually on RTL appears as expected — needs empirical confirmation on an RTL browser with the Sheet component.
   - Recommendation: Test Sheet with `side="right"` in Hebrew locale first; if it slides from the wrong edge, switch to dynamic `side={isRTL ? "left" : "right"}`.

2. **date-fns Hebrew locale import name**
   - What we know: The locale object is `he` from `date-fns/locale` in date-fns v4.
   - What's unclear: Whether the locale produces correctly RTL-formatted strings or requires additional RTL handling.
   - Recommendation: Test `formatDistanceToNow` output in storybook/component; if strings need wrapping in a `<bdi>` tag for mixed-direction text, add it.

3. **Agent denormalization cost in paginated list**
   - What we know: Each flight requires one `ctx.db.get(flight.agentId)` join. For 12 items per page, that's 12 reads.
   - What's unclear: Convex pricing/performance impact of 12 document reads per page load in production.
   - Recommendation: Use Promise.all() to parallelize the 12 agent lookups (already shown in Pattern 8). If this becomes a bottleneck later, add an `agentName`/`agentIsVerified` denormalized field to the flights document — but don't prematurely optimize in Phase 2.

4. **Filter + paginate correctness with convex-helpers filter()**
   - What we know: Issue #864 in convex-helpers reports the filter helper can miss results under some pagination conditions (filed November 2025).
   - What's unclear: Whether the bug is fixed in convex-helpers ^0.1.114 (the installed version).
   - Recommendation: Test filtered paginated query with known data set. If results are missed when paginating with filters, fall back to: over-fetch with index only, then filter client-side (acceptable for flights — likely low hundreds of documents, not thousands).

---

## Validation Architecture

> `workflow.nyquist_validation` is not present in .planning/config.json — section omitted.

---

## Sources

### Primary (HIGH confidence)
- https://docs.convex.dev/database/pagination — usePaginatedQuery API, paginationOptsValidator, backend query structure
- https://docs.convex.dev/database/reading-data/indexes/ — Index range query rules (equality then range; field order constraint)
- https://docs.convex.dev/client/nextjs/app-router/server-rendering — preloadQuery and usePreloadedQuery API
- https://docs.convex.dev/database/advanced/occ — Atomic mutations; patch read-modify-write safety
- https://faq.whatsapp.com/5913398998672934 — WhatsApp click-to-chat URL format
- Project codebase — schema.ts (all flight fields confirmed), validators.ts (paginationArgs), LoadingSkeleton.tsx (FlightCardSkeleton exists), countries.ts (30 countries with flags), appStore.ts (selectedCountry)

### Secondary (MEDIUM confidence)
- https://stack.convex.dev/complex-filters-in-convex — filter() helper usage with withIndex and paginate
- https://github.com/thebuilder/react-intersection-observer — useInView hook API (threshold, rootMargin)
- date-fns docs — formatDistanceToNow with `he` locale; package already installed at v4.1.0

### Tertiary (LOW confidence)
- GitHub issue #864 get-convex/convex-helpers — filter helper + pagination can miss results under some conditions. Unverified whether fixed in installed version (^0.1.114). Flag for empirical testing.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries identified are already installed except react-intersection-observer; APIs verified against official docs
- Architecture: HIGH — Convex index rules and pagination patterns verified; two-bucket urgency strategy is necessary given Convex ordering constraints
- Pitfalls: HIGH for index/pagination pitfalls (verified); MEDIUM for Sheet RTL direction (needs empirical test); LOW for filter helper bug (unverified fix status)

**Research date:** 2026-03-03
**Valid until:** 2026-04-03 (Convex stable; date-fns stable; react-intersection-observer stable)
