import React, { useState, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import {
  TrendingUp,
  Search,
  Plus,
  Edit3,
  Trash2,
  Save,
  RefreshCw,
  Sparkles,
  Heart,
  Droplets,
  Briefcase,
  Wrench,
  Stethoscope,
  Trees,
  Landmark,
  GraduationCap,
  X,
  Check,
  Award,
  Image as ImageIcon,
  MessageSquareQuote
} from "lucide-react";
import { toast } from "react-hot-toast";

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
  enabled?: boolean;
}

export interface ImpactStatItem {
  id: string;
  labelEn: string;
  labelHi: string;
  value: number;
  suffix?: string;
  iconName: string;
  enabled?: boolean;
}

export interface TestimonialItem {
  id: string;
  nameEn: string;
  nameHi: string;
  villageEn: string;
  villageHi: string;
  quoteEn: string;
  quoteHi: string;
  enabled?: boolean;
}

export interface MilestoneItem {
  id: string;
  year: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  enabled?: boolean;
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
    iconName: "Heart",
    badgeEn: "Welfare Relief",
    badgeHi: "जन सेवा सहायता",
    color: "bg-emerald-50 text-[#166534] border-emerald-200",
    enabled: true
  },
  {
    id: "environment",
    tab: "active",
    titleEn: "Keep Environment Clean & Plantation",
    titleHi: "पर्यावरण संरक्षण व वृक्षारोपण अभियान",
    descEn: "Organizing mass tree plantation drives, riverbank cleanups, and bio-waste management awareness.",
    descHi: "वृहद वृक्षारोपण अभियान, नदी तट स्वच्छता व पर्यावरण संरक्षण जन जागरूकता कार्यक्रम।",
    iconName: "Trees",
    badgeEn: "Green Earth",
    badgeHi: "पर्यावरण संरक्षण",
    color: "bg-emerald-50 text-[#167C5A] border-emerald-200",
    enabled: true
  },
  {
    id: "culture",
    tab: "community",
    titleEn: "Community Welfare & Indian Tradition",
    titleHi: "सामुदायिक कल्याण व भारतीय संस्कृति",
    descEn: "Promoting Indian heritage, traditional values, festival celebrations, and building inclusive community welfare spaces.",
    descHi: "भारतीय परंपराओं, नैतिक मूल्यों, सांस्कृतिक उत्सवों व सामुदायिक सद्भाव का प्रचार एवं संरक्षण।",
    iconName: "Landmark",
    badgeEn: "Heritage & Values",
    badgeHi: "संस्कृति व परंपरा",
    color: "bg-amber-50 text-[#C2410C] border-amber-200",
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

const DEFAULT_STATS: ImpactStatItem[] = [
  { id: "beneficiaries", labelEn: "Total Beneficiaries", labelHi: "कुल लाभार्थी नागरिक", value: 250000, suffix: "+", iconName: "Users", enabled: true },
  { id: "health_camps", labelEn: "Health & Eye Camps", labelHi: "स्वास्थ्य एवं नेत्र शिविर", value: 450, suffix: "+", iconName: "Stethoscope", enabled: true },
  { id: "tree_plantations", labelEn: "Trees Planted", labelHi: "रोपित वृक्ष व पौधे", value: 50000, suffix: "+", iconName: "Trees", enabled: true },
  { id: "cards_issued", labelEn: "Jan Seva Cards", labelHi: "जन सेवा कार्ड जारी", value: 120000, suffix: "+", iconName: "Award", enabled: true }
];

interface AdminImpactStudioProps {
  cmsConfig: any;
  onSaveCms: (cms: any) => Promise<void>;
  isLoading?: boolean;
}

export default function AdminImpactStudio({ cmsConfig, onSaveCms, isLoading = false }: AdminImpactStudioProps) {
  const [subTab, setSubTab] = useState<"domains" | "counters" | "stories" | "milestones">("domains");
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 1. Domains State
  const [domains, setDomains] = useState<ImpactDomainItem[]>(() => {
    return Array.isArray(cmsConfig?.impactDomains) && cmsConfig.impactDomains.length > 0
      ? cmsConfig.impactDomains
      : DEFAULT_DOMAINS;
  });

  // 2. Counters State
  const [stats, setStats] = useState<ImpactStatItem[]>(() => {
    return Array.isArray(cmsConfig?.impactStats) && cmsConfig.impactStats.length > 0
      ? cmsConfig.impactStats
      : DEFAULT_STATS;
  });

  // 3. Testimonials / Field Stories State
  const [stories, setStories] = useState<TestimonialItem[]>(() => {
    return Array.isArray(cmsConfig?.testimonials) && cmsConfig.testimonials.length > 0
      ? cmsConfig.testimonials
      : [
          {
            id: "t1",
            nameEn: "Satyendra Thakur",
            nameHi: "सत्येंद्र ठाकुर",
            villageEn: "Karond Ward 5, Bhopal",
            villageHi: "करौंद वार्ड 5, भोपाल",
            quoteEn: "My daughter received the Saraswati Scholarship directly in her bank account within 2 weeks of applying. Gratitude to Rohit Sir!",
            quoteHi: "मेरी बेटी को आवेदन करने के २ सप्ताह के भीतर सीधे उसके बैंक खाते में छात्रवृत्ति प्राप्त हुई। रोहित सर को धन्यवाद!",
            enabled: true
          },
          {
            id: "t2",
            nameEn: "Shanti Devi",
            nameHi: "शान्ति देवी",
            villageEn: "Bhopal Block, MP",
            villageHi: "सीहोर ब्लॉक, म.प्र.",
            quoteEn: "During my husband's eye surgery, RP Foundation volunteers did everything from registration to arranging blood donors.",
            quoteHi: "मेरे पति के नेत्र ऑपरेशन के दौरान, आरपी फाउंडेशन के स्वयंसेवकों ने अस्पताल पंजीकरण से लेकर रक्तदाताओं की व्यवस्था करने तक सब कुछ किया।",
            enabled: true
          }
        ];
  });

  // 4. Milestones State
  const [milestones, setMilestones] = useState<MilestoneItem[]>(() => {
    return Array.isArray(cmsConfig?.milestones) && cmsConfig.milestones.length > 0
      ? cmsConfig.milestones
      : [
          { id: "m1", year: "2022", titleEn: "Foundation Established", titleHi: "फाउंडेशन की स्थापना", descEn: "Rohit Pandit established RP Foundation for rural welfare.", descHi: "रोहित पंडित द्वारा ग्रामीण कल्याण हेतु स्थापना।", enabled: true },
          { id: "m2", year: "2024", titleEn: "Jan Seva Card Launch", titleHi: "जन सेवा कार्ड का शुभारंभ", descEn: "Launched statewide digital welfare identity system.", descHi: "राज्यव्यापी डिजिटल जन सेवा कार्ड प्रणाली की शुरुआत।", enabled: true },
          { id: "m3", year: "2026", titleEn: "250,000+ Beneficiaries", titleHi: "२.५ लाख से अधिक लाभार्थी", descEn: "Crossed milestone of providing welfare to 250,000+ families.", descHi: "२,५०,००० से अधिक परिवारों तक सहायता पहुंचाने का लक्ष्य पूर्ण।", enabled: true }
        ];
  });

  // Modals
  const [domainModal, setDomainModal] = useState<{ isOpen: boolean; mode: "add" | "edit"; data: Partial<ImpactDomainItem> }>({
    isOpen: false,
    mode: "add",
    data: {}
  });

  const [statModal, setStatModal] = useState<{ isOpen: boolean; mode: "add" | "edit"; data: Partial<ImpactStatItem> }>({
    isOpen: false,
    mode: "add",
    data: {}
  });

  const [storyModal, setStoryModal] = useState<{ isOpen: boolean; mode: "add" | "edit"; data: Partial<TestimonialItem> }>({
    isOpen: false,
    mode: "add",
    data: {}
  });

  const [milestoneModal, setMilestoneModal] = useState<{ isOpen: boolean; mode: "add" | "edit"; data: Partial<MilestoneItem> }>({
    isOpen: false,
    mode: "add",
    data: {}
  });

  // Domain Handlers
  const handleToggleDomain = (id: string) => {
    setDomains((prev) => prev.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d)));
  };

  const handleDeleteDomain = (id: string) => {
    if (confirm("Delete this impact initiative?")) {
      setDomains((prev) => prev.filter((d) => d.id !== id));
      toast.success("Initiative removed");
    }
  };

  const handleSaveDomainModal = () => {
    const titleVal = domainModal.data.titleEn?.trim() || domainModal.data.titleHi?.trim() || "";
    if (!titleVal || !domainModal.data.id?.trim()) {
      toast.error("ID and Title are required");
      return;
    }
    const cleanId = domainModal.data.id.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-");
    const descVal = domainModal.data.descEn?.trim() || domainModal.data.descHi?.trim() || "";
    const badgeVal = domainModal.data.badgeEn?.trim() || domainModal.data.badgeHi?.trim() || "Impact";
    const item: ImpactDomainItem = {
      id: cleanId,
      tab: domainModal.data.tab || "active",
      titleEn: titleVal,
      titleHi: titleVal,
      descEn: descVal,
      descHi: descVal,
      iconName: domainModal.data.iconName || "Sparkles",
      badgeEn: badgeVal,
      badgeHi: badgeVal,
      color: domainModal.data.color || "bg-emerald-50 text-[#167C5A] border-emerald-200",
      enabled: domainModal.data.enabled !== false
    };

    if (domainModal.mode === "add") {
      setDomains((prev) => [...prev, item]);
      toast.success("Initiative added");
    } else {
      setDomains((prev) => prev.map((d) => (d.id === cleanId ? item : d)));
      toast.success("Initiative updated");
    }
    setDomainModal({ isOpen: false, mode: "add", data: {} });
  };

  // Stat Handlers
  const handleToggleStat = (id: string) => {
    setStats((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const handleDeleteStat = (id: string) => {
    if (confirm("Delete this counter metric?")) {
      setStats((prev) => prev.filter((s) => s.id !== id));
      toast.success("Metric removed");
    }
  };

  const handleSaveStatModal = () => {
    const labelVal = statModal.data.labelEn?.trim() || statModal.data.labelHi?.trim() || "";
    if (!labelVal) {
      toast.error("Label is required");
      return;
    }
    const cleanId = statModal.data.id || `stat-${Date.now()}`;
    const item: ImpactStatItem = {
      id: cleanId,
      labelEn: labelVal,
      labelHi: labelVal,
      value: Number(statModal.data.value) || 0,
      suffix: statModal.data.suffix || "+",
      iconName: statModal.data.iconName || "TrendingUp",
      enabled: statModal.data.enabled !== false
    };

    if (statModal.mode === "add") {
      setStats((prev) => [...prev, item]);
      toast.success("Metric added");
    } else {
      setStats((prev) => prev.map((s) => (s.id === cleanId ? item : s)));
      toast.success("Metric updated");
    }
    setStatModal({ isOpen: false, mode: "add", data: {} });
  };

  // Story Handlers
  const handleToggleStory = (id: string) => {
    setStories((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const handleDeleteStory = (id: string) => {
    if (confirm("Delete this citizen story?")) {
      setStories((prev) => prev.filter((s) => s.id !== id));
      toast.success("Story removed");
    }
  };

  const handleSaveStoryModal = () => {
    const nameVal = storyModal.data.nameEn?.trim() || storyModal.data.nameHi?.trim() || "";
    const quoteVal = storyModal.data.quoteEn?.trim() || storyModal.data.quoteHi?.trim() || "";
    if (!nameVal || !quoteVal) {
      toast.error("Citizen Name and Story are required");
      return;
    }
    const cleanId = storyModal.data.id || `story-${Date.now()}`;
    const villageVal = storyModal.data.villageEn?.trim() || storyModal.data.villageHi?.trim() || "Madhya Pradesh";
    const item: TestimonialItem = {
      id: cleanId,
      nameEn: nameVal,
      nameHi: nameVal,
      villageEn: villageVal,
      villageHi: villageVal,
      quoteEn: quoteVal,
      quoteHi: quoteVal,
      enabled: storyModal.data.enabled !== false
    };

    if (storyModal.mode === "add") {
      setStories((prev) => [...prev, item]);
      toast.success("Story added");
    } else {
      setStories((prev) => prev.map((s) => (s.id === cleanId ? item : s)));
      toast.success("Story updated");
    }
    setStoryModal({ isOpen: false, mode: "add", data: {} });
  };

  // Milestone Handlers
  const handleToggleMilestone = (id: string) => {
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  };

  const handleDeleteMilestone = (id: string) => {
    if (confirm("Delete this milestone?")) {
      setMilestones((prev) => prev.filter((m) => m.id !== id));
      toast.success("Milestone removed");
    }
  };

  const handleSaveMilestoneModal = () => {
    const titleVal = milestoneModal.data.titleEn?.trim() || milestoneModal.data.titleHi?.trim() || "";
    if (!milestoneModal.data.year?.trim() || !titleVal) {
      toast.error("Year and Title are required");
      return;
    }
    const cleanId = milestoneModal.data.id || `m-${Date.now()}`;
    const descVal = milestoneModal.data.descEn?.trim() || milestoneModal.data.descHi?.trim() || "";
    const item: MilestoneItem = {
      id: cleanId,
      year: milestoneModal.data.year.trim(),
      titleEn: titleVal,
      titleHi: titleVal,
      descEn: descVal,
      descHi: descVal,
      enabled: milestoneModal.data.enabled !== false
    };

    if (milestoneModal.mode === "add") {
      setMilestones((prev) => [...prev, item]);
      toast.success("Milestone added");
    } else {
      setMilestones((prev) => prev.map((m) => (m.id === cleanId ? item : m)));
      toast.success("Milestone updated");
    }
    setMilestoneModal({ isOpen: false, mode: "add", data: {} });
  };

  // Persist all Impact updates to CMS
  const handleSaveAllImpact = async () => {
    setIsSaving(true);
    try {
      const updatedCms = {
        ...cmsConfig,
        impactDomains: domains,
        impactStats: stats,
        testimonials: stories,
        milestones
      };
      await onSaveCms(updatedCms);
      window.dispatchEvent(new Event("samahit-admin-updated"));
      toast.success("Impact Studio published live to application!");
    } catch (err: any) {
      console.error("Save Impact Studio error:", err);
      toast.error(err.message || "Failed to save impact configuration");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-50 border border-orange-200 text-[#C2410C]">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-[#0A192F]">Impact Studio</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-green-100 text-[#166534] border border-green-200">
              Live Showcase
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage public impact initiatives, metrics & counters, citizen success stories, and foundation milestones.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAllImpact}
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Publish Impact Updates</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => {
            setSubTab("domains");
            setSearch("");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === "domains"
              ? "bg-[#0A192F] text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span>Field Initiatives ({domains.length})</span>
        </button>

        <button
          onClick={() => {
            setSubTab("counters");
            setSearch("");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === "counters"
              ? "bg-[#0A192F] text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span>Impact Counters ({stats.length})</span>
        </button>

        <button
          onClick={() => {
            setSubTab("stories");
            setSearch("");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === "stories"
              ? "bg-[#0A192F] text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <MessageSquareQuote className="w-4 h-4 text-amber-500" />
          <span>Citizen Stories ({stories.length})</span>
        </button>

        <button
          onClick={() => {
            setSubTab("milestones");
            setSearch("");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === "milestones"
              ? "bg-[#0A192F] text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Award className="w-4 h-4 text-blue-400" />
          <span>Timeline Milestones ({milestones.length})</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 w-full sm:w-80 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search in ${subTab}...`}
            className="w-full text-xs bg-transparent border-none outline-none text-[#0A192F] placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {subTab === "domains" && (
            <button
              onClick={() =>
                setDomainModal({
                  isOpen: true,
                  mode: "add",
                  data: { tab: "active", iconName: "Sparkles", enabled: true }
                })
              }
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#166534] hover:bg-green-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Initiative</span>
            </button>
          )}

          {subTab === "counters" && (
            <button
              onClick={() =>
                setStatModal({
                  isOpen: true,
                  mode: "add",
                  data: { value: 1000, suffix: "+", iconName: "TrendingUp", enabled: true }
                })
              }
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#166534] hover:bg-green-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Counter</span>
            </button>
          )}

          {subTab === "stories" && (
            <button
              onClick={() =>
                setStoryModal({
                  isOpen: true,
                  mode: "add",
                  data: { enabled: true }
                })
              }
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#166534] hover:bg-green-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Citizen Story</span>
            </button>
          )}

          {subTab === "milestones" && (
            <button
              onClick={() =>
                setMilestoneModal({
                  isOpen: true,
                  mode: "add",
                  data: { year: new Date().getFullYear().toString(), enabled: true }
                })
              }
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#166534] hover:bg-green-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Milestone</span>
            </button>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. FIELD INITIATIVES / DOMAINS TAB                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === "domains" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {domains
            .filter((d) => {
              const q = search.toLowerCase().trim();
              return (
                !q ||
                d.titleEn.toLowerCase().includes(q) ||
                d.titleHi.toLowerCase().includes(q) ||
                d.descEn.toLowerCase().includes(q)
              );
            })
            .map((domain) => {
              const IconComp = (LucideIcons as any)[domain.iconName] || Sparkles;
              return (
                <div
                  key={domain.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    domain.enabled
                      ? "bg-white border-slate-200 shadow-sm"
                      : "bg-slate-50/70 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="p-2.5 rounded-xl border bg-orange-50 border-orange-200 text-[#C2410C]">
                        <IconComp className="w-5 h-5" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-[#0A192F]">{domain.titleEn}</h4>
                        <p className="text-xs font-medium text-[#166534]">{domain.titleHi}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleDomain(domain.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                        domain.enabled
                          ? "bg-green-50 text-[#166534] border-green-200 hover:bg-green-100"
                          : "bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {domain.enabled ? "Active" : "Disabled"}
                    </button>
                  </div>

                  <p className="mt-2.5 text-xs text-slate-600 line-clamp-2">
                    {domain.descEn || domain.descHi}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-[#C2410C] border border-amber-200">
                      {domain.badgeEn}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setDomainModal({ isOpen: true, mode: "edit", data: domain })}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#0A192F] hover:bg-slate-100"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDomain(domain.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. IMPACT COUNTERS TAB                                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === "counters" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats
            .filter((s) => {
              const q = search.toLowerCase().trim();
              return !q || s.labelEn.toLowerCase().includes(q) || s.labelHi.toLowerCase().includes(q);
            })
            .map((stat) => {
              const IconComp = (LucideIcons as any)[stat.iconName] || TrendingUp;
              return (
                <div
                  key={stat.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    stat.enabled
                      ? "bg-white border-slate-200 shadow-sm"
                      : "bg-slate-50/70 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-green-50 border border-green-200 text-[#166534]">
                      <IconComp className="w-4 h-4" />
                    </span>
                    <button
                      onClick={() => handleToggleStat(stat.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        stat.enabled
                          ? "bg-green-50 text-[#166534] border-green-200"
                          : "bg-slate-100 text-slate-500 border-slate-300"
                      }`}
                    >
                      {stat.enabled ? "Active" : "Hidden"}
                    </button>
                  </div>

                  <div className="mt-3">
                    <div className="text-2xl font-black text-[#0A192F]">
                      {stat.value.toLocaleString("en-IN")}
                      <span className="text-[#C2410C]">{stat.suffix || "+"}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-700 mt-1">{stat.labelEn}</div>
                    <div className="text-[11px] font-medium text-[#166534]">{stat.labelHi}</div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setStatModal({ isOpen: true, mode: "edit", data: stat })}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#0A192F] hover:bg-slate-100"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStat(stat.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. CITIZEN STORIES TAB                                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === "stories" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stories
            .filter((s) => {
              const q = search.toLowerCase().trim();
              return (
                !q ||
                s.nameEn.toLowerCase().includes(q) ||
                s.villageEn.toLowerCase().includes(q) ||
                s.quoteEn.toLowerCase().includes(q)
              );
            })
            .map((story) => (
              <div
                key={story.id}
                className={`p-5 rounded-2xl border transition-all ${
                  story.enabled !== false
                    ? "bg-white border-slate-200 shadow-sm"
                    : "bg-slate-50/70 border-slate-200 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-200 text-[#C2410C] font-bold flex items-center justify-center text-sm">
                      {story.nameEn[0] || "C"}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0A192F]">{story.nameEn}</h4>
                      <p className="text-[11px] font-medium text-[#166534]">{story.villageEn}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleStory(story.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                      story.enabled !== false
                        ? "bg-green-50 text-[#166534] border-green-200"
                        : "bg-slate-100 text-slate-500 border-slate-300"
                    }`}
                  >
                    {story.enabled !== false ? "Active" : "Disabled"}
                  </button>
                </div>

                <blockquote className="mt-3 text-xs italic text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  "{story.quoteEn}"
                </blockquote>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => setStoryModal({ isOpen: true, mode: "edit", data: story })}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#0A192F] hover:bg-slate-100"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteStory(story.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. MILESTONES TAB                                             */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === "milestones" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {milestones
              .filter((m) => {
                const q = search.toLowerCase().trim();
                return !q || m.year.includes(q) || m.titleEn.toLowerCase().includes(q);
              })
              .map((milestone) => (
                <div
                  key={milestone.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    milestone.enabled !== false ? "" : "opacity-60 bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="px-3 py-1 bg-orange-100 border border-orange-200 text-[#C2410C] font-black rounded-xl text-sm shrink-0">
                      {milestone.year}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#0A192F]">{milestone.titleEn}</h4>
                      <p className="text-xs text-[#166534] font-medium">{milestone.titleHi}</p>
                      <p className="text-xs text-slate-500 mt-1">{milestone.descEn || milestone.descHi}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleToggleMilestone(milestone.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                        milestone.enabled !== false
                          ? "bg-green-50 text-[#166534] border-green-200"
                          : "bg-slate-100 text-slate-500 border-slate-300"
                      }`}
                    >
                      {milestone.enabled !== false ? "Active" : "Disabled"}
                    </button>
                    <button
                      onClick={() => setMilestoneModal({ isOpen: true, mode: "edit", data: milestone })}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#0A192F] hover:bg-slate-100"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMilestone(milestone.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 1: ADD / EDIT INITIATIVE                                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {domainModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#0A192F]">
                {domainModal.mode === "add" ? "Add Impact Initiative" : "Edit Initiative"}
              </h3>
              <button
                onClick={() => setDomainModal({ isOpen: false, mode: "add", data: {} })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Initiative Slug ID</label>
                <input
                  type="text"
                  disabled={domainModal.mode === "edit"}
                  value={domainModal.data.id || ""}
                  onChange={(e) =>
                    setDomainModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, id: e.target.value }
                    }))
                  }
                  placeholder="e.g. child-nutrition, tree-drive"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Initiative Title / पहल का शीर्षक</label>
                <input
                  type="text"
                  value={domainModal.data.titleEn || domainModal.data.titleHi || ""}
                  onChange={(e) =>
                    setDomainModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, titleEn: e.target.value, titleHi: e.target.value }
                    }))
                  }
                  placeholder="e.g. Free Rural Healthcare / ग्रामीण निःशुल्क चिकित्सा"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Badge / विषय टैग</label>
                  <input
                    type="text"
                    value={domainModal.data.badgeEn || domainModal.data.badgeHi || ""}
                    onChange={(e) =>
                      setDomainModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, badgeEn: e.target.value, badgeHi: e.target.value }
                      }))
                    }
                    placeholder="e.g. Healthcare / चिकित्सा"
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Lucide Icon Name</label>
                  <input
                    type="text"
                    value={domainModal.data.iconName || ""}
                    onChange={(e) =>
                      setDomainModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, iconName: e.target.value }
                      }))
                    }
                    placeholder="Stethoscope, Trees, etc."
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Description / पहल का विवरण</label>
                <textarea
                  rows={2}
                  value={domainModal.data.descEn || domainModal.data.descHi || ""}
                  onChange={(e) =>
                    setDomainModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, descEn: e.target.value, descHi: e.target.value }
                    }))
                  }
                  placeholder="Initiative description / सामाजिक पहल का विवरण..."
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setDomainModal({ isOpen: false, mode: "add", data: {} })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDomainModal}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#166534] text-white hover:bg-green-800 shadow"
              >
                {domainModal.mode === "add" ? "Add Initiative" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 2: ADD / EDIT COUNTER METRIC                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {statModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#0A192F]">
                {statModal.mode === "add" ? "Add Impact Counter" : "Edit Counter"}
              </h3>
              <button
                onClick={() => setStatModal({ isOpen: false, mode: "add", data: {} })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Metric Label / आंकड़े का शीर्षक</label>
                <input
                  type="text"
                  value={statModal.data.labelEn || statModal.data.labelHi || ""}
                  onChange={(e) =>
                    setStatModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, labelEn: e.target.value, labelHi: e.target.value }
                    }))
                  }
                  placeholder="e.g. Beneficiaries Served / कुल लाभान्वित नागरिक"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Value (Number)</label>
                  <input
                    type="number"
                    value={statModal.data.value || 0}
                    onChange={(e) =>
                      setStatModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, value: Number(e.target.value) }
                      }))
                    }
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Suffix</label>
                  <input
                    type="text"
                    value={statModal.data.suffix || "+"}
                    onChange={(e) =>
                      setStatModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, suffix: e.target.value }
                      }))
                    }
                    placeholder="+, %, Cr"
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setStatModal({ isOpen: false, mode: "add", data: {} })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatModal}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#166534] text-white hover:bg-green-800 shadow"
              >
                Save Counter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 3: ADD / EDIT STORY                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {storyModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#0A192F]">
                {storyModal.mode === "add" ? "Add Citizen Story" : "Edit Story"}
              </h3>
              <button
                onClick={() => setStoryModal({ isOpen: false, mode: "add", data: {} })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Citizen Name / नागरिक का नाम</label>
                <input
                  type="text"
                  value={storyModal.data.nameEn || storyModal.data.nameHi || ""}
                  onChange={(e) =>
                    setStoryModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, nameEn: e.target.value, nameHi: e.target.value }
                    }))
                  }
                  placeholder="e.g. Ramesh Patel / रमेश पटेल"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Village / City / स्थान</label>
                <input
                  type="text"
                  value={storyModal.data.villageEn || storyModal.data.villageHi || ""}
                  onChange={(e) =>
                    setStoryModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, villageEn: e.target.value, villageHi: e.target.value }
                    }))
                  }
                  placeholder="e.g. Sehore, Madhya Pradesh / सीहोर, म.प्र."
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Quote / Story / नागरिक की कहानी या अनुभव</label>
                <textarea
                  rows={3}
                  value={storyModal.data.quoteEn || storyModal.data.quoteHi || ""}
                  onChange={(e) =>
                    setStoryModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, quoteEn: e.target.value, quoteHi: e.target.value }
                    }))
                  }
                  placeholder="How RP Foundation helped / फाउंडेशन द्वारा प्राप्त सहायता का विवरण..."
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setStoryModal({ isOpen: false, mode: "add", data: {} })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStoryModal}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#166534] text-white hover:bg-green-800 shadow"
              >
                Save Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 4: ADD / EDIT MILESTONE                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      {milestoneModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#0A192F]">
                {milestoneModal.mode === "add" ? "Add Milestone" : "Edit Milestone"}
              </h3>
              <button
                onClick={() => setMilestoneModal({ isOpen: false, mode: "add", data: {} })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Year / Date</label>
                <input
                  type="text"
                  value={milestoneModal.data.year || ""}
                  onChange={(e) =>
                    setMilestoneModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, year: e.target.value }
                    }))
                  }
                  placeholder="e.g. 2024"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Milestone Title / उपलब्धि का शीर्षक</label>
                <input
                  type="text"
                  value={milestoneModal.data.titleEn || milestoneModal.data.titleHi || ""}
                  onChange={(e) =>
                    setMilestoneModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, titleEn: e.target.value, titleHi: e.target.value }
                    }))
                  }
                  placeholder="e.g. State Relief Mission / राज्य राहत मिशन"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={milestoneModal.data.descEn || ""}
                  onChange={(e) =>
                    setMilestoneModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, descEn: e.target.value }
                    }))
                  }
                  placeholder="Short description..."
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setMilestoneModal({ isOpen: false, mode: "add", data: {} })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMilestoneModal}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#166534] text-white hover:bg-green-800 shadow"
              >
                Save Milestone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
