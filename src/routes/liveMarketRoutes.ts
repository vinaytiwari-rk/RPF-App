import express from "express";
import axios from "axios";
import { getJagannathaPanchang } from "../services/jagannathaHoraService.js";
import {
  getVerifiedMarketSummary,
  getLiveDrikPanchang,
  getLiveBullionRates,
  getLiveVegetablePrices,
  getLiveMandiPulse,
  getSupportedMarketCities
} from "../services/liveMarketScraperService.js";

const router = express.Router();

// Supported Cities List
router.get("/api/public/market-cities", async (_req, res) => {
  try {
    const cities = await getSupportedMarketCities();
    return res.json({ success: true, data: cities });
  } catch (error) {
    console.error("Error discovering market cities:", error);
    return res.status(500).json({ success: false, error: "Unable to load market cities" });
  }
});

// 1. Unified summary for Home Screen verified cards
router.get("/api/public/reverse-location", async (req, res) => {
  try {
    const lat = Number(req.query.lat), lon = Number(req.query.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return res.status(400).json({ success:false, error:"Invalid coordinates" });
    const r = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: { format:"jsonv2", lat, lon, zoom:10, addressdetails:1 },
      headers: { "User-Agent":"Samahit-RPFoundation/2.5 (location lookup)" }, timeout:8000
    });
    const a = r.data?.address || {};
    const city = a.city || a.town || a.municipality || a.village || a.county || "";
    const state = a.state || "";
    return res.json({ success:true, data:{ city, state, displayName:r.data?.display_name || "", lat, lon } });
  } catch (error) {
    console.error("Reverse location lookup failed:", error);
    return res.status(502).json({ success:false, error:"Unable to resolve current location" });
  }
});

router.get("/api/public/market-summary", async (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  try {
    const city = typeof req.query.city === "string" ? req.query.city : undefined;
    const state = typeof req.query.state === "string" ? req.query.state : undefined;
    const summary = await getVerifiedMarketSummary(city, state);
    return res.json({ success: true, data: summary });
  } catch (error: any) {
    console.error("Error in /api/public/market-summary:", error);
    return res.status(500).json({ success: false, error: "Unable to load market summary" });
  }
});

// 2. Drik Panchang
router.get("/api/public/live-panchang", async (req, res) => {
  res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=300");
  try {
    const city = typeof req.query.city === "string" ? req.query.city : "bhopal";
    const state = typeof req.query.state === "string" ? req.query.state : undefined;
    const date = typeof req.query.date === "string" ? req.query.date : undefined;
    const latitude = req.query.lat !== undefined ? Number(req.query.lat) : undefined;
    const longitude = req.query.lon !== undefined ? Number(req.query.lon) : undefined;
    if ((latitude !== undefined && !Number.isFinite(latitude)) || (longitude !== undefined && !Number.isFinite(longitude))) {
      return res.status(400).json({ success: false, error: "Invalid latitude/longitude" });
    }
    const data = await getJagannathaPanchang({ city, state, date, latitude, longitude });
    return res.json({ success: true, data });
  } catch (error: any) {
    console.error("Jagannatha Hora Panchang request failed:", error?.response?.data || error?.message || error);
    return res.status(502).json({ success: false, error: "Live Vedic Panchang is temporarily unavailable" });
  }
});

// 3. All India Bullion (Gold & Silver)
router.get("/api/public/live-bullion", async (_req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  try {
    const data = await getLiveBullionRates();
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Unable to load bullion rates" });
  }
});

// 4. City Vegetables (Roz Ka Bhav)
router.get("/api/public/live-vegetables", async (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  try {
    const city = typeof req.query.city === "string" ? req.query.city : undefined;
    const data = await getLiveVegetablePrices(city);
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Unable to load vegetable prices" });
  }
});

// 5. Mandi Pulse
router.get("/api/public/live-mandi-pulse", async (_req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  try {
    const city = typeof _req.query.city === "string" ? _req.query.city : undefined;
    const state = typeof _req.query.state === "string" ? _req.query.state : undefined;
    const data = await getLiveMandiPulse(city, state);
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Unable to load mandi pulse" });
  }
});

export default router;
