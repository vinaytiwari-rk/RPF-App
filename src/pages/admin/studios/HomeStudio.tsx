import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  CloudSun,
  Coins,
  Quote,
  Megaphone,
  Images,
  Eye,
  EyeOff,
  Compass,
  Activity,
  Palette,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Upload,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Fuel,
  Carrot,
  Wheat,
  Sun,
  Layers,
  Sparkles,
  Link2,
  CheckCircle2,
  Radio,
  Sliders,
  Type,
  Pencil,
  Award
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import IconPickerModal, { AVAILABLE_ICONS } from "../../../components/admin/IconPickerModal";

type ControlTab =
  | "weather"
  | "market_panchang"
  | "thought"
  | "marquee"
  | "carousel"
  | "vision"
  | "quick_access"
  | "impact"
  | "theme_layout";

interface CarouselSlideItem {
  id?: string;
  titleEn: string;
  titleHi?: string;
  subEn: string;
  subHi?: string;
  image: string;
  order?: number;
  active?: boolean;
}

interface QuickAccessItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  active: boolean;
  accentColor?: string;
}

interface ImpactMetricItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  active: boolean;
  route?: string;
}

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

export default function HomeStudio() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<ControlTab>("weather");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Icon Picker State
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [currentIconTarget, setCurrentIconTarget] = useState<{
    type: "quick_access" | "impact_metric" | "impact_stat" | "impact_domain";
    id: string;
    currentIcon: string;
  } | null>(null);

  // Editing state for Impact Domain Modal
  const [editingDomain, setEditingDomain] = useState<ImpactDomainItem | null>(null);

  // Complete CMS State
  const [cms, setCms] = useState<Record<string, any>>({});

  // 1. Weather Controls
  const [weatherConfig, setWeatherConfig] = useState({
    enabled: true,
    defaultCity: "Bhopal",
    apiProvider: "open-meteo", // open-meteo or weatherapi
    customApiKey: "",
    refreshIntervalMinutes: 15
  });

  // 2. Market & Panchang Controls
  const [marketConfig, setMarketConfig] = useState({
    enabled: true,
    panchangEnabled: true,
    goldSilverEnabled: true,
    fuelEnabled: true,
    mandiEnabled: true,
    vegetableEnabled: true,
    mandiRssFeedUrl: "https://agmarknet.gov.in/mandi-rss",
    fuelApiUrl: "https://api.rpfoundation.org/fuel-rates",
    autoDetectCity: true
  });

  // 3. Thought of the Day Controls
  const [thoughtConfig, setThoughtConfig] = useState({
    enabled: true,
    feedMode: "manual", // manual | api | rss
    apiUrl: "https://zenquotes.io/api/today",
    activeQuote: "उठो, जागो और तब तक मत रुको जब तक लक्ष्य की प्राप्ति न हो जाए।",
    author: "स्वामी विवेकानंद"
  });

  // 4. Marquee Controls
  const [marqueeConfig, setMarqueeConfig] = useState({
    enabled: true,
    ticker1Enabled: true,
    ticker1Label: "PIB News",
    ticker1FeedUrl: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=2",
    ticker2Enabled: true,
    ticker2Label: "MPInfo",
    ticker2FeedUrl: "https://mpinfo.org/Home/NewsFeedRSS",
    customAlertText: "Latest verified foundation initiatives and emergency advisories."
  });

  // 5. Carousel Slides
  const [slides, setSlides] = useState<CarouselSlideItem[]>([]);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);

  // 6. Vision & Leadership Controls
  const [visionConfig, setVisionConfig] = useState({
    heading: "Our Vision & Leadership",
    subHeading: "Empowering Communities Through Direct Ground Action",
    narrative: "RP Foundation is built on an interconnected model of social development—uniting accessible healthcare, sustainable employment, women’s self-reliance, and direct grievance resolution.",
    iconName: "RP_LOGO",
    targetRoute: "/vision-goals",
    active: true,
    founderName: "Rohit Pandit",
    founderDesignation: "Founder & Social Worker",
    founderMessage: "True service begins when we reach out to those in need with humility, resolve, and unyielding commitment."
  });

  // 7. Quick Access Grid
  const [quickAccessItems, setQuickAccessItems] = useState<QuickAccessItem[]>([]);

  // 8. Field Impact (Counters & Domains)
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetricItem[]>([]);
  const [impactStats, setImpactStats] = useState<ImpactStatItem[]>([]);
  const [impactDomains, setImpactDomains] = useState<ImpactDomainItem[]>([]);

  // 9. Theme & Layout Template Samples
  const [themeConfig, setThemeConfig] = useState({
    templatePreset: "classic_saffron", // classic_saffron | royal_navy | forest_emerald | minimal_white
    primaryColor: "#D97706",
    secondaryColor: "#167C5A",
    backgroundColor: "#FFF9EF",
    fontFamily: "Inter, sans-serif",
    borderRadius: "rounded-2xl",
    heroCardStyle: "glassmorphism"
  });

  const authHeader = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  // Load existing configuration from /api/cms
  const loadCmsData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/cms");
      const d = res.data?.cms || res.data?.data || {};
      setCms(d);

      // Weather
      if (d.weatherConfig) setWeatherConfig(prev => ({ ...prev, ...d.weatherConfig }));

      // Market & Panchang
      if (d.marketConfig) setMarketConfig(prev => ({ ...prev, ...d.marketConfig }));

      // Thought of the Day
      if (d.thoughtConfig) {
        setThoughtConfig(prev => ({ ...prev, ...d.thoughtConfig }));
      } else if (d.quoteOfTheDay || d.quoteOfTheDayHi || d.quoteOfTheDayEn) {
        setThoughtConfig(prev => ({
          ...prev,
          activeQuote: d.quoteOfTheDay || d.quoteOfTheDayHi || d.quoteOfTheDayEn,
          author: d.quoteAuthor || "Daily Thought"
        }));
      }

      // Marquees
      if (d.marqueeConfig) {
        setMarqueeConfig(prev => ({ ...prev, ...d.marqueeConfig }));
      } else if (d.helplinesMarquee || d.alertBanner || d.alertBannerHi) {
        setMarqueeConfig(prev => ({
          ...prev,
          customAlertText: d.alertBanner || d.alertBannerHi || d.alertBannerEn || prev.customAlertText
        }));
      }

      // Carousel Slides
      if (Array.isArray(d.carouselSlides) && d.carouselSlides.length) {
        setSlides(d.carouselSlides);
      } else {
        setSlides([
          {
            titleEn: "Together, We Build a Better Tomorrow",
            subEn: "Empowering lives. Strengthening communities.",
            image: "/assets/mega_camp_banner.png",
            active: true
          },
          {
            titleEn: "Building a Better Tomorrow for Every Citizen",
            subEn: "We create healthier, stronger, and empowered communities.",
            image: "/assets/water_pump_camp.png",
            active: true
          }
        ]);
      }

      // Vision & Leadership
      if (d.visionConfig) {
        setVisionConfig(prev => ({ ...prev, ...d.visionConfig }));
      } else {
        setVisionConfig(prev => ({
          ...prev,
          founderName: d.founderName || prev.founderName,
          founderDesignation: d.founderDesignation || prev.founderDesignation,
          founderMessage: d.founderMessage || d.founderMessageHi || d.founderMessageEn || prev.founderMessage
        }));
      }

      // Quick Access
      if (Array.isArray(d.quickAccessItems) && d.quickAccessItems.length) {
        setQuickAccessItems(d.quickAccessItems);
      } else {
        setQuickAccessItems([
          { id: "qa-1", title: "Jan Seva Card", subtitle: "Your digital service identity & welfare benefit card", icon: "BadgePlus", route: "/jan-seva-card", active: true, accentColor: "#D97706" },
          { id: "qa-2", title: "Healthcare", subtitle: "Free health camps, medical support & emergency assistance", icon: "HeartPulse", route: "/health-care", active: true, accentColor: "#DC2626" },
          { id: "qa-3", title: "Employment", subtitle: "Job opportunities, skill training & career support", icon: "BriefcaseBusiness", route: "/employment", active: true, accentColor: "#167C5A" },
          { id: "qa-4", title: "Grievance", subtitle: "Submit public issues, track resolution & support status", icon: "ClipboardList", route: "/grievance", active: true, accentColor: "#14213D" },
          { id: "qa-5", title: "Samahit Utilities", subtitle: "Everyday tools, fasting tracker, breathing & digital utilities", icon: "Wrench", route: "/utilities", active: true, accentColor: "#0A192F" },
          { id: "qa-6", title: "Smart Calculators", subtitle: "GST, split bill, BMI, loan EMI & all-in-one calculators", icon: "Calculator", route: "/utilities/calculators", active: true, accentColor: "#C2410C" }
        ]);
      }

      // Field Impact
      if (Array.isArray(d.impactMetrics) && d.impactMetrics.length) {
        setImpactMetrics(d.impactMetrics);
      } else {
        setImpactMetrics([
          { id: "imp-1", title: "Community", subtitle: "Welfare & Culture", icon: "UsersRound", active: true, route: "/community-care-active" },
          { id: "imp-2", title: "Care", subtitle: "Health & Relief", icon: "Stethoscope", active: true, route: "/community-care-active" },
          { id: "imp-3", title: "Active", subtitle: "Field Initiatives", icon: "CalendarDays", active: true, route: "/community-care-active" }
        ]);
      }

      // 4 Master Counters & 8 Seva Domains
      if (Array.isArray(d.impactStats) && d.impactStats.length) {
        setImpactStats(d.impactStats);
      } else {
        setImpactStats([
          { id: "cards_issued", labelEn: "Jan Seva Cards", labelHi: "जन सेवा कार्ड जारी", value: 66505, suffix: "+", iconName: "Award", enabled: true },
          { id: "health_camps", labelEn: "Health & Eye Camps", labelHi: "स्वास्थ्य एवं नेत्र शिविर", value: 150, suffix: "+", iconName: "Stethoscope", enabled: true },
          { id: "volunteers", labelEn: "Volunteers Network", labelHi: "सक्रिय स्वयंसेवक", value: 2400, suffix: "+", iconName: "Users", enabled: true },
          { id: "jobs_empowered", labelEn: "Jobs & Livelihood", labelHi: "रोजगार व आजीविका", value: 1800, suffix: "+", iconName: "Briefcase", enabled: true }
        ]);
      }

      if (Array.isArray(d.impactDomains) && d.impactDomains.length) {
        setImpactDomains(d.impactDomains);
      } else {
        setImpactDomains([
          {
            id: "sanitation",
            tab: "active",
            titleEn: "Sanitation & Clean Environment Drive",
            titleHi: "स्वच्छता अभियान व प्रसाधन केंद्र",
            descEn: "Mass cleanliness drives, plastic-free campaigns, and public sanitation facilities.",
            descHi: "ग्रामीण व शहरी बस्तियों में वृहद स्वच्छता अभियान एवं प्रसाधन केंद्र।",
            iconName: "Trash2",
            badgeEn: "Clean Environment",
            badgeHi: "पर्यावरण व स्वच्छता",
            color: "emerald",
            enabled: true
          },
          {
            id: "water",
            tab: "care",
            titleEn: "Clean Drinking Water Supply",
            titleHi: "शुद्ध पेयजल व जल संरक्षण",
            descEn: "Installing handpumps, clean RO water systems, and deploying water tankers.",
            descHi: "जल संकटग्रस्त क्षेत्रों में हैंडपंप स्थापना, शुद्ध आरओ प्लांट व टैंकर आपूर्ति।",
            iconName: "Droplets",
            badgeEn: "Water Relief",
            badgeHi: "पेयजल आपूर्ति",
            color: "sky",
            enabled: true
          },
          {
            id: "jobs",
            tab: "active",
            titleEn: "Jobs for Unemployed Youth & Women",
            titleHi: "रोजगार मेला व महिला आजीविका",
            descEn: "Mega Rojgar Melas, direct company hiring drives, and micro-entrepreneurship.",
            descHi: "बेरोजगार युवाओं के लिए रोजगार मेले, सीधी भर्ती ड्राइव व स्वरोजगार।",
            iconName: "Briefcase",
            badgeEn: "Livelihood",
            badgeHi: "रोजगार अवसर",
            color: "amber",
            enabled: true
          },
          {
            id: "pink-erickshaw",
            tab: "active",
            titleEn: "Pink E-Rickshaw Empowerment",
            titleHi: "पिंक ई-रिक्शा योजना (महिला स्वावलंबन)",
            descEn: "Providing subsidized eco-friendly e-rickshaws to women for financial independence.",
            descHi: "महिलाओं को ई-रिक्शा स्वामित्व प्रदान कर आर्थिक स्वतंत्रता व सुरक्षित परिवहन।",
            iconName: "Heart",
            badgeEn: "Women Power",
            badgeHi: "महिला स्वावलंबन",
            color: "rose",
            enabled: true
          },
          {
            id: "skills",
            tab: "active",
            titleEn: "Skills Training & Vocational Courses",
            titleHi: "कौशल विकास व वोकेशनल ट्रेनिंग",
            descEn: "Free tailoring units, computer literacy centers, and electrician workshops.",
            descHi: "निःशुल्क सिलाई-कढ़ाई केंद्र, कंप्यूटर साक्षरता, मोबाइल रिपेयरिंग कोर्स।",
            iconName: "Wrench",
            badgeEn: "Skill Development",
            badgeHi: "कौशल विकास",
            color: "purple",
            enabled: true
          },
          {
            id: "health",
            tab: "care",
            titleEn: "Free Health Services & Emergency Care",
            titleHi: "निःशुल्क स्वास्थ्य सेवा व चिकित्सा शिविर",
            descEn: "Conducting Mega Health Camps, free medicine distribution, and ambulance aid.",
            descHi: "निःशुल्क स्वास्थ्य जांच शिविर, दवा वितरण, इमरजेंसी ब्लड डोनेशन नेटवर्क।",
            iconName: "Stethoscope",
            badgeEn: "Healthcare",
            badgeHi: "निःशुल्क चिकित्सा",
            color: "red",
            enabled: true
          },
          {
            id: "welfare",
            tab: "care",
            titleEn: "Helping Poor & Downtrodden People",
            titleHi: "निराश्रित व वंचित वर्ग कल्याण",
            descEn: "Distributing ration kits, winter blankets, and disaster emergency relief.",
            descHi: "जरूरतमंद परिवारों को राशन किट, शीतकालीन कंबल, आपदा राहत सामग्रियां।",
            iconName: "HandHeart",
            badgeEn: "Welfare Relief",
            badgeHi: "जन सेवा सहायता",
            color: "emerald",
            enabled: true
          },
          {
            id: "education",
            tab: "community",
            titleEn: "Education Services & Youth Mentorship",
            titleHi: "निःशुल्क शिक्षा व बाल कल्याण",
            descEn: "Providing free books, stationery, evening tuition classes for children.",
            descHi: "वंचित बच्चों हेतु निःशुल्क पाठ्य सामग्री, शाम की कोचिंग कक्षाएं।",
            iconName: "GraduationCap",
            badgeEn: "Youth Education",
            badgeHi: "बाल शिक्षा सपोर्ट",
            color: "indigo",
            enabled: true
          }
        ]);
      }

      // Theme
      if (d.themeConfig) setThemeConfig(prev => ({ ...prev, ...d.themeConfig }));
    } catch {
      toast.error("Failed to load Home configuration");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCmsData();
  }, [loadCmsData]);

  // Direct Image Upload Handler
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const toastId = toast.loading("Uploading image directly from device...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("image", file);

      const res = await axios.post("/api/upload/image", formData, {
        headers: {
          ...authHeader(),
          "Content-Type": "multipart/form-data"
        }
      });

      if (res.data?.url) {
        callback(res.data.url);
        toast.success("Image uploaded successfully!", { id: toastId });
      } else {
        throw new Error(res.data?.error || "Upload failed");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to upload image", { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

  // Save All Changes to Live Application via /api/admin/control/cms/publish
  const handleSaveAll = async () => {
    if (!token) {
      toast.error("Admin session expired. Please sign in.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Publishing all Home Supreme updates live...");
    try {
      const patch = {
        weatherConfig,
        marketConfig,
        thoughtConfig,
        quoteOfTheDay: thoughtConfig.activeQuote,
        quoteOfTheDayHi: thoughtConfig.activeQuote,
        quoteOfTheDayEn: thoughtConfig.activeQuote,
        quoteAuthor: thoughtConfig.author,
        marqueeConfig,
        alertBanner: marqueeConfig.customAlertText,
        alertBannerHi: marqueeConfig.customAlertText,
        alertBannerEn: marqueeConfig.customAlertText,
        carouselSlides: slides,
        visionConfig,
        founderName: visionConfig.founderName,
        founderDesignation: visionConfig.founderDesignation,
        founderMessage: visionConfig.founderMessage,
        founderMessageHi: visionConfig.founderMessage,
        founderMessageEn: visionConfig.founderMessage,
        quickAccessItems,
        impactMetrics,
        impactStats,
        impactDomains,
        themeConfig      };

      const res = await axios.post(
        "/api/admin/control/cms/publish",
        { patch, label: `HomeStudio: update ${activeTab}` },
        { headers: authHeader() }
      );

      if (res.data?.success === false) throw new Error(res.data?.error || "Publish failed");
      toast.success("Home controls published safely to live apps!", { id: toastId });
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to publish", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 space-y-6">
      {/* HEADER MATCHING LEGACY CMS */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-amber-50 text-amber-600">
            <Sliders className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-800">
                Supreme Command
              </span>
              <span className="text-xs text-slate-400">Home Screen Control Engine</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 mt-1">Home Studio & Master Layout</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Full control access for Weather, Market, Panchang, Marquees, Carousel, Vision, Quick Access, Impact & Style.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => void loadCmsData()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-6 py-2 text-xs font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition shadow-xs disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {saving ? "Publishing..." : "Save & Publish Live"}
          </button>
        </div>
      </div>

      {/* 9 MAIN CONTROL TABS */}
      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        {[
          { id: "weather", label: "1. Weather", icon: CloudSun },
          { id: "market_panchang", label: "2. Live Market & Panchang", icon: Coins },
          { id: "thought", label: "3. Thought of the Day", icon: Quote },
          { id: "marquee", label: "4. Marquee News", icon: Megaphone },
          { id: "carousel", label: "5. Carousel Banner", icon: Images },
          { id: "vision", label: "6. Vision & Leadership", icon: Compass },
          { id: "quick_access", label: "7. Quick Access", icon: Layers },
          { id: "impact", label: "8. Field Impact", icon: Activity },
          { id: "theme_layout", label: "9. Layout & Templates", icon: Palette }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ControlTab)}
              className={`flex-1 min-w-[130px] text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
                isActive ? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-amber-600" : "text-slate-400"}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ACTIVE TAB CONTROL SURFACES */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[500px]">
        {/* 1. WEATHER CONTROLS */}
        {activeTab === "weather" && (
          <div className="space-y-6 animate-fade-in max-w-4xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">Weather Module Configuration</h3>
                <p className="text-xs text-slate-500 mt-0.5">Toggle live temperature badge, configure providers, or link custom RSS/API feeds.</p>
              </div>
              <button
                onClick={() => setWeatherConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  weatherConfig.enabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                }`}
              >
                {weatherConfig.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {weatherConfig.enabled ? "Weather Badge Active" : "Disabled / Hidden"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Default City</label>
                <input
                  type="text"
                  value={weatherConfig.defaultCity}
                  onChange={e => setWeatherConfig({ ...weatherConfig, defaultCity: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Weather Provider / API Engine</label>
                <select
                  value={weatherConfig.apiProvider}
                  onChange={e => setWeatherConfig({ ...weatherConfig, apiProvider: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800"
                >
                  <option value="open-meteo">Open-Meteo (Real-Time Meteorological Benchmark - Free)</option>
                  <option value="weatherapi">WeatherAPI (Backup Key Protocol)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Custom API Key (Optional)</label>
                <input
                  type="text"
                  placeholder="Paste WeatherAPI / OpenWeather Token here..."
                  value={weatherConfig.customApiKey}
                  onChange={e => setWeatherConfig({ ...weatherConfig, customApiKey: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. LIVE MARKET & PANCHANG CONTROLS */}
        {activeTab === "market_panchang" && (
          <div className="space-y-6 animate-fade-in max-w-4xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">Live Verified Market & Panchang Engine</h3>
                <p className="text-xs text-slate-500 mt-0.5">Control Panchang, Gold/Silver, Vegetable, Fuel, and Mandi rates.</p>
              </div>
              <button
                onClick={() => setMarketConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  marketConfig.enabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                }`}
              >
                {marketConfig.enabled ? "Master Section Active" : "Master Section Hidden"}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: "panchangEnabled", label: "Drik Panchang & Tithi", icon: Sun },
                { key: "goldSilverEnabled", label: "Gold & Silver Rates", icon: Coins },
                { key: "vegetableEnabled", label: "Vegetable Mandi Prices", icon: Carrot },
                { key: "fuelEnabled", label: "Petrol & Diesel Fuel Rates", icon: Fuel },
                { key: "mandiEnabled", label: "Crops & Pulse Mandi Rates", icon: Wheat }
              ].map(sub => {
                const isSubActive = (marketConfig as any)[sub.key];
                const Icon = sub.icon;
                return (
                  <button
                    key={sub.key}
                    onClick={() => setMarketConfig(prev => ({ ...prev, [sub.key]: !isSubActive }))}
                    className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSubActive ? "border-amber-500 bg-amber-50/30 text-amber-900 shadow-2xs" : "border-slate-200 bg-slate-50 text-slate-400"
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-2" />
                    <div>
                      <p className="text-xs font-bold">{sub.label}</p>
                      <p className="text-[10px] mt-0.5 font-bold uppercase">{isSubActive ? "Active" : "Disabled"}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mandi Price Agmarknet RSS Feed / Scraper URL</label>
                <input
                  type="text"
                  value={marketConfig.mandiRssFeedUrl}
                  onChange={e => setMarketConfig({ ...marketConfig, mandiRssFeedUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fuel Price API Feed URL</label>
                <input
                  type="text"
                  value={marketConfig.fuelApiUrl}
                  onChange={e => setMarketConfig({ ...marketConfig, fuelApiUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. THOUGHT OF THE DAY CONTROLS */}
        {activeTab === "thought" && (
          <div className="space-y-6 animate-fade-in max-w-4xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">Thought of the Day</h3>
                <p className="text-xs text-slate-500 mt-0.5">Toggle section on/off or configure automated RSS quote feeds.</p>
              </div>
              <button
                onClick={() => setThoughtConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  thoughtConfig.enabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                }`}
              >
                {thoughtConfig.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {thoughtConfig.enabled ? "Section Active" : "Section Hidden"}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quote Text (Single Unified)</label>
                <textarea
                  rows={4}
                  value={thoughtConfig.activeQuote}
                  onChange={e => setThoughtConfig({ ...thoughtConfig, activeQuote: e.target.value })}
                  className="w-full bg-amber-50/50 border border-amber-200 rounded-xl p-3 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Author / Thinker Name</label>
                <input
                  type="text"
                  value={thoughtConfig.author}
                  onChange={e => setThoughtConfig({ ...thoughtConfig, author: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Automated RSS / Quotes API Feed URL</label>
                <input
                  type="text"
                  value={thoughtConfig.apiUrl}
                  onChange={e => setThoughtConfig({ ...thoughtConfig, apiUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. MARQUEE CONTROLS */}
        {activeTab === "marquee" && (
          <div className="space-y-6 animate-fade-in max-w-4xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">Live RSS News Marquees</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage the running news feeds, PIB and MPInfo RSS URLs.</p>
              </div>
              <button
                onClick={() => setMarqueeConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  marqueeConfig.enabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                }`}
              >
                {marqueeConfig.enabled ? "Marquees Active" : "Marquees Hidden"}
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-amber-700">Top Marquee: PIB RSS Feed</h4>
                  <input
                    type="checkbox"
                    checked={marqueeConfig.ticker1Enabled}
                    onChange={e => setMarqueeConfig({ ...marqueeConfig, ticker1Enabled: e.target.checked })}
                    className="h-4 w-4 rounded text-amber-600"
                  />
                </div>
                <input
                  type="text"
                  value={marqueeConfig.ticker1FeedUrl}
                  onChange={e => setMarqueeConfig({ ...marqueeConfig, ticker1FeedUrl: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-emerald-700">Bottom Marquee: MPInfo RSS Feed</h4>
                  <input
                    type="checkbox"
                    checked={marqueeConfig.ticker2Enabled}
                    onChange={e => setMarqueeConfig({ ...marqueeConfig, ticker2Enabled: e.target.checked })}
                    className="h-4 w-4 rounded text-emerald-600"
                  />
                </div>
                <input
                  type="text"
                  value={marqueeConfig.ticker2FeedUrl}
                  onChange={e => setMarqueeConfig({ ...marqueeConfig, ticker2FeedUrl: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Custom Emergency Headline</label>
                <input
                  type="text"
                  value={marqueeConfig.customAlertText}
                  onChange={e => setMarqueeConfig({ ...marqueeConfig, customAlertText: e.target.value })}
                  className="w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm font-semibold text-amber-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. CAROUSEL CONTROLS */}
        {activeTab === "carousel" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">Carousel Slides & Direct Device Upload</h3>
                <p className="text-xs text-slate-500 mt-0.5">Upload photos directly from your device without needing links.</p>
              </div>
              <button
                onClick={() => {
                  const newSlide: CarouselSlideItem = {
                    titleEn: "New Initiative",
                    subEn: "Empowering rural communities through collective service.",
                    image: "/assets/mega_camp_banner.png",
                    active: true
                  };
                  setSlides([...slides, newSlide]);
                  setSelectedSlideIndex(slides.length);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" /> Add Slide
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Slides List */}
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                {slides.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedSlideIndex(idx)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                      selectedSlideIndex === idx ? "border-amber-500 bg-amber-50/20 ring-1 ring-amber-500" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <img src={s.image} alt={s.titleEn} className="h-12 w-16 object-cover rounded-lg bg-slate-100 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{s.titleEn}</p>
                      <p className="text-[10px] text-slate-500 truncate">{s.subEn}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (idx === 0) return;
                          const next = [...slides];
                          [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                          setSlides(next.map((slide, i) => ({ ...slide, order: i })));
                          setSelectedSlideIndex(idx - 1);
                        }}
                        className="p-1 text-slate-500 hover:bg-white rounded disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === slides.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (idx === slides.length - 1) return;
                          const next = [...slides];
                          [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                          setSlides(next.map((slide, i) => ({ ...slide, order: i })));
                          setSelectedSlideIndex(idx + 1);
                        }}
                        className="p-1 text-slate-500 hover:bg-white rounded disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSlideIndex(idx);
                        }}
                        className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                        title="Edit Slide"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSlides(slides.map((slide, i) => i === idx ? { ...slide, active: slide.active === false } : slide));
                        }}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        title={s.active === false ? "Activate Slide" : "Deactivate Slide"}
                      >
                        {s.active === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSlides(slides.filter((_, i) => i !== idx));
                        if (selectedSlideIndex >= idx) setSelectedSlideIndex(Math.max(0, idx - 1));
                      }}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Slide Detail Editor */}
              {slides[selectedSlideIndex] && (
                <div className="lg:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between gap-3"><h4 className="text-xs font-black uppercase text-slate-400">Edit Carousel Slide #{selectedSlideIndex + 1}</h4><span className="text-[10px] font-bold text-emerald-600">Single language field</span></div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Slide Heading / Caption</label>
                    <input
                      type="text"
                      value={slides[selectedSlideIndex].titleEn}
                      onChange={e => {
                        const val = e.target.value;
                        setSlides(slides.map((sl, i) => i === selectedSlideIndex ? { ...sl, titleEn: val, titleHi: val } : sl));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subtitle / Summary</label>
                    <textarea
                      rows={2}
                      value={slides[selectedSlideIndex].subEn}
                      onChange={e => {
                        const val = e.target.value;
                        setSlides(slides.map((sl, i) => i === selectedSlideIndex ? { ...sl, subEn: val, subHi: val } : sl));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    />
                  </div>

                  {/* Device Photo Upload Box */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Slide Image</label>
                    <div className="flex items-center gap-4">
                      <img
                        src={slides[selectedSlideIndex].image}
                        alt="Preview"
                        className="h-20 w-32 object-cover rounded-xl border border-slate-200 bg-white"
                      />
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs">
                        <Upload className="h-4 w-4" /> Upload From Device
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={e => handleUploadImage(e, url => {
                            setSlides(slides.map((sl, i) => i === selectedSlideIndex ? { ...sl, image: url } : sl));
                          })}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. OUR VISION & LEADERSHIP */}
        {activeTab === "vision" && (
          <div className="space-y-6 animate-fade-in max-w-4xl">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-800">Our Vision & Leadership Section</h3>
              <p className="text-xs text-slate-500 mt-0.5">Control headings, icons, subpage redirection, and founder narrative.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Section Title</label>
                  <input
                    type="text"
                    value={visionConfig.heading}
                    onChange={e => setVisionConfig({ ...visionConfig, heading: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Route for Vision Roadmap</label>
                  <input
                    type="text"
                    value={visionConfig.targetRoute}
                    onChange={e => setVisionConfig({ ...visionConfig, targetRoute: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vision Narrative</label>
                <textarea
                  rows={3}
                  value={visionConfig.narrative}
                  onChange={e => setVisionConfig({ ...visionConfig, narrative: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm leading-relaxed"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Founder Message</label>
                <textarea
                  rows={3}
                  value={visionConfig.founderMessage}
                  onChange={e => setVisionConfig({ ...visionConfig, founderMessage: e.target.value })}
                  className="w-full bg-amber-50/50 border border-amber-200 rounded-lg p-3 text-sm italic"
                />
              </div>
            </div>
          </div>
        )}
        {/* 7. QUICK ACCESS CONTROLS */}
        {activeTab === "quick_access" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">Quick Access Grid Cards</h3>
                <p className="text-xs text-slate-500 mt-0.5">Add, edit, remove, re-route and change color accents for quick action buttons.</p>
              </div>
              <button
                onClick={() => {
                  const newItem: QuickAccessItem = {
                    id: `qa-${Date.now()}`,
                    title: "New Service",
                    subtitle: "Brief description of the quick tool.",
                    icon: "Compass",
                    route: "/services",
                    active: true,
                    accentColor: "#167C5A"
                  };
                  setQuickAccessItems([...quickAccessItems, newItem]);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg"
              >
                <Plus className="h-4 w-4" /> Add Quick Card
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickAccessItems.map((item, idx) => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={item.title}
                      onChange={e => {
                        const val = e.target.value;
                        setQuickAccessItems(quickAccessItems.map((q, i) => i === idx ? { ...q, title: val } : q));
                      }}
                      className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold w-40"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuickAccessItems(quickAccessItems.map((q, i) => i === idx ? { ...q, active: !q.active } : q))}
                        className={`p-1 rounded ${item.active ? "text-emerald-600 bg-emerald-50" : "text-slate-400 bg-slate-200"}`}
                      >
                        {item.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => setQuickAccessItems(quickAccessItems.filter((_, i) => i !== idx))}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={item.subtitle}
                    onChange={e => {
                      const val = e.target.value;
                      setQuickAccessItems(quickAccessItems.map((q, i) => i === idx ? { ...q, subtitle: val } : q));
                    }}
                    placeholder="Subtitle"
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-600"
                  />

                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentIconTarget({
                          type: "quick_access",
                          id: item.id,
                          currentIcon: item.icon
                        });
                        setIconPickerOpen(true);
                      }}
                      className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-700 hover:border-amber-400 hover:text-amber-700 flex items-center gap-1 shadow-2xs shrink-0"
                      title="Click to visually pick icon (कोई कोडिंग नहीं)"
                    >
                      {React.createElement(AVAILABLE_ICONS[item.icon] || Compass, { className: "h-3.5 w-3.5 text-amber-600" })}
                      <span className="text-[10px] font-medium">{item.icon || "Icon"}</span>
                      <Pencil className="h-2.5 w-2.5 text-slate-400" />
                    </button>
                    <input
                      type="text"
                      value={item.route}
                      onChange={e => {
                        const val = e.target.value;
                        setQuickAccessItems(quickAccessItems.map((q, i) => i === idx ? { ...q, route: val } : q));
                      }}
                      placeholder="Route (/jan-seva-card)"
                      className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-mono"
                    />
                    <input
                      type="color"
                      value={item.accentColor || "#D97706"}
                      onChange={e => {
                        const val = e.target.value;
                        setQuickAccessItems(quickAccessItems.map((q, i) => i === idx ? { ...q, accentColor: val } : q));
                      }}
                      className="h-7 w-8 rounded cursor-pointer border border-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. FIELD IMPACT CONTROLS (FULL PENCIL EDIT, 4 MASTER COUNTERS & 8 SEVA DOMAINS) */}
        {activeTab === "impact" && (
          <div className="space-y-8 animate-fade-in max-w-5xl">
            {/* SUB-SECTION 1: 4 MASTER IMPACT COUNTERS (E.G. 66,505+ JAN SEVA CARDS) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 font-bold">
                      <TrendingUp className="h-4 w-4" />
                    </span>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                      1. Master Impact KPI Counters (शीर्ष प्रभाव आंकड़े)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Jan Seva Cards (66,505+), Health Camps (150+), Volunteers Network, and Livelihoods.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newStat: ImpactStatItem = {
                      id: `stat-${Date.now()}`,
                      labelEn: "New Impact Metric",
                      labelHi: "नया प्रभाव आंकड़ा",
                      value: 1000,
                      suffix: "+",
                      iconName: "Sparkles",
                      enabled: true
                    };
                    setImpactStats([...impactStats, newStat]);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 shadow-2xs"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Counter
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {impactStats.map((stat, sIdx) => {
                  const IconComp = AVAILABLE_ICONS[stat.iconName] || Award;
                  return (
                    <div
                      key={stat.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        {/* Visual Icon Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentIconTarget({
                              type: "impact_stat",
                              id: stat.id,
                              currentIcon: stat.iconName
                            });
                            setIconPickerOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:border-amber-400 hover:text-amber-700 shadow-2xs transition"
                          title="Click to visually pick icon (कोई कोडिंग नहीं)"
                        >
                          <IconComp className="h-4 w-4 text-amber-600" />
                          <span className="text-[10px]">{stat.iconName || "Icon"}</span>
                          <Pencil className="h-2.5 w-2.5 text-slate-400 ml-0.5" />
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setImpactStats(
                                impactStats.map((st, i) =>
                                  i === sIdx ? { ...st, enabled: !st.enabled } : st
                                )
                              )
                            }
                            className={`p-1 rounded-md ${
                              stat.enabled
                                ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                                : "text-slate-400 bg-slate-200"
                            }`}
                            title={stat.enabled ? "Active" : "Deactive"}
                          >
                            {stat.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setImpactStats(impactStats.filter((_, i) => i !== sIdx))
                            }
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-md"
                            title="Delete counter"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Number & Suffix */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Number</label>
                          <input
                            type="number"
                            value={stat.value}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setImpactStats(
                                impactStats.map((st, i) =>
                                  i === sIdx ? { ...st, value: val } : st
                                )
                              );
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-sm font-black text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Suffix</label>
                          <input
                            type="text"
                            value={stat.suffix}
                            onChange={(e) => {
                              const val = e.target.value;
                              setImpactStats(
                                impactStats.map((st, i) =>
                                  i === sIdx ? { ...st, suffix: val } : st
                                )
                              );
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-sm font-bold text-slate-800"
                          />
                        </div>
                      </div>

                      {/* Labels */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Label (English)</label>
                        <input
                          type="text"
                          value={stat.labelEn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setImpactStats(
                              impactStats.map((st, i) =>
                                i === sIdx ? { ...st, labelEn: val } : st
                              )
                            );
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SUB-SECTION 2: 8 SEVA DOMAINS (SANITATION, DRINKING WATER, PINK E-RICKSHAW, ETC.) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                      2. Seva Domains & Field Work (8 मुख्य कार्य क्षेत्र)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Edit Title, Badges, Icons, and Descriptions with direct pencil editing (✏️) and active toggles.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newDom: ImpactDomainItem = {
                      id: `domain-${Date.now()}`,
                      tab: "active",
                      titleEn: "New Field Initiative",
                      titleHi: "नई जन सेवा पहल",
                      descEn: "Describe the grassroots initiative, beneficiaries and achievements.",
                      descHi: "पहल का विवरण और उपलब्धियां।",
                      iconName: "Sparkles",
                      badgeEn: "Field Mission",
                      badgeHi: "जन सेवा मिशन",
                      color: "emerald",
                      enabled: true
                    };
                    setImpactDomains([...impactDomains, newDom]);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 shadow-2xs"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Seva Domain
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {impactDomains.map((dom, dIdx) => {
                  const IconComp = AVAILABLE_ICONS[dom.iconName] || Sparkles;
                  return (
                    <div
                      key={dom.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group"
                    >
                      {/* Top Header: Badge, Icon & Controls */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentIconTarget({
                                type: "impact_domain",
                                id: dom.id,
                                currentIcon: dom.iconName
                              });
                              setIconPickerOpen(true);
                            }}
                            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-amber-400 hover:text-amber-700 shadow-2xs transition flex items-center gap-1"
                            title="Click to visually pick icon (कोई कोडिंग नहीं)"
                          >
                            <IconComp className="h-4 w-4 text-emerald-600" />
                            <Pencil className="h-3 w-3 text-slate-400" />
                          </button>
                          <input
                            type="text"
                            value={dom.badgeEn}
                            onChange={(e) => {
                              const val = e.target.value;
                              setImpactDomains(
                                impactDomains.map((dm, i) =>
                                  i === dIdx ? { ...dm, badgeEn: val } : dm
                                )
                              );
                            }}
                            placeholder="Badge (e.g. Water Relief)"
                            className="bg-white border border-slate-200 rounded-md px-2 py-1 text-[11px] font-bold text-slate-700 w-32"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <select
                            value={dom.tab}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setImpactDomains(
                                impactDomains.map((dm, i) =>
                                  i === dIdx ? { ...dm, tab: val } : dm
                                )
                              );
                            }}
                            className="bg-white border border-slate-200 rounded-md px-2 py-1 text-[11px] font-bold text-slate-600"
                          >
                            <option value="active">Active</option>
                            <option value="care">Care</option>
                            <option value="community">Community</option>
                          </select>
                          <button
                            type="button"
                            onClick={() =>
                              setImpactDomains(
                                impactDomains.map((dm, i) =>
                                  i === dIdx ? { ...dm, enabled: !dm.enabled } : dm
                                )
                              )
                            }
                            className={`p-1 rounded-md ${
                              dom.enabled
                                ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                                : "text-slate-400 bg-slate-200"
                            }`}
                            title={dom.enabled ? "Active" : "Deactive"}
                          >
                            {dom.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setImpactDomains(impactDomains.filter((_, i) => i !== dIdx))
                            }
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-md"
                            title="Delete Domain"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <input
                          type="text"
                          value={dom.titleEn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setImpactDomains(
                              impactDomains.map((dm, i) =>
                                i === dIdx ? { ...dm, titleEn: val } : dm
                              )
                            );
                          }}
                          placeholder="Initiative Title (e.g. Clean Drinking Water Supply)"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <textarea
                          rows={2}
                          value={dom.descEn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setImpactDomains(
                              impactDomains.map((dm, i) =>
                                i === dIdx ? { ...dm, descEn: val } : dm
                              )
                            );
                          }}
                          placeholder="Brief description of field work..."
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-600"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SUB-SECTION 3: THREE QUICK FIELD METRICS BAR ON HOMESCREEN (COMMUNITY, CARE, ACTIVE) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    3. Bottom Homescreen Strip (Community, Care, Active Bar)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    The 3-column impact strip shown just above the footer on the home page.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {impactMetrics.map((m, idx) => (
                  <div key={m.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={m.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setImpactMetrics(
                            impactMetrics.map((im, i) => (i === idx ? { ...im, title: val } : im))
                          );
                        }}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold w-28"
                      />
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setImpactMetrics(
                              impactMetrics.map((im, i) =>
                                i === idx ? { ...im, active: !im.active } : im
                              )
                            )
                          }
                          className={`p-1 rounded ${
                            m.active ? "text-emerald-600 bg-emerald-50" : "text-slate-400 bg-slate-200"
                          }`}
                        >
                          {m.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={m.subtitle}
                      onChange={(e) => {
                        const val = e.target.value;
                        setImpactMetrics(
                          impactMetrics.map((im, i) => (i === idx ? { ...im, subtitle: val } : im))
                        );
                      }}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-600"
                    />
                    <input                      type="text"
                      value={m.route || "/community-care-active"}
                      onChange={(e) => {
                        const val = e.target.value;
                        setImpactMetrics(
                          impactMetrics.map((im, i) => (i === idx ? { ...im, route: val } : im))
                        );
                      }}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-mono text-slate-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 9. THEME & LAYOUT TEMPLATES */}
        {activeTab === "theme_layout" && (
          <div className="space-y-6 animate-fade-in max-w-4xl">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-800">Home Screen Layout & Palette Presets</h3>
              <p className="text-xs text-slate-500 mt-0.5">Customize global fonts, brand color accents and card corners.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: "classic_saffron", name: "Saffron Gold", primary: "#D97706", secondary: "#167C5A" },
                { id: "royal_navy", name: "Supreme Navy", primary: "#1E3A8A", secondary: "#0D9488" },
                { id: "forest_emerald", name: "Forest Green", primary: "#166534", secondary: "#C2410C" },
                { id: "minimal_white", name: "Minimal Slate", primary: "#0F172A", secondary: "#475569" }
              ].map(preset => (
                <button
                  key={preset.id}
                  onClick={() => setThemeConfig({
                    ...themeConfig,
                    templatePreset: preset.id,
                    primaryColor: preset.primary,
                    secondaryColor: preset.secondary
                  })}
                  className={`p-3 rounded-xl border text-left transition ${
                    themeConfig.templatePreset === preset.id ? "border-amber-500 ring-1 ring-amber-500 bg-amber-50/20" : "border-slate-200"
                  }`}
                >
                  <div className="flex gap-1.5 mb-2">
                    <span className="h-4 w-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                    <span className="h-4 w-4 rounded-full" style={{ backgroundColor: preset.secondary }} />
                  </div>
                  <p className="text-xs font-bold text-slate-800">{preset.name}</p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Primary Brand Accent Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={themeConfig.primaryColor}
                    onChange={e => setThemeConfig({ ...themeConfig, primaryColor: e.target.value })}
                    className="h-10 w-12 rounded cursor-pointer border border-slate-200"
                  />
                  <input
                    type="text"
                    value={themeConfig.primaryColor}
                    onChange={e => setThemeConfig({ ...themeConfig, primaryColor: e.target.value })}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Secondary Accent Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={themeConfig.secondaryColor}
                    onChange={e => setThemeConfig({ ...themeConfig, secondaryColor: e.target.value })}
                    className="h-10 w-12 rounded cursor-pointer border border-slate-200"
                  />
                  <input
                    type="text"
                    value={themeConfig.secondaryColor}
                    onChange={e => setThemeConfig({ ...themeConfig, secondaryColor: e.target.value })}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* REUSABLE VISUAL ICON PICKER MODAL */}
      <IconPickerModal
        isOpen={iconPickerOpen}
        onClose={() => {
          setIconPickerOpen(false);
          setCurrentIconTarget(null);
        }}
        selectedIcon={currentIconTarget?.currentIcon || ""}
        onSelectIcon={(newIconName) => {
          if (!currentIconTarget) return;
          if (currentIconTarget.type === "quick_access") {
            setQuickAccessItems(
              quickAccessItems.map((q) =>
                q.id === currentIconTarget.id ? { ...q, icon: newIconName } : q
              )
            );
          } else if (currentIconTarget.type === "impact_stat") {
            setImpactStats(
              impactStats.map((st) =>
                st.id === currentIconTarget.id ? { ...st, iconName: newIconName } : st
              )
            );
          } else if (currentIconTarget.type === "impact_domain") {
            setImpactDomains(
              impactDomains.map((dm) =>
                dm.id === currentIconTarget.id ? { ...dm, iconName: newIconName } : dm
              )
            );
          }
          toast.success(`Icon changed to ${newIconName}`);
        }}
      />
    </div>
  );
}