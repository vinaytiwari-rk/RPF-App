import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ServicesManager from "../components/ServicesManager";
import ServiceContentManager from "../components/ServiceContentManager";
import { CmsSettings } from "../components/admin/CmsSettings";
import FileUpload from "../components/FileUpload";
import {
  AlertTriangle,
  BriefcaseBusiness,
  ClipboardList,
  Droplet,
  FileText,
  LayoutGrid,
  LogOut,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Users,
  Images,
  Instagram,
  Trash2,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  Plus,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  ExternalLink,
  Activity,
  Database,
  Server,
  Lock,
  Filter,
  Save,
  CreditCard,
  Building2,
  Check,
  X
} from "lucide-react";

type Section = "overview" | "people" | "content" | "services" | "requests" | "system";
type Row = Record<string, unknown>;

type AdminState = {
  users: Row[];
  volunteers: Row[];
  cards: Row[];
  announcements: Row[];
  grievances: Row[];
  blood: Row[];
  jobs: Row[];
  auditLogs: Row[];
};

type CarouselSlide = {
  id: string;
  titleEn: string;
  titleHi?: string;
  subEn: string;
  subHi?: string;
  image: string;
  route?: string;
  active?: boolean;
  order?: number;
};

type InstagramPost = {
  id: string;
  title: string;
  url: string;
  videoUrl?: string;
  caption?: string;
  category?: string;
  active?: boolean;
  order?: number;
};

const nav: Array<{ id: Section; label: string; icon: typeof Users; badge?: string }> = [
  { id: "overview", label: "Command Center", icon: LayoutGrid, badge: "Live" },
  { id: "people", label: "People & Data Studio", icon: Users },
  { id: "content", label: "Content & Media Studio", icon: Images },
  { id: "services", label: "Services & Helplines Studio", icon: BriefcaseBusiness },
  { id: "requests", label: "Citizen Requests & Welfare", icon: ClipboardList },
  { id: "system", label: "System Config & Audit", icon: Settings2 },
];

const emptyState: AdminState = {
  users: [],
  volunteers: [],
  cards: [],
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
  } catch {
    return [];
  }
}

function firstText(row: Row, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim()) return String(value);
  }
  return "—";
}

export default function AdminHub() {
  const { user, token, hasAdminAccess, logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("overview");
  const [data, setData] = useState<AdminState>(emptyState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  // Search & Filter
  const [globalSearch, setGlobalSearch] = useState("");
  const [peopleTab, setPeopleTab] = useState<"users" | "volunteers" | "cards">("users");
  const [contentTab, setContentTab] = useState<"carousel" | "instagram" | "announcements" | "media">("carousel");
  const [requestTab, setRequestTab] = useState<"grievances" | "blood" | "jobs">("grievances");
  const [systemTab, setSystemTab] = useState<"settings" | "audit" | "export">("settings");

  // CMS State
  const [cms, setCms] = useState<any>(null);
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [selectedSlide, setSelectedSlide] = useState<number | null>(null);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [savingCms, setSavingCms] = useState(false);

  // User Role Edit Modal State
  const [editingUser, setEditingUser] = useState<Row | null>(null);
  const [editRole, setEditRole] = useState<string>("user");

  // Announcement Form State
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnContent, setNewAnnContent] = useState("");
  const [creatingAnn, setCreatingAnn] = useState(false);

  useEffect(() => {
    if (!hasAdminAccess) {
      toast.error("Access Denied: Administrator role required");
      navigate("/", { replace: true });
    }
  }, [hasAdminAccess, navigate]);

  const load = useCallback(async () => {
    if (!token || !hasAdminAccess) return;
    setLoading(true);
    setErrors([]);

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
    const failed: string[] = [];

    results.forEach((result, index) => {
      const [key, url] = endpoints[index];
      if (result.status === "fulfilled") next[key] = result.value;
      else failed.push(`${url}: Data fetch unavailable`);
    });

    // Load CMS Data
    try {
      const cmsRes = await axios.get("/api/cms");
      if (cmsRes.data?.success !== false) {
        const nextCms = cmsRes.data?.cms || cmsRes.data?.data || {};
        setCms(nextCms);
        if (Array.isArray(nextCms.carouselSlides)) {
          setSlides(nextCms.carouselSlides.map((s: any, i: number) => ({ ...s, id: s.id || `slide-${i}`, active: s.active !== false })));
        }
        if (Array.isArray(nextCms.instagramPosts)) {
          setPosts(nextCms.instagramPosts.map((p: any, i: number) => ({ ...p, id: p.id || `ig-${i}`, active: p.active !== false })));
        }
      }
    } catch (e) {}

    setData(next);
    setErrors(failed);
    setLoading(false);
  }, [token, hasAdminAccess]);

  useEffect(() => { void load(); }, [load]);

  // Overall counts
  const counts = useMemo(() => ({
    users: data.users.length,
    volunteers: data.volunteers.length,
    cards: data.cards.length,
    announcements: data.announcements.length,
    grievances: data.grievances.length,
    blood: data.blood.length,
    jobs: data.jobs.length,
  }), [data]);

  // Global Search Filter
  const filterRows = useCallback((rows: Row[]) => {
    if (!globalSearch.trim()) return rows;
    const q = globalSearch.toLowerCase().trim();
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
  }, [globalSearch]);

  // Save Carousel / CMS Updates
  const saveCmsPayload = async (updatedFields: Record<string, unknown>, successMessage: string) => {
    if (!token) return;
    setSavingCms(true);
    try {
      const payload = { ...(cms || {}), ...updatedFields };
      const res = await axios.post("/api/cms", payload, { headers: authHeaders(token) });
      if (res.data?.success === false) throw new Error(res.data?.error || "Save failed");
      setCms(payload);
      toast.success(successMessage);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || "Failed to save settings.");
    } finally {
      setSavingCms(false);
    }
  };

  // 1-Click Volunteer Approval
  const updateVolunteerStatus = async (id: string, newStatus: string) => {
    if (!token) return;
    try {
      const res = await axios.put(`/api/admin/volunteers/${id}/status`, { status: newStatus }, { headers: authHeaders(token) });
      if (res.data?.success !== false) {
        toast.success(`Volunteer status set to '${newStatus}'`);
        await load();
      }
    } catch (e) { toast.error("Failed to update status"); }
  };

  // Delete Volunteer
  const deleteVolunteer = async (id: string, name: string) => {
    if (!token) return;
    if (!window.confirm(`Delete volunteer "${name}"? This action cannot be undone.`)) return;
    try {
      await axios.delete(`/api/admin/volunteers/${id}`, { headers: authHeaders(token) });
      toast.success("Volunteer deleted.");
      await load();
    } catch (e) { toast.error("Failed to delete volunteer."); }
  };

  // Update User Role
  const handleUserRoleUpdate = async () => {
    if (!token || !editingUser) return;
    const userId = String(editingUser.id);
    try {
      const res = await axios.put(`/api/admin/users/${userId}`, {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        role: editRole
      }, { headers: authHeaders(token) });
      if (res.data?.success !== false) {
        toast.success("User role updated successfully.");
        setEditingUser(null);
        await load();
      }
    } catch (e) { toast.error("Failed to update user role."); }
  };

  // Create Announcement
  const handleCreateAnnouncement = async () => {
    if (!token || !newAnnTitle.trim() || !newAnnContent.trim()) {
      toast.error("Title and content are required.");
      return;
    }
    setCreatingAnn(true);
    try {
      const res = await axios.post("/api/admin/announcements", { title: newAnnTitle.trim(), content: newAnnContent.trim() }, { headers: authHeaders(token) });
      if (res.data?.success !== false) {
        toast.success("Announcement published!");
        setNewAnnTitle("");
        setNewAnnContent("");
        await load();
      }
    } catch (e) { toast.error("Failed to create announcement."); }
    finally { setCreatingAnn(false); }
  };

  // Delete Announcement
  const deleteAnnouncement = async (id: string) => {
    if (!token) return;
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await axios.delete(`/api/admin/announcements/${id}`, { headers: authHeaders(token) });
      toast.success("Announcement deleted.");
      await load();
    } catch (e) { toast.error("Failed to delete announcement."); }
  };

  // Export CSV Handler
  const exportCsv = (resource: string, filename: string) => {
    const targetData = data[resource as keyof AdminState] || [];
    if (!targetData.length) { toast.error("No data available to export."); return; }
    const headers = Object.keys(targetData[0]).join(",");
    const rows = targetData.map(row => Object.values(row).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${targetData.length} records to ${filename}.csv`);
  };

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 p-6 text-white">
        <div className="max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
          <Lock className="mx-auto h-12 w-12 text-rose-500" />
          <h1 className="mt-4 text-xl font-black">Administrator Access Required</h1>
          <p className="mt-2 text-xs text-slate-400">This area is restricted to authorized administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 pb-16">
      {/* HEADER & SEARCH BAR */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FF9933] via-amber-500 to-[#000080] shadow-md">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                  Supreme Admin
                </span>
                <span className="text-[10px] font-bold text-slate-400">RP Foundation Control Room</span>
              </div>
              <h1 className="text-base font-black tracking-tight text-white">
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
              placeholder="Search users, volunteers, cards, grievances, services..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 py-2.5 left-10 pl-10 pr-4 text-xs font-medium text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-900/50 bg-rose-950/40 px-3.5 py-2 text-xs font-bold text-rose-400 hover:bg-rose-900/60"
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
          <div className="sticky top-24 space-y-1.5 rounded-3xl border border-slate-800 bg-slate-900/80 p-3 backdrop-blur-md shadow-xl">
            <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-slate-500">
              Control Room Sections
            </p>
            {nav.map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-left text-xs font-bold transition ${
                  section === id
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{label}</span>
                </div>
                {badge && (
                  <span className="rounded-full bg-slate-950/60 px-2 py-0.5 text-[9px] font-extrabold text-amber-300">
                    {badge}
                  </span>
                )}
              </button>
            ))}

            <div className="pt-3 border-t border-slate-800/80 space-y-1">
              <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-slate-500">
                Quick Exporters
              </p>
              <button
                onClick={() => exportCsv("users", "rpf_users_master")}
                className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-left text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-amber-400"
              >
                <Download className="h-3.5 w-3.5 text-amber-500" /> Export Users CSV
              </button>
              <button
                onClick={() => exportCsv("volunteers", "rpf_volunteers_master")}
                className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-left text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-amber-400"
              >
                <Download className="h-3.5 w-3.5 text-amber-500" /> Export Volunteers CSV
              </button>
            </div>
          </div>
        </aside>

        {/* MOBILE NAVIGATION HORIZONTAL SCROLL */}
        <main className="min-w-0 flex-1">
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {nav.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  section === id
                    ? "bg-amber-500 text-slate-950 font-black"
                    : "border border-slate-800 bg-slate-900 text-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* SECTION 1: COMMAND CENTER OVERVIEW */}
          {section === "overview" && (
            <div className="space-y-6">
              {/* SYSTEM HEALTH MONITOR */}
              <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-amber-400" />
                    <h2 className="text-sm font-black text-white">System & Infrastructure Health Monitor</h2>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> All Systems Operational
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                      <span>API Gateway</span>
                      <Server className="h-4 w-4 text-emerald-400" />
                    </div>
                    <p className="text-base font-black text-white">HTTP 200 OK</p>
                    <p className="text-[10px] text-slate-500 font-medium">Latency &lt; 45ms</p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                      <span>Database (`rp_db`)</span>
                      <Database className="h-4 w-4 text-blue-400" />
                    </div>
                    <p className="text-base font-black text-white">PostgreSQL Connected</p>
                    <p className="text-[10px] text-slate-500 font-medium">Pool Health: Active</p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                      <span>Auth Security</span>
                      <ShieldCheck className="h-4 w-4 text-purple-400" />
                    </div>
                    <p className="text-base font-black text-white">JWT Session Guard</p>
                    <p className="text-[10px] text-slate-500 font-medium">Role: Supreme Admin</p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                      <span>CMS Storage</span>
                      <FileText className="h-4 w-4 text-amber-400" />
                    </div>
                    <p className="text-base font-black text-white">Master Config JSON</p>
                    <p className="text-[10px] text-slate-500 font-medium">Zero-Load Cache: Active</p>
                  </div>
                </div>
              </section>

              {/* STATS OVERVIEW MATRIX */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <button
                  onClick={() => { setSection("people"); setPeopleTab("users"); }}
                  className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-left shadow-lg hover:border-amber-500/50 transition group"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Users</p>
                  <p className="mt-2 text-3xl font-black text-white group-hover:text-amber-400">{counts.users}</p>
                  <p className="mt-1 text-[10px] text-slate-500">Tap to manage accounts & roles</p>
                </button>

                <button
                  onClick={() => { setSection("people"); setPeopleTab("volunteers"); }}
                  className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-left shadow-lg hover:border-amber-500/50 transition group"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Volunteers</p>
                  <p className="mt-2 text-3xl font-black text-white group-hover:text-amber-400">{counts.volunteers}</p>
                  <p className="mt-1 text-[10px] text-slate-500">Tap for volunteer desk & approvals</p>
                </button>

                <button
                  onClick={() => { setSection("people"); setPeopleTab("cards"); }}
                  className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-left shadow-lg hover:border-amber-500/50 transition group"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Jan Seva Cards</p>
                  <p className="mt-2 text-3xl font-black text-white group-hover:text-amber-400">{counts.cards}</p>
                  <p className="mt-1 text-[10px] text-slate-500">Tap for card approval & 16-digit ID issue</p>
                </button>

                <button
                  onClick={() => { setSection("requests"); setRequestTab("grievances"); }}
                  className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-left shadow-lg hover:border-amber-500/50 transition group"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Grievance Filings</p>
                  <p className="mt-2 text-3xl font-black text-white group-hover:text-amber-400">{counts.grievances}</p>
                  <p className="mt-1 text-[10px] text-slate-500">Tap for complaint resolutions</p>
                </button>
              </div>

              {/* RECENT ACTIVITY AUDIT STREAM */}
              <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-white">Recent Security & Administrator Audit Logs</h3>
                  <button
                    onClick={() => { setSection("system"); setSystemTab("audit"); }}
                    className="text-xs font-bold text-amber-400 hover:underline"
                  >
                    View All Logs ({data.auditLogs.length})
                  </button>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {data.auditLogs.slice(0, 5).map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 text-xs">
                      <div>
                        <p className="font-bold text-slate-200">{firstText(log, ["action", "event", "description"])}</p>
                        <p className="text-[10px] text-slate-500">{firstText(log, ["actor_role", "user_id"])} · {firstText(log, ["created_at", "timestamp"])}</p>
                      </div>
                      <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-300">
                        {firstText(log, ["entity_type", "resource"])}
                      </span>
                    </div>
                  ))}
                  {!data.auditLogs.length && (
                    <p className="py-4 text-center text-xs text-slate-500">No recent security audit events logged.</p>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* SECTION 2: PEOPLE & DATA STUDIO */}
          {section === "people" && (
            <div className="space-y-5">
              {/* SUB-TABS */}
              <div className="flex gap-2 border-b border-slate-800 pb-3">
                <button
                  onClick={() => setPeopleTab("users")}
                  className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                    peopleTab === "users" ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-900 text-slate-400 border border-slate-800"
                  }`}
                >
                  Registered Users ({filterRows(data.users).length})
                </button>
                <button
                  onClick={() => setPeopleTab("volunteers")}
                  className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                    peopleTab === "volunteers" ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-900 text-slate-400 border border-slate-800"
                  }`}
                >
                  Volunteers Directory ({filterRows(data.volunteers).length})
                </button>
                <button
                  onClick={() => setPeopleTab("cards")}
                  className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                    peopleTab === "cards" ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-900 text-slate-400 border border-slate-800"
                  }`}
                >
                  Jan Seva Cards ({filterRows(data.cards).length})
                </button>
              </div>

              {/* TABLE 1: USERS */}
              {peopleTab === "users" && (
                <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                    <h3 className="text-sm font-black text-white">Registered Application Accounts</h3>
                    <button
                      onClick={() => exportCsv("users", "rpf_users")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
                    >
                      <Download className="h-3.5 w-3.5 text-amber-400" /> Export CSV
                    </button>
                  </div>
                  <div className="divide-y divide-slate-800/80">
                    {filterRows(data.users).map((row, index) => (
                      <div key={String(row.id || index)} className="flex items-center justify-between px-5 py-4 hover:bg-slate-800/30">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-white">{firstText(row, ["name", "email", "id"])}</p>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                              String(row.role).toLowerCase() === "admin" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-slate-800 text-slate-400"
                            }`}>
                              {String(row.role || "user")}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-400">{firstText(row, ["email"])} · {firstText(row, ["phone"])}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setEditingUser(row); setEditRole(String(row.role || "user")); }}
                            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
                          >
                            Edit Role
                          </button>
                        </div>
                      </div>
                    ))}
                    {!filterRows(data.users).length && (
                      <p className="p-8 text-center text-xs text-slate-500">No users found matching search filter.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TABLE 2: VOLUNTEERS */}
              {peopleTab === "volunteers" && (
                <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                    <h3 className="text-sm font-black text-white">Volunteers Desk Directory</h3>
                    <button
                      onClick={() => exportCsv("volunteers", "rpf_volunteers")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
                    >
                      <Download className="h-3.5 w-3.5 text-amber-400" /> Export CSV
                    </button>
                  </div>
                  <div className="divide-y divide-slate-800/80">
                    {filterRows(data.volunteers).map((row, index) => {
                      const id = String(row.id || "");
                      const name = firstText(row, ["name", "username", "email"]);
                      const status = firstText(row, ["status", "approval_status"]).toLowerCase();
                      return (
                        <div key={id || index} className="flex items-center justify-between px-5 py-4 hover:bg-slate-800/30">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-white">{name}</p>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                                status === "approved" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400"
                              }`}>
                                {status}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-400">{firstText(row, ["mobile"])} · Reg: {firstText(row, ["registration_number"])}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {status !== "approved" && (
                              <button
                                onClick={() => updateVolunteerStatus(id, "approved")}
                                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                              </button>
                            )}
                            <button
                              onClick={() => deleteVolunteer(id, name)}
                              className="rounded-xl border border-rose-900/50 bg-rose-950/30 p-2 text-rose-400 hover:bg-rose-900/50"
                              title="Delete Volunteer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {!filterRows(data.volunteers).length && (
                      <p className="p-8 text-center text-xs text-slate-500">No volunteers found matching search filter.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TABLE 3: JAN SEVA CARDS */}
              {peopleTab === "cards" && (
                <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                    <h3 className="text-sm font-black text-white">Jan Seva Smart Identity Cards</h3>
                    <button
                      onClick={() => exportCsv("cards", "rpf_jan_seva_cards")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
                    >
                      <Download className="h-3.5 w-3.5 text-amber-400" /> Export CSV
                    </button>
                  </div>
                  <div className="divide-y divide-slate-800/80">
                    {filterRows(data.cards).map((row, index) => (
                      <div key={String(row.id || index)} className="flex items-center justify-between px-5 py-4 hover:bg-slate-800/30">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-white">{firstText(row, ["name", "userId"])}</p>
                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-400 border border-emerald-500/30">
                              {firstText(row, ["status"])}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-400 font-mono">Card No: {firstText(row, ["cardNo"])} · DOB: {firstText(row, ["dob"])}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate("/jan-seva-card")}
                            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
                          >
                            View Card
                          </button>
                        </div>
                      </div>
                    ))}
                    {!filterRows(data.cards).length && (
                      <p className="p-8 text-center text-xs text-slate-500">No card records found matching search filter.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: CONTENT & MEDIA STUDIO */}
          {section === "content" && (
            <div className="space-y-5">
              <div className="flex gap-2 border-b border-slate-800 pb-3">
                <button
                  onClick={() => setContentTab("carousel")}
                  className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                    contentTab === "carousel" ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-900 text-slate-400 border border-slate-800"
                  }`}
                >
                  Home Carousel Studio ({slides.length})
                </button>
                <button
                  onClick={() => setContentTab("instagram")}
                  className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                    contentTab === "instagram" ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-900 text-slate-400 border border-slate-800"
                  }`}
                >
                  Instagram Reels Studio ({posts.length})
                </button>
                <button
                  onClick={() => setContentTab("announcements")}
                  className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                    contentTab === "announcements" ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-900 text-slate-400 border border-slate-800"
                  }`}
                >
                  Announcements ({data.announcements.length})
                </button>
              </div>

              {/* CAROUSEL STUDIO */}
              {contentTab === "carousel" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900 p-5">
                    <div>
                      <h3 className="text-sm font-black text-white">Home Carousel Management Studio</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Upload posters, edit copy, order slides, and publish live to Home Page.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSlides(curr => [...curr, { id: `slide-${Date.now()}`, titleEn: "New Slide", subEn: "", image: "", active: true }]); setSelectedSlide(slides.length); }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-950"
                      >
                        <Plus className="h-4 w-4" /> Add Slide
                      </button>
                      <button
                        onClick={() => saveCmsPayload({ carouselSlides: slides }, "Carousel slides published live!")}
                        disabled={savingCms}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" /> {savingCms ? "Publishing..." : "Publish Carousel"}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="space-y-2">
                      {slides.map((s, idx) => (
                        <div
                          key={s.id}
                          onClick={() => setSelectedSlide(idx)}
                          className={`flex items-center justify-between rounded-2xl border p-3 cursor-pointer transition ${
                            selectedSlide === idx ? "border-amber-500 bg-slate-800/80" : "border-slate-800 bg-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-slate-800 overflow-hidden shrink-0">
                              {s.image ? <img src={s.image} alt="" className="h-full w-full object-cover" /> : <Images className="m-3 h-6 w-6 text-slate-600" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">{s.titleEn || "Untitled Slide"}</p>
                              <p className="text-[10px] text-slate-500">{s.active !== false ? "Active" : "Hidden"} · Position {idx + 1}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSlides(curr => curr.filter((_, i) => i !== idx)); }}
                            className="text-rose-400 hover:bg-rose-950/40 p-1.5 rounded-xl"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 space-y-4">
                      {selectedSlide === null || !slides[selectedSlide] ? (
                        <p className="py-12 text-center text-xs text-slate-500">Select a slide to edit properties.</p>
                      ) : (() => {
                        const s = slides[selectedSlide];
                        return (
                          <div className="space-y-4">
                            <h4 className="text-xs font-black text-amber-400">Edit Slide #{selectedSlide + 1}</h4>
                            <FileUpload label="Poster / Photo" defaultUrl={s.image} onUploadSuccess={(url) => setSlides(curr => curr.map((item, i) => i === selectedSlide ? { ...item, image: url } : item))} />
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <label className="text-xs font-bold text-slate-400">Title (English)</label>
                                <input
                                  value={s.titleEn}
                                  onChange={(e) => setSlides(curr => curr.map((item, i) => i === selectedSlide ? { ...item, titleEn: e.target.value } : item))}
                                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-400">Target Route</label>
                                <input
                                  value={s.route || ""}
                                  onChange={(e) => setSlides(curr => curr.map((item, i) => i === selectedSlide ? { ...item, route: e.target.value } : item))}
                                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* ANNOUNCEMENTS STUDIO */}
              {contentTab === "announcements" && (
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 space-y-3">
                    <h3 className="text-sm font-black text-white">Create New Announcement</h3>
                    <input
                      value={newAnnTitle}
                      onChange={(e) => setNewAnnTitle(e.target.value)}
                      placeholder="Announcement Title..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-bold outline-none"
                    />
                    <textarea
                      value={newAnnContent}
                      onChange={(e) => setNewAnnContent(e.target.value)}
                      placeholder="Announcement description & body..."
                      rows={3}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-medium outline-none"
                    />
                    <button
                      onClick={handleCreateAnnouncement}
                      disabled={creatingAnn}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" /> {creatingAnn ? "Publishing..." : "Publish Announcement"}
                    </button>
                  </div>

                  <div className="divide-y divide-slate-800/80 rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden">
                    {data.announcements.map((ann, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4">
                        <div>
                          <p className="text-xs font-bold text-white">{firstText(ann, ["title"])}</p>
                          <p className="text-[11px] text-slate-400 mt-1">{firstText(ann, ["content"])}</p>
                        </div>
                        <button
                          onClick={() => deleteAnnouncement(String(ann.id))}
                          className="text-rose-400 hover:bg-rose-950/40 p-2 rounded-xl"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: SERVICES & HELPLINES STUDIO */}
          {section === "services" && (
            <div className="space-y-6 bg-slate-900/50 p-4 rounded-3xl border border-slate-800">
              <ServicesManager />
              <ServiceContentManager />
            </div>
          )}

          {/* SECTION 5: CITIZEN REQUESTS & WELFARE */}
          {section === "requests" && (
            <div className="space-y-5">
              <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                  <h3 className="text-sm font-black text-white">Citizen Grievances & Welfare Filings</h3>
                  <button
                    onClick={() => exportCsv("grievances", "rpf_grievances")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
                  >
                    <Download className="h-3.5 w-3.5 text-amber-400" /> Export CSV
                  </button>
                </div>
                <div className="divide-y divide-slate-800/80">
                  {filterRows(data.grievances).map((row, index) => (
                    <div key={String(row.id || index)} className="flex items-center justify-between px-5 py-4 hover:bg-slate-800/30">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white">{firstText(row, ["subject", "title", "id"])}</p>
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-amber-400">
                            {firstText(row, ["status"])}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">{firstText(row, ["category"])} · Submitted by: {firstText(row, ["email", "name"])}</p>
                      </div>
                    </div>
                  ))}
                  {!filterRows(data.grievances).length && (
                    <p className="p-8 text-center text-xs text-slate-500">No grievance filings found matching search filter.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: SYSTEM CONFIG & AUDIT LOGS */}
          {section === "system" && (
            <div className="space-y-6">
              <CmsSettings />
            </div>
          )}
        </main>
      </div>

      {/* USER ROLE EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-white">Edit User Role</h3>
            <p className="text-xs text-slate-400">User: {editingUser.name || editingUser.email}</p>
            <div>
              <label className="text-xs font-bold text-slate-300">Select System Role</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs font-bold text-white outline-none"
              >
                <option value="user">user (Member / Citizen / Volunteer)</option>
                <option value="admin">admin (Supreme Administrator)</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 rounded-xl border border-slate-800 px-4 py-2 text-xs font-bold text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUserRoleUpdate}
                className="flex-1 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-950"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
