import ServiceIllustration, { serviceArtFor } from "../components/ServiceIllustration";
import { useEffect, useMemo, useState } from "react";
import { BadgePlus, BriefcaseBusiness, ClipboardList, HeartPulse, UsersRound, Stethoscope, CalendarDays, ChevronRight, Compass, UserRound, Quote, Calculator, Wrench } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { resolveMediaUrl } from "../utils/media";
import { RP_FOUNDATION_LOGO, ROHIT_PANDIT_PHOTO } from "../assets/foundationBrand";
import { AnimatedMetricCard } from "../components/AnimatedMetricCard";
import LiveVerifiedMarketSection from "../components/LiveVerifiedMarketSection";

const fallbackSlides = [
  { image: "/assets/mega_camp_banner.png", titleEn: "Healthcare support for the community", subEn: "Health camps, medical support and community care.", route: "/health-care" },
  { image: "/assets/water_pump_camp.png", titleEn: "Service that reaches people", subEn: "Ground-level initiatives focused on practical support.", route: "/impact" },
  { image: "/assets/founder.png", titleEn: "Service. Commitment. Resolve.", subEn: "Discover the people and purpose behind the work.", route: "/founder-message" },
  { image: "/assets/donate.jpg", titleEn: "Support, skills and opportunity", subEn: "Explore programmes and services available to the community.", route: "/services" }
];

const actions = [
  { title: "Jan Seva Card", subtitle: "Your digital service identity", icon: BadgePlus, route: "/jan-seva-card", accent: "text-[#D97706] bg-amber-500/10 border border-amber-500/20" },
  { title: "Healthcare", subtitle: "Health services and support", icon: HeartPulse, route: "/health-care", accent: "text-[#DC2626] bg-red-500/10 border border-red-500/20" },
  { title: "Employment", subtitle: "Jobs, skills and opportunities", icon: BriefcaseBusiness, route: "/employment", accent: "text-[#167C5A] bg-emerald-500/10 border border-emerald-500/20" },
  { title: "Grievance", subtitle: "Submit and track an issue", icon: ClipboardList, route: "/grievance", accent: "text-[#14213D] bg-slate-500/10 border border-slate-500/20" }
];

async function timedFetch(url: string, ms = 5000) {
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
  { quote: "नर सेवा ही नारायण सेवा है। पीड़ितों की सेवा से बढ़कर कोई साधना नहीं।", author: "स्वामी विवेकानंद" },
  { quote: "सपने वो नहीं जो हम सोते हुए देखते हैं, सपने वो हैं जो हमें सोने नहीं देते।", author: "डॉ. एपीजे अब्दुल कलाम" },
  { quote: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi" },
  { quote: "हम दूसरों को उठाकर ही स्वयं ऊपर उठते हैं।", author: "रॉबर्ट इंगरसोल" },
  { quote: "परहित सरिस धर्म नहिं भाई, पर पीड़ा सम नहिं अधमाई।", author: "गोस्वामी तुलसीदास" },
  { quote: "Where there is unity, there is always victory and welfare.", author: "Sardar Vallabhbhai Patel" },
  { quote: "God gives the nuts, but he does not crack them.", author: "Franz Kafka" },
  { quote: "Well done is better than well said.", author: "Benjamin Franklin" }
];

const defaultNationalHeadlines = [
  "प्रधानमंत्री ने राष्ट्रीय विकास, डिजिटल सेवा और जनकल्याण योजनाओं की प्रगति की समीक्षा की",
  "G20 और अंतरराष्ट्रीय मंचों पर भारत की सशक्त वैश्विक भागीदारी और कूटनीतिक प्रगति",
  "डिजिटल इंडिया व जन सेवा मिशन के तहत देश भर में करोड़ों नागरिकों को पारदर्शी सीधा लाभ",
  "भारतीय वैज्ञानिकों और तकनीकी विशेषज्ञों ने अंतरिक्ष व अनुसंधान क्षेत्र में लहराया परचम",
  "केंद्रीय मंत्रिमंडल ने राष्ट्रीय अवसंरचना और रोजगार सृजन से जुड़ी नई परियोजनाओं को दी मंजूरी"
];

const defaultMpHeadlines = [
  "मध्य प्रदेश सरकार ने ग्रामीण और शहरी विकास हेतु नई जनकल्याणकारी योजनाओं की घोषणा की",
  "भोपाल, इंदौर, जबलपुर, ग्वालियर और उज्जैन में नागरिक स्वास्थ्य और डिजिटल सेवाओं का विस्तार",
  "मध्य प्रदेश के किसानों, युवाओं और महिलाओं के लिए स्वरोजगार व कौशल विकास के नए अवसर",
  "महाकाल महालोक व ओंकारेश्वर धार्मिक कॉरिडोर के विकास कार्यों से प्रदेश में पर्यटन को नया बल",
  "प्रदेश के सभी जिलों में जन सेवा केंद्रों और पंचायत स्तर पर सरकारी योजनाओं का त्वरित क्रियान्वयन"
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

function MarqueeTrack({
  items,
  direction = "rtl",
  variant = "saffron",
  label = "",
  onClick
}: {
  items: string[];
  direction?: "rtl" | "ltr" | "utd";
  variant?: "saffron" | "red" | "green";
  label?: string;
  onClick?: () => void;
}) {
  const cleanItems = useMemo(() => {
    return (items || [])
      .map(cleanHeadline)
      .filter((t) => t.length > 10 && !/^(temporarily unavailable|no news available|rss feed|विज्ञप्ति)/i.test(t));
  }, [items]);

  if (cleanItems.length === 0) return null;

  const isGreen = variant === "green";
  const isRed = variant === "red";

  const containerClasses = isGreen
    ? "border-emerald-200/90 bg-transparent shadow-2xs"
    : isRed
    ? "border-red-200/90 bg-transparent shadow-2xs"
    : "border-amber-200/90 bg-transparent shadow-2xs";

  const textClasses = isGreen
    ? "text-[#167C5A] font-black"
    : isRed
    ? "text-red-700 font-black"
    : "text-[#C2410C] font-black";

  const separatorClasses = isGreen
    ? "text-[#D97706] font-bold"
    : isRed
    ? "text-amber-500 font-bold"
    : "text-[#167C5A] font-bold";

  const labelBadgeClasses = isGreen
    ? "bg-emerald-50 text-[#167C5A] border-emerald-200"
    : isRed
    ? "bg-red-50 text-red-700 border-red-200"
    : "bg-amber-50 text-[#C2410C] border-amber-200";

  // Handle Vertical (Up to Down) Marquee
  if (direction === "utd") {
    const trackItems = [...cleanItems, ...cleanItems];
    const duration = Math.max(30, Math.round(cleanItems.length * 4.5));

    return (
      <div className={`relative overflow-hidden rounded-2xl border backdrop-blur-xs py-2 px-3 group flex items-center ${containerClasses}`}>
        {label && (
          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 mr-2 select-none border ${labelBadgeClasses}`}>
            {label}
          </span>
        )}
        <div className="relative h-6 overflow-hidden w-full flex-1">
          <div
            className="absolute inset-x-0 transition-transform group-hover:[animation-play-state:paused]"
            style={{
              animation: `rpf-marquee-utd ${duration}s linear infinite`
            }}
          >
            {trackItems.map((title, idx) => (
              <div key={idx} className="h-6 flex items-center px-1">
                <span className={`text-[12.5px] truncate ${textClasses}`}>
                  {title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Handle Horizontal (Right to Left & Left to Right)
  const trackItems = [...cleanItems, ...cleanItems];
  const totalChars = cleanItems.join(" | ").length;
  const duration = Math.max(35, Math.round(totalChars * 0.14));
  const animationName = direction === "ltr" ? "rpf-marquee-ltr" : "rpf-marquee-rtl";

  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border backdrop-blur-xs py-2.5 group ${containerClasses} ${onClick ? "cursor-pointer hover:border-orange-300 transition-all" : ""}`}
    >
      <div
        className="flex whitespace-nowrap min-w-max items-center transition-transform group-hover:[animation-play-state:paused]"
        style={{
          animation: `${animationName} ${duration}s linear infinite`
        }}
      >
        {trackItems.map((title, idx) => (
          <div key={idx} className="flex items-center">
            <span className={`text-[12.5px] tracking-normal px-2 ${textClasses}`}>
              {title}
            </span>
            <span className={`text-xs px-3 select-none ${separatorClasses}`}>
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
  const [marquee1, setMarquee1] = useState<string[]>(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("@rpf_marquee1_national_v2") || "[]");
      if (Array.isArray(cached) && cached.length) return cached;
    } catch {}
    return defaultNationalHeadlines;
  });

  const [marquee2, setMarquee2] = useState<string[]>(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("@rpf_marquee2_mp_v2") || "[]");
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

  // Thought of the Day: Live from RSS Feed (no hardcoded override)
  const currentQuote = quoteOfDay;

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

  // Load Thought of the Day live from RSS Feed
  useEffect(() => {
    let alive = true;
    const loadQuote = async () => {
      try {
        const res = await timedFetch("/api/public/quote-of-day");
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.quote && alive) {
            setQuoteOfDay({ quote: json.data.quote, author: json.data.author || "Daily Thought" });
            try {
              localStorage.setItem("@rpf_quote_cache", JSON.stringify(json.data));
            } catch {}
            return;
          }
        }
      } catch {}
      const randomIndex = Math.floor(Math.random() * dailyQuotes.length);
      if (alive) {
        setQuoteOfDay(dailyQuotes[randomIndex]);
      }
    };
    void loadQuote();
    return () => { alive = false; };
  }, []);

  // Load Marquees Live from RSS Pipeline
  useEffect(() => {
    let alive = true;
    const restore = (key: string, setter: (value: string[]) => void) => {
      try { const cached = JSON.parse(localStorage.getItem(key) || "[]"); if (Array.isArray(cached) && cached.length) setter(cached); } catch {}
    };
    restore("@rpf_marquee1_national_v2", setMarquee1);
    restore("@rpf_marquee2_mp_v2", setMarquee2);

    const load = async () => {
      for (const url of [
        "/api/public/live-feed",
        "/api/public/news",
        "/api/public/rss-feed?feedId=pib-national",
        "/api/public/rss-feed?feedId=sarkari-jobs",
        "/rss-proxy.php",
        "https://samahit.rpfoundation.org/rss-proxy.php"
      ]) {
        try {
          const response = await timedFetch(url);
          if (!response.ok) continue;
          const json = await response.json();
          const data = json?.data ?? json;
          const m1 = parseFeedItems(data?.marquee1 ?? data?.nationalAndWorldNews ?? data?.nationalNews ?? data?.items ?? []);
          const m2 = parseFeedItems(data?.marquee2 ?? data?.mpNews ?? []);
          if (!alive) return;
          if (m1.length) { setMarquee1(m1); try { localStorage.setItem("@rpf_marquee1_national_v2", JSON.stringify(m1)); } catch {} }
          if (m2.length) { setMarquee2(m2); try { localStorage.setItem("@rpf_marquee2_mp_v2", JSON.stringify(m2)); } catch {} }
          if (m1.length && m2.length) break;
        } catch {}
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

  return (
    <main className="min-h-full bg-transparent text-[#14213D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-6 pt-3 sm:px-6 space-y-4">
        
        {/* 1. GREETING HEADER */}
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 9 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, ease: "easeOut" }}
          className="relative isolate overflow-hidden rounded-2xl border border-emerald-100/70 bg-gradient-to-r from-[#FFF7E8] via-[#F0FAF4] to-[#FFE5C4] px-4 py-4 shadow-sm"
        >
          <motion.div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-14 -z-10 h-44 w-44 rounded-full bg-emerald-200/45 blur-2xl"
            animate={reduceMotion ? undefined : { x: [0, -18, 0], y: [0, 14, 0], opacity: [0.45, 0.72, 0.45] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div aria-hidden="true" className="pointer-events-none absolute -bottom-16 left-12 -z-10 h-32 w-32 rounded-full bg-amber-200/55 blur-2xl"
            animate={reduceMotion ? undefined : { x: [0, 18, 0], y: [0, -10, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
          <h1 className="text-2xl sm:text-3xl font-bold text-[#243B32] tracking-tight leading-snug">
            {greeting}, {name} Ji,
          </h1>
          <p className="text-base sm:text-lg font-semibold text-slate-700 tracking-normal">
            Welcome to Samahit
          </p>
          <p className="text-xs sm:text-[13px] italic font-medium text-slate-500 tracking-normal pt-0.5">
            An initiative by the RP Foundation's Volunteers.
          </p>
          <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-[#245D45]">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              {!reduceMotion && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />}
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
            </span>
            {cmsConfig?.alertBannerEn || cmsConfig?.alertBannerHi ? "Latest updates available" : "Explore community services"}
          </div>
        </motion.section>

        {/* 2. THOUGHT OF THE DAY (IMMEDIATELY AFTER GREETING) */}
        <section className="rounded-2xl border border-amber-200/60 bg-amber-50/40 backdrop-blur-xs px-4 py-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[#D97706]">
            <Quote className="h-3.5 w-3.5" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Thought of the Day</p>
          </div>
          <p className="mt-1 text-[13px] sm:text-[14px] font-semibold leading-relaxed text-[#14213D]">
            “{currentQuote.quote}”
          </p>
          {currentQuote.author && (
            <p className="mt-0.5 text-right text-[11px] font-bold text-[#D97706] italic">
              — {currentQuote.author}
            </p>
          )}
        </section>

        {/* 3. LIVE RSS NEWS MARQUEES: STRICTLY TWO (2) MARQUEES */}
        {/* TOP MARQUEE (1/2): National & International News (DARK SAFFRON) */}
        {marquee1.length > 0 && (
          <MarqueeTrack
            items={marquee1}
            direction="rtl"
            variant="saffron"
            label="National & Global"
            onClick={() => navigate("/news")}
          />
        )}

        {/* BOTTOM MARQUEE (2/2): Madhya Pradesh News (GREEN) */}
        {marquee2.length > 0 && (
          <MarqueeTrack
            items={marquee2}
            direction="ltr"
            variant="green"
            label="Madhya Pradesh"
            onClick={() => navigate("/news")}
          />
        )}

        {/* 4. LIVE VERIFIED MARKET & PANCHANG SECTION */}
        <LiveVerifiedMarketSection />

        {/* 5. CAROUSEL: RP FOUNDATION AT WORK (TRANSPARENT TEXT BACKGROUND) */}
        <section className="pt-1">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#D97706]">Discover</p>
              <h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold text-[#14213D]">RP Foundation at Work</h2>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-transparent shadow-2xs">
            {/* Clear Image Viewport */}
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

            {/* Transparent Content Drawer */}
            <motion.div
              key={`slide-txt-${slide}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="py-3 px-1 bg-transparent space-y-1"
            >
              <h3 className="text-[17px] sm:text-[19px] font-bold leading-tight text-[#14213D]">
                {current?.titleEn}
              </h3>
              <p className="text-[12.5px] sm:text-[13.5px] leading-relaxed text-slate-600 font-medium">
                {current?.subEn}
              </p>
            </motion.div>
          </div>

          {/* Carousel Pagination Dots */}
          <div className="mt-2 flex justify-center gap-1.5">
            {slides.map((_: any, i: number) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${slide === i ? "w-7 bg-[#D97706]" : "w-2 bg-slate-300 hover:bg-slate-400"}`}
              />
            ))}
          </div>
        </section>

        {/* 5. OUR VISION & LEADERSHIP (TRANSPARENT BACKGROUND) */}
        <section className="pt-2">
          <div className="mb-2.5">
            <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#167C5A]">Foundation</p>
            <h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold text-[#14213D]">Our Vision & Leadership</h2>
          </div>

          <div className="rounded-[24px] border border-slate-200/80 bg-transparent backdrop-blur-xs p-5 shadow-2xs space-y-4">
            {/* Vision Narrative */}
            <div className="flex items-start gap-3.5">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-white border border-emerald-500/20 p-1.5 shadow-sm">
                <img src="/assets/logo.png" alt="RP Foundation" className="h-full w-full object-contain" />
              </div>
              <div className="space-y-1">
                <h3 className="text-[16px] font-bold text-[#14213D]">Empowering Communities Through Direct Ground Action</h3>
                <p className="text-[12.5px] sm:text-[13px] leading-relaxed text-slate-600 font-medium">
                  RP Foundation is built on an interconnected model of social development—uniting accessible healthcare, sustainable employment, women’s self-reliance, and direct grievance resolution for lasting empowerment across India.
                </p>
                <button
                  onClick={() => navigate("/vision-goals")}
                  className="mt-1 inline-flex items-center gap-1 text-[12px] font-bold text-[#167C5A] hover:underline"
                >
                  Explore Full Vision & Strategic Roadmap <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <hr className="border-slate-200/60" />

            {/* Founder's Message Narrative */}
            <div className="flex items-start gap-3.5">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-amber-500/30 bg-white shadow-sm">
                <img src="/assets/founder.png" alt="Rohit Pandit, Founder of RP Foundation" className="h-full w-full object-cover object-top" />
              </div>
              <div className="space-y-1">
                <h3 className="text-[16px] font-bold text-[#14213D]">Message from Founder Rohit Pandit</h3>
                <p className="text-[12.5px] sm:text-[13px] leading-relaxed text-slate-600 font-medium italic">
                  “True service begins when we reach out to those in need with humility, resolve, and unyielding commitment. Every initiative at RP Foundation is driven by our passionate volunteers working at the grass-roots level.”
                </p>
                <button
                  onClick={() => navigate("/founder-message")}
                  className="mt-1 inline-flex items-center gap-1 text-[12px] font-bold text-[#D97706] hover:underline"
                >
                  Read Founder’s Message & Values <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. VERIFIED IMPACT HIGHLIGHTS (Directly synced with Admin Impact Studio) */}
        <section className="pt-2">
          <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-1.5 text-[#166534]">
                <UsersRound className="h-4 w-4 text-[#C2410C]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0A192F]">Ground Impact & Reach</h3>
              </div>
              <button
                onClick={() => navigate("/impact")}
                className="text-[11px] font-bold text-[#C2410C] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Full Impact Report</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(Array.isArray(cmsConfig?.impactStats) && cmsConfig.impactStats.length > 0
                ? cmsConfig.impactStats.filter((s: any) => s.enabled !== false).slice(0, 4)
                : [
                    { id: "beneficiaries", labelEn: "Beneficiaries", labelHi: "कुल लाभार्थी", value: 250000, suffix: "+" },
                    { id: "health_camps", labelEn: "Health Camps", labelHi: "स्वास्थ्य शिविर", value: 450, suffix: "+" },
                    { id: "tree_plantations", labelEn: "Trees Planted", labelHi: "रोपित पौधे", value: 50000, suffix: "+" },
                    { id: "cards_issued", labelEn: "Jan Seva Cards", labelHi: "जन सेवा कार्ड", value: 120000, suffix: "+" }
                  ]
              ).map((st: any, idx: number) => {
                const tones: ("saffron" | "green" | "gold" | "navy")[] = ["saffron", "green", "gold", "navy"];
                const tone = tones[idx % tones.length];
                return (
                  <AnimatedMetricCard
                    key={st.id || idx}
                    label={st.labelEn || st.labelHi}
                    value={Number(st.value) || 0}
                    suffix={st.suffix || "+"}
                    tone={tone}
                    delay={idx * 0.08}
                    onClick={() => navigate("/impact")}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. WHAT CAN WE HELP WITH (TRANSPARENT BACKGROUND CARDS) */}
        <section className="pt-2">
          <div className="mb-3">
            <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#D97706]">Quick Access</p>
            <h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold text-[#14213D]">What can we help with?</h2>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            {[
              {
                title: "Jan Seva Card",
                subtitle: "Your digital service identity & welfare benefit card",
                icon: BadgePlus,
                route: "/jan-seva-card",
                accent: "text-[#D97706] bg-amber-500/10 border border-amber-500/20"
              },
              {
                title: "Healthcare",
                subtitle: "Free health camps, medical support & emergency assistance",
                icon: HeartPulse,
                route: "/health-care",
                accent: "text-[#DC2626] bg-red-500/10 border border-red-500/20"
              },
              {
                title: "Employment",
                subtitle: "Job opportunities, skill training & career support",
                icon: BriefcaseBusiness,
                route: "/employment",
                accent: "text-[#167C5A] bg-emerald-500/10 border border-emerald-500/20"
              },
              {
                title: "Grievance",
                subtitle: "Submit public issues, track resolution & support status",
                icon: ClipboardList,
                route: "/grievance",
                accent: "text-[#14213D] bg-slate-500/10 border border-slate-500/20"
              },
              {
                title: "Samahit Utilities",
                subtitle: "Everyday tools, fasting tracker, breathing & digital utilities",
                icon: Wrench,
                route: "/utilities",
                accent: "text-[#0A192F] bg-blue-500/10 border border-blue-500/20"
              },
              {
                title: "Smart Calculators",
                subtitle: "GST, split bill, BMI, loan EMI & all-in-one calculators",
                icon: Calculator,
                route: "/utilities/calculators",
                accent: "text-[#C2410C] bg-orange-500/10 border border-orange-500/20"
              }
            ].map(({ title, subtitle, icon: Icon, route, accent }) => (
              <motion.button
                key={title}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(route)}
                className="min-h-[155px] rounded-2xl border border-slate-200/80 bg-transparent hover:bg-slate-50/50 backdrop-blur-xs p-4 text-left shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="h-16 w-16" aria-hidden="true">{serviceArtFor(title) ? <ServiceIllustration kind={serviceArtFor(title)!} className="h-full w-full" /> : <div className={`flex h-full w-full items-center justify-center rounded-xl ${accent}`}><Icon className="h-6 w-6" /></div>}</div>
                <div>
                  <p className="mt-3 text-[15px] font-bold text-[#14213D]">{title}</p>
                  <p className="mt-1 text-[11.5px] text-slate-500 font-medium leading-snug">{subtitle}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* 7. SOCIAL IMPACT HIGHLIGHTS (COMMUNITY, CARE, ACTIVE - TRANSPARENT BACKGROUND & LINKED TO IMPACT PAGE) */}
        <section className="pt-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#167C5A]">Our Field Impact</p>
              <h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold text-[#14213D]">Community, Care, Active</h2>
            </div>
            <button
              onClick={() => navigate("/community-care-active")}
              className="text-xs font-bold text-[#167C5A] hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div 
            onClick={() => navigate("/community-care-active")}
            className="grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-transparent backdrop-blur-xs shadow-2xs cursor-pointer hover:border-emerald-300/80 transition-all"
          >
            {[
              { icon: UsersRound, value: "Community", label: "Welfare & Culture" },
              { icon: Stethoscope, value: "Care", label: "Health & Relief" },
              { icon: CalendarDays, value: "Active", label: "Field Initiatives" }
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="border-r border-slate-200/60 px-2 py-4 text-center last:border-r-0 hover:bg-emerald-50/20 transition-colors">
                <Icon className="mx-auto h-4.5 w-4.5 text-[#167C5A]" />
                <p className="mt-2 text-[13px] sm:text-[14px] font-bold text-[#14213D]">{value}</p>
                <p className="mt-0.5 text-[9px] text-slate-500 font-semibold tracking-tight">{label}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
      <style>{`
        @keyframes rpf-marquee-rtl {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes rpf-marquee-ltr {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        @keyframes rpf-marquee-utd {
          0% { transform: translate3d(0, -50%, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
      `}</style>
    </main>
  );
}
