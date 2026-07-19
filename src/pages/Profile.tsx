import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { 
  User, Shield, Award, MapPin, Languages, BookMarked, 
  Settings, HelpCircle, AlertTriangle, Info, LogOut, CheckCircle2, 
  ChevronRight, Heart, QrCode, Download, X, ShieldCheck
} from "lucide-react";
import { translations } from "../translations";

type Level = { label: string; color: string; bg: string; points: number };

function getMemberLevel(role: string, status: string | undefined, isVol?: boolean, isDonor?: boolean): Level {
  if (role === "super_admin" || role === "admin") {
    return { label: "Platinum", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", points: 1000 };
  }
  if (isVol && isDonor) {
    return { label: "Gold", color: "text-amber-700", bg: "bg-amber-50 border-amber-250", points: 750 };
  }
  if (isVol || isDonor || status === "approved") {
    return { label: "Silver", color: "text-slate-700", bg: "bg-slate-50 border-slate-200", points: 500 };
  }
  if (status === "pending") {
    return { label: "Bronze", color: "text-amber-900", bg: "bg-amber-100/50 border-amber-200", points: 250 };
  }
  return { label: "Member", color: "text-slate-600", bg: "bg-slate-100 border-slate-200", points: 50 };
}

type Badge = { id: string; label: string; color: string; earned: boolean };

function getBadges(status: string | undefined, isVol?: boolean, isDonor?: boolean): Badge[] {
  return [
    { id: "citizen", label: "Citizen", color: "bg-gradient-to-br from-blue-600 to-blue-800", earned: true },
    { id: "jan-seva", label: "Jan Seva", color: "bg-gradient-to-br from-purple-600 to-purple-800", earned: (status !== "none" && !!status) },
    { id: "volunteer", label: "Volunteer", color: "bg-gradient-to-br from-green-600 to-green-800", earned: !!isVol },
    { id: "donor", label: "Donor", color: "bg-gradient-to-br from-red-600 to-red-800", earned: !!isDonor },
    { id: "community", label: "Community", color: "bg-gradient-to-br from-amber-600 to-amber-800", earned: false },
    { id: "hero", label: "Seva Hero", color: "bg-gradient-to-br from-orange-600 to-orange-800", earned: false },
  ];
}

export default function Profile() {
  const { user, logout, language, setLanguage } = useAuth();
  const { settings, cmsConfig } = useApp();
  const navigate = useNavigate();
  
  const t = translations[language];

  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 min-h-full pb-24">
        <h2 className="font-display font-bold text-xl text-[#000080] mb-2">Not Logged In</h2>
        <p className="text-xs text-slate-500 mb-4">Please log in to view your profile.</p>
        <button 
          onClick={() => navigate("/")}
          className="bg-[#000080] text-white px-4 py-2 rounded-lg text-xs font-bold"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const level = getMemberLevel(user.role, user.janSevaCardStatus, user.isVolunteer, user.isDonor);
  const badges = getBadges(user.janSevaCardStatus, user.isVolunteer, user.isDonor);
  const earnedCount = badges.filter((b) => b.earned).length;



  const roleLabel: Record<string, string> = {
    guest: "Guest User",
    citizen: "Citizen Member",
    volunteer: "Volunteer",
    donor: "Donor",
    admin: "Administrator",
    super_admin: "Super Admin",
  };

  const [downloadingCard, setDownloadingCard] = useState(false);

  const handleDownloadPDF = async () => {
    const cardEl = document.getElementById("digital-id-card-element");
    if (!cardEl) return;
    
    setDownloadingCard(true);
    try {
      const canvas = await html2canvas(cardEl, {
        scale: 3, // higher resolution
        useCORS: true,
        backgroundColor: null
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [canvas.width * 0.264583, canvas.height * 0.264583]
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width * 0.264583, canvas.height * 0.264583);
      pdf.save(`Jan_Seva_Card_${user.name.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF card. Please try again.");
    } finally {
      setDownloadingCard(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm(language === "hi" ? "क्या आप लॉग आउट करना चाहते हैं?" : "Are you sure you want to sign out?")) {
      await logout();
      navigate("/");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn pb-24">
      {/* Profile Hero section with Tricolour Gradient Header */}
      <div className="bg-gradient-to-r from-[#07142A] via-[#0B1E3F] to-[#122A54] pt-6 pb-6 px-5 relative overflow-hidden shrink-0 text-white shadow-md border-b border-gold-soft">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF9933]/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          {/* Avatar Ring & Floating Level */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-[#D4AF37]/50 p-1 bg-white/5 backdrop-blur-md flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FF9933] to-[#FF5722] flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
                {initials}
              </div>
            </div>
            <div className={`absolute -bottom-2 -right-1 flex items-center gap-0.5 px-2.5 py-0.5 rounded-full border border-gold-soft bg-slate-900 text-[8px] font-black uppercase tracking-widest text-[#D4AF37] shadow-lg`}>
              <Award className="w-2.5 h-2.5" />
              <span>{level.label}</span>
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            <h2 className="font-display font-extrabold text-xl tracking-tight leading-tight">{user.name}</h2>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/5 py-0.5 px-2.5 rounded-full w-fit">
              <span className="w-1.5 h-1.5 bg-[#138808] rounded-full animate-pulse"></span>
              <span className="text-[9px] font-black tracking-widest uppercase text-slate-200">{roleLabel[user.role] || user.role}</span>
            </div>
            {user.phone && <p className="text-[10px] text-slate-400 font-bold tracking-wide font-mono">+91 {user.phone}</p>}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-4 gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 mt-5 text-center shadow-inner">
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-[#D4AF37]">{earnedCount}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Badges</span>
          </div>
          <div className="w-[1px] h-6 bg-white/10 self-center"></div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-[#D4AF37]">{level.points}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Points</span>
          </div>
          <div className="w-[1px] h-6 bg-white/10 self-center"></div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-[#D4AF37]">
              {user.janSevaCardStatus === "approved" ? "Active" : user.janSevaCardStatus === "pending" ? "Pending" : "None"}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Jan Seva</span>
          </div>
          <div className="w-[1px] h-6 bg-white/10 self-center"></div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-[#D4AF37]">{user.isVolunteer ? "Yes" : "No"}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Volunteer</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Physical Digital ID Card layout (Premium Gold Smart Card look) */}
        {user.role !== "guest" && (
          <>
            <div id="digital-id-card-element" className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl p-5 shadow-2xl border-2 border-[#D4AF37]/35 text-white relative overflow-hidden">
            {/* Fine Golden Mandala background grid layer */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-56 h-56 text-[#D4AF37]" fill="currentColor">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                <path d="M50 5l2 15 15-15-5 25 15-5-25 5 15 15-25-2 5 25-15-15-5 15-15-15-5 15-5-25-25 2 15-15-25-5 15-5-15-25 15 15z"/>
              </svg>
            </div>
            
            {/* Filigree corner accents */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#D4AF37]/50 rounded-tl-sm"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#D4AF37]/50 rounded-tr-sm"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[#D4AF37]/50 rounded-bl-sm"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[#D4AF37]/50 rounded-br-sm"></div>

            <div className="flex justify-between items-start mb-5 relative z-10">
              <div className="flex items-center gap-2">
                <img src="/assets/logo.png" alt="Logo" className="w-8 h-8 rounded-full bg-white p-0.5 border border-[#D4AF37]/30" />
                <div>
                  <h3 className="font-display font-black text-xs text-white tracking-widest leading-none">RP FOUNDATION</h3>
                  <p className="text-[8px] text-[#D4AF37] font-black uppercase tracking-widest mt-0.5">Jan Seva Smart Identity</p>
                </div>
              </div>
              
              {/* Metallic Gold Chip Hologram */}
              <div className="w-9 h-7 rounded-sm bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 p-[3px] flex flex-col justify-between border border-yellow-200/50 shadow-inner relative overflow-hidden">
                <div className="flex justify-between h-[25%]">
                  <div className="w-[30%] h-full border-r border-amber-950/20"></div>
                  <div className="w-[30%] h-full border-l border-amber-950/20"></div>
                </div>
                <div className="h-[20%] border-y border-amber-950/20"></div>
                <div className="flex justify-between h-[25%]">
                  <div className="w-[30%] h-full border-r border-amber-950/20"></div>
                  <div className="w-[30%] h-full border-l border-amber-950/20"></div>
                </div>
              </div>
            </div>

            <div className="mb-5 relative z-10 pl-1">
              <h2 className="font-display font-extrabold text-base uppercase tracking-wider text-white leading-none">{user.name}</h2>
              <p className="text-[9px] text-[#D4AF37] font-mono mt-1 tracking-widest uppercase">ID: JSC-{user.id.slice(-8).toUpperCase()}</p>
            </div>

            <div className="flex justify-between items-end relative z-10">
              <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-md border border-white/10">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <p className="text-[8px] text-slate-400 uppercase tracking-widest">Card Status</p>
                <div className="flex items-center gap-1.5 justify-end mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">
                    {user.janSevaCardStatus === "approved" ? "Active" : user.janSevaCardStatus === "pending" ? "Pending" : "Not Issued"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleDownloadPDF}
            disabled={downloadingCard}
            className="mt-3 w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-600 hover:to-amber-600 text-slate-900 font-extrabold text-[10px] py-2.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer border border-[#D4AF37]/50 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {downloadingCard ? (language === "hi" ? "डाउनलोड हो रहा है..." : "Exporting PDF...") : (language === "hi" ? "स्मार्ट आईडी कार्ड डाउनलोड करें" : "Download Smart ID Card")}
          </button>
          </>
        )}

        {/* Achievements Card */}
        <div className="glass-card bg-white/90 p-4 border-gold-soft shadow-gold-premium space-y-3.5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="font-display font-extrabold text-xs text-chakra-navy uppercase tracking-wider">Achievements & Badges</h3>
            <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-250">{earnedCount}/{badges.length} Earned</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {badges.map((b) => (
              <div key={b.id} className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                b.earned ? "bg-white border-[#D4AF37]/25 shadow-gold-premium" : "bg-slate-100/30 border-slate-100 opacity-40"
              }`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-1.5 shadow-md font-black text-[10px] ${
                  b.earned ? `${b.color} border border-white/20` : "bg-slate-200 text-slate-400"
                }`}>
                  {b.label.slice(0, 2).toUpperCase()}
                </div>
                <span className={`text-[9px] font-bold ${b.earned ? "text-slate-800" : "text-slate-400"}`}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Administration Control Card (Role-Based Visibility) */}
        {(user.role === "admin" || user.role === "super_admin" || user.role === "volunteer") && (
          <div className="glass-card bg-[#0B1E3F] text-white border-[#D4AF37]/35 overflow-hidden rounded-2xl border">
            <div className="text-[9px] font-black text-slate-300 uppercase tracking-wider bg-slate-900/50 border-b border-white/5 px-4 py-2">
              System Administration
            </div>
            <div 
              onClick={() => navigate("/admin")}
              className="flex justify-between items-center px-4 py-3.5 cursor-pointer hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center justify-center text-[#FF9933]">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-wider text-white">Admin Command HQ</span>
                  <span className="text-[9.5px] text-slate-350 mt-0.5">Control settings, approve cards, and resolve grievances</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        )}

        {/* Account Options */}
        <div className="glass-card bg-white/90 border-gold-soft shadow-gold-premium overflow-hidden">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/80 border-b border-slate-100 px-4 py-2">
            My Profile & Preference
          </div>
          
          <div 
            onClick={() => navigate("/jan-seva-card")} 
            className="flex justify-between items-center px-4 py-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50/50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">{t.btnJanSeva}</span>
                <span className="text-[9px] text-slate-400 mt-0.5">{t.btnJanSevaDesc}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div 
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="flex justify-between items-center px-4 py-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50/50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-50 border border-amber-150 rounded-lg flex items-center justify-center text-amber-600">
                <Languages className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">{language === "en" ? "Translate to Hindi" : "अंग्रेजी में बदलें"}</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Language Settings / भाषा विकल्प</span>
              </div>
            </div>
            <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-250 uppercase">{language}</span>
          </div>

          <div 
            onClick={() => navigate("/grievance")}
            className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-slate-50/50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-50 border border-red-150 rounded-lg flex items-center justify-center text-red-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">{t.btnGrievance}</span>
                <span className="text-[9px] text-slate-400 mt-0.5">{t.btnGrievanceDesc}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Support Section */}
        <div className="glass-card bg-white/90 border-gold-soft shadow-gold-premium overflow-hidden">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/80 border-b border-slate-100 px-4 py-2">
            Support & Info
          </div>
          
          <div 
            onClick={() => setShowFaqModal(true)}
            className="flex justify-between items-center px-4 py-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50/50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">Help & FAQs</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>



          <div 
            onClick={() => setShowAboutModal(true)}
            className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-slate-50/50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600">
                <Info className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">About RP Foundation</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Sign Out Button */}
        <button 
          onClick={handleLogout}
          className="w-full bg-red-50 border border-red-200 text-red-700 py-3.5 rounded-xl font-bold text-sm shadow-sm hover:bg-red-100 transition flex justify-center items-center gap-2"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[80vh]">
            <div className="bg-gradient-to-r from-[#000080] to-indigo-900 px-4 py-3.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#FF9933]" />
                <span className="text-xs font-black uppercase tracking-wider">{language === "hi" ? "अक्सर पूछे जाने वाले प्रश्न" : "Frequently Asked Questions"}</span>
              </div>
              <button onClick={() => setShowFaqModal(false)} className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3.5 text-left text-xs">
              {((cmsConfig?.faqs && cmsConfig.faqs.length > 0) ? cmsConfig.faqs : [
                {
                  id: "faq-1",
                  questionEn: "What is the Jan Seva Smart ID Card?",
                  questionHi: "जन सेवा स्मार्ट आईडी कार्ड क्या है?",
                  answerEn: "It is a digital identity card provided by the RP Foundation for citizens of Madhya Pradesh to seamlessly access and manage all 21 public welfare schemes.",
                  answerHi: "यह मध्य प्रदेश के नागरिकों के लिए आरपी फाउंडेशन द्वारा प्रदान किया जाने वाला एक डिजिटल कार्ड है, जिसके माध्यम से आप सभी 21 कल्याणकारी सेवाओं का लाभ सरलता से उठा सकते हैं।"
                },
                {
                  id: "faq-2",
                  questionEn: "How long does card approval take?",
                  questionHi: "कार्ड स्वीकृति में कितना समय लगता है?",
                  answerEn: "After submitting your Aadhaar/KYC information, our verification desk typically reviews and approves your smart identity card within 2 to 3 business days.",
                  answerHi: "आवेदन जमा करने के बाद, सत्यापन टीम आपके दस्तावेजों की जांच करती है और साधारणतः 2 से 3 कार्य दिवसों के भीतर इसे स्वीकृत कर दिया जाता है।"
                },
                {
                  id: "faq-3",
                  questionEn: "How long does grievance resolution take?",
                  questionHi: "शिकायत निवारण में कितना समय लगता है?",
                  answerEn: "All citizen complaints are instantly routed to local desk volunteers and administrators. Resolutions or updates are typically posted within 48 to 72 hours.",
                  answerHi: "सभी नागरिक शिकायतों को दर्ज करने के बाद सीधे क्षेत्रीय प्रशासकों को भेजा जाता है, जो 48 से 72 घंटों के भीतर इसका समाधान करने का प्रयास करते हैं।"
                }
              ]).map((faq) => (
                <div key={faq.id} className="space-y-1 border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                  <h5 className="font-extrabold text-[#000080]">Q: {language === "hi" ? faq.questionHi : faq.questionEn}</h5>
                  <p className="text-slate-500 font-semibold leading-relaxed">
                    {language === "hi" ? faq.answerHi : faq.answerEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            <div className="bg-gradient-to-r from-[#000080] to-indigo-900 px-4 py-3.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#FF9933]" />
                <span className="text-xs font-black uppercase tracking-wider">{language === "hi" ? "आरपी फाउंडेशन के बारे में" : "About RP Foundation"}</span>
              </div>
              <button onClick={() => setShowAboutModal(false)} className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 text-left text-xs space-y-3.5">
              <div className="flex justify-center gap-4 mb-1">
                <div className="flex flex-col items-center">
                  <img src={cmsConfig?.logoImgUrl || "/assets/logo.png"} alt="Logo" className="w-14 h-14 rounded-full border border-slate-200 object-cover shadow-sm bg-white p-0.5" />
                  <span className="text-[7px] font-black uppercase text-slate-400 mt-1">Logo</span>
                </div>
                <div className="flex flex-col items-center">
                  <img src={cmsConfig?.founderImgUrl || "/assets/founder.png"} alt="Founder" className="w-14 h-14 rounded-full border border-slate-200 object-cover shadow-sm" />
                  <span className="text-[7px] font-black uppercase text-slate-400 mt-1">Founder</span>
                </div>
              </div>
              <h4 className="font-extrabold text-slate-800 text-center leading-none">
                {cmsConfig?.founderName || "Rohit Pandit"}
              </h4>
              <p className="text-[9.5px] font-black text-[#FF9933] text-center uppercase tracking-widest leading-none mt-1">
                {cmsConfig?.founderDesignation || "Founder, RP Foundation"}
              </p>
              <p className="text-slate-500 font-semibold leading-relaxed text-center pt-2">
                {language === "hi"
                  ? (cmsConfig?.aboutTextHi || "आरपी फाउंडेशन एक गैर-लाभकारी संगठन है जो समाज के कमजोर वर्गों को सशक्त बनाने, शिक्षा, स्वास्थ्य, और आपातकालीन नागरिक राहत प्रदान करने के लिए प्रतिबद्ध है।")
                  : (cmsConfig?.aboutTextEn || "RP Foundation is a non-profit organization dedicated to grassroot community upliftment, educational scholarships, emergency healthcare support, and smart governance solutions.")}
              </p>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 text-[10px] font-bold text-slate-650 flex flex-col gap-1">
                <span className="flex justify-between"><span>Toll Free Helpline:</span><span className="font-mono text-[#000080]">{settings?.tollFree || "1800-569-0991"}</span></span>
                <span className="flex justify-between"><span>Email Support:</span><span className="text-[#000080]">{settings?.email || "info@therpfoundation.org"}</span></span>
                <span className="flex justify-between"><span>Official Web:</span><span className="text-[#000080]">{settings?.webUrl || "therpfoundation.org"}</span></span>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
