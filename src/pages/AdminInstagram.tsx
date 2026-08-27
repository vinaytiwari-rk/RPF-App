import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowLeft, ChevronDown, ChevronUp, Eye, EyeOff, Instagram, Plus, Save, Trash2, ExternalLink, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export type InstagramPost = {
  id: string;
  title: string;
  url: string;
  caption?: string;
  category?: string;
  active?: boolean;
  order?: number;
};

export function extractInstagramEmbedUrl(url: string): { embedUrl: string; shortcode: string; type: "reel" | "post" | "other" } {
  if (!url) return { embedUrl: "", shortcode: "", type: "other" };
  const trimmed = url.trim();
  if (trimmed.includes("/embed")) return { embedUrl: trimmed, shortcode: "", type: "post" };
  const match = trimmed.match(/instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/i);
  if (match) {
    const type = match[1].toLowerCase() === "reel" ? "reel" : "post";
    const shortcode = match[2];
    return {
      embedUrl: `https://www.instagram.com/p/${shortcode}/embed`,
      shortcode,
      type
    };
  }
  return { embedUrl: trimmed, shortcode: "", type: "other" };
}

const defaultInstagramPosts: InstagramPost[] = [
  {
    id: "ig-1",
    title: "RP Foundation Healthcare & Medical Drive",
    url: "https://www.instagram.com/p/C3x9sample1/",
    caption: "Free health camp & doctor consultations for local families in rural areas.",
    category: "Healthcare",
    active: true,
    order: 0
  },
  {
    id: "ig-2",
    title: "Jan Seva Card Distribution Camp",
    url: "https://www.instagram.com/reel/C3x9sample2/",
    caption: "Empowering citizens with digital service identity and community support.",
    category: "Jan Seva",
    active: true,
    order: 1
  }
];

const emptyPost = (): InstagramPost => ({
  id: `ig-${Date.now()}`,
  title: "",
  url: "",
  caption: "",
  category: "Social Work",
  active: true
});

export default function AdminInstagram() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [cms, setCms] = useState<any>(null);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get("/api/cms").then((res) => {
      const next = res.data?.cms || {};
      const list = Array.isArray(next.instagramPosts) ? next.instagramPosts : defaultInstagramPosts;
      setCms(next);
      setPosts(list.map((item: any, index: number) => ({
        ...item,
        id: item.id || `ig-${index}-${Date.now()}`,
        active: item.active !== false,
        order: typeof item.order === "number" ? item.order : index
      })));
    }).catch(() => {
      toast.error("Unable to load Instagram CMS settings.");
      setPosts(defaultInstagramPosts);
    }).finally(() => setLoading(false));
  }, []);

  const ordered = useMemo(() => [...posts].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [posts]);

  const patch = (index: number, value: Partial<InstagramPost>) => setPosts((current) => current.map((item, i) => i === index ? { ...item, ...value } : item));
  
  const addPost = () => {
    setPosts((current) => [...current, { ...emptyPost(), order: current.length }]);
    setSelected(posts.length);
  };

  const removePost = (index: number) => {
    if (!window.confirm("Delete this Instagram Reel/Post?")) return;
    setPosts((current) => current.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i })));
    if (selected === index) setSelected(null);
  };

  const move = (index: number, direction: -1 | 1) => setPosts((current) => {
    const target = index + direction;
    if (target < 0 || target >= current.length) return current;
    const next = [...current];
    [next[index], next[target]] = [next[target], next[index]];
    return next.map((item, i) => ({ ...item, order: i }));
  });

  const save = async () => {
    if (!cms) return;
    const invalid = posts.some((p) => p.active !== false && (!p.title.trim() || !p.url.trim()));
    if (invalid) {
      toast.error("Every active Instagram post needs a title and URL.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...cms, instagramPosts: posts.map((p, index) => ({ ...p, order: index })) };
      const res = await axios.post("/api/cms", payload, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.success === false) throw new Error(res.data?.error || "Save failed");
      setCms(payload);
      toast.success("Instagram Reels published successfully.");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || "Unable to publish Instagram posts.");
    } finally {
      setSaving(false);
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return <div className="grid min-h-screen place-items-center bg-slate-50 p-6 text-sm font-bold text-slate-700">Administrator access required.</div>;
  }
  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm font-bold text-slate-500">Loading Instagram CMS…</div>;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 pb-28 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <button onClick={() => navigate("/admin")} className="mt-0.5 rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-rose-600">Media Content</p>
              <h1 className="text-xl font-black">Instagram Reels & Posts CMS</h1>
              <p className="mt-1 text-xs text-slate-500">Paste any Instagram Post or Reel URL. Control display order, captions, and active status for the in-app player.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate("/instagram")} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-black text-rose-700 hover:bg-rose-100">
              <Play className="h-4 w-4" /> View Reels Player
            </button>
            <button onClick={addPost} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-50">
              <Plus className="h-4 w-4" /> Add Post/Reel
            </button>
            <button onClick={save} disabled={saving} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0F3157] px-4 py-2.5 text-xs font-black text-white disabled:opacity-50 hover:bg-[#1D5B93]">
              <Save className="h-4 w-4" /> {saving ? "Publishing…" : "Save & Publish"}
            </button>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-3">
            {ordered.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <Instagram className="mx-auto h-8 w-8 text-rose-400" />
                <p className="mt-3 text-sm font-black">No Instagram posts added yet</p>
                <p className="mt-1 text-xs text-slate-500">Add RP Foundation Instagram Reels or Post URLs here.</p>
              </div>
            )}
            {posts.map((post, index) => {
              const { embedUrl } = extractInstagramEmbedUrl(post.url);
              return (
                <article key={post.id} className={`overflow-hidden rounded-2xl border bg-white ${selected === index ? "border-rose-400 ring-2 ring-rose-100" : "border-slate-200"}`}>
                  <button onClick={() => setSelected(index)} className="flex w-full items-center gap-3 p-3 text-left">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-xs">
                      <Instagram className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">{post.title || "Untitled Instagram post"}</p>
                      <p className="mt-1 truncate text-[10px] font-bold text-slate-400">
                        {post.category || "Social Work"} · {post.active !== false ? "Active" : "Hidden"} · Position {index + 1}
                      </p>
                    </div>
                    {post.active !== false ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                  </button>
                </article>
              );
            })}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            {selected === null || !posts[selected] ? (
              <div className="grid min-h-[430px] place-items-center text-center">
                <div>
                  <Instagram className="mx-auto h-9 w-9 text-rose-400" />
                  <p className="mt-3 text-sm font-black">Select an Instagram post to edit</p>
                  <p className="mt-1 text-xs text-slate-500">Add, arrange and preview Instagram Reels for the vertical swipe player.</p>
                </div>
              </div>
            ) : (() => {
              const p = posts[selected];
              const { embedUrl } = extractInstagramEmbedUrl(p.url);
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[.16em] text-rose-600">Post {selected + 1}</p>
                      <h2 className="text-lg font-black">Edit Instagram Reel / Post</h2>
                    </div>
                    <button onClick={() => removePost(selected)} className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-700">
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-bold text-slate-700">
                      Title / Heading
                      <input value={p.title} onChange={(e) => patch(selected, { title: e.target.value })} placeholder="e.g. Mega Health Camp Reel" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-rose-400" />
                    </label>
                    <label className="text-xs font-bold text-slate-700">
                      Category
                      <input value={p.category || ""} onChange={(e) => patch(selected, { category: e.target.value })} placeholder="e.g. Healthcare / Volunteers" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-rose-400" />
                    </label>
                  </div>

                  <label className="block text-xs font-bold text-slate-700">
                    Instagram Post or Reel URL
                    <div className="relative mt-1.5">
                      <input value={p.url} onChange={(e) => patch(selected, { url: e.target.value })} placeholder="https://www.instagram.com/reel/Cxxxxxx/ or https://www.instagram.com/p/Cxxxxxx/" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-9 text-sm outline-none focus:border-rose-400" />
                      {p.url && (
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="absolute right-2.5 top-2.5 text-slate-400 hover:text-rose-600">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </label>

                  <label className="block text-xs font-bold text-slate-700">
                    Caption / Description
                    <textarea value={p.caption || ""} onChange={(e) => patch(selected, { caption: e.target.value })} placeholder="Write a short description or caption for this Reel..." rows={3} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-rose-400" />
                  </label>

                  {embedUrl && (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-[.14em] text-slate-500">Live Embed Preview</p>
                      <iframe src={embedUrl} title="Instagram Preview" className="h-[360px] w-full rounded-xl border-0 bg-white" allowTransparency />
                    </div>
                  )}

                  <label className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-xs font-black">
                    <span>Show this Reel in App Swipe Player</span>
                    <input type="checkbox" checked={p.active !== false} onChange={(e) => patch(selected, { active: e.target.checked })} className="h-4 w-4 accent-rose-600" />
                  </label>

                  <div className="flex gap-2">
                    <button disabled={selected === 0} onClick={() => { move(selected, -1); setSelected(selected - 1); }} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black disabled:opacity-40">
                      <ChevronUp className="h-4 w-4" /> Move Up
                    </button>
                    <button disabled={selected === posts.length - 1} onClick={() => { move(selected, 1); setSelected(selected + 1); }} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black disabled:opacity-40">
                      <ChevronDown className="h-4 w-4" /> Move Down
                    </button>
                  </div>
                </div>
              );
            })()}
          </section>
        </div>
      </div>
    </main>
  );
}