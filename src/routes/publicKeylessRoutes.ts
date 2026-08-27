import express from "express";
import axios from "axios";
import Parser from "rss-parser";
import { apiCache } from "../lib/apiCache.js";

import https from "https";

const router = express.Router();
const rss = new Parser();
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
  return await rss.parseString(response.data);
}

const get = (key: string, ttl: number) => { const x = apiCache.get(key); return x && Date.now() - x.timestamp < ttl ? x.data : null; };
const put = (key: string, data: unknown) => apiCache.set(key, { data, timestamp: Date.now() });
const cleanText = (value = "") => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();

router.get("/api/public/weather", async (req, res) => {
  try {
    const lat = Number(req.query.lat), lon = Number(req.query.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return res.status(400).json({ success:false,error:"Invalid coordinates" });
    const key = `weather_${lat.toFixed(3)}_${lon.toFixed(3)}`; const cached = get(key, 900000); if (cached) return res.json({success:true,data:cached});
    const { data } = await axios.get("https://api.open-meteo.com/v1/forecast", { params:{ latitude:lat, longitude:lon, current:"temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m", daily:"temperature_2m_max,temperature_2m_min,precipitation_sum", timezone:"auto" }, timeout:8000 }); put(key,data); return res.json({success:true,data});
  } catch { return res.status(503).json({success:false,error:"Weather temporarily unavailable"}); }
});

router.get("/api/public/forex", async (_req,res) => { try { const c=get("forex_inr",3600000); if(c) return res.json({success:true,data:c}); const {data}=await axios.get("https://api.frankfurter.app/latest?to=INR",{timeout:8000}); put("forex_inr",data); return res.json({success:true,data}); } catch { return res.status(503).json({success:false,error:"Exchange rates temporarily unavailable"}); } });

router.get("/api/public/pib-news", async (_req, res) => {
  try {
    const c = get("pib_news_rss", 1800000);
    if (c) return res.json({ success: true, data: c });

    const pibFeed = await fetchRssFeed("https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3&reg=48");
    const data = (pibFeed.items || []).map(i => ({
      title: cleanText(i.title || ""),
      link: i.link,
      pubDate: i.pubDate || new Date().toISOString(),
      source: "PIB (प्रेस सूचना ब्यूरो)",
      description: cleanText(i.contentSnippet || i.content || "")
    }));
    put("pib_news_rss", data);
    return res.json({ success: true, data });
  } catch {
    return res.status(503).json({ success: false, error: "PIB news temporarily unavailable" });
  }
});

router.get("/api/public/news", async (_req,res) => {
  try {
    const c=get("india_news_rss",1800000);
    if(c) return res.json({success:true,data:c});

    let pibItems: any[] = [];
    try {
      const pibFeed = await fetchRssFeed("https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3&reg=48");
      pibItems = (pibFeed.items || []).slice(0, 15).map(i => ({
        title: cleanText(i.title || ""),
        link: i.link,
        pubDate: i.pubDate || new Date().toISOString(),
        source: "PIB (प्रेस सूचना ब्यूरो)",
        description: cleanText(i.contentSnippet || i.content || ""),
        image_url: null
      }));
    } catch {}

    let aniItems: any[] = [];
    try {
      const aniFeed = await fetchRssFeed("https://www.aninews.in/rss/feed/category/national.xml");
      aniItems = (aniFeed.items || []).slice(0, 15).map(i => ({
        title: cleanText(i.title || ""),
        link: i.link,
        pubDate: i.pubDate || new Date().toISOString(),
        source: "ANI News",
        description: cleanText(i.contentSnippet || i.content || ""),
        image_url: null
      }));
    } catch {}

    const combined = [...pibItems, ...aniItems];
    const data = combined.length > 0 ? combined : pibItems;
    put("india_news_rss", data);
    return res.json({ success: true, data });
  } catch {
    return res.status(503).json({ success: false, error: "News temporarily unavailable" });
  }
});

router.get("/api/public/jobs-feed", async (_req,res) => { try { const c=get("jobs_rss",3600000); if(c) return res.json({success:true,data:c}); const feed=await fetchRssFeed("https://news.google.com/rss/search?q=Sarkari+Naukri+India+Jobs&hl=en-IN&gl=IN&ceid=IN:en"); const data=feed.items.slice(0,20).map(i=>({title:i.title,link:i.link,pubDate:i.pubDate})); put("jobs_rss",data); return res.json({success:true,data}); } catch { return res.status(503).json({success:false,error:"Jobs feed temporarily unavailable"}); } });

router.get("/api/public/remote-jobs", async (_req,res) => { try { const {data}=await axios.get("https://jobicy.com/api/v2/remote-jobs?count=20&geo=india",{timeout:8000}); return res.json({success:true,data}); } catch { return res.status(503).json({success:false,error:"Remote jobs temporarily unavailable"}); } });

router.get("/api/public/nearby", async (req,res) => { try { const lat=Number(req.query.lat),lon=Number(req.query.lon),type=String(req.query.type||"police"); if(!Number.isFinite(lat)||!Number.isFinite(lon)||!["police","veterinary"].includes(type)) return res.status(400).json({success:false,error:"Invalid nearby search"}); const key=`nearby_${type}_${lat.toFixed(3)}_${lon.toFixed(3)}`; const c=get(key,86400000); if(c) return res.json({success:true,data:c}); const tag=type==="police"?"amenity=police":"amenity=veterinary"; const q=`[out:json][timeout:10];node[${tag}](around:5000,${lat},${lon});out;`; const {data}=await axios.get("https://overpass-api.de/api/interpreter",{params:{data:q},timeout:12000}); const locations=(data.elements||[]).map((e:any)=>({name:e.tags?.name||`Unnamed ${type}`,lat:e.lat,lon:e.lon})); put(key,locations); return res.json({success:true,data:locations}); } catch { return res.status(503).json({success:false,error:"Nearby search temporarily unavailable"}); } });

router.get("/api/public/sachet-alerts", async (_req, res) => {
  try {
    const c = get("sachet_alerts_rss", 900000);
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
    put("sachet_alerts_rss", data);
    return res.json({ success: true, data });
  } catch {
    return res.status(503).json({ success: false, error: "SACHET alerts temporarily unavailable" });
  }
});

router.get("/api/public/disaster-alerts", async (_req,res) => {
  try {
    const c=get("disaster_rss",900000);
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
      put("disaster_rss", sachetItems);
      return res.json({ success: true, data: sachetItems });
    }

    const feed = await fetchRssFeed("https://www.gdacs.org/xml/rss.xml");
    const data = feed.items.filter(i=>`${i.title||""} ${i.contentSnippet||""}`.toLowerCase().includes("india")).slice(0,30).map(i=>({id:i.guid||i.link,titleEn:i.title,titleHi:i.title,severity:"Alert",source:"GDACS",link:i.link}));
    put("disaster_rss",data);
    return res.json({success:true,data});
  } catch {
    return res.status(503).json({success:false,error:"Disaster alerts temporarily unavailable"});
  }
});

export default router;
