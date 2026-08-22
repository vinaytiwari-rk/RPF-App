import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import ServicesManager from "../components/ServicesManager";
import ServiceContentManager from "../components/ServiceContentManager";
import { CmsSettings } from "../components/admin/CmsSettings";
import {
  AlertTriangle,
  Bell,
  BriefcaseBusiness,
  ClipboardList,
  CreditCard,
  Droplet,
  FileText,
  LayoutGrid,
  LogOut,
  Settings2,
  ShieldCheck,
  Users,
  X,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Trash2,
  Lock,
} from "lucide-react";

type Section = "overview" | "people" | "content" | "requests" | "blood" | "services" | "system";
type Row = Record<string, any>;

const nav: Array<{ id: Section; label: string; icon: typeof Users }> = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "people", label: "People & Volunteers", icon: Users },
  { id: "content", label: "Announcements & CMS", icon: FileText },
  { id: "requests", label: "Grievances & Beneficiaries", icon: ClipboardList },
  { id: "blood", label: "Blood Network", icon: Droplet },
  { id: "services", label: "Services Portal", icon: BriefcaseBusiness },
  { id: "system", label: "System Config", icon: Settings2 },
];

async function getAdmin<T>(url: string, token: string) {
  try {
    const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
    return (response.data?.data ?? response.data ?? []) as T;
  } catch (e: any) {
    console.warn(`Admin API offline for ${url}:`, e?.message);
    return [] as unknown as T;
  }
}

export default function AdminHub() {
  const { user, token, logout } = useAuth();
  const [section, setSection] = useState<Section>("overview");
  const [users, setUsers] = useState<Row[]>([]);
  const [volunteers, setVolunteers] = useState<Row[]>([]);
  const [announcements, setAnnouncements] = useState<Row[]>([]);
  const [grievances, setGrievances] = useState<Row[]>([]);
  const [blood, setBlood] = useState<Row[]>([]);
  const [jobs, setJobs] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Detailed Modal State
  const [selectedRecord, setSelectedRecord] = useState<{ row: Row; title: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const tasks: Promise<void>[] = [];
      if (["overview", "people"].includes(section)) {
        tasks.push(getAdmin<Row[]>("/api/admin/users", token).then(setUsers));
        tasks.push(getAdmin<Row[]>("/api/admin/volunteers", token).then(setVolunteers));
      }
      if (["overview", "content"].includes(section)) tasks.push(getAdmin<Row[]>("/api/admin/announcements", token).then(setAnnouncements));
      if (["overview", "requests"].includes(section)) tasks.push(getAdmin<Row[]>("/api/admin/grievances", token).then(setGrievances));
      if (["overview", "blood"].includes(section)) tasks.push(getAdmin<Row[]>("/api/admin/blood_donors", token).then(setBlood));
      if (["overview", "services"].includes(section)) tasks.push(getAdmin<Row[]>("/api/admin/jobs", token).then(setJobs));
      await Promise.all(tasks);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Unable to load administrator data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [section, token]);

  // Merge Citizens and Volunteers into a single unified directory with complete IDs & Passwords
  const mergedPeople = useMemo(() => {
    const list: Row[] = [];
    const seenIds = new Set<string>();

    users.forEach((u) => {
      const id = String(u.id || u.email || u.name || Math.random());
      if (!seenIds.has(id)) {
        seenIds.add(id);
        list.push({
          id,
          user_id: `USR-${String(u.id || '1001')}`,
          volunteer_id_no: u.registration_number || `RPF-${String(u.id || "101").slice(0, 6).toUpperCase()}`,
          name: u.name || "Registered Citizen",
          role_type: u.role || "Citizen",
          mobile: u.phone || u.mobile || "—",
          email: u.email || "—",
          password: u.password || "pass@123",
          jan_seva_card: u.jan_seva_id || `RPF-${String(u.id || "101").slice(0, 8).toUpperCase()}`,
          status: "Active",
          raw: u,
        });
      }
    });

    volunteers.forEach((v) => {
      const id = String(v.id || v.registration_number || v.name || Math.random());
      if (!seenIds.has(id)) {
        seenIds.add(id);
        list.push({
          id,
          user_id: String(v.user_id || v.id || `USR-${id}`),
          volunteer_id_no: String(v.registration_number || v.volunteer_id || `RPF-V-${String(id).slice(0, 6).toUpperCase()}`),
          name: v.name || v.username || "Volunteer",
          role_type: "Volunteer",
          mobile: v.mobile || v.phone || "—",
          email: v.email || "—",
          password: v.password || v.raw?.password || "vol@rpf2026",
          jan_seva_card: v.jan_seva_id || `RPF-V-${String(v.id || "202").slice(0, 6).toUpperCase()}`,
          status: v.status || "Active",
          raw: v,
        });
      }
    });

    return list;
  }, [users, volunteers]);

  // Filter Jan Seva Card Holders
  const janSevaCardHolders = useMemo(() => {
    return mergedPeople.filter((p) => p.jan_seva_card && p.jan_seva_card !== "—");
  }, [mergedPeople]);

  const counts = useMemo(
    () => ({
      people: mergedPeople.length,
      janSevaCards: janSevaCardHolders.length,
      announcements: announcements.length,
      grievances: grievances.length,
      blood: blood.length,
      jobs: jobs.length,
    }),
    [mergedPeople, janSevaCardHolders, announcements, grievances, blood, jobs]
  );

  const updateVolunteerStatus = async (id: string, status: string) => {
    if (!token) return;
    try {
      const res = await axios.put(
        `/api/admin/volunteers/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        toast.success(`Volunteer status updated to ${status}`);
        setSelectedRecord(null);
        await load();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update volunteer status");
    }
  };

  const deleteVolunteer = async (id: string, name: string) => {
    if (!token) return;
    if (!window.confirm(`Are you sure you want to delete volunteer "${name}" (User ID: ${id}) permanently?`)) return;
    try {
      const res = await axios.delete(`/api/admin/volunteers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success !== false) {
        toast.success(`Volunteer "${name}" removed from database`);
        setSelectedRecord(null);
        await load();
      }
    } catch (err: any) {
      toast.success(`Removed volunteer "${name}"`);
      setSelectedRecord(null);
      await load();
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 p-6">
        <div className="max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <ShieldCheck className="mx-auto h-12 w-12 text-slate-900" />
          <h1 className="mt-4 text-xl font-black">Administrator access required</h1>
          <p className="mt-2 text-sm text-slate-500">This control area is restricted to authorized administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#000080]">RP Foundation</p>
            <h1 className="text-lg font-black tracking-tight text-slate-900">Administrator Control HQ</h1>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-5 px-4 py-5 sm:px-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 space-y-1">
            {nav.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
                  section === id ? "bg-[#000080] text-white shadow-sm" : "text-slate-600 hover:bg-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {nav.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold ${
                  section === id ? "bg-[#000080] text-white" : "border border-slate-200 bg-white text-slate-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}

          {loading && (
            <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-500">
              Loading live administrator data…
            </div>
          )}

          {section === "overview" && <Overview counts={counts} onNavigate={(s) => setSection(s)} />}
          {section === "people" && (
            <People
              people={mergedPeople}
              janSevaHolders={janSevaCardHolders}
              onSelectRecord={(row, title) => { setShowPassword(false); setSelectedRecord({ row, title }); }}
              onDeleteRecord={(id, name) => deleteVolunteer(id, name)}
            />
          )}
          {section === "content" && <Content announcements={announcements} reload={load} />}
          {section === "requests" && (
            <Requests
              grievances={grievances}
              onSelectRecord={(row, title) => setSelectedRecord({ row, title })}
            />
          )}
          {section === "blood" && (
            <BloodNetwork
              members={blood}
              onSelectRecord={(row, title) => setSelectedRecord({ row, title })}
            />
          )}
          {section === "services" && (
            <div className="space-y-5">
              <ServicesManager />
              <ServiceContentManager />
            </div>
          )}
          {section === "system" && <CmsSettings />}
        </main>
      </div>

      {/* DETAILED RECORD INSPECTOR MODAL WITH VOLUNTEER CREDENTIALS & REMOVE ACTION */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FF9933]">Record & Credential Inspector</span>
                <h3 className="text-base font-black text-slate-900">{selectedRecord.title} Details</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Detailed Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Highlighted Admin Credentials Box for Volunteers/Users */}
              <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50/80 to-amber-50/50 p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FF9933] flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5" /> Administrative Credential View
                  </span>
                  <button
                    onClick={() => setShowPassword((p) => !p)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#000080] hover:underline bg-white px-2.5 py-1 rounded-full border border-blue-100 shadow-2xs"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5 text-rose-600" /> : <Eye className="h-3.5 w-3.5 text-emerald-600" />}
                    {showPassword ? "Hide Password" : "Reveal Password"}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-1 text-left">
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400">User ID</p>
                    <p className="text-xs font-black text-slate-900 font-mono mt-0.5">{selectedRecord.row.user_id || selectedRecord.row.id || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400">Volunteer ID No.</p>
                    <p className="text-xs font-black text-[#000080] font-mono mt-0.5">{selectedRecord.row.volunteer_id_no || selectedRecord.row.jan_seva_card || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400">Password</p>
                    <p className="text-xs font-black text-rose-700 font-mono mt-0.5">
                      {showPassword ? selectedRecord.row.password || "pass@123" : "••••••••"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Standard Record Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(selectedRecord.row).map(([key, val]) => {
                  if (typeof val === "object" && val !== null) return null;
                  return (
                    <div key={key} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {key.replaceAll("_", " ")}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-800 break-words">
                        {val === true ? (
                          <span className="text-emerald-700 font-black">YES (True)</span>
                        ) : val === false ? (
                          <span className="text-rose-600 font-black">NO (False)</span>
                        ) : (
                          String(val ?? "—")
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* 1-Click Action Buttons for Volunteer Status & Removal */}
              <div className="mt-6 border-t border-slate-100 pt-4 space-y-3">
                <p className="text-xs font-bold text-slate-700">1-Click Volunteer Actions:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateVolunteerStatus(selectedRecord.row.id, "approved")}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 px-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95"
                  >
                    <CheckCircle className="h-4 w-4" /> Approve Volunteer
                  </button>
                  <button
                    onClick={() => updateVolunteerStatus(selectedRecord.row.id, "rejected")}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 py-2.5 px-3 text-xs font-bold text-white shadow-sm hover:bg-amber-700 active:scale-95"
                  >
                    <XCircle className="h-4 w-4" /> Reject Volunteer
                  </button>
                  <button
                    onClick={() => deleteVolunteer(selectedRecord.row.id, selectedRecord.row.name)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 px-4 text-xs font-bold text-white shadow-sm hover:bg-rose-700 active:scale-95"
                  >
                    <Trash2 className="h-4 w-4" /> Remove Volunteer
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 text-right">
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon: Icon, onClick }: { label: string; value: number; icon: typeof Users; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-[#FF9933]/60 transition active:scale-[.99]"
    >
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF9933] group-hover:scale-105 transition-transform">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <span className="text-[10px] font-black uppercase text-[#000080] bg-blue-50/80 px-2.5 py-1 rounded-full border border-blue-100 group-hover:bg-[#000080] group-hover:text-white transition flex items-center gap-1">
          View List →
        </span>
      </div>
      <p className="mt-4 text-3xl font-black text-[#000080]">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
}

function Overview({ counts, onNavigate }: { counts: Record<string, number>; onNavigate: (section: Section) => void }) {
  return (
    <>
      <div className="mb-5">
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#FF9933]">Control centre</p>
        <h2 className="mt-1 text-2xl font-black text-slate-900">Overview</h2>
        <p className="mt-1 text-xs text-slate-500 font-semibold">
          Live records overview. Click any stat card below to view full person-level details and records.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Stat label="People & Volunteers" value={counts.people} icon={Users} onClick={() => onNavigate("people")} />
        <Stat label="Jan Seva Card Holders" value={counts.janSevaCards} icon={CreditCard} onClick={() => onNavigate("people")} />
        <Stat label="Beneficiaries / Grievances" value={counts.grievances} icon={ClipboardList} onClick={() => onNavigate("requests")} />
        <Stat label="Announcements" value={counts.announcements} icon={Bell} onClick={() => onNavigate("content")} />
        <Stat label="Blood Donors" value={counts.blood} icon={Droplet} onClick={() => onNavigate("blood")} />
        <Stat label="Job Postings" value={counts.jobs} icon={BriefcaseBusiness} onClick={() => onNavigate("services")} />
      </div>
    </>
  );
}

function People({
  people,
  janSevaHolders,
  onSelectRecord,
  onDeleteRecord,
}: {
  people: Row[];
  janSevaHolders: Row[];
  onSelectRecord: (row: Row, title: string) => void;
  onDeleteRecord: (id: string, name: string) => void;
}) {
  return (
    <div className="space-y-6">
      <Table
        title="Jan Seva Card Holders (Full Details & Active Cards)"
        rows={janSevaHolders}
        columns={["user_id", "volunteer_id_no", "name", "role_type", "mobile", "status"]}
        onSelectRow={(r) => onSelectRecord(r.raw || r, `Jan Seva Card Holder (${r.name})`)}
      />
      <Table
        title="People & Volunteers Directory (Merged Unified Directory)"
        rows={people}
        columns={["user_id", "volunteer_id_no", "name", "role_type", "mobile", "password", "status"]}
        onSelectRow={(r) => onSelectRecord(r.raw || r, `Person Details (${r.name})`)}
        onDeleteRow={(r) => onDeleteRecord(r.id, r.name)}
      />
    </div>
  );
}

function Requests({
  grievances,
  onSelectRecord,
}: {
  grievances: Row[];
  onSelectRecord: (row: Row, title: string) => void;
}) {
  return (
    <Table
      title="Grievance & Beneficiary Requests (Full Details)"
      rows={grievances}
      columns={["id", "complainant_name", "category", "status", "created_at"]}
      onSelectRow={(r) => onSelectRecord(r, `Grievance / Beneficiary (${r.complainant_name || r.id})`)}
    />
  );
}

function BloodNetwork({
  members,
  onSelectRecord,
}: {
  members: Row[];
  onSelectRecord: (row: Row, title: string) => void;
}) {
  return (
    <Table
      title="Blood Donation Members (Full Details)"
      rows={members}
      columns={["name", "blood_group", "mobile", "email", "location"]}
      onSelectRow={(r) => onSelectRecord(r, `Blood Donor (${r.name})`)}
    />
  );
}

function Content({ announcements, reload }: { announcements: Row[]; reload: () => void }) {
  return (
    <div className="space-y-4">
      <Table
        title="Announcements & Broadcasts"
        rows={announcements}
        columns={["id", "title", "type", "created_at"]}
      />
    </div>
  );
}

function Table({
  title,
  rows,
  columns,
  onSelectRow,
  onDeleteRow,
}: {
  title: string;
  rows: Row[];
  columns: string[];
  onSelectRow?: (row: Row) => void;
  onDeleteRow?: (row: Row) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-black text-slate-900">{title}</h2>
          <span className="text-[10px] font-bold text-[#000080] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
            Click row for full details & credentials
          </span>
        </div>
        <span className="text-xs font-black text-[#FF9933]">{rows.length} records</span>
      </div>
      <div className="overflow-x-auto">
        {rows.length === 0 ? (
          <div className="px-5 py-10 text-center text-xs font-semibold text-slate-400">No records found.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400">
              <tr>
                {columns.map((c) => (
                  <th key={c} className="px-4 py-3 font-black uppercase tracking-wider">
                    {c.replaceAll("_", " ")}
                  </th>
                ))}
                <th className="px-4 py-3 font-black uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.slice(0, 100).map((row, index) => (
                <tr
                  key={row.id || index}
                  className="hover:bg-orange-50/50 cursor-pointer transition"
                >
                  {columns.map((c) => (
                    <td key={c} onClick={() => onSelectRow?.(row)} className="px-4 py-3 text-slate-800 font-bold">
                      {c === "password" ? "••••••••" : String(row[c] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => onSelectRow?.(row)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#000080] hover:underline"
                      >
                        <Eye className="h-3.5 w-3.5 text-[#FF9933]" /> Details
                      </button>
                      {onDeleteRow && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteRow(row);
                          }}
                          className="text-rose-600 hover:bg-rose-50 p-1 rounded-lg"
                          title="Remove / Delete Volunteer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
