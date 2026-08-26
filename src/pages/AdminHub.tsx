import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ServicesManager from "../components/ServicesManager";
import ServiceContentManager from "../components/ServiceContentManager";
import { CmsSettings } from "../components/admin/CmsSettings";
import {
  AlertTriangle,
  BriefcaseBusiness,
  ClipboardList,
  Droplet,
  FileText,
  LayoutGrid,
  LogOut,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Users,
  Images,
  Trash2,
} from "lucide-react";

type Section = "overview" | "people" | "content" | "requests" | "blood" | "services" | "system";
type Row = Record<string, unknown>;
type AdminState = {
  users: Row[];
  volunteers: Row[];
  announcements: Row[];
  grievances: Row[];
  blood: Row[];
  jobs: Row[];
};

const nav: Array<{ id: Section; label: string; icon: typeof Users }> = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "people", label: "People & Volunteers", icon: Users },
  { id: "content", label: "Announcements & CMS", icon: FileText },
  { id: "requests", label: "Grievances & Beneficiaries", icon: ClipboardList },
  { id: "blood", label: "Blood Network", icon: Droplet },
  { id: "services", label: "Services Portal", icon: BriefcaseBusiness },
  { id: "system", label: "System Config", icon: Settings2 },
];

const emptyState: AdminState = { users: [], volunteers: [], announcements: [], grievances: [], blood: [], jobs: [] };
const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

async function getAdmin(url: string, token: string): Promise<Row[]> {
  const response = await axios.get(url, { headers: authHeaders(token) });
  const payload = response.data?.data ?? response.data;
  if (Array.isArray(payload)) return payload as Row[];
  if (Array.isArray(payload?.items)) return payload.items as Row[];
  return [];
}

function firstText(row: Row, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim()) return String(value);
  }
  return "—";
}

function DataTable({ title, rows, emptyText, onDelete }: { title: string; rows: Row[]; emptyText: string; onDelete?: (row: Row) => void }) {
  if (!rows.length) return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-medium text-slate-500">{emptyText}</div>;
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-black text-slate-900">{title}</h2></div>
      <div className="divide-y divide-slate-100">
        {rows.map((row, index) => (
          <div key={String(row.id ?? row._id ?? index)} className="flex items-center gap-4 px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900">{firstText(row, ["name", "title", "subject", "email", "registration_number", "id"])}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{firstText(row, ["status", "category", "email", "phone", "created_at", "description"])}</p>
            </div>
            {onDelete && <button onClick={() => onDelete(row)} className="rounded-xl border border-rose-200 p-2 text-rose-600 hover:bg-rose-50" aria-label="Delete record"><Trash2 className="h-4 w-4" /></button>}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AdminHub() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("overview");
  const [data, setData] = useState<AdminState>(emptyState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErrors([]);
    const endpoints: Array<[keyof AdminState, string]> = [
      ["users", "/api/admin/users"],
      ["volunteers", "/api/admin/volunteers"],
      ["announcements", "/api/admin/announcements"],
      ["grievances", "/api/admin/grievances"],
      ["blood", "/api/admin/blood_donors"],
      ["jobs", "/api/admin/jobs"],
    ];
    const results = await Promise.allSettled(endpoints.map(([, url]) => getAdmin(url, token)));
    const next: AdminState = { ...emptyState };
    const failed: string[] = [];
    results.forEach((result, index) => {
      const [key, url] = endpoints[index];
      if (result.status === "fulfilled") next[key] = result.value;
      else failed.push(`${url}: ${axios.isAxiosError(result.reason) ? result.reason.response?.data?.error || result.reason.message : "request failed"}`);
    });
    setData(next);
    setErrors(failed);
    setLoading(false);
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  const counts = useMemo(() => ({
    people: data.users.length + data.volunteers.length,
    volunteers: data.volunteers.length,
    announcements: data.announcements.length,
    grievances: data.grievances.length,
    blood: data.blood.length,
    jobs: data.jobs.length,
  }), [data]);

  const deleteVolunteer = async (row: Row) => {
    if (!token) return;
    const id = String(row.id ?? row._id ?? "");
    if (!id) { toast.error("This volunteer record has no valid ID."); return; }
    const name = firstText(row, ["name", "username", "email", "registration_number"]);
    if (!window.confirm(`Delete volunteer “${name}”? This cannot be undone.`)) return;
    try {
      const response = await axios.delete(`/api/admin/volunteers/${id}`, { headers: authHeaders(token) });
      if (response.data?.success === false) throw new Error(response.data?.error || "Delete request was rejected.");
      toast.success("Volunteer deleted.");
      await load();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.error || error.message : error instanceof Error ? error.message : "Delete failed.";
      toast.error(message);
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return <div className="grid min-h-screen place-items-center bg-slate-50 p-6"><div className="max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl"><ShieldCheck className="mx-auto h-12 w-12 text-slate-900" /><h1 className="mt-4 text-xl font-black">Administrator access required</h1><p className="mt-2 text-sm text-slate-500">This control area is restricted to authorized administrators.</p></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10 text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#000080]">RP Foundation</p><h1 className="text-lg font-black tracking-tight">Administrator Control</h1></div><div className="flex gap-2"><button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold" disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</button><button onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"><LogOut className="h-4 w-4" /> Sign out</button></div></div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-5 px-4 py-5 sm:px-6">
        <aside className="hidden w-60 shrink-0 lg:block"><div className="sticky top-24 space-y-1">{nav.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setSection(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold ${section === id ? "bg-[#000080] text-white" : "text-slate-600 hover:bg-white"}`}><Icon className="h-4 w-4" />{label}</button>)}<button onClick={() => navigate("/admin/carousel")} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-slate-600 hover:bg-white"><Images className="h-4 w-4" />Carousel Manager</button></div></aside>
        <main className="min-w-0 flex-1"><div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">{nav.map(({ id, label }) => <button key={id} onClick={() => setSection(id)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold ${section === id ? "bg-[#000080] text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{label}</button>)}<button onClick={() => navigate("/admin/carousel")} className="whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">Carousel</button></div>
          {errors.length > 0 && <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><div className="flex items-center gap-2 font-bold"><AlertTriangle className="h-4 w-4" />Some administrator data could not be loaded</div><ul className="mt-2 list-disc space-y-1 pl-5 text-xs">{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
          {loading && <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-500">Loading administrator data…</div>}
          {section === "overview" && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Object.entries(counts).map(([label, value]) => <button key={label} onClick={() => setSection(label === "people" || label === "volunteers" ? "people" : label === "announcements" ? "content" : label === "grievances" ? "requests" : label === "blood" ? "blood" : "services")} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm"><p className="text-xs font-bold capitalize text-slate-500">{label.replace(/([A-Z])/g, " $1")}</p><p className="mt-2 text-3xl font-black text-slate-900">{value}</p></button>)}</div>}
          {section === "people" && <div className="space-y-4"><DataTable title="Registered Users" rows={data.users} emptyText="No user records were returned by the API." /><DataTable title="Volunteers" rows={data.volunteers} emptyText="No volunteer records were returned by the API." onDelete={deleteVolunteer} /></div>}
          {section === "content" && <DataTable title="Announcements" rows={data.announcements} emptyText="No announcements were returned by the API." />}
          {section === "requests" && <DataTable title="Grievances & Beneficiary Requests" rows={data.grievances} emptyText="No grievance records were returned by the API." />}
          {section === "blood" && <DataTable title="Blood Network" rows={data.blood} emptyText="No blood donor records were returned by the API." />}
          {section === "services" && <div className="space-y-5"><DataTable title="Employment Records" rows={data.jobs} emptyText="No job records were returned by the API." /><ServicesManager /><ServiceContentManager /></div>}
          {section === "system" && <CmsSettings />}
        </main>
      </div>
    </div>
  );
}
