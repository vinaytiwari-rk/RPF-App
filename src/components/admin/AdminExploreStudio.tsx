import React, { useState, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import {
  Compass,
  Search,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Save,
  RefreshCw,
  Globe2,
  ShieldCheck,
  Wrench,
  Check,
  X,
  Filter,
  Layers,
  Sparkles,
  Link as LinkIcon
} from "lucide-react";
import { toast } from "react-hot-toast";
import { CORE_SERVICES } from "../../data/coreServices";
import { SERVICE_GOV_LINKS, GovLink } from "../../data/serviceGovLinks";

interface ServiceItem {
  id: string;
  category: string;
  iconName: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  route?: string;
  url?: string;
  enabled?: boolean;
}

interface UtilityItem {
  id: string;
  category: string;
  iconName: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  route: string;
  url?: string;
  enabled?: boolean;
}

const DEFAULT_UTILITIES: UtilityItem[] = [
  { id: "epaper", category: "community", iconName: "Newspaper", titleEn: "Epaper Kiosk", titleHi: "ई-पेपर कियोस्क", descEn: "Read today's leading daily e-papers", descHi: "आज के प्रमुख दैनिक ई-पेपर पढ़ें", route: "/epaper", enabled: true },
  { id: "directory", category: "government", iconName: "BookOpen", titleEn: "National Directory", titleHi: "राष्ट्रीय निर्देशिका", descEn: "Government contacts & helplines", descHi: "सरकारी संपर्क और उपयोगिता निर्देशिका", route: "/directory", enabled: true },
  { id: "peoples-university", category: "education", iconName: "GraduationCap", titleEn: "People's University Portal", titleHi: "पीपुल्स यूनिवर्सिटी पोर्टल", descEn: "Official University Information", descHi: "आधिकारिक विश्वविद्यालय पोर्टल", route: "", url: "https://www.peoplesuniversity.edu.in/", enabled: true },
  { id: "fact-check", category: "community", iconName: "ShieldCheck", titleEn: "Fact Check Hub", titleHi: "फैक्ट चेक हब", descEn: "Check claims and viral news", descHi: "वायरल दावों और खबरों की जांच करें", route: "/fact-check", enabled: true },
  { id: "live-tv", category: "community", iconName: "Tv", titleEn: "Live Broadcast TV", titleHi: "लाइव प्रसारण टीवी", descEn: "Official news & culture channels", descHi: "आधिकारिक लाइव टीवी चैनल", route: "/live-tv", enabled: true },
  { id: "internet-radio", category: "culture", iconName: "Radio", titleEn: "Internet Radio", titleHi: "इंटरनेट रेडियो", descEn: "Live socio-cultural radio stations", descHi: "लाइव सामाजिक-सांस्कृतिक रेडियो स्टेशन", route: "/internet-radio", enabled: true },
  { id: "utility-center", category: "tools", iconName: "Sparkles", titleEn: "Daily Utility Center", titleHi: "दैनिक उपयोगिता केंद्र", descEn: "BMI, bill split, Pomodoro, breathing, Morse & habits", descHi: "BMI, बिल स्प्लिट, पोमोडोरो, ब्रीदिंग, मोर्स और आदतें", route: "/utility-center", enabled: true },
  { id: "doc-scanner", category: "tools", iconName: "Camera", titleEn: "Doc Scanner", titleHi: "दस्तावेज़ स्कैनर", descEn: "Scan and save official citizen documents", descHi: "नागरिक दस्तावेज़ स्कैन करें और सुरक्षित रखें", route: "/doc-scanner", enabled: true },
  { id: "resume-builder", category: "tools", iconName: "FileText", titleEn: "Resume Builder", titleHi: "बायोडाटा निर्माता", descEn: "Create professional Hindi/English resumes", descHi: "व्यावसायिक हिंदी/अंग्रेजी बायोडाटा बनाएं", route: "/resume-builder", enabled: true },
  { id: "bmi-calculator", category: "health", iconName: "HeartPulse", titleEn: "BMI Calculator", titleHi: "BMI कैलकुलेटर", descEn: "Calculate Body Mass Index & fitness targets", descHi: "बॉडी मास इंडेक्स और फिटनेस लक्ष्य मापें", route: "/bmi-calculator", enabled: true },
  { id: "pomodoro", category: "education", iconName: "Timer", titleEn: "Pomodoro Focus Timer", titleHi: "पोमोडोरो फोकस टाइमर", descEn: "Productivity & study interval countdown", descHi: "उत्पादकता और अध्ययन समय चक्र टाइमर", route: "/pomodoro", enabled: true },
  { id: "breathing-meditator", category: "health", iconName: "Wind", titleEn: "Breathing Meditator", titleHi: "ब्रीदिंग मेडिटेटर", descEn: "Guided 4-7-8 relaxing breathing cycles", descHi: "निर्देशित 4-7-8 ध्यान व श्वास अभ्यास", route: "/breathing-meditator", enabled: true },
  { id: "decision-maker", category: "tools", iconName: "Compass", titleEn: "Decision Maker", titleHi: "निर्णय सहायक", descEn: "Randomized yes/no & decision wheels", descHi: "रैंडम हाँ/नहीं और निर्णय चक्र", route: "/decision-maker", enabled: true },
  { id: "morse-code", category: "education", iconName: "MessageSquare", titleEn: "Morse Code Converter", titleHi: "मोर्स कोड कनवर्टर", descEn: "Translate emergency Morse signals", descHi: "आपातकालीन मोर्स सिग्नल अनुवादक", route: "/morse-code", enabled: true },
  { id: "fasting-tracker", category: "health", iconName: "Clock3", titleEn: "Fasting Tracker", titleHi: "फास्टिंग ट्रैकर", descEn: "Intermittent fasting & prayer timer", descHi: "इंटरमिटेंट उपवास और प्रार्थना समय ट्रैकर", route: "/fasting-tracker", enabled: true },
  { id: "hindu-calendar", category: "culture", iconName: "Calendar", titleEn: "Hindu Calendar / Panchang", titleHi: "हिंदू पंचांग व त्यौहार", descEn: "Daily tithis, nakshatras & festive calendar", descHi: "दैनिक तिथियां, नक्षत्र और त्यौहार पंचांग", route: "/hindu-calendar", enabled: true },
  { id: "gps-toolkit", category: "tools", iconName: "MapPin", titleEn: "GPS Speedometer & Parking", titleHi: "GPS स्पीडोमीटर और पार्किंग", descEn: "Realtime velocity & vehicle parked spot memory", descHi: "रीयल-टाइम गति और वाहन पार्किंग स्थल", route: "/gps-toolkit", enabled: true },
  { id: "vitals", category: "health", iconName: "Activity", titleEn: "Vitals Health Log", titleHi: "विटल्स हेल्थ लॉग", descEn: "Log blood pressure, pulse, glucose and steps", descHi: "रक्तचाप, पल्स, ग्लूकोज और कदम लॉग करें", route: "/vitals", enabled: true }
];

interface AdminExploreStudioProps {
  cmsConfig: any;
  onSaveCms: (updatedCms: any) => Promise<void>;
  isLoading?: boolean;
}

export default function AdminExploreStudio({ cmsConfig, onSaveCms, isLoading = false }: AdminExploreStudioProps) {
  const [subTab, setSubTab] = useState<"services" | "links" | "utilities">("services");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedServiceForLinks, setSelectedServiceForLinks] = useState<string>("all");
  const [isSaving, setIsSaving] = useState(false);

  // 1. Primary Services State
  const [services, setServices] = useState<ServiceItem[]>(() => {
    const hiddenSet = new Set<string>(
      Array.isArray(cmsConfig?.hiddenServiceIds) ? cmsConfig.hiddenServiceIds : []
    );
    const customList = Array.isArray(cmsConfig?.customServices) ? cmsConfig.customServices : [];
    const base = CORE_SERVICES.map((s) => ({
      ...s,
      enabled: !hiddenSet.has(s.id)
    }));
    const custom = customList.map((s: any) => ({
      ...s,
      enabled: s.enabled !== false && !hiddenSet.has(s.id)
    }));
    const ids = new Set(base.map((b) => b.id));
    return [...base, ...custom.filter((c: any) => !ids.has(c.id))];
  });

  // 2. Service Government/External Links State
  const [serviceLinks, setServiceLinks] = useState<Record<string, (GovLink & { id?: string; enabled?: boolean })[]>>(() => {
    const overrides = cmsConfig?.serviceWebsiteLinks;
    const initial: Record<string, (GovLink & { id?: string; enabled?: boolean })[]> = {};
    const allServiceIds = Array.from(
      new Set([
        ...Object.keys(SERVICE_GOV_LINKS),
        ...(overrides && typeof overrides === "object" ? Object.keys(overrides) : [])
      ])
    );
    for (const sid of allServiceIds) {
      if (overrides && overrides[sid] && Array.isArray(overrides[sid])) {
        initial[sid] = overrides[sid].map((l: any, i: number) => ({
          ...l,
          id: l.id || `${sid}-link-${i}`,
          enabled: l.enabled !== false
        }));
      } else if (SERVICE_GOV_LINKS[sid]) {
        initial[sid] = SERVICE_GOV_LINKS[sid].map((l, i) => ({
          ...l,
          id: `${sid}-link-${i}`,
          enabled: true
        }));
      } else {
        initial[sid] = [];
      }
    }
    return initial;
  });

  // 3. Local Utilities State
  const [utilities, setUtilities] = useState<UtilityItem[]>(() => {
    const cmsUtils = cmsConfig?.exploreUtilities;
    if (Array.isArray(cmsUtils) && cmsUtils.length > 0) {
      return cmsUtils;
    }
    return DEFAULT_UTILITIES;
  });

  // Modal Dialogs
  const [serviceModal, setServiceModal] = useState<{ isOpen: boolean; mode: "add" | "edit"; data: Partial<ServiceItem> }>({
    isOpen: false,
    mode: "add",
    data: {}
  });

  const [linkModal, setLinkModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    serviceId: string;
    index?: number;
    data: Partial<GovLink & { enabled?: boolean }>;
  }>({
    isOpen: false,
    mode: "add",
    serviceId: "health-care",
    data: {}
  });

  const [utilityModal, setUtilityModal] = useState<{ isOpen: boolean; mode: "add" | "edit"; data: Partial<UtilityItem> }>({
    isOpen: false,
    mode: "add",
    data: {}
  });

  // Primary Services handlers
  const handleToggleService = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleDeleteService = (id: string) => {
    if (confirm("Are you sure you want to remove this service from Explore?")) {
      setServices((prev) => prev.filter((s) => s.id !== id));
      toast.success("Service removed");
    }
  };

  const handleSaveServiceModal = () => {
    if (!serviceModal.data.titleEn?.trim() || !serviceModal.data.id?.trim()) {
      toast.error("Service ID and English Title are required");
      return;
    }
    const cleanId = serviceModal.data.id.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-");
    const item: ServiceItem = {
      id: cleanId,
      category: serviceModal.data.category || "welfare",
      iconName: serviceModal.data.iconName || "ShieldCheck",
      titleEn: serviceModal.data.titleEn.trim(),
      titleHi: serviceModal.data.titleHi?.trim() || serviceModal.data.titleEn.trim(),
      descEn: serviceModal.data.descEn?.trim() || "",
      descHi: serviceModal.data.descHi?.trim() || "",
      route: serviceModal.data.route?.trim(),
      url: serviceModal.data.url?.trim(),
      enabled: serviceModal.data.enabled !== false
    };

    if (serviceModal.mode === "add") {
      if (services.some((s) => s.id === cleanId)) {
        toast.error("Service ID already exists!");
        return;
      }
      setServices((prev) => [...prev, item]);
      toast.success("Service added");
    } else {
      setServices((prev) => prev.map((s) => (s.id === cleanId ? item : s)));
      toast.success("Service updated");
    }
    setServiceModal({ isOpen: false, mode: "add", data: {} });
  };

  // Links handlers
  const handleToggleLink = (serviceId: string, linkIndex: number) => {
    setServiceLinks((prev) => {
      const copy = { ...prev };
      const list = [...(copy[serviceId] || [])];
      if (list[linkIndex]) {
        list[linkIndex] = { ...list[linkIndex], enabled: !list[linkIndex].enabled };
        copy[serviceId] = list;
      }
      return copy;
    });
  };

  const handleDeleteLink = (serviceId: string, linkIndex: number) => {
    if (confirm("Are you sure you want to delete this link?")) {
      setServiceLinks((prev) => {
        const copy = { ...prev };
        const list = [...(copy[serviceId] || [])];
        list.splice(linkIndex, 1);
        copy[serviceId] = list;
        return copy;
      });
      toast.success("Link deleted");
    }
  };

  const handleSaveLinkModal = () => {
    const { serviceId, mode, index, data } = linkModal;
    if (!serviceId) {
      toast.error("Please select a target service");
      return;
    }
    if (!data.title?.trim() || !data.url?.trim()) {
      toast.error("Link title and URL are required");
      return;
    }
    try {
      new URL(data.url.trim());
    } catch {
      toast.error("Please provide a valid URL starting with http:// or https://");
      return;
    }

    const newLink: GovLink & { id: string; enabled: boolean } = {
      id: `${serviceId}-link-${Date.now()}`,
      title: data.title.trim(),
      titleHi: data.titleHi?.trim() || data.title.trim(),
      desc: data.desc?.trim() || "",
      descHi: data.descHi?.trim() || "",
      url: data.url.trim(),
      category: data.category || "government",
      isGov: data.isGov !== false,
      enabled: data.enabled !== false
    };

    setServiceLinks((prev) => {
      const copy = { ...prev };
      const currentList = [...(copy[serviceId] || [])];
      if (mode === "add") {
        currentList.push(newLink);
      } else if (typeof index === "number" && currentList[index]) {
        currentList[index] = { ...currentList[index], ...newLink };
      }
      copy[serviceId] = currentList;
      return copy;
    });

    toast.success(mode === "add" ? "Link added to service" : "Link updated");
    setLinkModal({ isOpen: false, mode: "add", serviceId: "health-care", data: {} });
  };

  // Utilities handlers
  const handleToggleUtility = (id: string) => {
    setUtilities((prev) =>
      prev.map((u) => (u.id === id ? { ...u, enabled: !u.enabled } : u))
    );
  };

  const handleDeleteUtility = (id: string) => {
    if (confirm("Are you sure you want to remove this utility tool?")) {
      setUtilities((prev) => prev.filter((u) => u.id !== id));
      toast.success("Utility tool removed");
    }
  };

  const handleSaveUtilityModal = () => {
    if (!utilityModal.data.titleEn?.trim() || !utilityModal.data.id?.trim()) {
      toast.error("Utility ID and English title are required");
      return;
    }
    const cleanId = utilityModal.data.id.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-");
    const item: UtilityItem = {
      id: cleanId,
      category: utilityModal.data.category || "tools",
      iconName: utilityModal.data.iconName || "Sparkles",
      titleEn: utilityModal.data.titleEn.trim(),
      titleHi: utilityModal.data.titleHi?.trim() || utilityModal.data.titleEn.trim(),
      descEn: utilityModal.data.descEn?.trim() || "",
      descHi: utilityModal.data.descHi?.trim() || "",
      route: utilityModal.data.route?.trim() || `/${cleanId}`,
      url: utilityModal.data.url?.trim(),
      enabled: utilityModal.data.enabled !== false
    };

    if (utilityModal.mode === "add") {
      if (utilities.some((u) => u.id === cleanId)) {
        toast.error("Utility ID already exists!");
        return;
      }
      setUtilities((prev) => [...prev, item]);
      toast.success("Utility tool added");
    } else {
      setUtilities((prev) => prev.map((u) => (u.id === cleanId ? item : u)));
      toast.success("Utility tool updated");
    }
    setUtilityModal({ isOpen: false, mode: "add", data: {} });
  };

  // Persist all changes to backend CMS
  const handleSaveAllExplore = async () => {
    setIsSaving(true);
    try {
      const hiddenServiceIds = services.filter((s) => !s.enabled).map((s) => s.id);
      const customServices = services.filter(
        (s) => !CORE_SERVICES.some((core) => core.id === s.id)
      );

      // Clean links payload for CMS
      const cleanServiceLinks: Record<string, GovLink[]> = {};
      for (const [sid, list] of Object.entries(serviceLinks)) {
        cleanServiceLinks[sid] = list
          .filter((l) => l.enabled !== false)
          .map((l) => ({
            title: l.title,
            titleHi: l.titleHi,
            desc: l.desc,
            descHi: l.descHi,
            url: l.url,
            category: l.category,
            isGov: l.isGov
          }));
      }

      const updatedCms = {
        ...cmsConfig,
        hiddenServiceIds,
        customServices,
        serviceWebsiteLinks: cleanServiceLinks,
        exploreUtilities: utilities
      };

      await onSaveCms(updatedCms);
      window.dispatchEvent(new Event("samahit-admin-updated"));
      toast.success("Explore Studio published & synchronized live!");
    } catch (err: any) {
      console.error("Save Explore Studio error:", err);
      toast.error(err.message || "Failed to save explore configuration");
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered views
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesCategory = selectedCategory === "all" || s.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.titleEn.toLowerCase().includes(q) ||
        s.titleHi.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, search]);

  const filteredLinksList = useMemo(() => {
    const list: Array<{ serviceId: string; serviceTitle: string; link: GovLink & { id?: string; enabled?: boolean }; index: number }> = [];
    const targetKeys = selectedServiceForLinks === "all" ? Object.keys(serviceLinks) : [selectedServiceForLinks];
    for (const sid of targetKeys) {
      const svc = services.find((s) => s.id === sid);
      const svcTitle = svc ? svc.titleEn : sid;
      const links = serviceLinks[sid] || [];
      links.forEach((link, idx) => {
        const q = search.toLowerCase().trim();
        const matchesSearch =
          !q ||
          link.title.toLowerCase().includes(q) ||
          link.titleHi.toLowerCase().includes(q) ||
          link.url.toLowerCase().includes(q) ||
          svcTitle.toLowerCase().includes(q);
        if (matchesSearch) {
          list.push({ serviceId: sid, serviceTitle: svcTitle, link, index: idx });
        }
      });
    }
    return list;
  }, [serviceLinks, selectedServiceForLinks, services, search]);

  const filteredUtilities = useMemo(() => {
    return utilities.filter((u) => {
      const matchesCategory = selectedCategory === "all" || u.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.titleEn.toLowerCase().includes(q) ||
        u.titleHi.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [utilities, selectedCategory, search]);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-50 border border-orange-200 text-[#C2410C]">
              <Compass className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-[#0A192F]">Explore Studio</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-green-100 text-[#166534] border border-green-200">
              Live CMS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete management for Core Services, External Portals / Links, and Built-in Local App Utilities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAllExplore}
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Publish Explore Changes</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => {
            setSubTab("services");
            setSearch("");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === "services"
              ? "bg-[#0A192F] text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Layers className="w-4 h-4 text-orange-400" />
          <span>Primary Services ({services.length})</span>
        </button>

        <button
          onClick={() => {
            setSubTab("links");
            setSearch("");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === "links"
              ? "bg-[#0A192F] text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Globe2 className="w-4 h-4 text-green-400" />
          <span>Govt & Welfare Links ({filteredLinksList.length})</span>
        </button>

        <button
          onClick={() => {
            setSubTab("utilities");
            setSearch("");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === "utilities"
              ? "bg-[#0A192F] text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Wrench className="w-4 h-4 text-amber-500" />
          <span>Local Utilities & Tools ({utilities.length})</span>
        </button>
      </div>

      {/* Control Bar: Search & Filters */}
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
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {subTab === "services" && (
            <>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#0A192F] font-medium outline-none"
              >
                <option value="all">All Categories</option>
                <option value="welfare">Welfare</option>
                <option value="urgent">Urgent</option>
                <option value="civic">Civic</option>
                <option value="empowerment">Empowerment</option>
                <option value="involved">Involved</option>
              </select>
              <button
                onClick={() =>
                  setServiceModal({
                    isOpen: true,
                    mode: "add",
                    data: { category: "welfare", iconName: "ShieldCheck", enabled: true }
                  })
                }
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#166534] hover:bg-green-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Service</span>
              </button>
            </>
          )}

          {subTab === "links" && (
            <>
              <select
                value={selectedServiceForLinks}
                onChange={(e) => setSelectedServiceForLinks(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#0A192F] font-medium outline-none max-w-[200px]"
              >
                <option value="all">All Parent Services</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.titleEn}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  setLinkModal({
                    isOpen: true,
                    mode: "add",
                    serviceId: selectedServiceForLinks !== "all" ? selectedServiceForLinks : "health-care",
                    data: { isGov: true, enabled: true }
                  })
                }
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#166534] hover:bg-green-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Gov Link</span>
              </button>
            </>
          )}

          {subTab === "utilities" && (
            <>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#0A192F] font-medium outline-none"
              >
                <option value="all">All Categories</option>
                <option value="tools">Tools & Utilities</option>
                <option value="community">Community</option>
                <option value="health">Health Tools</option>
                <option value="education">Education</option>
                <option value="culture">Culture & Radio</option>
              </select>
              <button
                onClick={() =>
                  setUtilityModal({
                    isOpen: true,
                    mode: "add",
                    data: { category: "tools", iconName: "Sparkles", enabled: true }
                  })
                }
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#166534] hover:bg-green-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Utility</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. PRIMARY SERVICES TAB CONTENT                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === "services" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((svc) => {
            const IconComp = (LucideIcons as any)[svc.iconName] || ShieldCheck;
            return (
              <div
                key={svc.id}
                className={`p-4 rounded-2xl border transition-all ${
                  svc.enabled
                    ? "bg-white border-slate-200 shadow-sm"
                    : "bg-slate-50/70 border-slate-200 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`p-2.5 rounded-xl border ${
                        svc.enabled
                          ? "bg-orange-50 border-orange-200 text-[#C2410C]"
                          : "bg-slate-100 border-slate-300 text-slate-400"
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-[#0A192F]">{svc.titleEn}</h4>
                      <p className="text-xs font-medium text-[#166534]">{svc.titleHi}</p>
                    </div>
                  </div>

                  {/* Enable / Disable toggle button */}
                  <button
                    onClick={() => handleToggleService(svc.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                      svc.enabled
                        ? "bg-green-50 text-[#166534] border-green-200 hover:bg-green-100"
                        : "bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {svc.enabled ? "Active" : "Disabled"}
                  </button>
                </div>

                <div className="mt-3 text-xs text-slate-600 line-clamp-2 min-h-[32px]">
                  {svc.descEn || svc.descHi || "No description provided."}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    ID: {svc.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        setServiceModal({
                          isOpen: true,
                          mode: "edit",
                          data: svc
                        })
                      }
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#0A192F] hover:bg-slate-100 transition"
                      title="Edit Service"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(svc.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition"
                      title="Delete Service"
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
      {/* 2. GOVT & WELFARE LINKS TAB CONTENT                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === "links" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Showing {filteredLinksList.length} Portal & Government Deep Links
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredLinksList.map(({ serviceId, serviceTitle, link, index }) => (
              <div
                key={`${serviceId}-${index}`}
                className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50 transition ${
                  link.enabled === false ? "opacity-60 bg-slate-50/60" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-[#1E3A8A] border border-blue-200">
                      {serviceTitle}
                    </span>
                    {link.isGov ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-[#C2410C] border border-amber-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Official Gov Portal
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-600 border border-slate-200">
                        Citizen Resource
                      </span>
                    )}
                    <h4 className="text-xs font-bold text-[#0A192F]">{link.title}</h4>
                    {link.titleHi && (
                      <span className="text-xs font-semibold text-[#166534]">({link.titleHi})</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-1">{link.desc || link.descHi}</p>

                  <div className="flex items-center gap-2 mt-1.5">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-mono text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>{link.url}</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleToggleLink(serviceId, index)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                      link.enabled !== false
                        ? "bg-green-50 text-[#166534] border-green-200 hover:bg-green-100"
                        : "bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {link.enabled !== false ? "Active" : "Disabled"}
                  </button>

                  <button
                    onClick={() =>
                      setLinkModal({
                        isOpen: true,
                        mode: "edit",
                        serviceId,
                        index,
                        data: link
                      })
                    }
                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#0A192F] hover:bg-slate-100 transition"
                    title="Edit Link"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteLink(serviceId, index)}
                    className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition"
                    title="Delete Link"
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
      {/* 3. LOCAL APP UTILITIES TAB CONTENT                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === "utilities" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUtilities.map((util) => {
            const IconComp = (LucideIcons as any)[util.iconName] || Sparkles;
            return (
              <div
                key={util.id}
                className={`p-4 rounded-2xl border transition-all ${
                  util.enabled
                    ? "bg-white border-slate-200 shadow-sm"
                    : "bg-slate-50/70 border-slate-200 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`p-2.5 rounded-xl border ${
                        util.enabled
                          ? "bg-green-50 border-green-200 text-[#166534]"
                          : "bg-slate-100 border-slate-300 text-slate-400"
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-[#0A192F]">{util.titleEn}</h4>
                      <p className="text-xs font-medium text-[#166534]">{util.titleHi}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleUtility(util.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                      util.enabled
                        ? "bg-green-50 text-[#166534] border-green-200 hover:bg-green-100"
                        : "bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {util.enabled ? "Active" : "Disabled"}
                  </button>
                </div>

                <p className="mt-3 text-xs text-slate-600 line-clamp-2 min-h-[32px]">
                  {util.descEn || util.descHi}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    Route: {util.route || util.url || "Local"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        setUtilityModal({
                          isOpen: true,
                          mode: "edit",
                          data: util
                        })
                      }
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#0A192F] hover:bg-slate-100 transition"
                      title="Edit Utility"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUtility(util.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition"
                      title="Delete Utility"
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
      {/* MODAL 1: ADD / EDIT PRIMARY SERVICE                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      {serviceModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#0A192F]">
                {serviceModal.mode === "add" ? "Add New Primary Service" : "Edit Service"}
              </h3>
              <button
                onClick={() => setServiceModal({ isOpen: false, mode: "add", data: {} })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Service Unique ID (Slug)</label>
                <input
                  type="text"
                  disabled={serviceModal.mode === "edit"}
                  value={serviceModal.data.id || ""}
                  onChange={(e) =>
                    setServiceModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, id: e.target.value }
                    }))
                  }
                  placeholder="e.g. farmer-aid, health-camp"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 disabled:bg-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Title (English)</label>
                  <input
                    type="text"
                    value={serviceModal.data.titleEn || ""}
                    onChange={(e) =>
                      setServiceModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, titleEn: e.target.value }
                      }))
                    }
                    placeholder="e.g. Healthcare Assistance"
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Title (Hindi)</label>
                  <input
                    type="text"
                    value={serviceModal.data.titleHi || ""}
                    onChange={(e) =>
                      setServiceModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, titleHi: e.target.value }
                      }))
                    }
                    placeholder="e.g. स्वास्थ्य सहायता"
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={serviceModal.data.category || "welfare"}
                    onChange={(e) =>
                      setServiceModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, category: e.target.value }
                      }))
                    }
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="welfare">Welfare</option>
                    <option value="urgent">Urgent</option>
                    <option value="civic">Civic</option>
                    <option value="empowerment">Empowerment</option>
                    <option value="involved">Involved</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Lucide Icon Name</label>
                  <input
                    type="text"
                    value={serviceModal.data.iconName || ""}
                    onChange={(e) =>
                      setServiceModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, iconName: e.target.value }
                      }))
                    }
                    placeholder="HeartPulse, ShieldCheck, etc."
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Description (English)</label>
                <textarea
                  rows={2}
                  value={serviceModal.data.descEn || ""}
                  onChange={(e) =>
                    setServiceModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, descEn: e.target.value }
                    }))
                  }
                  placeholder="Short summary of welfare service..."
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Description (Hindi)</label>
                <textarea
                  rows={2}
                  value={serviceModal.data.descHi || ""}
                  onChange={(e) =>
                    setServiceModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, descHi: e.target.value }
                    }))
                  }
                  placeholder="कल्याणकारी सेवा का संक्षिप्त विवरण..."
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Custom Route (Optional)</label>
                  <input
                    type="text"
                    value={serviceModal.data.route || ""}
                    onChange={(e) =>
                      setServiceModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, route: e.target.value }
                      }))
                    }
                    placeholder="e.g. /services/custom"
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">External URL (Optional)</label>
                  <input
                    type="text"
                    value={serviceModal.data.url || ""}
                    onChange={(e) =>
                      setServiceModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, url: e.target.value }
                      }))
                    }
                    placeholder="https://..."
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setServiceModal({ isOpen: false, mode: "add", data: {} })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveServiceModal}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#166534] text-white hover:bg-green-800 shadow"
              >
                {serviceModal.mode === "add" ? "Add Service" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 2: ADD / EDIT SERVICE GOVERNMENT LINK                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {linkModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#0A192F]">
                {linkModal.mode === "add" ? "Add Government Portal Link" : "Edit Portal Link"}
              </h3>
              <button
                onClick={() => setLinkModal({ isOpen: false, mode: "add", serviceId: "health-care", data: {} })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Target Parent Service</label>
                <select
                  disabled={linkModal.mode === "edit"}
                  value={linkModal.serviceId}
                  onChange={(e) =>
                    setLinkModal((prev) => ({
                      ...prev,
                      serviceId: e.target.value
                    }))
                  }
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.titleEn} ({s.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Portal Title (English)</label>
                  <input
                    type="text"
                    value={linkModal.data.title || ""}
                    onChange={(e) =>
                      setLinkModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, title: e.target.value }
                      }))
                    }
                    placeholder="e.g. Ayushman Bharat PM-JAY"
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Portal Title (Hindi)</label>
                  <input
                    type="text"
                    value={linkModal.data.titleHi || ""}
                    onChange={(e) =>
                      setLinkModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, titleHi: e.target.value }
                      }))
                    }
                    placeholder="e.g. आयुष्मान भारत पोर्टल"
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Portal Destination URL</label>
                <input
                  type="url"
                  value={linkModal.data.url || ""}
                  onChange={(e) =>
                    setLinkModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, url: e.target.value }
                    }))
                  }
                  placeholder="https://pmjay.gov.in/"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Description (English)</label>
                <textarea
                  rows={2}
                  value={linkModal.data.desc || ""}
                  onChange={(e) =>
                    setLinkModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, desc: e.target.value }
                    }))
                  }
                  placeholder="Official government health insurance access..."
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Description (Hindi)</label>
                <textarea
                  rows={2}
                  value={linkModal.data.descHi || ""}
                  onChange={(e) =>
                    setLinkModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, descHi: e.target.value }
                    }))
                  }
                  placeholder="आधिकारिक सरकारी स्वास्थ्य योजना..."
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={linkModal.data.isGov !== false}
                    onChange={(e) =>
                      setLinkModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, isGov: e.target.checked }
                      }))
                    }
                    className="rounded text-green-700 focus:ring-green-700"
                  />
                  <span>Official Government Authority Portal</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setLinkModal({ isOpen: false, mode: "add", serviceId: "health-care", data: {} })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLinkModal}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#166534] text-white hover:bg-green-800 shadow"
              >
                {linkModal.mode === "add" ? "Add Link" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 3: ADD / EDIT LOCAL UTILITY                             */}
      {/* ───────────────────────────────────────────────────────────── */}
      {utilityModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#0A192F]">
                {utilityModal.mode === "add" ? "Add Local App Utility" : "Edit Local Utility"}
              </h3>
              <button
                onClick={() => setUtilityModal({ isOpen: false, mode: "add", data: {} })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Utility Slug ID</label>
                <input
                  type="text"
                  disabled={utilityModal.mode === "edit"}
                  value={utilityModal.data.id || ""}
                  onChange={(e) =>
                    setUtilityModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, id: e.target.value }
                    }))
                  }
                  placeholder="e.g. gst-calculator, epaper"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 disabled:bg-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Title (English)</label>
                  <input
                    type="text"
                    value={utilityModal.data.titleEn || ""}
                    onChange={(e) =>
                      setUtilityModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, titleEn: e.target.value }
                      }))
                    }
                    placeholder="e.g. Daily Utility Center"
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Title (Hindi)</label>
                  <input
                    type="text"
                    value={utilityModal.data.titleHi || ""}
                    onChange={(e) =>
                      setUtilityModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, titleHi: e.target.value }
                      }))
                    }
                    placeholder="e.g. दैनिक उपयोगिता केंद्र"
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={utilityModal.data.category || "tools"}
                    onChange={(e) =>
                      setUtilityModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, category: e.target.value }
                      }))
                    }
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="tools">Tools & Utilities</option>
                    <option value="community">Community</option>
                    <option value="health">Health Tools</option>
                    <option value="education">Education</option>
                    <option value="culture">Culture & Radio</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Lucide Icon Name</label>
                  <input
                    type="text"
                    value={utilityModal.data.iconName || ""}
                    onChange={(e) =>
                      setUtilityModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, iconName: e.target.value }
                      }))
                    }
                    placeholder="Sparkles, Camera, Timer, etc."
                    className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">App Internal Route</label>
                <input
                  type="text"
                  value={utilityModal.data.route || ""}
                  onChange={(e) =>
                    setUtilityModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, route: e.target.value }
                    }))
                  }
                  placeholder="/epaper or /utility-center"
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Description (English)</label>
                <textarea
                  rows={2}
                  value={utilityModal.data.descEn || ""}
                  onChange={(e) =>
                    setUtilityModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, descEn: e.target.value }
                    }))
                  }
                  placeholder="Utility functionality summary..."
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Description (Hindi)</label>
                <textarea
                  rows={2}
                  value={utilityModal.data.descHi || ""}
                  onChange={(e) =>
                    setUtilityModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, descHi: e.target.value }
                    }))
                  }
                  placeholder="उपयोगिता उपकरण का विवरण..."
                  className="mt-1 w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setUtilityModal({ isOpen: false, mode: "add", data: {} })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUtilityModal}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#166534] text-white hover:bg-green-800 shadow"
              >
                {utilityModal.mode === "add" ? "Add Utility" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
