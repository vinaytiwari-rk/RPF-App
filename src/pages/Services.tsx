import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { Search, Compass, Phone, Globe, Mail, Sparkles } from "lucide-react";
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
    { id: "urgent", en: "⚡ Urgent Core", hi: "⚡ महत्वपूर्ण" },
    { id: "involved", en: "🤝 Involved", hi: "🤝 जुड़ें" },
    { id: "welfare", en: "🫂 Welfare", hi: "🫂 कल्याण" },
    { id: "empowerment", en: "📚 Info", hi: "📚 सशक्तिकरण" },
    { id: "civic", en: "⚖️ Civic", hi: "⚖️ नागरिक" },
  ];

  const filtered = (Array.isArray(servicesList)
    ? servicesList.filter((s: any) => {
        // Exclude donations from services page as it's now on the home page
        if (s.id === "donations") return false;
        
        const enabled = s.enabled !== false && settings?.servicesStatus?.[s.id] !== false;
        const matchesCat = category === "all" || s.category === category;
        const matchesSearch =
          (s.titleEn ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (s.titleHi ?? "").toLowerCase().includes(search.toLowerCase());
        return enabled && matchesCat && matchesSearch;
      })
    : []).sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
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
    <div className="p-5 flex-1 flex flex-col min-h-screen bg-transparent pb-24 relative overflow-hidden">
      {/* ── Decorative backdrop ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] h-[340px] opacity-[0.03] pointer-events-none z-0">
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#D4AF37]" fill="currentColor">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M50 5l2 15 15-15-5 25 15-5-25 5 15 15-25-2 5 25-15-15-5 15-15-15-5 15-5-25-25 2 15-15-25-5 15-5-15-25 15 15z" />
        </svg>
      </div>

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-4 relative z-10">
        <div>
          <h3 className="font-display font-extrabold text-base text-[#000080] flex items-center gap-1">
            {isHi ? "आरपी नागरिक सेवा संगम" : "RP Civic Services Hub"}
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </h3>
          <p className="text-[10px] text-slate-500 font-bold">
            {isHi ? "21 जनकल्याण सेवाएं • एक संकल्प" : "21 Active Welfare Services • Single Platform"}
          </p>
        </div>
        
      </div>

      {/* ══════════════════════════════════════
          SERVICE GRID VIEW
      ══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col space-y-4 relative z-10">
        {/* 21 service cards */}
        {isLoadingServices ? (
          <div className="py-12 flex justify-center items-center text-slate-400 text-xs font-bold">
            {isHi ? "सेवाएं लोड हो रही हैं..." : "Loading services..."}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {filtered.map((svc, idx) => {
              const gradients = [
              { bg: "from-amber-400 via-orange-500 to-red-500", shadow: "shadow-[0_0_20px_rgba(249,115,22,0.6)] group-hover:shadow-[0_0_30px_rgba(239,68,68,0.8)]" },
              { bg: "from-cyan-400 via-teal-500 to-emerald-500", shadow: "shadow-[0_0_20px_rgba(20,184,166,0.6)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.8)]" },
              { bg: "from-blue-500 via-indigo-500 to-cyan-500", shadow: "shadow-[0_0_20px_rgba(99,102,241,0.6)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.8)]" },
              { bg: "from-fuchsia-500 via-purple-600 to-indigo-600", shadow: "shadow-[0_0_20px_rgba(168,85,247,0.6)] group-hover:shadow-[0_0_30px_rgba(192,38,211,0.8)]" },
              { bg: "from-pink-500 via-rose-500 to-red-500", shadow: "shadow-[0_0_20px_rgba(244,63,94,0.6)] group-hover:shadow-[0_0_30px_rgba(225,29,72,0.8)]" },
              { bg: "from-lime-400 via-green-500 to-teal-500", shadow: "shadow-[0_0_20px_rgba(34,197,94,0.6)] group-hover:shadow-[0_0_30px_rgba(20,184,166,0.8)]" },
            ];
            const currentGradient = gradients[idx % gradients.length];
                const IconComponent = (LucideIcons as any)[svc.iconName || "Compass"] || Compass;
              
              const route = svc.id === 'card' ? '/jan-seva-card' 
                          : svc.id === 'blood' ? '/blood-network' 
                          : svc.id === 'donations' ? '/donations' 
                          : svc.id === 'women-safety' ? '/women'
                          : svc.id === 'seniors' ? '/seniors'
                          : svc.id === 'environment' ? '/environment'
                          : svc.id === 'education' ? '/education'
                          : `/services/${svc.id}`;

              return (
                <button key={svc.id} onClick={() => navigate(route)}
                  className={`bg-white/95 border border-slate-200/70 shadow-sm p-3 text-center flex flex-col items-center justify-center gap-2 h-28 rounded-2xl transition-all duration-700 ease-in-out hover:border-indigo-400 hover:shadow-indigo-500/20 hover:shadow-lg translate-y-0 rotate-0 opacity-100 group`}
                  style={{ transitionDelay: `${idx * 25}ms` }}
                >
                  <div className="relative w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${currentGradient.bg} rounded-full ${currentGradient.shadow} transition-all duration-500 animate-pulse`}></div>
                  <IconComponent className="w-6 h-6 text-white relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,1)]" />
                </div>
                    <h4 className="font-bold text-[9px] text-slate-800 leading-tight line-clamp-2 px-0.5">
                    {isHi ? svc.titleHi : svc.titleEn}
                  </h4>
                </button>
              );
            })}
          </div>
        )}

        {!isLoadingServices && filtered.length === 0 && (
          <div className="space-y-3 py-4">
            <p className="text-center text-xs font-bold text-slate-400">
              {isHi ? "कोई स्थानीय सेवा नहीं मिली।" : "No local service matched."}
            </p>
          </div>
        )}

        {/* Web Search results shown below services when searching */}
        {search.trim().length > 0 && (
          <div className="space-y-3 py-2 border-t border-slate-100 mt-2">
            {webLoading && (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 border-2 border-[#000080] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!webLoading && webResults.length > 0 && (
              <div className="space-y-2 text-left">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-[#FF9933] rounded-xs"></span>
                  {isHi ? "🌐 इंटरनेट से योजनाएं और समाचार" : "🌐 Related Schemes & Web Info"}
                </p>
                <div className="space-y-2">
                  {webResults.map((r, i) => (
                    <a key={i} href={r.link} target="_blank" rel="noreferrer"
                      className="flex items-start gap-2.5 bg-white border border-slate-200 rounded-2xl p-3 hover:border-[#FF9933] hover:shadow-sm transition group"
                    >
                      <img
                        src={`https://www.google.com/s2/favicons?sz=16&domain_url=${r.link}`}
                        alt=""
                        className="w-4 h-4 rounded-sm shrink-0 mt-0.5"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-[#000080] group-hover:underline leading-snug line-clamp-2">{r.title}</p>
                        <p className="text-[8.5px] text-slate-500 mt-0.5 line-clamp-2">{r.snippet}</p>
                        <p className="text-[8px] text-[#FF9933] font-semibold mt-1 truncate">{r.displayLink || r.link}</p>
                      </div>
                      <svg className="w-3 h-3 text-slate-400 group-hover:text-[#FF9933] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Footer support bar ── */}
      <div className="mt-4 p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-lg relative z-10">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-green-400" />
          <div>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
              {isHi ? "टोल-फ्री नागरिक सहायता" : "Toll-Free Helpline"}
            </p>
            <p className="text-[10px] font-bold font-mono">{settings?.tollFree || "1800-569-0991"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href={settings?.webUrl ? (settings.webUrl.startsWith("http") ? settings.webUrl : `https://${settings.webUrl}`) : "https://therpfoundation.org"} target="_blank" rel="noreferrer"
            className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
            <Globe className="w-3.5 h-3.5" />
          </a>
          <a href={`mailto:${settings?.email || "info@therpfoundation.org"}`}
            className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
            <Mail className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
