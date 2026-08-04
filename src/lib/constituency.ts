import fs from 'fs';
import path from 'path';

let acGeoJsonData: any = null;
let acGeoJsonLoadAttempted = false;


export // 1. AI Chat Endpoint


// 2. AI Auto-Categorize Grievance Endpoint


// 3. AI Government Scheme Matcher


// =============================================================================
// LOCATION SEARCH API (LOCAL GEOJSON)
// =============================================================================
const MP_CONSTITUENCIES_MOCK = [
  { district: "Bhopal", vidhan_sabha: "Bhopal Uttar", sansad_kshetra: "Bhopal" },
  { district: "Bhopal", vidhan_sabha: "Bhopal Madhya", sansad_kshetra: "Bhopal" },
  { district: "Bhopal", vidhan_sabha: "Bhopal Dakshin-Pashchim", sansad_kshetra: "Bhopal" },
  { district: "Bhopal", vidhan_sabha: "Narela", sansad_kshetra: "Bhopal" },
  { district: "Bhopal", vidhan_sabha: "Govindpura", sansad_kshetra: "Bhopal" },
  { district: "Bhopal", vidhan_sabha: "Huzur", sansad_kshetra: "Bhopal" },
  { district: "Sehore", vidhan_sabha: "Budhni", sansad_kshetra: "Vidisha" },
  { district: "Sehore", vidhan_sabha: "Ichhawar", sansad_kshetra: "Vidisha" },
  { district: "Sehore", vidhan_sabha: "Ashta", sansad_kshetra: "Dewas" },
  { district: "Indore", vidhan_sabha: "Indore-1", sansad_kshetra: "Indore" },
  { district: "Indore", vidhan_sabha: "Indore-2", sansad_kshetra: "Indore" },
  { district: "Indore", vidhan_sabha: "Indore-3", sansad_kshetra: "Indore" },
  { district: "Indore", vidhan_sabha: "Indore-4", sansad_kshetra: "Indore" },
  { district: "Indore", vidhan_sabha: "Indore-5", sansad_kshetra: "Indore" },
  { district: "Indore", vidhan_sabha: "Rau", sansad_kshetra: "Indore" },
  { district: "Indore", vidhan_sabha: "Mhow", sansad_kshetra: "Dhar" },
  { district: "Gwalior", vidhan_sabha: "Gwalior East", sansad_kshetra: "Gwalior" },
  { district: "Gwalior", vidhan_sabha: "Gwalior South", sansad_kshetra: "Gwalior" },
  { district: "Jabalpur", vidhan_sabha: "Jabalpur Cantt", sansad_kshetra: "Jabalpur" },
  { district: "Jabalpur", vidhan_sabha: "Jabalpur East", sansad_kshetra: "Jabalpur" },
  { district: "Vidisha", vidhan_sabha: "Vidisha", sansad_kshetra: "Vidisha" },
  { district: "Sagar", vidhan_sabha: "Sagar", sansad_kshetra: "Sagar" },
  { district: "Ujjain", vidhan_sabha: "Ujjain North", sansad_kshetra: "Ujjain" },
  { district: "Ujjain", vidhan_sabha: "Ujjain South", sansad_kshetra: "Ujjain" },
  { district: "Dewas", vidhan_sabha: "Dewas", sansad_kshetra: "Dewas" }
];
// Phase 3: Unified JWT Auth Endpoints






// Exact Pincode to Constituency Mapping Registry for Madhya Pradesh
const PINCODE_CONSTITUENCY_MAP: Record<string, { vidhan_sabha: string, vidhan_sabhas: string[], sansad_kshetra: string }> = {
  "462038": { vidhan_sabha: "Narela", vidhan_sabhas: ["Narela", "Bhopal Uttar", "Govindpura"], sansad_kshetra: "Bhopal" },
  "462001": { vidhan_sabha: "Bhopal Uttar", vidhan_sabhas: ["Bhopal Uttar", "Bhopal Madhya"], sansad_kshetra: "Bhopal" },
  "462002": { vidhan_sabha: "Bhopal Uttar", vidhan_sabhas: ["Bhopal Uttar", "Bhopal Madhya"], sansad_kshetra: "Bhopal" },
  "462003": { vidhan_sabha: "Bhopal Uttar", vidhan_sabhas: ["Bhopal Uttar", "Bhopal Madhya"], sansad_kshetra: "Bhopal" },
  "462008": { vidhan_sabha: "Bhopal Uttar", vidhan_sabhas: ["Bhopal Uttar", "Bhopal Madhya"], sansad_kshetra: "Bhopal" },
  "462010": { vidhan_sabha: "Narela", vidhan_sabhas: ["Narela", "Govindpura"], sansad_kshetra: "Bhopal" },
  "462011": { vidhan_sabha: "Narela", vidhan_sabhas: ["Narela", "Govindpura"], sansad_kshetra: "Bhopal" },
  "462018": { vidhan_sabha: "Narela", vidhan_sabhas: ["Narela", "Govindpura"], sansad_kshetra: "Bhopal" },
  "462021": { vidhan_sabha: "Govindpura", vidhan_sabhas: ["Govindpura", "Narela"], sansad_kshetra: "Bhopal" },
  "462022": { vidhan_sabha: "Govindpura", vidhan_sabhas: ["Govindpura", "Narela"], sansad_kshetra: "Bhopal" },
  "462023": { vidhan_sabha: "Govindpura", vidhan_sabhas: ["Govindpura", "Narela"], sansad_kshetra: "Bhopal" },
  "462024": { vidhan_sabha: "Govindpura", vidhan_sabhas: ["Govindpura", "Narela"], sansad_kshetra: "Bhopal" },
  "462026": { vidhan_sabha: "Bhopal Madhya", vidhan_sabhas: ["Bhopal Madhya", "Bhopal Uttar", "Bhopal Dakshin-Pashchim"], sansad_kshetra: "Bhopal" },
  "462004": { vidhan_sabha: "Bhopal Madhya", vidhan_sabhas: ["Bhopal Madhya", "Bhopal Uttar", "Bhopal Dakshin-Pashchim"], sansad_kshetra: "Bhopal" },
  "462007": { vidhan_sabha: "Bhopal Madhya", vidhan_sabhas: ["Bhopal Madhya", "Bhopal Uttar", "Bhopal Dakshin-Pashchim"], sansad_kshetra: "Bhopal" },
  "462016": { vidhan_sabha: "Bhopal Dakshin-Pashchim", vidhan_sabhas: ["Bhopal Dakshin-Pashchim", "Bhopal Madhya", "Huzur"], sansad_kshetra: "Bhopal" },
  "462030": { vidhan_sabha: "Bhopal Dakshin-Pashchim", vidhan_sabhas: ["Bhopal Dakshin-Pashchim", "Bhopal Madhya", "Huzur"], sansad_kshetra: "Bhopal" },
  "462009": { vidhan_sabha: "Huzur", vidhan_sabhas: ["Huzur", "Bhopal Dakshin-Pashchim"], sansad_kshetra: "Bhopal" },
  "462042": { vidhan_sabha: "Huzur", vidhan_sabhas: ["Huzur", "Bhopal Dakshin-Pashchim"], sansad_kshetra: "Bhopal" },
  "466001": { vidhan_sabha: "Budhni", vidhan_sabhas: ["Budhni", "Ichhawar"], sansad_kshetra: "Vidisha" },
  "452001": { vidhan_sabha: "Indore-1", vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau"], sansad_kshetra: "Indore" },
  "452002": { vidhan_sabha: "Indore-2", vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau"], sansad_kshetra: "Indore" },
  "452003": { vidhan_sabha: "Indore-3", vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau"], sansad_kshetra: "Indore" },
  "452004": { vidhan_sabha: "Indore-4", vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau"], sansad_kshetra: "Indore" },
  "452010": { vidhan_sabha: "Indore-5", vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau"], sansad_kshetra: "Indore" },
  "452011": { vidhan_sabha: "Rau", vidhan_sabhas: ["Rau", "Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5"], sansad_kshetra: "Indore" },
  "453441": { vidhan_sabha: "Mhow", vidhan_sabhas: ["Mhow", "Rau"], sansad_kshetra: "Dhar" }
};
// Find every Assembly Constituency for a given district from the full India dataset.
// This is what makes Vidhan Sabha resolution work correctly for ANY district/state,
// not just the handful that used to be hardcoded below.
function findConstituenciesByDistrict(district: string, state?: string) {
  const geoJson = loadACGeoJson();
  if (!geoJson || !Array.isArray(geoJson.features)) return null;

  const targetDistrict = district.trim().toLowerCase();
  const targetState = state ? state.trim().toLowerCase() : null;

  const seen = new Set<string>();
  const matches: { vidhan_sabha: string, sansad_kshetra: string }[] = [];

  for (const feature of geoJson.features) {
    const props = feature.properties;
    if (!props) continue;
    const dist = (props.DIST_NAME || "").toLowerCase();
    const st = (props.ST_NAME || "").toLowerCase();

    if (dist !== targetDistrict) continue;
    if (targetState && !st.includes(targetState) && !targetState.includes(st)) continue;

    const acName = props.AC_NAME;
    if (!acName || seen.has(acName)) continue;
    seen.add(acName);
    matches.push({ vidhan_sabha: acName, sansad_kshetra: props.PC_NAME || "" });
  }

  return matches.length > 0 ? matches : null;
}

export function loadACGeoJson() {
  if (acGeoJsonData || acGeoJsonLoadAttempted) return acGeoJsonData;
  acGeoJsonLoadAttempted = true;
  try {
    const geoJsonPath = path.join(process.cwd(), "maps-master", "maps-master", "website", "docs", "data", "geojson", "ac.geojson");
    if (fs.existsSync(geoJsonPath)) {
      const fileContent = fs.readFileSync(geoJsonPath, "utf-8");
      acGeoJsonData = JSON.parse(fileContent);
      console.log(`[AC GeoJSON] Loaded ${acGeoJsonData?.features?.length || 0} constituency features`);
    } else {
      console.warn("[AC GeoJSON] File not found at", geoJsonPath, "- falling back to limited built-in dataset");
    }
  } catch (err: any) {
    console.error("[AC GeoJSON] Failed to load:", err.message);
  }
  return acGeoJsonData;
}

export // Resolve constituencies from district and office/locality area keywords
function resolveConstituency(pincode: string, district: string, areas: string[], state?: string) {
  // 1. Check exact pincode map (highest confidence, hand-verified entries)
  if (PINCODE_CONSTITUENCY_MAP[pincode]) {
    return PINCODE_CONSTITUENCY_MAP[pincode];
  }

  const areaString = areas.join(" ").toLowerCase();

  // 2. Use the full India AC dataset, matched by district - this covers every
  // district/state, not just the ones previously hardcoded.
  const geoMatches = findConstituenciesByDistrict(district, state);
  if (geoMatches) {
    const vidhan_sabhas = geoMatches.map(m => m.vidhan_sabha);
    const sansad_kshetra = geoMatches[0]?.sansad_kshetra || (district + " Lok Sabha constituency");

    // If only one AC exists in this district, it's an exact match
    if (geoMatches.length === 1) {
      return { vidhan_sabha: geoMatches[0].vidhan_sabha, vidhan_sabhas, sansad_kshetra };
    }

    // Try to narrow down using the post-office/area names for this pincode
    const nameMatch = geoMatches.find(m => areaString.includes(m.vidhan_sabha.toLowerCase()));
    if (nameMatch) {
      return { vidhan_sabha: nameMatch.vidhan_sabha, vidhan_sabhas, sansad_kshetra };
    }

    // Multiple ACs and no confident match - let the user pick from the dropdown
    return { vidhan_sabha: "", vidhan_sabhas, sansad_kshetra };
  }

  // 3. Legacy heuristic matching for Bhopal/Indore (kept as a safety net in case
  // the geojson dataset is unavailable on this server)
  if (district.toLowerCase() === "bhopal") {
    if (areaString.includes("narela") || areaString.includes("m.l. nagar") || areaString.includes("ml nagar") || areaString.includes("eintkhedi")) {
      return {
        vidhan_sabha: "Narela",
        vidhan_sabhas: ["Narela", "Bhopal Uttar", "Govindpura", "Bhopal Madhya", "Bhopal Dakshin-Pashchim", "Huzur"],
        sansad_kshetra: "Bhopal"
      };
    }
    if (areaString.includes("govindpura") || areaString.includes("piplani") || areaString.includes("industrial area") || areaString.includes("bhel")) {
      return {
        vidhan_sabha: "Govindpura",
        vidhan_sabhas: ["Govindpura", "Narela", "Bhopal Uttar", "Bhopal Madhya", "Bhopal Dakshin-Pashchim", "Huzur"],
        sansad_kshetra: "Bhopal"
      };
    }
    if (areaString.includes("huzur") || areaString.includes("bairagarh") || areaString.includes("lalghati") || areaString.includes("gandhi nagar")) {
      return {
        vidhan_sabha: "Huzur",
        vidhan_sabhas: ["Huzur", "Bhopal Dakshin-Pashchim", "Bhopal Uttar", "Bhopal Madhya", "Govindpura", "Narela"],
        sansad_kshetra: "Bhopal"
      };
    }
    if (areaString.includes("dakshin") || areaString.includes("pashchim") || areaString.includes("tt nagar") || areaString.includes("new market") || areaString.includes("arera")) {
      return {
        vidhan_sabha: "Bhopal Dakshin-Pashchim",
        vidhan_sabhas: ["Bhopal Dakshin-Pashchim", "Bhopal Madhya", "Huzur", "Bhopal Uttar", "Govindpura", "Narela"],
        sansad_kshetra: "Bhopal"
      };
    }
    if (areaString.includes("madhya") || areaString.includes("jehangirabad") || areaString.includes("chola") || areaString.includes("aishbagh")) {
      return {
        vidhan_sabha: "Bhopal Madhya",
        vidhan_sabhas: ["Bhopal Madhya", "Bhopal Uttar", "Bhopal Dakshin-Pashchim", "Narela", "Govindpura", "Huzur"],
        sansad_kshetra: "Bhopal"
      };
    }
    return {
      vidhan_sabha: "",
      vidhan_sabhas: ["Bhopal Uttar", "Bhopal Madhya", "Bhopal Dakshin-Pashchim", "Narela", "Govindpura", "Huzur"],
      sansad_kshetra: "Bhopal"
    };
  }

  if (district.toLowerCase() === "indore") {
    if (areaString.includes("mhow")) {
      return {
        vidhan_sabha: "Mhow",
        vidhan_sabhas: ["Mhow", "Rau", "Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5"],
        sansad_kshetra: "Dhar"
      };
    }
    if (areaString.includes("rau") || areaString.includes("rajendra nagar")) {
      return {
        vidhan_sabha: "Rau",
        vidhan_sabhas: ["Rau", "Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Mhow"],
        sansad_kshetra: "Indore"
      };
    }
    return {
      vidhan_sabha: "",
      vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau", "Mhow"],
      sansad_kshetra: "Indore"
    };
  }

  // 4. Fallback to generic district matching against the small built-in list
  const matches = MP_CONSTITUENCIES_MOCK.filter(c => c.district.toLowerCase() === district.toLowerCase());
  const sansad_kshetra = matches.length > 0 ? matches[0].sansad_kshetra : (district + " Lok Sabha constituency");
  const vidhan_sabhas = matches.map(c => c.vidhan_sabha);

  return {
    vidhan_sabha: vidhan_sabhas.length === 1 ? vidhan_sabhas[0] : "",
    vidhan_sabhas: vidhan_sabhas.length > 0 ? vidhan_sabhas : [district + " Assembly Constituency"],
    sansad_kshetra
  };
}
