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
}

export interface Settings {
  tollFree: string;
  webUrl: string;
  email: string;
  founderMessageEn: string;
  founderMessageHi: string;
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
  customServices: [],
  socialDirectory: [],
  notifications: [],
  testimonials: []
};

const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  { platform: "founder_instagram", label: "Founder Instagram", url: "https://www.instagram.com/therohitpandit/" },
  { platform: "foundation_instagram", label: "Foundation Instagram", url: "https://www.instagram.com/rpfoundationofficial/" },
  { platform: "facebook", label: "Facebook Page", url: "https://www.facebook.com/rpfofficial" },
  { platform: "twitter", label: "X (Twitter)", url: "https://x.com/rpfoundation15" },
  { platform: "youtube", label: "YouTube Channel", url: "https://www.youtube.com/@rpfoundationofficial" },
];

const DEFAULT_SOCIAL_POSTS: Omit<SocialPost, "id">[] = [
  {
    author: "Rohit Pandit",
    role: "Founder, RP Foundation",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    time: "2 hours ago",
    textEn: "Sharing highlights from our weekend tree plantation drive in Karond, Bhopal. Over 500 saplings planted! 🌳 Let's build a greener tomorrow.",
    textHi: "करौंद, भोपाल में हमारे सप्ताहांत वृक्षारोपण अभियान की कुछ झलकियाँ। 500 से अधिक पौधे लगाए गए! 🌳 आइए एक हरित कल का निर्माण करें।",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    likes: 412,
    commentsCount: 18,
    liked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    link: "https://www.instagram.com/therohitpandit/",
    platform: "instagram"
  },
  {
    author: "RP Foundation",
    role: "Official Page",
    avatar: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80",
    time: "1 day ago",
    textEn: "Successful free eye checkup camp conducted today at Sehore district. Over 200 patients received free consultations and medicines. 🩺💙",
    textHi: "सीहोर जिला अस्पताल में आज सफल निःशुल्क नेत्र जांच शिविर आयोजित किया गया। 200 से अधिक मरीजों को निःशुल्क परामर्श और दवाएं दी गईं। 🩺💙",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
    likes: 580,
    commentsCount: 34,
    liked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    link: "https://www.facebook.com/rpfofficial",
    platform: "facebook"
  },
  {
    author: "RP Foundation Official",
    role: "YouTube Channel",
    avatar: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80",
    time: "3 days ago",
    textEn: "New video out on our channel! Watch how our volunteers mask Aadhaar documents securely for the Jan Seva Card registration drives. 📺",
    textHi: "हमारे चैनल पर नया वीडियो आ गया है! देखें कि हमारे स्वयंसेवक जन सेवा कार्ड पंजीकरण के लिए आधार दस्तावेजों को कैसे सुरक्षित रखते हैं। 📺",
    image: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&w=800&q=80",
    likes: 890,
    commentsCount: 56,
    liked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    link: "https://www.youtube.com/@rpfoundationofficial",
    platform: "youtube"
  },
  {
    author: "RP Foundation",
    role: "Official X Page",
    avatar: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80",
    time: "4 days ago",
    textEn: "Follow us on X (Twitter) for real-time announcements, emergency relief requests, and community support stories! 🐦",
    textHi: "वास्तविक समय की घोषणाओं, आपातकालीन राहत अनुरोधों और सामुदायिक सहायता कहानियों के लिए हमें X (ट्विटर) पर फ़ॉलो करें! 🐦",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    likes: 312,
    commentsCount: 15,
    liked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    link: "https://x.com/rpfoundation15",
    platform: "x"
  },
  {
    author: "RP Foundation",
    role: "Instagram Updates",
    avatar: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80",
    time: "5 days ago",
    textEn: "Visual moments of change. Catch all our health camp highlights, volunteer profiles, and stories of impact! 📸",
    textHi: "बदलाव के दृश्य पल। हमारे सभी स्वास्थ्य शिविर की मुख्य विशेषताएं, स्वयंसेवक प्रोफाइल और प्रभाव की कहानियां देखें! 📸",
    image: "https://images.unsplash.com/photo-1469571486090-7db333894db6?auto=format&fit=crop&w=800&q=80",
    likes: 672,
    commentsCount: 29,
    liked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    link: "https://www.instagram.com/rpfoundationofficial/",
    platform: "instagram"
  }
];

/* ═══════════════════════════════════════════════════════════════
   Context interface
═══════════════════════════════════════════════════════════════ */
interface AppContextType {
  loading: boolean;
  settings: Settings;
  cmsConfig: CmsConfig;
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
}

const AppContext = createContext<AppContextType | null>(null);

/* ═══════════════════════════════════════════════════════════════
   Provider
═══════════════════════════════════════════════════════════════ */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [cmsConfig, setCmsConfig] = useState<CmsConfig>(DEFAULT_CMS_CONFIG);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(
    DEFAULT_SOCIAL_POSTS.map((p, idx) => ({ id: `default_sp_${idx}`, ...p }))
  );
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(DEFAULT_SOCIAL_LINKS);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [cardApplications, setCardApplications] = useState<CardApplication[]>([]);

  const fetchAllData = async () => {
    try {
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
    } catch (e) {
      console.error("AppContext: fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5000);
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
        cmsConfig,
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
