/**
 * IATA airport code → coordinates lookup.
 * Covers the most common airports for Israeli travelers.
 */
export interface AirportCoords {
  lat: number;
  lng: number;
  city: string;
}

const AIRPORTS: Record<string, AirportCoords> = {
  // Israel
  TLV: { lat: 32.0114, lng: 34.8867, city: "Tel Aviv" },
  SDV: { lat: 32.1147, lng: 34.7822, city: "Tel Aviv" },
  ETH: { lat: 29.5613, lng: 34.9601, city: "Eilat" },
  HFA: { lat: 32.8094, lng: 35.0431, city: "Haifa" },

  // Turkey
  IST: { lat: 41.2753, lng: 28.7519, city: "Istanbul" },
  SAW: { lat: 40.8986, lng: 29.3092, city: "Istanbul" },
  AYT: { lat: 36.8987, lng: 30.8005, city: "Antalya" },
  ADB: { lat: 38.2924, lng: 27.157, city: "Izmir" },
  DLM: { lat: 36.7131, lng: 28.7925, city: "Dalaman" },
  BJV: { lat: 37.2506, lng: 27.6643, city: "Bodrum" },

  // Greece
  ATH: { lat: 37.9364, lng: 23.9445, city: "Athens" },
  SKG: { lat: 40.5197, lng: 22.9709, city: "Thessaloniki" },
  HER: { lat: 35.3397, lng: 25.1803, city: "Heraklion" },
  RHO: { lat: 36.4054, lng: 28.0862, city: "Rhodes" },
  JMK: { lat: 37.4351, lng: 25.3481, city: "Mykonos" },
  JTR: { lat: 36.3992, lng: 25.4793, city: "Santorini" },
  CFU: { lat: 39.6019, lng: 19.9117, city: "Corfu" },

  // Cyprus
  LCA: { lat: 34.8751, lng: 33.6249, city: "Larnaca" },
  PFO: { lat: 34.718, lng: 32.4857, city: "Paphos" },

  // Western Europe
  LHR: { lat: 51.47, lng: -0.4543, city: "London" },
  LGW: { lat: 51.1537, lng: -0.1821, city: "London" },
  STN: { lat: 51.885, lng: 0.235, city: "London" },
  LTN: { lat: 51.8747, lng: -0.3683, city: "London" },
  CDG: { lat: 49.0097, lng: 2.5479, city: "Paris" },
  ORY: { lat: 48.7233, lng: 2.3794, city: "Paris" },
  AMS: { lat: 52.3105, lng: 4.7683, city: "Amsterdam" },
  FRA: { lat: 50.0379, lng: 8.5622, city: "Frankfurt" },
  MUC: { lat: 48.3538, lng: 11.775, city: "Munich" },
  BER: { lat: 52.3667, lng: 13.5033, city: "Berlin" },
  FCO: { lat: 41.8003, lng: 12.2389, city: "Rome" },
  MXP: { lat: 45.6306, lng: 8.7281, city: "Milan" },
  BCN: { lat: 41.2974, lng: 2.0833, city: "Barcelona" },
  MAD: { lat: 40.4983, lng: -3.5676, city: "Madrid" },
  LIS: { lat: 38.7813, lng: -9.1359, city: "Lisbon" },
  ZRH: { lat: 47.4647, lng: 8.5492, city: "Zurich" },
  GVA: { lat: 46.238, lng: 6.1089, city: "Geneva" },
  VIE: { lat: 48.1103, lng: 16.5697, city: "Vienna" },
  BRU: { lat: 50.9014, lng: 4.4844, city: "Brussels" },
  DUB: { lat: 53.4264, lng: -6.2499, city: "Dublin" },
  CPH: { lat: 55.618, lng: 12.656, city: "Copenhagen" },
  OSL: { lat: 60.1976, lng: 11.1004, city: "Oslo" },
  ARN: { lat: 59.6519, lng: 17.9186, city: "Stockholm" },
  HEL: { lat: 60.3172, lng: 24.9633, city: "Helsinki" },

  // Eastern Europe
  WAW: { lat: 52.1657, lng: 20.9671, city: "Warsaw" },
  PRG: { lat: 50.1008, lng: 14.26, city: "Prague" },
  BUD: { lat: 47.4369, lng: 19.2556, city: "Budapest" },
  OTP: { lat: 44.5711, lng: 26.085, city: "Bucharest" },
  SOF: { lat: 42.6952, lng: 23.4062, city: "Sofia" },
  ZAG: { lat: 45.7429, lng: 16.0688, city: "Zagreb" },
  BEG: { lat: 44.8184, lng: 20.3091, city: "Belgrade" },
  TGD: { lat: 42.3594, lng: 19.2519, city: "Podgorica" },
  TIA: { lat: 41.4147, lng: 19.7206, city: "Tirana" },
  RIX: { lat: 56.9236, lng: 23.9711, city: "Riga" },
  VNO: { lat: 54.6341, lng: 25.2858, city: "Vilnius" },
  TLL: { lat: 59.4133, lng: 24.8328, city: "Tallinn" },
  KBP: { lat: 50.345, lng: 30.8947, city: "Kyiv" },

  // North America
  JFK: { lat: 40.6413, lng: -73.7781, city: "New York" },
  EWR: { lat: 40.6895, lng: -74.1745, city: "Newark" },
  LAX: { lat: 33.9425, lng: -118.408, city: "Los Angeles" },
  MIA: { lat: 25.7959, lng: -80.287, city: "Miami" },
  ORD: { lat: 41.9742, lng: -87.9073, city: "Chicago" },
  SFO: { lat: 37.6213, lng: -122.379, city: "San Francisco" },
  YYZ: { lat: 43.6777, lng: -79.6248, city: "Toronto" },
  YUL: { lat: 45.4707, lng: -73.7407, city: "Montreal" },

  // Asia
  BKK: { lat: 13.6811, lng: 100.7472, city: "Bangkok" },
  DEL: { lat: 28.5562, lng: 77.1, city: "Delhi" },
  BOM: { lat: 19.0896, lng: 72.8656, city: "Mumbai" },
  GOA: { lat: 15.3808, lng: 73.8314, city: "Goa" },
  SIN: { lat: 1.3644, lng: 103.9915, city: "Singapore" },
  HKG: { lat: 22.308, lng: 113.9185, city: "Hong Kong" },
  NRT: { lat: 35.7647, lng: 140.3864, city: "Tokyo" },
  ICN: { lat: 37.4602, lng: 126.4407, city: "Seoul" },
  PEK: { lat: 40.0799, lng: 116.6031, city: "Beijing" },
  KTM: { lat: 27.6966, lng: 85.3591, city: "Kathmandu" },
  CMB: { lat: 7.1809, lng: 79.8841, city: "Colombo" },
  PNH: { lat: 11.5466, lng: 104.8441, city: "Phnom Penh" },
  HAN: { lat: 21.2212, lng: 105.807, city: "Hanoi" },
  SGN: { lat: 10.8188, lng: 106.6519, city: "Ho Chi Minh" },
  DPS: { lat: -8.7482, lng: 115.1672, city: "Bali" },

  // Middle East / Gulf
  DXB: { lat: 25.2532, lng: 55.3657, city: "Dubai" },
  AUH: { lat: 24.4331, lng: 54.6511, city: "Abu Dhabi" },
  DOH: { lat: 25.2731, lng: 51.6082, city: "Doha" },
  AMM: { lat: 31.7226, lng: 35.9932, city: "Amman" },
  CAI: { lat: 30.1219, lng: 31.4056, city: "Cairo" },
  SSH: { lat: 27.9773, lng: 34.3953, city: "Sharm El Sheikh" },
  HRG: { lat: 27.1783, lng: 33.7994, city: "Hurghada" },

  // Africa
  JNB: { lat: -26.1392, lng: 28.246, city: "Johannesburg" },
  CPT: { lat: -33.9649, lng: 18.6017, city: "Cape Town" },
  NBO: { lat: -1.3192, lng: 36.9278, city: "Nairobi" },
  ADD: { lat: 8.9779, lng: 38.7994, city: "Addis Ababa" },
  CMN: { lat: 33.3675, lng: -7.5898, city: "Casablanca" },
  RAK: { lat: 31.6069, lng: -8.0363, city: "Marrakech" },

  // South America
  GRU: { lat: -23.4356, lng: -46.4731, city: "Sao Paulo" },
  EZE: { lat: -34.8222, lng: -58.5358, city: "Buenos Aires" },
  BOG: { lat: 4.7016, lng: -74.1469, city: "Bogota" },
  LIM: { lat: -12.0219, lng: -77.1143, city: "Lima" },
  SCL: { lat: -33.393, lng: -70.7858, city: "Santiago" },

  // Caucasus
  TBS: { lat: 41.6692, lng: 44.9547, city: "Tbilisi" },
  EVN: { lat: 40.1473, lng: 44.3959, city: "Yerevan" },
  GYD: { lat: 40.4675, lng: 50.0467, city: "Baku" },

  // Malta
  MLA: { lat: 35.8575, lng: 14.4775, city: "Malta" },
};

/**
 * Country code → approximate centroid for fallback.
 */
const COUNTRY_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  IL: { lat: 31.5, lng: 34.75 },
  US: { lat: 39.8, lng: -98.5 },
  GB: { lat: 54.0, lng: -2.0 },
  DE: { lat: 51.0, lng: 10.0 },
  FR: { lat: 46.6, lng: 2.2 },
  TR: { lat: 39.0, lng: 35.0 },
  GR: { lat: 38.5, lng: 23.5 },
  IT: { lat: 42.5, lng: 12.5 },
  ES: { lat: 40.0, lng: -3.7 },
  PT: { lat: 39.4, lng: -8.2 },
  NL: { lat: 52.3, lng: 5.3 },
  CH: { lat: 46.8, lng: 8.2 },
  AT: { lat: 47.5, lng: 14.5 },
  PL: { lat: 52.0, lng: 20.0 },
  CZ: { lat: 49.8, lng: 15.5 },
  HU: { lat: 47.5, lng: 19.0 },
  RO: { lat: 45.9, lng: 25.0 },
  BG: { lat: 42.7, lng: 25.5 },
  HR: { lat: 45.1, lng: 15.2 },
  RS: { lat: 44.0, lng: 21.0 },
  ME: { lat: 42.5, lng: 19.3 },
  AL: { lat: 41.2, lng: 20.2 },
  MK: { lat: 41.5, lng: 21.7 },
  BA: { lat: 43.9, lng: 17.7 },
  CY: { lat: 35.1, lng: 33.4 },
  MT: { lat: 35.9, lng: 14.4 },
  IE: { lat: 53.4, lng: -7.7 },
  BE: { lat: 50.8, lng: 4.3 },
  DK: { lat: 55.7, lng: 9.5 },
  NO: { lat: 60.5, lng: 8.5 },
  SE: { lat: 60.1, lng: 18.6 },
  FI: { lat: 61.9, lng: 25.7 },
  LV: { lat: 56.9, lng: 24.1 },
  LT: { lat: 55.2, lng: 23.9 },
  EE: { lat: 58.6, lng: 25.0 },
  UA: { lat: 48.4, lng: 31.2 },
  RU: { lat: 55.8, lng: 37.6 },
  GE: { lat: 42.3, lng: 43.4 },
  AM: { lat: 40.1, lng: 44.5 },
  AZ: { lat: 40.4, lng: 49.9 },
  TH: { lat: 13.8, lng: 100.5 },
  IN: { lat: 20.6, lng: 78.9 },
  SG: { lat: 1.35, lng: 103.8 },
  JP: { lat: 36.2, lng: 138.3 },
  KR: { lat: 35.9, lng: 127.8 },
  CN: { lat: 35.9, lng: 104.2 },
  AE: { lat: 24.0, lng: 54.0 },
  QA: { lat: 25.3, lng: 51.2 },
  JO: { lat: 31.9, lng: 36.6 },
  EG: { lat: 26.8, lng: 30.8 },
  MA: { lat: 31.8, lng: -7.1 },
  ZA: { lat: -30.6, lng: 22.9 },
  KE: { lat: -0.02, lng: 37.9 },
  ET: { lat: 9.0, lng: 38.7 },
  BR: { lat: -14.2, lng: -51.9 },
  AR: { lat: -38.4, lng: -63.6 },
  CO: { lat: 4.6, lng: -74.1 },
  PE: { lat: -9.2, lng: -75.0 },
  CL: { lat: -35.7, lng: -71.5 },
  MX: { lat: 23.6, lng: -102.6 },
  CA: { lat: 56.1, lng: -106.3 },
  AU: { lat: -25.3, lng: 133.8 },
  NZ: { lat: -40.9, lng: 174.9 },
  NP: { lat: 28.4, lng: 84.1 },
  LK: { lat: 7.9, lng: 80.8 },
  KH: { lat: 12.6, lng: 104.9 },
  VN: { lat: 14.1, lng: 108.3 },
  ID: { lat: -0.8, lng: 113.9 },
  MY: { lat: 4.2, lng: 101.9 },
  PH: { lat: 12.9, lng: 121.8 },
  TW: { lat: 23.7, lng: 120.9 },
  NG: { lat: 9.1, lng: 8.7 },
  TZ: { lat: -6.4, lng: 34.9 },
  LU: { lat: 49.8, lng: 6.1 },
  IS: { lat: 64.9, lng: -19.0 },
  SI: { lat: 46.2, lng: 14.8 },
  SK: { lat: 48.7, lng: 19.7 },
};

/**
 * Look up coordinates for a flight endpoint.
 * Priority: airport IATA code → country centroid → null.
 */
export function getFlightCoords(
  airport?: string,
  country?: string
): { lat: number; lng: number } | null {
  if (airport) {
    const code = airport.toUpperCase().trim();
    if (AIRPORTS[code]) return AIRPORTS[code];
  }
  if (country) {
    const code = country.toUpperCase().trim();
    if (COUNTRY_CENTROIDS[code]) return COUNTRY_CENTROIDS[code];
  }
  return null;
}

export function getAirportInfo(iata: string): AirportCoords | null {
  return AIRPORTS[iata.toUpperCase().trim()] ?? null;
}
