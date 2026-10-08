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
  Server
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";

type SubTab = "roles" | "control_room" | "about_cms";

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
  const [activeTab, setActiveTab] = useState<SubTab>("roles");
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);

  // 1. Roles & Access State
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  // 2. Control Room State (Legacy Supreme Admin)
  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [versions, setVersions] = useState<CmsVersion[]>([]);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [rollbackId, setRollbackId] = useState<number | null>(null);

  // 3. Foundation About CMS State
  const [aboutDraft, setAboutDraft] = useState("");
  const [aboutDirty, setAboutDirty] = useState(false);

  const authHeader = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  // Load all data
  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = authHeader();

      const [usersRes, overviewRes, versionsRes, flagsRes, cmsRes] = await Promise.allSettled([
        axios.get("/api/admin/users", { headers, timeout: 8000 }),
        axios.get("/api/admin/control/overview", { headers, timeout: 8000 }),
        axios.get("/api/admin/control/cms/versions", { headers, timeout: 8000 }),
        axios.get("/api/admin/control/feature-flags", { headers, timeout: 8000 }),
        axios.get("/api/cms", { timeout: 8000 }),
      ]);

      if (usersRes.status === "fulfilled" && usersRes.value.data?.data) {
        setUsers(usersRes.value.data.data);
      }
      if (overviewRes.status === "fulfilled" && overviewRes.value.data?.data) {
        setOverview(overviewRes.value.data.data);
      }
      if (versionsRes.status === "fulfilled" && versionsRes.value.data?.data) {
        setVersions(versionsRes.value.data.data);
      }
      if (flagsRes.status === "fulfilled" && flagsRes.value.data?.data) {
        setFlags(flagsRes.value.data.data);
      }
      if (cmsRes.status === "fulfilled") {
        const cms = cmsRes.value.data?.cms || cmsRes.value.data?.data || {};
        const txt = cms.aboutText || cms.aboutTextHi || cms.aboutTextEn || "";
        setAboutDraft(txt);
        setAboutDirty(false);
      }
    } catch {
      toast.error("Failed to refresh administration controls");
    } finally {
      setLoading(false);
    }
  }, [token, authHeader]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Role upgrade/downgrade handler
  const handleUpdateRole = async (targetUserId: string | number, newRole: string) => {
    setActionBusy(true);
    const toastId = toast.loading(`Updating security role to ${newRole.toUpperCase()}...`);
    try {
      const res = await axios.put(
        `/api/admin/users/${targetUserId}`,
        { role: newRole },
        { headers: authHeader() }
      );
      if (res.data?.success === false) throw new Error(res.data?.error || "Failed");

      toast.success(`User role updated to ${newRole.toUpperCase()}!`, { id: toastId });
      setUsers(prev => prev.map(u => (u.id === targetUserId ? { ...u, role: newRole } : u)));
      if (selectedUser?.id === targetUserId) {
        setSelectedUser(prev => prev ? { ...prev, role: newRole } : null);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to update role", { id: toastId });
    } finally {
      setActionBusy(false);
    }
  };

  // Feature Flag toggle handler
  const handleToggleFlag = async (flag: FeatureFlag) => {
    const nextEnabled = !flag.enabled;
    const toastId = toast.loading(`Toggling ${flag.key}...`);
    try {
      const res = await axios.put(
        `/api/admin/control/feature-flags/${encodeURIComponent(flag.key)}`,
        { enabled: nextEnabled, description: flag.description },
        { headers: authHeader() }
      );
      if (res.data?.success === false) throw new Error(res.data?.error || "Flag toggle failed");
      toast.success(`Flag ${flag.key} is now ${nextEnabled ? "ENABLED" : "DISABLED"}`, { id: toastId });
      setFlags(prev => prev.map(f => (f.key === flag.key ? { ...f, enabled: nextEnabled } : f)));
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to toggle flag", { id: toastId });
    }
  };

  // CMS Rollback handler
  const handleRollback = async (version: CmsVersion) => {
    if (!window.confirm(`Rollback entire live CMS state to Version #${version.id} (${version.label})?\n\nA backup of the current state will be created automatically first.`)) {
      return;
    }
    setRollbackId(version.id);
    const toastId = toast.loading(`Rolling back to version #${version.id}...`);
    try {
      const res = await axios.post(
        `/api/admin/control/cms/rollback/${version.id}`,
        {},
        { headers: authHeader() }
      );
      if (res.data?.success === false) throw new Error(res.data?.error || "Rollback failed");
      toast.success(`CMS state restored to #${version.id}!`, { id: toastId });
      await loadData();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Unable to rollback CMS", { id: toastId });
    } finally {
      setRollbackId(null);
    }
  };

  // Database Backup Download handler
  const handleExportDatabase = async () => {
    setActionBusy(true);
    const toastId = toast.loading("Executing full pg_dump PostgreSQL backup stream...");
    try {
      const response = await axios.get("/api/admin/control/database/export", {
        headers: authHeader(),
        responseType: "blob",
        timeout: 60000,
      });
      const blob = new Blob([response.data], { type: "application/sql;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `rpf_full_backup_${Date.now()}.sql`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Database backup SQL downloaded successfully!", { id: toastId });
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Database export failed (pg_dump unavailable or restricted).", { id: toastId });
    } finally {
      setActionBusy(false);
    }
  };

  // Save Foundation About CMS
  const handleSaveAbout = async () => {
    if (!aboutDirty) return;
    setActionBusy(true);
    const toastId = toast.loading("Publishing Foundation About Vision statement...");
    try {
      const patch = {
        aboutText: aboutDraft,
        aboutTextEn: aboutDraft,
        aboutTextHi: aboutDraft,
      };
      const res = await axios.post(
        "/api/admin/control/cms/publish",
        { patch, label: "ProfileStudio: updated unified about text" },
        { headers: authHeader() }
      );
      if (res.data?.success === false) throw new Error("Save failed");
      toast.success("About & Mission updated across live platforms!", { id: toastId });
      setAboutDirty(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Save failed", { id: toastId });
    } finally {
      setActionBusy(false);
    }
  };

  // User list filter
  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q)
    );
  });

  const isSuperAdmin = user?.role === "super_admin" || user?.role === "superadmin";

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 space-y-6">
      {/* HEADER MATCHING SUPREME CONTROL ROOM DESIGN */}
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
              <span className="text-xs text-slate-400">Security & Infrastructure Governance</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 mt-1">Profile, Roles & System Control Room</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage administrator privileges, immutable snapshot rollbacks, feature flags and server backups.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => void loadData()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh State
          </button>
        </div>
      </div>

      {/* THREE MAIN COMMAND TABS */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
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
          <Server className="h-4 w-4" /> Infrastructure & Rollbacks ({versions.length} Snapshots)
        </button>
        <button
          onClick={() => setActiveTab("about_cms")}
          className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 ${
            activeTab === "about_cms" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileText className="h-4 w-4" /> Foundation Vision & About CMS
        </button>
      </div>

      {/* 1. ROLES & PERMISSIONS TAB */}
      {activeTab === "roles" && (
        <div className="flex flex-col lg:flex-row gap-6 h-[72vh] animate-fade-in">
          {/* Left User List */}
          <div className="w-full lg:w-5/12 xl:w-5/12 flex flex-col space-y-3">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search accounts by name, email or phone..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredUsers.map(u => {
                const isSelected = selectedUser?.id === u.id;
                const isAdmin = u.role === "admin" || u.role === "super_admin" || u.role === "superadmin";
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`bg-white p-3 rounded-xl border transition-all cursor-pointer hover:border-slate-300 ${
                      isSelected ? "border-purple-500 ring-1 ring-purple-500 shadow-xs" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${isAdmin ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"}`}>
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{u.name || u.username || "Unnamed User"}</h4>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isAdmin ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-slate-100 text-slate-600"
                          }`}>
                            {u.role || "User"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{u.email || u.phone || "No contact info"}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Role Management Inspector */}
          <div className="hidden lg:flex flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-col">
            {selectedUser ? (
              <div className="p-6 h-full flex flex-col justify-between overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-purple-50 text-purple-700">
                        <Key className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-700">Account Privilege Authority</span>
                        <h2 className="text-lg font-black text-slate-800">{selectedUser.name || selectedUser.username}</h2>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                      ID: #{selectedUser.id}
                    </span>
                  </div>

                  {/* Account Information Details */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">Email Address</p>
                      <p className="text-xs font-semibold text-slate-800">{selectedUser.email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">Phone Number</p>
                      <p className="text-xs font-semibold text-slate-800">{selectedUser.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">Account Type</p>
                      <p className="text-xs font-semibold text-slate-800">
                        {selectedUser.isVolunteer ? "Volunteer + Member" : "Standard User"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">Registration Date</p>
                      <p className="text-xs font-semibold text-slate-800">
                        {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Role Assignment Buttons */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase">Change Privilege Level</p>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => handleUpdateRole(selectedUser.id, "user")}
                        disabled={actionBusy || selectedUser.role === "user"}
                        className={`p-3 rounded-xl border text-left transition ${
                          selectedUser.role === "user"
                            ? "border-slate-800 bg-slate-900 text-white shadow-xs font-bold"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <User className="h-4 w-4 mb-2" />
                        <p className="text-xs font-bold">Standard User</p>
                        <p className="text-[10px] opacity-70">App view & services</p>
                      </button>

                      <button
                        onClick={() => handleUpdateRole(selectedUser.id, "admin")}
                        disabled={actionBusy || selectedUser.role === "admin"}
                        className={`p-3 rounded-xl border text-left transition ${
                          selectedUser.role === "admin"
                            ? "border-purple-600 bg-purple-600 text-white shadow-xs font-bold"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Shield className="h-4 w-4 mb-2" />
                        <p className="text-xs font-bold">Administrator</p>
                        <p className="text-[10px] opacity-70">Studio command center</p>
                      </button>

                      <button
                        onClick={() => handleUpdateRole(selectedUser.id, "super_admin")}
                        disabled={actionBusy || !isSuperAdmin || selectedUser.role === "super_admin"}
                        className={`p-3 rounded-xl border text-left transition ${
                          selectedUser.role === "super_admin" || selectedUser.role === "superadmin"
                            ? "border-amber-600 bg-amber-600 text-white shadow-xs font-bold"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        }`}
                      >
                        <ShieldCheck className="h-4 w-4 mb-2" />
                        <p className="text-xs font-bold">Super Admin</p>
                        <p className="text-[10px] opacity-70">Database & system flags</p>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 text-xs text-slate-400">
                  Role assignments immediately reconfigure live route guard permissions on next user action.
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50">
                <div className="h-16 w-16 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4 shadow-xs border border-purple-100">
                  <Key className="h-8 w-8" />
                </div>
                <h2 className="text-lg font-black text-slate-800">Select an Account to Manage Permissions</h2>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Upgrade trusted coordinators to Administrators or revoke elevated command access.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. INFRASTRUCTURE, ROLLBACKS & BACKUPS TAB (RESTORED FROM LEGACY SUPREME CONTROL) */}
      {activeTab === "control_room" && (
        <div className="space-y-6 animate-fade-in">
          {/* Diagnostic Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <Activity className="h-4 w-4" />
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Healthy</span>
              </div>
              <p className="text-[10px] font-bold uppercase text-slate-400">System Telemetry</p>
              <p className="text-lg font-black text-slate-800">{overview ? `${overview.apiLatencyMs} ms Latency` : "Online"}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <Database className="h-4 w-4" />
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Connected</span>
              </div>
              <p className="text-[10px] font-bold uppercase text-slate-400">PostgreSQL Schema</p>
              <p className="text-lg font-black text-slate-800">{overview?.schemaTables ?? 42} Relational Tables</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <History className="h-4 w-4" />
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Immutable</span>
              </div>
              <p className="text-[10px] font-bold uppercase text-slate-400">CMS Snapshots</p>
              <p className="text-lg font-black text-slate-800">{versions.length} Snapshots Saved</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <ToggleRight className="h-4 w-4" />
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Controlled</span>
              </div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Feature Switches</p>
              <p className="text-lg font-black text-slate-800">{flags.filter(f => f.enabled).length}/{flags.length} Active</p>
            </div>
          </div>

          {/* Split Pane: Version History & Feature Switches */}
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            {/* Version History & One-Click Rollback */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-800">Configuration Version History</h3>
                  <p className="text-xs text-slate-500">
                    Snapshots are SHA-256 checksum-protected. Rollback restores full live CMS state safely.
                  </p>
                </div>
                <ArchiveRestore className="h-5 w-5 text-indigo-600" />
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                {versions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">No snapshot versions found.</p>
                ) : (
                  versions.map(v => (
                    <div key={v.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 transition">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800">#{v.id} • {v.label}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(v.created_at).toLocaleString()} • {v.field_count ?? 0} fields
                        </p>
                        <p className="text-[9px] font-mono text-slate-400 truncate max-w-[280px]">{v.checksum}</p>
                      </div>
                      <button
                        onClick={() => void handleRollback(v)}
                        disabled={rollbackId !== null}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition disabled:opacity-40"
                      >
                        <RotateCcw className="h-3 w-3" /> {rollbackId === v.id ? "Restoring..." : "Rollback"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Feature Flags */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-800">Feature Switches</h3>
                  <p className="text-xs text-slate-500">Toggle runtime modules across the mobile & web app.</p>
                </div>
                <ToggleLeft className="h-5 w-5 text-purple-600" />
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                {flags.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">No runtime feature flags registered.</p>
                ) : (
                  flags.map(f => (
                    <button
                      key={f.key}
                      onClick={() => void handleToggleFlag(f)}
                      className="flex w-full items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 transition text-left"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800">{f.key}</p>
                        <p className="text-[10px] text-slate-500">{f.description || "Runtime toggle flag"}</p>
                      </div>
                      {f.enabled ? (
                        <ToggleRight className="h-6 w-6 text-emerald-600 shrink-0" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-slate-400 shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Database Backup Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-rose-600" />
                <h3 className="text-sm font-black text-slate-800">Database Protection & Full Export</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Execute a pg_dump transaction to export the entire production relational database as an SQL dump. Requires Super Admin authority.
              </p>
            </div>
            <button
              onClick={handleExportDatabase}
              disabled={actionBusy}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> {actionBusy ? "Exporting Backup..." : "Download SQL Backup"}
            </button>
          </div>
        </div>
      )}

      {/* 3. FOUNDATION VISION & ABOUT CMS TAB */}
      {activeTab === "about_cms" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-800">Foundation Vision & About Statement</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official mission and foundation background displayed across public information portals.
              </p>
            </div>
            <button
              onClick={handleSaveAbout}
              disabled={actionBusy || !aboutDirty}
              className="inline-flex items-center gap-1.5 px-6 py-2 text-xs font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 shadow-xs"
            >
              {actionBusy ? "Publishing..." : "Save & Publish"}
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">About & Vision Statement</label>
            <textarea
              rows={12}
              value={aboutDraft}
              onChange={e => {
                setAboutDraft(e.target.value);
                setAboutDirty(true);
              }}
              placeholder="Enter official foundation summary, community welfare goals, and registered charity details..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 focus:ring-2 focus:ring-purple-500 leading-relaxed custom-scrollbar font-medium"
            />
          </div>
        </div>
      )}
    </div>
  );
}
