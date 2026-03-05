import { internalMutation } from "./_generated/server";

/** Clear ALL users and flights. Run: npx convex run seed:clearAll */
export const clearAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allFlights = await ctx.db.query("flights").collect();
    for (const f of allFlights) await ctx.db.delete(f._id);

    const allUsers = await ctx.db.query("users").collect();
    for (const u of allUsers) await ctx.db.delete(u._id);

    return { deleted: { flights: allFlights.length, users: allUsers.length } };
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
