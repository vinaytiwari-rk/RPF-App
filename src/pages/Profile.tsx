import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { 
  User, Shield, Award, MapPin, Languages, BookMarked, 
  Settings, HelpCircle, AlertTriangle, Info, LogOut, CheckCircle2, 
  ChevronRight, Heart, QrCode, Download, X, ShieldCheck, Target
} from "lucide-react";
import { translations } from "../translations";





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
  


  const roleLabel: Record<string, string> = {
    guest: "Guest User",
    citizen: "Citizen Member",
    volunteer: "Volunteer",
    donor: "Donor",
    admin: "Administrator",
    super_admin: "Super Admin",
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

        {user.isVolunteer && (
          <button
            onClick={() => navigate("/volunteer-dashboard")}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl p-4 flex items-center justify-between shadow-sm active:scale-[0.98] transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Target className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-black text-sm">{isHi ? "स्वयंसेवक डैशबोर्ड" : "Volunteer Dashboard"}</p>
                <p className="text-[10px] text-amber-100 font-bold mt-0.5">{isHi ? "कार्यों और गतिविधियों को प्रबंधित करें" : "Manage tasks & field activities"}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-200" />
          </button>
        )}

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
