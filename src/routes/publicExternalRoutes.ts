import express from "express";
import axios from "axios";
import Parser from "rss-parser";
import multer from "multer";
import FormData from "form-data";
import fs from "fs";
import { apiCache, CACHE_TTL } from "../lib/apiCache.js";

const router = express.Router();
const rssParser = new Parser();
const upload = multer({ dest: 'tmp/' });

// 1. Weather API (Open-Meteo - Free, No API Key)
router.get("/api/public/weather", async (req, res) => {
  try {
    const lat = req.query.lat || "23.2599"; // Default Bhopal
    const lon = req.query.lon || "77.4126";
    const cacheKey = `weather_${lat}_${lon}`;
    
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL * 15) { // 15 mins cache for weather
      return res.json({ success: true, data: cached.data });
    }

    const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`);
    
    apiCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
    res.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error("Weather API Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch weather data" });
  }
});

// 2. Forex API (Frankfurter - Free, No API Key)
router.get("/api/public/forex", async (req, res) => {
  try {
    const cacheKey = "forex_rates";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 3600000) {
      return res.json({ success: true, data: cached.data });
    }

    const response = await axios.get("https://www.frankfurter.app/latest?to=INR");
    
    apiCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
    res.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error("Forex API Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch forex data" });
  }
});

// 3. News API (NewsData.io & NewsAPI.org)
router.get("/api/public/news", async (req, res) => {
  try {
    const cacheKey = "news_india_premium";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 1800000) { // 30 min cache
      return res.json({ success: true, data: cached.data });
    }

    let articles: any[] = [];
    let errors: string[] = [];
    
    // Primary: NewsData.io (Hindi, India, Top priority)
    try {
      const newsDataUrl = "https://newsdata.io/api/1/latest?apikey=pub_447fb0beb8dd430fb1eca7ae52e603d9&country=in&language=hi&category=breaking,education,environment,health,world&timezone=asia/kolkata&prioritydomain=top";
      const response = await axios.get(newsDataUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
      if (response.data && response.data.results) {
        articles = response.data.results.map((item: any) => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          source: item.source_name || "NewsData",
          image_url: item.image_url || null,
          description: item.description || null
        }));
      }
    } catch (e: any) {
      console.error("NewsData API Error:", e.message);
      errors.push(`NewsData: ${e.message}`);
    }

    // Fallback/Secondary: NewsAPI.org (English, India)
    if (articles.length === 0) {
      try {
        const newsApiUrl = "https://newsapi.org/v2/top-headlines?country=in&apiKey=c55809c9edd541cab9c23fc5144db5c7";
        const response = await axios.get(newsApiUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
        if (response.data && response.data.articles) {
          articles = response.data.articles.map((item: any) => ({
            title: item.title,
            link: item.url,
            pubDate: item.publishedAt,
            source: item.source?.name || "NewsAPI",
            image_url: item.urlToImage || null,
            description: item.description || null
          }));
        }
      } catch (e: any) {
        console.error("NewsAPI Error:", e.message);
        errors.push(`NewsAPI: ${e.message}`);
      }
    }

    // Ultimate Fallback: Google News RSS
    if (articles.length === 0) {
      try {
        const feed = await rssParser.parseURL("https://news.google.com/rss/search?q=NGO+India&hl=en-IN&gl=IN&ceid=IN:en");
        articles = feed.items.slice(0, 15).map(item => ({
          title: item.title + (errors.length > 0 ? ` (Failed to load new API: ${errors.join(", ")})` : ""),
          link: item.link,
          pubDate: item.pubDate,
          source: item.source || "Google News",
          image_url: null,
          description: null
        }));
      } catch (e: any) {
        console.error("RSS Fallback Error:", e.message);
      }
    }
    
    apiCache.set(cacheKey, { data: articles, timestamp: Date.now() });
    res.json({ success: true, data: articles });
  } catch (error: any) {
    console.error("News API General Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch news data" });
  }
});

// 4. Hindu Calendar APIs (XML feeds proxy)
router.get("/api/public/calendar/panchang", async (req, res) => {
  try {
    const cacheKey = "hindu_calendar_panchang";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour cache
      return res.json({ success: true, data: cached.data });
    }
    
    // Using rssParser which is already imported for Google News
    const feed = await rssParser.parseURL("https://hinducalendar.app/feed/panchang.xml");
    const items = feed.items.map(item => ({
      title: item.title,
      description: item.contentSnippet || item.content || "",
      pubDate: item.pubDate,
      category: item.categories?.[0] || ""
    }));
    
    apiCache.set(cacheKey, { data: items, timestamp: Date.now() });
    res.json({ success: true, data: items });
  } catch (error: any) {
    console.error("Panchang API Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch panchang data" });
  }
});

router.get("/api/public/calendar/highlights", async (req, res) => {
  try {
    const cacheKey = "hindu_calendar_highlights";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour cache
      return res.json({ success: true, data: cached.data });
    }
    
    const feed = await rssParser.parseURL("https://hinducalendar.app/feed/highlights.xml");
    const items = feed.items.map(item => ({
      title: item.title,
      description: item.contentSnippet || item.content || "",
      pubDate: item.pubDate
    }));
    
    apiCache.set(cacheKey, { data: items, timestamp: Date.now() });
    res.json({ success: true, data: items });
  } catch (error: any) {
    console.error("Highlights API Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch highlights data" });
  }
});

router.get("/api/public/calendar/digest", async (req, res) => {
  try {
    const response = await axios.get("https://hinducalendar.app/feed/digest.txt", { responseType: 'text' });
    res.send(response.data);
  } catch (error: any) {
    console.error("Digest API Error:", error.message);
    res.status(500).send("Failed to fetch digest text");
  }
});

// 5. Kundli & Astrology API (FreeAstrologyAPI)
router.post("/api/public/calendar/astrology/planets", express.json(), async (req, res) => {
  try {
    const ASTRO_API_KEY = "xPGAPbo7v82qDZMHX7gH04ouFggaJD8NamSrLQw1";
    const { year, month, date, hours, minutes, seconds, latitude, longitude, timezone } = req.body;
    
    // Default coordinates to New Delhi if missing
    const payload = {
      year: year || new Date().getFullYear(),
      month: month || new Date().getMonth() + 1,
      date: date || new Date().getDate(),
      hours: hours !== undefined ? hours : 12,
      minutes: minutes || 0,
      seconds: seconds || 0,
      latitude: latitude || 28.6139,
      longitude: longitude || 77.2090,
      timezone: timezone || 5.5
    };

    const response = await axios.post("https://json.freeastrologyapi.com/planets", payload, {
      headers: {
        "x-api-key": ASTRO_API_KEY,
        "Content-Type": "application/json"
      }
    });

    res.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error("Astrology API Error:", error?.response?.data || error.message);
    res.status(500).json({ success: false, error: "Failed to fetch astrology data" });
  }
});

// 4. Jobs RSS API
router.get("/api/public/jobs-feed", async (req, res) => {
  try {
    const cacheKey = "jobs_rss_feed";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour cache
      return res.json({ success: true, data: cached.data });
    }

    const feed = await rssParser.parseURL("https://news.google.com/rss/search?q=Sarkari+Naukri+India+Jobs&hl=en-IN&gl=IN&ceid=IN:en");
    const jobs = feed.items.slice(0, 10).map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate
    }));
    
    apiCache.set(cacheKey, { data: jobs, timestamp: Date.now() });
    res.json({ success: true, data: jobs });
  } catch (error: any) {
    console.error("Jobs API Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch jobs data" });
  }
});

// 5. Emergency Nearby Locator (Overpass API)
router.get("/api/public/nearby", async (req, res) => {
  try {
    const { lat, lon, type } = req.query; // type can be 'police' or 'veterinary'
    if (!lat || !lon || !type) {
      return res.status(400).json({ success: false, error: "lat, lon, and type are required" });
    }

    const cacheKey = `nearby_${type}_${lat}_${lon}`;
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 86400000) { // 24 hours cache for locations
      return res.json({ success: true, data: cached.data });
    }

    // Overpass QL Query
    let nodeType = type === 'police' ? 'amenity=police' : 'amenity=veterinary';
    const radius = 5000; // 5km search radius
    const overpassQuery = `[out:json];node[${nodeType}](around:${radius},${lat},${lon});out 5;`;
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

    const response = await axios.get(overpassUrl);
    
    const locations = response.data.elements.map((el: any) => ({
      name: el.tags.name || `Unnamed ${type}`,
      lat: el.lat,
      lon: el.lon,
      distance: "N/A (Map View)"
    }));

    apiCache.set(cacheKey, { data: locations, timestamp: Date.now() });
    res.json({ success: true, data: locations });
  } catch (error: any) {
    console.error("Nearby API Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch nearby locations" });
  }
});

// 6. Remote Jobs API (Jobicy)
router.get("/api/public/remote-jobs", async (req, res) => {
  try {
    const cacheKey = "remote_jobs_india";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour cache
      return res.json({ success: true, data: cached.data });
    }

    const response = await axios.get("https://jobicy.com/api/v2/remote-jobs?count=20&geo=india");
    
    apiCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
    res.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error("Jobs API Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch remote jobs" });
  }
});

// 7. Sachet NDMA Disaster Alerts API (Real-time proxy & fallback)
router.get("/api/public/disaster-alerts", async (req, res) => {
  try {
    const cacheKey = "disaster_alerts";
    const cached = apiCache.get(cacheKey);
    // 15 min cache for disaster alerts
    if (cached && Date.now() - cached.timestamp < 900000) { 
      return res.json({ success: true, data: cached.data });
    }

    // Try fetching real-time alerts from GDACS (Global Disaster Alert and Coordination System) for India
    let alerts: any[] = [];
    try {
      const feed = await rssParser.parseURL("https://www.gdacs.org/xml/rss.xml");
      feed.items.forEach(item => {
        if (item.title?.toLowerCase().includes("india") || item.content?.toLowerCase().includes("india")) {
          alerts.push({
            id: item.guid,
            titleEn: `Sachet Alert: ${item.title}`,
            titleHi: `सचेत अलर्ट: ${item.title}`, // Ideally translated
            severity: "High",
            link: item.link
          });
        }
      });
    } catch (e) {
      console.error("RSS parsing error:", e);
    }

    // Fallback Mock NDMA alert for demonstration if no active alerts
    if (alerts.length === 0) {
      alerts.push({
        id: "mock_ndma_1",
        titleEn: "Heavy Rainfall and Thunderstorm warning for next 24 hours.",
        titleHi: "अगले 24 घंटों में भारी बारिश और आंधी की चेतावनी।",
        severity: "High",
        link: "https://sachet.ndma.gov.in"
      });
    }

    apiCache.set(cacheKey, { data: alerts, timestamp: Date.now() });
    res.json({ success: true, data: alerts });
  } catch (error: any) {
    console.error("Disaster Alert API Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch disaster alerts" });
  }
});

// 8. Sarvam AI Speech to Text API
router.post("/api/public/speech-to-text", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No audio file provided." });
  }

  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path));
    formData.append("model", "saaras:v1");

    const response = await axios.post("https://api.sarvam.ai/speech-to-text", formData, {
      headers: {
        ...formData.getHeaders(),
        "api-subscription-key": "sk_rp8peokh_TQdtccvYUT9u2UNZofBsDpTE"
      }
    });

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    res.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error("Sarvam AI Error:", error.response?.data || error.message);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: "Failed to process audio" });
  }
});

// 9. Indian Banks IFSC API (Razorpay)
router.get("/api/public/ifsc/:code", async (req, res) => {
  try {
    const ifsc = req.params.code;
    const cacheKey = `ifsc_${ifsc}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached.data });

    const response = await axios.get(`https://ifsc.razorpay.com/${ifsc}`);
    apiCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
    res.json({ success: true, data: response.data });
  } catch (error: any) {
    res.status(404).json({ success: false, error: "Invalid IFSC Code or Bank Not Found" });
  }
});

// 9. Universities API (Hipo)
router.get("/api/public/universities", async (req, res) => {
  try {
    const name = (req.query.name as string) || "";
    const cacheKey = `univ_${name}`;
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 86400000) return res.json({ success: true, data: cached.data });

    const response = await axios.get(`http://universities.hipolabs.com/search?country=India&name=${encodeURIComponent(name)}`);
    apiCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
    res.json({ success: true, data: response.data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch universities" });
  }
});

// 10. Fuel Prices (Scraper/Fallback for Bhopal)
router.get("/api/public/fuel-prices", async (req, res) => {
  try {
    const cacheKey = "fuel_prices_bhopal";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 3600000 * 12) { // 12 hours cache
      return res.json({ success: true, data: cached.data });
    }

    // Try fetching from GoodReturns
    const response = await axios.get("https://www.goodreturns.in/petrol-price-in-bhopal.html");
    const petrolMatch = response.data.match(/₹\s*([0-9.]+)\s*<\/strong>/i);
    const petrol = petrolMatch ? petrolMatch[1] : "106.47";
    
    const responseDiesel = await axios.get("https://www.goodreturns.in/diesel-price-in-bhopal.html");
    const dieselMatch = responseDiesel.data.match(/₹\s*([0-9.]+)\s*<\/strong>/i);
    const diesel = dieselMatch ? dieselMatch[1] : "91.84";

    const data = { petrol, diesel, city: "Bhopal", state: "Madhya Pradesh" };
    apiCache.set(cacheKey, { data, timestamp: Date.now() });
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Fuel API Error:", error.message);
    // Fallback static data if scraper fails
    res.json({ success: true, data: { petrol: "106.47", diesel: "91.84", city: "Bhopal (Approx)" } });
  }
});

// 11. Archive.org Search API (Digital Library)
router.get("/api/public/archive-search", async (req, res) => {
  try {
    const q = (req.query.q as string) || "india";
    const cacheKey = `archive_${q}`;
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 3600000 * 24) {
      return res.json({ success: true, data: cached.data });
    }

    const response = await axios.get(`https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}+AND+mediatype:(texts)&output=json&rows=15&page=1`);
    
    if (response.data?.response?.docs) {
      const docs = response.data.response.docs.map((d: any) => ({
        identifier: d.identifier,
        title: d.title,
        creator: d.creator,
        year: d.year,
        downloads: d.downloads
      }));
      apiCache.set(cacheKey, { data: docs, timestamp: Date.now() });
      return res.json({ success: true, data: docs });
    }
    res.json({ success: true, data: [] });
  } catch (error: any) {
    console.error("Archive API Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to search archives" });
  }
});

// 12. Wayback Machine API
router.get("/api/public/wayback", async (req, res) => {
  try {
    const url = req.query.url as string;
    if (!url) return res.json({ success: false, error: "URL is required" });
    
    const cacheKey = `wayback_${url}`;
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 3600000 * 24) {
      return res.json({ success: true, data: cached.data });
    }

    const response = await axios.get(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`);
    
    if (response.data?.archived_snapshots?.closest) {
      apiCache.set(cacheKey, { data: response.data.archived_snapshots.closest, timestamp: Date.now() });
      return res.json({ success: true, data: response.data.archived_snapshots.closest });
    }
    res.json({ success: true, data: null });
  } catch (error: any) {
    console.error("Wayback API Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to check wayback machine" });
  }
});

export default router;

