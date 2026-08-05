import fs from "fs";
import path from "path";
import axios from "axios";

let acGeoJsonData: any = null;
let acGeoJsonLoadAttempted = false;

// Small built-in fallback list (MP only)
export const MP_CONSTITUENCIES_MOCK = [
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
  { district: "Dewas", vidhan_sabha: "Dewas", sansad_kshetra: "Dewas" },
];

// Exact pincode → constituency (highest priority)
export const PINCODE_CONSTITUENCY_MAP: Record<
  string,
  { vidhan_sabha: string; vidhan_sabhas: string[]; sansad_kshetra: string }
> = {
  "462038": {
    vidhan_sabha: "Narela",
    vidhan_sabhas: ["Narela", "Bhopal Uttar", "Govindpura"],
    sansad_kshetra: "Bhopal",
  },
  "462001": {
    vidhan_sabha: "Bhopal Uttar",
    vidhan_sabhas: ["Bhopal Uttar", "Bhopal Madhya"],
    sansad_kshetra: "Bhopal",
  },
  "462002": {
    vidhan_sabha: "Bhopal Uttar",
    vidhan_sabhas: ["Bhopal Uttar", "Bhopal Madhya"],
    sansad_kshetra: "Bhopal",
  },
  "462003": {
    vidhan_sabha: "Bhopal Uttar",
    vidhan_sabhas: ["Bhopal Uttar", "Bhopal Madhya"],
    sansad_kshetra: "Bhopal",
  },
  "462008": {
    vidhan_sabha: "Bhopal Uttar",
    vidhan_sabhas: ["Bhopal Uttar", "Bhopal Madhya"],
    sansad_kshetra: "Bhopal",
  },
  "462010": {
    vidhan_sabha: "Narela",
    vidhan_sabhas: ["Narela", "Govindpura"],
    sansad_kshetra: "Bhopal",
  },
  "462011": {
    vidhan_sabha: "Narela",
    vidhan_sabhas: ["Narela", "Govindpura"],
    sansad_kshetra: "Bhopal",
  },
  "462018": {
    vidhan_sabha: "Narela",
    vidhan_sabhas: ["Narela", "Govindpura"],
    sansad_kshetra: "Bhopal",
  },
  "462021": {
    vidhan_sabha: "Govindpura",
    vidhan_sabhas: ["Govindpura", "Narela"],
    sansad_kshetra: "Bhopal",
  },
  "462022": {
    vidhan_sabha: "Govindpura",
    vidhan_sabhas: ["Govindpura", "Narela"],
    sansad_kshetra: "Bhopal",
  },
  "462023": {
    vidhan_sabha: "Govindpura",
    vidhan_sabhas: ["Govindpura", "Narela"],
    sansad_kshetra: "Bhopal",
  },
  "462024": {
    vidhan_sabha: "Govindpura",
    vidhan_sabhas: ["Govindpura", "Narela"],
    sansad_kshetra: "Bhopal",
  },
  "462026": {
    vidhan_sabha: "Bhopal Madhya",
    vidhan_sabhas: ["Bhopal Madhya", "Bhopal Uttar", "Bhopal Dakshin-Pashchim"],
    sansad_kshetra: "Bhopal",
  },
  "462004": {
    vidhan_sabha: "Bhopal Madhya",
    vidhan_sabhas: ["Bhopal Madhya", "Bhopal Uttar", "Bhopal Dakshin-Pashchim"],
    sansad_kshetra: "Bhopal",
  },
  "462007": {
    vidhan_sabha: "Bhopal Madhya",
    vidhan_sabhas: ["Bhopal Madhya", "Bhopal Uttar", "Bhopal Dakshin-Pashchim"],
    sansad_kshetra: "Bhopal",
  },
  "462016": {
    vidhan_sabha: "Bhopal Dakshin-Pashchim",
    vidhan_sabhas: ["Bhopal Dakshin-Pashchim", "Bhopal Madhya", "Huzur"],
    sansad_kshetra: "Bhopal",
  },
  "462030": {
    vidhan_sabha: "Bhopal Dakshin-Pashchim",
    vidhan_sabhas: ["Bhopal Dakshin-Pashchim", "Bhopal Madhya", "Huzur"],
    sansad_kshetra: "Bhopal",
  },
  "462009": {
    vidhan_sabha: "Huzur",
    vidhan_sabhas: ["Huzur", "Bhopal Dakshin-Pashchim"],
    sansad_kshetra: "Bhopal",
  },
  "462042": {
    vidhan_sabha: "Huzur",
    vidhan_sabhas: ["Huzur", "Bhopal Dakshin-Pashchim"],
    sansad_kshetra: "Bhopal",
  },
  "466001": {
    vidhan_sabha: "Budhni",
    vidhan_sabhas: ["Budhni", "Ichhawar"],
    sansad_kshetra: "Vidisha",
  },
  "452001": {
    vidhan_sabha: "Indore-1",
    vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau"],
    sansad_kshetra: "Indore",
  },
  "452002": {
    vidhan_sabha: "Indore-2",
    vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau"],
    sansad_kshetra: "Indore",
  },
  "452003": {
    vidhan_sabha: "Indore-3",
    vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau"],
    sansad_kshetra: "Indore",
  },
  "452004": {
    vidhan_sabha: "Indore-4",
    vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau"],
    sansad_kshetra: "Indore",
  },
  "452010": {
    vidhan_sabha: "Indore-5",
    vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau"],
    sansad_kshetra: "Indore",
  },
  "452011": {
    vidhan_sabha: "Rau",
    vidhan_sabhas: ["Rau", "Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5"],
    sansad_kshetra: "Indore",
  },
  "453441": {
    vidhan_sabha: "Mhow",
    vidhan_sabhas: ["Mhow", "Rau"],
    sansad_kshetra: "Dhar",
  },
};

function findConstituenciesByDistrict(district: string, state?: string) {
  const geoJson = loadACGeoJson();
  if (!geoJson || !Array.isArray(geoJson.features)) return null;

  const targetDistrict = district.trim().toLowerCase();
  const targetState = state ? state.trim().toLowerCase() : null;

  const seen = new Set<string>();
  const matches: { vidhan_sabha: string; sansad_kshetra: string }[] = [];

  for (const feature of geoJson.features) {
    const props = feature.properties;
    if (!props) continue;

    const distRaw = (props.DIST_NAME || "").toLowerCase();
    const st = (props.ST_NAME || "").toLowerCase();

    // Clean up district names by removing common suffixes and non-alphabet chars
    const cleanDist = distRaw.replace(/\b(district|m corp|municipal corporation|city)\b/g, '').replace(/[^a-z]/g, '');
    const cleanTargetDist = targetDistrict.replace(/\b(district|m corp|municipal corporation|city)\b/g, '').replace(/[^a-z]/g, '');

    if (!cleanDist || !cleanTargetDist) continue;
    if (!cleanDist.includes(cleanTargetDist) && !cleanTargetDist.includes(cleanDist)) continue;

    if (targetState && !st.includes(targetState) && !targetState.includes(st)) continue;

    const acName = props.AC_NAME;
    if (!acName || seen.has(acName)) continue;
    seen.add(acName);
    matches.push({
      vidhan_sabha: acName,
      sansad_kshetra: props.PC_NAME || "",
    });
  }

  return matches.length > 0 ? matches : null;
}

export function loadACGeoJson() {
  return acGeoJsonData;
}

export async function loadACGeoJsonAsync() {
  if (acGeoJsonData) return acGeoJsonData;
  if (acGeoJsonLoadAttempted) return acGeoJsonData;
  acGeoJsonLoadAttempted = true;

  try {
    const cachePath = path.join(process.cwd(), "ac_cache.json");
    if (fs.existsSync(cachePath)) {
      console.log("[AC GeoJSON] Loading constituency data from local cache...");
      const raw = fs.readFileSync(cachePath, "utf8");
      acGeoJsonData = JSON.parse(raw);
      console.log(`[AC GeoJSON] Successfully loaded ${acGeoJsonData.features?.length} constituency features from cache.`);
      return acGeoJsonData;
    }

    console.log("[AC GeoJSON] Fetching constituency data from remote (60s timeout)...");
    const res = await axios.get("https://yashveeeeeeer.github.io/india-geodata/ac.geojson", { timeout: 60000 });
    if (res.data && Array.isArray(res.data.features)) {
      acGeoJsonData = res.data;
      try {
        fs.writeFileSync(cachePath, JSON.stringify(res.data));
        console.log("[AC GeoJSON] Saved to local cache.");
      } catch (writeErr: any) {
        console.error("[AC GeoJSON] Failed to write cache:", writeErr.message);
      }
      console.log(`[AC GeoJSON] Successfully loaded ${acGeoJsonData.features.length} constituency features.`);
    }
  } catch (err: any) {
    console.error("[AC GeoJSON] Failed to load from remote:", err.message);
  }

  return acGeoJsonData;
}

/**
 * Resolve Vidhan Sabha + Sansad Kshetra for a pincode.
 * Priority:
 * 1. Exact PINCODE_CONSTITUENCY_MAP
 * 2. GeoJSON by district (+ area name match)
 * 3. Heuristics for Bhopal / Indore
 * 4. MP_CONSTITUENCIES_MOCK
 */
export function resolveConstituency(
  pincode: string,
  district: string,
  areas: string[] = [],
  state?: string
) {
  // 1. Exact map (highest confidence)
  if (PINCODE_CONSTITUENCY_MAP[pincode]) {
    return PINCODE_CONSTITUENCY_MAP[pincode];
  }

  const areaString = (areas || []).join(" ").toLowerCase();
  const distLower = (district || "").toLowerCase();

  // 2. Full India AC GeoJSON by district
  const geoMatches = findConstituenciesByDistrict(district, state);
  if (geoMatches) {
    const vidhan_sabhas = geoMatches.map((m) => m.vidhan_sabha);
    // Prefer the PC that belongs to the matched AC when possible
    let sansad_kshetra =
      geoMatches[0]?.sansad_kshetra || `${district} Lok Sabha constituency`;

    if (geoMatches.length === 1) {
      return {
        vidhan_sabha: geoMatches[0].vidhan_sabha,
        vidhan_sabhas,
        sansad_kshetra: geoMatches[0].sansad_kshetra || sansad_kshetra,
      };
    }

    const nameMatch = geoMatches.find((m) =>
      areaString.includes(m.vidhan_sabha.toLowerCase())
    );
    if (nameMatch) {
      return {
        vidhan_sabha: nameMatch.vidhan_sabha,
        vidhan_sabhas,
        sansad_kshetra: nameMatch.sansad_kshetra || sansad_kshetra,
      };
    }

    // Multiple ACs and no exact match – leave primary blank so UI can show a dropdown
    // Also leave sansad_kshetra blank so it doesn't auto-fill the wrong one
    return {
      vidhan_sabha: "",
      vidhan_sabhas,
      sansad_kshetra: "",
    };
  }

  // 3. Heuristics for Bhopal
  if (distLower === "bhopal") {
    if (
      areaString.includes("narela") ||
      areaString.includes("m.l. nagar") ||
      areaString.includes("ml nagar") ||
      areaString.includes("eintkhedi") ||
      areaString.includes("karond")
    ) {
      return {
        vidhan_sabha: "Narela",
        vidhan_sabhas: [
          "Narela",
          "Bhopal Uttar",
          "Govindpura",
          "Bhopal Madhya",
          "Bhopal Dakshin-Pashchim",
          "Huzur",
        ],
        sansad_kshetra: "Bhopal",
      };
    }
    if (
      areaString.includes("govindpura") ||
      areaString.includes("piplani") ||
      areaString.includes("industrial area") ||
      areaString.includes("bhel")
    ) {
      return {
        vidhan_sabha: "Govindpura",
        vidhan_sabhas: [
          "Govindpura",
          "Narela",
          "Bhopal Uttar",
          "Bhopal Madhya",
          "Bhopal Dakshin-Pashchim",
          "Huzur",
        ],
        sansad_kshetra: "Bhopal",
      };
    }
    if (
      areaString.includes("huzur") ||
      areaString.includes("bairagarh") ||
      areaString.includes("lalghati") ||
      areaString.includes("gandhi nagar")
    ) {
      return {
        vidhan_sabha: "Huzur",
        vidhan_sabhas: [
          "Huzur",
          "Bhopal Dakshin-Pashchim",
          "Bhopal Uttar",
          "Bhopal Madhya",
          "Govindpura",
          "Narela",
        ],
        sansad_kshetra: "Bhopal",
      };
    }
    if (
      areaString.includes("dakshin") ||
      areaString.includes("pashchim") ||
      areaString.includes("tt nagar") ||
      areaString.includes("new market") ||
      areaString.includes("arera")
    ) {
      return {
        vidhan_sabha: "Bhopal Dakshin-Pashchim",
        vidhan_sabhas: [
          "Bhopal Dakshin-Pashchim",
          "Bhopal Madhya",
          "Huzur",
          "Bhopal Uttar",
          "Govindpura",
          "Narela",
        ],
        sansad_kshetra: "Bhopal",
      };
    }
    if (
      areaString.includes("madhya") ||
      areaString.includes("jehangirabad") ||
      areaString.includes("chola") ||
      areaString.includes("aishbagh")
    ) {
      return {
        vidhan_sabha: "Bhopal Madhya",
        vidhan_sabhas: [
          "Bhopal Madhya",
          "Bhopal Uttar",
          "Bhopal Dakshin-Pashchim",
          "Narela",
          "Govindpura",
          "Huzur",
        ],
        sansad_kshetra: "Bhopal",
      };
    }
    return {
      vidhan_sabha: "",
      vidhan_sabhas: [
        "Bhopal Uttar",
        "Bhopal Madhya",
        "Bhopal Dakshin-Pashchim",
        "Narela",
        "Govindpura",
        "Huzur",
      ],
      sansad_kshetra: "Bhopal",
    };
  }

  // 3b. Heuristics for Indore
  if (distLower === "indore") {
    if (areaString.includes("mhow")) {
      return {
        vidhan_sabha: "Mhow",
        vidhan_sabhas: [
          "Mhow",
          "Rau",
          "Indore-1",
          "Indore-2",
          "Indore-3",
          "Indore-4",
          "Indore-5",
        ],
        sansad_kshetra: "Dhar",
      };
    }
    if (areaString.includes("rau") || areaString.includes("rajendra nagar")) {
      return {
        vidhan_sabha: "Rau",
        vidhan_sabhas: [
          "Rau",
          "Indore-1",
          "Indore-2",
          "Indore-3",
          "Indore-4",
          "Indore-5",
          "Mhow",
        ],
        sansad_kshetra: "Indore",
      };
    }
    return {
      vidhan_sabha: "",
      vidhan_sabhas: [
        "Indore-1",
        "Indore-2",
        "Indore-3",
        "Indore-4",
        "Indore-5",
        "Rau",
        "Mhow",
      ],
      sansad_kshetra: "Indore",
    };
  }

  // 4. Small built-in list
  const matches = MP_CONSTITUENCIES_MOCK.filter(
    (c) => c.district.toLowerCase() === distLower
  );

  if (matches.length === 0) {
    return {
      vidhan_sabha: "",
      vidhan_sabhas: district ? [`${district} Assembly Constituency`] : [],
      sansad_kshetra: district
        ? `${district} Lok Sabha constituency`
        : "",
    };
  }

  if (matches.length === 1) {
    return {
      vidhan_sabha: matches[0].vidhan_sabha,
      vidhan_sabhas: [matches[0].vidhan_sabha],
      sansad_kshetra: matches[0].sansad_kshetra,
    };
  }

  const sansad_kshetras = Array.from(
    new Set(matches.map((c) => c.sansad_kshetra))
  );
  const sansad_kshetra =
    sansad_kshetras.length === 1
      ? sansad_kshetras[0]
      : `${district} Lok Sabha constituency`;

  return {
    vidhan_sabha: "",
    vidhan_sabhas: matches.map((c) => c.vidhan_sabha),
    sansad_kshetra,
  };
}
