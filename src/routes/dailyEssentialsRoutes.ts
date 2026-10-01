import express from "express";
import {
  getDailyEssentialsSummary,
  getLiveMandiRates,
  getLiveFuelAndBullionRates,
  getTodayPanchang,
  getLiveJobNotices
} from "../services/dailyEssentialsService.js";

const router = express.Router();

// 1. Unified summary for Home Screen Widgets & Strips
router.get("/api/public/daily-essentials", async (_req, res) => {
  try {
    const summary = await getDailyEssentialsSummary();
    return res.json({ success: true, data: summary });
  } catch (error: any) {
    console.error("Error in /api/public/daily-essentials:", error);
    return res.status(500).json({ success: false, error: "Unable to load daily essentials" });
  }
});

// 2. Mandi Rates (with district and search filter)
router.get("/api/public/mandi-rates", async (req, res) => {
  try {
    const district = typeof req.query.district === "string" ? req.query.district : undefined;
    const search = typeof req.query.search === "string" ? req.query.search.toLowerCase() : undefined;
    const result = await getLiveMandiRates(district);

    let rates = result.rates;
    if (search) {
      rates = rates.filter(r =>
        r.crop.toLowerCase().includes(search) ||
        r.cropHi.includes(search) ||
        r.mandi.toLowerCase().includes(search)
      );
    }

    return res.json({
      success: true,
      data: {
        mandis: result.mandis,
        rates,
        total: rates.length,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error("Error in /api/public/mandi-rates:", error);
    return res.status(500).json({ success: false, error: "Unable to load mandi rates" });
  }
});

// 3. Fuel & Bullion Rates
router.get("/api/public/fuel-rates", async (_req, res) => {
  try {
    const data = await getLiveFuelAndBullionRates();
    return res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error in /api/public/fuel-rates:", error);
    return res.status(500).json({ success: false, error: "Unable to load fuel rates" });
  }
});

// 4. Daily Hindu Panchang & Shubh Muhurat
router.get("/api/public/panchang", async (_req, res) => {
  try {
    const data = getTodayPanchang();
    return res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error in /api/public/panchang:", error);
    return res.status(500).json({ success: false, error: "Unable to load panchang" });
  }
});

// 5. Sarkari Jobs & Recruitment Notices
router.get("/api/public/job-notices", async (req, res) => {
  try {
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const data = await getLiveJobNotices(category);
    return res.json({ success: true, data, total: data.length });
  } catch (error: any) {
    console.error("Error in /api/public/job-notices:", error);
    return res.status(500).json({ success: false, error: "Unable to load job notices" });
  }
});

export default router;
