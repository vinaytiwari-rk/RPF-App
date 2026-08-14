// src/pages/NotificationsPage.tsx
import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Bell, Info, AlertTriangle, CheckCircle, BellOff, Activity, Star } from "lucide-react";

interface NotificationItem {
  id: string;
  type: "info" | "success" | "warning" | "urgent";
  titleEn: string;
  titleHi: string;
  bodyEn: string;
  bodyHi: string;
  createdAt: string;
  read: boolean;
}

export default function NotificationsPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { cmsConfig, updateCmsConfig } = useApp();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "important">("all");

  useEffect(() => {
    if (cmsConfig) {
      // Sort newest first
      const sorted = (cmsConfig.notifications || []).sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotifications(sorted);
    }
  }, [cmsConfig]);

  const markAllRead = async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    try {
      await updateCmsConfig({ ...cmsConfig, notifications: updated });
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const markRead = async (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    try {
      await updateCmsConfig({ ...cmsConfig, notifications: updated });
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const displayedNotifications = notifications.filter(n => {
    if (activeTab === "important") {
      return n.type === "urgent" || n.type === "warning";
    }
    return true;
  });

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
    info: { icon: <Info className="w-3.5 h-3.5 text-blue-600" />, dot: "bg-blue-500", border: "border-blue-100" },
    success: { icon: <CheckCircle className="w-3.5 h-3.5 text-green-600" />, dot: "bg-green-500", border: "border-green-100" },
    warning: { icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />, dot: "bg-amber-500", border: "border-amber-100" },
    urgent: { icon: <AlertTriangle className="w-3.5 h-3.5 text-red-600" />, dot: "bg-red-500 animate-pulse", border: "border-red-100" },
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn min-h-screen pb-28">
      {/* Header */}
      <div className="bg-white pt-6 pb-4 border-b border-slate-100 sticky top-0 z-10 shadow-sm shrink-0 flex flex-col gap-4">
        <div className="flex items-center justify-between px-4">
          <div>
            <h3 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-6 h-6 text-[#000080]" />
              {lang === "hi" ? "गतिविधि" : "Activity"}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1 uppercase tracking-wider">
              {unreadCount > 0
                ? `${unreadCount} ${lang === "hi" ? "नए अपडेट" : "new updates"}`
                : lang === "hi" ? "सब पढ़ लिया गया" : "You're all caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[10px] font-bold text-[#000080] hover:underline uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full"
            >
              {lang === "hi" ? "सभी पढ़े हुए करें" : "Mark all read"}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="px-4 flex gap-2">
           <button 
             onClick={() => setActiveTab("all")}
             className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 flex-1 ${activeTab === 'all' ? 'bg-[#000080] text-white shadow-md' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}
           >
              {lang === "hi" ? "सभी गतिविधि" : "All Activity"}
           </button>
           <button 
             onClick={() => setActiveTab("important")}
             className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 flex-1 flex items-center justify-center gap-1.5 ${activeTab === 'important' ? 'bg-[#FF9933] text-white shadow-md' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}
           >
              <Star className={`w-3.5 h-3.5 ${activeTab === 'important' ? 'fill-current text-white' : 'text-slate-400'}`} />
              {lang === "hi" ? "महत्वपूर्ण" : "Important"}
           </button>
        </div>
      </div>

      {/* Main Content Area (Timeline) */}
      <div className="flex-1 p-4">
        {displayedNotifications.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mx-auto">
              <BellOff className="w-6 h-6 text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">
                {lang === "hi" ? "कोई गतिविधि नहीं" : "No recent activity"}
              </p>
              <p className="text-xs text-slate-500 max-w-[240px] mx-auto mt-1">
                {lang === "hi"
                  ? "जब कोई नया अपडेट आएगा, वह यहाँ टाइमलाइन में दिखाई देगा।"
                  : "Important updates and status changes will appear here in your timeline."}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-4 pl-5 space-y-6 pt-2">
            {displayedNotifications.map((n) => {
              const cls = TYPE_CLASSES[n.type];
              return (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className="relative group cursor-pointer"
                >
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-125 ${cls.dot}`} />
                  
                  {/* Timeline Card */}
                  <div className={`bg-white p-3.5 rounded-2xl shadow-sm border transition-all duration-200 active:scale-[0.98] ${!n.read ? `border-l-4 shadow-md ${n.type === 'urgent' ? 'border-l-red-500' : 'border-l-[#000080]'}` : 'border-slate-100 hover:border-slate-300'}`}>
                    <div className="flex justify-between items-start mb-1.5">
                       <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full bg-slate-50 border flex items-center justify-center shrink-0 ${cls.border}`}>
                             {cls.icon}
                          </div>
                          <h4 className={`text-[13px] font-bold leading-tight ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                            {lang === "hi" ? n.titleHi : n.titleEn}
                          </h4>
                       </div>
                       {!n.read && <span className="w-2 h-2 bg-[#000080] rounded-full shrink-0 mt-1 shadow-sm"></span>}
                    </div>
                    
                    <div className="pl-8">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {lang === "hi" ? n.bodyHi : n.bodyEn}
                      </p>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block pt-2 flex items-center gap-1">
                         <Activity className="w-3 h-3" />
                         {ago(n.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
