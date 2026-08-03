import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

router.get("/api/success-stories", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM success_stories ORDER BY "createdAt" DESC');
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/api/success-stories", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;
    if (!title || !content) return res.status(400).json({ success: false, error: "Title and Content are required" });
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO success_stories (id, title, content, "imageUrl", "createdAt") VALUES ($1, $2, $3, $4, NOW())`,
      [id, title, content, imageUrl || null]
    );
    res.json({ success: true, message: "Success story created successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/api/success-stories/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM success_stories WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: "Success story deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/api/social-previews", async (req, res) => {
  try {
    const apiKey = process.env.EXABASE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: "Exabase API key not configured on server" });
    }

    let targetUrls = [
      "https://www.instagram.com/rpfoundationofficial/",
      "https://www.instagram.com/therohitpandit/",
      "https://www.facebook.com/rpfofficial",
      "https://x.com/rpfoundation15",
      "https://www.youtube.com/@rpfoundationofficial"
    ];

    // Retrieve live social media links configured in database settings
    try {
      const cmsDataRes = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
      if (cmsDataRes.rows.length > 0 && cmsDataRes.rows[0].founderMessageEn) {
        const parsed = JSON.parse(cmsDataRes.rows[0].founderMessageEn);
        if (parsed.socialDirectory && Array.isArray(parsed.socialDirectory) && parsed.socialDirectory.length > 0) {
          targetUrls = parsed.socialDirectory.map((item: any) => item.url).filter(Boolean);
        }
      }
    } catch (e: any) {
      console.warn("[EXABASE] Failed to dynamically load social links from DB settings, using defaults:", e.message);
    }

    const results = [];

    for (const url of targetUrls) {
      const now = Date.now();
      const cached = socialPreviewsCache[url];

      if (cached && (now - cached.timestamp < SOCIAL_CACHE_TTL)) {
        results.push(cached.data);
        continue;
      }

      try {
        console.log(`[EXABASE] Fetching live preview for: ${url}`);
        const response = await axios.get(
          `https://api.exabase.io/v2/link?url=${encodeURIComponent(url)}`,
          {
            headers: {
              "X-Api-Key": apiKey
            },
            timeout: 8000
          }
        );

        const previewData = response.data;
        const imgObj = previewData.image;
        const imageUrl = (imgObj && typeof imgObj === "object" ? imgObj.url : imgObj) || previewData.imageUrl || previewData.ImageUrl || "";
        
        const normalized = {
          url,
          title: previewData.title || previewData.Title || url,
          description: previewData.description || previewData.Description || "",
          image: imageUrl,
          siteName: previewData.siteName || previewData.SiteName || ""
        };

        socialPreviewsCache[url] = {
          data: normalized,
          timestamp: now
        };

        results.push(normalized);
      } catch (err: any) {
        console.warn(`[EXABASE WARNING] Failed to fetch live preview for ${url}:`, err.message);
        if (cached) {
          results.push(cached.data);
        } else {
          results.push({
            url,
            title: url.includes("instagram") ? (url.includes("therohitpandit") ? "Rohit Pandit Instagram" : "RP Foundation Instagram") : 
                   url.includes("facebook") ? "RP Foundation Facebook" :
                   url.includes("youtube") ? "RP Foundation YouTube" : "RP Foundation Twitter/X",
            description: "Visit our official social media page for live updates, campaigns and community achievements.",
            image: "",
            siteName: url.includes("instagram") ? "Instagram" : 
                      url.includes("facebook") ? "Facebook" :
                      url.includes("youtube") ? "YouTube" : "Twitter/X"
          });
        }
      }
    }

    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/api/culture/rsvps", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const result = await pool.query("SELECT event_title FROM event_rsvps WHERE user_id = $1", [userId]);
    res.json({ success: true, data: result.rows.map(r => r.event_title) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/culture/rsvps", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { event_title } = req.body;
    await pool.query(
      `INSERT INTO event_rsvps (user_id, event_title, registered_at) 
       VALUES ($1, $2, NOW()) 
       ON CONFLICT (user_id, event_title) DO NOTHING`,
      [userId, event_title]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/api/culture/rsvps/:eventTitle", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { eventTitle } = req.params;
    await pool.query("DELETE FROM event_rsvps WHERE user_id = $1 AND event_title = $2", [userId, eventTitle]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
