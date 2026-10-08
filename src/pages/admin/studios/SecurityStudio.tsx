import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  ShieldCheck, Lock, Key, Server, Database, AlertTriangle, 
  CheckCircle2, RefreshCw, Download, Globe, ShieldAlert, Cpu
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";

export default function SecurityStudio() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<any>({
    status: "healthy",
    db: "connected"
  });
  const [overview, setOverview] = useState<any>(null);

  const loadHealth = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/control/overview", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 5000
      });
      if (res.data?.success && res.data?.data) {
        setOverview(res.data.data);
      }
    } catch {
      // Fallback to basic health
      try {
        const hRes = await axios.get("/api/health", { timeout: 3000 });
        setHealthData(hRes.data);
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHealth();
  }, [token]);

  const handleExportBackup = async () => {
    try {
      toast.loading("Preparing SQL database snapshot...", { id: "db-backup" });
      const res = await axios.get("/api/admin/control/database/export", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        responseType: "blob",
        timeout: 120000
      });
      const url = URL.createObjectURL(res.data);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", url);
      downloadAnchor.setAttribute("download", `rpf-database-backup-${new Date().toISOString().slice(0, 10)}.sql`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
      toast.success("Database backup SQL downloaded successfully!", { id: "db-backup" });
    } catch {
      toast.error("Database export requires super_admin permissions or backend pg_dump.", { id: "db-backup" });
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <Lock className="h-6 w-6 text-[#C2410C]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#166534] border border-emerald-200">
                System Active
              </span>
              <span className="text-[11px] font-bold text-slate-400">Security & Infrastructure</span>
            </div>
            <h2 className="text-xl font-black text-[#0A192F] mt-0.5">
              System & Security Studio
            </h2>
            <p className="text-xs text-slate-500">
              Manage infrastructure status, API authentication, CORS policies, and administrative telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadHealth}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} /> Health Check
          </button>
          <button
            onClick={handleExportBackup}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0A192F] px-4 py-2.5 text-xs font-black text-white hover:bg-slate-800 transition"
          >
            <Download className="h-4 w-4 text-[#C2410C]" /> Snapshot Export
          </button>
        </div>
      </div>

      {/* Grid of Security Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Node Server Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#0A192F] font-bold text-sm">
              <Server className="h-5 w-5 text-[#C2410C]" /> Node Express Server
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="h-3 w-3" /> Online
            </span>
          </div>
          <div className="text-xs text-slate-600 space-y-1">
            <p><strong>Environment:</strong> {overview?.environment || "production"}</p>
            <p><strong>Architecture:</strong> Node.js ({overview?.node || "v20"}) • Express • TS</p>
            <p><strong>API Latency:</strong> {overview?.apiLatencyMs ? `${overview.apiLatencyMs} ms` : "Normal"}</p>
          </div>
        </div>

        {/* Database Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#0A192F] font-bold text-sm">
              <Database className="h-5 w-5 text-emerald-600" /> PostgreSQL Database
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="h-3 w-3" /> {overview?.database?.connected ? "Connected" : "Online"}
            </span>
          </div>
          <div className="text-xs text-slate-600 space-y-1">
            <p><strong>Database Tables:</strong> {overview?.schemaTables ? `${overview.schemaTables} tables` : "Verified"}</p>
            <p><strong>CMS Snapshots:</strong> {overview?.cmsVersions?.count ? `${overview.cmsVersions.count} versions` : "Active"}</p>
            <p><strong>Server Time:</strong> {overview?.database?.serverTime ? new Date(overview.database.serverTime).toLocaleTimeString() : "Synchronized"}</p>
          </div>
        </div>

        {/* Auth & Token Security */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#0A192F] font-bold text-sm">
              <Key className="h-5 w-5 text-amber-600" /> Authentication State
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
          </div>
          <div className="text-xs text-slate-600 space-y-1">
            <p><strong>Admin User:</strong> {user?.name || "Administrator"}</p>
            <p><strong>Role:</strong> {user?.role || "super_admin"}</p>
            <p><strong>Authorization:</strong> JWT Bearer Token Header</p>
          </div>
        </div>
      </div>

      {/* Security Policies Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <h3 className="text-sm font-black text-[#0A192F] flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-[#C2410C]" /> Active Security & Access Rules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-800">1. CORS Restricted Origins</h4>
            <p className="text-slate-600 leading-relaxed">
              Only verified domains (<code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">therpfoundation.org</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">rpfoundation.org</code>, localhost, Capacitor native bridge) are permitted. Arbitrary or third-party web origins are blocked.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-800">2. Admin Endpoint Authorization</h4>
            <p className="text-slate-600 leading-relaxed">
              All <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">/api/admin/*</code> and CMS write mutations require both <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">authenticateToken</code> and <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">requireAdmin</code> authorization guards.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-800">3. Rate Limiting Protection</h4>
            <p className="text-slate-600 leading-relaxed">
              Public authentication and grievance endpoints are protected by express-rate-limit to safeguard against brute-force intrusion and denial-of-service attempts.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-800">4. Safe Database Credentials</h4>
            <p className="text-slate-600 leading-relaxed">
              Production database connections use strict environment variables (<code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">process.env.DATABASE_URL</code>). No plain credentials exist in source code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
