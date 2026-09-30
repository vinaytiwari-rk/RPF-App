import React, { useState } from "react";
import axios from "axios";
import {
  Images,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Save,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Link,
  MessageSquare,
  Radio,
  Tv,
  Instagram,
  Check,
  X,
  Compass,
  Upload,
  Film
} from "lucide-react";
import { toast } from "react-hot-toast";

interface CarouselSlide {
  id: string;
  titleEn: string;
  titleHi?: string;
  subEn: string;
  subHi?: string;
  image: string;
  route?: string;
  active?: boolean;
  order?: number;
}

interface QuickAction {
  id: string;
  titleEn: string;
  titleHi?: string;
  subtitleEn: string;
  subtitleHi?: string;
  route: string;
  iconName: string;
  accent: string;
  active: boolean;
}

interface MarqueeItem {
  id: string;
  textEn: string;
  textHi?: string;
  variant: "saffron" | "green" | "red";
  active: boolean;
}

interface InstagramPost {
  id: string;
  title: string;
  url: string;
  videoUrl?: string;
  caption?: string;
  active?: boolean;
}

interface AdminHomeStudioProps {
  cms: any;
  onSaveCms: (updatedFields: Record<string, unknown>, successMessage: string) => Promise<void>;
  saving: boolean;
}

export default function AdminHomeStudio({ cms, onSaveCms, saving }: AdminHomeStudioProps) {
  const [activeTab, setActiveTab] = useState<"carousel" | "actions" | "marquees" | "quote" | "social">("carousel");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Upload handlers
  const handleUploadSlideImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("@rpf_token");
      const res = await axios.post("/api/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.data?.url) {
        setEditingSlide((prev) => (prev ? { ...prev, image: res.data.url } : null));
        toast.success("Image uploaded successfully from device!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUploadReelVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("@rpf_token");
      const res = await axios.post("/api/upload/video", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.data?.url) {
        setEditingReel((prev) => (prev ? { ...prev, videoUrl: res.data.url } : null));
        toast.success("Video uploaded successfully from device!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to upload video");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleUploadReelThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("@rpf_token");
      const res = await axios.post("/api/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.data?.url) {
        setEditingReel((prev) => (prev ? { ...prev, url: res.data.url } : null));
        toast.success("Cover image uploaded from device!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to upload cover image");
    }
  };

  // Slides State
  const initialSlides: CarouselSlide[] = Array.isArray(cms?.carouselSlides) && cms.carouselSlides.length > 0
    ? cms.carouselSlides.map((s: any, i: number) => ({ ...s, id: s.id || `slide-${i}`, active: s.active !== false }))
    : [
        { id: "s1", titleEn: "Healthcare support for the community", titleHi: "समुदाय के लिए स्वास्थ्य सेवा सहायता", subEn: "Health camps, medical support and community care.", image: "/assets/mega_camp_banner.png", route: "/health-care", active: true },
        { id: "s2", titleEn: "Service that reaches people", titleHi: "जन-जन तक पहुंचती सेवा", subEn: "Ground-level initiatives focused on practical support.", image: "/assets/water_pump_camp.png", route: "/impact", active: true },
        { id: "s3", titleEn: "Service. Commitment. Resolve.", titleHi: "सेवा। समर्पण। संकल्प।", subEn: "Discover the people and purpose behind the work.", image: "/assets/founder.png", route: "/founder-message", active: true }
      ];

  const [slides, setSlides] = useState<CarouselSlide[]>(initialSlides);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);

  // Quick Actions State
  const initialActions: QuickAction[] = Array.isArray(cms?.homeActions) && cms.homeActions.length > 0
    ? cms.homeActions
    : [
        { id: "a1", titleEn: "Jan Seva Card", titleHi: "जन सेवा कार्ड", subtitleEn: "Your digital service identity", subtitleHi: "आपकी डिजिटल पहचान", route: "/jan-seva-card", iconName: "BadgePlus", accent: "text-[#C2410C] bg-orange-50 border-orange-200", active: true },
        { id: "a2", titleEn: "Healthcare", titleHi: "स्वास्थ्य सेवा", subtitleEn: "Health camps & hospital locator", subtitleHi: "स्वास्थ्य शिविर और अस्पताल", route: "/health-care", iconName: "HeartPulse", accent: "text-[#DC2626] bg-red-50 border-red-200", active: true },
        { id: "a3", titleEn: "Employment", titleHi: "रोजगार पोर्टल", subtitleEn: "Jobs, skills & opportunities", subtitleHi: "नौकरियां और अवसर", route: "/employment", iconName: "BriefcaseBusiness", accent: "text-[#166534] bg-emerald-50 border-emerald-200", active: true },
        { id: "a4", titleEn: "Grievance", titleHi: "शिकायत समाधान", subtitleEn: "Submit and track an issue", subtitleHi: "शिकायत दर्ज करें और ट्रैक करें", route: "/grievance", iconName: "ClipboardList", accent: "text-[#0A192F] bg-slate-50 border-slate-200", active: true }
      ];

  const [actions, setActions] = useState<QuickAction[]>(initialActions);
  const [editingAction, setEditingAction] = useState<QuickAction | null>(null);

  // Marquees State
  const initialMarquees: MarqueeItem[] = Array.isArray(cms?.homeMarquees) && cms.homeMarquees.length > 0
    ? cms.homeMarquees
    : [
        { id: "m1", textEn: "Union Home Minister Amit Shah addresses convocation of Gujarat Vidyapith in Ahmedabad", textHi: "गृह मंत्री अमित शाह ने अहमदाबाद में गुजरात विद्यापीठ के दीक्षांत समारोह को संबोधित किया", variant: "saffron", active: true },
        { id: "m2", textEn: "River Gandak in Gopalganj district continues to flow in severe flood situation: NDMA Alert", textHi: "गोपालगंज में गंडक नदी का जलस्तर खतरे के निशान से ऊपर: एनडीएमए अलर्ट", variant: "red", active: true },
        { id: "m3", textEn: "12 Years of PMJDY: 59.09 Crore Accounts Opened, Deposits Reach ₹3.17 Lakh Crore", textHi: "पीएमजेडीवाई के 12 वर्ष: 59 करोड़ से अधिक खाते खोले गए", variant: "green", active: true }
      ];

  const [marquees, setMarquees] = useState<MarqueeItem[]>(initialMarquees);
  const [editingMarquee, setEditingMarquee] = useState<MarqueeItem | null>(null);

  // Quote State (Universal language input - Hindi, English or any language)
  const [quoteText, setQuoteText] = useState(cms?.quoteOfTheDay || cms?.quoteOfTheDayHi || cms?.quoteOfTheDayEn || "कर्म ही पूजा है, और सेवा ही सबसे बड़ा धर्म है।");
  const [quoteAuthor, setQuoteAuthor] = useState(cms?.quoteAuthor || "Rohit Pandit");

  // Social / Reels
  const initialReels: InstagramPost[] = Array.isArray(cms?.instagramPosts) && cms.instagramPosts.length > 0
    ? cms.instagramPosts
    : [
        { id: "r1", title: "Free Health Camp in Sehore", url: "https://www.instagram.com/p/DF2_zZJSSy3/", caption: "Providing critical healthcare checkups and medicine to 800+ families.", active: true },
        { id: "r2", title: "Clean Water Facility Installation", url: "https://www.instagram.com/p/DF6HhIqSkg0/", caption: "Clean drinking water now accessible for 4 villages.", active: true }
      ];

  const [reels, setReels] = useState<InstagramPost[]>(initialReels);
  const [editingReel, setEditingReel] = useState<InstagramPost | null>(null);

  // Handlers for Slides
  const handleToggleSlide = async (id: string) => {
    const updated = slides.map(s => s.id === id ? { ...s, active: !s.active } : s);
    setSlides(updated);
    await onSaveCms({ carouselSlides: updated }, "Carousel slides updated");
  };

  const handleDeleteSlide = async (id: string) => {
    if (!window.confirm("Delete this banner slide?")) return;
    const updated = slides.filter(s => s.id !== id);
    setSlides(updated);
    await onSaveCms({ carouselSlides: updated }, "Slide removed");
  };

  const handleSaveSlideModal = async () => {
    if (!editingSlide) return;
    let updated: CarouselSlide[];
    if (slides.some(s => s.id === editingSlide.id)) {
      updated = slides.map(s => s.id === editingSlide.id ? editingSlide : s);
    } else {
      updated = [...slides, editingSlide];
    }
    setSlides(updated);
    setEditingSlide(null);
    await onSaveCms({ carouselSlides: updated }, "Slide saved");
  };

  // Handlers for Actions
  const handleToggleAction = async (id: string) => {
    const updated = actions.map(a => a.id === id ? { ...a, active: !a.active } : a);
    setActions(updated);
    await onSaveCms({ homeActions: updated }, "Quick actions updated");
  };

  const handleDeleteAction = async (id: string) => {
    if (!window.confirm("Delete this quick action button?")) return;
    const updated = actions.filter(a => a.id !== id);
    setActions(updated);
    await onSaveCms({ homeActions: updated }, "Action button removed");
  };

  const handleSaveActionModal = async () => {
    if (!editingAction) return;
    let updated: QuickAction[];
    if (actions.some(a => a.id === editingAction.id)) {
      updated = actions.map(a => a.id === editingAction.id ? editingAction : a);
    } else {
      updated = [...actions, editingAction];
    }
    setActions(updated);
    setEditingAction(null);
    await onSaveCms({ homeActions: updated }, "Quick action saved");
  };

  // Handlers for Marquees
  const handleToggleMarquee = async (id: string) => {
    const updated = marquees.map(m => m.id === id ? { ...m, active: !m.active } : m);
    setMarquees(updated);
    await onSaveCms({ homeMarquees: updated }, "Ticker updated");
  };

  const handleDeleteMarquee = async (id: string) => {
    if (!window.confirm("Delete this marquee alert?")) return;
    const updated = marquees.filter(m => m.id !== id);
    setMarquees(updated);
    await onSaveCms({ homeMarquees: updated }, "Marquee alert removed");
  };

  const handleSaveMarqueeModal = async () => {
    if (!editingMarquee) return;
    let updated: MarqueeItem[];
    if (marquees.some(m => m.id === editingMarquee.id)) {
      updated = marquees.map(m => m.id === editingMarquee.id ? editingMarquee : m);
    } else {
      updated = [...marquees, editingMarquee];
    }
    setMarquees(updated);
    setEditingMarquee(null);
    await onSaveCms({ homeMarquees: updated }, "Marquee alert saved");
  };

  // Handlers for Quote (Universal language input)
  const handleSaveQuote = async () => {
    const q = quoteText.trim();
    await onSaveCms({
      quoteOfTheDay: q,
      quoteOfTheDayEn: q,
      quoteOfTheDayHi: q,
      quoteAuthor: quoteAuthor.trim()
    }, "Thought of the day saved");
  };

  // Handlers for Reels
  const handleToggleReel = async (id: string) => {
    const updated = reels.map(r => r.id === id ? { ...r, active: !r.active } : r);
    setReels(updated);
    await onSaveCms({ instagramPosts: updated }, "Reel status updated");
  };

  const handleDeleteReel = async (id: string) => {
    if (!window.confirm("Delete this Instagram reel?")) return;
    const updated = reels.filter(r => r.id !== id);
    setReels(updated);
    await onSaveCms({ instagramPosts: updated }, "Reel removed");
  };

  const handleSaveReelModal = async () => {
    if (!editingReel) return;
    let updated: InstagramPost[];
    if (reels.some(r => r.id === editingReel.id)) {
      updated = reels.map(r => r.id === editingReel.id ? editingReel : r);
    } else {
      updated = [...reels, editingReel];
    }
    setReels(updated);
    setEditingReel(null);
    await onSaveCms({ instagramPosts: updated }, "Reel saved");
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#C2410C] border border-orange-200">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-[#0A192F]">Home Screen Control Studio</h2>
            <p className="text-xs text-slate-500">
              Manage all banners, quick action buttons, live marquees, quote of the day, and social media reels visible on the Home Screen.
            </p>
          </div>
        </div>

        {/* SUB-TABS */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={() => setActiveTab("carousel")}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              activeTab === "carousel" ? "bg-[#0A192F] text-white font-black shadow-xs" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Banner Carousel ({slides.length})
          </button>
          <button
            onClick={() => setActiveTab("actions")}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              activeTab === "actions" ? "bg-[#0A192F] text-white font-black shadow-xs" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Quick Actions ({actions.length})
          </button>
          <button
            onClick={() => setActiveTab("marquees")}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              activeTab === "marquees" ? "bg-[#0A192F] text-white font-black shadow-xs" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Live Marquees & News ({marquees.length})
          </button>
          <button
            onClick={() => setActiveTab("quote")}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              activeTab === "quote" ? "bg-[#0A192F] text-white font-black shadow-xs" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Thought of the Day
          </button>
          <button
            onClick={() => setActiveTab("social")}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              activeTab === "social" ? "bg-[#0A192F] text-white font-black shadow-xs" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Social Reels ({reels.length})
          </button>
        </div>
      </div>

      {/* 1. CAROUSEL BANNER SLIDES */}
      {activeTab === "carousel" && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-[#0A192F]">Hero Carousel Slides</h3>
              <p className="text-xs text-slate-500">Auto-rotating hero banners shown at the top of the home page.</p>
            </div>
            <button
              onClick={() => setEditingSlide({
                id: `slide-${Date.now()}`,
                titleEn: "",
                titleHi: "",
                subEn: "",
                subHi: "",
                image: "/assets/mega_camp_banner.png",
                route: "/services",
                active: true
              })}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#C2410C] px-3.5 py-1.5 text-xs font-black text-white hover:bg-orange-700 transition shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> + Add Slide
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {slides.map((s, idx) => (
              <div key={s.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2.5">
                <div className="relative h-28 overflow-hidden rounded-xl bg-slate-200 border border-slate-200/60">
                  <img src={s.image} alt={s.titleEn} className="h-full w-full object-cover" />
                  <span className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                    s.active ? "bg-emerald-50 text-[#166534] border border-emerald-200" : "bg-slate-200 text-slate-600"
                  }`}>
                    {s.active ? "Active" : "Disabled"}
                  </span>
                  <span className="absolute bottom-2 left-2 rounded-md bg-[#0A192F]/80 px-2 py-0.5 text-[9px] font-mono text-white">
                    #{idx + 1}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs font-black text-[#0A192F] line-clamp-1">{s.titleEn}</p>
                  {s.titleHi && <p className="text-[11px] font-semibold text-slate-500 line-clamp-1">{s.titleHi}</p>}
                  <p className="text-[10px] text-slate-400 font-mono">Route: {s.route || "None"}</p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-xs">
                  <button
                    onClick={() => handleToggleSlide(s.id)}
                    className={`inline-flex items-center gap-1 font-bold ${s.active ? "text-[#166534]" : "text-slate-400"}`}
                  >
                    {s.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    <span>{s.active ? "Enabled" : "Disabled"}</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingSlide(s)}
                      className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-[#0A192F]"
                      title="Edit slide"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-[#C2410C]" />
                    </button>
                    <button
                      onClick={() => handleDeleteSlide(s.id)}
                      className="rounded-lg p-1.5 text-slate-600 hover:bg-rose-100 hover:text-rose-700"
                      title="Delete slide"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. QUICK ACTIONS */}
      {activeTab === "actions" && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-[#0A192F]">Quick Action Shortcut Buttons</h3>
              <p className="text-xs text-slate-500">The 4 primary action cards on the home page above the news ticker.</p>
            </div>
            <button
              onClick={() => setEditingAction({
                id: `act-${Date.now()}`,
                titleEn: "",
                titleHi: "",
                subtitleEn: "",
                subtitleHi: "",
                route: "/services",
                iconName: "Compass",
                accent: "text-[#C2410C] bg-orange-50 border-orange-200",
                active: true
              })}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#C2410C] px-3.5 py-1.5 text-xs font-black text-white hover:bg-orange-700 transition shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> + Add Action
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {actions.map((act) => (
              <div key={act.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-orange-50 p-1.5 text-[#C2410C] border border-orange-200 font-bold text-xs">
                      {act.iconName}
                    </span>
                    <div>
                      <p className="text-xs font-black text-[#0A192F]">{act.titleEn}</p>
                      {act.titleHi && <p className="text-[10px] font-semibold text-slate-500">{act.titleHi}</p>}
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                    act.active ? "bg-emerald-50 text-[#166534] border border-emerald-200" : "bg-slate-200 text-slate-600"
                  }`}>
                    {act.active ? "Active" : "Disabled"}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 font-medium">{act.subtitleEn}</p>
                <p className="text-[10px] text-slate-400 font-mono">Route: {act.route}</p>

                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-xs">
                  <button
                    onClick={() => handleToggleAction(act.id)}
                    className={`inline-flex items-center gap-1 font-bold ${act.active ? "text-[#166534]" : "text-slate-400"}`}
                  >
                    {act.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    <span>{act.active ? "Enabled" : "Disabled"}</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingAction(act)}
                      className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-[#C2410C]" />
                    </button>
                    <button
                      onClick={() => handleDeleteAction(act.id)}
                      className="rounded-lg p-1.5 text-slate-600 hover:bg-rose-100"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. MARQUEES & LIVE TICKERS */}
      {activeTab === "marquees" && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-[#0A192F]">Live Marquee & News Tickers</h3>
              <p className="text-xs text-slate-500">High-priority alerts and news headlines that scroll across the screen.</p>
            </div>
            <button
              onClick={() => setEditingMarquee({
                id: `marq-${Date.now()}`,
                textEn: "",
                textHi: "",
                variant: "saffron",
                active: true
              })}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#C2410C] px-3.5 py-1.5 text-xs font-black text-white hover:bg-orange-700 transition shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> + Add Ticker
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {marquees.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-[9px] font-black uppercase border ${
                      m.variant === "green" ? "bg-emerald-50 text-[#166534] border-emerald-200" :
                      m.variant === "red" ? "bg-rose-50 text-rose-700 border-rose-200" :
                      "bg-orange-50 text-[#C2410C] border-orange-200"
                    }`}>
                      {m.variant} alert
                    </span>
                    <span className={`text-[10px] font-bold ${m.active ? "text-[#166534]" : "text-slate-400"}`}>
                      {m.active ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#0A192F]">{m.textEn}</p>
                  {m.textHi && <p className="text-xs text-slate-500">{m.textHi}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleMarquee(m.id)}
                    className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    {m.active ? <Eye className="h-3.5 w-3.5 text-[#166534]" /> : <EyeOff className="h-3.5 w-3.5 text-slate-400" />}
                  </button>
                  <button
                    onClick={() => setEditingMarquee(m)}
                    className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-50"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-[#C2410C]" />
                  </button>
                  <button
                    onClick={() => handleDeleteMarquee(m.id)}
                    className="rounded-xl border border-rose-200 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. THOUGHT OF THE DAY */}
      {activeTab === "quote" && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-[#0A192F]">Thought / Quote of the Day</h3>
            <p className="text-xs text-slate-500">Inspirational message displayed on the home page card.</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Thought / Quote of the Day (सुविचार या प्रेरक विचार)</label>
              <textarea
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder="उदा. कर्म ही पूजा है, और सेवा ही सबसे बड़ा धर्म है।"
                rows={3}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#C2410C]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Author Name / लेखक</label>
              <input
                type="text"
                value={quoteAuthor}
                onChange={(e) => setQuoteAuthor(e.target.value)}
                placeholder="Rohit Pandit"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#C2410C]"
              />
            </div>
            <button
              onClick={handleSaveQuote}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A192F] px-4 py-2 text-xs font-black text-white hover:bg-slate-800 transition disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5 text-[#FF9933]" /> Save Thought
            </button>
          </div>
        </section>
      )}

      {/* 5. SOCIAL MEDIA REELS */}
      {activeTab === "social" && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-[#0A192F]">Social Media & Instagram Reels</h3>
              <p className="text-xs text-slate-500">Embedded video reels and welfare campaign updates.</p>
            </div>
            <button
              onClick={() => setEditingReel({
                id: `reel-${Date.now()}`,
                title: "",
                url: "https://www.instagram.com/rpfoundationofficial/",
                caption: "",
                active: true
              })}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#C2410C] px-3.5 py-1.5 text-xs font-black text-white hover:bg-orange-700 transition shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> + Add Reel
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {reels.map((reel) => (
              <div key={reel.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-pink-50 p-1.5 text-pink-600 border border-pink-200">
                      <Instagram className="h-4 w-4" />
                    </span>
                    <p className="text-xs font-black text-[#0A192F]">{reel.title || "Video Reel"}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                    reel.active ? "bg-emerald-50 text-[#166534] border border-emerald-200" : "bg-slate-200 text-slate-600"
                  }`}>
                    {reel.active ? "Active" : "Disabled"}
                  </span>
                </div>

                {reel.videoUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video max-h-36">
                    <video
                      src={reel.videoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                <p className="text-xs text-slate-600 font-medium line-clamp-2">{reel.caption || "No caption"}</p>
                {reel.videoUrl ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-200">
                    <Film className="w-3 h-3" /> Device Video Attached
                  </span>
                ) : (
                  <p className="text-[10px] text-slate-400 font-mono truncate">{reel.url}</p>
                )}

                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-xs">
                  <button
                    onClick={() => handleToggleReel(reel.id)}
                    className={`inline-flex items-center gap-1 font-bold ${reel.active ? "text-[#166534]" : "text-slate-400"}`}
                  >
                    {reel.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    <span>{reel.active ? "Enabled" : "Disabled"}</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingReel(reel)}
                      className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-[#C2410C]" />
                    </button>
                    <button
                      onClick={() => handleDeleteReel(reel.id)}
                      className="rounded-lg p-1.5 text-slate-600 hover:bg-rose-100"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EDIT SLIDE MODAL */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-[#0A192F]">Edit Carousel Slide</h3>
              <button onClick={() => setEditingSlide(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Slide Title</label>
                <input
                  type="text"
                  value={editingSlide.titleEn || editingSlide.titleHi || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, titleEn: e.target.value, titleHi: e.target.value })}
                  placeholder="Enter slide title..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={editingSlide.subEn || editingSlide.subHi || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subEn: e.target.value, subHi: e.target.value })}
                  placeholder="Brief description..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Banner Image (From Device)</label>
                <div className="mt-1.5 flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-[#166534] px-3.5 py-2 text-xs font-bold text-white hover:bg-green-800 transition shadow-sm">
                    <Upload className="h-4 w-4" />
                    <span>{uploadingImage ? "Uploading..." : "Upload Image from Device"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadSlideImage}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  {editingSlide.image && (
                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-[180px]">
                      {editingSlide.image}
                    </span>
                  )}
                </div>
                {editingSlide.image && (
                  <div className="mt-2 relative w-full h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={editingSlide.image}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Target App Route</label>
                <input
                  type="text"
                  value={editingSlide.route || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, route: e.target.value })}
                  placeholder="/health-care"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingSlide(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSlideModal}
                className="flex-1 rounded-xl bg-[#C2410C] py-2 text-xs font-black text-white hover:bg-orange-700"
              >
                Save Slide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ACTION MODAL */}
      {editingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-[#0A192F]">Edit Quick Action Button</h3>
              <button onClick={() => setEditingAction(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Title</label>
                <input
                  type="text"
                  value={editingAction.titleEn || editingAction.titleHi || ""}
                  onChange={(e) => setEditingAction({ ...editingAction, titleEn: e.target.value, titleHi: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Subtitle</label>
                <input
                  type="text"
                  value={editingAction.subtitleEn || editingAction.subtitleHi || ""}
                  onChange={(e) => setEditingAction({ ...editingAction, subtitleEn: e.target.value, subtitleHi: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Target Route</label>
                <input
                  type="text"
                  value={editingAction.route}
                  onChange={(e) => setEditingAction({ ...editingAction, route: e.target.value })}
                  placeholder="/jan-seva-card"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Icon Name</label>
                <input
                  type="text"
                  value={editingAction.iconName}
                  onChange={(e) => setEditingAction({ ...editingAction, iconName: e.target.value })}
                  placeholder="BadgePlus, HeartPulse, BriefcaseBusiness, ClipboardList"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingAction(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveActionModal}
                className="flex-1 rounded-xl bg-[#0A192F] py-2 text-xs font-black text-white hover:bg-slate-800"
              >
                Save Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MARQUEE MODAL */}
      {editingMarquee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-[#0A192F]">Edit Broadcast Announcement</h3>
              <button onClick={() => setEditingMarquee(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Announcement / Alert Text</label>
                <textarea
                  value={editingMarquee.textEn || editingMarquee.textHi || ""}
                  onChange={(e) => setEditingMarquee({ ...editingMarquee, textEn: e.target.value, textHi: e.target.value })}
                  rows={2}
                  placeholder="Enter broadcast announcement..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Color Variant</label>
                <select
                  value={editingMarquee.variant}
                  onChange={(e) => setEditingMarquee({ ...editingMarquee, variant: e.target.value as any })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold"
                >
                  <option value="saffron">Saffron (Standard Announcement)</option>
                  <option value="green">Green (Success / Positive News)</option>
                  <option value="red">Red (Urgent / Warning Alert)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingMarquee(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMarqueeModal}
                className="flex-1 rounded-xl bg-[#C2410C] py-2 text-xs font-black text-white hover:bg-orange-700"
              >
                Save Announcement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT REEL MODAL */}
      {editingReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-[#0A192F]">Edit Social Media Reel</h3>
              <button onClick={() => setEditingReel(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Video Title</label>
                <input
                  type="text"
                  value={editingReel.title}
                  onChange={(e) => setEditingReel({ ...editingReel, title: e.target.value })}
                  placeholder="e.g. Free Health Camp in Sehore"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Upload Video (From Device)</label>
                <div className="mt-1 flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-[#0A192F] px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm">
                    <Film className="h-4 w-4 text-[#FF9933]" />
                    <span>{uploadingVideo ? "Uploading Video..." : "Select Video from Device"}</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/m4v"
                      onChange={handleUploadReelVideo}
                      disabled={uploadingVideo}
                      className="hidden"
                    />
                  </label>
                  {editingReel.videoUrl && (
                    <span className="text-[10px] text-green-700 font-bold bg-green-50 px-2 py-1 rounded-md border border-green-200">
                      Video Ready
                    </span>
                  )}
                </div>
                {editingReel.videoUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video max-h-44">
                    <video
                      src={editingReel.videoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Cover / Poster Image (From Device)</label>
                <div className="mt-1 flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition border border-slate-300">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Select Poster Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadReelThumbnail}
                      className="hidden"
                    />
                  </label>
                  {editingReel.url && (
                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">
                      {editingReel.url}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Caption / Description</label>
                <textarea
                  value={editingReel.caption || ""}
                  onChange={(e) => setEditingReel({ ...editingReel, caption: e.target.value })}
                  rows={2}
                  placeholder="Describe this social welfare activity..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-medium"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingReel(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReelModal}
                className="flex-1 rounded-xl bg-pink-600 py-2 text-xs font-black text-white hover:bg-pink-700"
              >
                Save Reel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
