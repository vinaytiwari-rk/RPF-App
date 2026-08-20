import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { Search, Compass, Globe, ChevronRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import { openExternalLink } from "../utils/browser";
import SortableList from "../components/SortableList";

const EXPLORE_LINKS = [
  { id: "epaper", category: "community", iconName: "Newspaper", titleEn: "Epaper", titleHi: "ई-पेपर", descEn: "Read today's leading daily e-papers", descHi: "आज के प्रमुख दैनिक ई-पेपर पढ़ें", route: "/epaper" },
  { id: "directory", category: "government", iconName: "BookOpen", titleEn: "Directory", titleHi: "निर्देशिका", descEn: "Government contacts & utilities", descHi: "सरकारी संपर्क और उपयोगिता", route: "/directory" },
  { id: "peoples-university", category: "education", iconName: "GraduationCap", titleEn: "People's University", titleHi: "पीपुल्स यूनिवर्सिटी", descEn: "Official university website", descHi: "आधिकारिक विश्वविद्यालय वेबसाइट", url: "https://www.peoplesuniversity.edu.in/" },
  { id: "fact-check", category: "community", iconName: "ShieldCheck", titleEn: "Fact Check", titleHi: "फैक्ट चेक", descEn: "Check claims and news before sharing", descHi: "वायरल दावों और खबरों की जांच करें", route: "/fact-check" },
  { id: "live-tv", category: "community", iconName: "Tv", titleEn: "Live TV", titleHi: "लाइव टीवी", descEn: "Official live TV channels", descHi: "आधिकारिक लाइव टीवी चैनल", route: "/live-tv" },
];

export default function Services() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { servicesList, isLoadingServices, cmsConfig } = useApp();
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
  const REMOVED_SERVICE_IDS = ["gps-toolkit", "fuel-tracker", "earthquakes", "global-guide", "transit-planner", "news-feed", "hindu-calendar", "audiobooks", "doc-scanner", "resume-builder", "ai-chat", "medical-dict", "vitals", "medications", "med-reminder", "period-tracker", "child-tracker", "job-portal", "jobportal", "scholarships", "skills", "education-aid", "story-library", "medical-aid", "utility-center", "device-tools", "pomodoro", "bmi-calculator", "split-bill", "decision-maker", "morse-code", "habit-tracker", "fasting-tracker", "typing-speed", "quick-calculator", "calculator-center", "breathing-meditator"];
  const categories = [
    { id: "all", en: "All", hi: "सभी" },
    { id: "health", en: "Health", hi: "स्वास्थ्य" },
    { id: "education", en: "Education", hi: "शिक्षा" },
    { id: "community", en: "Community", hi: "समुदाय" },
    { id: "government", en: "Government", hi: "सरकार" },
  ];

  const allServices = useMemo(() => {
    const base = Array.isArray(servicesList) ? servicesList : [];
    const ids = new Set(base.map((s: any) => s?.id));
    return [...base, ...EXPLORE_LINKS.filter((s) => !ids.has(s.id))];
  }, [servicesList]);

  const filtered = useMemo(() => allServices.filter((s: any) => {
    if (!s || REMOVED_SERVICE_IDS.includes(s.id) || s.enabled === false || s.hidden === true || s.active === false) return false;
    const matchesCat = category === "all" ||
      (category === "health" && HEALTH_SERVICES.includes(s.id)) ||
      (category === "education" && EDUCATION_SERVICES.includes(s.id)) ||
      (category === "community" && COMMUNITY_SERVICES.includes(s.id)) ||
      (category === "government" && GOV_SERVICES.includes(s.id));
    const q = search.toLowerCase().trim();
    return matchesCat && (!q || (s.titleEn ?? "").toLowerCase().includes(q) || (s.titleHi ?? "").toLowerCase().includes(q));
  }), [allServices, category, search]);

  useEffect(() => {
    if (!search.trim()) { setWebResults([]); return; }
    const timer = setTimeout(async () => {
      setWebLoading(true);
      try {
        const res = await fetch(`/api/search/external?query=${encodeURIComponent(search.trim())}`, { signal: AbortSignal.timeout(5000) });
        if (res.ok) { const data = await res.json(); setWebResults(data.results ?? []); }
      } catch { setWebResults([]); } finally { setWebLoading(false); }
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
    if (id === "news-feed") return "/news";
    if (id === "hindu-calendar") return "/hindu-calendar";
    if (id === "doc-scanner") return "/doc-scanner";
    if (id === "resume-builder") return "/resume-builder";
    if (id === "schemes") return "/browser?url=" + encodeURIComponent(cmsConfig?.govSchemeUrl || "https://services.mp.gov.in/eservice/");
    return `/services/${id}`;
  };

  const renderService = (svc: any, idx: number) => {
    const configuredTarget = typeof svc.url === "string" && svc.url.trim() ? svc.url.trim() : (typeof svc.link === "string" && svc.link.trim() ? svc.link.trim() : (typeof svc.route === "string" && svc.route.trim() ? svc.route.trim() : ""));
    const target = configuredTarget || routeFor(svc.id);
    const IconComponent = (LucideIcons as any)[svc.iconName || "Compass"] || Compass;
    const gradients = ["bg-blue-50 text-blue-600", "bg-orange-50 text-orange-600", "bg-green-50 text-green-600", "bg-purple-50 text-purple-600", "bg-rose-50 text-rose-600", "bg-indigo-50 text-indigo-600"];
    return (
      <button type="button" onClick={() => {
        if (target.startsWith("http")) openExternalLink(target, navigate, svc.titleEn);
        else if (target.startsWith("/browser?url=")) openExternalLink(decodeURIComponent(target.split("url=")[1]), navigate, svc.titleEn);
        else navigate(target);
      }} className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 border border-slate-100 active:scale-[0.99] cursor-pointer">
        <div className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-xl ${gradients[idx % gradients.length]}`}><IconComponent className="w-6 h-6" /></div>
        <div className="flex-1 min-w-0 text-left"><h4 className="font-bold text-sm text-slate-800 leading-tight truncate">{isHi ? svc.titleHi : svc.titleEn}</h4><p className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-1">{isHi ? svc.descHi : svc.descEn}</p></div>
        <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 border border-slate-100"><ChevronRight className="w-4 h-4 text-slate-400" /></div>
      </button>
    );
  };

  return (
    <div className="p-4 flex-1 flex flex-col min-h-screen bg-slate-50 pb-28">
      <div className="space-y-4 pt-4">
        <div><h3 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">{isHi ? "खोजें" : "Explore"}</h3><p className="text-sm text-slate-500 font-medium mt-0.5">{isHi ? "RP Foundation की सभी सेवाएं" : "Discover all services & tools"}</p></div>
        <div className="relative"><div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400" /></div><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={isHi ? "क्या खोज रहे हैं?..." : "What are you looking for?..."} className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm shadow-sm focus:outline-none focus:border-[#000080]/30 placeholder:text-slate-400 font-medium" /></div>
        <div className="flex overflow-x-auto gap-2 pb-1 -mx-4 px-4 scrollbar-hide">{categories.map((c) => <button key={c.id} onClick={() => setCategory(c.id)} className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold ${category === c.id ? "bg-[#000080] text-white" : "bg-white text-slate-600 border border-slate-200"}`}>{isHi ? c.hi : c.en}</button>)}</div>
      </div>
      {isLoadingServices ? <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-[#000080] border-t-transparent rounded-full animate-spin" /></div> : <SortableList items={filtered} storageKey={`services:${category}`} renderItem={(svc, idx) => renderService(svc, idx)} className="flex flex-col gap-3 pt-3" />}
      {!isLoadingServices && filtered.length === 0 && <div className="py-12 text-center"><Search className="mx-auto h-6 w-6 text-slate-400" /><p className="text-sm font-bold text-slate-700 mt-3">{isHi ? "कोई सेवा नहीं मिली" : "No services found"}</p></div>}
      {search.trim() && <div className="pt-2">{webLoading ? <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-[#000080] border-t-transparent rounded-full animate-spin" /></div> : webResults.length > 0 && <div className="bg-white rounded-2xl border border-slate-100 p-4"><p className="text-[11px] font-extrabold text-[#000080] uppercase tracking-wider flex items-center gap-2 mb-3"><Globe className="w-3.5 h-3.5" />{isHi ? "वेब परिणाम" : "Web Results"}</p><div className="space-y-4">{webResults.map((r, i) => <button key={i} onClick={() => openExternalLink(r.link, navigate)} className="w-full text-left flex gap-3 group"><div className="mt-1 w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100"/><div className="flex-1 min-w-0"><p className="text-xs font-bold text-slate-800 leading-snug line-clamp-2">{r.title}</p><p className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-2 leading-relaxed">{r.snippet}</p></div></button>)}</div></div>}</div>}
    </div>
  );
}
