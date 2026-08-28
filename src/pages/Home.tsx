import { useEffect, useMemo, useState } from "react";
import { BadgePlus, BriefcaseBusiness, ClipboardList, HeartPulse, UsersRound, Stethoscope, CalendarDays, ChevronRight, Compass, UserRound, Quote } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

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

const defaultMarquee1 = [
  "वीडियो कॉन्फ्रेंसिंग के ज़रिए खेलो इंडिया डायलॉग में प्रधानमंत्री नरेंद्र मोदी जी का मुख्य संबोधन",
  "Union Home Minister Amit Shah addresses convocation of Gujarat Vidyapith in Ahmedabad",
  "From Gandhi’s reconstruction to India@2047: HM Shah outlines vision for youth",
  "मध्यप्रदेश शासन: मुख्यमंत्री डॉ. मोहन यादव ने विकास कार्यों एवं जनकल्याणकारी योजनाओं की समीक्षा की",
  "12 Years of PMJDY: 59.09 Crore Accounts Opened, Deposits Reach ₹3.17 Lakh Crore"
];

const defaultMarquee2 = [
  "River Gandak at Dumariaghat in Gopalganj district continues to flow in severe flood situation: NDMA Alert",
  "IMD Bulletin: Heavy rainfall to very heavy rainfall forecast over North-East and East India districts in next 24 hours",
  "IMD Guwahati: Thunderstorms with Lightning accompanied by light to moderate rain very likely over isolated places",
  "Nepal flash floods: 63 Indian nationals rescued from Trishuli-1 power project site by emergency response team",
  "NDMA Sachet Alert: High flood situation warning for Bihar and Eastern Uttar Pradesh river basins"
];

const defaultMarquee3 = [
  "Nepal Flash Floods: Indian Pilgrims in China contactable, over 96 cross over safely",
  "US senators seek West Bank killings report from Department of State",
  "Devastating floods leave more than 1,300 missing along Nepal-China border",
  "US Army bets $2.2 billion on microreactors for futuristic defense power systems",
  "UN Security Council urges immediate ceasefire and humanitarian aid access in conflict zones"
];

const dailyQuotes = [
  { quote: "Work is worship, and service is the greatest religion.", author: "Rohit Pandit" },
  { quote: "The best way to find yourself is to lose yourself in the service of others.", author: "Mahatma Gandhi" },
  { quote: "Arise, awake, and stop not till the goal is reached.", author: "Swami Vivekananda" },
  { quote: "Service to man is service to God.", author: "Swami Vivekananda" },
  { quote: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi" },
  { quote: "We rise by lifting others.", author: "Robert Ingersoll" }
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
  label = ""
}: {
  items: string[];
  direction?: "rtl" | "ltr" | "utd";
  variant?: "saffron" | "red" | "green";
  label?: string;
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
    ? "border-emerald-300/80 bg-emerald-50/70 text-[#15803D]"
    : isRed
    ? "border-red-300/80 bg-red-50/70 text-[#DC2626]"
    : "border-amber-300/80 bg-amber-50/70 text-[#C2410C]";

  const textClasses = isGreen
    ? "text-[#15803D]"
    : isRed
    ? "text-[#DC2626]"
    : "text-[#C2410C]";

  const separatorClasses = isGreen
    ? "text-[#167C5A]"
    : isRed
    ? "text-[#B91C1C]"
    : "text-[#D97706]";

  // Handle Vertical (Up to Down) Marquee
  if (direction === "utd") {
    const trackItems = [...cleanItems, ...cleanItems];
    const duration = Math.max(30, Math.round(cleanItems.length * 4.5));

    return (
      <div className={`relative overflow-hidden rounded-2xl border backdrop-blur-md py-2 px-3 shadow-2xs group flex items-center ${containerClasses}`}>
        {label && (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-600/15 text-[#15803D] shrink-0 mr-2 select-none">
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
                <span className={`text-[12.5px] font-bold truncate ${textClasses}`}>
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
    <div className={`relative overflow-hidden rounded-2xl border backdrop-blur-md py-2.5 shadow-2xs group ${containerClasses}`}>
      <div
        className="flex whitespace-nowrap min-w-max items-center transition-transform group-hover:[animation-play-state:paused]"
        style={{
          animation: `${animationName} ${duration}s linear infinite`
        }}
      >
        {trackItems.map((title, idx) => (
          <div key={idx} className="flex items-center">
            <span className={`text-[12.5px] font-bold tracking-normal px-2 ${textClasses}`}>
              {title}
            </span>
            <span className={`font-bold text-xs px-3 select-none ${separatorClasses}`}>
              |
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cmsConfig } = useApp();
  const [slide, setSlide] = useState(0);
  const [marquee1, setMarquee1] = useState<string[]>(defaultMarquee1);
  const [marquee2, setMarquee2] = useState<string[]>(defaultMarquee2);
  const [marquee3, setMarquee3] = useState<string[]>(defaultMarquee3);
  const [quoteOfDay, setQuoteOfDay] = useState(dailyQuotes[0]);

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

  // Load Thought of the Day live
  useEffect(() => {
    const loadQuote = async () => {
      try {
        const res = await timedFetch("/api/public/quote-of-day");
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.quote) {
            setQuoteOfDay({ quote: json.data.quote, author: json.data.author || "Daily Thought" });
            return;
          }
        }
      } catch {}
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      setQuoteOfDay(dailyQuotes[dayOfYear % dailyQuotes.length]);
    };
    void loadQuote();
  }, []);

  // Load 3 Marquees Live
  useEffect(() => {
    let alive = true;
    const restore = (key: string, setter: (value: string[]) => void) => {
      try { const cached = JSON.parse(localStorage.getItem(key) || "[]"); if (Array.isArray(cached) && cached.length) setter(cached); } catch {}
    };
    restore("@rpf_marquee1_cache", setMarquee1);
    restore("@rpf_marquee2_cache", setMarquee2);
    restore("@rpf_marquee3_cache", setMarquee3);

    const load = async () => {
      for (const url of ["/api/public/live-feed", "/api/public/news", "/rss-proxy.php", "https://samahit.rpfoundation.org/rss-proxy.php"]) {
        try {
          const response = await timedFetch(url);
          if (!response.ok) continue;
          const json = await response.json();
          const data = json?.data ?? json;
          const m1 = parseFeedItems(data?.marquee1 ?? data?.governmentNews ?? data?.pib ?? []);
          const m2 = parseFeedItems(data?.marquee2 ?? data?.emergencyAlerts ?? data?.sachet ?? []);
          const m3 = parseFeedItems(data?.marquee3 ?? data?.worldNews ?? data?.news ?? []);
          if (!alive) return;
          if (m1.length) { setMarquee1(m1); try { localStorage.setItem("@rpf_marquee1_cache", JSON.stringify(m1)); } catch {} }
          if (m2.length) { setMarquee2(m2); try { localStorage.setItem("@rpf_marquee2_cache", JSON.stringify(m2)); } catch {} }
          if (m3.length) { setMarquee3(m3); try { localStorage.setItem("@rpf_marquee3_cache", JSON.stringify(m3)); } catch {} }
          if (m1.length || m2.length || m3.length) break;
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
    return t.startsWith("assets/") ? `/${t}` : t;
  };

  return (
    <main className="min-h-full bg-transparent text-[#14213D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-6 pt-3 sm:px-6 space-y-4">
        
        {/* 1. GREETING HEADER */}
        <section className="bg-transparent py-1 space-y-0.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14213D] tracking-tight leading-snug">
            {greeting}, {name} Ji,
          </h1>
          <p className="text-base sm:text-lg font-semibold text-slate-700 tracking-normal">
            Welcome to Samahit
          </p>
          <p className="text-xs sm:text-[13px] italic font-medium text-slate-500 tracking-normal pt-0.5">
            An initiative by the RP Foundation's Volunteers.
          </p>
        </section>

        {/* 2. THOUGHT OF THE DAY (IMMEDIATELY AFTER GREETING) */}
        <section className="rounded-2xl border border-amber-200/60 bg-amber-50/40 backdrop-blur-xs px-4 py-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[#D97706]">
            <Quote className="h-3.5 w-3.5" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Thought of the Day</p>
          </div>
          <p className="mt-1 text-[13px] sm:text-[14px] font-semibold leading-relaxed text-[#14213D]">
            “{quoteOfDay.quote}”
          </p>
          {quoteOfDay.author && (
            <p className="mt-0.5 text-right text-[11px] font-bold text-[#D97706] italic">
              — {quoteOfDay.author}
            </p>
          )}
        </section>

        {/* 3. TWO MARQUEES (MARQUEE 3 REMOVED) */}
        
        {/* MARQUEE 1: PIB + DD News + DD India + MP Info -> Right to Left (Dark Saffron) */}
        {marquee1.length > 0 && <MarqueeTrack items={marquee1} direction="rtl" variant="saffron" />}

        {/* MARQUEE 2: SACHET NDMA + IMD Weather Bulletin -> Left to Right (Emergency Red) */}
        {marquee2.length > 0 && <MarqueeTrack items={marquee2} direction="ltr" variant="red" />}

        {/* 4. CAROUSEL: RP FOUNDATION AT WORK (NO OVERLAP ON IMAGE + ANIMATED TEXT DRAWER) */}
        <section className="pt-1">
          <div className="mb-2.5 flex items-end justify-between">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#D97706]">Discover</p>
              <h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold text-[#14213D]">RP Foundation at Work</h2>
            </div>
            <span className="text-[12px] font-semibold text-slate-500">{slide + 1} / {slides.length}</span>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-amber-200/80 bg-white shadow-xs">
            {/* Clear Image Viewport */}
            <div className="relative h-[210px] sm:h-[240px] w-full overflow-hidden bg-[#14213D]">
              <motion.img
                key={`slide-img-${slide}`}
                src={getSlideImage(current?.image, slide)}
                alt={current?.titleEn || "RP Foundation initiative"}
                initial={{ opacity: 0.3, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="h-full w-full object-cover"
                onError={(e) => {
                  const img = e.currentTarget;
                  const fb = fallbackSlides[slide % fallbackSlides.length].image;
                  if (img.src !== fb) img.src = fb;
                }}
              />
              <div className="absolute top-3 right-3 rounded-full bg-[#14213D]/75 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-amber-300 border border-amber-300/30">
                {slide + 1} / {slides.length}
              </div>
            </div>

            {/* Non-Overlapping Animated Content Card */}
            <motion.div
              key={`slide-txt-${slide}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="p-4 sm:p-5 bg-gradient-to-b from-white via-amber-50/15 to-white"
            >
              <h3 className="text-[17px] sm:text-[19px] font-bold leading-tight text-[#14213D]">
                {current?.titleEn}
              </h3>
              <p className="mt-1.5 text-[12.5px] sm:text-[13.5px] leading-relaxed text-slate-600 font-medium">
                {current?.subEn}
              </p>
              <button
                onClick={() => navigate((current as any)?.route || "/impact")}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-3.5 py-1.5 text-[12px] font-bold text-[#C2410C] hover:bg-amber-500/20 transition-all border border-amber-300/40"
              >
                Explore Initiative <ChevronRight className="h-4 w-4" />
              </button>
            </motion.div>
          </div>

          <div className="mt-3 flex justify-center gap-2">
            {slides.map((_: any, i: number) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-2 rounded-full transition-all ${slide === i ? "w-7 bg-[#D97706]" : "w-2 bg-slate-300"}`}
              />
            ))}
          </div>
        </section>

        {/* 5. OUR VISION & LEADERSHIP (PLACED DIRECTLY AFTER CAROUSEL) */}
        <section className="pt-2">
          <div className="mb-3">
            <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#167C5A]">Foundation</p>
            <h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold text-[#14213D]">Our Vision & Leadership</h2>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/vision-goals")}
              className="rounded-2xl border border-amber-100/80 bg-white/90 backdrop-blur-md p-4 text-left shadow-2xs hover:border-amber-300/80 transition-all flex flex-col justify-between min-h-[145px]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#167C5A]">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <p className="mt-3 text-[15px] font-bold text-[#14213D]">Our Vision</p>
                <p className="mt-0.5 text-[11.5px] text-slate-500 font-medium leading-snug">
                  Clear strategic roadmap for inclusive community welfare & social impact.
                </p>
              </div>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/founder-message")}
              className="rounded-2xl border border-amber-100/80 bg-white/90 backdrop-blur-md p-4 text-left shadow-2xs hover:border-amber-300/80 transition-all flex flex-col justify-between min-h-[145px]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#D97706]">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="mt-3 text-[15px] font-bold text-[#14213D]">Founder’s Message</p>
                <p className="mt-0.5 text-[11.5px] text-slate-500 font-medium leading-snug">
                  Direct message & guidance from Rohit Pandit, Founder of RP Foundation.
                </p>
              </div>
            </motion.button>
          </div>
        </section>

        {/* 6. QUICK ACCESS CARDS (PLACED AFTER VISION & LEADERSHIP) */}
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
              }
            ].map(({ title, subtitle, icon: Icon, route, accent }) => (
              <motion.button
                key={title}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(route)}
                className="min-h-[155px] rounded-2xl border border-amber-100/80 bg-white/90 backdrop-blur-md p-4 text-left shadow-2xs hover:border-amber-300/80 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="mt-3 text-[15px] font-bold text-[#14213D]">{title}</p>
                  <p className="mt-1 text-[11.5px] text-slate-500 font-medium leading-snug">{subtitle}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* 7. SOCIAL IMPACT HIGHLIGHTS */}
        <section className="pt-2">
          <div className="mb-3">
            <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#167C5A]">Our Impact</p>
            <h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold text-[#14213D]">Social Impact Highlights</h2>
          </div>
          <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-amber-100/80 bg-white/80 backdrop-blur-md shadow-2xs">
            {[
              { icon: UsersRound, value: "Community", label: "People first" },
              { icon: Stethoscope, value: "Care", label: "Health initiatives" },
              { icon: CalendarDays, value: "Active", label: "Foundation work" }
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="border-r border-slate-200/60 px-2 py-4 text-center last:border-r-0">
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
