import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { 
  User, Shield, Award, MapPin, Languages, BookMarked, 
  Settings, HelpCircle, AlertTriangle, Info, LogOut, CheckCircle2, 
  ChevronRight, Heart, QrCode, Download, X, ShieldCheck, Target, Edit2, Check, Save, FileText
} from "lucide-react";
import { translations } from "../translations";
import { motion } from "motion/react";
import axios from "axios";





export default function Profile() {
  const { user, logout, language, setLanguage } = useAuth();
  const { settings, cmsConfig } = useApp();
  const navigate = useNavigate();
  
  const t = translations[language];
  const isHi = language === "hi";

  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editAvatar, setEditAvatar] = useState(user?.avatar || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditAvatar(user.avatar || "");
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await axios.post("/api/auth/profile/update", { name: editName, avatar: editAvatar });
      alert("Profile updated successfully!");
      window.location.reload();
    } catch (err) {
      alert("Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-transparent min-h-full pb-24">
        <h2 className="font-display font-bold text-xl text-amber-900 mb-2">Not Logged In</h2>
        <p className="text-xs text-slate-500 mb-4">Please log in to view your profile.</p>
        <button 
          onClick={() => navigate("/")}
          className="bg-[#000080] text-[#000080] px-4 py-2 rounded-lg text-xs font-bold"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const initials = (user.name || "U").split(" ").filter(w => w.length > 0).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  


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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-transparent pb-24"
    >
      {/* Profile Hero section with Tricolour Gradient Header */}
      <div className="bg-gradient-to-br from-[#FF9933] via-white to-[#138808] pt-8 pb-8 px-5 relative overflow-hidden shrink-0 text-[#000080] shadow-lg border-b border-slate-100 rounded-b-[2.5rem]">
        {/* Animated Background Ornaments */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-tr from-[#FF9933]/20 to-transparent rounded-full blur-3xl transform translate-x-10 -translate-y-10"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#138808]/20 to-transparent rounded-full blur-3xl transform -translate-x-10 translate-y-10"
        />
        
        <div className="flex items-center gap-5 relative z-10">
          {/* Avatar Ring & Floating Level */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-[3px] border-[#D4AF37]/50 p-1 bg-white shadow-sm border border-slate-200 backdrop-blur-md flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FF9933] to-[#FF5722] flex items-center justify-center text-[#000080] font-extrabold text-3xl shadow-md">
                  {initials}
                </div>
              )}
            </div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute bottom-0 right-0 bg-white text-[#0B1E3F] p-1.5 rounded-full shadow-lg border border-slate-200"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex-1 space-y-2">
            {isEditing ? (
              <div className="space-y-2 w-full">
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white shadow-sm border border-slate-200 border border-slate-200 rounded px-2 py-1 text-sm text-[#000080] placeholder-slate-400 focus:outline-none focus:border-[#FF9933]"
                  placeholder="Full Name"
                />
                <input 
                  type="text" 
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full bg-white shadow-sm border border-slate-200 border border-slate-200 rounded px-2 py-1 text-xs text-[#000080] placeholder-slate-400 focus:outline-none focus:border-[#FF9933]"
                  placeholder="Avatar Image URL"
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} disabled={isSaving} className="bg-[#FF9933] text-[#000080] text-[10px] px-3 py-1 rounded font-bold flex items-center gap-1">
                    {isSaving ? "Saving..." : <><Save className="w-3 h-3" /> Save</>}
                  </button>
                  <button onClick={() => setIsEditing(false)} className="bg-white shadow-sm border border-slate-200 text-[#000080] text-[10px] px-3 py-1 rounded font-bold">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-display font-extrabold text-2xl tracking-tight leading-tight drop-shadow-sm">{user.name}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-white shadow-sm border border-slate-200 backdrop-blur-md border border-slate-100 py-1 px-3 rounded-full w-fit">
                    <span className="w-2 h-2 bg-[#138808] rounded-full animate-pulse shadow-[0_0_8px_rgba(19,136,8,0.8)]"></span>
                    <span className="text-[10px] font-black tracking-widest uppercase text-slate-700">{roleLabel[user.role] || user.role}</span>
                  </div>
                  {user.isVolunteer && user.volunteerData?.registration_number && (
                    <div className="flex items-center gap-1.5 bg-[#FF9933]/20 backdrop-blur-md border border-[#FF9933]/30 py-1 px-3 rounded-full w-fit">
                      <ShieldCheck className="w-3 h-3 text-orange-500" />
                      <span className="text-[10px] font-black tracking-widest uppercase text-orange-500">V-ID: {user.volunteerData.registration_number}</span>
                    </div>
                  )}
                </div>
                {user.phone && <p className="text-xs text-slate-600 font-bold tracking-wide font-mono opacity-80">+91 {user.phone}</p>}
              </>
            )}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-4 gap-2 bg-white/5 backdrop-blur-md border border-slate-100 rounded-xl p-3 mt-5 text-center shadow-inner">
          
          
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-[#D4AF37]">
              {user.janSevaCardStatus === "approved" ? "Active" : user.janSevaCardStatus === "pending" ? "Pending" : "None"}
            </span>
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">Jan Seva</span>
          </div>
          <div className="w-[1px] h-6 bg-white shadow-sm border border-slate-200 self-center"></div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-[#D4AF37]">{user.isVolunteer ? "Yes" : "No"}</span>
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">Volunteer</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative -mt-6 z-20">

        {/* Volunteer Identity Card */}
        {user.isVolunteer && user.volunteerData && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 px-4 py-3 flex items-center justify-between text-[#000080]">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-100" />
                <span className="font-black text-xs uppercase tracking-wider">Volunteer Details</span>
              </div>
              <span className="bg-white/20 text-[#000080] text-[9px] px-2 py-0.5 rounded-full font-bold border border-slate-200">
                {user.volunteerData.approval_status?.toUpperCase() || "PENDING"}
              </span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-600 uppercase">Blood Group</span>
                <span className="font-extrabold text-amber-900 flex items-center gap-1 text-sm"><Heart className="w-3 h-3 text-red-500" /> {user.volunteerData.blood_group || "N/A"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-600 uppercase">DOB</span>
                <span className="font-semibold text-slate-700">{user.volunteerData.dob ? new Date(user.volunteerData.dob).toLocaleDateString() : "N/A"}</span>
              </div>
              <div className="flex flex-col col-span-2">
                <span className="text-[9px] font-bold text-slate-600 uppercase">Address</span>
                <span className="font-semibold text-slate-700 flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-600" /> {user.volunteerData.city}, {user.volunteerData.state}</span>
              </div>
              <div className="flex flex-col col-span-2">
                <span className="text-[9px] font-bold text-slate-600 uppercase">Father/Husband Name</span>
                <span className="font-semibold text-slate-700 flex items-center gap-1"><User className="w-3 h-3 text-slate-600" /> {user.volunteerData.father_husband_name || "N/A"}</span>
              </div>
            </div>
          </motion.div>
        )}

        {user.isVolunteer && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/volunteer-dashboard")}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#000080] rounded-2xl p-4 flex items-center justify-between shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                <Target className="w-6 h-6 shadow-sm" />
              </div>
              <div className="text-left">
                <p className="font-black text-sm">{isHi ? "स्वयंसेवक डैशबोर्ड" : "Volunteer Dashboard"}</p>
                <p className="text-[10.5px] text-amber-100 font-bold mt-0.5">{isHi ? "कार्यों और गतिविधियों को प्रबंधित करें" : "Manage tasks & field activities"}</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-amber-200" />
          </motion.button>
        )}

        {/* System Administration Control Card (Role-Based Visibility) */}
        {(user.role === "admin" || user.role === "super_admin" || user.role === "volunteer") && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card bg-white text-[#000080] border-[#D4AF37]/35 overflow-hidden rounded-2xl border shadow-lg"
          >
            <div className="text-[9px] font-black text-slate-600 uppercase tracking-wider bg-slate-900/50 border-b border-white/5 px-4 py-2.5">
              System Administration
            </div>
            <div 
              onClick={() => navigate("/admin")}
              className="flex justify-between items-center px-4 py-4 cursor-pointer hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center text-orange-500">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-wider text-[#000080] drop-shadow-sm">Admin Command HQ</span>
                  <span className="text-[10px] text-slate-350 mt-0.5">Control settings, approve cards, and resolve grievances</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </div>
          </motion.div>
        )}

        {/* Action Menu List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="text-[9px] font-black text-slate-600 uppercase tracking-wider bg-transparent/80 border-b border-slate-100 px-4 py-2">
            Support & Info
          </div>
          
          <div 
            onClick={() => setShowFaqModal(true)}
            className="flex justify-between items-center px-4 py-3 border-b border-slate-100 cursor-pointer hover:bg-transparent/50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-transparent border border-slate-200 rounded-lg flex items-center justify-center text-slate-600">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-amber-900">Help & FAQs</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </div>



          <div 
            onClick={() => setShowAboutModal(true)}
            className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-transparent/50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-transparent border border-slate-200 rounded-lg flex items-center justify-center text-slate-600">
                <Info className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-amber-900">About RP Foundation</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </div>
        </motion.div>

        
        {/* Support Panel (Helpline, website, email) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3.5">
          <h4 className="font-display font-extrabold text-xs text-[#000080] uppercase tracking-wider">
            {isHi ? "सहायता एवं संपर्क" : "Help & Contact"}
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-bold">{isHi ? "टोल-फ्री हेल्पलाइन:" : "Toll-Free Helpline:"}</span>
              <span className="font-extrabold text-amber-900 font-mono">{settings?.tollFree || "1800-569-0991"}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-bold">{isHi ? "ईमेल समर्थन:" : "Email Support:"}</span>
              <span className="font-extrabold text-amber-900">{settings?.email || "info@therpfoundation.org"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">{isHi ? "आधिकारिक वेबसाइट:" : "Official Website:"}</span>
              <a href={settings?.webUrl ? (settings.webUrl.startsWith("http") ? settings.webUrl : "https://" + settings.webUrl) : "https://therpfoundation.org"} target="_blank" rel="noreferrer" className="font-extrabold text-blue-600 hover:underline">
                {settings?.webUrl || "therpfoundation.org"}
              </a>
            </div>
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
            <div className="bg-white px-4 py-3.5 flex items-center justify-between text-[#000080]">
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-black uppercase tracking-wider">{language === "hi" ? "अक्सर पूछे जाने वाले प्रश्न" : "Frequently Asked Questions"}</span>
              </div>
              <button onClick={() => setShowFaqModal(false)} className="w-7 h-7 bg-white shadow-sm border border-slate-200 hover:bg-white/20 rounded-full flex items-center justify-center transition">
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
                  <h5 className="font-extrabold text-amber-900">Q: {language === "hi" ? faq.questionHi : faq.questionEn}</h5>
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
            <div className="bg-white px-4 py-3.5 flex items-center justify-between text-[#000080]">
              <div className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-black uppercase tracking-wider">{language === "hi" ? "आरपी फाउंडेशन के बारे में" : "About RP Foundation"}</span>
              </div>
              <button onClick={() => setShowAboutModal(false)} className="w-7 h-7 bg-white shadow-sm border border-slate-200 hover:bg-white/20 rounded-full flex items-center justify-center transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 text-left text-xs space-y-3.5">
              <div className="flex justify-center gap-4 mb-1">
                <div className="flex flex-col items-center">
                  <img src={cmsConfig?.logoImgUrl || "/assets/logo.png"} alt="Logo" className="w-14 h-14 rounded-full border border-slate-200 object-cover shadow-sm bg-white p-0.5" />
                  <span className="text-[7px] font-black uppercase text-slate-600 mt-1">Logo</span>
                </div>
                <div className="flex flex-col items-center">
                  <img src={cmsConfig?.founderImgUrl || "/assets/founder.png"} alt="Founder" className="w-14 h-14 rounded-full border border-slate-200 object-cover shadow-sm" />
                  <span className="text-[7px] font-black uppercase text-slate-600 mt-1">Founder</span>
                </div>
              </div>
              <h4 className="font-extrabold text-amber-900 text-center leading-none">
                {cmsConfig?.founderName || "Rohit Pandit"}
              </h4>
              <p className="text-[9.5px] font-black text-orange-500 text-center uppercase tracking-widest leading-none mt-1">
                {cmsConfig?.founderDesignation || "Founder, RP Foundation"}
              </p>
              <p className="text-slate-500 font-semibold leading-relaxed text-center pt-2">
                {language === "hi"
                  ? (cmsConfig?.aboutTextHi || "आरपी फाउंडेशन एक गैर-लाभकारी संगठन है जो समाज के कमजोर वर्गों को सशक्त बनाने, शिक्षा, स्वास्थ्य, और आपातकालीन नागरिक राहत प्रदान करने के लिए प्रतिबद्ध है।")
                  : (cmsConfig?.aboutTextEn || "RP Foundation is a non-profit organization dedicated to grassroot community upliftment, educational scholarships, emergency healthcare support, and smart governance solutions.")}
              </p>
              <div className="bg-transparent p-2.5 rounded-xl border border-slate-150 text-[10px] font-bold text-slate-650 flex flex-col gap-1">
                <span className="flex justify-between"><span>Toll Free Helpline:</span><span className="font-mono text-amber-900">{settings?.tollFree || "1800-569-0991"}</span></span>
                <span className="flex justify-between"><span>Email Support:</span><span className="text-amber-900">{settings?.email || "info@therpfoundation.org"}</span></span>
                <span className="flex justify-between"><span>Official Web:</span><span className="text-amber-900">{settings?.webUrl || "therpfoundation.org"}</span></span>
              </div>
            </div>
          </div>
        </div>
      )}


    </motion.div>
  );
}
