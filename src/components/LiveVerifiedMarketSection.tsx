import React, { useState, useEffect, useCallback } from "react";
import {
  Sun,
  Coins,
  Carrot,
  Wheat,
  ChevronRight,
  ExternalLink,
  X,
  Sparkles,
  TrendingUp,
  Minus,
  Clock,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  ChevronDown,
  Navigation,
  Loader2,
  Fuel
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { openExternalLink } from "../utils/browser";

interface CityItem {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
}

const FALLBACK_CITIES: CityItem[] = [
  { id: "indore", name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lon: 75.8577 },
  { id: "bhopal", name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lon: 77.4126 },
  { id: "lucknow", name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lon: 80.9462 },
  { id: "delhi", name: "Delhi", state: "Delhi NCR", lat: 28.6139, lon: 77.2090 },
  { id: "gwalior", name: "Gwalior", state: "Madhya Pradesh", lat: 26.2183, lon: 78.1828 },
  { id: "ujjain", name: "Ujjain", state: "Madhya Pradesh", lat: 23.1765, lon: 75.7885 },
  { id: "jabalpur", name: "Jabalpur", state: "Madhya Pradesh", lat: 23.1815, lon: 79.9864 },
  { id: "kanpur", name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lon: 80.3319 },
  { id: "varanasi", name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lon: 82.9739 },
  { id: "jaipur", name: "Jaipur", state: "Rajasthan", lat: 26.9124, lon: 75.7873 },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra", lat: 19.0760, lon: 72.8777 },
  { id: "raipur", name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lon: 81.6296 }
];

function findNearestCity(lat: number, lon: number): CityItem {
  let closest = FALLBACK_CITIES[0];
  let minDiff = Infinity;
  for (const c of FALLBACK_CITIES) {
    const d = (c.lat - lat) ** 2 + (c.lon - lon) ** 2;
    if (d < minDiff) {
      minDiff = d;
      closest = c;
    }
  }
  return closest;
}

interface MarketSummary {
  panchang: {
    source: string;
    sourceUrl: string;
    date: string;
    location: string;
    sunrise: string;
    sunset: string;
    tithi: string;
    nakshatra: string;
    paksha: string;
    samvat: string;
    yoga: string;
    karana: string;
    abhijitMuhurat: string;
    rahukaal: string;
  };
  bullion: {
    source: string;
    sourceUrl: string;
    gold24k: string;
    gold22k: string;
    gold18k: string;
    silver: string;
    unit: string;
  };
  vegetables: {
    source: string;
    sourceUrl: string;
    market: string;
    items: { name: string; price: string; change: string }[];
  };
  mandiPulse: {
    source: string;
    sourceUrl: string;
    updates: { title: string; desc: string }[];
  };
  fuel: { source: string; sourceUrl: string; city: string; petrol: string; diesel: string; lpgDomestic: string; lpgCommercial: string; cng: string; updatedAt: string };
  updatedAt: string;
}

type ActiveSheet = null | "panchang" | "bullion" | "vegetables" | "mandi" | "fuel";

export default function LiveVerifiedMarketSection() {
  const [cities, setCities] = useState<CityItem[]>(FALLBACK_CITIES);\n  const [selectedState, setSelectedState] = useState<string>(() => localStorage.getItem("@rpf_selected_market_state") || "Madhya Pradesh");\n  const [selectedCity, setSelectedCity] = useState<CityItem>(() => {
    try {
      const saved = localStorage.getItem("@rpf_selected_market_city");
      if (saved) {
        const found = FALLBACK_CITIES.find((c) => c.id === saved);
        if (found) return found;
      }
    } catch {}
    return FALLBACK_CITIES[0]; // Default Indore
  });

  const [data, setData] = useState<MarketSummary | null>(() => {
    try {
      const cached = localStorage.getItem(`@rpf_market_cache_${selectedCity?.id || "indore"}`);
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  });

  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const [showCityPicker, setShowCityPicker] = useState<boolean>(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const availableStates = Array.from(new Set(cities.map((c) => c.state))).sort();
  const citiesInState = cities.filter((c) => c.state === selectedState).sort((a, b) => a.name.localeCompare(b.name));

  const fetchMarketData = useCallback((cityId: string) => {
    setIsLoadingData(true);
    axios
      .get(`/api/public/market-summary?city=${cityId}`)
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          setData(res.data.data);
          try {
            localStorage.setItem(`@rpf_market_cache_${cityId}`, JSON.stringify(res.data.data));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn("Could not load verified market summary for city:", cityId, err);
      })
      .finally(() => {
        setIsLoadingData(false);
      });
  }, []);

  useEffect(() => {
    axios.get("/api/public/market-cities")
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          const discovered = res.data.data.map((c: any) => ({
            id: c.id, name: c.name, state: c.state
          })) as CityItem[];
          if (discovered.length) {
            setCities(discovered);
            const saved = localStorage.getItem("@rpf_selected_market_city");
            const savedCity = discovered.find((c) => c.id === saved);
            if (savedCity) {
              setSelectedCity(savedCity);
              setSelectedState(savedCity.state);
            } else if (!discovered.some((c) => c.id === selectedCity.id)) {
              const fallback = discovered.find((c) => c.id === "indore") || discovered[0];
              setSelectedCity(fallback);
              setSelectedState(fallback.state);
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchMarketData(selectedCity.id);
  }, [selectedCity.id, fetchMarketData]);

  // Optional: Auto-detect GPS on first visit if user hasn't explicitly chosen yet
  useEffect(() => {
    const hasChosen = localStorage.getItem("@rpf_selected_market_city");
    if (!hasChosen && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const nearest = findNearestCity(pos.coords.latitude, pos.coords.longitude);
          if (nearest && nearest.id !== selectedCity.id) {
            setSelectedCity(nearest);
            try {
              localStorage.setItem("@rpf_selected_market_city", nearest.id);
            } catch {}
          }
        },
        () => {
          // Geolocation denied or unavailable; graceful fallback to default
        },
        { timeout: 5000, maximumAge: 600000 }
      );
    }
  }, []);

  const handleSelectCity = (city: CityItem) => {
    setSelectedCity(city);
    setSelectedState(city.state);
    try { localStorage.setItem("@rpf_selected_market_state", city.state); } catch {}
    setShowCityPicker(false);
    try {
      localStorage.setItem("@rpf_selected_market_city", city.id);
    } catch {}
  };

  const handleDetectGPS = () => {
    if (!("geolocation" in navigator)) {
      alert("GPS Geolocation is not supported by your browser/device.");
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingLocation(false);
        const nearest = findNearestCity(pos.coords.latitude, pos.coords.longitude);
        handleSelectCity(nearest);
      },
      (err) => {
        setIsDetectingLocation(false);
        console.warn("GPS error:", err);
        alert("Could not detect location automatically. Please select your city manually.");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <section className="pt-2">
      {/* SECTION HEADER WITH LOCATION SELECTOR */}
      <div className="mb-2 flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-[#167C5A]" />
          <h2 className="text-[13px] sm:text-[14px] font-black uppercase tracking-wider text-[#14213D]">
            Live Market & Panchang
          </h2>
        </div>

        {/* LOCATION SELECTOR PILL */}
        <button
          type="button"
          onClick={() => setShowCityPicker(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
        >
          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
          <span>{selectedCity.name}</span>
          <ChevronDown className="h-3 w-3 text-emerald-600" />
        </button>
      </div>

      {/* HORIZONTAL SWIPEABLE CARDS */}
      <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none snap-x snap-mandatory">
        {/* CARD 1: LIVE DRIK PANCHANG */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveSheet("panchang")}
          className="snap-start min-w-[215px] sm:min-w-[235px] flex-1 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 p-3.5 shadow-2xs cursor-pointer hover:border-emerald-400 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-[#15803D]">
              <div className="flex items-center gap-1.5">
                <Sun className="h-4 w-4 text-[#16A34A]" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider">Live Panchang</span>
              </div>
              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded-md">
                DrikPanchang
              </span>
            </div>

            <div className="mt-2 space-y-0.5">
              <div className="text-[13px] font-bold text-[#14213D] line-clamp-1">
                {data?.panchang?.tithi || "Panchami (Krishna Paksha)"}
              </div>
              <div className="text-[11px] font-semibold text-emerald-800 line-clamp-1">
                {data?.panchang?.samvat || "Vikram Samvat 2083 Siddharthi"}
              </div>
              <div className="text-[10.5px] text-slate-500 font-medium">
                Sunrise: {data?.panchang?.sunrise || "06:14 AM"} • Sunset: {data?.panchang?.sunset || "06:07 PM"}
              </div>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-emerald-100 flex items-center justify-between text-[10.5px]">
            <span className="text-emerald-800 font-bold">Muhurat & Timings</span>
            <span className="text-[#15803D] font-extrabold flex items-center">
              View <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </motion.div>

        {/* CARD 2: LIVE BULLION GOLD & SILVER */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveSheet("bullion")}
          className="snap-start min-w-[215px] sm:min-w-[235px] flex-1 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-white to-yellow-50/50 p-3.5 shadow-2xs cursor-pointer hover:border-amber-400 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-[#B45309]">
              <div className="flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-[#D97706]" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider">Gold & Silver</span>
              </div>
              <span className="text-[9px] font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded-md">
                AllIndiaBullion
              </span>
            </div>

            <div className="mt-2 space-y-1 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">24K Gold (10g)</span>
                <span className="font-extrabold text-[#14213D]">{data?.bullion?.gold24k || "₹1,50,786"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">22K Gold (10g)</span>
                <span className="font-extrabold text-amber-800">{data?.bullion?.gold22k || "₹1,38,120"}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-500">Silver (1kg)</span>
                <span className="font-bold text-slate-700">{data?.bullion?.silver || "₹84,500"}</span>
              </div>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-amber-100 flex items-center justify-between text-[10.5px]">
            <span className="text-amber-800 font-bold">18K / Sovereign</span>
            <span className="text-[#C2410C] font-extrabold flex items-center">
              Rates <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </motion.div>

        {/* CARD 3: LIVE VEGETABLE PRICES (CITY AWARE) */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveSheet("vegetables")}
          className="snap-start min-w-[215px] sm:min-w-[235px] flex-1 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-green-50/50 p-3.5 shadow-2xs cursor-pointer hover:border-emerald-400 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-[#166534]">
              <div className="flex items-center gap-1.5">
                <Carrot className="h-4 w-4 text-[#16A34A]" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider">Vegetable Mandi</span>
              </div>
              <span className="text-[9.5px] font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                <MapPin className="h-2.5 w-2.5 text-emerald-700" />
                {selectedCity.name}
              </span>
            </div>

            <div className="mt-2 space-y-1 text-[12px]">
              {(data?.vegetables?.items?.slice(0, 2) || [
                { name: "Onion", price: "₹28 per kg" },
                { name: "Tomato", price: "₹26 per kg" }
              ]).map((v, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">{v.name}</span>
                  <span className="font-bold text-[#14213D]">{v.price}</span>
                </div>
              ))}
              <div className="text-[10px] text-slate-500 font-medium line-clamp-1">
                {data?.vegetables?.market || `${selectedCity.name} Mandi`}
              </div>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-emerald-100 flex items-center justify-between text-[10.5px]">
            <span className="text-emerald-800 font-bold">{selectedCity.name} Rates</span>
            <span className="text-[#166534] font-extrabold flex items-center">
              All Items <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </motion.div>

        {/* CARD: FUEL & GAS */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveSheet("fuel")}
          className="snap-start min-w-[215px] sm:min-w-[235px] flex-1 rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-50/70 via-white to-amber-50/50 p-3.5 shadow-2xs cursor-pointer hover:border-orange-400 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-[#C2410C]">
              <div className="flex items-center gap-1.5">
                <Fuel className="h-4 w-4 text-[#EA580C]" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider">Fuel & Gas</span>
              </div>
              <span className="text-[9px] font-bold text-orange-800 bg-orange-100/70 px-1.5 py-0.5 rounded-md">{selectedCity.name}</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
              <div><span className="font-semibold text-slate-500">Petrol</span><div className="font-extrabold text-[#14213D]">{data?.fuel?.petrol || "—"} <span className="font-medium text-slate-400">/L</span></div></div>
              <div><span className="font-semibold text-slate-500">Diesel</span><div className="font-extrabold text-[#14213D]">{data?.fuel?.diesel || "—"} <span className="font-medium text-slate-400">/L</span></div></div>
              <div><span className="font-semibold text-slate-500">LPG</span><div className="font-extrabold text-[#14213D]">{data?.fuel?.lpgDomestic || "—"}</div></div>
              <div><span className="font-semibold text-slate-500">CNG</span><div className="font-extrabold text-[#14213D]">{data?.fuel?.cng || "—"} <span className="font-medium text-slate-400">/kg</span></div></div>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-orange-100 flex items-center justify-between text-[10.5px]">
            <span className="text-orange-800 font-bold">Latest Rates</span>
            <span className="text-[#C2410C] font-extrabold flex items-center">View <ChevronRight className="h-3 w-3" /></span>
          </div>
        </motion.div>

        {/* CARD 4: LIVE MANDI PULSE */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveSheet("mandi")}
          className="snap-start min-w-[215px] sm:min-w-[235px] flex-1 rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 p-3.5 shadow-2xs cursor-pointer hover:border-indigo-400 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-[#4338CA]">
              <div className="flex items-center gap-1.5">
                <Wheat className="h-4 w-4 text-[#4F46E5]" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider">Mandi Prices</span>
              </div>
              <span className="text-[9px] font-bold text-indigo-800 bg-indigo-100/70 px-1.5 py-0.5 rounded-md">
                MandiPulse
              </span>
            </div>

            <div className="mt-2 space-y-1">
              <div className="text-[12.5px] font-bold text-[#14213D] line-clamp-2 leading-snug">
                {data?.mandiPulse?.updates?.[0]?.title || "Latest Mandi Rates & Live Commodity Arrivals"}
              </div>
              <div className="text-[10.5px] text-slate-500 font-medium line-clamp-1">
                Soybean, Wheat, Pulses & Oilseeds Mandi Movements
              </div>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-indigo-100 flex items-center justify-between text-[10.5px]">
            <span className="text-indigo-800 font-bold">APMC Arrivals</span>
            <span className="text-[#4338CA] font-extrabold flex items-center">
              Updates <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </motion.div>
      </div>

      {/* LOCATION PICKER MODAL */}
      <AnimatePresence>
        {showCityPicker && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-t-[28px] sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  <div>
                    <h3 className="text-[16px] font-bold text-[#14213D] leading-tight">
                      Select Your Location
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Rates and mandi prices will update for your selected city
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCityPicker(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* BODY */}
              <div className="p-4 space-y-3">
                {/* GPS AUTO-DETECT BUTTON */}
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={isDetectingLocation}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isDetectingLocation ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                      <span>Detecting current location...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4 text-emerald-600" />
                      <span>Use Current Location (GPS)</span>
                    </>
                  )}
                </button>

                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 pt-1">
                  Select State & City
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {availableStates.map((state) => (
                    <button key={state} type="button" onClick={() => setSelectedState(state)}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${selectedState === state ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-700 border-slate-200"}`}>
                      {state}
                    </button>
                  ))}
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 pt-1">
                  {selectedState} — Cities ({citiesInState.length})
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto pr-0.5">
                  {citiesInState.map((c) => {
                    const isSelected = c.id === selectedCity.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCity(c)}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-500 shadow-xs"
                            : "bg-slate-50/70 hover:bg-slate-100/70 border-slate-200"
                        }`}
                      >
                        <div>
                          <div className={`text-xs font-bold ${isSelected ? "text-emerald-900" : "text-slate-800"}`}>
                            {c.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {c.state}
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BOTTOM SHEET / MODAL WITH FULL DETAILS */}
      <AnimatePresence>
        {activeSheet && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-lg max-h-[85vh] flex flex-col bg-white rounded-t-[28px] sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
            >
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-2">
                  {activeSheet === "panchang" && <Sun className="h-5 w-5 text-emerald-600" />}
                  {activeSheet === "bullion" && <Coins className="h-5 w-5 text-amber-600" />}
                  {activeSheet === "vegetables" && <Carrot className="h-5 w-5 text-emerald-600" />}
                  {activeSheet === "mandi" && <Wheat className="h-5 w-5 text-indigo-600" />}
                  {activeSheet === "fuel" && <Fuel className="h-5 w-5 text-orange-600" />}
                  <div>
                    <h3 className="text-[16px] font-bold text-[#14213D] leading-tight">
                      {activeSheet === "panchang" && "Drik Panchang Live Details"}
                      {activeSheet === "bullion" && "Live Gold & Silver Bullion Rates"}
                      {activeSheet === "vegetables" && `${selectedCity.name} Vegetable Mandi Prices`}
                      {activeSheet === "mandi" && "Mandi Prices"}
                      {activeSheet === "fuel" && `${selectedCity.name} Fuel & Gas Prices`}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Verified live from{" "}
                      {activeSheet === "panchang" && "DrikPanchang.com"}
                      {activeSheet === "bullion" && "AllIndiaBullion.com"}
                      {activeSheet === "vegetables" && `RozKaBhav.com (${selectedCity.name})`}
                      {activeSheet === "mandi" && "RozKaBhav.com"}
                      {activeSheet === "fuel" && "RozKaBhav.com"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSheet(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* MODAL BODY */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* 1. PANCHANG SHEET */}
                {activeSheet === "panchang" && data?.panchang && (
                  <div className="space-y-3.5">
                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                      <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                        {data.panchang.samvat}
                      </div>
                      <div className="text-[17px] font-black text-[#14213D]">
                        {data.panchang.tithi}
                      </div>
                      <div className="text-xs text-emerald-700 font-medium">
                        Nakshatra: {data.panchang.nakshatra}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] font-bold text-emerald-700 uppercase">Abhijit Muhurat</div>
                        <div className="font-extrabold text-slate-800 mt-0.5">{data.panchang.abhijitMuhurat}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200">
                        <div className="text-[10px] font-bold text-rose-700 uppercase">Rahu Kaal</div>
                        <div className="font-extrabold text-rose-900 mt-0.5">{data.panchang.rahukaal}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-600 uppercase">Sunrise / Sunset</div>
                        <div className="font-extrabold text-slate-800 mt-0.5">
                          {data.panchang.sunrise} / {data.panchang.sunset}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-600 uppercase">Yoga & Karana</div>
                        <div className="font-extrabold text-slate-800 mt-0.5">
                          {data.panchang.yoga} • {data.panchang.karana}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openExternalLink(data.panchang.sourceUrl)}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>View Full Panchang on DrikPanchang.com</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* 2. BULLION SHEET */}
                {activeSheet === "bullion" && data?.bullion && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-center">
                        <div className="text-[11px] font-bold text-amber-800 uppercase">24K Pure Gold</div>
                        <div className="text-[18px] font-black text-amber-950 mt-1">{data.bullion.gold24k}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{data.bullion.unit}</div>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200 text-center">
                        <div className="text-[11px] font-bold text-amber-800 uppercase">22K Standard Gold</div>
                        <div className="text-[18px] font-black text-amber-950 mt-1">{data.bullion.gold22k}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{data.bullion.unit}</div>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <div className="text-[11px] font-bold text-slate-600 uppercase">18K Jewellery Gold</div>
                        <div className="text-[18px] font-black text-slate-900 mt-1">{data.bullion.gold18k}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{data.bullion.unit}</div>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <div className="text-[11px] font-bold text-slate-600 uppercase">Silver Rate</div>
                        <div className="text-[18px] font-black text-slate-900 mt-1">{data.bullion.silver}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">Per 1 Kg</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openExternalLink(data.bullion.sourceUrl)}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Check Live City Rates on AllIndiaBullion.com</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* 3. VEGETABLES SHEET */}
                {activeSheet === "vegetables" && data?.vegetables && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-0.5">
                      <span>Market: {data.vegetables.market}</span>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {selectedCity.name}
                      </span>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5">Vegetable</th>
                            <th className="p-2.5">Today Price</th>
                            <th className="p-2.5">Change</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {data.vegetables.items.map((v, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-slate-800">{v.name}</td>
                              <td className="p-2.5 font-black text-emerald-700">{v.price}</td>
                              <td className="p-2.5 text-slate-500">{v.change}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button
                      type="button"
                      onClick={() => openExternalLink(data.vegetables.sourceUrl)}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>View Full {selectedCity.name} Report on RozKaBhav.com</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {activeSheet === "fuel" && data?.fuel && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        ["Petrol", data.fuel.petrol, "/ litre"],
                        ["Diesel", data.fuel.diesel, "/ litre"],
                        ["CNG", data.fuel.cng, "/ kg"],
                        ["Domestic LPG", data.fuel.lpgDomestic, "14.2 kg"],
                        ["Commercial LPG", data.fuel.lpgCommercial, "19 kg"]
                      ].map(([label, value, unit], idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200 text-center">
                          <div className="text-[11px] font-bold text-orange-800 uppercase">{label}</div>
                          <div className="text-[18px] font-black text-[#14213D] mt-1">{value || "—"}</div>
                          <div className="text-[10px] text-slate-500 font-semibold">{unit}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10.5px] text-slate-500 font-medium">
                      Reference prices; actual pump/distributor prices can vary by locality. Updated: {data.fuel.updatedAt ? new Date(data.fuel.updatedAt).toLocaleString("en-IN") : "—"}
                    </p>
                    <button type="button" onClick={() => openExternalLink(data.fuel.sourceUrl)}
                      className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                      <span>Check latest city fuel prices</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* 4. MANDI PULSE SHEET */}
                {activeSheet === "mandi" && data?.mandiPulse && (
                  <div className="space-y-3">
                    {data.mandiPulse.updates.map((u, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors shadow-2xs space-y-1"
                      >
                        <h4 className="text-[13px] font-bold text-[#14213D] leading-snug">{u.title}</h4>
                        <p className="text-[11.5px] text-slate-600 leading-relaxed font-medium">{u.desc}</p>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => openExternalLink(data.mandiPulse.sourceUrl)}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Explore Mandi Arrivals on MandiPulse.com</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
