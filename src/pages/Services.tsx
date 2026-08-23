import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { Search, Compass, ChevronRight, Globe2, Landmark, HeartPulse, GraduationCap, Users } from "lucide-react";
import { useApp } from "../context/AppContext";
import { openExternalLink } from "../utils/browser";
import BrandLoader from "../components/BrandLoader";

const EXPLORE_LINKS = [
  { id: "epaper", category: "community", iconName: "Newspaper", titleEn: "Epaper Kiosk", titleHi: "ई-पेपर कियोस्क", descEn: "Read leading daily e-papers", descHi: "प्रमुख दैनिक ई-पेपर पढ़ें", route: "/epaper" },
  { id: "directory", category: "government", iconName: "BookOpen", titleEn: "National Directory", titleHi: "राष्ट्रीय निर्देशिका", descEn: "Government contacts & helplines", descHi: "सरकारी संपर्क और हेल्पलाइन", route: "/directory" },
  { id: "peoples-university", category: "education", iconName: "GraduationCap", titleEn: "People's University", titleHi: "पीपुल्स यूनिवर्सिटी", descEn: "Official university information", descHi: "आधिकारिक विश्वविद्यालय जानकारी", url: "https://www.peoplesuniversity.edu.in/" },
  { id: "fact-check", category: "community", iconName: "ShieldCheck", titleEn: "Fact Check Hub", titleHi: "फैक्ट चेक हब", descEn: "Check claims and viral news", descHi: "वायरल दावों और खबरों की जांच", route: "/fact-check" },
  { id: "live-tv", category: "community", iconName: "Tv", titleEn: "Live Broadcast TV", titleHi: "लाइव प्रसारण टीवी", descEn: "Official news & culture channels", descHi: "आधिकारिक समाचार व संस्कृति चैनल", route: "/live-tv" }
];

const GROUPS = [
  { id: "government", en: "Government Services", hi: "सरकारी सेवाएं", icon: Landmark },
  { id: "health", en: "Health & Support", hi: "स्वास्थ्य एवं सहायता", icon: HeartPulse },
  { id: "education", en: "Education", hi: "शिक्षा", icon: GraduationCap },
  { id: "community", en: "Community & RPF", hi: "समुदाय एवं आरपीएफ", icon: Users },
];

const HEALTH = ["health-care", "women-safety", "seniors", "medicine", "blood", "food"];
const EDUCATION = ["education", "scholarships", "skills", "peoples-university"];
const GOVERNMENT = ["card", "schemes", "farmer", "grievance", "disaster", "directory"];
const COMMUNITY = ["donations", "volunteers", "animals", "environment", "crowdfunding", "culture", "sos", "youth", "nation", "internet-radio", "epaper", "fact-check", "live-tv"];
const REMOVED = ["gps-toolkit","fuel-tracker","earthquakes","global-guide","transit-planner","news-feed","hindu-calendar","audiobooks","doc-scanner","resume-builder","ai-chat","medical-dict","vitals","medications","med-reminder","period-tracker","child-tracker","job-portal","jobportal","scholarships","skills","education-aid","story-library","medical-aid","utility-center","device-tools","pomodoro","bmi-calculator","split-bill","decision-maker","morse-code","habit-tracker","fasting-tracker","typing-speed","quick-calculator","calculator-center","breathing-meditator"];

export default function Services() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { servicesList, isLoadingServices } = useApp();
  const navigate = useNavigate();
  const isHi = lang === "hi";
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [webResults, setWebResults] = useState<any[]>([]);
  const [webLoading, setWebLoading] = useState(false);

  const allServices = useMemo(() => {
    const base = Array.isArray(servicesList) ? servicesList : [];
    const ids = new Set(base.map((s: any) => s?.id));
    return [...base, ...EXPLORE_LINKS.filter(s => !ids.has(s.id))];
  }, [servicesList]);

  const matchesGroup = (id: string, group: string) => group === "all" ||
    (group === "government" && GOVERNMENT.includes(id)) ||
    (group === "health" && HEALTH.includes(id)) ||
    (group === "education" && EDUCATION.includes(id)) ||
    (group === "community" && COMMUNITY.includes(id));

  const filtered = useMemo(() => allServices.filter((s: any) => {
    if (!s || REMOVED.includes(s.id) || s.enabled === false || s.hidden === true || s.active === false) return false;
    const q = search.trim().toLowerCase();
    return matchesGroup(s.id, category) && (!q || `${s.titleEn ?? ""} ${s.titleHi ?? ""} ${s.descEn ?? ""} ${s.descHi ?? ""}`.toLowerCase().includes(q));
  }), [allServices, category, search]);

  useEffect(() => {
    if (!search.trim()) { setWebResults([]); return; }
    const timer = setTimeout(async () => {
      setWebLoading(true);
      try {
        const res = await fetch(`/api/search/external?query=${encodeURIComponent(search.trim())}`, { signal: AbortSignal.timeout(5000) });
        setWebResults(res.ok ? (await res.json()).results ?? [] : []);
      } catch { setWebResults([]); } finally { setWebLoading(false); }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const targetFor = (s: any) => {
    if (s.id === "schemes") return "/services/schemes";
    if (s.url?.trim()) return s.url.trim();
    if (s.link?.trim()) return s.link.trim();
    if (s.route?.trim()) return s.route.trim();
    if (s.id === "card") return "/jan-seva-card";
    if (s.id === "blood") return "/blood-network";
    if (s.id === "donations") return "/donations";
    if (s.id === "health-care") return "/health-care";
    if (s.id === "grievance") return "/grievance";
    if (s.id === "culture") return "/culture";
    if (s.id === "internet-radio") return "/internet-radio";
    const extra = EXPLORE_LINKS.find(x => x.id === s.id);
    return extra?.route || extra?.url || `/services/${s.id}`;
  };

  const sectionLabel = GROUPS.find(g => g.id === category);
  return <div className="p-4 sm:p-6 flex-1 min-h-screen bg-[var(--rp-bg)] pb-safe-content">
    <header className="max-w-3xl mx-auto w-full mb-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-white border border-[var(--rp-border)] shadow-sm flex items-center justify-center p-1"><img src="/assets/logo.png" alt="समाहित" className="w-full h-full object-contain" /></div>
        <div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[var(--rp-primary)]">समाहित</p><h1 className="font-black text-[var(--rp-text)]">{isHi ? "सेवाएं खोजें" : "Find Services"}</h1></div>
      </div>
      <p className="text-sm text-[var(--rp-muted)] mb-4">{isHi ? "सरकारी सेवाएं, सहायता और आरपीएफ पहल एक ही स्थान पर।" : "Government services, support and RPF initiatives in one place."}</p>
      <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--rp-muted)]" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={isHi ? "सेवा या सुविधा खोजें" : "Search a service or facility"} className="w-full min-h-12 pl-12 pr-4 rounded-2xl bg-white border border-[var(--rp-border)] shadow-sm font-semibold text-sm focus:border-[var(--rp-primary)]" /></div>
    </header>

    <main className="max-w-3xl mx-auto w-full">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-3">
        <button onClick={() => setCategory("all")} className={`min-h-11 px-4 rounded-xl text-xs font-bold border whitespace-nowrap ${category === "all" ? "bg-[var(--rp-primary)] text-white border-[var(--rp-primary)]" : "bg-white border-[var(--rp-border)] text-[var(--rp-text)]"}`}>{isHi ? "सभी" : "All"}</button>
        {GROUPS.map(g => { const Icon = g.icon; return <button key={g.id} onClick={() => setCategory(g.id)} className={`min-h-11 px-4 rounded-xl text-xs font-bold border whitespace-nowrap inline-flex items-center gap-2 ${category === g.id ? "bg-[var(--rp-primary)] text-white border-[var(--rp-primary)]" : "bg-white border-[var(--rp-border)] text-[var(--rp-text)]"}`}><Icon className="w-4 h-4" />{isHi ? g.hi : g.en}</button>; })}
      </div>

      <div className="mb-3 flex items-center justify-between"><div><h2 className="font-black text-[var(--rp-text)]">{sectionLabel ? (isHi ? sectionLabel.hi : sectionLabel.en) : (isHi ? "सभी उपलब्ध सेवाएं" : "Available Services")}</h2><p className="text-xs text-[var(--rp-muted)] mt-1">{filtered.length} {isHi ? "सेवाएं उपलब्ध" : "services available"}</p></div>{category === "government" && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">{isHi ? "आधिकारिक प्राथमिकता" : "Official first"}</span>}</div>

      {isLoadingServices ? <div className="py-14 flex justify-center"><BrandLoader size="sm" label="Loading services" /></div> : filtered.length === 0 ? <div className="py-14 px-6 text-center rounded-3xl bg-white border border-[var(--rp-border)]"><Search className="w-8 h-8 mx-auto mb-3 text-[var(--rp-muted)]" /><h3 className="font-bold">{isHi ? "कोई सेवा नहीं मिली" : "No services found"}</h3><p className="text-sm text-[var(--rp-muted)] mt-1">{isHi ? "खोज बदलें या दूसरी श्रेणी चुनें।" : "Try another search or category."}</p></div> : <div className="grid gap-3">
        {filtered.map((s: any) => {
          const target = targetFor(s); const external = /^https?:\/\//i.test(target); const Icon = (LucideIcons as any)[s.iconName || "Compass"] || Compass;
          return <button key={s.id} type="button" onClick={() => external ? openExternalLink(target, navigate, s.titleEn) : navigate(target)} className="group w-full min-h-20 bg-white rounded-2xl border border-[var(--rp-border)] p-3.5 text-left flex items-center gap-3 shadow-[var(--rp-shadow-sm)] hover:shadow-[var(--rp-shadow-md)] active:scale-[.99] transition"><div className="w-11 h-11 shrink-0 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[var(--rp-primary)]"><Icon className="w-5 h-5" /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="font-extrabold text-sm truncate">{isHi ? s.titleHi : s.titleEn}</h3>{external && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-[var(--rp-muted)]">PORTAL</span>}</div><p className="text-xs text-[var(--rp-muted)] mt-1 line-clamp-2">{isHi ? s.descHi : s.descEn}</p></div><ChevronRight className="w-5 h-5 shrink-0 text-[var(--rp-muted)] group-hover:text-[var(--rp-primary)]" /></button>;
        })}
      </div>}

      {search.trim() && <section className="mt-5">{webLoading ? <div className="py-6 flex justify-center"><BrandLoader size="sm" label="Searching" /></div> : webResults.length > 0 && <div className="bg-white rounded-2xl border border-[var(--rp-border)] p-4"><div className="flex items-center gap-2 mb-3"><Globe2 className="w-4 h-4 text-[var(--rp-primary)]" /><h3 className="font-black text-sm">{isHi ? "वेब परिणाम" : "Web results"}</h3></div><div className="space-y-2">{webResults.map((r, i) => <button key={i} onClick={() => openExternalLink(r.link, navigate, r.title)} className="w-full min-h-14 text-left rounded-xl border border-slate-100 p-3 flex items-center gap-3"><div className="min-w-0 flex-1"><p className="font-bold text-sm truncate">{r.title}</p><p className="text-xs text-[var(--rp-muted)] truncate mt-0.5">{r.snippet}</p></div><ChevronRight className="w-4 h-4 text-[var(--rp-muted)]" /></button>)}</div></div>}</section>}
    </main>
  </div>;
}
