import axios from "axios";

const BASE_URL = "https://jagannatha-hora-359167915530.europe-west1.run.app";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map<string, { data: any; at: number }>();

const CITY_COORDS: Record<string, { name: string; state: string; latitude: number; longitude: number }> = {
  indore: { name: "Indore", state: "Madhya Pradesh", latitude: 22.7196, longitude: 75.8577 },
  bhopal: { name: "Bhopal", state: "Madhya Pradesh", latitude: 23.2599, longitude: 77.4126 },
  lucknow: { name: "Lucknow", state: "Uttar Pradesh", latitude: 26.8467, longitude: 80.9462 },
  delhi: { name: "Delhi", state: "Delhi NCR", latitude: 28.6139, longitude: 77.2090 },
  gwalior: { name: "Gwalior", state: "Madhya Pradesh", latitude: 26.2183, longitude: 78.1828 },
  ujjain: { name: "Ujjain", state: "Madhya Pradesh", latitude: 23.1765, longitude: 75.7885 },
  jabalpur: { name: "Jabalpur", state: "Madhya Pradesh", latitude: 23.1815, longitude: 79.9864 },
  kanpur: { name: "Kanpur", state: "Uttar Pradesh", latitude: 26.4499, longitude: 80.3319 },
  varanasi: { name: "Varanasi", state: "Uttar Pradesh", latitude: 25.3176, longitude: 82.9739 },
  jaipur: { name: "Jaipur", state: "Rajasthan", latitude: 26.9124, longitude: 75.7873 },
  mumbai: { name: "Mumbai", state: "Maharashtra", latitude: 19.076, longitude: 72.8777 },
  raipur: { name: "Raipur", state: "Chhattisgarh", latitude: 21.2514, longitude: 81.6296 }
};

function textValue(value: any): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    for (const key of ["name", "value", "label", "time", "display", "sign", "rashi"]) {
      if (value[key] !== undefined && value[key] !== null) return textValue(value[key]);
    }
  }
  return "";
}

function first(source: any, keys: string[]): string {
  for (const key of keys) {
    const value = source?.[key];
    const result = textValue(value);
    if (result) return result;
  }
  return "";
}

/** Shared Jagannatha Hora adapter. Defaults to Vedic sidereal zodiac with Lahiri ayanamsa. */
export async function getJagannathaPanchang(options: {
  city?: string; state?: string; date?: string; latitude?: number; longitude?: number;
}) {
  const cityKey = (options.city || "bhopal").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
  const known = CITY_COORDS[cityKey] || Object.values(CITY_COORDS).find(c => c.name.toLowerCase() === cityKey);
  const latitude = Number.isFinite(options.latitude) ? Number(options.latitude) : known?.latitude;
  const longitude = Number.isFinite(options.longitude) ? Number(options.longitude) : known?.longitude;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Panchang requires valid coordinates. Select a supported city or provide latitude and longitude.");
  }

  const date = options.date || new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) throw new Error("Invalid date; use YYYY-MM-DD.");
  const place = known ? `${known.name}, ${known.state}` : (options.city || "Selected location");
  const key = [date, latitude.toFixed(4), longitude.toFixed(4), "LAHIRI"].join("|");
  const existing = cache.get(key);
  if (existing && Date.now() - existing.at < CACHE_TTL_MS) return existing.data;

  const response = await axios.post(`${BASE_URL}/panchang`, {
    date, latitude, longitude, timezone: 5.5, place, ayanamsa_mode: "LAHIRI"
  }, { timeout: 12000, headers: { "Content-Type": "application/json", Accept: "application/json" } });

  const raw = response.data?.panchang || response.data;
  const signs = raw?.signs || raw?.rashi || {};
  const data = {
    provider: "Jagannatha Hora",
    sourceUrl: "https://jagannathahora.com/api-mcp",
    calculationSystem: "Vedic Sidereal (Nirayana)",
    ayanamsa: "Lahiri",
    date: first(raw, ["date"]) || date,
    day: first(raw, ["vaara", "vara", "day", "weekday"]),
    location: first(raw, ["place"]) || place,
    sunrise: first(raw, ["sunrise", "sun_rise"]),
    sunset: first(raw, ["sunset", "sun_set"]),
    moonrise: first(raw, ["moonrise", "moon_rise"]),
    moonset: first(raw, ["moonset", "moon_set"]),
    tithi: first(raw, ["tithi"]),
    nakshatra: first(raw, ["nakshatra"]),
    paksha: first(raw, ["paksha"]),
    samvat: first(raw, ["samvat", "vikram_samvat"]),
    yoga: first(raw, ["yoga"]),
    karana: first(raw, ["karana"]),
    sunSign: first(signs, ["sun", "sun_sign", "surya"]) || first(raw, ["sun_sign", "surya_rashi"]),
    moonSign: first(signs, ["moon", "moon_sign", "chandra"]) || first(raw, ["moon_sign", "chandra_rashi"]),
    rahukaal: first(raw?.inauspicious, ["rahu_kalam", "rahuKalam"]) || first(raw, ["rahukaal", "rahu_kalam"]),
    abhijitMuhurat: first(raw?.auspicious, ["abhijit_muhurta", "abhijitMuhurat"]) || first(raw, ["abhijitMuhurat", "abhijit_muhurta"]),
    raw,
    updatedAt: new Date().toISOString(),
    unavailable: false
  };
  cache.set(key, { data, at: Date.now() });
  return data;
}
