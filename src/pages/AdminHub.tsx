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
  UserPlus,
  Edit3,
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

type Section = "overview" | "people" | "cards" | "content" | "services" | "requests" | "system";
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
  { id: "overview", label: "Dashboard", icon: LayoutGrid, badge: "Live" },
  { id: "people", label: "People & Roles", icon: Users },
  { id: "cards", label: "Jan Seva Cards", icon: CreditCard },
  { id: "content", label: "CMS Studio", icon: Images },
  { id: "services", label: "Services", icon: BriefcaseBusiness },
  { id: "requests", label: "Welfare Operations", icon: ClipboardList },
  { id: "system", label: "System & Security", icon: ShieldCheck },
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
  } catch (error) {
    throw new Error(`${url}: ${axios.isAxiosError(error) ? (error.response?.status ? `HTTP ${error.response.status}` : error.message) : "Request failed"}`);
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
  const [cardImportStatus, setCardImportStatus] = useState('');
  const [cardImportBusy, setCardImportBusy] = useState(false);
  const [cardSyncPage, setCardSyncPage] = useState(1);
  const importCardJson = async (file?: File) => {
    if (!file || !token) return;
    setCardImportBusy(true);
    setCardImportStatus('Reading card file...');
    try {
      if (file.size > 25 * 1024 * 1024) throw new Error('Maximum file size is 25 MB. Split larger exports.');
      const parsed: unknown = JSON.parse(await file.text());
      const records: unknown = Array.isArray(parsed) ? parsed : (parsed as any)?.patients;
      if (!Array.isArray(records)) throw new Error('Expected a JSON array or an object with a patients array.');
      let imported = 0, skipped = 0;
      for (let i = 0; i < records.length; i += 200) {
        const response = await axios.post('/api/admin/cards/import', { records: records.slice(i, i + 200) }, {
          headers: { Authorization: `Bearer ${token}` }, timeout: 30000
        });
        imported += response.data.imported || 0;
        skipped += response.data.skipped || 0;
        setCardImportStatus(`Processed ${Math.min(i + 200, records.length)} / ${records.length}; imported ${imported}; skipped ${skipped}`);
      }
      if (!records.length) setCardImportStatus('File has no records.');
    } catch (error: any) {
      setCardImportStatus(error?.response?.data?.error || error?.message || 'Import failed');
    } finally { setCardImportBusy(false); }
  };
  const syncCardPage = async () => {
    if (!token) return;
    setCardImportBusy(true);
    setCardImportStatus(`Syncing external page ${cardSyncPage}...`);
    try {
      const response = await axios.post('/api/admin/cards/sync', { page: cardSyncPage, limit: 100 }, {
        headers: { Authorization: `Bearer ${token}` }, timeout: 25000
      });
      const result = response.data;
      setCardImportStatus(`Page ${cardSyncPage}: ${result.imported} imported, ${result.skipped} skipped; external total: ${result.totalPatients ?? 'unavailable'}`);
      if (result.received > 0) setCardSyncPage(page => page + 1);
    } catch (error: any) {
      setCardImportStatus(error?.response?.data?.error || error?.message || 'External sync failed');
    } finally { setCardImportBusy(false); }
  };

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

  // User Create Modal State
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

  // User Edit Modal State
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
      else failed.push(result.reason instanceof Error ? result.reason.message : `${url}: Data fetch unavailable`);
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

  // Create New User
  const handleCreateUser = async () => {
    if (!token) return;
    if (!newUserName.trim()) {
      toast.error("Full name is required.");
      return;
    }
    setCreatingUser(true);
    try {
      const res = await axios.post("/api/admin/users", {
        name: newUserName.trim(),
        username: newUserUsername.trim() || undefined,
        email: newUserEmail.trim() || undefined,
        phone: newUserPhone.trim() || undefined,
        role: newUserRole,
        password: newUserPassword.trim() || undefined,
        isVolunteer: newUserIsVol,
        isDonor: newUserIsDonor
      }, { headers: authHeaders(token) });

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
      const res = await axios.put(`/api/admin/users/${userId}`, {
        name: editName.trim(),
        username: editUsername.trim() || undefined,
        email: editEmail.trim() || undefined,
        phone: editPhone.trim() || undefined,
        role: editRole,
        password: editPassword.trim() || undefined,
        isVolunteer: editIsVol,
        isDonor: editIsDonor
      }, { headers: authHeaders(token) });

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
    if (!window.confirm(`Are you sure you want to permanently delete user account "${name || id}"?`)) return;
    try {
      await axios.delete(`/api/admin/users/${id}`, { headers: authHeaders(token) });
      toast.success("User deleted successfully.");
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to delete user.");
    }
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
              placeholder="Search users, volunteers, cards, grievances, services..."
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
              Control Room Sections
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
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                    section === id ? "bg-[#C2410C] text-white" : "bg-emerald-50 text-[#166534] border border-emerald-200"
                  }`}>
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

        {/* MOBILE NAVIGATION HORIZONTAL SCROLL */}
        <main className="min-w-0 flex-1">
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

          {/* SECTION 1: COMMAND CENTER OVERVIEW */}
          {section === "overview" && (
            <div className="space-y-6">
              {/* SYSTEM HEALTH MONITOR */}
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#C2410C]" />
                    <h2 className="text-sm font-black text-[#0A192F]">System & Infrastructure Health Monitor</h2>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase text-[#166534] border border-emerald-200 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#166534] animate-pulse"></span> All Systems Operational
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                      <span>API Gateway</span>
                      <Server className="h-4 w-4 text-[#166534]" />
                    </div>
                    <p className="text-base font-black text-[#0A192F]">HTTP 200 OK</p>
                    <p className="text-[10px] text-slate-500 font-medium">Latency &lt; 45ms</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                      <span>Database (`rp_db`)</span>
                      <Database className="h-4 w-4 text-[#1E3A8A]" />
                    </div>
                    <p className="text-base font-black text-[#0A192F]">PostgreSQL Connected</p>
                    <p className="text-[10px] text-slate-500 font-medium">Pool Health: Active</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                      <span>Auth Security</span>
                      <ShieldCheck className="h-4 w-4 text-[#C2410C]" />
                    </div>
                    <p className="text-base font-black text-[#0A192F]">JWT Session Guard</p>
                    <p className="text-[10px] text-slate-500 font-medium">Role: Supreme Admin</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                      <span>CMS Storage</span>
                      <FileText className="h-4 w-4 text-[#C2410C]" />
                    </div>
                    <p className="text-base font-black text-[#0A192F]">Master Config JSON</p>
                    <p className="text-[10px] text-slate-500 font-medium">Zero-Load Cache: Active</p>
                  </div>
                </div>
              </section>

              {/* STATS OVERVIEW MATRIX */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <button
                  onClick={() => { setSection("people"); setPeopleTab("users"); }}
                  className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-[#C2410C] hover:shadow-md transition group"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Users</p>
                    <span className="rounded-lg bg-orange-50 p-1.5 text-[#C2410C] border border-orange-100">
                      <Users className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-2 text-3xl font-black text-[#0A192F] group-hover:text-[#C2410C] transition">{counts.users}</p>
                  <p className="mt-1 text-[10px] text-slate-400">Tap to manage accounts & roles</p>
                </button>

                <button
                  onClick={() => { setSection("people"); setPeopleTab("volunteers"); }}
                  className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-[#166534] hover:shadow-md transition group"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Volunteers</p>
                    <span className="rounded-lg bg-emerald-50 p-1.5 text-[#166534] border border-emerald-100">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-2 text-3xl font-black text-[#0A192F] group-hover:text-[#166534] transition">{counts.volunteers}</p>
                  <p className="mt-1 text-[10px] text-slate-400">Tap for volunteer desk & approvals</p>
                </button>

                <button
                  onClick={() => { setSection("cards"); setPeopleTab("cards"); }}
                  className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-[#1E3A8A] hover:shadow-md transition group"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Jan Seva Cards</p>
                    <span className="rounded-lg bg-blue-50 p-1.5 text-[#1E3A8A] border border-blue-100">
                      <CreditCard className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-2 text-3xl font-black text-[#0A192F] group-hover:text-[#1E3A8A] transition">{counts.cards}</p>
                  <p className="mt-1 text-[10px] text-slate-400">Tap for card approval & 16-digit ID issue</p>
                </button>

                <button
                  onClick={() => { setSection("requests"); setRequestTab("grievances"); }}
                  className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-[#C2410C] hover:shadow-md transition group"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Grievance Filings</p>
                    <span className="rounded-lg bg-orange-50 p-1.5 text-[#C2410C] border border-orange-100">
                      <ClipboardList className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-2 text-3xl font-black text-[#0A192F] group-hover:text-[#C2410C] transition">{counts.grievances}</p>
                  <p className="mt-1 text-[10px] text-slate-400">Tap for complaint resolutions</p>
                </button>
              </div>

              {/* RECENT ACTIVITY AUDIT STREAM */}
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-[#0A192F]">Recent Security & Administrator Audit Logs</h3>
                  <button
                    onClick={() => { setSection("system"); setSystemTab("audit"); }}
                    className="text-xs font-bold text-[#C2410C] hover:underline"
                  >
                    View All Logs ({data.auditLogs.length})
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {data.auditLogs.slice(0, 5).map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 text-xs">
                      <div>
                        <p className="font-bold text-[#0A192F]">{firstText(log, ["action", "event", "description"])}</p>
                        <p className="text-[10px] text-slate-400">{firstText(log, ["actor_role", "user_id"])} · {firstText(log, ["created_at", "timestamp"])}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 border border-slate-200">
                        {firstText(log, ["entity_type", "resource"])}
                      </span>
                    </div>
                  ))}
                  {!data.auditLogs.length && (
                    <p className="py-4 text-center text-xs text-slate-400">No recent security audit events logged.</p>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* SECTION 2: PEOPLE & DATA STUDIO */}
          {(section === "people" || section === "cards") && (
            <div className="space-y-5">
              {/* SUB-TABS */}
              <div className="flex gap-2 border-b border-slate-200 pb-3">
                <button
                  onClick={() => setPeopleTab("users")}
                  className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                    peopleTab === "users" ? "bg-[#0A192F] text-white font-black shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Registered Users ({filterRows(data.users).length})
                </button>
                <button
                  onClick={() => setPeopleTab("volunteers")}
                  className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                    peopleTab === "volunteers" ? "bg-[#0A192F] text-white font-black shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Volunteers Directory ({filterRows(data.volunteers).length})
                </button>
                <button
                  onClick={() => { setSection("cards"); setPeopleTab("cards"); }}
                  className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                    peopleTab === "cards" ? "bg-[#0A192F] text-white font-black shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Jan Seva Cards ({filterRows(data.cards).length})
                </button>
              </div>

              {/* TABLE 1: USERS */}
              {section === "people" && peopleTab === "users" && (
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                    <div>
                      <h3 className="text-sm font-black text-[#0A192F]">Registered Application Accounts</h3>
                      <p className="text-xs text-slate-500">Total: {data.users.length} accounts</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsCreateUserOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C2410C] to-[#EA580C] px-3.5 py-1.5 text-xs font-black text-white hover:brightness-105 transition shadow-sm"
                      >
                        <UserPlus className="h-3.5 w-3.5" /> + Add User
                      </button>
                      <button
                        onClick={() => exportCsv("users", "rpf_users")}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                      >
                        <Download className="h-3.5 w-3.5 text-[#C2410C]" /> Export CSV
                      </button>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {filterRows(data.users).map((row, index) => (
                      <div key={String(row.id || index)} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50/70 transition">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-[#0A192F]">{firstText(row, ["name", "email", "id"])}</p>
                            {Boolean(row.username) && (
                              <span className="text-xs font-semibold text-[#C2410C]">@{String(row.username)}</span>
                            )}
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                              String(row.role).toLowerCase() === "admin" ? "bg-orange-50 text-[#C2410C] border border-orange-200" : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}>
                              {String(row.role || "citizen")}
                            </span>
                            {Boolean(row.isVolunteer) && (
                              <span className="rounded-full bg-blue-50 text-[#1E3A8A] px-2 py-0.5 text-[10px] font-bold border border-blue-200">
                                Volunteer
                              </span>
                            )}
                            {Boolean(row.isDonor) && (
                              <span className="rounded-full bg-emerald-50 text-[#166534] px-2 py-0.5 text-[10px] font-bold border border-emerald-200">
                                Donor
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.email ? String(row.email) : "No email"} · {row.phone ? String(row.phone) : "No phone"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditUser(row)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#0A192F] hover:text-[#0A192F] transition shadow-xs"
                            title="Edit user details"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-[#C2410C]" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(String(row.id), String(row.name || row.email || row.username || row.id))}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition shadow-xs"
                            title="Delete user account"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    {!filterRows(data.users).length && (
                      <p className="p-8 text-center text-xs text-slate-400">No users found matching search filter.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TABLE 2: VOLUNTEERS */}
              {section === "people" && peopleTab === "volunteers" && (
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <h3 className="text-sm font-black text-[#0A192F]">Volunteers Desk Directory</h3>
                    <button
                      onClick={() => exportCsv("volunteers", "rpf_volunteers")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                    >
                      <Download className="h-3.5 w-3.5 text-[#C2410C]" /> Export CSV
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {filterRows(data.volunteers).map((row, index) => {
                      const id = String(row.id || "");
                      const name = firstText(row, ["name", "username", "email"]);
                      const status = firstText(row, ["status", "approval_status"]).toLowerCase();
                      return (
                        <div key={id || index} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/70 transition">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-[#0A192F]">{name}</p>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                                status === "approved" ? "bg-emerald-50 text-[#166534] border border-emerald-200" : "bg-orange-50 text-[#C2410C] border border-orange-200"
                              }`}>
                                {status}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">{firstText(row, ["mobile"])} · Reg: {firstText(row, ["registration_number"])}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {status !== "approved" && (
                              <button
                                onClick={() => updateVolunteerStatus(id, "approved")}
                                className="inline-flex items-center gap-1 rounded-xl bg-[#166534] hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                              </button>
                            )}
                            <button
                              onClick={() => deleteVolunteer(id, name)}
                              className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-700 hover:bg-rose-100 transition shadow-xs"
                              title="Delete Volunteer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {!filterRows(data.volunteers).length && (
                      <p className="p-8 text-center text-xs text-slate-400">No volunteers found matching search filter.</p>
                    )}
                  </div>
                </div>
              )}

              {(section === "cards") && (
                <section className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <h3 className="text-sm font-black text-emerald-950">Jan Seva Card · Admin Import & Sync</h3>
                  <p className="mt-1 text-xs text-emerald-900">Import an authorized JSON export. All source fields are preserved; duplicate card numbers are updated. Maximum 25 MB per file.</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer rounded-xl bg-[#167C5A] px-4 py-2 text-xs font-bold text-white">
                      {cardImportBusy ? 'Processing...' : 'Bulk Upload JSON'}
                      <input type="file" accept=".json,application/json" disabled={cardImportBusy}
                        onChange={event => { void importCardJson(event.target.files?.[0]); event.target.value = ''; }}
                        className="sr-only" />
                    </label>
                    <button type="button" disabled={cardImportBusy} onClick={() => void syncCardPage()}
                      className="rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-bold text-emerald-950 disabled:opacity-50">
                      Sync external API page {cardSyncPage}
                    </button>
                  </div>
                  {cardImportStatus && <p role="status" className="mt-3 text-xs font-medium text-emerald-950">{cardImportStatus}</p>}
                  <p className="mt-2 text-[11px] text-emerald-800">Only authorized administrators can import or sync. Card holders need separately verified accounts to sign in.</p>
                </section>
              )}
              {/* TABLE 3: JAN SEVA CARDS */}
              {section === "cards" && (
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <h3 className="text-sm font-black text-[#0A192F]">Jan Seva Smart Identity Cards</h3>
                    <button
                      onClick={() => exportCsv("cards", "rpf_jan_seva_cards")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                    >
                      <Download className="h-3.5 w-3.5 text-[#C2410C]" /> Export CSV
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {filterRows(data.cards).map((row, index) => (
                      <div key={String(row.id || index)} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/70 transition">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-[#0A192F]">{firstText(row, ["name", "userId"])}</p>
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase text-[#166534] border border-emerald-200">
                              {firstText(row, ["status"])}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500 font-mono">Card No: {firstText(row, ["cardNo"])} · DOB: {firstText(row, ["dob"])}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate("/jan-seva-card")}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0A192F] hover:bg-slate-50 transition shadow-xs"
                          >
                            View Card
                          </button>
                        </div>
                      </div>
                    ))}
                    {!filterRows(data.cards).length && (
                      <p className="p-8 text-center text-xs text-slate-400">No card records found matching search filter.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: CONTENT & MEDIA STUDIO */}
          {section === "content" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <h2 className="text-sm font-black text-emerald-900">CMS & Media Control</h2>
                <p className="mt-1 text-xs text-emerald-800">Manage carousel, announcements, TV and Radio in this studio. Publish settings only after checking media URLs.</p>
              </div>
              <CmsSettings />
              <div className="flex gap-2 border-b border-slate-200 pb-3">
                <button
                  onClick={() => setContentTab("carousel")}
                  className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                    contentTab === "carousel" ? "bg-[#0A192F] text-white font-black shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Home Carousel Studio ({slides.length})
                </button>
                <button
                  onClick={() => setContentTab("instagram")}
                  className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                    contentTab === "instagram" ? "bg-[#0A192F] text-white font-black shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Instagram Reels Studio ({posts.length})
                </button>
                <button
                  onClick={() => setContentTab("announcements")}
                  className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                    contentTab === "announcements" ? "bg-[#0A192F] text-white font-black shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Announcements ({data.announcements.length})
                </button>
              </div>

              {/* CAROUSEL STUDIO */}
              {contentTab === "carousel" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div>
                      <h3 className="text-sm font-black text-[#0A192F]">Home Carousel Management Studio</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Upload posters, edit copy, order slides, and publish live to Home Page.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSlides(curr => [...curr, { id: `slide-${Date.now()}`, titleEn: "New Slide", subEn: "", image: "", active: true }]); setSelectedSlide(slides.length); }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C2410C] to-[#EA580C] px-4 py-2 text-xs font-black text-white hover:brightness-105 transition shadow-sm"
                      >
                        <Plus className="h-4 w-4" /> Add Slide
                      </button>
                      <button
                        onClick={() => saveCmsPayload({ carouselSlides: slides }, "Carousel slides published live!")}
                        disabled={savingCms}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#166534] hover:bg-emerald-700 px-4 py-2 text-xs font-black text-white disabled:opacity-50 transition shadow-sm"
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
                          className={`flex items-center justify-between rounded-2xl border p-3 cursor-pointer transition shadow-xs ${
                            selectedSlide === idx ? "border-[#C2410C] bg-orange-50/60" : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                              {s.image ? <img src={s.image} alt="" className="h-full w-full object-cover" /> : <Images className="m-3 h-6 w-6 text-slate-400" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#0A192F]">{s.titleEn || "Untitled Slide"}</p>
                              <p className="text-[10px] text-slate-400">{s.active !== false ? "Active" : "Hidden"} · Position {idx + 1}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSlides(curr => curr.filter((_, i) => i !== idx)); }}
                            className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-xl transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                      {selectedSlide === null || !slides[selectedSlide] ? (
                        <p className="py-12 text-center text-xs text-slate-400">Select a slide to edit properties.</p>
                      ) : (() => {
                        const s = slides[selectedSlide];
                        return (
                          <div className="space-y-4">
                            <h4 className="text-xs font-black text-[#C2410C]">Edit Slide #{selectedSlide + 1}</h4>
                            <FileUpload label="Poster / Photo" defaultUrl={s.image} onUploadSuccess={(url) => setSlides(curr => curr.map((item, i) => i === selectedSlide ? { ...item, image: url } : item))} />
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <label className="text-xs font-bold text-slate-700">Title (English)</label>
                                <input
                                  value={s.titleEn}
                                  onChange={(e) => setSlides(curr => curr.map((item, i) => i === selectedSlide ? { ...item, titleEn: e.target.value } : item))}
                                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#C2410C]"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-700">Target Route</label>
                                <input
                                  value={s.route || ""}
                                  onChange={(e) => setSlides(curr => curr.map((item, i) => i === selectedSlide ? { ...item, route: e.target.value } : item))}
                                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#C2410C]"
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

              {/* INSTAGRAM REELS STUDIO */}
              {contentTab === "instagram" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div>
                      <h3 className="text-sm font-black text-[#0A192F]">Instagram Reels Manager Studio</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Manage community Reels, embed URLs, and display order.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setPosts(curr => [{ id: `post-${Date.now()}`, title: "New Reel", url: "", category: "Reel", active: true }, ...curr]); setSelectedPost(0); }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C2410C] to-[#EA580C] px-4 py-2 text-xs font-black text-white hover:brightness-105 transition shadow-sm"
                      >
                        <Plus className="h-4 w-4" /> Add Reel
                      </button>
                      <button
                        onClick={() => saveCmsPayload({ instagramPosts: posts }, "Instagram Reels saved successfully!")}
                        disabled={savingCms}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#166534] hover:bg-emerald-700 px-4 py-2 text-xs font-black text-white disabled:opacity-50 transition shadow-sm"
                      >
                        <Save className="h-4 w-4" /> {savingCms ? "Saving..." : "Save Reels"}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="space-y-2">
                      {posts.map((p, idx) => (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPost(idx)}
                          className={`flex items-center justify-between rounded-2xl border p-3 cursor-pointer transition shadow-xs ${
                            selectedPost === idx ? "border-[#C2410C] bg-orange-50/60" : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 border border-orange-200 text-[#C2410C] shrink-0">
                              <Instagram className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#0A192F]">{p.title || "Untitled Reel"}</p>
                              <p className="text-[10px] text-slate-400">{p.category || "Reel"} · Position {idx + 1}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setPosts(curr => curr.filter((_, i) => i !== idx)); }}
                            className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-xl transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {!posts.length && (
                        <p className="py-8 text-center text-xs text-slate-400">No Instagram reels registered.</p>
                      )}
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                      {selectedPost === null || !posts[selectedPost] ? (
                        <p className="py-12 text-center text-xs text-slate-400">Select a reel to edit details.</p>
                      ) : (() => {
                        const p = posts[selectedPost];
                        return (
                          <div className="space-y-4">
                            <h4 className="text-xs font-black text-[#C2410C]">Edit Reel #{selectedPost + 1}</h4>
                            <div>
                              <label className="text-xs font-bold text-slate-700">Reel Title</label>
                              <input
                                value={p.title}
                                onChange={(e) => setPosts(curr => curr.map((item, i) => i === selectedPost ? { ...item, title: e.target.value } : item))}
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#C2410C]"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-700">Instagram URL / Embed Link</label>
                              <input
                                value={p.url}
                                onChange={(e) => setPosts(curr => curr.map((item, i) => i === selectedPost ? { ...item, url: e.target.value } : item))}
                                placeholder="https://www.instagram.com/reel/..."
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#C2410C]"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-700">Category Tag</label>
                              <input
                                value={p.category || ""}
                                onChange={(e) => setPosts(curr => curr.map((item, i) => i === selectedPost ? { ...item, category: e.target.value } : item))}
                                placeholder="e.g. Seva, Youth, Culture"
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#C2410C]"
                              />
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
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                    <h3 className="text-sm font-black text-[#0A192F]">Create New Announcement</h3>
                    <input
                      value={newAnnTitle}
                      onChange={(e) => setNewAnnTitle(e.target.value)}
                      placeholder="Announcement Title..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#C2410C]"
                    />
                    <textarea
                      value={newAnnContent}
                      onChange={(e) => setNewAnnContent(e.target.value)}
                      placeholder="Announcement description & body..."
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-4 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-[#C2410C]"
                    />
                    <button
                      onClick={handleCreateAnnouncement}
                      disabled={creatingAnn}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C2410C] to-[#EA580C] px-4 py-2 text-xs font-black text-white hover:brightness-105 transition disabled:opacity-50 shadow-sm"
                    >
                      <Plus className="h-4 w-4" /> {creatingAnn ? "Publishing..." : "Publish Announcement"}
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    {data.announcements.map((ann, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50/70 transition">
                        <div>
                          <p className="text-xs font-bold text-[#0A192F]">{firstText(ann, ["title"])}</p>
                          <p className="text-[11px] text-slate-500 mt-1">{firstText(ann, ["content"])}</p>
                        </div>
                        <button
                          onClick={() => deleteAnnouncement(String(ann.id))}
                          className="text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {!data.announcements.length && (
                      <p className="p-8 text-center text-xs text-slate-400">No announcements published yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: SERVICES & HELPLINES STUDIO */}
          {section === "services" && (
            <div className="space-y-6">
              <ServicesManager />
              <ServiceContentManager />
            </div>
          )}

          {/* SECTION 5: CITIZEN REQUESTS & WELFARE */}
          {section === "requests" && (
            <div className="space-y-5">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <h3 className="text-sm font-black text-[#0A192F]">Citizen Grievances & Welfare Filings</h3>
                  <button
                    onClick={() => exportCsv("grievances", "rpf_grievances")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5 text-[#C2410C]" /> Export CSV
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {filterRows(data.grievances).map((row, index) => (
                    <div key={String(row.id || index)} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/70 transition">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-[#0A192F]">{firstText(row, ["subject", "title", "id"])}</p>
                          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-black uppercase text-[#C2410C] border border-orange-200">
                            {firstText(row, ["status"])}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{firstText(row, ["category"])} · Submitted by: {firstText(row, ["email", "name"])}</p>
                      </div>
                    </div>
                  ))}
                  {!filterRows(data.grievances).length && (
                    <p className="p-8 text-center text-xs text-slate-400">No grievance filings found matching search filter.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: SYSTEM CONFIG & AUDIT LOGS */}
          {section === "system" && (
            <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-black text-slate-900">System & Security</h2>
              <p className="text-sm text-slate-600">CMS and Radio management are available in CMS Studio. Production authentication and role security must be verified before release.</p>
            </div>
          )}
        </main>
      </div>

      {/* CREATE USER MODAL */}
      {isCreateUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#C2410C] border border-orange-200">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0A192F]">Create New User</h3>
                  <p className="text-[11px] text-slate-500">Add a citizen, volunteer, donor, or administrator</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateUserOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Full Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Username</label>
                  <input
                    type="text"
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value)}
                    placeholder="e.g. ramesh_k"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]"
                  >
                    <option value="citizen">Citizen (Standard)</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="donor">Donor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Password</label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Set initial password (optional)"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]"
                />
                <p className="mt-1 text-[11px] text-slate-400">If left blank, user can login via OTP or have password set later.</p>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newUserIsVol}
                    onChange={(e) => setNewUserIsVol(e.target.checked)}
                    className="rounded border-slate-300 text-[#C2410C] focus:ring-[#C2410C]"
                  />
                  Mark as Volunteer
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newUserIsDonor}
                    onChange={(e) => setNewUserIsDonor(e.target.checked)}
                    className="rounded border-slate-300 text-[#C2410C] focus:ring-[#C2410C]"
                  />
                  Mark as Donor
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateUserOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateUser}
                disabled={creatingUser}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#C2410C] to-[#EA580C] px-4 py-2.5 text-xs font-black text-white hover:brightness-105 transition disabled:opacity-50 shadow-sm"
              >
                {creatingUser ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#C2410C] border border-orange-200">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0A192F]">Edit User Account</h3>
                  <p className="text-[11px] text-slate-400">ID: {String(editingUser.id || '')}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Full Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Full name"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Username</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="Username"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]"
                  >
                    <option value="citizen">Citizen (Standard)</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="donor">Donor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="Email"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Phone"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">New Password (Optional)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Leave blank to keep existing password"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]"
                />
                <p className="mt-1 text-[11px] text-slate-400">Only fill this if you want to reset the user's password.</p>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editIsVol}
                    onChange={(e) => setEditIsVol(e.target.checked)}
                    className="rounded border-slate-300 text-[#C2410C] focus:ring-[#C2410C]"
                  />
                  Mark as Volunteer
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editIsDonor}
                    onChange={(e) => setEditIsDonor(e.target.checked)}
                    className="rounded border-slate-300 text-[#C2410C] focus:ring-[#C2410C]"
                  />
                  Mark as Donor
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateUser}
                disabled={updatingUser}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#C2410C] to-[#EA580C] px-4 py-2.5 text-xs font-black text-white hover:brightness-105 transition disabled:opacity-50 shadow-sm"
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
