import React, { useState, useEffect, useCallback } from "react";
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
  TrendingUp,
  Fuel,
  Carrot,
  Wheat,
  Sun,
  Layers,
  Sparkles,
  Sliders,
  Pencil,
  Award,
  CheckCircle2,
  Star,
  MapPin,
  ExternalLink,
  ArrowUp,
  ArrowDown
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

// 1. Weather Station Item
export interface WeatherStationItem {
  id: string;
  cityName: string;
  state: string;
  provider: "open-meteo" | "weatherapi" | "custom_rss";
  customUrl?: string;
  isDefault: boolean;
  active: boolean;
}

// 2. Live Market & Panchang Feed Item
export interface MarketFeedItem {
  id: string;
  name: string;
  category: "panchang" | "gold_silver" | "vegetable" | "fuel" | "mandi" | "custom";
  providerType: "api" | "rss" | "scraper";
  feedUrl: string;
  description: string;
  badge: string;
  active: boolean;
}

// 3. Daily Thought Item
export interface ThoughtItem {
  id: string;
  quote: string;
  author: string;
  active: boolean;
  isCurrent: boolean;
}

// 4. Marquee News Item
export interface MarqueeFeedItem {
  id: string;
  label: string;
  type: "rss" | "custom_text";
  feedUrl?: string;
  customText?: string;
  active: boolean;
}

// 5. Carousel Slide (Unified - No En/Hi division!)
export interface CarouselSlideItem {
  id?: string;
  title: string;
  subtitle: string;
  image: string;
  order?: number;
  active?: boolean;
}

// 7. Quick Access Item
export interface QuickAccessItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  active: boolean;
  accentColor?: string;
}

// 8. Field Impact Items (Unified - No En/Hi division!)
export interface ImpactMetricItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  active: boolean;
  route?: string;
}

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

  // Editing Modals / Dialogs for Complex Entities
  const [editingWeatherStation, setEditingWeatherStation] = useState<WeatherStationItem | null>(null);
  const [editingMarketFeed, setEditingMarketFeed] = useState<MarketFeedItem | null>(null);
  const [editingThought, setEditingThought] = useState<ThoughtItem | null>(null);
  const [editingMarquee, setEditingMarquee] = useState<MarqueeFeedItem | null>(null);
  const [editingDomain, setEditingDomain] = useState<ImpactDomainItem | null>(null);

  // 1. Weather Controls & Dynamic Stations List
  const [weatherMasterEnabled, setWeatherMasterEnabled] = useState(true);
  const [weatherStations, setWeatherStations] = useState<WeatherStationItem[]>([
    { id: "ws-bhopal", cityName: "Bhopal", state: "Madhya Pradesh", provider: "open-meteo", isDefault: true, active: true },
    { id: "ws-indore", cityName: "Indore", state: "Madhya Pradesh", provider: "open-meteo", isDefault: false, active: true },
    { id: "ws-gwalior", cityName: "Gwalior", state: "Madhya Pradesh", provider: "open-meteo", isDefault: false, active: true },
    { id: "ws-jabalpur", cityName: "Jabalpur", state: "Madhya Pradesh", provider: "open-meteo", isDefault: false, active: true },
    { id: "ws-delhi", cityName: "Delhi", state: "Delhi NCR", provider: "open-meteo", isDefault: false, active: true }
  ]);
  const [weatherConfig, setWeatherConfig] = useState({
    defaultCity: "Bhopal",
    apiProvider: "open-meteo",
    customApiKey: "",
    refreshIntervalMinutes: 15
  });

  // 2. Live Market & Panchang Controls & Dynamic Feeds List
  const [marketMasterEnabled, setMarketMasterEnabled] = useState(true);
  const [marketFeeds, setMarketFeeds] = useState<MarketFeedItem[]>([
    {
      id: "feed-panchang",
      name: "Drik Panchang & Vedic Tithi",
      category: "panchang",
      providerType: "api",
      feedUrl: "https://api.drikpanchang.com/v1/tithi",
      description: "Tithi, Samvat, Sunrise/Sunset, Rahukaal & Abhijit Muhurat",
      badge: "वैदिक • Live",
      active: true
    },
    {
      id: "feed-gold-silver",
      name: "Gold & Silver Bullion Rates",
      category: "gold_silver",
      providerType: "api",
      feedUrl: "https://api.ibja.co/rates",
      description: "24K Gold, 22K Gold & Silver 1kg IBJA Benchmarks",
      badge: "IBJA Benchmark",
      active: true
    },
    {
      id: "feed-vegetables",
      name: "Vegetable Mandi Prices",
      category: "vegetable",
      providerType: "rss",
      feedUrl: "https://mpmandiboard.gov.in/prices-rss",
      description: "Potato, Onion, Tomato & Seasonal Vegetables per KG",
      badge: "APMC Mandi",
      active: true
    },
    {
      id: "feed-fuel",
      name: "Petrol, Diesel & LPG Fuel Rates",
      category: "fuel",
      providerType: "api",
      feedUrl: "https://api.rpfoundation.org/fuel-rates",
      description: "Petrol, Diesel, Domestic LPG & CNG city rates",
      badge: "IOCL / PPAC",
      active: true
    },
    {
      id: "feed-mandi",
      name: "Crops & Pulses Mandi Rates",
      category: "mandi",
      providerType: "rss",
      feedUrl: "https://agmarknet.gov.in/mandi-rss",
      description: "Wheat, Soybean, Mustard, Chana & Grain MSP Rates",
      badge: "Agmarknet (Govt)",
      active: true
    }
  ]);

  // 3. Thought of the Day Controls & Dynamic Quotes List
  const [thoughtMasterEnabled, setThoughtMasterEnabled] = useState(true);
  const [thoughtList, setThoughtList] = useState<ThoughtItem[]>([
    {
      id: "th-1",
      quote: "उठो, जागो और तब तक मत रुको जब तक लक्ष्य की प्राप्ति न हो जाए।",
      author: "स्वामी विवेकानंद",
      active: true,
      isCurrent: true
    },
    {
      id: "th-2",
      quote: "सत्य और अहिंसा ही मानव जीवन के सर्वोच्च आदर्श हैं।",
      author: "महात्मा गांधी",
      active: true,
      isCurrent: false
    },
    {
      id: "th-3",
      quote: "सेवा ही परमो धर्म: — जन कल्याण से बड़ा कोई पुण्य नहीं।",
      author: "रोहित पंडित",
      active: true,
      isCurrent: false
    }
  ]);
  const [thoughtRssUrl, setThoughtRssUrl] = useState("https://zenquotes.io/api/today");

  // 4. Marquee News Controls & Dynamic Items List
  const [marqueeMasterEnabled, setMarqueeMasterEnabled] = useState(true);
  const [marqueeList, setMarqueeList] = useState<MarqueeFeedItem[]>([
    {
      id: "mq-pib",
      label: "PIB Verified National News",
      type: "rss",
      feedUrl: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=2",
      active: true
    },
    {
      id: "mq-mpinfo",
      label: "MPInfo State Governance & Seva News",
      type: "rss",
      feedUrl: "https://mpinfo.org/Home/NewsFeedRSS",
      active: true
    },
    {
      id: "mq-alert",
      label: "Emergency Citizen Advisory",
      type: "custom_text",
      customText: "Latest verified foundation initiatives and emergency advisories.",
      active: true
    }
  ]);

  // 5. Carousel Slides (Unified single fields)
  const [slides, setSlides] = useState<CarouselSlideItem[]>([]);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);

  // 6. Vision & Leadership Controls
  const [visionConfig, setVisionConfig] = useState({
    heading: "Our Vision & Leadership",
    subHeading: "Empowering Communities Through Direct Ground Action",
    narrative:
      "RP Foundation is built on an interconnected model of social development—uniting accessible healthcare, sustainable employment, women’s self-reliance, and direct grievance resolution.",
    iconName: "RP_LOGO",
    targetRoute: "/vision-goals",
    active: true,
    founderName: "Rohit Pandit",
    founderDesignation: "Founder & Social Worker",
    founderMessage:
      "True service begins when we reach out to those in need with humility, resolve, and unyielding commitment."
  });

  // 7. Quick Access Grid
  const [quickAccessItems, setQuickAccessItems] = useState<QuickAccessItem[]>([]);

  // 8. Field Impact (Counters, Domains & Bottom Strip)
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetricItem[]>([]);
  const [impactStats, setImpactStats] = useState<ImpactStatItem[]>([]);
  const [impactDomains, setImpactDomains] = useState<ImpactDomainItem[]>([]);

  // 9. Theme & Layout Config
  const [themeConfig, setThemeConfig] = useState({
    templatePreset: "classic_saffron",
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

      // 1. Weather
      if (d.weatherConfig) {
        setWeatherMasterEnabled(d.weatherConfig.enabled !== false);
        setWeatherConfig(prev => ({ ...prev, ...d.weatherConfig }));
        if (Array.isArray(d.weatherConfig.stations) && d.weatherConfig.stations.length > 0) {
          setWeatherStations(d.weatherConfig.stations);
        }
      }

      // 2. Market & Panchang
      if (d.marketConfig) {
        setMarketMasterEnabled(d.marketConfig.enabled !== false);
        if (Array.isArray(d.marketConfig.marketItems) && d.marketConfig.marketItems.length > 0) {
          setMarketFeeds(d.marketConfig.marketItems);
        }
      }

      // 3. Thought of the Day
      if (d.thoughtConfig) {
        setThoughtMasterEnabled(d.thoughtConfig.enabled !== false);
        if (Array.isArray(d.thoughtConfig.thoughts) && d.thoughtConfig.thoughts.length > 0) {
          setThoughtList(d.thoughtConfig.thoughts);
        } else if (d.thoughtConfig.activeQuote) {
          setThoughtList(prev => [
            {
              id: "th-active",
              quote: d.thoughtConfig.activeQuote,
              author: d.thoughtConfig.author || "Daily Thought",
              active: true,
              isCurrent: true
            },
            ...prev.filter(t => t.id !== "th-active")
          ]);
        }
        if (d.thoughtConfig.apiUrl) setThoughtRssUrl(d.thoughtConfig.apiUrl);
      } else if (d.quoteOfTheDay || d.quoteOfTheDayHi || d.quoteOfTheDayEn) {
        const quoteText = d.quoteOfTheDay || d.quoteOfTheDayHi || d.quoteOfTheDayEn;
        setThoughtList(prev => [
          {
            id: "th-active",
            quote: quoteText,
            author: d.quoteAuthor || "Daily Thought",
            active: true,
            isCurrent: true
          },
          ...prev.filter(t => t.id !== "th-active")
        ]);
      }

      // 4. Marquees
      if (d.marqueeConfig) {
        setMarqueeMasterEnabled(d.marqueeConfig.enabled !== false);
        if (Array.isArray(d.marqueeConfig.marqueeItems) && d.marqueeConfig.marqueeItems.length > 0) {
          setMarqueeList(d.marqueeConfig.marqueeItems);
        }
      }

      // 5. Carousel Slides (Unified single fields)
      if (Array.isArray(d.carouselSlides) && d.carouselSlides.length > 0) {
        setSlides(
          d.carouselSlides.map((s: any, idx: number) => ({
            id: s.id || `slide-${idx}`,
            title: s.title || s.titleEn || s.titleHi || "Initiative",
            subtitle: s.subtitle || s.subEn || s.subHi || "",
            image: s.image || "/assets/mega_camp_banner.png",
            order: s.order ?? idx,
            active: s.active !== false
          }))
        );
      } else {
        setSlides([
          {
            id: "s1",
            title: "Together, We Build a Better Tomorrow",
            subtitle: "Empowering lives. Strengthening communities.",
            image: "/assets/mega_camp_banner.png",
            active: true
          },
          {
            id: "s2",
            title: "Building a Better Tomorrow for Every Citizen",
            subtitle: "We create healthier, stronger, and empowered communities.",
            image: "/assets/water_pump_camp.png",
            active: true
          }
        ]);
      }

      // 6. Vision & Leadership
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

      // 7. Quick Access Grid
      if (Array.isArray(d.quickAccessItems) && d.quickAccessItems.length > 0) {
        setQuickAccessItems(
          d.quickAccessItems.map((q: any) => ({
            id: q.id,
            title: q.title || "Service",
            subtitle: q.subtitle || "",
            icon: q.icon || "Compass",
            route: q.route || "/explore",
            active: q.active !== false,
            accentColor: q.accentColor || "#167C5A"
          }))
        );
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

      // 8. Field Impact: Master KPI Counters (Unified)
      if (Array.isArray(d.impactStats) && d.impactStats.length > 0) {
        setImpactStats(
          d.impactStats.map((st: any) => ({
            id: st.id,
            label: st.label || st.labelEn || st.labelHi || "Impact Metric",
            value: Number(st.value) || 0,
            suffix: st.suffix || "+",
            iconName: st.iconName || "Award",
            enabled: st.enabled !== false
          }))
        );
      } else {
        setImpactStats([
          { id: "cards_issued", label: "Jan Seva Cards", value: 66505, suffix: "+", iconName: "Award", enabled: true },
          { id: "health_camps", label: "Health & Eye Camps", value: 150, suffix: "+", iconName: "Stethoscope", enabled: true },
          { id: "volunteers", label: "Volunteers Network", value: 2400, suffix: "+", iconName: "Users", enabled: true },
          { id: "jobs_empowered", label: "Jobs & Livelihood", value: 1800, suffix: "+", iconName: "Briefcase", enabled: true }
        ]);
      }

      // 8. Field Impact: Seva Domains (Unified)
      if (Array.isArray(d.impactDomains) && d.impactDomains.length > 0) {
        setImpactDomains(
          d.impactDomains.map((dm: any) => ({
            id: dm.id,
            tab: dm.tab || "active",
            title: dm.title || dm.titleEn || dm.titleHi || "Field Initiative",
            description: dm.description || dm.descEn || dm.descHi || "",
            badge: dm.badge || dm.badgeEn || dm.badgeHi || "Ground Seva",
            iconName: dm.iconName || "Sparkles",
            color: dm.color || "emerald",
            enabled: dm.enabled !== false
          }))
        );
      } else {
        setImpactDomains([
          { id: "sanitation", tab: "active", title: "Sanitation & Clean Environment Drive", description: "Mass cleanliness drives, plastic-free campaigns, and public sanitation facilities.", iconName: "Trash2", badge: "Clean Environment", color: "emerald", enabled: true },
          { id: "water", tab: "care", title: "Clean Drinking Water Supply", description: "Installing handpumps, clean RO water systems, and deploying water tankers.", iconName: "Droplets", badge: "Water Relief", color: "sky", enabled: true },
          { id: "jobs", tab: "active", title: "Jobs for Unemployed Youth & Women", description: "Mega Rojgar Melas, direct company hiring drives, and micro-entrepreneurship.", iconName: "Briefcase", badge: "Livelihood", color: "amber", enabled: true },
          { id: "pink-erickshaw", tab: "active", title: "Pink E-Rickshaw Empowerment", description: "Subsidized eco-friendly e-rickshaws to women for financial independence.", iconName: "Heart", badge: "Women Power", color: "rose", enabled: true },
          { id: "skills", tab: "active", title: "Skills Training & Vocational Courses", description: "Free tailoring units, computer literacy centers, and vocational workshops.", iconName: "Wrench", badge: "Skill Development", color: "purple", enabled: true },
          { id: "health", tab: "care", title: "Free Health Services & Emergency Care", description: "Mega Health Camps, free medicine distribution, and ambulance aid.", iconName: "Stethoscope", badge: "Healthcare", color: "red", enabled: true },
          { id: "welfare", tab: "care", title: "Helping Poor & Downtrodden People", description: "Ration kits, winter blankets, and disaster emergency relief.", iconName: "HandHeart", badge: "Welfare Relief", color: "emerald", enabled: true },
          { id: "education", tab: "community", title: "Education Services & Youth Mentorship", description: "Free books, stationery, evening tuition classes for children.", iconName: "GraduationCap", badge: "Youth Education", color: "indigo", enabled: true }
        ]);
      }

      // 8. Field Impact: Bottom Strip
      if (Array.isArray(d.impactMetrics) && d.impactMetrics.length > 0) {
        setImpactMetrics(d.impactMetrics);
      } else {
        setImpactMetrics([
          { id: "imp-1", title: "Community", subtitle: "Welfare & Culture", icon: "UsersRound", active: true, route: "/community-care-active" },
          { id: "imp-2", title: "Care", subtitle: "Health & Relief", icon: "Stethoscope", active: true, route: "/community-care-active" },
          { id: "imp-3", title: "Active", subtitle: "Field Initiatives", icon: "CalendarDays", active: true, route: "/community-care-active" }
        ]);
      }

      // 9. Theme & Layout
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

  // Image Upload Handler
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

  // Save All Changes to Live Application - Safe bidirectional mapping for complete backwards compatibility
  const handleSaveAll = async () => {
    if (!token) {
      toast.error("Admin session expired. Please sign in.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Publishing all Home Supreme updates live...");
    try {
      const activeCurrentThought = thoughtList.find(t => t.isCurrent && t.active) || thoughtList.find(t => t.active) || thoughtList[0];

      // Calculate backwards compatible boolean flags from market items
      const panchangItem = marketFeeds.find(f => f.category === "panchang");
      const goldSilverItem = marketFeeds.find(f => f.category === "gold_silver");
      const vegItem = marketFeeds.find(f => f.category === "vegetable");
      const fuelItem = marketFeeds.find(f => f.category === "fuel");
      const mandiItem = marketFeeds.find(f => f.category === "mandi");

      const defaultWeatherStation = weatherStations.find(s => s.isDefault) || weatherStations[0];

      const patch = {
        // 1. Weather
        weatherConfig: {
          ...weatherConfig,
          enabled: weatherMasterEnabled,
          defaultCity: defaultWeatherStation?.cityName || weatherConfig.defaultCity,
          stations: weatherStations
        },

        // 2. Market & Panchang
        marketConfig: {
          enabled: marketMasterEnabled,
          panchangEnabled: panchangItem ? panchangItem.active : true,
          goldSilverEnabled: goldSilverItem ? goldSilverItem.active : true,
          vegetableEnabled: vegItem ? vegItem.active : true,
          fuelEnabled: fuelItem ? fuelItem.active : true,
          mandiEnabled: mandiItem ? mandiItem.active : true,
          mandiRssFeedUrl: mandiItem?.feedUrl || "https://agmarknet.gov.in/mandi-rss",
          fuelApiUrl: fuelItem?.feedUrl || "https://api.rpfoundation.org/fuel-rates",
          marketItems: marketFeeds
        },

        // 3. Thought of the Day
        thoughtConfig: {
          enabled: thoughtMasterEnabled,
          apiUrl: thoughtRssUrl,
          activeQuote: activeCurrentThought?.quote || "",
          author: activeCurrentThought?.author || "Daily Thought",
          thoughts: thoughtList
        },
        quoteOfTheDay: activeCurrentThought?.quote || "",
        quoteOfTheDayHi: activeCurrentThought?.quote || "",
        quoteOfTheDayEn: activeCurrentThought?.quote || "",
        quoteAuthor: activeCurrentThought?.author || "Daily Thought",

        // 4. Marquee News
        marqueeConfig: {
          enabled: marqueeMasterEnabled,
          marqueeItems: marqueeList,
          ticker1Enabled: marqueeList[0]?.active ?? true,
          ticker1FeedUrl: marqueeList[0]?.feedUrl ?? "",
          ticker2Enabled: marqueeList[1]?.active ?? true,
          ticker2FeedUrl: marqueeList[1]?.feedUrl ?? "",
          customAlertText: marqueeList.find(m => m.type === "custom_text")?.customText || ""
        },
        alertBanner: marqueeList.find(m => m.type === "custom_text")?.customText || "",
        alertBannerHi: marqueeList.find(m => m.type === "custom_text")?.customText || "",
        alertBannerEn: marqueeList.find(m => m.type === "custom_text")?.customText || "",

        // 5. Carousel Slides (Syncs unified fields to En & Hi)
        carouselSlides: slides.map((s, idx) => ({
          id: s.id || `slide-${idx}`,
          title: s.title,
          titleEn: s.title,
          titleHi: s.title,
          subtitle: s.subtitle,
          subEn: s.subtitle,
          subHi: s.subtitle,
          image: s.image,
          order: s.order ?? idx,
          active: s.active !== false
        })),

        // 6. Vision & Leadership
        visionConfig,
        founderName: visionConfig.founderName,
        founderDesignation: visionConfig.founderDesignation,
        founderMessage: visionConfig.founderMessage,
        founderMessageHi: visionConfig.founderMessage,
        founderMessageEn: visionConfig.founderMessage,

        // 7. Quick Access Grid
        quickAccessItems,

        // 8. Field Impact (Counters, Domains & Bottom Strip synced to En & Hi)
        impactMetrics,
        impactStats: impactStats.map(st => ({
          ...st,
          label: st.label,
          labelEn: st.label,
          labelHi: st.label
        })),
        impactDomains: impactDomains.map(dm => ({
          ...dm,
          title: dm.title,
          titleEn: dm.title,
          titleHi: dm.title,
          description: dm.description,
          descEn: dm.description,
          descHi: dm.description,
          badge: dm.badge,
          badgeEn: dm.badge,
          badgeHi: dm.badge
        })),

        // 9. Theme & Layout
        themeConfig
      };

      const res = await axios.post(
        "/api/admin/control/cms/publish",
        { patch, label: `HomeStudio: update ${activeTab}` },
        { headers: authHeader() }
      );

      if (res.data?.success === false) throw new Error(res.data?.error || "Publish failed");
      window.dispatchEvent(new CustomEvent("samahit-admin-updated"));
      toast.success("Home controls published safely to live apps!", { id: toastId });
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to publish", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 space-y-6">
      {/* HEADER */}
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
              <span className="text-xs text-slate-400">Home Screen Control Plane</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 mt-1">Home Studio & Master Layout</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Universal Add, Edit, Delete, Active/Deactivate control across Weather, Live Market, Panchang, Marquee, Slides & Impact.
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
        {/* ========================================================================= */}
        {/* 1. WEATHER CONTROLS: DYNAMIC STATIONS (ADD, EDIT, DELETE, TOGGLE)         */}
        {/* ========================================================================= */}
        {activeTab === "weather" && (
          <div className="space-y-6 animate-fade-in max-w-5xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">Weather Module & City Weather Stations</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure real-time weather stations. Add new cities, set primary default city, edit providers, or toggle active/inactive.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newStation: WeatherStationItem = {
                      id: `ws-${Date.now()}`,
                      cityName: "New City",
                      state: "Madhya Pradesh",
                      provider: "open-meteo",
                      isDefault: false,
                      active: true
                    };
                    setWeatherStations([...weatherStations, newStation]);
                    setEditingWeatherStation(newStation);
                    toast.success("Added new weather city station");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 hover:bg-amber-100 flex items-center gap-1.5 transition"
                >
                  <Plus className="h-4 w-4" /> Add Weather City
                </button>
                <button
                  onClick={() => setWeatherMasterEnabled(!weatherMasterEnabled)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    weatherMasterEnabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {weatherMasterEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {weatherMasterEnabled ? "Weather Active" : "Module Hidden"}
                </button>
              </div>
            </div>

            {/* Weather Stations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weatherStations.map((station, sIdx) => (
                <div
                  key={station.id}
                  className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3 ${
                    station.active ? "bg-white border-slate-200 shadow-2xs" : "bg-slate-50 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <CloudSun className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          {station.cityName}
                          {station.isDefault && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-black uppercase text-amber-800">
                              Default Primary
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium">{station.state} • {station.provider}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingWeatherStation(station)}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title="Edit Station"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setWeatherStations(
                            weatherStations.map((ws, i) =>
                              i === sIdx ? { ...ws, active: !ws.active } : ws
                            )
                          )
                        }
                        className={`p-1.5 rounded-lg transition ${
                          station.active ? "text-emerald-700 bg-emerald-50" : "text-slate-400 bg-slate-200"
                        }`}
                        title={station.active ? "Active" : "Disabled"}
                      >
                        {station.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (weatherStations.length <= 1) {
                            toast.error("At least one weather city station must remain.");
                            return;
                          }
                          setWeatherStations(weatherStations.filter((_, i) => i !== sIdx));
                          toast.success("Weather station removed");
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Station"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-500 font-medium truncate max-w-[160px]">
                      {station.customUrl ? "Custom Endpoint" : "Live API Stream"}
                    </span>
                    {!station.isDefault && (
                      <button
                        type="button"
                        onClick={() =>
                          setWeatherStations(
                            weatherStations.map((ws, i) => ({
                              ...ws,
                              isDefault: i === sIdx
                            }))
                          )
                        }
                        className="text-[10px] font-bold text-amber-700 hover:underline"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Global API Settings */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-500">Global Weather API Token (Optional)</h4>
              <input
                type="text"
                placeholder="Paste WeatherAPI / OpenWeather API key (Optional backup)..."
                value={weatherConfig.customApiKey}
                onChange={e => setWeatherConfig({ ...weatherConfig, customApiKey: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800"
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. LIVE MARKET & PANCHANG: DYNAMIC ITEMS (ADD, EDIT, DELETE, TOGGLE)       */}
        {/* ========================================================================= */}
        {activeTab === "market_panchang" && (
          <div className="space-y-6 animate-fade-in max-w-5xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">Live Verified Market & Panchang Engine</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dynamic commodities, Drik Panchang, Gold/Silver, Fuel, and Mandi feeds. Add custom commodities, edit URLs, toggle, or delete.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newFeed: MarketFeedItem = {
                      id: `feed-${Date.now()}`,
                      name: "New Commodity / Rate Feed",
                      category: "custom",
                      providerType: "api",
                      feedUrl: "https://api.example.com/commodity-rates",
                      description: "Daily verified wholesale rates and market trends.",
                      badge: "Live Rate",
                      active: true
                    };
                    setMarketFeeds([...marketFeeds, newFeed]);
                    setEditingMarketFeed(newFeed);
                    toast.success("Added new market commodity feed");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 hover:bg-amber-100 flex items-center gap-1.5 transition"
                >
                  <Plus className="h-4 w-4" /> Add Market Item
                </button>
                <button
                  onClick={() => setMarketMasterEnabled(!marketMasterEnabled)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    marketMasterEnabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {marketMasterEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {marketMasterEnabled ? "Master Section Active" : "Master Section Hidden"}
                </button>
              </div>
            </div>

            {/* Dynamic Market Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketFeeds.map((feed, fIdx) => (
                <div
                  key={feed.id}
                  className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3 ${
                    feed.active ? "bg-white border-slate-200 shadow-2xs" : "bg-slate-50 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase text-slate-700">
                          {feed.category}
                        </span>
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                          {feed.badge}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-slate-800 mt-1">{feed.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{feed.description}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingMarketFeed(feed)}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title="Edit Feed Details"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setMarketFeeds(
                            marketFeeds.map((f, i) =>
                              i === fIdx ? { ...f, active: !f.active } : f
                            )
                          )
                        }
                        className={`p-1.5 rounded-lg transition ${
                          feed.active ? "text-emerald-700 bg-emerald-50" : "text-slate-400 bg-slate-200"
                        }`}
                        title={feed.active ? "Active" : "Deactive"}
                      >
                        {feed.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMarketFeeds(marketFeeds.filter((_, i) => i !== fIdx));
                          toast.success("Market item deleted");
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Feed"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="truncate max-w-[200px]" title={feed.feedUrl}>{feed.feedUrl}</span>
                    <span className="uppercase font-bold text-[9px] text-slate-400">{feed.providerType}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. THOUGHT OF THE DAY: DYNAMIC QUOTES (ADD, EDIT, DELETE, TOGGLE)          */}
        {/* ========================================================================= */}
        {activeTab === "thought" && (
          <div className="space-y-6 animate-fade-in max-w-4xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">Thought of the Day (Universal Quotes List)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add inspirational quotes, set which thought is active today, edit author names, or link an automated quotes RSS feed.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newThought: ThoughtItem = {
                      id: `th-${Date.now()}`,
                      quote: "नया प्रेरक विचार यहाँ लिखें...",
                      author: "प्रेरक विचार",
                      active: true,
                      isCurrent: false
                    };
                    setThoughtList([...thoughtList, newThought]);
                    setEditingThought(newThought);
                    toast.success("Added new thought");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 hover:bg-amber-100 flex items-center gap-1.5 transition"
                >
                  <Plus className="h-4 w-4" /> Add Thought
                </button>
                <button
                  onClick={() => setThoughtMasterEnabled(!thoughtMasterEnabled)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    thoughtMasterEnabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {thoughtMasterEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {thoughtMasterEnabled ? "Thought Active" : "Section Hidden"}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {thoughtList.map((th, tIdx) => (
                <div
                  key={th.id}
                  className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                    th.isCurrent ? "border-amber-400 bg-amber-50/40 ring-1 ring-amber-400" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {th.isCurrent && (
                        <span className="rounded bg-amber-600 px-2 py-0.5 text-[9px] font-black uppercase text-white">
                          Active Today
                        </span>
                      )}
                      <span className="text-xs font-bold text-amber-800">— {th.author}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed italic">“{th.quote}”</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!th.isCurrent && (
                      <button
                        type="button"
                        onClick={() =>
                          setThoughtList(
                            thoughtList.map((item, i) => ({
                              ...item,
                              isCurrent: i === tIdx
                            }))
                          )
                        }
                        className="px-2.5 py-1 text-[10px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-md transition"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingThought(th)}
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      title="Edit Thought"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setThoughtList(
                          thoughtList.map((item, i) =>
                            i === tIdx ? { ...item, active: !item.active } : item
                          )
                        )
                      }
                      className={`p-1.5 rounded-lg transition ${
                        th.active ? "text-emerald-700 bg-emerald-50" : "text-slate-400 bg-slate-200"
                      }`}
                      title={th.active ? "Active" : "Disabled"}
                    >
                      {th.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setThoughtList(thoughtList.filter((_, i) => i !== tIdx));
                        toast.success("Thought deleted");
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Thought"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase">Automated Quotes RSS / API URL</label>
              <input
                type="text"
                value={thoughtRssUrl}
                onChange={e => setThoughtRssUrl(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800"
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. MARQUEE NEWS: DYNAMIC FEEDS (ADD, EDIT, DELETE, TOGGLE)                 */}
        {/* ========================================================================= */}
        {activeTab === "marquee" && (
          <div className="space-y-6 animate-fade-in max-w-4xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">Live RSS News Marquees & Announcements</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage running ticker feeds, government bulletins, or emergency citizen advisories.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newMarquee: MarqueeFeedItem = {
                      id: `mq-${Date.now()}`,
                      label: "Custom Bulletin / Alert",
                      type: "custom_text",
                      customText: "Emergency notification or public broadcast message.",
                      active: true
                    };
                    setMarqueeList([...marqueeList, newMarquee]);
                    setEditingMarquee(newMarquee);
                    toast.success("Added new marquee feed");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 hover:bg-amber-100 flex items-center gap-1.5 transition"
                >
                  <Plus className="h-4 w-4" /> Add Marquee
                </button>
                <button
                  onClick={() => setMarqueeMasterEnabled(!marqueeMasterEnabled)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    marqueeMasterEnabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {marqueeMasterEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {marqueeMasterEnabled ? "Marquees Active" : "Marquees Hidden"}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {marqueeList.map((mq, mIdx) => (
                <div
                  key={mq.id}
                  className={`p-4 rounded-xl border transition flex items-center justify-between gap-4 ${
                    mq.active ? "bg-white border-slate-200 shadow-2xs" : "bg-slate-50 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase text-slate-700">
                        {mq.type === "rss" ? "RSS Feed" : "Custom Text"}
                      </span>
                      <h4 className="text-xs font-black text-slate-800">{mq.label}</h4>
                    </div>
                    <p className="text-xs text-slate-600 font-mono truncate max-w-lg">
                      {mq.type === "rss" ? mq.feedUrl : mq.customText}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingMarquee(mq)}
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      title="Edit Marquee"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setMarqueeList(
                          marqueeList.map((item, i) =>
                            i === mIdx ? { ...item, active: !item.active } : item
                          )
                        )
                      }
                      className={`p-1.5 rounded-lg transition ${
                        mq.active ? "text-emerald-700 bg-emerald-50" : "text-slate-400 bg-slate-200"
                      }`}
                      title={mq.active ? "Active" : "Disabled"}
                    >
                      {mq.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMarqueeList(marqueeList.filter((_, i) => i !== mIdx));
                        toast.success("Marquee deleted");
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Marquee"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. CAROUSEL SLIDES: DEVICE UPLOAD & UNIFIED TEXT (ADD, EDIT, DELETE, EYE)   */}
        {/* ========================================================================= */}
        {activeTab === "carousel" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">Carousel Slides & Direct Device Upload</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload photos directly from your device. Add, edit caption, toggle active, or delete slides.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newSlide: CarouselSlideItem = {
                    id: `slide-${Date.now()}`,
                    title: "New Initiative Headline",
                    subtitle: "Empowering rural communities through collective service.",
                    image: "/assets/mega_camp_banner.png",
                    active: true
                  };
                  setSlides([...slides, newSlide]);
                  setSelectedSlideIndex(slides.length);
                  toast.success("Added new carousel slide");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition"
              >
                <Plus className="h-4 w-4" /> Add Slide
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Slides List */}
              <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                {slides.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    onClick={() => setSelectedSlideIndex(idx)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                      selectedSlideIndex === idx ? "border-amber-500 bg-amber-50/20 ring-1 ring-amber-500" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <img src={s.image} alt={s.title} className="h-12 w-16 object-cover rounded-lg bg-slate-100 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{s.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">{s.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setSlides(slides.map((sl, i) => (i === idx ? { ...sl, active: !sl.active } : sl)));
                        }}
                        className={`p-1 rounded ${s.active !== false ? "text-emerald-600 bg-emerald-50" : "text-slate-400 bg-slate-200"}`}
                        title={s.active !== false ? "Active" : "Hidden"}
                      >
                        {s.active !== false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={e => {
                            e.stopPropagation();
                            if (idx === 0) return;
                            const next = [...slides];
                            const tmp = next[idx];
                            next[idx] = next[idx - 1];
                            next[idx - 1] = tmp;
                            setSlides(next);
                            setSelectedSlideIndex(idx - 1);
                          }}
                          className="p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-20 transition"
                          title="Move up"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === slides.length - 1}
                          onClick={e => {
                            e.stopPropagation();
                            if (idx >= slides.length - 1) return;
                            const next = [...slides];
                            const tmp = next[idx];
                            next[idx] = next[idx + 1];
                            next[idx + 1] = tmp;
                            setSlides(next);
                            setSelectedSlideIndex(idx + 1);
                          }}
                          className="p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-20 transition"
                          title="Move down"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setSlides(slides.filter((_, i) => i !== idx));
                          if (selectedSlideIndex >= idx) setSelectedSlideIndex(Math.max(0, idx - 1));
                        }}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                        title="Delete Slide"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Slide Detail Editor (Unified single inputs) */}
              {slides[selectedSlideIndex] && (
                <div className="lg:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-xs font-black uppercase text-slate-400">Editing Slide #{selectedSlideIndex + 1}</h4>
                    <span className="text-[10px] font-bold text-emerald-600">Unified Single Input</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Slide Headline</label>
                    <input
                      type="text"
                      value={slides[selectedSlideIndex].title}
                      onChange={e => {
                        const val = e.target.value;
                        setSlides(slides.map((sl, i) => (i === selectedSlideIndex ? { ...sl, title: val } : sl)));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subtitle / Summary</label>
                    <textarea
                      rows={2}
                      value={slides[selectedSlideIndex].subtitle}
                      onChange={e => {
                        const val = e.target.value;
                        setSlides(slides.map((sl, i) => (i === selectedSlideIndex ? { ...sl, subtitle: val } : sl)));
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
                          onChange={e =>
                            handleUploadImage(e, url => {
                              setSlides(slides.map((sl, i) => (i === selectedSlideIndex ? { ...sl, image: url } : sl)));
                            })
                          }
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

        {/* ========================================================================= */}
        {/* 6. VISION & LEADERSHIP (UNIFIED TEXT FIELDS)                               */}
        {/* ========================================================================= */}
        {activeTab === "vision" && (
          <div className="space-y-6 animate-fade-in max-w-4xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">Our Vision & Leadership Section</h3>
                <p className="text-xs text-slate-500 mt-0.5">Control section title, roadmap route, narrative, and founder message.</p>
              </div>
              <button
                type="button"
                onClick={() => setVisionConfig(prev => ({ ...prev, active: !prev.active }))}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  visionConfig.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                }`}
              >
                {visionConfig.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {visionConfig.active ? "Vision Active" : "Vision Hidden"}
              </button>
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
        {/* ========================================================================= */}
        {/* 7. QUICK ACCESS CONTROLS (ADD, EDIT, DELETE, ICON PICKER, TOGGLE)         */}
        {/* ========================================================================= */}
        {activeTab === "quick_access" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">Quick Access Grid Cards</h3>
                <p className="text-xs text-slate-500 mt-0.5">Add, edit, remove, re-route and change color accents for quick action buttons.</p>
              </div>
              <button
                type="button"
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
                  toast.success("Added new quick card");
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
                        setQuickAccessItems(quickAccessItems.map((q, i) => (i === idx ? { ...q, title: val } : q)));
                      }}
                      className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold w-40"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setQuickAccessItems(
                            quickAccessItems.map((q, i) => (i === idx ? { ...q, active: !q.active } : q))
                          )
                        }
                        className={`p-1 rounded ${item.active ? "text-emerald-600 bg-emerald-50" : "text-slate-400 bg-slate-200"}`}
                        title={item.active ? "Active" : "Disabled"}
                      >
                        {item.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            if (idx === 0) return;
                            const next = [...quickAccessItems];
                            const tmp = next[idx];
                            next[idx] = next[idx - 1];
                            next[idx - 1] = tmp;
                            setQuickAccessItems(next);
                          }}
                          className="p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-20 transition"
                          title="Move up"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === quickAccessItems.length - 1}
                          onClick={() => {
                            if (idx >= quickAccessItems.length - 1) return;
                            const next = [...quickAccessItems];
                            const tmp = next[idx];
                            next[idx] = next[idx + 1];
                            next[idx + 1] = tmp;
                            setQuickAccessItems(next);
                          }}
                          className="p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-20 transition"
                          title="Move down"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setQuickAccessItems(quickAccessItems.filter((_, i) => i !== idx))}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                        title="Delete Card"
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
                      setQuickAccessItems(quickAccessItems.map((q, i) => (i === idx ? { ...q, subtitle: val } : q)));
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
                      title="Click to visually pick icon (No coding)"
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
                        setQuickAccessItems(quickAccessItems.map((q, i) => (i === idx ? { ...q, route: val } : q)));
                      }}
                      placeholder="Route (/jan-seva-card)"
                      className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-mono"
                    />
                    <input
                      type="color"
                      value={item.accentColor || "#D97706"}
                      onChange={e => {
                        const val = e.target.value;
                        setQuickAccessItems(quickAccessItems.map((q, i) => (i === idx ? { ...q, accentColor: val } : q)));
                      }}
                      className="h-7 w-8 rounded cursor-pointer border border-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 8. FIELD IMPACT: COUNTERS, DOMAINS & STRIP (UNIFIED - NO EN/HI DIVIDE)    */}
        {/* ========================================================================= */}
        {activeTab === "impact" && (
          <div className="space-y-8 animate-fade-in max-w-5xl">
            {/* SUB-SECTION 1: MASTER IMPACT KPI COUNTERS */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 font-bold">
                      <TrendingUp className="h-4 w-4" />
                    </span>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                      1. Master Impact KPI Counters
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Jan Seva Cards, Health Camps, Volunteers Network, and Livelihoods. Full Add, Edit, Delete and Active toggles.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newStat: ImpactStatItem = {
                      id: `stat-${Date.now()}`,
                      label: "New Impact Metric",
                      value: 1000,
                      suffix: "+",
                      iconName: "Sparkles",
                      enabled: true
                    };
                    setImpactStats([...impactStats, newStat]);
                    toast.success("Added new KPI counter");
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
                          title="Click to visually pick icon (No coding)"
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
                            onChange={e => {
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
                            onChange={e => {
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

                      {/* Unified Label */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Metric Title</label>
                        <input
                          type="text"
                          value={stat.label}
                          onChange={e => {
                            const val = e.target.value;
                            setImpactStats(
                              impactStats.map((st, i) =>
                                i === sIdx ? { ...st, label: val } : st
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

            {/* SUB-SECTION 2: 8 SEVA DOMAINS (UNIFIED) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                      2. Seva Domains & Field Work
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Edit Title, Badges, Icons, and Descriptions with direct pencil editing (✏️) and active toggles. No bilingual split.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newDom: ImpactDomainItem = {
                      id: `domain-${Date.now()}`,
                      tab: "active",
                      title: "New Field Initiative",
                      description: "Describe the grassroots initiative, beneficiaries and achievements.",
                      badge: "Ground Seva",
                      iconName: "Sparkles",
                      color: "emerald",
                      enabled: true
                    };
                    setImpactDomains([...impactDomains, newDom]);
                    setEditingDomain(newDom);
                    toast.success("Added new seva domain");
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
                            title="Click to visually pick icon (No coding)"
                          >
                            <IconComp className="h-4 w-4 text-emerald-600" />
                            <Pencil className="h-3 w-3 text-slate-400" />
                          </button>
                          <input
                            type="text"
                            value={dom.badge}
                            onChange={e => {
                              const val = e.target.value;
                              setImpactDomains(
                                impactDomains.map((dm, i) =>
                                  i === dIdx ? { ...dm, badge: val } : dm
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
                            onChange={e => {
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

                      {/* Unified Title */}
                      <div>
                        <input
                          type="text"
                          value={dom.title}
                          onChange={e => {
                            const val = e.target.value;
                            setImpactDomains(
                              impactDomains.map((dm, i) =>
                                i === dIdx ? { ...dm, title: val } : dm
                              )
                            );
                          }}
                          placeholder="Initiative Title (e.g. Clean Drinking Water Supply)"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                        />
                      </div>

                      {/* Unified Description */}
                      <div>
                        <textarea
                          rows={2}
                          value={dom.description}
                          onChange={e => {
                            const val = e.target.value;
                            setImpactDomains(
                              impactDomains.map((dm, i) =>
                                i === dIdx ? { ...dm, description: val } : dm
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

            {/* SUB-SECTION 3: THREE QUICK FIELD METRICS BAR ON HOMESCREEN */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    3. Bottom Homescreen Strip (Community, Care, Active Bar)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    The 3-column impact strip shown just above the footer on the home page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newStrip: ImpactMetricItem = {
                      id: `imp-${Date.now()}`,
                      title: "Initiative",
                      subtitle: "Action & Relief",
                      icon: "CalendarDays",
                      active: true,
                      route: "/community-care-active"
                    };
                    setImpactMetrics([...impactMetrics, newStrip]);
                    toast.success("Added strip card");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Strip Card
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {impactMetrics.map((m, idx) => (
                  <div key={m.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={m.title}
                        onChange={e => {
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
                          title={m.active ? "Active" : "Disabled"}
                        >
                          {m.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setImpactMetrics(impactMetrics.filter((_, i) => i !== idx))}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          title="Delete Card"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={m.subtitle}
                      onChange={e => {
                        const val = e.target.value;
                        setImpactMetrics(
                          impactMetrics.map((im, i) => (i === idx ? { ...im, subtitle: val } : im))
                        );
                      }}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-600"
                    />
                    <input                      type="text"
                      value={m.route || "/community-care-active"}
                      onChange={e => {
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

        {/* ========================================================================= */}
        {/* 9. THEME & LAYOUT TEMPLATES                                               */}
        {/* ========================================================================= */}
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
                  onClick={() =>
                    setThemeConfig({
                      ...themeConfig,
                      templatePreset: preset.id,
                      primaryColor: preset.primary,
                      secondaryColor: preset.secondary
                    })
                  }
                  className={`p-3 rounded-xl border text-left transition ${
                    themeConfig.templatePreset === preset.id
                      ? "border-amber-500 ring-1 ring-amber-500 bg-amber-50/20"
                      : "border-slate-200"
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

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT WEATHER STATION                                             */}
      {/* ========================================================================= */}
      {editingWeatherStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-800">Edit Weather Station</h3>
              <button onClick={() => setEditingWeatherStation(null)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">City Name</label>
                <input
                  type="text"
                  value={editingWeatherStation.cityName}
                  onChange={e => setEditingWeatherStation({ ...editingWeatherStation, cityName: e.target.value })}
                  placeholder="e.g. Bhopal"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">State / Region</label>
                <input
                  type="text"
                  value={editingWeatherStation.state}
                  onChange={e => setEditingWeatherStation({ ...editingWeatherStation, state: e.target.value })}
                  placeholder="e.g. Madhya Pradesh"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-medium outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Provider Engine</label>
                <select
                  value={editingWeatherStation.provider}
                  onChange={e => setEditingWeatherStation({ ...editingWeatherStation, provider: e.target.value as any })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                >
                  <option value="open-meteo">Open-Meteo (Real-Time Meteorological Benchmark - Free)</option>
                  <option value="weatherapi">WeatherAPI (Backup Key Protocol)</option>
                  <option value="custom_rss">Custom Meteorological Feed / RSS</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700">Custom API Endpoint / Key (Optional)</label>
                <input
                  type="text"
                  value={editingWeatherStation.customUrl || ""}
                  onChange={e => setEditingWeatherStation({ ...editingWeatherStation, customUrl: e.target.value })}
                  placeholder="Optional custom feed URL or token"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-mono text-[11px] outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setEditingWeatherStation(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setWeatherStations(weatherStations.map(s => (s.id === editingWeatherStation.id ? editingWeatherStation : s)));
                  setEditingWeatherStation(null);
                  toast.success("Weather station updated");
                }}
                className="px-5 py-2 rounded-xl bg-amber-600 text-xs font-black text-white hover:bg-amber-700"
              >
                Save Station
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT MARKET & PANCHANG FEED                                      */}
      {/* ========================================================================= */}
      {editingMarketFeed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-800">Edit Market / Panchang Feed</h3>
              <button onClick={() => setEditingMarketFeed(null)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Commodity / Feed Name</label>
                <input
                  type="text"
                  value={editingMarketFeed.name}
                  onChange={e => setEditingMarketFeed({ ...editingMarketFeed, name: e.target.value })}
                  placeholder="e.g. Gold & Silver Bullion Rates"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={editingMarketFeed.category}
                    onChange={e => setEditingMarketFeed({ ...editingMarketFeed, category: e.target.value as any })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                  >
                    <option value="panchang">Drik Panchang</option>
                    <option value="gold_silver">Gold & Silver Bullion</option>
                    <option value="vegetable">Vegetables</option>
                    <option value="fuel">Fuel & Gas</option>
                    <option value="mandi">Crops & Mandi</option>
                    <option value="custom">Custom Commodity / Rate</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">Provider Protocol</label>
                  <select
                    value={editingMarketFeed.providerType}
                    onChange={e => setEditingMarketFeed({ ...editingMarketFeed, providerType: e.target.value as any })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                  >
                    <option value="api">Live JSON API</option>
                    <option value="rss">Govt / Mandi RSS Feed</option>
                    <option value="scraper">Live Scraper Protocol</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700">Source Badge Label</label>
                <input
                  type="text"
                  value={editingMarketFeed.badge}
                  onChange={e => setEditingMarketFeed({ ...editingMarketFeed, badge: e.target.value })}
                  placeholder="e.g. Agmarknet (Govt) or IBJA Benchmark"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Feed URL / Endpoint</label>
                <input
                  type="text"
                  value={editingMarketFeed.feedUrl}
                  onChange={e => setEditingMarketFeed({ ...editingMarketFeed, feedUrl: e.target.value })}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-mono text-[11px] outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Summary Description</label>
                <textarea
                  rows={2}
                  value={editingMarketFeed.description}
                  onChange={e => setEditingMarketFeed({ ...editingMarketFeed, description: e.target.value })}
                  placeholder="Items or rates tracked by this card..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setEditingMarketFeed(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setMarketFeeds(marketFeeds.map(f => (f.id === editingMarketFeed.id ? editingMarketFeed : f)));
                  setEditingMarketFeed(null);
                  toast.success("Market feed updated");
                }}
                className="px-5 py-2 rounded-xl bg-amber-600 text-xs font-black text-white hover:bg-amber-700"
              >
                Save Market Feed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT THOUGHT OF THE DAY                                          */}
      {/* ========================================================================= */}
      {editingThought && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-800">Edit Inspirational Thought</h3>
              <button onClick={() => setEditingThought(null)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Author / Thinker Name</label>
                <input
                  type="text"
                  value={editingThought.author}
                  onChange={e => setEditingThought({ ...editingThought, author: e.target.value })}
                  placeholder="e.g. स्वामी विवेकानंद"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Quote Text</label>
                <textarea
                  rows={4}
                  value={editingThought.quote}
                  onChange={e => setEditingThought({ ...editingThought, quote: e.target.value })}
                  placeholder="प्रेरक विचार यहाँ लिखें..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-semibold text-slate-800 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setEditingThought(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setThoughtList(thoughtList.map(t => (t.id === editingThought.id ? editingThought : t)));
                  setEditingThought(null);
                  toast.success("Thought updated");
                }}
                className="px-5 py-2 rounded-xl bg-amber-600 text-xs font-black text-white hover:bg-amber-700"
              >
                Save Thought
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT MARQUEE NEWS                                                */}
      {/* ========================================================================= */}
      {editingMarquee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-800">Edit Marquee News Feed</h3>
              <button onClick={() => setEditingMarquee(null)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Ticker Label</label>
                <input
                  type="text"
                  value={editingMarquee.label}
                  onChange={e => setEditingMarquee({ ...editingMarquee, label: e.target.value })}
                  placeholder="e.g. PIB National News"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Ticker Type</label>
                <select
                  value={editingMarquee.type}
                  onChange={e => setEditingMarquee({ ...editingMarquee, type: e.target.value as any })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium outline-none"
                >
                  <option value="rss">Live RSS Feed URL</option>
                  <option value="custom_text">Custom Announcement / Alert Text</option>
                </select>
              </div>
              {editingMarquee.type === "rss" ? (
                <div>
                  <label className="font-bold text-slate-700">RSS Feed URL</label>
                  <input
                    type="text"
                    value={editingMarquee.feedUrl || ""}
                    onChange={e => setEditingMarquee({ ...editingMarquee, feedUrl: e.target.value })}
                    placeholder="https://..."
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-mono text-[11px] outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="font-bold text-slate-700">Announcement Headline Text</label>
                  <textarea
                    rows={3}
                    value={editingMarquee.customText || ""}
                    onChange={e => setEditingMarquee({ ...editingMarquee, customText: e.target.value })}
                    placeholder="Type urgent announcement or headline..."
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-semibold outline-none"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setEditingMarquee(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setMarqueeList(marqueeList.map(m => (m.id === editingMarquee.id ? editingMarquee : m)));
                  setEditingMarquee(null);
                  toast.success("Marquee feed updated");
                }}
                className="px-5 py-2 rounded-xl bg-amber-600 text-xs font-black text-white hover:bg-amber-700"
              >
                Save Marquee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REUSABLE VISUAL ICON PICKER MODAL */}
      <IconPickerModal
        isOpen={iconPickerOpen}
        onClose={() => {
          setIconPickerOpen(false);
          setCurrentIconTarget(null);
        }}
        selectedIcon={currentIconTarget?.currentIcon || ""}
        onSelectIcon={newIconName => {
          if (!currentIconTarget) return;
          if (currentIconTarget.type === "quick_access") {
            setQuickAccessItems(
              quickAccessItems.map(q => (q.id === currentIconTarget.id ? { ...q, icon: newIconName } : q))
            );
          } else if (currentIconTarget.type === "impact_stat") {
            setImpactStats(
              impactStats.map(st => (st.id === currentIconTarget.id ? { ...st, iconName: newIconName } : st))
            );
          } else if (currentIconTarget.type === "impact_domain") {
            setImpactDomains(
              impactDomains.map(dm => (dm.id === currentIconTarget.id ? { ...dm, iconName: newIconName } : dm))
            );
          }
          toast.success(`Icon changed to ${newIconName}`);
        }}
      />
    </div>
  );
}