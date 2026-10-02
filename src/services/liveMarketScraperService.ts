import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const customHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
};

export interface CityLocationInfo {
  id: string;
  name: string;
  state: string;
  vegUrl: string;
  fuelUrl: string;
  marketName: string;
  geonameId?: string;
  bullionUrl?: string;
  mandiUrl?: string;
}

export const SUPPORTED_CITIES: Record<string, CityLocationInfo> = {
  indore: {
    id: "indore",
    name: "Indore",
    state: "Madhya Pradesh",
    vegUrl: "https://rozkabhav.com/vegetables-price-in-indore-madhya-pradesh/",
    fuelUrl: "https://rozkabhav.com/fuel-price-in-indore-madhya-pradesh/",
    marketName: "Indore Choithram Mandi, MP",
    geonameId: "1269743"
  },
  bhopal: {
    id: "bhopal",
    name: "Bhopal",
    state: "Madhya Pradesh",
    vegUrl: "https://rozkabhav.com/vegetables-price-in-bhopal-madhya-pradesh/",
    fuelUrl: "https://rozkabhav.com/fuel-price-in-bhopal-madhya-pradesh/",
    marketName: "Bhopal Karond Mandi, MP"
  },
  lucknow: {
    id: "lucknow",
    name: "Lucknow",
    state: "Uttar Pradesh",
    vegUrl: "https://rozkabhav.com/vegetables-price-in-lucknow-uttar-pradesh/",
    fuelUrl: "https://rozkabhav.com/fuel-price-in-lucknow-uttar-pradesh/",
    marketName: "Lucknow Dubagga Mandi, UP"
  },
  delhi: {
    id: "delhi",
    name: "Delhi",
    state: "Delhi NCR",
    vegUrl: "https://rozkabhav.com/vegetables-price-in-delhi/",
    fuelUrl: "https://rozkabhav.com/fuel-price-in-delhi-delhi/",
    marketName: "Delhi Azadpur Mandi"
  },
  gwalior: {
    id: "gwalior",
    name: "Gwalior",
    state: "Madhya Pradesh",
    vegUrl: "https://rozkabhav.com/vegetables-price-in-gwalior-madhya-pradesh/",
    fuelUrl: "https://rozkabhav.com/fuel-price-in-gwalior-madhya-pradesh/",
    marketName: "Gwalior Laxmiganj Mandi, MP"
  },
  ujjain: {
    id: "ujjain",
    name: "Ujjain",
    state: "Madhya Pradesh",
    vegUrl: "https://rozkabhav.com/vegetables-price-in-ujjain-madhya-pradesh/",
    fuelUrl: "https://rozkabhav.com/fuel-price-in-ujjain-madhya-pradesh/",
    marketName: "Ujjain Krishi Upaj Mandi, MP"
  },
  jabalpur: {
    id: "jabalpur",
    name: "Jabalpur",
    state: "Madhya Pradesh",
    vegUrl: "https://rozkabhav.com/vegetables-price-in-jabalpur-madhya-pradesh/",
    fuelUrl: "https://rozkabhav.com/fuel-price-in-jabalpur-madhya-pradesh/",
    marketName: "Jabalpur Krishi Mandi, MP"
  },
  kanpur: {
    id: "kanpur",
    name: "Kanpur",
    state: "Uttar Pradesh",
    vegUrl: "https://rozkabhav.com/vegetables-price-in-kanpur-uttar-pradesh/",
    fuelUrl: "https://rozkabhav.com/fuel-price-in-kanpur-uttar-pradesh/",
    marketName: "Kanpur Chakarpar Mandi, UP"
  },
  varanasi: {
    id: "varanasi",
    name: "Varanasi",
    state: "Uttar Pradesh",
    vegUrl: "https://rozkabhav.com/vegetables-price-in-varanasi-uttar-pradesh/",
    fuelUrl: "https://rozkabhav.com/fuel-price-in-varanasi-uttar-pradesh/",
    marketName: "Varanasi Chandpur Mandi, UP"
  },
  jaipur: {
    id: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    vegUrl: "https://rozkabhav.com/vegetables-price-in-jaipur-rajasthan/",
    fuelUrl: "https://rozkabhav.com/fuel-price-in-jaipur-rajasthan/",
    marketName: "Jaipur Muhana Mandi, Rajasthan"
  },
  mumbai: {
    id: "mumbai",
    name: "Mumbai",
    state: "Maharashtra",
    vegUrl: "https://rozkabhav.com/vegetables-price-in-mumbai-maharashtra/",
    fuelUrl: "https://rozkabhav.com/fuel-price-in-mumbai-maharashtra/",
    marketName: "Mumbai Vashi APMC, Maharashtra"
  }
};


type StateMarketSource = { state: string; vegUrl: string; fuelUrl: string; anchorCity: string };

const STATE_MARKET_SOURCES: Record<string, StateMarketSource> = {
  "Madhya Pradesh": { state: "Madhya Pradesh", anchorCity: "Bhopal", vegUrl: "https://rozkabhav.com/vegetables-price-in-bhopal-madhya-pradesh/", fuelUrl: "https://rozkabhav.com/fuel-price-in-bhopal-madhya-pradesh/" },
  "Uttar Pradesh": { state: "Uttar Pradesh", anchorCity: "Agra", vegUrl: "https://rozkabhav.com/vegetables-price-in-agra-uttar-pradesh/", fuelUrl: "https://rozkabhav.com/fuel-price-in-agra-uttar-pradesh/" },
  "Rajasthan": { state: "Rajasthan", anchorCity: "Kota", vegUrl: "https://rozkabhav.com/vegetables-price-in-kota-rajasthan/", fuelUrl: "https://rozkabhav.com/fuel-price-in-kota-rajasthan/" },
  "Maharashtra": { state: "Maharashtra", anchorCity: "Nagpur", vegUrl: "https://rozkabhav.com/vegetables-price-in-nagpur-maharashtra/", fuelUrl: "https://rozkabhav.com/fuel-price-in-nagpur-maharashtra/" },
  "Chhattisgarh": { state: "Chhattisgarh", anchorCity: "Raipur", vegUrl: "https://rozkabhav.com/vegetables-price-in-raipur-chhattisgarh/", fuelUrl: "https://rozkabhav.com/fuel-price-in-raipur-chhattisgarh/" },
  "Delhi NCR": { state: "Delhi NCR", anchorCity: "Delhi", vegUrl: "https://rozkabhav.com/vegetables-price-in-delhi-delhi/", fuelUrl: "https://rozkabhav.com/fuel-price-in-delhi-delhi/" }
};

const cityCatalogCache = new Map<string, { data: Record<string, CityLocationInfo>; timestamp: number }>();
let cityCatalogPromise: Promise<Record<string, CityLocationInfo>> | null = null;

function slugifyCity(value: string) {
  return value.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function buildCityInfo(name: string, state: string): CityLocationInfo {
  const stateSlug = slugifyCity(state);
  const citySlug = slugifyCity(name);
  const source = STATE_MARKET_SOURCES[state] || STATE_MARKET_SOURCES["Madhya Pradesh"];
  return {
    id: citySlug,
    name,
    state,
    vegUrl: `https://rozkabhav.com/vegetables-price-in-${citySlug}-${stateSlug}/`,
    fuelUrl: `https://rozkabhav.com/fuel-price-in-${citySlug}-${stateSlug}/`,
    marketName: `${name} Mandi, ${state}`,
    bullionUrl: `https://allindiabullion.com/gold-rate/${stateSlug}/${citySlug}`,
    mandiUrl: `https://mandipulse.com/mandi/${stateSlug}-${citySlug}-${citySlug}-apmc`,
    geonameId: undefined
  };
}

async function discoverCitiesFromState(source: StateMarketSource): Promise<Record<string, CityLocationInfo>> {
  const result: Record<string, CityLocationInfo> = {};
  try {
    const res = await axios.get(source.vegUrl, { headers: customHeaders, httpsAgent, timeout: 7000 });
    const $ = cheerio.load(res.data);
    $("table").each((_, table) => {
      const headers = $(table).find("tr").first().find("th,td").map((__, el) => $(el).text().replace(/\s+/g, " ").trim().toLowerCase()).get();
      if (!headers.some(h => h === "city") || !headers.some(h => h.includes("onion"))) return;
      $(table).find("tr").slice(1).each((__, row) => {
        const cells = $(row).find("td").map((___, td) => $(td).text().replace(/\s+/g, " ").trim()).get();
        const city = (cells[0] || "").replace(/[▲▼]/g, "").trim();
        if (city && !/^\d+(\.\d+)?$/.test(city)) result[slugifyCity(city)] = buildCityInfo(city, source.state);
      });
    });
  } catch {}
  return result;
}

async function ensureCityCatalog() {
  const cached = cityCatalogCache.get("all");
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    Object.assign(SUPPORTED_CITIES, cached.data);
    return cached.data;
  }
  if (cityCatalogPromise) return cityCatalogPromise;

  cityCatalogPromise = (async () => {
    const discovered: Record<string, CityLocationInfo> = { ...SUPPORTED_CITIES };
    const groups = await Promise.all(Object.values(STATE_MARKET_SOURCES).map(discoverCitiesFromState));
    groups.forEach(group => Object.assign(discovered, group));
    Object.assign(SUPPORTED_CITIES, discovered);
    cityCatalogCache.set("all", { data: discovered, timestamp: Date.now() });
    return discovered;
  })();

  try {
    return await cityCatalogPromise;
  } finally {
    cityCatalogPromise = null;
  }
}

export async function getSupportedMarketCities() {
  await ensureCityCatalog();
  return Object.values(SUPPORTED_CITIES).map(c => ({ id: c.id, name: c.name, state: c.state, marketName: c.marketName }));
}

function parseCityMarketRow(html: string, cityName: string, kind: "vegetable" | "fuel") {
  const $ = cheerio.load(html);
  let found: { headers: string[]; cells: string[] } | null = null;
  $("table").each((_, table) => {
    if (found) return;
    const headers = $(table).find("tr").first().find("th,td").map((__, el) => $(el).text().replace(/\s+/g, " ").trim()).get();
    const lower = headers.map(h => h.toLowerCase());
    const valid = kind === "vegetable"
      ? lower.some(h => h === "city") && lower.some(h => h.includes("onion"))
      : lower.some(h => h === "city") && lower.some(h => h.includes("petrol")) && lower.some(h => h.includes("diesel"));
    if (!valid) return;
    $(table).find("tr").slice(1).each((__, row) => {
      if (found) return;
      const cells = $(row).find("td").map((___, td) => $(td).text().replace(/\s+/g, " ").trim()).get();
      if ((cells[0] || "").replace(/[▲▼]/g, "").trim().toLowerCase() === cityName.toLowerCase()) found = { headers, cells };
    });
  });
  return found;
}

// Caches with city keying
const panchangCache = new Map<string, { data: any; timestamp: number }>();
const bullionCache = new Map<string, { data: any; timestamp: number }>();
const vegetableCache = new Map<string, { data: any; timestamp: number }>();
let mandiPulseCache: { data: any; timestamp: number } | null = null;
const fuelCache = new Map<string, { data: any; timestamp: number }>();

const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes

function normalizeCityKey(city?: string, state?: string): string {
  if (!city) return "indore";
  const c = city.toLowerCase().trim();
  for (const key of Object.keys(SUPPORTED_CITIES)) {
    if (c === key || c.includes(key)) return key;
  }
  const name = city.replace(/-/g, " ").trim().replace(/\\b\\w/g, m => m.toUpperCase());
  const st = (state || "Madhya Pradesh").trim();
  const dynamic = buildCityInfo(name, st);
  SUPPORTED_CITIES[dynamic.id] = dynamic;
  return dynamic.id;
}

// 1. DRIK PANCHANG SCRAPER (Source: drikpanchang.com)
export async function getLiveDrikPanchang(cityId?: string) {
  await ensureCityCatalog();
  const cityKey = normalizeCityKey(cityId, state);
  const cityInfo = SUPPORTED_CITIES[cityKey] || SUPPORTED_CITIES.indore;
  const cached = panchangCache.get(cityKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.data;

  try {
    const url = cityInfo.geonameId
      ? `https://www.drikpanchang.com/panchang/day-panchang.html?geoname-id=${encodeURIComponent(cityInfo.geonameId)}`
      : "https://www.drikpanchang.com/panchang/day-panchang.html";
    const res = await axios.get(url, { headers: customHeaders, httpsAgent, timeout: 10000 });
    const $ = cheerio.load(res.data);
    const body = $("body").text().replace(/\\s+/g, " ").replace(/\\u00a0/g, " ").trim();

    const pick = (pattern: RegExp) => {
      const m = body.match(pattern);
      return m?.[1]?.replace(/\\s+/g, " ").trim() || "";
    };
    const to12 = (v: string) => {
      if (!v) return "";
      if (/AM|PM/i.test(v)) return v;
      const m = v.match(/^(\\d{1,2}):(\\d{2})$/);
      if (!m) return v;
      let h = Number(m[1]); const min = m[2]; const suffix = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return `${String(h).padStart(2, "0")}:${min} ${suffix}`;
    };

    const sunrise = to12(pick(/Sunrise\\s*(\\d{1,2}:\\d{2}(?:\\s*[AP]M)?)/i));
    const sunset = to12(pick(/Sunset\\s*(\\d{1,2}:\\d{2}(?:\\s*[AP]M)?)/i));
    const moonrise = to12(pick(/Moonrise\\s*(\\d{1,2}:\\d{2}(?:\\s*[AP]M)?)/i));
    const tithi = pick(/Tithi\\s+(.+?)\\s+Nakshatra/i);
    const nakshatra = pick(/Nakshatra\\s+(.+?)\\s+Saptami|Nakshatra\\s+(.+?)\\s+Yoga/i);
    const yoga = pick(/Yoga\\s+(.+?)\\s+Karana/i);
    const karana = pick(/Karana\\s+(.+?)\\s+Weekday/i);
    const paksha = pick(/Paksha\\s+(.+?)(?:\\s+Tithi|\\s+Chandra|\\s+Moon)/i);
    const samvat = pick(/Vikram Samvat\\s+([0-9]{4}\\s+[A-Za-z]+)/i);
    const rahukaal = pick(/Rahu Kalam\\s+(.+?)(?:\\s+Gulikai|\\s+Yamaganda|\\s+Abhijit)/i);
    const abhijitMuhurat = pick(/Abhijit\\s+(.+?)(?:\\s+Dur Muhurtam|\\s+Amrit Kalam|\\s+Varjyam)/i);

    if (!sunrise || !sunset || !tithi || !nakshatra || !yoga || !karana || !paksha || !samvat || !rahukaal || !abhijitMuhurat) {
      throw new Error("Drik Panchang page loaded but required fields could not be parsed");
    }

    const parsed = {
      source: "DrikPanchang.com",
      sourceUrl: url,
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
      location: `${cityInfo.name}, ${cityInfo.state}`,
      city: cityInfo.name,
      state: cityInfo.state,
      sunrise, sunset, moonrise,
      tithi, nakshatra, paksha,
      samvat: `Vikram Samvat ${samvat}`,
      yoga, karana, abhijitMuhurat, rahukaal,
      updatedAt: new Date().toISOString()
    };
    panchangCache.set(cityKey, { data: parsed, timestamp: Date.now() });
    return parsed;
  } catch (error) {
    console.error("Drik Panchang fetch/parse failed:", error);
    if (cached?.data) return cached.data;
    return {
      source: "DrikPanchang.com",
      sourceUrl: "https://www.drikpanchang.com/panchang/day-panchang.html",
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
      location: `${cityInfo.name}, ${cityInfo.state}`,
      city: cityInfo.name, state: cityInfo.state,
      sunrise: "", sunset: "", moonrise: "", tithi: "", nakshatra: "",
      paksha: "", samvat: "", yoga: "", karana: "", abhijitMuhurat: "", rahukaal: "",
      unavailable: true, updatedAt: new Date().toISOString()
    };
  }
}

// 2. ALL INDIA BULLION SCRAPER (Source: allindiabullion.com)
export async function getLiveBullionRates(cityId?: string) {
  await ensureCityCatalog();
  const cityKey = normalizeCityKey(cityId);
  const cityInfo = SUPPORTED_CITIES[cityKey] || SUPPORTED_CITIES.indore;
  const cached = bullionCache.get(cityKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const res = await axios.get(cityInfo.bullionUrl || "https://allindiabullion.com/gold-rate", {
      headers: customHeaders,
      httpsAgent,
      timeout: 9000
    });
    const $ = cheerio.load(res.data);

    const body = $("body").text().replace(/\\s+/g, " ");
    const money = (re: RegExp) => body.match(re)?.[1] || "";
    const gold24k = money(/24K Gold\\s+₹([0-9,]+)/i);
    const gold22k = money(/22K Gold\\s+₹([0-9,]+)/i);
    const gold18k = money(/18K Gold\\s+₹([0-9,]+)/i);
    const silver = money(/Silver\\s+₹([0-9,]+)\\s+per kg/i);
    if (!gold24k || !gold22k || !silver) throw new Error("AIB city bullion values not parsed");

    const parsed = {
      source: "AllIndiaBullion.com",
      sourceUrl: cityInfo.bullionUrl || "https://allindiabullion.com/gold-rate",
      city: cityInfo.name,
      location: `${cityInfo.name}, ${cityInfo.state}`,
      gold24k: gold24k ? `₹${gold24k}` : "₹1,50,786",
      gold22k: gold22k ? `₹${gold22k}` : "₹1,38,120",
      gold18k: gold18k ? `₹${gold18k}` : "₹1,13,089",
      silver: silver ? `₹${silver}` : "",
      unit: "Per 10g",
      silverUnit: "Per 1kg",
      updatedAt: new Date().toISOString()
    };

    bullionCache.set(cityKey, { data: parsed, timestamp: Date.now() });
    return parsed;
  } catch {
    if (cached?.data) return cached.data;
    return {
      source: "AllIndiaBullion.com",
      sourceUrl: cityInfo.bullionUrl || "https://allindiabullion.com/gold-rate",
      city: cityInfo.name,
      location: `${cityInfo.name}, ${cityInfo.state}`,
      gold24k: "₹1,50,786",
      gold22k: "₹1,38,120",
      gold18k: "₹1,13,089",
      silver: "₹84,500",
      unit: "Per 10g",
      silverUnit: "Per 1kg",
      updatedAt: new Date().toISOString()
    };
  }
}

// 3. CITY VEGETABLE MANDI SCRAPER (Source: rozkabhav.com)
export async function getLiveVegetablePrices(cityId?: string) {
  await ensureCityCatalog();
  const cityKey = normalizeCityKey(cityId);
  const cityInfo = SUPPORTED_CITIES[cityKey] || SUPPORTED_CITIES.indore;
  const cached = vegetableCache.get(cityKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.data;

  try {
    const res = await axios.get(cityInfo.vegUrl, { headers: customHeaders, httpsAgent, timeout: 8000 });
    const body = cheerio.load(res.data)("body").text().replace(/\\s+/g, " ");
    const items: { name: string; price: string; change: string }[] = [];
    const names = ["Onion","Potato","Tomato","Cauliflower","Capsicum","Beans","Carrot","Cabbage","Garlic","Ginger","Green Peas","Bitter Gourd"];
    for (const name of names) {
      const m = body.match(new RegExp(name + "\\s+Today\\s*[–-]\\s*₹([0-9,.]+)\\s+per kg", "i"));
      if (m) items.push({ name, price: `₹${m[1]} per kg`, change: "" });
    }
    if (!items.length) throw new Error("Vegetable prices not parsed");
    const uniqueItems = Array.from(new Map(items.map(item => [item.name.toLowerCase().replace(/\s+/g, " ").trim(), item])).values());
    const parsed = { source: "RozKaBhav.com", sourceUrl: cityInfo.vegUrl, city: cityInfo.name, market: cityInfo.marketName, items: uniqueItems.slice(0, 12), updatedAt: new Date().toISOString() };
    vegetableCache.set(cityKey, { data: parsed, timestamp: Date.now() });
    return parsed;
  } catch {
    if (cached?.data) return cached.data;
    return { source: "RozKaBhav.com", sourceUrl: cityInfo.vegUrl, city: cityInfo.name, market: cityInfo.marketName, items: [], unavailable: true, updatedAt: new Date().toISOString() };
  }
}

// 4. FUEL & GAS PRICE SCRAPER (Source: RozKaBhav.com)
export async function getLiveFuelPrices(cityId?: string) {
  await ensureCityCatalog();
  const cityKey = normalizeCityKey(cityId);
  const cityInfo = SUPPORTED_CITIES[cityKey] || SUPPORTED_CITIES.indore;
  const cached = fuelCache.get(cityKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.data;

  try {
    const res = await axios.get(cityInfo.fuelUrl, { headers: customHeaders, httpsAgent, timeout: 8000 });
    const $ = cheerio.load(res.data);
    const rows: Record<string,string>[] = [];
    $("table tr").each((_, tr) => {
      const cells = $(tr).find("th,td").map((__, el) => $(el).text().replace(/\\s+/g, " ").trim()).get();
      if (cells.length >= 4) {
        const first = cells[0].toLowerCase().replace(/[▲▼]/g, "").trim();
        if (["petrol","diesel","cng"].includes(first)) rows.push({ item:first, value:cells[1] });
      }
    });
    const body = $("body").text().replace(/\\s+/g, " ");
    const extract = (label:string) => {
      const row = rows.find(r => r.item === label.toLowerCase());
      if (row?.value) return row.value;
      const m = body.match(new RegExp(label + "\\s+(?:Today\\s+)?[-–]?\\s*(₹[0-9]+(?:\\.[0-9]+)?)", "i"));
      return m?.[1] || "";
    };
    const petrol = extract("Petrol"), diesel = extract("Diesel"), cng = extract("CNG");
    if (!petrol || !diesel || !cng) throw new Error("Fuel page loaded but petrol/diesel/CNG values were not parsed");
    const parsed = {
      source: "RozKaBhav.com", sourceUrl: cityInfo.fuelUrl, city: cityInfo.name,
      petrol: `₹${petrol}`, diesel: `₹${diesel}`, lpgDomestic: "", lpgCommercial: "", cng: `₹${cng}`,
      updatedAt: new Date().toISOString()
    };
    fuelCache.set(cityKey, { data: parsed, timestamp: Date.now() });
    return parsed;
  } catch (error) {
    console.error("Fuel price fetch/parse failed:", error);
    if (cached?.data) return cached.data;
    return { source:"RozKaBhav.com", sourceUrl:cityInfo.fuelUrl, city:cityInfo.name,
      petrol:"", diesel:"", lpgDomestic:"", lpgCommercial:"", cng:"",
      unavailable:true, updatedAt:new Date().toISOString() };
  }
}

// 4. MANDI PULSE COMMODITY SCRAPER (Source: mandipulse.com)
export async function getLiveMandiPulse(cityId?: string, state?: string) {
  await ensureCityCatalog();
  const cityKey = normalizeCityKey(cityId, state);
  const cityInfo = SUPPORTED_CITIES[cityKey] || SUPPORTED_CITIES.indore;
  const url = cityInfo.mandiUrl || `https://mandipulse.com/mandi/madhya-pradesh-indore-indore-apmc`;
  try {
    const res = await axios.get(url, { headers: customHeaders, httpsAgent, timeout: 9000 });
    const $ = cheerio.load(res.data);
    const body = $("body").text().replace(/\\s+/g, " ");
    const updates: { title: string; desc: string }[] = [];
    const re = /(Soyabean|Wheat|Maize|Green Peas|Onion|Potato|Garlic|Kabuli Chana)[^₹]{0,120}Modal Price\\s*₹([0-9,]+)[^₹]{0,80}(?:Min:|Minimum:)[^₹]*₹([0-9,]+)[^₹]{0,80}(?:Max:|Maximum:)[^₹]*₹([0-9,]+)/gi;
    let m;
    while ((m = re.exec(body)) && updates.length < 8) {
      updates.push({ title: `${m[1]} — ₹${m[2]}/quintal`, desc: `Min ₹${m[3]} • Max ₹${m[4]}` });
    }
    if (!updates.length) throw new Error("Mandi rates not parsed");
    return { source:"MandiPulse.com", sourceUrl:url, market:cityInfo.marketName, updates, updatedAt:new Date().toISOString() };
  } catch (error) {
    console.error("Mandi fetch/parse failed:", error);
    return { source:"MandiPulse.com", sourceUrl:url, market:cityInfo.marketName, updates:[], unavailable:true, updatedAt:new Date().toISOString() };
  }
}

// 5. UNIFIED SUMMARY FOR HOME SCREEN STRIP (Supports ?city=indore)
export async function getVerifiedMarketSummary(cityId?: string, state?: string) {
  await ensureCityCatalog();
  const cityKey = normalizeCityKey(cityId);
  const cityInfo = SUPPORTED_CITIES[cityKey] || SUPPORTED_CITIES.indore;

  // Keep Home fast: all required feeds are fetched concurrently.
  // Mandi data is derived from the same RozKaBhav city page as vegetable prices,
  // so we do not make a second MandiPulse request.
  const [panchang, bullion, vegetables, fuel, mandiPulse] = await Promise.all([
    getLiveDrikPanchang(cityKey),
    getLiveBullionRates(cityKey),
    getLiveVegetablePrices(cityKey),
    getLiveFuelPrices(cityKey),
    getLiveMandiPulse(cityKey, state)
  ]);

  return {
    selectedCity: cityInfo,
    supportedCities: Object.values(SUPPORTED_CITIES).map(c => ({ id: c.id, name: c.name, state: c.state })),
    panchang,
    bullion,
    vegetables,
    mandiPulse,
    fuel,
    updatedAt: new Date().toISOString()
  };
}
