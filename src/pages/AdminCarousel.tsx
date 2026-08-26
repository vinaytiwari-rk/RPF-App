import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowLeft, ChevronDown, ChevronUp, Eye, EyeOff, ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import FileUpload from "../components/FileUpload";

type Slide = { id: string; titleEn: string; titleHi?: string; subEn: string; subHi?: string; image: string; route?: string; active?: boolean; order?: number };

const emptySlide = (): Slide => ({ id: `slide-${Date.now()}`, titleEn: "", subEn: "", image: "", route: "/impact", active: true });

export default function AdminCarousel() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [cms, setCms] = useState<any>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get("/api/cms").then((res) => {
      const next = res.data?.cms || {};
      const list = Array.isArray(next.carouselSlides) ? next.carouselSlides : [];
      setCms(next);
      setSlides(list.map((item: any, index: number) => ({ ...item, id: item.id || `slide-${index}-${Date.now()}`, active: item.active !== false, order: typeof item.order === "number" ? item.order : index })));
    }).catch(() => toast.error("Unable to load carousel settings.")).finally(() => setLoading(false));
  }, []);

  const ordered = useMemo(() => [...slides].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [slides]);

  const patch = (index: number, value: Partial<Slide>) => setSlides((current) => current.map((item, i) => i === index ? { ...item, ...value } : item));
  const addSlide = () => { setSlides((current) => [...current, { ...emptySlide(), order: current.length }]); setSelected(slides.length); };
  const removeSlide = (index: number) => { if (!window.confirm("Delete this carousel slide?")) return; setSlides((current) => current.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i }))); if (selected === index) setSelected(null); };
  const move = (index: number, direction: -1 | 1) => setSlides((current) => {
    const target = index + direction;
    if (target < 0 || target >= current.length) return current;
    const next = [...current];
    [next[index], next[target]] = [next[target], next[index]];
    return next.map((item, i) => ({ ...item, order: i }));
  });

  const save = async () => {
    if (!cms) return;
    const invalid = slides.some((s) => s.active !== false && (!s.titleEn.trim() || !s.image));
    if (invalid) { toast.error("Every active slide needs a title and image."); return; }
    setSaving(true);
    try {
      const payload = { ...cms, carouselSlides: slides.map((s, index) => ({ ...s, order: index })) };
      const res = await axios.post("/api/cms", payload, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.success === false) throw new Error(res.data?.error || "Save failed");
      setCms(payload);
      toast.success("Carousel published successfully.");
    } catch (err: any) { toast.error(err?.response?.data?.error || err?.message || "Unable to publish carousel."); }
    finally { setSaving(false); }
  };

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) return <div className="grid min-h-screen place-items-center bg-slate-50 p-6 text-sm font-bold text-slate-700">Administrator access required.</div>;
  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm font-bold text-slate-500">Loading carousel CMS…</div>;

  return <main className="min-h-screen bg-slate-50 px-4 py-5 pb-28 text-slate-900 sm:px-6"><div className="mx-auto max-w-5xl space-y-5">
    <header className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3"><button onClick={() => navigate("/admin")} className="mt-0.5 rounded-xl border border-slate-200 p-2 text-slate-600"><ArrowLeft className="h-4 w-4" /></button><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-600">Home Content</p><h1 className="text-xl font-black">Carousel Management</h1><p className="mt-1 text-xs text-slate-500">Upload real RP Foundation posters, edit copy, control order and publish only active slides.</p></div></div>
      <div className="flex gap-2"><button onClick={addSlide} className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-xs font-black text-orange-700"><Plus className="h-4 w-4" /> Add Slide</button><button onClick={save} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F3157] px-4 py-2.5 text-xs font-black text-white disabled:opacity-50"><Save className="h-4 w-4" /> {saving ? "Publishing…" : "Save & Publish"}</button></div>
    </header>
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]"><section className="space-y-3">{ordered.length === 0 && <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center"><ImagePlus className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 text-sm font-black">No carousel slides yet</p><p className="mt-1 text-xs text-slate-500">Add the RP Foundation posters here. They will appear on Home after publishing.</p></div>}{slides.map((slide, index) => <article key={slide.id} className={`overflow-hidden rounded-2xl border bg-white ${selected === index ? "border-orange-400 ring-2 ring-orange-100" : "border-slate-200"}`}><button onClick={() => setSelected(index)} className="flex w-full items-center gap-3 p-3 text-left"><div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">{slide.image ? <img src={slide.image} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="m-4 h-6 w-6 text-slate-400" />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{slide.titleEn || "Untitled slide"}</p><p className="mt-1 text-[10px] font-bold text-slate-400">{slide.active !== false ? "Active" : "Hidden"} · Position {index + 1}</p></div>{slide.active !== false ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}</button></article>)}</section>
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">{selected === null || !slides[selected] ? <div className="grid min-h-[430px] place-items-center text-center"><div><ImagePlus className="mx-auto h-9 w-9 text-slate-300" /><p className="mt-3 text-sm font-black">Select a slide to edit</p><p className="mt-1 text-xs text-slate-500">Add, upload and arrange your Home carousel here.</p></div></div> : (() => { const s = slides[selected]; return <div className="space-y-4"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-600">Slide {selected + 1}</p><h2 className="text-lg font-black">Edit Carousel Slide</h2></div><button onClick={() => removeSlide(selected)} className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-700"><Trash2 className="h-4 w-4" /> Delete</button></div><FileUpload label="Poster / Photo" defaultUrl={s.image} onUploadSuccess={(url) => patch(selected, { image: url })}/><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-slate-700">Title<input value={s.titleEn} onChange={(e) => patch(selected, { titleEn: e.target.value })} placeholder="e.g. Healthcare Support" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400" /></label><label className="text-xs font-bold text-slate-700">Target Page<input value={s.route || ""} onChange={(e) => patch(selected, { route: e.target.value })} placeholder="/health-care" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400" /></label></div><label className="block text-xs font-bold text-slate-700">Short Description<textarea value={s.subEn} onChange={(e) => patch(selected, { subEn: e.target.value })} placeholder="One short line describing the initiative" rows={3} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400" /></label><label className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-xs font-black"><span>Show this slide on Home</span><input type="checkbox" checked={s.active !== false} onChange={(e) => patch(selected, { active: e.target.checked })} className="h-4 w-4 accent-[#138808]" /></label><div className="flex gap-2"><button disabled={selected === 0} onClick={() => { move(selected, -1); setSelected(selected - 1); }} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black disabled:opacity-40"><ChevronUp className="h-4 w-4" /> Move Up</button><button disabled={selected === slides.length - 1} onClick={() => { move(selected, 1); setSelected(selected + 1); }} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black disabled:opacity-40"><ChevronDown className="h-4 w-4" /> Move Down</button></div></div>; })()}</section></div>
  </div></main>;
}
