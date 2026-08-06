import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { 
  User, Shield, Award, MapPin, Languages, BookMarked, 
  Settings, HelpCircle, AlertTriangle, Info, LogOut, CheckCircle2, 
  ChevronRight, Heart, QrCode, Download, X, ShieldCheck, Target, Edit2, Check, Save, FileText,
  Globe, Mail, Twitter, Youtube, Instagram, Facebook
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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await axios.post("/api/auth/profile/update", { name: editName, avatar: user?.avatar || "" });
      alert("Profile updated successfully!");
      window.location.reload();
    } catch (err) {
      alert("Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>, type: "dp" | "cover") => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const endpoint = type === "dp" ? "/api/profile/upload-dp" : "/api/profile/upload-cover";
      const token = localStorage.getItem("@rpf_token");
      const res = await axios.post(endpoint, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.data.success) {
        alert(`${type === "dp" ? "Profile picture" : "Cover picture"} uploaded successfully!`);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert(`Failed to upload ${type}`);
    }
  };

  const handleRemoveFile = async (type: "dp" | "cover") => {
    if (!window.confirm(`Are you sure you want to remove your ${type === "dp" ? "profile picture" : "cover picture"}?`)) return;
    try {
      const endpoint = type === "dp" ? "/api/profile/remove-dp" : "/api/profile/remove-cover";
      const token = localStorage.getItem("@rpf_token");
      const res = await axios.post(endpoint, {}, {
        headers: { 
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.data.success) {
        alert(`${type === "dp" ? "Profile picture" : "Cover picture"} removed successfully!`);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert(`Failed to remove ${type}`);
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
      className="flex flex-col min-h-screen bg-slate-50 pb-24"
    >
      {/* Profile Hero section with Custom Cover and Centered DP */}
      <div className="relative w-full h-[200px] bg-white border-b border-slate-200 flex-shrink-0" id="profile-cover-section">
        {/* Cover Image Background (Default solid white replaced with a premium Navy & Gold gradient) */}
        {user.cover ? (
          <img src={user.cover} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#0B1E3F] via-[#102A6A] to-[#1E3A8A] flex items-center justify-center relative overflow-hidden">
            {/* Subtle premium geometric lines overlay */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          </div>
        )}

        {/* Cover Controls (Top Right Overlay) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-30">
          <label className="w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white cursor-pointer transition shadow-md">
            <Edit2 className="w-3.5 h-3.5" />
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleUploadFile(e, "cover")} 
              className="hidden" 
            />
          </label>
          {user.cover && (
            <button 
              onClick={() => handleRemoveFile("cover")}
              className="w-7 h-7 bg-red-600/80 hover:bg-red-655 rounded-full flex items-center justify-center text-white transition shadow-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Centered Profile Avatar DP Block */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-40px] flex flex-col items-center z-20">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-4 border-white p-0 bg-white shadow-md flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                  <User className="w-12 h-12" />
                </div>
              )}
            </div>

            {/* DP Controls Overlay (Bottom Right of DP) */}
            <div className="absolute bottom-0 right-0 flex items-center gap-1">
              <label className="bg-white hover:bg-slate-50 text-slate-800 p-1.5 rounded-full shadow-lg border border-slate-200 cursor-pointer transition">
                <Edit2 className="w-3 h-3" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleUploadFile(e, "dp")} 
                  className="hidden" 
                />
              </label>
              {user.avatar && (
                <button 
                  onClick={() => handleRemoveFile("dp")}
                  className="bg-white hover:bg-red-50 text-red-600 p-1.5 rounded-full shadow-lg border border-slate-200 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Centered User Details Space */}
      <div className="pt-12 pb-4 text-center px-5 flex flex-col items-center bg-white border-b border-slate-100 rounded-b-[2.5rem] shadow-sm select-none">
        {isEditing ? (
          <div className="space-y-2 w-full max-w-xs mb-2">
            <input 
              type="text" 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#000080] placeholder-slate-400 focus:outline-none focus:border-[#FF9933]"
              placeholder="Full Name"
            />
            <div className="flex gap-2 justify-center">
              <button onClick={handleSaveProfile} disabled={isSaving} className="bg-[#000080] text-white text-[10px] px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1">
                {isSaving ? "Saving..." : <><Save className="w-3 h-3" /> Save</>}
              </button>
              <button onClick={() => setIsEditing(false)} className="bg-slate-100 text-slate-755 text-[10px] px-3.5 py-1.5 rounded-lg font-bold">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 justify-center">
              <h2 className="font-display font-extrabold text-xl text-[#0B1E3F] tracking-tight leading-tight">{user.name}</h2>
              <button 
                onClick={() => setIsEditing(true)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {user.username && (
              <p className="text-sm font-bold text-slate-500 text-center">@{user.username}</p>
            )}
            
            <div className="flex items-center gap-2 justify-center mt-1">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 py-0.5 px-2.5 rounded-full w-fit">
                <span className="w-1.5 h-1.5 bg-[#138808] rounded-full animate-pulse shadow-[0_0_8px_rgba(19,136,8,0.8)]"></span>
                <span className="text-[9px] font-black tracking-wider uppercase text-slate-600">{roleLabel[user.role] || user.role}</span>
              </div>
              {user.isVolunteer && user.volunteerData?.registration_number && (
                <div className="flex items-center gap-1.5 bg-[#FF9933]/10 border border-[#FF9933]/25 py-0.5 px-2.5 rounded-full w-fit">
                  <ShieldCheck className="w-3 h-3 text-[#FF9933]" />
                  <span className="text-[9px] font-black tracking-wider uppercase text-[#FF9933]">V-ID: {user.volunteerData.registration_number}</span>
                </div>
              )}
            </div>
            {user.phone && <p className="text-[10px] text-slate-500 font-bold tracking-wide font-mono mt-1">+91 {user.phone}</p>}
          </div>
        )}

        {/* Stats Strip */}
        <div className="grid grid-cols-4 gap-2 bg-slate-50 border border-slate-200/50 rounded-2xl p-2.5 mt-4 w-full text-center shadow-inner max-w-sm">
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs font-black text-slate-800">
              {user.janSevaCardStatus === "approved" ? "Active" : user.janSevaCardStatus === "pending" ? "Pending" : "None"}
            </span>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Jan Seva</span>
          </div>
          <div className="w-[1px] h-6 bg-slate-200 self-center mx-auto"></div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs font-black text-slate-800">{user.isVolunteer ? "Yes" : "No"}</span>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Volunteer</span>
          </div>
          <div className="w-[1px] h-6 bg-slate-200 self-center mx-auto"></div>
          <div onClick={() => user.isVolunteer ? navigate("/volunteer-dashboard") : alert(isHi ? "स्वयंसेवक के रूप में पंजीकरण करें" : "Register as volunteer to earn certificates!")} className="flex flex-col items-center justify-center col-span-2 cursor-pointer hover:bg-slate-100 rounded-lg p-1 transition"><div className="flex items-center gap-1 text-[#FF9933]"><Award className="w-4 h-4" /><span className="text-xs font-black">View</span></div><span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Certificates</span></div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 relative -mt-6 z-20">

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
                <span className="font-extrabold text-slate-800 flex items-center gap-1 text-sm"><Heart className="w-3 h-3 text-red-500" /> {user.volunteerData.blood_group || "N/A"}</span>
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



        {/* Action Menu List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="text-[9px] font-black text-slate-650 uppercase tracking-wider bg-slate-50/80 border-b border-slate-100 px-4 py-2.5">
            Support & Info
          </div>
          
          <div 
            onClick={() => setShowFaqModal(true)}
            className="flex justify-between items-center px-4 py-3.5 border-b border-slate-100 cursor-pointer hover:bg-slate-50/50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">Help & FAQs</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </div>

          <div 
            onClick={() => setShowAboutModal(true)}
            className="flex justify-between items-center px-4 py-3.5 cursor-pointer hover:bg-slate-50/50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600">
                <Info className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">About RP Foundation</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </div>
        </motion.div>

        {/* Help & Contact Panel with Social Media Links */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-4">
          <h4 className="font-display font-extrabold text-xs text-[#000080] uppercase tracking-wider">
            {isHi ? "सहायता एवं संपर्क" : "Help & Contact"}
          </h4>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-550 font-semibold">{isHi ? "टोल-फ्री हेल्पलाइन:" : "Toll-Free Helpline:"}</span>
              <a href={`tel:${settings?.tollFree || "1800-569-0991"}`} className="font-extrabold text-slate-800 hover:text-[#000080] transition font-mono">{settings?.tollFree || "1800-569-0991"}</a>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-550 font-semibold">{isHi ? "ईमेल समर्थन:" : "Email Support:"}</span>
              <a href={`mailto:${settings?.email || "info@therpfoundation.org"}`} className="font-extrabold text-slate-800 hover:text-[#000080] transition">{settings?.email || "info@therpfoundation.org"}</a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-550 font-semibold">{isHi ? "आधिकारिक वेबसाइट:" : "Official Website:"}</span>
              <a href={settings?.webUrl ? (settings.webUrl.startsWith("http") ? settings.webUrl : "https://" + settings.webUrl) : "https://therpfoundation.org"} target="_blank" rel="noreferrer" className="font-extrabold text-blue-650 hover:underline">
                {settings?.webUrl || "therpfoundation.org"}
              </a>
            </div>
          </div>

          {/* Social Icons Directory with Gradients */}
          <div className="pt-3.5 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Connect With Us</p>
            <div className="flex justify-around items-center">
              {[
                { icon: Globe, url: settings?.webUrl ? (settings.webUrl.startsWith("http") ? settings.webUrl : "https://" + settings.webUrl) : "https://therpfoundation.org", grad: "from-blue-500 to-indigo-650" },
                { icon: Mail, url: `mailto:${settings?.email || "info@therpfoundation.org"}`, grad: "from-amber-500 to-red-500" },
                { icon: Twitter, url: "https://twitter.com/therpfoundation", grad: "from-slate-700 to-slate-900" },
                { icon: Youtube, url: "https://youtube.com/@therpfoundation", grad: "from-red-600 to-rose-700" },
                { icon: Instagram, url: "https://instagram.com/therpfoundation", grad: "from-pink-500 via-purple-550 to-yellow-500" },
                { icon: Facebook, url: "https://facebook.com/therpfoundation", grad: "from-blue-650 to-blue-800" }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.a
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md bg-gradient-to-tr ${item.grad} transition-transform`}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </motion.a>
                );
              })}
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
              <h4 className="font-extrabold text-slate-800 text-center leading-none">
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
                <span className="flex justify-between"><span>Toll Free Helpline:</span><span className="font-mono text-slate-850">{settings?.tollFree || "1800-569-0991"}</span></span>
                <span className="flex justify-between"><span>Email Support:</span><span className="text-[#000080]">{settings?.email || "info@therpfoundation.org"}</span></span>
                <span className="flex justify-between"><span>Official Web:</span><span className="text-[#000080]">{settings?.webUrl || "therpfoundation.org"}</span></span>
              </div>
            </div>
          </div>
        </div>
      )}


    </motion.div>
  );
}



