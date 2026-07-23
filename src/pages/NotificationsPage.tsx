import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { 
  Bell, Info, AlertTriangle, CheckCircle, Heart, MessageCircle, 
  Share2, ThumbsUp, Star, MapPin, Calendar, Globe, BookOpen, Quote 
} from "lucide-react";

interface NotificationItem {
  id: string;
  type: "info" | "success" | "warning" | "urgent";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

interface SocialPost {
  id: string;
  author: string;
  role: string;
  avatar: string;
  time: string;
  textEn: string;
  textHi: string;
  image: string;
  likes: number;
  commentsCount: number;
  liked?: boolean;
}

interface Testimonial {
  id: string;
  nameEn: string;
  nameHi: string;
  villageEn: string;
  villageHi: string;
  quoteEn: string;
  quoteHi: string;
}





export default function NotificationsPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { socialPosts, likePost, cmsConfig, updateCmsConfig } = useApp();
  
  const [activeTab, setActiveTab] = useState<"alerts" | "testimonials">("alerts");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    if (cmsConfig) {
      setNotifications(cmsConfig.notifications || []);
      setTestimonials(cmsConfig.testimonials || []);
    }
  }, [cmsConfig]);

  const markAllRead = async () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    try {
      await updateCmsConfig({ ...cmsConfig, notifications: updated });
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const markRead = async (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    try {
      await updateCmsConfig({ ...cmsConfig, notifications: updated });
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const ago = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return lang === "hi" ? `${mins} मिनट पहले` : `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return lang === "hi" ? `${hrs} घंटे पहले` : `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return lang === "hi" ? `${days} दिन पहले` : `${days}d ago`;
  };

  const TYPE_CLASSES = {
    info: { icon: <Info className="w-4 h-4 text-blue-600" />, bg: "bg-blue-50 border-blue-200 text-blue-800" },
    success: { icon: <CheckCircle className="w-4 h-4 text-green-600" />, bg: "bg-green-50 border-green-200 text-green-800" },
    warning: { icon: <AlertTriangle className="w-4 h-4 text-amber-600" />, bg: "bg-amber-50 border-amber-250 text-amber-800" },
    urgent: { icon: <AlertTriangle className="w-4 h-4 text-red-600 animate-bounce" />, bg: "bg-red-50 border-red-200 text-red-800" },
  };

  return (
    <div className="flex flex-col h-full bg-transparent animate-fadeIn max-w-md mx-auto">
      
      {/* Upper Tab Switcher */}
      <div className="bg-white px-5 pt-5 pb-1 border-b border-slate-200 sticky top-0 z-10 shadow-xs shrink-0">
        <h3 className="font-display font-extrabold text-base text-chakra-navy mb-4">
          {lang === "hi" ? "सूचनाएं एवं सफलता गाथा" : "Alerts & Success Stories"}
        </h3>
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60">
          <button 
            onClick={() => setActiveTab("alerts")}
            className={`flex-1 py-2 text-[10.5px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer relative ${
              activeTab === "alerts" ? "bg-white text-[#000080] shadow-sm border border-slate-200/30" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>{lang === "hi" ? "सूचनाएं" : "Alerts"}</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab("testimonials")}
            className={`flex-1 py-2 text-[10.5px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
              activeTab === "testimonials" ? "bg-white text-[#000080] shadow-sm border border-slate-200/30" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {lang === "hi" ? "सफलता गाथा" : "Success Stories"}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        
        {/* 1. Alerts Section (Notifications) */}
        {activeTab === "alerts" && (
          <div className="space-y-3.5 animate-fadeIn">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {unreadCount} {lang === "hi" ? "अपठित सूचनाएं" : "unread alerts"}
              </span>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead}
                  className="text-[9.5px] font-black text-[#000080] hover:underline uppercase tracking-widest"
                >
                  {lang === "hi" ? "सभी पढ़े हुए करें" : "Mark all read"}
                </button>
              )}
            </div>

            {notifications.map((n) => {
              const cls = TYPE_CLASSES[n.type];
              return (
                <div 
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`glass-card bg-white/95 p-4 border-gold-soft flex gap-3 cursor-pointer transition relative overflow-hidden ${
                    !n.read ? "border-l-4 border-l-orange-500 shadow-md" : ""
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cls.bg}`}>
                    {cls.icon}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-center gap-2">
                      <h4 className={`text-xs font-black truncate leading-none ${!n.read ? "text-slate-900" : "text-slate-650"}`}>
                        {lang === "hi" ? n.titleHi : n.titleEn}
                      </h4>
                      {!n.read && <span className="w-1.5 h-1.5 bg-orange-500 rounded-full shrink-0"></span>}
                    </div>
                    <p className="text-[10.5px] text-slate-500 leading-relaxed">{lang === "hi" ? n.bodyHi : n.bodyEn}</p>
                    <span className="text-[8px] font-bold text-slate-400 font-mono block pt-0.5">{ago(n.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}


        {/* 3. Testimonials (Citizen quotes) */}
        {activeTab === "testimonials" && (
          <div className="space-y-4 animate-fadeIn">
            {testimonials.map(t => (
              <div 
                key={t.id}
                className="bg-white border border-slate-205 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between"
              >
                {/* Floating Quotes Saffron logo */}
                <div className="absolute top-2 right-3 opacity-[0.08] text-[#FF9933] pointer-events-none">
                  <Quote className="w-16 h-16 transform rotate-180" />
                </div>

                <div className="space-y-3 relative z-10">
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold italic">
                    "{lang === "hi" ? t.quoteHi : t.quoteEn}"
                  </p>
                  
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#000080] to-[#FF9933] text-white flex items-center justify-center text-xs font-black shadow-xs">
                      {lang === "hi" ? t.nameHi[0] : t.nameEn[0]}
                    </div>
                    <div>
                      <h5 className="text-xs font-extrabold text-slate-800">{lang === "hi" ? t.nameHi : t.nameEn}</h5>
                      <span className="text-[9.5px] font-bold text-slate-450 uppercase tracking-wider block mt-0.5 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {lang === "hi" ? t.villageHi : t.villageEn}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
