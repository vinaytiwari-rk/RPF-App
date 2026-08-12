// Replaced Firebase with backend API polling for full portability
import React, { createContext, useContext, useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   Types
═══════════════════════════════════════════════════════════════ */
export interface CarouselSlide {
  titleEn: string;
  titleHi: string;
  subEn: string;
  subHi: string;
  image: string;
}

export interface SocialDirectoryItem {
  name: string;
  platform: string;
  handle: string;
  url: string;
  descEn: string;
  descHi: string;
}

export interface NotificationItem {
  id: string;
  type: "info" | "success" | "warning" | "urgent";
  titleEn: string;
  titleHi: string;
  bodyEn: string;
  bodyHi: string;
  createdAt: string;
  read: boolean;
}

export interface TestimonialItem {
  id: string;
  nameEn: string;
  nameHi: string;
  villageEn: string;
  villageHi: string;
  quoteEn: string;
  quoteHi: string;
}

export interface FaqItem {
  id: string;
  questionEn: string;
  questionHi: string;
  answerEn: string;
  answerHi: string;
}

export interface CmsConfig {
  alertBannerEn: string;
  alertBannerHi: string;
  founderName: string;
  founderDesignation: string;
  founderImgUrl: string;
  carouselSlides: CarouselSlide[];
  customServices: any[];
  socialDirectory?: SocialDirectoryItem[];
  notifications?: NotificationItem[];
  testimonials?: TestimonialItem[];
  faqs?: FaqItem[];
  aboutTextEn?: string;
  aboutTextHi?: string;
  logoImgUrl?: string;
  homeServices?: any[];
  quoteOfTheDayEn?: string;
  quoteOfTheDayHi?: string;
  impactBottomTextEn?: string;
  impactBottomTextHi?: string;
  statsOffsets?: {
    beneficiaries: number;
    volunteers: number;
    healthCamps: number;
    campaigns: number;
  };
}

export interface Settings {
  tollFree: string;
  webUrl: string;
  email: string;
  founderMessageEn: string;
  founderMessageHi: string;
  helplinesMarquee?: string;
  founderImgUrl?: string;
  alertBannerEn?: string;
  alertBannerHi?: string;
  carouselSlides?: any[];
  customServices?: any[];
}

export interface SocialLink {
  platform: string;
  label: string;
  url: string;
  icon?: string;
}

export interface SocialPost {
  id: string;
  author: string;
  role: string;
  avatar: string;
  time: string;
  textEn: string;
  textHi: string;
  image: string;
  likes: number;
  commentsCount: number;
  liked?: boolean;
  createdAt?: string;
  link?: string;
  platform?: string;
}

export interface Grievance {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  status: "Pending" | "In Progress" | "Resolved";
  citizenName: string;
  createdAt: string;
}

export interface CardApplication {
  userId: string;
  name: string;
  gender: string;
  dob: string;
  address: string;
  idType: string;
  idNumber: string;
  status: "pending" | "approved" | "rejected";
  cardNo?: string;
}

/* ─── Default values (never left as undefined) ─── */
const DEFAULT_SETTINGS: Settings = {
  tollFree: "1800-569-0991",
  webUrl: "www.therpfoundation.org",
  email: "info@therpfoundation.org",
  founderMessageEn:
    "Our mission is simple – to serve humanity with sincerity, build strong communities, and create a better tomorrow for India.",
  founderMessageHi:
    "हमारा उद्देश्य सरल है - निष्ठा के साथ मानवता की सेवा करना, मजबूत समुदायों का निर्माण करना और भारत के प्रत्येक नागरिक के लिए एक बेहतर कल का निर्माण करना।",
  helplinesMarquee: "RP Foundation Toll Free Number: 1800-569-0991, CM Helpline: 181, Emergency Response Support System: 112, Women Helpline: 1090, Ambulance: 108/102, Police Helpline: 100, Fire Emergency: 101, Child Helpline: 1098, Railway Inqury : 139, Airlines Enquiry : 143, Blood Bank: 1910, Voter Helpline: 1950, Cyber Crime Helpline : 1930, LPG Leak Line Helpline: 1906, Natinal Consumer Helpline: 1915, National Narcotis Helpline: 1933, Natural Calaities Helpline: 1070, Road Accident Helpline: 1073",
};

const DEFAULT_CMS_CONFIG: CmsConfig = {
  alertBannerEn: "",
  alertBannerHi: "",
  founderName: "Rohit Pandit",
  founderDesignation: "Founder, RP Foundation",
  founderImgUrl: "/assets/founder.png",
  carouselSlides: [
    {
      titleEn: "Together, We Build a Better Tomorrow",
      titleHi: "एक बेहतर कल के लिए साथ मिलकर आगे बढ़ें",
      subEn: "Empowering lives. Strengthening communities.",
      subHi: "जीवन को सशक्त बनाना। समुदायों को सुदृढ़ करना।",
      image: "/assets/mega_camp_banner.png"
    },
    {
      titleEn: "Building a Better Tomorrow for Every Citizen",
      titleHi: "प्रत्येक नागरिक के लिए एक बेहतर कल का निर्माण",
      subEn: "We create healthier, stronger, and empowered communities.",
      subHi: "हम स्वस्थ, सशक्त और अधिक समृद्ध समाज का निर्माण करते हैं।",
      image: "/assets/water_pump_camp.png"
    }
  ],
  quoteOfTheDayEn: "Work is worship, and service is the greatest religion.",
  quoteOfTheDayHi: "कर्म ही पूजा है, और सेवा ही सबसे बड़ा धर्म है।",
  impactBottomTextEn: "Together, we are making a real difference in people's lives.",
  impactBottomTextHi: "हम सब मिलकर लोगों के जीवन में वास्तविक बदलाव ला रहे हैं।",
  statsOffsets: { beneficiaries: 0, volunteers: 0, healthCamps: 0, campaigns: 0 },
  customServices: [],
  socialDirectory: [],
  notifications: [],
  testimonials: []
};


const DEFAULT_SERVICES = [
  { id: "card", category: "welfare", iconName: "ShieldCheck", titleEn: "Jan Seva Card", titleHi: "जन सेवा कार्ड", descEn: "Apply for Foundational ID", descHi: "बुनियादी आईडी के लिए आवेदन" },
  { id: "blood", category: "urgent", iconName: "Heart", titleEn: "Blood Network", titleHi: "रक्त नेटवर्क", descEn: "Emergency Blood Donor Requests", descHi: "आपातकालीन रक्तदाता अनुरोध" },
  { id: "donations", category: "involved", iconName: "HandCoins", titleEn: "Donations", titleHi: "दान", descEn: "Support our causes directly", descHi: "हमारे कारणों का समर्थन करें" },
  { id: "grievance", category: "civic", iconName: "AlertTriangle", titleEn: "Grievances", titleHi: "शिकायतें", descEn: "Report Civic Issues", descHi: "नागरिक समस्याओं की रिपोर्ट" },
  { id: "volunteers", category: "involved", iconName: "Users", titleEn: "Volunteering", titleHi: "स्वयंसेवा", descEn: "Join the RP Force", descHi: "आरपी फोर्स से जुड़ें" },
  { id: "health-care", category: "welfare", iconName: "HeartPulse", titleEn: "Health Care", titleHi: "स्वास्थ्य सेवा", descEn: "Track health metrics & seek care", descHi: "स्वास्थ्य मापन एवं चिकित्सा" },
  { id: "jobs", category: "welfare", iconName: "Briefcase", titleEn: "Jobs Portal", titleHi: "रोजगार पोर्टल", descEn: "Find local employment opportunities", descHi: "स्थानीय रोजगार के अवसर खोजें" },
  { id: "environment", category: "involved", iconName: "TreePine", titleEn: "Environment", titleHi: "पर्यावरण", descEn: "Tree plantation drives", descHi: "वृक्षारोपण अभियान" },
  { id: "culture", category: "civic", iconName: "Landmark", titleEn: "Religious & Culture", titleHi: "धर्म और संस्कृति", descEn: "Festivals, sacred texts & live feeds", descHi: "त्यौहार, ग्रंथ और मंदिर लाइव" },
  { id: "disaster", category: "urgent", iconName: "AlertCircle", titleEn: "Disaster Management", titleHi: "आपदा प्रबंधन", descEn: "Emergency relief & rescue mapping", descHi: "आपातकालीन राहत एवं बचाव" },
  { id: "farmer", category: "welfare", iconName: "Sprout", titleEn: "Farmer Support", titleHi: "किसान सहयोग", descEn: "Crop diagnostic & market pricing", descHi: "कृषि सहायता और प्रशिक्षण" },
  { id: "schemes", category: "empowerment", iconName: "FileText", titleEn: "Government Schemes", titleHi: "सरकारी योजनाएं", descEn: "Eligibility calculator & guides", descHi: "लोन, कृषि और PM योजना कैलकुलेटर" },
  { id: "skills", category: "empowerment", iconName: "GraduationCap", titleEn: "Skills Training", titleHi: "कौशल प्रशिक्षण", descEn: "Tailoring, coding & courses", descHi: "सिलाई, कोडिंग और पाठ्यक्रम" },
  { id: "doc-scanner", category: "local", iconName: "Camera", titleEn: "Doc Scanner", titleHi: "दस्तावेज़ स्कैनर", descEn: "Scan and save offline", descHi: "ऑफ़लाइन स्कैन करें और सेव करें" },
  { id: "gps-toolkit", category: "local", iconName: "MapPin", titleEn: "GPS Toolkit", titleHi: "जीपीएस टूलकिट", descEn: "Offline location mapping", descHi: "ऑफ़लाइन स्थान मैपिंग" },
  { id: "vitals", category: "local", iconName: "Thermometer", titleEn: "Vitals Tracker", titleHi: "स्वास्थ्य ट्रैकर", descEn: "Track offline vitals", descHi: "ऑफ़लाइन स्वास्थ्य ट्रैकर" },
  { id: "resume-builder", category: "local", iconName: "Briefcase", titleEn: "Resume Builder", titleHi: "बायोडाटा मेकर", descEn: "Create offline resume", descHi: "ऑफ़लाइन बायोडाटा बनाएं" },
  { id: "medical-dict", category: "local", iconName: "Heart", titleEn: "Medical Dict", titleHi: "चिकित्सा शब्दकोश", descEn: "Offline medical terms", descHi: "ऑफ़लाइन चिकित्सा शब्दकोश" },
  { id: "women-safety", category: "urgent", iconName: "ShieldAlert", titleEn: "Women Safety", titleHi: "महिला सुरक्षा", descEn: "SOS & Location sharing", descHi: "एसओएस और स्थान साझा" },
  { id: "ai-chat", category: "empowerment", iconName: "Bot", titleEn: "RP AI Mitr", titleHi: "आरपी एआई मित्र", descEn: "AI Assistant", descHi: "एआई सहायक" }
];

const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  { platform: "founder_instagram", label: "Founder Instagram", url: "https://www.instagram.com/therohitpandit/" },
  { platform: "foundation_instagram", label: "Foundation Instagram", url: "https://www.instagram.com/rpfoundationofficial/" },
  { platform: "facebook", label: "Facebook Page", url: "https://www.facebook.com/rpfofficial" },
  { platform: "twitter", label: "X (Twitter)", url: "https://x.com/rpfoundation15" },
  { platform: "youtube", label: "YouTube Channel", url: "https://www.youtube.com/@rpfoundationofficial" },
];

// NOTE: A hardcoded DEFAULT_SOCIAL_POSTS array with fabricated posts, fake
// engagement numbers, and fake timestamps — attributed to the real founder —
// used to live here. It was never wired into any live state (socialPosts is
// only ever populated from /api/social), but it was dead-code fake content
// sitting in the source, so it has been removed entirely. socialPosts now
// only ever reflects what's actually in the database.

/* ═══════════════════════════════════════════════════════════════
   Context interface
═══════════════════════════════════════════════════════════════ */
interface AppContextType {
  loading: boolean;
  settings: Settings;
  globalSettings: any;
  announcements: any[];
  notifications: any[];
  cmsConfig: CmsConfig;
  servicesList: any[];
  isLoadingServices: boolean;
  socialPosts: SocialPost[];
  socialLinks: SocialLink[];
  grievances: Grievance[];
  cardApplications: CardApplication[];
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  updateCmsConfig: (newCms: CmsConfig) => Promise<void>;
  addSocialPost: (
    post: Omit<SocialPost, "id" | "time" | "likes" | "commentsCount" | "liked">
  ) => Promise<void>;
  likePost: (id: string) => Promise<void>;
  addGrievance: (
    grievance: Omit<Grievance, "id" | "status" | "createdAt">
  ) => Promise<void>;
  updateGrievanceStatus: (id: string, status: Grievance["status"]) => Promise<void>;
  submitCardApplication: (app: CardApplication) => Promise<void>;
  approveCardApplication: (userId: string) => string;
  rejectCardApplication: (userId: string) => void;
  refreshData: () => Promise<void>;
  userLocation: { city?: string; region?: string; country?: string; latitude?: string; longitude?: string } | null;
}

const AppContext = createContext<AppContextType | null>(null);

/* ═══════════════════════════════════════════════════════════════
   Provider
═══════════════════════════════════════════════════════════════ */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [globalSettings, setGlobalSettings] = useState<any>({});
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [cmsConfig, setCmsConfig] = useState<CmsConfig>(DEFAULT_CMS_CONFIG);
  const [servicesList, setServicesList] = useState<any[]>(DEFAULT_SERVICES);
  const [isLoadingServices, setIsLoadingServices] = useState<boolean>(false);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(DEFAULT_SOCIAL_LINKS);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [cardApplications, setCardApplications] = useState<CardApplication[]>([]);
  const [userLocation, setUserLocation] = useState<any>(null);

  const fetchAllData = async () => {
    try {
      // Fetch dynamic global settings
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const d = await res.json();
          if (d.data) {
            setGlobalSettings(d.data);
            // Apply CSS Variables
            const root = document.documentElement;
            if (d.data.primary_color) root.style.setProperty('--color-primary', d.data.primary_color);
            if (d.data.secondary_color) root.style.setProperty('--color-secondary', d.data.secondary_color);
            if (d.data.font_family) root.style.setProperty('--font-primary', d.data.font_family);
          }
        }
      } catch(e) {}

      // Fetch announcements
      try {
        const res = await fetch("/api/admin/announcements");
        if (res.ok) {
          const d = await res.json();
          if (d.data) setAnnouncements(d.data);
        }
      } catch(e) {}

      // 1. Settings
      const settingsRes = await fetch("/api/settings");
      if (settingsRes.ok) {
        const d = await settingsRes.json();
        if (d.settings) {
          setSettings((prev) => ({ ...DEFAULT_SETTINGS, ...prev, ...d.settings }));
        }
      }

      // 1b. CMS Config
      const cmsRes = await fetch("/api/cms");
      if (cmsRes.ok) {
        const d = await cmsRes.json();
        if (d.cms) {
          setCmsConfig((prev) => ({ ...DEFAULT_CMS_CONFIG, ...prev, ...d.cms }));
        }
      }
      
      // 2. Social Posts
      const socialRes = await fetch("/api/social");
      if (socialRes.ok) {
        const d = await socialRes.json();
        if (d.posts) {
          const list = d.posts;
          list.sort((a: any, b: any) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
          setSocialPosts(list);
        }
      }

      // 3. Grievances
      const grievancesRes = await fetch("/api/grievances");
      if (grievancesRes.ok) {
        const d = await grievancesRes.json();
        if (d.grievances) setGrievances(d.grievances);
      }

        // 4. Card Applications
        const cardsRes = await fetch("/api/cards");
        if (cardsRes.ok) {
          const d = await cardsRes.json();
          if (d.applications) setCardApplications(d.applications);
        }

        // 5. Services List
        try {
          const servicesRes = await fetch("/api/public/services");
          if (servicesRes.ok) {
            const d = await servicesRes.json();
            if (d.data) setServicesList(d.data);
          }
        } catch (e) {
          console.error("Failed to fetch services", e);
        } finally {
          setIsLoadingServices(false);
        }
      } catch (e) {
        console.error("AppContext: fetch error:", e);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 60000);
    
    // Fetch user location silently via free GeoJS API
    fetch("https://get.geojs.io/v1/ip/geo.json")
      .then(res => res.json())
      .then(data => {
        setUserLocation(data);
      })
      .catch(err => console.error("GeoJS error:", err));
      
    return () => clearInterval(interval);
  }, []);

  /* ═══════════════════════════════════════════════════════════════
     Action helpers
  ═══════════════════════════════════════════════════════════════ */
  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings)
      });
      setSettings((prev) => ({ ...prev, ...newSettings }));
    } catch (e) {
      console.error("updateSettings error:", e);
    }
  };

  const addSocialPost = async (
    post: Omit<SocialPost, "id" | "time" | "likes" | "commentsCount" | "liked">
  ) => {
    try {
      await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post)
      });
      fetchAllData();
    } catch (e) {
      console.error("addSocialPost error:", e);
    }
  };

  const likePost = async (id: string) => {
    try {
      await fetch("/api/social/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      setSocialPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, liked: !p.liked, likes: p.liked ? Math.max(0, p.likes - 1) : p.likes + 1 }
            : p
        )
      );
    } catch (e) {
      console.error("likePost error:", e);
    }
  };

  const addGrievance = async (
    grievance: Omit<Grievance, "id" | "status" | "createdAt">
  ) => {
    try {
      await fetch("/api/grievances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(grievance)
      });
      fetchAllData();
    } catch (e) {
      console.error("addGrievance error:", e);
    }
  };

  const updateGrievanceStatus = async (id: string, status: Grievance["status"]) => {
    try {
      await fetch("/api/grievances/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      setGrievances((prev) =>
        prev.map((g) => (g.id === id ? { ...g, status } : g))
      );
    } catch (e) {
      console.error("updateGrievanceStatus error:", e);
    }
  };

  const submitCardApplication = async (appVal: CardApplication) => {
    try {
      await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appVal)
      });
      fetchAllData();
    } catch (e) {
      console.error("submitCardApplication error:", e);
    }
  };

  const approveCardApplication = (userId: string): string => {
    const cardNumber =
      "0001 " +
      Math.floor(1000 + Math.random() * 9000) +
      " 0001 " +
      Math.floor(1000 + Math.random() * 9000);
    
    fetch("/api/cards/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    }).then(() => fetchAllData()).catch(console.error);

    return cardNumber;
  };

  const rejectCardApplication = (userId: string) => {
    fetch("/api/cards/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    }).then(() => fetchAllData()).catch(console.error);
  };

  const updateCmsConfig = async (newCms: CmsConfig) => {
    try {
      await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCms)
      });
      setCmsConfig(newCms);
    } catch (e) {
      console.error("updateCmsConfig error:", e);
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     Render
  ═══════════════════════════════════════════════════════════════ */
  return (
    <AppContext.Provider
      value={{
        loading,
        settings,
        globalSettings,
        announcements,
        cmsConfig,
        servicesList,
        isLoadingServices,
        socialPosts,
        socialLinks,
        grievances,
        cardApplications,
        updateSettings,
        updateCmsConfig,
        addSocialPost,
        likePost,
        addGrievance,
        updateGrievanceStatus,
        submitCardApplication,
        approveCardApplication,
        rejectCardApplication,
        refreshData: fetchAllData,
        userLocation,
        notifications: [],
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}



