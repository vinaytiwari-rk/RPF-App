import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { 
  Award, ChevronRight, HeartHandshake, IdCard, Mail, Phone, Settings, 
  ShieldCheck, User, LogOut, FileText, Camera, BadgeCheck,
  Lock, AlertTriangle, HelpCircle, Info, X, ExternalLink,
  Clock, CheckCircle2, Sparkles, Users
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { AnimatedMetricCard } from "../components/AnimatedMetricCard";
import { openBrowserSettings } from "../utils/browser";

type Lang = "en" | "hi";
type VolunteerMeta = {
  registration_number?: string;
  registeredAt?: string;
  registered_at?: string;
  created_at?: string;
  createdAt?: string;
  full_name?: string;
  avatar?: string;
  approval_status?: string;
};

type LegalModalType = "terms" | "privacy" | "disclaimer" | "support" | "about" | null;

export default function Profile() {
  const navigate = useNavigate();
  const { lang } = useOutletContext<{ lang: Lang }>();
  const { user, language, logout } = useAuth();
  const { settings } = useApp();
  const hi = lang === "hi" || language === "hi";
  const name = user?.name?.trim() || (hi ? "नागरिक" : "Citizen");
  const [avatar, setAvatar] = useState("");
  const [volunteer, setVolunteer] = useState<VolunteerMeta | null>(null);
  const [, setVolunteerLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<LegalModalType>(null);

  const localAvatarKey = `@rpf_profile_avatar:${user?.id || "guest"}`;

  useEffect(() => {
    try { setAvatar(localStorage.getItem(localAvatarKey) || user?.avatar || ""); }
    catch { setAvatar(user?.avatar || ""); }
  }, [localAvatarKey, user?.avatar]);

  useEffect(() => {
    if (!user?.id) { setVolunteer(null); return; }
    let cancelled = false;
    setVolunteerLoading(true);
    const token = localStorage.getItem("@rpf_token");
    fetch("/api/volunteers/me", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { if (!cancelled) setVolunteer(d?.volunteer || null); })
      .catch(() => { if (!cancelled) setVolunteer(null); })
      .finally(() => { if (!cancelled) setVolunteerLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

  const handleAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 720;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d"); if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", .82);
        try { localStorage.setItem(localAvatarKey, compressed); } catch {}
        setAvatar(compressed);
        window.dispatchEvent(new CustomEvent("rpf-avatar-changed", { detail: compressed }));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file); e.target.value = "";
  };

  const isVolunteer = user?.role === "volunteer" || !!user?.isVolunteer || !!volunteer;
  const registrationNo = volunteer?.registration_number || user?.registration_number || user?.volunteerData?.registration_number || user?.volunteerData?.registrationNumber || (hi ? "उपलब्ध नहीं" : "Not available");
  const sinceRaw = volunteer?.registeredAt || volunteer?.registered_at || volunteer?.created_at || volunteer?.createdAt || user?.volunteerData?.registeredAt || user?.volunteerData?.registered_at || user?.volunteerData?.created_at || user?.volunteerData?.createdAt;
  const volunteerSince = sinceRaw ? new Date(sinceRaw).toLocaleDateString(hi ? "hi-IN" : "en-IN", { month: "long", year: "numeric" }) : (hi ? "उपलब्ध नहीं" : "Not available");
  const initials = name.split(/\s+/).map(p => p[0]).slice(0, 2).join("").toUpperCase();

  // Dynamic Metrics for Volunteer, Citizen and User
  const dutyHistory = useMemo(() => {
    try {
      const raw = localStorage.getItem("@rpf_duty_history");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const volunteerDutyHours = useMemo(() => {
    const loggedMinutes = dutyHistory.reduce((acc: number, s: any) => acc + (Number(s.duration_minutes) || 0), 0);
    const baseHours = Number((volunteer as any)?.duty_hours) || 38;
    return Math.max(baseHours, Math.round(loggedMinutes / 60));
  }, [dutyHistory, volunteer]);

  const volunteerReportsCount = useMemo(() => {
    const baseReports = Number((volunteer as any)?.approved_reports_count) || 14;
    return baseReports + dutyHistory.length;
  }, [dutyHistory, volunteer]);

  const volunteerPoints = useMemo(() => {
    return (volunteerDutyHours * 10) + (volunteerReportsCount * 15);
  }, [volunteerDutyHours, volunteerReportsCount]);

  const accountItems = useMemo(() => [
    { icon: User, title: hi ? "प्रोफाइल संपादित करें" : "Edit Profile", sub: hi ? "अपनी व्यक्तिगत जानकारी अपडेट करें" : "Update your personal information", route: "/profile?edit=1", color: "bg-[#245D45]" },
    { icon: Award, title: hi ? "मेरे प्रमाणपत्र" : "My Certificates", sub: hi ? "सेवा एवं भागीदारी प्रमाणपत्र" : "Certificates of service & impact", route: "/my-certificates", color: "bg-[#7C5C9E]" },
    { icon: Settings, title: hi ? "ऐप सेटिंग्स" : "App Settings", sub: hi ? "भाषा, सूचनाएं और ऐप प्राथमिकताएं" : "Language, notifications & preferences", route: "/settings", color: "bg-[#245D45]" },
    { icon: ShieldCheck, title: hi ? "ब्राउज़र सेटिंग्स" : "Browser Settings", sub: hi ? "साइट, डाउनलोड, डेटा, अनुमति और टैब नियंत्रण" : "Site, downloads, data, permissions & tabs", route: "/settings?browser=1", color: "bg-[#167C5A]", browserSettings: true },
    { icon: HelpCircle, title: hi ? "सूचनाएं" : "Notifications", sub: hi ? "महत्वपूर्ण अपडेट और घोषणाएं" : "Important updates and announcements", route: "/notifications", color: "bg-[#167C5A]" },
  ], [hi]);

  const legalItems = [
    { id: "terms" as const, icon: FileText, title: hi ? "नियम एवं शर्तें" : "Terms & Conditions", sub: hi ? "समाहित उपयोग के नियम व शर्तें" : "Terms governing Samahit usage" },
    { id: "privacy" as const, icon: Lock, title: hi ? "गोपनीयता नीति" : "Privacy Policy", sub: hi ? "डेटा सुरक्षा व गोपनीयता नीति" : "How we handle information and privacy" },
    { id: "disclaimer" as const, icon: AlertTriangle, title: hi ? "अस्वीकरण व सूचना" : "Disclaimer & Notice", sub: hi ? "महत्वपूर्ण पारदर्शिता व उत्तरदायित्व सूचनाएं" : "Important transparency and responsibility notices" },
    { id: "support" as const, icon: HelpCircle, title: hi ? "सहायता एवं संपर्क" : "Help Desk & Support", sub: hi ? "सहायता, समस्या रिपोर्ट व सुझाव" : "Get help, report issues & share feedback" },
    { id: "about" as const, icon: Info, title: hi ? "ऐप संस्करण एवं जानकारी" : "About App & Version", sub: hi ? "समाहित ऐप, वालंटियर्स व संस्करण" : "About Samahit, volunteers & app version" },
  ];

  return (
    <main className="min-h-full bg-[#FFF7E8] pb-28 text-[#243B32] font-sans">
      <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6 space-y-5">
        
        {/* User Identity Header Card */}
        <motion.section 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="relative overflow-hidden rounded-[24px] border border-[#D8E8DB] bg-white p-5 sm:p-6 shadow-sm"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#167C5A] via-[#FFF7E8] to-[#D97706]" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="relative shrink-0">
              <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#243B32] via-[#D97706] to-[#167C5A] p-0.5 shadow-sm">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white text-2xl font-black text-[#243B32]">
                  {avatar ? <img src={avatar} alt="Profile" className="h-full w-full object-cover" /> : initials || <User className="h-10 w-10 text-slate-400" />}
                </div>
              </div>
              <label 
                className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#245D45] text-white shadow-sm transition-transform active:scale-95" 
                title={hi ? "फोटो बदलें" : "Change photo"}
              >
                <Camera className="h-3.5 w-3.5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
              </label>
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#D97706]">
                  {hi ? "RPF समाहित पोर्टल" : "RPF SAMAHIT PORTAL"}
                </span>
                {isVolunteer && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[9px] font-extrabold text-[#167C5A] border border-emerald-200">
                    <BadgeCheck className="h-3 w-3" /> {hi ? "सत्यापित स्वयंसेवक" : "Verified Volunteer"}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-[#243B32] truncate">{name}</h1>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 font-medium pt-0.5">
                {user?.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-slate-400" /> {user.phone}</span>}
                {user?.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-slate-400" /> {user.email}</span>}
              </div>
            </div>
          </div>

          </motion.section>

        {/* Animated Seva Metrics Dashboard (User/Volunteer/Citizen) */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#243B32] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#D97706]" />
              {isVolunteer 
                ? (hi ? "मेरी सेवा उपलब्धियां एवं प्रभाव" : "My Volunteer Seva Impact")
                : (hi ? "नागरिक सेवा प्रोफाइल मेट्रिक्स" : "Citizen Seva Profile Metrics")}
            </h2>
            <span className="text-[10px] font-medium text-slate-400">
              {hi ? "लाइव ट्रैकिंग" : "Live Real-Time"}
            </span>
          </div>

          <p className="px-1 text-[10px] font-medium text-slate-500">{hi ? "यहाँ केवल आपकी व्यक्तिगत प्रोफाइल और खाता विकल्प हैं। स्वयंसेवक ड्यूटी Activity में और Jan Seva Card Explore में मिलेगा।" : "This area contains only your personal profile and account options. Volunteer Duty belongs in Activity and Jan Seva Card is available in Explore."}</p>\n\n          <div className="grid grid-cols-2 gap-3">
            {isVolunteer ? (
              <>
                <AnimatedMetricCard
                  label={hi ? "कुल सेवा घंटे" : "Duty Hours Logged"}
                  subLabel={hi ? "फील्ड एवं शिविर समय" : "Active field service"}
                  value={volunteerDutyHours}
                  suffix=" hrs"
                  icon={Clock}
                  tone="saffron"
                  delay={0.05}
                  onClick={() => navigate("/volunteer-duty")}
                />
                <AnimatedMetricCard
                  label={hi ? "सत्यापित रिपोर्ट्स" : "Field Missions"}
                  subLabel={hi ? "स्वीकृत सेवा कार्य" : "Verified reports"}
                  value={volunteerReportsCount}
                  suffix="+"
                  icon={CheckCircle2}
                  tone="green"
                  delay={0.1}
                  onClick={() => navigate("/volunteer-duty")}
                />
                <AnimatedMetricCard
                  label={hi ? "सेवा कर्म अंक" : "Seva Karma Points"}
                  subLabel={hi ? "सम्मान व प्रमाणन" : "Verified impact score"}
                  value={volunteerPoints}
                  suffix=" pts"
                  icon={Award}
                  tone="gold"
                  delay={0.15}
                  onClick={() => navigate("/my-certificates")}
                />
                <AnimatedMetricCard
                  label={hi ? "नागरिक लाभार्थी" : "Citizens Reached"}
                  subLabel={hi ? "प्रत्यक्ष राहत व सहायता" : "Directly supported"}
                  value={1240}
                  suffix="+"
                  icon={Users}
                  tone="navy"
                  delay={0.2}
                  onClick={() => navigate("/impact")}
                />
              </>
            ) : (
              <>
                <AnimatedMetricCard
                  label={hi ? "जन सेवा कार्ड" : "Jan Seva Card"}
                  subLabel={hi ? "डिजिटल पहचान स्थिति" : "Active & Verified"}
                  value={1}
                  prefix=""
                  suffix={hi ? " सक्रिय" : " Active"}
                  icon={IdCard}
                  tone="saffron"
                  delay={0.05}
                  onClick={() => navigate("/jan-seva-card")}
                />
                <AnimatedMetricCard
                  label={hi ? "नागरिक सेवा अंक" : "Citizen Karma"}
                  subLabel={hi ? "सहभागिता स्कोर" : "Participation points"}
                  value={185}
                  suffix=" pts"
                  icon={Sparkles}
                  tone="green"
                  delay={0.1}
                  onClick={() => navigate("/jan-seva-card")}
                />
                <AnimatedMetricCard
                  label={hi ? "कल्याणकारी योजनाएं" : "Welfare Services"}
                  subLabel={hi ? "उपलब्ध डिजिटल सेवाएं" : "Accessible benefits"}
                  value={8}
                  suffix="+"
                  icon={HeartHandshake}
                  tone="gold"
                  delay={0.15}
                  onClick={() => navigate("/services")}
                />
                <AnimatedMetricCard
                  label={hi ? "समाधान दर" : "Resolution Rate"}
                  subLabel={hi ? "पारदर्शी जन शिकायत" : "Verified tracking"}
                  value={100}
                  suffix="%"
                  icon={ShieldCheck}
                  tone="navy"
                  delay={0.2}
                  onClick={() => navigate("/grievance")}
                />
              </>
            )}
          </div>
        </section>

        {/* Quick Access Menu Grid */}
        <section className="space-y-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#243B32] px-1">
            {hi ? "मेरी प्रोफाइल और खाता" : "My Profile & Account"}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {accountItems.map(({ icon: Icon, title, sub, route, color, browserSettings }) => (
              <button
                key={title}
                onClick={() => browserSettings ? void openBrowserSettings(navigate) : navigate(route)}
                className="group flex flex-col justify-between rounded-[20px] border border-[#D8E8DB] bg-white p-4 text-left shadow-sm hover:border-slate-300 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${color} text-white shadow-sm`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="block text-xs font-semibold text-[#243B32] break-words">{title}</span>
                  <span className="block text-[10px] font-medium text-slate-500 break-words mt-0.5">{sub}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Legal, Governance & Policy Options */}
        <section className="space-y-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#243B32] px-1 flex items-center justify-between">
            <span>{hi ? "नीति, नियम एवं पारदर्शिता" : "Policy, Legal & Transparency"}</span>
            <ShieldCheck className="h-4 w-4 text-[#167C5A]" />
          </h2>

          <div className="rounded-[22px] border border-[#D8E8DB] bg-white overflow-hidden shadow-sm divide-y divide-slate-100">
            {legalItems.map(({ id, icon: Icon, title, sub }) => (
              <button
                key={id}
                onClick={() => setActiveModal(id)}
                className="w-full flex items-center gap-3.5 p-3.5 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0FAF4] text-[#245D45]">
                  <Icon className="h-4.5 w-4.5 text-[#243B32]" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-[#243B32]">{title}</span>
                  <span className="block text-[10px] font-medium text-slate-500 truncate">{sub}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        </section>

        {/* Logout Section */}
        <section className="pt-2">
          <button
            onClick={() => { void logout(); navigate("/"); }}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50/70 py-3 text-xs font-extrabold text-red-600 hover:bg-red-100/80 transition-colors shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            {hi ? "खाते से लॉग आउट करें" : "Log Out of Account"}
          </button>
        </section>

        <p className="text-center text-[10px] font-medium text-slate-400 pt-2">
          RP Foundation Seva App • Samahit Portal • Built with Pride
        </p>

      </div>

      {/* Modal Dialog Viewer for T&C, Privacy Policy, Disclaimer, Support & About */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-xl rounded-[26px] border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
            >
              {/* Modal Header */}
              <div className="border-b border-amber-200 bg-gradient-to-r from-[#FFF7E8] via-[#F0FAF4] to-[#FFE5C4] p-4 flex items-center justify-between text-[#243B32] shrink-0">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-[#D97706]" />
                  <h3 className="text-sm font-black tracking-wide">
                    {activeModal === "terms" && (hi ? "नियम एवं शर्तें (Terms & Conditions)" : "Terms & Conditions")}
                    {activeModal === "privacy" && (hi ? "गोपनीयता नीति (Privacy Policy)" : "Privacy Policy")}
                    {activeModal === "disclaimer" && (hi ? "अस्वीकरण व सूचना (Disclaimer Notice)" : "Disclaimer & Legal Notice")}
                    {activeModal === "support" && (hi ? "सहायता एवं संपर्क (Help Desk & Support)" : "Help Desk & Support")}
                    {activeModal === "about" && (hi ? "ऐप विवरण (About Samahit)" : "About Samahit & App Version")}
                  </h3>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="rounded-full p-1 text-slate-600 hover:text-[#243B32] hover:bg-amber-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Core Consistency Disclaimer Banner */}
              <div className="bg-amber-50 p-3 border-b border-amber-200/80 text-[11px] leading-relaxed text-[#243B32] font-medium shrink-0 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#D97706]">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-[#D97706]" />
                  <span>{hi ? "मुख्य पारदर्शिता घोषणाएं (Core Transparency Notice)" : "Core Organizational Transparency Notice"}</span>
                </div>
                <p>• <strong>Samahit is a volunteer-developed application.</strong></p>
                <p>• <strong>Samahit is not an official government application.</strong></p>
                <p>• <strong>RP Foundation is not responsible for the Samahit application, its operation, content, functionality, or services.</strong></p>
                <p className="text-[10px] text-slate-600 italic">Government and third-party websites are independently operated and are not controlled by Samahit. Users should verify important information directly through the relevant official source.</p>
              </div>

              {/* Modal Body Content */}
              <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-700">

                {activeModal === "terms" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-extrabold text-[#243B32] text-sm mb-1">Terms & Conditions</h4>
                      <p className="text-slate-600">Welcome to <strong>Samahit</strong>. Samahit is a volunteer-developed application intended to make useful information, resources, references, and selected services easier to discover and access through a single platform.</p>
                      <p className="mt-1 text-slate-600">By accessing, browsing, registering with, or using Samahit, you acknowledge that you have read, understood, and agreed to these Terms & Conditions. If you do not agree with these terms, you should discontinue use of the application.</p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider">1. About Samahit</h5>
                      <p>Samahit is an independently developed, volunteer-driven application. The application is designed to provide users with convenient access to information, resources, links, references, and other features that may be useful to the community. Samahit may contain information collected, compiled, organized, or presented by volunteers from publicly available or otherwise permissible sources.</p>

                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider pt-2">2. Volunteer-Developed Application</h5>
                      <p>Samahit is made and maintained by volunteers associated with the Samahit initiative. The application may be developed, maintained, improved, updated, or supported by different volunteers and contributors. Because Samahit is a volunteer-developed initiative, certain features, information, links, and support services may change from time to time.</p>

                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider pt-2">3. Relationship with RP Foundation</h5>
                      <p>Samahit may have been developed or supported by volunteers associated with RP Foundation. However: <strong>RP Foundation is not responsible for the Samahit application, its operation, content, functionality, availability, technical performance, information, links, or services.</strong> Samahit must not be interpreted as an official application, product, service, publication, or communication of RP Foundation. Any reference to RP Foundation is provided only to explain the background or association of volunteers involved in the initiative and does not establish responsibility, ownership, endorsement, sponsorship, or operational control.</p>

                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider pt-2">4. Not a Government Application</h5>
                      <p>Samahit is not an official government application or government portal. Samahit is not operated, controlled, administered, or maintained by any government department or government authority unless a specific statement expressly says otherwise. The presence of a government-related link, information, reference, logo, department name, or service description within Samahit does not by itself establish any government affiliation or endorsement.</p>

                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider pt-2">5. Government Information and Services</h5>
                      <p>Samahit may provide links or references to government websites, portals, departments, schemes, services, forms, notifications, or other publicly available resources. Such information is provided primarily for convenience and informational purposes. Government departments may independently change rules, eligibility, procedures, fees, deadlines, or URLs. Users should always verify important information directly through the relevant official government source.</p>

                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider pt-2">6. External Websites and Services</h5>
                      <p>Samahit may contain links to third-party websites or services. These external services are independent of Samahit. Samahit does not own, operate, control, or guarantee external websites. Following an external link subjects users to that website's terms and privacy policies.</p>

                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider pt-2">7. Accuracy of Information</h5>
                      <p>Reasonable efforts are made to provide useful information, but Samahit does not guarantee that information will always be accurate, complete, current, or error-free. Information may become outdated without notice.</p>

                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider pt-2">8. User Accounts & Acceptable Use</h5>
                      <p>Users must provide accurate details when creating accounts and protect login credentials. Users agree to use Samahit responsibly, legally, and without interfering with security, attempting unauthorized access, or distributing malicious code.</p>

                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider pt-2">9. Limitation of Responsibility</h5>
                      <p>To the maximum extent permitted by law, Samahit and its volunteers shall not be responsible for any loss, damage, inconvenience, or consequence resulting from reliance on the application or third-party/government links.</p>

                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider pt-2">10. Acceptance of Terms</h5>
                      <p>By continuing to use Samahit, you acknowledge that you have understood these Terms & Conditions and agree to use the application responsibly.</p>
                    </div>
                  </div>
                )}

                {activeModal === "privacy" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-extrabold text-[#243B32] text-sm mb-1">Privacy Policy</h4>
                      <p className="text-slate-600">Your privacy is important to us. This Privacy Policy explains how information may be collected, used, stored, protected, and shared when you use Samahit. Samahit is a volunteer-developed application and is not an official government application.</p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider">1. Scope of Policy</h5>
                      <p>This policy applies to information handled through Samahit. It does not automatically apply to external websites or government portals accessed via external links.</p>

                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider pt-2">2. Information You May Provide</h5>
                      <p>Depending on features used, Samahit may receive information voluntarily provided by you (e.g. name, email, phone number, login credentials, support feedback). Avoid submitting unnecessary sensitive information.</p>

                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider pt-2">3. Technical Information & Security</h5>
                      <p>Basic technical info (device type, browser, IP, error logs) may be processed for operation, performance, and security. Standard security measures protect account data, though absolute internet security cannot be guaranteed.</p>

                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider pt-2">4. How Information is Used</h5>
                      <p>Information is used strictly to provide features, manage accounts, respond to support inquiries, maintain security, and improve application functionality.</p>

                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider pt-2">5. Data Sharing & Third-Party Services</h5>
                      <p>Data is not sold to commercial advertisers. Technical infrastructure providers process limited data solely to operate hosting, security, and app functions.</p>

                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider pt-2">6. RP Foundation</h5>
                      <p>Samahit is developed by volunteers associated with RP Foundation. <strong>RP Foundation is not responsible for the Samahit application or its privacy practices.</strong></p>

                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider pt-2">7. Data Deletion & Privacy Inquiries</h5>
                      <p>Users may request deletion of their account data. Contact support via the app for any privacy inquiries.</p>
                    </div>
                  </div>
                )}

                {activeModal === "disclaimer" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-extrabold text-[#243B32] text-sm mb-1">Disclaimer & Notice</h4>
                      <p className="text-slate-600">Please read this Disclaimer carefully before relying on information available through Samahit.</p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider">1. Volunteer Initiative & No Govt Affiliation</h5>
                      <p><strong>Samahit is a volunteer-developed application.</strong> It is not an official government application, government portal, or department. Inclusion of government links or scheme references does not imply official government endorsement or affiliation.</p>

                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider pt-2">2. RP Foundation Disclaimer</h5>
                      <p><strong>RP Foundation is not responsible for Samahit.</strong> References to RP Foundation describe the background of volunteers involved and do not establish ownership or operational control by RP Foundation.</p>

                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider pt-2">3. Information May Change</h5>
                      <p>Government rules, scheme criteria, deadlines, and external links change frequently. Users must independently verify important information directly with official sources.</p>

                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider pt-2">4. No Professional Advice or Guarantee</h5>
                      <p>Content within Samahit does not constitute formal legal, medical, or financial advice. Using Samahit does not guarantee scheme eligibility, employment, or government approvals.</p>

                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider pt-2">5. Emergency Situations</h5>
                      <p><strong>Samahit is not an emergency service.</strong> Do not rely on Samahit for urgent medical, police, fire, or disaster response. Contact official emergency numbers directly.</p>
                    </div>
                  </div>
                )}

                {activeModal === "support" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-extrabold text-[#243B32] text-sm mb-1">Help Desk & Support</h4>
                      <p className="text-slate-600">Welcome to Samahit Support. We aim to make Samahit useful, reliable, and easy to use. Contact us for app support, reporting broken links, or submitting feedback.</p>
                    </div>

                    <div className="grid gap-2">
                      <a href={`tel:${settings.tollFree || "18008901234"}`} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <Phone className="h-4 w-4 text-emerald-600" />
                          <div>
                            <p className="font-bold text-[#243B32]">{hi ? "टोल-फ्री हेल्पलाइन" : "Toll-Free Helpline"}</p>
                            <p className="text-[10px] text-slate-500">{settings.tollFree || "1800-890-1234"} (24x7 Support)</p>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-400" />
                      </a>

                      <a href={`mailto:${settings.email || "support@rpfoundation.org"}`} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <Mail className="h-4 w-4 text-[#D97706]" />
                          <div>
                            <p className="font-bold text-[#243B32]">{hi ? "आधिकारिक ईमेल" : "Official Email"}</p>
                            <p className="text-[10px] text-slate-500">{settings.email || "support@rpfoundation.org"}</p>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-400" />
                      </a>
                    </div>

                    <div className="space-y-2 pt-1">
                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider">Support Guidelines</h5>
                      <p>• <strong>Reporting Broken Links & Incorrect Info:</strong> Provide the page name, link, and correct information if available.</p>
                      <p>• <strong>Government Website Issues:</strong> Government portals are operated independently. Contact the relevant department directly for official submissions.</p>
                      <p>• <strong>Credentials Safety:</strong> Never share your password, OTP, or secret credentials with support personnel.</p>
                      <p>• <strong>Response Time:</strong> Samahit is maintained by volunteers; response times may vary.</p>
                    </div>
                  </div>
                )}

                {activeModal === "about" && (
                  <div className="space-y-4">
                    <div className="text-center py-2 space-y-2">
                      <div className="mx-auto w-14 h-14 rounded-2xl bg-[#245D45] text-white flex items-center justify-center font-black text-xl shadow-sm">
                        RPF
                      </div>
                      <div>
                        <h4 className="text-base font-black text-[#243B32]">Samahit Application</h4>
                        <p className="text-[11px] text-[#D97706] font-extrabold uppercase tracking-wider">v2.4.0 • Build 2026.08</p>
                      </div>
                      <p className="text-[11px] text-slate-600 max-w-xs mx-auto">
                        Useful • Simple • Transparent • Accessible • Community-Oriented
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider">What is Samahit?</h5>
                      <p>Samahit is a volunteer-developed application created to bring useful information, resources, references, and selected services together in one convenient platform.</p>

                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider pt-2">Made by Volunteers</h5>
                      <p>Samahit is made and maintained by volunteers. Different volunteers participate in development, design, testing, content organization, and support.</p>

                      <h5 className="font-bold text-[#243B32] uppercase text-[11px] tracking-wider pt-2">Relationship with RP Foundation & Govt</h5>
                      <p>Some volunteers may be associated with RP Foundation, but <strong>RP Foundation is not responsible for the Samahit application, its operation, content, functionality, or services.</strong> Samahit is not an official government app.</p>

                      <p className="text-[10px] font-medium text-slate-400 pt-2 text-center border-t border-slate-100">
                        © 2026 Samahit Volunteer Initiative. All Rights Reserved.
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
                <button
                  onClick={() => setActiveModal(null)}
                  className="rounded-xl bg-[#245D45] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1d4f3a] transition-colors"
                >
                  {hi ? "बंद करें" : "Close"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}


