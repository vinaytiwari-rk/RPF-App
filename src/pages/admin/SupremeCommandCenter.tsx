import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  ShieldCheck, Search, RefreshCw, LogOut, 
  LayoutGrid, Images, HeartHandshake, Tv, Compass, User,
  Download, Activity
} from "lucide-react";
import { motion } from "framer-motion";

const STUDIOS = [
  { id: "dashboard", path: "/admin", label: "Dashboard", icon: LayoutGrid, badge: "Live" },
  { id: "home", path: "/admin/home", label: "Home", icon: Images },
  { id: "activity", path: "/admin/activity", label: "Activity", icon: Activity, badge: "Action" },
  { id: "impact", path: "/admin/impact", label: "Impact", icon: HeartHandshake },
  { id: "live-tv", path: "/admin/live-tv", label: "Live TV", icon: Tv },
  { id: "explore", path: "/admin/explore", label: "Explore", icon: Compass },
  { id: "profile", path: "/admin/profile", label: "Profile", icon: User },
];

export default function SupremeCommandCenter() {
  const location = useLocation();
  const navigate = useNavigate();
  const [globalSearch, setGlobalSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  const handleLogout = () => {
    // Basic logout logic here
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pb-16">
      {/* TRICOLOR TOP ACCENT STRIP */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#C2410C] via-white to-[#166534] shadow-xs" />

      {/* HEADER & SEARCH BAR */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-xs">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E67817] shadow-md shadow-orange-500/10">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#166534] border border-emerald-200">
                  Supreme Admin
                </span>
                <span className="text-[10px] font-bold text-slate-400">RP Foundation Control Room</span>
              </div>
              <h1 className="text-base font-black tracking-tight text-[#0A192F]">
                Supreme Command Center
              </h1>
            </div>
          </div>

          {/* Global Search Bar */}
          <div className="relative min-w-[280px] max-w-md flex-1 mx-4">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search users, cards, grievances, services..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 transition"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#0A192F] transition shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-[#C2410C] ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition shadow-xs"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 sm:px-6 flex-col lg:flex-row">
        {/* DESKTOP NAVIGATION SIDEBAR */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            
            {/* Core Studios */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-3.5 shadow-sm">
              <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-slate-400 mb-2">
                7 Core Command Studios
              </p>
              <div className="space-y-1">
                {STUDIOS.map(({ id, path, label, icon: Icon, badge }) => {
                  const isActive = location.pathname === path || (path !== "/admin" && location.pathname.startsWith(path));
                  return (
                    <Link
                      key={id}
                      to={path}
                      className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-left text-xs transition ${
                        isActive
                          ? "bg-[#0A192F] text-white shadow-md font-black"
                          : "text-slate-600 hover:bg-slate-50 hover:text-[#0A192F] font-bold"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#E67817]" : "text-slate-400"}`} />
                        <span>{label}</span>
                      </div>
                      {badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                            isActive ? "bg-[#167C5A] text-white" : "bg-emerald-100 text-[#166534]"
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Exporters */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-3.5 shadow-sm">
              <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-slate-400 mb-2">
                Quick Exporters
              </p>
              <div className="space-y-1">
                <button className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-xs text-slate-600 hover:bg-slate-50 hover:text-[#0A192F] font-bold transition">
                  <Download className="h-4 w-4 text-emerald-600" />
                  <span>Export Users CSV</span>
                </button>
                <button className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-xs text-slate-600 hover:bg-slate-50 hover:text-[#0A192F] font-bold transition">
                  <Download className="h-4 w-4 text-emerald-600" />
                  <span>Export Volunteers CSV</span>
                </button>
              </div>
            </div>

          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
