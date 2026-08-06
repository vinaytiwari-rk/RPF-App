import express from 'express';
import {
  resolveConstituency,
  loadACGeoJson,
  MP_CONSTITUENCIES_MOCK,
  PINCODE_CONSTITUENCY_MAP,
} from "../lib/constituency";

import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import multer from 'multer';

const router = express.Router();

router.get("/api/locations/pincode", async (req, res) => {
  const pincode = String(req.query.p || "").trim();

  if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
    return res.status(400).json({ success: false, error: "Invalid pincode" });
  }

  // ---------- 1. Exact local map (always preferred for constituency) ----------
  if (PINCODE_CONSTITUENCY_MAP[pincode]) {
    const resolution = PINCODE_CONSTITUENCY_MAP[pincode];

    // Best-effort district from known ranges (can be refined later)
    let district = "";
    let city = "";
    if (pincode.startsWith("462")) {
      district = city = "Bhopal";
    } else if (pincode.startsWith("452") || pincode.startsWith("453")) {
      district = city = "Indore";
    } else if (pincode.startsWith("466")) {
      district = city = "Bhopal";
    }

    // Still try India Post API for accurate office/area names (non-blocking)
    let areas: string[] = [];
    try {
      const postRes = await axios.get(
        `https://api.postalpincode.in/pincode/${pincode}`,
        { timeout: 4000 }
      );
      if (
        postRes.data?.[0]?.Status === "Success" &&
        Array.isArray(postRes.data[0].PostOffice)
      ) {
        areas = postRes.data[0].PostOffice.map((po: any) => po.Name);
        const office = postRes.data[0].PostOffice[0];
        district = office.District || district;
        city =
          office.Block && office.Block !== "NA"
            ? office.Block
            : office.District || city;
      }
    } catch (err) {
      // ignore – we already have constituency from local map
    }

    return res.json({
      success: true,
      data: {
        pincode,
        state: "Madhya Pradesh",
        district,
        city,
        vidhan_sabha: resolution.vidhan_sabha,
        vidhan_sabhas: resolution.vidhan_sabhas,
        sansad_kshetra: resolution.sansad_kshetra,
        areas,
        source: "local_map + india_post",
      },
    });
  }

  // ---------- 2. India Post API (primary live source) ----------
  try {
    const response = await axios.get(
      `https://api.postalpincode.in/pincode/${pincode}`,
      { timeout: 5000 }
    );

    const data = response.data;

    if (
      data?.[0]?.Status === "Success" &&
      Array.isArray(data[0].PostOffice) &&
      data[0].PostOffice.length > 0
    ) {
      const offices = data[0].PostOffice;
      const office = offices[0];
      const areas = offices.map((po: any) => po.Name);

      const district = office.District || "";
      const state = office.State || "";
      const city =
        office.Block && office.Block !== "NA" ? office.Block : district;

      // Resolve Vidhan Sabha + Sansad Kshetra from district + area names
      const resolution = resolveConstituency(
        pincode,
        district,
        areas,
        state
      );

      return res.json({
        success: true,
        data: {
          pincode,
          state,
          district,
          city,
          vidhan_sabha: resolution.vidhan_sabha,
          vidhan_sabhas: resolution.vidhan_sabhas,
          sansad_kshetra: resolution.sansad_kshetra,
          areas,
          source: "india_post",
        },
      });
    }

    // Invalid / not found
    return res.status(404).json({
      success: false,
      error: "Pincode not found in India Post directory",
    });
  } catch (error: any) {
    console.error("India Post API failed:", error.message);
  }

  // ---------- 3. Safe local fallback (no fake Indore) ----------
  const resolution = resolveConstituency(pincode, "", [], undefined);

  return res.json({
    success: true,
    data: {
      pincode,
      state: "",
      district: "",
      city: "",
      vidhan_sabha: resolution.vidhan_sabha || "",
      vidhan_sabhas: resolution.vidhan_sabhas || [],
      sansad_kshetra: resolution.sansad_kshetra || "",
      areas: [],
      source: "fallback",
      message:
        "India Post API unavailable. Showing best local match if available.",
    },
  });
});

router.get("/api/locations/helplines", async (req, res) => {
  const { pincode } = req.query;
  if (!pincode) {
    return res.status(400).json({ error: "Pincode is required" });
  }

  const mpHelplines = [
    {
      name: "One Stop Centre (OSC) - Bhopal",
      address: "District Hospital Campus, Bhopal, Madhya Pradesh - 466001",
      phone: "07562224455",
      type: "One Stop Centre",
      helpline: "181 / 1091"
    },
    {
      name: "One Stop Centre (OSC) - Bhopal",
      address: "J.P. Hospital Campus, 1250 Hospital Rd, Tulsi Nagar, Bhopal, MP - 462003",
      phone: "07552550181",
      type: "One Stop Centre",
      helpline: "181 / 1091"
    },
    {
      name: "One Stop Centre (OSC) - Indore",
      address: "M.Y. Hospital Campus, Indore, Madhya Pradesh - 452001",
      phone: "07312520181",
      type: "One Stop Centre",
      helpline: "181 / 1091"
    },
    {
      name: "Mahila Thana (Women Police Station) - Bhopal",
      address: "Jahangirabad, Bhopal, Madhya Pradesh - 462008",
      phone: "07552443801",
      type: "Police Helpline",
      helpline: "1091 / 100"
    },
    {
      name: "Mahila Thana (Women Police Station) - Bhopal",
      address: "Kotwali Campus, Bhopal, Madhya Pradesh - 466001",
      phone: "07562227091",
      type: "Police Helpline",
      helpline: "1091 / 100"
    },
    {
      name: "District Police Headquarters Helpdesk - Bhopal",
      address: "SP Office, Bhopal, Madhya Pradesh - 466001",
      phone: "07562227202",
      type: "Police Helpline",
      helpline: "100 / 112"
    }
  ];

  const nationalHelplines = [
    {
      name: "National Commission for Women Helpline",
      address: "New Delhi, India (24/7 National Coverage)",
      phone: "14490",
      type: "National Helpline",
      helpline: "14490"
    },
    {
      name: "Student & Women Helpline (181)",
      address: "State Capital Helpdesk, India",
      phone: "181",
      type: "State Helpline",
      helpline: "181"
    },
    {
      name: "All India Women Helpline (1091)",
      address: "National Coverage",
      phone: "1091",
      type: "National Helpline",
      helpline: "1091"
    },
    {
      name: "Emergency Response Support System (112)",
      address: "National Unified Emergency Response",
      phone: "112",
      type: "Unified Helpline",
      helpline: "112"
    }
  ];

  const pinStr = String(pincode);
  let resolvedLocal = [];
  if (pinStr.startsWith("466")) {
    resolvedLocal = mpHelplines.filter(h => h.name.includes("Bhopal"));
  } else if (pinStr.startsWith("462") || pinStr.startsWith("461")) {
    resolvedLocal = mpHelplines.filter(h => h.name.includes("Bhopal") || h.name.includes("Bhopal"));
  } else if (pinStr.startsWith("452") || pinStr.startsWith("451") || pinStr.startsWith("450")) {
    resolvedLocal = mpHelplines.filter(h => h.name.includes("Indore"));
  } else {
    if (pinStr.startsWith("45") || pinStr.startsWith("46") || pinStr.startsWith("47") || pinStr.startsWith("48")) {
      resolvedLocal = mpHelplines;
    }
  }

  res.json({
    success: true,
    data: [...resolvedLocal, ...nationalHelplines]
  });
});

router.get("/api/locations/street_ratings", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM street_ratings ORDER BY \"createdAt\" DESC");
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/locations/street_ratings", async (req, res) => {
  try {
    const { location_name, latitude, longitude, rating, notes } = req.body;
    await pool.query(
      `INSERT INTO street_ratings (location_name, latitude, longitude, rating, notes) 
       VALUES ($1, $2, $3, $4, $5)`,
      [location_name, latitude || 0, longitude || 0, rating || 3, notes || ""]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/locations/search", (req, res) => {
  const query = (req.query.q as string)?.trim().toLowerCase();
  if (!query || query.length < 2) {
    return res.json([]);
  }

  const geoJson = loadACGeoJson();

  if (geoJson) {
    // Filter features matching District or AC_NAME
    const results = [];
    const seen = new Set();
    const features = geoJson.features || [];
    
    for (const feature of features) {
      const props = feature.properties;
      if (props && props.ST_NAME === "MADHYA PRADESH") {
        const dist = (props.DIST_NAME || "").toLowerCase();
        const ac = (props.AC_NAME || "").toLowerCase();
        if (dist.includes(query) || ac.includes(query)) {
          const uniqueKey = `${props.DIST_NAME}-${props.AC_NAME}`;
          if (!seen.has(uniqueKey)) {
            seen.add(uniqueKey);
            results.push({
              district: props.DIST_NAME,
              vidhan_sabha: props.AC_NAME,
              sansad_kshetra: props.PC_NAME
            });
          }
        }
      }
      if (results.length >= 10) break; // limit to 10 fast results
    }
    res.json(results);
  } else {
    // Memory fallback search
    const results = MP_CONSTITUENCIES_MOCK.filter(item => 
      item.district.toLowerCase().includes(query) || 
      item.vidhan_sabha.toLowerCase().includes(query)
    ).slice(0, 10);
    res.json(results);
  }
});

router.get("/api/countries", async (_req, res) => {
  try {
    const fields =
      "name,cca2,flags,capital,population,region,subregion,languages,currencies,maps,timezones";
    const response = await axios.get(
      `https://restcountries.com/v3.1/all?fields=${fields}`,
      { timeout: 12000 }
    );
    res.json({ success: true, data: response.data });
  } catch (err: any) {
    console.error("Countries proxy failed:", err.message);
    res.status(502).json({ success: false, error: "Failed to load countries" });
  }
});

export default router;
