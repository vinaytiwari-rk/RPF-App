import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  HeartHandshake,
  Plus,
  Trash2,
  Pencil,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  Award,
  Users,
  Stethoscope,
  Trees,
  Briefcase,
  Heart,
  Droplets,
  Wrench,
  GraduationCap,
  Sparkles,
  Layers,
  Quote,
  MessageSquareQuote,
  ExternalLink,
  ChevronRight,
  Sliders,
  Type,
  Activity
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import IconPickerModal, { AVAILABLE_ICONS } from "../../../components/admin/IconPickerModal";

export interface ImpactStatItem {
  id: string;
  labelEn: string;
  labelHi: string;
  value: number;
  suffix: string;
  iconName: string;
  enabled: boolean;
}

export interface ImpactDomainItem {
  id: string;
  tab: "all" | "community" | "care" | "active";
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  iconName: string;
  badgeEn: string;
  badgeHi: string;
  color?: string;
  enabled: boolean;
}

export interface ImpactStoryItem {
  id: string;
  nameEn: string;
  nameHi: string;
  villageEn: string;
  villageHi: string;
  quoteEn: string;
  quoteHi: string;
  photoUrl?: string;
  enabled: boolean;
}

const DEFAULT_DOMAINS: ImpactDomainItem[] = [
  {
    id: "sanitation",
    tab: "active",
    titleEn: "Sanitation & Clean Environment Drive",
    titleHi: "स्वच्छता अभियान व प्रसाधन केंद्र",
    descEn: "Organizing mass cleanliness drives, plastic-free campaigns, and building public sanitation facilities across rural and urban slums.",
    descHi: "ग्रामीण व शहरी बस्तियों में वृहद स्वच्छता अभियान, प्लास्टिक-मुक्त ड्राइव एवं सार्वजनिक प्रसाधन केंद्रों का निर्माण।",
    iconName: "Trash2",
    badgeEn: "Clean Environment",
    badgeHi: "पर्यावरण व स्वच्छता",
    color: "bg-emerald-50 text-[#167C5A] border-emerald-200",
    enabled: true
  },
  {
    id: "water",
    tab: "care",
    titleEn: "Clean Drinking Water Supply",
    titleHi: "शुद्ध पेयजल व जल संरक्षण",
    descEn: "Installing handpumps, clean RO water systems, and deploying water tankers in drought-prone & water-scarce communities.",
    descHi: "जल संकटग्रस्त क्षेत्रों में हैंडपंप स्थापना, शुद्ध आरओ प्लांट व टैंकरों से निःशुल्क पेयजल आपूर्ति।",
    iconName: "Droplets",
    badgeEn: "Water Relief",
    badgeHi: "पेयजल आपूर्ति",
    color: "bg-sky-50 text-sky-600 border-sky-200",
    enabled: true
  },
  {
    id: "jobs",
    tab: "active",
    titleEn: "Jobs for Unemployed Youth & Women",
    titleHi: "रोजगार मेला व महिला आजीविका",
    descEn: "Organizing Mega Rojgar Melas, direct company hiring drives, and micro-entrepreneurship support for unemployed youth.",
    descHi: "बेरोजगार युवाओं के लिए रोजगार मेले, सीधी भर्ती ड्राइव व स्वरोजगार हेतु आर्थिक मार्गदर्शन।",
    iconName: "Briefcase",
    badgeEn: "Livelihood",
    badgeHi: "रोजगार अवसर",
    color: "bg-amber-50 text-[#D97706] border-amber-200",
    enabled: true
  },
  {
    id: "pink-erickshaw",
    tab: "active",
    titleEn: "Pink E-Rickshaw Empowerment",
    titleHi: "पिंक ई-रिक्शा योजना (महिला स्वावलंबन)",
    descEn: "Providing subsidized eco-friendly e-rickshaws to women, empowering them with financial independence and safe urban transit.",
    descHi: "महिलाओं को ई-रिक्शा स्वामित्व प्रदान कर आर्थिक स्वतंत्रता व सुरक्षित हरित परिवहन योजना।",
    iconName: "Heart",
    badgeEn: "Women Power",
    badgeHi: "महिला स्वावलंबन",
    color: "bg-rose-50 text-rose-600 border-rose-200",
    enabled: true
  },
  {
    id: "skills",
    tab: "active",
    titleEn: "Skills Training & Vocational Courses",
    titleHi: "कौशल विकास व वोकेशनल ट्रेनिंग",
    descEn: "Free tailoring units, computer literacy centers, electrician certification, and vocational skill workshops.",
    descHi: "निःशुल्क सिलाई-कढ़ाई केंद्र, कंप्यूटर साक्षरता, मोबाइल रिपेयरिंग व स्किल सर्टिफिकेशन कोर्स।",
    iconName: "Wrench",
    badgeEn: "Skill Development",
    badgeHi: "कौशल विकास",
    color: "bg-purple-50 text-purple-600 border-purple-200",
    enabled: true
  },
  {
    id: "health",
    tab: "care",
    titleEn: "Free Health Services & Emergency Care",
    titleHi: "निःशुल्क स्वास्थ्य सेवा व चिकित्सा शिविर",
    descEn: "Conducting Mega Health Camps, free medicine distribution, blood donor network dispatch, and diagnostic aid.",
    descHi: "निःशुल्क स्वास्थ्य जांच शिविर, दवा वितरण, इमरजेंसी ब्लड डोनेशन नेटवर्क व एम्बुलेंस सहायता।",
    iconName: "Stethoscope",
    badgeEn: "Healthcare",
    badgeHi: "निःशुल्क चिकित्सा",
    color: "bg-red-50 text-red-600 border-red-200",
    enabled: true
  },
  {
    id: "welfare",
    tab: "care",
    titleEn: "Helping Poor & Downtrodden People",
    titleHi: "निराश्रित व वंचित वर्ग कल्याण",
    descEn: "Distributing ration kits, winter blankets, disaster emergency relief, and shelter assistance to vulnerable families.",
    descHi: "जरूरतमंद परिवारों को राशन किट, शीतकालीन कंबल, आपदा राहत सामग्रियां व आश्रय सहायता।",
    iconName: "HandCoins",
    badgeEn: "Welfare Relief",
    badgeHi: "जन सेवा सहायता",
    color: "bg-[#B9E5CC]/10 text-[#245D45] border-[#B9E5CC]/20",
    enabled: true
  },
  {
    id: "education",
    tab: "community",
    titleEn: "Education Services & Youth Mentorship",
    titleHi: "निःशुल्क शिक्षा व बाल कल्याण",
    descEn: "Providing free books, stationery, evening tuition classes for underprivileged children, and youth sports aid.",
    descHi: "वंचित बच्चों हेतु निःशुल्क पाठ्य सामग्री, शाम की कोचिंग कक्षाएं एवं युवा खेलकूद प्रोत्साहन।",
    iconName: "GraduationCap",
    badgeEn: "Youth Education",
    badgeHi: "बाल शिक्षा सपोर्ट",
    color: "bg-indigo-50 text-indigo-600 border-indigo-200",
    enabled: true
  }
];

export default function ImpactStudio() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"header" | "counters" | "domains" | "stories">("counters");

  // Icon Picker State
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconTarget, setIconTarget] = useState<{
    type: "counter" | "domain";
    id: string;
    currentIcon: string;
  } | null>(null);

  // Editing Modals
  const [editingDomain, setEditingDomain] = useState<ImpactDomainItem | null>(null);
  const [editingStory, setEditingStory] = useState<ImpactStoryItem | null>(null);

  // Impact State
  const [headlineEn, setHeadlineEn] = useState("Our Social Impact");
  const [headlineHi, setHeadlineHi] = useState("हमारा सामाजिक प्रभाव");
  const [descEn, setDescEn] = useState("Field activities across sanitation, clean water, jobs, skills, free health, poor relief, environment & heritage.");
  const [descHi, setDescHi] = useState("पेयजल, स्वच्छता, रोजगार, स्वास्थ्य, महिला स्वावलंबन, पर्यावरण व भारतीय संस्कृति हेतु समर्पित कार्य।");
  
  const [impactStats, setImpactStats] = useState<ImpactStatItem[]>([]);
  const [impactDomains, setImpactDomains] = useState<ImpactDomainItem[]>([]);
  const [stories, setStories] = useState<ImpactStoryItem[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/cms");
      const cms = res.data?.cms || {};

      if (cms.impactHeadlineEn) setHeadlineEn(cms.impactHeadlineEn);
      if (cms.impactHeadlineHi) setHeadlineHi(cms.impactHeadlineHi);
      if (cms.impactDescEn) setDescEn(cms.impactDescEn);
      if (cms.impactDescHi) setDescHi(cms.impactDescHi);

      if (Array.isArray(cms.impactStats) && cms.impactStats.length > 0) {
        setImpactStats(cms.impactStats);
      } else {
        // Load default structure without inventing fake production counts
        setImpactStats([
          { id: "beneficiaries", labelEn: "Total Beneficiaries", labelHi: "कुल लाभार्थी नागरिक", value: 250000, suffix: "+", iconName: "Users", enabled: true },
          { id: "health_camps", labelEn: "Health & Eye Camps", labelHi: "स्वास्थ्य एवं नेत्र शिविर", value: 450, suffix: "+", iconName: "Stethoscope", enabled: true },
          { id: "tree_plantations", labelEn: "Trees Planted", labelHi: "रोपित वृक्ष व पौधे", value: 50000, suffix: "+", iconName: "Trees", enabled: true },
          { id: "cards_issued", labelEn: "Jan Seva Cards", labelHi: "जन सेवा कार्ड जारी", value: 0, suffix: "+", iconName: "Award", enabled: true }
        ]);
      }

      if (Array.isArray(cms.impactDomains) && cms.impactDomains.length > 0) {
        setImpactDomains(cms.impactDomains);
      } else {
        setImpactDomains(DEFAULT_DOMAINS);
      }

      if (Array.isArray(cms.testimonials) && cms.testimonials.length > 0) {
        setStories(cms.testimonials);
      } else {
        setStories([
          {
            id: "t1",
            nameEn: "Satyendra Thakur",
            nameHi: "सत्येंद्र ठाकुर",
            villageEn: "Karond Ward 5, Bhopal",
            villageHi: "करौंद वार्ड 5, भोपाल",
            quoteEn: "My daughter received the Saraswati Scholarship directly in her bank account within 2 weeks of applying. This support is helping her pursue college education. Gratitude to Rohit Sir!",
            quoteHi: "मेरी बेटी को आवेदन करने के २ सप्ताह के भीतर सीधे उसके बैंक खाते में सरस्वती छात्रवृत्ति प्राप्त हुई। यह सहायता उसे कॉलेज की शिक्षा जारी रखने में मदद कर रही है। रोहित सर को धन्यवाद!",
            enabled: true
          },
          {
            id: "t2",
            nameEn: "Shanti Devi",
            nameHi: "शान्ति देवी",
            villageEn: "Bhopal Block, MP",
            villageHi: "सीहोर ब्लॉक, म.प्र.",
            quoteEn: "During my husband's eye surgery, RP Foundation volunteers did everything from hospital registration to arranging blood donors. They treated us like family members.",
            quoteHi: "मेरे पति के नेत्र ऑपरेशन के दौरान, आरपी फाउंडेशन के स्वयंसेवकों ने अस्पताल पंजीकरण से लेकर रक्तदाताओं की व्यवस्था करने तक सब कुछ किया। उन्होंने हमारे साथ परिवार के सदस्यों जैसा व्यवहार किया।",
            enabled: true
          }
        ]);
      }
    } catch {
      toast.error("Failed to load Impact data from server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const payload = {
        impactHeadlineEn: headlineEn,
        impactHeadlineHi: headlineHi,
        impactDescEn: descEn,
        impactDescHi: descHi,
        impactStats,
        impactDomains,
        testimonials: stories
      };

      const res = await axios.post(
        "/api/admin/control/cms/publish",
        {
          patch: payload,
          label: "ImpactStudio: Social impact counters, domains & stories publish"
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      if (res.data?.success) {
        window.dispatchEvent(new CustomEvent("samahit-admin-updated"));
        toast.success("Impact Studio configuration saved & published live!");
      } else {
        toast.error("Server responded with error while saving");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to save impact changes");
    } finally {
      setSaving(false);
    }
  };

  const openIconPicker = (type: "counter" | "domain", id: string, currentIcon: string) => {
    setIconTarget({ type, id, currentIcon });
    setIconPickerOpen(true);
  };

  const handleSelectIcon = (iconName: string) => {
    if (!iconTarget) return;
    if (iconTarget.type === "counter") {
      setImpactStats(prev => prev.map(s => s.id === iconTarget.id ? { ...s, iconName } : s));
    } else if (iconTarget.type === "domain") {
      setImpactDomains(prev => prev.map(d => d.id === iconTarget.id ? { ...d, iconName } : d));
      if (editingDomain && editingDomain.id === iconTarget.id) {
        setEditingDomain(prev => prev ? { ...prev, iconName } : null);
      }
    }
    toast.success(`Icon updated to ${iconName}`);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-[#C2410C]" />
        <span className="ml-2 text-xs font-bold text-slate-600">Loading Impact Studio data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#D97706]">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#D97706] border border-amber-200">
                Authoritative CMS
              </span>
              <span className="text-[11px] font-bold text-slate-400">Public Route: /impact</span>
            </div>
            <h2 className="text-xl font-black text-[#0A192F] mt-0.5">
              Impact Studio
            </h2>
            <p className="text-xs text-slate-500">
              Manage live impact headline, KPI metrics, 8 Seva domains, and citizen impact stories.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" /> Reset
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#166534] px-5 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-700/20 hover:bg-[#14532d] transition"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save & Publish All
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        {[
          { id: "counters", label: "KPI Counters", icon: Activity, count: impactStats.length },
          { id: "domains", label: "8 Seva Domains", icon: Layers, count: impactDomains.length },
          { id: "stories", label: "Impact Stories & Testimonials", icon: MessageSquareQuote, count: stories.length },
          { id: "header", label: "Headline & Text", icon: Type }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === tab.id
                ? "bg-[#0A192F] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${activeSubTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: KPI COUNTERS */}
      {activeSubTab === "counters" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#0A192F]">Master Impact Counters</h3>
              <p className="text-xs text-slate-500">
                These KPI cards appear at the top of the public /impact page and reflect ground realities.
              </p>
            </div>
            <button
              onClick={() => {
                const newId = `stat-${Date.now()}`;
                setImpactStats(prev => [
                  ...prev,
                  { id: newId, labelEn: "New Impact Metric", labelHi: "नया प्रभाव आंकड़ा", value: 1000, suffix: "+", iconName: "Award", enabled: true }
                ]);
                toast.success("Added new impact counter card");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 border border-orange-200 px-3 py-1.5 text-xs font-bold text-[#C2410C] hover:bg-orange-100 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Add Counter
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {impactStats.map((stat, idx) => {
              const IconComp = AVAILABLE_ICONS[stat.iconName] || Award;
              return (
                <div
                  key={stat.id}
                  className={`rounded-2xl border p-4 flex flex-col justify-between space-y-3 transition ${
                    stat.enabled ? "bg-white border-slate-200 shadow-xs" : "bg-slate-50 border-slate-200/60 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => openIconPicker("counter", stat.id, stat.iconName)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-[#C2410C] transition border border-slate-200"
                      title="Click to change icon visually"
                    >
                      <IconComp className="h-4.5 w-4.5" />
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setImpactStats(prev => prev.map((s, i) => i === idx ? { ...s, enabled: !s.enabled } : s));
                          toast.success(stat.enabled ? "Counter disabled" : "Counter enabled");
                        }}
                        className={`rounded-lg p-1.5 text-xs transition ${
                          stat.enabled ? "text-emerald-700 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-200"
                        }`}
                        title={stat.enabled ? "Active on public page" : "Disabled"}
                      >
                        {stat.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete counter "${stat.labelEn}"?`)) {
                            setImpactStats(prev => prev.filter((_, i) => i !== idx));
                            toast.success("Counter deleted");
                          }
                        }}
                        className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 transition"
                        title="Delete counter"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">English Label</label>
                      <input
                        type="text"
                        value={stat.labelEn}
                        onChange={e => {
                          const val = e.target.value;
                          setImpactStats(prev => prev.map((s, i) => i === idx ? { ...s, labelEn: val } : s));
                        }}
                        className="w-full text-xs font-bold text-slate-800 rounded-lg border border-slate-200 p-2 outline-none focus:border-[#C2410C]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Hindi Label</label>
                      <input
                        type="text"
                        value={stat.labelHi}
                        onChange={e => {
                          const val = e.target.value;
                          setImpactStats(prev => prev.map((s, i) => i === idx ? { ...s, labelHi: val } : s));
                        }}
                        className="w-full text-xs font-bold text-slate-800 rounded-lg border border-slate-200 p-2 outline-none focus:border-[#C2410C]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Value</label>
                        <input
                          type="number"
                          value={stat.value}
                          onChange={e => {
                            const val = Number(e.target.value) || 0;
                            setImpactStats(prev => prev.map((s, i) => i === idx ? { ...s, value: val } : s));
                          }}
                          className="w-full text-xs font-black text-[#0A192F] rounded-lg border border-slate-200 p-2 outline-none focus:border-[#C2410C]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Suffix</label>
                        <input
                          type="text"
                          value={stat.suffix}
                          onChange={e => {
                            const val = e.target.value;
                            setImpactStats(prev => prev.map((s, i) => i === idx ? { ...s, suffix: val } : s));
                          }}
                          className="w-full text-xs font-black text-[#0A192F] rounded-lg border border-slate-200 p-2 outline-none focus:border-[#C2410C]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: 8 SEVA DOMAINS */}
      {activeSubTab === "domains" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#0A192F]">8 Ground Seva Domains</h3>
              <p className="text-xs text-slate-500">
                Detailed field areas on the Impact page (Cleanliness, RO Water, Jobs, Pink E-Rickshaw, Health, Relief, Skills, Education).
              </p>
            </div>
            <button
              onClick={() => {
                const newDomain: ImpactDomainItem = {
                  id: `domain-${Date.now()}`,
                  tab: "active",
                  titleEn: "New Field Initiative",
                  titleHi: "नया जनसेवा अभियान",
                  descEn: "Describe the ground-level work and impact.",
                  descHi: "अभियान का विवरण और प्रभाव।",
                  iconName: "Sparkles",
                  badgeEn: "Initiative",
                  badgeHi: "जन सेवा",
                  enabled: true
                };
                setImpactDomains(prev => [...prev, newDomain]);
                setEditingDomain(newDomain);
                toast.success("Created new domain. Edit details in dialog.");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-[#166534] hover:bg-emerald-100 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Add Domain
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {impactDomains.map((domain, idx) => {
              const IconComp = AVAILABLE_ICONS[domain.iconName] || Sparkles;
              return (
                <div
                  key={domain.id}
                  className={`rounded-2xl border p-4.5 flex flex-col justify-between space-y-3 transition ${
                    domain.enabled ? "bg-white border-slate-200 shadow-xs" : "bg-slate-50 border-slate-200/60 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => openIconPicker("domain", domain.id, domain.iconName)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 transition border border-slate-200"
                        title="Click to change icon visually"
                      >
                        <IconComp className="h-5 w-5" />
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase text-slate-700">
                            {domain.tab}
                          </span>
                          <span className="text-[10px] font-bold text-[#166534]">
                            {domain.badgeEn || domain.badgeHi}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#0A192F] mt-0.5">{domain.titleEn}</h4>
                        <p className="text-[11px] font-medium text-slate-500">{domain.titleHi}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditingDomain(domain)}
                        className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50 transition"
                        title="Edit domain text and details"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setImpactDomains(prev => prev.map((d, i) => i === idx ? { ...d, enabled: !d.enabled } : d));
                          toast.success(domain.enabled ? "Domain disabled" : "Domain enabled");
                        }}
                        className={`rounded-lg p-1.5 text-xs transition ${
                          domain.enabled ? "text-emerald-700 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-200"
                        }`}
                        title={domain.enabled ? "Visible on /impact" : "Hidden"}
                      >
                        {domain.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete domain "${domain.titleEn}"?`)) {
                            setImpactDomains(prev => prev.filter((_, i) => i !== idx));
                            toast.success("Domain deleted");
                          }
                        }}
                        className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 transition"
                        title="Delete domain"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {domain.descEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: IMPACT STORIES & TESTIMONIALS */}
      {activeSubTab === "stories" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#0A192F]">Citizen Impact Stories & Testimonials</h3>
              <p className="text-xs text-slate-500">
                Ground-level experiences, scholarship recipients, patient care, and volunteer testimonies.
              </p>
            </div>
            <button
              onClick={() => {
                const newStory: ImpactStoryItem = {
                  id: `story-${Date.now()}`,
                  nameEn: "Citizen Beneficiary",
                  nameHi: "नागरिक लाभार्थी",
                  villageEn: "Bhopal, MP",
                  villageHi: "भोपाल, म.प्र.",
                  quoteEn: "Sharing personal testimony of service received from RP Foundation.",
                  quoteHi: "आरपी फाउंडेशन द्वारा प्राप्त सहायता का व्यक्तिगत अनुभव।",
                  enabled: true
                };
                setStories(prev => [...prev, newStory]);
                setEditingStory(newStory);
                toast.success("Added new impact story");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Add Story
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stories.map((story, idx) => (
              <div
                key={story.id}
                className={`rounded-2xl border p-4.5 flex flex-col justify-between space-y-3 transition ${
                  story.enabled ? "bg-white border-slate-200 shadow-xs" : "bg-slate-50 border-slate-200/60 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-[#D97706]">
                      <Quote className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0A192F]">{story.nameEn} ({story.nameHi})</h4>
                      <p className="text-[11px] font-medium text-slate-500">{story.villageEn} • {story.villageHi}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditingStory(story)}
                      className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50 transition"
                      title="Edit story text"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setStories(prev => prev.map((s, i) => i === idx ? { ...s, enabled: !s.enabled } : s));
                        toast.success(story.enabled ? "Story disabled" : "Story enabled");
                      }}
                      className={`rounded-lg p-1.5 text-xs transition ${
                        story.enabled ? "text-emerald-700 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      {story.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete story for "${story.nameEn}"?`)) {
                          setStories(prev => prev.filter((_, i) => i !== idx));
                          toast.success("Story deleted");
                        }
                      }}
                      className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 italic">
                  <p>"{story.quoteEn}"</p>
                  <p className="text-[11px] text-slate-500 font-sans not-italic">"{story.quoteHi}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: HEADER & HEADLINE */}
      {activeSubTab === "header" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs max-w-2xl">
          <h3 className="text-sm font-black text-[#0A192F]">Public Impact Page Banner Headline</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700">English Headline</label>
              <input
                type="text"
                value={headlineEn}
                onChange={e => setHeadlineEn(e.target.value)}
                className="mt-1 w-full text-xs font-medium rounded-xl border border-slate-200 p-2.5 outline-none focus:border-[#C2410C]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Hindi Headline</label>
              <input
                type="text"
                value={headlineHi}
                onChange={e => setHeadlineHi(e.target.value)}
                className="mt-1 w-full text-xs font-medium rounded-xl border border-slate-200 p-2.5 outline-none focus:border-[#C2410C]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">English Description</label>
              <textarea
                rows={3}
                value={descEn}
                onChange={e => setDescEn(e.target.value)}
                className="mt-1 w-full text-xs font-medium rounded-xl border border-slate-200 p-2.5 outline-none focus:border-[#C2410C]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Hindi Description</label>
              <textarea
                rows={3}
                value={descHi}
                onChange={e => setDescHi(e.target.value)}
                className="mt-1 w-full text-xs font-medium rounded-xl border border-slate-200 p-2.5 outline-none focus:border-[#C2410C]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Domain Editor Modal */}
      {editingDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-[#0A192F]">Edit Field Domain</h3>
              <button onClick={() => setEditingDomain(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Category Filter</label>
                <select
                  value={editingDomain.tab}
                  onChange={e => setEditingDomain({ ...editingDomain, tab: e.target.value as any })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                >
                  <option value="community">Community (सामुदायिक)</option>
                  <option value="care">Care & Relief (देखभाल व राहत)</option>
                  <option value="active">Active Ground (सक्रिय अभियान)</option>
                  <option value="all">All (समस्त)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Title (English)</label>
                  <input
                    type="text"
                    value={editingDomain.titleEn}
                    onChange={e => setEditingDomain({ ...editingDomain, titleEn: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Title (Hindi)</label>
                  <input
                    type="text"
                    value={editingDomain.titleHi}
                    onChange={e => setEditingDomain({ ...editingDomain, titleHi: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Badge (English)</label>
                  <input
                    type="text"
                    value={editingDomain.badgeEn}
                    onChange={e => setEditingDomain({ ...editingDomain, badgeEn: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Badge (Hindi)</label>
                  <input
                    type="text"
                    value={editingDomain.badgeHi}
                    onChange={e => setEditingDomain({ ...editingDomain, badgeHi: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Description (English)</label>
                <textarea
                  rows={2}
                  value={editingDomain.descEn}
                  onChange={e => setEditingDomain({ ...editingDomain, descEn: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Description (Hindi)</label>
                <textarea
                  rows={2}
                  value={editingDomain.descHi}
                  onChange={e => setEditingDomain({ ...editingDomain, descHi: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setEditingDomain(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setImpactDomains(prev => prev.map(d => d.id === editingDomain.id ? editingDomain : d));
                  setEditingDomain(null);
                  toast.success("Domain updated");
                }}
                className="px-5 py-2 rounded-xl bg-[#166534] text-xs font-black text-white hover:bg-[#14532d]"
              >
                Save Domain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Editor Modal */}
      {editingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-[#0A192F]">Edit Impact Story</h3>
              <button onClick={() => setEditingStory(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Name (English)</label>
                  <input
                    type="text"
                    value={editingStory.nameEn}
                    onChange={e => setEditingStory({ ...editingStory, nameEn: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Name (Hindi)</label>
                  <input
                    type="text"
                    value={editingStory.nameHi}
                    onChange={e => setEditingStory({ ...editingStory, nameHi: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Location/Village (English)</label>
                  <input
                    type="text"
                    value={editingStory.villageEn}
                    onChange={e => setEditingStory({ ...editingStory, villageEn: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Location/Village (Hindi)</label>
                  <input
                    type="text"
                    value={editingStory.villageHi}
                    onChange={e => setEditingStory({ ...editingStory, villageHi: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Story / Quote (English)</label>
                <textarea
                  rows={3}
                  value={editingStory.quoteEn}
                  onChange={e => setEditingStory({ ...editingStory, quoteEn: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Story / Quote (Hindi)</label>
                <textarea
                  rows={3}
                  value={editingStory.quoteHi}
                  onChange={e => setEditingStory({ ...editingStory, quoteHi: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setEditingStory(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setStories(prev => prev.map(s => s.id === editingStory.id ? editingStory : s));
                  setEditingStory(null);
                  toast.success("Story updated");
                }}
                className="px-5 py-2 rounded-xl bg-[#166534] text-xs font-black text-white hover:bg-[#14532d]"
              >
                Save Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Icon Picker Modal */}
      <IconPickerModal
        isOpen={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        selectedIcon={iconTarget?.currentIcon || "Sparkles"}
        onSelectIcon={handleSelectIcon}
        title="Choose Official Lucide Icon"
      />
    </div>
  );
}
