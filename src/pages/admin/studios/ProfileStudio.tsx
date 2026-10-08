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
  BadgeCheck,
  Pencil
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import IconPickerModal, { AVAILABLE_ICONS } from "../../../components/admin/IconPickerModal";

type SubTab = "profile_cms" | "certificates" | "volunteer_rules" | "browser_settings" | "roles" | "control_room" | "about_cms";

export interface CertificateRuleItem {
  id: string;
  title: string;
  title_hi?: string;
  min_hours: number;
  min_reports: number;
  min_tasks: number;
  active: boolean;
}

export interface VolunteerRulesConfig {
  minimumDutyMinutes: number;
  maximumDutyHoursPerDay: number;
  karmaPointsPerHour: number;
  autoApproveReports: boolean;
  geoFencingEnabled: boolean;
  allowOfflineSync: boolean;
}

export interface BrowserSettingsConfig {
  historyEnabled: boolean;
  historyRetentionDays: number;
  bookmarksEnabled: boolean;
  dataSaverDefault: boolean;
  desktopModeDefault: boolean;
  allowExternalRedirect: boolean;
  adBlockLite: boolean;
}

export const DEFAULT_CERTIFICATE_RULES: CertificateRuleItem[] = [
  { id: "rule-1", title: "Jan Seva Mitra (Bronze)", title_hi: "जन सेवा मित्र", min_hours: 10, min_reports: 3, min_tasks: 2, active: true },
  { id: "rule-2", title: "Seva Ratna (Silver)", title_hi: "सेवा रत्न", min_hours: 25, min_reports: 10, min_tasks: 5, active: true },
  { id: "rule-3", title: "Samahit Pride (Gold)", title_hi: "समाहित गौरव", min_hours: 50, min_reports: 25, min_tasks: 10, active: true },
  { id: "rule-4", title: "Corona Warrior Award", title_hi: "कोरोना योद्धा सम्मान", min_hours: 100, min_reports: 50, min_tasks: 20, active: true },
];

export const DEFAULT_VOLUNTEER_RULES: VolunteerRulesConfig = {
  minimumDutyMinutes: 30,
  maximumDutyHoursPerDay: 8,
  karmaPointsPerHour: 15,
  autoApproveReports: false,
  geoFencingEnabled: true,
  allowOfflineSync: true,
};

export const DEFAULT_BROWSER_SETTINGS: BrowserSettingsConfig = {
  historyEnabled: true,
  historyRetentionDays: 30,
  bookmarksEnabled: true,
  dataSaverDefault: false,
  desktopModeDefault: false,
  allowExternalRedirect: true,
  adBlockLite: true,
};

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
  contentMarkdown?: string;
  settingsConfig?: {
    defaultLanguage?: "en" | "hi";
    notificationsEnabled?: boolean;
    highContrastMode?: boolean;
    soundEffects?: boolean;
  };
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

  // 5. Visual Icon Picker State
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [currentIconTarget, setCurrentIconTarget] = useState<{
    type: "metric" | "account" | "legal";
    id: string;
    currentIcon: string;
  } | null>(null);

  // 6. Deep Content Editor Modal State (Terms, Privacy, Disclaimer, Support, Settings)
  const [editingContentItem, setEditingContentItem] = useState<{
    id: string;
    title: string;
    type: "legal" | "account";
    contentMarkdown: string;
    settingsConfig?: {
      defaultLanguage?: "en" | "hi";
      notificationsEnabled?: boolean;
      highContrastMode?: boolean;
      soundEffects?: boolean;
    };
  } | null>(null);

  // 7. Certificates System State
  const [certRules, setCertRules] = useState<CertificateRuleItem[]>(DEFAULT_CERTIFICATE_RULES);
  const [editingCertRule, setEditingCertRule] = useState<CertificateRuleItem | null>(null);

  // 8. Volunteer Rules State
  const [volunteerRules, setVolunteerRules] = useState<VolunteerRulesConfig>(DEFAULT_VOLUNTEER_RULES);

  // 9. Browser Settings State
  const [browserSettings, setBrowserSettings] = useState<BrowserSettingsConfig>(DEFAULT_BROWSER_SETTINGS);

  const authHeader = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  // Load all data
  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      // 1. Fetch CMS config including profileConfig, certificateRules, volunteerRules, browserSettings
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
      if (Array.isArray(cms.certificateRules) && cms.certificateRules.length > 0) {
        setCertRules(cms.certificateRules);
      } else {
        try {
          const certsRes = await axios.get("/api/certificate-rules", { headers: authHeader() });
          if (Array.isArray(certsRes.data?.rules) && certsRes.data.rules.length > 0) {
            setCertRules(certsRes.data.rules);
          }
        } catch { /* use defaults */ }
      }
      if (cms.volunteerRules) {
        setVolunteerRules({ ...DEFAULT_VOLUNTEER_RULES, ...cms.volunteerRules });
      }
      if (cms.browserSettings) {
        setBrowserSettings({ ...DEFAULT_BROWSER_SETTINGS, ...cms.browserSettings });
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

  // Save and publish profileConfig, certRules, volunteerRules, and browserSettings
  const handleSaveProfileConfig = async () => {
    if (!token) {
      toast.error("Admin session expired");
      return;
    }
    setActionBusy(true);
    const toastId = toast.loading("Publishing Profile, Governance & Settings...");
    try {
      const patch = {
        profileConfig,
        certificateRules: certRules,
        volunteerRules,
        browserSettings,
      };

      const res = await axios.post(
        "/api/admin/control/cms/publish",
        {
          patch,
          label: "Profile Studio: Updated Profile, Certificates, Volunteer Rules & Browser Settings"
        },
        { headers: authHeader() }
      );
      if (res.data?.success === false) throw new Error(res.data?.error || "Publish failed");

      // Background sync certificate rules to PostgreSQL
      for (const rule of certRules) {
        await axios.put(`/api/admin/certificate-rules/${rule.id}`, {
          title: rule.title,
          title_hi: rule.title_hi || rule.title,
          min_hours: rule.min_hours,
          min_reports: rule.min_reports,
          min_tasks: rule.min_tasks,
          active: rule.active
        }, { headers: authHeader() }).catch(() => {});
      }

      window.dispatchEvent(new CustomEvent("samahit-admin-updated"));
      toast.success("Profile, Certificates & Governance live on apps!", { id: toastId });
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to save configuration", { id: toastId });
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

  const handleMoveLegalItem = (index: number, direction: "up" | "down") => {
    const list = [...profileConfig.legalItems];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setProfileConfig({ ...profileConfig, legalItems: list });
  };

  // Certificate Rule Handlers
  const handleAddCertRule = () => {
    const newRule: CertificateRuleItem = {
      id: `rule-${Date.now()}`,
      title: "New Recognition Award",
      title_hi: "नया सम्मान प्रमाणपत्र",
      min_hours: 10,
      min_reports: 5,
      min_tasks: 2,
      active: true,
    };
    setCertRules([...certRules, newRule]);
    setEditingCertRule(newRule);
    toast.success("New certificate award added to draft");
  };

  const handleUpdateCertRule = (id: string, patch: Partial<CertificateRuleItem>) => {
    setCertRules(certRules.map(r => r.id === id ? { ...r, ...patch } : r));
    if (editingCertRule?.id === id) {
      setEditingCertRule(prev => prev ? { ...prev, ...patch } : null);
    }
  };

  const handleDeleteCertRule = async (id: string) => {
    setCertRules(certRules.filter(r => r.id !== id));
    if (editingCertRule?.id === id) setEditingCertRule(null);
    try {
      await axios.delete(`/api/admin/certificate-rules/${id}`, { headers: authHeader() });
    } catch { /* fallback to cms patch */ }
    toast.success("Certificate rule removed");
  };

  const handleToggleCertRuleActive = async (rule: CertificateRuleItem) => {
    const updated = !rule.active;
    setCertRules(certRules.map(r => r.id === rule.id ? { ...r, active: updated } : r));
    try {
      await axios.put(`/api/admin/certificate-rules/${rule.id}`, { active: updated }, { headers: authHeader() });
    } catch { /* fallback to cms patch */ }
  };

  const handleMoveCertRule = (index: number, direction: "up" | "down") => {
    const list = [...certRules];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setCertRules(list);
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
          {["profile_cms", "certificates", "volunteer_rules", "browser_settings"].includes(activeTab) && (
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

      {/* COMMAND TABS */}
      <div className="flex flex-wrap gap-2 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("profile_cms")}
          className={`px-3 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === "profile_cms" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <User className="h-3.5 w-3.5" /> Profile & Impact
        </button>
        <button
          onClick={() => setActiveTab("certificates")}
          className={`px-3 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === "certificates" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Award className="h-3.5 w-3.5 text-amber-500" /> Certificates ({certRules.length})
        </button>
        <button
          onClick={() => setActiveTab("volunteer_rules")}
          className={`px-3 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === "volunteer_rules" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Activity className="h-3.5 w-3.5 text-emerald-600" /> Volunteer Duty Rules
        </button>
        <button
          onClick={() => setActiveTab("browser_settings")}
          className={`px-3 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === "browser_settings" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Settings className="h-3.5 w-3.5 text-blue-600" /> Browser Settings
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={`px-3 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === "roles" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Key className="h-3.5 w-3.5" /> Roles ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("control_room")}
          className={`px-3 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === "control_room" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Server className="h-3.5 w-3.5" /> System ({versions.length})
        </button>
        <button
          onClick={() => setActiveTab("about_cms")}
          className={`px-3 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === "about_cms" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileText className="h-3.5 w-3.5" /> About CMS
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
                    {/* Visual Icon button */}
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentIconTarget({
                          type: "account",
                          id: item.id,
                          currentIcon: item.iconName
                        });
                        setIconPickerOpen(true);
                      }}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg hover:border-emerald-400 hover:text-emerald-700 shadow-2xs transition flex items-center gap-1 shrink-0"
                      title="Click to visually pick icon (कोई कोडिंग नहीं)"
                    >
                      {React.createElement(AVAILABLE_ICONS[item.iconName] || Settings, { className: "h-4 w-4 text-emerald-600" })}
                      <Pencil className="h-2.5 w-2.5 text-slate-400" />
                    </button>

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
                      {/* Deep settings configuration edit button */}
                      {item.id === "item-settings" && (
                        <button
                          type="button"
                          onClick={() => setEditingContentItem({
                            id: item.id,
                            title: item.title,
                            type: "account",
                            contentMarkdown: "",
                            settingsConfig: item.settingsConfig || {
                              defaultLanguage: "hi",
                              notificationsEnabled: true,
                              highContrastMode: false,
                              soundEffects: true
                            }
                          })}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-[10px] font-bold flex items-center gap-1"
                          title="Configure App Settings toggles (भाषा, सूचनाएं आदि)"
                        >
                          <Pencil className="h-3 w-3" /> Options
                        </button>
                      )}

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
                    Policy, Legal & Transparency Menu (विस्तृत सामग्री संपादक)
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
                    {/* Visual Icon button */}
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentIconTarget({
                          type: "legal",
                          id: item.id,
                          currentIcon: item.iconName
                        });
                        setIconPickerOpen(true);
                      }}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:text-blue-700 shadow-2xs transition flex items-center gap-1 shrink-0"
                      title="Click to visually pick icon (कोई कोडिंग नहीं)"
                    >
                      {React.createElement(AVAILABLE_ICONS[item.iconName] || FileText, { className: "h-4 w-4 text-blue-600" })}
                      <Pencil className="h-2.5 w-2.5 text-slate-400" />
                    </button>

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
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Deep full text content edit pencil */}
                      {item.id !== "logout" && (
                        <button
                          type="button"
                          onClick={() => setEditingContentItem({
                            id: item.id,
                            title: item.title,
                            type: "legal",
                            contentMarkdown: item.contentMarkdown || ""
                          })}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
                          title="Edit full policy content text / rules (अंदर का टेक्स्ट बदलें)"
                        >
                          <Pencil className="h-3 w-3" /> Edit Text
                        </button>
                      )}

                      <button
                        onClick={() => handleUpdateLegalItem(item.id, { active: !item.active })}
                        className={`p-1 rounded ${item.active ? "text-emerald-600 bg-emerald-50" : "text-slate-400 bg-slate-200"}`}
                        title={item.active ? "Active" : "Deactivated"}
                      >
                        {item.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                      <div className="flex items-center border border-slate-200 rounded overflow-hidden bg-slate-50">
                        <button
                          onClick={() => handleMoveLegalItem(profileConfig.legalItems.findIndex(l => l.id === item.id), "up")}
                          disabled={profileConfig.legalItems.findIndex(l => l.id === item.id) === 0}
                          className="p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-20 transition"
                          title="Move up"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleMoveLegalItem(profileConfig.legalItems.findIndex(l => l.id === item.id), "down")}
                          disabled={profileConfig.legalItems.findIndex(l => l.id === item.id) === profileConfig.legalItems.length - 1}
                          className="p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-20 transition"
                          title="Move down"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteLegalItem(item.id)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                        title="Delete item"
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

      {/* CERTIFICATES SYSTEM TAB */}
      {activeTab === "certificates" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-black text-slate-800">Certificates & Recognition Rules Command</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Configure recognition titles, eligibility thresholds (duty hours, reports, tasks), active/deactivate status, and reordering.
              </p>
            </div>
            <button
              onClick={handleAddCertRule}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition shadow-xs"
            >
              <Plus className="h-4 w-4" /> Add Certificate Award
            </button>
          </div>

          <div className="space-y-3">
            {certRules.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No certificate rules configured. Click &apos;Add Certificate Award&apos; to create one.</div>
            ) : (
              certRules.map((rule, idx) => (
                <div
                  key={rule.id}
                  className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    rule.active ? "bg-white border-slate-200 hover:border-amber-300 shadow-2xs" : "bg-slate-50 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold">
                      <Award className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="text"
                          value={rule.title}
                          onChange={e => handleUpdateCertRule(rule.id, { title: e.target.value })}
                          className="text-xs font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 hover:border-amber-500 focus:border-amber-500 px-1 py-0.5 focus:outline-hidden"
                          placeholder="Certificate Title (e.g. Jan Seva Mitra)"
                        />
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          rule.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-200 text-slate-600"
                        }`}>
                          {rule.active ? "Active Award" : "Deactivated"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                        <label className="flex items-center gap-1.5 font-semibold">
                          <Clock className="h-3.5 w-3.5 text-blue-500" />
                          <span>Min Hours:</span>
                          <input
                            type="number"
                            min="0"
                            value={rule.min_hours}
                            onChange={e => handleUpdateCertRule(rule.id, { min_hours: Number(e.target.value) })}
                            className="w-16 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-bold text-slate-700"
                          />
                        </label>
                        <label className="flex items-center gap-1.5 font-semibold">
                          <FileText className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Min Reports:</span>
                          <input
                            type="number"
                            min="0"
                            value={rule.min_reports}
                            onChange={e => handleUpdateCertRule(rule.id, { min_reports: Number(e.target.value) })}
                            className="w-16 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-bold text-slate-700"
                          />
                        </label>
                        <label className="flex items-center gap-1.5 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5 text-purple-500" />
                          <span>Min Tasks:</span>
                          <input
                            type="number"
                            min="0"
                            value={rule.min_tasks}
                            onChange={e => handleUpdateCertRule(rule.id, { min_tasks: Number(e.target.value) })}
                            className="w-16 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-bold text-slate-700"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleToggleCertRuleActive(rule)}
                      className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                        rule.active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      }`}
                      title={rule.active ? "Deactivate" : "Activate"}
                    >
                      {rule.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      <span className="hidden sm:inline">{rule.active ? "Active" : "Disabled"}</span>
                    </button>

                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        onClick={() => handleMoveCertRule(idx, "up")}
                        disabled={idx === 0}
                        className="p-1.5 text-slate-500 hover:bg-slate-200 disabled:opacity-20 transition"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveCertRule(idx, "down")}
                        disabled={idx === certRules.length - 1}
                        className="p-1.5 text-slate-500 hover:bg-slate-200 disabled:opacity-20 transition"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteCertRule(rule.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition"
                      title="Delete Certificate Rule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VOLUNTEER RULES & DUTY SETTINGS TAB */}
      {activeTab === "volunteer_rules" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600" />
              <h2 className="text-base font-black text-slate-800">Volunteer Duty & Activity Governance</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure session duration rules, daily limits, karma points multiplier formula, and report approval workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">Duty Hours & Limits</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Minimum Duty Session Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={volunteerRules.minimumDutyMinutes}
                  onChange={e => setVolunteerRules({ ...volunteerRules, minimumDutyMinutes: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">Sessions shorter than this are not counted toward certificate progress.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Maximum Duty Hours Allowed per Day
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={volunteerRules.maximumDutyHoursPerDay}
                  onChange={e => setVolunteerRules({ ...volunteerRules, maximumDutyHoursPerDay: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">Cap to prevent fatigue and unrealistic logs.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Seva Karma Points Formula (Points per completed hour)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={volunteerRules.karmaPointsPerHour}
                  onChange={e => setVolunteerRules({ ...volunteerRules, karmaPointsPerHour: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">Score multiplier credited upon verified completion.</p>
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">Verification & Policies</h3>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Auto-Approve Duty Reports</h4>
                  <p className="text-[11px] text-slate-500">Automatically accept volunteer field reports without manual HQ sign-off</p>
                </div>
                <button
                  type="button"
                  onClick={() => setVolunteerRules({ ...volunteerRules, autoApproveReports: !volunteerRules.autoApproveReports })}
                  className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                    volunteerRules.autoApproveReports
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  {volunteerRules.autoApproveReports ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  <span>{volunteerRules.autoApproveReports ? "Enabled" : "Disabled"}</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Require Live Geo-Fencing</h4>
                  <p className="text-[11px] text-slate-500">Capture and verify volunteer GPS coordinates during check-in / check-out</p>
                </div>
                <button
                  type="button"
                  onClick={() => setVolunteerRules({ ...volunteerRules, geoFencingEnabled: !volunteerRules.geoFencingEnabled })}
                  className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                    volunteerRules.geoFencingEnabled
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  {volunteerRules.geoFencingEnabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  <span>{volunteerRules.geoFencingEnabled ? "Enabled" : "Disabled"}</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Offline Duty Sync</h4>
                  <p className="text-[11px] text-slate-500">Allow volunteers in remote areas without signal to queue duty logs offline</p>
                </div>
                <button
                  type="button"
                  onClick={() => setVolunteerRules({ ...volunteerRules, allowOfflineSync: !volunteerRules.allowOfflineSync })}
                  className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                    volunteerRules.allowOfflineSync
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  {volunteerRules.allowOfflineSync ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  <span>{volunteerRules.allowOfflineSync ? "Enabled" : "Disabled"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BROWSER & CITIZEN APP SETTINGS TAB */}
      {activeTab === "browser_settings" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-black text-slate-800">In-App Browser & Citizen App Governance</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Global privacy toggles, browsing history retention, bookmarks feature flag, data-saver defaults, and external redirect policy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">Browser Privacy & History</h3>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Browsing History Storage</h4>
                  <p className="text-[11px] text-slate-500">Save visited portal links locally on citizen devices</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBrowserSettings({ ...browserSettings, historyEnabled: !browserSettings.historyEnabled })}
                  className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                    browserSettings.historyEnabled
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  {browserSettings.historyEnabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  <span>{browserSettings.historyEnabled ? "Enabled" : "Disabled"}</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  History Retention Window (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={browserSettings.historyRetentionDays}
                  onChange={e => setBrowserSettings({ ...browserSettings, historyRetentionDays: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">Auto-purge browser history older than this window.</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Bookmarks & Quick Favorites</h4>
                  <p className="text-[11px] text-slate-500">Allow citizens to star and bookmark frequently used portal services</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBrowserSettings({ ...browserSettings, bookmarksEnabled: !browserSettings.bookmarksEnabled })}
                  className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                    browserSettings.bookmarksEnabled
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  {browserSettings.bookmarksEnabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  <span>{browserSettings.bookmarksEnabled ? "Enabled" : "Disabled"}</span>
                </button>
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">Experience & Network Optimization</h3>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Data Saver Mode Default</h4>
                  <p className="text-[11px] text-slate-500">Compress imagery and disable auto-play media in poor signal regions</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBrowserSettings({ ...browserSettings, dataSaverDefault: !browserSettings.dataSaverDefault })}
                  className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                    browserSettings.dataSaverDefault
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  {browserSettings.dataSaverDefault ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  <span>{browserSettings.dataSaverDefault ? "Enabled" : "Disabled"}</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">External Browser Fallback</h4>
                  <p className="text-[11px] text-slate-500">Prompt users to open device browser (Chrome) for heavy third-party portals</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBrowserSettings({ ...browserSettings, allowExternalRedirect: !browserSettings.allowExternalRedirect })}
                  className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                    browserSettings.allowExternalRedirect
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  {browserSettings.allowExternalRedirect ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  <span>{browserSettings.allowExternalRedirect ? "Enabled" : "Disabled"}</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Safe Ad-Block Lite</h4>
                  <p className="text-[11px] text-slate-500">Suppress popups and tracker scripts inside citizen in-app browser</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBrowserSettings({ ...browserSettings, adBlockLite: !browserSettings.adBlockLite })}
                  className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                    browserSettings.adBlockLite
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  {browserSettings.adBlockLite ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  <span>{browserSettings.adBlockLite ? "Enabled" : "Disabled"}</span>
                </button>
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

      {/* REUSABLE VISUAL ICON PICKER MODAL */}
      <IconPickerModal
        isOpen={iconPickerOpen}
        onClose={() => {
          setIconPickerOpen(false);
          setCurrentIconTarget(null);
        }}
        selectedIcon={currentIconTarget?.currentIcon || ""}
        onSelectIcon={(newIconName) => {
          if (!currentIconTarget) return;
          if (currentIconTarget.type === "account") {
            handleUpdateAccountItem(currentIconTarget.id, { iconName: newIconName });
          } else if (currentIconTarget.type === "legal") {
            handleUpdateLegalItem(currentIconTarget.id, { iconName: newIconName });
          } else if (currentIconTarget.type === "metric") {
            handleUpdateMetric(currentIconTarget.id, { iconName: newIconName });
          }
          toast.success(`Icon updated to ${newIconName}`);
        }}
      />

      {/* DEEP CONTENT / SETTINGS EDITOR MODAL */}
      {editingContentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {editingContentItem.type === "account" ? "App Settings Controls" : `Edit Content: ${editingContentItem.title}`}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {editingContentItem.type === "account"
                    ? "Configure system defaults and user toggles."
                    : "Enter custom text, clauses, or guidance shown when user taps this modal."}
                </p>
              </div>
              <button
                onClick={() => setEditingContentItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {editingContentItem.type === "account" && editingContentItem.settingsConfig ? (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Default App Language</label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="defaultLang"
                          checked={editingContentItem.settingsConfig.defaultLanguage === "hi"}
                          onChange={() => setEditingContentItem({
                            ...editingContentItem,
                            settingsConfig: { ...editingContentItem.settingsConfig!, defaultLanguage: "hi" }
                          })}
                        />
                        हिंदी (Hindi Default)
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="defaultLang"
                          checked={editingContentItem.settingsConfig.defaultLanguage === "en"}
                          onChange={() => setEditingContentItem({
                            ...editingContentItem,
                            settingsConfig: { ...editingContentItem.settingsConfig!, defaultLanguage: "en" }
                          })}
                        />
                        English (English Default)
                      </label>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Feature Toggles</label>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-xs font-semibold cursor-pointer p-2 bg-white rounded-lg border border-slate-200">
                        <span>Push Notifications & Broadcast Alerts</span>
                        <input
                          type="checkbox"
                          checked={editingContentItem.settingsConfig.notificationsEnabled !== false}
                          onChange={(e) => setEditingContentItem({
                            ...editingContentItem,
                            settingsConfig: { ...editingContentItem.settingsConfig!, notificationsEnabled: e.target.checked }
                          })}
                          className="h-4 w-4 rounded text-emerald-600"
                        />
                      </label>
                      <label className="flex items-center justify-between text-xs font-semibold cursor-pointer p-2 bg-white rounded-lg border border-slate-200">
                        <span>High Contrast / Senior Accessibility Mode</span>
                        <input
                          type="checkbox"
                          checked={!!editingContentItem.settingsConfig.highContrastMode}
                          onChange={(e) => setEditingContentItem({
                            ...editingContentItem,
                            settingsConfig: { ...editingContentItem.settingsConfig!, highContrastMode: e.target.checked }
                          })}
                          className="h-4 w-4 rounded text-emerald-600"
                        />
                      </label>
                      <label className="flex items-center justify-between text-xs font-semibold cursor-pointer p-2 bg-white rounded-lg border border-slate-200">
                        <span>Sound & Haptic Feedback</span>
                        <input
                          type="checkbox"
                          checked={editingContentItem.settingsConfig.soundEffects !== false}
                          onChange={(e) => setEditingContentItem({
                            ...editingContentItem,
                            settingsConfig: { ...editingContentItem.settingsConfig!, soundEffects: e.target.checked }
                          })}
                          className="h-4 w-4 rounded text-emerald-600"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Full Policy Body (Markdown / Plain Text)</label>
                  <textarea
                    rows={12}
                    value={editingContentItem.contentMarkdown}
                    onChange={(e) => setEditingContentItem({
                      ...editingContentItem,
                      contentMarkdown: e.target.value
                    })}
                    placeholder="Enter custom policy terms, clauses, support lines, or disclaimers here..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed font-sans text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Leaving this empty will keep the default verified institutional text.
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingContentItem(null)}
                className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingContentItem.type === "account") {
                    handleUpdateAccountItem(editingContentItem.id, {
                      settingsConfig: editingContentItem.settingsConfig
                    });
                  } else {
                    handleUpdateLegalItem(editingContentItem.id, {
                      contentMarkdown: editingContentItem.contentMarkdown
                    });
                  }
                  toast.success("Content saved. Remember to click 'Save & Publish Live'!");
                  setEditingContentItem(null);
                }}
                className="px-5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-xs"
              >
                Apply Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
