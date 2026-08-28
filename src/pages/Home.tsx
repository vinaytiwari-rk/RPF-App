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
  "River Gandak at Dumariaghat in Gopalganj district continues to flow in severe flood situation: NDMA Alert",
  "From Gandhi’s reconstruction to India@2047: HM Shah outlines vision for youth",
  "IMD forecast for Thunderstorms with Lightning and heavy rainfall over North-East districts: SACHET Alert",
  "केन्द्रीय गृह एवं सहकारिता मंत्री श्री अमित शाह ने गुजरात विद्यापीठ के दीक्षांत समारोह को संबोधित किया",
  "Nepal flash floods: 63 Indian nationals rescued from Trishuli-1 power project site by disaster response teams",
  "12 Years of PMJDY: 59.09 Crore Accounts Opened, Deposits Reach ₹3.17 Lakh Crore"
];

const defaultMarquee2 = [
  "PM Modi urges India to expand Olympic reach, begin 2036 Games preparations now",
  "US senators seek West Bank killings report from Department of State",
  "Bihar TRE-4 exam to be held in single phase: CM Samrat Choudhary announces",
  "Devastating floods leave more than 1,300 missing along Nepal-China border",
  "US Army bets $2.2 billion on microreactors for futuristic power systems",
  "Tamil Nadu: Families in Coimbatore await contact with relatives missing after Nepal floods during Kailash Yatra",
  "Pune: IT employees to hold protest in Hinjewadi over civic infrastructure issues"
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
  variant = "saffron"
}: {
  items: string[];
  direction?: "rtl" | "ltr";
  variant?: "saffron" | "green";
}) {
  const cleanItems = useMemo(() => {
    return (items || [])
      .map(cleanHeadline)
      .filter((t) => t.length > 12 && !/^(temporarily unavailable|no news available|rss feed|विज्ञप्ति सदस्यता)/i.test(t));
  }, [items]);

  if (cleanItems.length === 0) return null;

  // Duplicate entire track for seamless looping
  const trackItems = [...cleanItems, ...cleanItems];
  const totalChars = cleanItems.join(" | ").length;
  const duration = Math.max(35, Math.round(totalChars * 0.14));
  const animationName = direction === "ltr" ? "rpf-marquee-ltr" : "rpf-marquee-rtl";

  const isGreen = variant === "green";
  const containerClasses = isGreen
    ? "border-emerald-300/80 bg-emerald-50/70 text-[#15803D]"
    : "border-amber-300/80 bg-amber-50/70 text-[#C2410C]";
  const textClasses = isGreen ? "text-[#15803D]" : "text-[#C2410C]";
  const separatorClasses = isGreen ? "text-[#167C5A]" : "text-[#D97706]";

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
    const restore = (key: string, setter: (value: string[]) => void) => {
      try { const cached = JSON.parse(localStorage.getItem(key) || "[]"); if (Array.isArray(cached) && cached.length) setter(cached); } catch {}
    };
    restore("@rpf_marquee1_cache", setMarquee1);
    restore("@rpf_marquee2_cache", setMarquee2);

    const load = async () => {
      for (const url of ["/api/public/live-feed", "/api/public/news", "/rss-proxy.php", "https://samahit.rpfoundation.org/rss-proxy.php"]) {
        try {
          const response = await timedFetch(url);
          if (!response.ok) continue;
          const json = await response.json();
          const data = json?.data ?? json;
          const first = parseFeedItems(data?.marquee1 ?? data?.pib ?? data?.publicUpdates ?? []);
          const second = parseFeedItems(data?.marquee2 ?? data?.news ?? []);
          if (!alive) return;
          if (first.length) { setMarquee1(first); try { localStorage.setItem("@rpf_marquee1_cache", JSON.stringify(first)); } catch {} }
          if (second.length) { setMarquee2(second); try { localStorage.setItem("@rpf_marquee2_cache", JSON.stringify(second)); } catch {} }
          if (first.length || second.length) break;
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
        
        <section className="bg-transparent py-1 space-y-1">
          <p className="text-sm sm:text-base font-semibold text-[#14213D] tracking-tight">
            {greeting}, {name} Ji,
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14213D] tracking-tight leading-snug">
            Welcome to Samahit
          </h1>
          <p className="text-xs sm:text-[13px] italic font-medium text-slate-500 tracking-normal pt-0.5">
            An initiative by the RP Foundation's Volunteers.
          </p>
        </section>

        {/* TOP MARQUEE: PIB + DD India + SACHET/NDMA -> Dark Saffron, Right-to-Left */}
        {marquee1.length > 0 && <MarqueeTrack items={marquee1} direction="rtl" variant="saffron" />}

        {/* BOTTOM MARQUEE: ANI + IANS + UNI -> Dark Green, Left-to-Right */}
        {marquee2.length > 0 && <MarqueeTrack items={marquee2} direction="ltr" variant="green" />}

        <section className="rounded-2xl border border-amber-200/60 bg-amber-50/40 backdrop-blur-xs px-4 py-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[#D97706]">
            <Quote className="h-3.5 w-3.5" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Thought of the Day</p>
          </div>
          <p className="mt-1.5 text-[13px] sm:text-[14px] font-semibold leading-relaxed text-[#14213D]">
            “Work is worship, and service is the greatest religion.”
          </p>
        </section>

        <section className="pt-2">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#D97706]">Discover</p>
              <h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold text-[#14213D]">RP Foundation at Work</h2>
            </div>
            <span className="text-[12px] font-semibold text-slate-500">{slide + 1}/{slides.length}</span>
          </div>
          <motion.article key={`${current?.image || "slide"}-${slide}`} initial={{ opacity: 0.2 }} animate={{ opacity: 1 }} className="relative h-[320px] sm:h-[350px] overflow-hidden rounded-[24px] bg-[#14213D] shadow-md">
            <img src={getSlideImage(current?.image, slide)} alt={current?.titleEn || "RP Foundation initiative"} className="absolute inset-0 h-full w-full object-cover" onError={(e) => { const img = e.currentTarget; const fb = fallbackSlides[slide % fallbackSlides.length].image; if (img.src !== fb) img.src = fb; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/95 via-[#0F172A]/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
              <h3 className="text-[20px] sm:text-[22px] font-bold leading-tight text-white">{current?.titleEn}</h3>
              <p className="mt-1 text-[12px] sm:text-[13px] leading-relaxed text-slate-200 font-medium">{current?.subEn}</p>
              <button onClick={() => navigate((current as any)?.route || "/impact")} className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-bold text-amber-300 hover:text-amber-200 transition-colors">Explore <ChevronRight className="h-4 w-4" /></button>
            </div>
          </motion.article>
          <div className="mt-3 flex justify-center gap-2">
            {slides.map((_: any, i: number) => (
              <button key={i} onClick={() => setSlide(i)} className={`h-2 rounded-full transition-all ${slide === i ? "w-7 bg-[#D97706]" : "w-2 bg-slate-300"}`} />
            ))}
          </div>
        </section>

        <section className="pt-2">
          <div className="mb-3">
            <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#D97706]">Quick Access</p>
            <h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold text-[#14213D]">What can we help with?</h2>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            {actions.map(({ title, subtitle, icon: Icon, route, accent }) => (
              <motion.button key={title} whileTap={{ scale: 0.98 }} onClick={() => navigate(route)} className="min-h-[150px] rounded-2xl border border-amber-100/80 bg-white/80 backdrop-blur-md p-4 text-left shadow-2xs hover:border-amber-300/80 hover:shadow-xs transition-all flex flex-col justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="mt-3 text-[15px] font-bold text-[#14213D]">{title}</p>
                  <p className="mt-0.5 text-[11.5px] text-slate-500 font-medium leading-snug">{subtitle}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        <section className="pt-2">
          <div className="mb-3">
            <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#167C5A]">Foundation</p>
            <h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold text-[#14213D]">Our Vision & Leadership</h2>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <button onClick={() => navigate("/vision-goals")} className="rounded-2xl border border-amber-100/80 bg-white/80 backdrop-blur-md p-4 text-left shadow-2xs hover:border-amber-300/80 transition-all flex flex-col justify-between min-h-[140px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-500/10 border border-slate-500/20 text-[#14213D]">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <p className="mt-3 text-[15px] font-bold text-[#14213D]">Our Vision</p>
                <p className="mt-0.5 text-[11.5px] text-slate-500 font-medium leading-snug">A clear direction for meaningful social impact.</p>
              </div>
            </button>
            <button onClick={() => navigate("/founder-message")} className="rounded-2xl border border-amber-100/80 bg-white/80 backdrop-blur-md p-4 text-left shadow-2xs hover:border-amber-300/80 transition-all flex flex-col justify-between min-h-[140px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#D97706]">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="mt-3 text-[15px] font-bold text-[#14213D]">Founder’s Message</p>
                <p className="mt-0.5 text-[11.5px] text-slate-500 font-medium leading-snug">A message from Rohit Pandit, Founder of RP Foundation.</p>
              </div>
            </button>
          </div>
        </section>

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
      `}</style>
    </main>
  );
}
