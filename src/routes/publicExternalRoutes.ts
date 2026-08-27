import express from "express";
import axios from "axios";
import Parser from "rss-parser";
import { apiCache } from "../lib/apiCache.js";

const router = express.Router();
const rssParser = new Parser();
const cache = (key: string, ttl: number) => { const item = apiCache.get(key); return item && Date.now() - item.timestamp < ttl ? item.data : null; };
const save = (key: string, data: unknown) => apiCache.set(key, { data, timestamp: Date.now() });
const cleanText = (value = "") => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();

router.get("/api/public/weather", async (req,res) => { try { const lat=Number(req.query.lat),lon=Number(req.query.lon); if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180) return res.status(400).json({success:false,error:"Invalid coordinates"}); const key=`weather_${lat.toFixed(3)}_${lon.toFixed(3)}`; const c=cache(key,900000); if(c) return res.json({success:true,data:c}); const {data}=await axios.get("https://api.open-meteo.com/v1/forecast",{params:{latitude:lat,longitude:lon,current:"temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",daily:"temperature_2m_max,temperature_2m_min,precipitation_sum",timezone:"auto"},timeout:8000}); save(key,data); return res.json({success:true,data}); } catch { return res.status(503).json({success:false,error:"Weather temporarily unavailable"}); } });
router.get("/api/public/forex", async (_req,res) => { try { const c=cache("forex_inr",3600000); if(c) return res.json({success:true,data:c}); const {data}=await axios.get("https://api.frankfurter.app/latest?to=INR",{timeout:8000}); save("forex_inr",data); return res.json({success:true,data}); } catch { return res.status(503).json({success:false,error:"Exchange rates temporarily unavailable"}); } });
router.get("/api/public/news", async (_req,res) => { try { const c=cache("india_news_rss",1800000); if(c) return res.json({success:true,data:c}); const feed=await rssParser.parseURL("https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en"); const data=feed.items.slice(0,20).map(i=>({title:i.title,link:i.link,pubDate:i.pubDate,source:i.creator||"Google News",description:i.contentSnippet||null,image_url:null})); save("india_news_rss",data); return res.json({success:true,data}); } catch { return res.status(503).json({success:false,error:"News temporarily unavailable"}); } });
router.get("/api/public/quote-of-day", async (_req,res) => { try { const c=cache("quote_of_day_v2",21600000); if(c) return res.json({success:true,data:c}); const feeds=["https://www.brainyquote.com/link/quotebr.rss","http://feeds.feedburner.com/azquotes/quoteoftheday"]; for(const url of feeds){ try { const feed=await rssParser.parseURL(url); const item=feed.items[0]; if(!item) continue; const title=cleanText(item.title || ""); const body=cleanText(item.contentSnippet || item.content || item.description || ""); const explicitAuthor=cleanText(item.creator || item.author || ""); let quote=body; let author=explicitAuthor; if(!author && body && title && body !== title) author=title; if(!quote && title){ const parts=title.split(/\s[-–—|:]\s/); if(parts.length > 1){ author=author || parts[parts.length - 1].trim(); quote=parts.slice(0,-1).join(" - ").trim(); } else quote=title; } if(quote === title && /\s[-–—|:]\s/.test(title)){ const parts=title.split(/\s[-–—|:]\s/); quote=parts.slice(0,-1).join(" - ").trim(); author=author || parts[parts.length-1].trim(); } if(quote){ const data={quote,author:author || "",link:item.link || (url.includes("brainyquote") ? "https://www.brainyquote.com/quote_of_the_day" : "https://www.azquotes.com/quote_of_the_day.html")}; save("quote_of_day_v2",data); return res.json({success:true,data}); } } catch {} } return res.status(503).json({success:false,error:"Quote temporarily unavailable"}); } catch { return res.status(503).json({success:false,error:"Quote temporarily unavailable"}); } });
router.get("/api/public/calendar/panchang", async (_req,res) => { try { const c=cache("panchang_rss",3600000); if(c) return res.json({success:true,data:c}); const feed=await rssParser.parseURL("https://hinducalendar.app/feed/panchang.xml"); const data=feed.items.map(i=>({title:i.title,description:i.contentSnippet||i.content||"",pubDate:i.pubDate,category:i.categories?.[0]||""})); save("panchang_rss",data); return res.json({success:true,data}); } catch { return res.status(503).json({success:false,error:"Panchang temporarily unavailable"}); } });
router.get("/api/public/calendar/highlights", async (_req,res) => { try { const c=cache("calendar_highlights",3600000); if(c) return res.json({success:true,data:c}); const feed=await rssParser.parseURL("https://hinducalendar.app/feed/highlights.xml"); const data=feed.items.map(i=>({title:i.title,description:i.contentSnippet||i.content||"",pubDate:i.pubDate})); save("calendar_highlights",data); return res.json({success:true,data}); } catch { return res.status(503).json({success:false,error:"Calendar highlights temporarily unavailable"}); } });
router.get("/api/public/calendar/digest", async (_req,res) => { try { const {data}=await axios.get("https://hinducalendar.app/feed/digest.txt",{responseType:"text",timeout:8000}); return res.type("text/plain").send(data); } catch { return res.status(503).send("Digest temporarily unavailable"); } });
router.get("/api/public/jobs-feed", async (_req,res) => { try { const c=cache("jobs_rss",3600000); if(c) return res.json({success:true,data:c}); const feed=await rssParser.parseURL("https://news.google.com/rss/search?q=Sarkari+Naukri+India+Jobs&hl=en-IN&gl=IN&ceid=IN:en"); const data=feed.items.slice(0,20).map(i=>({title:i.title,link:i.link,pubDate:i.pubDate})); save("jobs_rss",data); return res.json({success:true,data}); } catch { return res.status(503).json({success:false,error:"Jobs feed temporarily unavailable"}); } });
router.get("/api/public/remote-jobs", async (_req,res) => { try { const {data}=await axios.get("https://jobicy.com/api/v2/remote-jobs?count=20&geo=india",{timeout:8000}); return res.json({success:true,data}); } catch { return res.status(503).json({success:false,error:"Remote jobs temporarily unavailable"}); } });
router.get("/api/public/nearby", async (req,res) => { try { const lat=Number(req.query.lat),lon=Number(req.query.lon),type=String(req.query.type||"police"); if(!Number.isFinite(lat)||!Number.isFinite(lon)||!["police","veterinary"].includes(type)) return res.status(400).json({success:false,error:"Invalid nearby search"}); const key=`nearby_${type}_${lat.toFixed(3)}_${lon.toFixed(3)}`; const c=cache(key,86400000); if(c) return res.json({success:true,data:c}); const tag=type==="police"?"amenity=police":"amenity=veterinary"; const q=`[out:json][timeout:10];node[${tag}](around:5000,${lat},${lon});out;`; const {data}=await axios.get("https://overpass-api.de/api/interpreter",{params:{data:q},timeout:12000}); const locations=(data.elements||[]).map((e:any)=>({name:e.tags?.name||`Unnamed ${type}`,lat:e.lat,lon:e.lon})); save(key,locations); return res.json({success:true,data:locations}); } catch { return res.status(503).json({success:false,error:"Nearby search temporarily unavailable"}); } });
router.get("/api/public/disaster-alerts", async (_req,res) => { try { const c=cache("disaster_rss",900000); if(c) return res.json({success:true,data:c}); const feed=await rssParser.parseURL("https://www.gdacs.org/xml/rss.xml"); const data=feed.items.filter(i=>`${i.title||""} ${i.contentSnippet||""}`.toLowerCase().includes("india")).slice(0,30).map(i=>({id:i.guid||i.link,titleEn:i.title,titleHi:i.title,severity:"Alert",link:i.link})); save("disaster_rss",data); return res.json({success:true,data}); } catch { return res.status(503).json({success:false,error:"Disaster alerts temporarily unavailable"}); } });

type FeedState = { etag?: string; items: string[]; updatedAt: string };
const officialState: Record<"pib" | "sachet", FeedState> = {
  pib: { items: [], updatedAt: "" },
  sachet: { items: [], updatedAt: "" }
};
const officialUrls = {
  pib: "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1&reg=1",
  sachet: "https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml"
};

async function refreshOfficialFeed(kind: "pib" | "sachet") {
  const state = officialState[kind];
  const headers: Record<string, string> = {
    "User-Agent": "Samahit-RPFoundation/1.0",
    "Accept": "application/rss+xml, application/xml, text/xml, */*"
  };
  if (state.etag) headers["If-None-Match"] = state.etag;
  const response = await axios.get<string>(officialUrls[kind], {
    responseType: "text",
    timeout: 8000,
    maxRedirects: 5,
    headers,
    validateStatus: status => status === 200 || status === 304
  });
  if (response.status === 304 && state.items.length) return state.items;
  const parsed = await rssParser.parseString(response.data);
  const items = parsed.items.map(item => cleanText(item.title || item.contentSnippet || item.content || "")).filter(Boolean).slice(0, 20);
  if (items.length) {
    state.items = items;
    state.updatedAt = new Date().toISOString();
  }
  const etag = response.headers.etag;
  if (typeof etag === "string") state.etag = etag;
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