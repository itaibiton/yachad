import { internalMutation } from "./_generated/server";

/** Clear ALL data across all tables. Run: npx convex run seed:clearAll */
export const clearAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const tables = [
      "chatReactions", "chatPresence", "chatMessages", "chatRooms",
      "postComments", "postLikes", "posts",
      "savedFlights", "flights",
      "newsArticles", "newsSources", "alerts",
      "reservations", "reports", "auditLog",
      "users",
    ] as const;

    const counts: Record<string, number> = {};
    for (const table of tables) {
      const rows = await ctx.db.query(table).collect();
      for (const row of rows) await ctx.db.delete(row._id);
      counts[table] = rows.length;
    }

    return { deleted: counts };
  },
});

/**
 * Seed the database with agents and 30+ flights from diverse locations.
 *
 * Run: npx convex run seed:seedFlights
 */
export const seedFlights = internalMutation({
  args: {},
  handler: async (ctx) => {
    // --- Create 1 test agent (linked to real Clerk user) ---
    const agent = await ctx.db.insert("users", {
      clerkId: "user_3ASI1O1WYkicI9zTxgU0ZbiDONG",
      email: "itaibiton2405@gmail.com",
      name: "Itai Biton",
      imageUrl: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zQVNJMU9HWHRtOTRWREdUZ3psa05SNWU5bE0ifQ",
      role: "agent",
      isApproved: true,
      country: "IL",
      phone: "+972501234567",
      whatsappNumber: "+972501234567",
      companyName: "Yachad Flights",
    });

    const now = Date.now();
    const hour = 60 * 60 * 1000;
    const day = 24 * hour;

    const flights = [
      // ===== URGENT (within 24h) =====
      {
        agentId: agent, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב",
        destination: "GR", destinationCity: "אתונה", destinationAirport: "ATH",
        departureDate: now + 3 * hour, arrivalDate: now + 6.5 * hour,
        seats: 2, pricePerSeat: 1200, currency: "USD",
        description: "טיסה ישירה מנתב״ג לאתונה. 2 מקומות אחרונים!",
        checkedBagKg: 23, carryOnAllowed: true, personalItemAllowed: true, contactCount: 8,
      },
      {
        agentId: agent, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב",
        destination: "CY", destinationCity: "לרנקה", destinationAirport: "LCA",
        departureDate: now + 5 * hour, arrivalDate: now + 6 * hour,
        seats: 5, pricePerSeat: 650, currency: "USD",
        description: "טיסה ללרנקה, קפריסין. מחיר מיוחד למשפחות.",
        checkedBagKg: 20, carryOnAllowed: true, personalItemAllowed: true, contactCount: 3,
      },
      {
        agentId: agent, departureCountry: "TR", departureAirport: "IST", departureCity: "איסטנבול",
        destination: "IL", destinationCity: "תל אביב", destinationAirport: "TLV",
        departureDate: now + 8 * hour, arrivalDate: now + 10 * hour,
        seats: 3, pricePerSeat: 550, currency: "USD",
        description: "טיסת חזרה מאיסטנבול. מקומות אחרונים!",
        checkedBagKg: 20, carryOnAllowed: true, personalItemAllowed: true, contactCount: 12,
      },
      {
        agentId: agent, departureCountry: "GR", departureAirport: "ATH", departureCity: "אתונה",
        destination: "IL", destinationCity: "תל אביב", destinationAirport: "TLV",
        departureDate: now + 14 * hour, arrivalDate: now + 17 * hour,
        seats: 1, pricePerSeat: 900, currency: "EUR",
        description: "מקום אחרון! טיסה מאתונה לתל אביב.",
        checkedBagKg: 23, carryOnAllowed: true, personalItemAllowed: true, contactCount: 20,
      },

      // ===== FROM ISRAEL =====
      {
        agentId: agent, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב",
        destination: "RO", destinationCity: "בוקרשט", destinationAirport: "OTP",
        departureDate: now + 3 * day, arrivalDate: now + 3 * day + 3 * hour,
        seats: 12, pricePerSeat: 450, currency: "USD",
        description: "טיסה ישירה לבוקרשט. כולל 23 ק״ג מזוודה.",
        checkedBagKg: 23, carryOnAllowed: true, personalItemAllowed: true, contactCount: 15,
      },
      {
        agentId: agent, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב",
        destination: "IT", destinationCity: "רומא", destinationAirport: "FCO",
        departureDate: now + 5 * day, arrivalDate: now + 5 * day + 7 * hour,
        seats: 8, pricePerSeat: 890, currency: "EUR",
        description: "טיסה לרומא דרך אתונה.",
        checkedBagKg: 23, carryOnAllowed: true, personalItemAllowed: true,
        stops: [{ country: "GR", city: "אתונה", durationMinutes: 90 }], contactCount: 0,
      },
      {
        agentId: agent, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב",
        destination: "DE", destinationCity: "ברלין", destinationAirport: "BER",
        departureDate: now + 7 * day, arrivalDate: now + 7 * day + 4.5 * hour,
        seats: 20, pricePerSeat: 780, currency: "EUR",
        description: "טיסה ישירה לברלין.",
        checkedBagKg: 23, carryOnAllowed: true, personalItemAllowed: true, contactCount: 2,
      },
      {
        agentId: agent, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב",
        destination: "US", destinationCity: "ניו יורק", destinationAirport: "JFK",
        departureDate: now + 10 * day, arrivalDate: now + 10 * day + 15 * hour,
        seats: 3, pricePerSeat: 2100, currency: "USD",
        description: "טיסה לניו יורק JFK דרך איסטנבול.",
        checkedBagKg: 30, carryOnAllowed: true, personalItemAllowed: true,
        stops: [{ country: "TR", city: "איסטנבול", durationMinutes: 180 }], contactCount: 0,
      },
      {
        agentId: agent, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב",
        destination: "FR", destinationCity: "פריז", destinationAirport: "CDG",
        departureDate: now + 2 * day, arrivalDate: now + 2 * day + 5 * hour,
        seats: 15, pricePerSeat: 720, currency: "EUR",
        description: "טיסה ישירה לפריז.",
        checkedBagKg: 23, carryOnAllowed: true, personalItemAllowed: true, contactCount: 6,
      },
      {
        agentId: agent, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב",
        destination: "ES", destinationCity: "ברצלונה", destinationAirport: "BCN",
        departureDate: now + 4 * day, arrivalDate: now + 4 * day + 5 * hour,
        seats: 10, pricePerSeat: 680, currency: "EUR",
        description: "טיסה ישירה לברצלונה.",
        checkedBagKg: 20, carryOnAllowed: true, personalItemAllowed: true, contactCount: 4,
      },
      {
        agentId: agent, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב",
        destination: "GB", destinationCity: "לונדון", destinationAirport: "LHR",
        departureDate: now + 6 * day, arrivalDate: now + 6 * day + 5.5 * hour,
        seats: 7, pricePerSeat: 950, currency: "GBP",
        description: "טיסה ישירה ללונדון.",
        checkedBagKg: 23, carryOnAllowed: true, personalItemAllowed: true, contactCount: 9,
      },
      {
        agentId: agent, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב",
        destination: "BG", destinationCity: "סופיה", destinationAirport: "SOF",
        departureDate: now + 4 * day + 6 * hour, arrivalDate: now + 4 * day + 8.5 * hour,
        seats: 30, pricePerSeat: 199, currency: "EUR",
        description: "טיסת לואו-קוסט לסופיה. ללא מזוודה רשומה!",
        carryOnAllowed: true, personalItemAllowed: true, contactCount: 0,
      },
      {
        agentId: agent, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב",
        destination: "PL", destinationCity: "ורשה", destinationAirport: "WAW",
        departureDate: now + 8 * day, arrivalDate: now + 8 * day + 4 * hour,
        seats: 18, pricePerSeat: 380, currency: "EUR",
        description: "טיסה ישירה לורשה.",
        checkedBagKg: 20, carryOnAllowed: true, personalItemAllowed: true, contactCount: 1,
      },
      {
        agentId: agent, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב",
        destination: "CZ", destinationCity: "פראג", destinationAirport: "PRG",
        departureDate: now + 9 * day, arrivalDate: now + 9 * day + 4 * hour,
        seats: 6, pricePerSeat: 520, currency: "EUR",
        description: "טיסה ישירה לפראג.",
        checkedBagKg: 23, carryOnAllowed: true, personalItemAllowed: true, contactCount: 3,
      },
      {
        agentId: agent, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב",
        destination: "HU", destinationCity: "בודפשט", destinationAirport: "BUD",
        departureDate: now + 11 * day, arrivalDate: now + 11 * day + 3.5 * hour,
        seats: 14, pricePerSeat: 410, currency: "EUR",
        description: "טיסה ישירה לבודפשט.",
        checkedBagKg: 20, carryOnAllowed: true, personalItemAllowed: true, contactCount: 7,
      },
      {
        agentId: agent, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב",
        destination: "NL", destinationCity: "אמסטרדם", destinationAirport: "AMS",
        departureDate: now + 3 * day + 12 * hour, arrivalDate: now + 3 * day + 17 * hour,
        seats: 5, pricePerSeat: 860, currency: "EUR",
        description: "טיסה ישירה לאמסטרדם.",
        checkedBagKg: 23, carryOnAllowed: true, personalItemAllowed: true, contactCount: 11,
      },
      {
        agentId: agent, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב",
        destination: "CA", destinationCity: "טורונטו", destinationAirport: "YYZ",
        departureDate: now + 12 * day, arrivalDate: now + 12 * day + 18 * hour,
        seats: 4, pricePerSeat: 2400, currency: "USD",
        description: "טיסה לטורונטו עם 2 עצירות.",
        checkedBagKg: 23, carryOnAllowed: true, personalItemAllowed: true,
        stops: [{ country: "GR", city: "אתונה", durationMinutes: 120 }, { country: "GB", city: "לונדון", durationMinutes: 150 }],
        contactCount: 3,
      },
      {
        agentId: agent, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב",
        destination: "TH", destinationCity: "בנגקוק", destinationAirport: "BKK",
        departureDate: now + 6 * day, arrivalDate: now + 6 * day + 12 * hour,
        seats: 10, pricePerSeat: 1600, currency: "USD",
        description: "טיסה לבנגקוק דרך דובאי.",
        checkedBagKg: 30, carryOnAllowed: true, personalItemAllowed: true,
        stops: [{ country: "AE", city: "דובאי", durationMinutes: 150 }], contactCount: 5,
      },
      {
        agentId: agent, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב",
        destination: "IN", destinationCity: "מומבאי", destinationAirport: "BOM",
        departureDate: now + 14 * day, arrivalDate: now + 14 * day + 8 * hour,
        seats: 8, pricePerSeat: 1100, currency: "USD",
        description: "טיסה למומבאי דרך עמאן.",
        checkedBagKg: 23, carryOnAllowed: true, personalItemAllowed: true,
        stops: [{ country: "JO", city: "עמאן", durationMinutes: 120 }], contactCount: 2,
      },

      // ===== FROM OTHER COUNTRIES (return flights, etc.) =====
      {
        agentId: agent, departureCountry: "GR", departureAirport: "ATH", departureCity: "אתונה",
        destination: "IL", destinationCity: "תל אביב", destinationAirport: "TLV",
        departureDate: now + 9 * day, arrivalDate: now + 9 * day + 3 * hour,
        seats: 15, pricePerSeat: 400, currency: "EUR",
        description: "טיסת חזרה מאתונה לתל אביב.",
        checkedBagKg: 20, carryOnAllowed: true, personalItemAllowed: true, contactCount: 1,
      },
      {
        agentId: agent, departureCountry: "TR", departureAirport: "IST", departureCity: "איסטנבול",
        destination: "IL", destinationCity: "תל אביב", destinationAirport: "TLV",
        departureDate: now + 4 * day, arrivalDate: now + 4 * day + 2.5 * hour,
        seats: 20, pricePerSeat: 350, currency: "USD",
        description: "טיסה מאיסטנבול לתל אביב. מחיר מבצע!",
        checkedBagKg: 20, carryOnAllowed: true, personalItemAllowed: true, contactCount: 14,
      },
      {
        agentId: agent, departureCountry: "CY", departureAirport: "LCA", departureCity: "לרנקה",
        destination: "IL", destinationCity: "תל אביב", destinationAirport: "TLV",
        departureDate: now + 5 * day, arrivalDate: now + 5 * day + 1 * hour,
        seats: 12, pricePerSeat: 280, currency: "USD",
        description: "טיסת חזרה מקפריסין.",
        checkedBagKg: 20, carryOnAllowed: true, personalItemAllowed: true, contactCount: 8,
      },
      {
        agentId: agent, departureCountry: "DE", departureAirport: "BER", departureCity: "ברלין",
        destination: "IL", destinationCity: "תל אביב", destinationAirport: "TLV",
        departureDate: now + 7 * day, arrivalDate: now + 7 * day + 4.5 * hour,
        seats: 9, pricePerSeat: 690, currency: "EUR",
        description: "טיסת חזרה מברלין.",
        checkedBagKg: 23, carryOnAllowed: true, personalItemAllowed: true, contactCount: 3,
      },
      {
        agentId: agent, departureCountry: "IT", departureAirport: "FCO", departureCity: "רומא",
        destination: "IL", destinationCity: "תל אביב", destinationAirport: "TLV",
        departureDate: now + 6 * day, arrivalDate: now + 6 * day + 4 * hour,
        seats: 6, pricePerSeat: 750, currency: "EUR",
        description: "טיסה מרומא לתל אביב.",
        checkedBagKg: 23, carryOnAllowed: true, personalItemAllowed: true, contactCount: 5,
      },
      {
        agentId: agent, departureCountry: "FR", departureAirport: "CDG", departureCity: "פריז",
        destination: "IL", destinationCity: "תל אביב", destinationAirport: "TLV",
        departureDate: now + 8 * day, arrivalDate: now + 8 * day + 5 * hour,
        seats: 11, pricePerSeat: 700, currency: "EUR",
        description: "טיסת חזרה מפריז.",
        checkedBagKg: 23, carryOnAllowed: true, personalItemAllowed: true, contactCount: 4,
      },
      {
        agentId: agent, departureCountry: "TH", departureAirport: "BKK", departureCity: "בנגקוק",
        destination: "IL", destinationCity: "תל אביב", destinationAirport: "TLV",
        departureDate: now + 10 * day, arrivalDate: now + 10 * day + 12 * hour,
        seats: 4, pricePerSeat: 1500, currency: "USD",
        description: "טיסת חזרה מתאילנד דרך דובאי.",
        checkedBagKg: 30, carryOnAllowed: true, personalItemAllowed: true,
        stops: [{ country: "AE", city: "דובאי", durationMinutes: 180 }], contactCount: 9,
      },
      {
        agentId: agent, departureCountry: "US", departureAirport: "JFK", departureCity: "ניו יורק",
        destination: "IL", destinationCity: "תל אביב", destinationAirport: "TLV",
        departureDate: now + 11 * day, arrivalDate: now + 11 * day + 11 * hour,
        seats: 7, pricePerSeat: 1800, currency: "USD",
        description: "טיסה מניו יורק לתל אביב.",
        checkedBagKg: 23, carryOnAllowed: true, personalItemAllowed: true, contactCount: 16,
      },

      // ===== PACKAGES =====
      {
        agentId: agent, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב",
        destination: "GR", destinationCity: "סלוניקי", destinationAirport: "SKG",
        departureDate: now + 6 * day, arrivalDate: now + 6 * day + 3 * hour,
        seats: 6, pricePerSeat: 1800, currency: "USD",
        description: "חבילת נופש מלאה לסלוניקי. כולל טיסה, מלון 4 כוכבים, העברות וביטוח.",
        checkedBagKg: 23, carryOnAllowed: true, personalItemAllowed: true,
        isPackage: true, hotelIncluded: "מלון Mediterranean Palace — 5 לילות", transferIncluded: "העברה משדה התעופה למלון וחזרה", insuranceIncluded: "ביטוח נסיעות מלא",
        contactCount: 11,
      },
      {
        agentId: agent, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב",
        destination: "CY", destinationCity: "פאפוס", destinationAirport: "PFO",
        departureDate: now + 8 * day, arrivalDate: now + 8 * day + 1.5 * hour,
        seats: 4, pricePerSeat: 1450, currency: "EUR",
        description: "חבילה משפחתית לפאפוס. טיסה + מלון + ביטוח.",
        checkedBagKg: 20, carryOnAllowed: true, personalItemAllowed: true,
        isPackage: true, hotelIncluded: "מלון Coral Beach — 7 לילות", insuranceIncluded: "ביטוח בריאות ונסיעות",
        contactCount: 7,
      },
      {
        agentId: agent, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב",
        destination: "TR", destinationCity: "אנטליה", destinationAirport: "AYT",
        departureDate: now + 5 * day, arrivalDate: now + 5 * day + 2 * hour,
        seats: 16, pricePerSeat: 1200, currency: "USD",
        description: "חבילת אול-אינקלוסיב לאנטליה.",
        checkedBagKg: 23, carryOnAllowed: true, personalItemAllowed: true,
        isPackage: true, hotelIncluded: "Rixos Premium — 7 לילות אול אינקלוסיב", transferIncluded: "העברות VIP", insuranceIncluded: "ביטוח מלא",
        contactCount: 22,
      },
      {
        agentId: agent, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב",
        destination: "HR", destinationCity: "דוברובניק", destinationAirport: "ZAG",
        departureDate: now + 13 * day, arrivalDate: now + 13 * day + 4 * hour,
        seats: 8, pricePerSeat: 2200, currency: "EUR",
        description: "חבילת נופש לקרואטיה. טיסה + מלון בוטיק + סיורים.",
        checkedBagKg: 23, carryOnAllowed: true, personalItemAllowed: true,
        isPackage: true, hotelIncluded: "Hotel Excelsior Dubrovnik — 6 לילות", transferIncluded: "העברות + סיור בעיר העתיקה", insuranceIncluded: "ביטוח נסיעות",
        contactCount: 5,
      },
    ];

    let count = 0;
    for (const f of flights) {
      await ctx.db.insert("flights", {
        agentId: f.agentId,
        departureCountry: f.departureCountry,
        departureAirport: f.departureAirport,
        departureCity: f.departureCity,
        destination: f.destination,
        destinationCity: f.destinationCity,
        destinationAirport: f.destinationAirport,
        departureDate: f.departureDate,
        arrivalDate: f.arrivalDate,
        seats: f.seats,
        pricePerSeat: f.pricePerSeat,
        currency: f.currency,
        status: "available",
        description: f.description,
        whatsappNumber: "+972501234567",
        phoneNumber: "+972501234567",
        checkedBagKg: f.checkedBagKg,
        carryOnAllowed: f.carryOnAllowed,
        personalItemAllowed: f.personalItemAllowed,
        stops: f.stops,
        isPackage: f.isPackage,
        hotelIncluded: f.hotelIncluded,
        transferIncluded: f.transferIncluded,
        insuranceIncluded: f.insuranceIncluded,
        approvalStatus: "approved",
        contactCount: f.contactCount ?? 0,
      });
      count++;
    }

    return { agents: 1, flights: count };
  },
});

/**
 * Seed ALL tables with realistic mock data.
 *
 * Run: npx convex run seed:seedAll
 *
 * Creates: 12 users (1 admin, 3 agents, 8 regular), 30+ flights,
 * 15 posts, likes, comments, reposts, 5 chat rooms, 40+ messages,
 * reactions, news sources, articles, alerts, reservations, saved flights.
 */
export const seedAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const hour = 60 * 60 * 1000;
    const day = 24 * hour;

    // ══════════════════════════════════════════════
    // USERS — 1 admin, 3 agents, 8 regular users
    // ══════════════════════════════════════════════
    const admin = await ctx.db.insert("users", {
      clerkId: "user_seed_admin_001",
      email: "admin@yachad.org",
      name: "Yachad Admin",
      imageUrl: "https://api.dicebear.com/9.x/initials/svg?seed=YA",
      role: "admin",
      country: "IL",
    });

    const agent1 = await ctx.db.insert("users", {
      clerkId: "user_3ASI1O1WYkicI9zTxgU0ZbiDONG",
      email: "itaibiton2405@gmail.com",
      name: "Itai Biton",
      imageUrl: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zQVNJMU9HWHRtOTRWREdUZ3psa05SNWU5bE0ifQ",
      role: "agent",
      isApproved: true,
      country: "IL",
      phone: "+972501234567",
      whatsappNumber: "+972501234567",
      companyName: "Yachad Flights",
    });

    const agent2 = await ctx.db.insert("users", {
      clerkId: "user_seed_agent_002",
      email: "sarah.cohen@skybridge.co.il",
      name: "Sarah Cohen",
      imageUrl: "https://api.dicebear.com/9.x/initials/svg?seed=SC",
      role: "agent",
      isApproved: true,
      country: "IL",
      phone: "+972527654321",
      whatsappNumber: "+972527654321",
      companyName: "SkyBridge Travel",
    });

    const agent3 = await ctx.db.insert("users", {
      clerkId: "user_seed_agent_003",
      email: "michael.levy@exodus.travel",
      name: "Michael Levy",
      imageUrl: "https://api.dicebear.com/9.x/initials/svg?seed=ML",
      role: "agent",
      isApproved: true,
      country: "GR",
      phone: "+306941234567",
      whatsappNumber: "+306941234567",
      companyName: "Exodus Travel",
    });

    const userNames = [
      { name: "Noa Shapira", email: "noa.shapira@gmail.com", country: "IL" },
      { name: "David Katz", email: "david.katz@gmail.com", country: "GR" },
      { name: "Yael Friedman", email: "yael.f@gmail.com", country: "IL" },
      { name: "Daniel Mizrahi", email: "daniel.m@gmail.com", country: "TR" },
      { name: "Tamar Ben-Ari", email: "tamar.ba@gmail.com", country: "CY" },
      { name: "Oren Goldstein", email: "oren.g@gmail.com", country: "IL" },
      { name: "Maya Levi", email: "maya.levi@gmail.com", country: "DE" },
      { name: "Eitan Rosenberg", email: "eitan.r@gmail.com", country: "IL" },
    ];

    const userIds = [];
    for (let i = 0; i < userNames.length; i++) {
      const u = userNames[i];
      const id = await ctx.db.insert("users", {
        clerkId: `user_seed_user_${String(i + 1).padStart(3, "0")}`,
        email: u.email,
        name: u.name,
        imageUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${u.name.replace(/ /g, "")}`,
        role: "user",
        country: u.country,
      });
      userIds.push(id);
    }

    const allUserIds = [admin, agent1, agent2, agent3, ...userIds];

    // ══════════════════════════════════════════════
    // FLIGHTS — reuse existing seedFlights data for agent1 + add agent2/3 flights
    // ══════════════════════════════════════════════
    const flightData = [
      // Agent 1 flights
      { agentId: agent1, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב", destination: "GR", destinationCity: "אתונה", destinationAirport: "ATH", departureDate: now + 3 * hour, arrivalDate: now + 6.5 * hour, seats: 2, pricePerSeat: 1200, currency: "USD", description: "טיסה ישירה מנתב״ג לאתונה. 2 מקומות אחרונים!", checkedBagKg: 23, contactCount: 8 },
      { agentId: agent1, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב", destination: "CY", destinationCity: "לרנקה", destinationAirport: "LCA", departureDate: now + 5 * hour, arrivalDate: now + 6 * hour, seats: 5, pricePerSeat: 650, currency: "USD", description: "טיסה ללרנקה, קפריסין.", checkedBagKg: 20, contactCount: 3 },
      { agentId: agent1, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב", destination: "FR", destinationCity: "פריז", destinationAirport: "CDG", departureDate: now + 2 * day, arrivalDate: now + 2 * day + 5 * hour, seats: 15, pricePerSeat: 720, currency: "EUR", description: "טיסה ישירה לפריז.", checkedBagKg: 23, contactCount: 6 },
      { agentId: agent1, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב", destination: "DE", destinationCity: "ברלין", destinationAirport: "BER", departureDate: now + 7 * day, arrivalDate: now + 7 * day + 4.5 * hour, seats: 20, pricePerSeat: 780, currency: "EUR", description: "טיסה ישירה לברלין.", checkedBagKg: 23, contactCount: 2 },
      { agentId: agent1, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב", destination: "US", destinationCity: "ניו יורק", destinationAirport: "JFK", departureDate: now + 10 * day, arrivalDate: now + 10 * day + 15 * hour, seats: 3, pricePerSeat: 2100, currency: "USD", description: "טיסה לניו יורק דרך איסטנבול.", checkedBagKg: 30, stops: [{ country: "TR", city: "איסטנבול", durationMinutes: 180 }], contactCount: 0 },
      { agentId: agent1, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב", destination: "GB", destinationCity: "לונדון", destinationAirport: "LHR", departureDate: now + 6 * day, arrivalDate: now + 6 * day + 5.5 * hour, seats: 7, pricePerSeat: 950, currency: "GBP", description: "טיסה ישירה ללונדון.", checkedBagKg: 23, contactCount: 9 },
      { agentId: agent1, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב", destination: "GR", destinationCity: "סלוניקי", destinationAirport: "SKG", departureDate: now + 6 * day, arrivalDate: now + 6 * day + 3 * hour, seats: 6, pricePerSeat: 1800, currency: "USD", description: "חבילת נופש מלאה לסלוניקי.", checkedBagKg: 23, isPackage: true, hotelIncluded: "Mediterranean Palace — 5 לילות", transferIncluded: "העברה למלון וחזרה", insuranceIncluded: "ביטוח נסיעות מלא", contactCount: 11 },
      // Agent 2 flights
      { agentId: agent2, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב", destination: "RO", destinationCity: "בוקרשט", destinationAirport: "OTP", departureDate: now + 3 * day, arrivalDate: now + 3 * day + 3 * hour, seats: 12, pricePerSeat: 450, currency: "USD", description: "טיסה ישירה לבוקרשט.", checkedBagKg: 23, contactCount: 15 },
      { agentId: agent2, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב", destination: "ES", destinationCity: "ברצלונה", destinationAirport: "BCN", departureDate: now + 4 * day, arrivalDate: now + 4 * day + 5 * hour, seats: 10, pricePerSeat: 680, currency: "EUR", description: "טיסה ישירה לברצלונה.", checkedBagKg: 20, contactCount: 4 },
      { agentId: agent2, departureCountry: "IL", departureAirport: "TLV", departureCity: "תל אביב", destination: "TR", destinationCity: "אנטליה", destinationAirport: "AYT", departureDate: now + 5 * day, arrivalDate: now + 5 * day + 2 * hour, seats: 16, pricePerSeat: 1200, currency: "USD", description: "חבילת אול-אינקלוסיב לאנטליה.", checkedBagKg: 23, isPackage: true, hotelIncluded: "Rixos Premium — 7 לילות", transferIncluded: "העברות VIP", insuranceIncluded: "ביטוח מלא", contactCount: 22 },
      // Agent 3 flights (from Greece)
      { agentId: agent3, departureCountry: "GR", departureAirport: "ATH", departureCity: "אתונה", destination: "IL", destinationCity: "תל אביב", destinationAirport: "TLV", departureDate: now + 14 * hour, arrivalDate: now + 17 * hour, seats: 1, pricePerSeat: 900, currency: "EUR", description: "מקום אחרון! טיסה מאתונה לתל אביב.", checkedBagKg: 23, contactCount: 20 },
      { agentId: agent3, departureCountry: "GR", departureAirport: "ATH", departureCity: "אתונה", destination: "IL", destinationCity: "תל אביב", destinationAirport: "TLV", departureDate: now + 9 * day, arrivalDate: now + 9 * day + 3 * hour, seats: 15, pricePerSeat: 400, currency: "EUR", description: "טיסת חזרה מאתונה.", checkedBagKg: 20, contactCount: 1 },
      { agentId: agent3, departureCountry: "TR", departureAirport: "IST", departureCity: "איסטנבול", destination: "IL", destinationCity: "תל אביב", destinationAirport: "TLV", departureDate: now + 4 * day, arrivalDate: now + 4 * day + 2.5 * hour, seats: 20, pricePerSeat: 350, currency: "USD", description: "טיסה מאיסטנבול. מחיר מבצע!", checkedBagKg: 20, contactCount: 14 },
    ];

    const flightIds = [];
    for (const f of flightData) {
      const id = await ctx.db.insert("flights", {
        ...f,
        carryOnAllowed: true,
        personalItemAllowed: true,
        whatsappNumber: "+972501234567",
        phoneNumber: "+972501234567",
        status: "available" as const,
        approvalStatus: "approved" as const,
      });
      flightIds.push(id);
    }

    // Saved flights — some users save some flights
    await ctx.db.insert("savedFlights", { userId: userIds[0], flightId: flightIds[0] });
    await ctx.db.insert("savedFlights", { userId: userIds[0], flightId: flightIds[2] });
    await ctx.db.insert("savedFlights", { userId: userIds[1], flightId: flightIds[0] });
    await ctx.db.insert("savedFlights", { userId: userIds[3], flightId: flightIds[5] });
    await ctx.db.insert("savedFlights", { userId: userIds[5], flightId: flightIds[7] });

    // ══════════════════════════════════════════════
    // COMMUNITY FEED — posts, likes, comments, reposts
    // ══════════════════════════════════════════════
    const postData: { authorIdx: number; content: string; category?: "help_needed" | "offering_help" | "info" | "warning" | "safety_check"; country?: string; isPinned?: boolean }[] = [
      { authorIdx: 0, content: "Just landed in Athens! The Israeli embassy here was super helpful. Make sure to register with them if you're in Greece.", category: "info", country: "GR" },
      { authorIdx: 1, content: "Does anyone know a kosher restaurant near Syntagma Square in Athens? Traveling with family and need options.", category: "help_needed", country: "GR" },
      { authorIdx: 2, content: "I have extra space in my Airbnb in Larnaca for 2 more people. Free of charge for Israelis in need. DM me.", category: "offering_help", country: "CY" },
      { authorIdx: 3, content: "WARNING: The road from Istanbul airport to the city center is experiencing heavy delays today. Plan extra time if you have a connecting flight.", category: "warning", country: "TR" },
      { authorIdx: 4, content: "Checking in from Paphos, Cyprus. Everyone here is safe. The Chabad house is open 24/7 and providing meals.", category: "safety_check", country: "CY" },
      { authorIdx: 5, content: "Pro tip: If you're flying through Athens, the airport has free WiFi and charging stations near Gate B12. Also a quiet area for davening.", category: "info", country: "GR" },
      { authorIdx: 6, content: "Looking for someone to share a taxi from Berlin Hauptbahnhof to the airport tomorrow morning around 6 AM. Splitting costs!", category: "help_needed", country: "DE" },
      { authorIdx: 7, content: "Thank you Yachad team and all the agents! We made it home safely today. This platform literally saved us.", category: "info", country: "IL" },
      { authorIdx: 0, content: "The Israeli consulate in Istanbul is extending operating hours this week. Open until 8 PM for emergency passport services.", category: "info", country: "TR" },
      { authorIdx: 2, content: "I'm a nurse and I'm offering free basic medical consultations for anyone stuck abroad who needs help. Reach out!", category: "offering_help", country: "CY" },
      { authorIdx: 4, content: "Anyone know the current wait times at the Greek border? Planning to drive from Turkey to Greece tomorrow.", category: "help_needed", country: "GR" },
      { authorIdx: 1, content: "Just want to say — the community spirit here is incredible. Strangers helping strangers. Am Yisrael Chai! 🇮🇱", category: "info", country: "GR" },
      { authorIdx: 5, content: "Important: New COVID testing requirements for flights to Israel starting next week. Check the Health Ministry website.", category: "warning", country: "IL", isPinned: true },
      { authorIdx: 3, content: "Found a great kosher supermarket in Istanbul — DM me for the address. They have challah on Fridays!", category: "info", country: "TR" },
      { authorIdx: 7, content: "Offering free Hebrew-English translation help for anyone dealing with foreign authorities. I speak Greek too.", category: "offering_help", country: "GR" },
    ];

    const postIds = [];
    for (const p of postData) {
      const id = await ctx.db.insert("posts", {
        authorId: userIds[p.authorIdx],
        content: p.content,
        category: p.category,
        country: p.country,
        isPinned: p.isPinned,
      });
      postIds.push(id);
    }

    // Reposts — 2 reposts of popular posts
    const repost1 = await ctx.db.insert("posts", {
      authorId: userIds[6],
      content: "Everyone needs to see this!",
      repostOfId: postIds[2], // repost of offering_help
      country: "DE",
    });
    postIds.push(repost1);

    const repost2 = await ctx.db.insert("posts", {
      authorId: userIds[3],
      content: "",
      repostOfId: postIds[12], // repost of warning
      country: "TR",
    });
    postIds.push(repost2);

    // Likes — spread across posts
    const likePairs: [number, number][] = [
      [0,0],[1,0],[2,0],[3,0],[5,0],[7,0], // post 0 = 6 likes
      [0,2],[1,2],[3,2],[4,2],[5,2],[6,2],[7,2], // post 2 = 7 likes (offering help)
      [0,4],[2,4],[5,4],[7,4], // post 4 = 4 likes
      [1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[7,7], // post 7 (thank you) = 7 likes
      [0,11],[1,11],[2,11],[3,11],[4,11],[5,11],[6,11],[7,11], // post 11 = 8 likes
      [0,12],[1,12],[4,12],[6,12], // post 12 = 4 likes
      [3,1],[5,3],[7,5],[0,6],[2,8],[4,9],[6,10],[1,13],[3,14], // scattered
    ];
    for (const [userIdx, postIdx] of likePairs) {
      await ctx.db.insert("postLikes", { userId: userIds[userIdx], postId: postIds[postIdx] });
    }

    // Comments — realistic replies
    const commentData: { postIdx: number; authorIdx: number; content: string }[] = [
      { postIdx: 0, authorIdx: 1, content: "Thanks for the tip! Did you register online or in person?" },
      { postIdx: 0, authorIdx: 5, content: "You can also register via the Aman app. Much faster." },
      { postIdx: 1, authorIdx: 0, content: "There's a small kosher place on Ermou Street. Not sure if it's still open though." },
      { postIdx: 1, authorIdx: 5, content: "Check the Chabad Athens website, they have a list of kosher restaurants." },
      { postIdx: 2, authorIdx: 0, content: "You're amazing! Sending you a DM." },
      { postIdx: 2, authorIdx: 4, content: "This is what community is about. Thank you Yael!" },
      { postIdx: 2, authorIdx: 7, content: "Shared this with our WhatsApp group. Toda raba!" },
      { postIdx: 3, authorIdx: 5, content: "Can confirm. Took us 3 hours to get through traffic today." },
      { postIdx: 4, authorIdx: 0, content: "Great to hear! Stay safe everyone." },
      { postIdx: 4, authorIdx: 2, content: "The Chabad in Paphos is incredible. They've been helping non-stop." },
      { postIdx: 7, authorIdx: 0, content: "Welcome home!! 🎉" },
      { postIdx: 7, authorIdx: 2, content: "So happy for you! B'H" },
      { postIdx: 7, authorIdx: 5, content: "This is why we built Yachad. Glad you made it!" },
      { postIdx: 11, authorIdx: 0, content: "Am Yisrael Chai! 💪" },
      { postIdx: 11, authorIdx: 5, content: "Amen! Together we are strong." },
      { postIdx: 12, authorIdx: 1, content: "Thanks for the heads up. Where did you see this?" },
      { postIdx: 12, authorIdx: 7, content: "Is this for all flights or just El Al?" },
      { postIdx: 6, authorIdx: 5, content: "I'm heading to BER around the same time! DM me." },
      { postIdx: 9, authorIdx: 4, content: "Thank you so much! My daughter has a slight fever. Will DM." },
      { postIdx: 14, authorIdx: 1, content: "This is so helpful! Can you help with a police report translation?" },
    ];
    for (const c of commentData) {
      await ctx.db.insert("postComments", {
        postId: postIds[c.postIdx],
        authorId: userIds[c.authorIdx],
        content: c.content,
      });
    }

    // ══════════════════════════════════════════════
    // CHAT — rooms + messages + reactions
    // ══════════════════════════════════════════════
    // Country rooms
    const roomIL = await ctx.db.insert("chatRooms", { name: "Israel", type: "country", country: "IL" });
    const roomGR = await ctx.db.insert("chatRooms", { name: "Greece", type: "country", country: "GR" });
    const roomTR = await ctx.db.insert("chatRooms", { name: "Turkey", type: "country", country: "TR" });
    const roomCY = await ctx.db.insert("chatRooms", { name: "Cyprus", type: "country", country: "CY" });

    // Emergency room
    const roomEmergency = await ctx.db.insert("chatRooms", { name: "Emergency - Greece", type: "emergency", country: "GR" });

    // DMs
    const dm1 = await ctx.db.insert("chatRooms", {
      name: "Noa & David",
      type: "dm",
      participantIds: [userIds[0], userIds[1]],
    });
    const dm2 = await ctx.db.insert("chatRooms", {
      name: "Yael & Tamar",
      type: "dm",
      participantIds: [userIds[2], userIds[4]],
    });

    // Group chat
    const group1 = await ctx.db.insert("chatRooms", {
      name: "Athens Crew 🇬🇷",
      type: "group",
      participantIds: [userIds[0], userIds[1], userIds[5], userIds[7]],
    });
    const group2 = await ctx.db.insert("chatRooms", {
      name: "Cyprus Support",
      type: "group",
      participantIds: [userIds[2], userIds[4], userIds[6]],
    });

    // Messages — Israel country chat
    const ilMsgs = [
      { author: userIds[0], content: "Anyone made it back today?" },
      { author: userIds[5], content: "Yes! Just landed at Ben Gurion. The flight from Athens was smooth." },
      { author: userIds[7], content: "Welcome home! How was the process?" },
      { author: userIds[5], content: "Super organized. Yachad agents at the gate helped with everything." },
      { author: userIds[0], content: "That's great to hear. My parents are still in Cyprus." },
      { author: userIds[7], content: "They should check the Larnaca flights. Saw some cheap ones earlier." },
      { author: userIds[0], content: "Will tell them, thanks!" },
    ];
    const ilMsgIds = [];
    for (const m of ilMsgs) {
      const id = await ctx.db.insert("chatMessages", { roomId: roomIL, authorId: m.author, content: m.content });
      ilMsgIds.push(id);
    }

    // Messages — Greece country chat
    const grMsgs = [
      { author: userIds[1], content: "Good morning from Athens! Any updates on tomorrow's flights?" },
      { author: userIds[5], content: "I heard there's a flight to TLV at 14:00. Check the flights page." },
      { author: userIds[1], content: "Thanks! Is there space for 3 people?" },
      { author: userIds[7], content: "I think it has about 15 seats. Should be fine." },
      { author: userIds[1], content: "Perfect. Going to book now!" },
    ];
    for (const m of grMsgs) {
      await ctx.db.insert("chatMessages", { roomId: roomGR, authorId: m.author, content: m.content });
    }

    // Messages — Turkey country chat
    const trMsgs = [
      { author: userIds[3], content: "Anyone at Istanbul airport right now?" },
      { author: userIds[5], content: "I was there yesterday. The Turkish Airlines lounge has WiFi." },
      { author: userIds[3], content: "Good to know. My flight got delayed 2 hours 😩" },
      { author: userIds[7], content: "That's tough. Is there food available?" },
      { author: userIds[3], content: "Yeah, there are restaurants open. Just expensive." },
    ];
    for (const m of trMsgs) {
      await ctx.db.insert("chatMessages", { roomId: roomTR, authorId: m.author, content: m.content });
    }

    // Messages — DM between Noa and David
    const dm1Msgs = [
      { author: userIds[0], content: "Hey David, are you still in Athens?" },
      { author: userIds[1], content: "Yes, staying near the Acropolis. You?" },
      { author: userIds[0], content: "I'm at the port area. Want to meet up for dinner?" },
      { author: userIds[1], content: "Sure! There's a place the Chabad recommended. I'll send the location." },
      { author: userIds[0], content: "Perfect, see you at 7?" },
      { author: userIds[1], content: "Sounds good! 🙌" },
    ];
    for (const m of dm1Msgs) {
      await ctx.db.insert("chatMessages", { roomId: dm1, authorId: m.author, content: m.content });
    }

    // Messages — Group chat (Athens Crew)
    const group1Msgs = [
      { author: userIds[0], content: "Hey everyone! Created this group so we can coordinate." },
      { author: userIds[1], content: "Great idea! I found a good deal on a hotel if anyone needs a place." },
      { author: userIds[5], content: "I'm arriving tomorrow. Can someone pick me up from the airport?" },
      { author: userIds[7], content: "I can! What time does your flight land?" },
      { author: userIds[5], content: "Around 16:30 local time." },
      { author: userIds[0], content: "I'll bring snacks from the kosher shop 😄" },
      { author: userIds[1], content: "You're the best Noa!" },
      { author: userIds[7], content: "Let's also plan for Shabbat. We need at least 10 for a minyan." },
      { author: userIds[0], content: "Chabad Athens said they can host us. I'll confirm." },
      { author: userIds[5], content: "Amazing. This group is so helpful!" },
    ];
    for (const m of group1Msgs) {
      await ctx.db.insert("chatMessages", { roomId: group1, authorId: m.author, content: m.content });
    }

    // Messages — DM between Yael and Tamar
    const dm2Msgs = [
      { author: userIds[2], content: "Hi Tamar! I saw your safety check post. How are you doing?" },
      { author: userIds[4], content: "Hi Yael! We're fine, thank God. The kids are a bit scared but managing." },
      { author: userIds[2], content: "I'm so glad. Do you need anything? I can send supplies." },
      { author: userIds[4], content: "Actually, do you know where to find diapers in Paphos? The stores near us are out." },
      { author: userIds[2], content: "Try the pharmacy on Apostolou Pavlou street. They had some yesterday." },
      { author: userIds[4], content: "Thank you!! You're a lifesaver 🙏" },
    ];
    for (const m of dm2Msgs) {
      await ctx.db.insert("chatMessages", { roomId: dm2, authorId: m.author, content: m.content });
    }

    // Chat reactions
    await ctx.db.insert("chatReactions", { messageId: ilMsgIds[1], userId: userIds[0], emoji: "🎉" });
    await ctx.db.insert("chatReactions", { messageId: ilMsgIds[1], userId: userIds[7], emoji: "🎉" });
    await ctx.db.insert("chatReactions", { messageId: ilMsgIds[3], userId: userIds[0], emoji: "❤️" });
    await ctx.db.insert("chatReactions", { messageId: ilMsgIds[3], userId: userIds[7], emoji: "👏" });
    await ctx.db.insert("chatReactions", { messageId: ilMsgIds[6], userId: userIds[5], emoji: "🙏" });

    // Presence — a few users "online"
    await ctx.db.insert("chatPresence", { userId: userIds[0], roomId: roomIL, lastSeen: now, isTyping: false });
    await ctx.db.insert("chatPresence", { userId: userIds[1], roomId: roomGR, lastSeen: now, isTyping: false });
    await ctx.db.insert("chatPresence", { userId: userIds[5], roomId: roomIL, lastSeen: now - 30000, isTyping: false });

    // ══════════════════════════════════════════════
    // NEWS — sources + articles
    // ══════════════════════════════════════════════
    const source1 = await ctx.db.insert("newsSources", {
      url: "https://www.ynet.co.il/Integration/StoryRss2.xml",
      name: "Ynet",
      faviconUrl: "https://www.google.com/s2/favicons?domain=ynet.co.il&sz=32",
      language: "he",
      trustTier: "official",
      isActive: true,
    });
    const source2 = await ctx.db.insert("newsSources", {
      url: "https://news.google.com/rss/search?q=site:timesofisrael.com&hl=en&gl=US&ceid=US:en",
      name: "Times of Israel",
      faviconUrl: "https://www.google.com/s2/favicons?domain=timesofisrael.com&sz=32",
      language: "en",
      trustTier: "official",
      isActive: true,
    });
    const source3 = await ctx.db.insert("newsSources", {
      url: "https://www.jpost.com/rss/rssfeedsfrontpage.aspx",
      name: "Jerusalem Post",
      faviconUrl: "https://www.google.com/s2/favicons?domain=jpost.com&sz=32",
      language: "en",
      trustTier: "official",
      isActive: true,
    });

    const articles = [
      { sourceId: source1, title: "משרד החוץ: ישראלים ביוון מתבקשים להירשם באתר", url: "https://www.ynet.co.il/news/article/1", description: "משרד החוץ קרא לכל הישראלים ביוון להירשם באתר המשרד לקבלת עדכונים.", language: "he" as const, publishedAt: now - 2 * hour, isFeatured: true },
      { sourceId: source2, title: "Israel organizes emergency flights from Greece and Turkey", url: "https://www.timesofisrael.com/article/2", description: "The Israeli government has arranged charter flights to bring citizens home from Greece and Turkey.", language: "en" as const, publishedAt: now - 4 * hour, isFeatured: true },
      { sourceId: source3, title: "Chabad centers across Europe open doors to stranded Israelis", url: "https://www.jpost.com/article/3", description: "Chabad houses in Athens, Istanbul, and Larnaca are providing shelter and meals.", language: "en" as const, publishedAt: now - 6 * hour },
      { sourceId: source1, title: "טיסות חילוץ נוספות יוצאות הלילה מאתונה", url: "https://www.ynet.co.il/news/article/4", description: "שני מטוסים נוספים ימריאו הלילה מאתונה לנתב״ג.", language: "he" as const, publishedAt: now - 8 * hour },
      { sourceId: source2, title: "Cyprus offers temporary shelter for Israeli evacuees", url: "https://www.timesofisrael.com/article/5", description: "The Cypriot government announced special arrangements for Israeli citizens.", language: "en" as const, publishedAt: now - 12 * hour },
      { sourceId: source3, title: "How the Yachad platform is helping Israelis abroad", url: "https://www.jpost.com/article/6", description: "A look at the community-driven platform connecting stranded Israelis with flights and services.", language: "en" as const, publishedAt: now - 1 * day },
      { sourceId: source1, title: "עדכון: שגרירות ישראל בטורקיה מאריכה שעות פעילות", url: "https://www.ynet.co.il/news/article/7", description: "השגרירות בטורקיה תפעל עד 20:00 לצרכי חירום.", language: "he" as const, publishedAt: now - 1.5 * day },
      { sourceId: source2, title: "Emergency hotlines set up for Israelis in Europe", url: "https://www.timesofisrael.com/article/8", description: "New 24/7 hotlines available in Hebrew and English.", language: "en" as const, publishedAt: now - 2 * day },
    ];
    for (const a of articles) {
      await ctx.db.insert("newsArticles", a);
    }

    // Alerts
    await ctx.db.insert("alerts", {
      title: "Flight schedule change",
      content: "All flights from Athens to Tel Aviv are delayed by 1 hour due to weather conditions.",
      severity: "info",
      authorId: admin,
      isActive: true,
    });
    await ctx.db.insert("alerts", {
      title: "Embassy closure notice",
      content: "The Israeli embassy in Ankara will be closed for maintenance on March 7-8.",
      severity: "urgent",
      authorId: admin,
      isActive: true,
    });

    // ══════════════════════════════════════════════
    // HOTEL RESERVATIONS
    // ══════════════════════════════════════════════
    await ctx.db.insert("reservations", {
      sellerId: userIds[0],
      hotelName: "Mediterranean Palace",
      country: "GR",
      city: "Thessaloniki",
      checkIn: now + 3 * day,
      checkOut: now + 8 * day,
      roomType: "Double",
      originalPrice: 1200,
      askingPrice: 800,
      currency: "EUR",
      cancellationPolicy: "full",
      contactWhatsapp: "+972501111111",
    });
    await ctx.db.insert("reservations", {
      sellerId: userIds[2],
      hotelName: "Coral Beach Hotel",
      country: "CY",
      city: "Paphos",
      checkIn: now + 5 * day,
      checkOut: now + 12 * day,
      roomType: "Family Suite",
      originalPrice: 2100,
      askingPrice: 1400,
      currency: "EUR",
      cancellationPolicy: "partial",
      contactWhatsapp: "+972502222222",
    });
    await ctx.db.insert("reservations", {
      sellerId: userIds[3],
      hotelName: "Grand Hyatt Istanbul",
      country: "TR",
      city: "Istanbul",
      checkIn: now + 2 * day,
      checkOut: now + 5 * day,
      roomType: "Standard King",
      originalPrice: 900,
      askingPrice: 550,
      currency: "USD",
      cancellationPolicy: "none",
      contactEmail: "daniel.m@gmail.com",
    });

    return {
      users: allUserIds.length,
      flights: flightIds.length,
      savedFlights: 5,
      posts: postIds.length,
      likes: likePairs.length,
      comments: commentData.length,
      reposts: 2,
      chatRooms: 9,
      chatMessages: ilMsgs.length + grMsgs.length + trMsgs.length + dm1Msgs.length + dm2Msgs.length + group1Msgs.length,
      reactions: 5,
      newsArticles: articles.length,
      newsSources: 3,
      alerts: 2,
      reservations: 3,
    };
  },
});
