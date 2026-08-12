import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { translations } from "../translations";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

const { 
  ChevronRight, AlertTriangle, PhoneCall, Shield, Activity, ShieldCheck,
  Heart, HandCoins, Users, Briefcase, GraduationCap, Apple, Pill, BookOpen,
  HandHelping, Compass, Leaf, Coins, Landmark, Globe, ShieldAlert, Map, Bot, Info,
  Facebook, Instagram, Youtube, Twitter, FileEdit, Camera, Radio
} = LucideIcons;

export default function Home() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings, cmsConfig, globalSettings, announcements, servicesList } = useApp();
  
  const [weather, setWeather] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [ndmaAlert, setNdmaAlert] = useState<any>(null);
  const t = translations[lang];

  const [activeSlide, setActiveSlide] = useState(0);
  const [stats, setStats] = useState({
    beneficiaries: 0,
    volunteers: 0,
    healthCamps: 0,
    campaigns: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRes = await fetch("/api/stats");
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats({
            beneficiaries: data.beneficiaries || 0,
            volunteers: data.volunteers || 0,
            healthCamps: data.healthCamps || 0,
            campaigns: data.campaigns || 0
          });
        }
      } catch (err) {}
    };
    fetchStats();
  }, []);

  const slides = cmsConfig.carouselSlides || [];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const serviceIdToRoute: Record<string, string> = {
    card: "/jan-seva-card",
    blood: "/blood-network",
    donations: "/donations",
    farmer: "/farmer",
    schemes: "/schemes",
    skills: "/skills",
    disaster: "/disaster",
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
    countries: "/countries",
    sos: "/sos",
    "transit-planner": "/transit-planner",
    "ai-chat": "/ai-chat",
    "resume-builder": "/resume-builder",
    "doc-scanner": "/doc-scanner",
    "internet-radio": "/internet-radio"
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
    countries: "Globe",
    sos: "ShieldAlert",
    "transit-planner": "Map",
    "ai-chat": "Bot",
    "resume-builder": "FileEdit",
    "doc-scanner": "Camera",
    "internet-radio": "Radio"
  };

  // We want a cleaner grid (maybe 4x2 instead of 5x2)
  // NOTE: these ids must match the real service ids returned by
  // /api/public/services (see src/data/coreServices.ts / DEFAULT_SERVICES).
  // This list previously used made-up ids ("jan-seva", "health", "resume",
  // "scanner", "radio") that didn't match anything, so 5 of these 7 quick
  // actions silently disappeared from the grid.
  const activeServiceIds = ["card", "blood", "health-care", "grievance", "resume-builder", "doc-scanner", "internet-radio"];

  const quickActions = activeServiceIds.map((id: string) => {
    const s = servicesList?.find((ds: any) => ds.id === id);
    if (!s) return null;
    
    // Dynamic Icon matching
    const IconName = serviceIdToIcon[s.id] || "Compass";
    const IconComponent = LucideIcons[IconName as keyof typeof LucideIcons] as any;
    
    return {
      id: s.id,
      Icon: IconComponent || LucideIcons.Compass,
      route: serviceIdToRoute[s.id] || `/services`,
      titleEn: s.titleEn,
      titleHi: s.titleHi,
    };
  }).filter(Boolean);

  return (
    <div className="space-y-6 min-h-full pb-8 font-sans bg-slate-50 animate-fadeIn">
      
      {/* Alert Banner */}
      {(ndmaAlert || (lang === "hi" ? cmsConfig.alertBannerHi : cmsConfig.alertBannerEn)) && (
        <div className="bg-red-600 text-white px-4 py-2.5 text-xs font-bold flex items-center gap-2 shadow-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <div className="overflow-hidden whitespace-nowrap w-full">
            <div className="inline-block animate-marquee-scroll uppercase tracking-wide">
              {ndmaAlert ? 
                  (lang === "hi" ? ndmaAlert.titleHi : ndmaAlert.titleEn) 
                  : (lang === "hi" ? cmsConfig.alertBannerHi : cmsConfig.alertBannerEn)}
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner Carousel */}
      {slides.length > 0 && (
        <div className="px-4 mt-4">
          <div className="relative rounded-2xl overflow-hidden h-[220px] shadow-sm bg-slate-900 group">
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                src={slides[activeSlide]?.image} 
                alt="Banner" 
                className="absolute inset-0 w-full h-full object-cover" 
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-5 w-full">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeSlide}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="font-bold text-xl text-white leading-tight mb-1">
                    {lang === "hi" ? slides[activeSlide]?.titleHi : slides[activeSlide]?.titleEn}
                  </h3>
                  <p className="text-sm text-slate-200">
                    {lang === "hi" ? slides[activeSlide]?.subHi : slides[activeSlide]?.subEn}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dots */}
            <div className="absolute bottom-5 right-5 flex gap-1.5">
              {slides.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === i ? "bg-[#FF9933] w-5" : "bg-white/50 w-1.5"}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Important Notices */}
      {(globalSettings?.show_notices !== false && announcements && announcements.length > 0) && (
        <div className="px-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-amber-50 px-4 py-3 flex items-center gap-2 border-b border-amber-100">
              <AlertTriangle className="w-5 h-5 text-amber-600" /> 
              <h3 className="font-bold text-amber-900 text-sm">
                {lang === "hi" ? "महत्वपूर्ण सूचनाएं" : "Important Notices"}
              </h3>
            </div>
            <div className="p-4 space-y-3 max-h-[200px] overflow-y-auto">
              {announcements.map((ann: any, i: number) => (
                <div key={i} className="flex gap-3 items-start pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{ann.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                    {ann.link_url && (
                      <a href={ann.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-semibold mt-1.5 inline-flex items-center hover:underline">
                        {lang === "hi" ? "अधिक पढ़ें" : "Read More"} <ChevronRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="px-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-lg text-slate-900">
            {lang === "hi" ? "त्वरित सेवाएं" : "Quick Actions"}
          </h4>
          <button onClick={() => navigate("/services")} className="text-sm font-semibold text-blue-600 hover:underline">
            {lang === "hi" ? "सभी देखें" : "View All"}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action: any, idx: number) => (
            <button 
              key={action.id}
              onClick={() => navigate(action.route)}
              className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-300 transition-all active:scale-95 gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-[#000080]">
                <action.Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">
                {lang === "hi" ? action.titleHi : action.titleEn}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Impact Stats */}
      {(globalSettings?.show_widgets !== false) && (
        <div className="px-4 mt-2">
          <h4 className="font-bold text-lg text-slate-900 mb-4">
            {lang === "hi" ? "हमारा प्रभाव" : "Our Impact"}
          </h4>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <span className="text-2xl font-black text-[#000080] block mb-1">
                {stats.beneficiaries === 0 ? "0" : stats.beneficiaries >= 1000 ? `${(stats.beneficiaries / 1000).toFixed(1)}K+` : stats.beneficiaries}
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {lang === "hi" ? "लाभार्थी" : "Beneficiaries"}
              </span>
            </div>
            <div className="text-center sm:border-l border-slate-100">
              <span className="text-2xl font-black text-[#FF9933] block mb-1">
                {stats.volunteers === 0 ? "0" : stats.volunteers >= 1000 ? `${(stats.volunteers / 1000).toFixed(1)}K+` : stats.volunteers}
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {lang === "hi" ? "स्वयंसेवक" : "Volunteers"}
              </span>
            </div>
            <div className="text-center sm:border-l border-slate-100">
              <span className="text-2xl font-black text-[#138808] block mb-1">
                {stats.healthCamps === 0 ? "0" : stats.healthCamps >= 1000 ? `${(stats.healthCamps / 1000).toFixed(1)}K+` : stats.healthCamps}
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {lang === "hi" ? "स्वास्थ्य शिविर" : "Health Camps"}
              </span>
            </div>
            <div className="text-center sm:border-l border-slate-100">
              <span className="text-2xl font-black text-blue-500 block mb-1">
                {stats.campaigns === 0 ? "0" : stats.campaigns >= 1000 ? `${(stats.campaigns / 1000).toFixed(1)}K+` : stats.campaigns}
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {lang === "hi" ? "अभियान" : "Campaigns"}
              </span>
            </div>
          </div>
        </div>
      )}


      {/* Quote & Founder Message */}
      <div className="px-4 space-y-4">
        <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100/50">
          <div className="flex justify-between items-center mb-3">
             <h4 className="font-bold text-sm text-blue-900">
               {lang === "hi" ? "आज का सुविचार" : "Quote of the Day"}
             </h4>
             <Info className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-sm text-slate-700 italic font-medium leading-relaxed">
            "{lang === "hi" 
                ? (cmsConfig.quoteOfTheDayHi || "कर्म ही पूजा है, और सेवा ही सबसे बड़ा धर्म है।") 
                : (cmsConfig.quoteOfTheDayEn || "Work is worship, and service is the greatest religion.")}"
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-start gap-4">
          <img 
            src={cmsConfig.founderImgUrl || globalSettings?.founder_image || "/assets/founder.png"} 
            alt="Founder" 
            className="w-16 h-16 rounded-full object-cover shadow-sm border border-slate-200 shrink-0"
          />
          <div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">
              {lang === "hi" ? "संस्थापक का संदेश" : "Message from Founder"}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed italic mb-3">
              "{globalSettings?.founder_message || (lang === "hi" ? settings.founderMessageHi : settings.founderMessageEn)}"
            </p>
            <div>
              <p className="font-bold text-sm text-[#000080]">
                {cmsConfig.founderName || "Rohit Pandit"}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5 tracking-wider">
                {cmsConfig.founderDesignation || "Founder, RP Foundation"}
              </p>
            </div>
          </div>
        </div>

      </div>
      
    </div>
  );
}
