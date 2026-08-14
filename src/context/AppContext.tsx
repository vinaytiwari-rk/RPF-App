// Backend-backed application context. Empty data stays empty; the client never invents public records.
import React, { createContext, useContext, useState, useEffect } from "react";

export interface CarouselSlide { titleEn: string; titleHi: string; subEn: string; subHi: string; image: string; }
export interface SocialDirectoryItem { name: string; platform: string; handle: string; url: string; descEn: string; descHi: string; }
export interface NotificationItem { id: string; type: "info" | "success" | "warning" | "urgent"; titleEn: string; titleHi: string; bodyEn: string; bodyHi: string; createdAt: string; read: boolean; }
export interface TestimonialItem { id: string; nameEn: string; nameHi: string; villageEn: string; villageHi: string; quoteEn: string; quoteHi: string; }
export interface FaqItem { id: string; questionEn: string; questionHi: string; answerEn: string; answerHi: string; }

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

export interface SocialLink { platform: string; label: string; url: string; icon?: string; }
export interface SocialPost { id: string; author: string; role: string; avatar: string; time: string; textEn: string; textHi: string; image: string; likes: number; commentsCount: number; liked?: boolean; createdAt?: string; link?: string; platform?: string; }
export interface Grievance { id: string; title: string; description: string; category: string; urgency: string; status: "Pending" | "In Progress" | "Resolved"; citizenName: string; createdAt: string; }
export interface CardApplication { userId: string; name: string; gender: string; dob: string; address: string; idType: string; idNumber: string; status: "pending" | "approved" | "rejected"; cardNo?: string; }

// Defaults contain no public claims, sample records, statistics offsets or fabricated founder content.
const DEFAULT_SETTINGS: Settings = { tollFree: "", webUrl: "", email: "", founderMessageEn: "", founderMessageHi: "", helplinesMarquee: "" };
const DEFAULT_CMS_CONFIG: CmsConfig = { alertBannerEn: "", alertBannerHi: "", founderName: "", founderDesignation: "", founderImgUrl: "", carouselSlides: [], customServices: [], socialDirectory: [], notifications: [], testimonials: [], faqs: [] };

// Service definitions are navigation metadata, not user-generated records.
const DEFAULT_SERVICES = [
  ["card","welfare","ShieldCheck","Jan Seva Card","जन सेवा कार्ड"],["blood","urgent","Heart","Blood Network","रक्त नेटवर्क"],["donations","involved","HandCoins","Donations","दान"],["grievance","civic","AlertTriangle","Grievances","शिकायतें"],["volunteers","involved","Users","Volunteering","स्वयंसेवा"],["health-care","welfare","HeartPulse","Health Care","स्वास्थ्य सेवा"],["jobs","welfare","Briefcase","Jobs Portal","रोजगार पोर्टल"],["environment","involved","TreePine","Environment","पर्यावरण"],["culture","civic","Landmark","Religious & Culture","धर्म और संस्कृति"],["disaster","urgent","AlertCircle","Disaster Management","आपदा प्रबंधन"],["farmer","welfare","Sprout","Farmer Support","किसान सहयोग"],["schemes","empowerment","FileText","Government Schemes","सरकारी योजनाएं"],["skills","empowerment","GraduationCap","Skills Training","कौशल प्रशिक्षण"],["doc-scanner","local","Camera","Doc Scanner","दस्तावेज़ स्कैनर"],["gps-toolkit","local","MapPin","GPS Toolkit","जीपीएस टूलकिट"],["vitals","local","Thermometer","Vitals Tracker","स्वास्थ्य ट्रैकर"],["resume-builder","local","Briefcase","Resume Builder","बायोडाटा मेकर"],["medical-dict","local","Heart","Medical Dictionary","चिकित्सा शब्दकोश"],["women-safety","urgent","ShieldAlert","Women Safety","महिला सुरक्षा"],["ai-chat","empowerment","Bot","RP AI Mitr","आरपी एआई मित्र"]
].map(([id,category,iconName,titleEn,titleHi]) => ({ id, category, iconName, titleEn, titleHi, descEn: "", descHi: "" }));

const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  { platform: "founder_instagram", label: "Founder Instagram", url: "https://www.instagram.com/therohitpandit/" },
  { platform: "foundation_instagram", label: "Foundation Instagram", url: "https://www.instagram.com/rpfoundationofficial/" },
  { platform: "facebook", label: "Facebook Page", url: "https://www.facebook.com/rpfofficial" },
  { platform: "twitter", label: "X (Twitter)", url: "https://x.com/rpfoundation15" },
  { platform: "youtube", label: "YouTube Channel", url: "https://www.youtube.com/@rpfoundationofficial" },
];

interface AppContextType {
  loading: boolean; settings: Settings; globalSettings: any; announcements: any[]; notifications: any[]; cmsConfig: CmsConfig; servicesList: any[]; isLoadingServices: boolean; socialPosts: SocialPost[]; socialLinks: SocialLink[]; grievances: Grievance[]; cardApplications: CardApplication[];
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>; updateCmsConfig: (newCms: CmsConfig) => Promise<void>; addSocialPost: (post: Omit<SocialPost, "id" | "time" | "likes" | "commentsCount" | "liked">) => Promise<void>; likePost: (id: string) => Promise<void>; addGrievance: (grievance: Omit<Grievance, "id" | "status" | "createdAt">) => Promise<void>; updateGrievanceStatus: (id: string, status: Grievance["status"]) => Promise<void>; submitCardApplication: (app: CardApplication) => Promise<void>; approveCardApplication: (userId: string) => string; rejectCardApplication: (userId: string) => void; refreshData: () => Promise<void>; userLocation: { city?: string; region?: string; country?: string; latitude?: string; longitude?: string } | null;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [globalSettings, setGlobalSettings] = useState<any>({});
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [cmsConfig, setCmsConfig] = useState<CmsConfig>(DEFAULT_CMS_CONFIG);
  const [servicesList, setServicesList] = useState<any[]>(DEFAULT_SERVICES);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [socialLinks] = useState<SocialLink[]>(DEFAULT_SOCIAL_LINKS);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [cardApplications, setCardApplications] = useState<CardApplication[]>([]);
  const [userLocation] = useState<any>(null);

  const fetchAllData = async () => {
    try {
      try { const res = await fetch("/api/admin/settings"); if (res.ok) { const d = await res.json(); if (d.data) { setGlobalSettings(d.data); const root = document.documentElement; if (d.data.primary_color) root.style.setProperty('--color-primary', d.data.primary_color); if (d.data.secondary_color) root.style.setProperty('--color-secondary', d.data.secondary_color); if (d.data.font_family) root.style.setProperty('--font-primary', d.data.font_family); } } } catch {}
      try { const res = await fetch("/api/admin/announcements"); if (res.ok) { const d = await res.json(); if (Array.isArray(d.data)) setAnnouncements(d.data); } } catch {}
      const settingsRes = await fetch("/api/settings"); if (settingsRes.ok) { const d = await settingsRes.json(); if (d.settings) setSettings((prev) => ({ ...prev, ...d.settings })); }
      const cmsRes = await fetch("/api/cms"); if (cmsRes.ok) { const d = await cmsRes.json(); if (d.cms) setCmsConfig((prev) => ({ ...prev, ...d.cms })); }
      const socialRes = await fetch("/api/social"); if (socialRes.ok) { const d = await socialRes.json(); if (Array.isArray(d.posts)) { const list = [...d.posts].sort((a: any,b: any) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()); setSocialPosts(list); } }
      const grievancesRes = await fetch("/api/grievances"); if (grievancesRes.ok) { const d = await grievancesRes.json(); if (Array.isArray(d.grievances)) setGrievances(d.grievances); }
      const cardsRes = await fetch("/api/cards"); if (cardsRes.ok) { const d = await cardsRes.json(); if (Array.isArray(d.applications)) setCardApplications(d.applications); }
      try { setIsLoadingServices(true); const servicesRes = await fetch("/api/public/services"); if (servicesRes.ok) { const d = await servicesRes.json(); if (Array.isArray(d.data)) setServicesList(d.data); } } catch {} finally { setIsLoadingServices(false); }
    } catch (e) { console.error("AppContext fetch error:", e); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAllData();
    const interval = window.setInterval(fetchAllData, 5 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => { const res = await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newSettings) }); if (!res.ok) throw new Error("Failed to save settings"); setSettings((prev) => ({ ...prev, ...newSettings })); };
  const addSocialPost = async (post: Omit<SocialPost, "id" | "time" | "likes" | "commentsCount" | "liked">) => { const res = await fetch("/api/social", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(post) }); if (!res.ok) throw new Error("Failed to publish social post"); await fetchAllData(); };
  const likePost = async (id: string) => { const res = await fetch("/api/social/like", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); if (!res.ok) throw new Error("Failed to update reaction"); setSocialPosts((prev) => prev.map((p) => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? Math.max(0, p.likes - 1) : p.likes + 1 } : p)); };
  const addGrievance = async (grievance: Omit<Grievance, "id" | "status" | "createdAt">) => { const res = await fetch("/api/grievances", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(grievance) }); if (!res.ok) throw new Error("Failed to submit grievance"); await fetchAllData(); };
  const updateGrievanceStatus = async (id: string, status: Grievance["status"]) => { const res = await fetch("/api/grievances/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) }); if (!res.ok) throw new Error("Failed to update grievance"); setGrievances((prev) => prev.map((g) => g.id === id ? { ...g, status } : g)); };
  const submitCardApplication = async (appVal: CardApplication) => { const res = await fetch("/api/cards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(appVal) }); if (!res.ok) throw new Error("Failed to submit card application"); await fetchAllData(); };
  const approveCardApplication = (userId: string): string => { fetch("/api/cards/approve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) }).then((r) => { if (!r.ok) throw new Error("Approval failed"); return fetchAllData(); }).catch(console.error); return ""; };
  const rejectCardApplication = (userId: string) => { fetch("/api/cards/reject", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) }).then((r) => { if (!r.ok) throw new Error("Rejection failed"); return fetchAllData(); }).catch(console.error); };
  const updateCmsConfig = async (newCms: CmsConfig) => { const res = await fetch("/api/cms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newCms) }); if (!res.ok) throw new Error("Failed to save CMS"); setCmsConfig(newCms); };

  return <AppContext.Provider value={{ loading, settings, globalSettings, announcements, cmsConfig, servicesList, isLoadingServices, socialPosts, socialLinks, grievances, cardApplications, updateSettings, updateCmsConfig, addSocialPost, likePost, addGrievance, updateGrievanceStatus, submitCardApplication, approveCardApplication, rejectCardApplication, refreshData: fetchAllData, userLocation, notifications: [] }}>{children}</AppContext.Provider>;
}

export function useApp() { const context = useContext(AppContext); if (!context) throw new Error("useApp must be used within an AppProvider"); return context; }
