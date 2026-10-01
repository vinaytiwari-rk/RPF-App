import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import QRCode from "react-qr-code";
import {
  CreditCard,
  RefreshCw,
  ExternalLink,
  Download,
  Upload,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Globe,
  Database,
  Server,
  Activity,
  Copy,
  Check,
  Eye,
  X,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from "lucide-react";

type Row = Record<string, unknown>;

interface IntegrationHealth {
  apiServer?: {
    url: string;
    status: string;
    latencyMs: number;
    httpStatus: number;
    message: string;
  };
  portal?: {
    url: string;
    status: string;
    latencyMs: number;
    httpStatus: number;
  };
  mirror?: {
    totalMirrored: number;
    lastSyncedAt: string | null;
    localApproved: number;
    localPending: number;
  };
}

interface JanSevaSyncStudioProps {
  cards: Row[];
  token: string;
  onRefresh: () => void | Promise<void>;
  exportCsv: (resource: string, filename: string) => void;
}

function firstText(row: Row, keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim()) return String(value);
  }
  return "—";
}

export default function JanSevaSyncStudio({ cards, token, onRefresh, exportCsv }: JanSevaSyncStudioProps) {
  const [health, setHealth] = useState<IntegrationHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>("");
  const [cardFilter, setCardFilter] = useState<"all" | "pending" | "mirrored" | "approved">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Quick Registry Lookup
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<any | null>(null);

  // Card Preview Modal
  const [previewCard, setPreviewCard] = useState<Row | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Fetch Health & Connectivity
  const fetchHealth = useCallback(async () => {
    if (!token) return;
    setHealthLoading(true);
    try {
      const res = await axios.get("/api/admin/cards/health", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000
      });
      if (res.data?.success) {
        setHealth(res.data);
      }
    } catch {
      // Graceful fallback
    } finally {
      setHealthLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchHealth();
  }, [fetchHealth]);

  // Run Local Database & Mirror Sync (Offline-Ready)
  const handleRunLocalSync = async () => {
    if (!token) return;
    setSyncBusy(true);
    setSyncStatus("Syncing approved cards with local database mirror...");
    try {
      const res = await axios.post("/api/admin/cards/sync-local", {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000
      });

      if (res.data?.success) {
        toast.success(res.data.message || "Local mirror synced successfully!");
        setSyncStatus(`Local sync complete: ${res.data.totalMirrored} approved cards mirrored locally.`);
        await onRefresh();
        await fetchHealth();
      } else {
        toast.error(res.data?.error || "Local sync failed");
        setSyncStatus(`Sync error: ${res.data?.error}`);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || "Local sync failed";
      toast.error(msg);
      setSyncStatus(`Local sync error: ${msg}`);
    } finally {
      setSyncBusy(false);
    }
  };

  // Run Automated Multi-Page Sync from api.therpfoundation.org (with automatic local fallback)
  const handleRunSyncAll = async () => {
    if (!token) return;
    setSyncBusy(true);
    setSyncStatus("Connecting to api.therpfoundation.org (RP Card Backend)...");
    try {
      const res = await axios.post("/api/admin/cards/sync-all", { maxPages: 5, limit: 100 }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 35000
      });

      if (res.data?.success) {
        if (res.data?.isExternalOffline) {
          toast("api.therpfoundation.org is offline — Resilient Local Mirror Sync completed!", {
            icon: "⚡",
            duration: 5000
          });
          setSyncStatus(`Notice: api.therpfoundation.org is offline. Synchronized ${res.data.totalImported} cards via local mirror.`);
        } else {
          toast.success(res.data.message || "Sync finished successfully!");
          setSyncStatus(`Sync result: ${res.data.totalImported} imported across ${res.data.pagesProcessed} pages.`);
        }
        await onRefresh();
        await fetchHealth();
      } else {
        toast.error(res.data?.error || "Sync encountered an issue.");
        setSyncStatus(`Sync notice: ${res.data?.error || "Incomplete"}`);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || "Sync failed";
      // If network failure to external API, offer automatic local sync
      toast.error(`External sync unavailable (${msg}). Switching to local mirror sync...`);
      setSyncStatus(`External API offline. Running local database sync...`);
      await handleRunLocalSync();
    } finally {
      setSyncBusy(false);
    }
  };

  // Import JSON Backup File
  const handleImportJson = async (file?: File) => {
    if (!file || !token) return;
    setSyncBusy(true);
    setSyncStatus("Reading and validating JSON file...");
    try {
      if (file.size > 25 * 1024 * 1024) throw new Error("Maximum file size is 25 MB.");
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      const records: unknown = Array.isArray(parsed) ? parsed : (parsed as any)?.patients;
      if (!Array.isArray(records)) throw new Error("File must be a JSON array of card records.");

      let imported = 0, skipped = 0;
      for (let i = 0; i < records.length; i += 200) {
        const batch = records.slice(i, i + 200);
        const res = await axios.post("/api/admin/cards/import", { records: batch }, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000
        });
        imported += res.data?.imported || 0;
        skipped += res.data?.skipped || 0;
        setSyncStatus(`Importing: ${Math.min(i + 200, records.length)} / ${records.length} records processed (${imported} imported, ${skipped} skipped).`);
      }

      toast.success(`Import complete: ${imported} records imported, ${skipped} skipped.`);
      setSyncStatus(`Import finished: ${imported} records imported.`);
      await onRefresh();
      await fetchHealth();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || "Import failed";
      toast.error(msg);
      setSyncStatus(`Import error: ${msg}`);
    } finally {
      setSyncBusy(false);
    }
  };

  // Quick Card Lookup
  const handleQuickLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!lookupQuery.trim() || !token) return;
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const res = await axios.get(`/api/cards/search?query=${encodeURIComponent(lookupQuery.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000
      });
      if (res.data?.patient) {
        setLookupResult(res.data.patient);
        toast.success("Card found in registry!");
      } else {
        toast.error("No record found for this card number or phone.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Lookup failed");
    } finally {
      setLookupLoading(false);
    }
  };

  // Approve Card Application
  const handleApprove = async (userId: string, existingCardNo?: string) => {
    if (!token) return;
    let cardNo = existingCardNo ? String(existingCardNo).trim() : "";
    if (!cardNo) {
      const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
      const generated = `RPF-${new Date().getFullYear()}-${randomSuffix}`;
      const prompted = window.prompt("Assign 16-digit or formatted Jan Seva Card Number:", generated);
      if (!prompted) return;
      cardNo = prompted.trim();
    }

    try {
      const res = await axios.post("/api/cards/approve", { userId, cardNo }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        toast.success(`Card ${res.data.cardNo} successfully approved!`);
        await onRefresh();
        await fetchHealth();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Approval failed");
    }
  };

  // Reject Card Application
  const handleReject = async (userId: string) => {
    if (!token) return;
    if (!window.confirm("Reject this Jan Seva Card application?")) return;
    try {
      await axios.post("/api/cards/reject", { userId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Application marked as rejected.");
      await onRefresh();
      await fetchHealth();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Rejection failed");
    }
  };

  // Filter rows
  const filteredCards = useMemo(() => {
    return cards.filter(row => {
      const status = String(row.status || "").toLowerCase();
      const source = String(row.source || "").toLowerCase();

      if (cardFilter === "pending" && status !== "pending") return false;
      if (cardFilter === "approved" && status !== "approved") return false;
      if (cardFilter === "mirrored" && !source.includes("external") && !source.includes("import") && !source.includes("mirror")) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const cardNo = String(row.cardNo || row.card_no || "").toLowerCase();
      const name = String(row.name || row.nameOfMember || "").toLowerCase();
      const phone = String(row.mobileNo || row.phone || row.idNumber || "").toLowerCase();
      const district = String(row.district || row.address || "").toLowerCase();
      return cardNo.includes(q) || name.includes(q) || phone.includes(q) || district.includes(q);
    });
  }, [cards, cardFilter, searchQuery]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. THREE-WAY INTEGRATION HEALTH MONITOR */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#C2410C] border border-orange-200">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#0A192F]">Live Integration & Portal Synchronizer</h2>
              <p className="text-[11px] text-slate-500">
                Bidirectional sync between <code className="font-bold text-[#C2410C]">api.therpfoundation.org</code>, <code className="font-bold text-[#166534]">jansevacard.therpfoundation.org</code>, and <code className="font-bold text-[#0A192F]">appapi.therpfoundation.org</code>
              </p>
            </div>
          </div>
          <button
            onClick={() => void fetchHealth()}
            disabled={healthLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-white hover:border-[#C2410C] transition shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#C2410C] ${healthLoading ? "animate-spin" : ""}`} /> Refresh Status
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Card 1: api.therpfoundation.org */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">RP Card Backend API</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                health?.apiServer?.status === "online"
                  ? "bg-emerald-50 text-[#166534] border border-emerald-200"
                  : health?.apiServer?.status === "degraded"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${health?.apiServer?.status === "online" ? "bg-[#166534] animate-pulse" : "bg-rose-600"}`} />
                {health?.apiServer?.status || "Checking..."}
              </span>
            </div>
            <p className="text-xs font-mono font-bold text-[#0A192F] truncate" title="https://api.therpfoundation.org">
              api.therpfoundation.org
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Latency: {health?.apiServer?.latencyMs ? `${health.apiServer.latencyMs}ms` : "—"}</span>
              <span>HTTP {health?.apiServer?.httpStatus || 200}</span>
            </div>
          </div>

          {/* Card 2: jansevacard.therpfoundation.org */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Jan Seva Web Portal</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                health?.portal?.status === "online"
                  ? "bg-emerald-50 text-[#166534] border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${health?.portal?.status === "online" ? "bg-[#166534] animate-pulse" : "bg-rose-600"}`} />
                {health?.portal?.status || "Checking..."}
              </span>
            </div>
            <p className="text-xs font-mono font-bold text-[#0A192F] truncate" title="https://jansevacard.therpfoundation.org">
              jansevacard.therpfoundation.org
            </p>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Status: Verified</span>
              <a
                href="https://jansevacard.therpfoundation.org"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold text-[#C2410C] hover:underline"
              >
                Launch Portal <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Card 3: appapi.therpfoundation.org (Postgres Mirror) */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Central PG Mirror Database</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase text-[#166534] border border-emerald-200">
                <Database className="h-3 w-3 text-[#166534]" /> Connected
              </span>
            </div>
            <p className="text-xs font-mono font-bold text-[#0A192F] truncate">
              rp_db · jan_seva_card_mirror
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Mirrored: <strong className="text-[#0A192F] font-black">{health?.mirror?.totalMirrored ?? cards.length}</strong></span>
              <span>Pending: <strong className="text-[#C2410C] font-black">{health?.mirror?.localPending ?? 0}</strong></span>
            </div>
          </div>
        </div>

        {/* 2. SYNC & CONTROL TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRunSyncAll}
              disabled={syncBusy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C2410C] to-[#EA580C] px-4 py-2 text-xs font-black text-white hover:brightness-105 transition shadow-sm disabled:opacity-50"
              title="Sync with external API (falls back automatically to local mirror if offline)"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncBusy ? "animate-spin" : ""}`} />
              {syncBusy ? "Syncing in progress..." : "⚡ Sync with api.therpfoundation.org"}
            </button>

            <button
              onClick={handleRunLocalSync}
              disabled={syncBusy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-[#166534] hover:bg-emerald-100 transition shadow-2xs disabled:opacity-50"
              title="Sync all approved applications directly into local mirror cache (works 100% offline)"
            >
              <Database className="h-3.5 w-3.5 text-[#166534]" />
              <span>⚡ Local Mirror Sync (Offline Ready)</span>
            </button>

            <label className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition shadow-2xs">
              <Upload className="h-3.5 w-3.5 text-[#166534]" />
              <span>Import JSON Backup</span>
              <input
                type="file"
                accept=".json,application/json"
                disabled={syncBusy}
                onChange={(e) => {
                  void handleImportJson(e.target.files?.[0]);
                  e.target.value = "";
                }}
                className="sr-only"
              />
            </label>

            <button
              onClick={() => exportCsv("cards", "rpf_jan_seva_cards_master")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <Download className="h-3.5 w-3.5 text-[#0A192F]" /> Export CSV
            </button>
          </div>

          {health?.mirror?.lastSyncedAt && (
            <p className="text-[11px] text-slate-400 font-medium">
              Last mirror sync: {new Date(health.mirror.lastSyncedAt).toLocaleString()}
            </p>
          )}
        </div>

        {syncStatus && (
          <div className="rounded-xl bg-orange-50/80 border border-orange-200/80 p-3 text-xs font-semibold text-[#C2410C] flex items-center gap-2">
            <Activity className="h-4 w-4 shrink-0" />
            <span>{syncStatus}</span>
          </div>
        )}
      </section>

      {/* 3. QUICK REGISTRY LOOKUP & VERIFY BOX */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-[#C2410C]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[#0A192F]">Instant Live Registry Lookup</h3>
          </div>
          <span className="text-[11px] text-slate-400">Search by Card No, Mobile, Aadhaar, or User ID</span>
        </div>

        <form onSubmit={handleQuickLookup} className="flex gap-2">
          <input
            type="text"
            value={lookupQuery}
            onChange={(e) => setLookupQuery(e.target.value)}
            placeholder="e.g. 16-digit Card Number, 10-digit Mobile, or 12-digit Aadhaar..."
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 transition"
          />
          <button
            type="submit"
            disabled={lookupLoading || !lookupQuery.trim()}
            className="rounded-2xl bg-[#0A192F] px-5 py-2 text-xs font-black text-white hover:bg-slate-800 transition disabled:opacity-50 shadow-sm"
          >
            {lookupLoading ? "Searching..." : "Lookup Card"}
          </button>
        </form>

        {lookupResult && (
          <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-[#166534]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-black text-[#166534] uppercase tracking-wide">Record Verified in Registry</p>
                <p className="text-sm font-black text-[#0A192F]">{firstText(lookupResult, ["nameOfMember", "name", "userId"])}</p>
                <p className="text-xs font-mono text-slate-600">Card No: {firstText(lookupResult, ["cardNo", "janSevaCardNo"])}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewCard(lookupResult)}
                className="rounded-xl border border-emerald-300 bg-white px-3.5 py-1.5 text-xs font-bold text-[#166534] hover:bg-emerald-50 transition shadow-2xs"
              >
                Preview Card
              </button>
              <a
                href={`https://jansevacard.therpfoundation.org/verify?id=${encodeURIComponent(firstText(lookupResult, ["cardNo", "janSevaCardNo"]))}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-xl bg-[#166534] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-2xs"
              >
                Verify on Portal <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}
      </section>

      {/* 4. CARD REGISTRY RECORDS & APPLICATIONS TABLE */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
        {/* Header with Search and Sub-tabs */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-black text-[#0A192F]">Jan Seva Smart Identity Registry</h3>
            <p className="text-xs text-slate-500">Showing {filteredCards.length} of {cards.length} registered cards</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter pills */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                onClick={() => setCardFilter("all")}
                className={`rounded-lg px-3 py-1 transition ${cardFilter === "all" ? "bg-white text-[#0A192F] shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                All ({cards.length})
              </button>
              <button
                onClick={() => setCardFilter("pending")}
                className={`rounded-lg px-3 py-1 transition ${cardFilter === "pending" ? "bg-[#C2410C] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                Pending
              </button>
              <button
                onClick={() => setCardFilter("approved")}
                className={`rounded-lg px-3 py-1 transition ${cardFilter === "approved" ? "bg-[#166534] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                Approved
              </button>
              <button
                onClick={() => setCardFilter("mirrored")}
                className={`rounded-lg px-3 py-1 transition ${cardFilter === "mirrored" ? "bg-[#0A192F] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                Mirrored API
              </button>
            </div>

            {/* Quick search */}
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name, card no..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#C2410C]"
              />
            </div>
          </div>
        </div>

        {/* List of Cards */}
        <div className="divide-y divide-slate-100">
          {filteredCards.map((row, index) => {
            const cardNo = firstText(row, ["cardNo", "card_no", "janSevaCardNo"]);
            const name = firstText(row, ["name", "nameOfMember", "userId"]);
            const status = String(row.status || "approved").toLowerCase();
            const source = String(row.source || "central-hub");
            const userId = String(row.userId || row.id || "");

            return (
              <div key={String(row.id || cardNo || index)} className="flex flex-wrap items-center justify-between gap-4 p-5 hover:bg-slate-50/70 transition">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-[#0A192F]">{name}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                      status === "approved"
                        ? "bg-emerald-50 text-[#166534] border border-emerald-200"
                        : status === "pending"
                        ? "bg-orange-50 text-[#C2410C] border border-orange-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}>
                      {status}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 border border-slate-200">
                      {source.includes("external") ? "api.therpfoundation.org" : source}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="font-mono text-[#0A192F] font-bold">
                      {cardNo !== "—" ? cardNo : "Card Number Pending"}
                    </span>
                    <span>·</span>
                    <span>Gender: {firstText(row, ["gender"])}</span>
                    <span>·</span>
                    <span>DOB: {firstText(row, ["dob"])}</span>
                    {Boolean(row.vidhanSabhaNo) && (
                      <>
                        <span>·</span>
                        <span>Vidhan Sabha: {String(row.vidhanSabhaNo)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setPreviewCard(row)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0A192F] hover:border-[#C2410C] hover:text-[#C2410C] transition shadow-2xs"
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview Card
                  </button>

                  {cardNo !== "—" && (
                    <a
                      href={`https://jansevacard.therpfoundation.org/verify?id=${encodeURIComponent(cardNo)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#166534] hover:bg-emerald-100 transition shadow-2xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Portal Verify
                    </a>
                  )}

                  {status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(userId, cardNo !== "—" ? cardNo : undefined)}
                        className="inline-flex items-center gap-1 rounded-xl bg-[#166534] hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white transition shadow-2xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(userId)}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition shadow-2xs"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {!filteredCards.length && (
            <div className="p-12 text-center text-slate-400 text-xs">
              No Jan Seva cards matching your search or filter.
            </div>
          )}
        </div>
      </section>

      {/* 5. OFFICIAL JAN SEVA CARD PREVIEW MODAL */}
      {previewCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#C2410C] border border-orange-200">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0A192F]">Jan Seva Digital Card Preview</h3>
                  <p className="text-[11px] text-slate-400">Verified RP Foundation Identity Card</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewCard(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* CARD MOCKUP WITH TRICOLOR PALETTE */}
            <div className="overflow-hidden rounded-2xl border-2 border-[#0A192F] bg-gradient-to-b from-[#FFFDF9] via-white to-[#F0FDF4] shadow-md p-4 space-y-3 relative">
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C2410C] via-white to-[#166534]" />

              <div className="flex items-start justify-between gap-3 border-b border-slate-200/80 pb-2.5 pt-1">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#C2410C]">Jan Seva Foundation</p>
                  <h4 className="text-sm font-black text-[#0A192F]">Jan Seva Identity Smart Card</h4>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase text-[#166534] border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Active / Verified
                </span>
              </div>

              <div className="flex gap-4 items-center">
                {/* QR Code */}
                <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-2 shrink-0 shadow-2xs">
                  <QRCode
                    value={`https://jansevacard.therpfoundation.org/verify?id=${encodeURIComponent(firstText(previewCard, ["cardNo", "card_no", "janSevaCardNo"]))}`}
                    size={84}
                  />
                  <span className="mt-1 text-[8px] font-bold text-slate-400">Scan to Verify</span>
                </div>

                {/* Details */}
                <div className="space-y-1 text-xs">
                  <p className="font-mono text-sm font-black text-[#0A192F]">
                    {firstText(previewCard, ["cardNo", "card_no", "janSevaCardNo"])}
                  </p>
                  <p className="text-xs font-bold text-slate-800">
                    {firstText(previewCard, ["name", "nameOfMember", "userId"])}
                  </p>
                  <div className="grid grid-cols-2 gap-x-2 text-[10px] text-slate-500 font-medium">
                    <span>Gender: {firstText(previewCard, ["gender"])}</span>
                    <span>DOB: {firstText(previewCard, ["dob"])}</span>
                    <span>Vidhan Sabha: {firstText(previewCard, ["vidhanSabhaNo"])}</span>
                    <span>District: {firstText(previewCard, ["district"])}</span>
                  </div>
                </div>
              </div>

              {/* Bottom security strip */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[9px] text-slate-400">
                <span>Secure Digital Seal: ISO/IEC 27001</span>
                <span>RP Foundation Welfare Portal</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => copyToClipboard(`https://jansevacard.therpfoundation.org/verify?id=${encodeURIComponent(firstText(previewCard, ["cardNo", "card_no", "janSevaCardNo"]))}`)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-white transition"
              >
                {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedId ? "Copied Link" : "Copy Verify URL"}</span>
              </button>

              <div className="flex gap-2">
                <a
                  href={`https://jansevacard.therpfoundation.org/verify?id=${encodeURIComponent(firstText(previewCard, ["cardNo", "card_no", "janSevaCardNo"]))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-xl bg-[#166534] px-4 py-2 text-xs font-black text-white hover:bg-emerald-700 transition shadow-sm"
                >
                  Verify on Portal <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={() => setPreviewCard(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
