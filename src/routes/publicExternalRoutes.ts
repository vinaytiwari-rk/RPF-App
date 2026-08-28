import express from "express";
import axios from "axios";
import Parser from "rss-parser";
import * as cheerio from "cheerio";
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

const fetchNewsAgenciesHtml = async () => {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  };

  const aniItems: any[] = [];
  const uniItems: any[] = [];
  const iansItems: any[] = [];

  // 1. ANI
  try {
    const { data: html } = await axios.get("https://www.aninews.in/latest-news/", { headers, timeout: 8000 });
    const $ = cheerio.load(html);
    $("figcaption h6.title, .story-details h6.title, a h6.title, h6.title, .news-card h6").each((_, el) => {
      let t = $(el).text().replace(/\s+/g, " ").trim();
      t = cleanText(t);
      if (t.length > 15 && !aniItems.some((x) => x.title === t) && !/^(read more|latest news|photos|videos|national|world|business)$/i.test(t)) {
        aniItems.push({ title: t, source: "ANI", url: "https://www.aninews.in/latest-news/", publishedAt: new Date().toISOString() });
      }
    });
  } catch {}

  // 2. UNI
  try {
    const { data: html } = await axios.get("https://www.uniindia.com/home.aspx", { headers, timeout: 8000 });
    const $ = cheerio.load(html);
    $("a").each((_, el) => {
      const href = $(el).attr("href") || "";
      let t = $(el).text().replace(/\s+/g, " ").trim();
      t = cleanText(t);
      if ((href.includes("news") || href.includes("story") || href.includes(".html")) && t.length > 20) {
        if (!uniItems.some((x) => x.title === t) && !/^(home|national|sports|business|world|entertainment|states|about us|contact us|privacy policy)$/i.test(t)) {
          uniItems.push({ title: t, source: "UNI", url: "https://www.uniindia.com/home.aspx", publishedAt: new Date().toISOString() });
        }
      }
    });
  } catch {}

  // 3. IANS
  try {
    const { data: html } = await axios.get("https://ianslive.in/", { headers, timeout: 8000 });
    const $ = cheerio.load(html);
    $("a, h2, h3, h4").each((_, el) => {
      let t = $(el).text().replace(/\s+/g, " ").trim();
      t = cleanText(t);
      if (t.length > 22 && !iansItems.some((x) => x.title === t) && !/^(read more|latest|ians|privacy|terms|about us|contact us|copyright)$/i.test(t) && !/^[A-Za-z]+\s+\d{1,2},\s+\d{4}/.test(t)) {
        iansItems.push({ title: t, source: "IANS", url: "https://ianslive.in/", publishedAt: new Date().toISOString() });
      }
    });
  } catch {}

  return { ani: aniItems, uni: uniItems, ians: iansItems };
};

const fetchPublicUpdatesHtml = async () => {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  };

  const pibItems: any[] = [];
  const ddItems: any[] = [];

  // 1. PIB
  try {
    const { data: html } = await axios.get("https://pib.gov.in/indexd.aspx", { headers, timeout: 8000 });
    const $ = cheerio.load(html);
    $("a").each((_, el) => {
      const h = $(el).attr("href") || "";
      const t = $(el).text().replace(/\s+/g, " ").trim();
      const titleAttr = $(el).attr("title") || "";
      let fullTitle = cleanText(titleAttr.length > t.length ? titleAttr : t);
      fullTitle = fullTitle.replace(/(\.\.\.|…|\s+\.)$/g, "").trim();
      if ((h.includes("PRID") || h.includes("Release") || h.includes("PressReleaseDetail")) && fullTitle.length > 15) {
        if (!pibItems.some((x) => x.title === fullTitle) && !/^(വിജ്ഞപ്തി|सब्सक्राइब|subscribe)/i.test(fullTitle)) {
          const fullLink = h.startsWith("http") ? h : `https://pib.gov.in/${h.replace(/^\//, "")}`;
          pibItems.push({ title: fullTitle, source: "PIB", url: fullLink, publishedAt: new Date().toISOString() });
        }
      }
    });
  } catch {}

  // 2. DD India
  try {
    const { data: html } = await axios.get("https://ddindia.co.in/category/india/", { headers, timeout: 8000 });
    const $ = cheerio.load(html);
    $("h2.entry-title a, h3.entry-title a, article a, .post-title a").each((_, el) => {
      let t = $(el).text().replace(/\s+/g, " ").trim();
      t = cleanText(t);
      if (t.length > 20 && !ddItems.some((x) => x.title === t) && !/^(read more|latest|india|world)$/i.test(t)) {
        const link = $(el).attr("href") || "https://ddindia.co.in/category/india/";
        ddItems.push({ title: t, source: "DD India", url: link, publishedAt: new Date().toISOString() });
      }
    });
  } catch {}

  return { pib: pibItems, ddIndia: ddItems };
};

const getUnifiedLiveFeed = async () => {
  const cached = cache("unified_live_feed", 120000);
  if (cached) return cached;

  const [newsRes, publicRes] = await Promise.all([fetchNewsAgenciesHtml(), fetchPublicUpdatesHtml()]);

  // Marquee 1: Merged ANI + IANS + UNI
  const marquee1Items: string[] = [];
  const maxNewsLen = Math.max(newsRes.ani.length, newsRes.ians.length, newsRes.uni.length);
  for (let i = 0; i < maxNewsLen; i++) {
    if (i < newsRes.ani.length) marquee1Items.push(newsRes.ani[i].title);
    if (i < newsRes.ians.length) marquee1Items.push(newsRes.ians[i].title);
    if (i < newsRes.uni.length) marquee1Items.push(newsRes.uni[i].title);
  }

  // Marquee 2: Merged PIB + DD India
  const marquee2Items: string[] = [];
  const maxPubLen = Math.max(publicRes.pib.length, publicRes.ddIndia.length);
  for (let i = 0; i < maxPubLen; i++) {
    if (i < publicRes.pib.length) marquee2Items.push(publicRes.pib[i].title);
    if (i < publicRes.ddIndia.length) marquee2Items.push(publicRes.ddIndia[i].title);
  }

  const payload = {
    news: newsRes,
    publicUpdates: publicRes,
    marquee1: marquee1Items,
    marquee2: marquee2Items,
    // Backwards compatibility legacy flat lists
    pib: marquee2Items,
    sachet: marquee1Items
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

router.get("/api/public/quote-of-day", async (_req,res) => { try { const c=cache("quote_of_day_v2",21600000); if(c) return res.json({success:true,data:c}); const feeds=["https://www.brainyquote.com/link/quotebr.rss","http://feeds.feedburner.com/azquotes/quoteoftheday"]; for(const url of feeds){ try { const feed=await fetchRssFeed(url); const item=feed.items[0]; if(!item) continue; const title=cleanText(item.title || ""); const body=cleanText(item.contentSnippet || item.content || item.description || ""); const explicitAuthor=cleanText(item.creator || item.author || ""); let quote=body; let author=explicitAuthor;
          if(!author && body && title && body !== title) author=title;
          if(!quote && title){ const parts=title.split(/\s[-–—|:]\s/); if(parts.length > 1){ author=author || parts[parts.length - 1].trim(); quote=parts.slice(0,-1).join(" - ").trim(); } else quote=title; }
          if(quote === title && /\s[-–—|:]\s/.test(title)){ const parts=title.split(/\s[-–—|:]\s/); quote=parts.slice(0,-1).join(" - ").trim(); author=author || parts[parts.length-1].trim(); }
          if(quote){ const data={quote,author:author || "",link:item.link || (url.includes("brainyquote") ? "https://www.brainyquote.com/quote_of_the_day" : "https://www.azquotes.com/quote_of_the_day.html")}; save("quote_of_day_v2",data); return res.json({success:true,data}); }
        } catch { /* try next provider */ } } return res.status(503).json({success:false,error:"Quote temporarily unavailable"}); } catch { return res.status(503).json({success:false,error:"Quote temporarily unavailable"}); } });
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