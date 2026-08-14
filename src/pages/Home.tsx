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
  Facebook, Instagram, Youtube, Twitter, FileEdit, Camera, Radio, Search
} = LucideIcons;

export default function Home() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings, cmsConfig, globalSettings, announcements, servicesList } = useApp();
  
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

  // Greeting Logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return lang === "hi" ? "सुप्रभात" : "Good Morning";
    if (hour < 17) return lang === "hi" ? "शुभ दोपहर" : "Good Afternoon";
    return lang === "hi" ? "शुभ संध्या" : "Good Evening";
  };
  
  const firstName = user?.name ? user.name.split(' ')[0] : "";

  // Quick Actions Config (Hardcoded to the requested ones for Premium Home)
  const quickActions = [
    { id: 'blood', icon: Heart, labelEn: 'Need Blood', labelHi: 'रक्त चाहिए', route: '/blood-network', color: 'text-red-500', bg: 'bg-red-50' },
    { id: 'sos', icon: ShieldAlert, labelEn: 'Need Help', labelHi: 'मदद चाहिए', route: '/sos', color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'jobs', icon: Briefcase, labelEn: 'Jobs', labelHi: 'रोज़गार', route: '/jobs', color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'education', icon: GraduationCap, labelEn: 'Education', labelHi: 'शिक्षा', route: '/education', color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'volunteers', icon: Users, labelEn: 'Volunteer', labelHi: 'स्वयंसेवक', route: '/volunteers', color: 'text-green-500', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6 min-h-full pb-8 font-sans bg-slate-50 animate-fadeIn">
      
      {/* Premium Header & Greeting */}
      <div className="px-4 pt-6 pb-2">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          {getGreeting()} 👋
        </h2>
        {firstName && (
          <p className="text-slate-500 font-medium mt-1">
            {lang === "hi" ? `वापसी पर स्वागत है, ${firstName}!` : `Welcome back, ${firstName}!`}
          </p>
        )}
      </div>

      {/* Universal Search Bar (Routes to Services) */}
      <div className="px-4">
        <div 
          onClick={() => navigate("/services")}
          className="w-full bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm cursor-text active:scale-[0.98] transition-transform"
        >
          <Search className="w-5 h-5 text-slate-400" />
          <span className="text-slate-400 font-medium text-sm">
            {lang === "hi" ? "आपको किस चीज़ में मदद चाहिए? 🔎" : "What do you need help with? 🔎"}
          </span>
        </div>
      </div>

      {/* Alert Banner */}
      {(ndmaAlert || (lang === "hi" ? cmsConfig.alertBannerHi : cmsConfig.alertBannerEn)) && (
        <div className="px-4">
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-3 shadow-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <div className="w-full">
              <h4 className="font-bold text-red-800 text-sm mb-0.5">
                {lang === "hi" ? "महत्वपूर्ण अलर्ट" : "Important Alert"}
              </h4>
              <p className="text-xs text-red-600 font-medium leading-relaxed">
                {ndmaAlert ? 
                    (lang === "hi" ? ndmaAlert.titleHi : ndmaAlert.titleEn) 
                    : (lang === "hi" ? cmsConfig.alertBannerHi : cmsConfig.alertBannerEn)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="px-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-bold text-base text-slate-900">
            {lang === "hi" ? "त्वरित कार्रवाइयां" : "Quick Actions"}
          </h4>
          <button onClick={() => navigate("/services")} className="text-xs font-semibold text-blue-600 hover:underline">
            {lang === "hi" ? "सभी देखें" : "View All"}
          </button>
        </div>

        <div className="flex justify-between gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {quickActions.map((action, idx) => (
            <button 
              key={action.id}
              onClick={() => navigate(action.route)}
              className="flex flex-col items-center justify-center min-w-[70px] gap-2 active:scale-95 transition-transform"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${action.bg}`}>
                <action.icon className={`w-6 h-6 ${action.color}`} />
              </div>
              <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">
                {lang === "hi" ? action.labelHi : action.labelEn}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Hero Banner Carousel */}
      {slides.length > 0 && (
        <div className="px-4">
          <div className="relative rounded-2xl overflow-hidden h-[180px] shadow-sm bg-slate-900 group">
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
            
            <div className="absolute bottom-0 left-0 p-4 w-full">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeSlide}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="font-bold text-lg text-white leading-tight mb-1">
                    {lang === "hi" ? slides[activeSlide]?.titleHi : slides[activeSlide]?.titleEn}
                  </h3>
                  <p className="text-xs text-slate-200 line-clamp-2">
                    {lang === "hi" ? slides[activeSlide]?.subHi : slides[activeSlide]?.subEn}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dots */}
            <div className="absolute bottom-4 right-4 flex gap-1.5">
              {slides.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === i ? "bg-[#FF9933] w-4" : "bg-white/50 w-1.5"}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Important Notices */}
      {(globalSettings?.show_notices !== false && announcements && announcements.length > 0) && (
        <div className="px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-amber-50 px-4 py-3 flex items-center justify-between border-b border-amber-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> 
                <h3 className="font-bold text-amber-900 text-sm">
                  {lang === "hi" ? "समुदाय अपडेट" : "Community Updates"}
                </h3>
              </div>
            </div>
            <div className="p-4 space-y-4 max-h-[220px] overflow-y-auto">
              {announcements.map((ann: any, i: number) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{ann.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                    {ann.link_url && (
                      <a href={ann.link_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 font-bold mt-1.5 inline-flex items-center hover:underline uppercase tracking-wide">
                        {lang === "hi" ? "अधिक पढ़ें" : "Read More"} <ChevronRight className="w-3 h-3 ml-0.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Impact Stats */}
      {(globalSettings?.show_widgets !== false) && (
        <div className="px-4 mt-2">
          <h4 className="font-bold text-base text-slate-900 mb-3">
            {lang === "hi" ? "हमारा प्रभाव" : "Our Impact"}
          </h4>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 grid grid-cols-2 gap-4">
            <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50 text-center">
              <span className="text-2xl font-black text-[#000080] block mb-1">
                {stats.beneficiaries === 0 ? "0" : stats.beneficiaries >= 1000 ? `${(stats.beneficiaries / 1000).toFixed(1)}K+` : stats.beneficiaries}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {lang === "hi" ? "लाभार्थी" : "Beneficiaries"}
              </span>
            </div>
            <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-100/50 text-center">
              <span className="text-2xl font-black text-[#FF9933] block mb-1">
                {stats.volunteers === 0 ? "0" : stats.volunteers >= 1000 ? `${(stats.volunteers / 1000).toFixed(1)}K+` : stats.volunteers}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {lang === "hi" ? "स्वयंसेवक" : "Volunteers"}
              </span>
            </div>
            <div className="bg-green-50/50 rounded-xl p-3 border border-green-100/50 text-center">
              <span className="text-2xl font-black text-[#138808] block mb-1">
                {stats.healthCamps === 0 ? "0" : stats.healthCamps >= 1000 ? `${(stats.healthCamps / 1000).toFixed(1)}K+` : stats.healthCamps}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {lang === "hi" ? "स्वास्थ्य शिविर" : "Health Camps"}
              </span>
            </div>
            <div className="bg-purple-50/50 rounded-xl p-3 border border-purple-100/50 text-center">
              <span className="text-2xl font-black text-purple-600 block mb-1">
                {stats.campaigns === 0 ? "0" : stats.campaigns >= 1000 ? `${(stats.campaigns / 1000).toFixed(1)}K+` : stats.campaigns}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {lang === "hi" ? "अभियान" : "Campaigns"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quote & Founder Message */}
      <div className="px-4 space-y-4 pt-2">
        <div className="bg-blue-50/30 rounded-2xl p-4 border border-blue-100/30">
          <div className="flex justify-between items-center mb-2">
             <h4 className="font-bold text-xs uppercase tracking-wider text-blue-900/60">
               {lang === "hi" ? "आज का सुविचार" : "Quote of the Day"}
             </h4>
             <Info className="w-4 h-4 text-blue-400/60" />
          </div>
          <p className="text-sm text-slate-700 italic font-medium leading-relaxed">
            "{lang === "hi" 
                ? (cmsConfig.quoteOfTheDayHi || "कर्म ही पूजा है, और सेवा ही सबसे बड़ा धर्म है।") 
                : (cmsConfig.quoteOfTheDayEn || "Work is worship, and service is the greatest religion.")}"
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-start gap-4">
          <img 
            src={cmsConfig.founderImgUrl || globalSettings?.founder_image || "/assets/founder.png"} 
            alt="Founder" 
            className="w-14 h-14 rounded-full object-cover shadow-sm border border-slate-200 shrink-0"
          />
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">
              {lang === "hi" ? "संस्थापक का संदेश" : "Message from Founder"}
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed italic mb-2">
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
