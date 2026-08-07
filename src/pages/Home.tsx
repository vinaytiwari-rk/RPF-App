import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { translations } from "../translations";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

const { 
  ChevronRight, Heart, Calendar, MapPin, QrCode, Activity, 
  BookOpen, Briefcase, Users, Flame, Compass, Award, 
  AlertTriangle, Shield, CheckCircle, PhoneCall, HelpCircle, 
  GraduationCap, FileText, ArrowRight, ShieldCheck, Play,
  Leaf, Instagram, Facebook, Youtube, Twitter, Globe, Info
} = LucideIcons;
// Purged Firebase imports for portability

export default function Home() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user } = useAuth();
  const [weather, setWeather] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const { settings, globalSettings, announcements, cmsConfig, servicesList, isLoadingServices } = useApp();
  const navigate = useNavigate();
  const t = translations[lang];

  const [activeSlide, setActiveSlide] = useState(0);
  const [stats, setStats] = useState({
    beneficiaries: 0,
    volunteers: 0,
    healthCamps: 0,
    scholarships: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);

  useEffect(() => {
    const fetchStatsAndCampaigns = async () => {
      try {
        const statsRes = await fetch("/api/stats");
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats({
            beneficiaries: data.beneficiaries || 0,
            volunteers: data.volunteers || 0,
            healthCamps: data.healthCamps || 0,
            scholarships: data.scholarships || 0
          });
        }
      } catch (err) {
        console.error("Error fetching live stats:", err);
      } finally {
        setStatsLoading(false);
      }

      try {
        const campRes = await fetch("/api/campaigns");
        if (campRes.ok) {
          const data = await campRes.json();
          setCampaigns(data.campaigns || []);
        }
      } catch (err) {
        console.error("Error fetching live campaigns:", err);
      } finally {
        setCampaignsLoading(false);
      }
    };
    fetchStatsAndCampaigns();
  }, []);

  const slides = cmsConfig.carouselSlides || [];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    fetch("/api/public/weather")
      .then(r => r.json())
      .then(d => { if(d.success) setWeather(d.data); })
      .catch(e => console.error("Weather fetch err", e));
      
    fetch("/api/public/news")
      .then(r => r.json())
      .then(d => { if(d.success) setNews(d.data); })
      .catch(e => console.error("News fetch err", e));
  }, []);

  
  const serviceIdToEmoji: Record<string, string> = {
    card: "🪪", blood: "🩸", grievance: "📝", disaster: "🚨", 
    farmer: "🌾", schemes: "📜", skills: "🎓", "health-care": "🏥", 
    jobs: "💼", environment: "🌳", culture: "🕉️", donations: "💖"
  };

  const serviceIdToRoute: Record<string, string> = {
    card: "/jan-seva-card",
    blood: "/blood-network",
    donations: "/donations",
    grievance: "/grievance",
    volunteers: "/volunteers",
    "health-care": "/health-care",
    jobs: "/jobs",
    scholarships: "/scholarships",
    food: "/food",
    medicine: "/medicine",
    education: "/education",
    "women-safety": "/women",
    seniors: "/seniors",
    animals: "/animals",
    environment: "/environment",
    crowdfunding: "/crowdfunding",
    culture: "/religious-culture",
    countries: "/countries"
  };

  const serviceIdToGradient: Record<string, string> = {
    card: "from-blue-500 via-indigo-500 to-violet-650",
    blood: "from-red-500 via-rose-500 to-red-700",
    "health-care": "from-emerald-400 via-teal-500 to-green-600",
    environment: "from-green-400 via-emerald-500 to-teal-600",
    culture: "from-amber-400 via-orange-500 to-red-600",
  };

  const serviceIdToIcon: Record<string, string> = {
    card: "ShieldCheck",
    blood: "Heart",
    donations: "HandCoins",
    grievance: "AlertTriangle",
    volunteers: "Users",
    "health-care": "Activity",
    jobs: "Briefcase",
    scholarships: "GraduationCap",
    food: "Apple",
    medicine: "Pill",
    education: "BookOpen",
    "women-safety": "Shield",
    seniors: "HandHelping",
    animals: "Compass",
    environment: "Leaf",
    crowdfunding: "Coins",
    culture: "Landmark",
    countries: "Globe"
  };

  const activeServiceIds = ["card", "blood", "health-care", "disaster", "farmer", "skills", "schemes", "jobs", "environment", "culture"];

  const quickActions = activeServiceIds.map((id: string) => {
    const s = servicesList?.find((ds: any) => ds.id === id);
    if (!s) return null;
    return {
      id: s.id,
      iconName: serviceIdToIcon[s.id] || s.iconName || "Compass",
      route: serviceIdToRoute[s.id] || `/services`,
      titleEn: s.titleEn,
      titleHi: s.titleHi,
      glowGradient: serviceIdToGradient[s.id] || "from-blue-500 via-indigo-500 to-violet-650"
    };
  }).filter(Boolean);

  return (
    <div className="space-y-5 animate-fadeIn min-h-full pb-16 font-sans relative overflow-x-hidden bg-transparent" id="live-impact-dashboard">
      
      {/* Dynamic Global Emergency Banner */}
      {(lang === "hi" ? cmsConfig.alertBannerHi : cmsConfig.alertBannerEn) && (
        <div className="bg-red-600 text-white px-4 py-2 text-[10.5px] font-black flex items-center gap-2 animate-pulse shadow-sm z-50 relative shrink-0">
          <AlertTriangle className="w-4 h-4 text-white fill-white shrink-0" />
          <div className="overflow-hidden whitespace-nowrap w-full relative">
            <div className="inline-block animate-marquee-scroll uppercase tracking-wide">
              {lang === "hi" ? cmsConfig.alertBannerHi : cmsConfig.alertBannerEn}
            </div>
          </div>
        </div>
      )}

      {/* 1. Indian Heritage Mandala Backdrop */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] h-[340px] opacity-[0.03] pointer-events-none z-0">
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#D4AF37]" fill="currentColor">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <path d="M50 5l2 15 15-15-5 25 15-5-25 5 15 15-25-2 5 25-15-15-5 15-15-15-5 15-5-25-25 2 15-15-25-5 15-5-15-25 15 15z"/>
        </svg>
      </div>

      {/* 2. Top Carousel Banner (Matches Screenshot 4/5 Carousel Banner) */}
      {slides.length > 0 && (
        <div className="px-4 pt-4 relative z-10">
          <div className="relative rounded-3xl overflow-hidden h-48 shadow-lg border border-slate-200/50 bg-slate-900 text-white">
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeSlide}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 0.35, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                src={slides[activeSlide]?.image} 
                alt="Carousel Banner" 
                className="absolute inset-0 w-full h-full object-cover" 
              />
            </AnimatePresence>
            {/* Saffron & Green Waves gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent pointer-events-none"></div>
            
            {/* Subtle Tricolour Bottom Trim */}
            <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-tricolour"></div>
            
            <div className="relative z-10 p-5 flex flex-col justify-between h-full pointer-events-none">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeSlide}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="space-y-1.5 max-w-[240px]"
                >
                  <h3 className="font-display font-extrabold text-base leading-tight tracking-wide text-white drop-shadow-md">
                    {lang === "hi" ? slides[activeSlide]?.titleHi : slides[activeSlide]?.titleEn}
                  </h3>
                  <p className="text-[10px] text-slate-200 font-semibold drop-shadow-xs">
                    {lang === "hi" ? slides[activeSlide]?.subHi : slides[activeSlide]?.subEn}
                  </p>
                
      

    </motion.div>
              </AnimatePresence>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-3 right-4 flex gap-1 z-10">
              {slides.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === i ? "bg-[#FF9933] w-4" : "bg-white/40 w-1.5 hover:bg-white/60"}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Important Notices */}
      {(globalSettings?.show_notices !== false && announcements && announcements.length > 0) && (
        <div className="px-4 relative z-10">
          <div className="bg-white border border-amber-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-400 px-4 py-2 flex items-center justify-between">
              <h3 className="font-display font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> 
                {lang === "hi" ? "महत्वपूर्ण सूचनाएं" : "Important Notices"}
              </h3>
            </div>
            <div className="p-3 space-y-3 max-h-48 overflow-y-auto">
              {announcements.map((ann: any, i: number) => (
                <div key={i} className="flex gap-3 items-start border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-[11px] leading-tight mb-0.5">{ann.title}</h4>
                    <p className="text-[10px] text-slate-600 leading-snug">{ann.content}</p>
                    {ann.link_url && (
                      <a href={ann.link_url} target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-600 font-semibold mt-1 inline-flex items-center hover:underline">
                        {lang === "hi" ? "अधिक पढ़ें" : "Read More"} <ChevronRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Our Impact Section (Matches Screenshot 5 Our Impact Grid) */}
      {(globalSettings?.show_widgets !== false) && (
      <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="px-4 relative z-10"
      >
        <div className="flex justify-between items-center mb-2.5">
          <h4 className="font-display font-extrabold text-xs text-[#0B1E3F]">
            {lang === "hi" ? "हमारा प्रभाव" : "Our Impact"}
          </h4>
          <button 
            onClick={() => navigate("/services")}
            className="text-[9px] font-black text-[#000080] uppercase tracking-wider hover:underline"
          >
            {lang === "hi" ? "सभी देखें >" : "See All >"}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 bg-white border border-slate-200/60 rounded-2xl p-3.5 shadow-sm">
          <div className="text-center space-y-1">
            <span className="text-[14px] font-black text-slate-900 tracking-tight block">
              {stats.beneficiaries === 0 ? "0" : stats.beneficiaries >= 1000 ? `${(stats.beneficiaries / 1000).toFixed(1)}K+` : stats.beneficiaries}
            </span>
            <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider block leading-tight">
              {lang === "hi" ? "लाभार्थी" : "Beneficiaries"}
            </span>
          </div>
          <div className="text-center space-y-1 border-l border-slate-100">
            <span className="text-[14px] font-black text-slate-900 tracking-tight block">
              {stats.volunteers === 0 ? "0" : stats.volunteers >= 1000 ? `${(stats.volunteers / 1000).toFixed(1)}K+` : stats.volunteers}
            </span>
            <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider block leading-tight">
              {lang === "hi" ? "स्वयंसेवक" : "Volunteers"}
            </span>
          </div>
          <div className="text-center space-y-1 border-l border-slate-100">
            <span className="text-[14px] font-black text-slate-900 tracking-tight block">
              {stats.healthCamps === 0 ? "0" : stats.healthCamps >= 1000 ? `${(stats.healthCamps / 1000).toFixed(1)}K+` : stats.healthCamps}
            </span>
            <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider block leading-tight">
              {lang === "hi" ? "स्वास्थ्य शिविर" : "Health Camps"}
            </span>
          </div>
          <div className="text-center space-y-1 border-l border-slate-100">
            <span className="text-[14px] font-black text-slate-900 tracking-tight block">
              {stats.scholarships === 0 ? "0" : stats.scholarships >= 1000 ? `${(stats.scholarships / 1000).toFixed(1)}K+` : stats.scholarships}
            </span>
            <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider block leading-tight">
              {lang === "hi" ? "छात्रवृत्ति" : "Scholarships"}
            </span>
          </div>
        </div>
      
      

    </motion.div>

      {/* 4. Quick Actions (Matches Screenshot 5 View All Services Grid - 5 columns x 2 rows) */}
      <div className="px-4 relative z-10">
        <div className="flex justify-between items-center mb-2.5">
          <h4 className="font-display font-extrabold text-xs text-[#0B1E3F]">
            {lang === "hi" ? "त्वरित सेवाएं" : "Quick Actions"}
          </h4>
          <button 
            onClick={() => navigate("/services")}
            className="text-[9px] font-black text-[#000080] uppercase tracking-wider hover:underline"
          >
            {lang === "hi" ? "सभी सेवाएं देखें >" : "View All Services >"}
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2 bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm min-h-[90px] w-full justify-items-center">
          {quickActions.map((action, idx) => {
            const IconComponent = (LucideIcons as any)[action.iconName] || Compass;
            
            return (
              <button 
                key={idx}
                onClick={() => navigate(action.route)}
                className="flex flex-col items-center justify-center p-0.5 transition text-center gap-2 active:scale-95 duration-300 cursor-pointer group relative w-full"
              >
                <div className="relative w-11 h-11 bg-gradient-to-br from-[#000080] via-indigo-600 to-blue-500 border border-indigo-200 rounded-lg shadow-md flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 mix-blend-overlay rounded-lg"></div>
                      
                        {serviceIdToEmoji[action.id] ? (
                          <span className="text-2xl z-10 drop-shadow-md">{serviceIdToEmoji[action.id]}</span>
                        ) : (
                          <IconComponent className="w-6 h-6 text-white drop-shadow-md z-10" />
                        )}

                    </div>
                <span className="text-[9px] font-black text-slate-700 leading-tight w-full truncate">
                  {lang === "hi" ? action.titleHi : action.titleEn}
                </span>
              </button>
            );
          })}
        </div>

        </div>
      </>
      )}

      {/* 6. Message from Founder (Matches Screenshot 5 Founder Msg) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="px-4 relative z-10"
      >
        <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF9933]/5 rounded-full blur-xl"></div>
          
          <div className="flex items-start gap-4">
            {/* Founder avatar with golden ring */}
            <div className="relative shrink-0 mt-1">
              <img 
                src={globalSettings?.founder_image || cmsConfig.founderImgUrl || "/assets/founder.png"} 
                alt="Founder Message Avatar" 
                className="w-16 h-16 rounded-full object-cover border-2 border-[#D4AF37]/50 shadow-sm"
              />
            </div>
            
            {/* Message details */}
            <div className="space-y-2">
              <h4 className="font-display font-extrabold text-xs text-[#0B1E3F] uppercase tracking-wider">
                {lang === "hi" ? "संस्थापक का संदेश" : "Message from Founder"}
              </h4>
              <p className="text-[10px] text-slate-600 leading-relaxed italic font-medium">
                "{globalSettings?.founder_message || (lang === "hi" ? settings.founderMessageHi : settings.founderMessageEn)}"
              </p>
              <div className="pt-1.5 border-t border-slate-100">
                <p className="font-display font-black text-[10.5px] text-[#000080] leading-none">
                  {cmsConfig.founderName || "Rohit Pandit"}
                </p>
                <p className="text-[8px] text-[#D4AF37] font-black uppercase tracking-wider mt-1">
                  {cmsConfig.founderDesignation || "Founder, RP Foundation"}
                </p>
              </div>
            </div>
          </div>
        </div>
      
        {/* Helplines and Social Media Sections */}
        <div className="grid grid-cols-1 gap-4 mt-5">

          {/* Social Media Panel */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-3">
            <h4 className="font-display font-extrabold text-xs text-[#0B1E3F] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Globe className="w-4 h-4 text-blue-600" />
              {lang === "hi" ? "आधिकारिक सोशल मीडिया" : "Follow Us"}
            </h4>

            <div className="flex justify-around items-center px-1 py-1">
              {[
                { name: "Facebook", icon: Facebook, color: "text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-100", url: "https://facebook.com/therpfoundation" },
                { name: "Instagram", icon: Instagram, color: "text-pink-650 bg-pink-50 hover:bg-pink-100 border-pink-100", url: "https://instagram.com/therpfoundation" },
                { name: "YouTube", icon: Youtube, color: "text-red-600 bg-red-50 hover:bg-red-100 border-red-100", url: "https://youtube.com/@therpfoundation" },
                { name: "Twitter", icon: Twitter, color: "text-slate-800 bg-slate-100 hover:bg-slate-200 border-slate-200", url: "https://twitter.com/therpfoundation" }
              ].map((social, idx) => {
                const SocialIcon = social.icon;
                return (
                  <a 
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition transform hover:scale-105 active:scale-95 ${social.color}`}
                    title={social.name}
                  >
                    <SocialIcon className="w-4.5 h-4.5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

    </motion.div>
      
    </div>
  );
}





