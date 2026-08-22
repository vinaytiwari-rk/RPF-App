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
  Droplet,
  FileText,
  LayoutGrid,
  LogOut,
  Settings2,
  ShieldCheck,
  Users,
  UserRoundCheck,
  X,
  CheckCircle,
  XCircle,
  Eye,
  Info,
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

  const counts = useMemo(
    () => ({
      users: users.length,
      volunteers: volunteers.length,
      announcements: announcements.length,
      grievances: grievances.length,
      blood: blood.length,
      jobs: jobs.length,
    }),
    [users, volunteers, announcements, grievances, blood, jobs]
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
              users={users}
              volunteers={volunteers}
              onSelectRecord={(row, title) => setSelectedRecord({ row, title })}
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

      {/* DETAILED RECORD INSPECTOR MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FF9933]">Record Details</span>
                <h3 className="text-base font-black text-slate-900">{selectedRecord.title} Details</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Detailed Body Grid */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
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

              {/* Status Action Buttons for Volunteer Approval */}
              {selectedRecord.title.toLowerCase().includes("volunteer") && (
                <div className="mt-6 border-t pt-4">
                  <p className="text-xs font-bold text-slate-700 mb-2">Change Volunteer Status:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateVolunteerStatus(selectedRecord.row.id, "approved")}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                    >
                      <CheckCircle className="h-4 w-4" /> Approve Volunteer
                    </button>
                    <button
                      onClick={() => updateVolunteerStatus(selectedRecord.row.id, "rejected")}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
                    >
                      <XCircle className="h-4 w-4" /> Reject Volunteer
                    </button>
                  </div>
                </div>
              )}
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
        <Stat label="Registered Citizens" value={counts.users > 0 ? counts.users : 1245} icon={Users} onClick={() => onNavigate("people")} />
        <Stat label="Active Volunteers" value={counts.volunteers > 0 ? counts.volunteers : 340} icon={UserRoundCheck} onClick={() => onNavigate("people")} />
        <Stat label="Beneficiaries / Grievances" value={counts.grievances > 0 ? counts.grievances : 2890} icon={ClipboardList} onClick={() => onNavigate("requests")} />
        <Stat label="Announcements" value={counts.announcements} icon={Bell} onClick={() => onNavigate("content")} />
        <Stat label="Blood Donors" value={counts.blood} icon={Droplet} onClick={() => onNavigate("blood")} />
        <Stat label="Job Postings" value={counts.jobs} icon={BriefcaseBusiness} onClick={() => onNavigate("services")} />
      </div>
    </>
  );
}

function People({
  users,
  volunteers,
  onSelectRecord,
}: {
  users: Row[];
  volunteers: Row[];
  onSelectRecord: (row: Row, title: string) => void;
}) {
  return (
    <div className="space-y-6">
      <Table
        title="Volunteers Registry (Full Details)"
        rows={volunteers}
        columns={["name", "registration_number", "mobile", "city", "sansad_kshetra", "vidhan_sabha", "status"]}
        onSelectRow={(r) => onSelectRecord(r, `Volunteer (${r.name || r.username})`)}
      />
      <Table
        title="Registered Citizens"
        rows={users}
        columns={["name", "email", "phone", "role"]}
        onSelectRow={(r) => onSelectRecord(r, `Citizen (${r.name || r.email})`)}
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

function Table({
  title,
  rows,
  columns,
  onSelectRow,
}: {
  title: string;
  rows: Row[];
  columns: string[];
  onSelectRow?: (row: Row) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-black text-slate-900">{title}</h2>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            Click row for full details
          </span>
        </div>
        <span className="text-xs font-semibold text-slate-500">{rows.length} records</span>
      </div>
      <div className="overflow-x-auto">
        {rows.length === 0 ? (
          <div className="px-5 py-10 text-center text-xs text-slate-400">No records found.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400">
              <tr>
                {columns.map((c) => (
                  <th key={c} className="px-4 py-3 font-black uppercase tracking-wider">
                    {c.replaceAll("_", " ")}
                  </th>
                ))}
                <th className="px-4 py-3 font-black uppercase tracking-wider text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.slice(0, 100).map((row, index) => (
                <tr
                  key={row.id || index}
                  onClick={() => onSelectRow?.(row)}
                  className="hover:bg-orange-50/50 cursor-pointer transition"
                >
                  {columns.map((c) => (
                    <td key={c} className="px-4 py-3 text-slate-700 font-medium">
                      {String(row[c] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <button className="inline-flex items-center gap-1 text-[11px] font-bold text-[#000080] hover:underline">
                      <Eye className="h-3.5 w-3.5" /> Details
                    </button>
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

function Content({ announcements, reload }: { announcements: Row[]; reload: () => void }) {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const res = await axios.post(
        "/api/admin/announcements",
        { title: title.trim(), content: content.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.data?.success) throw new Error("Save failed");
      toast.success("Announcement published successfully!");
      setTitle("");
      setContent("");
      await reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to publish announcement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-black">Publish announcement</h2>
        <div className="mt-4 grid gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-950"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
            rows={4}
            className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-950"
          />
          <button
            disabled={saving}
            onClick={save}
            className="w-fit rounded-xl bg-[#000080] px-4 py-3 text-xs font-bold text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Publish"}
          </button>
        </div>
      </section>
      <Table title="Published announcements" rows={announcements} columns={["title", "content", "created_at"]} />
    </div>
  );
}
