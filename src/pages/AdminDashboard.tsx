import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { 
  ArrowLeft, Settings, Users, AlertTriangle, MessageSquare, 
  Check, X, Save, CheckCircle, Plus, Trash2, Image, 
  Download, BarChart2, ShieldAlert, Megaphone, Grid, Heart,
  Award, Bell
} from "lucide-react";

export default function AdminDashboard() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const navigate = useNavigate();
  
  const { 
    settings, updateSettings, cardApplications, grievances, refreshData, addSocialPost, cmsConfig, updateCmsConfig
  } = useApp();
  
  const { user } = useAuth();

  // Unified Tabs for Mobile Screen (9 tabs total, forming a clean 3x3 grid)
  const [activeTab, setActiveTab] = useState<"analytics" | "cms" | "settings" | "cards" | "grievances" | "services" | "campaigns" | "volunteers" | "comms">("analytics");
  
  // App Config States
  const [tollFree, setTollFree] = useState(settings?.tollFree || "1800-569-0991");
  const [webUrl, setWebUrl] = useState(settings?.webUrl || "www.therpfoundation.org");
  const [email, setEmail] = useState(settings?.email || "info@therpfoundation.org");
  const [founderEn, setFounderEn] = useState(settings?.founderMessageEn || "");
  const [founderHi, setFounderHi] = useState(settings?.founderMessageHi || "");
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // PREMIUM ADDS: Founder Image and Live Emergency Alert Banner Controller
  const [founderImgUrl, setFounderImgUrl] = useState(settings?.founderImgUrl || "/assets/founder.png");
  const [alertBannerEn, setAlertBannerEn] = useState(settings?.alertBannerEn || "");
  const [alertBannerHi, setAlertBannerHi] = useState(settings?.alertBannerHi || "");
  const [uploadingFounder, setUploadingFounder] = useState(false);
  const [uploadingSocial, setUploadingSocial] = useState(false);
  const [uploadingSlideIdx, setUploadingSlideIdx] = useState<number | null>(null);

  // Extended Settings States
  const [founderName, setFounderName] = useState(cmsConfig?.founderName || "Rohit Pandit");
  const [founderDesignation, setFounderDesignation] = useState(cmsConfig?.founderDesignation || "Founder, RP Foundation");

  // Campaigns states
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campTitleEn, setCampTitleEn] = useState("");
  const [campTitleHi, setCampTitleHi] = useState("");
  const [campGoal, setCampGoal] = useState<number>(100000);
  const [campRaised, setCampRaised] = useState<number>(0);
  const [campImg, setCampImg] = useState("/assets/water_pump_camp.png");
  const [campUrgent, setCampUrgent] = useState(false);
  const [campSuccess, setCampSuccess] = useState(false);
  const [uploadingCamp, setUploadingCamp] = useState(false);

  // Volunteers list state
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [volunteersSuccess, setVolunteersSuccess] = useState(false);
  const [taskTitleEn, setTaskTitleEn] = useState("");
  const [taskTitleHi, setTaskTitleHi] = useState("");
  const [taskDescEn, setTaskDescEn] = useState("");
  const [taskDescHi, setTaskDescHi] = useState("");
  const [taskPoints, setTaskPoints] = useState(10);
  const [assigningTaskFor, setAssigningTaskFor] = useState<string | null>(null);

  // Comms states (Notifications & Testimonials)
  const [notifTitleEn, setNotifTitleEn] = useState("");
  const [notifTitleHi, setNotifTitleHi] = useState("");
  const [notifBodyEn, setNotifBodyEn] = useState("");
  const [notifBodyHi, setNotifBodyHi] = useState("");
  const [notifType, setNotifType] = useState<"info" | "success" | "warning" | "urgent">("info");
  
  const [testNameEn, setTestNameEn] = useState("");
  const [testNameHi, setTestNameHi] = useState("");
  const [testVillageEn, setTestVillageEn] = useState("");
  const [testVillageHi, setTestVillageHi] = useState("");
  const [testQuoteEn, setTestQuoteEn] = useState("");
  const [testQuoteHi, setTestQuoteHi] = useState("");
  const [commsSuccess, setCommsSuccess] = useState(false);

  // FAQ States
  const [faqQuestionEn, setFaqQuestionEn] = useState("");
  const [faqQuestionHi, setFaqQuestionHi] = useState("");
  const [faqAnswerEn, setFaqAnswerEn] = useState("");
  const [faqAnswerHi, setFaqAnswerHi] = useState("");

  // About states
  const [aboutTextEn, setAboutTextEn] = useState("");
  const [aboutTextHi, setAboutTextHi] = useState("");
  const [logoImgUrl, setLogoImgUrl] = useState("/assets/logo.png");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Visual CMS Banner States
  const defaultSlides = [
    {
      titleEn: "Together, We Build a Better Tomorrow",
      titleHi: "एक बेहतर कल के लिए साथ मिलकर आगे बढ़ें",
      subEn: "Empowering lives. Strengthening communities.",
      subHi: "जीवन को सशक्त बनाना। समुदायों को सुदृढ़ करना।",
      image: "/assets/mega_camp_banner.png"
    }
  ];
  const [cmsSlides, setCmsSlides] = useState(settings?.carouselSlides || defaultSlides);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [cmsSuccess, setCmsSuccess] = useState(false);

  // Dynamic Welfare Services Builder States
  const [customServices, setCustomServices] = useState<any[]>(settings?.customServices || []);
  const [srvTitleEn, setSrvTitleEn] = useState("");
  const [srvTitleHi, setSrvTitleHi] = useState("");
  const [srvDescEn, setSrvDescEn] = useState("");
  const [srvDescHi, setSrvDescHi] = useState("");
  const [srvCategory, setSrvCategory] = useState("welfare");
  const [srvIcon, setSrvIcon] = useState("Heart");
  const [srvColor, setSrvColor] = useState("text-orange-600 bg-orange-50 border-orange-100");

  // Post & Job Broadcast States
  const [postTextEn, setPostTextEn] = useState("");
  const [postTextHi, setPostTextHi] = useState("");
  const [selectedImg, setSelectedImg] = useState("/assets/water_pump_camp.png");
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [jobSuccess, setJobSuccess] = useState(false);
  const [postPlatform, setPostPlatform] = useState<"instagram" | "facebook" | "x" | "youtube" | "website">("instagram");
  const [postLink, setPostLink] = useState("");

  const [jobTitleEn, setJobTitleEn] = useState("");
  const [jobTitleHi, setJobTitleHi] = useState("");
  const [jobCompany, setJobCompany] = useState("");
  const [jobSalary, setJobSalary] = useState("");
  const [jobLocEn, setJobLocEn] = useState("");
  const [jobLocHi, setJobLocHi] = useState("");
  const [jobTypeEn, setJobTypeEn] = useState("Full Time");
  const [jobTypeHi, setJobTypeHi] = useState("पूर्णकालिक");

  // Sync state variables with context database stream
  useEffect(() => {
    if (settings) {
      setTollFree(settings.tollFree || "");
      setWebUrl(settings.webUrl || "");
      setEmail(settings.email || "");
      setFounderEn(settings.founderMessageEn || "");
      setFounderHi(settings.founderMessageHi || "");
      setFounderImgUrl(settings.founderImgUrl || "/assets/founder.png");
      setAlertBannerEn(settings.alertBannerEn || "");
      setAlertBannerHi(settings.alertBannerHi || "");
      if (settings.carouselSlides) setCmsSlides(settings.carouselSlides);
      if (settings.customServices) setCustomServices(settings.customServices);
    }
  }, [settings]);

  useEffect(() => {
    if (cmsConfig) {
      if (cmsConfig.founderName) setFounderName(cmsConfig.founderName);
      if (cmsConfig.founderDesignation) setFounderDesignation(cmsConfig.founderDesignation);
      if (cmsConfig.aboutTextEn) setAboutTextEn(cmsConfig.aboutTextEn);
      if (cmsConfig.aboutTextHi) setAboutTextHi(cmsConfig.aboutTextHi);
      if (cmsConfig.logoImgUrl) setLogoImgUrl(cmsConfig.logoImgUrl);
    }
  }, [cmsConfig]);

  const fetchCampaignsAndVolunteers = async () => {
    try {
      const campRes = await fetch("/api/campaigns");
      if (campRes.ok) {
        const d = await campRes.json();
        setCampaigns(d.campaigns || []);
      }
      const volRes = await fetch("/api/volunteers");
      if (volRes.ok) {
        const d = await volRes.json();
        setVolunteers(d.volunteers || []);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns and volunteers:", err);
    }
  };

  useEffect(() => {
    fetchCampaignsAndVolunteers();
  }, []);

  // Analytics Realtime Aggregators
  const totalGrievances = grievances?.length || 0;
  const pendingGrievances = grievances?.filter(g => g.status === "Pending" || g.status === "pending")?.length || 0;
  const progressGrievances = grievances?.filter(g => g.status === "In Progress" || g.status === "in-progress")?.length || 0;
  const resolvedGrievances = grievances?.filter(g => g.status === "Resolved" || g.status === "resolved")?.length || 0;
  const pendingCards = cardApplications?.filter(c => c.status === "pending" || c.status === "Pending")?.length || 0;

  // 1. SAVE COMPREHENSIVE CONFIG & ADVANCED SETTINGS
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const settingsPayload = { 
        tollFree, webUrl, email, 
        founderMessageEn: founderEn, founderMessageHi: founderHi,
        founderImgUrl, alertBannerEn, alertBannerHi,
        carouselSlides: cmsSlides, customServices
      };
      
      const cmsPayload = {
        founderName,
        founderDesignation,
        aboutTextEn: cmsConfig?.aboutTextEn || aboutTextEn,
        aboutTextHi: cmsConfig?.aboutTextHi || aboutTextHi,
        logoImgUrl: cmsConfig?.logoImgUrl || logoImgUrl,
        notifications: cmsConfig?.notifications || [],
        testimonials: cmsConfig?.testimonials || [],
        socialDirectory: cmsConfig?.socialDirectory || [],
        faqs: cmsConfig?.faqs || []
      };

      const settingsRes = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsPayload)
      });

      const cmsRes = await fetch("/api/cms/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cmsPayload)
      });

      if (settingsRes.ok && cmsRes.ok) {
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
        refreshData();
      }
    } catch (err) {
      console.error("Failed to commit advanced system payload:", err);
    }
  };

  // 2. DYNAMIC WELFARE SERVICES CRUD CONTROLLER
  const handleAddCustomService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvTitleEn || !srvTitleHi) return;

    const newService = {
      id: `srv-${Math.floor(1000 + Math.random() * 9000)}`,
      titleEn: srvTitleEn, titleHi: srvTitleHi,
      descEn: srvDescEn, descHi: srvDescHi,
      category: srvCategory, iconName: srvIcon,
      color: srvColor, enabled: true
    };

    const updatedServices = [...customServices, newService];
    setCustomServices(updatedServices);

    try {
      await updateSettings({ ...settings, customServices: updatedServices });
      setSrvTitleEn(""); setSrvTitleHi(""); setSrvDescEn(""); setSrvDescHi("");
      refreshData();
    } catch (err) {
      console.error("Failed to inject new service schema:", err);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to remove this service module?")) return;
    const updated = customServices.filter(s => s.id !== id);
    setCustomServices(updated);
    await updateSettings({ ...settings, customServices: updated });
    refreshData();
  };

  const handleUpdateCardStatus = async (targetUserId: string, nextStatus: "approved" | "rejected") => {
    try {
      const cardNo = nextStatus === "approved" ? `JP-${Math.floor(100000 + Math.random() * 900000)}` : "";
      const response = await fetch("/api/cards/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId, status: nextStatus, cardNo })
      });
      if (response.ok) refreshData();
    } catch (err) {
      console.error("Card sync error:", err);
    }
  };

  const handleUpdateGrievance = async (id: string, nextStatus: "In Progress" | "Resolved") => {
    try {
      const response = await fetch("/api/grievances/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus })
      });
      if (response.ok) refreshData();
    } catch (err) {
      console.error("Grievance update error:", err);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitleEn || !jobCompany || !jobSalary || !jobLocEn) return;
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn: jobTitleEn, titleHi: jobTitleHi || jobTitleEn,
          company: jobCompany, salary: jobSalary,
          locEn: jobLocEn, locHi: jobLocHi || jobLocEn,
          typeEn: jobTypeEn, typeHi: jobTypeHi
        })
      });
      if (response.ok) {
        setJobSuccess(true);
        setJobTitleEn(""); setJobTitleHi(""); setJobCompany(""); setJobSalary(""); setJobLocEn(""); setJobLocHi("");
        setTimeout(() => setJobSuccess(false), 3000);
        refreshData();
      }
    } catch (err) {
      console.error("Error launching job node:", err);
    }
  };

  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTextEn || !postTextHi) return;
    addSocialPost({
      author: user?.name || "Admin", role: "RP Foundation Admin", avatar: "/assets/logo.png",
      textEn: postTextEn, textHi: postTextHi, image: selectedImg, link: postLink.trim() || undefined, platform: postPlatform
    });
    setPublishSuccess(true);
    setPostTextEn(""); setPostTextHi(""); setPostLink("");
    setTimeout(() => setPublishSuccess(false), 3000);
    refreshData();
  };

  // Campaigns CRUD handlers
  const handleAddCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campTitleEn || !campTitleHi) return;
    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn: campTitleEn,
          titleHi: campTitleHi,
          goalAmount: Number(campGoal),
          raisedAmount: Number(campRaised),
          imageUrl: campImg,
          urgent: campUrgent
        })
      });
      if (response.ok) {
        setCampSuccess(true);
        setCampTitleEn(""); setCampTitleHi(""); setCampGoal(100000); setCampRaised(0); setCampImg("/assets/water_pump_camp.png"); setCampUrgent(false);
        setTimeout(() => setCampSuccess(false), 3000);
        fetchCampaignsAndVolunteers();
      }
    } catch (err) {
      console.error("Error creating campaign:", err);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        fetchCampaignsAndVolunteers();
      }
    } catch (err) {
      console.error("Error deleting campaign:", err);
    }
  };

  // Volunteers points & delete handlers
  const handleUpdatePoints = async (id: string, currentPoints: number, delta: number) => {
    try {
      const response = await fetch(`/api/volunteers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: Math.max(0, currentPoints + delta) })
      });
      if (response.ok) {
        setVolunteersSuccess(true);
        setTimeout(() => setVolunteersSuccess(false), 2000);
        fetchCampaignsAndVolunteers();
      }
    } catch (err) {
      console.error("Error updating volunteer points:", err);
    }
  };

  const handleDeleteVolunteer = async (id: string) => {
    if (!confirm("Are you sure you want to remove this volunteer?")) return;
    try {
      const response = await fetch(`/api/volunteers/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        fetchCampaignsAndVolunteers();
      }
    } catch (err) {
      console.error("Error removing volunteer:", err);
    }
  };

  const handleAssignTask = async (e: React.FormEvent, volunteerId: string) => {
    e.preventDefault();
    if (!taskTitleEn || !taskDescEn) return;
    try {
      const response = await fetch("/api/volunteer_tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volunteerId,
          titleEn: taskTitleEn,
          titleHi: taskTitleHi || taskTitleEn,
          descriptionEn: taskDescEn,
          descriptionHi: taskDescHi || taskDescEn,
          points: taskPoints
        })
      });
      if (response.ok) {
        setAssigningTaskFor(null);
        setTaskTitleEn(""); setTaskTitleHi(""); setTaskDescEn(""); setTaskDescHi(""); setTaskPoints(10);
        setVolunteersSuccess(true);
        setTimeout(() => setVolunteersSuccess(false), 2000);
      }
    } catch (err) {
      console.error("Error assigning task:", err);
    }
  };

  // Comms (Notifications & Testimonials) handlers
  const handleAddNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitleEn || !notifBodyEn) return;
    try {
      const newNotif = {
        id: `notif-${Date.now()}`,
        type: notifType,
        titleEn: notifTitleEn,
        titleHi: notifTitleHi || notifTitleEn,
        bodyEn: notifBodyEn,
        bodyHi: notifBodyHi || notifBodyEn,
        createdAt: new Date().toISOString(),
        read: false
      };
      const updatedNotifications = [...(cmsConfig?.notifications || []), newNotif];
      
      const payload = {
        founderName,
        founderDesignation,
        aboutTextEn: cmsConfig?.aboutTextEn || aboutTextEn,
        aboutTextHi: cmsConfig?.aboutTextHi || aboutTextHi,
        logoImgUrl: cmsConfig?.logoImgUrl || logoImgUrl,
        notifications: updatedNotifications,
        testimonials: cmsConfig?.testimonials || [],
        socialDirectory: cmsConfig?.socialDirectory || [],
        faqs: cmsConfig?.faqs || []
      };
      
      const response = await fetch("/api/cms/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setCommsSuccess(true);
        setNotifTitleEn(""); setNotifTitleHi(""); setNotifBodyEn(""); setNotifBodyHi("");
        setTimeout(() => setCommsSuccess(false), 3000);
        refreshData();
      }
    } catch (err) {
      console.error("Error adding notification:", err);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;
    try {
      const updatedNotifications = (cmsConfig?.notifications || []).filter((n: any) => n.id !== id);
      const payload = {
        founderName,
        founderDesignation,
        aboutTextEn: cmsConfig?.aboutTextEn || aboutTextEn,
        aboutTextHi: cmsConfig?.aboutTextHi || aboutTextHi,
        logoImgUrl: cmsConfig?.logoImgUrl || logoImgUrl,
        notifications: updatedNotifications,
        testimonials: cmsConfig?.testimonials || [],
        socialDirectory: cmsConfig?.socialDirectory || [],
        faqs: cmsConfig?.faqs || []
      };
      const response = await fetch("/api/cms/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        refreshData();
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testNameEn || !testQuoteEn) return;
    try {
      const newTest = {
        id: `test-${Date.now()}`,
        nameEn: testNameEn,
        nameHi: testNameHi || testNameEn,
        villageEn: testVillageEn,
        villageHi: testVillageHi || testVillageEn,
        quoteEn: testQuoteEn,
        quoteHi: testQuoteHi || testQuoteEn
      };
      const updatedTestimonials = [...(cmsConfig?.testimonials || []), newTest];
      
      const payload = {
        founderName,
        founderDesignation,
        aboutTextEn: cmsConfig?.aboutTextEn || aboutTextEn,
        aboutTextHi: cmsConfig?.aboutTextHi || aboutTextHi,
        logoImgUrl: cmsConfig?.logoImgUrl || logoImgUrl,
        notifications: cmsConfig?.notifications || [],
        testimonials: updatedTestimonials,
        socialDirectory: cmsConfig?.socialDirectory || [],
        faqs: cmsConfig?.faqs || []
      };
      
      const response = await fetch("/api/cms/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setCommsSuccess(true);
        setTestNameEn(""); setTestNameHi(""); setTestVillageEn(""); setTestVillageHi(""); setTestQuoteEn(""); setTestQuoteHi("");
        setTimeout(() => setCommsSuccess(false), 3000);
        refreshData();
      }
    } catch (err) {
      console.error("Error adding testimonial:", err);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      const updatedTestimonials = (cmsConfig?.testimonials || []).filter((t: any) => t.id !== id);
      const payload = {
        founderName,
        founderDesignation,
        aboutTextEn: cmsConfig?.aboutTextEn || aboutTextEn,
        aboutTextHi: cmsConfig?.aboutTextHi || aboutTextHi,
        logoImgUrl: cmsConfig?.logoImgUrl || logoImgUrl,
        notifications: cmsConfig?.notifications || [],
        testimonials: updatedTestimonials,
        socialDirectory: cmsConfig?.socialDirectory || [],
        faqs: cmsConfig?.faqs || []
      };
      const response = await fetch("/api/cms/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        refreshData();
      }
    } catch (err) {
      console.error("Error deleting testimonial:", err);
    }
  };

  // About RP Foundation Details handler
  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        founderName,
        founderDesignation,
        aboutTextEn,
        aboutTextHi,
        logoImgUrl,
        notifications: cmsConfig?.notifications || [],
        testimonials: cmsConfig?.testimonials || [],
        socialDirectory: cmsConfig?.socialDirectory || [],
        faqs: cmsConfig?.faqs || []
      };
      const response = await fetch("/api/cms/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setCommsSuccess(true);
        setTimeout(() => setCommsSuccess(false), 3000);
        refreshData();
      }
    } catch (err) {
      console.error("Error saving about info:", err);
    }
  };

  // FAQ CRUD handlers
  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestionEn || !faqAnswerEn) return;
    try {
      const newFaq = {
        id: `faq-${Date.now()}`,
        questionEn: faqQuestionEn,
        questionHi: faqQuestionHi || faqQuestionEn,
        answerEn: faqAnswerEn,
        answerHi: faqAnswerHi || faqAnswerEn
      };
      const updatedFaqs = [...(cmsConfig?.faqs || []), newFaq];
      
      const payload = {
        founderName,
        founderDesignation,
        aboutTextEn,
        aboutTextHi,
        logoImgUrl,
        notifications: cmsConfig?.notifications || [],
        testimonials: cmsConfig?.testimonials || [],
        socialDirectory: cmsConfig?.socialDirectory || [],
        faqs: updatedFaqs
      };
      const response = await fetch("/api/cms/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setCommsSuccess(true);
        setFaqQuestionEn(""); setFaqQuestionHi(""); setFaqAnswerEn(""); setFaqAnswerHi("");
        setTimeout(() => setCommsSuccess(false), 3000);
        refreshData();
      }
    } catch (err) {
      console.error("Error adding FAQ:", err);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      const updatedFaqs = (cmsConfig?.faqs || []).filter((f: any) => f.id !== id);
      const payload = {
        founderName,
        founderDesignation,
        aboutTextEn,
        aboutTextHi,
        logoImgUrl,
        notifications: cmsConfig?.notifications || [],
        testimonials: cmsConfig?.testimonials || [],
        socialDirectory: cmsConfig?.socialDirectory || [],
        faqs: updatedFaqs
      };
      const response = await fetch("/api/cms/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        refreshData();
      }
    } catch (err) {
      console.error("Error deleting FAQ:", err);
    }
  };

  const exportToCSV = () => {
    if (!grievances || grievances.length === 0) return;
    const headers = "ID,Title,Category,Urgency,Status,Reporter,Date\n";
    const rows = grievances.map(g => `"${g.id}","${g.title}","${g.category}","${g.urgency}","${g.status}","${g.citizenName}","${g.createdAt}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `RP_Grievances_${new Date().toISOString().slice(0,10)}.csv`);
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn max-w-md mx-auto border-x border-slate-200 shadow-2xl">
      
      {/* Responsive Header Panel */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 pt-5 pb-5 px-5 relative shrink-0 text-white shadow-lg">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 active:scale-95 transition text-white">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="font-display font-black text-sm tracking-wide uppercase text-indigo-50">
                {lang === "hi" ? "एडमिन कमांड सेंटर" : "Admin Command HQ"}
              </h2>
              <p className="text-[8.5px] text-indigo-300 font-bold uppercase mt-0.5 tracking-widest">
                {lang === "hi" ? "पूर्ण नियंत्रण प्रणाली" : "FULL ARCHITECTURE CONTROL DESK"}
              </p>
            </div>
          </div>
          <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
            <ShieldAlert className="w-2.5 h-2.5" /> Secure
          </span>
        </div>
      </div>

      {/* 📱 3x3 GRID TABS: Resolves Mobile & iPhone Screen Cutting Bug */}
      <div className="bg-white border-b border-slate-200 p-2 grid grid-cols-3 gap-1.5 shrink-0 select-none shadow-sm">
        {[
          { key: "analytics", label: lang === "hi" ? "एनालिटिक्स" : "Insights", icon: BarChart2 },
          { key: "cms", label: lang === "hi" ? "बैनर CMS" : "Banners CMS", icon: Image },
          { key: "settings", label: lang === "hi" ? "ग्लोबल कंट्रोल" : "Global Control", icon: Settings },
          { key: "services", label: lang === "hi" ? "21+ सेवाएं" : "Services Node", icon: Grid },
          { key: "cards", label: lang === "hi" ? "कार्ड्स सूची" : "Cards Registry", icon: Users },
          { key: "grievances", label: lang === "hi" ? "शिकायत कक्ष" : "Grievances", icon: AlertTriangle },
          { key: "campaigns", label: lang === "hi" ? "दान अभियान" : "Campaigns", icon: Heart },
          { key: "volunteers", label: lang === "hi" ? "स्वयंसेवक" : "Volunteers", icon: Award },
          { key: "comms", label: lang === "hi" ? "घोषणाएं" : "Comms & Stories", icon: Bell }
        ].map(t => (
          <button 
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
              activeTab === t.key ? "bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/15" : "bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-200/40"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        
        {/* TAB: REAL-TIME OPERATIONAL ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-4 animate-fadeIn text-xs font-bold text-slate-700">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">Total Complaints</span>
                <span className="text-xl font-black text-slate-800 block mt-1">{totalGrievances}</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">Pending Jan Seva KYC</span>
                <span className="text-xl font-black text-amber-600 block mt-1">{pendingCards}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-[10px] font-black uppercase text-slate-800">Operational Summary</span>
                <button onClick={exportToCSV} className="bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                  <Download className="w-3 h-3" /> Export CSV
                </button>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Pending", count: pendingGrievances, color: "bg-amber-500", rawColor: "text-amber-600" },
                  { label: "In Progress", count: progressGrievances, color: "bg-blue-500", rawColor: "text-blue-600" },
                  { label: "Resolved / Closed", count: resolvedGrievances, color: "bg-green-500", rawColor: "text-green-600" }
                ].map(bar => {
                  const percentage = totalGrievances > 0 ? (bar.count / totalGrievances) * 100 : 0;
                  return (
                    <div key={bar.label} className="space-y-0.5">
                      <div className="flex justify-between text-[9px] uppercase font-black">
                        <span className="text-slate-500">{bar.label}</span>
                        <span className={bar.rawColor}>{bar.count} ({Math.round(percentage)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`${bar.color} h-full transition-all duration-300`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB: GLOBAL SYSTEM CONTROLS (FOUNDER, HELPLINE, ALERTS) */}
        {activeTab === "settings" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white p-5 border border-slate-200 rounded-3xl shadow-sm space-y-4">
              <h4 className="font-display font-black text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                Core Constants & Live Broadcast Banner
              </h4>

              {settingsSuccess && (
                <div className="bg-green-50 text-green-700 p-2 rounded-lg text-xs font-bold text-center animate-fadeIn">
                  System Settings Transmitted Successfully!
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-bold text-slate-700">
                {/* Emergency Broadcast Marquee Controls */}
                <div className="bg-red-50/50 border border-red-200 p-3.5 rounded-2xl space-y-3">
                  <span className="text-[9px] font-black text-red-700 uppercase tracking-wider flex items-center gap-1">
                    <Megaphone className="w-3.5 h-3.5" /> Emergency Marquee Alert Headline / अलर्ट हेडलाइन
                  </span>
                  <div className="space-y-2">
                    <input type="text" value={alertBannerEn} onChange={e => setAlertBannerEn(e.target.value)} placeholder="Emergency Headline (English)" className="w-full border border-red-200 bg-white p-2.5 rounded-xl text-[11px]" />
                    <input type="text" value={alertBannerHi} onChange={e => setAlertBannerHi(e.target.value)} placeholder="आपातकालीन हेडलाइन (हिंदी)" className="w-full border border-red-200 bg-white p-2.5 rounded-xl text-[11px]" />
                  </div>
                </div>

                {/* Founder Image Input Control */}
                <div className="bg-slate-50 p-3 rounded-2xl space-y-2 border border-slate-200/60">
                  <label className="text-[9px] font-black text-slate-500 uppercase block">Founder Profile Image / संस्थापक की फोटो</label>
                  <div className="flex items-center gap-3">
                    {founderImgUrl && (
                      <img src={founderImgUrl} alt="Founder Preview" className="w-12 h-12 rounded-full object-cover border border-[#D4AF37]/50 shadow-sm" />
                    )}
                    <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-3 bg-white hover:bg-slate-50 cursor-pointer transition relative">
                      <span className="text-[10px] font-bold text-[#000080]">
                        {uploadingFounder ? "Uploading image..." : "Upload from Device / गैलरी से चुनें"}
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        disabled={uploadingFounder} 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingFounder(true);
                          try {
                            const formData = new FormData();
                            formData.append("file", file);
                            const res = await fetch("/api/upload/founder", {
                              method: "POST",
                              body: formData
                            });
                            if (!res.ok) throw new Error("Upload failed");
                            const data = await res.json();
                            setFounderImgUrl(data.url);
                          } catch (err) {
                            console.error("Founder image upload failed:", err);
                            alert("Upload failed. Please try again.");
                          } finally {
                            setUploadingFounder(false);
                          }
                        }} 
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Toll-Free Helpline</label>
                  <input type="text" value={tollFree} onChange={e => setTollFree(e.target.value)} className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl outline-none focus:border-indigo-600" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Website URL</label>
                    <input type="text" value={webUrl} onChange={e => setWebUrl(e.target.value)} className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Founder Name / संस्थापक का नाम</label>
                    <input type="text" value={founderName} onChange={e => setFounderName(e.target.value)} className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl outline-none focus:border-indigo-650" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Founder Designation / पद</label>
                    <input type="text" value={founderDesignation} onChange={e => setFounderDesignation(e.target.value)} className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl outline-none focus:border-indigo-650" />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Founder Message (EN / HI)</label>
                  <textarea value={founderEn} onChange={e => setFounderEn(e.target.value)} placeholder="Message EN" className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl min-h-[50px]" />
                  <textarea value={founderHi} onChange={e => setFounderHi(e.target.value)} placeholder="सन्देश HI" className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl min-h-[50px] mt-2" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-2xl uppercase font-black text-xs shadow-md cursor-pointer">
                  Commit System Changes Live
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB: 21+ WELFARE SERVICES CONTROLLER (CRUD ENGINE) */}
        {activeTab === "services" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white p-5 border border-slate-200 rounded-3xl shadow-sm space-y-4">
              <h4 className="font-display font-black text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-indigo-600" /> Dynamic Welfare Scheme Architect
              </h4>

              {/* Add Custom Welfare Scheme Form */}
              <form onSubmit={handleAddCustomService} className="space-y-3 text-xs font-bold text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/50">
                <span className="text-[9px] font-black text-slate-400 uppercase block tracking-wider">Deploy New Scheme Node</span>
                <div className="grid grid-cols-2 gap-2">
                  <input required type="text" value={srvTitleEn} onChange={e => setSrvTitleEn(e.target.value)} placeholder="Scheme Title (EN)" className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-[11px]" />
                  <input required type="text" value={srvTitleHi} onChange={e => setSrvTitleHi(e.target.value)} placeholder="योजना का नाम (HI)" className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-[11px]" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={srvDescEn} onChange={e => setSrvDescEn(e.target.value)} placeholder="Description (EN)" className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-[11px]" />
                  <input type="text" value={srvDescHi} onChange={e => setSrvDescHi(e.target.value)} placeholder="योजना विवरण (HI)" className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-[11px]" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select value={srvCategory} onChange={e => setSrvCategory(e.target.value)} className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-[11px]">
                    <option value="welfare">Welfare (जनकल्याण)</option>
                    <option value="urgent">Urgent Aid (आपातकालीन)</option>
                    <option value="empowerment">Empowerment (रोजगार/कौशल)</option>
                    <option value="civic">Civic Support (नागरिक सुविधा)</option>
                  </select>
                  <select value={srvIcon} onChange={e => setSrvIcon(e.target.value)} className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-[11px]">
                    <option value="Heart">Heart Icon</option>
                    <option value="Briefcase">Briefcase Icon</option>
                    <option value="Info">Info Badge Icon</option>
                    <option value="Users">Users Network Icon</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-green-600 text-white py-2.5 rounded-xl uppercase font-black text-[10px] shadow-sm flex items-center justify-center gap-1 cursor-pointer">
                  <Plus className="w-4 h-4" /> Inject New Welfare Module
                </button>
              </form>

              {/* List of active custom injected schemes */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Active Dynamic Nodes</span>
                {customServices.map((srv) => (
                  <div key={srv.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-2xl bg-white shadow-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0"><Heart className="w-4 h-4" /></div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs text-slate-800 truncate">{lang === "hi" ? srv.titleHi : srv.titleEn}</p>
                        <p className="text-[9px] text-slate-400 uppercase font-black leading-none mt-0.5">{srv.category}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteService(srv.id)} className="text-red-600 p-1.5 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100 transition shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {customServices.length === 0 && (
                  <p className="text-slate-400 text-[10.5px] text-center font-bold py-2">No custom schemes appended yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: VISUAL CMS BANNER MATRIX */}
        {activeTab === "cms" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-lg space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h4 className="font-display font-extrabold text-xs text-slate-800 uppercase tracking-widest">Banners Slider Matrix</h4>
                <button
                  type="button"
                  onClick={async () => {
                    const newSlide = {
                      titleEn: "Empowering Rural Communities", titleHi: "ग्रामीण समुदायों को सशक्त बनाना",
                      subEn: "Clean drinking water & free clinics.", subHi: "स्वच्छ पेयजल और निःशुल्क क्लीनिक।",
                      image: "/assets/mega_camp_banner.png"
                    };
                    const updated = [...cmsSlides, newSlide]; setCmsSlides(updated);
                    await updateSettings({ ...settings, carouselSlides: updated });
                    setEditingSlideIndex(updated.length - 1);
                    setCmsSuccess(true); setTimeout(() => setCmsSuccess(false), 2000);
                  }}
                  className="bg-green-600 text-white text-[9px] font-black uppercase px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3 h-3" /> Add Slide
                </button>
              </div>

              {cmsSuccess && <div className="bg-green-50 text-green-700 p-2 rounded-lg text-xs font-bold text-center">CMS Sync Complete!</div>}

              <div className="space-y-2.5">
                {cmsSlides.map((slide, idx) => {
                  const isEditing = editingSlideIndex === idx;
                  return (
                    <div key={idx} className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between p-3 bg-slate-50/50">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={slide.image} alt="Preview" className="w-8 h-8 object-cover rounded-lg border border-slate-200 shrink-0" />
                          <p className="font-extrabold text-xs text-slate-800 truncate">{lang === "hi" ? slide.titleHi : slide.titleEn}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setEditingSlideIndex(isEditing ? null : idx)} className="bg-white border border-slate-200 text-slate-700 text-[9px] font-black px-2 py-1 rounded-md">
                            {isEditing ? "Close" : "Edit"}
                          </button>
                          <button type="button" onClick={async () => {
                            if (confirm("Purge slide node?")) {
                              const updated = cmsSlides.filter((_, i) => i !== idx); setCmsSlides(updated);
                              await updateSettings({ ...settings, carouselSlides: updated });
                            }
                          }} className="bg-red-50 text-red-600 p-1 rounded-md border border-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="p-4 border-t border-slate-100 space-y-3 text-xs font-bold text-slate-700">
                          <input type="text" value={slide.titleEn} onChange={(e) => { const updated = [...cmsSlides]; updated[idx].titleEn = e.target.value; setCmsSlides(updated); }} placeholder="Title EN" className="w-full border border-slate-200 p-2.5 rounded-xl" />
                          <input type="text" value={slide.titleHi} onChange={(e) => { const updated = [...cmsSlides]; updated[idx].titleHi = e.target.value; setCmsSlides(updated); }} placeholder="शीर्षक HI" className="w-full border border-slate-200 p-2.5 rounded-xl" />
                          <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                            <label className="text-[9px] font-black text-slate-500 uppercase block">Slide Image / स्लाइड की फोटो</label>
                            <div className="flex items-center gap-2">
                              {slide.image && (
                                <img src={slide.image} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                              )}
                              <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-lg p-2 bg-white hover:bg-slate-50 cursor-pointer">
                                <span className="text-[9px] font-bold text-[#000080]">
                                  {uploadingSlideIdx === idx ? "Uploading..." : "Upload from Device / गैलरी से चुनें"}
                                </span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  disabled={uploadingSlideIdx !== null} 
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setUploadingSlideIdx(idx);
                                    try {
                                      const formData = new FormData();
                                      formData.append("file", file);
                                      const res = await fetch("/api/upload/broadcast", {
                                        method: "POST",
                                        body: formData
                                      });
                                      if (!res.ok) throw new Error();
                                      const data = await res.json();
                                      const updated = [...cmsSlides];
                                      updated[idx].image = data.url;
                                      setCmsSlides(updated);
                                    } catch (err) {
                                      alert("Upload failed");
                                    } finally {
                                      setUploadingSlideIdx(null);
                                    }
                                  }} 
                                />
                              </label>
                            </div>
                          </div>
                          <button type="button" onClick={async () => { await updateSettings({ ...settings, carouselSlides: cmsSlides }); setEditingSlideIndex(null); setCmsSuccess(true); setTimeout(() => setCmsSuccess(false), 2000); }} className="w-full bg-indigo-600 text-white py-2 rounded-xl text-[10px] font-black uppercase">Commit Slide</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB: JAN SEVA CARD REGISTER (KYC APPR) */}
        {activeTab === "cards" && (
          <div className="space-y-3 animate-fadeIn">
            {cardApplications?.filter(a => a.status === "pending" || a.status === "Pending")?.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-400 py-10">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-1.5 opacity-50" />
                <p className="text-xs font-bold">No pending card registrations found.</p>
              </div>
            ) : (
              cardApplications?.filter(a => a.status === "pending" || a.status === "Pending")?.map(app => (
                <div key={app.userId} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                    <div>
                      <h5 className="font-display font-black text-xs text-slate-800">{app.name}</h5>
                      <span className="text-[8px] font-black text-slate-400 uppercase block mt-0.5">{app.gender} / DOB: {app.dob}</span>
                    </div>
                    <span className="text-[8px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase">Pending KYC</span>
                  </div>
                  <div className="space-y-0.5 text-[10px] font-bold text-slate-500">
                    <p><span className="text-slate-400 font-black text-[8.5px] uppercase">Address:</span> {app.address}</p>
                    <p><span className="text-slate-400 font-black text-[8.5px] uppercase">{app.idType}:</span> <span className="font-mono text-slate-700">{app.idNumber}</span></p>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button onClick={() => handleUpdateCardStatus(app.userId, "approved")} className="bg-green-600 text-white text-[10px] font-black uppercase py-2 rounded-xl flex items-center justify-center gap-1 shadow-sm"><Check className="w-3.5 h-3.5" /> Approve</button>
                    <button onClick={() => handleUpdateCardStatus(app.userId, "rejected")} className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase py-2 rounded-xl flex items-center justify-center gap-1"><X className="w-3.5 h-3.5" /> Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: CIVIC GRIEVANCES TRIAGE DESK */}
        {activeTab === "grievances" && (
          <div className="space-y-3 animate-fadeIn">
            {grievances?.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs font-bold">No grievances logged.</div>
            ) : (
              grievances?.map(g => (
                <div key={g.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-2.5">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                    <h5 className="font-black text-xs text-slate-800 leading-tight pr-2">{g.title}</h5>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border shrink-0 ${
                      g.status === "Resolved" || g.status === "resolved" ? "bg-green-50 border-green-200 text-green-700" : g.status === "In Progress" || g.status === "in-progress" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-amber-50 border-amber-200 text-amber-700"
                    }`}>{g.status}</span>
                  </div>
                  <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium bg-slate-50 p-2 rounded-xl">"{g.description}"</p>
                  <div className="flex justify-between items-center text-[8.5px] font-black text-slate-400 uppercase pt-1">
                    <span>Citizen: {g.citizenName || "Anonymous"}</span>
                    {(g.status !== "Resolved" && g.status !== "resolved") && (
                      <div className="flex gap-1">
                        {(g.status === "Pending" || g.status === "pending") && (
                          <button onClick={() => handleUpdateGrievance(g.id, "In Progress")} className="bg-blue-600 text-white px-2 py-0.5 rounded font-black">Triage</button>
                        )}
                        <button onClick={() => handleUpdateGrievance(g.id, "Resolved")} className="bg-green-600 text-white px-2 py-0.5 rounded font-black">Resolve</button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* BROADCAST INTERFACES (SOCIAL FEEDS & LIVE JOBS MANIFEST) */}
        {activeTab === "cms" && (
          <div className="border-t border-slate-200 pt-4 mt-4 space-y-4 text-xs font-bold text-slate-700">
            <div className="bg-white p-4 border border-slate-200 rounded-3xl shadow-sm space-y-4">
              <span className="text-[10px] font-black uppercase text-indigo-9A0 tracking-wider block">Global Post & Job Broadcast</span>
              
              {publishSuccess && <div className="bg-green-50 text-green-700 p-2 rounded-lg text-center">Broadcast Dispatched Successfully!</div>}
              
              <form onSubmit={handlePublishPost} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <select value={postPlatform} onChange={e => setPostPlatform(e.target.value as any)} className="w-full border border-slate-200 bg-slate-50 p-2 rounded-xl text-[11px]">
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="x">X (Twitter)</option>
                    <option value="website">Website</option>
                  </select>
                  <input type="url" value={postLink} onChange={e => setPostLink(e.target.value)} placeholder="Target Link URL" className="w-full border border-slate-200 bg-slate-50 p-2 rounded-xl text-[11px]" />
                </div>
                <textarea required value={postTextEn} onChange={e => setPostTextEn(e.target.value)} placeholder="Description EN" className="w-full border border-slate-200 p-2 rounded-xl min-h-[40px]" />
                <textarea required value={postTextHi} onChange={e => setPostTextHi(e.target.value)} placeholder="विवरण HI" className="w-full border border-slate-200 p-2 rounded-xl min-h-[40px]" />
                
                {/* Social Post Image Device Upload Selector */}
                <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <label className="text-[9px] font-black text-slate-500 uppercase block">Attached Post Image / फोटो अपलोड करें</label>
                  <div className="flex items-center gap-2">
                    {selectedImg && (
                      <img src={selectedImg} alt="Social Preview" className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-lg p-2 bg-white hover:bg-slate-50 cursor-pointer">
                      <span className="text-[9px] font-bold text-[#000080]">
                        {uploadingSocial ? "Uploading image..." : "Upload from Device / गैलरी से चुनें"}
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        disabled={uploadingSocial} 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingSocial(true);
                          try {
                            const formData = new FormData();
                            formData.append("file", file);
                            const res = await fetch("/api/upload/broadcast", {
                              method: "POST",
                              body: formData
                            });
                            if (!res.ok) throw new Error();
                            const data = await res.json();
                            setSelectedImg(data.url);
                          } catch (err) {
                            alert("Upload failed");
                          } finally {
                            setUploadingSocial(false);
                          }
                        }} 
                      />
                    </label>
                  </div>
                </div>

                <button type="submit" className="w-full bg-[#FF9933] text-white py-2 rounded-xl uppercase font-black text-[9px]">Publish Social Feed</button>
              </form>

              <form onSubmit={handlePostJob} className="border-t border-slate-100 pt-3 space-y-2">
                <span className="text-[9px] font-black text-indigo-900 uppercase block tracking-wider">Post Live Job Opportunity</span>
                {jobSuccess && <div className="bg-green-50 text-green-700 p-2 rounded-lg text-center text-[10px]">Job Deployed Successfully!</div>}
                <div className="grid grid-cols-2 gap-2">
                  <input required type="text" value={jobTitleEn} onChange={e => setJobTitleEn(e.target.value)} placeholder="Title EN" className="w-full border border-slate-200 p-2 rounded-xl text-[11px]" />
                  <input type="text" value={jobTitleHi} onChange={e => setJobTitleHi(e.target.value)} placeholder="शीर्षक HI" className="w-full border border-slate-200 p-2 rounded-xl text-[11px]" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input required type="text" value={jobCompany} onChange={e => setJobCompany(e.target.value)} placeholder="Company" className="w-full border border-slate-200 p-2 rounded-xl text-[11px]" />
                  <input required type="text" value={jobSalary} onChange={e => setJobSalary(e.target.value)} placeholder="Salary Range" className="w-full border border-slate-200 p-2 rounded-xl text-[11px]" />
                </div>
                <input required type="text" value={jobLocEn} onChange={e => setJobLocEn(e.target.value)} placeholder="Location EN" className="w-full border border-slate-200 p-2 rounded-xl text-[11px]" />
                <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-xl uppercase font-black text-[9px]">Deploy Job Opening</button>
              </form>
            </div>
          </div>
        )}

        {/* TAB: CAMPAIGNS CRUD CONTROLLER */}
        {activeTab === "campaigns" && (
          <div className="space-y-4 animate-fadeIn text-xs font-bold text-slate-700">
            <div className="bg-white p-5 border border-slate-200 rounded-3xl shadow-sm space-y-4">
              <h4 className="font-display font-black text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" /> Live Crowdfunding Banners
              </h4>

              {campSuccess && (
                <div className="bg-green-50 text-green-700 p-2 rounded-lg text-center">
                  Campaign Added Successfully!
                </div>
              )}

              <form onSubmit={handleAddCampaign} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Launch New Crowdfunding Drive</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <input required type="text" value={campTitleEn} onChange={e => setCampTitleEn(e.target.value)} placeholder="Campaign Title (EN)" className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-[11px]" />
                  <input required type="text" value={campTitleHi} onChange={e => setCampTitleHi(e.target.value)} placeholder="अभियान शीर्षक (HI)" className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-[11px]" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] uppercase tracking-wider text-slate-400 block mb-0.5">Target Goal (₹)</label>
                    <input required type="number" value={campGoal} onChange={e => setCampGoal(Number(e.target.value))} className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-[11px]" />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase tracking-wider text-slate-400 block mb-0.5">Already Raised (₹)</label>
                    <input required type="number" value={campRaised} onChange={e => setCampRaised(Number(e.target.value))} className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-[11px]" />
                  </div>
                </div>

                {/* Campaign Image Upload Selector */}
                <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-200/60">
                  <label className="text-[9px] font-black text-slate-500 uppercase block">Campaign Cover Image</label>
                  <div className="flex items-center gap-2">
                    {campImg && (
                      <img src={campImg} alt="Campaign Preview" className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-lg p-2 bg-white hover:bg-slate-50 cursor-pointer">
                      <span className="text-[9px] font-bold text-[#000080]">
                        {uploadingCamp ? "Uploading image..." : "Upload Cover / गैलरी से चुनें"}
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        disabled={uploadingCamp} 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingCamp(true);
                          try {
                            const formData = new FormData();
                            formData.append("file", file);
                            const res = await fetch("/api/upload/broadcast", {
                              method: "POST",
                              body: formData
                            });
                            if (!res.ok) throw new Error();
                            const data = await res.json();
                            setCampImg(data.url);
                          } catch (err) {
                            alert("Upload failed");
                          } finally {
                            setUploadingCamp(false);
                          }
                        }} 
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input type="checkbox" id="campUrgent" checked={campUrgent} onChange={e => setCampUrgent(e.target.checked)} className="rounded" />
                  <label htmlFor="campUrgent" className="text-[10px] text-red-600 uppercase font-black cursor-pointer select-none">Mark as URGENT emergency / आपातकालीन अभियान</label>
                </div>

                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl uppercase font-black text-[10px] tracking-wider transition">Deploy Giving Campaign</button>
              </form>

              {/* Active Campaigns Directory */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider mt-4">Active Crowdfunding Banners ({campaigns.length})</span>
                {campaigns.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 border border-slate-100 rounded-2xl bg-slate-50/50">No active campaigns.</div>
                ) : (
                  campaigns.map((c: any) => (
                    <div key={c.id} className="flex justify-between items-center bg-slate-50 border border-slate-200/80 p-3 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <img src={c.imageUrl || "/assets/water_pump_camp.png"} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <span className="font-extrabold text-slate-800 text-xs block">{c.titleEn}</span>
                          <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Goal: ₹{c.goalAmount} | Raised: ₹{c.raisedAmount}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteCampaign(c.id)} className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition active:scale-95">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: VOLUNTEERS CRM & POINTS CONTROLLER */}
        {activeTab === "volunteers" && (
          <div className="space-y-4 animate-fadeIn text-xs font-bold text-slate-700">
            <div className="bg-white p-5 border border-slate-200 rounded-3xl shadow-sm space-y-4">
              <h4 className="font-display font-black text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" /> Volunteer Points CRM
              </h4>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Registered Helpers ({volunteers.length})</span>
                {volunteers.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 border border-slate-100 rounded-2xl bg-slate-50/50">No registered volunteers found.</div>
                ) : (
                  volunteers.map((v: any) => (
                    <div key={v.id} className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl space-y-2.5">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-extrabold text-slate-800 text-xs block">{v.name}</span>
                          <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Role: {v.role} | Email: {v.email || "N/A"}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-amber-600 font-black block text-xs bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">{v.points || 0} pts</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-1.5 border-t border-slate-200/60 pt-2">
                        <button onClick={() => assigningTaskFor === v.id ? setAssigningTaskFor(null) : setAssigningTaskFor(v.id)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-[9px] uppercase font-black transition active:scale-95">Assign Task</button>
                        <button onClick={() => handleUpdatePoints(v.id, v.points || 0, -50)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 rounded-lg text-[9px] uppercase font-black transition active:scale-95">-50 Points</button>
                        <button onClick={() => handleUpdatePoints(v.id, v.points || 0, 50)} className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-lg text-[9px] uppercase font-black transition active:scale-95">+50 Points</button>
                        <button onClick={() => handleDeleteVolunteer(v.id)} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 px-2 py-1 rounded-lg transition active:scale-95"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>

                      {assigningTaskFor === v.id && (
                        <form onSubmit={(e) => handleAssignTask(e, v.id)} className="mt-3 bg-white border border-indigo-100 p-3 rounded-xl space-y-2 animate-fadeIn">
                          <input type="text" placeholder="Task Title (English)" required value={taskTitleEn} onChange={e => setTaskTitleEn(e.target.value)} className="w-full border border-slate-200 bg-slate-50 p-2 rounded-lg text-[10px]" />
                          <input type="text" placeholder="कार्य शीर्षक (Hindi)" value={taskTitleHi} onChange={e => setTaskTitleHi(e.target.value)} className="w-full border border-slate-200 bg-slate-50 p-2 rounded-lg text-[10px]" />
                          <textarea placeholder="Task Description" required value={taskDescEn} onChange={e => setTaskDescEn(e.target.value)} className="w-full border border-slate-200 bg-slate-50 p-2 rounded-lg text-[10px] h-16" />
                          <input type="number" placeholder="Points Reward" required min="10" value={taskPoints} onChange={e => setTaskPoints(Number(e.target.value))} className="w-full border border-slate-200 bg-slate-50 p-2 rounded-lg text-[10px]" />
                          <div className="flex gap-2 justify-end pt-1">
                            <button type="button" onClick={() => setAssigningTaskFor(null)} className="px-3 py-1.5 text-[9px] font-bold text-slate-500 hover:text-slate-700">CANCEL</button>
                            <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-black uppercase">Send Task</button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: COMMS & STORIES (NOTIFICATIONS & TESTIMONIALS) */}
        {activeTab === "comms" && (
          <div className="space-y-4 animate-fadeIn text-xs font-bold text-slate-700">
            <div className="bg-white p-5 border border-slate-200 rounded-3xl shadow-sm space-y-4">
              <h4 className="font-display font-black text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-indigo-600" /> Comms Control & Success Stories
              </h4>

              {commsSuccess && (
                <div className="bg-green-50 text-green-700 p-2 rounded-lg text-center">
                  Update published to database successfully!
                </div>
              )}

              {/* Push System Notification */}
              <form onSubmit={handleAddNotification} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
                <span className="text-[9px] font-black text-indigo-900 uppercase block tracking-wider">Push Global Inbox Notification</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <input required type="text" value={notifTitleEn} onChange={e => setNotifTitleEn(e.target.value)} placeholder="Alert Title (EN)" className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-[11px]" />
                  <input required type="text" value={notifTitleHi} onChange={e => setNotifTitleHi(e.target.value)} placeholder="अलर्ट शीर्षक (HI)" className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-[11px]" />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <textarea required value={notifBodyEn} onChange={e => setNotifBodyEn(e.target.value)} placeholder="Alert Description (EN)" className="w-full border border-slate-200 bg-white p-2.5 rounded-xl min-h-[40px] text-[11px]" />
                  <textarea required value={notifBodyHi} onChange={e => setNotifBodyHi(e.target.value)} placeholder="अलर्ट विवरण (HI)" className="w-full border border-slate-200 bg-white p-2.5 rounded-xl min-h-[40px] text-[11px]" />
                </div>

                <div className="flex gap-2">
                  {["info", "success", "warning", "urgent"].map(type => (
                    <button 
                      type="button" 
                      key={type} 
                      onClick={() => setNotifType(type as any)} 
                      className={`flex-1 py-1 rounded-md text-[9px] font-black uppercase border transition ${
                        notifType === type 
                          ? "bg-slate-900 text-white border-slate-950" 
                          : "bg-white text-slate-500 border-slate-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl uppercase font-black text-[9px] tracking-wider transition">Send Notification Alert</button>
              </form>

              {/* Add Success Story Testimonial */}
              <form onSubmit={handleAddTestimonial} className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/50">
                <span className="text-[9px] font-black text-amber-800 uppercase block tracking-wider">Publish Citizen Success Story</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <input required type="text" value={testNameEn} onChange={e => setTestNameEn(e.target.value)} placeholder="Citizen Name (EN)" className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-[11px]" />
                  <input required type="text" value={testNameHi} onChange={e => setTestNameHi(e.target.value)} placeholder="नागरिक का नाम (HI)" className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-[11px]" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={testVillageEn} onChange={e => setTestVillageEn(e.target.value)} placeholder="Village/Ward (EN)" className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-[11px]" />
                  <input type="text" value={testVillageHi} onChange={e => setTestVillageHi(e.target.value)} placeholder="गाँव/वार्ड (HI)" className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-[11px]" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <textarea required value={testQuoteEn} onChange={e => setTestQuoteEn(e.target.value)} placeholder="Success Quote (EN)" className="w-full border border-slate-200 bg-white p-2.5 rounded-xl min-h-[45px] text-[11px]" />
                  <textarea required value={testQuoteHi} onChange={e => setTestQuoteHi(e.target.value)} placeholder="सफलता की कहानी (HI)" className="w-full border border-slate-200 bg-white p-2.5 rounded-xl min-h-[45px] text-[11px]" />
                </div>

                <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-xl uppercase font-black text-[9px] tracking-wider transition">Publish Story</button>
              </form>

              {/* Manage Stories and Alerts Lists */}
              <div className="space-y-4 mt-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider mb-2">Live Notifications ({cmsConfig?.notifications?.length || 0})</span>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {(cmsConfig?.notifications || []).map((n: any) => (
                      <div key={n.id} className="flex justify-between items-center bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                        <div>
                          <span className="font-extrabold text-[11px] text-slate-800 block">{n.titleEn}</span>
                          <span className="text-[8.5px] text-slate-400 block">{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                        <button onClick={() => handleDeleteNotification(n.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider mb-2">Citizen Stories ({cmsConfig?.testimonials?.length || 0})</span>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {(cmsConfig?.testimonials || []).map((t: any) => (
                      <div key={t.id} className="flex justify-between items-center bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                        <div>
                          <span className="font-extrabold text-[11px] text-slate-800 block">{t.nameEn}</span>
                          <span className="text-[8.5px] text-slate-400 block">{t.villageEn || "Volunteer"}</span>
                        </div>
                        <button onClick={() => handleDeleteTestimonial(t.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* About RP Foundation Details */}
              <form onSubmit={handleSaveAbout} className="space-y-3 bg-indigo-50/40 p-4 rounded-2xl border border-indigo-200/40 mt-4">
                <span className="text-[9px] font-black text-indigo-950 uppercase block tracking-wider">Manage About Info & Logo</span>
                
                <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-slate-200/60">
                  <label className="text-[9px] font-black text-slate-500 uppercase block">Organization Logo / लोगो चित्र</label>
                  <div className="flex items-center gap-2">
                    {logoImgUrl && (
                      <img src={logoImgUrl} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-350 rounded-lg p-2 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                      <span className="text-[9px] font-bold text-[#000080]">
                        {uploadingLogo ? "Uploading..." : "Upload Logo Image / गैलरी से लोगो चुनें"}
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        disabled={uploadingLogo} 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingLogo(true);
                          try {
                            const formData = new FormData();
                            formData.append("file", file);
                            const res = await fetch("/api/upload/image", {
                              method: "POST",
                              body: formData
                            });
                            if (!res.ok) throw new Error();
                            const data = await res.json();
                            setLogoImgUrl(data.url);
                          } catch (err) {
                            alert("Logo upload failed");
                          } finally {
                            setUploadingLogo(false);
                          }
                        }} 
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <textarea required value={aboutTextEn} onChange={e => setAboutTextEn(e.target.value)} placeholder="About text (EN)" className="w-full border border-slate-200 bg-white p-2.5 rounded-xl min-h-[45px] text-[11px]" />
                  <textarea required value={aboutTextHi} onChange={e => setAboutTextHi(e.target.value)} placeholder="फाउंडेशन का विवरण (HI)" className="w-full border border-slate-200 bg-white p-2.5 rounded-xl min-h-[45px] text-[11px]" />
                </div>

                <button type="submit" className="w-full bg-[#000080] hover:bg-indigo-900 text-white py-2 rounded-xl uppercase font-black text-[9px] tracking-wider transition">Save About Details</button>
              </form>

              {/* Add FAQ Form */}
              <form onSubmit={handleAddFaq} className="space-y-3 bg-teal-50/40 p-4 rounded-2xl border border-teal-200/40 mt-4">
                <span className="text-[9px] font-black text-teal-900 uppercase block tracking-wider">Add Help & FAQ Question</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <input required type="text" value={faqQuestionEn} onChange={e => setFaqQuestionEn(e.target.value)} placeholder="Question (EN)" className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-[11px]" />
                  <input required type="text" value={faqQuestionHi} onChange={e => setFaqQuestionHi(e.target.value)} placeholder="प्रश्न (HI)" className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-[11px]" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <textarea required value={faqAnswerEn} onChange={e => setFaqAnswerEn(e.target.value)} placeholder="Answer (EN)" className="w-full border border-slate-200 bg-white p-2.5 rounded-xl min-h-[45px] text-[11px]" />
                  <textarea required value={faqAnswerHi} onChange={e => setFaqAnswerHi(e.target.value)} placeholder="उत्तर (HI)" className="w-full border border-slate-200 bg-white p-2.5 rounded-xl min-h-[45px] text-[11px]" />
                </div>

                <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-xl uppercase font-black text-[9px] tracking-wider transition">Add FAQ</button>
              </form>

              {/* FAQs List */}
              <div className="mt-4">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider mb-2">Live FAQs ({cmsConfig?.faqs?.length || 0})</span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {(cmsConfig?.faqs || []).map((f: any) => (
                    <div key={f.id} className="flex justify-between items-center bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-left">
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="font-extrabold text-[11px] text-slate-800 block truncate">Q: {f.questionEn}</span>
                        <span className="text-[9px] text-slate-500 block truncate">A: {f.answerEn}</span>
                      </div>
                      <button onClick={() => handleDeleteFaq(f.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition shrink-0"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}