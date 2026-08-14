import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import ServicesManager from "../components/ServicesManager";
import ServiceContentManager from "../components/ServiceContentManager";
import { CmsSettings } from "../components/admin/CmsSettings";
import { VisualSettings } from "../components/admin/VisualSettings";
import { AlertTriangle, Bell, BriefcaseBusiness, CheckCircle2, ClipboardList, Database, Droplet, FileText, HeartHandshake, LayoutGrid, LogOut, Megaphone, Settings2, ShieldCheck, Users, UserRoundCheck } from "lucide-react";

type Section = "overview" | "people" | "content" | "requests" | "blood" | "services" | "system";

type Row = Record<string, any>;

const nav: Array<{ id: Section; label: string; icon: typeof Users }> = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "people", label: "People", icon: Users },
  { id: "content", label: "Content", icon: FileText },
  { id: "requests", label: "Requests", icon: ClipboardList },
  { id: "blood", label: "Blood Network", icon: Droplet },
  { id: "services", label: "Services", icon: BriefcaseBusiness },
  { id: "system", label: "System", icon: Settings2 },
];

async function getAdmin<T>(url: string, token: string) {
  const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
  return response.data?.data ?? response.data ?? [] as T;
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

  const load = async () => {
    if (!token) return;
    setLoading(true); setError("");
    try {
      const tasks: Promise<void>[] = [];
      if (section === "overview" || section === "people") tasks.push(getAdmin<Row[]>("/api/admin/users", token).then(setUsers));
      if (section === "overview" || section === "people") tasks.push(getAdmin<Row[]>("/api/admin/volunteers", token).then(setVolunteers));
      if (section === "overview" || section === "content") tasks.push(getAdmin<Row[]>("/api/admin/announcements", token).then(setAnnouncements));
      if (section === "overview" || section === "requests") tasks.push(getAdmin<Row[]>("/api/admin/grievances", token).then(setGrievances));
      if (section === "overview" || section === "blood") tasks.push(getAdmin<Row[]>("/api/admin/blood_donors", token).then(setBlood));
      if (section === "overview" || section === "services") tasks.push(getAdmin<Row[]>("/api/admin/jobs", token).then(setJobs));
      await Promise.all(tasks);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Unable to load administrator data.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [section, token]);

  const counts = useMemo(() => ({ users: users.length, volunteers: volunteers.length, announcements: announcements.length, grievances: grievances.length, blood: blood.length, jobs: jobs.length }), [users, volunteers, announcements, grievances, blood, jobs]);

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return <div className="min-h-screen grid place-items-center bg-slate-50 p-6"><div className="max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl"><ShieldCheck className="mx-auto h-12 w-12 text-slate-900"/><h1 className="mt-4 text-xl font-black">Administrator access required</h1><p className="mt-2 text-sm text-slate-500">This control area is restricted to authorized administrators.</p></div></div>;
  }

  return <div className="min-h-screen bg-slate-50 text-slate-950">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">RP Foundation</p><h1 className="text-lg font-black tracking-tight">Administrator</h1></div>
        <button onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"><LogOut className="h-4 w-4"/> Sign out</button>
      </div>
    </header>
    <div className="mx-auto flex max-w-7xl gap-5 px-4 py-5 sm:px-6">
      <aside className="hidden w-56 shrink-0 lg:block"><div className="sticky top-24 space-y-1">{nav.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setSection(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${section === id ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-white"}`}><Icon className="h-4 w-4"/>{label}</button>)}</div></aside>
      <main className="min-w-0 flex-1">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">{nav.map(({ id, label }) => <button key={id} onClick={() => setSection(id)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold ${section === id ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{label}</button>)}</div>
        {error && <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800"><AlertTriangle className="h-4 w-4"/>{error}</div>}
        {loading && <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-500">Loading live administrator data…</div>}
        {section === "overview" && <Overview counts={counts}/>} 
        {section === "people" && <People users={users} volunteers={volunteers}/>} 
        {section === "content" && <Content announcements={announcements} reload={load}/>} 
        {section === "requests" && <Requests grievances={grievances}/>} 
        {section === "blood" && <BloodNetwork members={blood}/>} 
        {section === "services" && <div className="space-y-5"><ServicesManager/><ServiceContentManager/></div>}
        {section === "system" && <div className="space-y-5"><CmsSettings/><VisualSettings/></div>}
      </main>
    </div>
  </div>;
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Icon className="h-5 w-5 text-slate-500"/><p className="mt-4 text-3xl font-black">{value}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p></div>; }
function Overview({ counts }: { counts: Record<string, number> }) { return <><div className="mb-5"><p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">Control centre</p><h2 className="mt-1 text-2xl font-black">Overview</h2><p className="mt-1 text-sm text-slate-500">Live records only. Empty data stays empty.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"><Stat label="Users" value={counts.users} icon={Users}/><Stat label="Volunteers" value={counts.volunteers} icon={UserRoundCheck}/><Stat label="Announcements" value={counts.announcements} icon={Bell}/><Stat label="Requests" value={counts.grievances} icon={ClipboardList}/><Stat label="Blood members" value={counts.blood} icon={Droplet}/><Stat label="Job listings" value={counts.jobs} icon={BriefcaseBusiness}/></div></>; }
function People({ users, volunteers }: { users: Row[]; volunteers: Row[] }) { return <div className="space-y-5"><Table title="Users" rows={users} columns={["name", "email", "phone", "role"]}/><Table title="Volunteers" rows={volunteers} columns={["name", "registration_number", "mobile", "approval_status"]}/></div>; }
function Requests({ grievances }: { grievances: Row[] }) { return <Table title="Grievance requests" rows={grievances} columns={["id", "complainant_name", "status", "created_at"]}/>; }
function BloodNetwork({ members }: { members: Row[] }) { return <Table title="Blood Network" rows={members} columns={["name", "bloodGroup", "phone", "location", "verified"]}/>; }
function Table({ title, rows, columns }: { title: string; rows: Row[]; columns: string[] }) { return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-black">{title}</h2><span className="text-xs font-semibold text-slate-400">{rows.length} records</span></div><div className="overflow-x-auto">{rows.length === 0 ? <div className="px-5 py-10 text-center text-sm text-slate-400">No real records available.</div> : <table className="w-full text-left text-xs"><thead className="bg-slate-50 text-slate-400"><tr>{columns.map(c => <th key={c} className="px-4 py-3 font-black uppercase tracking-wider">{c.replaceAll("_", " ")}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.slice(0, 100).map((row, index) => <tr key={row.id || index}><td className="px-4 py-3 font-semibold text-slate-800">{columns.map((c, i) => <span key={c} className={i === 0 ? "block" : "hidden"}>{String(row[c] ?? "—")}</span>)}</td>{columns.slice(1).map(c => <td key={c} className="px-4 py-3 text-slate-500">{String(row[c] ?? "—")}</td>)}</tr>)}</tbody></table>}</div></section>; }
function Content({ announcements, reload }: { announcements: Row[]; reload: () => void }) { const [title, setTitle] = useState(""); const [content, setContent] = useState(""); const [saving, setSaving] = useState(false); const save = async () => { if (!title.trim() || !content.trim()) return; setSaving(true); try { await axios.post("/api/admin/announcements", { title: title.trim(), content: content.trim() }); setTitle(""); setContent(""); reload(); } finally { setSaving(false); } }; return <div className="space-y-5"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-sm font-black">Publish announcement</h2><div className="mt-4 grid gap-3"><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-950"/><textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content" rows={4} className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-950"/><button disabled={saving} onClick={save} className="w-fit rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Publish"}</button></div></section><Table title="Published announcements" rows={announcements} columns={["title", "content", "created_at"]}/></div>; }
