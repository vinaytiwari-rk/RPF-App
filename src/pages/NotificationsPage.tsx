// src/pages/NotificationsPage.tsx
import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useApp, NotificationItem } from "../context/AppContext";
import { Bell, Info, AlertTriangle, CheckCircle, BellOff, Activity, Star } from "lucide-react";

export default function NotificationsPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { notifications } = useApp();
  const [activeTab, setActiveTab] = useState<"all" | "important">("all");

  const important = notifications.filter(n => n.type === "urgent" || n.type === "warning");
  const displayedNotifications = activeTab === "important" ? important : notifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  const ago = (dateStr: string) => {
    const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return lang === "hi" ? `${mins} मिनट पहले` : `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return lang === "hi" ? `${hrs} घंटे पहले` : `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return lang === "hi" ? `${days} दिन पहले` : `${days}d ago`;
  };

  const TYPE_CLASSES: Record<NotificationItem["type"], { icon: React.ReactNode; dot: string; border: string }> = {
    info: { icon: <Info className="w-3.5 h-3.5 text-blue-600" />, dot: "bg-blue-500", border: "border-blue-100" },
    success: { icon: <CheckCircle className="w-3.5 h-3.5 text-green-600" />, dot: "bg-green-500", border: "border-green-100" },
    warning: { icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />, dot: "bg-amber-500", border: "border-amber-100" },
    urgent: { icon: <AlertTriangle className="w-3.5 h-3.5 text-red-600" />, dot: "bg-red-500 animate-pulse", border: "border-red-100" },
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn min-h-screen pb-24 overflow-x-hidden">
      <div className="bg-white pt-4 pb-3 border-b border-slate-100 sticky top-0 z-10 shadow-sm shrink-0">
        <div className="flex items-center justify-between px-4">
          <div>
            <h3 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#000080]" />
              {lang === "hi" ? "गतिविधि" : "Activity"}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-1 uppercase tracking-wider">
              {unreadCount > 0 ? `${unreadCount} ${lang === "hi" ? "नए अपडेट" : "new updates"}` : lang === "hi" ? "सब पढ़ लिया गया" : "You're all caught up"}
            </p>
          </div>
        </div>
        <div className="px-4 pt-3 flex gap-2">
          <button onClick={() => setActiveTab("all")} className={`px-3 py-2 rounded-full text-[11px] sm:text-xs font-bold transition-all flex-1 ${activeTab === "all" ? "bg-[#000080] text-white shadow-md" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>{lang === "hi" ? "सभी गतिविधि" : "All Activity"}</button>
          <button onClick={() => setActiveTab("important")} className={`px-3 py-2 rounded-full text-[11px] sm:text-xs font-bold transition-all flex-1 flex items-center justify-center gap-1.5 ${activeTab === "important" ? "bg-[#FF9933] text-white shadow-md" : "bg-slate-100 text-slate-600 border border-slate-200"}`}><Star className={`w-3.5 h-3.5 ${activeTab === "important" ? "fill-current text-white" : "text-slate-400"}`} />{lang === "hi" ? "महत्वपूर्ण" : "Important"}</button>
        </div>
      </div>

      <div className="flex-1 p-4">
        {displayedNotifications.length === 0 ? (
          <div className="text-center py-14 space-y-4">
            <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mx-auto"><BellOff className="w-6 h-6 text-slate-300" /></div>
            <div>
              <p className="text-sm font-bold text-slate-700">{lang === "hi" ? "कोई गतिविधि नहीं" : "No recent activity"}</p>
              <p className="text-xs text-slate-500 max-w-[260px] mx-auto mt-1">{lang === "hi" ? "जब आपके खाते से जुड़ा कोई नया अपडेट आएगा, वह यहाँ दिखाई देगा।" : "Updates related to your account will appear here."}</p>
            </div>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-4 pl-5 space-y-5 pt-2">
            {displayedNotifications.map((n) => {
              const cls = TYPE_CLASSES[n.type];
              return <div key={n.id} className="relative">
                <div className={`absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${cls.dot}`} />
                <div className={`bg-white p-3 rounded-2xl shadow-sm border ${!n.read ? `border-l-4 ${n.type === "urgent" ? "border-l-red-500" : "border-l-[#000080]"}` : "border-slate-100"}`}>
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex items-center gap-2 min-w-0"><div className={`w-6 h-6 rounded-full bg-slate-50 border flex items-center justify-center shrink-0 ${cls.border}`}>{cls.icon}</div><h4 className={`text-[13px] font-bold leading-tight ${!n.read ? "text-slate-900" : "text-slate-700"}`}>{lang === "hi" ? n.titleHi : n.titleEn}</h4></div>
                    {!n.read && <span className="w-2 h-2 bg-[#000080] rounded-full shrink-0 mt-1" />}
                  </div>
                  <div className="pl-8"><p className="text-xs text-slate-500 leading-relaxed">{lang === "hi" ? n.bodyHi : n.bodyEn}</p><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block pt-2"><Activity className="w-3 h-3 inline mr-1" />{ago(n.createdAt)}</span></div>
                </div>
              </div>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
