import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import {
  Search,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Compass,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Globe2,
  SlidersHorizontal,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { openExternalLink } from "../utils/browser";
import SortableList from "../components/SortableList";
import BrandLoader from "../components/BrandLoader";

const EXPLORE_LINKS = [
  { id: "epaper", category: "community", iconName: "Newspaper", titleEn: "Epaper Kiosk", titleHi: "ई-पेपर कियोस्क", descEn: "Read today's leading daily e-papers", descHi: "आज के प्रमुख दैनिक ई-पेपर पढ़ें", route: "/epaper" },
  { id: "directory", category: "government", iconName: "BookOpen", titleEn: "National Directory", titleHi: "राष्ट्रीय निर्देशिका", descEn: "Government contacts & helplines", descHi: "सरकारी संपर्क और उपयोगिता निर्देशिका", route: "/directory" },
  { id: "peoples-university", category: "education", iconName: "GraduationCap", titleEn: "People's University Portal", titleHi: "पीपुल्स यूनिवर्सिटी पोर्टल", descEn: "Official University Information", descHi: "आधिकारिक विश्वविद्यालय पोर्टल", url: "https://www.peoplesuniversity.edu.in/" },
  { id: "fact-check", category: "community", iconName: "ShieldCheck", titleEn: "Fact Check Hub", titleHi: "फैक्ट चेक हब", descEn: "Check claims and viral news", descHi: "वायरल दावों और खबरों की जांच करें", route: "/fact-check" },
  { id: "live-tv", category: "community", iconName: "Tv", titleEn: "Live Broadcast TV", titleHi: "लाइव प्रसारण टीवी", descEn: "Official news & culture channels", descHi: "आधिकारिक लाइव टीवी चैनल", route: "/live-tv" }
];

export default function Services() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { servicesList, isLoadingServices } = useApp();
  const navigate = useNavigate();
  const isHi = lang === "hi";

  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [webResults, setWebResults] = useState<any[]>([]);
  const [webLoading, setWebLoading] = useState(false);

  const HEALTH_SERVICES = ["health-care", "women-safety", "seniors", "medicine", "blood", "food"];
  const EDUCATION_SERVICES = ["education", "scholarships", "skills", "peoples-university"];
  const GOV_SERVICES = ["card", "schemes", "farmer", "grievance", "disaster", "directory"];
  const COMMUNITY_SERVICES = ["donations", "volunteers", "animals", "environment", "crowdfunding", "culture", "sos", "youth", "nation", "internet-radio", "epaper", "fact-check", "live-tv"];
  const REMOVED_SERVICE_IDS = [
    "gps-toolkit", "fuel-tracker", "earthquakes", "global-guide", "transit-planner", "news-feed", "hindu-calendar",
    "audiobooks", "doc-scanner", "resume-builder", "ai-chat", "medical-dict", "vitals", "medications", "med-reminder",
    "period-tracker", "child-tracker", "job-portal", "jobportal", "scholarships", "skills", "education-aid", "story-library",
    "medical-aid", "utility-center", "device-tools", "pomodoro", "bmi-calculator", "split-bill", "decision-maker",
    "morse-code", "habit-tracker", "fasting-tracker", "typing-speed", "quick-calculator", "calculator-center", "breathing-meditator"
  ];

  const categories = [
    { id: "all", en: "All Services", hi: "सभी सेवाएं" },
    { id: "health", en: "Health Care", hi: "स्वास्थ्य" },
    { id: "education", en: "Education", hi: "शिक्षा" },
    { id: "community", en: "Community", hi: "समुदाय" },
    { id: "government", en: "Government", hi: "सरकार" },
  ];

  const allServices = useMemo(() => {
    const base = Array.isArray(servicesList) ? servicesList : [];
    const ids = new Set(base.map((s: any) => s?.id));
    return [...base, ...EXPLORE_LINKS.filter((s) => !ids.has(s.id))];
  }, [servicesList]);

  const filtered = useMemo(
    () =>
      allServices.filter((s: any) => {
        if (!s || REMOVED_SERVICE_IDS.includes(s.id) || s.enabled === false || s.hidden === true || s.active === false)
          return false;
        const matchesCat =
          category === "all" ||
          (category === "health" && HEALTH_SERVICES.includes(s.id)) ||
          (category === "education" && EDUCATION_SERVICES.includes(s.id)) ||
          (category === "community" && COMMUNITY_SERVICES.includes(s.id)) ||
          (category === "government" && GOV_SERVICES.includes(s.id));
        const q = search.toLowerCase().trim();
        return matchesCat && (!q || (s.titleEn ?? "").toLowerCase().includes(q) || (s.titleHi ?? "").toLowerCase().includes(q));
      }),
    [allServices, category, search]
  );

  useEffect(() => {
    if (!search.trim()) {
      setWebResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setWebLoading(true);
      try {
        const res = await fetch(`/api/search/external?query=${encodeURIComponent(search.trim())}`, {
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const data = await res.json();
          setWebResults(data.results ?? []);
        }
      } catch {
        setWebResults([]);
      } finally {
        setWebLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const routeFor = (id: string) => {
    const item = EXPLORE_LINKS.find((x) => x.id === id);
    if (item?.route) return item.route;
    if (item?.url) return item.url;
    if (id === "card") return "/jan-seva-card";
    if (id === "blood") return "/blood-network";
    if (id === "donations") return "/donations";
    if (id === "health-care") return "/health-care";
    if (id === "grievance") return "/grievance";
    if (id === "culture") return "/culture";
    if (id === "internet-radio") return "/internet-radio";
    if (id === "schemes") return "/services/schemes";
    return `/services/${id}`;
  };

  const renderService = (svc: any, idx: number) => {
    const configuredTarget =
      svc.id === "schemes"
        ? "/services/schemes"
        : typeof svc.url === "string" && svc.url.trim()
        ? svc.url.trim()
        : typeof svc.link === "string" && svc.link.trim()
        ? svc.link.trim()
        : typeof svc.route === "string" && svc.route.trim()
        ? svc.route.trim()
        : "";
    const target = configuredTarget || routeFor(svc.id);
    const isWebsite = /^https?:\/\//i.test(target);
    const IconComponent = (LucideIcons as any)[svc.iconName || "Compass"] || Compass;

    // Distinct micro-theme icon background styling
    const colorStyles = [
      "bg-orange-50 text-[#FF9933] border-orange-100",
      "bg-blue-50 text-[#000080] border-blue-100",
      "bg-emerald-50 text-[#138808] border-emerald-100",
      "bg-purple-50 text-purple-700 border-purple-100",
      "bg-rose-50 text-rose-600 border-rose-100",
      "bg-indigo-50 text-indigo-700 border-indigo-100",
    ];
    const badgeColor = colorStyles[idx % colorStyles.length];

    return (
      <button
        type="button"
        onClick={() => {
          if (target.startsWith("http")) openExternalLink(target, navigate, svc.titleEn);
          else navigate(target);
        }}
        className="group relative w-full bg-white rounded-2xl p-4 flex items-center gap-4 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-orange-200 active:scale-[.99] transition-all duration-200 text-left cursor-pointer"
      >
        <div className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-2xl border shadow-inner ${badgeColor}`}>
          <IconComponent className="w-6 h-6 transition-transform group-hover:scale-110" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-black text-sm text-slate-900 leading-snug truncate group-hover:text-[#000080] transition">
              {isHi ? svc.titleHi : svc.titleEn}
            </h4>
            {isWebsite && (
              <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#000080] border border-blue-100">
                Portal
              </span>
            )}
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5 line-clamp-1">
            {isHi ? svc.descHi : svc.descEn}
          </p>
        </div>

        <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 border border-slate-200 group-hover:bg-[#000080] group-hover:text-white transition">
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
        </div>
      </button>
    );
  };

  return (
    <div className="p-4 sm:p-6 flex-1 flex flex-col min-h-screen bg-[#FAF9F6] pb-28 font-sans selection:bg-orange-100">
      {/* Top Brand Header */}
      <header className="mb-5 flex items-center justify-between border-b border-slate-200/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm p-1">
            <img src="/assets/logo.png" alt="Samahit" className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#000080]">Samahit Super-App</p>
            <p className="text-[11px] font-black text-slate-800">{isHi ? "समाहित नागरिक सेवा" : "Services Directory"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Live
          </span>
        </div>
      </header>

      {/* Hero Title & Modern Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="font-black text-2xl text-slate-900 tracking-tight sm:text-3xl">
            {isHi ? "सेवाएं एवं सुविधाएं" : "Services & Facilities"}
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {isHi ? "RP Foundation द्वारा नागरिक कल्याण सेवाएं" : "Discover foundational citizen welfare programs & portals"}
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isHi ? "क्या खोज रहे हैं?..." : "Search services or utilities..."}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200/90 rounded-2xl text-xs font-bold shadow-sm focus:outline-none focus:border-[#000080] placeholder:text-slate-400 transition"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex overflow-x-auto gap-2 pb-1.5 -mx-4 px-4 scrollbar-hide">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                category === c.id
                  ? "bg-gradient-to-r from-[#000080] to-[#138808] text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {isHi ? c.hi : c.en}
            </button>
          ))}
        </div>
      </div>

      {/* Main Services List */}
      {isLoadingServices ? (
        <div className="py-12 flex justify-center">
          <BrandLoader size="sm" label="Loading services" />
        </div>
      ) : (
        <SortableList
          items={filtered}
          storageKey={`services:${category}`}
          renderItem={(svc, idx) => renderService(svc, idx)}
          className="flex flex-col gap-3 pt-4"
        />
      )}

      {!isLoadingServices && filtered.length === 0 && (
        <div className="py-12 text-center bg-white rounded-3xl border border-slate-200 p-6 mt-4">
          <Search className="mx-auto h-8 w-8 text-slate-300 mb-2" />
          <p className="text-xs font-black text-slate-700">{isHi ? "कोई सेवा नहीं मिली" : "No matching services found"}</p>
          <p className="text-[11px] text-slate-400 mt-1">Try selecting another category or clear your search.</p>
        </div>
      )}

      {/* Web Search Results Section (Without Raw URLs) */}
      {search.trim() && (
        <div className="pt-4">
          {webLoading ? (
            <div className="flex justify-center py-6">
              <BrandLoader size="sm" label="Searching web" />
            </div>
          ) : (
            webResults.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
                <p className="text-[10px] font-black text-[#000080] uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Globe2 className="w-3.5 h-3.5 text-[#FF9933]" />
                  {isHi ? "वेब परिणाम" : "Web Discoveries"}
                </p>
                <div className="space-y-2.5">
                  {webResults.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => openExternalLink(r.link, navigate, r.title)}
                      className="w-full text-left flex items-center justify-between gap-3 rounded-2xl border border-slate-100 p-3 hover:bg-orange-50/50 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 leading-snug line-clamp-1">{r.title}</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5 line-clamp-1">{r.snippet}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}