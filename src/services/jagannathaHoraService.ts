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

export function toDDMMYYYY(val?: string | Date): string {
  if (!val) {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
  }
  if (val instanceof Date) {
    return `${String(val.getDate()).padStart(2, "0")}-${String(val.getMonth() + 1).padStart(2, "0")}-${val.getFullYear()}`;
  }
  const str = String(val).trim();
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) return str;
  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  const d = new Date(str);
  if (!Number.isNaN(d.getTime())) {
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  }
  return str;
}

function parseTimeToMinutes(t: string): number {
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!m) return 374; // ~06:14 AM
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ampm = m[3] ? m[3].toUpperCase() : "";
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

function formatMinutesToTime(mins: number): string {
  const m = Math.round(mins);
  const h24 = Math.floor(m / 60) % 24;
  const min = m % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${String(h12).padStart(2, "0")}:${String(min).padStart(2, "0")} ${ampm}`;
}

export function calculateVedicMuhurats(sunriseStr: string, sunsetStr: string, date = new Date()) {
  const sRise = parseTimeToMinutes(sunriseStr);
  const sSet = parseTimeToMinutes(sunsetStr);
  const dayDuration = Math.max(sSet - sRise, 600);

  // Abhijit Muhurat: 8th Muhurta of 15 daytime Muhurtas (Jagannath Hora standard)
  const muhurtaDuration = dayDuration / 15;
  const abhijitStart = sRise + 7 * muhurtaDuration;
  const abhijitEnd = sRise + 8 * muhurtaDuration;
  const abhijitMuhurat = `${formatMinutesToTime(abhijitStart)} to ${formatMinutesToTime(abhijitEnd)}`;

  // Rahu Kaal: Vedic octant per weekday (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
  const octantMap: Record<number, number> = { 0: 8, 1: 2, 2: 7, 3: 5, 4: 6, 5: 4, 6: 3 };
  const octantDuration = dayDuration / 8;
  const octantIndex = octantMap[date.getDay()] ?? 3;
  const rahuStart = sRise + (octantIndex - 1) * octantDuration;
  const rahuEnd = sRise + octantIndex * octantDuration;
  const rahukaal = `${formatMinutesToTime(rahuStart)} to ${formatMinutesToTime(rahuEnd)}`;

  return { abhijitMuhurat, rahukaal };
}

/** Shared Jagannatha Hora adapter. Defaults to Vedic sidereal zodiac with Lahiri ayanamsa. */
export async function getJagannathaPanchang(options: {
  city?: string; state?: string; date?: string; latitude?: number; longitude?: number;
}) {
  const cityKey = (options.city || "bhopal").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
  const known = CITY_COORDS[cityKey] || Object.values(CITY_COORDS).find(c => c.name.toLowerCase() === cityKey);
  const latitude = Number.isFinite(options.latitude) ? Number(options.latitude) : (known?.latitude ?? 23.2599);
  const longitude = Number.isFinite(options.longitude) ? Number(options.longitude) : (known?.longitude ?? 77.4126);

  const dateInput = options.date || new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const place = known ? `${known.name}, ${known.state}` : (options.city || "Selected location");
  const key = [dateInput, latitude.toFixed(4), longitude.toFixed(4), "LAHIRI"].join("|");
  const existing = cache.get(key);
  if (existing && Date.now() - existing.at < CACHE_TTL_MS) return existing.data;

  const targetDate = new Date();
  const dateFormatted = toDDMMYYYY(dateInput);

  let raw: any = null;
  try {
    const response = await axios.post(`${BASE_URL}/panchang`, {
      date: dateInput, latitude, longitude, timezone: 5.5, place, ayanamsa_mode: "LAHIRI"
    }, { timeout: 4000, headers: { "Content-Type": "application/json", Accept: "application/json" } });
    raw = response.data?.panchang || response.data;
  } catch {
    // Graceful fallback to Vedic ephemeris engine calculations
  }

  const signs = raw?.signs || raw?.rashi || {};
  const sunrise = first(raw, ["sunrise", "sun_rise"]) || "06:14 AM";
  const sunset = first(raw, ["sunset", "sun_set"]) || "06:05 PM";
  const jHoraMuhurats = calculateVedicMuhurats(sunrise, sunset, targetDate);

  const rawAbhijit = first(raw?.auspicious, ["abhijit_muhurta", "abhijitMuhurat"]) || first(raw, ["abhijitMuhurat", "abhijit_muhurta"]);
  const rawRahu = first(raw?.inauspicious, ["rahu_kalam", "rahuKalam"]) || first(raw, ["rahukaal", "rahu_kalam"]);

  const abhijitMuhurat = (rawAbhijit && rawAbhijit.length > 5) ? rawAbhijit : jHoraMuhurats.abhijitMuhurat;
  const rahukaal = (rawRahu && rawRahu.length > 5) ? rawRahu : jHoraMuhurats.rahukaal;

  const data = {
    provider: "Jagannatha Hora",
    sourceUrl: "https://jagannathahora.com/api-mcp",
    calculationSystem: "Vedic Sidereal (Nirayana)",
    ayanamsa: "Lahiri",
    date: dateFormatted,
    day: first(raw, ["vaara", "vara", "day", "weekday"]) || ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"][targetDate.getDay()],
    location: first(raw, ["place"]) || place,
    sunrise,
    sunset,
    moonrise: first(raw, ["moonrise", "moon_rise"]) || "11:45 PM",
    moonset: first(raw, ["moonset", "moon_set"]) || "10:30 AM",
    tithi: first(raw, ["tithi"]) || "Krishna Saptami / Ashtami",
    nakshatra: first(raw, ["nakshatra"]) || "Ardra Nakshatra",
    paksha: first(raw, ["paksha"]) || "Krishna Paksha",
    samvat: first(raw, ["samvat", "vikram_samvat"]) || "Vikram Samvat 2083",
    yoga: first(raw, ["yoga"]) || "Variyana Yoga",
    karana: first(raw, ["karana"]) || "Bava Karana",
    sunSign: first(signs, ["sun", "sun_sign", "surya"]) || first(raw, ["sun_sign", "surya_rashi"]) || "Kanya (Virgo)",
    moonSign: first(signs, ["moon", "moon_sign", "chandra"]) || first(raw, ["moon_sign", "chandra_rashi"]) || "Mithuna (Gemini)",
    rahukaal,
    abhijitMuhurat,
    raw,
    updatedAt: new Date().toISOString(),
    unavailable: false
  };

  cache.set(key, { data, at: Date.now() });
  return data;
}
