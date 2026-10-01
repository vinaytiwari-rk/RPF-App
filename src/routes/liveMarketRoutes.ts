import express from "express";
import {
  getVerifiedMarketSummary,
  getLiveDrikPanchang,
  getLiveBullionRates,
  getLiveVegetablePrices,
  getLiveMandiPulse
} from "../services/liveMarketScraperService.js";

const router = express.Router();

// 1. Unified summary for Home Screen verified cards
router.get("/api/public/market-summary", async (_req, res) => {
  try {
    const summary = await getVerifiedMarketSummary();
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

// 4. Bhopal Vegetables (Roz Ka Bhav)
router.get("/api/public/live-vegetables", async (_req, res) => {
  try {
    const data = await getLiveVegetablePrices();
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
