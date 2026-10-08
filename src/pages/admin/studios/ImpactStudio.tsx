import React, { useState, useEffect, useCallback } from "react";
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
  Award,
  Layers,
  Quote,
  MessageSquareQuote,
  Type,
  Activity,
  Sparkles,
  Upload,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import IconPickerModal, { AVAILABLE_ICONS } from "../../../components/admin/IconPickerModal";

export interface ImpactStatItem {
  id: string;
  label: string;
  value: number;
  suffix: string;
  iconName: string;
  enabled: boolean;
}

export interface ImpactDomainItem {
  id: string;
  tab: "all" | "community" | "care" | "active";
  title: string;
  description: string;
  badge: string;
  iconName: string;
  color?: string;
  enabled: boolean;
  subLinks?: Array<{ id: string; title: string; url: string; active?: boolean }>;
}

export interface ImpactStoryItem {
  id: string;
  name: string;
  village: string;
  quote: string;
  photoUrl?: string;
  enabled: boolean;
}

const DEFAULT_DOMAINS: ImpactDomainItem[] = [
  {
    id: "sanitation",
    tab: "active",
    title: "Sanitation & Clean Environment Drive",
    description: "Organizing mass cleanliness drives, plastic-free campaigns, and building public sanitation facilities across rural and urban slums.",
    iconName: "Trash2",
    badge: "Clean Environment",
    color: "bg-emerald-50 text-[#167C5A] border-emerald-200",
    enabled: true
  },
  {
    id: "water",
    tab: "care",
    title: "Clean Drinking Water Supply",
    description: "Installing handpumps, clean RO water systems, and deploying water tankers in drought-prone & water-scarce communities.",
    iconName: "Droplets",
    badge: "Water Relief",
    color: "bg-sky-50 text-sky-600 border-sky-200",
    enabled: true
  },
  {
    id: "jobs",
    tab: "active",
    title: "Jobs for Unemployed Youth & Women",
    description: "Organizing Mega Rojgar Melas, direct company hiring drives, and micro-entrepreneurship support for unemployed youth.",
    iconName: "Briefcase",
    badge: "Livelihood",
    color: "bg-amber-50 text-[#D97706] border-amber-200",
    enabled: true
  },
  {
    id: "pink-erickshaw",
    tab: "active",
    title: "Pink E-Rickshaw Empowerment",
    description: "Providing subsidized eco-friendly e-rickshaws to women, empowering them with financial independence and safe urban transit.",
    iconName: "Heart",
    badge: "Women Power",
    color: "bg-rose-50 text-rose-600 border-rose-200",
    enabled: true
  },
  {
    id: "skills",
    tab: "active",
    title: "Skills Training & Vocational Courses",
    description: "Free tailoring units, computer literacy centers, electrician certification, and vocational skill workshops.",
    iconName: "Wrench",
    badge: "Skill Development",
    color: "bg-purple-50 text-purple-600 border-purple-200",
    enabled: true
  },
  {
    id: "health",
    tab: "care",
    title: "Free Health Services & Emergency Care",
    description: "Conducting Mega Health Camps, free medicine distribution, blood donor network dispatch, and diagnostic aid.",
    iconName: "Stethoscope",
    badge: "Healthcare",
    color: "bg-red-50 text-red-600 border-red-200",
    enabled: true
  },
  {
    id: "welfare",
    tab: "care",
    title: "Helping Poor & Downtrodden People",
    description: "Distributing ration kits, winter blankets, disaster emergency relief, and shelter assistance to vulnerable families.",
    iconName: "HandCoins",
    badge: "Welfare Relief",
    color: "bg-[#B9E5CC]/10 text-[#245D45] border-[#B9E5CC]/20",
    enabled: true
  },
  {
    id: "education",
    tab: "community",
    title: "Education Services & Youth Mentorship",
    description: "Providing free books, stationery, evening tuition classes for underprivileged children, and youth sports aid.",
    iconName: "GraduationCap",
    badge: "Youth Education",
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

  // Editing Modals (Unified Fields - No En/Hi division!)
  const [editingDomain, setEditingDomain] = useState<ImpactDomainItem | null>(null);
  const [editingStory, setEditingStory] = useState<ImpactStoryItem | null>(null);

  // Impact State - Single Unified Text (No En/Hi division!)
  const [headline, setHeadline] = useState("Our Social Impact");
  const [description, setDescription] = useState(
    "Field activities across sanitation, clean water, jobs, skills, free health, poor relief, environment & heritage."
  );

  const [impactStats, setImpactStats] = useState<ImpactStatItem[]>([]);
  const [impactDomains, setImpactDomains] = useState<ImpactDomainItem[]>([]);
  const [stories, setStories] = useState<ImpactStoryItem[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/cms");
      const cms = res.data?.cms || {};

      if (cms.impactHeadline || cms.impactHeadlineEn || cms.impactHeadlineHi) {
        setHeadline(cms.impactHeadline || cms.impactHeadlineEn || cms.impactHeadlineHi);
      }
      if (cms.impactDesc || cms.impactDescEn || cms.impactDescHi) {
        setDescription(cms.impactDesc || cms.impactDescEn || cms.impactDescHi);
      }

      if (Array.isArray(cms.impactStats) && cms.impactStats.length > 0) {
        setImpactStats(
          cms.impactStats.map((s: any) => ({
            id: s.id,
            label: s.label || s.labelEn || s.labelHi || "Impact Metric",
            value: Number(s.value) || 0,
            suffix: s.suffix || "+",
            iconName: s.iconName || "Award",
            enabled: s.enabled !== false
          }))
        );
      } else {
        setImpactStats([
          { id: "beneficiaries", label: "Total Beneficiaries", value: 250000, suffix: "+", iconName: "Users", enabled: true },
          { id: "health_camps", label: "Health & Eye Camps", value: 450, suffix: "+", iconName: "Stethoscope", enabled: true },
          { id: "tree_plantations", label: "Trees Planted", value: 50000, suffix: "+", iconName: "Trees", enabled: true },
          { id: "cards_issued", label: "Jan Seva Cards", value: 66505, suffix: "+", iconName: "Award", enabled: true }
        ]);
      }

      if (Array.isArray(cms.impactDomains) && cms.impactDomains.length > 0) {
        setImpactDomains(
          cms.impactDomains.map((d: any) => ({
            id: d.id,
            tab: d.tab || "active",
            title: d.title || d.titleEn || d.titleHi || "Initiative Title",
            description: d.description || d.descEn || d.descHi || "",
            badge: d.badge || d.badgeEn || d.badgeHi || "Ground Action",
            iconName: d.iconName || "Sparkles",
            color: d.color || "bg-emerald-50 text-[#167C5A] border-emerald-200",
            enabled: d.enabled !== false
          }))
        );
      } else {
        setImpactDomains(DEFAULT_DOMAINS);
      }

      if (Array.isArray(cms.testimonials) && cms.testimonials.length > 0) {
        setStories(
          cms.testimonials.map((t: any) => ({
            id: t.id,
            name: t.name || t.nameEn || t.nameHi || "Citizen Beneficiary",
            village: t.village || t.villageEn || t.villageHi || "Bhopal, MP",
            quote: t.quote || t.quoteEn || t.quoteHi || "",
            photoUrl: t.photoUrl,
            enabled: t.enabled !== false
          }))
        );
      } else {
        setStories([
          {
            id: "t1",
            name: "Satyendra Thakur",
            village: "Karond Ward 5, Bhopal",
            quote: "My daughter received the Saraswati Scholarship directly in her bank account within 2 weeks of applying. This support is helping her pursue college education.",
            enabled: true
          },
          {
            id: "t2",
            name: "Shanti Devi",
            village: "Sehore Block, MP",
            quote: "During my husband's eye surgery, RP Foundation volunteers did everything from hospital registration to arranging blood donors.",
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

  // Save All Changes to Live Application - Automatically synchronizes single inputs to En and Hi fields
  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const payload = {
        impactHeadline: headline,
        impactHeadlineEn: headline,
        impactHeadlineHi: headline,
        impactDesc: description,
        impactDescEn: description,
        impactDescHi: description,
        impactStats: impactStats.map(s => ({
          ...s,
          label: s.label,
          labelEn: s.label,
          labelHi: s.label
        })),
        impactDomains: impactDomains.map(d => ({
          ...d,
          title: d.title,
          titleEn: d.title,
          titleHi: d.title,
          description: d.description,
          descEn: d.description,
          descHi: d.description,
          badge: d.badge,
          badgeEn: d.badge,
          badgeHi: d.badge
        })),
        testimonials: stories.map(s => ({
          ...s,
          name: s.name,
          nameEn: s.name,
          nameHi: s.name,
          village: s.village,
          villageEn: s.village,
          villageHi: s.village,
          quote: s.quote,
          quoteEn: s.quote,
          quoteHi: s.quote
        }))
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
      setImpactStats(prev => prev.map(s => (s.id === iconTarget.id ? { ...s, iconName } : s)));
    } else if (iconTarget.type === "domain") {
      setImpactDomains(prev => prev.map(d => (d.id === iconTarget.id ? { ...d, iconName } : d)));
      if (editingDomain && editingDomain.id === iconTarget.id) {
        setEditingDomain(prev => (prev ? { ...prev, iconName } : null));
      }
    }
    toast.success(`Icon updated to ${iconName}`);
  };

  const handleMoveCounter = (index: number, direction: "up" | "down") => {
    const list = [...impactStats];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const tmp = list[index];
    list[index] = list[target];
    list[target] = tmp;
    setImpactStats(list);
  };

  const handleMoveDomain = (index: number, direction: "up" | "down") => {
    const list = [...impactDomains];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const tmp = list[index];
    list[index] = list[target];
    list[target] = tmp;
    setImpactDomains(list);
  };

  const handleMoveStory = (index: number, direction: "up" | "down") => {
    const list = [...stories];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const tmp = list[index];
    list[index] = list[target];
    list[target] = tmp;
    setStories(list);
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
            <h2 className="text-xl font-black text-[#0A192F] mt-0.5">Impact Studio</h2>
            <p className="text-xs text-slate-500">
              Universal Add, Edit, Delete, Active/Deactivate control for KPI metrics, Seva domains, and stories (No bilingual coding division).
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
          { id: "header", label: "Headline & Banner Text", icon: Type }
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
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                  activeSubTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
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
                KPI metric cards displayed at top of public /impact page. Add, edit numbers, change icons, toggle active/deactive, or delete.
              </p>
            </div>
            <button
              onClick={() => {
                const newId = `stat-${Date.now()}`;
                setImpactStats(prev => [
                  ...prev,
                  { id: newId, label: "New Impact Metric", value: 1000, suffix: "+", iconName: "Award", enabled: true }
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
                      title="Click to change icon visually (No code)"
                    >
                      <IconComp className="h-4.5 w-4.5 text-[#C2410C]" />
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setImpactStats(prev => prev.map((s, i) => (i === idx ? { ...s, enabled: !s.enabled } : s)));
                          toast.success(stat.enabled ? "Counter disabled" : "Counter enabled");
                        }}
                        className={`rounded-lg p-1.5 text-xs transition ${
                          stat.enabled ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-slate-400 bg-slate-100"
                        }`}
                        title={stat.enabled ? "Active on public page" : "Disabled"}
                      >
                        {stat.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          onClick={() => handleMoveCounter(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-20 transition"
                          title="Move up"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleMoveCounter(idx, "down")}
                          disabled={idx === impactStats.length - 1}
                          className="p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-20 transition"
                          title="Move down"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Delete counter "${stat.label}"?`)) {
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
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Metric Label</label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={e => {
                          const val = e.target.value;
                          setImpactStats(prev => prev.map((s, i) => (i === idx ? { ...s, label: val } : s)));
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
                            setImpactStats(prev => prev.map((s, i) => (i === idx ? { ...s, value: val } : s)));
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
                            setImpactStats(prev => prev.map((s, i) => (i === idx ? { ...s, suffix: val } : s)));
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
              <h3 className="text-sm font-black text-[#0A192F]">Ground Seva Domains</h3>
              <p className="text-xs text-slate-500">
                Detailed field areas on the Impact page (Cleanliness, RO Water, Jobs, Pink E-Rickshaw, Health, Relief, Skills, Education).
              </p>
            </div>
            <button
              onClick={() => {
                const newDomain: ImpactDomainItem = {
                  id: `domain-${Date.now()}`,
                  tab: "active",
                  title: "New Field Initiative",
                  description: "Describe the ground-level work, beneficiaries and achievements.",
                  iconName: "Sparkles",
                  badge: "Ground Initiative",
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
                        title="Click to change icon visually (No code)"
                      >
                        <IconComp className="h-5 w-5 text-emerald-700" />
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase text-slate-700">
                            {domain.tab}
                          </span>
                          <span className="text-[10px] font-bold text-[#166534]">{domain.badge}</span>
                        </div>
                        <h4 className="text-sm font-bold text-[#0A192F] mt-0.5">{domain.title}</h4>
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
                          setImpactDomains(prev => prev.map((d, i) => (i === idx ? { ...d, enabled: !d.enabled } : d)));
                          toast.success(domain.enabled ? "Domain disabled" : "Domain enabled");
                        }}
                        className={`rounded-lg p-1.5 text-xs transition ${
                          domain.enabled ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-slate-400 bg-slate-100"
                        }`}
                        title={domain.enabled ? "Visible on /impact" : "Hidden"}
                      >
                        {domain.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          onClick={() => handleMoveDomain(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-20 transition"
                          title="Move up"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleMoveDomain(idx, "down")}
                          disabled={idx === impactDomains.length - 1}
                          className="p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-20 transition"
                          title="Move down"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Delete domain "${domain.title}"?`)) {
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

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{domain.description}</p>
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
                Ground experiences, scholarship recipients, patient care, and volunteer testimonies. Full Add, Edit, Delete and Active toggles.
              </p>
            </div>
            <button
              onClick={() => {
                const newStory: ImpactStoryItem = {
                  id: `story-${Date.now()}`,
                  name: "Citizen Beneficiary",
                  village: "Bhopal, MP",
                  quote: "Sharing personal testimony of service received from RP Foundation.",
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
                      <h4 className="text-sm font-bold text-[#0A192F]">{story.name}</h4>
                      <p className="text-[11px] font-medium text-slate-500">{story.village}</p>
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
                        setStories(prev => prev.map((s, i) => (i === idx ? { ...s, enabled: !s.enabled } : s)));
                        toast.success(story.enabled ? "Story disabled" : "Story enabled");
                      }}
                      className={`rounded-lg p-1.5 text-xs transition ${
                        story.enabled ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-slate-400 bg-slate-100"
                      }`}
                    >
                      {story.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        onClick={() => handleMoveStory(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-20 transition"
                        title="Move up"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleMoveStory(idx, "down")}
                        disabled={idx === stories.length - 1}
                        className="p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-20 transition"
                        title="Move down"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Delete story for "${story.name}"?`)) {
                          setStories(prev => prev.filter((_, i) => i !== idx));
                          toast.success("Story deleted");
                        }
                      }}
                      className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 transition"
                      title="Delete story"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 italic">
                  <p>"{story.quote}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: HEADER & HEADLINE */}
      {activeSubTab === "header" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs max-w-2xl">
          <h3 className="text-sm font-black text-[#0A192F]">Public Impact Page Banner Headline & Narrative</h3>
          <p className="text-xs text-slate-500">
            Unified single headline and description that seamlessly updates across all views without bilingual divisions.
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Headline</label>
              <input
                type="text"
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                className="mt-1 w-full text-xs font-medium rounded-xl border border-slate-200 p-2.5 outline-none focus:border-[#C2410C]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="mt-1 w-full text-xs font-medium rounded-xl border border-slate-200 p-2.5 outline-none focus:border-[#C2410C]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Domain Editor Modal (Single Unified Fields - No English/Hindi Split!) */}
      {editingDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-[#0A192F]">Edit Field Seva Domain</h3>
              <button onClick={() => setEditingDomain(null)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Category Filter</label>
                <select
                  value={editingDomain.tab}
                  onChange={e => setEditingDomain({ ...editingDomain, tab: e.target.value as any })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                >
                  <option value="active">Active Ground (सक्रिय अभियान)</option>
                  <option value="care">Care & Relief (देखभाल व राहत)</option>
                  <option value="community">Community (सामुदायिक कल्याण)</option>
                  <option value="all">All (समस्त)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700">Initiative Title</label>
                <input
                  type="text"
                  value={editingDomain.title}
                  onChange={e => setEditingDomain({ ...editingDomain, title: e.target.value })}
                  placeholder="e.g. Clean Drinking Water Supply"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Badge Label</label>
                <input
                  type="text"
                  value={editingDomain.badge}
                  onChange={e => setEditingDomain({ ...editingDomain, badge: e.target.value })}
                  placeholder="e.g. Water Relief"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Description of Field Work</label>
                <textarea
                  rows={3}
                  value={editingDomain.description}
                  onChange={e => setEditingDomain({ ...editingDomain, description: e.target.value })}
                  placeholder="Describe ground operations, locations, and beneficiaries..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                />
              </div>

              {/* Sub-features & Child Action Links */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-slate-700">Child Links & Action Portals (सब-फीचर्स)</label>
                    <p className="text-[10px] text-slate-400">Add inner buttons or portal links inside this Seva domain</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newSub = { id: `link-${Date.now()}`, title: "New Initiative Action", url: "#", active: true };
                      const current = editingDomain.subLinks || [];
                      setEditingDomain({ ...editingDomain, subLinks: [...current, newSub] });
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 rounded-lg hover:bg-emerald-100 border border-emerald-200"
                  >
                    <Plus className="h-3 w-3" /> Add Link
                  </button>
                </div>
                {(editingDomain.subLinks || []).length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No child links added to this domain.</p>
                ) : (
                  (editingDomain.subLinks || []).map((sub, sIdx) => (
                    <div key={sub.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        placeholder="Link Label (e.g. Volunteer Form)"
                        value={sub.title}
                        onChange={e => {
                          const val = e.target.value;
                          const updated = (editingDomain.subLinks || []).map((l, i) => i === sIdx ? { ...l, title: val } : l);
                          setEditingDomain({ ...editingDomain, subLinks: updated });
                        }}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="URL (/volunteer-duty or https://...)"
                        value={sub.url}
                        onChange={e => {
                          const val = e.target.value;
                          const updated = (editingDomain.subLinks || []).map((l, i) => i === sIdx ? { ...l, url: val } : l);
                          setEditingDomain({ ...editingDomain, subLinks: updated });
                        }}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (editingDomain.subLinks || []).filter((_, i) => i !== sIdx);
                          setEditingDomain({ ...editingDomain, subLinks: updated });
                        }}
                        className="text-rose-500 hover:bg-rose-50 p-1 rounded-lg"
                        title="Delete Link"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
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
                  setImpactDomains(prev => prev.map(d => (d.id === editingDomain.id ? editingDomain : d)));
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

      {/* Story Editor Modal (Single Unified Fields - No English/Hindi Split!) */}
      {editingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-[#0A192F]">Edit Impact Story</h3>
              <button onClick={() => setEditingStory(null)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Citizen Beneficiary Name</label>
                <input
                  type="text"
                  value={editingStory.name}
                  onChange={e => setEditingStory({ ...editingStory, name: e.target.value })}
                  placeholder="e.g. Ramesh Sharma"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Location / Village / Ward</label>
                <input
                  type="text"
                  value={editingStory.village}
                  onChange={e => setEditingStory({ ...editingStory, village: e.target.value })}
                  placeholder="e.g. Karond Ward 5, Bhopal"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Personal Experience / Testimony Quote</label>
                <textarea
                  rows={4}
                  value={editingStory.quote}
                  onChange={e => setEditingStory({ ...editingStory, quote: e.target.value })}
                  placeholder="Describe the assistance received and its impact..."
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
                  setStories(prev => prev.map(s => (s.id === editingStory.id ? editingStory : s)));
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
