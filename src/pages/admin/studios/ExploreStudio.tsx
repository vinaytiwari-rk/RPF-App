import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Compass,
  Plus,
  Trash2,
  Save,
  ArrowUp,
  ArrowDown,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Flame,
  LayoutGrid,
  ExternalLink,
  Edit3,
  BadgePlus,
  HeartPulse,
  Briefcase,
  ClipboardList,
  Heart,
  Users,
  TreePine,
  Landmark,
  AlertCircle,
  Sprout,
  FileText,
  GraduationCap,
  AlertTriangle,
  HandCoins,
  ShieldAlert,
  Calendar,
  Newspaper,
  Radio,
  Bus,
  Sparkles,
  Flag,
  Wrench,
  Calculator,
  Clock,
  Wind,
  ShieldCheck,
  BookOpen,
  Pencil,
  Link,
  Layers
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import IconPickerModal, { AVAILABLE_ICONS } from "../../../components/admin/IconPickerModal";
import { SERVICE_GOV_LINKS, SERVICE_ALIASES, getGovLinksForService } from "../../../data/serviceGovLinks";

export interface SubFeatureLink {
  id: string;
  title: string;
  url: string;
  isExternal: boolean;
  active: boolean;
}

export interface ServiceCard {
  id: string;
  title: string;
  desc: string;
  iconName: string;
  route: string;
  category?: string;
  active: boolean;
  order?: number;
  subLinks?: SubFeatureLink[];
}

export const DEFAULT_FEATURED_SERVICES: ServiceCard[] = [
  {
    id: "card",
    title: "Jan Seva Card",
    desc: "Your digital service identity & welfare access",
    iconName: "BadgePlus",
    route: "/jan-seva-card",
    category: "Welfare",
    active: true
  },
  {
    id: "health-care",
    title: "Healthcare",
    desc: "Health camps, medicines & hospital locator",
    iconName: "HeartPulse",
    route: "/health-care",
    category: "Health",
    active: true
  },
  {
    id: "employment",
    title: "Employment",
    desc: "Jobs, skill development & career guidance",
    iconName: "Briefcase",
    route: "/employment",
    category: "Employment",
    active: true
  },
  {
    id: "grievance",
    title: "Grievance",
    desc: "Submit issues & track resolution progress",
    iconName: "ClipboardList",
    route: "/grievance",
    category: "Civic",
    active: true
  }
];

export const DEFAULT_ALL_SERVICES: ServiceCard[] = [
  { id: "jan-seva-card", title: "Jan Seva Card", desc: "Apply for Foundational ID", iconName: "BadgePlus", route: "/jan-seva-card", category: "Welfare", active: true },
  { id: "blood-network", title: "Blood Network", desc: "Emergency Blood Donor Requests", iconName: "Heart", route: "/blood-network", category: "Urgent", active: true },
  { id: "grievances", title: "Grievances", desc: "Report Civic Issues", iconName: "AlertTriangle", route: "/grievance", category: "Civic", active: true },
  { id: "volunteering", title: "Volunteering", desc: "Join the RP Force", iconName: "Users", route: "/volunteers", category: "Involved", active: true },
  { id: "health-care", title: "Health Care", desc: "Track health metrics & seek care", iconName: "HeartPulse", route: "/health-care", category: "Welfare", active: true },
  { id: "jobs-portal", title: "Jobs Portal", desc: "Find local employment opportunities", iconName: "Briefcase", route: "/employment", category: "Welfare", active: true },
  { id: "scholarships", title: "Scholarships", desc: "Apply for educational grants", iconName: "GraduationCap", route: "/services/scholarships", category: "Empowerment", active: true },
  { id: "food-support", title: "Food Support", desc: "Apply for dry rations or find kitchens", iconName: "HandCoins", route: "/services/food", category: "Welfare", active: true },
  { id: "medicine-support", title: "Medicine Support", desc: "Request critical medical supplies", iconName: "HeartPulse", route: "/services/medicine", category: "Welfare", active: true },
  { id: "education-aid", title: "Education Aid", desc: "Scholarships and Books", iconName: "BookOpen", route: "/services/education", category: "Empowerment", active: true },
  { id: "women-safety", title: "Women Safety", desc: "24/7 Helpline and support", iconName: "ShieldAlert", route: "/services/women-safety", category: "Urgent", active: true },
  { id: "senior-citizens", title: "Senior Citizens", desc: "Doorstep checkups & elder care", iconName: "Users", route: "/services/seniors", category: "Welfare", active: true },
  { id: "animal-welfare", title: "Animal Welfare", desc: "Stray rescue & adoption registry", iconName: "Heart", route: "/services/animals", category: "Involved", active: true },
  { id: "environment", title: "Environment", desc: "Tree plantation drives", iconName: "TreePine", route: "/services/environment", category: "Involved", active: true },
  { id: "crowdfunding", title: "Crowdfunding", desc: "Crowdfunded community projects", iconName: "HandCoins", route: "/services/crowdfunding", category: "Involved", active: true },
  { id: "religious-culture", title: "Religious & Culture", desc: "Festivals, sacred texts & live feeds", iconName: "Landmark", route: "/culture", category: "Civic", active: true },
  { id: "disaster-management", title: "Disaster Management", desc: "Emergency relief & rescue mapping", iconName: "AlertCircle", route: "/services/disaster", category: "Urgent", active: true },
  { id: "farmer-support", title: "Farmer Support", desc: "Crop diagnostic & market pricing", iconName: "Sprout", route: "/services/farmer", category: "Welfare", active: true },
  { id: "government-schemes", title: "Government Schemes", desc: "Eligibility calculator & guides", iconName: "FileText", route: "/services/schemes", category: "Empowerment", active: true },
  { id: "skills-training", title: "Skills Training", desc: "Tailoring, coding & courses", iconName: "GraduationCap", route: "/services/skills", category: "Empowerment", active: true },
  { id: "sos-system", title: "SOS System", desc: "Emergency panic & location", iconName: "ShieldAlert", route: "/sos", category: "Urgent", active: true },
  { id: "hindu-calendar", title: "Hindu Calendar", desc: "Tithis & Festivals", iconName: "Calendar", route: "/hindu-calendar", category: "Civic", active: true },
  { id: "news-feed", title: "News Feed", desc: "Top headlines & stories", iconName: "Newspaper", route: "/news", category: "Information", active: true },
  { id: "internet-radio", title: "Internet Radio", desc: "Live radio stations", iconName: "Radio", route: "/internet-radio", category: "Broadcast", active: true },
  { id: "transit-planner", title: "Transit Planner", desc: "Bus & Metro Routes", iconName: "Bus", route: "/services/transit", category: "Daily Utility", active: true },
  { id: "youth-empowerment", title: "Youth Empowerment", desc: "Leadership, sports & career guidance for youth", iconName: "Sparkles", route: "/services/youth", category: "Empowerment", active: true },
  { id: "nation-building", title: "Nation Building", desc: "National programs, civic duty & patriotic initiatives", iconName: "Flag", route: "/services/nation", category: "Civic", active: true },
  { id: "daily-utility", title: "Daily Utility Center", desc: "BMI, bill split, Pomodoro, breathing, Morse, habits & more", iconName: "Wrench", route: "/daily-utility", category: "Daily Utility", active: true },
  { id: "bmi-calculator", title: "BMI Calculator", desc: "Calculate BMI offline", iconName: "Calculator", route: "/bmi-calculator", category: "Daily Utility", active: true },
  { id: "pomodoro-timer", title: "Pomodoro Timer", desc: "Focus and break timer", iconName: "Clock", route: "/pomodoro", category: "Daily Utility", active: true },
  { id: "breathing-meditator", title: "Breathing Meditator", desc: "Guided breathing cycles", iconName: "Wind", route: "/breathing-meditator", category: "Daily Utility", active: true },
  { id: "epaper-kiosk", title: "Epaper Kiosk", desc: "Read today's leading daily e-papers", iconName: "FileText", route: "/epaper", category: "Information", active: true },
  { id: "national-directory", title: "National Directory", desc: "Government contacts & helplines", iconName: "BookOpen", route: "/directory", category: "Information", active: true },
  { id: "peoples-university", title: "People's University Portal", desc: "Official University Information", iconName: "GraduationCap", route: "https://www.peoplesuniversity.edu.in/", category: "Education", active: true },
  { id: "fact-check", title: "Fact Check Hub", desc: "Check claims and viral news", iconName: "ShieldCheck", route: "/fact-check", category: "Information", active: true },
  { id: "live-tv", title: "Live Broadcast TV", desc: "Official news & culture channels", iconName: "Tv", route: "/live-tv", category: "Broadcast", active: true }
];

export default function ExploreStudio() {
  const [activeTab, setActiveTab] = useState<"featured" | "all">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [featuredServices, setFeaturedServices] = useState<ServiceCard[]>(DEFAULT_FEATURED_SERVICES);
  const [allServices, setAllServices] = useState<ServiceCard[]>(DEFAULT_ALL_SERVICES);

  const [selectedCard, setSelectedCard] = useState<ServiceCard | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const { token: authToken } = useAuth();
  const token = authToken || localStorage.getItem("@rpf_token") || localStorage.getItem("token") || "";

  useEffect(() => {
    fetchCmsData();
  }, []);

  const fetchCmsData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/cms");
      const cms = res.data?.cms || res.data?.data || {};

      const websiteMap = cms.serviceWebsiteLinks || {};

      const hydrateCardsWithLinks = (cards: ServiceCard[]) => {
        return cards.map(card => {
          if (Array.isArray(card.subLinks) && card.subLinks.length > 0) return card;
          // Hydrate from serviceWebsiteLinks or default catalog using alias lookup
          const aliasKey = SERVICE_ALIASES[card.id] || card.id;
          const existingLinks = (Array.isArray(websiteMap[card.id]) && websiteMap[card.id].length > 0)
            ? websiteMap[card.id]
            : (Array.isArray(websiteMap[aliasKey]) && websiteMap[aliasKey].length > 0)
            ? websiteMap[aliasKey]
            : (SERVICE_GOV_LINKS[card.id] || SERVICE_GOV_LINKS[aliasKey] || getGovLinksForService(card.id));

          if (Array.isArray(existingLinks) && existingLinks.length > 0) {
            return {
              ...card,
              subLinks: existingLinks.map((l: any, idx: number) => ({
                id: `link-${card.id}-${idx}`,
                title: l.title || l.titleHi || "Link",
                url: l.url || "#",
                isExternal: l.isGov !== false,
                active: true
              }))
            };
          }
          return card;
        });
      };

      if (Array.isArray(cms.featuredServices)) {
        setFeaturedServices(hydrateCardsWithLinks(cms.featuredServices));
      } else {
        setFeaturedServices(hydrateCardsWithLinks(DEFAULT_FEATURED_SERVICES));
      }

      if (Array.isArray(cms.allServices)) {
        setAllServices(hydrateCardsWithLinks(cms.allServices));
      } else {
        setAllServices(hydrateCardsWithLinks(DEFAULT_ALL_SERVICES));
      }
    } catch {
      toast.error("Failed to load CMS data, loading default catalog");
      setFeaturedServices(DEFAULT_FEATURED_SERVICES);
      setAllServices(DEFAULT_ALL_SERVICES);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!token) {
      toast.error("Admin session expired");
      return;
    }
    setSaving(true);
    const toastId = toast.loading("Saving and publishing Explore services...");
    try {
      // Construct serviceWebsiteLinks map so both legacy and modern readers receive identical child links
      const serviceWebsiteLinks: Record<string, any[]> = {};
      [...featuredServices, ...allServices].forEach(s => {
        if (s && s.id && Array.isArray(s.subLinks)) {
          serviceWebsiteLinks[s.id] = s.subLinks
            .filter((l: any) => l && l.active !== false)
            .map((l: any) => ({
              title: l.title,
              titleHi: l.title,
              url: l.url,
              desc: l.url,
              descHi: l.url,
              isGov: l.isExternal !== false
            }));
        }
      });

      const patch = {
        featuredServices,
        allServices,
        serviceWebsiteLinks
      };

      const res = await axios.post(
        "/api/admin/control/cms/publish",
        { patch, label: "Explore Studio: Updated Featured and All Services with Child Links" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success === false) throw new Error(res.data?.error || "Publish failed");
      window.dispatchEvent(new CustomEvent("samahit-admin-updated"));
      toast.success("Explore catalog and child links published live!", { id: toastId });
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Save failed", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // Toggle active status
  const handleToggleActive = (id: string, isFeatured: boolean) => {
    if (isFeatured) {
      setFeaturedServices(prev =>
        prev.map(s => (s.id === id ? { ...s, active: !s.active } : s))
      );
    } else {
      setAllServices(prev =>
        prev.map(s => (s.id === id ? { ...s, active: !s.active } : s))
      );
    }
    if (selectedCard?.id === id) {
      setSelectedCard(prev => (prev ? { ...prev, active: !prev.active } : null));
    }
  };

  // Delete card
  const handleDeleteCard = (id: string, isFeatured: boolean) => {
    if (isFeatured) {
      setFeaturedServices(prev => prev.filter(s => s.id !== id));
    } else {
      setAllServices(prev => prev.filter(s => s.id !== id));
    }
    if (selectedCard?.id === id) {
      setSelectedCard(null);
      setIsEditing(false);
    }
    toast.success("Service card removed");
  };

  // Add new card
  const handleAddNew = () => {
    const isFeatured = activeTab === "featured";
    const newId = `service-${Date.now()}`;
    const newCard: ServiceCard = {
      id: newId,
      title: isFeatured ? "New Featured Service" : "New Service Card",
      desc: "Short descriptive summary",
      iconName: "Compass",
      route: "/services/new",
      category: "General",
      active: true
    };

    if (isFeatured) {
      setFeaturedServices([newCard, ...featuredServices]);
    } else {
      setAllServices([newCard, ...allServices]);
    }
    setSelectedCard(newCard);
    setIsEditing(true);
    toast.success("New service card added");
  };

  // Move Up / Move Down ("Arrange")
  const handleMove = (index: number, direction: "up" | "down", isFeatured: boolean) => {
    const list = isFeatured ? [...featuredServices] : [...allServices];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    if (isFeatured) {
      setFeaturedServices(list);
    } else {
      setAllServices(list);
    }
  };

  // Update selected card and auto-sync to lists
  const updateSelectedCard = (updatedCard: ServiceCard) => {
    setSelectedCard(updatedCard);
    const isFeatured = activeTab === "featured";
    if (isFeatured) {
      setFeaturedServices(prev => prev.map(s => (s.id === updatedCard.id ? updatedCard : s)));
    } else {
      setAllServices(prev => prev.map(s => (s.id === updatedCard.id ? updatedCard : s)));
    }
  };

  // Save changes to current card in inspector
  const handleSaveCard = (card: ServiceCard) => {
    updateSelectedCard(card);
    toast.success("Card updated in draft");
  };

  // Restore defaults
  const handleResetDefaults = () => {
    if (window.confirm("Reset all services back to default authentic state?")) {
      setFeaturedServices(DEFAULT_FEATURED_SERVICES);
      setAllServices(DEFAULT_ALL_SERVICES);
      toast.success("Defaults restored. Click 'Save & Publish' to make permanent.");
    }
  };

  // Filtered items
  const currentList = activeTab === "featured" ? featuredServices : allServices;
  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return currentList.filter(s => {
      const matchesSearch = !q || s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q) || s.route.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "all" || s.category?.toLowerCase() === categoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [currentList, search, categoryFilter]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    currentList.forEach(s => { if (s.category) set.add(s.category); });
    return ["all", ...Array.from(set)];
  }, [currentList]);

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 space-y-6">
      {/* HEADER WITH SAVE AND NEW */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-indigo-600">Explore & Services CMS</p>
            <h1 className="text-xl md:text-2xl font-black text-slate-800">Explore & Citizen Portals Command</h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure Featured Services, All Services, links, icons, arrangement order, and active/deactivate controls.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Card
          </button>
          <button
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition border border-slate-200"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Defaults
          </button>
          <button
            onClick={handlePublish}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-6 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-xs disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> {saving ? "Publishing..." : "Save & Publish"}
          </button>
        </div>
      </div>

      {/* TABS: FEATURED SERVICES vs ALL SERVICES */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab("featured"); setSelectedCard(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "featured"
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Flame className="h-4 w-4" /> Featured Services ({featuredServices.length})
          </button>
          <button
            onClick={() => { setActiveTab("all"); setSelectedCard(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "all"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <LayoutGrid className="h-4 w-4" /> All Services & Portals ({allServices.length})
          </button>
        </div>

        <span className="text-xs font-bold text-slate-400 hidden sm:inline">
          Use Arrange (↑ / ↓) to reorder public position
        </span>
      </div>

      {/* SEARCH AND CATEGORY FILTER */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search service title, description, route..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
        </div>
        {activeTab === "all" && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition whitespace-nowrap ${
                  categoryFilter === c
                    ? "bg-slate-800 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SPLIT PANE: SERVICES LIST & INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[75vh]">
        {/* LEFT COLUMN: CARDS LIST */}
        <div className="lg:col-span-5 flex flex-col space-y-2.5 max-h-[78vh] overflow-y-auto pr-1.5 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 text-xs font-bold">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Loading services...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
              No matching service cards found.
            </div>
          ) : (
            filteredList.map((card, idx) => {
              const isSelected = selectedCard?.id === card.id;
              const isFeatured = activeTab === "featured";
              return (
                <div
                  key={card.id}
                  onClick={() => { setSelectedCard(card); setIsEditing(true); }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer bg-white flex items-center justify-between gap-3 hover:border-slate-300 hover:shadow-xs ${
                    isSelected ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-indigo-600 shrink-0 font-bold">
                      {React.createElement(AVAILABLE_ICONS[card.iconName] || Compass, { className: "h-5 w-5" })}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="text-xs font-bold text-slate-800 truncate">{card.title}</h3>
                        {card.category && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {card.category}
                          </span>
                        )}
                        {Array.isArray(card.subLinks) && card.subLinks.length > 0 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {card.subLinks.length} links
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{card.desc}</p>
                      <p className="text-[10px] text-indigo-600 font-mono truncate mt-0.5">{card.route}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                    {/* Explicit Edit Pencil Button */}
                    <button
                      onClick={() => { setSelectedCard(card); setIsEditing(true); }}
                      className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition"
                      title="Edit card & child links"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    {/* Status Badge */}
                    <button
                      onClick={() => handleToggleActive(card.id, isFeatured)}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition ${
                        card.active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {card.active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {card.active ? "Active" : "Deactive"}
                    </button>

                    {/* Arrange buttons */}
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        onClick={() => handleMove(idx, "up", isFeatured)}
                        disabled={idx === 0}
                        className="p-1 hover:bg-slate-200 text-slate-500 disabled:opacity-20 transition"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(idx, "down", isFeatured)}
                        disabled={idx === filteredList.length - 1}
                        className="p-1 hover:bg-slate-200 text-slate-500 disabled:opacity-20 transition"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteCard(card.id, isFeatured)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="Delete card"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: INSPECTOR & LIVE EDITOR */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[78vh]">
          {selectedCard ? (
            <div className="p-6 h-full flex flex-col justify-between overflow-y-auto custom-scrollbar">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                      Card Inspector
                    </span>
                    <h2 className="text-base font-black text-slate-800">{selectedCard.title}</h2>
                  </div>
                  <button
                    onClick={() => handleToggleActive(selectedCard.id, activeTab === "featured")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedCard.active
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {selectedCard.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {selectedCard.active ? "Card Active" : "Card Deactivated"}
                  </button>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Service Title</label>
                    <input
                      type="text"
                      value={selectedCard.title}
                      onChange={e => updateSelectedCard({ ...selectedCard, title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description / Subtitle</label>
                    <textarea
                      rows={2}
                      value={selectedCard.desc}
                      onChange={e => updateSelectedCard({ ...selectedCard, desc: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">In-App Route / External URL</label>
                      <input
                        type="text"
                        value={selectedCard.route}
                        onChange={e => updateSelectedCard({ ...selectedCard, route: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category Badge</label>
                      <input
                        type="text"
                        value={selectedCard.category || ""}
                        onChange={e => updateSelectedCard({ ...selectedCard, category: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Visual Icon Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Card Icon</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIconPickerOpen(true)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-indigo-400 hover:text-indigo-700 flex items-center gap-2 shadow-2xs transition"
                      >
                        {React.createElement(AVAILABLE_ICONS[selectedCard.iconName] || Compass, { className: "h-5 w-5 text-indigo-600" })}
                        <span>{selectedCard.iconName || "Select Icon"}</span>
                        <Pencil className="h-3 w-3 text-slate-400 ml-1" />
                      </button>
                    </div>
                  </div>

                  {/* DEEP CHILD LINKS & SUB-FEATURES MANAGER */}
                  <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                      <div>
                        <h4 className="text-xs font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1.5">
                          <Layers className="h-4 w-4 text-indigo-600" />
                          Sub-Features & Child Links
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newLink: SubFeatureLink = {
                            id: `link-${Date.now()}`,
                            title: "New Action / Portal Link",
                            url: "https://",
                            isExternal: true,
                            active: true
                          };
                          const existing = Array.isArray(selectedCard.subLinks) ? selectedCard.subLinks : [];
                          updateSelectedCard({ ...selectedCard, subLinks: [...existing, newLink] });
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 shadow-2xs"
                      >
                        <Plus className="h-3 w-3" /> Add Link
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {(selectedCard.subLinks || []).length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2">
                          No inner links added yet. You can add local forms and external government portals here.
                        </p>
                      ) : (
                        selectedCard.subLinks!.map((linkItem, lIdx) => (
                          <div
                            key={linkItem.id}
                            className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-2xs"
                          >
                            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={linkItem.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = selectedCard.subLinks!.map((l, i) =>
                                    i === lIdx ? { ...l, title: val } : l
                                  );
                                  updateSelectedCard({ ...selectedCard, subLinks: updated });
                                }}
                                placeholder="Link Title"
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                              />
                              <input
                                type="text"
                                value={linkItem.url}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = selectedCard.subLinks!.map((l, i) =>
                                    i === lIdx ? { ...l, url: val } : l
                                  );
                                  updateSelectedCard({ ...selectedCard, subLinks: updated });
                                }}
                                placeholder="URL (e.g. https://...)"
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800"
                              />
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              {linkItem.url && linkItem.url.startsWith("http") && (
                                <a
                                  href={linkItem.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
                                  title="Test link in browser"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              )}

                              <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={linkItem.isExternal}
                                  onChange={(e) => {
                                    const val = e.target.checked;
                                    const updated = selectedCard.subLinks!.map((l, i) =>
                                      i === lIdx ? { ...l, isExternal: val } : l
                                    );
                                    updateSelectedCard({ ...selectedCard, subLinks: updated });
                                  }}
                                  className="h-3.5 w-3.5 rounded text-indigo-600"
                                />
                                External
                              </label>

                              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                                <button
                                  type="button"
                                  disabled={lIdx === 0}
                                  onClick={() => {
                                    if (lIdx === 0) return;
                                    const links = [...(selectedCard.subLinks || [])];
                                    const tmp = links[lIdx];
                                    links[lIdx] = links[lIdx - 1];
                                    links[lIdx - 1] = tmp;
                                    updateSelectedCard({ ...selectedCard, subLinks: links });
                                  }}
                                  className="p-1 hover:bg-slate-200 text-slate-500 disabled:opacity-20 transition"
                                  title="Move Up"
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={lIdx === (selectedCard.subLinks?.length || 0) - 1}
                                  onClick={() => {
                                    if (lIdx >= (selectedCard.subLinks?.length || 0) - 1) return;
                                    const links = [...(selectedCard.subLinks || [])];
                                    const tmp = links[lIdx];
                                    links[lIdx] = links[lIdx + 1];
                                    links[lIdx + 1] = tmp;
                                    updateSelectedCard({ ...selectedCard, subLinks: links });
                                  }}
                                  className="p-1 hover:bg-slate-200 text-slate-500 disabled:opacity-20 transition"
                                  title="Move Down"
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const updated = selectedCard.subLinks!.map((l, i) =>
                                    i === lIdx ? { ...l, active: !l.active } : l
                                  );
                                  updateSelectedCard({ ...selectedCard, subLinks: updated });
                                }}
                                className={`p-1.5 rounded-lg transition ${
                                  linkItem.active ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-slate-400 bg-slate-100"
                                }`}
                                title={linkItem.active ? "Active" : "Deactive"}
                              >
                                {linkItem.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const updated = selectedCard.subLinks!.filter((_, i) => i !== lIdx);
                                  updateSelectedCard({ ...selectedCard, subLinks: updated });
                                }}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                                title="Delete link"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom action bar */}
              <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">Updates sync to draft instantly. Click Save & Publish when ready.</span>
                <button
                  onClick={() => handleSaveCard(selectedCard)}
                  className="px-5 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 text-xs transition"
                >
                  Apply Card Updates
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50">
              <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4 shadow-xs border border-indigo-100">
                <Compass className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-black text-slate-800">Select a Service Card to Edit</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Add, modify routes, reorder positions (Arrange), and toggle active/deactivate for citizen services.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* REUSABLE VISUAL ICON PICKER MODAL */}
      <IconPickerModal
        isOpen={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        selectedIcon={selectedCard?.iconName || ""}
        onSelectIcon={(newIconName) => {
          if (selectedCard) {
            setSelectedCard({ ...selectedCard, iconName: newIconName });
            toast.success(`Icon selected: ${newIconName}`);
          }
        }}
      />
    </div>
  );
}
