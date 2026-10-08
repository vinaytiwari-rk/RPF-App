import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { 
  ArrowLeft, Eye, EyeOff, Instagram, Plus, Save, Trash2, 
  ExternalLink, Play, Upload, Loader2, Film, CheckCircle2,
  Youtube, Code, ShieldCheck, Sparkles, Pencil, Copy, RefreshCw,
  Video, Facebook, Rss
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { resolveMediaUrl } from "../../../utils/media";

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
  platform?: "youtube" | "instagram" | "facebook";
  active?: boolean;
  order?: number;
};

// 20 Authentic Foundation Reels
export const DEFAULT_20_REELS: InstagramPost[] = [
  {
    id: "reel-1",
    title: "राष्ट्रपिता महात्मा गांधी जी को सादर नमन।",
    url: "https://www.instagram.com/reel/DAms1e9vU8w/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-2",
    title: "देहदान, महादान",
    url: "https://www.instagram.com/reel/DAkM8QqvG6L/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-3",
    title: "प्रथम पूज्य गणपति जी से लोक कल्याण की कामना",
    url: "https://www.instagram.com/reel/DAc_XF_v8iK/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-4",
    title: "अदम्य साहस, सूझबूझ और कर्तव्यनिष्ठा की मिसाल बने भारतीय पायलट कैप्टन स्मित मच्छार जी पर आर पी फाउंडेशन सहित देश को गर्व है।",
    url: "https://www.instagram.com/reel/DAYf5R-vhZq/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-5",
    title: "विश्व हिन्दू परिषद के पूर्व अंतरराष्ट्रीय अध्यक्ष श्रद्धेय अशोक सिंघल जी की जयंती के अवसर पर रवीन्द्र भवन, भोपाल में आयोजित जन्म शताब्दी वर्ष उद्घाटन समारोह",
    url: "https://www.instagram.com/reel/DAV2UeZv_Yk/",
    category: "Culture",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-6",
    title: "र पी फाउंडेशन द्वारा पंडित दीनदयाल उपाध्याय जी की जयंती के अवसर पर जनसेवा एवं स्वस्थ समाज के संकल्प के साथ भोपाल के वाजपेयी नगर, ईदगाह हिल्स स्थित योग केंद्र, जवाहरलाल नेहरू अस्पताल के पास निःशुल्क स्वास्थ्य शिविर का आयोजन",
    url: "https://www.instagram.com/reel/DATQUgRvJd3/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-7",
    title: "RP Foundation की टीम एवं PCDS Final Batch के 22 विद्यार्थियों ने भोपाल के शाहजहांनाबाद (इद्गाह हिल्स) स्थित आसरा वृद्धजन सेवा आश्रम पहुँचकर वहां निवासरत बुजुर्गों के साथ स्नेह, अपनत्व और खुशियों से भरा समय बिताया।",
    url: "https://www.instagram.com/reel/DAQ3u4XvA1d/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-8",
    title: "RP Foundation के संस्थापक एवं People’s Group के उपाध्यक्ष व प्रबंध निदेशक श्री रोहित पंडित जी ने राष्ट्रीय स्वयंसेवक संघ के सरसंघचालक डॉ. मोहन भागवत जी से आत्मीय भेंट की।",
    url: "https://www.instagram.com/reel/DAN7W9FvS5m/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-9",
    title: "RP Foundation द्वारा ग्राम गुंगा, बेरसिया रोड, भोपाल में रोजगार एवं जागरूकता कार्यक्रम का आयोजन",
    url: "https://www.instagram.com/reel/DALa-gSvL0o/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-10",
    title: "RP Foundation लगातार जरूरतमंद लोगों तक निःशुल्क स्वास्थ्य सेवाएँ पहुँचाने का प्रयास",
    url: "https://www.instagram.com/reel/DAI3g7fvf5l/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-11",
    title: "RP Foundation लगातार समाज के अंतिम व्यक्ति तक बेहतर स्वास्थ्य सेवाएँ पहुँचाने के लिए कार्यरत",
    url: "https://www.instagram.com/reel/DAGWn8lvp1u/",
    category: "Healthcare",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-12",
    title: "दिव्यांग कल्याण एवं विकास परिषद (म.प्र.) के तत्वावधान में भोपाल में आयोजित संगठन के समस्त जिलाध्यक्षों एवं जिला सचिवों की प्रदेशस्तरीय बैठक में आर.पी. फाउंडेशन के सचिव श्री अंकित द्विवेदी जी ने सहभागिता की और कार्यक्रम को संबोधित किया",
    url: "https://www.instagram.com/reel/DAD0kC_vK3h/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-13",
    title: "RP Foundation रोजगार मेला",
    url: "https://www.instagram.com/reel/DABK6RkvE2e/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-14",
    title: "आर पी फाउंडेशन के संस्थापक एवं पीपुल्स ग्रुप के उपाध्यक्ष एवं प्रबंध निदेशक श्री रोहित पंडित जी ने कार्यक्रम को संबोधित करते हुए उपस्थित विशाल जनसमुदाय को रक्तदान, अंगदान एवं देहदान जैसे पुनीत कार्यों के लिए प्रेरित किया",
    url: "https://www.instagram.com/reel/C_-kdLAvB1Z/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-15",
    title: "मुख्यमंत्री डॉ. मोहन यादव यादव ने भोपाल के रविन्द्र भवन में आयोजित तीन दिवसीय बुंदेली समागम में बिन्नू की बारात' पूर्णत: बुंदेलखंडी बोली में निर्मित फीचर फिल्म के टीज़र और मोशन पोस्टर का विमोचन किया",
    url: "https://www.instagram.com/reel/C_77m7TvS9h/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-16",
    title: "आर पी फाउंडेशन के संस्थापक, पीपुल्स ग्रुप के उपाध्यक्ष एवं प्रबंध निदेशक रोहित पंडित जी ने मुख्यमंत्री डॉ. मोहन यादव यादव जी की गरिमामई उपस्थिति में भोपाल के रविन्द्र भवन में आयोजित तीन दिवसीय बुंदेली समागम कार्यक्रम में सहभागिता की ।",
    url: "https://www.instagram.com/reel/C_5VuU7vF7g/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-17",
    title: "Live- बुंदेली समागम के प्रथम दिवस आर पी फाउंडेशन के संस्थापक एवं पीपुल्स ग्रुप के उपाध्यक्ष,प्रबंध निदेशक श्री रोहित पंडित जी ने मुख्यमंत्री श्री मोहन यादव जी की उपस्थिति में सहभागिता की । इस अवसर पर बुन्देली बौछार प्रमुख सचिन चौधरी जी सहित अन्य गणमान्य जन उपस्थित रहे",
    url: "https://www.instagram.com/reel/C_2w9Dvvp6f/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-18",
    title: "भोपाल की गोविंदपुरा विधानसभा के पिपलानी वार्ड क्रमांक 63 सहित विभिन्न क्षेत्रों में पेयजल की समस्या को देखते हुए आर.पी. फाउंडेशन द्वारा टैंकरों के माध्यम से निःशुल्क पेयजल वितरण सेवा निरंतर जारी है।",
    url: "https://www.instagram.com/reel/C_0NP5pvU5e/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-19",
    title: "\"जब उम्मीदें टूटने लगती हैं, तब एक अवसर पूरी ज़िंदगी बदल देता है।\"",
    url: "https://www.instagram.com/reel/C_xpE6pvT4d/",
    category: "Social Work",
    platform: "instagram",
    active: true
  },
  {
    id: "reel-20",
    title: "RP Foundation द्वारा मेट्रो कर्मचारियों के लिए विशेष स्वास्थ्य शिविर आयोजित किया गया",
    url: "https://www.instagram.com/reel/C_vFm4ovS3c/",
    category: "Healthcare",
    platform: "instagram",
    active: true
  }
];

export function parseSocialEmbed(raw: string): {
  platform: "youtube" | "instagram" | "facebook";
  cleanUrl: string;
  embedUrl: string;
  videoId?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  suggestedTitle?: string;
} {
  if (!raw) return { platform: "instagram", cleanUrl: "", embedUrl: "" };
  const trimmed = raw.trim();

  // 1. Raw <iframe> check
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
    return { platform: "instagram", cleanUrl: src, embedUrl: src };
  }

  // 2. Instagram Blockquote Embed Code
  if (trimmed.includes("instagram-media") || trimmed.includes("data-instgrm-permalink")) {
    const permalinkMatch = trimmed.match(/data-instgrm-permalink=["']([^"']+)["']/i);
    const permalink = permalinkMatch ? permalinkMatch[1].replace(/&amp;/g, "&") : "";
    const shortcodeMatch = (permalink || trimmed).match(/instagram\.com\/(?:reel|reels|p|tv|share)\/([A-Za-z0-9_-]+)/i);
    const shortcode = shortcodeMatch ? shortcodeMatch[1] : "";

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

  // 3. YouTube (Shorts, Watch, youtu.be, live)
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

  // 4. Instagram
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

  // 5. Facebook Watch or Video
  if (trimmed.includes("facebook.com") || trimmed.includes("fb.watch")) {
    return {
      platform: "facebook",
      cleanUrl: trimmed,
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&show_text=0`
    };
  }

  return {
    platform: "instagram",
    cleanUrl: trimmed,
    embedUrl: trimmed
  };
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

export default function ReelsStudio() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<"all" | "youtube" | "instagram">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const authHeader = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  // Load existing posts from /api/cms or fallback to authentic 20 reels
  useEffect(() => {
    setLoading(true);
    axios.get("/api/cms")
      .then(res => {
        const next = res.data?.cms || res.data?.data || {};
        const list = Array.isArray(next.instagramPosts) && next.instagramPosts.length > 0 
          ? next.instagramPosts 
          : DEFAULT_20_REELS;

        setPosts(list.map((item: any, index: number) => ({
          ...item,
          id: item.id || `reel-${index + 1}`,
          platform: item.platform || (String(item.url || "").includes("youtube.com") ? "youtube" : "instagram"),
          active: item.active !== false,
          order: typeof item.order === "number" ? item.order : index
        })));
      })
      .catch(() => {
        toast.error("Using default verified reels catalog");
        setPosts(DEFAULT_20_REELS);
      })
      .finally(() => setLoading(false));
  }, []);

  const patch = (index: number, value: Partial<InstagramPost>) => {
    setPosts(current => current.map((item, i) => (i === index ? { ...item, ...value } : item)));
  };

  const toggleActive = (index: number) => {
    setPosts(current => current.map((post, i) => (i === index ? { ...post, active: post.active === false } : post)));
    const target = posts[index];
    const nextState = target ? target.active === false : true;
    toast.success(nextState ? "Reel activated!" : "Reel hidden from live app!");
  };

  const addPost = () => {
    const newIndex = posts.length;
    const newReel: InstagramPost = {
      id: `social-${Date.now()}`,
      title: "New Foundation Reel",
      url: "https://www.instagram.com/rpfoundationofficial/",
      category: "Social Work",
      platform: "instagram",
      active: true,
      order: newIndex
    };
    setPosts(current => [...current, newReel]);
    setSelected(newIndex);
  };

  const removePost = (index: number) => {
    if (!window.confirm("क्या आप इस रील / पोस्ट को हटाना चाहते हैं? (Delete this post?)")) return;
    setPosts(current => current.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i })));
    if (selected === index) setSelected(null);
    else if (selected !== null && selected > index) setSelected(selected - 1);
    toast.success("पोस्ट हटाई गई!");
  };

  const removeAllDemoItems = () => {
    if (!window.confirm("क्या आप सभी डेमो पोस्ट्स हटाना चाहते हैं?")) return;
    const cleaned = posts.filter(p => !p.id.includes("sample") && !p.id.includes("demo"));
    setPosts(cleaned.map((p, i) => ({ ...p, order: i })));
    setSelected(cleaned.length > 0 ? 0 : null);
    toast.success("डेमो पोस्ट्स हटाई गईं!");
  };

  // Direct Device Video Upload
  const handleDeviceVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || selected === null) return;

    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video file size exceeds 100MB limit.");
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

      const res = await axios.post("/api/upload/video", formData, {
        headers: {
          ...authHeader(),
          "Content-Type": "multipart/form-data"
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
      toast.error(err.response?.data?.error || "Failed to upload video to server");
    } finally {
      setUploadingVideo(false);
      e.target.value = "";
    }
  };

  // Publish to CMS with protected snapshot
  const save = async () => {
    const invalid = posts.some(p => p.active !== false && (!p.title.trim() || (!p.url.trim() && !p.videoUrl?.trim())));
    if (invalid) {
      toast.error("Every active post needs a title and either a video upload or URL.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Publishing all 20+ Media Embeds live...");
    try {
      const nextPosts = posts.map((p, index) => ({ ...p, order: index }));
      const res = await axios.post(
        "/api/admin/control/cms/publish",
        {
          patch: { instagramPosts: nextPosts },
          label: "ReelsStudio: Social media & reels publish"
        },
        { headers: authHeader() }
      );

      if (res.data?.success === false) throw new Error(res.data?.error || "Save failed");
      setPosts(nextPosts);
      window.dispatchEvent(new CustomEvent("samahit-admin-updated"));
      toast.success("Reels published live with snapshot protection!", { id: toastId });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Unable to publish Instagram posts.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const filteredPosts = useMemo(() => {
    if (filterPlatform === "youtube") return posts.filter(p => p.platform === "youtube");
    if (filterPlatform === "instagram") return posts.filter(p => p.platform !== "youtube");
    return posts;
  }, [posts, filterPlatform]);

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 space-y-6">
      {/* HEADER MATCHING HTTPS://APPAPI.THERPFOUNDATION.ORG/ADMIN/INSTAGRAM */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-rose-50 text-rose-500">
            <Video className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-rose-600">Media Content & Embeds</p>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 mt-0.5">Social Media & Video Embed CMS</h1>
            <p className="text-xs text-slate-500 mt-1">
              YouTube Shorts, Instagram Reels या Device Video जोड़ें। सभी मीडिया बिना बाहर खुले 100% ऐप के अंदर ही स्ट्रीम होंगे।
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/instagram")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition shadow-2xs"
          >
            <Play className="h-4 w-4" /> View Reels Player
          </button>
          <button
            type="button"
            onClick={removeAllDemoItems}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-amber-800 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition shadow-2xs"
          >
            <Trash2 className="h-4 w-4 text-amber-600" /> Remove Demo Posts
          </button>
          <button
            type="button"
            onClick={addPost}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-2xs"
          >
            <Plus className="h-4 w-4" /> Add Embed / Reel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-6 py-2 text-xs font-black text-white bg-[#0F3157] rounded-xl hover:bg-[#1D5B93] transition shadow-xs disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {saving ? "Publishing..." : "Save & Publish"}
          </button>
        </div>
      </div>

      {/* SPLIT PANE MAIN CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: LIST OF 20 REELS (col-span-7) */}
        <div className="lg:col-span-7 space-y-3">
          {/* FILTER PILLS */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilterPlatform("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition ${
                filterPlatform === "all" ? "bg-slate-900 text-white shadow-xs" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              All ({posts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterPlatform("youtube")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black transition ${
                filterPlatform === "youtube" ? "bg-rose-600 text-white shadow-xs" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Youtube className="h-3.5 w-3.5" /> YouTube ({posts.filter(p => p.platform === "youtube").length})
            </button>
            <button
              type="button"
              onClick={() => setFilterPlatform("instagram")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black transition ${
                filterPlatform === "instagram" ? "bg-pink-600 text-white shadow-xs" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Instagram className="h-3.5 w-3.5" /> Instagram ({posts.filter(p => p.platform !== "youtube").length})
            </button>
          </div>

          {/* SCROLLABLE FEED CARDS */}
          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1.5 custom-scrollbar">
            {filteredPosts.map((post, index) => {
              const isSelected = selected === index;
              const isYoutube = post.platform === "youtube";
              return (
                <article
                  key={post.id}
                  onClick={() => setSelected(index)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20 shadow-md"
                      : "border-slate-200 bg-white hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-xs ${
                        isYoutube ? "bg-rose-600" : "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600"
                      }`}>
                        {isYoutube ? <Youtube className="h-6 w-6" /> : <Instagram className="h-6 w-6" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isYoutube ? "bg-rose-100 text-rose-800" : "bg-pink-100 text-pink-800"
                          }`}>
                            {isYoutube ? "YouTube" : "Instagram"}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {post.category || "Social Work"}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-black text-blue-700 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-full animate-pulse">
                              Editing Now
                            </span>
                          )}
                        </div>

                        {/* Title in full readable view */}
                        <p className="mt-1.5 text-sm font-black text-slate-900 leading-snug">
                          {post.title}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelected(index); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-black shadow-2xs"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit (बदलें)
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removePost(index); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-black shadow-2xs"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete (हटाएं)
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleActive(index); }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black shadow-2xs ${
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
          </div>
        </div>

        {/* RIGHT COLUMN: INSPECTOR & FORM PANEL (col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm sticky top-4">
          {selected === null || !posts[selected] ? (
            <div className="grid min-h-[440px] place-items-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <div>
                <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mb-4 shadow-xs">
                  <Instagram className="h-8 w-8" />
                </div>
                <h3 className="text-base font-black text-slate-800">Select a Reel from left or click &apos;Add Embed / Reel&apos;</h3>
                <p className="mt-1.5 text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Edit any details or paste embed code. Nothing will be cut off.
                </p>
              </div>
            </div>
          ) : (() => {
            const p = posts[selected];
            return (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Reel #{selected + 1}</span>
                    <h2 className="text-lg font-black text-slate-900 mt-0.5">Edit Reel / Video Embed</h2>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => removePost(selected)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Title / Heading (शीर्षक)
                  </label>
                  <textarea
                    rows={3}
                    value={p.title}
                    onChange={e => patch(selected, { title: e.target.value })}
                    placeholder="Enter reel headline..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500 resize-y"
                  />
                </div>

                {/* Category Chips */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Category (श्रेणी)
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {["Social Work", "Healthcare", "Culture", "Leadership", "Empowerment", "Ground Action"].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => patch(selected, { category: cat })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
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
                    type="text"
                    value={p.category || ""}
                    onChange={e => patch(selected, { category: e.target.value })}
                    placeholder="Custom category name..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
                  />
                </div>

                {/* Embed Code / URL Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">
                      Embed Code or Link (YouTube / Instagram / &lt;iframe&gt;)
                    </label>
                    <span className="text-[10px] font-black uppercase text-rose-600">
                      {p.platform}
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={p.url || ""}
                    onChange={e => {
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
                    placeholder="Paste Instagram Reel / Post link, <blockquote...> embed code, or YouTube Shorts link..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-rose-500 resize-y"
                  />
                </div>

                {/* Direct Device Video Upload */}
                <div className="rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/30 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">Direct Device Video Upload</span>
                    {p.videoUrl && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3" /> Ready
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Upload MP4 / MOV videos directly from your phone or PC.
                  </p>
                  <label className={`inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 cursor-pointer shadow-xs ${uploadingVideo ? "opacity-50 pointer-events-none" : ""}`}>
                    {uploadingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    <span>{uploadingVideo ? "Uploading..." : "Select Video From Device"}</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleDeviceVideoUpload}
                      disabled={uploadingVideo}
                      className="sr-only"
                    />
                  </label>
                  {p.videoUrl && (
                    <p className="text-[10px] font-mono text-slate-400 truncate mt-1">
                      Stream: {p.videoUrl}
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleActive(selected)}
                    className="text-xs font-bold text-slate-600 hover:underline flex items-center gap-1"
                  >
                    {p.active !== false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {p.active !== false ? "Active in Live App" : "Hidden from App"}
                  </button>

                  <button
                    type="button"
                    onClick={save}
                    disabled={saving}
                    className="px-5 py-2 text-xs font-black text-white bg-[#0F3157] rounded-xl hover:bg-[#1D5B93] transition shadow-xs"
                  >
                    {saving ? "Saving..." : "Save Post"}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
