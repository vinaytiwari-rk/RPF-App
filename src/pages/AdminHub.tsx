import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck,
  LayoutGrid,
  Images,
  Compass,
  Activity,
  TrendingUp,
  User,
  Users,
  Search,
  RefreshCw,
  LogOut,
  Download,
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  Lock,
  Server,
  Database,
  Phone,
  Mail,
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight
} from "lucide-react";

import AdminHomeStudio from "../components/admin/AdminHomeStudio";
import AdminExploreStudio from "../components/admin/AdminExploreStudio";
import AdminActivityStudio from "../components/admin/AdminActivityStudio";
import AdminImpactStudio from "../components/admin/AdminImpactStudio";
import AdminProfileStudio from "../components/admin/AdminProfileStudio";
import JanSevaSyncStudio from "../components/admin/JanSevaSyncStudio";

type Section = "overview" | "home" | "explore" | "activity" | "impact" | "profile";
type Row = Record<string, unknown>;

type AdminState = {
  users: Row[];
  volunteers: Row[];
  cards: Row[];
  cardTotal: number;
  announcements: Row[];
  grievances: Row[];
  blood: Row[];
  jobs: Row[];
  auditLogs: Row[];
};

const nav: Array<{ id: Section; label: string; icon: any; badge?: string }> = [
  { id: "overview", label: "Dashboard", icon: LayoutGrid, badge: "Live" },
  { id: "home", label: "Home", icon: Images },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "impact", label: "Impact", icon: TrendingUp },
  { id: "profile", label: "Profile", icon: User },
];

const emptyState: AdminState = {
  users: [],
  volunteers: [],
  cards: [],
  cardTotal: 0,
  announcements: [],
  grievances: [],
  blood: [],
  jobs: [],
  auditLogs: [],
};

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

async function getAdminData(url: string, token: string): Promise<Row[]> {
  try {
    const response = await axios.get(url, { headers: authHeaders(token), timeout: 10000 });
    const payload = response.data?.data ?? response.data;
    if (Array.isArray(payload)) return payload as Row[];
    if (Array.isArray(payload?.items)) return payload.items as Row[];
    return [];
  } catch (error) {
    throw new Error(
      `${url}: ${
        axios.isAxiosError(error)
          ? error.response?.status
            ? `HTTP ${error.response.status}`
            : error.message
          : "Request failed"
      }`
    );
  }
}

export default function AdminHub() {
  const { user, token, hasAdminAccess, logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("overview");
  const [data, setData] = useState<AdminState>(emptyState);
  const [loading, setLoading] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  // CMS State
  const [cms, setCms] = useState<any>(null);
  const [savingCms, setSavingCms] = useState(false);

  // People & User Management Filter & Modals
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserRole, setNewUserRole] = useState("citizen");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserIsVol, setNewUserIsVol] = useState(false);
  const [newUserIsDonor, setNewUserIsDonor] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<Row | null>(null);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState<string>("user");
  const [editPassword, setEditPassword] = useState("");
  const [editIsVol, setEditIsVol] = useState(false);
  const [editIsDonor, setEditIsDonor] = useState(false);
  const [updatingUser, setUpdatingUser] = useState(false);

  useEffect(() => {
    if (!hasAdminAccess) {
      toast.error("Access Denied: Administrator role required");
      navigate("/", { replace: true });
    }
  }, [hasAdminAccess, navigate]);

  const load = useCallback(async () => {
    if (!token || !hasAdminAccess) return;
    setLoading(true);

    const endpoints: Array<[keyof AdminState, string]> = [
      ["users", "/api/admin/users"],
      ["volunteers", "/api/admin/volunteers"],
      ["cards", "/api/cards"],
      ["announcements", "/api/admin/announcements"],
      ["grievances", "/api/admin/grievances"],
      ["blood", "/api/admin/blood_donors"],
      ["jobs", "/api/admin/jobs"],
      ["auditLogs", "/api/admin/audit-logs"],
    ];

    const results = await Promise.allSettled(endpoints.map(([, url]) => getAdminData(url, token)));
    const next: AdminState = { ...emptyState };

    results.forEach((result, index) => {
      const [key] = endpoints[index];
      if (result.status === "fulfilled") next[key] = result.value;
    });

    // Load CMS Data
    try {
      const cmsRes = await axios.get("/api/cms");
      if (cmsRes.data?.success !== false) {
        const nextCms = cmsRes.data?.cms || cmsRes.data?.data || {};
        setCms(nextCms);
      }
    } catch (e) {
      console.warn("CMS fetch warning:", e);
    }

    try {
      const statsRes = await axios.get("/api/cards/stats", { headers: authHeaders(token), timeout: 10000 });
      next.cardTotal = Number(statsRes.data?.stats?.totalMirrored || 0) + Number(statsRes.data?.stats?.totalLocal || 0);
    } catch (e) {
      next.cardTotal = next.cards.length;
    }

    setData(next);
    setLoading(false);
  }, [token, hasAdminAccess]);

  useEffect(() => {
    void load();
  }, [load]);

  // Overall metrics
  const counts = useMemo(
    () => ({
      users: data.users.length,
      volunteers: data.volunteers.length,
      cards: data.cardTotal || data.cards.length,
      announcements: data.announcements.length,
      grievances: data.grievances.length,
      blood: data.blood.length,
      jobs: data.jobs.length,
    }),
    [data]
  );

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return data.users.filter((u) => {
      const roleStr = String(u.role || "citizen").toLowerCase();
      const matchesRole =
        userRoleFilter === "all" ||
        (userRoleFilter === "volunteer" && (roleStr === "volunteer" || Boolean(u.isVolunteer))) ||
        (userRoleFilter === "admin" && (roleStr === "admin" || roleStr === "super_admin")) ||
        (userRoleFilter === "citizen" && roleStr !== "admin" && roleStr !== "volunteer" && !u.isVolunteer);

      const q = globalSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        String(u.name || "").toLowerCase().includes(q) ||
        String(u.phone || "").includes(q) ||
        String(u.email || "").toLowerCase().includes(q) ||
        String(u.username || "").toLowerCase().includes(q);

      return matchesRole && matchesSearch;
    });
  }, [data.users, userRoleFilter, globalSearch]);

  // Save CMS updates
  const saveCmsFromStudio = async (updatedFields: Record<string, unknown>, successMessage?: string) => {
    if (!token) return;
    setSavingCms(true);
    try {
      const payload = { ...(cms || {}), ...updatedFields };
      const res = await axios.post("/api/cms", payload, { headers: authHeaders(token) });
      if (res.data?.success === false) throw new Error(res.data?.error || "Save failed");
      setCms(payload);
      window.dispatchEvent(new Event("samahit-admin-updated"));
      if (successMessage) toast.success(successMessage);
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || err?.message || "Failed to save CMS settings");
    } finally {
      setSavingCms(false);
    }
  };

  // Create New User
  const handleCreateUser = async () => {
    if (!token) return;
    if (!newUserName.trim()) {
      toast.error("Full name is required.");
      return;
    }
    setCreatingUser(true);
    try {
      const res = await axios.post(
        "/api/admin/users",
        {
          name: newUserName.trim(),
          username: newUserUsername.trim() || undefined,
          email: newUserEmail.trim() || undefined,
          phone: newUserPhone.trim() || undefined,
          role: newUserRole,
          password: newUserPassword.trim() || undefined,
          isVolunteer: newUserIsVol,
          isDonor: newUserIsDonor,
        },
        { headers: authHeaders(token) }
      );

      if (res.data?.success !== false) {
        toast.success("User created successfully!");
        setIsCreateUserOpen(false);
        setNewUserName("");
        setNewUserUsername("");
        setNewUserEmail("");
        setNewUserPhone("");
        setNewUserRole("citizen");
        setNewUserPassword("");
        setNewUserIsVol(false);
        setNewUserIsDonor(false);
        await load();
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to create user.");
    } finally {
      setCreatingUser(false);
    }
  };

  // Start Editing User
  const startEditUser = (row: Row) => {
    setEditingUser(row);
    setEditName(String(row.name || ""));
    setEditUsername(String(row.username || ""));
    setEditEmail(String(row.email || ""));
    setEditPhone(String(row.phone || ""));
    setEditRole(String(row.role || "user"));
    setEditPassword("");
    setEditIsVol(Boolean(row.isVolunteer));
    setEditIsDonor(Boolean(row.isDonor));
  };

  // Update Existing User
  const handleUpdateUser = async () => {
    if (!token || !editingUser) return;
    const userId = String(editingUser.id);
    if (!editName.trim()) {
      toast.error("Full name cannot be empty.");
      return;
    }
    setUpdatingUser(true);
    try {
      const res = await axios.put(
        `/api/admin/users/${userId}`,
        {
          name: editName.trim(),
          username: editUsername.trim() || undefined,
          email: editEmail.trim() || undefined,
          phone: editPhone.trim() || undefined,
          role: editRole,
          password: editPassword.trim() || undefined,
          isVolunteer: editIsVol,
          isDonor: editIsDonor,
        },
        { headers: authHeaders(token) }
      );

      if (res.data?.success !== false) {
        toast.success("User updated successfully.");
        setEditingUser(null);
        await load();
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to update user.");
    } finally {
      setUpdatingUser(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (id: string, name: string) => {
    if (!token) return;
    if (!window.confirm(`Are you sure you want to permanently delete user "${name || id}"?`)) return;
    try {
      await axios.delete(`/api/admin/users/${id}`, { headers: authHeaders(token) });
      toast.success("User deleted successfully.");
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to delete user.");
    }
  };

  // Export CSV Handler
  const exportCsv = (resource: string, filename: string) => {
    const targetData = data[resource as keyof AdminState] || [];
    if (!targetData.length) {
      toast.error("No data available to export.");
      return;
    }
    const headers = Object.keys(targetData[0]).join(",");
    const rows = targetData.map((row) =>
      Object.values(row)
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${targetData.length} records.`);
  };

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F8FAFC] p-6 text-slate-900">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 border border-orange-200 text-[#C2410C]">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-xl font-black text-[#0A192F]">Administrator Access Required</h1>
          <p className="mt-2 text-xs text-slate-500">This area is restricted to authorized administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pb-16">
      {/* TRICOLOR TOP ACCENT STRIP */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#C2410C] via-white to-[#166534] shadow-xs" />

      {/* HEADER & SEARCH BAR */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-xs">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#C2410C] via-[#EA580C] to-[#0A192F] shadow-md shadow-orange-500/10">
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
          <div className="relative min-w-[280px] max-w-md flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search users, cards, grievances, services..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#0A192F] transition shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-[#C2410C] ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition shadow-xs"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        {/* DESKTOP NAVIGATION SIDEBAR */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 space-y-1.5 rounded-3xl border border-slate-200/90 bg-white p-3.5 shadow-sm">
            <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-slate-400">
              6 Core Command Studios
            </p>
            {nav.map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-left text-xs transition ${
                  section === id
                    ? "bg-[#0A192F] text-white shadow-md font-black"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#0A192F] font-bold"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 shrink-0 ${section === id ? "text-[#FF9933]" : "text-slate-400"}`} />
                  <span>{label}</span>
                </div>
                {badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                      section === id
                        ? "bg-[#C2410C] text-white"
                        : "bg-emerald-50 text-[#166534] border border-emerald-200"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            ))}

            <div className="pt-3 border-t border-slate-100 space-y-1">
              <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-slate-400">
                Quick Exporters
              </p>
              <button
                onClick={() => exportCsv("users", "rpf_users_master")}
                className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-left text-xs font-bold text-slate-600 hover:bg-orange-50 hover:text-[#C2410C] transition"
              >
                <Download className="h-3.5 w-3.5 text-[#C2410C]" /> Export Users CSV
              </button>
              <button
                onClick={() => exportCsv("volunteers", "rpf_volunteers_master")}
                className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-left text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-[#166534] transition"
              >
                <Download className="h-3.5 w-3.5 text-[#166534]" /> Export Volunteers CSV
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN BODY AREA */}
        <main className="min-w-0 flex-1">
          {/* MOBILE NAVIGATION HORIZONTAL TABS */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {nav.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  section === id
                    ? "bg-[#0A192F] text-white font-black shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ───────────────────────────────────────────────────────── */}
          {/* 1. DASHBOARD STUDIO (Overview + Sync + People CRUD)       */}
          {/* ───────────────────────────────────────────────────────── */}
          {section === "overview" && (
            <div className="space-y-6">
              {/* SYSTEM HEALTH MONITOR */}
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#C2410C]" />
                    <div>
                      <h2 className="text-sm font-black text-[#0A192F]">
                        System & Infrastructure Health Monitor
                      </h2>
                      <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                        Simple operational overview for administrators
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase text-[#166534] border border-emerald-200 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#166534] animate-pulse"></span>
                    Operational
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                      <span>System Status</span>
                      <CheckCircle2 className="h-4 w-4 text-[#166534]" />
                    </div>
                    <p className="text-base font-black text-[#0A192F]">Operational</p>
                    <p className="text-[10px] text-slate-500 font-medium">Application services available</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                      <span>API Service</span>
                      <Server className="h-4 w-4 text-[#166534]" />
                    </div>
                    <p className="text-base font-black text-[#0A192F]">Online</p>
                    <p className="text-[10px] text-slate-500 font-medium">Admin services available</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                      <span>Database</span>
                      <Database className="h-4 w-4 text-[#1E3A8A]" />
                    </div>
                    <p className="text-base font-black text-[#0A192F]">Connected</p>
                    <p className="text-[10px] text-slate-500 font-medium">Application data service</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                      <span>Security</span>
                      <ShieldCheck className="h-4 w-4 text-[#C2410C]" />
                    </div>
                    <p className="text-base font-black text-[#0A192F]">Protected</p>
                    <p className="text-[10px] text-slate-500 font-medium">Administrator access controls enabled</p>
                  </div>
                </div>
              </section>

              {/* KPI COUNTERS */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Registered Accounts</span>
                    <Users className="w-4 h-4 text-[#1E3A8A]" />
                  </div>
                  <div className="text-2xl font-black text-[#0A192F]">{counts.users}</div>
                  <div className="text-[10px] text-[#166534] font-bold">Verified User Base</div>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Jan Seva Cards</span>
                    <CreditCard className="w-4 h-4 text-[#C2410C]" />
                  </div>
                  <div className="text-2xl font-black text-[#0A192F]">{counts.cards}</div>
                  <div className="text-[10px] text-[#C2410C] font-bold">Digital ID Records</div>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Volunteers</span>
                    <Users className="w-4 h-4 text-[#166534]" />
                  </div>
                  <div className="text-2xl font-black text-[#0A192F]">{counts.volunteers}</div>
                  <div className="text-[10px] text-[#166534] font-bold">RP Force Field Cadre</div>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Citizen Grievances</span>
                    <Activity className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-[#0A192F]">{counts.grievances}</div>
                  <div className="text-[10px] text-amber-600 font-bold">Operational Complaints</div>
                </div>
              </div>

              {/* 3-WAY UPSTREAM SYNC STUDIO */}
              <JanSevaSyncStudio cards={data.cards} totalCards={data.cardTotal} token={token || ""} onRefresh={load} exportCsv={exportCsv} />

              {/* AUDIT TRAIL / ADMIN ACTIVITY */}
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#C2410C]" />
                    <div>
                      <h3 className="text-sm font-black text-[#0A192F]">Audit Trail & Admin Logs</h3>
                      <p className="text-[10px] font-medium text-slate-400">
                        Important administrator actions, imports and approval events
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black text-slate-600">
                    {data.auditLogs.length} recent logs
                  </span>
                </div>

                {data.auditLogs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-400">
                    No audit events recorded yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400">
                          <th className="px-3 py-2.5">Time</th>
                          <th className="px-3 py-2.5">Action</th>
                          <th className="px-3 py-2.5">Resource</th>
                          <th className="px-3 py-2.5">Details</th>
                          <th className="px-3 py-2.5">Admin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.auditLogs.map((log, index) => {
                          const metadata = log.metadata && typeof log.metadata === "object" ? log.metadata as Row : {};
                          const detail = Object.entries(metadata)
                            .filter(([key]) => key !== "source")
                            .slice(0, 3)
                            .map(([key, value]) => `${key}: ${String(value)}`)
                            .join(" · ");
                          return (
                            <tr key={String(log.id || index)} className="hover:bg-slate-50/70">
                              <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                                {log.created_at ? new Date(String(log.created_at)).toLocaleString() : "—"}
                              </td>
                              <td className="px-3 py-3">
                                <span className="rounded-full bg-orange-50 px-2 py-1 text-[10px] font-black text-[#C2410C] border border-orange-100">
                                  {String(log.action || "UNKNOWN").replace(/_/g, " ")}
                                </span>
                              </td>
                              <td className="px-3 py-3 font-medium text-slate-600">
                                {String(log.resource || "—")}
                              </td>
                              <td className="max-w-[360px] px-3 py-3 text-[10px] text-slate-500">
                                {detail || "—"}
                              </td>
                              <td className="px-3 py-3 font-mono text-[10px] text-slate-400">
                                {String(log.user_id || "system")}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* PEOPLE & ACCOUNTS MANAGEMENT STUDIO */}
              <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-[#1E3A8A]">
                        <Users className="w-5 h-5" />
                      </span>
                      <h3 className="text-base font-bold text-[#0A192F]">
                        People & Accounts Studio
                      </h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-green-50 text-[#166534] border border-green-200">
                        {filteredUsers.length} Users
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Manage administrator, volunteer, and citizen accounts with full Add, Edit, Delete, and Role elevation privileges.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#0A192F] font-bold outline-none"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Administrators</option>
                      <option value="volunteer">Volunteers</option>
                      <option value="citizen">Citizens</option>
                    </select>

                    <button
                      onClick={() => setIsCreateUserOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#166534] hover:bg-green-800 text-white rounded-xl text-xs font-bold shadow-md transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create User</span>
                    </button>
                  </div>
                </div>

                {/* User Records Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Volunteer</th>
                        <th className="py-3 px-4">Joined</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                            No user accounts found matching query.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const role = String(u.role || "citizen").toLowerCase();
                          return (
                            <tr key={String(u.id)} className="hover:bg-slate-50/70 transition">
                              <td className="py-3 px-4">
                                <div className="font-bold text-[#0A192F]">{String(u.name || "Anonymous")}</div>
                                <div className="text-[10px] font-mono text-slate-400">{String(u.username || u.id)}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-slate-700 font-mono">{String(u.phone || "—")}</div>
                                <div className="text-[10px] text-slate-400">{String(u.email || "—")}</div>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                    role === "admin" || role === "super_admin"
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : role === "volunteer"
                                      ? "bg-green-50 text-[#166534] border-green-200"
                                      : "bg-blue-50 text-[#1E3A8A] border-blue-200"
                                  }`}
                                >
                                  {role.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {u.isVolunteer ? (
                                  <span className="text-[#166534] font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                                  </span>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-slate-500 text-[11px]">
                                {u.created_at ? new Date(String(u.created_at)).toLocaleDateString() : "Recent"}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => startEditUser(u)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#0A192F] hover:bg-slate-100 transition"
                                    title="Edit User"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(String(u.id), String(u.name || ""))}
                                    className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────── */}
          {/* 2. HOME STUDIO (Carousels, Tickers, Quotes, Reels)        */}
          {/* ───────────────────────────────────────────────────────── */}
          {section === "home" && (
            <AdminHomeStudio cms={cms} onSaveCms={saveCmsFromStudio} saving={savingCms} />
          )}

          {/* ───────────────────────────────────────────────────────── */}
          {/* 3. EXPLORE STUDIO (Services, Government Links, Utilities) */}
          {/* ───────────────────────────────────────────────────────── */}
          {section === "explore" && (
            <AdminExploreStudio cmsConfig={cms} onSaveCms={saveCmsFromStudio} isLoading={savingCms} />
          )}

          {/* ───────────────────────────────────────────────────────── */}
          {/* 4. ACTIVITY STUDIO (Grievances, Volunteers, Blood, Drives) */}
          {/* ───────────────────────────────────────────────────────── */}
          {section === "activity" && (
            <AdminActivityStudio cmsConfig={cms} onSaveCms={saveCmsFromStudio} />
          )}

          {/* ───────────────────────────────────────────────────────── */}
          {/* 5. IMPACT STUDIO (Initiatives, Counters, Stories, Journey) */}
          {/* ───────────────────────────────────────────────────────── */}
          {section === "impact" && (
            <AdminImpactStudio cmsConfig={cms} onSaveCms={saveCmsFromStudio} isLoading={savingCms} />
          )}

          {/* ───────────────────────────────────────────────────────── */}
          {/* 6. PROFILE STUDIO (Actions, Helplines, Policies, Version) */}
          {/* ───────────────────────────────────────────────────────── */}
          {section === "profile" && (
            <AdminProfileStudio cmsConfig={cms} onSaveCms={saveCmsFromStudio} isLoading={savingCms} />
          )}
        </main>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: CREATE USER                                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isCreateUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#0A192F]">Create New User Account</h3>
              <button
                onClick={() => setIsCreateUserOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="9826012345"
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Username</label>
                  <input
                    type="text"
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value)}
                    placeholder="ramesh_123"
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="ramesh@gmail.com"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Account Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="citizen">Citizen</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Default: RPF@12345"
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={newUserIsVol}
                    onChange={(e) => setNewUserIsVol(e.target.checked)}
                    className="rounded text-green-700 focus:ring-green-700"
                  />
                  <span>Is Volunteer</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={newUserIsDonor}
                    onChange={(e) => setNewUserIsDonor(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-600"
                  />
                  <span>Is Blood Donor</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setIsCreateUserOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={creatingUser}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#166534] text-white hover:bg-green-800 shadow transition disabled:opacity-50"
              >
                {creatingUser ? "Creating..." : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: EDIT USER                                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#0A192F]">Edit User Account</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Phone</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="citizen">Citizen</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Reset Password (Optional)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Leave blank to keep unchanged"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editIsVol}
                    onChange={(e) => setEditIsVol(e.target.checked)}
                    className="rounded text-green-700 focus:ring-green-700"
                  />
                  <span>Is Volunteer</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editIsDonor}
                    onChange={(e) => setEditIsDonor(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-600"
                  />
                  <span>Is Blood Donor</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                disabled={updatingUser}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#166534] text-white hover:bg-green-800 shadow transition disabled:opacity-50"
              >
                {updatingUser ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
