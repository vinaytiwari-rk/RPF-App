import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Save, RefreshCw, ShieldCheck, FileText, Images, Instagram, Link2, Settings2, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

type Cms = Record<string, any>;
const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

const sections = [
  { id: "core", label: "Core Content", icon: FileText, keys: ["founderName", "founderDesignation", "founderMessageEn", "founderMessageHi", "aboutTextEn", "aboutTextHi", "alertBannerEn", "alertBannerHi", "helplinesMarquee"] },
  { id: "carousel", label: "Carousel", icon: Images, keys: ["carouselSlides"] },
  { id: "instagram", label: "Instagram", icon: Instagram, keys: ["instagramPosts"] },
  { id: "links", label: "Links & Social", icon: Link2, keys: ["socialLinks", "socialDirectory", "governmentSchemeUrl", "webUrl", "email", "tollFree"] },
  { id: "system", label: "Other CMS", icon: Settings2, keys: [] },
] as const;

function printable(value: any) {
  if (typeof value === "string") return value;
  try { return JSON.stringify(value, null, 2); } catch { return String(value ?? ""); }
}
function parseValue(text: string, original: any) {
  if (typeof original === "string") return text;
  try { return JSON.parse(text); } catch { throw new Error("This field contains invalid JSON."); }
}

export default function CentralContentManager() {
  const { token, user } = useAuth();
  const [cms, setCms] = useState<Cms>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [active, setActive] = useState("core");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advanced, setAdvanced] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/cms");
      const next = res.data?.cms || res.data?.data || {};
      setCms(next);
      const nextDrafts: Record<string, string> = {};
      Object.keys(next).forEach(key => { nextDrafts[key] = printable(next[key]); });
      setDrafts(nextDrafts);
      setAdvanced(JSON.stringify(next, null, 2));
      setDirty(new Set());
    } catch (error: any) { toast.error(error?.response?.data?.error || "Unable to load CMS content."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const sectionKeys = useMemo(() => {
    const selected = sections.find(item => item.id === active);
    if (selected?.keys.length) return selected.keys.filter(key => Object.prototype.hasOwnProperty.call(cms, key));
    const known = new Set(sections.flatMap(item => item.keys));
    return Object.keys(cms).filter(key => !known.has(key)).sort();
  }, [active, cms]);

  const updateDraft = (key: string, value: string) => {
    setDrafts(current => ({ ...current, [key]: value }));
    setDirty(current => new Set(current).add(key));
  };

  const publish = async (patch: Cms, label: string) => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await axios.post("/api/admin/control/cms/publish", { patch, label }, { headers: auth(token) });
      if (res.data?.success === false) throw new Error(res.data?.error || "Publish failed");
      const next = res.data?.data || { ...cms, ...patch };
      setCms(next);
      const nextDrafts = { ...drafts };
      Object.keys(patch).forEach(key => { nextDrafts[key] = printable(next[key]); });
      setDrafts(nextDrafts);
      setAdvanced(JSON.stringify(next, null, 2));
      setDirty(new Set());
      toast.success("Content published safely. Previous CMS state was snapshotted.");
    } catch (error: any) { toast.error(error?.response?.data?.error || error?.message || "Unable to publish CMS changes."); }
    finally { setSaving(false); }
  };

  const saveFields = async () => {
    const patch: Cms = {};
    try {
      for (const key of dirty) patch[key] = parseValue(drafts[key] ?? "", cms[key]);
      if (!Object.keys(patch).length) return toast("No changes to publish.");
      await publish(patch, `Content Manager: ${active}`);
    } catch (error: any) { toast.error(error?.message || "Invalid content."); }
  };

  const saveAdvanced = async () => {
    try {
      const next = JSON.parse(advanced);
      if (!next || typeof next !== "object" || Array.isArray(next)) throw new Error("CMS must be a JSON object.");
      if (!window.confirm("Publish the complete CMS object? The current live CMS will be backed up automatically.")) return;
      await publish(next, "Content Manager: advanced full CMS publish");
    } catch (error: any) { toast.error(error?.message || "Invalid CMS JSON."); }
  };

  return <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl space-y-5">
    <header className="rounded-[2rem] border border-slate-800 bg-slate-900 p-5 shadow-2xl"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-indigo-700"><ShieldCheck className="h-7 w-7" /></div><div><div className="flex flex-wrap gap-2"><span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">Central Content Manager</span><span className="text-xs text-slate-500">{user?.name || "Administrator"}</span></div><h1 className="mt-1 text-2xl font-black">One CMS. One Publishing Control Plane.</h1><p className="mt-1 text-xs text-slate-400">Carousel, Instagram, founder/about content, links and other CMS data publish through protected snapshots instead of whole-object blind writes.</p></div></div><button onClick={() => void load()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-black"><RefreshCw className="h-4 w-4" /> Refresh</button></div></header>
    <div className="flex flex-wrap gap-2 rounded-3xl border border-slate-800 bg-slate-900 p-2">{sections.map(item => { const Icon = item.icon; return <button key={item.id} onClick={() => setActive(item.id)} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black ${active === item.id ? "bg-amber-500/15 text-amber-300" : "text-slate-400 hover:bg-slate-800"}`}><Icon className="h-4 w-4" />{item.label}</button>; })}</div>
    {loading ? <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center text-sm text-slate-400">Loading CMS…</div> : <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5"><div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-black">{sections.find(item => item.id === active)?.label}</h2><p className="mt-1 text-[10px] text-slate-500">Edit only what you need. Publish creates a protected snapshot automatically.</p></div><button disabled={saving || dirty.size === 0} onClick={() => void saveFields()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black disabled:opacity-40"><Save className="h-4 w-4" />{saving ? "Publishing…" : `Publish ${dirty.size ? `(${dirty.size})` : "Changes"}`}</button></div>
      {sectionKeys.length ? <div className="grid gap-4 md:grid-cols-2">{sectionKeys.map(key => { const value = cms[key]; const complex = typeof value !== "string"; return <label key={key} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{key}</span><textarea value={drafts[key] ?? printable(value)} onChange={e => updateDraft(key, e.target.value)} rows={complex ? 9 : 4} className="mt-2 w-full resize-y rounded-xl border border-slate-800 bg-slate-900 p-3 font-mono text-xs text-slate-200 outline-none focus:border-amber-500" />{complex && <span className="mt-2 block text-[9px] text-slate-600">JSON field — arrays/objects must remain valid JSON.</span>}</label>; })}</div> : <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500">No fields are currently stored in this section.</div>}
    </section>}
    <section className="rounded-3xl border border-amber-900/30 bg-slate-900 p-5"><button onClick={() => setShowAdvanced(value => !value)} className="flex w-full items-center justify-between text-left"><div><h2 className="text-sm font-black">Advanced CMS Object</h2><p className="mt-1 text-[10px] text-slate-500">For Super Admin maintenance of fields not yet assigned to a visual editor.</p></div><Settings2 className="h-5 w-5 text-amber-400" /></button>{showAdvanced && <div className="mt-4 space-y-3"><div className="flex items-start gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-[10px] text-amber-200"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />Full-object publishing is intentionally protected by a confirmation and automatically snapshots the current live state first.</div><textarea value={advanced} onChange={e => setAdvanced(e.target.value)} rows={20} className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-200 outline-none focus:border-amber-500" /><button disabled={saving} onClick={() => void saveAdvanced()} className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-black disabled:opacity-40"><Save className="h-4 w-4" /> Publish Full CMS</button></div>}</section>
  </div></div>;
}
