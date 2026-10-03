import React, { useEffect, useState, useMemo } from "react";
import ServiceIllustration, { serviceArtFor } from "../components/ServiceIllustration";
import {
  Instagram,
  Heart,
  Briefcase,
  Stethoscope,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Clock,
  Droplets,
  Trash2,
  GraduationCap,
  Trees,
  Landmark,
  HandHeart,
  Wrench,
  Users,
  Search,
  Send,
  Activity,
  Award,
  TrendingUp,
  MessageSquareQuote
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { AnimatedMetricCard, AnimatedNumber } from "../components/AnimatedMetricCard";

type MainTab = "impact" | "volunteers" | "chat";
type SubFilterTab = "all" | "community" | "care" | "active";

const ICON_MAP: Record<string, any> = {
  Trash2,
  Droplets,
  Briefcase,
  Heart,
  Wrench,
  Stethoscope,
  Trees,
  Landmark,
  GraduationCap,
  Users,
  Award,
  ShieldCheck,
  Sparkles,
  HandHeart,
  Activity,
  TrendingUp
};

function renderDomainIcon(iconNameOrComp: any) {
  if (!iconNameOrComp) return <Sparkles className="w-5 h-5 text-[#C2410C]" />;
  if (typeof iconNameOrComp === "string") {
    const Comp = ICON_MAP[iconNameOrComp] || Sparkles;
    return <Comp className="w-5 h-5 text-[#C2410C]" />;
  }
  const Comp = iconNameOrComp;
  return <Comp className="w-5 h-5 text-[#C2410C]" />;
}

interface ChatMessage {
  id: string;
  authorName: string;
  text: string;
  time?: string;
}

interface Volunteer {
  id: string;
  name: string;
  role?: string;
  city?: string;
  skills?: string[] | string;
}

export default function ImpactPage() {
  const navigate = useNavigate();
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user } = useAuth();
  const { cmsConfig } = useApp();
  const isHi = lang === "hi";

  const [activeMainTab, setActiveMainTab] = useState<MainTab>("impact");
  const [subTab, setSubTab] = useState<SubFilterTab>("all");
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [cardImpact, setCardImpact] = useState<{ totalCards: number; scope: string } | null>(null);
  useEffect(() => {
    let active = true;
    axios.get('/api/public/cards/impact', { timeout: 8000 }).then(({ data }) => {
      if (active && data?.success && Number.isFinite(data.totalCards)) {
        setCardImpact({ totalCards: data.totalCards, scope: data.scope });
      }
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const [volunteerCityFilter, setVolunteerCityFilter] = useState("");

  // Chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "c1", authorName: "Rohit Pandit", text: "Welcome to Samahit Activity & Impact Portal! Together we serve.", time: "10:30 AM" },
    { id: "c2", authorName: "Sunita Verma", text: "Bhopal Pink E-Rickshaw drive was a great success today!", time: "11:15 AM" }
  ]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async (city?: string) => {
    try {
      const res = await axios.get("/api/public/volunteers", { params: city ? { city } : {} });
      if (res.data.success && Array.isArray(res.data.data)) {
        setVolunteers(res.data.data);
      }
    } catch {
      setVolunteers([
        { id: "v1", name: "Ramesh Sharma", role: "Healthcare Coordinator", city: "Bhopal", skills: "First Aid, Logistics" },
        { id: "v2", name: "Pooja Verma", role: "Women Empowerment Lead", city: "Bhopal", skills: "Counseling, Training" },
        { id: "v3", name: "Amit Kumar", role: "Emergency Relief Volunteer", city: "Indore", skills: "Disaster Relief, Transport" }
      ]);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      authorName: user?.name || (isHi ? "नागरिक स्वयंसेवक" : "Citizen Volunteer"),
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");
  };

  const IMPACT_DOMAINS = [
    {
      id: "sanitation",
      tab: "active" as const,
      titleEn: "Sanitation & Clean Environment Drive",
      titleHi: "स्वच्छता अभियान व प्रसाधन केंद्र",
      descEn: "Organizing mass cleanliness drives, plastic-free campaigns, and building public sanitation facilities across rural and urban slums.",
      descHi: "ग्रामीण व शहरी बस्तियों में वृहद स्वच्छता अभियान, प्लास्टिक-मुक्त ड्राइव एवं सार्वजनिक प्रसाधन केंद्रों का निर्माण।",
      icon: Trash2,
      badgeEn: "Clean Environment",
      badgeHi: "पर्यावरण व स्वच्छता",
      color: "bg-emerald-50 text-[#167C5A] border-emerald-200"
    },
    {
      id: "water",
      tab: "care" as const,
      titleEn: "Clean Drinking Water Supply",
      titleHi: "शुद्ध पेयजल व जल संरक्षण",
      descEn: "Installing handpumps, clean RO water systems, and deploying water tankers in drought-prone & water-scarce communities.",
      descHi: "जल संकटग्रस्त क्षेत्रों में हैंडपंप स्थापना, शुद्ध आरओ प्लांट व टैंकरों से निःशुल्क पेयजल आपूर्ति।",
      icon: Droplets,
      badgeEn: "Water Relief",
      badgeHi: "पेयजल आपूर्ति",
      color: "bg-sky-50 text-sky-600 border-sky-200"
    },
    {
      id: "jobs",
      tab: "active" as const,
      titleEn: "Jobs for Unemployed Youth & Women",
      titleHi: "रोजगार मेला व महिला आजीविका",
      descEn: "Organizing Mega Rojgar Melas, direct company hiring drives, and micro-entrepreneurship support for unemployed youth.",
      descHi: "बेरोजगार युवाओं के लिए रोजगार मेले, सीधी भर्ती ड्राइव व स्वरोजगार हेतु आर्थिक मार्गदर्शन।",
      icon: Briefcase,
      badgeEn: "Livelihood",
      badgeHi: "रोजगार अवसर",
      color: "bg-amber-50 text-[#D97706] border-amber-200"
    },
    {
      id: "pink-erickshaw",
      tab: "active" as const,
      titleEn: "Pink E-Rickshaw Empowerment",
      titleHi: "पिंक ई-रिक्शा योजना (महिला स्वावलंबन)",
      descEn: "Providing subsidized eco-friendly e-rickshaws to women, empowering them with financial independence and safe urban transit.",
      descHi: "महिलाओं को ई-रिक्शा स्वामित्व प्रदान कर आर्थिक स्वतंत्रता व सुरक्षित हरित परिवहन योजना।",
      icon: Heart,
      badgeEn: "Women Power",
      badgeHi: "महिला स्वावलंबन",
      color: "bg-rose-50 text-rose-600 border-rose-200"
    },
    {
      id: "skills",
      tab: "active" as const,
      titleEn: "Skills Training & Vocational Courses",
      titleHi: "कौशल विकास व वोकेशनल ट्रेनिंग",
      descEn: "Free tailoring units, computer literacy centers, electrician certification, and vocational skill workshops.",
      descHi: "निःशुल्क सिलाई-कढ़ाई केंद्र, कंप्यूटर साक्षरता, मोबाइल रिपेयरिंग व स्किल सर्टिफिकेशन कोर्स।",
      icon: Wrench,
      badgeEn: "Skill Development",
      badgeHi: "कौशल विकास",
      color: "bg-purple-50 text-purple-600 border-purple-200"
    },
    {
      id: "health",
      tab: "care" as const,
      titleEn: "Free Health Services & Emergency Care",
      titleHi: "निःशुल्क स्वास्थ्य सेवा व चिकित्सा शिविर",
      descEn: "Conducting Mega Health Camps, free medicine distribution, blood donor network dispatch, and diagnostic aid.",
      descHi: "निःशुल्क स्वास्थ्य जांच शिविर, दवा वितरण, इमरजेंसी ब्लड डोनेशन नेटवर्क व एम्बुलेंस सहायता।",
      icon: Stethoscope,
      badgeEn: "Healthcare",
      badgeHi: "निःशुल्क चिकित्सा",
      color: "bg-red-50 text-red-600 border-red-200"
    },
    {
      id: "welfare",
      tab: "care" as const,
      titleEn: "Helping Poor & Downtrodden People",
      titleHi: "निराश्रित व वंचित वर्ग कल्याण",
      descEn: "Distributing ration kits, winter blankets, disaster emergency relief, and shelter assistance to vulnerable families.",
      descHi: "जरूरतमंद परिवारों को राशन किट, शीतकालीन कंबल, आपदा राहत सामग्रियां व आश्रय सहायता।",
      icon: HandHeart,
      badgeEn: "Welfare Relief",
      badgeHi: "जन सेवा सहायता",
      color: "bg-[#B9E5CC]/10 text-[#245D45] border-[#B9E5CC]/20"
    },
    {
      id: "environment",
      tab: "active" as const,
      titleEn: "Keep Environment Clean & Plantation",
      titleHi: "पर्यावरण संरक्षण व वृक्षारोपण अभियान",
      descEn: "Organizing mass tree plantation drives, riverbank cleanups, and bio-waste management awareness.",
      descHi: "वृहद वृक्षारोपण अभियान, नदी तट स्वच्छता व पर्यावरण संरक्षण जन जागरूकता कार्यक्रम।",
      icon: Trees,
      badgeEn: "Green Earth",
      badgeHi: "पर्यावरण संरक्षण",
      color: "bg-emerald-50 text-[#167C5A] border-emerald-200"
    },
    {
      id: "culture",
      tab: "community" as const,
      titleEn: "Community Welfare & Indian Tradition",
      titleHi: "सामुदायिक कल्याण व भारतीय संस्कृति",
      descEn: "Promoting Indian heritage, traditional values, festival celebrations, and building inclusive community welfare spaces.",
      descHi: "भारतीय परंपराओं, नैतिक मूल्यों, सांस्कृतिक उत्सवों व सामुदायिक सद्भाव का प्रचार एवं संरक्षण।",
      icon: Landmark,
      badgeEn: "Heritage & Values",
      badgeHi: "संस्कृति व परंपरा",
      color: "bg-amber-50 text-[#C2410C] border-amber-200"
    },
    {
      id: "education",
      tab: "community" as const,
      titleEn: "Education Services & Youth Mentorship",
      titleHi: "निःशुल्क शिक्षा व बाल कल्याण",
      descEn: "Providing free books, stationery, evening tuition classes for underprivileged children, and youth sports aid.",
      descHi: "वंचित बच्चों हेतु निःशुल्क पाठ्य सामग्री, शाम की कोचिंग कक्षाएं एवं युवा खेलकूद प्रोत्साहन।",
      icon: GraduationCap,
      badgeEn: "Youth Education",
      badgeHi: "बाल शिक्षा सपोर्ट",
      color: "bg-indigo-50 text-indigo-600 border-indigo-200"
    }
  ];

  const liveStats = useMemo(() => {
    if (Array.isArray(cmsConfig?.impactStats) && cmsConfig.impactStats.length > 0) {
      return cmsConfig.impactStats.filter((s: any) => s.enabled !== false);
    }
    return [
      { id: "beneficiaries", labelEn: "Total Beneficiaries", labelHi: "कुल लाभार्थी नागरिक", value: 250000, suffix: "+", iconName: "Users" },
      { id: "health_camps", labelEn: "Health & Eye Camps", labelHi: "स्वास्थ्य एवं नेत्र शिविर", value: 450, suffix: "+", iconName: "Stethoscope" },
      { id: "tree_plantations", labelEn: "Trees Planted", labelHi: "रोपित वृक्ष व पौधे", value: 50000, suffix: "+", iconName: "Trees" },
      { id: "cards_issued", labelEn: "Jan Seva Cards", labelHi: "जन सेवा कार्ड जारी", value: cardImpact?.totalCards || 120000, suffix: "+", iconName: "Award" }
    ];
  }, [cmsConfig?.impactStats, cardImpact]);

  const liveDomains = useMemo(() => {
    if (Array.isArray(cmsConfig?.impactDomains) && cmsConfig.impactDomains.length > 0) {
      const enabledOnly = cmsConfig.impactDomains.filter((d: any) => d.enabled !== false);
      if (enabledOnly.length > 0) return enabledOnly;
    }
    return IMPACT_DOMAINS;
  }, [cmsConfig?.impactDomains]);

  const filteredDomains = liveDomains.filter((d: any) => subTab === "all" || d.tab === subTab);

  const liveStories = useMemo(() => {
    if (Array.isArray(cmsConfig?.testimonials) && cmsConfig.testimonials.length > 0) {
      return cmsConfig.testimonials.filter((t: any) => t.enabled !== false);
    }
    return [];
  }, [cmsConfig?.testimonials]);

  return (
    <div className="min-h-screen bg-transparent pb-36 font-sans selection:bg-orange-100 animate-fadeIn text-slate-800">
      {/* Header Banner (Vibrant Saffron-Emerald Brand Tricolor) */}
      <div className="bg-gradient-to-br from-[#B9E5CC] via-[#FFF7E8] to-[#FFD49A] p-6 text-[#245D45] relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-md border border-[#B9E5CC] text-[#245D45]">
            <Activity className="w-3.5 h-3.5 text-[#D97706]" />
            {isHi ? "सामाजिक प्रभाव" : "Impact"}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-[#245D45]">
            {isHi ? "हमारा सामाजिक प्रभाव" : "Our Social Impact"}
          </h1>
          <p className="text-xs text-[#426B55] font-medium leading-relaxed max-w-xl">
            {isHi 
              ? "पेयजल, स्वच्छता, रोजगार, स्वास्थ्य, महिला स्वावलंबन, पर्यावरण व भारतीय संस्कृति हेतु समर्पित कार्य।"
              : "Field activities across sanitation, clean water, jobs, skills, free health, poor relief, environment & heritage."}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* Tab 1: Field Impact & Relief */}
        {activeMainTab === "impact" && (
          <div className="space-y-5">
            {/* LIVE IMPACT STATS COUNTERS (SYNCED DIRECTLY FROM CMS ADMIN) */}
            <section className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-black uppercase tracking-wider text-[#166534]">
                  {isHi ? "सामुदायिक प्रभाव आंकड़े" : "Key Impact Highlights"}
                </h2>
                <span className="text-[10px] font-bold text-slate-400">
                  {isHi ? "प्रमाणित आंकड़े" : "Verified Metrics"}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {liveStats.map((st: any, idx: number) => {
                  const tones: ("saffron" | "green" | "gold" | "navy")[] = ["saffron", "green", "gold", "navy"];
                  const tone = tones[idx % tones.length];
                  return (
                    <AnimatedMetricCard
                      key={st.id || idx}
                      label={isHi ? (st.labelHi || st.labelEn) : st.labelEn}
                      value={Number(st.value) || 0}
                      suffix={st.suffix || "+"}
                      tone={tone}
                      delay={idx * 0.08}
                    />
                  );
                })}
              </div>
            </section>

            {/* Category Filter Pills: All, Community, Care, Active */}
            <section className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-black uppercase tracking-wider text-[#245D45]">
                  {isHi ? "कार्यक्षेत्र श्रेणियां" : "Impact Categories"}
                </h2>
                <span className="text-[11px] font-bold text-slate-400">
                  {filteredDomains.length} {isHi ? "पहल" : "Initiatives"}
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {[
                  { id: "all" as const, labelEn: "All Work", labelHi: "समस्त कार्य", icon: Sparkles },
                  { id: "community" as const, labelEn: "Community", labelHi: "सामुदायिक कल्याण", icon: Users },
                  { id: "care" as const, labelEn: "Care & Relief", labelHi: "स्वास्थ्य व सहायता", icon: Heart },
                  { id: "active" as const, labelEn: "Active Ground", labelHi: "ऑन-फील्ड प्रोजेक्ट्स", icon: ShieldCheck },
                ].map(({ id, labelEn, labelHi, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setSubTab(id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer border ${
                      subTab === id
                        ? "bg-[#D97706] border-[#D97706] text-white shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{isHi ? labelHi : labelEn}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Detailed Impact Domain Cards */}
            <section className="space-y-3">
              {filteredDomains.map((domain: any) => {
                return (
                  <div 
                    key={domain.id} 
                    className="bg-white rounded-[22px] border border-slate-200/80 p-4 shadow-2xs space-y-2 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-[66px] w-[66px] shrink-0" aria-hidden="true">
                          {serviceArtFor(domain.id) ? (
                            <ServiceIllustration kind={serviceArtFor(domain.id)!} className="h-full w-full" />
                          ) : (
                            <div className={`h-full w-full rounded-2xl flex items-center justify-center border ${domain.color || "bg-orange-50 text-[#C2410C] border-orange-200"}`}>
                              {renderDomainIcon(domain.iconName || domain.icon)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold leading-snug text-[#166534] break-words">
                            {isHi ? (domain.titleHi || domain.titleEn) : domain.titleEn}
                          </h3>
                          <span className="text-[9.5px] font-extrabold text-[#C2410C] uppercase tracking-wider">
                            {isHi ? (domain.badgeHi || domain.badgeEn) : domain.badgeEn}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed text-slate-600 font-medium pl-1">
                      {isHi ? (domain.descHi || domain.descEn) : domain.descEn}
                    </p>
                  </div>
                );
              })}
            </section>

            {/* Citizen Testimonials & Ground Stories */}
            {liveStories.length > 0 && (
              <section className="space-y-3 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <MessageSquareQuote className="w-4 h-4 text-[#C2410C]" />
                  <h3 className="text-xs font-black text-[#0A192F] uppercase tracking-wider">
                    {isHi ? "नागरिक अनुभव एवं जन समीक्षा" : "Ground Voices & Stories"}
                  </h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {liveStories.map((story: any) => (
                    <div key={story.id} className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-2">
                      <p className="text-xs text-slate-700 italic leading-relaxed">
                        “{isHi ? (story.quoteHi || story.quoteEn) : story.quoteEn}”
                      </p>
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#0A192F]">
                          {isHi ? (story.nameHi || story.nameEn) : story.nameEn}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {isHi ? (story.villageHi || story.villageEn) : story.villageEn}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

      </div>
    </div>
  );
}


