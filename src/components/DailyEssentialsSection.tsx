import React, { useState, useEffect } from "react";
import {
  Wheat,
  Fuel,
  Coins,
  Sun,
  Briefcase,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  ExternalLink,
  Clock,
  Sparkles,
  MapPin,
  Search,
  Calendar,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { openExternalLink } from "../utils/browser";

interface DailySummary {
  mandiSummary: {
    topCrops: { crop: string; rate: string; mandi: string; trend: "up" | "down" | "stable" }[];
    totalCropsTracked: number;
  };
  fuelSummary: {
    bhopalPetrol: string;
    bhopalDiesel: string;
    gold24k: string;
    silver: string;
    trend: "up" | "down" | "stable";
  };
  panchangSummary: {
    tithi: string;
    paksha: string;
    abhijitMuhurat: string;
    rahukaal: string;
    shloka: string;
    shlokaMeaning: string;
  };
  jobsSummary: {
    latestNotice: string;
    lastDate: string;
    vacancies: string;
    totalActiveJobs: number;
  };
  updatedAt: string;
}

type ActiveSheet = null | "mandi" | "fuel" | "panchang" | "jobs";

export default function DailyEssentialsSection() {
  const [summary, setSummary] = useState<DailySummary | null>(() => {
    try {
      const cached = localStorage.getItem("@rpf_daily_essentials_cache");
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  });

  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [mandiDistrict, setMandiDistrict] = useState("all");
  const [mandiSearch, setMandiSearch] = useState("");

  useEffect(() => {
    let alive = true;
    axios
      .get("/api/public/daily-essentials")
      .then((res) => {
        if (!alive) return;
        if (res.data?.success && res.data?.data) {
          setSummary(res.data.data);
          try {
            localStorage.setItem("@rpf_daily_essentials_cache", JSON.stringify(res.data.data));
          } catch {}
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Fetch full details when a modal is opened
  const openSheet = async (sheet: ActiveSheet) => {
    setActiveSheet(sheet);
    if (!sheet) return;
    setLoadingDetail(true);
    setDetailData(null);

    try {
      let endpoint = "";
      if (sheet === "mandi") endpoint = "/api/public/mandi-rates";
      else if (sheet === "fuel") endpoint = "/api/public/fuel-rates";
      else if (sheet === "panchang") endpoint = "/api/public/panchang";
      else if (sheet === "jobs") endpoint = "/api/public/job-notices";

      if (endpoint) {
        const res = await axios.get(endpoint);
        if (res.data?.success) {
          setDetailData(res.data.data);
        }
      }
    } catch (err) {
      console.warn("Could not load details for", sheet, err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeSheet = () => {
    setActiveSheet(null);
    setDetailData(null);
  };

  return (
    <section className="pt-2">
      {/* SECTION HEADER */}
      <div className="mb-2 flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-[#D97706]" />
          <h2 className="text-[14px] sm:text-[15px] font-black uppercase tracking-wider text-[#14213D]">
            दैनिक जीवन सेवाएं (Daily Essentials)
          </h2>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          लाइव दरें
        </span>
      </div>

      {/* HORIZONTAL SWIPEABLE CARDS */}
      <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none snap-x snap-mandatory">
        {/* CARD 1: MANDI BHAV */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => openSheet("mandi")}
          className="snap-start min-w-[210px] sm:min-w-[230px] flex-1 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/50 p-3 shadow-2xs cursor-pointer hover:border-amber-400 transition-all"
        >
          <div className="flex items-center justify-between text-[#B45309]">
            <div className="flex items-center gap-1.5">
              <Wheat className="h-4 w-4 text-[#D97706]" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider">म.प्र. मंडी भाव</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          </div>

          <div className="mt-2 space-y-1">
            {summary?.mandiSummary?.topCrops?.slice(0, 2).map((c, i) => (
              <div key={i} className="flex items-center justify-between text-[12px]">
                <span className="font-semibold text-slate-700 truncate max-w-[110px]">{c.crop}</span>
                <span className="font-bold text-[#14213D] flex items-center gap-0.5">
                  {c.rate.split(" ")[0]}
                  {c.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-emerald-600 inline" />
                  ) : (
                    <Minus className="h-3 w-3 text-slate-400 inline" />
                  )}
                </span>
              </div>
            )) || (
              <div className="text-[12px] text-slate-500 py-1 font-medium">सोयाबीन, गेहूं, चना भाव...</div>
            )}
          </div>

          <div className="mt-2.5 pt-1.5 border-t border-amber-100 flex items-center justify-between text-[10.5px]">
            <span className="text-amber-800 font-bold">इंदौर / उज्जैन / नीमच</span>
            <span className="text-[#C2410C] font-extrabold flex items-center">
              सभी भाव देखें <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </motion.div>

        {/* CARD 2: FUEL & GOLD RATES */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => openSheet("fuel")}
          className="snap-start min-w-[210px] sm:min-w-[230px] flex-1 rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50/70 via-white to-blue-50/50 p-3 shadow-2xs cursor-pointer hover:border-sky-400 transition-all"
        >
          <div className="flex items-center justify-between text-[#0369A1]">
            <div className="flex items-center gap-1.5">
              <Fuel className="h-4 w-4 text-[#0284C7]" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider">पेट्रोल व सोना भाव</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          </div>

          <div className="mt-2 space-y-1 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">पेट्रोल (भोपाल)</span>
              <span className="font-bold text-[#14213D]">{summary?.fuelSummary?.bhopalPetrol || "₹106.47"}/L</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">24K सोना (10g)</span>
              <span className="font-bold text-amber-700">{summary?.fuelSummary?.gold24k || "₹73,450"}</span>
            </div>
          </div>

          <div className="mt-2.5 pt-1.5 border-t border-sky-100 flex items-center justify-between text-[10.5px]">
            <span className="text-sky-800 font-bold">डीजल / चांदी / LPG</span>
            <span className="text-[#0284C7] font-extrabold flex items-center">
              विस्तार से <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </motion.div>

        {/* CARD 3: PANCHANG & SHUBH MUHURAT */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => openSheet("panchang")}
          className="snap-start min-w-[210px] sm:min-w-[230px] flex-1 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 p-3 shadow-2xs cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div className="flex items-center justify-between text-[#15803D]">
            <div className="flex items-center gap-1.5">
              <Sun className="h-4 w-4 text-[#16A34A]" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider">आज का पंचांग</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          </div>

          <div className="mt-2 space-y-1 text-[12px]">
            <div className="font-bold text-[#14213D] truncate">
              {summary?.panchangSummary?.paksha || "शुक्ल पक्ष"} • {summary?.panchangSummary?.tithi || "नवमी तिथि"}
            </div>
            <div className="text-[11px] text-emerald-800 font-medium truncate">
              शुभ काल: पूर्वाह्न 11:46 - 12:35 PM
            </div>
          </div>

          <div className="mt-2.5 pt-1.5 border-t border-emerald-100 flex items-center justify-between text-[10.5px]">
            <span className="text-emerald-800 font-bold">राहुकाल व श्लोक</span>
            <span className="text-[#15803D] font-extrabold flex items-center">
              पंचांग देखें <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </motion.div>

        {/* CARD 4: SARKARI JOBS & RECRUITMENT */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => openSheet("jobs")}
          className="snap-start min-w-[210px] sm:min-w-[230px] flex-1 rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/50 p-3 shadow-2xs cursor-pointer hover:border-indigo-400 transition-all"
        >
          <div className="flex items-center justify-between text-[#4338CA]">
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-[#4F46E5]" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider">सरकारी भर्ती सूचना</span>
            </div>
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
          </div>

          <div className="mt-2 space-y-0.5 text-[12px]">
            <div className="font-bold text-[#14213D] line-clamp-1">
              {summary?.jobsSummary?.latestNotice || "MP पुलिस आरक्षक भर्ती"}
            </div>
            <div className="text-[11px] text-indigo-700 font-semibold">
              अंतिम तिथि: {summary?.jobsSummary?.lastDate || "28 अक्टूबर"} ({summary?.jobsSummary?.vacancies || "7,500 पद"})
            </div>
          </div>

          <div className="mt-2.5 pt-1.5 border-t border-indigo-100 flex items-center justify-between text-[10.5px]">
            <span className="text-indigo-800 font-bold">{summary?.jobsSummary?.totalActiveJobs || 6} नई भर्तियां</span>
            <span className="text-[#4338CA] font-extrabold flex items-center">
              आवेदन करें <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </motion.div>
      </div>

      {/* INTERACTIVE BOTTOM SHEET / MODAL */}
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
                  {activeSheet === "mandi" && <Wheat className="h-5 w-5 text-amber-600" />}
                  {activeSheet === "fuel" && <Fuel className="h-5 w-5 text-sky-600" />}
                  {activeSheet === "panchang" && <Sun className="h-5 w-5 text-emerald-600" />}
                  {activeSheet === "jobs" && <Briefcase className="h-5 w-5 text-indigo-600" />}
                  <h3 className="text-[17px] font-bold text-[#14213D]">
                    {activeSheet === "mandi" && "म.प्र. कृषि उपज मंडी भाव"}
                    {activeSheet === "fuel" && "ईंधन दरें एवं सोना-चांदी भाव"}
                    {activeSheet === "panchang" && "दैनिक पंचांग व शुभ मुहूर्त"}
                    {activeSheet === "jobs" && "ताज़ा सरकारी नौकरी एवं भर्ती"}
                  </h3>
                </div>
                <button
                  onClick={closeSheet}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* MODAL BODY */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* 1. MANDI DETAILS */}
                {activeSheet === "mandi" && (
                  <div className="space-y-3">
                    {/* District selector */}
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {detailData?.mandis?.map((m: any) => (
                        <button
                          key={m.id}
                          onClick={() => setMandiDistrict(m.id)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg shrink-0 transition-colors ${
                            mandiDistrict === m.id
                              ? "bg-amber-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {m.nameHi || m.name}
                        </button>
                      ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="फसल खोजें (उदा. सोयाबीन, गेहूं, चना, लहसुन)..."
                        value={mandiSearch}
                        onChange={(e) => setMandiSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    {/* Rates Table / Cards */}
                    <div className="space-y-2">
                      {(detailData?.rates || [])
                        .filter((r: any) => {
                          const matchesDistrict = mandiDistrict === "all" || r.district === mandiDistrict;
                          const matchesSearch =
                            !mandiSearch ||
                            r.crop.toLowerCase().includes(mandiSearch.toLowerCase()) ||
                            r.cropHi.includes(mandiSearch) ||
                            r.mandi.toLowerCase().includes(mandiSearch.toLowerCase());
                          return matchesDistrict && matchesSearch;
                        })
                        .map((r: any) => (
                          <div
                            key={r.id}
                            className="p-3 rounded-xl border border-slate-200 bg-white hover:border-amber-300 transition-colors shadow-2xs flex items-center justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[13px] text-[#14213D]">{r.cropHi}</span>
                                <span className="text-[10px] text-slate-500">({r.mandi})</span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                न्यूनतम: ₹{r.minPrice} | अधिकतम: ₹{r.maxPrice} | आवक: {r.arrival || "उपलब्ध"}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[14px] font-black text-amber-700">
                                ₹{r.modalPrice}
                              </div>
                              <div className="text-[9.5px] font-semibold text-slate-500">{r.unit}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 2. FUEL & BULLION DETAILS */}
                {activeSheet === "fuel" && (
                  <div className="space-y-4">
                    {/* Bullion Highlight */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-300/60">
                      <div className="text-center">
                        <div className="text-[10px] font-bold text-amber-800 uppercase">24K सोना (10g)</div>
                        <div className="text-[14px] font-black text-amber-900 mt-0.5">
                          ₹{detailData?.bullion?.gold24k?.toLocaleString("en-IN") || "73,450"}
                        </div>
                      </div>
                      <div className="text-center border-x border-amber-300/40">
                        <div className="text-[10px] font-bold text-amber-800 uppercase">22K सोना (10g)</div>
                        <div className="text-[14px] font-black text-amber-900 mt-0.5">
                          ₹{detailData?.bullion?.gold22k?.toLocaleString("en-IN") || "67,350"}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] font-bold text-slate-700 uppercase">चांदी (1 Kg)</div>
                        <div className="text-[14px] font-black text-slate-800 mt-0.5">
                          ₹{detailData?.bullion?.silver?.toLocaleString("en-IN") || "84,500"}
                        </div>
                      </div>
                    </div>

                    {/* Fuel Table */}
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5">शहर / जिला</th>
                            <th className="p-2.5">पेट्रोल (₹/L)</th>
                            <th className="p-2.5">डीजल (₹/L)</th>
                            <th className="p-2.5">LPG (14.2kg)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(detailData?.cities || []).map((c: any) => (
                            <tr key={c.city} className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-slate-800">{c.cityHi || c.city}</td>
                              <td className="p-2.5 font-semibold text-rose-700">₹{c.petrol.toFixed(2)}</td>
                              <td className="p-2.5 font-semibold text-blue-700">₹{c.diesel.toFixed(2)}</td>
                              <td className="p-2.5 text-slate-600">₹{c.lpg.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. PANCHANG DETAILS */}
                {activeSheet === "panchang" && (
                  <div className="space-y-3.5">
                    {/* Samvat & Tithi */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                      <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                        {detailData?.samvat || "विक्रम संवत 2082"}
                      </div>
                      <div className="text-[16px] font-black text-[#14213D] mt-0.5">
                        {detailData?.paksha} • {detailData?.tithi}
                      </div>
                      <div className="text-xs text-emerald-700 font-medium mt-0.5">
                        नक्षत्र: {detailData?.nakshatra} ({detailData?.nakshatraTill})
                      </div>
                    </div>

                    {/* Timings Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] font-bold text-emerald-700 uppercase">अभिजीत मुहूर्त (शुभ काल)</div>
                        <div className="font-extrabold text-slate-800 mt-0.5">{detailData?.abhijitMuhurat}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200">
                        <div className="text-[10px] font-bold text-rose-700 uppercase">राहुकाल (त्याज्य काल)</div>
                        <div className="font-extrabold text-rose-900 mt-0.5">{detailData?.rahukaal}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-600 uppercase">सूर्योदय / सूर्यास्त</div>
                        <div className="font-extrabold text-slate-800 mt-0.5">
                          {detailData?.sunrise} / {detailData?.sunset}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-600 uppercase">योग व करण</div>
                        <div className="font-extrabold text-slate-800 mt-0.5">
                          {detailData?.yoga} • {detailData?.karana}
                        </div>
                      </div>
                    </div>

                    {/* Today's Shloka */}
                    {detailData?.shlokaOfDay && (
                      <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
                        <div className="text-[10.5px] font-bold text-amber-800 uppercase tracking-wider">
                          दैनिक वैदिक सुभाषितम् ({detailData.shlokaOfDay.source})
                        </div>
                        <div className="mt-1 font-serif text-[13px] font-bold text-[#14213D] leading-relaxed">
                          {detailData.shlokaOfDay.sanskrit}
                        </div>
                        <div className="mt-1.5 text-xs text-slate-700 leading-relaxed font-medium">
                          <span className="font-bold text-amber-900">भावार्थ: </span>
                          {detailData.shlokaOfDay.hindi}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. SARKARI JOBS DETAILS */}
                {activeSheet === "jobs" && (
                  <div className="space-y-3">
                    {(Array.isArray(detailData) ? detailData : []).map((job: any) => (
                      <div
                        key={job.id}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 shadow-2xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              {job.isNew && (
                                <span className="text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white px-1.5 py-0.5 rounded-md">
                                  NEW
                                </span>
                              )}
                              <span className="text-[11px] font-bold text-indigo-700">{job.departmentHi || job.department}</span>
                            </div>
                            <h4 className="text-[13.5px] font-bold text-[#14213D] mt-0.5">{job.titleHi || job.title}</h4>
                          </div>
                          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                            {job.vacancies}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 space-y-0.5">
                          <div>
                            <span className="font-semibold text-slate-700">योग्यता: </span>
                            {job.qualificationHi || job.qualification}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">अंतिम तिथि: </span>
                            <span className="font-bold text-rose-700">{job.lastDate}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            onClick={() => openExternalLink(job.applyUrl)}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                            <span>पोर्टल पर आवेदन करें</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
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
