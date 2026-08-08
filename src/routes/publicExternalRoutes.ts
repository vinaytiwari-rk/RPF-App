import express from "express";
import axios from "axios";
import Parser from "rss-parser";
import { apiCache, CACHE_TTL } from "../lib/apiCache.js";

const router = express.Router();
const rssParser = new Parser();

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

    const response = await axios.get("https://api.frankfurter.app/latest?to=INR");
    
    apiCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
    res.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error("Forex API Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch forex data" });
  }
});

// 3. News RSS API
router.get("/api/public/news", async (req, res) => {
  try {
    const cacheKey = "google_news_india_ngo";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour cache
      return res.json({ success: true, data: cached.data });
    }

    const feed = await rssParser.parseURL("https://news.google.com/rss/search?q=NGO+India&hl=en-IN&gl=IN&ceid=IN:en");
    const articles = feed.items.slice(0, 10).map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      source: item.source
    }));
    
    apiCache.set(cacheKey, { data: articles, timestamp: Date.now() });
    res.json({ success: true, data: articles });
  } catch (error: any) {
    console.error("News API Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch news data" });
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

// 7. Daily Quote API (Advice Slip)
router.get("/api/public/daily-quote", async (req, res) => {
  try {
    const cacheKey = "daily_quote";
    const cached = apiCache.get(cacheKey);
    // 24 hour cache (or at least 1 hour)
    if (cached && Date.now() - cached.timestamp < 3600000) { 
      return res.json({ success: true, data: cached.data });
    }

    const response = await axios.get("https://api.adviceslip.com/advice");
    
    apiCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
    res.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error("Quote API Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch daily quote" });
  }
});

// 8. Indian Banks IFSC API (Razorpay)
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

