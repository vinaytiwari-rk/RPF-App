import React, { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  ShieldCheck, Search, RefreshCw, LogOut, 
  LayoutGrid, Images, HeartHandshake, Tv, Compass, User,
  Activity, TrendingUp, Film, Lock, CheckCircle2,
  AlertTriangle, FileText, X, ChevronRight, UserCheck, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import axios from "axios";

const STUDIOS = [
  { id: "dashboard", path: "/admin", label: "Dashboard", icon: LayoutGrid, badge: "Live" },
  { id: "home", path: "/admin/home", label: "Home", icon: Images },
  { id: "impact", path: "/admin/impact", label: "Impact", icon: HeartHandshake, badge: "Real" },
  { id: "activity", path: "/admin/activity", label: "Activity", icon: Activity, badge: "Action" },
  { id: "campaigns", path: "/admin/campaigns", label: "Campaigns & Funds", icon: TrendingUp, badge: "Donations" },
  { id: "live-tv", path: "/admin/live-tv", label: "Live TV & Radio", icon: Tv },
  { id: "explore", path: "/admin/explore", label: "Explore", icon: Compass },
  { id: "profile", path: "/admin/profile", label: "Profile", icon: User },
  { id: "reels", path: "/admin/reels", label: "Reels / Social", icon: Film, badge: "Media" },
  { id: "security", path: "/admin/security", label: "System / Security", icon: Lock, badge: "Auth" },
];

interface SearchResultItem {
  id: string;
  category: "User" | "Volunteer" | "Card" | "Grievance" | "Service" | "Campaign";
  title: string;
  subtitle: string;
  destination: string;
}

export default function SupremeCommandCenter() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const { refreshData } = useApp();

  const [globalSearch, setGlobalSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [refreshing, setRefreshing] = useState(false);

  // Global Admin Search Handler
  useEffect(() => {
    if (!globalSearch.trim() || globalSearch.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const query = globalSearch.toLowerCase().trim();
      const results: SearchResultItem[] = [];

      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 1. Search Users & Volunteers
        try {
          const [uRes, vRes, cRes, gRes] = await Promise.allSettled([
            axios.get("/api/admin/users", { headers, timeout: 4000 }),
            axios.get("/api/admin/volunteers", { headers, timeout: 4000 }),
            axios.get("/api/cards", { headers, timeout: 4000 }),
            axios.get("/api/grievance", { headers, timeout: 4000 })
          ]);

          if (uRes.status === "fulfilled" && Array.isArray(uRes.value.data?.data)) {
            uRes.value.data.data.forEach((u: any) => {
              const name = u.name || u.username || "";
              const phone = u.phone || u.email || "";
              if (name.toLowerCase().includes(query) || phone.toLowerCase().includes(query)) {
                results.push({
                  id: `user-${u.id}`,
                  category: "User",
                  title: name || "Registered User",
                  subtitle: `${phone} • Role: ${u.role || "citizen"}`,
                  destination: "/admin"
                });
              }
            });
          }

          if (vRes.status === "fulfilled" && Array.isArray(vRes.value.data?.data)) {
            vRes.value.data.data.forEach((v: any) => {
              const name = v.name || "";
              const email = v.email || v.mobile || "";
              if (name.toLowerCase().includes(query) || email.toLowerCase().includes(query)) {
                results.push({
                  id: `vol-${v.id}`,
                  category: "Volunteer",
                  title: name || "Volunteer",
                  subtitle: `${v.city || "Field"} • Status: ${v.status || "active"}`,
                  destination: "/admin/activity"
                });
              }
            });
          }

          if (cRes.status === "fulfilled" && Array.isArray(cRes.value.data?.applications)) {
            cRes.value.data.applications.forEach((c: any) => {
              const name = c.name || "";
              const cardNo = c.cardNo || c.idNumber || "";
              if (name.toLowerCase().includes(query) || cardNo.toLowerCase().includes(query)) {
                results.push({
                  id: `card-${c.id || c.cardNo}`,
                  category: "Card",
                  title: `${name} (Card: ${cardNo})`,
                  subtitle: `Status: ${c.status || "pending"}`,
                  destination: "/admin"
                });
              }
            });
          }

          if (gRes.status === "fulfilled" && Array.isArray(gRes.value.data?.grievances)) {
            gRes.value.data.grievances.forEach((g: any) => {
              const title = g.title || g.description || "";
              const citizen = g.citizenName || "";
              if (title.toLowerCase().includes(query) || citizen.toLowerCase().includes(query)) {
                results.push({
                  id: `griev-${g.id}`,
                  category: "Grievance",
                  title: title.slice(0, 40),
                  subtitle: `By: ${citizen} • Status: ${g.status || "pending"}`,
                  destination: "/admin/activity"
                });
              }
            });
          }
        } catch {}

        // Add matching core services
        const knownServices = [
          { name: "Jan Seva Card", desc: "Digital welfare identity" },
          { name: "Healthcare", desc: "Free medical camps" },
          { name: "Employment", desc: "Jobs and skill training" },
          { name: "Blood Network", desc: "Emergency blood donor network" },
          { name: "Live TV Broadcast", desc: "Channels and cultural streams" },
          { name: "Internet Radio", desc: "Live regional radio stations" },
          { name: "Women Safety & Pink E-Rickshaw", desc: "Empowerment transit" },
          { name: "Farmer Support", desc: "Crop diagnostic & mandi prices" }
        ];

        knownServices.forEach(s => {
          if (s.name.toLowerCase().includes(query) || s.desc.toLowerCase().includes(query)) {
            results.push({
              id: `serv-${s.name}`,
              category: "Service",
              title: s.name,
              subtitle: s.desc,
              destination: "/admin/explore"
            });
          }
        });

        setSearchResults(results.slice(0, 8));
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [globalSearch, token]);

  // Click outside search results to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Real Refresh (Phase 7)
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      toast.loading("Refreshing CMS & system data...", { id: "admin-refresh" });
      
      // Dispatch standard app refresh event
      window.dispatchEvent(new CustomEvent("samahit-admin-updated"));
      if (typeof refreshData === "function") {
        await refreshData();
      }

      toast.success("System & CMS telemetry refreshed live!", { id: "admin-refresh" });
    } catch {
      toast.error("Failed to refresh some data sources", { id: "admin-refresh" });
    } finally {
      setRefreshing(false);
    }
  };

  // Proper Logout (Phase 8)
  const handleLogout = async () => {
    try {
      toast.loading("Signing out...", { id: "admin-logout" });
      
      // 1. Clear session via AuthContext
      await logout();

      // 2. Extra safety: Clear any stored tokens and admin cache
      localStorage.removeItem("@rpf_token");
      localStorage.removeItem("@rpf_user");
      localStorage.removeItem("token");
      sessionStorage.clear();

      toast.success("Logged out successfully", { id: "admin-logout" });
      
      // 3. Navigate directly to login
      navigate("/login", { replace: true });
    } catch {
      navigate("/login", { replace: true });
    }
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

          {/* Global Search Bar (Phase 9) */}
          <div ref={searchContainerRef} className="relative min-w-[280px] max-w-md flex-1 mx-4">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={globalSearch}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setSearchFocused(true);
              }}
              placeholder="Search users, cards, volunteers, grievances, services..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-9 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 transition"
            />
            {globalSearch && (
              <button
                onClick={() => {
                  setGlobalSearch("");
                  setSearchResults([]);
                }}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Clickable Search Results Dropdown */}
            {searchFocused && (globalSearch.length >= 2 || searchResults.length > 0) && (
              <div className="absolute top-12 left-0 right-0 z-50 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden divide-y divide-slate-100 max-h-96 overflow-y-auto">
                <div className="p-2.5 bg-slate-50 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Search Results</span>
                  {isSearching ? (
                    <span className="text-[#C2410C] flex items-center gap-1">Searching...</span>
                  ) : (
                    <span>{searchResults.length} found</span>
                  )}
                </div>

                {searchResults.length === 0 && !isSearching && (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No matching records found for "{globalSearch}"
                  </div>
                )}

                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSearchFocused(false);
                      setGlobalSearch("");
                      navigate(item.destination);
                    }}
                    className="w-full text-left p-3 hover:bg-slate-50 transition flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          item.category === "Card" ? "bg-amber-100 text-amber-800" :
                          item.category === "Volunteer" ? "bg-emerald-100 text-emerald-800" :
                          item.category === "Grievance" ? "bg-rose-100 text-rose-800" :
                          item.category === "Service" ? "bg-blue-100 text-blue-800" :
                          "bg-slate-100 text-slate-700"
                        }`}>
                          {item.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-[#C2410C] transition">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#C2410C] shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Admin User Identity & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex flex-col text-right mr-1">
              <span className="text-xs font-black text-[#0A192F]">{user?.name || "Administrator"}</span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">{user?.role || "Super Admin"}</span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#0A192F] transition shadow-xs"
              title="Reload live telemetry & CMS config"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-[#C2410C] ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition shadow-xs"
              title="Securely sign out of Supreme Command"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 sm:px-6 flex-col lg:flex-row">
        {/* DESKTOP NAVIGATION SIDEBAR (10 Authoritative Studios) */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            
            {/* Core Studios List */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-3.5 shadow-sm">
              <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Command Studios
              </div>
              <nav className="space-y-1">
                {STUDIOS.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`group flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition ${
                        active
                          ? "bg-[#0A192F] text-white shadow-md shadow-slate-900/10"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${active ? "text-[#C2410C]" : "text-slate-400 group-hover:text-[#C2410C]"} transition`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                            active
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* System Status Panel */}
            <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 to-[#0A192F] p-4 text-white shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Node Status
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live Online
                </span>
              </div>
              <p className="text-xs font-bold text-slate-200">
                RPF Master Engine v2.5
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                PostgreSQL • Cloudinary • Node Express
              </p>
            </div>

          </div>
        </aside>

        {/* OUTLET WORKSPACE */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
