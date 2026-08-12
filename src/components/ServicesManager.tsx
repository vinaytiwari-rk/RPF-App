// src/components/ServicesManager.tsx
//
// Lets an admin show/hide the built-in service tiles that appear on the
// Home quick actions grid and the Services page. Hiding a service here is
// what actually removes its icon everywhere in the app — previously there
// was no working control for this at all: this component posted to
// /api/settings (a table row with no servicesStatus column, so nothing was
// ever actually saved) and wasn't even mounted anywhere in the admin panel.
// It's now backed by /api/admin/services, which reflects real, working
// visibility state that /api/public/services (Home + Services page) honours.
import React, { useEffect, useState } from "react";
import axios from "axios";
import * as LucideIcons from "lucide-react";
import { Compass } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Skeleton } from "./ui/Skeleton";

interface ServiceRow {
  id: string;
  category: string;
  iconName: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  hidden: boolean;
}

export default function ServicesManager() {
  const { token } = useAuth();
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setServices(res.data.data);
    } catch (e) {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const toggleService = async (id: string, hidden: boolean) => {
    setBusyId(id);
    // Optimistic update so the toggle feels instant.
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, hidden } : s)));
    try {
      await axios.post(
        `/api/admin/services/${id}/visibility`,
        { hidden },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(hidden ? "Service hidden from the app" : "Service is now visible");
    } catch (e) {
      // Roll back on failure.
      setServices((prev) => prev.map((s) => (s.id === id ? { ...s, hidden: !hidden } : s)));
      toast.error("Could not update service visibility");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-800">Core Services</h2>
        <p className="text-xs text-slate-500 mt-1">
          Turn a service off to remove its icon from Home and the Services page for every user — this is
          the only control that actually affects which service tiles show up in the app.
        </p>
      </div>
      <ul className="divide-y divide-slate-100">
        {services.map((svc) => {
          const Icon = (LucideIcons as any)[svc.iconName] || Compass;
          return (
            <li key={svc.id} className="flex items-center justify-between px-6 py-3 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#000080] shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{svc.titleEn}</p>
                  <p className="text-[11px] text-slate-400 truncate">{svc.id} · {svc.category}</p>
                </div>
              </div>
              <label className="inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={!svc.hidden}
                  disabled={busyId === svc.id}
                  onChange={(e) => toggleService(svc.id, !e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-checked:bg-emerald-500 rounded-full transition-colors relative">
                  <div className="w-5 h-5 bg-white rounded-full shadow absolute top-0.5 left-0.5 peer-checked:translate-x-5 transition-transform" />
                </div>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
