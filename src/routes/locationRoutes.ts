import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import multer from 'multer';

const router = express.Router();

router.get("/api/locations/pincode", async (req, res) => {
  const pincode = req.query.p as string;
  if (!pincode || pincode.length !== 6) {
    return res.status(400).json({ success: false, error: "Invalid pincode" });
  }

  const apiKey = process.env.DATAGOV_API_KEY || "579b464db66ec23bdd000001ba8300370e6842e1770b301544186f0f";
  const resourceId = process.env.DATAGOV_RESOURCE_ID_PINCODE || "5c2f62fe-5afa-4119-a499-fec9d604d5bd";

  if (apiKey) {
    try {
      // Query the official OGD Pincode Directory API
      const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&filters[pincode]=${pincode}`;
      const response = await axios.get(url);
      
      if (response.data && response.data.records && Array.isArray(response.data.records) && response.data.records.length > 0) {
        const records = response.data.records;
        const first = records[0];
        
        // Extract all post offices/local areas for this pincode
        const areas = records.map((r: any) => r.officename);
        
        // Capitalize names properly
        const state = first.statename.toLowerCase().split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const district = first.district.toLowerCase().split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const city = first.divisionname ? first.divisionname.replace(" Division", "") : district;

        // Resolve constituencies accurately
        const resolution = resolveConstituency(pincode, district, areas, state);

        const liveData = {
          pincode,
          state,
          district,
          city,
          vidhan_sabha: resolution.vidhan_sabha,
          vidhan_sabhas: resolution.vidhan_sabhas,
          sansad_kshetra: resolution.sansad_kshetra,
          areas,
          latitude: first.latitude,
          longitude: first.longitude
        };

        return res.json({ success: true, data: liveData });
      }
    } catch (error: any) {
      console.error("OGD Pincode Directory API failed, trying fallback:", error.message);
    }
  }

  try {
    const response = await axios.get("https://api.postalpincode.in/pincode/" + pincode, { timeout: 4000 });
    const data = response.data;
    if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice) {
      const office = data[0].PostOffice[0];
      const areas = data[0].PostOffice.map((po: any) => po.Name);
      
      const district = office.District;
      const resolution = resolveConstituency(pincode, district, areas, office.State);

      const liveData = {
        pincode,
        state: office.State,
        district,
        city: office.Block && office.Block !== "NA" ? office.Block : district,
        vidhan_sabha: resolution.vidhan_sabha,
        vidhan_sabhas: resolution.vidhan_sabhas,
        sansad_kshetra: resolution.sansad_kshetra,
        areas: areas
      };
      return res.json({ success: true, data: liveData });
    }
  } catch (error) {
    console.error("Live postal API query failed, falling back to mock:", error.message);
  }
  
  // Fallback mock
  const mockData = {
    pincode,
    state: "Madhya Pradesh",
    district: "Indore",
    city: "Indore",
    vidhan_sabha: "Indore-1",
    vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau", "Mhow"],
    sansad_kshetra: "Indore",
    areas: ["Vijay Nagar BO", "Palasia BO", "Bhawarkuan BO", "Rajwada SO"]
  };
  
  res.json({ success: true, data: mockData });
});

router.get("/api/locations/helplines", async (req, res) => {
  const { pincode } = req.query;
  if (!pincode) {
    return res.status(400).json({ error: "Pincode is required" });
  }

  const mpHelplines = [
    {
      name: "One Stop Centre (OSC) - Sehore",
      address: "District Hospital Campus, Sehore, Madhya Pradesh - 466001",
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
      name: "Mahila Thana (Women Police Station) - Sehore",
      address: "Kotwali Campus, Sehore, Madhya Pradesh - 466001",
      phone: "07562227091",
      type: "Police Helpline",
      helpline: "1091 / 100"
    },
    {
      name: "District Police Headquarters Helpdesk - Sehore",
      address: "SP Office, Sehore, Madhya Pradesh - 466001",
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
    resolvedLocal = mpHelplines.filter(h => h.name.includes("Sehore"));
  } else if (pinStr.startsWith("462") || pinStr.startsWith("461")) {
    resolvedLocal = mpHelplines.filter(h => h.name.includes("Bhopal") || h.name.includes("Sehore"));
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

export default router;
