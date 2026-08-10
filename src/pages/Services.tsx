import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { Search, Compass, Phone, Globe, Mail, Sparkles, Briefcase, Tractor, Thermometer, ShieldAlert, MapPin, Heart, Baby, FileText, Camera, Bot } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

const serviceIdToImage: Record<string, string> = {
  "card": "/assets/icons/icon_card_updated_1786163163115.jpg",
  "blood": "/assets/icons/icon_blood_1786081356967.jpg",
  "health-care": "/assets/icons/icon_health_updated_1786163249856.jpg",
  "donations": "/assets/icons/icon_donations.jpg",
  "volunteers": "/assets/icons/icon_volunteers_updated_1786163233069.jpg",
  "environment": "/assets/icons/icon_environment_1786081257147.jpg",
  "culture": "/assets/icons/icon_culture_1786081280063.jpg",
  "schemes": "/assets/icons/icon_schemes_updated_1786163186070.jpg",
  "skills": "/assets/icons/icon_skills_1786081334087.jpg",
  "farmer": "/assets/icons/icon_farmer_updated_1786163373604.jpg",
  "disaster": "/assets/icons/icon_disaster_1786081291322.jpg",
  "jobs": "/assets/icons/icon_jobs_updated_1786163264789.jpg",
  "animals": "/assets/icons/icon_animal_1786081244906.jpg",
  "food": "/assets/icons/icon_food_1786081367715.jpg",
  "medicine": "/assets/icons/icon_medicine_updated_1786163301118.jpg",
  "women-safety": "/assets/icons/icon_women_updated_1786163329515.jpg",
  "seniors": "/assets/icons/icon_senior_1786081168198.jpg",
  "education": "/assets/icons/icon_education_updated_1786163314837.jpg",
  "scholarships": "/assets/icons/icon_scholarships_updated_1786163279154.jpg",
  "grievance": "/assets/icons/icon_grievance_updated_1786163210095.jpg",
  "countries": "/assets/icons/icon_global_guide_updated_1786163358416.jpg",
  "crowdfunding": "/assets/icons/icon_crowdfunding_updated_1786163344247.jpg",
  "earthquakes": "/assets/icons/icon_disaster_1786081291322.jpg",
  "fuel-tracker": "/assets/icons/icon_jobs_updated_1786163264789.jpg",
  "gps-toolkit": "/assets/icons/icon_environment_1786081257147.jpg",
  "vitals": "/assets/icons/icon_health_updated_1786163249856.jpg",
  "medications": "/assets/icons/icon_medicine_updated_1786163301118.jpg",
  "medical-dict": "/assets/icons/icon_schemes_updated_1786163186070.jpg",
  "resume-builder": "/assets/icons/icon_skills_1786081334087.jpg",
  "doc-scanner": "/assets/icons/icon_grievance_updated_1786163210095.jpg",
  "ai-chat": "/assets/icons/icon_schemes_updated_1786163186070.jpg",
  "story-library": "/assets/icons/icon_culture_1786081280063.jpg",
  "hindu-calendar": "/assets/icons/icon_culture_1786081280063.jpg",
  "news-feed": "/assets/icons/icon_jobs_updated_1786163264789.jpg",
  "internet-radio": "/assets/icons/icon_culture_1786081280063.jpg"
};

const serviceIdToBorder: Record<string, string> = {
  card: "border-green-600",
  blood: "border-red-600",
  "health-care": "border-green-600",
  environment: "border-green-600",
  culture: "border-amber-600",
  schemes: "border-[#000080]",
  skills: "border-orange-500",
  farmer: "border-green-600",
  disaster: "border-red-600",
  jobs: "border-[#000080]",
  donations: "border-[#000080]",
  volunteers: "border-orange-500",
  animals: "border-[#000080]",
  food: "border-orange-500",
  medicine: "border-[#000080]",
  "women-safety": "border-[#000080]",
  seniors: "border-orange-500",
  education: "border-orange-500",
  scholarships: "border-[#000080]",
  grievance: "border-[#000080]",
  countries: "border-[#000080]",
  earthquakes: "border-red-600",
  "fuel-tracker": "border-amber-600",
  "gps-toolkit": "border-[#000080]",
  "vitals": "border-emerald-600",
  "medications": "border-blue-600",
  "medical-dict": "border-green-600",
  "resume-builder": "border-l-[6px] border-blue-600 shadow-sm hover:border-blue-700",
  "doc-scanner": "border-l-[6px] border-gray-800 shadow-sm hover:border-gray-900",
  "ai-chat": "border-l-[6px] border-indigo-500 shadow-sm hover:border-indigo-600",
  "story-library": "border-l-[6px] border-amber-600 shadow-sm hover:border-amber-700",
  "hindu-calendar": "border-l-[6px] border-orange-500 shadow-sm hover:border-orange-600",
  "news-feed": "border-l-[6px] border-blue-500 shadow-sm hover:border-blue-600",
  "internet-radio": "border-l-[6px] border-purple-500 shadow-sm hover:border-purple-600"
};

export default function Services() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user } = useAuth();
  const { settings, servicesList, isLoadingServices } = useApp();
  const navigate = useNavigate();

  const isHi = lang === "hi";

  const [category, setCategory] = useState("all");
  
  const serviceIdToEmoji: Record<string, string> = {
    card: "🪪", blood: "🩸", grievance: "📝", disaster: "🚨", 
    farmer: "🌾", schemes: "📜", skills: "🎓", "health-care": "🏥", 
    jobs: "💼", environment: "🌳", culture: "🕉️", donations: "💖"
  };

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
          </h3>
          <p className="text-[10px] text-slate-500 font-bold">
            {isHi ? "RP Civic Services Hub" : "Single Platform"}
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
                { bg: "from-[#FF9933] via-orange-500 to-amber-500", shadow: "shadow-[0_0_20px_rgba(255,153,51,0.4)] group-hover:shadow-[0_0_30px_rgba(255,153,51,0.6)]" },
                { bg: "from-slate-50 via-slate-100 to-slate-200", shadow: "shadow-[0_0_20px_rgba(226,232,240,0.6)] group-hover:shadow-[0_0_30px_rgba(203,213,225,0.8)]" },
                { bg: "from-[#138808] via-green-600 to-emerald-600", shadow: "shadow-[0_0_20px_rgba(19,136,8,0.4)] group-hover:shadow-[0_0_30px_rgba(19,136,8,0.6)]" },
                { bg: "from-[#000080] via-blue-800 to-indigo-800", shadow: "shadow-[0_0_20px_rgba(0,0,128,0.4)] group-hover:shadow-[0_0_30px_rgba(0,0,128,0.6)]" },
              ];
            const currentGradient = gradients[idx % gradients.length];
                const IconComponent = (LucideIcons as any)[svc.iconName || "Compass"] || Compass;
              
              const route = svc.id === 'card' ? '/jan-seva-card' 
                          : svc.id === 'blood' ? '/blood-network' 
                          : svc.id === 'donations' ? '/donations'
                            : svc.id === 'farmer' ? '/farmer'
                            : svc.id === 'schemes' ? '/schemes'
                            : svc.id === 'skills' ? '/skills'
                            : svc.id === 'disaster' ? '/disaster'
: svc.id === 'women-safety' ? '/women'
                          : svc.id === 'seniors' ? '/seniors'
                          : svc.id === 'environment' ? '/environment'
                          : svc.id === 'education' ? '/education'
                          : svc.id === 'health-care' ? '/health-care'
                          : svc.id === 'culture' ? '/religious-culture'
                          : svc.id === 'jobs' ? '/jobs'
                          : svc.id === 'scholarships' ? '/scholarships'
                          : svc.id === 'food' ? '/food'
                          : svc.id === 'medicine' ? '/medicine'
                          : svc.id === 'grievance' ? '/grievance'
                          : svc.id === 'volunteers' ? '/volunteers'
                          : svc.id === 'animals' ? '/animals'
                          : svc.id === 'crowdfunding' ? '/crowdfunding'
                          : svc.id === 'countries' ? '/countries'
                          : svc.id === 'earthquakes' ? '/earthquakes'
                          : svc.id === 'fuel-tracker' ? '/fuel-tracker'
                          : svc.id === 'gps-toolkit' ? '/gps-toolkit'
                          : svc.id === 'vitals' ? '/vitals'
                          : svc.id === 'medications' ? '/medications'
                          : svc.id === 'medical-dict' ? '/medical-dict'
                          : svc.id === 'resume-builder' ? '/resume-builder'
                          : svc.id === 'doc-scanner' ? '/doc-scanner'
                          : svc.id === 'ai-chat' ? '/ai-chat'
                          : svc.id === 'story-library' ? '/story-library'
                          : svc.id === 'hindu-calendar' ? '/hindu-calendar'
                          : svc.id === 'news-feed' ? '/news-feed'
                          : svc.id === 'internet-radio' ? '/internet-radio'
                          : `/services/${svc.id}`;

              return (
                 <button key={svc.id} onClick={() => navigate(route)}
                    className={`bg-white border-2 ${serviceIdToBorder[svc.id] || 'border-slate-300'} shadow-sm p-2.5 text-center flex flex-col items-center justify-center gap-2 h-28 rounded-xl transition-all duration-300 ease-in-out hover:shadow-md hover:scale-105 group`}
                    style={{ transitionDelay: `${idx * 25}ms` }}
                  >
                    <div className="w-14 h-14 flex items-center justify-center overflow-hidden">
                      <img src={serviceIdToImage[svc.id] || '/assets/logo.png'} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300" alt="" />
                    </div>
                    <h4 className="font-bold text-[10.5px] text-slate-800 leading-tight line-clamp-2 px-0.5 w-full text-center">
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



