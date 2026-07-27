// src/pages/NotificationsPage.tsx
// ──────────────────────────────────────────────────────────────────────────────
//  ALERTS
//  • Success Stories moved out of this page — they now live in Community
//    (Community.tsx → "Success Stories" tab), alongside the rest of the
//    foundation's public-facing content instead of mixed in with alerts.
//  • This page is now focused purely on personal/civic notifications.
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Bell, Info, AlertTriangle, CheckCircle, BellOff } from "lucide-react";

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

  useEffect(() => {
    if (cmsConfig) {
      setNotifications(cmsConfig.notifications || []);
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
    warning: { icon: <AlertTriangle className="w-4 h-4 text-amber-600" />, bg: "bg-amber-50 border-amber-200 text-amber-800" },
    urgent: { icon: <AlertTriangle className="w-4 h-4 text-red-600 animate-bounce" />, bg: "bg-red-50 border-red-200 text-red-800" },
  };

  return (
    <div className="flex flex-col h-full bg-transparent animate-fadeIn max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4 border-b border-slate-200 sticky top-0 z-10 shadow-xs shrink-0 flex items-center justify-between">
        <div>
          <h3 className="font-display font-extrabold text-base text-chakra-navy flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#000080]" />
            {lang === "hi" ? "सूचनाएं" : "Alerts"}
          </h3>
          <p className="text-[10.5px] text-slate-400 font-semibold mt-0.5">
            {unreadCount > 0
              ? `${unreadCount} ${lang === "hi" ? "अपठित सूचनाएं" : "unread"}`
              : lang === "hi" ? "सब पढ़ लिया गया" : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-[9.5px] font-black text-[#000080] hover:underline uppercase tracking-widest shrink-0"
          >
            {lang === "hi" ? "सभी पढ़े हुए करें" : "Mark all read"}
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3.5">
        {notifications.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
              <BellOff className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-400">
              {lang === "hi" ? "अभी कोई सूचना नहीं है" : "No alerts right now"}
            </p>
            <p className="text-xs text-slate-350 max-w-[220px] mx-auto">
              {lang === "hi"
                ? "जब कोई महत्वपूर्ण अपडेट होगी, वह यहाँ दिखाई देगी।"
                : "Important updates about your requests and the community will show up here."}
            </p>
          </div>
        )}

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
    </div>
  );
}
