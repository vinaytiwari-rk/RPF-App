import express from "express";
import axios from "axios";
import Parser from "rss-parser";
import { load } from "cheerio";
import { apiCache } from "../lib/apiCache.js";
import https from "https";

const router = express.Router();
const rssParser = new Parser();
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const customHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
};

async function fetchRssFeed(url: string) {
  const response = await axios.get(url, {
    headers: customHeaders,
    httpsAgent,
    timeout: 10000,
    responseType: "text"
  });
  return await rssParser.parseString(response.data);
}

const cache = (key: string, ttl: number) => { const item = apiCache.get(key); return item && Date.now() - item.timestamp < ttl ? item.data : null; };
const save = (key: string, data: unknown) => apiCache.set(key, { data, timestamp: Date.now() });
const cleanText = (value = "") => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();

router.get("/api/public/weather", async (req,res) => { try { const lat=Number(req.query.lat),lon=Number(req.query.lon); if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180) return res.status(400).json({success:false,error:"Invalid coordinates"}); const key=`weather_${lat.toFixed(3)}_${lon.toFixed(3)}`; const c=cache(key,900000); if(c) return res.json({success:true,data:c}); const {data}=await axios.get("https://api.open-meteo.com/v1/forecast",{params:{latitude:lat,longitude:lon,current:"temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",daily:"temperature_2m_max,temperature_2m_min,precipitation_sum",timezone:"auto"},timeout:8000}); save(key,data); return res.json({success:true,data}); } catch { return res.status(503).json({success:false,error:"Weather temporarily unavailable"}); } });
router.get("/api/public/forex", async (_req,res) => { try { const c=cache("forex_inr",3600000); if(c) return res.json({success:true,data:c}); const {data}=await axios.get("https://api.frankfurter.app/latest?to=INR",{timeout:8000}); save("forex_inr",data); return res.json({success:true,data}); } catch { return res.status(503).json({success:false,error:"Exchange rates temporarily unavailable"}); } });

router.get("/api/public/pib-news", async (_req, res) => {
  try {
    const c = cache("pib_news_rss", 1800000);
    if (c) return res.json({ success: true, data: c });

    const pibFeed = await fetchRssFeed("https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3&reg=48");
    const data = (pibFeed.items || []).map(i => ({
      title: cleanText(i.title || ""),
      link: i.link,
      pubDate: i.pubDate || new Date().toISOString(),
      source: "PIB (प्रेस सूचना ब्यूरो)",
      description: cleanText(i.contentSnippet || i.content || "")
    }));
    save("pib_news_rss", data);
    return res.json({ success: true, data });
  } catch {
    return res.status(503).json({ success: false, error: "PIB news temporarily unavailable" });
  }
});

// TOP MARQUEE: National & International News (PIB + DD News + Google National + NDTV/TOI World + Google World)
const fetchNationalAndWorldNews = async () => {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  };

  const nationalItems: string[] = [];
  const worldItems: string[] = [];

  // 1. PIB Press Releases (Hindi)
  try {
    const { data: html } = await axios.get("https://www.pib.gov.in/Allrel.aspx?reg=48&lang=1", { headers, timeout: 8000 });
    const $ = load(html);
    $("a").each((_, el) => {
      const h = $(el).attr("href") || "";
      const t = cleanText($(el).text());
      const titleAttr = $(el).attr("title") || "";
      let fullTitle = titleAttr.length > t.length ? cleanText(titleAttr) : t;
      if ((h.includes("PRID") || h.includes("Release") || h.includes("PressReleaseDetail")) && fullTitle.length > 15) {
        if (!nationalItems.includes(fullTitle) && !/^(सब्सक्राइब|subscribe|विज्ञप्ति)/i.test(fullTitle)) {
          nationalItems.push(fullTitle);
        }
      }
    });
  } catch {}

  // 2. Google News National Topic (Hindi)
  try {
    const feed = await fetchRssFeed("https://news.google.com/rss/headlines/section/topic/NATION?hl=hi&gl=IN&ceid=IN:hi");
    for (const item of feed.items || []) {
      const t = cleanText(item.title || "").replace(/\s*-\s*[^-]+$/i, "");
      if (t.length > 15 && !nationalItems.includes(t)) {
        nationalItems.push(t);
      }
    }
  } catch {}

  // 3. DD News (National)
  try {
    const { data: html } = await axios.get("https://ddnews.gov.in/en/category/national/", { headers, timeout: 8000 });
    const $ = load(html);
    $("h2 a, h3 a, h4 a, .post-title a, article a").each((_, el) => {
      let t = cleanText($(el).text());
      if (t.length > 20 && !nationalItems.includes(t) && !/^(read more|national|latest|home)$/i.test(t)) {
        nationalItems.push(t);
      }
    });
  } catch {}

  // 4. Google News World Topic (Hindi)
  try {
    const feed = await fetchRssFeed("https://news.google.com/rss/headlines/section/topic/WORLD?hl=hi&gl=IN&ceid=IN:hi");
    for (const item of feed.items || []) {
      const t = cleanText(item.title || "").replace(/\s*-\s*[^-]+$/i, "");
      if (t.length > 15 && !worldItems.includes(t)) {
        worldItems.push(t);
      }
    }
  } catch {}

  // 5. NDTV World RSS
  try {
    const feed = await fetchRssFeed("https://feeds.feedburner.com/ndtvnews-world-news");
    for (const item of feed.items || []) {
      const t = cleanText(item.title || "");
      if (t.length > 12 && !worldItems.includes(t)) {
        worldItems.push(t);
      }
    }
  } catch {}

  // 6. TOI World RSS
  try {
    const feed = await fetchRssFeed("https://timesofindia.indiatimes.com/rssfeeds/296589292.cms");
    for (const item of feed.items || []) {
      const t = cleanText(item.title || "");
      if (t.length > 12 && !worldItems.includes(t)) {
        worldItems.push(t);
      }
    }
  } catch {}

  // Interleave National and International News
  const combined: string[] = [];
  const maxLen = Math.max(nationalItems.length, worldItems.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < nationalItems.length) combined.push(nationalItems[i]);
    if (i < worldItems.length) combined.push(worldItems[i]);
  }

  return { national: nationalItems, world: worldItems, combined };
};

// BOTTOM MARQUEE: Madhya Pradesh official + regional RSS.
// Primary: MPInfo Hindi RSS. Secondary: Google News MP RSS.
const fetchMadhyaPradeshNews = async () => {
  const mpItems: string[] = [];

  try {
    const feed = await fetchRssFeed("https://mpinfo.org/RSSFeed/RSSFeed_News.xml");
    for (const item of feed.items || []) {
      const t = cleanText(item.title || "");
      if (t.length > 12 && !mpItems.includes(t)) mpItems.push(t);
    }
  } catch {}

  try {
    const feed = await fetchRssFeed("https://news.google.com/rss/search?q=Madhya+Pradesh&hl=hi&gl=IN&ceid=IN:hi");
    for (const item of feed.items || []) {
      const t = cleanText(item.title || "").replace(/\s*-\s*[^-]+$/i, "");
      if (t.length > 15 && !mpItems.includes(t)) mpItems.push(t);
    }
  } catch {}

  return mpItems.slice(0, 40);
};

const getUnifiedLiveFeed = async () => {
  const cached = cache("unified_live_feed", 60000);
  if (cached) return cached;

  const [nationalAndWorldRes, mpRes] = await Promise.all([
    fetchNationalAndWorldNews(),
    fetchMadhyaPradeshNews()
  ]);

  const payload = {
    nationalAndWorldNews: nationalAndWorldRes.combined,
    nationalNews: nationalAndWorldRes.national,
    worldNews: nationalAndWorldRes.world,
    mpNews: mpRes,
    marquee1: nationalAndWorldRes.combined, // Top: National & International News (Dark Saffron)
    marquee2: mpRes,                        // Bottom: Madhya Pradesh News (Green)
    marquee3: nationalAndWorldRes.world,
    // backward compatibility
    governmentNews: { pib: nationalAndWorldRes.national, mpInfo: mpRes },
    emergencyAlerts: { sachet: [] },
    pib: nationalAndWorldRes.combined,
    sachet: mpRes,
    news: nationalAndWorldRes.world
  };

  save("unified_live_feed", payload);
  return payload;
};

router.get("/api/public/live-feed", async (_req, res) => {
  try {
    const data = await getUnifiedLiveFeed();
    return res.json({ success: true, data });
  } catch {
    return res.status(503).json({ success: false, error: "Live feed temporarily unavailable" });
  }
});

router.get("/api/public/news", async (_req, res) => {
  try {
    const data = await getUnifiedLiveFeed();
    return res.json({ success: true, data });
  } catch {
    return res.status(503).json({ success: false, error: "News temporarily unavailable" });
  }
});

router.get("/api/public/quote-of-day", async (_req, res) => {
  try {
    let quotesList: Array<{ quote: string; author: string; link?: string }> = cache("quote_feed_list", 1800000) as any;
    if (!quotesList || !quotesList.length) {
      quotesList = [];
      const feeds = [
        "https://www.brainyquote.com/link/quotebr.rss",
        "http://feeds.feedburner.com/azquotes/quoteoftheday",
        "https://feeds.feedburner.com/quotationspage/qotd"
      ];
      for (const url of feeds) {
        try {
          const feed = await fetchRssFeed(url);
          for (const item of feed.items || []) {
            const author = cleanText(item.title || item.creator || item.author || "Daily Thought");
            let quote = cleanText(item.contentSnippet || item.content || item.description || "");
            quote = quote.replace(/^["'“”«»\s]+|["'“”«»\s]+$/g, "");
            if (quote && quote.length >= 10) {
              quotesList.push({ quote, author, link: item.link || "" });
            }
          }
        } catch {}
      }
      if (quotesList.length) {
        save("quote_feed_list", quotesList);
      }
    }

    if (quotesList && quotesList.length) {
      const selected = quotesList[Math.floor(Math.random() * quotesList.length)];
      return res.json({
        success: true,
        data: selected
      });
    }
    return res.status(503).json({ success: false, error: "Quote temporarily unavailable" });
  } catch {
    return res.status(503).json({ success: false, error: "Quote temporarily unavailable" });
  }
});
router.get("/api/public/calendar/panchang", async (_req,res) => { try { const c=cache("panchang_rss",3600000); if(c) return res.json({success:true,data:c}); const feed=await fetchRssFeed("https://hinducalendar.app/feed/panchang.xml"); const data=feed.items.map(i=>({title:i.title,description:i.contentSnippet||i.content||"",pubDate:i.pubDate,category:i.categories?.[0]||""})); save("panchang_rss",data); return res.json({success:true,data}); } catch { return res.status(503).json({success:false,error:"Panchang temporarily unavailable"}); } });
router.get("/api/public/calendar/highlights", async (_req,res) => { try { const c=cache("calendar_highlights",3600000); if(c) return res.json({success:true,data:c}); const feed=await fetchRssFeed("https://hinducalendar.app/feed/highlights.xml"); const data=feed.items.map(i=>({title:i.title,description:i.contentSnippet||i.content||"",pubDate:i.pubDate})); save("calendar_highlights",data); return res.json({success:true,data}); } catch { return res.status(503).json({success:false,error:"Calendar highlights temporarily unavailable"}); } });
router.get("/api/public/calendar/digest", async (_req,res) => { try { const {data}=await axios.get("https://hinducalendar.app/feed/digest.txt",{responseType:"text",timeout:8000}); return res.type("text/plain").send(data); } catch { return res.status(503).send("Digest temporarily unavailable"); } });
router.get("/api/public/jobs-feed", async (_req,res) => { try { const c=cache("jobs_rss",3600000); if(c) return res.json({success:true,data:c}); const feed=await fetchRssFeed("https://news.google.com/rss/search?q=Sarkari+Naukri+India+Jobs&hl=en-IN&gl=IN&ceid=IN:en"); const data=feed.items.slice(0,20).map(i=>({title:i.title,link:i.link,pubDate:i.pubDate})); save("jobs_rss",data); return res.json({success:true,data}); } catch { return res.status(503).json({success:false,error:"Jobs feed temporarily unavailable"}); } });
router.get("/api/public/remote-jobs", async (_req,res) => { try { const {data}=await axios.get("https://jobicy.com/api/v2/remote-jobs?count=20&geo=india",{timeout:8000}); return res.json({success:true,data}); } catch { return res.status(503).json({success:false,error:"Remote jobs temporarily unavailable"}); } });
router.get("/api/public/nearby", async (req,res) => { try { const lat=Number(req.query.lat),lon=Number(req.query.lon),type=String(req.query.type||"police"); if(!Number.isFinite(lat)||!Number.isFinite(lon)||!["police","veterinary"].includes(type)) return res.status(400).json({success:false,error:"Invalid nearby search"}); const key=`nearby_${type}_${lat.toFixed(3)}_${lon.toFixed(3)}`; const c=cache(key,86400000); if(c) return res.json({success:true,data:c}); const tag=type==="police"?"amenity=police":"amenity=veterinary"; const q=`[out:json][timeout:10];node[${tag}](around:5000,${lat},${lon});out;`; const {data}=await axios.get("https://overpass-api.de/api/interpreter",{params:{data:q},timeout:12000}); const locations=(data.elements||[]).map((e:any)=>({name:e.tags?.name||`Unnamed ${type}`,lat:e.lat,lon:e.lon})); save(key,locations); return res.json({success:true,data:locations}); } catch { return res.status(503).json({success:false,error:"Nearby search temporarily unavailable"}); } });

router.get("/api/public/sachet-alerts", async (_req, res) => {
  try {
    const c = cache("sachet_alerts_rss", 900000);
    if (c) return res.json({ success: true, data: c });

    const sachetFeed = await fetchRssFeed("https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml");
    const data = (sachetFeed.items || []).map(i => ({
      id: i.guid || i.link,
      titleEn: cleanText(i.title || ""),
      titleHi: cleanText(i.title || ""),
      severity: i.categories?.[0] || "Alert",
      source: i.creator || i.author || "NDMA SACHET",
      link: i.link,
      pubDate: i.pubDate
    }));
    save("sachet_alerts_rss", data);
    return res.json({ success: true, data });
  } catch {
    return res.status(503).json({ success: false, error: "SACHET alerts temporarily unavailable" });
  }
});

router.get("/api/public/disaster-alerts", async (_req,res) => {
  try {
    const c=cache("disaster_rss",900000);
    if(c) return res.json({success:true,data:c});

    let sachetItems: any[] = [];
    try {
      const sachetFeed = await fetchRssFeed("https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml");
      sachetItems = (sachetFeed.items || []).map(i => ({
        id: i.guid || i.link,
        titleEn: cleanText(i.title || ""),
        titleHi: cleanText(i.title || ""),
        severity: i.categories?.[0] || "Alert",
        source: i.creator || i.author || "NDMA SACHET",
        link: i.link,
        pubDate: i.pubDate
      }));
    } catch (e) {
      console.warn("SACHET RSS fetch fallback to GDACS:", e);
    }

    if (sachetItems.length > 0) {
      save("disaster_rss", sachetItems);
      return res.json({ success: true, data: sachetItems });
    }

    const feed = await fetchRssFeed("https://www.gdacs.org/xml/rss.xml");
    const data = feed.items.filter(i=>`${i.title||""} ${i.contentSnippet||""}`.toLowerCase().includes("india")).slice(0,30).map(i=>({id:i.guid||i.link,titleEn:i.title,titleHi:i.title,severity:"Alert",source:"GDACS",link:i.link}));
    save("disaster_rss",data);
    return res.json({success:true,data});
  } catch {
    return res.status(503).json({success:false,error:"Disaster alerts temporarily unavailable"});
  }
});

type FeedState = { etag?: string; items: string[]; updatedAt: string };
const officialState: Record<"pib" | "sachet", FeedState> = {
  pib: { items: [], updatedAt: "" },
  sachet: { items: [], updatedAt: "" }
};
const officialUrls = {
  pib: "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3&reg=48",
  sachet: "https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml"
};

async function refreshOfficialFeed(kind: "pib" | "sachet") {
  const state = officialState[kind];
  if (kind === "pib") {
    const aniUrls = [
      "https://aninews.in/rss/feed/category/national.xml",
      "https://aninews.in/rss/feed/category/national/politics.xml",
      "https://aninews.in/rss/feed/category/business.xml",
      "https://aninews.in/rss/feed/category/health.xml",
      "https://aninews.in/rss/feed/category/world.xml",
      "https://aninews.in/rss/feed/category/sports/others.xml",
      "https://aninews.in/rss/feed/category/national/features.xml"
    ];
    for (const url of aniUrls) {
      try {
        const parsed = await fetchRssFeed(url);
        const items = (parsed.items || []).map(item => cleanText(item.title || item.contentSnippet || item.content || "")).filter(Boolean).slice(0, 20);
        if (items.length > 0) {
          state.items = items;
          state.updatedAt = new Date().toISOString();
          return state.items;
        }
      } catch {}
    }

    const pibUrls = [
      "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3&reg=48",
      "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3",
      "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3&reg=48",
      "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1"
    ];
    for (const url of pibUrls) {
      try {
        const parsed = await fetchRssFeed(url);
        const items = (parsed.items || []).map(item => cleanText(item.title || item.contentSnippet || item.content || "")).filter(Boolean).slice(0, 20);
        if (items.length > 0) {
          state.items = items;
          state.updatedAt = new Date().toISOString();
          return state.items;
        }
      } catch {}
    }

    const gnewsUrls = [
      "https://news.google.com/rss?hl=hi&gl=IN&ceid=IN:hi",
      "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en"
    ];
    for (const url of gnewsUrls) {
      try {
        const parsed = await fetchRssFeed(url);
        const items = (parsed.items || []).map(item => cleanText(item.title || item.contentSnippet || item.content || "")).filter(Boolean).slice(0, 20);
        if (items.length > 0) {
          state.items = items;
          state.updatedAt = new Date().toISOString();
          return state.items;
        }
      } catch {}
    }
  } else {
    const urls = [
      "https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml",
      "https://www.gdacs.org/xml/rss.xml"
    ];
    for (const url of urls) {
      try {
        const parsed = await fetchRssFeed(url);
        const items = (parsed.items || []).map(item => cleanText(item.title || item.contentSnippet || item.content || "")).filter(Boolean).slice(0, 20);
        if (items.length > 0) {
          state.items = items;
          state.updatedAt = new Date().toISOString();
          return state.items;
        }
      } catch (err) {
        console.warn(`Fallback error fetching SACHET feed (${url}):`, err);
      }
    }
  }
  return state.items;
}

router.get("/api/public/live-feeds", async (_req,res) => {
  const cached = cache("official_live_feeds", 60000);
  if (cached) return res.set("Cache-Control", "no-store").json({ success: true, data: cached });
  const [pibResult, sachetResult] = await Promise.allSettled([
    refreshOfficialFeed("pib"),
    refreshOfficialFeed("sachet")
  ]);
  const pib = pibResult.status === "fulfilled" && pibResult.value.length ? pibResult.value : officialState.pib.items;
  const sachet = sachetResult.status === "fulfilled" && sachetResult.value.length ? sachetResult.value : officialState.sachet.items;
  const data = {
    pib: pib.length ? pib : ["Official government updates are temporarily unavailable."],
    sachet: sachet.length ? sachet : ["No active public alert is currently available."],
    updatedAt: new Date().toISOString(),
    sources: {
      pib: pibResult.status === "fulfilled" ? "live" : officialState.pib.items.length ? "cached" : "unavailable",
      sachet: sachetResult.status === "fulfilled" ? "live" : officialState.sachet.items.length ? "cached" : "unavailable"
    }
  };
  save("official_live_feeds", data);
  return res.set("Cache-Control", "no-store").json({ success: true, data });
});

export default router;