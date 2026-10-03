import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { 
  ArrowLeft, ChevronDown, ChevronUp, Eye, EyeOff, Instagram, 
  Plus, Save, Trash2, ExternalLink, Play, Upload, Loader2, Film, CheckCircle2,
  Youtube, Code, ShieldCheck, Sparkles, Pencil, Copy, RefreshCw
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
  embedUrl?: string;
  videoId?: string;
  caption?: string;
  category?: string;
  platform?: "youtube" | "instagram";
  active?: boolean;
  order?: number;
};

export function parseSocialEmbed(raw: string): {
  platform: "youtube" | "instagram";
  cleanUrl: string;
  embedUrl: string;
  videoId?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  suggestedTitle?: string;
} {
  if (!raw) {
    return { platform: "instagram", cleanUrl: "", embedUrl: "" };
  }

  const trimmed = raw.trim();

  // 1. Raw <iframe> check: <iframe ... src="..." ...>
  const iframeMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch) {
    const src = iframeMatch[1];
    if (src.includes("youtube.com") || src.includes("youtu.be")) {
      const ytIdMatch = src.match(/(?:embed\/|shorts\/|watch\?v=|live\/|v=)([A-Za-z0-9_-]{11})/i);
      const videoId = ytIdMatch ? ytIdMatch[1] : undefined;
      return {
        platform: "youtube",
        cleanUrl: videoId ? `https://www.youtube.com/shorts/${videoId}` : src,
        embedUrl: videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&modestbranding=1&rel=0` : src,
        videoId,
        thumbnailUrl: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "/assets/founder.png"
      };
    }
    if (src.includes("instagram.com")) {
      const igMatch = src.match(/instagram\.com\/(?:reel|reels|p|tv|share)\/([A-Za-z0-9_-]+)/i);
      const shortcode = igMatch ? igMatch[1] : "";
      return {
        platform: "instagram",
        cleanUrl: shortcode ? `https://www.instagram.com/p/${shortcode}/` : src,
        embedUrl: shortcode ? `https://www.instagram.com/p/${shortcode}/embed/captioned/` : src,
        thumbnailUrl: shortcode ? `https://images.weserv.nl/?url=instagram.com/p/${shortcode}/media/?size=l` : "/assets/founder.png"
      };
    }
    return {
      platform: "instagram",
      cleanUrl: src,
      embedUrl: src
    };
  }

  // 2. Instagram Blockquote Embed Code (<blockquote class="instagram-media" ...>)
  if (trimmed.includes("instagram-media") || trimmed.includes("data-instgrm-permalink")) {
    const permalinkMatch = trimmed.match(/data-instgrm-permalink=["']([^"']+)["']/i);
    const permalink = permalinkMatch ? permalinkMatch[1].replace(/&amp;/g, "&") : "";
    const shortcodeMatch = (permalink || trimmed).match(/instagram\.com\/(?:reel|reels|p|tv|share)\/([A-Za-z0-9_-]+)/i);
    const shortcode = shortcodeMatch ? shortcodeMatch[1] : "";

    // Extract caption / title text inside blockquote if available
    let extractedText = "";
    const textMatch = trimmed.match(/<a[^>]*>(.*?)<\/a>/i);
    if (textMatch) {
      extractedText = textMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }

    return {
      platform: "instagram",
      cleanUrl: shortcode ? `https://www.instagram.com/p/${shortcode}/` : (permalink || trimmed),
      embedUrl: shortcode ? `https://www.instagram.com/p/${shortcode}/embed/captioned/` : (permalink || trimmed),
      thumbnailUrl: shortcode ? `https://images.weserv.nl/?url=instagram.com/p/${shortcode}/media/?size=l` : "/assets/founder.png",
      suggestedTitle: extractedText.length > 5 ? extractedText.slice(0, 140) : undefined
    };
  }

  // 3. Direct MP4 / WebM / Cloudinary video URL
  if (trimmed.match(/\.(mp4|webm|mov|m4v)($|\?)/i) || (trimmed.includes("res.cloudinary.com") && trimmed.includes("/video/"))) {
    return {
      platform: "instagram",
      cleanUrl: trimmed,
      embedUrl: trimmed,
      videoUrl: trimmed,
      thumbnailUrl: "/assets/founder.png"
    };
  }

  // 4. YouTube (Shorts, Watch, youtu.be, live, embed)
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
  if (ytMatch) {
    const videoId = ytMatch[1];
    return {
      platform: "youtube",
      cleanUrl: `https://www.youtube.com/shorts/${videoId}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&modestbranding=1&rel=0`,
      videoId,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    };
  }

  // 5. Instagram (Reels, Posts, IGTV, share links with query params)
  const igMatch = trimmed.match(/instagram\.com\/(?:reel|reels|p|tv|share)\/([A-Za-z0-9_-]+)/i);
  if (igMatch) {
    const shortcode = igMatch[1];
    return {
      platform: "instagram",
      cleanUrl: `https://www.instagram.com/p/${shortcode}/`,
      embedUrl: `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
      thumbnailUrl: `https://images.weserv.nl/?url=instagram.com/p/${shortcode}/media/?size=l`
    };
  }

  // 6. Generic Link / Embed (never truncate, never cut)
  return {
    platform: "instagram",
    cleanUrl: trimmed,
    embedUrl: trimmed
  };
}

export function cleanInstagramInput(raw: string): string {
  return parseSocialEmbed(raw).cleanUrl;
}

export function extractInstagramEmbedUrl(url: string): { embedUrl: string; shortcode: string; type: "reel" | "post" | "other" } {
  const parsed = parseSocialEmbed(url);
  const shortcode = parsed.cleanUrl.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i)?.[1] || "";
  return {
    embedUrl: parsed.embedUrl,
    shortcode,
    type: parsed.platform === "youtube" ? "reel" : shortcode ? "post" : "other"
  };
}

const defaultInstagramPosts: InstagramPost[] = [
  {
    id: "ig-cm-meet",
    title: "मुख्यमंत्री निवास कार्यालय, समत्व भवन में माननीय मुख्यमंत्री डॉ. मोहन यादव जी से भेंट",
    url: "https://www.instagram.com/p/Dd6j8dOMRHi/",
    caption: "आर पी फाउंडेशन के संस्थापक तथा पीपुल्स ग्रुप के उपाध्यक्ष एवं प्रबंध निदेशक श्री रोहित पंडित जी ने मध्यप्रदेश के माननीय मुख्यमंत्री डॉ. मोहन यादव जी से भेंट की।",
    category: "Leadership",
    platform: "instagram",
    active: true,
    order: 0
  }
];

const emptyPost = (): InstagramPost => ({
  id: `social-${Date.now()}`,
  title: "",
  url: "https://www.instagram.com/rpfoundationofficial/",
  videoUrl: "",
  caption: "",
  category: "Social Work",
  platform: "instagram",
  active: true
});

export default function AdminInstagram() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [cms, setCms] = useState<any>(null);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<"all" | "youtube" | "instagram">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    axios.get("/api/cms")
      .then((res) => {
        const next = res.data?.cms || {};
        const list = Array.isArray(next.instagramPosts) ? next.instagramPosts : defaultInstagramPosts;
        setCms(next);
        // Exclude any X/Twitter items
        const cleanList = list.filter((item: any) => item.platform !== "x" && !String(item.url || "").includes("twitter.com") && !String(item.url || "").includes("x.com"));
        setPosts(cleanList.map((item: any, index: number) => ({
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

  const patch = (index: number, value: Partial<InstagramPost>) => {
    setPosts((current) => current.map((item, i) => (i === index ? { ...item, ...value } : item)));
  };

  const addPost = () => {
    const newIndex = posts.length;
    setPosts((current) => [...current, { ...emptyPost(), order: newIndex }]);
    setSelected(newIndex);
    setTimeout(() => {
      const el = document.getElementById("edit-reel-form-panel");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const duplicatePost = (index: number) => {
    const target = posts[index];
    if (!target) return;
    const newIndex = posts.length;
    const duplicated: InstagramPost = {
      ...target,
      id: `social-${Date.now()}`,
      title: `${target.title} (Copy)`,
      order: newIndex
    };
    setPosts((current) => [...current, duplicated]);
    setSelected(newIndex);
    toast.success("Reel duplicated!");
    setTimeout(() => {
      const el = document.getElementById("edit-reel-form-panel");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const removePost = (index: number) => {
    if (!window.confirm("क्या आप इस रील / पोस्ट को हटाना चाहते हैं? (Delete this post?)")) return;
    setPosts((current) => current.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i })));
    if (selected === index) setSelected(null);
    else if (selected !== null && selected > index) setSelected(selected - 1);
    toast.success("पोस्ट हटाई गई! लाइव ऐप में लागू करने के लिए 'Save & Publish' पर क्लिक करें।");
  };

  const removeAllDemoItems = () => {
    if (!window.confirm("क्या आप सभी डेमो / डमी रील्स व ट्वीट्स हटाना चाहते हैं? केवल आपके द्वारा जोड़े गए असली पोस्ट ही रहेंगे।")) return;
    const cleaned = posts.filter((p) => {
      const id = String(p.id || "").toLowerCase();
      const title = String(p.title || "").toLowerCase();
      const url = String(p.url || "").toLowerCase();
      if (p.platform === "x" || url.includes("twitter.com") || url.includes("x.com") || id.startsWith("x-")) return false;
      if (id === "ig-1" || id === "ig-2" || id === "ig-3" || id.includes("sample")) return false;
      if (title.includes("healthcare & medical drive") || title.includes("card distribution camp") || title.includes("sports support") || title.includes("blood donation") || title.includes("announcement (@rpfoundation15)")) return false;
      return true;
    });
    setPosts(cleaned.map((p, i) => ({ ...p, order: i })));
    setSelected(cleaned.length > 0 ? 0 : null);
    toast.success("सभी डमी व X (Twitter) पोस्ट्स हटाई गईं! बदलाव लागू करने के लिए 'Save & Publish' पर क्लिक करें।");
  };

  const removeAllPosts = () => {
    if (!window.confirm("क्या आप वाकई सभी रील्स और पोस्ट्स हटाना चाहते हैं? (Delete all posts?)")) return;
    setPosts([]);
    setSelected(null);
    toast.success("सभी पोस्ट्स हटाई गईं! लाइव ऐप में लागू करने के लिए 'Save & Publish' दबाएं।");
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
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-rose-600">Media Content & Embeds</p>
              <h1 className="text-xl font-black">Social Media & Video Embed CMS</h1>
              <p className="mt-1 text-xs text-slate-500">
                YouTube Shorts, Instagram Reels या Device Video जोड़ें। सभी मीडिया बिना बाहर खुले 100% ऐप के अंदर ही स्ट्रीम होंगे।
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => navigate("/instagram")} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-black text-rose-700 hover:bg-rose-100 cursor-pointer">
              <Play className="h-4 w-4" /> View Reels Player
            </button>
            <button type="button" onClick={removeAllDemoItems} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-800 hover:bg-amber-100 cursor-pointer">
              <Trash2 className="h-4 w-4 text-amber-600" /> Remove Demo Posts
            </button>
            <button type="button" onClick={addPost} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-black text-slate-700 hover:bg-slate-50 cursor-pointer">
              <Plus className="h-4 w-4" /> Add Embed / Reel
            </button>
            <button type="button" onClick={save} disabled={saving} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0F3157] px-4 py-2 text-xs font-black text-white disabled:opacity-50 hover:bg-[#1D5B93] cursor-pointer shadow-sm">
              <Save className="h-4 w-4" /> {saving ? "Publishing…" : "Save & Publish"}
            </button>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          {/* List of Reels */}
          <section className="space-y-3">
            {/* Filter by Platform */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setFilterPlatform("all")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filterPlatform === "all" ? "bg-slate-900 text-white shadow-xs" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                All ({posts.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterPlatform("youtube")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filterPlatform === "youtube" ? "bg-rose-600 text-white shadow-xs" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                <Youtube className="h-3 w-3" /> YouTube ({posts.filter(p => p.platform === "youtube").length})
              </button>
              <button
                type="button"
                onClick={() => setFilterPlatform("instagram")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filterPlatform === "instagram" ? "bg-pink-600 text-white shadow-xs" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                <Instagram className="h-3 w-3" /> Instagram ({posts.filter(p => p.platform === "instagram" || (!p.platform && !p.videoUrl)).length})
              </button>
            </div>

            {posts.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <Instagram className="mx-auto h-8 w-8 text-rose-400" />
                <p className="mt-3 text-sm font-black">No social reels or posts in feed</p>
                <p className="mt-1 text-xs text-slate-500">Click &apos;Add Embed / Reel&apos; above to add your own YouTube shorts or Instagram reels.</p>
              </div>
            )}

            {posts.map((post, index) => {
              if (filterPlatform !== "all" && post.platform !== filterPlatform) return null;
              const isSelected = selected === index;
              return (
                <article
                  key={post.id}
                  className={`overflow-hidden rounded-2xl border transition-all ${
                    isSelected
                      ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20 shadow-md"
                      : "border-slate-200 bg-white hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <div className="p-3.5 space-y-3">
                    {/* Header info row */}
                    <div className="flex items-start gap-3">
                      <div
                        onClick={() => {
                          setSelected(index);
                          const el = document.getElementById("edit-reel-form-panel");
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-xs cursor-pointer hover:scale-105 transition-transform ${
                          post.platform === "youtube"
                            ? "bg-rose-600"
                            : post.videoUrl
                            ? "bg-purple-600"
                            : "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600"
                        }`}
                      >
                        {post.platform === "youtube" ? (
                          <Youtube className="h-6 w-6 fill-white" />
                        ) : post.videoUrl ? (
                          <Film className="h-6 w-6" />
                        ) : (
                          <Instagram className="h-6 w-6" />
                        )}
                      </div>

                      <div
                        onClick={() => {
                          setSelected(index);
                          const el = document.getElementById("edit-reel-form-panel");
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="min-w-0 flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            post.platform === "youtube"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-pink-100 text-pink-800"
                          }`}>
                            {post.platform === "youtube" ? "YouTube" : "Instagram"}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {post.category || "Social Work"}
                          </span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-700 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-full animate-pulse">
                              <Pencil className="h-2.5 w-2.5" /> Editing Now
                            </span>
                          )}
                        </div>

                        {/* Title - Never truncate abruptly, show readable 2 lines */}
                        <p className="mt-1 text-sm font-black text-slate-900 leading-snug line-clamp-2">
                          {post.title || "Untitled Video Reel"}
                        </p>

                        {post.caption && (
                          <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                            {post.caption}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons Row on EVERY Card (Edit, Delete, Active/Hide) */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        {/* ✏️ EDIT BUTTON */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(index);
                            const el = document.getElementById("edit-reel-form-panel");
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-black transition-all cursor-pointer shadow-2xs"
                        >
                          <Pencil className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Edit (बदलें)</span>
                        </button>

                        {/* 🗑️ DELETE BUTTON */}
                        <button
                          type="button"
                          onClick={() => removePost(index)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-black transition-all cursor-pointer shadow-2xs"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          <span>Delete (हटाएं)</span>
                        </button>
                      </div>

                      {/* 👁️ ACTIVE / HIDE TOGGLE */}
                      <button
                        type="button"
                        onClick={() => toggleActive(index)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                          post.active !== false
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {post.active !== false ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5 text-slate-400" />}
                        <span>{post.active !== false ? "Active" : "Hidden"}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          {/* Edit Reel Form */}
          <section id="edit-reel-form-panel" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-4 self-start">
            {selected === null || !posts[selected] ? (
              <div className="grid min-h-[430px] place-items-center text-center">
                <div>
                  <Instagram className="mx-auto h-9 w-9 text-rose-400" />
                  <p className="mt-3 text-sm font-black">Select a Reel from left or click &apos;Add Embed / Reel&apos;</p>
                  <p className="mt-1 text-xs text-slate-500">Edit any details or paste embed code. Nothing will be cut off.</p>
                </div>
              </div>
            ) : (() => {
              const p = posts[selected];
              const { embedUrl } = extractInstagramEmbedUrl(p.url);
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[.16em] text-rose-600">Reel #{selected + 1}</p>
                      <h2 className="text-lg font-black text-slate-900">Edit Reel / Video Embed</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => duplicatePost(selected)}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" /> Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={() => removePost(selected)}
                        className="inline-flex items-center gap-1 rounded-xl bg-rose-50 border border-rose-200 px-2.5 py-1.5 text-xs font-black text-rose-700 hover:bg-rose-100 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-rose-600" /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Title - Spacious Textarea so text never gets cut off */}
                  <label className="block text-xs font-bold text-slate-700">
                    Title / Heading (शीर्षक)
                    <textarea
                      value={p.title}
                      onChange={(e) => patch(selected, { title: e.target.value })}
                      placeholder="e.g. मुख्यमंत्री निवास कार्यालय में माननीय मुख्यमंत्री जी से भेंट"
                      rows={2}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-400 resize-y font-medium"
                    />
                  </label>

                  {/* Category with Quick Chips */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Category (श्रेणी)
                    </label>
                    <div className="flex flex-wrap gap-1.5 pb-1">
                      {["Social Work", "Healthcare", "Leadership", "Empowerment", "Culture", "Ground Action"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => patch(selected, { category: cat })}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            p.category === cat
                              ? "bg-[#0F3157] text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <input
                      value={p.category || ""}
                      onChange={(e) => patch(selected, { category: e.target.value })}
                      placeholder="Custom category name..."
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-rose-400"
                    />
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
                    </div>

                    {p.videoUrl && (
                      <p className="text-[10px] font-mono text-slate-500 truncate" title={p.videoUrl}>
                        Active Stream: {p.videoUrl}
                      </p>
                    )}
                  </div>

                  {/* Universal Social Embed Code or URL Input - NOTHING CUT OFF */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <Code className="h-4 w-4 text-rose-600" />
                        <span>Embed Code or Link (YouTube / Instagram / &lt;iframe&gt;)</span>
                      </label>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        p.platform === "youtube" 
                          ? "bg-rose-100 text-rose-800 border-rose-300"
                          : "bg-pink-100 text-pink-800 border-pink-300"
                      }`}>
                        {p.platform === "youtube" ? "🔴 YouTube Short" : "🟣 Instagram Reel"}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Paste ANY link or embed code (Instagram Reel, Post URL, complete &lt;blockquote...&gt;, YouTube Shorts, or &lt;iframe...&gt;). <strong>कुछ भी पेस्ट करें, यह अपने आप सही फ़ॉर्मैट निकाल लेगा और कोई ऑप्शन कट नहीं होगा।</strong>
                    </p>

                    <div className="relative">
                      <textarea
                        value={p.url || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          const parsed = parseSocialEmbed(val);
                          patch(selected, {
                            url: parsed.cleanUrl || val,
                            embedUrl: parsed.embedUrl || val,
                            platform: parsed.platform,
                            videoId: parsed.videoId,
                            thumbnailUrl: parsed.thumbnailUrl || p.thumbnailUrl,
                            videoUrl: parsed.videoUrl || p.videoUrl,
                            title: (!p.title.trim() && parsed.suggestedTitle) ? parsed.suggestedTitle : p.title
                          });
                        }}
                        placeholder="Paste Instagram Reel / Post link, <blockquote...> embed code, or YouTube Shorts link here..."
                        rows={3}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-rose-400 font-mono resize-y"
                      />
                    </div>

                    {p.embedUrl && (
                      <p className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-xl break-all">
                        <strong>Active Stream:</strong> {p.embedUrl}
                      </p>
                    )}

                    {/* 100% In-App Playback Guarantee */}
                    <div className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-[11px] text-emerald-800 font-semibold">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>100% In-App Playback: Video/Post will stream directly inside the app without opening external browsers or apps.</span>
                    </div>
                  </div>

                  {/* Caption / Description - Spacious Textarea */}
                  <label className="block text-xs font-bold text-slate-700">
                    Caption / Description (संदेश / विवरण)
                    <textarea
                      value={p.caption || ""}
                      onChange={(e) => patch(selected, { caption: e.target.value })}
                      placeholder="Write a short description or caption for this media item..."
                      rows={3}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-rose-400 resize-y"
                    />
                  </label>

                  {/* Live In-App Player Preview */}
                  {(p.videoUrl || p.embedUrl || embedUrl) && (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-3 text-center">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black uppercase tracking-[.14em] text-white/70">
                          In-App Live Stream Preview ({p.platform === "youtube" ? "YouTube 9:16" : "Instagram"})
                        </p>
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Streams Inside App
                        </span>
                      </div>

                      {p.videoUrl && !p.videoUrl.includes("instagram.com") ? (
                        <video
                          src={resolveMediaUrl(p.videoUrl)}
                          controls
                          playsInline
                          className="h-[380px] w-full rounded-xl object-contain bg-black mx-auto"
                        />
                      ) : (
                        <iframe
                          src={p.embedUrl || embedUrl}
                          title="In-App Embed Preview"
                          className="h-[380px] w-full max-w-sm rounded-xl border-0 bg-white mx-auto shadow-2xl"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      )}
                    </div>
                  )}

                  {/* Ordering & Active Toggle & Direct Save */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => move(selected, -1)} disabled={selected === 0} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-black disabled:opacity-40 hover:bg-slate-50 cursor-pointer">
                        <ChevronUp className="h-4 w-4" /> Move Up
                      </button>
                      <button type="button" onClick={() => move(selected, 1)} disabled={selected === posts.length - 1} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-black disabled:opacity-40 hover:bg-slate-50 cursor-pointer">
                        <ChevronDown className="h-4 w-4" /> Move Down
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={save}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0F3157] px-4 py-2 text-xs font-black text-white disabled:opacity-50 hover:bg-[#1D5B93] cursor-pointer shadow-sm ml-auto"
                    >
                      <Save className="h-4 w-4" /> {saving ? "Publishing…" : "Save & Publish"}
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
