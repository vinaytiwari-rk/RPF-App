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

function deepFirst(source: any, keys: string[], depth = 0): string {
  if (!source || typeof source !== "object" || depth > 4) return "";
  const direct = first(source, keys);
  if (direct) return direct;
  for (const value of Object.values(source)) {
    if (value && typeof value === "object") {
      const nested = deepFirst(value, keys, depth + 1);
      if (nested) return nested;
    }
  }
  return "";
}

const MASA_KEYS = [
  "masa", "maasa", "maas", "lunar_month", "lunarMonth", "lunar_month_name",
  "lunarMonthName", "hindu_month", "hinduMonth", "hindu_lunar_month", "hinduLunarMonth",
  "masa_name", "masaName", "masa_name_en", "masaNameEn", "maasa_name", "maasaName",
  "month_name", "monthName", "month_name_en", "monthNameEn", "monthNameEnglish",
  "lunar_month_en", "lunarMonthEn", "lunarMonthNameEn", "chandra_masa", "chandraMasa",
  "amanta_masa", "amantaMasa", "amanta", "purnimanta_masa", "purnimantaMasa",
  "purnimanta", "vedic_month", "vedicMonth"
];

const HINDU_MONTH_NAMES = /^(magha|magh|phalguna|phalgun|chaitra|vaisakha|vaishakha|jyeshtha|jyestha|ashada|ashadha|shravana|shravan|bhadrapada|bhadra|ashvina|ashwin|kartika|kartik|margashirsha|margashirsh|pausha|paush|माघ|फाल्गुन|चैत्र|वैशाख|ज्येष्ठ|आषाढ़|श्रावण|भाद्रपद|आश्विन|कार्तिक|मार्गशीर्ष|पौष)$/i;

function deepMasa(source: any, depth = 0): string {
  if (!source || typeof source !== "object" || depth > 5) return "";
  const direct = first(source, MASA_KEYS);
  if (direct) return direct;
  // Jagannatha Hora documents "month" as the lunar month on its Panchang response.
  // Preserve the provider's actual label (including regional/adhika variants), but never show a numeric index.
  const genericMonth = textValue(source.month ?? source.Month ?? source.MONTH).trim();
  if (genericMonth && !/^\\d+(?:\\.\\d+)?$/.test(genericMonth)) return genericMonth;
  for (const value of Object.values(source)) {
    if (value && typeof value === "object") {
      const nested = deepMasa(value, depth + 1);
      if (nested) return nested;
    }
  }
  return "";
}
const PAKSHA_KEYS = ["paksha", "pakṣa", "lunar_fortnight", "lunarFortnight", "fortnight"];

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

  const dateFormatted = toDDMMYYYY(dateInput);
  // Use the requested Panchang date (not the server's current date) for weekday-based calculations.
  const dateParts = dateFormatted.match(/^(\\d{2})-(\\d{2})-(\\d{4})$/);
  const targetDate = dateParts
    ? new Date(Number(dateParts[3]), Number(dateParts[2]) - 1, Number(dateParts[1]), 12, 0, 0)
    : new Date();

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
  if (!raw || typeof raw !== "object") {
    return {
      provider: "Jagannatha Hora",
      sourceUrl: "https://jagannathahora.com/api-mcp",
      calculationSystem: "Vedic Sidereal (Nirayana)",
      ayanamsa: "Lahiri",
      date: dateFormatted,
      day: "",
      location: place,
      sunrise: "",
      sunset: "",
      moonrise: "",
      moonset: "",
      tithi: "",
      nakshatra: "",
      masa: "",
      paksha: "",
      samvat: "",
      yoga: "",
      karana: "",
      sunSign: "",
      moonSign: "",
      rahukaal: "",
      abhijitMuhurat: "",
      raw: null,
      updatedAt: new Date().toISOString(),
      unavailable: true
    };
  }

  const sunrise = first(raw, ["sunrise", "sun_rise"]);
  const sunset = first(raw, ["sunset", "sun_set"]);
  const jHoraMuhurats = sunrise && sunset
    ? calculateVedicMuhurats(sunrise, sunset, targetDate)
    : { abhijitMuhurat: "", rahukaal: "" };

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
    day: first(raw, ["vaara", "vara", "day", "weekday"]),
    location: first(raw, ["place"]) || place,
    sunrise,
    sunset,
    moonrise: first(raw, ["moonrise", "moon_rise"]),
    moonset: first(raw, ["moonset", "moon_set"]),
    tithi: first(raw, ["tithi"]),
    nakshatra: first(raw, ["nakshatra"]),
    masa: deepMasa(raw),
    paksha: deepFirst(raw, PAKSHA_KEYS) || "",
    samvat: first(raw, ["samvat", "vikram_samvat"]),
    yoga: first(raw, ["yoga"]),
    karana: first(raw, ["karana"]),
    sunSign: first(signs, ["sun", "sun_sign", "surya"]) || first(raw, ["sun_sign", "surya_rashi"]),
    moonSign: first(signs, ["moon", "moon_sign", "chandra"]) || first(raw, ["moon_sign", "chandra_rashi"]),
    rahukaal,
    abhijitMuhurat,
    raw,
    updatedAt: new Date().toISOString(),
    unavailable: !(first(raw, ["tithi"]) && first(raw, ["nakshatra"]) && deepFirst(raw, PAKSHA_KEYS) && deepMasa(raw))
  };

  cache.set(key, { data, at: Date.now() });
  return data;
}
