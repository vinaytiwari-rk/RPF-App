import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { 
  ArrowLeft, CheckCircle, Clock, Award, QrCode, UploadCloud, 
  Shield, Check, ChevronRight, Facebook, Instagram, Twitter, 
  Send, Printer, Download, RefreshCw, AlertCircle 
} from "lucide-react";

// Slogan/Tagline on Logo
// सेवा • समर्पण • संकल्प

const STEPS = ["Personal Details", "Residential Address", "Identity Document", "Review Application"];

const BENEFITS_HI = [
  { label: "सामाजिक कल्याण", desc: "समाज के हर वर्ग को बेहतर जीवन की ओर ले जाना।" },
  { label: "स्वास्थ्य सेवाएँ", desc: "निःशुल्क स्वास्थ्य शिविर और दवा वितरण।" },
  { label: "शिक्षा", desc: "स्कूल, पुस्तकालय और शिक्षा सामग्री उपलब्ध कराना।" },
  { label: "महिला सशक्तिकरण", desc: "महिलाओं को शिक्षा, स्वास्थ्य और रोजगार से जोड़ना।" },
  { label: "कौशल विकास", desc: "युवाओं को कौशल प्रशिक्षण देकर रोजगार व विकास बढ़ाना।" },
  { label: "पर्यावरण संरक्षण", desc: "जल संरक्षण और वृक्षारोपण अभियान।" },
  { label: "सांस्कृतिक संरक्षण", desc: "कला, संस्कृति और राष्ट्रीय एकता को बढ़ावा देना।" },
  { label: "मानव अधिकार", desc: "अन्याय और भ्रष्टाचार के खिलाफ जागरूकता फैलाना।" }
];

const BENEFITS_EN = [
  { label: "Social Welfare", desc: "Uplifting every section of society towards a better life." },
  { label: "Health Services", desc: "Free diagnostic health camps and medicine distribution." },
  { label: "Education", desc: "Providing schools, library facilities, and study materials." },
  { label: "Women Empowerment", desc: "Connecting women with training, health, and jobs." },
  { label: "Skill Development", desc: "Empowering youth through vocational courses & jobs." },
  { label: "Eco Protection", desc: "Water resource conservation and mass tree plantations." },
  { label: "Culture & Unity", desc: "Promoting heritage, art, and national integration." },
  { label: "Human Rights", desc: "Raising public awareness against social injustices." }
];

export default function JanSevaCard() {
  const navigate = useNavigate();
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user, updateUser } = useAuth();
  const { settings, submitCardApplication } = useApp();
  
  const [view, setView] = useState<"home" | "apply">("home");
  const [step, setStep] = useState(0);
  const [subPage, setSubPage] = useState<"portal" | "tools">("portal");

  // --- SMART CALCULATORS STATE ---
  const [activeCalc, setActiveCalc] = useState<string | null>(null);
  const [matchAge, setMatchAge] = useState(35);
  const [matchIncome, setMatchIncome] = useState(25000);
  const [matchCategory, setMatchCategory] = useState("OBC");
  const [issueDate, setIssueDate] = useState("");
  const [cardCheckNo, setCardCheckNo] = useState("");
  const [dependentCount, setDependentCount] = useState(3);
  const [monthlyExpense, setMonthlyExpense] = useState(15000);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  
  const [form, setForm] = useState({ 
    name: user?.name ?? "", 
    gender: user?.gender ?? "Male",
    dob: user?.dob ?? "N/A", 
    address: user?.address ?? "", 
    city: "", 
    state: "", 
    pincode: "", 
    idType: "Aadhaar", 
    idNumber: "" 
  });

  const [submitting, setSubmitting] = useState(false);

  // Pincode auto-fill effect
  useEffect(() => {
    if (form.pincode.length === 6) {
      axios.get(`/api/locations/pincode?p=${form.pincode}`)
        .then(res => {
          if (res.data.success && res.data.data) {
            const data = res.data.data;
            setForm(prev => ({
              ...prev,
              city: data.city || prev.city,
              state: data.state || prev.state
            }));
          }
        })
        .catch(err => console.error("Pincode lookup failed", err));
    }
  }, [form.pincode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      const filename = e.target.files[0].name;
      setTimeout(() => {
        setUploading(false);
        setUploadedFile(filename);
      }, 1200);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    const fullAddress = `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`;
    
    submitCardApplication({
      userId: user?.id || "guest",
      name: form.name,
      gender: form.gender,
      dob: form.dob || "N/A",
      address: fullAddress,
      idType: form.idType,
      idNumber: form.idNumber,
      status: "pending"
    });

    if (user) {
      await updateUser({ 
        janSevaCardStatus: "pending",
        name: form.name,
        gender: form.gender,
        dob: form.dob || "N/A",
        address: fullAddress,
        janSevaCardNo: "0001 " + Math.floor(1000 + Math.random() * 9000) + " 0001 " + Math.floor(1000 + Math.random() * 9000)
      });
    }
    
    setSubmitting(false);
    setView("home");
  };

  const handleAdminApprove = async () => {
    await updateUser({ 
      janSevaCardStatus: "approved",
      // Set default Vinay Kumar details if not applied through form yet
      name: user?.name === "Guest" || !user?.name ? "Vinay Kumar" : user.name,
      gender: user?.gender || "Male",
      dob: user?.dob && user.dob !== "N/A" ? user.dob : "N/A",
      address: user?.address || "Raj Colony Karond, Bhopal, Madhya Pradesh",
      janSevaCardNo: user?.janSevaCardNo || "0001 0151 0001 9244"
    });
  };

  const handleResetCard = async () => {
    if (window.confirm(lang === "hi" ? "क्या आप अपना कार्ड रीसेट करके फिर से आवेदन करना चाहते हैं?" : "Are you sure you want to reset your card and re-apply?")) {
      await updateUser({ 
        janSevaCardStatus: "none",
        janSevaCardNo: undefined
      });
      setUploadedFile(null);
      setStep(0);
      setView("home");
    }
  };

  const handleSimulateDownload = () => {
    alert(lang === "hi" ? "जन सेवा कार्ड का डाउनलोड शुरू हो गया है (PDF/Image)!" : "Jan Seva Card download started (PDF/Image format)!");
  };

  const handleSimulatePrint = () => {
    alert(lang === "hi" ? "प्रिंट कमांड भेजी गई। कार्ड का लेआउट प्रिंटर के अनुकूल है।" : "Print command triggered. Card layout is print-optimized.");
  };

  // Card details to render
  const cardName = user?.name || "Vinay Kumar";
  const cardGender = user?.gender || "Male";
  const cardDob = user?.dob || "N/A";
  const cardAddress = user?.address || "Raj Colony Karond, Bhopal, Madhya Pradesh";
  const cardNumber = user?.janSevaCardNo || "0001 0151 0001 9244";

  const activeBenefits = lang === "hi" ? BENEFITS_HI : BENEFITS_EN;

  // View: Pending Review
  const renderPortalContent = () => {
    if (user?.janSevaCardStatus === "pending") {
    return (
      <div className="p-5 space-y-6 animate-fadeIn pb-24 max-w-md mx-auto">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl relative overflow-hidden text-center space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#FF9933]"></div>
          
          <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          
          <div className="space-y-1.5">
            <h3 className="font-display font-black text-amber-900 text-lg">
              {lang === "hi" ? "आवेदन समीक्षा के अधीन है" : "Application Under Review"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[270px] mx-auto">
              {lang === "hi" 
                ? "आपका डिजिटल जन सेवा कार्ड का आवेदन सफलतापूर्वक दर्ज हो गया है। हमारी टीम 2-3 कार्य दिवसों के भीतर विवरण की जांच करेगी।"
                : "Your Jan Seva Card application has been successfully submitted and is under verification. Status updates take 2-3 working days."}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3">
            <div className="flex justify-between items-center text-[10.5px] border-b border-slate-100 pb-2">
              <span className="text-slate-450 font-black uppercase tracking-wider">Application Details</span>
              <span className="text-[#000080] font-mono font-bold">JSC-{user.id.slice(-6).toUpperCase()}</span>
            </div>
            
            <div className="space-y-2 text-[11px] font-bold text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Name:</span>
                <span>{cardName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Gender/DOB:</span>
                <span>{cardGender} / {cardDob}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 font-medium">Registered Address:</span>
                <span className="text-slate-800 text-[10px] leading-tight mt-0.5">{cardAddress}</span>
              </div>
            </div>
          </div>

          {/* Simulated Stepper */}
          <div className="space-y-3.5 pt-2">
            {[
              { title: "Application Submitted", done: true },
              { title: "Document Verification", done: false },
              { title: "Approval & Issuance", done: false },
            ].map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] font-black shrink-0 ${
                  step.done ? "bg-[#138808] border-[#138808] text-white" : "border-slate-250 bg-white text-slate-450"
                }`}>
                  {step.done ? <Check className="w-3 h-3" /> : idx + 1}
                </div>
                <span className={`text-[11.5px] font-bold ${step.done ? "text-slate-850" : "text-slate-400"}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>

          {/* Cancel & Re-apply button */}
          <div className="border-t border-slate-150 pt-5">
            <button 
              onClick={handleResetCard}
              className="w-full bg-slate-100 hover:bg-slate-150 border border-slate-200 text-slate-600 py-2.5 rounded-2xl font-bold text-xs transition cursor-pointer"
            >
              {lang === "hi" ? "आवेदन रद्द करें व फिर से भरें" : "Cancel & Re-apply"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View: Approved Card Display (STACKED FRONT & BACK EXACTLY LIKE SCREENSHOT 1)
  if (user?.janSevaCardStatus === "approved") {
    return (
      <div className="p-4 space-y-6 animate-fadeIn pb-28 max-w-md mx-auto">
        
        {/* Intro */}
        <div className="text-center space-y-1">
          <h2 className="font-display font-extrabold text-lg text-[#0B1E3F] leading-tight">
            {lang === "hi" ? "आपका डिजिटल जनसेवा कार्ड" : "Your Digital Jan Seva Card"}
          </h2>
          <p className="text-[10.5px] text-slate-500 font-semibold leading-relaxed">
            {lang === "hi" 
              ? "यह कार्ड आपके सामाजिक योगदान, योजनाओं और शिविरों का पहचान पत्र है।"
              : "Official citizen identity token for RP Foundation welfare verticals."}
          </p>
        </div>

        {/* 1. FRONT SIDE OF THE CARD */}
        <div className="w-full bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200 relative flex flex-col justify-between" style={{ minHeight: '275px' }}>
          
          {/* Orange Header Accent */}
          <div className="bg-[#FF9933] px-4 py-3.5 flex items-center gap-3 relative">
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm shrink-0 border border-amber-300">
              <img src="/assets/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col text-white">
              <h3 className="font-sans font-black text-base tracking-wider leading-none">RP FOUNDATION</h3>
              <p className="text-[9px] font-medium tracking-wide mt-0.5 leading-none opacity-95">
                (Rohit Pandit Foundation) | Reg. No. 14675/05
              </p>
            </div>
          </div>

          {/* Main Details Body */}
          <div className="p-4 bg-white flex-1 relative flex flex-col justify-between">
            {/* Subtle Ashoka Chakra watermark in background */}
            <div className="absolute inset-0 flex justify-center items-center opacity-[0.035] pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-32 h-32 text-[#000080]" fill="currentColor">
                <path d="M50 0a50 50 0 1 0 0 100A50 50 0 0 0 50 0zm0 95a45 45 0 1 1 0-90 45 45 0 0 1 0 90z"/>
              </svg>
            </div>

            {/* Title & Card Number */}
            <div className="relative z-10 flex justify-between items-start mb-3.5 border-b border-slate-100 pb-1.5">
              <h4 className="font-sans font-black text-[16px] text-[#000080] leading-none tracking-wide">
                जनसेवा कार्ड
              </h4>
              <span className="font-mono font-black text-[15px] text-[#000080] tracking-wide leading-none">
                {cardNumber}
              </span>
            </div>

            {/* Info Grid */}
            <div className="relative z-10 space-y-2.5 text-[11.5px] text-slate-800 font-semibold mb-4 pl-0.5">
              <div className="flex items-baseline">
                <span className="text-slate-450 w-24 shrink-0 font-bold">नाम / Name :</span>
                <span className="text-slate-900 font-extrabold text-[12.5px]">{cardName}</span>
              </div>
              <div className="flex justify-between items-baseline gap-2">
                <div className="flex items-baseline flex-1">
                  <span className="text-slate-450 w-24 shrink-0 font-bold">लिंग / Gender :</span>
                  <span className="text-slate-900 font-extrabold">{cardGender}</span>
                </div>
                <div className="flex items-baseline flex-1">
                  <span className="text-slate-450 w-20 shrink-0 font-bold">जन्म तिथि / DOB :</span>
                  <span className="text-slate-900 font-extrabold">{cardDob}</span>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-slate-450 w-24 shrink-0 mt-0.5 font-bold">पता / Address :</span>
                <span className="text-slate-900 font-extrabold leading-normal flex-1 text-[11px]">{cardAddress}</span>
              </div>
            </div>

            {/* Toll-Free Section */}
            <div className="relative z-10 text-center border-t border-slate-100 pt-2.5 pb-1">
              <p className="font-sans font-black text-[14px] text-[#000080] tracking-wide leading-none">
                Toll Free Number : {settings.tollFree}
              </p>
              <p className="text-[8.5px] text-slate-500 font-bold tracking-wide mt-1.5 leading-none">
                Web - {settings.webUrl} | Email - {settings.email}
              </p>
            </div>

            {/* Social Links Row */}
            <div className="relative z-10 flex justify-center items-center gap-3.5 text-[7.5px] font-black text-slate-700 mt-2 border-t border-slate-100/50 pt-2 pb-0.5">
              <div className="flex items-center gap-0.5">
                <Facebook className="w-3 h-3 text-blue-600 fill-blue-600" />
                <span>rpfoundationofficial</span>
              </div>
              <div className="flex items-center gap-0.5">
                <Instagram className="w-3 h-3 text-pink-600" />
                <span>rpfoundationofficial</span>
              </div>
              <div className="flex items-center gap-0.5">
                <Twitter className="w-3 h-3 text-sky-500 fill-sky-500" />
                <span>rpfoundation15</span>
              </div>
              <div className="flex items-center gap-0.5">
                <Send className="w-3 h-3 text-blue-400 fill-blue-400" />
                <span>@rpfoundationofficial</span>
              </div>
            </div>
          </div>

          {/* Green Bottom Border */}
          <div className="bg-[#138808] h-2.5 w-full"></div>
        </div>

        {/* 2. BACK SIDE OF THE CARD */}
        <div className="w-full bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200 relative flex flex-col justify-between" style={{ minHeight: '275px' }}>
          
          {/* Orange Top Border */}
          <div className="bg-[#FF9933] h-2.5 w-full"></div>

          {/* Main Details Body */}
          <div className="p-4 bg-white flex-1 relative flex flex-col justify-between">
            {/* Subtle Ashoka Chakra watermark in background */}
            <div className="absolute inset-0 flex justify-center items-center opacity-[0.035] pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-32 h-32 text-[#000080]" fill="currentColor">
                <path d="M50 0a50 50 0 1 0 0 100A50 50 0 0 0 50 0zm0 95a45 45 0 1 1 0-90 45 45 0 0 1 0 90z"/>
              </svg>
            </div>

            {/* Card Benefits Heading */}
            <div className="relative z-10 text-center mb-3 flex justify-center items-center">
              <div className="w-6 h-0.5 bg-orange-400 opacity-60"></div>
              <h4 className="font-sans font-black text-[15px] text-[#000080] mx-3 leading-none uppercase tracking-wide">
                जनसेवा कार्ड के फायदे :
              </h4>
              <div className="w-6 h-0.5 bg-orange-400 opacity-60"></div>
            </div>

            {/* Benefits List (Styled with absolute corner brackets on sides) */}
            <div className="relative z-10 px-3.5 py-1 flex items-center justify-center my-1.5">
              {/* Left bracket */}
              <div className="absolute left-1 top-0 bottom-0 w-2.5 border-l-2 border-t-2 border-b-2 border-orange-400/80 rounded-l-xs"></div>
              
              <ul className="text-[10.5px] text-slate-800 font-extrabold space-y-1.5 w-full pl-1 leading-snug">
                {activeBenefits.map((b, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-[#000080] font-black mr-2 shrink-0">{idx + 1}.</span>
                    <span className="leading-tight">
                      <span className="text-[#000080] font-extrabold">{b.label}</span> – {b.desc}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Right bracket */}
              <div className="absolute right-1 top-0 bottom-0 w-2.5 border-r-2 border-t-2 border-b-2 border-orange-400/80 rounded-r-xs"></div>
            </div>

            {/* Disclaimer Footer Text */}
            <div className="relative z-10 text-center border-t border-slate-100 pt-3 pb-0.5">
              <p className="text-[10px] font-black text-slate-800 leading-tight">
                {lang === "hi" 
                  ? "नोट: यह सभी सुविधाएं जन सेवा कार्ड धारकों के लिए निःशुल्क होगा।" 
                  : "Note: All these facilities will be free of charge for Jan Seva Card holders."}
              </p>
            </div>
          </div>

          {/* Green Bottom Border */}
          <div className="bg-[#138808] h-2.5 w-full"></div>
        </div>

        {/* Card Actions Stack */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button 
            onClick={handleSimulateDownload}
            className="bg-[#000080] hover:bg-[#000066] text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{lang === "hi" ? "कार्ड डाउनलोड करें" : "Download Card"}</span>
          </button>
          
          <button 
            onClick={handleSimulatePrint}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === "hi" ? "कार्ड प्रिंट करें" : "Print Card"}</span>
          </button>
        </div>

        {/* Reset & Re-apply Admin Option */}
        <button 
          onClick={handleResetCard}
          className="w-full bg-red-50 hover:bg-red-100 border border-red-150 text-red-700 py-3 rounded-2xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{lang === "hi" ? "कार्ड डेटा रीसेट करें (री-अप्लाई)" : "Reset Card & Apply Again"}</span>
        </button>

      </div>
    );
  }

  // View: Application Wizard Step-by-Step
  if (view === "apply") {
    return (
      <div className="flex flex-col h-full bg-slate-50 animate-fadeIn max-w-md mx-auto">
        <div className="bg-white px-5 py-4.5 border-b border-slate-200 sticky top-0 z-20 shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-display font-extrabold text-[#000080] text-base uppercase tracking-wider">
              {lang === "hi" ? "जन सेवा कार्ड आवेदन" : "Apply for Digital Card"}
            </h2>
            <span className="text-[10px] font-black text-[#FF9933] bg-[#FF9933]/10 border border-[#FF9933]/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {lang === "hi" ? `चरण ${step + 1}/${STEPS.length}` : `Step ${step + 1}/${STEPS.length}`}
            </span>
          </div>
          
          {/* Saffron Slider indicator */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
            <div 
              className="h-full bg-gradient-to-r from-[#FF9933] to-[#FF6600] transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="flex-1 p-5 overflow-y-auto pb-24 space-y-5">
          <div className="space-y-1">
            <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block leading-none">Current Section</span>
            <h3 className="font-display font-black text-xl text-slate-805 leading-none">{STEPS[step]}</h3>
          </div>

          {step === 0 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-[10.5px] font-black text-slate-600 uppercase tracking-wider mb-2">Full Name / पूरा नाम</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border border-slate-200 bg-white rounded-xl p-3 text-xs font-bold text-slate-800 focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none transition"
                  placeholder="As printed on government ID card"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-black text-slate-600 uppercase tracking-wider mb-2">Gender / लिंग</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {["Male", "Female", "Other"].map(g => (
                    <div 
                      key={g}
                      onClick={() => setForm({...form, gender: g})}
                      className={`border p-2.5 rounded-xl flex items-center justify-center cursor-pointer transition font-bold text-xs ${
                        form.gender === g 
                          ? "border-[#000080] bg-[#000080]/5 text-[#000080] shadow-sm" 
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <span>{g}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-black text-slate-600 uppercase tracking-wider mb-2">Date of Birth / जन्म तिथि</label>
                <input 
                  type="text" 
                  value={form.dob} 
                  onChange={e => setForm({...form, dob: e.target.value})}
                  className="w-full border border-slate-200 bg-white rounded-xl p-3 text-xs font-bold text-slate-800 focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none transition"
                  placeholder="DD/MM/YYYY or N/A"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-[10.5px] font-black text-slate-600 uppercase tracking-wider mb-2">Residential Address / पता</label>
                <textarea 
                  value={form.address} 
                  onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full border border-slate-200 bg-white rounded-xl p-3 text-xs font-bold text-slate-800 min-h-[90px] focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none transition"
                  placeholder="Flat No, House Name, Street, Locality"
                />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10.5px] font-black text-slate-600 uppercase tracking-wider mb-2">City / शहर</label>
                  <input 
                    type="text" 
                    value={form.city} 
                    onChange={e => setForm({...form, city: e.target.value})}
                    className="w-full border border-slate-200 bg-white rounded-xl p-3 text-xs font-bold text-slate-800 focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none transition"
                    placeholder="Bhopal"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-black text-slate-600 uppercase tracking-wider mb-2">State / राज्य</label>
                  <input 
                    type="text" 
                    value={form.state} 
                    onChange={e => setForm({...form, state: e.target.value})}
                    className="w-full border border-slate-200 bg-white rounded-xl p-3 text-xs font-bold text-slate-800 focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none transition"
                    placeholder="Madhya Pradesh"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10.5px] font-black text-slate-600 uppercase tracking-wider mb-2">PIN Code / पिन कोड</label>
                <input 
                  type="text" 
                  maxLength={6}
                  value={form.pincode} 
                  onChange={e => setForm({...form, pincode: e.target.value.replace(/\D/g, '')})}
                  className="w-full border border-slate-200 bg-white rounded-xl p-3 text-xs font-bold text-slate-800 focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none transition"
                  placeholder="462001"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <label className="block text-[10.5px] font-black text-slate-600 uppercase tracking-wider mb-2.5">Select Document Type / पहचान दस्तावेज</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {["Aadhaar", "PAN Card", "Voter ID", "Driving License"].map(id => (
                    <div 
                      key={id}
                      onClick={() => setForm({...form, idType: id})}
                      className={`border p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition ${
                        form.idType === id 
                          ? "border-[#000080] bg-[#000080]/5 text-[#000080]" 
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-xs font-bold">{id}</span>
                      {form.idType === id && <Check className="w-4 h-4 text-[#000080]" />}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-black text-slate-600 uppercase tracking-wider mb-2">{form.idType} Number</label>
                <input 
                  type="text" 
                  value={form.idNumber} 
                  onChange={e => setForm({...form, idNumber: e.target.value})}
                  className="w-full border border-slate-200 bg-white rounded-xl p-3 text-xs font-bold text-slate-800 focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none transition uppercase"
                  placeholder={`Enter 12-digit ${form.idType} number`}
                />
              </div>

              <div className="relative">
                <input 
                  type="file" 
                  id="document-upload" 
                  className="hidden" 
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileUpload} 
                  disabled={uploading}
                />
                <label 
                  htmlFor="document-upload"
                  className="border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition border-[#000080]/20"
                >
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <RefreshCw className="w-8 h-8 text-[#FF9933] animate-spin mb-2" />
                      <span className="text-xs font-black text-slate-600">Uploading File...</span>
                    </div>
                  ) : uploadedFile ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wide">Document Attached</span>
                      <span className="text-[10px] text-slate-450 font-mono mt-1">{uploadedFile}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadCloud className="w-9 h-9 text-[#000080] mb-2.5" />
                      <span className="text-xs font-black text-slate-700">Upload Identity Proof ({form.idType})</span>
                      <span className="text-[9.5px] text-slate-400 mt-1 font-medium">JPEG, PNG or PDF (Max Size 2MB)</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                
                {/* Block 1 */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Personal Data</span>
                  <button onClick={() => setStep(0)} className="text-[10.5px] font-black text-[#FF9933] uppercase">Edit</button>
                </div>
                <div className="p-4 space-y-2.5 text-xs font-bold text-slate-750">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Name</span>
                    <span>{form.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Gender</span>
                    <span>{form.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Date of Birth</span>
                    <span>{form.dob}</span>
                  </div>
                </div>

                {/* Block 2 */}
                <div className="p-4 border-y border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Address Details</span>
                  <button onClick={() => setStep(1)} className="text-[10.5px] font-black text-[#FF9933] uppercase">Edit</button>
                </div>
                <div className="p-4 space-y-2 text-xs font-bold text-slate-750">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-450 font-medium">Permanent Address</span>
                    <span className="text-slate-800 leading-relaxed font-bold mt-1">
                      {form.address}, {form.city}, {form.state} - {form.pincode}
                    </span>
                  </div>
                </div>

                {/* Block 3 */}
                <div className="p-4 border-y border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Uploaded Document</span>
                  <button onClick={() => setStep(2)} className="text-[10.5px] font-black text-[#FF9933] uppercase">Edit</button>
                </div>
                <div className="p-4 space-y-2.5 text-xs font-bold text-slate-750">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Document ID Type</span>
                    <span>{form.idType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Document ID No.</span>
                    <span className="uppercase">{form.idNumber || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Attached File</span>
                    <span className="text-slate-500 font-mono text-[10px]">{uploadedFile || "None"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/60 border border-blue-150 rounded-2xl p-4 flex gap-3 text-blue-900 shadow-inner">
                <Shield className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider block">Applicant Declaration</span>
                  <p className="text-[10px] font-medium leading-relaxed opacity-90">
                    I hereby declare that all files and statements submitted above are accurate. I authorize RP Foundation to check details against official databases for membership issuance.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-20 flex gap-3 shadow-lg shrink-0">
          <button 
            onClick={() => step > 0 ? setStep(step - 1) : setView("home")}
            className="px-5 py-3.5 border border-slate-205 rounded-2xl text-slate-600 font-black text-xs uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer"
          >
            {step > 0 ? "Back" : "Cancel"}
          </button>
          
          <button 
            onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
            disabled={submitting}
            className="flex-1 bg-[#000080] hover:bg-[#000066] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md disabled:opacity-75 disabled:cursor-wait flex justify-center items-center gap-1.5 transition cursor-pointer"
          >
            {submitting ? (
              <span className="animate-pulse">Submitting Data...</span>
            ) : (
              <>
                <span>{step < 3 ? "Continue" : "Submit Details"}</span>
                {step < 3 && <ChevronRight className="w-4 h-4" />}
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // View: Card home / Apply portal page (No applied state)
  return (
    <div className="space-y-6 animate-fadeIn font-sans relative">
      
      {/* 3D Gold Accent card mockup */}
      <div className="bg-gradient-to-tr from-[#000080] via-[#102A6A] to-[#1E3A8A] rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden border border-white/5 animate-float">
        {/* Ashoka Chakra Background watermark */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl transform translate-x-12 -translate-y-12"></div>
        
        <div className="flex justify-between items-start mb-6">
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
            <QrCode className="w-9 h-9 text-white/90" />
          </div>
          <span className="bg-[#FF9933] text-white text-[7.5px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest border border-white/20">
            Jan Seva Identity
          </span>
        </div>

        <div className="space-y-1.5">
          <h2 className="font-display font-extrabold text-xl tracking-wide">
            {lang === "hi" ? "डिजिटल जनसेवा कार्ड" : "Digital Jan Seva Card"}
          </h2>
          <p className="text-[10.5px] text-slate-200/90 leading-relaxed max-w-[260px] font-medium">
            {lang === "hi" 
              ? "पंजीकरण करके प्राथमिकता प्राप्त करें, निःशुल्क स्वास्थ्य शिविरों में भाग लें, और अपने सामाजिक योगदान को डिजिटल ट्रैक करें।"
              : "Access direct community benefits, local emergency direct support, and digitized welfare priority index."}
          </p>
        </div>
      </div>

      {/* Why Apply benefits cards */}
      <div className="space-y-3.5">
        <h3 className="font-display font-extrabold text-xs text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2">
          {lang === "hi" ? "कार्ड प्राप्त करने के लाभ" : "Key Membership Perks"}
        </h3>
        
        <div className="grid grid-cols-2 gap-3.5">
          <div className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-xs text-center space-y-2">
            <div className="w-10 h-10 bg-green-50 border border-green-150 rounded-full flex items-center justify-center mx-auto text-green-700">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h4 className="font-black text-xs text-slate-800 leading-none">Instant Access</h4>
            <p className="text-[9.5px] text-slate-400 font-bold leading-tight">Priority pass at health camps</p>
          </div>
          
          <div className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-xs text-center space-y-2">
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-150 rounded-full flex items-center justify-center mx-auto text-indigo-700">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-black text-xs text-slate-800 leading-none">Social Rewards</h4>
            <p className="text-[9.5px] text-slate-400 font-bold leading-tight">Gain points and badges</p>
          </div>
        </div>
      </div>

      {/* Disclaimer / Info */}
      <div className="bg-blue-50/60 border border-blue-150 rounded-2xl p-4 flex gap-3 text-blue-900">
        <Shield className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="text-xs font-black uppercase tracking-wider block">Official Registration</span>
          <p className="text-[10px] font-medium leading-relaxed opacity-90">
            {lang === "hi" 
              ? "कार्ड पूरी तरह से निःशुल्क है और केवल सामाजिक सेवा में सहायता हेतु है। आवेदन के लिए आपके आधार विवरण और पता प्रमाणीकरण आवश्यक है।"
              : "Cards are issued free of charge to registered volunteers and beneficiaries. Standard KYC validation applies."}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3.5">
        <button 
          onClick={() => setView("apply")}
          className="w-full bg-[#FF9933] hover:bg-[#e68a2e] text-white font-black py-4.5 rounded-2xl shadow-lg hover:shadow-xl transition flex justify-center items-center gap-1.5 cursor-pointer uppercase tracking-wider text-xs"
        >
          <span>{lang === "hi" ? "जन सेवा कार्ड के लिए आवेदन करें" : "Apply for Membership Card"}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

  return (
    <div className="p-5 space-y-6 animate-fadeIn pb-24 max-w-md mx-auto relative min-h-screen bg-slate-50">
      {/* Top Switcher */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl shadow-inner border border-slate-200 shrink-0">
        <button 
          onClick={() => setSubPage("portal")}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-black transition cursor-pointer ${
            subPage === "portal" ? "bg-[#000080] text-white shadow" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {lang === "hi" ? "सेवा पोर्टल" : "Service Portal"}
        </button>
        <button 
          onClick={() => {
            setSubPage("tools");
            if (!activeCalc) setActiveCalc("schemes");
          }}
          className={`flex-1 text-center py-2 rounded-lg text-xs font-black transition cursor-pointer ${
            subPage === "tools" ? "bg-[#000080] text-white shadow" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {lang === "hi" ? "पात्रता टूल्स" : "Calculators"}
        </button>
      </div>

      {subPage === "tools" ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 animate-fadeIn">
          <h4 className="font-display font-black text-xs text-[#000080] uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>{lang === "hi" ? "जन सेवा पात्रता टूल्स" : "Scheme & Card Planners"}</span>
            <Award className="w-4.5 h-4.5 text-[#FF9933]" />
          </h4>

          {/* Tools Select Grid */}
          <div className="grid grid-cols-2 gap-2 text-center">
            {[
              { key: "schemes", title: lang === "hi" ? "21-कल्याणकारी योजनाएं" : "21-Schemes Matcher" },
              { key: "expiry", title: lang === "hi" ? "कार्ड वैधता प्रोग्रेस" : "Card Expiry Tracker" },
              { key: "luhn", title: lang === "hi" ? "कार्ड नंबर सत्यापन" : "Luhn ID Check" },
              { key: "poverty", title: lang === "hi" ? "BPL/APL श्रेणी जांच" : "BPL/APL Assessor" },
              { key: "dependency", title: lang === "hi" ? "आश्रित अनुपात इंडेक्स" : "Dependency Ratio" }
            ].map(tool => (
              <button
                key={tool.key}
                onClick={() => setActiveCalc(tool.key)}
                className={`p-2.5 rounded-xl text-[10.5px] font-bold border transition ${
                  activeCalc === tool.key ? "bg-[#000080] text-white border-[#000080]" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {tool.title}
              </button>
            ))}
          </div>

          {/* Calculators Content Container */}
          {activeCalc && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-2 space-y-4 animate-fadeIn text-xs">
              
              {/* 1. 21-Scheme Compatibility Matcher */}
              {activeCalc === "schemes" && (
                <div className="space-y-3">
                  <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "21-केंद्रीय और राज्य योजनाएं पात्रता जाँच" : "21-Government Welfare Schemes Matcher"}</h5>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `आयु: ${matchAge} वर्ष` : `Age: ${matchAge} yrs`}</label>
                      <input type="range" min="18" max="80" value={matchAge} onChange={e => setMatchAge(Number(e.target.value))} className="w-full accent-[#000080]" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `वार्षिक आय: ₹${matchIncome.toLocaleString()}` : `Annual Income: ₹${matchIncome.toLocaleString()}`}</label>
                      <input type="range" min="15000" max="250000" step="5000" value={matchIncome} onChange={e => setMatchIncome(Number(e.target.value))} className="w-full accent-[#000080]" />
                    </div>
                  </div>

                  {(() => {
                    // Standard Indian Schemes check
                    const eligibleList = [];
                    if (matchIncome <= 120000) eligibleList.push("Ayushman Bharat (Free Health Cover)");
                    if (matchIncome <= 180000 && matchAge >= 60) eligibleList.push("IGNOAPS Old-Age Pension");
                    if (matchIncome <= 250000) eligibleList.push("PM Kisan Samman Nidhi (Farmer Subsidy)");
                    if (matchIncome <= 100000) eligibleList.push("Ladli Behna Scheme (Women Cash Grant)");
                    
                    return (
                      <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-lg text-slate-800 font-bold space-y-1.5">
                        <p className="text-[10px] text-slate-400 font-black uppercase">{lang === "hi" ? "योग्य कल्याणकारी योजनाएं" : "Matched Welfare Schemes"}</p>
                        {eligibleList.length > 0 ? (
                          eligibleList.map((scheme, idx) => <p key={idx} className="text-green-700 font-extrabold">• {scheme}</p>)
                        ) : (
                          <p className="text-red-700">{lang === "hi" ? "कोई योजना मैच नहीं हुई (आय सीमा सीमा से अधिक है)" : "No matching schemes found (Income exceeds limits)"}</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 2. Card Validity Tracker */}
              {activeCalc === "expiry" && (
                <div className="space-y-3">
                  <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "जन सेवा कार्ड समाप्ति तिथि प्रोग्रेस" : "Card Expiration Milestones"}</h5>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? "जारी होने की तारीख" : "Card Issue Date"}</label>
                    <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="w-full border border-slate-200 rounded p-2 text-xs font-bold bg-white" />
                  </div>

                  {(() => {
                    if (!issueDate) return <p className="text-slate-400 text-center font-bold">{lang === "hi" ? "जारी करने की तारीख चुनें।" : "Select issue date above."}</p>;
                    const issue = new Date(issueDate);
                    const expiry = new Date(issue.getTime() + 5 * 365 * 24 * 60 * 60 * 1000); // 5 year expiration
                    const diffTime = expiry.getTime() - new Date().getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const expired = diffDays <= 0;
                    
                    return (
                      <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-lg text-slate-800 font-bold space-y-1">
                        <p className="flex justify-between"><span>{lang === "hi" ? "समाप्ति तिथि (5 वर्ष):" : "Expiry Date (5 yrs):"}</span><span>{expiry.toLocaleDateString()}</span></p>
                        <p className="flex justify-between border-t border-indigo-200/50 pt-1">
                          <span>{lang === "hi" ? "वैधता शेष:" : "Validity Remaining:"}</span>
                          <span className={expired ? "text-red-700" : "text-green-700"}>
                            {expired ? (lang === "hi" ? "समाप्त" : "Expired") : `${diffDays} ${lang === "hi" ? "दिन" : "days"}`}
                          </span>
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 3. Luhn ID Check */}
              {activeCalc === "luhn" && (
                <div className="space-y-3">
                  <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "जन सेवा कार्ड नंबर सत्यता जांच (Luhn Checksum)" : "Luhn Checksum Card Number Validator"}</h5>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? "१२-अंकीय कार्ड नंबर दर्ज करें" : "Enter 12-digit Card Number"}</label>
                    <input type="text" maxLength={12} value={cardCheckNo} onChange={e => setCardCheckNo(e.target.value.replace(/\D/g, ""))} placeholder="e.g. 509284102941" className="w-full border border-slate-200 rounded p-2 text-xs font-bold bg-white outline-none focus:border-indigo-500" />
                  </div>

                  {(() => {
                    if (cardCheckNo.length < 12) return <p className="text-slate-400 text-center font-bold">{lang === "hi" ? "१२ अंक दर्ज करें।" : "Provide exactly 12 digits."}</p>;
                    
                    // Luhn algorithm check
                    let sum = 0;
                    let shouldDouble = false;
                    for (let i = cardCheckNo.length - 1; i >= 0; i--) {
                      let digit = parseInt(cardCheckNo.charAt(i), 10);
                      if (shouldDouble) {
                        if ((digit *= 2) > 9) digit -= 9;
                      }
                      sum += digit;
                      shouldDouble = !shouldDouble;
                    }
                    const valid = sum % 10 === 0;

                    return (
                      <div className={`p-3 rounded-lg border font-bold text-center ${valid ? "bg-green-50 text-green-700 border-green-150" : "bg-red-50 text-red-700 border-red-150"}`}>
                        {valid ? (
                          <p>{lang === "hi" ? "✓ वैध चेकसम: कार्ड संरचना सही है।" : "✓ Valid Checksum: Card format matches requirements."}</p>
                        ) : (
                          <p>{lang === "hi" ? "✗ अमान्य चेकसम: कृपया नंबर दोबारा जांचें।" : "✗ Invalid Checksum: Incorrect card sequence."}</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 4. BPL/APL Classification Assessor */}
              {activeCalc === "poverty" && (
                <div className="space-y-3">
                  <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "BPL/APL गरीबी रेखा श्रेणी निर्धारक" : "Poverty Line Assessor"}</h5>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `पारिवारिक मासिक आय: ₹${matchIncome.toLocaleString()}` : `Household Monthly Income: ₹${matchIncome.toLocaleString()}`}</label>
                      <input type="range" min="5000" max="50000" step="1000" value={matchIncome} onChange={e => setMatchIncome(Number(e.target.value))} className="w-full accent-[#000080]" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `आश्रित सदस्य: ${dependentCount}` : `Dependent Members: ${dependentCount}`}</label>
                      <input type="range" min="1" max="10" value={dependentCount} onChange={e => setDependentCount(Number(e.target.value))} className="w-full accent-[#000080]" />
                    </div>
                  </div>

                  {(() => {
                    const bplCap = 15000 + (dependentCount * 2000); // dynamic BPL income standard adjustment
                    const isBPL = matchIncome <= bplCap;
                    return (
                      <div className={`p-3 rounded-lg border font-bold text-center ${isBPL ? "bg-green-50 text-green-700 border-green-150" : "bg-blue-50 text-blue-700 border-blue-150"}`}>
                        <p className="text-sm font-black">{isBPL ? (lang === "hi" ? "BPL (गरीबी रेखा से नीचे)" : "BPL (Below Poverty Line)") : (lang === "hi" ? "APL (गरीबी रेखा से ऊपर)" : "APL (Above Poverty Line)")}</p>
                        <p className="text-[9px] text-slate-500 mt-1 font-semibold">{lang === "hi" ? `(इस आकार के परिवार के लिए BPL सीमा: ₹${bplCap.toLocaleString()}/माह)` : `(BPL threshold for this family size: ₹${bplCap.toLocaleString()}/mo)`}</p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 5. Dependency Ratio */}
              {activeCalc === "dependency" && (
                <div className="space-y-3">
                  <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "आश्रित अनुपात वित्तीय सूचकांक" : "Family Financial Dependency Ratio"}</h5>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `कुल आश्रित सदस्य: ${dependentCount}` : `Total Dependents: ${dependentCount}`}</label>
                      <input type="range" min="1" max="8" value={dependentCount} onChange={e => setDependentCount(Number(e.target.value))} className="w-full accent-[#000080]" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `मासिक खर्च: ₹${monthlyExpense.toLocaleString()}` : `Monthly Expense: ₹${monthlyExpense.toLocaleString()}`}</label>
                      <input type="range" min="5000" max="50000" step="2500" value={monthlyExpense} onChange={e => setMonthlyExpense(Number(e.target.value))} className="w-full accent-[#000080]" />
                    </div>
                  </div>

                  {(() => {
                    const shareCost = Math.round(monthlyExpense / (dependentCount + 1));
                    return (
                      <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-lg text-slate-800 font-bold text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === "hi" ? "प्रति व्यक्ति जीवन निर्वाह खर्च" : "Per Capita Share of Cost"}</p>
                        <p className="text-lg text-[#000080] font-black mt-1">₹{shareCost.toLocaleString()}</p>
                      </div>
                    );
                  })()}
                </div>
              )}

            </div>
          )}
        </div>
      ) : (
        renderPortalContent()
      )}
    </div>
  );
}
