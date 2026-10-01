import express from "express";
import {
  getVerifiedMarketSummary,
  getLiveDrikPanchang,
  getLiveBullionRates,
  getLiveVegetablePrices,
  getLiveMandiPulse,
  SUPPORTED_CITIES
} from "../services/liveMarketScraperService.js";

const router = express.Router();

// Supported Cities List
router.get("/api/public/market-cities", (_req, res) => {
  const cities = Object.values(SUPPORTED_CITIES).map(c => ({
    id: c.id,
    name: c.name,
    state: c.state,
    marketName: c.marketName
  }));
  return res.json({ success: true, data: cities });
});

// 1. Unified summary for Home Screen verified cards
router.get("/api/public/market-summary", async (req, res) => {
  try {
    const city = typeof req.query.city === "string" ? req.query.city : undefined;
    const summary = await getVerifiedMarketSummary(city);
    return res.json({ success: true, data: summary });
  } catch (error: any) {
    console.error("Error in /api/public/market-summary:", error);
    return res.status(500).json({ success: false, error: "Unable to load market summary" });
  }
});

// 2. Drik Panchang
router.get("/api/public/live-panchang", async (_req, res) => {
  try {
    const data = await getLiveDrikPanchang();
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Unable to load panchang" });
  }
});

// 3. All India Bullion (Gold & Silver)
router.get("/api/public/live-bullion", async (_req, res) => {
  try {
    const data = await getLiveBullionRates();
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Unable to load bullion rates" });
  }
});

// 4. City Vegetables (Roz Ka Bhav)
router.get("/api/public/live-vegetables", async (req, res) => {
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
  try {
    const data = await getLiveMandiPulse();
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Unable to load mandi pulse" });
  }
});

export default router;
