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

export default router;

