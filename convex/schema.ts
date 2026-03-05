import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================================
  // USERS — synced from Clerk via webhook
  // ============================================================
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("agent"), v.literal("admin")),
    isApproved: v.optional(v.boolean()),
    country: v.optional(v.string()),
    phone: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    companyName: v.optional(v.string()),
    isBanned: v.optional(v.boolean()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // ============================================================
  // MODULE 1 — Extraction Flights
  // ============================================================
  flights: defineTable({
    agentId: v.id("users"),
    departureCountry: v.string(),
    departureCity: v.optional(v.string()),
    destination: v.string(),
    destinationCity: v.optional(v.string()),
    departureAirport: v.optional(v.string()), // e.g. "TLV", "ATH"
    destinationAirport: v.optional(v.string()), // e.g. "JFK", "LHR"
    departureDate: v.number(), // Unix timestamp
    arrivalDate: v.optional(v.number()), // Unix timestamp — landing time
    seats: v.number(),
    pricePerSeat: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("available"),
      v.literal("full"),
      v.literal("cancelled")
    ),
    description: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    // Luggage
    checkedBagKg: v.optional(v.number()), // max checked bag weight, e.g. 23
    carryOnAllowed: v.optional(v.boolean()), // trolley / carry-on
    personalItemAllowed: v.optional(v.boolean()), // handbag / personal item
    // Stops / layovers
    stops: v.optional(
      v.array(
        v.object({
          country: v.string(), // ISO country code for flag
          city: v.optional(v.string()),
          durationMinutes: v.optional(v.number()),
        })
      )
    ),
    isPackage: v.optional(v.boolean()),
    hotelIncluded: v.optional(v.string()),
    transferIncluded: v.optional(v.string()),
    insuranceIncluded: v.optional(v.string()),
    approvalStatus: v.union(
      v.literal("draft"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    contactCount: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_agent", ["agentId"])
    .index("by_status_departure", ["status", "departureDate"])
    .index("by_country_departure", ["departureCountry", "departureDate"])
    .index("by_status_creation", ["status"])
    .index("by_country_creation", ["departureCountry"])
    .index("by_status_price", ["status", "pricePerSeat"])
    .index("by_country_price", ["departureCountry", "pricePerSeat"])
    .index("by_approval", ["approvalStatus"]),

  // ============================================================
  // MODULE 2 — Map Services (populated by Google Places Action)
  // ============================================================
  services: defineTable({
    placeId: v.string(),
    name: v.string(),
    country: v.string(),
    type: v.union(
      v.literal("chabad"),
      v.literal("synagogue"),
      v.literal("kosher"),
      v.literal("mikveh"),
      v.literal("embassy"),
      v.literal("consulate"),
      v.literal("jcc")
    ),
    lat: v.number(),
    lng: v.number(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    website: v.optional(v.string()),
    hours: v.optional(v.string()),
    syncedAt: v.number(),
  })
    .index("by_country_type", ["country", "type"])
    .index("by_place_id", ["placeId"]),

  // ============================================================
  // MODULE 3 — News
  // ============================================================
  newsArticles: defineTable({
    sourceId: v.id("newsSources"),
    title: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    language: v.union(v.literal("he"), v.literal("en")),
    publishedAt: v.number(),
    country: v.optional(v.string()),
    isFeatured: v.optional(v.boolean()),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_source", ["sourceId"])
    .index("by_published", ["publishedAt"])
    .index("by_language_published", ["language", "publishedAt"])
    .index("by_url", ["url"]),

  newsSources: defineTable({
    url: v.string(),
    name: v.string(),
    faviconUrl: v.optional(v.string()),
    language: v.union(v.literal("he"), v.literal("en")),
    trustTier: v.union(
      v.literal("official"),
      v.literal("verified"),
      v.literal("community")
    ),
    isActive: v.boolean(),
  }).index("by_active", ["isActive"]),

  // Alerts (cross-module, managed in News/Admin)
  alerts: defineTable({
    title: v.string(),
    content: v.string(),
    severity: v.union(v.literal("info"), v.literal("urgent")),
    authorId: v.id("users"),
    isActive: v.boolean(),
  }).index("by_active_severity", ["isActive", "severity"]),

  // ============================================================
  // MODULE 4 — Community Feed
  // ============================================================
  posts: defineTable({
    authorId: v.id("users"),
    content: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("help_needed"),
        v.literal("offering_help"),
        v.literal("info"),
        v.literal("warning"),
        v.literal("safety_check")
      )
    ),
    isPinned: v.optional(v.boolean()),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_country_time", ["country"])
    .index("by_author", ["authorId"]),

  // Hot/cold split for OCC avoidance — likes in separate table
  postLikes: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
  })
    .index("by_post", ["postId"])
    .index("by_user_post", ["userId", "postId"]),

  // Flat comments (no threading in v1)
  postComments: defineTable({
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
    isDeleted: v.optional(v.boolean()),
  }).index("by_post", ["postId"]),

  // ============================================================
  // MODULE 5 — Chat
  // ============================================================
  chatRooms: defineTable({
    country: v.optional(v.string()),
    name: v.string(),
    type: v.union(
      v.literal("country"),
      v.literal("emergency"),
      v.literal("dm")
    ),
    participantIds: v.optional(v.array(v.id("users"))),
  })
    .index("by_country", ["country"])
    .index("by_type", ["type"]),

  // Country-sharded for subscription bandwidth
  chatMessages: defineTable({
    roomId: v.id("chatRooms"),
    authorId: v.id("users"),
    content: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    isPinned: v.optional(v.boolean()),
    isDeleted: v.optional(v.boolean()),
  }).index("by_room_time", ["roomId"]),

  chatReactions: defineTable({
    messageId: v.id("chatMessages"),
    userId: v.id("users"),
    emoji: v.string(),
  })
    .index("by_message", ["messageId"])
    .index("by_user_message", ["userId", "messageId"]),

  // Typing indicators + online counts
  chatPresence: defineTable({
    userId: v.id("users"),
    roomId: v.id("chatRooms"),
    lastSeen: v.number(),
    isTyping: v.optional(v.boolean()),
  })
    .index("by_room", ["roomId"])
    .index("by_user_room", ["userId", "roomId"]),

  // ============================================================
  // MODULE 6 — Hotel Reservations
  // ============================================================
  reservations: defineTable({
    sellerId: v.id("users"),
    hotelName: v.string(),
    country: v.string(),
    city: v.string(),
    checkIn: v.number(),
    checkOut: v.number(),
    roomType: v.optional(v.string()),
    originalPrice: v.number(),
    askingPrice: v.number(),
    currency: v.string(),
    cancellationPolicy: v.union(
      v.literal("full"),
      v.literal("partial"),
      v.literal("none")
    ),
    contactWhatsapp: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    isSold: v.optional(v.boolean()),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_country_checkin", ["country", "checkIn"])
    .index("by_seller", ["sellerId"]),

  // ============================================================
  // MODULE 7 — Admin
  // ============================================================
  reports: defineTable({
    reporterId: v.id("users"),
    targetId: v.string(),
    targetType: v.union(
      v.literal("post"),
      v.literal("message"),
      v.literal("flight"),
      v.literal("reservation")
    ),
    reason: v.union(
      v.literal("misinformation"),
      v.literal("spam"),
      v.literal("harassment"),
      v.literal("other")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("dismissed")
    ),
    reviewedBy: v.optional(v.id("users")),
  })
    .index("by_status", ["status"])
    .index("by_target", ["targetId"]),

  auditLog: defineTable({
    adminId: v.id("users"),
    action: v.string(),
    targetId: v.optional(v.string()),
    targetType: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("by_admin", ["adminId"])
    .index("by_action_time", ["action"]),
});
