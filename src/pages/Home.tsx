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
  const { settings, cmsConfig, servicesList, isLoadingServices } = useApp();
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

  const quickActions = [
    {
      id: "card",
      iconName: "ShieldCheck",
      route: "/jan-seva-card",
      titleEn: "Jan Seva Card",
      titleHi: "जन सेवा कार्ड",
      glowGradient: "from-blue-500 via-indigo-500 to-violet-650"
    },
    {
      id: "blood",
      iconName: "Heart",
      route: "/blood-network",
      titleEn: "Blood Network",
      titleHi: "रक्तदाता नेटवर्क",
      glowGradient: "from-red-500 via-rose-500 to-red-700"
    },
    {
      id: "health",
      iconName: "Activity",
      route: "/health-care",
      titleEn: "Health Care",
      titleHi: "स्वास्थ्य सेवा",
      glowGradient: "from-emerald-400 via-teal-500 to-green-600"
    },
    {
      id: "environment",
      iconName: "Leaf",
      route: "/environment",
      titleEn: "Environment",
      titleHi: "पर्यावरण सुरक्षा",
      glowGradient: "from-green-400 via-emerald-500 to-teal-600"
    },
    {
      id: "culture",
      iconName: "Landmark",
      route: "/religious-culture",
      titleEn: "Culture",
      titleHi: "धर्म व संस्कृति",
      glowGradient: "from-amber-400 via-orange-500 to-red-600"
    }
  ];

  return (
    <div className="space-y-5 animate-fadeIn min-h-full pb-16 font-sans relative overflow-x-hidden bg-transparent" id="live-impact-dashboard">
      
      {/* Dynamic Global Emergency Banner */}
      {(lang === "hi" ? cmsConfig.alertBannerHi : cmsConfig.alertBannerEn) && (
        <div className="bg-red-600 text-white px-4 py-2 text-[10.5px] font-black flex items-center gap-2 animate-pulse shadow-sm z-50 relative shrink-0">
          <AlertTriangle className="w-4 h-4 text-white fill-white shrink-0" />
          <div className="overflow-hidden whitespace-nowrap w-full relative">
            <div className="inline-block animate-marquee uppercase tracking-wide">
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

      {/* 3. Our Impact Section (Matches Screenshot 5 Our Impact Grid) */}
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
                <div className="relative w-11 h-11 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                  {/* Breathing glowing outer ring */}
                  <div className={`absolute -inset-0.5 rounded-full blur-xs opacity-40 group-hover:opacity-80 transition-all duration-300 animate-pulse bg-gradient-to-r ${action.glowGradient}`}></div>
                  
                  {/* Icon container */}
                  <div className="relative w-9 h-9 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-sm z-10">
                    <IconComponent className="w-4.5 h-4.5 text-slate-800 transition-all duration-500 group-hover:rotate-12" />
                  </div>
                </div>
                <span className="text-[9px] font-black text-slate-700 leading-tight w-full truncate">
                  {lang === "hi" ? action.titleHi : action.titleEn}
                </span>
              </button>
            );
          })}
        </div>

        </div>

      {/* 5. Latest Campaigns Section (Matches Screenshot 5 Latest Campaigns 3 vertical cards) */}
      <div className="px-4 relative z-10">
        <div className="flex justify-between items-center mb-2.5">
          <h4 className="font-display font-extrabold text-xs text-[#0B1E3F]">
            {lang === "hi" ? "नवीनतम अभियान" : "Latest Campaigns"}
          </h4>
          <button 
            onClick={() => navigate("/services")}
            className="text-[9px] font-black text-[#000080] uppercase tracking-wider hover:underline"
          >
            {lang === "hi" ? "सभी देखें >" : "See All >"}
          </button>
        </div>

        <div className="flex overflow-x-auto gap-3.5 pb-2.5 no-scrollbar snap-x snap-mandatory">
          {campaigns.length === 0 ? (
            <div className="w-full text-center py-8 text-slate-400 font-bold border border-slate-100 bg-white rounded-2xl">
              {lang === "hi" ? "कोई सक्रिय दान अभियान नहीं है" : "No active crowdfunding campaigns"}
            </div>
          ) : (
            campaigns.map((camp: any, idx) => {
              const progress = Number(camp.goalAmount) > 0 ? Math.min(100, Math.round((Number(camp.raisedAmount || 0) / Number(camp.goalAmount)) * 100)) : 0;
              const formatRupees = (val: any) => {
                const num = Number(val) || 0;
                if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
                return `₹${num.toLocaleString()}`;
              };
              return (
                <div 
                  key={camp.id || idx} 
                  onClick={() => navigate("/donations")}
                  className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden min-w-[210px] max-w-[210px] snap-center cursor-pointer shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 duration-250 flex flex-col justify-between"
                >
                  <div className="relative h-24 bg-slate-100">
                    <img src={camp.coverImgUrl || "/assets/mega_camp_banner.png"} alt={camp.titleEn} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 text-[7.5px] font-black uppercase text-white px-2 py-0.5 rounded bg-[#138808]">
                      {lang === "hi" ? "लाइव" : "Live"}
                    </span>
                  </div>
                  <div className="p-3.5 space-y-2">
                    <h5 className="font-display font-extrabold text-[11px] text-slate-800 leading-tight line-clamp-2 min-h-[30px]">
                      {lang === "hi" ? camp.titleHi : camp.titleEn}
                    </h5>
                    <div className="flex items-center gap-1 text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{lang === "hi" ? camp.locationHi || "सीहोर, म.प्र." : camp.locationEn || "Sehore, MP"}</span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="space-y-1 pt-1.5 border-t border-slate-100">
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#FF9933] h-full rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                      <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-wide">
                        <span>{formatRupees(camp.raisedAmount)} / {formatRupees(camp.goalAmount)}</span>
                        <span>{progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

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
                src={cmsConfig.founderImgUrl || "/assets/founder.png"} 
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
                "{lang === "hi" ? settings.founderMessageHi : settings.founderMessageEn}"
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
          {/* Scrolling Helpline Marquee Card */}
          <div className="bg-red-600 text-white py-3 px-4.5 rounded-2xl shadow-sm border border-red-500/85 overflow-hidden relative">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black uppercase tracking-wider bg-white text-red-650 px-2 py-1 rounded-lg shrink-0 animate-pulse flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5" />
                {lang === "hi" ? "हेल्पलाइन नंबर" : "Helplines"}
              </span>
              <div className="overflow-hidden whitespace-nowrap w-full relative">
                <div className="inline-block animate-marquee-scroll hover:[animation-play-state:paused] cursor-pointer text-[11px] font-bold font-mono">
                  RP Foundation Toll Free Number: 1800-569-0991, CM Helpline: 181, Emergency Response Support System: 112, Women Helpline: 1090, Ambulance: 108/102, Police Helpline: 100, Fire Emergency: 101, Child Helpline: 1098, Railway Inqury : 139, Airlines Enquiry : 143, Blood Bank: 1910, Voter Helpline: 1950, Cyber Crime Helpline : 1930, LPG Leak Line Helpline: 1906, Natinal Consumer Helpline: 1915, National Narcotis Helpline: 1933, Natural Calaities Helpline: 1070, Road Accident Helpline: 1073 •&nbsp;
                  RP Foundation Toll Free Number: 1800-569-0991, CM Helpline: 181, Emergency Response Support System: 112, Women Helpline: 1090, Ambulance: 108/102, Police Helpline: 100, Fire Emergency: 101, Child Helpline: 1098, Railway Inqury : 139, Airlines Enquiry : 143, Blood Bank: 1910, Voter Helpline: 1950, Cyber Crime Helpline : 1930, LPG Leak Line Helpline: 1906, Natinal Consumer Helpline: 1915, National Narcotis Helpline: 1933, Natural Calaities Helpline: 1070, Road Accident Helpline: 1073 •&nbsp;
                </div>
              </div>
            </div>
          </div>

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
