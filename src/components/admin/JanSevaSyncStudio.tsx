import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import QRCode from "react-qr-code";
import { RP_FOUNDATION_CARD_LOGO } from "../../assets/foundationBrand";
import {
  CreditCard,
  ExternalLink,
  Download,
  Upload,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Eye,
  X,
  Filter,
  ShieldCheck,
  UserCheck
} from "lucide-react";

type Row = Record<string, unknown>;

interface JanSevaSyncStudioProps {
  cards: Row[];
  totalCards?: number;
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

function scalarText(value: unknown): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    const text = String(value).trim();
    return text || "—";
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const key of ["value", "date", "dob", "dateOfBirth", "date_of_birth", "$date", "formatted", "label"]) {
      const nested = scalarText(obj[key]);
      if (nested !== "—" && !nested.includes("[object Object]")) return nested;
    }
  }
  return "—";
}

function formatDob(value: unknown): string {
  const raw = scalarText(value);
  if (raw === "—") return "—";
  const match = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (match) return `${match[3].padStart(2, "0")}-${match[2].padStart(2, "0")}-${match[1]}`;
  return raw;
}

function firstScalar(row: Row, keys: string[]): string {
  for (const key of keys) {
    const value = scalarText(row[key]);
    if (value !== "—") return value;
  }
  return "—";
}

function cardAddress(row: Row): string {
  const direct = firstText(row, [
    "address", "fullAddress", "full_address", "registeredAddress",
    "registered_address", "addressLine", "address_line"
  ]);
  if (direct !== "—" && !direct.includes("[object Object]")) return direct;

  const parts = [
    row.addressLine1, row.address_line1, row.addressLine2, row.address_line2,
    row.village, row.locality, row.ward, row.city, row.district,
    row.state, row.pincode, row.pinCode
  ]
    .filter((value) => value !== undefined && value !== null && String(value).trim())
    .map((value) => String(value).trim());

  return parts.length ? [...new Set(parts)].join(", ") : "—";
}

const JAN_SEVA_BENEFITS_HI = [
  ["सामाजिक कल्याण", "समाज के हर वर्ग को बेहतर जीवन की ओर ले जाना।"],
  ["स्वास्थ्य सेवाएँ", "निःशुल्क स्वास्थ्य शिविर और दवा वितरण।"],
  ["शिक्षा", "स्कूल, पुस्तकालय और शिक्षा सामग्री उपलब्ध कराना।"],
  ["महिला सशक्तिकरण", "महिलाओं को शिक्षा, स्वास्थ्य और रोजगार से जोड़ना।"],
  ["कौशल विकास", "युवाओं को कौशल प्रशिक्षण देकर रोजगार व विकास बढ़ाना।"],
  ["पर्यावरण संरक्षण", "जल संरक्षण और वृक्षारोपण अभियान।"],
  ["सांस्कृतिक संरक्षण", "कला, संस्कृति और राष्ट्रीय एकता को बढ़ावा देना।"],
  ["मानव अधिकार", "अन्याय और भ्रष्टाचार के खिलाफ जागरूकता फैलाना।"]
] as const;

export default function JanSevaSyncStudio({ cards, totalCards = cards.length, token, onRefresh, exportCsv }: JanSevaSyncStudioProps) {
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [cardFilter, setCardFilter] = useState<"all" | "pending" | "mirrored" | "approved">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Quick Registry Lookup
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<any | null>(null);

  // Card Preview Modal
  const [previewCard, setPreviewCard] = useState<Row | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [previewFlipped, setPreviewFlipped] = useState(false);
  const [masterCards, setMasterCards] = useState<Row[]>([]);
  const [masterTotal, setMasterTotal] = useState(totalCards);
  const [masterLoading, setMasterLoading] = useState(false);
  const [masterPage, setMasterPage] = useState(1);
  const MASTER_PAGE_SIZE = 100;

  // Master Registry is loaded server-side in small pages to protect cPanel/mobile memory.
  const loadMasterRegistry = useCallback(async (page = 1, search = "") => {
    if (!token) return;
    setMasterLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(MASTER_PAGE_SIZE)
      });
      if (search.trim()) params.set("search", search.trim());

      const res = await axios.get(`/api/admin/cards/mirror?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000
      });

      const rawRecords = Array.isArray(res.data?.records) ? res.data.records : [];
      const normalized = rawRecords.map((item: any) => ({
        ...((item?.record && typeof item.record === "object") ? item.record : {}),
        card_no: item?.card_no,
        cardNo: item?.card_no,
        source: item?.source || "admin-import",
        synced_at: item?.synced_at
      }));
      setMasterCards(normalized);
      setMasterTotal(Number(res.data?.total || 0));
      setMasterPage(Number(res.data?.page || page));
    } catch (err: any) {
      setMasterCards([]);
      toast.error(err?.response?.data?.error || "Unable to load Master Registry.");
    } finally {
      setMasterLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (cardFilter !== "all" && cardFilter !== "mirrored") return;
    const timer = window.setTimeout(() => {
      void loadMasterRegistry(1, searchQuery);
    }, searchQuery.trim() ? 350 : 0);
    return () => window.clearTimeout(timer);
  }, [cardFilter, searchQuery, loadMasterRegistry]);

  // Import JSON Backup File
  const handleImportJson = async (file?: File) => {
    if (!file || !token) return;
    setSyncBusy(true);
    setSyncStatus("Reading and validating JSON file...");
    try {
      const MAX_MASTER_FILE_SIZE = 200 * 1024 * 1024;
      if (file.size > MAX_MASTER_FILE_SIZE) throw new Error("Maximum master file size is 200 MB.");
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      const records: unknown = Array.isArray(parsed)
        ? parsed
        : (parsed as any)?.patients ?? (parsed as any)?.records ?? (parsed as any)?.data;
      if (!Array.isArray(records)) {
        throw new Error("File must contain a JSON array of card records (direct array, patients, records, or data).");
      }

      let imported = 0, skipped = 0;
      for (let i = 0; i < records.length; i += 100) {
        const batch = records.slice(i, i + 100);
        const res = await axios.post("/api/admin/cards/import", { records: batch }, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000
        });
        imported += res.data?.imported || 0;
        skipped += res.data?.skipped || 0;
        setSyncStatus(`Importing: ${Math.min(i + 100, records.length)} / ${records.length} records processed (${imported} imported, ${skipped} skipped).`);
      }

      toast.success(`Import complete: ${imported} records imported, ${skipped} skipped.`);
      setSyncStatus(`Import finished: ${imported} records imported.`);
      await onRefresh();
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
    const cardNo = existingCardNo ? String(existingCardNo).trim() : "";
    if (!cardNo) {
      toast.error("Verified Jan Seva Card number is required. Import the master data file first.");
      return;
    }

    try {
      const res = await axios.post("/api/cards/approve", { userId, cardNo }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        toast.success(`Card ${res.data.cardNo} successfully approved!`);
        await onRefresh();
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
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Rejection failed");
    }
  };

  // Master Registry uses server-side filtering; applications remain local.
  const filteredCards = useMemo(() => {
    if (cardFilter === "all" || cardFilter === "mirrored") return masterCards;
    return cards.filter(row => {
      const status = String(row.status || "").toLowerCase();
      if (cardFilter === "pending" && status !== "pending") return false;
      if (cardFilter === "approved" && status !== "approved") return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const cardNo = String(row.cardNo || row.card_no || "").toLowerCase();
      const name = String(row.name || row.nameOfMember || "").toLowerCase();
      const phone = String(row.mobileNo || row.phone || row.idNumber || "").toLowerCase();
      const district = String(row.district || row.address || "").toLowerCase();
      return cardNo.includes(q) || name.includes(q) || phone.includes(q) || district.includes(q);
    });
  }, [cards, masterCards, cardFilter, searchQuery]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. MASTER DATA IMPORT */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-black text-[#0A192F]">Jan Seva Card Master Data</h2>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              Admin-managed master file is the single source of truth. External API synchronization has been removed.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">FILE SOURCE</span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#245D45] px-4 py-2 text-xs font-black text-white shadow-sm hover:brightness-105">
            <Upload className="h-3.5 w-3.5" /><span>Import Master JSON</span>
            <input type="file" accept=".json,application/json" disabled={syncBusy}
              onChange={(e) => { void handleImportJson(e.target.files?.[0]); e.target.value = ""; }} className="sr-only" />
          </label>
          <button onClick={() => exportCsv("cards", "rpf_jan_seva_cards_master")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
        {syncStatus && <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-xs font-semibold text-emerald-800">{syncStatus}</div>}
        <p className="text-[11px] leading-5 text-slate-400">JSON may be a direct array of records or an object containing a <code>patients</code> array. Records are imported into the local verified registry in small cPanel-safe batches.</p>
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
            <p className="text-xs text-slate-500">Showing {filteredCards.length} loaded records · {(cardFilter === "all" || cardFilter === "mirrored" ? masterTotal : filteredCards.length).toLocaleString()} total records</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter pills */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                onClick={() => setCardFilter("all")}
                className={`rounded-lg px-3 py-1 transition ${cardFilter === "all" ? "bg-white text-[#0A192F] shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                All ({masterTotal.toLocaleString()})
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
                Master Registry
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
                      {source.includes("external") ? "External" : source}
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

          {masterLoading && (cardFilter === "all" || cardFilter === "mirrored") && (
            <div className="p-10 text-center text-slate-400 text-xs">Loading Master Registry records...</div>
          )}

          {!masterLoading && !filteredCards.length && (
            <div className="p-12 text-center text-slate-400 text-xs">
              No Jan Seva cards matching your search or filter.
            </div>
          )}
        </div>

        {(cardFilter === "all" || cardFilter === "mirrored") && masterTotal > MASTER_PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <button
              disabled={masterLoading || masterPage <= 1}
              onClick={() => void loadMasterRegistry(masterPage - 1, searchQuery)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-[10px] font-bold text-slate-400">
              Page {masterPage} · {Math.min(masterPage * MASTER_PAGE_SIZE, masterTotal).toLocaleString()} / {masterTotal.toLocaleString()}
            </span>
            <button
              disabled={masterLoading || masterPage * MASTER_PAGE_SIZE >= masterTotal}
              onClick={() => void loadMasterRegistry(masterPage + 1, searchQuery)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* 5. OFFICIAL JAN SEVA CARD PREVIEW MODAL */}
      {previewCard && (() => {
        const cardNo = firstScalar(previewCard, ["cardNo", "card_no", "janSevaCardNo", "janSevaCardNumber", "cardNumber"]);
        const name = firstScalar(previewCard, ["nameOfMember", "name", "memberName", "fullName", "userName"]);
        const gender = firstScalar(previewCard, ["gender", "sex"]);
        const dob = formatDob(previewCard.dob ?? previewCard.dateOfBirth ?? previewCard.date_of_birth ?? previewCard.birthDate);
        const vidhanSabha = firstScalar(previewCard, [
          "vidhanSabhaNo", "vidhan_sabha_no", "vidhanSabhaNumber", "vidhan_sabha_number",
          "assemblyConstituencyNo", "assembly_constituency_no", "assemblyNumber",
          "vidhanSabha", "vidhan_sabha"
        ]);
        const address = cardAddress(previewCard);
        const verifyUrl = `https://jansevacard.therpfoundation.org/verify?id=${encodeURIComponent(cardNo)}`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-2xl rounded-[28px] border border-white/30 bg-white p-4 sm:p-6 shadow-2xl my-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#C2410C] border border-orange-200">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#0A192F]">Jan Seva Card Preview</h3>
                    <p className="text-[10px] text-slate-400">Official front & back design · Master Registry data</p>
                  </div>
                </div>
                <button
                  onClick={() => { setPreviewCard(null); setPreviewFlipped(false); }}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                  aria-label="Close preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div
                className="perspective-1000 w-full max-w-[560px] mx-auto cursor-pointer"
                onClick={() => setPreviewFlipped((value) => !value)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setPreviewFlipped((value) => !value); }}
              >
                <div className={`relative w-full aspect-[1.586] transition-transform duration-700 transform-style-3d ${previewFlipped ? "rotate-y-180" : ""}`}>

                  {/* FRONT */}
                  <div className="absolute inset-0 backface-hidden overflow-hidden rounded-[22px] border border-slate-300 bg-white shadow-[0_22px_45px_rgba(15,23,42,0.28)] flex flex-col">
                    <div className="h-[24%] min-h-[72px] bg-gradient-to-r from-[#F97316] via-[#F15A24] to-[#D94801] px-4 sm:px-6 flex items-center gap-3 text-white relative overflow-hidden">
                      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,.16),transparent_45%,rgba(255,255,255,.08))]" />
                      <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-full bg-white p-1 shadow-lg ring-1 ring-white/70">
                        <img src={RP_FOUNDATION_CARD_LOGO} alt="RP Foundation" className="h-full w-full object-contain rounded-full" />
                      </div>
                      <div className="relative min-w-0">
                        <h4 className="text-[18px] sm:text-[25px] font-black tracking-[0.08em] leading-none">RP FOUNDATION</h4>
                        <p className="mt-1 text-[8px] sm:text-[11px] font-semibold leading-tight">(Rohit Pandit Foundation) <span className="opacity-80">|</span> Reg. No. 14675/05</p>
                      </div>
                    </div>

                    <div className="relative flex-1 bg-gradient-to-br from-white via-white to-slate-50 px-4 sm:px-7 py-3 sm:py-5 overflow-hidden">
                      <div className="absolute -right-16 -bottom-20 h-48 w-48 rounded-full border-[20px] border-[#000080]/[0.025]" />
                      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-[14px] border-[#000080]/[0.025]" />

                      <div className="relative flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
                        <h4 className="text-[19px] sm:text-[27px] font-black text-[#000080] leading-none">जनसेवा कार्ड</h4>
                        <span className="font-mono text-[12px] sm:text-[17px] font-black tracking-[0.08em] text-[#000080] text-right">{cardNo}</span>
                      </div>

                      <div className="relative mt-3 pr-[76px] sm:pr-[94px] space-y-2 text-[10px] sm:text-[13px] text-[#182B49]">
                        <div className="flex gap-2">
                          <span className="w-[76px] sm:w-[100px] shrink-0 font-semibold">नाम / Name :</span>
                          <span className="font-bold truncate">{name}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="w-[76px] sm:w-[100px] shrink-0 font-semibold">लिंग / Gender :</span>
                          <span className="font-bold">{gender}</span>
                          <span className="mx-1 text-slate-300">|</span>
                          <span className="font-semibold">DOB :</span>
                          <span className="font-bold">{dob}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="w-[76px] sm:w-[100px] shrink-0 font-semibold">विधान सभा :</span>
                          <span className="font-bold truncate">{vidhanSabha}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-[76px] sm:w-[100px] shrink-0 font-semibold">पता / Address :</span>
                          <span className="font-bold leading-snug line-clamp-2">{address}</span>
                        </div>
                      </div>

                      <div className="absolute right-4 sm:right-7 top-[39%] rounded-lg bg-white p-1 shadow-md ring-1 ring-slate-200">
                        <QRCode value={verifyUrl} size={64} bgColor="#FFFFFF" fgColor="#000000" level="M" />
                      </div>

                      <div className="absolute bottom-3 sm:bottom-4 left-4 right-4 sm:left-7 sm:right-7 border-t border-slate-200 pt-2 text-center">
                        <p className="text-[12px] sm:text-[17px] font-black tracking-[0.04em] text-[#172554]">Toll Free Number : 1800 - 569 - 0991</p>
                        <p className="mt-1 text-[7px] sm:text-[10px] font-semibold text-slate-500">www.therpfoundation.org &nbsp;|&nbsp; info@therpfoundation.org</p>
                        <p className="mt-0.5 text-[6.5px] sm:text-[9px] font-medium text-slate-400">Facebook: rpfoundationofficial &nbsp; Instagram: rpfoundationofficial &nbsp; X: rpfoundation15</p>
                      </div>
                    </div>

                    <div className="h-2 sm:h-3 bg-gradient-to-r from-[#138808] via-[#159447] to-[#0B6B06]" />
                  </div>

                  {/* BACK */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 overflow-hidden rounded-[22px] border border-slate-300 bg-white shadow-[0_22px_45px_rgba(15,23,42,0.28)] flex flex-col">
                    <div className="h-2 sm:h-3 bg-gradient-to-r from-[#F97316] via-[#FF9933] to-[#F97316]" />
                    <div className="relative flex-1 bg-gradient-to-br from-white via-white to-slate-50 px-4 sm:px-7 py-3 sm:py-5 overflow-hidden">
                      <div className="absolute -right-16 -bottom-20 h-48 w-48 rounded-full border-[20px] border-[#000080]/[0.025]" />
                      <div className="relative text-center">
                        <h4 className="text-[16px] sm:text-[23px] font-black text-[#000080]">जनसेवा कार्ड के फायदे :</h4>
                      </div>

                      <div className="relative mt-2 rounded-xl border border-orange-200/70 bg-white/80 px-3 sm:px-5 py-2 sm:py-3 shadow-sm">
                        <div className="grid grid-cols-1 gap-1 sm:gap-1.5">
                          {JAN_SEVA_BENEFITS_HI.map(([label, desc]) => (
                            <div key={label} className="flex gap-1.5 text-[7.5px] sm:text-[10px] leading-snug text-slate-700">
                              <span className="font-black text-[#000080] shrink-0">{label}</span>
                              <span>– {desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <p className="absolute bottom-3 sm:bottom-4 left-4 right-4 sm:left-7 sm:right-7 border-t border-slate-200 pt-2 text-center text-[7.5px] sm:text-[10px] font-semibold text-slate-600">
                        नोट: यह सभी सुविधाएं जन सेवा कार्ड धारकों के लिए निःशुल्क है।
                      </p>
                    </div>
                    <div className="h-2 sm:h-3 bg-gradient-to-r from-[#138808] via-[#159447] to-[#0B6B06]" />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-400">
                <span className="rounded-full bg-slate-100 px-3 py-1">{previewFlipped ? "Back Side" : "Front Side"}</span>
                <span>• Tap card to flip</span>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div><span className="text-slate-400">Name</span><p className="font-bold text-slate-700 truncate">{name}</p></div>
                  <div><span className="text-slate-400">DOB</span><p className="font-bold text-slate-700">{dob}</p></div>
                  <div><span className="text-slate-400">Vidhan Sabha</span><p className="font-bold text-slate-700 truncate">{vidhanSabha}</p></div>
                  <div className="col-span-2"><span className="text-slate-400">Address</span><p className="font-bold text-slate-700 leading-snug">{address}</p></div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => copyToClipboard(verifyUrl)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedId ? "Copied" : "Copy Verify URL"}
                </button>

                <div className="flex gap-2">
                  <a
                    href={verifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#166534] px-4 py-2 text-xs font-black text-white hover:bg-emerald-700 transition shadow-sm"
                  >
                    Verify on Portal <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => { setPreviewCard(null); setPreviewFlipped(false); }}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
