import fs from 'fs';
import path from 'path';
import axios from 'axios';

let acGeoJsonData: any = null;
let acGeoJsonLoadAttempted = false;

function findConstituenciesByDistrict(district: string, state?: string) {
  const geoJson = loadACGeoJson();
  if (!geoJson || !Array.isArray(geoJson.features)) return null;
  const targetDistrict = String(district || '').trim().toLowerCase();
  const targetState = state ? String(state).trim().toLowerCase() : null;
  if (!targetDistrict) return null;
  const clean = (value: string) => value.toLowerCase().replace(/\b(district|m corp|municipal corporation|city)\b/g, '').replace(/[^a-z]/g, '');
  const cleanTargetDistrict = clean(targetDistrict);
  const seen = new Set<string>();
  const matches: { vidhan_sabha: string; sansad_kshetra: string }[] = [];
  for (const feature of geoJson.features) {
    const props = feature?.properties;
    if (!props) continue;
    const cleanDistrict = clean(String(props.DIST_NAME || ''));
    const stateName = String(props.ST_NAME || '').toLowerCase();
    if (!cleanDistrict || !cleanTargetDistrict) continue;
    if (!cleanDistrict.includes(cleanTargetDistrict) && !cleanTargetDistrict.includes(cleanDistrict)) continue;
    if (targetState && !stateName.includes(targetState) && !targetState.includes(stateName)) continue;
    const acName = String(props.AC_NAME || '').trim();
    if (!acName || seen.has(acName)) continue;
    seen.add(acName);
    matches.push({ vidhan_sabha: acName, sansad_kshetra: String(props.PC_NAME || '').trim() });
  }
  return matches.length ? matches : null;
}

export function loadACGeoJson() { return acGeoJsonData; }

export async function loadACGeoJsonAsync() {
  if (acGeoJsonData) return acGeoJsonData;
  if (acGeoJsonLoadAttempted) return acGeoJsonData;
  acGeoJsonLoadAttempted = true;
  try {
    const cachePath = path.join(process.cwd(), 'ac_cache.json');
    if (fs.existsSync(cachePath)) {
      const parsed = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      if (Array.isArray(parsed?.features)) { acGeoJsonData = parsed; return acGeoJsonData; }
    }
    const response = await axios.get('https://yashveeeeeeer.github.io/india-geodata/ac.geojson', { timeout: 60000 });
    if (Array.isArray(response.data?.features)) {
      acGeoJsonData = response.data;
      try { fs.writeFileSync(cachePath, JSON.stringify(response.data)); } catch {}
    }
  } catch (error: any) {
    console.error('[AC GeoJSON] Failed to load verified constituency dataset:', error?.message || error);
  }
  return acGeoJsonData;
}

/** Resolve only from the constituency dataset; never invent a constituency. */
export function resolveConstituency(_pincode: string, district: string, _areas: string[] = [], state?: string) {
  const matches = findConstituenciesByDistrict(district, state);
  if (!matches) return { vidhan_sabha: '', vidhan_sabhas: [], sansad_kshetra: '' };
  const vidhan_sabhas = matches.map(m => m.vidhan_sabha);
  if (matches.length === 1) return { vidhan_sabha: matches[0].vidhan_sabha, vidhan_sabhas, sansad_kshetra: matches[0].sansad_kshetra };
  const sansads = [...new Set(matches.map(m => m.sansad_kshetra).filter(Boolean))];
  return { vidhan_sabha: '', vidhan_sabhas, sansad_kshetra: sansads.length === 1 ? sansads[0] : '' };
}

// Temporary compatibility export for legacy imports. It contains no data and is not used for resolution.
export const MP_CONSTITUENCIES_MOCK: never[] = [];
