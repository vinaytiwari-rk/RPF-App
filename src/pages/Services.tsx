import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import {
  Search,
  Compass,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Globe2,
  BadgePlus,
  HeartPulse,
  BriefcaseBusiness,
  ClipboardList,
  ExternalLink,
  Flame
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

const FEATURED_SERVICES = [
  { id: "card", titleEn: "Jan Seva Card", titleHi: "जन सेवा कार्ड", descEn: "Your digital service identity & welfare access", descHi: "आपकी डिजिटल सेवा पहचान और कल्याण पहुंच", icon: BadgePlus, route: "/jan-seva-card", accent: "text-[#D97706] bg-amber-500/10 border border-amber-500/20" },
  { id: "health-care", titleEn: "Healthcare", titleHi: "स्वास्थ्य सेवा", descEn: "Health camps, medicines & hospital locator", descHi: "स्वास्थ्य शिविर, दवाएं और अस्पताल खोजक", icon: HeartPulse, route: "/health-care", accent: "text-[#DC2626] bg-red-500/10 border border-red-500/20" },
  { id: "employment", titleEn: "Employment", titleHi: "रोजगार पोर्टल", descEn: "Jobs, skill development & career guidance", descHi: "नौकरियां, कौशल विकास और करियर मार्गदर्शन", icon: BriefcaseBusiness, route: "/employment", accent: "text-[#167C5A] bg-emerald-500/10 border border-emerald-500/20" },
  { id: "grievance", titleEn: "Grievance", titleHi: "शिकायत समाधान", descEn: "Submit issues & track resolution progress", descHi: "समस्याएं दर्ज करें और समाधान की स्थिति देखें", icon: ClipboardList, route: "/grievance", accent: "text-[#14213D] bg-slate-500/10 border border-slate-500/20" }
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

  const getSemanticIconStyle = (svcId: string) => {
    if (HEALTH_SERVICES.includes(svcId)) return "text-[#DC2626] bg-red-500/10 border border-red-500/20";
    if (GOV_SERVICES.includes(svcId)) return "text-[#D97706] bg-amber-500/10 border border-amber-500/20";
    if (COMMUNITY_SERVICES.includes(svcId)) return "text-[#167C5A] bg-emerald-500/10 border border-emerald-500/20";
    return "text-[#14213D] bg-slate-500/10 border border-slate-500/20";
  };

  const renderService = (svc: any) => {
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
    const IconComponent = (LucideIcons as any)[svc.iconName || "Compass"] || Compass;
    const isExternal = target.startsWith("http");

    return (
      <button
        type="button"
        onClick={() => {
          if (isExternal) openExternalLink(target, navigate, svc.titleEn);
          else navigate(target);
        }}
        className="group relative w-full rounded-2xl p-4 flex items-center justify-between border border-amber-100/80 bg-white/80 backdrop-blur-md shadow-2xs hover:border-amber-300/80 hover:shadow-xs transition-all text-left cursor-pointer"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-xl ${getSemanticIconStyle(svc.id)}`}>
            <IconComponent className="w-5 h-5 transition-transform group-hover:scale-110" />
          </div>

          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[14px] font-bold text-[#14213D] group-hover:text-[#D97706] transition-colors truncate">
                {isHi ? svc.titleHi || svc.titleEn : svc.titleEn}
              </h3>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-[#167C5A] border border-emerald-200/80 uppercase">
                <ShieldCheck className="w-2.5 h-2.5" /> Verified
              </span>
            </div>
            <p className="text-[11.5px] text-slate-500 font-medium line-clamp-1 mt-0.5">
              {isHi ? svc.descHi || svc.descEn : svc.descEn}
            </p>
          </div>
        </div>

        <div className="w-7 h-7 rounded-full bg-slate-100/80 border border-slate-200/60 flex items-center justify-center shrink-0 text-slate-400 group-hover:bg-[#14213D] group-hover:text-white group-hover:border-transparent transition-all">
          {isExternal ? <ExternalLink className="w-3.5 h-3.5" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-full bg-transparent pb-16 text-[#14213D]">
      <div className="mx-auto max-w-3xl px-4 pt-4 pb-2 sm:px-6 space-y-4">
        {/* Header Title */}
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50/70 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-[#D97706] uppercase shadow-2xs backdrop-blur-xs mb-1">
            <Sparkles className="h-3 w-3 text-[#D97706]" />
            Samahit Ecosystem
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#14213D]">
            {isHi ? "सेवाएं और पोर्टल" : "Explore & Services"}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-600 mt-0.5">
            {isHi ? "सत्यापित नागरिक कल्याण कार्यक्रम और आधिकारिक पोर्टल खोजें" : "Discover verified citizen welfare programs & official portals"}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isHi ? "सेवाएं या योजनाएं खोजें..." : "Search services, portals or schemes..."}
            className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-md border border-amber-200/80 rounded-2xl text-xs font-semibold shadow-2xs focus:outline-none focus:border-[#D97706] focus:bg-white text-[#14213D] placeholder:text-slate-400 transition"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex overflow-x-auto gap-2 pb-1 -mx-4 px-4 scrollbar-hide">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                category === c.id
                  ? "bg-[#14213D] text-[#FFF9F0] shadow-sm"
                  : "bg-white/80 backdrop-blur-md border border-amber-100/80 text-slate-700 hover:bg-white shadow-2xs"
              }`}
            >
              {isHi ? c.hi : c.en}
            </button>
          ))}
        </div>

        {/* Featured / Most Used Services (Only show when not searching and category is 'all') */}
        {!search.trim() && category === "all" && (
          <section className="pt-1 pb-2">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Flame className="w-3.5 h-3.5 text-[#D97706]" />
              <h2 className="text-[10.5px] font-bold uppercase tracking-widest text-[#D97706]">
                {isHi ? "प्रमुख सेवाएं" : "Featured Services"}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {FEATURED_SERVICES.map((feat) => {
                const FeatIcon = feat.icon;
                return (
                  <button
                    key={feat.id}
                    onClick={() => navigate(feat.route)}
                    className="rounded-2xl border border-amber-100/80 bg-white/80 backdrop-blur-md p-3.5 text-left shadow-2xs hover:border-amber-300/80 hover:shadow-xs transition-all flex flex-col justify-between min-h-[120px]"
                  >
                    <div className={`w-9 h-9 flex items-center justify-center rounded-xl ${feat.accent}`}>
                      <FeatIcon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="mt-2 text-[14px] font-bold text-[#14213D]">{isHi ? feat.titleHi : feat.titleEn}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500 font-medium leading-snug line-clamp-1">{isHi ? feat.descHi : feat.descEn}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Section Heading for All Services */}
        <div className="pt-2">
          <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#14213D]">
            {search.trim() ? (isHi ? "समाहित सेवाएं" : "SAMAHIT SERVICES") : (isHi ? "सभी नागरिक सेवाएं" : "All Services")}
          </p>
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
            renderItem={(svc) => renderService(svc)}
            className="flex flex-col gap-3 pt-2"
          />
        )}

        {!isLoadingServices && filtered.length === 0 && (
          <div className="py-12 text-center bg-white/80 backdrop-blur-md rounded-2xl border border-amber-100/80 p-6 mt-2 shadow-2xs">
            <Search className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-xs font-bold text-[#14213D]">{isHi ? "कोई सेवा नहीं मिली" : "No matching services found"}</p>
            <p className="text-[11px] text-slate-500 mt-1">Try selecting another category or clear your search.</p>
          </div>
        )}

        {/* Official & External Results Section */}
        {search.trim() && (
          <div className="pt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#D97706] flex items-center gap-1.5 mb-2.5">
              <Globe2 className="w-3.5 h-3.5 text-[#D97706]" />
              {isHi ? "आधिकारिक एवं बाह्य परिणाम" : "OFFICIAL & EXTERNAL RESULTS"}
            </p>

            {webLoading ? (
              <div className="flex justify-center py-6">
                <BrandLoader size="sm" label="Searching external sources" />
              </div>
            ) : (
              webResults.length > 0 && (
                <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-amber-100/80 p-3.5 shadow-2xs space-y-2">
                  {webResults.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => openExternalLink(r.link, navigate, r.title)}
                      className="w-full text-left flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3 hover:border-amber-300 transition-all shadow-2xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80 uppercase">External Website</span>
                          <p className="text-xs font-bold text-[#14213D] leading-snug line-clamp-1">{r.title}</p>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-1">{r.snippet}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 shrink-0 text-[#14213D]" />
                    </button>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}