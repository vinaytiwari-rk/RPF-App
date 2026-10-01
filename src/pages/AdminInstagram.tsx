import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { 
  ArrowLeft, ChevronDown, ChevronUp, Eye, EyeOff, Instagram, 
  Plus, Save, Trash2, ExternalLink, Play, Upload, Loader2, Film, CheckCircle2 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { resolveMediaUrl } from "../utils/media";

export type InstagramPost = {
  id: string;
  title: string;
  url: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  caption?: string;
  category?: string;
  active?: boolean;
  order?: number;
};

export function cleanInstagramInput(raw: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  // If user pasted full blockquote embed code
  const permalinkMatch = trimmed.match(/data-instgrm-permalink="([^"]+)"/i);
  if (permalinkMatch) {
    const rawUrl = permalinkMatch[1].replace(/&amp;/g, "&");
    const cleanMatch = rawUrl.match(/(https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[A-Za-z0-9_-]+)/i);
    if (cleanMatch) return cleanMatch[1] + "/";
    return rawUrl;
  }
  // If user pasted normal URL with extra query params
  const urlMatch = trimmed.match(/(https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[A-Za-z0-9_-]+)/i);
  if (urlMatch) {
    return urlMatch[1] + "/";
  }
  return trimmed;
}

export function extractInstagramEmbedUrl(url: string): { embedUrl: string; shortcode: string; type: "reel" | "post" | "other" } {
  if (!url) return { embedUrl: "", shortcode: "", type: "other" };
  const cleaned = cleanInstagramInput(url);
  if (cleaned.endsWith(".mp4") || cleaned.includes(".mp4?")) return { embedUrl: cleaned, shortcode: "", type: "reel" };
  if (cleaned.includes("/embed")) return { embedUrl: cleaned, shortcode: "", type: "post" };
  const match = cleaned.match(/instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/i);
  if (match) {
    const type = match[1].toLowerCase() === "reel" ? "reel" : "post";
    const shortcode = match[2];
    return { embedUrl: `https://www.instagram.com/p/${shortcode}/embed/captioned/`, shortcode, type };
  }
  return { embedUrl: cleaned, shortcode: "", type: "other" };
}

const defaultInstagramPosts: InstagramPost[] = [
  {
    id: "ig-cm-meet",
    title: "मुख्यमंत्री निवास कार्यालय, समत्व भवन में माननीय मुख्यमंत्री डॉ. मोहन यादव जी से भेंट",
    url: "https://www.instagram.com/p/Dd6j8dOMRHi/",
    caption: "आर पी फाउंडेशन के संस्थापक तथा पीपुल्स ग्रुप के उपाध्यक्ष एवं प्रबंध निदेशक श्री रोहित पंडित जी ने मध्यप्रदेश के माननीय मुख्यमंत्री डॉ. मोहन यादव जी से भेंट की।",
    category: "Leadership",
    active: true,
    order: 0
  },
  { id: "ig-1", title: "RP Foundation Healthcare & Medical Drive", url: "https://www.instagram.com/p/C3x9sample1/", caption: "Free health camp & doctor consultations for local families in rural areas.", category: "Healthcare", active: true, order: 1 },
  { id: "ig-2", title: "Jan Seva Card Distribution Camp", url: "https://www.instagram.com/reel/C3x9sample2/", caption: "Empowering citizens with digital service identity and community support.", category: "Jan Seva", active: true, order: 2 }
];

const emptyPost = (): InstagramPost => ({
  id: `ig-${Date.now()}`,
  title: "",
  url: "https://www.instagram.com/rpfoundationofficial/",
  videoUrl: "",
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
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    axios.get("/api/cms")
      .then((res) => {
        const next = res.data?.cms || {};
        const list = Array.isArray(next.instagramPosts) ? next.instagramPosts : defaultInstagramPosts;
        setCms(next);
        setPosts(list.map((item: any, index: number) => ({
          ...item,
          id: item.id || `ig-${index}-${Date.now()}`,
          active: item.active !== false,
          order: typeof item.order === "number" ? item.order : index
        })));
      })
      .catch(() => {
        toast.error("Unable to load Instagram CMS settings.");
        setPosts(defaultInstagramPosts);
      })
      .finally(() => setLoading(false));
  }, []);

  const ordered = useMemo(() => [...posts].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [posts]);

  const patch = (index: number, value: Partial<InstagramPost>) => {
    setPosts((current) => current.map((item, i) => (i === index ? { ...item, ...value } : item)));
  };

  const addPost = () => {
    setPosts((current) => [...current, { ...emptyPost(), order: current.length }]);
    setSelected(posts.length);
  };

  const removePost = (index: number) => {
    if (!window.confirm("Delete this Instagram Reel/Post?")) return;
    setPosts((current) => current.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i })));
    if (selected === index) setSelected(null);
  };

  const move = (index: number, direction: -1 | 1) => {
    setPosts((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((item, i) => ({ ...item, order: i }));
    });
  };

  // Video Upload Handler from Device
  const handleDeviceVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || selected === null) return;

    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video file size exceeds 100MB limit. Please select a shorter video.");
      e.target.value = "";
      return;
    }

    const localBlob = URL.createObjectURL(file);
    patch(selected, { videoUrl: localBlob });
    setUploadingVideo(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("video", file);
      const authToken = token || localStorage.getItem("@rpf_token") || sessionStorage.getItem("@rpf_token");
      
      const res = await axios.post("/api/upload/video", formData, {
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        }
      });
      if (res.data?.url) {
        const resolved = resolveMediaUrl(res.data.url);
        patch(selected, { videoUrl: resolved });
        toast.success("Device video uploaded successfully!");
      } else {
        throw new Error("No URL returned from server");
      }
    } catch (err: any) {
      console.warn("Video upload error:", err);
      toast.error(err.response?.data?.error || err.message || "Failed to upload video to server");
    } finally {
      setUploadingVideo(false);
      e.target.value = "";
    }
  };

  const save = async () => {
    if (!cms) return;
    const invalid = posts.some((p) => p.active !== false && (!p.title.trim() || (!p.url.trim() && !p.videoUrl?.trim())));
    if (invalid) {
      toast.error("Every active post needs a title and either a video upload or URL.");
      return;
    }
    setSaving(true);
    try {
      const authToken = token || localStorage.getItem("@rpf_token") || sessionStorage.getItem("@rpf_token");
      const nextPosts = posts.map((p, index) => ({ ...p, order: index }));
      const res = await axios.post("/api/admin/control/cms/publish", {
        patch: { instagramPosts: nextPosts },
        label: "Instagram content publish"
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.data?.success === false) throw new Error(res.data?.error || "Save failed");
      setCms({ ...cms, instagramPosts: nextPosts });
      setPosts(nextPosts);
      toast.success("Instagram content published with a protected snapshot.");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || "Unable to publish Instagram posts.");
    } finally {
      setSaving(false);
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return <div className="grid min-h-screen place-items-center bg-slate-50 p-6 text-sm font-bold text-slate-700">Administrator access required.</div>;
  }
  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm font-bold text-slate-500">Loading Instagram CMS…</div>;
  }

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
              <h1 className="text-xl font-black">Social Reels & Video CMS</h1>
              <p className="mt-1 text-xs text-slate-500">
                Upload device videos (MP4/WebM) or paste Instagram Reel URLs for in-app vertical video playback.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate("/instagram")} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-black text-rose-700 hover:bg-rose-100">
              <Play className="h-4 w-4" /> View Reels Player
            </button>
            <button onClick={addPost} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-50">
              <Plus className="h-4 w-4" /> Add Reel
            </button>
            <button onClick={save} disabled={saving} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0F3157] px-4 py-2.5 text-xs font-black text-white disabled:opacity-50 hover:bg-[#1D5B93]">
              <Save className="h-4 w-4" /> {saving ? "Publishing…" : "Save & Publish"}
            </button>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          {/* List of Reels */}
          <section className="space-y-3">
            {ordered.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <Instagram className="mx-auto h-8 w-8 text-rose-400" />
                <p className="mt-3 text-sm font-black">No social reels added yet</p>
                <p className="mt-1 text-xs text-slate-500">Upload RP Foundation videos or add Instagram Reel URLs.</p>
              </div>
            )}
            {posts.map((post, index) => (
              <article key={post.id} className={`overflow-hidden rounded-2xl border bg-white ${selected === index ? "border-rose-400 ring-2 ring-rose-100" : "border-slate-200"}`}>
                <button onClick={() => setSelected(index)} className="flex w-full items-center gap-3 p-3 text-left">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-xs">
                    {post.videoUrl ? <Film className="h-6 w-6" /> : <Instagram className="h-6 w-6" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">{post.title || "Untitled Video Reel"}</p>
                    <p className="mt-1 truncate text-[10px] font-bold text-slate-400">
                      {post.category || "Social Work"} · {post.active !== false ? "Active" : "Hidden"} · Position {index + 1}
                      {post.videoUrl && " · 📹 Video Attached"}
                    </p>
                  </div>
                  {post.active !== false ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                </button>
              </article>
            ))}
          </section>

          {/* Edit Reel Form */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            {selected === null || !posts[selected] ? (
              <div className="grid min-h-[430px] place-items-center text-center">
                <div>
                  <Instagram className="mx-auto h-9 w-9 text-rose-400" />
                  <p className="mt-3 text-sm font-black">Select a Reel to edit</p>
                  <p className="mt-1 text-xs text-slate-500">Upload device videos or edit details for the vertical player.</p>
                </div>
              </div>
            ) : (() => {
              const p = posts[selected];
              const { embedUrl } = extractInstagramEmbedUrl(p.url);
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[.16em] text-rose-600">Reel #{selected + 1}</p>
                      <h2 className="text-lg font-black">Edit Social Video Reel</h2>
                    </div>
                    <button onClick={() => removePost(selected)} className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-700">
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-bold text-slate-700">
                      Title / Heading
                      <input
                        value={p.title}
                        onChange={(e) => patch(selected, { title: e.target.value })}
                        placeholder="e.g. Mega Health Camp Video"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-rose-400"
                      />
                    </label>
                    <label className="text-xs font-bold text-slate-700">
                      Category
                      <input
                        value={p.category || ""}
                        onChange={(e) => patch(selected, { category: e.target.value })}
                        placeholder="e.g. Healthcare / Volunteers"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-rose-400"
                      />
                    </label>
                  </div>

                  {/* Device Video Upload Section */}
                  <div className="rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Film className="h-4 w-4 text-rose-600" />
                        <span className="text-xs font-black text-[#0A192F]">Device Video Upload (MP4 / WebM / MOV)</span>
                      </div>
                      {p.videoUrl && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> {p.videoUrl.includes('cloudinary.com') ? "Cloudinary CDN (0 MB Host)" : "Video Ready"}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[11px] text-slate-500">
                      Upload video directly from your device (Max 100MB). Videos stream via fast Cloudinary CDN with <strong>0 MB host disk space</strong>.
                    </p>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <label className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2.5 text-xs font-black text-white hover:brightness-105 transition cursor-pointer shadow-xs ${uploadingVideo ? "opacity-50 pointer-events-none" : ""}`}>
                        {uploadingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        <span>{uploadingVideo ? "Uploading Video from Device..." : "Select Video from Device"}</span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,video/m4v"
                          onChange={handleDeviceVideoUpload}
                          disabled={uploadingVideo}
                          className="sr-only"
                        />
                      </label>

                      {p.videoUrl && (
                        <button
                          type="button"
                          onClick={() => patch(selected, { videoUrl: "" })}
                          className="text-xs font-bold text-rose-600 hover:underline px-2"
                        >
                          Remove Video
                        </button>
                      )}
                    </div>

                    {/* External Zero-Storage Video Link */}
                    <div className="pt-2.5 border-t border-rose-100">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Or Paste Video Link (YouTube Shorts / Cloud CDN — 0 MB Server Space!)
                        <input
                          value={p.videoUrl && p.videoUrl.startsWith("http") ? p.videoUrl : ""}
                          onChange={(e) => patch(selected, { videoUrl: e.target.value })}
                          placeholder="e.g. https://www.youtube.com/shorts/SUQQ919wFs0 or Cloud MP4"
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-rose-400"
                        />
                      </label>
                      <p className="mt-1 text-[10px] text-emerald-700 font-semibold">
                        💡 Tip: Uses 0 MB cPanel disk space! Streams 24/7 directly from Google's high-speed CDN.
                      </p>
                    </div>

                    {p.videoUrl && (
                      <p className="text-[10px] font-mono text-slate-500 truncate" title={p.videoUrl}>
                        Active Stream: {p.videoUrl}
                      </p>
                    )}
                  </div>

                  {/* Optional Instagram Link / Embed Code */}
                  <label className="block text-xs font-bold text-slate-700">
                    Instagram Post / Reel URL or Embed Code
                    <div className="relative mt-1.5">
                      <input
                        value={p.url}
                        onChange={(e) => patch(selected, { url: cleanInstagramInput(e.target.value) })}
                        placeholder="Paste URL or embed blockquote (e.g. https://www.instagram.com/p/Dd6j8dOMRHi/)"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-9 text-sm outline-none focus:border-rose-400"
                      />
                      {p.url && (
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="absolute right-2.5 top-2.5 text-slate-400 hover:text-rose-600">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </label>

                  {/* Caption */}
                  <label className="block text-xs font-bold text-slate-700">
                    Caption / Description
                    <textarea
                      value={p.caption || ""}
                      onChange={(e) => patch(selected, { caption: e.target.value })}
                      placeholder="Write a short description or caption for this Reel..."
                      rows={3}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-rose-400"
                    />
                  </label>

                  {/* Live Player Preview */}
                  {(p.videoUrl || embedUrl) && (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-[.14em] text-slate-500">Live Player Preview</p>
                      {p.videoUrl ? (
                        <video src={resolveMediaUrl(p.videoUrl)} controls className="h-[360px] w-full rounded-xl object-cover bg-black" />
                      ) : (
                        <iframe
                          src={embedUrl}
                          title="Instagram Preview"
                          className="h-[360px] w-full rounded-xl border-0 bg-white"
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        />
                      )}
                    </div>
                  )}

                  {/* Ordering & Active Toggle */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    <button onClick={() => move(selected, -1)} disabled={selected === 0} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black disabled:opacity-40">
                      <ChevronUp className="h-4 w-4" /> Move Up
                    </button>
                    <button onClick={() => move(selected, 1)} disabled={selected === posts.length - 1} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black disabled:opacity-40">
                      <ChevronDown className="h-4 w-4" /> Move Down
                    </button>
                    <label className="ml-auto flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 text-xs font-black cursor-pointer">
                      <span>Active in Reels Player</span>
                      <input type="checkbox" checked={p.active !== false} onChange={(e) => patch(selected, { active: e.target.checked })} />
                    </label>
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
