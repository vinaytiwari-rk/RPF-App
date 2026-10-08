import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  ShieldCheck,
  User,
  Users,
  Key,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  ArchiveRestore,
  RotateCcw,
  ToggleLeft,
  ToggleRight,
  Download,
  Activity,
  History,
  RefreshCw,
  FileText,
  Mail,
  Phone,
  Lock,
  Trash2,
  Edit3,
  Server,
  Plus,
  Save,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Sparkles,
  Award,
  Settings,
  HelpCircle,
  AlertTriangle,
  Info,
  LogOut,
  BadgeCheck
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";

type SubTab = "profile_cms" | "roles" | "control_room" | "about_cms";

export interface ProfileMetricItem {
  id: string;
  value: string;
  label: string;
  subLabel: string;
  iconName: string;
  route?: string;
  active: boolean;
}

export interface ProfileMenuItem {
  id: string;
  title: string;
  sub: string;
  iconName: string;
  route?: string;
  active: boolean;
}

export interface ProfileConfig {
  portalName: string;
  verifiedBadgeText: string;
  showVerifiedBadge: boolean;
  demoUser: {
    avatarInitial: string;
    name: string;
    phone: string;
    email: string;
  };
  impactSection: {
    title: string;
    subtitle: string;
    noticeText: string;
    active: boolean;
  };
  metrics: ProfileMetricItem[];
  accountItems: ProfileMenuItem[];
  legalItems: ProfileMenuItem[];
}

export const DEFAULT_PROFILE_CONFIG: ProfileConfig = {
  portalName: "RPF SAMAHIT PORTAL",
  verifiedBadgeText: "Verified Volunteer",
  showVerifiedBadge: true,
  demoUser: {
    avatarInitial: "V",
    name: "Vinu",
    phone: "7880121167",
    email: "vinu27989@gmail.com"
  },
  impactSection: {
    title: "My Volunteer Seva Impact",
    subtitle: "Live Real-Time",
    noticeText: "This area contains only your personal profile and account options. Volunteer Duty belongs in Activity and Jan Seva Card is available in Explore.",
    active: true
  },
  metrics: [
    { id: "metric-1", value: "38 hrs", label: "Duty Hours Logged", subLabel: "Active field service", iconName: "Clock", route: "/volunteer-duty", active: true },
    { id: "metric-2", value: "14+", label: "Field Missions", subLabel: "Verified reports", iconName: "CheckCircle2", route: "/activity", active: true },
    { id: "metric-3", value: "590 pts", label: "Seva Karma Points", subLabel: "Verified impact score", iconName: "Sparkles", route: "/my-certificates", active: true },
    { id: "metric-4", value: "1,240+", label: "Citizens Reached", subLabel: "Directly supported", iconName: "Users", route: "/activity", active: true }
  ],
  accountItems: [
    { id: "item-activity", title: "My Activity", sub: "Your actions and impact", iconName: "Sparkles", route: "/activity", active: true },
    { id: "item-edit-profile", title: "Edit Profile", sub: "Update your personal information", iconName: "User", route: "/profile?edit=1", active: true },
    { id: "item-certificates", title: "My Certificates", sub: "Certificates of service & impact", iconName: "Award", route: "/my-certificates", active: true },
    { id: "item-settings", title: "App Settings", sub: "Language, notifications & preferences", iconName: "Settings", route: "/settings", active: true }
  ],
  legalItems: [
    { id: "terms", title: "Terms & Conditions", sub: "Terms governing Samahit usage", iconName: "FileText", active: true },
    { id: "privacy", title: "Privacy Policy", sub: "How we handle information and privacy", iconName: "Lock", active: true },
    { id: "disclaimer", title: "Disclaimer & Notice", sub: "Important transparency and responsibility notices", iconName: "AlertTriangle", active: true },
    { id: "support", title: "Help Desk & Support", sub: "Get help, report issues & share feedback", iconName: "HelpCircle", active: true },
    { id: "about", title: "About App & Version", sub: "About Samahit, volunteers & app version", iconName: "Info", active: true },
    { id: "logout", title: "Log Out of Account", sub: "Sign out safely", iconName: "LogOut", active: true }
  ]
};

interface UserRow {
  id: string | number;
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  role: string;
  isVolunteer?: boolean;
  isDonor?: boolean;
  created_at?: string;
}

interface CmsVersion {
  id: number;
  created_at: string;
  created_by?: string;
  label: string;
  checksum: string;
  field_count?: number;
}

interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
  updated_at?: string;
}

interface SystemOverview {
  status: string;
  apiLatencyMs: number;
  database: { connected: boolean; serverTime?: string };
  schemaTables: number;
  cmsVersions: { count: number; latest?: string };
  featureFlags: { count: number; enabled: number };
  node: string;
  environment: string;
  checkedAt: string;
}

export default function ProfileStudio() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<SubTab>("profile_cms");
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);

  // 1. Profile Layout CMS State
  const [profileConfig, setProfileConfig] = useState<ProfileConfig>(DEFAULT_PROFILE_CONFIG);

  // 2. Roles & Access State
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  // 3. Control Room State
  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [versions, setVersions] = useState<CmsVersion[]>([]);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [rollbackId, setRollbackId] = useState<number | null>(null);

  // 4. Foundation About CMS State
  const [aboutDraft, setAboutDraft] = useState("");
  const [aboutDirty, setAboutDirty] = useState(false);

  const authHeader = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  // Load all data
  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      // 1. Fetch CMS config including profileConfig
      const cmsRes = await axios.get("/api/cms");
      const cms = cmsRes.data?.cms || cmsRes.data?.data || {};
      if (cms.profileConfig) {
        setProfileConfig({
          ...DEFAULT_PROFILE_CONFIG,
          ...cms.profileConfig,
          demoUser: { ...DEFAULT_PROFILE_CONFIG.demoUser, ...(cms.profileConfig.demoUser || {}) },
          impactSection: { ...DEFAULT_PROFILE_CONFIG.impactSection, ...(cms.profileConfig.impactSection || {}) },
          metrics: Array.isArray(cms.profileConfig.metrics) ? cms.profileConfig.metrics : DEFAULT_PROFILE_CONFIG.metrics,
          accountItems: Array.isArray(cms.profileConfig.accountItems) ? cms.profileConfig.accountItems : DEFAULT_PROFILE_CONFIG.accountItems,
          legalItems: Array.isArray(cms.profileConfig.legalItems) ? cms.profileConfig.legalItems : DEFAULT_PROFILE_CONFIG.legalItems,
        });
      }
      if (typeof cms.foundationAbout === "string") {
        setAboutDraft(cms.foundationAbout);
      }

      // 2. Fetch Users
      try {
        const usersRes = await axios.get("/api/admin/hq/users", { headers: authHeader() });
        if (usersRes.data?.data) {
          setUsers(usersRes.data.data);
        }
      } catch {
        // Users endpoint may require superadmin
      }

      // 3. Fetch Control Room Snapshots
      try {
        const sysRes = await axios.get("/api/admin/control/overview", { headers: authHeader() });
        if (sysRes.data?.data) setOverview(sysRes.data.data);

        const verRes = await axios.get("/api/admin/control/cms/versions", { headers: authHeader() });
        if (verRes.data?.data) setVersions(verRes.data.data);

        const flagRes = await axios.get("/api/admin/control/flags", { headers: authHeader() });
        if (flagRes.data?.data) setFlags(flagRes.data.data);
      } catch {
        // Control room optional endpoints
      }
    } catch {
      toast.error("Failed to load profile state");
    } finally {
      setLoading(false);
    }
  }, [token, authHeader]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Save and publish profileConfig
  const handleSaveProfileConfig = async () => {
    if (!token) {
      toast.error("Admin session expired");
      return;
    }
    setActionBusy(true);
    const toastId = toast.loading("Publishing Profile & Seva Impact layout...");
    try {
      const res = await axios.post(
        "/api/admin/control/cms/publish",
        {
          patch: { profileConfig },
          label: "Profile Studio: Updated Citizen Profile & Seva Impact Layout"
        },
        { headers: authHeader() }
      );
      if (res.data?.success === false) throw new Error(res.data?.error || "Publish failed");
      toast.success("Profile layout live across citizen apps!", { id: toastId });
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to save profile layout", { id: toastId });
    } finally {
      setActionBusy(false);
    }
  };

  // Profile CMS Metric Handlers
  const handleAddMetric = () => {
    const newMetric: ProfileMetricItem = {
      id: `metric-${Date.now()}`,
      value: "100+",
      label: "New Impact Metric",
      subLabel: "Verified records",
      iconName: "Sparkles",
      route: "/activity",
      active: true
    };
    setProfileConfig({
      ...profileConfig,
      metrics: [...profileConfig.metrics, newMetric]
    });
    toast.success("Metric card added");
  };

  const handleUpdateMetric = (id: string, patch: Partial<ProfileMetricItem>) => {
    setProfileConfig({
      ...profileConfig,
      metrics: profileConfig.metrics.map(m => m.id === id ? { ...m, ...patch } : m)
    });
  };

  const handleDeleteMetric = (id: string) => {
    setProfileConfig({
      ...profileConfig,
      metrics: profileConfig.metrics.filter(m => m.id !== id)
    });
    toast.success("Metric card removed");
  };

  const handleMoveMetric = (index: number, direction: "up" | "down") => {
    const nextList = [...profileConfig.metrics];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= nextList.length) return;
    const temp = nextList[index];
    nextList[index] = nextList[targetIdx];
    nextList[targetIdx] = temp;
    setProfileConfig({ ...profileConfig, metrics: nextList });
  };

  // Account Menu Handlers
  const handleAddAccountItem = () => {
    const newItem: ProfileMenuItem = {
      id: `item-${Date.now()}`,
      title: "New Account Item",
      sub: "Short description of account action",
      iconName: "User",
      route: "/profile",
      active: true
    };
    setProfileConfig({
      ...profileConfig,
      accountItems: [...profileConfig.accountItems, newItem]
    });
    toast.success("Account item added");
  };

  const handleUpdateAccountItem = (id: string, patch: Partial<ProfileMenuItem>) => {
    setProfileConfig({
      ...profileConfig,
      accountItems: profileConfig.accountItems.map(item => item.id === id ? { ...item, ...patch } : item)
    });
  };

  const handleDeleteAccountItem = (id: string) => {
    setProfileConfig({
      ...profileConfig,
      accountItems: profileConfig.accountItems.filter(item => item.id !== id)
    });
    toast.success("Account item removed");
  };

  const handleMoveAccountItem = (index: number, direction: "up" | "down") => {
    const nextList = [...profileConfig.accountItems];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= nextList.length) return;
    const temp = nextList[index];
    nextList[index] = nextList[targetIdx];
    nextList[targetIdx] = temp;
    setProfileConfig({ ...profileConfig, accountItems: nextList });
  };

  // Legal Items Handlers
  const handleUpdateLegalItem = (id: string, patch: Partial<ProfileMenuItem>) => {
    setProfileConfig({
      ...profileConfig,
      legalItems: profileConfig.legalItems.map(item => item.id === id ? { ...item, ...patch } : item)
    });
  };

  const handleDeleteLegalItem = (id: string) => {
    setProfileConfig({
      ...profileConfig,
      legalItems: profileConfig.legalItems.filter(item => item.id !== id)
    });
    toast.success("Item removed");
  };

  const handleAddLegalItem = () => {
    const newItem: ProfileMenuItem = {
      id: `legal-${Date.now()}`,
      title: "New Transparency Notice",
      sub: "Description of policy or guidance",
      iconName: "FileText",
      active: true
    };
    setProfileConfig({
      ...profileConfig,
      legalItems: [...profileConfig.legalItems, newItem]
    });
    toast.success("Transparency notice added");
  };

  // User list filter for roles
  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 space-y-6">
      {/* HEADER WITH SAVE AND REFRESH */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-purple-50 text-purple-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-purple-700">
                Phase 5 Command
              </span>
              <span className="text-xs text-slate-400">Profile, Identity & System Governance</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 mt-1">Profile & Citizen Portal Command</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize Citizen Profile, Seva Impact metrics, account menus, legal policies and administrator roles.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === "profile_cms" && (
            <button
              onClick={() => {
                setProfileConfig(DEFAULT_PROFILE_CONFIG);
                toast.success("Defaults restored. Click 'Save & Publish' to make permanent.");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition border border-slate-200"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Defaults
            </button>
          )}
          {activeTab === "profile_cms" && (
            <button
              onClick={handleSaveProfileConfig}
              disabled={actionBusy}
              className="inline-flex items-center gap-1.5 px-6 py-2 text-xs font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition shadow-xs disabled:opacity-60"
            >
              <Save className="h-4 w-4" /> {actionBusy ? "Publishing..." : "Save & Publish"}
            </button>
          )}
        </div>
      </div>

      {/* FOUR MAIN COMMAND TABS */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("profile_cms")}
          className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 ${
            activeTab === "profile_cms" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <User className="h-4 w-4" /> Profile & Seva Impact CMS
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 ${
            activeTab === "roles" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Key className="h-4 w-4" /> Role & Privilege Control ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("control_room")}
          className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 ${
            activeTab === "control_room" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Server className="h-4 w-4" /> System & Rollbacks ({versions.length})
        </button>
        <button
          onClick={() => setActiveTab("about_cms")}
          className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 ${
            activeTab === "about_cms" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileText className="h-4 w-4" /> Foundation About CMS
        </button>
      </div>

      {/* TAB 1: PROFILE CMS CONTROL ROOM */}
      {activeTab === "profile_cms" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 7 COLS: FORM CONTROLS */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Header & Identity Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-600" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    Profile Identity & Portal Badge
                  </h3>
                </div>
                <button
                  onClick={() => setProfileConfig({ ...profileConfig, showVerifiedBadge: !profileConfig.showVerifiedBadge })}
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    profileConfig.showVerifiedBadge ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {profileConfig.showVerifiedBadge ? "Badge Active" : "Badge Hidden"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Portal Name</label>
                  <input
                    type="text"
                    value={profileConfig.portalName}
                    onChange={e => setProfileConfig({ ...profileConfig, portalName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={profileConfig.verifiedBadgeText}
                    onChange={e => setProfileConfig({ ...profileConfig, verifiedBadgeText: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase mb-2">Default Preview User Details</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Name</label>
                    <input
                      type="text"
                      value={profileConfig.demoUser.name}
                      onChange={e => setProfileConfig({
                        ...profileConfig,
                        demoUser: { ...profileConfig.demoUser, name: e.target.value }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Phone</label>
                    <input
                      type="text"
                      value={profileConfig.demoUser.phone}
                      onChange={e => setProfileConfig({
                        ...profileConfig,
                        demoUser: { ...profileConfig.demoUser, phone: e.target.value }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Email</label>
                    <input
                      type="text"
                      value={profileConfig.demoUser.email}
                      onChange={e => setProfileConfig({
                        ...profileConfig,
                        demoUser: { ...profileConfig.demoUser, email: e.target.value }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Volunteer Seva Impact Section & 4 Metric Cards */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    My Volunteer Seva Impact Controls
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setProfileConfig({
                      ...profileConfig,
                      impactSection: { ...profileConfig.impactSection, active: !profileConfig.impactSection.active }
                    })}
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      profileConfig.impactSection.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {profileConfig.impactSection.active ? "Section Active" : "Section Hidden"}
                  </button>
                  <button
                    onClick={handleAddMetric}
                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200 hover:bg-purple-100"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Metric
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Section Title</label>
                  <input
                    type="text"
                    value={profileConfig.impactSection.title}
                    onChange={e => setProfileConfig({
                      ...profileConfig,
                      impactSection: { ...profileConfig.impactSection, title: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Live Subtitle Tag</label>
                  <input
                    type="text"
                    value={profileConfig.impactSection.subtitle}
                    onChange={e => setProfileConfig({
                      ...profileConfig,
                      impactSection: { ...profileConfig.impactSection, subtitle: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Explanatory Notice Text</label>
                <textarea
                  rows={2}
                  value={profileConfig.impactSection.noticeText}
                  onChange={e => setProfileConfig({
                    ...profileConfig,
                    impactSection: { ...profileConfig.impactSection, noticeText: e.target.value }
                  })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium"
                />
              </div>

              {/* Metric Cards List */}
              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Impact Metric Cards ({profileConfig.metrics.length})</p>
                {profileConfig.metrics.map((metric, idx) => (
                  <div key={metric.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="grid grid-cols-3 gap-2 flex-1">
                      <input
                        type="text"
                        placeholder="Value (e.g. 38 hrs)"
                        value={metric.value}
                        onChange={e => handleUpdateMetric(metric.id, { value: e.target.value })}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-purple-700"
                      />
                      <input
                        type="text"
                        placeholder="Label"
                        value={metric.label}
                        onChange={e => handleUpdateMetric(metric.id, { label: e.target.value })}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="SubLabel"
                        value={metric.subLabel}
                        onChange={e => handleUpdateMetric(metric.id, { subLabel: e.target.value })}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-500"
                      />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleUpdateMetric(metric.id, { active: !metric.active })}
                        className={`p-1 rounded ${metric.active ? "text-emerald-600 bg-emerald-50" : "text-slate-400 bg-slate-200"}`}
                        title={metric.active ? "Active" : "Deactivated"}
                      >
                        {metric.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => handleMoveMetric(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveMetric(idx, "down")}
                        disabled={idx === profileConfig.metrics.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMetric(metric.id)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. My Profile & Account Menu */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    My Profile & Account Menu Items
                  </h3>
                </div>
                <button
                  onClick={handleAddAccountItem}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Menu Item
                </button>
              </div>

              <div className="space-y-2">
                {profileConfig.accountItems.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="grid grid-cols-3 gap-2 flex-1">
                      <input
                        type="text"
                        placeholder="Title (e.g. My Activity)"
                        value={item.title}
                        onChange={e => handleUpdateAccountItem(item.id, { title: e.target.value })}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Subtitle (e.g. Your actions and impact)"
                        value={item.sub}
                        onChange={e => handleUpdateAccountItem(item.id, { sub: e.target.value })}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-600"
                      />
                      <input
                        type="text"
                        placeholder="Route (e.g. /activity)"
                        value={item.route || ""}
                        onChange={e => handleUpdateAccountItem(item.id, { route: e.target.value })}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono text-emerald-700"
                      />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleUpdateAccountItem(item.id, { active: !item.active })}
                        className={`p-1 rounded ${item.active ? "text-emerald-600 bg-emerald-50" : "text-slate-400 bg-slate-200"}`}
                        title={item.active ? "Active" : "Deactivated"}
                      >
                        {item.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => handleMoveAccountItem(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveAccountItem(idx, "down")}
                        disabled={idx === profileConfig.accountItems.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAccountItem(item.id)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Policy, Legal & Transparency */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    Policy, Legal & Transparency Menu
                  </h3>
                </div>
                <button
                  onClick={handleAddLegalItem}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 hover:bg-blue-100"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Policy Notice
                </button>
              </div>

              <div className="space-y-2">
                {profileConfig.legalItems.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <input
                        type="text"
                        placeholder="Title (e.g. Terms & Conditions)"
                        value={item.title}
                        onChange={e => handleUpdateLegalItem(item.id, { title: e.target.value })}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Subtitle (e.g. Terms governing Samahit usage)"
                        value={item.sub}
                        onChange={e => handleUpdateLegalItem(item.id, { sub: e.target.value })}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-600"
                      />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleUpdateLegalItem(item.id, { active: !item.active })}
                        className={`p-1 rounded ${item.active ? "text-emerald-600 bg-emerald-50" : "text-slate-400 bg-slate-200"}`}
                        title={item.active ? "Active" : "Deactivated"}
                      >
                        {item.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteLegalItem(item.id)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: LIVE MOBILE SCREEN PREVIEW */}
          <div className="lg:col-span-5">
            <div className="sticky top-6 bg-[#FFF7E8] rounded-3xl p-5 border-2 border-[#D8E8DB] shadow-lg text-[#243B32] space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                  Live Public Profile Preview
                </span>
                <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-amber-200 text-slate-700">
                  Mobile View
                </span>
              </div>

              {/* User Identity Card Preview */}
              <div className="bg-white p-4 rounded-2xl border border-[#D8E8DB] shadow-2xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#243B32] via-[#D97706] to-[#167C5A] p-0.5 shrink-0">
                    <div className="h-full w-full rounded-full bg-white flex items-center justify-center font-black text-lg text-[#243B32]">
                      {profileConfig.demoUser.avatarInitial || "V"}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-bold text-[#D97706] uppercase tracking-wider">
                        {profileConfig.portalName}
                      </span>
                      {profileConfig.showVerifiedBadge && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[8.5px] font-bold text-[#167C5A] border border-emerald-200">
                          <BadgeCheck className="h-2.5 w-2.5" /> {profileConfig.verifiedBadgeText}
                        </span>
                      )}
                    </div>
                    <h2 className="text-sm font-bold text-[#243B32]">{profileConfig.demoUser.name}</h2>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {profileConfig.demoUser.phone} • {profileConfig.demoUser.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Seva Impact Section Preview */}
              {profileConfig.impactSection.active && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#243B32] flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-[#D97706]" />
                      {profileConfig.impactSection.title}
                    </h4>
                    <span className="text-[9px] font-bold text-slate-400">
                      {profileConfig.impactSection.subtitle}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 leading-snug px-1">
                    {profileConfig.impactSection.noticeText}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {profileConfig.metrics.filter(m => m.active).map(m => (
                      <div key={m.id} className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs">
                        <p className="text-sm font-black text-amber-700">{m.value}</p>
                        <p className="text-[10px] font-bold text-[#243B32] truncate">{m.label}</p>
                        <p className="text-[8.5px] text-slate-400 truncate">{m.subLabel}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Account Items Preview */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#243B32] px-1">
                  My Profile & Account
                </p>
                <div className="bg-white rounded-2xl border border-[#D8E8DB] divide-y divide-slate-100 shadow-2xs overflow-hidden">
                  {profileConfig.accountItems.filter(i => i.active).map(item => (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#243B32] truncate">{item.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">{item.sub}</p>
                      </div>
                      <span className="text-[10px] text-slate-400">→</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Items Preview */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#243B32] px-1">
                  Policy, Legal & Transparency
                </p>
                <div className="bg-white rounded-2xl border border-[#D8E8DB] divide-y divide-slate-100 shadow-2xs overflow-hidden">
                  {profileConfig.legalItems.filter(i => i.active).map(item => (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#243B32] truncate">{item.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">{item.sub}</p>
                      </div>
                      <span className="text-[10px] text-slate-400">→</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES & PRIVILEGES */}
      {activeTab === "roles" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user name, email, phone or role..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No user accounts found.</div>
              ) : (
                filteredUsers.map(u => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition hover:bg-slate-50 ${
                      selectedUser?.id === u.id ? "bg-purple-50/50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                        {(u.name || u.username || "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{u.name || u.username || "Unknown"}</h4>
                        <p className="text-[11px] text-slate-500">{u.email || u.phone || "No contact info"}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                      {u.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            {selectedUser ? (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-800 border-b pb-2">Privilege Management</h3>
                <div>
                  <p className="text-xs font-bold text-slate-600">Selected: {selectedUser.name || selectedUser.username}</p>
                  <p className="text-[11px] text-slate-400 font-mono">ID: {selectedUser.id}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Assign Role</label>
                  <select
                    value={selectedUser.role}
                    onChange={async (e) => {
                      const newRole = e.target.value;
                      try {
                        await axios.post(
                          `/api/admin/hq/users/${selectedUser.id}/role`,
                          { role: newRole },
                          { headers: authHeader() }
                        );
                        setSelectedUser({ ...selectedUser, role: newRole });
                        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: newRole } : u));
                        toast.success("Role updated successfully");
                      } catch {
                        toast.error("Role update failed");
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
                  >
                    <option value="citizen">citizen</option>
                    <option value="volunteer">volunteer</option>
                    <option value="coordinator">coordinator</option>
                    <option value="admin">admin</option>
                    <option value="super_admin">super_admin</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Select a user to review privileges and assign admin permissions.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM CONTROL ROOM & ROLLBACKS */}
      {activeTab === "control_room" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-bold uppercase text-slate-400">System Status</p>
              <p className="text-lg font-black text-emerald-600 mt-1">HEALTHY</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-bold uppercase text-slate-400">Database Tables</p>
              <p className="text-lg font-black text-slate-800 mt-1">{overview?.schemaTables || "32"}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-bold uppercase text-slate-400">Saved CMS Snapshots</p>
              <p className="text-lg font-black text-purple-600 mt-1">{versions.length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-bold uppercase text-slate-400">Active Feature Flags</p>
              <p className="text-lg font-black text-blue-600 mt-1">{flags.filter(f => f.enabled).length}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Immutable Snapshot Rollbacks
            </h3>
            <p className="text-xs text-slate-500">
              Every save action creates an immutable SHA-256 snapshot. Rollback instantly if needed.
            </p>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {versions.map(v => (
                <div key={v.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800">{v.label}</span>
                    <p className="text-[10px] font-mono text-slate-400">
                      {new Date(v.created_at).toLocaleString()} • Hash: {v.checksum.slice(0, 10)}...
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!window.confirm(`Roll back configuration to snapshot #${v.id}?`)) return;
                      try {
                        await axios.post(
                          `/api/admin/control/cms/rollback/${v.id}`,
                          {},
                          { headers: authHeader() }
                        );
                        toast.success(`Successfully rolled back to version #${v.id}`);
                        void loadData();
                      } catch {
                        toast.error("Rollback failed");
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 hover:bg-amber-100"
                  >
                    <RotateCcw className="h-3 w-3" /> Rollback
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FOUNDATION ABOUT CMS */}
      {activeTab === "about_cms" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Foundation About & Mission CMS
              </h3>
              <p className="text-xs text-slate-500">Markdown and plain text for the public About screen.</p>
            </div>
            <button
              onClick={async () => {
                setActionBusy(true);
                try {
                  await axios.post(
                    "/api/admin/control/cms/publish",
                    { patch: { foundationAbout: aboutDraft }, label: "Updated Foundation About statement" },
                    { headers: authHeader() }
                  );
                  toast.success("About updated successfully");
                  setAboutDirty(false);
                } catch {
                  toast.error("Save failed");
                } finally {
                  setActionBusy(false);
                }
              }}
              disabled={actionBusy}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
            >
              Save Statement
            </button>
          </div>

          <textarea
            rows={10}
            value={aboutDraft}
            onChange={e => { setAboutDraft(e.target.value); setAboutDirty(true); }}
            placeholder="Enter public about statement..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-purple-500"
          />
        </div>
      )}
    </div>
  );
}
