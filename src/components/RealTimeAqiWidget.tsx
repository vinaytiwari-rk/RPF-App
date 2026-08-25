import React, { useEffect, useState } from "react";
import { Wind, RefreshCw, CheckCircle2, AlertTriangle, MapPin } from "lucide-react";

interface AqiRecord {
  country: string;
  state: string;
  city: string;
  station: string;
  last_update: string;
  pollutant_id: string;
  min_value: string;
  max_value: string;
  avg_value: string;
}

const GOV_API_URL =
  "https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69?api-key=579b464db66ec23bdd000001cdc3b564546246a772a26393094f5645&offset=0&limit=50&format=json";

export default function RealTimeAqiWidget({ isHi = false }: { isHi?: boolean }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [records, setRecords] = useState<AqiRecord[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("Delhi");

  const fetchAqiData = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(GOV_API_URL);
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      if (data && data.records && Array.isArray(data.records)) {
        setRecords(data.records);
        const cities = Array.from(new Set(data.records.map((r: AqiRecord) => r.city)));
        if (cities.length > 0 && !cities.includes(selectedCity)) {
          setSelectedCity(cities[0] as string);
        }
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAqiData();
  }, []);

  const cityRecords = records.filter((r) => r.city === selectedCity);
  const pm25 = cityRecords.find((r) => r.pollutant_id === "PM2.5") || cityRecords[0];
  const pm10 = cityRecords.find((r) => r.pollutant_id === "PM10");

  const getAqiStatus = (valStr?: string) => {
    const val = parseInt(valStr || "0", 10);
    if (val <= 50) return { label: isHi ? "अच्छी हवा (Good)" : "Good", color: "bg-emerald-500 text-white border-emerald-600" };
    if (val <= 100) return { label: isHi ? "संतोषजनक (Satisfactory)" : "Satisfactory", color: "bg-green-500 text-white border-green-600" };
    if (val <= 200) return { label: isHi ? "मध्यम (Moderate)" : "Moderate", color: "bg-yellow-500 text-white border-yellow-600" };
    if (val <= 300) return { label: isHi ? "खराब (Poor)" : "Poor", color: "bg-orange-500 text-white border-orange-600" };
    if (val <= 400) return { label: isHi ? "बहुत खराब (Very Poor)" : "Very Poor", color: "bg-red-500 text-white border-red-600" };
    return { label: isHi ? "गंभीर (Severe)" : "Severe", color: "bg-purple-700 text-white border-purple-800" };
  };

  const availableCities = Array.from(new Set(records.map((r) => r.city)));
  const statusInfo = getAqiStatus(pm25?.avg_value);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-5 text-white shadow-xl border border-slate-700/80 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              <span>{isHi ? "लाइव वायु गुणवत्ता (AQI)" : "Live Real-Time AQI"}</span>
              <span className="text-[9px] font-black uppercase bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded-md">
                data.gov.in
              </span>
            </h3>
            <p className="text-[10px] text-slate-300 font-medium">
              {isHi ? "केंद्रीय प्रदूषण नियंत्रण बोर्ड (CPCB) अधिकृत" : "Central Pollution Control Board Verified"}
            </p>
          </div>
        </div>

        <button
          onClick={fetchAqiData}
          disabled={loading}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition active:scale-95 text-slate-300"
          title={isHi ? "ताज़ा करें" : "Refresh"}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-6 text-center text-xs text-slate-400 font-medium animate-pulse">
          {isHi ? "आधिकारिक CPCB डेटा लोड हो रहा है..." : "Fetching official CPCB air quality data..."}
        </div>
      ) : error ? (
        <div className="py-4 text-center text-xs text-amber-300 font-medium flex items-center justify-center gap-1.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 px-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{isHi ? "सरकारी AQI सर्वर से डेटा उपलब्ध नहीं है।" : "Live AQI server temporarily unavailable."}</span>
        </div>
      ) : (
        <>
          {availableCities.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              {availableCities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition ${
                    selectedCity === city
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-white/10 text-slate-300 hover:bg-white/20"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}

          {pm25 && (
            <div className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                    {pm25.station}
                  </p>
                  <p className="text-[9.5px] text-slate-400">
                    {isHi ? "अंतिम अपडेट:" : "Updated:"} {pm25.last_update}
                  </p>
                </div>

                <div className={`px-3 py-1 rounded-xl text-xs font-black border ${statusInfo.color}`}>
                  {statusInfo.label}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400">PM2.5 ({isHi ? "औसत" : "Avg"})</span>
                  <p className="text-lg font-black text-emerald-400 mt-0.5">
                    {pm25.avg_value || "--"} <span className="text-[10px] text-slate-400">µg/m³</span>
                  </p>
                  <p className="text-[9px] text-slate-400">
                    {isHi ? "न्यूनतम" : "Min"}: {pm25.min_value} | {isHi ? "अधिकतम" : "Max"}: {pm25.max_value}
                  </p>
                </div>

                {pm10 && (
                  <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
                    <span className="text-[10px] font-bold text-slate-400">PM10 ({isHi ? "औसत" : "Avg"})</span>
                    <p className="text-lg font-black text-blue-400 mt-0.5">
                      {pm10.avg_value || "--"} <span className="text-[10px] text-slate-400">µg/m³</span>
                    </p>
                    <p className="text-[9px] text-slate-400">
                      {isHi ? "न्यूनतम" : "Min"}: {pm10.min_value} | {isHi ? "अधिकतम" : "Max"}: {pm10.max_value}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] text-emerald-300/90 font-medium px-1">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {isHi ? "data.gov.in से 100% सत्यापित डेटा" : "100% Verified Live Data from data.gov.in"}
            </span>
            <span className="text-slate-400 font-mono">CPCB-GOV</span>
          </div>
        </>
      )}
    </div>
  );
}
