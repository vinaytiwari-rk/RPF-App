import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Award, BriefcaseBusiness, CalendarDays, ChevronRight, CloudSun, ClipboardList, Clapperboard, Calculator, Compass, GraduationCap, Heart, HandHeart, Play, Quote, Stethoscope, Sparkles, Trees, TV, TrendingUp, Trash2, UsersRound, Wrench } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { resolveMediaUrl } from "../utils/media";
import { RP_FOUNDATION_LOGO, ROHIT_PANDIT_PHOTO } from "../assets/foundationBrand";
import { AVAILABLE_ICONS } from "../components/admin/IconPickerModal";
import ChannelThumbnail from "../components/ChannelThumbnail";
import { LIVE_TV_DEFAULTS } from "../data/liveTvDefaults";
import { DEFAULT_20_REELS } from "../data/defaultReels";

const fallbackSlides = [
  { image: "/assets/mega_camp_banner.png", titleEn: "Healthcare support for the community", subEn: "Health camps, medical support and community care.", route: "/health-care" },
  { image: "/assets/water_pump_camp.png", titleEn: "Service that reaches people", subEn: "Ground-level initiatives focused on practical support.", route: "/impact" },
  { image: "/assets/founder.png", titleEn: "Service. Commitment. Resolve.", subEn: "Discover the people and purpose behind the work.", route: "/founder-message" },
  { image: "/assets/donate.jpg", titleEn: "Support, skills and opportunity", subEn: "Explore programmes and services available to the community.", route: "/services" }
];

async function timedFetch(url: string, ms = 12000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(`${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`, { cache: "no-store", signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

function parseFeedItems(items: unknown): string[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    if (typeof item === "string") return item.trim();
    if (!item || typeof item !== "object") return "";
    const value = item as Record<string, unknown>;
    const title = value.titleHi || value.titleEn || value.title || value.name || value.description || "";
    return typeof title === "string" ? title.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim() : "";
  }).filter((item) => item.length >= 15);
}

const dailyQuotes = [
  { quote: "उठो, जागो और तब तक मत रुको जब तक लक्ष्य की प्राप्ति न हो जाए।", author: "स्वामी विवेकानंद" },
  { quote: "The best way to find yourself is to lose yourself in the service of others.", author: "Mahatma Gandhi" },
  { quote: "नर सेवा ही नारायण सेवा है। पीड़ितों की सेवा से बढ़कर कोई साधना नहीं।", author: "संतमत" },
  { quote: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi" },
  { quote: "हम दूसरों को उठाकर ही स्वयं ऊपर उठते हैं।", author: "रॉबर्ट इंगरसोल" }
];

const defaultNationalHeadlines = [
  "प्रधानमंत्री ने राष्ट्रीय विकास, डिजिटल सेवा और जनकल्याण योजनाओं की प्रगति पर जोर दिया।",
  "G20 और अंतरराष्ट्रीय मंचों पर भारत की सशक्त वैश्विक भागीदारी और कूटनीतिक प्रभाव बढ़ा।",
  "डिजिटल इंडिया व जन सेवा मिशन के तहत देश भर में करोड़ों नागरिकों को परामर्श दिया गया।"
];

const defaultMpHeadlines = [
  "मध्य प्रदेश सरकार ने ग्रामीण और शहरी विकास हेतु नई जनकल्याणकारी योजनाओं की शुरुआत की।",
  "भोपाल, इंदौर, जबलपुर, ग्वालियर और उज्जैन में नागरिक स्वास्थ्य और डिजिटल सेवाओं का विस्तार हुआ।",
  "प्रदेश के किसानों, युवाओं और महिलाओं के लिए स्वरोजगार व कौशल विकास कार्यक्रम आगे बढ़े।"
];

function cleanHeadline(str: unknown): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/<[^>]*>/g, "")
    .replace(/^(ANI|PIB|IANS|UNI|DD India|NDMA|SACHET|IMD Alert):\s*/i, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function MarqueeTrack({ items, direction = "rtl", variant = "saffron", label = "", onClick }: { items: string[]; direction?: "rtl" | "ltr" | "utd"; variant?: "saffron" | "red" | "green"; label?: string; onClick?: () => void }) {
  const cleanItems = useMemo(() => (items || []).map(cleanHeadline).filter((t) => t.length > 10), [items]);
  if (cleanItems.length === 0) return null;

  const trackItems = [...cleanItems, ...cleanItems];
  const totalChars = cleanItems.join(" | ").length;
  const duration = Math.max(35, Math.round(totalChars * 0.14));
  const animationName = direction === "ltr" ? "rpf-marquee-ltr" : "rpf-marquee-rtl";

  return (
    <div onClick={onClick} className={`relative overflow-hidden rounded-2xl border backdrop-blur-xs py-2.5 group ${variant === "green" ? "border-emerald-200/90 bg-transparent shadow-2xs" : "border-amber-200/90 bg-transparent shadow-2xs"} ${onClick ? "cursor-pointer hover:border-orange-300 transition-all" : ""}`}>
      <div dir="ltr" className="flex whitespace-nowrap min-w-max items-center transition-transform group-hover:[animation-play-state:paused]" style={{ animation: `${animationName} ${duration}s linear infinite`, willChange: "transform", WebkitTransform: "translate3d(0, 0, 0)" }}>
        {trackItems.map((title, idx) => (
          <div key={idx} className="flex items-center">
            <span dir="ltr" lang="hi" style={{ direction: "ltr", unicodeBidi: "plaintext", writingMode: "horizontal-tb" }} className={`text-[12.5px] tracking-normal px-2 ${variant === "green" ? "text-[#167C5A] font-black" : "text-[#C2410C] font-black"}`}>
              {title}
            </span>
            <span className={`text-xs px-3 select-none ${variant === "green" ? "text-[#D97706] font-bold" : "text-[#167C5A] font-bold"}`}>
              |
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cmsConfig } = useApp();
  const [slide, setSlide] = useState(0);
  const [supremeConfig, setSupremeConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/supreme/configs").then(r => r.json()).then(d => { if (d.success) setSupremeConfig(d.configs); }).catch(() => {});
  }, []);

  const [cardImpact, setCardImpact] = useState<{ totalCards: number; scope: string } | null>(null);
  useEffect(() => {
    let active = true;
    axios.get("/api/public/cards/impact", { timeout: 8000 }).then(({ data }) => {
      if (active && data?.success && Number.isFinite(data.totalCards)) {
        setCardImpact({ totalCards: data.totalCards, scope: data.scope });
      }
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const [homeReels, setHomeReels] = useState<any[]>(() => DEFAULT_20_REELS.slice(0, 8));
  useEffect(() => {
    let active = true;
    axios.get("/api/public/social-feed")
      .then(res => {
        if (active && res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setHomeReels(res.data.data.slice(0, 8));
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const homeTvChannels = useMemo(() => {
    const configured = Array.isArray(cmsConfig?.liveTvChannels) ? cmsConfig.liveTvChannels : [];
    const list = configured.length > 0 ? configured : LIVE_TV_DEFAULTS;
    return list.filter((c: any) => c && c.enabled !== false).slice(0, 8);
  }, [cmsConfig?.liveTvChannels]);

  const liveImpactStats = useMemo(() => {
    if (Array.isArray(cmsConfig?.impactStats) && cmsConfig.impactStats.length > 0) {
      return [...cmsConfig.impactStats]
        .filter((s: any) => s && s.enabled !== false)
        .sort((a: any, b: any) => (Number(a.order) || 0) - (Number(b.order) || 0))
        .map((s: any) => {
          const val = s.id === "cards_issued" && cardImpact?.totalCards ? cardImpact.totalCards : s.value;
          const num = typeof val === "number" ? val.toLocaleString("en-IN") : val;
          return {
            id: s.id,
            label: s.label || s.labelEn || "Metric",
            value: `${num}${s.suffix || "+"}`,
            icon: (AVAILABLE_ICONS as any)[s.iconName] || Award
          };
        });
    }
    return [
      { id: "cards", label: "Jan Seva Cards", value: (cardImpact?.totalCards || 66505).toLocaleString("en-IN") + "+", icon: Award },
      { id: "camps", label: "Health & Eye Camps", value: "150+", icon: Stethoscope },
      { id: "volunteers", label: "Active Volunteers", value: "2,400+", icon: UsersRound },
      { id: "jobs", label: "Livelihood & Jobs", value: "1,800+", icon: BriefcaseBusiness }
    ];
  }, [cmsConfig?.impactStats, cardImpact]);

  const [marquee1, setMarquee1] = useState<string[]>(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("@rpf_marquee1_national_v2") || "[]");
      if (Array.isArray(cached) && cached.length) return cached;
    } catch {}
    return defaultNationalHeadlines;
  });

  const [marquee2, setMarquee2] = useState<string[]>(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("@rpf_marquee2_mpinfo_v2") || "[]");
      if (Array.isArray(cached) && cached.length) return cached;
    } catch {}
    return defaultMpHeadlines;
  });

  const [quoteOfDay, setQuoteOfDay] = useState<{ quote: string; author: string }>(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("@rpf_quote_cache") || "null");
      if (cached?.quote) return cached;
    } catch {}
    const randomIndex = Math.floor(Math.random() * dailyQuotes.length);
    return dailyQuotes[randomIndex];
  });

  const currentQuote = useMemo(() => {
    if (cmsConfig?.thoughtConfig?.currentQuote?.quote) {
      return {
        quote: cmsConfig.thoughtConfig.currentQuote.quote,
        author: cmsConfig.thoughtConfig.currentQuote.author || "Daily Thought"
      };
    }
    return quoteOfDay;
  }, [cmsConfig?.thoughtConfig, quoteOfDay]);

  const name = user?.name?.trim().split(/\s+/)[0] || "Guest";
  const hour = new Date().getHours();
  const greeting = hour >= 4 && hour < 12 ? "Good Morning" : hour >= 12 && hour < 17 ? "Good Afternoon" : hour >= 17 && hour < 22 ? "Good Evening" : "Good Night";

  const slides = useMemo(() => {
    const managed = Array.isArray(cmsConfig?.carouselSlides) ? cmsConfig.carouselSlides.filter((item: any) => item?.active !== false && item?.image) : [];
    return managed.length ? [...managed].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)) : fallbackSlides;
  }, [cmsConfig?.carouselSlides]);
  const current = slides[slide] || slides[0];

  useEffect(() => {
    if (slide >= slides.length) setSlide(0);
  }, [slide, slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setSlide((value) => (value + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    let alive = true;
    const loadQuote = async () => {
      try {
        const res = await timedFetch("/api/public/quote-of-day");
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.quote && alive) {
            setQuoteOfDay({ quote: json.data.quote, author: json.data.author || "Daily Thought" });
            try { localStorage.setItem("@rpf_quote_cache", JSON.stringify(json.data)); } catch {}
            return;
          }
        }
      } catch {}
      const randomIndex = Math.floor(Math.random() * dailyQuotes.length);
      if (alive) setQuoteOfDay(dailyQuotes[randomIndex]);
    };
    void loadQuote();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const marqueeUrl = supremeConfig.marquee_rss_url || "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3&reg=48";
        const thoughtUrl = supremeConfig.thought_rss_url || "https://mpinfo.org/RSSFeed/RSSFeed_News.xml";
        const [pibResponse, mpResponse] = await Promise.all([
          timedFetch("/api/public/rss-feed?url=" + encodeURIComponent(marqueeUrl)),
          timedFetch("/api/public/rss-feed?url=" + encodeURIComponent(thoughtUrl))
        ]);

        const pibJson = pibResponse.ok ? await pibResponse.json() : null;
        const mpJson = mpResponse.ok ? await mpResponse.json() : null;
        const pibItems = parseFeedItems(pibJson?.data || []);
        const mpItems = parseFeedItems(mpJson?.data || []);

        if (!alive) return;
        if (pibItems.length) {
          setMarquee1(pibItems);
          try { localStorage.setItem("@rpf_marquee1_national_v2", JSON.stringify(pibItems)); } catch {}
        }
        if (mpItems.length) {
          setMarquee2(mpItems);
          try { localStorage.setItem("@rpf_marquee2_mpinfo_v2", JSON.stringify(mpItems)); } catch {}
        }
      } catch {
        if (!alive) return;
      }
    };

    void load();
    const timer = window.setInterval(() => void load(), 60000);
    return () => { alive = false; window.clearInterval(timer); };
  }, []);

  const getSlideImage = (sUrl?: string, idx = 0) => {
    if (!sUrl || typeof sUrl !== "string") return fallbackSlides[idx % fallbackSlides.length].image;
    const t = sUrl.trim();
    if (!t) return fallbackSlides[idx % fallbackSlides.length].image;
    return resolveMediaUrl(t);
  };

  const quickAccessList = useMemo(() => {
    const defaultFour = [
      { title: "Utilities", subtitle: "Digital tools, emergency kit & everyday utilities", icon: Wrench, route: "/utilities", accent: "text-[#0A192F] bg-blue-500/10 border border-blue-500/20" },
      { title: "Calculator", subtitle: "GST, split bill, loan EMI & smart calculators", icon: Calculator, route: "/utilities/calculators", accent: "text-[#C2410C] bg-orange-500/10 border border-orange-500/20" },
      { title: "Online Test", subtitle: "Govt exam mock tests, daily quiz & certificates", icon: GraduationCap, route: "/online-test", accent: "text-[#167C5A] bg-emerald-500/10 border border-emerald-500/20" },
      { title: "Grievance", subtitle: "Submit public issues, track resolution & support status", icon: ClipboardList, route: "/grievance", accent: "text-[#14213D] bg-slate-500/10 border border-slate-500/20" }
    ];

    if (Array.isArray(cmsConfig?.quickAccessItems) && cmsConfig.quickAccessItems.length > 0) {
      const filtered = cmsConfig.quickAccessItems
        .filter((item: any) => {
          if (item.active === false) return false;
          const t = (item.title || "").toLowerCase();
          const r = (item.route || "").toLowerCase();
          if (t.includes("jan seva") || r.includes("jan-seva")) return false;
          if (t.includes("health") || r.includes("health")) return false;
          if (t.includes("employment") || t.includes("job") || r.includes("employment")) return false;
          return true;
        })
        .map((item: any) => {
          const IconComponent = (AVAILABLE_ICONS as any)[item.icon] || BadgePlus;
          return {
            title: item.title,
            subtitle: item.subtitle,
            icon: IconComponent,
            route: item.route || "/explore",
            accent: "text-[#D97706] bg-amber-500/10 border border-amber-500/20"
          };
        });

      if (filtered.length >= 4) return filtered.slice(0, 4);
      if (filtered.length > 0) {
        const existingRoutes = new Set(filtered.map((f: any) => f.route));
        const combined = [...filtered];
        for (const item of defaultFour) {
          if (!existingRoutes.has(item.route) && combined.length < 4) combined.push(item);
        }
        return combined;
      }
    }
    return defaultFour;
  }, [cmsConfig?.quickAccessItems]);

  return (
    <main className="min-h-full bg-transparent text-[#14213D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-6 pt-3 sm:px-6 space-y-4">
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 9 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, ease: "easeOut" }}
          className="relative isolate overflow-hidden rounded-2xl border border-emerald-100/70 bg-gradient-to-r from-[#FFF7E8] via-[#F0FAF4] to-[#FFE5C4] px-4 py-4 shadow-sm"
        >
          <motion.div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-14 -z-10 h-44 w-44 rounded-full bg-emerald-200/45 blur-2xl" animate={reduceMotion ? undefined : { x: [0, -18, 0], y: [0, 14, 0], opacity: [0.45, 0.72, 0.45] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div aria-hidden="true" className="pointer-events-none absolute -bottom-16 left-12 -z-10 h-32 w-32 rounded-full bg-amber-200/55 blur-2xl" animate={reduceMotion ? undefined : { x: [0, 18, 0], y: [0, -10, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
          <div className="flex items-start justify-between gap-2.5">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#243B32] tracking-tight leading-snug">
                {greeting}, {name} Ji,
              </h1>
              <p className="text-base sm:text-lg font-semibold text-slate-700 tracking-normal">
                Welcome to Samahit
              </p>
              <p className="text-xs sm:text-[13px] italic font-medium text-slate-500 tracking-normal pt-0.5">
                An initiative by the RP Foundation's Volunteers.
              </p>
            </div>
            {cmsConfig?.weatherConfig?.enabled !== false && (
              <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-xs border border-emerald-200/80 shadow-2xs text-[#243B32] mt-0.5" title="Live Weather">
                <CloudSun className="h-4 w-4 text-[#D97706]" />
                <span className="text-[13.5px] sm:text-[14.5px] font-black">24°C</span>
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-[#245D45]">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              {!reduceMotion && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />}
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
            </span>
            "Explore community services"
          </div>
        </motion.section>

        <LiveVerifiedMarketSection mode="panchang" />

        {cmsConfig?.marqueeConfig?.enabled !== false && marquee1.length > 0 && (
          <MarqueeTrack items={marquee1} direction="rtl" variant="saffron" label="PIB News" onClick={() => navigate("/news")} />
        )}

        {cmsConfig?.thoughtConfig?.enabled !== false && (
          <section className="rounded-2xl border border-amber-200/60 bg-amber-50/40 backdrop-blur-xs px-4 py-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[#D97706]">
              <Quote className="h-3.5 w-3.5" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Thought of the Day</p>
            </div>
            <p className="mt-1 text-[13px] sm:text-[14px] font-semibold leading-relaxed text-[#14213D]">“{currentQuote.quote}”</p>
            {currentQuote.author && (
              <p className="mt-0.5 text-right text-[11px] font-bold text-[#D97706] italic">— {currentQuote.author}</p>
            )}
          </section>
        )}

        {cmsConfig?.marqueeConfig?.enabled !== false && marquee2.length > 0 && (
          <MarqueeTrack items={marquee2} direction="rtl" variant="green" label="MPInfo" onClick={() => navigate("/news")} />
        )}

        <section className="pt-1">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#D97706]">Discover</p>
              <h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold text-[#14213D]">RP Foundation at Work</h2>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-transparent shadow-2xs">
            <div className="relative h-[210px] sm:h-[240px] w-full overflow-hidden bg-[#14213D] rounded-t-[24px]">
              <motion.img
                key={`slide-img-${slide}`}
                src={getSlideImage(current?.image, slide)}
                alt={current?.titleEn || "RP Foundation initiative"}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full w-full object-cover"
                onError={(e) => {
                  const img = e.currentTarget;
                  const fb = fallbackSlides[slide % fallbackSlides.length].image;
                  if (img.src !== fb) img.src = fb;
                }}
              />
            </div>

            <motion.div key={`slide-txt-${slide}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="py-3 px-1 bg-transparent space-y-1">
              <h3 className="text-[17px] sm:text-[19px] font-bold leading-tight text-[#14213D]">{current?.titleEn}</h3>
              <p className="text-[12.5px] sm:text-[13.5px] leading-relaxed text-slate-600 font-medium">{current?.subEn}</p>
            </motion.div>
          </div>

          <div className="mt-2 flex justify-center gap-1.5">
            {slides.map((_: any, i: number) => (
              <button key={i} onClick={() => setSlide(i)} className={`h-2 rounded-full transition-all duration-300 ${slide === i ? "w-7 bg-[#D97706]" : "w-2 bg-slate-300 hover:bg-slate-400"}`} />
            ))}
          </div>
        </section>

        <section className="pt-2">
          <div className="mb-2.5 flex items-center justify-between">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#167C5A]">Foundation & Impact</p>
              <h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold text-[#14213D]">Our Vision & Leadership</h2>
            </div>
            <button onClick={() => navigate("/impact")} className="text-xs font-bold text-[#167C5A] hover:underline flex items-center gap-1">
              Full Impact <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="rounded-[24px] border border-slate-200/80 bg-transparent backdrop-blur-xs p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white border border-emerald-500/20 p-1.5 shadow-sm">
                <img src={RP_FOUNDATION_LOGO} alt="" onError={(e) => { const el = e.currentTarget as HTMLImageElement; if (!el.src.includes("/assets/logo.png")) el.src = "/assets/logo.png"; }} className="h-full w-full object-contain" />
              </div>
              <div className="space-y-1">
                <h3 className="text-[16px] font-bold text-[#14213D]">Empowering Communities Through Direct Ground Action</h3>
                <p className="text-[12.5px] sm:text-[13px] leading-relaxed text-slate-600 font-medium">
                  RP Foundation is built on an interconnected model of social development—uniting accessible healthcare, sustainable employment, women’s self-reliance, and direct grievance resolution for lasting empowerment across India.
                </p>
                <button onClick={() => navigate("/vision-goals")} className="mt-1 inline-flex items-center gap-1 text-[12px] font-bold text-[#167C5A] hover:underline">
                  Explore Full Vision & Strategic Roadmap <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <hr className="border-slate-200/60" />

            <div className="flex items-start gap-3.5">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-amber-500/30 bg-white shadow-sm">
                <img src={ROHIT_PANDIT_PHOTO} alt="" onError={(e) => { const el = e.currentTarget as HTMLImageElement; if (!el.src.includes("/assets/founder.png")) el.src = "/assets/founder.png"; }} className="h-full w-full object-cover object-top" />
              </div>
              <div className="space-y-1">
                <h3 className="text-[16px] font-bold text-[#14213D]">Message from Founder Rohit Pandit</h3>
                <p className="text-[12.5px] sm:text-[13px] leading-relaxed text-slate-600 font-medium italic">
                  “True service begins when we reach out to those in need with humility, resolve, and unyielding commitment. Every initiative at RP Foundation is driven by our passionate volunteers working at the grass-roots level.”
                </p>
                <button onClick={() => navigate("/founder-message")} className="mt-1 inline-flex items-center gap-1 text-[12px] font-bold text-[#D97706] hover:underline">
                  Read Founder’s Message & Values <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-2">
          <div className="mb-3">
            <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#D97706]">Quick Access</p>
            <h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold text-[#14213D]">What can we help with?</h2>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            {quickAccessList.map(({ title, subtitle, icon: Icon, route, accent }) => (
              <motion.button key={title} whileTap={{ scale: 0.98 }} onClick={() => navigate(route)} className="min-h-[155px] rounded-2xl border border-slate-200/80 bg-transparent hover:bg-slate-50/50 backdrop-blur-xs p-4 text-left shadow-2xs hover:border-slate-300 transition-all">
                <div className="h-16 w-16" aria-hidden="true">{<div className={`flex h-full w-full items-center justify-center rounded-2xl ${accent}`}><Icon className="h-7 w-7" /></div>}</div>
                <div>
                  <p className="mt-3 text-[15px] font-bold text-[#14213D]">{title}</p>
                  <p className="mt-1 text-[11.5px] text-slate-500 font-medium leading-snug">{subtitle}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        <section className="pt-2">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
              </span>
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-widest text-red-600">Live Streaming</p>
                <h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold text-[#14213D]">Live TV Channels</h2>
              </div>
            </div>
            <button onClick={() => navigate("/live-tv")} className="text-xs font-bold text-[#C2410C] hover:underline flex items-center gap-1">
              Watch All (760+) <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {homeTvChannels.map((ch: any) => (
              <motion.div key={ch.id || ch.name} whileTap={{ scale: 0.96 }} onClick={() => navigate(`/live-tv?ch=${encodeURIComponent(ch.id || ch.name)}`)} className="group relative flex-shrink-0 w-[145px] sm:w-[160px] cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 hover:bg-white shadow-2xs hover:shadow-sm transition-all">
                <div className="relative h-[95px] w-full overflow-hidden bg-slate-900 flex items-center justify-center">
                  <ChannelThumbnail channel={ch} className="h-full w-full" size="md" />
                  <div className="absolute top-2 left-2 flex items-center gap-1 rounded bg-red-600/90 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    LIVE
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="h-9 w-9 rounded-full bg-white/90 text-[#14213D] flex items-center justify-center shadow-lg">
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <p className="text-[13px] font-bold text-[#14213D] leading-tight line-clamp-1 group-hover:text-[#C2410C] transition-colors">{ch.name}</p>
                  <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{ch.category || "General"}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="pt-2">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-[#E11D48]">
                <Clapperboard className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#E11D48]">Social & Media</p>
                <h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold text-[#14213D]">Shorts & Official Reels</h2>
              </div>
            </div>
            <button onClick={() => navigate("/reels")} className="text-xs font-bold text-[#E11D48] hover:underline flex items-center gap-1">
              Watch All <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {homeReels.map((reel: any, idx: number) => {
              const rawUrl = String(reel.link || reel.url || "");
              const ytMatch = rawUrl.match(/(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
              const videoId = reel.videoId || (ytMatch ? ytMatch[1] : undefined);
              const thumb = reel.thumbnailUrl || reel.thumbnail || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "/assets/mega_camp_banner.png");
              const title = reel.title || reel.description || "RP Foundation Update";

              return (
                <motion.div key={reel.id || idx} whileTap={{ scale: 0.96 }} onClick={() => navigate("/reels")} className="group relative flex-shrink-0 w-[120px] sm:w-[135px] h-[210px] sm:h-[235px] cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-900 shadow-2xs">
                  <img src={thumb} alt="" onError={(e) => { const el = e.currentTarget as HTMLImageElement; if (!el.src.includes("/assets/mega_camp_banner.png")) el.src = "/assets/mega_camp_banner.png"; }} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-between p-2.5">
                    <div className="flex justify-end">
                      <span className="rounded-full bg-black/50 backdrop-blur-md p-1 text-white/90"><Clapperboard className="h-3 w-3" /></span>
                    </div>
                    <div>
                      <div className="h-7 w-7 mx-auto mb-2 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 transition-transform"><Play className="h-3.5 w-3.5 fill-current ml-0.5" /></div>
                      <p className="text-[11px] font-bold text-white line-clamp-2 leading-tight drop-shadow-sm">{title}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
      <style>{`
        @keyframes rpf-marquee-rtl { 0% { transform: translate3d(0, 0, 0); } 100% { transform: translate3d(-50%, 0, 0); } }
        @keyframes rpf-marquee-ltr { 0% { transform: translate3d(-50%, 0, 0); } 100% { transform: translate3d(0, 0, 0); } }
      `}</style>
    </main>
  );
}
