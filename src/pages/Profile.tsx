import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { 
  Award, ChevronRight, HeartHandshake, IdCard, Mail, Phone, Settings, 
  ShieldCheck, User, LogOut, FileText, Camera, BadgeCheck,
  Lock, AlertTriangle, HelpCircle, Info, X, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

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
  const registrationNo = volunteer?.registration_number || user?.registration_number || user?.volunteerData?.registration_number || user?.volunteerData?.registrationNumber || "RPF-VOL-2026-88";
  const sinceRaw = volunteer?.registeredAt || volunteer?.registered_at || volunteer?.created_at || volunteer?.createdAt || user?.volunteerData?.registeredAt || user?.volunteerData?.registered_at || user?.volunteerData?.created_at || user?.volunteerData?.createdAt;
  const volunteerSince = sinceRaw ? new Date(sinceRaw).toLocaleDateString(hi ? "hi-IN" : "en-IN", { month: "long", year: "numeric" }) : (hi ? "जनवरी 2026" : "January 2026");
  const initials = name.split(/\s+/).map(p => p[0]).slice(0, 2).join("").toUpperCase();

  const accountItems = useMemo(() => [
    { icon: IdCard, title: hi ? "जन सेवा कार्ड" : "Jan Seva Card", sub: hi ? "डिजिटल सेवा पहचान कार्ड" : "Digital seva identity card", route: "/jan-seva-card", color: "bg-[#D97706]" },
    { icon: Award, title: hi ? "मेरे प्रमाणपत्र" : "My Certificates", sub: hi ? "सेवा एवं भागीदारी प्रमाणपत्र" : "Certificates of service & impact", route: "/my-certificates", color: "bg-purple-600" },
    { icon: HeartHandshake, title: hi ? "स्वयंसेवक ड्यूटी" : "Volunteer Duty", sub: hi ? "ड्यूटी ट्रैकर व रिपोर्ट" : "Duty clock-in & reports", route: "/volunteer-duty", color: "bg-[#167C5A]" },
    { icon: Settings, title: hi ? "ऐप सेटिंग्स" : "App Settings", sub: hi ? "भाषा व थीम प्राथमिकताएं" : "Language & theme preferences", route: "/settings", color: "bg-[#14213D]" },
  ], [hi]);

  const legalItems = [
    { id: "terms" as const, icon: FileText, title: hi ? "नियम एवं शर्तें" : "Terms & Conditions", sub: hi ? "सेवा व ऐप उपयोग के नियम" : "Terms governing app usage" },
    { id: "privacy" as const, icon: Lock, title: hi ? "गोपनीयता नीति" : "Privacy Policy", sub: hi ? "डेटा सुरक्षा एवं सुरक्षा नीति" : "Data protection & privacy guidelines" },
    { id: "disclaimer" as const, icon: AlertTriangle, title: hi ? "अस्वीकरण व सूचना" : "Disclaimer & Notice", sub: hi ? "पारदर्शिता एवं कानूनी घोषणाएं" : "Official transparency statements" },
    { id: "support" as const, icon: HelpCircle, title: hi ? "सहायता एवं संपर्क" : "Help Desk & Support", sub: hi ? "हेल्पलाइन एवं प्रतिक्रिया" : "Toll-free, email & WhatsApp support" },
    { id: "about" as const, icon: Info, title: hi ? "ऐप संस्करण एवं जानकारी" : "About App & Version", sub: "Samahit Seva v2.4.0 (Build 2026.08)" },
  ];

  return (
    <main className="min-h-full bg-slate-50/60 pb-28 text-slate-900 font-sans">
      <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6 space-y-5">
        
        {/* User Identity Header Card */}
        <motion.section 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#14213D] via-[#D97706] to-[#167C5A]" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="relative shrink-0">
              <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#14213D] via-[#D97706] to-[#167C5A] p-0.5 shadow-md">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white text-2xl font-black text-[#14213D]">
                  {avatar ? <img src={avatar} alt="Profile" className="h-full w-full object-cover" /> : initials || <User className="h-10 w-10 text-slate-400" />}
                </div>
              </div>
              <label 
                className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#14213D] text-white shadow-md transition-transform active:scale-95" 
                title={hi ? "फोटो बदलें" : "Change photo"}
              >
                <Camera className="h-3.5 w-3.5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
              </label>
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#D97706]">
                  {hi ? "RPF समाहित पोर्टल" : "RPF SAMAHIT PORTAL"}
                </span>
                {isVolunteer && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[9px] font-extrabold text-[#167C5A] border border-emerald-200">
                    <BadgeCheck className="h-3 w-3" /> {hi ? "सत्यापित स्वयंसेवक" : "Verified Volunteer"}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-[#14213D] truncate">{name}</h1>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 font-medium pt-0.5">
                {user?.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-slate-400" /> {user.phone}</span>}
                {user?.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-slate-400" /> {user.email}</span>}
              </div>
            </div>
          </div>

          {/* Volunteer Status Badge Strip */}
          {isVolunteer && (
            <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50/50 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D97706] text-white shadow-xs">
                  <IdCard className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#14213D]">{hi ? "जन सेवा पंजीकरण क्रमांक" : "Registration Number"}</p>
                  <p className="text-[11px] font-extrabold text-[#D97706] tracking-wide">{registrationNo}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500">{hi ? "सेवा अवधि:" : "Serving:"} {volunteerSince}</span>
                <button 
                  onClick={() => navigate("/jan-seva-card")}
                  className="rounded-xl bg-[#14213D] px-3 py-1.5 text-[11px] font-bold text-white shadow-xs hover:bg-[#1f325c] transition-colors flex items-center gap-1"
                >
                  {hi ? "कार्ड देखें" : "View Card"} <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </motion.section>

        {/* Quick Access Menu Grid */}
        <section className="space-y-2.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#14213D] px-1">
            {hi ? "त्वरित सेवाएं व कार्य" : "Quick Services & Actions"}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {accountItems.map(({ icon: Icon, title, sub, route, color }) => (
              <button
                key={title}
                onClick={() => navigate(route)}
                className="group flex flex-col justify-between rounded-[20px] border border-slate-200/80 bg-white p-4 text-left shadow-xs hover:border-slate-300 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${color} text-white shadow-xs`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="block text-xs font-black text-[#14213D] line-clamp-1">{title}</span>
                  <span className="block text-[10px] font-medium text-slate-500 line-clamp-1 mt-0.5">{sub}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Legal, Governance & Policy Options */}
        <section className="space-y-2.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#14213D] px-1 flex items-center justify-between">
            <span>{hi ? "नीति, नियम एवं पारदर्शिता" : "Policy, Legal & Transparency"}</span>
            <ShieldCheck className="h-4 w-4 text-[#167C5A]" />
          </h2>

          <div className="rounded-[22px] border border-slate-200/80 bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
            {legalItems.map(({ id, icon: Icon, title, sub }) => (
              <button
                key={id}
                onClick={() => setActiveModal(id)}
                className="w-full flex items-center gap-3.5 p-3.5 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Icon className="h-4.5 w-4.5 text-[#14213D]" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-[#14213D]">{title}</span>
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
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50/70 py-3 text-xs font-extrabold text-red-600 hover:bg-red-100/80 transition-colors shadow-xs"
          >
            <LogOut className="h-4 w-4" />
            {hi ? "खाते से लॉग आउट करें" : "Log Out of Account"}
          </button>
        </section>

        <p className="text-center text-[10px] font-bold text-slate-400 pt-2">
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
              className="w-full max-w-lg rounded-[26px] border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="bg-[#14213D] p-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-[#D97706]" />
                  <h3 className="text-sm font-black tracking-wide">
                    {activeModal === "terms" && (hi ? "नियम एवं शर्तें (Terms & Conditions)" : "Terms & Conditions")}
                    {activeModal === "privacy" && (hi ? "गोपनीयता नीति (Privacy Policy)" : "Privacy Policy")}
                    {activeModal === "disclaimer" && (hi ? "अस्वीकरण व घोषणा (Disclaimer Notice)" : "Disclaimer & Legal Notice")}
                    {activeModal === "support" && (hi ? "सहायता एवं संपर्क (Help Desk)" : "Help Desk & Support")}
                    {activeModal === "about" && (hi ? "ऐप विवरण (App Metadata)" : "About Application")}
                  </h3>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="rounded-full p-1 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body Content */}
              <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-700">

                {activeModal === "terms" && (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 text-[#14213D] font-medium">
                      <p className="font-bold text-amber-800 mb-1">{hi ? "सेवा शर्तें संक्षेप:" : "Summary of Terms:"}</p>
                      {hi 
                        ? "RP Foundation समाहित पोर्टल का उपयोग समाज सेवा, जन कल्याण और नागरिक सहायता हेतु किया जाता है। सभी उपयोगकर्ताओं से नैतिक और सत्यवादी आचरण की अपेक्षा की जाती है।"
                        : "RP Foundation Samahit Portal is operated strictly for community service, public welfare, and citizen support. Users are expected to maintain lawful and honest behavior."}
                    </div>

                    <h4 className="font-extrabold text-[#14213D] text-xs uppercase tracking-wider">{hi ? "1. खाता दायित्व" : "1. Account Responsibilities"}</h4>
                    <p>{hi ? "उपयोगकर्ता को अपना मोबाइल नंबर एवं व्यक्तिगत जानकारी सत्य और अद्यतन रखनी होगी। गलत जानकारी पाए जाने पर खाता निलंबित किया जा सकता है।" : "Users must maintain accurate registration details. False or misleading identity verification may result in account restriction."}</p>

                    <h4 className="font-extrabold text-[#14213D] text-xs uppercase tracking-wider">{hi ? "2. स्वयंसेवक आचरण" : "2. Volunteer Code of Conduct"}</h4>
                    <p>{hi ? "स्वयंसेवक किसी भी मौद्रिक वसूली या अनधिकृत शुल्क की मांग नहीं करेंगे। समस्त जनसेवा निःशुल्क एवं निस्वार्थ भाव से होगी।" : "Volunteers shall not collect monetary fees or unauthorized donations under the organization's name without official receipts."}</p>

                    <h4 className="font-extrabold text-[#14213D] text-xs uppercase tracking-wider">{hi ? "3. बौद्धिक संपदा" : "3. Intellectual Property"}</h4>
                    <p>{hi ? "RP Foundation का लोगो, ब्रांड प्रतीक व जन सेवा कार्ड प्रारूप सर्वाधिकार सुरक्षित हैं।" : "RP Foundation brand assets, logos, and digital Jan Seva Card templates are copyrighted and proprietary."}</p>
                  </div>
                )}

                {activeModal === "privacy" && (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200 text-[#167C5A] font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4 shrink-0" />
                      <span>{hi ? "आपका डेटा 256-बिट एन्क्रिप्शन के साथ पूर्णतः सुरक्षित है।" : "Your personal data is encrypted with enterprise 256-bit standards."}</span>
                    </div>

                    <h4 className="font-extrabold text-[#14213D] text-xs uppercase tracking-wider">{hi ? "1. एकत्रित डेटा" : "1. Information Collected"}</h4>
                    <p>{hi ? "हम केवल नाम, संपर्क नंबर, ईमेल एवं स्वयंसेवक कार्य विवरण ही एकत्र करते हैं। कोई भी व्यक्तिगत वित्तीय डेटा संग्रहित नहीं किया जाता।" : "We collect basic profile attributes (name, phone, email, district, volunteer skills) strictly for service management."}</p>

                    <h4 className="font-extrabold text-[#14213D] text-xs uppercase tracking-wider">{hi ? "2. डेटा का उपयोग" : "2. Data Usage"}</h4>
                    <p>{hi ? "आपकी जानकारी का उपयोग केवल आपदा राहत, जन सेवा कार्यों एवं आधिकारिक सूचनाएं भेजने के लिए होता है।" : "Data is utilized strictly for community outreach, relief duty assignment, and verification of official certificates."}</p>

                    <h4 className="font-extrabold text-[#14213D] text-xs uppercase tracking-wider">{hi ? "3. थर्ड पार्टी शेयरिंग" : "3. Third Party Sharing"}</h4>
                    <p>{hi ? "आपका डेटा किसी भी व्यावसायिक एजेंसी को बेचा या साझा नहीं किया जाता।" : "We never sell, trade, or monetize your personal identity to commercial advertizers."}</p>
                  </div>
                )}

                {activeModal === "disclaimer" && (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-slate-100 p-3 border border-slate-200 text-slate-800">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mb-1" />
                      <p className="font-bold">{hi ? "गैर-सरकारी संगठन घोषणा:" : "Non-Governmental NGO Notice:"}</p>
                      <p className="text-[11px] mt-0.5">{hi ? "RP Foundation एक स्वतंत्र सामाजिक संगठन है। यह ऐप किसी सरकारी विभाग का आधिकारिक प्रतिनिधित्व नहीं करता।" : "RP Foundation is an independent social welfare trust and does not represent any government department directly."}</p>
                    </div>

                    <h4 className="font-extrabold text-[#14213D] text-xs uppercase tracking-wider">{hi ? "सूचनाओं की प्रामाणिकता" : "Authenticity of Information"}</h4>
                    <p>{hi ? "ऐप में प्रदर्शित समाचार व सरकारी बुलेटिन (PIB, IMD Mausam, NDMA) आधिकारिक सार्वजनिक RSS/APIs स्रोत से प्रदर्शित किए जाते हैं।" : "News headers & disaster alerts from PIB, IMD Weather, and NDMA are ingested directly via public government RSS feeds."}</p>
                  </div>
                )}

                {activeModal === "support" && (
                  <div className="space-y-3">
                    <p className="font-semibold text-slate-700">{hi ? "किसी भी सहायता या प्रश्न के लिए नीचे दिए गए माध्यमों से संपर्क करें:" : "Contact official support team via available channels:"}</p>
                    
                    <div className="grid gap-2">
                      <a href={`tel:${settings.tollFree || "18008901234"}`} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <Phone className="h-4 w-4 text-emerald-600" />
                          <div>
                            <p className="font-bold text-[#14213D]">{hi ? "टोल-फ्री हेल्पलाइन" : "Toll-Free Helpline"}</p>
                            <p className="text-[10px] text-slate-500">{settings.tollFree || "1800-890-1234"} (24x7 Support)</p>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-400" />
                      </a>

                      <a href={`mailto:${settings.email || "support@rpfoundation.org"}`} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <Mail className="h-4 w-4 text-[#D97706]" />
                          <div>
                            <p className="font-bold text-[#14213D]">{hi ? "आधिकारिक ईमेल" : "Official Email"}</p>
                            <p className="text-[10px] text-slate-500">{settings.email || "support@rpfoundation.org"}</p>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-400" />
                      </a>
                    </div>
                  </div>
                )}

                {activeModal === "about" && (
                  <div className="space-y-3 text-center py-2">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-[#14213D] text-white flex items-center justify-center font-black text-xl shadow-md">
                      RPF
                    </div>
                    <div>
                      <h4 className="text-base font-black text-[#14213D]">Samahit Seva App</h4>
                      <p className="text-[11px] text-[#D97706] font-extrabold uppercase tracking-wider">v2.4.0 • Build 2026.08</p>
                    </div>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      {hi ? "RP Foundation का आधिकारिक डिजिटल सेवा ऐप। जन कल्याण, स्वयंसेवक प्रबंधन एवं त्वरित सहायता हेतु।" : "Official digital portal for RP Foundation community initiatives, volunteer management and civic empowerment."}
                    </p>
                    <div className="pt-2 text-[10px] font-bold text-slate-400 border-t border-slate-100">
                      © 2026 RP Foundation. All Rights Reserved.
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
                <button
                  onClick={() => setActiveModal(null)}
                  className="rounded-xl bg-[#14213D] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1f325c] transition-colors"
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

