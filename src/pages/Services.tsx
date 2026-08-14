import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { Search, Compass, Globe, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

export default function Services() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user } = useAuth();
  const { settings, servicesList, isLoadingServices } = useApp();
  const navigate = useNavigate();

  const isHi = lang === "hi";

  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [webResults, setWebResults] = useState<any[]>([]);
  const [webLoading, setWebLoading] = useState(false);

  /* ─────────────────────────────────────
     Category Mapping (Phase C)
  ───────────────────────────────────── */
  const HEALTH_SERVICES = ["blood", "health-care", "medicine", "vitals", "medications", "medical-dict", "period-tracker", "child-tracker"];
  const EDUCATION_SERVICES = ["education", "scholarships", "skills", "resume-builder", "story-library"];
  const GOV_SERVICES = ["card", "schemes", "farmer", "grievance", "disaster", "transit-planner"];
  const COMMUNITY_SERVICES = ["donations", "volunteers", "food", "women-safety", "seniors", "animals", "environment", "crowdfunding", "culture", "countries", "earthquakes", "fuel-tracker", "gps-toolkit", "sos", "doc-scanner", "ai-chat", "hindu-calendar", "news-feed", "internet-radio", "youth", "nation"];

  const categories = [
    { id: "all", en: "All", hi: "सभी" },
    { id: "health", en: "Health", hi: "स्वास्थ्य" },
    { id: "education", en: "Education", hi: "शिक्षा" },
    { id: "community", en: "Community", hi: "समुदाय" },
    { id: "government", en: "Government", hi: "सरकार" },
  ];

  /* ─────────────────────────────────────
     Filtering
  ───────────────────────────────────── */
  const filtered = (Array.isArray(servicesList)
    ? servicesList.filter((s: any) => {
        if (!s) return false;
        
        let matchesCat = false;
        if (category === "all") matchesCat = true;
        else if (category === "health") matchesCat = HEALTH_SERVICES.includes(s.id);
        else if (category === "education") matchesCat = EDUCATION_SERVICES.includes(s.id);
        else if (category === "community") matchesCat = COMMUNITY_SERVICES.includes(s.id);
        else if (category === "government") matchesCat = GOV_SERVICES.includes(s.id);
        else matchesCat = true; // Fallback

        const matchesSearch =
          (s.titleEn ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (s.titleHi ?? "").toLowerCase().includes(search.toLowerCase());
          
        return matchesCat && matchesSearch;
      })
    : []).sort((a, b) => {
    if (a?.featured && !b?.featured) return -1;
    if (!a?.featured && b?.featured) return 1;
    return 0;
  });

  /* Google Search fallback — fires on any search input query */
  useEffect(() => {
    if (!search.trim()) { setWebResults([]); return; }
    const timer = setTimeout(async () => {
      setWebLoading(true);
      try {
        const res = await fetch(
          `/api/search/external?query=${encodeURIComponent(search.trim())}`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (res.ok) {
          const data = await res.json();
          setWebResults(data.results ?? []);
        }
      } catch (err) {
        console.error("Web search fetch failed:", err);
        setWebResults([]);
      } finally {
        setWebLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="p-4 flex-1 flex flex-col min-h-screen bg-slate-50 pb-28">
      
      <div className="space-y-5">
        {/* ── Header & Persistent Search ── */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">
                {isHi ? "खोजें" : "Explore"}
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                {isHi ? "RP Foundation की सभी सेवाएं" : "Discover all services & tools"}
              </p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-[#000080] transition-colors" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isHi ? "क्या खोज रहे हैं?..." : "What are you looking for?..."}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#000080]/10 focus:border-[#000080]/30 transition-all placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* ── Categories (Pills/Tabs) ── */}
        <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.map((c) => {
            const isActive = category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-[#000080] text-white shadow-md scale-100"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 active:scale-95"
                }`}
              >
                {isHi ? c.hi : c.en}
              </button>
            );
          })}
        </div>

        {/* ── Service Vertical List ── */}
        {isLoadingServices ? (
          <div className="py-12 flex justify-center items-center">
             <div className="w-6 h-6 border-2 border-[#000080] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-1">
            {filtered.map((svc, idx) => {
              const route = svc.id === 'card' ? '/jan-seva-card' 
                          : svc.id === 'blood' ? '/blood-network' 
                          : svc.id === 'donations' ? '/donations'
                          : svc.id === 'health-care' ? '/health-care'
                          : svc.id === 'grievance' ? '/grievance'
                          : svc.id === 'resume-builder' ? '/resume-builder'
                          : svc.id === 'doc-scanner' ? '/doc-scanner'
                          : svc.id === 'internet-radio' ? '/internet-radio'
                          : svc.id === 'news-feed' ? '/news'
                          : svc.id === 'hindu-calendar' ? '/hindu-calendar'
                          : svc.id === 'culture' ? '/culture'
                          : `/services/${svc.id}`;

              const IconComponent = (LucideIcons as any)[svc.iconName || "Compass"] || Compass;
              
              const gradients = [
                "bg-blue-50 text-blue-600",
                "bg-orange-50 text-orange-600",
                "bg-green-50 text-green-600",
                "bg-purple-50 text-purple-600",
                "bg-rose-50 text-rose-600",
                "bg-indigo-50 text-indigo-600"
              ];
              const colorClass = gradients[idx % gradients.length];

              return (
                 <div 
                    key={svc.id} 
                    onClick={() => navigate(route)}
                    className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-all duration-200 cursor-pointer hover:shadow-md hover:border-slate-200"
                  >
                    <div className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-xl shadow-inner ${colorClass}`}>
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
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-700">
              {isHi ? "कोई सेवा नहीं मिली" : "No services found"}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              {isHi ? "कृपया कुछ और खोजें या अपनी स्पेलिंग जांचें" : "Try searching for something else or check your spelling"}
            </p>
          </div>
        )}

        {/* ── Web Search Results (Fallback) ── */}
        {search.trim().length > 0 && (
          <div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {webLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-[#000080] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : webResults.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <p className="text-[11px] font-extrabold text-[#000080] uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Globe className="w-3.5 h-3.5 text-[#000080]" />
                  {isHi ? "वेब परिणाम" : "Web Results"}
                </p>
                <div className="space-y-4">
                  {webResults.map((r, i) => (
                    <a key={i} href={r.link} target="_blank" rel="noreferrer"
                      className="flex gap-3 group"
                    >
                      <div className="mt-1 w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:border-[#000080]/30 transition-colors">
                        <img
                          src={`https://www.google.com/s2/favicons?sz=32&domain_url=${r.link}`}
                          alt=""
                          className="w-4 h-4 rounded-sm"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-[#000080] leading-snug line-clamp-2 transition-colors">
                          {r.title}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {r.snippet}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
