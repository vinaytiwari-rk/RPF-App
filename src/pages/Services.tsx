import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import {
  Search,
  Compass,
  Globe,
  ChevronRight,
  Newspaper,
  GraduationCap,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { openExternalLink } from "../utils/browser";

export default function Services() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { servicesList, isLoadingServices } = useApp();
  const navigate = useNavigate();
  const isHi = lang === "hi";
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [webResults, setWebResults] = useState<any[]>([]);
  const [webLoading, setWebLoading] = useState(false);

  const HEALTH_SERVICES = [
    "health-care",
    "women-safety",
    "seniors",
    "medicine",
    "blood",
    "food",
  ];
  const EDUCATION_SERVICES = ["education", "scholarships", "skills"];
  const GOV_SERVICES = ["card", "schemes", "farmer", "grievance", "disaster"];
  const COMMUNITY_SERVICES = [
    "donations",
    "volunteers",
    "animals",
    "environment",
    "crowdfunding",
    "culture",
    "sos",
    "youth",
    "nation",
  ];
  const REMOVED_SERVICE_IDS = [
    "gps-toolkit",
    "fuel-tracker",
    "earthquakes",
    "global-guide",
    "transit-planner",
    "internet-radio",
    "news-feed",
    "hindu-calendar",
    "audiobooks",
    "doc-scanner",
    "resume-builder",
    "ai-chat",
    "medical-dict",
    "vitals",
    "medications",
    "med-reminder",
    "period-tracker",
    "child-tracker",
    "job-portal",
    "jobportal",
    "scholarships",
    "skills",
    "education-aid",
    "story-library",
    "medical-aid",
    "utility-center",
    "device-tools",
    "pomodoro",
    "bmi-calculator",
    "split-bill",
    "decision-maker",
    "morse-code",
    "habit-tracker",
    "fasting-tracker",
    "typing-speed",
    "quick-calculator",
    "calculator-center",
    "breathing-meditator",
  ];

  const categories = [
    { id: "all", en: "All", hi: "सभी" },
    { id: "health", en: "Health", hi: "स्वास्थ्य" },
    { id: "education", en: "Education", hi: "शिक्षा" },
    { id: "community", en: "Community", hi: "समुदाय" },
    { id: "government", en: "Government", hi: "सरकार" },
  ];

  const filtered = (
    Array.isArray(servicesList)
      ? servicesList.filter((s: any) => {
          if (!s || REMOVED_SERVICE_IDS.includes(s.id)) return false;
          const matchesCat =
            category === "all" ||
            (category === "health" && HEALTH_SERVICES.includes(s.id)) ||
            (category === "education" && EDUCATION_SERVICES.includes(s.id)) ||
            (category === "community" && COMMUNITY_SERVICES.includes(s.id)) ||
            (category === "government" && GOV_SERVICES.includes(s.id));
          const q = search.toLowerCase();
          return (
            matchesCat &&
            ((s.titleEn ?? "").toLowerCase().includes(q) ||
              (s.titleHi ?? "").toLowerCase().includes(q))
          );
        })
      : []
  ).sort((a, b) => (a?.featured === b?.featured ? 0 : a?.featured ? -1 : 1));

  useEffect(() => {
    if (!search.trim()) {
      setWebResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setWebLoading(true);
      try {
        const res = await fetch(
          `/api/search/external?query=${encodeURIComponent(search.trim())}`,
          { signal: AbortSignal.timeout(8000) },
        );
        if (res.ok) {
          const data = await res.json();
          setWebResults(data.results ?? []);
        }
      } catch {
        setWebResults([]);
      } finally {
        setWebLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [search]);

  const routeFor = (id: string) =>
    id === "card"
      ? "/jan-seva-card"
      : id === "blood"
        ? "/blood-network"
        : id === "donations"
          ? "/donations"
          : id === "health-care"
            ? "/health-care"
            : id === "grievance"
              ? "/grievance"
              : id === "culture"
                ? "/culture"
                : id === "internet-radio"
                  ? "/internet-radio"
                  : id === "news-feed"
                    ? "/news"
                    : id === "hindu-calendar"
                      ? "/hindu-calendar"
                      : id === "doc-scanner"
                        ? "/doc-scanner"
                        : id === "resume-builder"
                          ? "/resume-builder"
                          : id === "schemes"
                            ? `/browser?url=${encodeURIComponent("https://www.myscheme.gov.in/find-scheme")}`
                            : `/services/${id}`;

  return (
    <div className="p-4 flex-1 flex flex-col min-h-screen bg-slate-50 pb-28">
      <div className="space-y-5">
        <div className="space-y-4 pt-4">
          <div>
            <h3 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">
              {isHi ? "खोजें" : "Explore"}
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              {isHi
                ? "RP Foundation की सभी सेवाएं"
                : "Discover all services & tools"}
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isHi ? "क्या खोज रहे हैं?..." : "What are you looking for?..."
              }
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#000080]/10 focus:border-[#000080]/30 transition-all placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold ${category === c.id ? "bg-[#000080] text-white shadow-md" : "bg-white text-slate-600 border border-slate-200"}`}
            >
              {isHi ? c.hi : c.en}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate("/epaper")}
            className="group flex min-h-[88px] items-center gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-[#fff8e7] via-white to-indigo-50 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#a84424] text-white shadow-sm">
              <Newspaper className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-black text-[#3b1f1f]">
                {isHi ? "ई-पेपर" : "Epaper"}
              </h4>
              <p className="mt-1 text-[11px] font-medium text-slate-500">
                {isHi
                  ? "आज के प्रमुख दैनिक ई-पेपर एक ही जगह पढ़ें"
                  : "Read today's leading daily e-papers in one place"}
              </p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-amber-100">
              <ChevronRight className="h-4 w-4 text-[#a84424]" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate("/directory")}
            className="group flex min-h-[88px] items-center gap-4 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-sky-50 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-black text-blue-950">
                {isHi ? "निर्देशिका" : "Directory"}
              </h4>
              <p className="mt-1 text-[11px] font-medium text-slate-500">
                {isHi
                  ? "सरकारी संपर्क और उपयोगिता"
                  : "Gov Contacts & Utilities"}
              </p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-blue-100">
              <ChevronRight className="h-4 w-4 text-blue-700" />
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              openExternalLink("https://www.peoplesuniversity.edu.in/", navigate)
            }
            className="group flex min-h-[88px] items-center gap-4 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-sky-50 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[.99]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-700 text-white shadow-sm">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-black text-indigo-950">
                {isHi ? "पीपुल्स यूनिवर्सिटी" : "People's University"}
              </h4>
              <p className="mt-1 text-[11px] font-medium text-slate-500">
                {isHi ? "आधिकारिक वेबसाइट" : "Official website"}
              </p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-indigo-100">
              <ChevronRight className="h-4 w-4 text-indigo-700" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate("/fact-check")}
            className="group flex min-h-[88px] items-center gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-teal-50 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-black text-emerald-950">
                {isHi ? "फैक्ट चेक" : "Fact Check"}
              </h4>
              <p className="mt-1 text-[11px] font-medium text-slate-500">
                {isHi
                  ? "वायरल दावों और खबरों की जांच करें"
                  : "Check claims and news before sharing"}
              </p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-emerald-100">
              <ChevronRight className="h-4 w-4 text-emerald-700" />
            </div>
          </button>
        </div>

        {isLoadingServices ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#000080] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-1">
            {filtered.map((svc, idx) => {
              const route = routeFor(svc.id);
              const IconComponent =
                (LucideIcons as any)[svc.iconName || "Compass"] || Compass;
              const gradients = [
                "bg-blue-50 text-blue-600",
                "bg-orange-50 text-orange-600",
                "bg-green-50 text-green-600",
                "bg-purple-50 text-purple-600",
                "bg-rose-50 text-rose-600",
                "bg-indigo-50 text-indigo-600",
              ];
              return (
                <div
                  key={svc.id}
                  onClick={() => {
                    if (route.startsWith("/browser?url=")) {
                      const url = decodeURIComponent(route.split("url=")[1]);
                      openExternalLink(url, navigate);
                    } else {
                      navigate(route);
                    }
                  }}
                  className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-all cursor-pointer hover:shadow-md"
                >
                  <div
                    className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-xl ${gradients[idx % gradients.length]}`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-800 leading-tight truncate">
                      {isHi ? svc.titleHi : svc.titleEn}
                    </h4>
                    <p className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-1">
                      {isHi ? svc.descHi : svc.descEn}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 border border-slate-100">
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoadingServices && filtered.length === 0 && (
          <div className="py-12 text-center">
            <Search className="mx-auto h-6 w-6 text-slate-400" />
            <p className="text-sm font-bold text-slate-700 mt-3">
              {isHi ? "कोई सेवा नहीं मिली" : "No services found"}
            </p>
          </div>
        )}

        {search.trim() && (
          <div className="pt-2">
            {webLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-[#000080] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              webResults.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                  <p className="text-[11px] font-extrabold text-[#000080] uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Globe className="w-3.5 h-3.5" />
                    {isHi ? "वेब परिणाम" : "Web Results"}
                  </p>
                  <div className="space-y-4">
                    {webResults.map((r, i) => (
                      <button
                        key={i}
                        onClick={() =>
                          openExternalLink(r.link, navigate)
                        }
                        className="w-full text-left flex gap-3 group"
                      >
                        <div className="mt-1 w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                          <img
                            src={`https://www.google.com/s2/favicons?sz=32&domain_url=${r.link}`}
                            alt=""
                            className="w-4 h-4 rounded-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-[#000080] leading-snug line-clamp-2">
                            {r.title}
                          </p>
                          <p className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {r.snippet}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
