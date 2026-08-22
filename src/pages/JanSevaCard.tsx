import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { 
  ArrowLeft, CheckCircle, Clock, Award, QrCode, UploadCloud, 
  Shield, Check, ChevronRight, Facebook, Instagram, Twitter, 
  Send, Printer, Download, RefreshCw, AlertCircle, RotateCw
} from "lucide-react";
import { getEligibleSchemes, getCardExpiryTracker, validateLuhn, getPovertyLineStatus, getDependencyRatio } from "../utils/janSevaCalculators";

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
  
  // ✨ NEW: Flip card state
  const [flipped, setFlipped] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post("/api/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        if (res.data.success && res.data.url) {
          setUploadedFile(res.data.url);
        } else {
          setUploadedFile(file.name);
        }
      } catch (error) {
        console.error("Upload failed", error);
        setUploadedFile(file.name);
      } finally {
        setUploading(false);
      }
    }
  };

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (form.idNumber.length !== 12) {
      setErrorMsg(lang === "hi" ? "कृपया 12 अंकों का आधार नंबर दर्ज करें।" : "Please enter a valid 12-digit Aadhaar number.");
      return;
    }
    
    setSubmitting(true);
    setErrorMsg(null);
    const fullAddress = `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`;
    
    try {
      const res = await axios.post("/api/cards", {
        userId: user?.id || "guest",
        name: form.name,
        gender: form.gender,
        dob: form.dob || "N/A",
        address: fullAddress,
        idType: "aadhaar",
        idNumber: form.idNumber
      });

      if (res.data.success) {
        if (user) {
          await updateUser({ 
            janSevaCardStatus: "approved",
            janSevaCardNo: res.data.cardNo,
            name: form.name,
            gender: form.gender,
            dob: form.dob || "N/A",
            address: fullAddress
          });
        }
        setView("home");
      }
    } catch (err: any) {
      console.error("Card submission failed:", err);
      setErrorMsg(err.response?.data?.error || "An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminApprove = async () => {
    const year = new Date().getFullYear();
    const sequence = Math.floor(100000 + Math.random() * 900000);
    const newCardNo = `JSC-${year}-${sequence}`;

    await updateUser({ 
      janSevaCardStatus: "approved",
      janSevaCardNo: user?.janSevaCardNo || newCardNo
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

  // ✨ FIXED: PDF Download with front + back
  const handleSimulateDownload = async () => {
    setPdfLoading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;
      
      const frontEl = document.getElementById("jan-seva-card-front");
      const backEl = document.getElementById("jan-seva-card-back");
      if (!frontEl) {
        alert(lang === "hi" ? "कार्ड एलिमेंट नहीं मिला।" : "Card element not found.");
        return;
      }

      const opts = { scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#ffffff", logging: false };
      const frontCanvas = await html2canvas(frontEl, opts);
      const frontImg = frontCanvas.toDataURL("image/jpeg", 0.95);

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85.6, 54] // Standard ID card size
      });

      pdf.addImage(frontImg, "JPEG", 0, 0, 85.6, 54);

      if (backEl) {
        const backCanvas = await html2canvas(backEl, opts);
        const backImg = backCanvas.toDataURL("image/jpeg", 0.95);
        pdf.addPage([85.6, 54], "landscape");
        pdf.addImage(backImg, "JPEG", 0, 0, 85.6, 54);
      }

      pdf.save(`JanSevaCard_${cardName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert(lang === "hi" ? "PDF बनाने में समस्या हुई। फिर कोशिश करें।" : "Failed to generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  // ✨ FIXED: Real print
  const handleSimulatePrint = () => {
    window.print();
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

  // ✨ FIXED: Approved Card with Flip UI
  if (user?.janSevaCardStatus === "approved") {
    return (
      <div className="p-4 space-y-4 animate-fadeIn pb-28 max-w-md mx-auto">
        
        {/* Intro */}
        <div className="text-center space-y-1 no-print">
          <h2 className="font-display font-extrabold text-lg text-[#000080] leading-tight">
            {lang === "hi" ? "आपका डिजिटल जनसेवा कार्ड" : "Your Digital Jan Seva Card"}
          </h2>
          <p className="text-[10.5px] text-slate-500 font-semibold flex items-center justify-center gap-1.5">
            <RotateCw className="w-3 h-3" />
            {lang === "hi" ? "कार्ड पर टैप करें — आगे/पीछे पलटेगा" : "Tap card to flip front/back"}
          </p>
        </div>

        {/* ✨ PRINT AREA: Both sides stacked for print (hidden on screen, visible on print) */}
        <div id="jan-seva-print-area" className="hidden print:block print-area-container">
          {/* Print Front */}
          <div id="print-front" className="print-card w-full max-w-[340px] mx-auto mb-4 bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200 flex flex-col">
            <div className="bg-[#FF9933] px-3 py-2.5 flex items-center gap-2.5 shrink-0">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm shrink-0 border border-white/40">
                <img src="/assets/logo.png" alt="Logo" className="w-full h-full object-contain" crossOrigin="anonymous" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
              </div>
              <div className="flex flex-col text-white min-w-0">
                <h3 className="font-sans font-black text-[13px] tracking-wider leading-none">RP FOUNDATION</h3>
                <p className="text-[8.5px] font-medium mt-0.5 leading-none opacity-95 truncate">(Rohit Pandit Foundation) | Reg. No. 14675/05</p>
              </div>
            </div>
            <div className="p-3 flex-1 relative flex flex-col justify-between bg-white">
              <div className="absolute inset-0 flex justify-center items-center opacity-[0.035] pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-28 h-28 text-[#000080]" fill="currentColor">
                  <path d="M50 0a50 50 0 1 0 0 100A50 50 0 0 0 50 0zm0 95a45 45 0 1 1 0-90 45 45 0 0 1 0 90z"/>
                </svg>
              </div>
              <div className="relative z-10 flex items-center justify-between gap-2 mb-2">
                <h4 className="font-sans font-black text-[18px] text-[#000080] leading-none">जनसेवा कार्ड</h4>
                <span className="font-mono font-black text-[13px] text-[#000080] tracking-wide">{cardNumber}</span>
              </div>
              <div className="relative z-10 space-y-1.5 text-[11px] text-[#000080]">
                <div className="flex"><span className="w-[90px] shrink-0 font-medium">नाम / Name :</span><span className="font-medium truncate">{cardName}</span></div>
                <div className="flex flex-wrap">
                  <span className="w-[90px] shrink-0 font-medium">लिंग :</span><span className="font-medium">{cardGender}</span>
                  <span className="mx-2 text-slate-300">|</span>
                  <span className="font-medium">DOB :</span><span className="font-medium ml-1">{cardDob}</span>
                </div>
                <div className="flex items-start"><span className="w-[90px] shrink-0 mt-0.5 font-medium">पता :</span><span className="font-medium leading-snug line-clamp-2">{cardAddress}</span></div>
              </div>
              <div className="relative z-10 text-center pt-2 border-t border-slate-100 mt-2">
                <p className="font-sans font-black text-[14px] text-[#000080] tracking-wider leading-none">Toll Free : 1800-569-0991</p>
                <p className="text-[9px] text-slate-600 font-medium mt-1">www.therpfoundation.org | info@therpfoundation.org</p>
              </div>
            </div>
            <div className="bg-[#138808] h-2 w-full shrink-0"></div>
          </div>

          {/* Print Back */}
          <div id="print-back" className="print-card w-full max-w-[340px] mx-auto bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200 flex flex-col">
            <div className="bg-[#FF9933] h-2 w-full shrink-0"></div>
            <div className="p-3 flex-1 relative flex flex-col bg-white overflow-hidden">
              <div className="absolute inset-0 flex justify-center items-center opacity-[0.035] pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-28 h-28 text-[#000080]" fill="currentColor">
                  <path d="M50 0a50 50 0 1 0 0 100A50 50 0 0 0 50 0zm0 95a45 45 0 1 1 0-90 45 45 0 0 1 0 90z"/>
                </svg>
              </div>
              <div className="relative z-10 text-center mb-2">
                <h4 className="font-sans font-black text-[15px] text-[#000080] leading-none">जनसेवा कार्ड के फायदे :</h4>
              </div>
              <div className="relative z-10 px-3 py-1 flex items-center justify-center my-1">
                <div className="absolute left-0 top-0 bottom-0 w-2 border-l-2 border-t-2 border-b-2 border-orange-400/80 rounded-l-xs"></div>
                <ul className="text-[10.5px] text-slate-700 font-medium space-y-1.5 w-full px-2 leading-snug">
                  {activeBenefits.map((b, idx) => (
                    <li key={idx}><span className="text-[#000080] font-black">{b.label}</span> – {b.desc}</li>
                  ))}
                </ul>
                <div className="absolute right-0 top-0 bottom-0 w-2 border-r-2 border-t-2 border-b-2 border-orange-400/80 rounded-r-xs"></div>
              </div>
              <p className="relative z-10 text-center text-[10px] font-semibold text-slate-600 border-t border-slate-100 pt-2 mt-auto">
                {lang === "hi" ? "नोट: यह सभी सुविधाएं जन सेवा कार्ड धारकों के लिए निःशुल्क है।" : "Note: All facilities are free for Jan Seva Card holders."}
              </p>
            </div>
            <div className="bg-[#138808] h-2 w-full shrink-0"></div>
          </div>
        </div>

        {/* ✨ FLIP CARD (Screen only, hidden on print) */}
        <div
          className="perspective-1000 w-full max-w-[340px] mx-auto cursor-pointer screen-card"
          onClick={() => setFlipped(f => !f)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFlipped(f => !f); }}
        >
          <div className={`relative w-full aspect-[1.586] transition-transform duration-500 transform-style-3d ${flipped ? "rotate-y-180" : ""}`}>
            
            {/* FRONT */}
            <div id="jan-seva-card-front" className="absolute inset-0 backface-hidden w-full h-full bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200 flex flex-col">
              <div className="bg-[#FF9933] px-3 py-2.5 flex items-center gap-2.5 shrink-0">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm shrink-0 border border-white/40">
                  <img src="/assets/logo.png" alt="Logo" className="w-full h-full object-contain" crossOrigin="anonymous" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-[#000080] font-black text-xs">RPF</span>'; }} />
                </div>
                <div className="flex flex-col text-white min-w-0">
                  <h3 className="font-sans font-black text-[13px] tracking-wider leading-none truncate">RP FOUNDATION</h3>
                  <p className="text-[8.5px] font-medium mt-0.5 leading-none opacity-95 truncate">(Rohit Pandit Foundation) | Reg. No. 14675/05</p>
                </div>
              </div>

              <div className="p-3 flex-1 relative flex flex-col justify-between bg-white">
                <div className="absolute inset-0 flex justify-center items-center opacity-[0.035] pointer-events-none">
                  <svg viewBox="0 0 100 100" className="w-28 h-28 text-[#000080]" fill="currentColor">
                    <path d="M50 0a50 50 0 1 0 0 100A50 50 0 0 0 50 0zm0 95a45 45 0 1 1 0-90 45 45 0 0 1 0 90z"/>
                  </svg>
                </div>

                <div className="relative z-10 flex items-center justify-between gap-2 mb-2">
                  <h4 className="font-sans font-black text-[18px] text-[#000080] leading-none">जनसेवा कार्ड</h4>
                  <span className="font-mono font-black text-[12px] text-[#000080] tracking-wide">{cardNumber}</span>
                </div>

                <div className="relative z-10 space-y-1.5 text-[11px] text-[#000080]">
                  <div className="flex"><span className="w-[80px] shrink-0 font-medium">नाम :</span><span className="font-semibold truncate">{cardName}</span></div>
                  <div className="flex flex-wrap">
                    <span className="w-[80px] shrink-0 font-medium">लिंग :</span><span className="font-semibold">{cardGender}</span>
                    <span className="mx-2 text-slate-300">|</span>
                    <span className="font-medium">DOB :</span><span className="font-semibold ml-1">{cardDob}</span>
                  </div>
                  <div className="flex items-start"><span className="w-[80px] shrink-0 mt-0.5 font-medium">पता :</span><span className="font-semibold leading-snug line-clamp-2 flex-1">{cardAddress}</span></div>
                </div>

                <div className="relative z-10 text-center pt-2 border-t border-slate-100">
                  <p className="font-sans font-black text-[13px] text-[#000080] tracking-wider leading-none">Toll Free : 1800-569-0991</p>
                  <p className="text-[8.5px] text-slate-600 font-medium mt-1">www.therpfoundation.org</p>
                </div>
              </div>
              <div className="bg-[#138808] h-2 w-full shrink-0"></div>
            </div>

            {/* BACK */}
            <div id="jan-seva-card-back" className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200 flex flex-col">
              <div className="bg-[#FF9933] h-2 w-full shrink-0"></div>
              <div className="p-3 flex-1 relative flex flex-col bg-white overflow-hidden">
                <div className="absolute inset-0 flex justify-center items-center opacity-[0.035] pointer-events-none">
                  <svg viewBox="0 0 100 100" className="w-28 h-28 text-[#000080]" fill="currentColor">
                    <path d="M50 0a50 50 0 1 0 0 100A50 50 0 0 0 50 0zm0 95a45 45 0 1 1 0-90 45 45 0 0 1 0 90z"/>
                  </svg>
                </div>

                <div className="relative z-10 text-center mb-2">
                  <h4 className="font-sans font-black text-[15px] text-[#000080] leading-none">जनसेवा कार्ड के फायदे :</h4>
                </div>

                <div className="relative z-10 px-3 py-1 flex items-center justify-center my-1 flex-1">
                  <div className="absolute left-0 top-0 bottom-0 w-2 border-l-2 border-t-2 border-b-2 border-orange-400/80 rounded-l-xs"></div>
                  <ul className="text-[10.5px] text-slate-700 font-medium space-y-1.5 w-full px-2 leading-snug overflow-y-auto">
                    {activeBenefits.map((b, idx) => (
                      <li key={idx}><span className="text-[#000080] font-black">{b.label}</span> – {b.desc}</li>
                    ))}
                  </ul>
                  <div className="absolute right-0 top-0 bottom-0 w-2 border-r-2 border-t-2 border-b-2 border-orange-400/80 rounded-r-xs"></div>
                </div>

                <p className="relative z-10 text-center text-[10px] font-semibold text-slate-600 border-t border-slate-100 pt-2 mt-1">
                  {lang === "hi" ? "नोट: यह सभी सुविधाएं जन सेवा कार्ड धारकों के लिए निःशुल्क है।" : "Note: All facilities are free for Jan Seva Card holders."}
                </p>
              </div>
              <div className="bg-[#138808] h-2 w-full shrink-0"></div>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-400 font-medium no-print">
          {flipped ? (lang === "hi" ? "पीछे की तरफ • फिर टैप करें" : "Back side • tap again") : (lang === "hi" ? "सामने की तरफ • टैप करके पलटें" : "Front side • tap to flip")}
        </p>

        {/* Card Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2 no-print">
          <button 
            onClick={handleSimulateDownload}
            disabled={pdfLoading}
            className="bg-[#000080] hover:bg-[#000066] text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-70"
          >
            <Download className="w-4 h-4" />
            <span>{pdfLoading ? "..." : (lang === "hi" ? "PDF डाउनलोड" : "Download PDF")}</span>
          </button>
          
          <button 
            onClick={handleSimulatePrint}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === "hi" ? "प्रिंट करें" : "Print Card"}</span>
          </button>
        </div>

        {/* Reset Button */}
        <button 
          onClick={handleResetCard}
          className="w-full bg-red-50 hover:bg-red-100 border border-red-150 text-red-700 py-3 rounded-2xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 no-print"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{lang === "hi" ? "कार्ड डेटा रीसेट करें (री-अप्लाई)" : "Reset Card & Apply Again"}</span>
        </button>

      </div>
    );
  }

  // View: Application Form (Single Step)
  if (view === "apply") {
    return (
      <div className="flex flex-col h-full bg-[#FAF9F6] font-sans animate-fadeIn max-w-md mx-auto">
        <div className="bg-white px-5 py-4.5 border-b border-slate-200 sticky top-0 z-20 shadow-xs flex justify-between items-center">
          <h2 className="font-display font-extrabold text-[#000080] text-base uppercase tracking-wider">
            {lang === "hi" ? "जन सेवा कार्ड आवेदन" : "Apply for Digital Card"}
          </h2>
          <span className="text-[10px] font-black text-[#FF9933] bg-[#FF9933]/10 border border-[#FF9933]/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {lang === "hi" ? "तत्काल अनुमोदन" : "Instant Approval"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-5 overflow-y-auto pb-24 space-y-5">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-black text-sm text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2 mb-3">
              {lang === "hi" ? "व्यक्तिगत विवरण" : "Personal Details"}
            </h3>

            <div>
              <label className="block text-[10.5px] font-black text-slate-600 uppercase tracking-wider mb-2">Full Name / पूरा नाम *</label>
              <input 
                type="text" 
                required
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-xs font-bold text-slate-800 focus:bg-white focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none transition"
                placeholder="As printed on government ID card"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-black text-slate-600 uppercase tracking-wider mb-2">Gender / लिंग *</label>
              <div className="grid grid-cols-3 gap-2.5">
                {["Male", "Female", "Other"].map(g => (
                  <div 
                    key={g}
                    onClick={() => setForm({...form, gender: g})}
                    className={`border p-2.5 rounded-xl flex items-center justify-center cursor-pointer transition font-bold text-xs ${
                      form.gender === g 
                        ? "border-[#000080] bg-[#000080]/5 text-[#000080] shadow-sm" 
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    <span>{g}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10.5px] font-black text-slate-600 uppercase tracking-wider mb-2">Date of Birth / जन्म तिथि *</label>
              <input 
                type="text" 
                required
                value={form.dob} 
                onChange={e => setForm({...form, dob: e.target.value})}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-xs font-bold text-slate-800 focus:bg-white focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none transition"
                placeholder="DD/MM/YYYY"
              />
            </div>
          </div>

          <div className="space-y-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-black text-sm text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2 mb-3">
              {lang === "hi" ? "आवासीय पता" : "Residential Address"}
            </h3>

            <div>
              <label className="block text-[10.5px] font-black text-slate-600 uppercase tracking-wider mb-2">Address / पता *</label>
              <textarea 
                required
                value={form.address} 
                onChange={e => setForm({...form, address: e.target.value})}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-xs font-bold text-slate-800 min-h-[70px] focus:bg-white focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none transition"
                placeholder="Flat No, House Name, Street, Locality"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10.5px] font-black text-slate-600 uppercase tracking-wider mb-2">City / शहर *</label>
                <input 
                  type="text" 
                  required
                  value={form.city} 
                  onChange={e => setForm({...form, city: e.target.value})}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-xs font-bold text-slate-800 focus:bg-white focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none transition"
                  placeholder="Bhopal"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-black text-slate-600 uppercase tracking-wider mb-2">State / राज्य *</label>
                <input 
                  type="text" 
                  required
                  value={form.state} 
                  onChange={e => setForm({...form, state: e.target.value})}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-xs font-bold text-slate-800 focus:bg-white focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none transition"
                  placeholder="Madhya Pradesh"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[10.5px] font-black text-slate-600 uppercase tracking-wider mb-2">PIN Code / पिन कोड *</label>
              <input 
                type="text" 
                required
                maxLength={6}
                value={form.pincode} 
                onChange={e => setForm({...form, pincode: e.target.value.replace(/\D/g, '')})}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-xs font-bold text-slate-800 focus:bg-white focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none transition"
                placeholder="462001"
              />
            </div>
          </div>

          <div className="space-y-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-black text-sm text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2 mb-3">
              {lang === "hi" ? "पहचान दस्तावेज़" : "Identity Verification"}
            </h3>

            <div>
              <label className="block text-[10.5px] font-black text-slate-600 uppercase tracking-wider mb-2">Aadhaar Number / आधार नंबर *</label>
              <input 
                type="text" 
                required
                maxLength={12}
                value={form.idNumber} 
                onChange={e => setForm({...form, idNumber: e.target.value.replace(/\D/g, '')})}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-xs font-bold text-slate-800 focus:bg-white focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none transition tracking-[0.2em]"
                placeholder="1234 5678 9012"
              />
              <p className="text-[9px] text-slate-500 mt-2">
                {lang === "hi" 
                  ? "आधार नंबर का उपयोग केवल विशिष्ट पहचान और कार्ड निर्माण के लिए किया जाता है। आपको कोई दस्तावेज़ अपलोड करने की आवश्यकता नहीं है।" 
                  : "Aadhaar number is used strictly for unique identification and instant generation. No document upload is required."}
              </p>
            </div>
          </div>

          <div className="bg-blue-50/60 border border-blue-150 rounded-2xl p-4 flex gap-3 text-blue-900 shadow-inner">
            <Shield className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider block">Applicant Declaration</span>
              <p className="text-[10px] font-medium leading-relaxed opacity-90">
                I hereby declare that all details submitted above are accurate. I authorize RP Foundation to generate my Jan Seva Identity based on this information.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button 
              type="button"
              onClick={() => setView("home")}
              className="px-5 py-3.5 border border-slate-205 rounded-2xl text-slate-600 font-black text-xs uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer"
            >
              {lang === "hi" ? "रद्द करें" : "Cancel"}
            </button>
            
            <button 
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#000080] hover:bg-[#000066] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md disabled:opacity-75 disabled:cursor-wait flex justify-center items-center gap-1.5 transition cursor-pointer"
            >
              {submitting ? (
                <span className="animate-pulse">{lang === "hi" ? "सबमिट हो रहा है..." : "Submitting..."}</span>
              ) : (
                <>
                  <span>{lang === "hi" ? "कार्ड जेनरेट करें" : "Generate Card"}</span>
                  <CheckCircle className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // View: Card home / Apply portal page (No applied state)
  return (
    <div className="space-y-6 animate-fadeIn font-sans relative">
      
      {/* 3D Gold Accent card mockup */}
      <div className="bg-gradient-to-tr from-[#000080] via-[#102A6A] to-[#1E3A8A] rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden border border-white/5 animate-float">
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
                    const eligibleList = getEligibleSchemes(matchAge, matchIncome);
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
                    const result = getCardExpiryTracker(issueDate);
                    if (!result) return <p className="text-slate-400 text-center font-bold">{lang === "hi" ? "जारी करने की तारीख चुनें।" : "Select issue date above."}</p>;
                    return (
                      <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-lg text-slate-800 font-bold space-y-1">
                        <p className="flex justify-between"><span>{lang === "hi" ? "समाप्ति तिथि (5 वर्ष):" : "Expiry Date (5 yrs):"}</span><span>{result.expiryDateStr}</span></p>
                        <p className="flex justify-between border-t border-indigo-200/50 pt-1">
                          <span>{lang === "hi" ? "वैधता शेष:" : "Validity Remaining:"}</span>
                          <span className={result.expired ? "text-red-700" : "text-green-700"}>
                            {result.expired ? (lang === "hi" ? "समाप्त" : "Expired") : `${result.diffDays} ${lang === "hi" ? "दिन" : "days"}`}
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
                    const valid = validateLuhn(cardCheckNo);
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
                    const { isBPL, bplCap } = getPovertyLineStatus(matchIncome, dependentCount);
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
                    const shareCost = getDependencyRatio(monthlyExpense, dependentCount);
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