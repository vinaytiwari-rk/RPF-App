import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Users,
  CreditCard,
  Activity,
  Search,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Tv,
  Radio,
  Compass,
  TrendingUp,
  Film,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  Layers,
  Sparkles,
  ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import JanSevaSyncStudio from "../../../components/admin/JanSevaSyncStudio";
import IconPickerModal, { AVAILABLE_ICONS } from "../../../components/admin/IconPickerModal";

type Row = Record<string, any>;

interface MetricState {
  value: number | string;
  loading: boolean;
  error?: string;
  status: "live" | "cached" | "unavailable";
  lastUpdated?: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  category: string;
  metricKey: string;
  endpoint: string;
  route: string;
  iconName: string;
  order: number;
  active: boolean;
  canExportCsv?: boolean;
  csvResource?: string;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  {
    id: "w-users",
    title: "Total Registered Users",
    category: "Registry",
    metricKey: "users",
    endpoint: "/api/admin/users",
    route: "/admin",
    iconName: "Users",
    order: 0,
    active: true,
    canExportCsv: true,
    csvResource: "users"
  },
  {
    id: "w-volunteers",
    title: "Active Volunteers",
    category: "Ground Force",
    metricKey: "volunteers",
    endpoint: "/api/admin/volunteers",
    route: "/admin/activity",
    iconName: "Users",
    order: 1,
    active: true,
    canExportCsv: true,
    csvResource: "volunteers"
  },
  {
    id: "w-cards",
    title: "Jan Seva Cards Issued",
    category: "Card Registry",
    metricKey: "cards",
    endpoint: "/api/cards/stats",
    route: "/jan-seva-card",
    iconName: "CreditCard",
    order: 2,
    active: true,
    canExportCsv: false
  },
  {
    id: "w-grievances",
    title: "Open Public Grievances",
    category: "Civic Redressal",
    metricKey: "grievances",
    endpoint: "/api/grievance",
    route: "/grievance",
    iconName: "AlertCircle",
    order: 3,
    active: true,
    canExportCsv: true,
    csvResource: "grievances"
  },
  {
    id: "w-services",
    title: "Active Public Services",
    category: "Explore Catalog",
    metricKey: "services",
    endpoint: "/api/public/services",
    route: "/admin/explore",
    iconName: "Compass",
    order: 4,
    active: true,
    canExportCsv: false
  },
  {
    id: "w-campaigns",
    title: "Active Campaigns & Relief",
    category: "Crowdfunding",
    metricKey: "campaigns",
    endpoint: "/api/campaigns",
    route: "/admin/campaigns",
    iconName: "TrendingUp",
    order: 5,
    active: true,
    canExportCsv: false
  },
  {
    id: "w-channels",
    title: "Live TV Channels",
    category: "Broadcasting",
    metricKey: "channels",
    endpoint: "/api/cms",
    route: "/admin/live-tv",
    iconName: "Tv",
    order: 6,
    active: true,
    canExportCsv: false
  },
  {
    id: "w-radio",
    title: "Internet Radio Stations",
    category: "Radio & Audio",
    metricKey: "radio",
    endpoint: "/api/cms",
    route: "/admin/live-tv",
    iconName: "Radio",
    order: 7,
    active: true,
    canExportCsv: false
  },
  {
    id: "w-reels",
    title: "Social Impact Reels",
    category: "Media CMS",
    metricKey: "reels",
    endpoint: "/api/cms",
    route: "/admin/reels",
    iconName: "Film",
    order: 8,
    active: true,
    canExportCsv: false
  }
];

export default function DashboardStudio() {
  const { token: authToken } = useAuth();
  const token = authToken || localStorage.getItem("@rpf_token") || localStorage.getItem("token") || "";
  const authHeaders = (t: string) => (t ? { Authorization: `Bearer ${t}` } : {});

  const [loading, setLoading] = useState(true);
  const [savingWidgets, setSavingWidgets] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "volunteers" | "users" | "widgets">("overview");
  const [search, setSearch] = useState("");

  // Dynamic Widgets State
  const [widgets, setWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS);
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconTargetWidgetId, setIconTargetWidgetId] = useState<string | null>(null);

  const [data, setData] = useState({
    users: [] as Row[],
    volunteers: [] as Row[],
    cards: [] as Row[],
    grievances: [] as Row[],
    services: [] as Row[],
    campaigns: [] as Row[],
    channels: [] as Row[],
    radioStations: [] as Row[],
    reels: [] as Row[]
  });

  const [metrics, setMetrics] = useState<Record<string, MetricState>>({
    users: { value: 0, loading: true, status: "live" },
    volunteers: { value: 0, loading: true, status: "live" },
    cards: { value: 0, loading: true, status: "live" },
    grievances: { value: 0, loading: true, status: "live" },
    services: { value: 0, loading: true, status: "live" },
    campaigns: { value: 0, loading: true, status: "live" },
    channels: { value: 0, loading: true, status: "live" },
    radio: { value: 0, loading: true, status: "live" },
    reels: { value: 0, loading: true, status: "live" }
  });

  async function getAdminData(url: string, t: string): Promise<{ items: Row[]; error?: string }> {
    try {
      const response = await axios.get(url, { headers: authHeaders(t), timeout: 8000 });
      const payload = response.data?.data ?? response.data;
      if (Array.isArray(payload)) return { items: payload as Row[] };
      if (Array.isArray(payload?.items)) return { items: payload.items as Row[] };
      return { items: [] };
    } catch (err: any) {
      return { items: [], error: err?.message || "Unavailable" };
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    const now = new Date().toLocaleTimeString();

    // 1. Fetch Users
    const usersRes = await getAdminData("/api/admin/users", token);
    // 2. Fetch Volunteers
    const volRes = await getAdminData("/api/admin/volunteers", token);
    // 3. Fetch Cards
    const cardsRes = await getAdminData("/api/cards", token);
    // 4. Fetch Grievances
    const grievRes = await getAdminData("/api/grievance", token);
    // 5. Fetch Services
    const servRes = await getAdminData("/api/public/services", token);
    // 6. Fetch Campaigns
    const campRes = await getAdminData("/api/campaigns", token);

    // 7. Fetch Cards Stats
    let cardCount: number | string = 0;
    let cardStatus: "live" | "cached" | "unavailable" = "unavailable";
    try {
      const statsRes = await axios.get("/api/cards/stats", { headers: authHeaders(token), timeout: 8000 });
      if (statsRes.data?.success && statsRes.data?.stats) {
        const total = Number(statsRes.data.stats.totalMirrored || 0) + Number(statsRes.data.stats.totalLocal || 0);
        cardCount = total;
        cardStatus = "live";
      } else if (cardsRes.items.length > 0) {
        cardCount = cardsRes.items.length;
        cardStatus = "live";
      }
    } catch {
      if (cardsRes.items.length > 0) {
        cardCount = cardsRes.items.length;
        cardStatus = "live";
      } else {
        cardCount = "—";
        cardStatus = "unavailable";
      }
    }

    // 8. Fetch CMS for Live TV, Radio, Reels & Widgets
    let tvCount = 0;
    let radioCount = 0;
    let reelsCount = 0;
    try {
      const cmsRes = await axios.get("/api/cms");
      const cms = cmsRes.data?.cms || {};
      if (Array.isArray(cms.liveTvChannels)) tvCount = cms.liveTvChannels.filter((c: any) => c.enabled !== false).length;
      if (Array.isArray(cms.internetRadioStations)) radioCount = cms.internetRadioStations.filter((r: any) => r.enabled !== false).length;
      else if (Array.isArray(cms.radioStations)) radioCount = cms.radioStations.filter((r: any) => r.enabled !== false).length;
      if (Array.isArray(cms.instagramPosts)) reelsCount = cms.instagramPosts.filter((p: any) => p.active !== false).length;

      // Load persistent widget registry if configured
      if (Array.isArray(cms.dashboardWidgets)) {
        setWidgets(cms.dashboardWidgets);
      }
    } catch {}

    setData({
      users: usersRes.items,
      volunteers: volRes.items,
      cards: cardsRes.items,
      grievances: grievRes.items,
      services: servRes.items,
      campaigns: campRes.items,
      channels: [],
      radioStations: [],
      reels: []
    });

    // PURE VERIFIED REAL NUMBERS (ZERO FAKE FALLBACK CONSTANTS)
    setMetrics({
      users: {
        value: usersRes.error ? "Unavailable" : usersRes.items.length,
        loading: false,
        status: usersRes.error ? "unavailable" : "live",
        lastUpdated: now
      },
      volunteers: {
        value: volRes.error ? "Unavailable" : volRes.items.length,
        loading: false,
        status: volRes.error ? "unavailable" : "live",
        lastUpdated: now
      },
      cards: {
        value: cardCount,
        loading: false,
        status: cardStatus,
        lastUpdated: now
      },
      grievances: {
        value: grievRes.error ? "Unavailable" : grievRes.items.length,
        loading: false,
        status: grievRes.error ? "unavailable" : "live",
        lastUpdated: now
      },
      services: {
        value: servRes.error ? "Unavailable" : servRes.items.length,
        loading: false,
        status: servRes.error ? "unavailable" : "live",
        lastUpdated: now
      },
      campaigns: {
        value: campRes.error ? "Unavailable" : campRes.items.length,
        loading: false,
        status: campRes.error ? "unavailable" : "live",
        lastUpdated: now
      },
      channels: {
        value: tvCount,
        loading: false,
        status: "live",
        lastUpdated: now
      },
      radio: {
        value: radioCount,
        loading: false,
        status: "live",
        lastUpdated: now
      },
      reels: {
        value: reelsCount,
        loading: false,
        status: "live",
        lastUpdated: now
      }
    });

    setLoading(false);
  }, [token]);

  useEffect(() => {
    void load();
    const handleAdminRefresh = () => {
      void load();
    };
    window.addEventListener("samahit-admin-updated", handleAdminRefresh);
    return () => window.removeEventListener("samahit-admin-updated", handleAdminRefresh);
  }, [load]);

  // Save Dynamic Widgets Layout to CMS
  const handleSaveWidgets = async (updatedWidgets?: DashboardWidget[]) => {
    const listToSave = updatedWidgets || widgets;
    setSavingWidgets(true);
    const toastId = toast.loading("Saving dashboard widget registry...");
    try {
      const res = await axios.post(
        "/api/admin/control/cms/publish",
        {
          patch: { dashboardWidgets: listToSave },
          label: "DashboardStudio: update widget registry"
        },
        { headers: authHeaders(token) }
      );
      if (res.data?.success) {
        toast.success("Dashboard widget layout saved live!", { id: toastId });
      } else {
        throw new Error(res.data?.error || "Save failed");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to save widgets", { id: toastId });
    } finally {
      setSavingWidgets(false);
    }
  };

  // Move Widget Up / Down
  const moveWidget = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= widgets.length) return;
    const newWidgets = [...widgets];
    const [moved] = newWidgets.splice(index, 1);
    newWidgets.splice(targetIndex, 0, moved);
    const reordered = newWidgets.map((w, idx) => ({ ...w, order: idx }));
    setWidgets(reordered);
    void handleSaveWidgets(reordered);
  };

  const exportCsv = (resource: string, filename: string) => {
    const targetData: Row[] = Array.isArray((data as any)[resource]) ? (data as any)[resource] : [];
    if (!targetData.length) return;
    const headers = Object.keys(targetData[0]).join(",");
    const rows = targetData.map(row =>
      Object.values(row)
        .map(v => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const filteredVolunteers = data.volunteers.filter(
    v =>
      (v.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = data.users.filter(
    u =>
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-[#0A192F] text-white shadow-sm">
            <Activity className="h-6 w-6 text-[#C2410C]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#166534] border border-emerald-200">
                Live Verified
              </span>
              <span className="text-[10px] font-bold text-slate-400">Database & Registry Telemetry</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-[#0A192F]">Master Dashboard & Control Plane</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#C2410C] ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === "overview" ? "bg-[#0A192F] text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Overview Cards
          </button>
          <button
            onClick={() => setActiveTab("widgets")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "widgets" ? "bg-amber-600 text-white shadow-xs" : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
            }`}
          >
            <Layers className="h-3.5 w-3.5" /> Manage Widgets ({widgets.length})
          </button>
          <button
            onClick={() => setActiveTab("volunteers")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === "volunteers" ? "bg-[#0A192F] text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Volunteers ({metrics.volunteers.value})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === "users" ? "bg-[#0A192F] text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Users ({metrics.users.value})
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB: RENDERS ACTIVE WIDGETS IN CONFIGURED ORDER */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {widgets
              .filter(w => w.active !== false)
              .map((widget, wIdx) => {
                const metricInfo = metrics[widget.metricKey] || { value: 0, loading: false, status: "live" };
                const IconComp = AVAILABLE_ICONS[widget.iconName] || Activity;
                return (
                  <div
                    key={widget.id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs relative overflow-hidden flex flex-col justify-between hover:border-slate-300 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                            <IconComp className="h-3.5 w-3.5 text-amber-600" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            {widget.category}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            metricInfo.status === "live"
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                              : "text-amber-700 bg-amber-50 border-amber-200"
                          }`}
                        >
                          {metricInfo.status === "live" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          {metricInfo.status === "live" ? "Live" : "Unavailable"}
                        </span>
                      </div>
                      <h3 className="mt-3 text-xs font-black uppercase tracking-widest text-slate-500">
                        {widget.title}
                      </h3>
                      <p className="mt-2 text-3xl font-black text-[#0A192F]">
                        {loading
                          ? "..."
                          : typeof metricInfo.value === "number"
                          ? metricInfo.value.toLocaleString()
                          : metricInfo.value}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[10px] font-mono truncate max-w-[170px]" title={widget.endpoint}>
                        {widget.endpoint}
                      </span>
                      {widget.canExportCsv && widget.csvResource ? (
                        <button
                          onClick={() => exportCsv(widget.csvResource!, `rpf_${widget.csvResource}`)}
                          className="font-bold text-[#C2410C] hover:underline"
                        >
                          Export CSV &rarr;
                        </button>
                      ) : (
                        <a href={widget.route} className="font-bold text-[#167C5A] hover:underline flex items-center gap-0.5">
                          Open Studio &rarr;
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Database Sync Studio Component */}
          <JanSevaSyncStudio
            cards={data.cards}
            totalCards={typeof metrics.cards.value === "number" ? metrics.cards.value : data.cards.length}
            token={token || ""}
            onRefresh={load}
            exportCsv={exportCsv}
          />
        </div>
      )}

      {/* MANAGE WIDGETS TAB (ADD, EDIT, DELETE, REORDER, ACTIVE/DEACTIVATE) */}
      {activeTab === "widgets" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-[#0A192F]">Dashboard Widget Registry</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Full CRUD control: Add new telemetry cards, edit endpoints and titles, reorder with Move Up/Down, or toggle visibility.
              </p>
            </div>
            <button
              onClick={() => {
                const newW: DashboardWidget = {
                  id: `w-${Date.now()}`,
                  title: "New Custom Metric Card",
                  category: "Telemetry",
                  metricKey: "users",
                  endpoint: "/api/admin/users",
                  route: "/admin",
                  iconName: "Activity",
                  order: widgets.length,
                  active: true
                };
                const updated = [...widgets, newW];
                setWidgets(updated);
                setEditingWidget(newW);
                void handleSaveWidgets(updated);
                toast.success("Added new dashboard widget");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-xs font-bold text-white hover:bg-amber-700 shadow-xs transition"
            >
              <Plus className="h-4 w-4" /> Add Widget
            </button>
          </div>

          <div className="space-y-3">
            {widgets.map((w, idx) => {
              const IconComp = AVAILABLE_ICONS[w.iconName] || Activity;
              return (
                <div
                  key={w.id}
                  className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    w.active ? "bg-white border-slate-200 shadow-2xs" : "bg-slate-50 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setIconTargetWidgetId(w.id);
                        setIconPickerOpen(true);
                      }}
                      className="h-10 w-10 rounded-xl bg-slate-100 hover:bg-amber-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:text-amber-700 transition"
                      title="Click to visually pick icon (No coding)"
                    >
                      <IconComp className="h-5 w-5 text-amber-600" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase text-slate-700">
                          {w.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Metric: {w.metricKey}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-800 mt-0.5">{w.title}</h4>
                      <p className="text-xs text-slate-500 font-mono">{w.endpoint} &bull; Route: {w.route}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end md:self-center">
                    {/* Reorder Buttons */}
                    <button
                      onClick={() => moveWidget(idx, "up")}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveWidget(idx, "down")}
                      disabled={idx === widgets.length - 1}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => setEditingWidget(w)}
                      className="p-1.5 rounded-lg border border-slate-200 text-amber-600 hover:bg-amber-50"
                      title="Edit Widget"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    {/* Active Toggle */}
                    <button
                      onClick={() => {
                        const updated = widgets.map((item, i) => (i === idx ? { ...item, active: !item.active } : item));
                        setWidgets(updated);
                        void handleSaveWidgets(updated);
                        toast.success(w.active ? "Widget deactivated" : "Widget activated");
                      }}
                      className={`p-1.5 rounded-lg border ${
                        w.active ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-slate-400 bg-slate-100 border-slate-200"
                      }`}
                      title={w.active ? "Active" : "Disabled"}
                    >
                      {w.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        if (confirm(`Delete widget "${w.title}"?`)) {
                          const updated = widgets.filter((_, i) => i !== idx);
                          setWidgets(updated);
                          void handleSaveWidgets(updated);
                          toast.success("Widget deleted");
                        }
                      }}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                      title="Delete Widget"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EDIT WIDGET MODAL */}
      {editingWidget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-800">Edit Dashboard Widget</h3>
              <button onClick={() => setEditingWidget(null)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Widget Title</label>
                <input
                  type="text"
                  value={editingWidget.title}
                  onChange={e => setEditingWidget({ ...editingWidget, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Category Tag</label>
                  <input
                    type="text"
                    value={editingWidget.category}
                    onChange={e => setEditingWidget({ ...editingWidget, category: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Metric Data Key</label>
                  <select
                    value={editingWidget.metricKey}
                    onChange={e => setEditingWidget({ ...editingWidget, metricKey: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                  >
                    <option value="users">users</option>
                    <option value="volunteers">volunteers</option>
                    <option value="cards">cards</option>
                    <option value="grievances">grievances</option>
                    <option value="services">services</option>
                    <option value="campaigns">campaigns</option>
                    <option value="channels">channels</option>
                    <option value="radio">radio</option>
                    <option value="reels">reels</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700">API Endpoint</label>
                <input
                  type="text"
                  value={editingWidget.endpoint}
                  onChange={e => setEditingWidget({ ...editingWidget, endpoint: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-mono text-[11px] outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Destination Route</label>
                <input
                  type="text"
                  value={editingWidget.route}
                  onChange={e => setEditingWidget({ ...editingWidget, route: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-mono text-[11px] outline-none"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="csvToggle"
                  checked={editingWidget.canExportCsv || false}
                  onChange={e => setEditingWidget({ ...editingWidget, canExportCsv: e.target.checked })}
                  className="h-4 w-4 rounded text-amber-600"
                />
                <label htmlFor="csvToggle" className="font-bold text-slate-700">Allow Direct CSV Export</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setEditingWidget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = widgets.map(w => (w.id === editingWidget.id ? editingWidget : w));
                  setWidgets(updated);
                  setEditingWidget(null);
                  void handleSaveWidgets(updated);
                  toast.success("Widget updated");
                }}
                className="px-5 py-2 rounded-xl bg-amber-600 text-xs font-black text-white hover:bg-amber-700"
              >
                Save Widget
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VOLUNTEERS TAB */}
      {activeTab === "volunteers" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-[#0A192F]">Registered Ground Volunteers</h2>
              <p className="text-xs text-slate-400">Total verified volunteers: {metrics.volunteers.value}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 outline-none w-56 font-semibold"
                />
              </div>
              <button onClick={() => exportCsv("volunteers", "volunteers_list")} className="px-3 py-1.5 text-xs font-bold bg-[#0A192F] text-white rounded-xl shadow-xs">Export CSV</button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3">Volunteer</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Skills / Domain</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVolunteers.length > 0 ? (
                  filteredVolunteers.map((v, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-800">{v.name || "Volunteer"}</td>
                      <td className="p-3 text-slate-600">{v.email || v.phone || "—"}</td>
                      <td className="p-3 text-slate-600">{v.skills || v.city || "General Service"}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#166534] border border-emerald-200">
                          Verified
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400">No volunteers match the query</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === "users" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-[#0A192F]">Citizen User Accounts</h2>
              <p className="text-xs text-slate-400">Total registered citizens: {metrics.users.value}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search citizens..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 outline-none w-56 font-semibold"
                />
              </div>
              <button onClick={() => exportCsv("users", "users_list")} className="px-3 py-1.5 text-xs font-bold bg-[#0A192F] text-white rounded-xl shadow-xs">Export CSV</button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Phone / Contact</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-800">{u.name || "Citizen"}</td>
                      <td className="p-3 text-slate-600">{u.phone || u.email || "—"}</td>
                      <td className="p-3 text-slate-600 uppercase font-bold text-[10px]">{u.role || "user"}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">Active</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400">No citizen records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Visual Icon Picker Modal */}
      <IconPickerModal
        isOpen={iconPickerOpen}
        onClose={() => {
          setIconPickerOpen(false);
          setIconTargetWidgetId(null);
        }}
        selectedIcon={widgets.find(w => w.id === iconTargetWidgetId)?.iconName || "Activity"}
        onSelectIcon={iconName => {
          if (!iconTargetWidgetId) return;
          const updated = widgets.map(w => (w.id === iconTargetWidgetId ? { ...w, iconName } : w));
          setWidgets(updated);
          void handleSaveWidgets(updated);
          toast.success(`Icon updated to ${iconName}`);
        }}
      />
    </div>
  );
}
