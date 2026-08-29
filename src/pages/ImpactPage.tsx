import React, { useState } from "react";
import {
  Play,
  Instagram,
  Heart,
  Briefcase,
  Stethoscope,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Clock,
  Droplets,
  Trash2,
  GraduationCap,
  Trees,
  Landmark,
  HandHeart,
  Wrench,
  Users
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import InstagramApiFeed from "../components/InstagramApiFeed";

type FilterTab = "all" | "community" | "care" | "active";

export default function ImpactPage() {
  const navigate = useNavigate();
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const isHi = lang === "hi";
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

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
      color: "bg-[#14213D]/10 text-[#14213D] border-[#14213D]/20"
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

  const filteredDomains = IMPACT_DOMAINS.filter(d => activeTab === "all" || d.tab === activeTab);

  return (
    <div className="min-h-screen bg-transparent pb-28 font-sans selection:bg-orange-100 animate-fadeIn text-slate-800">
      {/* Header Banner (Vibrant Saffron-Emerald Brand Tricolor) */}
      <div className="bg-gradient-to-br from-[#14213D] via-[#D97706] to-[#167C5A] p-6 text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-md border border-white/30 text-white">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            {isHi ? "सामुदायिक प्रभाव व जन सेवा" : "Community • Care • Active"}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white">
            {isHi ? "आरपी फाउंडेशन ऑन-फील्ड सामाजिक कार्य" : "Field Impact & Community Welfare"}
          </h1>
          <p className="text-xs text-amber-100 font-medium leading-relaxed max-w-xl">
            {isHi 
              ? "स्वास्थ्य, पेयजल, स्वच्छता, रोजगार, महिला स्वावलंबन, पर्यावरण एवं भारतीय संस्कृति हेतु समर्पित ग्राउंड-लेवल अभियान।"
              : "Comprehensive ground relief across sanitation, clean water, jobs, women empowerment, health, environment & Indian heritage."}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* Category Filter Tabs: All, Community, Care, Active */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#14213D]">
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
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer border ${
                  activeTab === id
                    ? "bg-[#14213D] border-[#14213D] text-white shadow-xs"
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
          {filteredDomains.map((domain) => {
            const Icon = domain.icon;
            return (
              <div 
                key={domain.id} 
                className="bg-white rounded-[22px] border border-slate-200/80 p-4 shadow-2xs space-y-2 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${domain.color} shadow-2xs shrink-0`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#14213D] line-clamp-1">
                        {isHi ? domain.titleHi : domain.titleEn}
                      </h3>
                      <span className="text-[9.5px] font-extrabold text-[#D97706] uppercase tracking-wider">
                        {isHi ? domain.badgeHi : domain.badgeEn}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-600 font-medium pl-1">
                  {isHi ? domain.descHi : domain.descEn}
                </p>
              </div>
            );
          })}
        </section>

        {/* Live Volunteer Seva Duty & Activity Portal Banner */}
        <section className="bg-white rounded-3xl border border-amber-200/80 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-amber-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#D97706]" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#14213D]">
                  {isHi ? "लाइव वालंटियर सेवा एक्टिविटी" : "Live Volunteer Duty & Field Reports"}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  {isHi ? "स्वयंसेवकों की रीयल-टाइम सेवा ड्यूटी एवं रिपोर्टिंग" : "Real-time volunteer clock-in timers & verified reports"}
                </p>
              </div>
            </div>
            <span className="bg-emerald-50 text-[#167C5A] border border-emerald-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
              100% Live
            </span>
          </div>

          <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black text-slate-900">
                {isHi ? "सेवा ड्यूटी पंच-इन करें या रिपोर्ट भेजें" : "Punch-in Duty Hours & Send Field Reports"}
              </p>
              <p className="text-[10px] text-slate-600 font-medium mt-0.5">
                {isHi ? "लाइव टाइमर, जियो-टैग्ड फोटो एवं वालंटियर रैंकिंग।" : "Live timer, GPS-tagged photos & volunteer standings."}
              </p>
            </div>
            <button
              onClick={() => navigate("/duty-tracker")}
              className="bg-[#D97706] text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xs hover:bg-[#C2410C] transition shrink-0 flex items-center gap-1"
            >
              <span>{isHi ? "ड्यूटी पोर्टल" : "Duty Portal"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Featured Reel Card */}
        <section className="bg-gradient-to-br from-[#167C5A] via-emerald-700 to-teal-800 border border-emerald-600 rounded-3xl p-5 text-white shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-[.18em] text-emerald-100 bg-white/20 px-2.5 py-1 rounded-full border border-white/20">
              In-App Reels Player
            </span>
            <Instagram className="w-4 h-4 text-emerald-100" />
          </div>

          <div>
            <h3 className="text-base font-black leading-snug font-serif text-white">
              {isHi ? "पिंक ई-रिक्शा एवं ग्राउंड वर्क रील्स" : "Pink E-Rickshaw & Social Work Reels"}
            </h3>
            <p className="text-xs text-emerald-100 mt-1 line-clamp-2 font-medium">
              {isHi ? "ऐप के अंदर ही रील्स स्वाइप करें और ग्राउंड-लेवल कार्यों के वीडियो देखें।" : "Swipe through field reels, health camps and video updates right inside the app."}
            </p>
          </div>

          <button
            onClick={() => navigate("/instagram")}
            className="w-full bg-white text-[#167C5A] text-xs font-black py-3 rounded-2xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 hover:bg-emerald-50"
          >
            <Play className="w-4 h-4 fill-[#167C5A]" />
            <span>{isHi ? "एप में रील्स प्लेयर खोलें 📱" : "Open In-App Reels Player 📱"}</span>
          </button>
        </section>

        {/* Live Instagram Feed Grid */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-xs">
                <Instagram className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">{isHi ? "लाइव रील्स एवं पोस्ट्स" : "Live Instagram Feed"}</h3>
                <p className="text-[10px] text-slate-400 font-bold">@rpfoundationofficial</p>
              </div>
            </div>
            <a
              href="https://www.instagram.com/rpfoundationofficial/"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-black text-[#D97706] hover:underline flex items-center gap-1"
            >
              Follow <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <InstagramApiFeed />
        </section>

      </div>
    </div>
  );
}

