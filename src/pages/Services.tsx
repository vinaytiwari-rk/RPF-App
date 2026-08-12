import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { Search, Compass, Phone, Globe, Mail } from "lucide-react";
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
     Filtering
  ───────────────────────────────────── */
  const categories = [
    { id: "all", en: "All Services", hi: "सभी सेवाएं" },
    { id: "urgent", en: "Urgent Core", hi: "महत्वपूर्ण" },
    { id: "involved", en: "Involved", hi: "जुड़ें" },
    { id: "welfare", en: "Welfare", hi: "कल्याण" },
    { id: "empowerment", en: "Info", hi: "सशक्तिकरण" },
    { id: "civic", en: "Civic", hi: "नागरिक" },
    { id: "local", en: "Local Tools", hi: "ऑफ़लाइन टूल्स" },
  ];

  const filtered = (Array.isArray(servicesList)
    ? servicesList.filter((s: any) => {
        if (!s) return false;
        const enabled = true;
        const matchesCat = category === "all" || s.category === category;
        const matchesSearch =
          (s.titleEn ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (s.titleHi ?? "").toLowerCase().includes(search.toLowerCase());
        return enabled && matchesCat && matchesSearch;
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
    <div className="p-4 flex-1 flex flex-col min-h-screen bg-slate-50/50 pb-28 relative overflow-hidden">
      {/* ── Decorative backdrop ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-br from-[#000080]/5 to-[#FF9933]/5 blur-[80px] pointer-events-none z-0 rounded-full" />

      <div className="relative z-10 space-y-5">
        {/* ── Header & Search ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-extrabold text-2xl text-[#000080] tracking-tight">
                {isHi ? "नागरिक सेवाएं" : "Civic Services"}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isHi ? "आरपी फाउंडेशन डिजिटल संगम" : "RP Foundation Digital Hub"}
              </p>
            </div>
          </div>

          {/* Search Bar (Glassmorphic) */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-[#000080] transition-colors" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isHi ? "सेवाएं, योजनाएं या टूल्स खोजें..." : "Search services, schemes or tools..."}
              className="w-full pl-11 pr-4 py-3.5 bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-2xl text-sm shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-[#000080]/20 focus:border-[#000080]/30 transition-all placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* ── Categories (Horizontally Scrollable) ── */}
        <div className="flex overflow-x-auto gap-2.5 pb-2 -mx-4 px-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {categories.map((c) => {
            const isActive = category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`snap-start whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-[#000080] text-white shadow-md shadow-[#000080]/20 scale-100"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 active:scale-95"
                }`}
              >
                {isHi ? c.hi : c.en}
              </button>
            );
          })}
        </div>

        {/* ── Service Grid ── */}
        {isLoadingServices ? (
          <div className="py-12 flex justify-center items-center">
             <div className="w-6 h-6 border-2 border-[#000080] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-1">
            {filtered.map((svc, idx) => {
              // Exact routes available in App.tsx
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
                          : `/services/${svc.id}`; // Everything else uses dynamic details

              const IconComponent = (LucideIcons as any)[svc.iconName || "Compass"] || Compass;
              
              const gradients = [
                "bg-blue-50 text-blue-600 border-blue-100 group-hover:border-blue-200",
                "bg-orange-50 text-orange-600 border-orange-100 group-hover:border-orange-200",
                "bg-green-50 text-green-600 border-green-100 group-hover:border-green-200",
                "bg-purple-50 text-purple-600 border-purple-100 group-hover:border-purple-200",
                "bg-amber-50 text-amber-600 border-amber-100 group-hover:border-amber-200",
                "bg-rose-50 text-rose-600 border-rose-100 group-hover:border-rose-200",
                "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:border-emerald-200",
                "bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:border-indigo-200"
              ];
              const colorClass = gradients[idx % gradients.length];

              return (
                 <button 
                    key={svc.id} 
                    onClick={() => navigate(route)}
                    className="relative bg-white rounded-2xl p-4 flex flex-col items-center gap-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/80 transition-all duration-300 active:scale-[0.97] hover:shadow-[0_8px_25px_-5px_rgba(0,0,128,0.1)] hover:border-[#000080]/20 group overflow-hidden"
                  >
                    <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out" />
                    
                    <div className={`w-14 h-14 relative flex items-center justify-center rounded-xl shadow-inner border group-hover:shadow-md transition-all ${colorClass}`}>
                      <IconComponent className="w-7 h-7" />
                    </div>
                    
                    <div className="w-full text-center relative z-10">
                      <h4 className="font-extrabold text-[12px] text-slate-800 leading-tight line-clamp-1 group-hover:text-[#000080] transition-colors">
                        {isHi ? svc.titleHi : svc.titleEn}
                      </h4>
                      <p className="text-[9px] font-medium text-slate-400 mt-0.5 line-clamp-1 px-1">
                        {isHi ? svc.descHi : svc.descEn}
                      </p>
                    </div>
                  </button>
              );
            })}
          </div>
        )}

        {!isLoadingServices && filtered.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-600">
              {isHi ? "कोई सेवा नहीं मिली" : "No services found"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isHi ? "कृपया कुछ और खोजें" : "Try searching for something else"}
            </p>
          </div>
        )}

        {/* ── Web Search Results (Fallback) ── */}
        {search.trim().length > 0 && (
          <div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {webLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-[#FF9933] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : webResults.length > 0 && (
              <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 p-4">
                <p className="text-[11px] font-extrabold text-[#000080] uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Globe className="w-3.5 h-3.5 text-[#FF9933]" />
                  {isHi ? "वेब परिणाम" : "Web Results"}
                </p>
                <div className="space-y-3">
                  {webResults.map((r, i) => (
                    <a key={i} href={r.link} target="_blank" rel="noreferrer"
                      className="flex gap-3 group"
                    >
                      <div className="mt-1 w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:border-[#FF9933]/30 transition-colors">
                        <img
                          src={`https://www.google.com/s2/favicons?sz=32&domain_url=${r.link}`}
                          alt=""
                          className="w-3.5 h-3.5 rounded-sm"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-slate-800 group-hover:text-[#000080] leading-snug line-clamp-2 transition-colors">
                          {r.title}
                        </p>
                        <p className="text-[10px] font-medium text-slate-500 mt-1 line-clamp-2 leading-relaxed">
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



