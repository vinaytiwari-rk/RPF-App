import React, { useEffect, useState } from "react";
import {
  ClipboardList,
  Settings2,
  CheckCircle,
  XCircle,
  Trash2,
  Edit3,
  Plus,
  ShieldOff,
  Bell,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  Info,
  Calendar,
  Award,
  Briefcase,
  Image,
  Heart,
  Save,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

/* ─────────────────────────────────────────────────────────────
   TAB CONFIGURATION
   ───────────────────────────────────────────────────────────── */
const TABS = [
  { id: "inbox", label: "Inbox & Approvals", Icon: ClipboardList },
  { id: "marquee_banner", label: "Alerts & Carousel", Icon: Bell },
  { id: "services_cms", label: "Welfare Services", Icon: Settings2 },
  { id: "campaigns_cms", label: "Campaigns", Icon: Heart },
  { id: "jobs_camps", label: "Jobs & Camps", Icon: Briefcase },
  { id: "social_cms", label: "Social Updates", Icon: Image },
  { id: "volunteers", label: "Volunteers Network", Icon: Award }
];

export default function AdminDashboard() {
  const { user, hasAdminAccess, isLoading } = useAuth();
  const { cmsConfig, updateCmsConfig, socialPosts, fetchAllData } = useApp();
  const [activeTab, setActiveTab] = useState("inbox");
  const [msg, setMsg] = useState("");

  // Submissions & Grievances State
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [grievances, setGrievances] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [camps, setCamps] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Forms states
  const [uploadingSlide, setUploadingSlide] = useState(false);
  const [uploadingCamp, setUploadingCamp] = useState(false);
  const [uploadingSocial, setUploadingSocial] = useState(false);
  const [activeEditId, setActiveEditId] = useState<string | null>(null);

  // 1. Alert banner form
  const [alertEn, setAlertEn] = useState("");
  const [alertHi, setAlertHi] = useState("");

  // 2. Carousel form
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [editingSlideIdx, setEditingSlideIdx] = useState<number | null>(null);
  const [slideForm, setSlideForm] = useState({
    titleEn: "",
    titleHi: "",
    subEn: "",
    subHi: "",
    image: ""
  });

  // 3. Services form
  const [showSvcModal, setShowSvcModal] = useState(false);
  const [editingSvcId, setEditingSvcId] = useState<string | null>(null);
  const [svcForm, setSvcForm] = useState({
    id: "",
    titleEn: "",
    titleHi: "",
    descEn: "",
    descHi: "",
    category: "welfare",
    iconName: "Info",
    color: "text-blue-600 bg-blue-50 border-blue-100",
    enabled: true
  });

  // 4. Campaign form
  const [showCampModal, setShowCampModal] = useState(false);
  const [editingCampId, setEditingCampId] = useState<string | null>(null);
  const [campForm, setCampForm] = useState({
    titleEn: "",
    titleHi: "",
    goalAmount: 50000,
    raisedAmount: 0,
    imageUrl: "",
    urgent: false
  });

  // 5. Job form
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState({
    titleEn: "",
    titleHi: "",
    company: "RP Foundation",
    locEn: "Bhopal, MP",
    locHi: "भोपाल, मध्य प्रदेश",
    salary: "₹15,000 - ₹20,000",
    typeEn: "Full Time",
    typeHi: "पूर्णकालिक"
  });

  // 6. Camp form
  const [showCampDetailModal, setShowCampDetailModal] = useState(false);
  const [editingCampDetailId, setEditingCampDetailId] = useState<string | null>(null);
  const [campDetailForm, setCampDetailForm] = useState({
    titleEn: "",
    titleHi: "",
    dateEn: "",
    dateHi: "",
    locationEn: "",
    locationHi: "",
    contact: ""
  });

  // 7. Social updates form
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
  const [socialForm, setSocialForm] = useState({
    author: "RP Foundation",
    role: "Official Page",
    avatar: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80",
    textEn: "",
    textHi: "",
    image: "",
    link: "",
    platform: "instagram"
  });

  // Load alert banner form from context
  useEffect(() => {
    if (cmsConfig) {
      setAlertEn(cmsConfig.alertBannerEn || "");
      setAlertHi(cmsConfig.alertBannerHi || "");
    }
  }, [cmsConfig]);

  const loadAllDbItems = async () => {
    setLoadingItems(true);
    try {
      // Submissions
      const subRes = await fetch("/api/submissions");
      if (subRes.ok) {
        const d = await subRes.json();
        setSubmissions(d.submissions || []);
      }
      // Grievances
      const gRes = await fetch("/api/grievances");
      if (gRes.ok) {
        const d = await gRes.json();
        setGrievances(d.grievances || []);
      }
      // Volunteers
      const vRes = await fetch("/api/volunteers");
      if (vRes.ok) {
        const d = await vRes.json();
        setVolunteers(d.volunteers || []);
      }
      // Campaigns
      const campRes = await fetch("/api/campaigns");
      if (campRes.ok) {
        const d = await campRes.json();
        setCampaigns(d.campaigns || []);
      }
      // Jobs
      const jobRes = await fetch("/api/jobs");
      if (jobRes.ok) {
        const d = await jobRes.json();
        setJobs(d.jobs || []);
      }
      // Camps
      const campsRes = await fetch("/api/health_camps");
      if (campsRes.ok) {
        const d = await campsRes.json();
        setCamps(d.camps || []);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    if (hasAdminAccess) {
      loadAllDbItems();
    }
  }, [hasAdminAccess]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-[#000080] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !hasAdminAccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center shadow-inner">
          <ShieldOff className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800">403 — Access Denied</h2>
        <p className="text-sm text-slate-500 max-w-xs">
          This area is restricted to <strong>admin</strong> and <strong>super_admin</strong> accounts only.
        </p>
      </div>
    );
  }

  const showNotification = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 4000);
  };

  /* ─────────────────────────────────────────────────────────────
     CMS CONFIG (ALERT & CAROUSEL) ACTIONS
     ───────────────────────────────────────────────────────────── */
  const handleSaveAlerts = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = {
        ...cmsConfig,
        alertBannerEn: alertEn.trim(),
        alertBannerHi: alertHi.trim()
      };
      await updateCmsConfig(updated);
      showNotification("✅ Emergency Alert Banner updated successfully!");
    } catch (err: any) {
      showNotification("❌ Failed: " + err.message);
    }
  };

  const saveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    const slides = [...(cmsConfig.carouselSlides || [])];
    if (editingSlideIdx !== null) {
      slides[editingSlideIdx] = slideForm;
    } else {
      slides.push(slideForm);
    }
    try {
      await updateCmsConfig({ ...cmsConfig, carouselSlides: slides });
      setShowSlideModal(false);
      setEditingSlideIdx(null);
      showNotification("✅ Carousel Banner saved successfully!");
    } catch (err: any) {
      showNotification("❌ Error: " + err.message);
    }
  };

  const deleteSlide = async (idx: number) => {
    if (!window.confirm("Are you sure you want to delete this slide?")) return;
    const slides = [...(cmsConfig.carouselSlides || [])];
    slides.splice(idx, 1);
    try {
      await updateCmsConfig({ ...cmsConfig, carouselSlides: slides });
      showNotification("✅ Slide deleted successfully!");
    } catch (err: any) {
      showNotification("❌ Error: " + err.message);
    }
  };

  /* ─────────────────────────────────────────────────────────────
     SERVICES CMS ACTIONS
     ───────────────────────────────────────────────────────────── */
  const saveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const servicesList = [...(cmsConfig.customServices || [])];
    if (editingSvcId) {
      const idx = servicesList.findIndex(s => s.id === editingSvcId);
      if (idx !== -1) servicesList[idx] = svcForm;
    } else {
      const uniqueId = svcForm.id.trim() || `custom_${Date.now()}`;
      servicesList.push({ ...svcForm, id: uniqueId });
    }
    try {
      await updateCmsConfig({ ...cmsConfig, customServices: servicesList });
      setShowSvcModal(false);
      setEditingSvcId(null);
      showNotification("✅ Civic Service saved successfully!");
    } catch (err: any) {
      showNotification("❌ Error: " + err.message);
    }
  };

  const deleteService = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    const servicesList = (cmsConfig.customServices || []).filter((s: any) => s.id !== id);
    try {
      await updateCmsConfig({ ...cmsConfig, customServices: servicesList });
      showNotification("✅ Service deleted successfully!");
    } catch (err: any) {
      showNotification("❌ Error: " + err.message);
    }
  };

  /* ─────────────────────────────────────────────────────────────
     CAMPAIGNS CMS ACTIONS
     ───────────────────────────────────────────────────────────── */
  const saveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (editingCampId) {
        res = await fetch(`/api/campaigns/${editingCampId}/edit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(campForm)
        });
      } else {
        res = await fetch("/api/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(campForm)
        });
      }
      if (res.ok) {
        setShowCampModal(false);
        setEditingCampId(null);
        showNotification("✅ Crowdfunding Campaign saved!");
        loadAllDbItems();
      }
    } catch (err: any) {
      showNotification("❌ Error: " + err.message);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!window.confirm("Delete this campaign permanently?")) return;
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("✅ Campaign deleted!");
        loadAllDbItems();
      }
    } catch (err: any) {
      showNotification("❌ Error: " + err.message);
    }
  };

  /* ─────────────────────────────────────────────────────────────
     JOBS ACTIONS
     ───────────────────────────────────────────────────────────── */
  const saveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (editingJobId) {
        res = await fetch(`/api/jobs/${editingJobId}/edit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jobForm)
        });
      } else {
        res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jobForm)
        });
      }
      if (res.ok) {
        setShowJobModal(false);
        setEditingJobId(null);
        showNotification("✅ Job listing saved!");
        loadAllDbItems();
      }
    } catch (err: any) {
      showNotification("❌ Error: " + err.message);
    }
  };

  const deleteJob = async (id: string) => {
    if (!window.confirm("Delete this job listing?")) return;
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("✅ Job listing deleted!");
        loadAllDbItems();
      }
    } catch (err: any) {
      showNotification("❌ Error: " + err.message);
    }
  };

  /* ─────────────────────────────────────────────────────────────
     HEALTH CAMPS ACTIONS
     ───────────────────────────────────────────────────────────── */
  const saveCampDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (editingCampDetailId) {
        res = await fetch(`/api/health_camps/${editingCampDetailId}/edit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(campDetailForm)
        });
      } else {
        res = await fetch("/api/health_camps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(campDetailForm)
        });
      }
      if (res.ok) {
        setShowCampDetailModal(false);
        setEditingCampDetailId(null);
        showNotification("✅ Health Camp details saved!");
        loadAllDbItems();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save details");
      }
    } catch (err: any) {
      showNotification("❌ Error: " + err.message);
    }
  };

  const deleteCampDetail = async (id: string) => {
    if (!window.confirm("Delete this health camp detail?")) return;
    try {
      const res = await fetch(`/api/health_camps/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showNotification("✅ Health Camp deleted!");
        loadAllDbItems();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete");
      }
    } catch (err: any) {
      showNotification("❌ Error: " + err.message);
    }
  };

  /* ─────────────────────────────────────────────────────────────
     SOCIAL POSTS ACTIONS
     ───────────────────────────────────────────────────────────── */
  const saveSocialPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (editingSocialId) {
        res = await fetch(`/api/social/${editingSocialId}/edit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(socialForm)
        });
      } else {
        res = await fetch("/api/social", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(socialForm)
        });
      }
      if (res.ok) {
        setShowSocialModal(false);
        setEditingSocialId(null);
        showNotification("✅ Social media update published!");
        loadAllDbItems();
      }
    } catch (err: any) {
      showNotification("❌ Error: " + err.message);
    }
  };

  const deleteSocialPost = async (id: string) => {
    if (!window.confirm("Delete this social post?")) return;
    try {
      const res = await fetch(`/api/social/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("✅ Social post deleted!");
        loadAllDbItems();
      }
    } catch (err: any) {
      showNotification("❌ Error: " + err.message);
    }
  };

  /* ─────────────────────────────────────────────────────────────
     SUBMISSIONS & GRIEVANCES & VOLUNTEERS ACTIONS
     ───────────────────────────────────────────────────────────── */
  const updateSubmissionStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/submissions/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showNotification(`✅ Submission status updated to ${status}!`);
        loadAllDbItems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateGrievanceStatus = async (id: string, status: "In Progress" | "Resolved") => {
    try {
      const res = await fetch("/api/grievances/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        showNotification(`✅ Grievance status updated to ${status}!`);
        loadAllDbItems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!window.confirm("Delete this submission permanently?")) return;
    try {
      const res = await fetch(`/api/submissions/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("✅ Submission deleted!");
        loadAllDbItems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteGrievance = async (id: string) => {
    if (!window.confirm("Delete this grievance report?")) return;
    try {
      const res = await fetch(`/api/grievances/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("✅ Grievance report deleted!");
        loadAllDbItems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteVolunteer = async (id: string) => {
    if (!window.confirm("Remove this volunteer profile?")) return;
    try {
      const res = await fetch(`/api/volunteers/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("✅ Volunteer removed!");
        loadAllDbItems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const adjustVolunteerPoints = async (id: string, currentPoints: number, change: number) => {
    try {
      const res = await fetch(`/api/volunteers/${id}/points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: Math.max(0, currentPoints + change) })
      });
      if (res.ok) {
        showNotification(`Awarded ${change > 0 ? "+" : ""}${change} points!`);
        loadAllDbItems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Static service toggle status manager (internal)
  const toggleDefaultSvcStatus = async (id: string, current: boolean) => {
    try {
      const res = await fetch("/api/settings");
      const currentData = await res.json();
      const currentStatus = currentData.settings?.servicesStatus || {};
      const newStatus = { ...currentStatus, [id]: !current };
      
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servicesStatus: newStatus })
      });
      showNotification(`✅ Toggle updated!`);
      fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const ALL_SERVICE_IDS = [
    { id: "donate",       labelEn: "Donate Now",              labelHi: "दान सहायता" },
    { id: "blood",        labelEn: "Blood Network",           labelHi: "रक्त नेटवर्क" },
    { id: "complaint",    labelEn: "File Grievance",          labelHi: "शिकायत पंजीकरण" },
    { id: "disaster",     labelEn: "Disaster Management",     labelHi: "आपदा प्रबंधन" },
    { id: "jan_seva",     labelEn: "Jan Seva Card",           labelHi: "जन सेवा कार्ड" },
    { id: "volunteer",    labelEn: "Volunteer Opportunities", labelHi: "स्वयंसेवक अवसर" },
    { id: "women",        labelEn: "Women Support",           labelHi: "महिला सहायता" },
    { id: "seniors",      labelEn: "Senior Citizens",         labelHi: "वरिष्ठ नागरिक" },
    { id: "children",     labelEn: "Children Welfare",        labelHi: "बाल कल्याण" },
    { id: "animals",      labelEn: "Animal Welfare",          labelHi: "पशु कल्याण" },
    { id: "farmer",       labelEn: "Farmer Support",          labelHi: "किसान सहयोग" },
    { id: "youth",        labelEn: "Youth Support",           labelHi: "युवा विकास" },
    { id: "education",    labelEn: "Education Support",       labelHi: "शिक्षा सहयोग" },
    { id: "health",       labelEn: "Health Services",         labelHi: "स्वास्थ्य सेवाएं" },
    { id: "skills",       labelEn: "Skills Training",         labelHi: "कौशल प्रशिक्षण" },
    { id: "schemes",      labelEn: "Government Schemes",      labelHi: "सरकारी योजनाएं" },
    { id: "human_rights", labelEn: "Human Rights",            labelHi: "मानवाधिकार" },
    { id: "consumer",     labelEn: "Consumer Protection",     labelHi: "उपभोक्ता संरक्षण" },
    { id: "environment",  labelEn: "Environment",             labelHi: "पर्यावरण विकास" },
    { id: "culture",      labelEn: "Culture & Heritage",      labelHi: "संस्कृति व धरोहर" },
    { id: "fitness",      labelEn: "Fitness & Sports",        labelHi: "फिटनेस और खेल" },
  ];

  return (
    <div className="p-5 flex-1 flex flex-col min-h-screen bg-slate-50 pb-24 text-left font-sans">
      {/* Top Banner Alert notification */}
      {msg && (
        <div className="fixed top-4 right-4 z-55 bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-2xl animate-slideDown flex items-center gap-2">
          <span>{msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="font-display font-black text-xl text-[#000080] tracking-tight">
            🛡️ No-Code CMS & AccessHQ
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold mt-0.5">
            RP Foundation — Live administrative dashboard
          </p>
        </div>
        <button 
          onClick={loadAllDbItems}
          className="text-[9px] font-black uppercase bg-[#000080] text-white px-3 py-1.5 rounded-xl hover:bg-indigo-900 transition-all cursor-pointer"
        >
          🔄 Reload Data
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex bg-white border border-slate-200 rounded-2xl p-1 mb-5 shadow-sm gap-1 overflow-x-auto no-scrollbar shrink-0">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 text-[10px] font-black rounded-xl transition whitespace-nowrap cursor-pointer ${
              activeTab === id
                ? "bg-[#000080] text-white shadow-md scale-105"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Main Tab content area */}
      <div className="flex-1 bg-white border border-slate-250/60 rounded-3xl p-5 shadow-xs min-h-[400px]">
        {loadingItems && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-xs font-bold gap-2">
            <div className="w-6 h-6 border-2 border-[#000080] border-t-transparent rounded-full animate-spin" />
            Loading Database Records...
          </div>
        )}

        {!loadingItems && (
          <div className="animate-fadeIn">
            {/* ==========================================
                1. INBOX & APPROVALS TAB
                ========================================== */}
            {activeTab === "inbox" && (
              <div className="space-y-6">
                {/* Grievances Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b pb-1.5">
                    📢 Citizen Grievance Registry ({grievances.length})
                  </h3>
                  {grievances.length === 0 ? (
                    <p className="text-[10px] text-slate-400 py-2">No citizen grievances submitted yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                      {grievances.map((g) => (
                        <div key={g.id} className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/50 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                                g.urgency === "high" ? "bg-red-100 text-red-700" :
                                g.urgency === "medium" ? "bg-amber-100 text-amber-700" :
                                "bg-slate-100 text-slate-700"
                              }`}>{g.urgency || "normal"}</span>
                              <h5 className="font-bold text-xs text-slate-800 mt-1.5">{g.title}</h5>
                              <p className="text-[9px] text-slate-500">{g.citizenName} • {g.createdAt?.slice(0,10)}</p>
                            </div>
                            <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full ${
                              g.status === "Resolved" ? "bg-green-100 text-green-700" :
                              g.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                              "bg-red-100 text-red-700"
                            }`}>{g.status}</span>
                          </div>
                          <p className="text-[10px] text-slate-600 line-clamp-3">{g.description}</p>
                          <div className="flex gap-2 pt-1 border-t border-slate-100">
                            <button onClick={() => updateGrievanceStatus(g.id, "In Progress")} disabled={g.status === "In Progress" || g.status === "Resolved"} className="flex-1 py-1 text-[9px] font-bold bg-blue-600 text-white rounded-lg disabled:opacity-40 cursor-pointer">Progress</button>
                            <button onClick={() => updateGrievanceStatus(g.id, "Resolved")} disabled={g.status === "Resolved"} className="flex-1 py-1 text-[9px] font-bold bg-green-600 text-white rounded-lg disabled:opacity-40 cursor-pointer">Resolve</button>
                            <button onClick={() => deleteGrievance(g.id)} className="p-1 text-red-650 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submissions Section (Jan Seva cards & ration kits etc) */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b pb-1.5">
                    📝 Intake Applications & Submissions ({submissions.length})
                  </h3>
                  {submissions.length === 0 ? (
                    <p className="text-[10px] text-slate-400 py-2">No active applications found.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                      {submissions.map((sub) => (
                        <div key={sub.id} className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/50 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-bold text-xs text-slate-800">{sub.serviceNameEn || sub.serviceName || "Welfare Intake"}</h5>
                              <p className="text-[9px] text-slate-500 font-bold mt-0.5">{sub.citizenName} • {sub.citizenPhone}</p>
                            </div>
                            <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full ${
                              sub.status === "approved" ? "bg-green-100 text-green-700" :
                              sub.status === "rejected" ? "bg-red-100 text-red-700" :
                              "bg-amber-100 text-amber-700"
                            }`}>{sub.status?.toUpperCase()}</span>
                          </div>
                          {sub.submissionData && (
                            <pre className="bg-white border text-[8.5px] p-2 rounded-xl text-slate-600 overflow-x-auto max-h-24 whitespace-pre-wrap font-mono leading-tight">{sub.submissionData}</pre>
                          )}
                          <div className="flex gap-2 pt-1 border-t border-slate-100">
                            <button onClick={() => updateSubmissionStatus(sub.id, "approved")} disabled={sub.status === "approved"} className="flex-1 py-1 text-[9px] font-bold bg-green-600 text-white rounded-lg disabled:opacity-40 cursor-pointer">Approve</button>
                            <button onClick={() => updateSubmissionStatus(sub.id, "rejected")} disabled={sub.status === "rejected"} className="flex-1 py-1 text-[9px] font-bold bg-red-600 text-white rounded-lg disabled:opacity-40 cursor-pointer">Reject</button>
                            <button onClick={() => deleteSubmission(sub.id)} className="p-1 text-red-650 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==========================================
                2. ALERT & CAROUSEL TAB
                ========================================== */}
            {activeTab === "marquee_banner" && (
              <div className="space-y-6">
                {/* Emergency alerts */}
                <form onSubmit={handleSaveAlerts} className="border border-slate-200 p-4 rounded-2xl bg-slate-50/50 space-y-3">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Global Emergency Alert Marquee (होम स्क्रीन लाल अलर्ट पट्टी)
                  </h4>
                  <p className="text-[10px] text-slate-500">Edit the text below to display a red announcement marquee across the top of all client home dashboards.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-slate-700">English Text (अंग्रेजी घोषणा)</label>
                      <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" placeholder="e.g. Free Eye Checkup camp in Sehore Bhopal on Sunday!" value={alertEn} onChange={(e) => setAlertEn(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-slate-700">Hindi Text (हिंदी घोषणा)</label>
                      <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" placeholder="जैसे: रविवार को भोपाल सीहोर में निशुल्क नेत्र चिकित्सा शिविर!" value={alertHi} onChange={(e) => setAlertHi(e.target.value)} />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#000080] text-white font-bold text-xs py-2 rounded-xl hover:bg-indigo-900 transition cursor-pointer">Save Alert Banner</button>
                </form>

                {/* Slides carousel */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      🖼️ Homepage Carousel Banners ({cmsConfig.carouselSlides?.length || 0})
                    </h4>
                    <button onClick={() => { setEditingSlideIdx(null); setSlideForm({ titleEn: "", titleHi: "", subEn: "", subHi: "", image: "" }); setShowSlideModal(true); }} className="text-[9.5px] font-bold bg-[#FF9933] text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer">
                      <Plus className="w-3.5 h-3.5" /> Add Banner Slide
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cmsConfig.carouselSlides?.map((slide, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
                        <img src={slide.image} alt={slide.titleEn} className="w-full h-32 object-cover" />
                        <div className="p-3 bg-slate-50 space-y-1">
                          <h5 className="font-bold text-xs text-slate-800">{slide.titleEn}</h5>
                          <p className="text-[9px] text-slate-500 leading-snug line-clamp-1">{slide.subEn}</p>
                          <div className="flex gap-2 pt-2 border-t mt-2">
                            <button onClick={() => { setEditingSlideIdx(idx); setSlideForm(slide); setShowSlideModal(true); }} className="flex-1 py-1 text-[9px] font-bold bg-[#000080] text-white rounded-lg flex items-center justify-center gap-1 cursor-pointer"><Edit3 className="w-3 h-3" /> Edit</button>
                            <button onClick={() => deleteSlide(idx)} className="p-1 bg-red-50 text-red-600 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ==========================================
                3. SERVICES CMS TAB
                ========================================== */}
            {activeTab === "services_cms" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      🏛️ Welfare Civic Services Directory
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Toggle default services or add a new custom service dynamically to the homepage cards.</p>
                  </div>
                  <button onClick={() => { setEditingSvcId(null); setSvcForm({ id: `custom_${Date.now()}`, titleEn: "", titleHi: "", descEn: "", descHi: "", category: "welfare", iconName: "Info", color: "text-blue-600 bg-blue-50 border-blue-100", enabled: true }); setShowSvcModal(true); }} className="text-[9.5px] font-bold bg-[#000080] text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /> Add New Service
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {/* Render dynamic list */}
                  {cmsConfig.customServices?.map((svc: any) => (
                    <div key={svc.id} className="border border-slate-200/80 rounded-2xl p-3.5 bg-white shadow-xs flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-bold text-xs text-slate-850 truncate">{svc.titleEn}</h5>
                          <span className="text-[7px] font-black uppercase bg-[#FF9933]/10 text-[#FF9933] px-1.5 py-0.5 rounded">Custom</span>
                        </div>
                        <p className="text-[9.5px] text-[#000080] font-semibold truncate mt-0.5">{svc.titleHi}</p>
                        <p className="text-[9px] text-slate-500 line-clamp-1 mt-1 font-semibold">{svc.descEn}</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => { setEditingSvcId(svc.id); setSvcForm(svc); setShowSvcModal(true); }} className="p-1.5 hover:bg-slate-100 text-slate-650 rounded-lg cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteService(svc.id)} className="p-1.5 hover:bg-red-50 text-red-650 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}

                  {/* Render toggle for defaults */}
                  {ALL_SERVICE_IDS.map((svc) => (
                    <div key={svc.id} className="border border-slate-200/60 rounded-2xl p-3.5 bg-slate-50/50 shadow-xs flex justify-between items-center gap-2">
                      <div>
                        <h5 className="font-bold text-xs text-slate-800">{svc.labelEn}</h5>
                        <p className="text-[9px] text-slate-400 font-semibold">{svc.labelHi}</p>
                      </div>
                      <span className="text-[8px] font-black uppercase text-slate-450 tracking-wider bg-slate-150 px-1.5 py-0.5 rounded leading-none shrink-0">Default Core</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==========================================
                4. CAMPAIGNS CMS TAB
                ========================================== */}
            {activeTab === "campaigns_cms" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    🤝 Crowdfunding Giving Drives
                  </h3>
                  <button onClick={() => { setEditingCampId(null); setCampForm({ titleEn: "", titleHi: "", goalAmount: 50000, raisedAmount: 0, imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80", urgent: false }); setShowCampModal(true); }} className="text-[9.5px] font-bold bg-[#000080] text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /> Create Campaign
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                  {campaigns.map((camp) => (
                    <div key={camp.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs flex flex-col justify-between">
                      {camp.imageUrl && <img src={camp.imageUrl} alt={camp.titleEn} className="w-full h-24 object-cover" />}
                      <div className="p-3 bg-slate-50/50 space-y-1.5">
                        <div className="flex justify-between items-start gap-1">
                          <h5 className="font-bold text-xs text-slate-850 leading-tight">{camp.titleEn}</h5>
                          {camp.urgent && <span className="bg-red-100 text-red-700 text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0">Urgent</span>}
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-slate-500 mt-1 leading-none uppercase">
                          <span>Raised: ₹{camp.raisedAmount}</span>
                          <span>Goal: ₹{camp.goalAmount}</span>
                        </div>
                        <div className="flex gap-2 pt-2 border-t mt-2">
                          <button onClick={() => { setEditingCampId(camp.id); setCampForm(camp); setShowCampModal(true); }} className="flex-1 py-1 text-[9px] font-bold bg-[#000080] text-white rounded-lg flex items-center justify-center gap-1 cursor-pointer"><Edit3 className="w-3 h-3" /> Edit</button>
                          <button onClick={() => deleteCampaign(camp.id)} className="p-1 bg-red-50 text-red-600 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==========================================
                5. JOBS & HEALTH CAMPS TAB
                ========================================== */}
            {activeTab === "jobs_camps" && (
              <div className="space-y-6">
                {/* Jobs Management */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b pb-1.5">
                      💼 Employment & Job Opportunities ({jobs.length})
                    </h3>
                    <button onClick={() => { setEditingJobId(null); setJobForm({ titleEn: "", titleHi: "", company: "RP Foundation", locEn: "Bhopal, MP", locHi: "भोपाल, MP", salary: "₹15,000 - ₹20,000", typeEn: "Full Time", typeHi: "पूर्णकालिक" }); setShowJobModal(true); }} className="text-[9.5px] font-bold bg-[#000080] text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer">
                      <Plus className="w-3 h-3" /> Add Job Listing
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-1">
                    {jobs.map((job) => (
                      <div key={job.id} className="border border-slate-200 rounded-2xl p-3 bg-white shadow-xs flex justify-between items-start gap-2">
                        <div>
                          <h5 className="font-bold text-xs text-slate-800">{job.titleEn}</h5>
                          <p className="text-[9px] text-[#FF9933] font-bold">{job.salary} • {job.typeEn}</p>
                          <p className="text-[9.5px] text-slate-500 leading-snug mt-0.5">{job.locEn}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => { setEditingJobId(job.id); setJobForm(job); setShowJobModal(true); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-650 cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteJob(job.id)} className="p-1 hover:bg-red-50 rounded-lg text-red-650 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Health Camps Management */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b pb-1.5">
                      🩺 Health Clinic & Welfare Camps ({camps.length})
                    </h3>
                    <button onClick={() => { setEditingCampDetailId(null); setCampDetailForm({ titleEn: "", titleHi: "", dateEn: "", dateHi: "", locationEn: "", locationHi: "", contact: "" }); setShowCampDetailModal(true); }} className="text-[9.5px] font-bold bg-[#000080] text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer">
                      <Plus className="w-3 h-3" /> Add Health Camp
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-1">
                    {camps.map((camp) => (
                      <div key={camp.id} className="border border-slate-200 rounded-2xl p-3 bg-white shadow-xs flex justify-between items-start gap-2">
                        <div>
                          <h5 className="font-bold text-xs text-slate-800">{camp.titleEn}</h5>
                          <p className="text-[9px] text-[#000080] font-black">{camp.dateEn}</p>
                          <p className="text-[9px] text-slate-500 font-semibold">{camp.locationEn} • {camp.contact}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => { setEditingCampDetailId(camp.id); setCampDetailForm(camp); setShowCampDetailModal(true); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-650 cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteCampDetail(camp.id)} className="p-1 hover:bg-red-50 rounded-lg text-red-650 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ==========================================
                6. SOCIAL UPDATES TAB
                ========================================== */}
            {activeTab === "social_cms" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    📸 Official Social Updates Feed ({socialPosts.length})
                  </h3>
                  <button onClick={() => { setEditingSocialId(null); setSocialForm({ author: "RP Foundation", role: "Official Page", avatar: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80", textEn: "", textHi: "", image: "", link: "", platform: "instagram" }); setShowSocialModal(true); }} className="text-[9.5px] font-bold bg-[#000080] text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /> Publish New Post
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                  {socialPosts.map((post) => (
                    <div key={post.id} className="border border-slate-200 rounded-2xl p-3 bg-white shadow-xs space-y-2 text-left">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <img src={post.avatar} alt={post.author} className="w-7 h-7 rounded-full object-cover shrink-0" />
                          <div>
                            <h5 className="font-bold text-xs text-slate-800 leading-tight">{post.author}</h5>
                            <span className="text-[8px] font-black uppercase text-pink-700 bg-pink-50 px-1 py-0.2 rounded mt-0.5 inline-block">{post.platform}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => { setEditingSocialId(post.id); setSocialForm(post as any); setShowSocialModal(true); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-650 cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteSocialPost(post.id)} className="p-1 hover:bg-red-50 rounded-lg text-red-650 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <p className="text-[9.5px] text-slate-650 line-clamp-2">{post.textEn}</p>
                      {post.image && <img src={post.image} alt="Social post cover" className="w-full h-20 object-cover rounded-xl mt-1" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==========================================
                7. VOLUNTEERS TAB
                ========================================== */}
            {activeTab === "volunteers" && (
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b pb-1.5">
                  🤝 Registered Volunteers Directory ({volunteers.length})
                </h3>
                {volunteers.length === 0 ? (
                  <p className="text-[10px] text-slate-400 py-2">No volunteers registered yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                    {volunteers.map((vol) => (
                      <div key={vol.id} className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs flex justify-between items-center gap-2">
                        <div>
                          <h5 className="font-bold text-xs text-slate-850 leading-tight">{vol.name || "Volunteer"}</h5>
                          <p className="text-[9px] text-slate-500 mt-0.5">{vol.email} • {vol.phone}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[8.5px] font-black text-[#000080] bg-blue-50 px-2 py-0.5 rounded-md">⭐ {vol.points || 0} Points</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end shrink-0">
                          <div className="flex gap-1">
                            <button onClick={() => adjustVolunteerPoints(vol.id, vol.points || 0, 50)} className="text-[9px] font-black bg-green-600 text-white px-2 py-1 rounded-lg cursor-pointer">+50 pts</button>
                            <button onClick={() => adjustVolunteerPoints(vol.id, vol.points || 0, -50)} className="text-[9px] font-black bg-amber-600 text-white px-2 py-1 rounded-lg cursor-pointer">-50 pts</button>
                          </div>
                          <button onClick={() => deleteVolunteer(vol.id)} className="text-[9px] font-bold text-red-650 hover:underline pt-1 flex items-center gap-0.5 cursor-pointer"><Trash2 className="w-3 h-3" /> Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
         MODALS / DIALOGS FOR FORMS
         ───────────────────────────────────────────────────────────── */}
      {/* 1. Slide Modal */}
      {showSlideModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <form onSubmit={saveSlide} className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-left">
            <h4 className="font-black text-sm text-[#000080] border-b pb-2 uppercase tracking-wide">
              {editingSlideIdx !== null ? "Edit Slide Banner" : "Add Slide Banner"}
            </h4>
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Title (English)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={slideForm.titleEn} onChange={(e) => setSlideForm({...slideForm, titleEn: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Title (Hindi)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={slideForm.titleHi} onChange={(e) => setSlideForm({...slideForm, titleHi: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Subtitle (English)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={slideForm.subEn} onChange={(e) => setSlideForm({...slideForm, subEn: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Subtitle (Hindi)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={slideForm.subHi} onChange={(e) => setSlideForm({...slideForm, subHi: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                <label className="text-[9.5px] font-bold text-slate-700 block">Banner Photo / बैनर फोटो</label>
                <div className="flex items-center gap-2">
                  {slideForm.image && (
                    <img src={slideForm.image} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                  )}
                  <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-lg p-2 bg-white hover:bg-slate-50 cursor-pointer">
                    <span className="text-[9.5px] font-bold text-[#000080]">
                      {uploadingSlide ? "Uploading..." : "Upload from Device / गैलरी से चुनें"}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      disabled={uploadingSlide} 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingSlide(true);
                        try {
                          const formData = new FormData();
                          formData.append("file", file);
                          const res = await fetch("/api/upload/broadcast", {
                            method: "POST",
                            body: formData
                          });
                          if (!res.ok) throw new Error();
                          const data = await res.json();
                          setSlideForm(prev => ({ ...prev, image: data.url }));
                        } catch (err) {
                          alert("Upload failed");
                        } finally {
                          setUploadingSlide(false);
                        }
                      }} 
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3.5 pt-2">
              <button type="submit" className="flex-1 py-2.5 bg-green-600 text-white font-bold text-xs rounded-xl cursor-pointer">Save Slide</button>
              <button type="button" onClick={() => setShowSlideModal(false)} className="flex-1 py-2.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Service Modal */}
      {showSvcModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <form onSubmit={saveService} className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-left">
            <h4 className="font-black text-sm text-[#000080] border-b pb-2 uppercase tracking-wide">
              {editingSvcId ? "Edit Civic Service" : "Add Civic Service"}
            </h4>
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold text-slate-700">Service Category</label>
                <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={svcForm.category} onChange={(e) => setSvcForm({...svcForm, category: e.target.value})}>
                  <option value="urgent">⚡ Urgent Core</option>
                  <option value="involved">🤝 Involved</option>
                  <option value="welfare">🫂 Welfare</option>
                  <option value="empowerment">📚 Info / Empowerment</option>
                  <option value="civic">⚖️ Civic Action</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Title (English)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={svcForm.titleEn} onChange={(e) => setSvcForm({...svcForm, titleEn: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Title (Hindi)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={svcForm.titleHi} onChange={(e) => setSvcForm({...svcForm, titleHi: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Desc (English)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={svcForm.descEn} onChange={(e) => setSvcForm({...svcForm, descEn: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Desc (Hindi)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={svcForm.descHi} onChange={(e) => setSvcForm({...svcForm, descHi: e.target.value})} required />
                </div>
              </div>
            </div>
            <div className="flex gap-3.5 pt-2">
              <button type="submit" className="flex-1 py-2.5 bg-green-600 text-white font-bold text-xs rounded-xl cursor-pointer">Save Service</button>
              <button type="button" onClick={() => setShowSvcModal(false)} className="flex-1 py-2.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Campaign Modal */}
      {showCampModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <form onSubmit={saveCampaign} className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-left">
            <h4 className="font-black text-sm text-[#000080] border-b pb-2 uppercase tracking-wide">
              {editingCampId ? "Edit Campaign" : "Create Campaign"}
            </h4>
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Title (English)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={campForm.titleEn} onChange={(e) => setCampForm({...campForm, titleEn: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Title (Hindi)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={campForm.titleHi} onChange={(e) => setCampForm({...campForm, titleHi: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Goal (₹)</label>
                  <input type="number" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={campForm.goalAmount} onChange={(e) => setCampForm({...campForm, goalAmount: Number(e.target.value)})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Raised (₹)</label>
                  <input type="number" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={campForm.raisedAmount} onChange={(e) => setCampForm({...campForm, raisedAmount: Number(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                <label className="text-[9.5px] font-bold text-slate-700 block">Photo / फोटो</label>
                <div className="flex items-center gap-2">
                  {campForm.imageUrl && (
                    <img src={campForm.imageUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                  )}
                  <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-lg p-2 bg-white hover:bg-slate-50 cursor-pointer">
                    <span className="text-[9.5px] font-bold text-[#000080]">
                      {uploadingCamp ? "Uploading..." : "Upload from Device / गैलरी से चुनें"}
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
                          setCampForm(prev => ({ ...prev, imageUrl: data.url }));
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
              <div className="flex items-center gap-2">
                <input type="checkbox" id="modalUrgent" className="w-4 h-4 text-[#000080] rounded" checked={campForm.urgent} onChange={(e) => setCampForm({...campForm, urgent: e.target.checked})} />
                <label htmlFor="modalUrgent" className="text-xs font-black text-red-600">Mark Urgent (अति आवश्यक)</label>
              </div>
            </div>
            <div className="flex gap-3.5 pt-2">
              <button type="submit" className="flex-1 py-2.5 bg-green-600 text-white font-bold text-xs rounded-xl cursor-pointer">Save Campaign</button>
              <button type="button" onClick={() => setShowCampModal(false)} className="flex-1 py-2.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <form onSubmit={saveJob} className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-left">
            <h4 className="font-black text-sm text-[#000080] border-b pb-2 uppercase tracking-wide">
              {editingJobId ? "Edit Job Listing" : "Add Job Listing"}
            </h4>
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Job Title (English)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={jobForm.titleEn} onChange={(e) => setJobForm({...jobForm, titleEn: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Job Title (Hindi)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={jobForm.titleHi} onChange={(e) => setJobForm({...jobForm, titleHi: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Location (English)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={jobForm.locEn} onChange={(e) => setJobForm({...jobForm, locEn: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Location (Hindi)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={jobForm.locHi} onChange={(e) => setJobForm({...jobForm, locHi: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Salary Package</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={jobForm.salary} onChange={(e) => setJobForm({...jobForm, salary: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Job Type (English)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={jobForm.typeEn} onChange={(e) => setJobForm({...jobForm, typeEn: e.target.value})} required />
                </div>
              </div>
            </div>
            <div className="flex gap-3.5 pt-2">
              <button type="submit" className="flex-1 py-2.5 bg-green-600 text-white font-bold text-xs rounded-xl cursor-pointer">Save Listing</button>
              <button type="button" onClick={() => setShowJobModal(false)} className="flex-1 py-2.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* 5. Health Camp Modal */}
      {showCampDetailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <form onSubmit={saveCampDetail} className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-left">
            <h4 className="font-black text-sm text-[#000080] border-b pb-2 uppercase tracking-wide">
              {editingCampDetailId ? "Edit Health Camp" : "Add Health Camp"}
            </h4>
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Camp Title (English)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={campDetailForm.titleEn} onChange={(e) => setCampDetailForm({...campDetailForm, titleEn: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Camp Title (Hindi)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={campDetailForm.titleHi} onChange={(e) => setCampDetailForm({...campDetailForm, titleHi: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Date (English)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" placeholder="Sunday, Jul 10" value={campDetailForm.dateEn} onChange={(e) => setCampDetailForm({...campDetailForm, dateEn: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Date (Hindi)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" placeholder="रविवार, 10 जुलाई" value={campDetailForm.dateHi} onChange={(e) => setCampDetailForm({...campDetailForm, dateHi: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Location (English)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={campDetailForm.locationEn} onChange={(e) => setCampDetailForm({...campDetailForm, locationEn: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Location (Hindi)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={campDetailForm.locationHi} onChange={(e) => setCampDetailForm({...campDetailForm, locationHi: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold text-slate-700">Helpline / Contact Info</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={campDetailForm.contact} onChange={(e) => setCampDetailForm({...campDetailForm, contact: e.target.value})} required />
              </div>
            </div>
            <div className="flex gap-3.5 pt-2">
              <button type="submit" className="flex-1 py-2.5 bg-green-600 text-white font-bold text-xs rounded-xl cursor-pointer">Save Camp</button>
              <button type="button" onClick={() => setShowCampDetailModal(false)} className="flex-1 py-2.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* 6. Social Post Modal */}
      {showSocialModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <form onSubmit={saveSocialPost} className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-left">
            <h4 className="font-black text-sm text-[#000080] border-b pb-2 uppercase tracking-wide">
              {editingSocialId ? "Edit Social Post" : "Publish Social Post"}
            </h4>
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Author Name</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={socialForm.author} onChange={(e) => setSocialForm({...socialForm, author: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Platform</label>
                  <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={socialForm.platform} onChange={(e) => setSocialForm({...socialForm, platform: e.target.value})}>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="youtube">YouTube</option>
                    <option value="x">X (Twitter)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Text Content (English)</label>
                  <textarea className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080] h-16 resize-none" value={socialForm.textEn} onChange={(e) => setSocialForm({...socialForm, textEn: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-700">Text Content (Hindi)</label>
                  <textarea className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080] h-16 resize-none" value={socialForm.textHi} onChange={(e) => setSocialForm({...socialForm, textHi: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                <label className="text-[9.5px] font-bold text-slate-700 block">Post Image / पोस्ट की फोटो (Optional)</label>
                <div className="flex items-center gap-2">
                  {socialForm.image && (
                    <img src={socialForm.image} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                  )}
                  <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-lg p-2 bg-white hover:bg-slate-50 cursor-pointer">
                    <span className="text-[9.5px] font-bold text-[#000080]">
                      {uploadingSocial ? "Uploading..." : "Upload from Device / गैलरी से चुनें"}
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
                          setSocialForm(prev => ({ ...prev, image: data.url }));
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
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold text-slate-700">Original Link URL</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#000080]" value={socialForm.link} onChange={(e) => setSocialForm({...socialForm, link: e.target.value})} required />
              </div>
            </div>
            <div className="flex gap-3.5 pt-2">
              <button type="submit" className="flex-1 py-2.5 bg-green-600 text-white font-bold text-xs rounded-xl cursor-pointer">Publish Post</button>
              <button type="button" onClick={() => setShowSocialModal(false)} className="flex-1 py-2.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
