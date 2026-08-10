import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { GraduationCap, Award, CheckCircle, UploadCloud, BookOpen, ArrowLeft, Info, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
// import axios from 'axios';

interface Scholarship {
  id: string;
  nameEn: string;
  nameHi: string;
  eligibilityEn: string;
  eligibilityHi: string;
  amount: string;
  deadlineEn: string;
  deadlineHi: string;
}

const SCHOLARSHIPS: Scholarship[] = [
  {
    id: "1",
    nameEn: "Saraswati Girls Higher Education Support",
    nameHi: "सरस्वती कन्या उच्च शिक्षा प्रोत्साहन",
    eligibilityEn: "Female students scoring >75% in Class 12, family income < ₹2.5L",
    eligibilityHi: "12वीं कक्षा में >75% प्राप्त करने वाली छात्राएं, पारिवारिक आय < ₹2.5L",
    amount: "₹25,000 / year",
    deadlineEn: "July 31, 2026",
    deadlineHi: "31 जुलाई 2026"
  },
  {
    id: "2",
    nameEn: "Ambedkar Technical & IT Education Aid",
    nameHi: "अम्बेडकर तकनीकी एवं आईटी शिक्षा सहायता",
    eligibilityEn: "Students pursuing B.Tech/BCA/Diploma, family income < ₹3L",
    eligibilityHi: "B.Tech/BCA/डिप्लोमा करने वाले छात्र, पारिवारिक आय < ₹3L",
    amount: "₹40,000 / year",
    deadlineEn: "August 15, 2026",
    deadlineHi: "15 अगस्त 2026"
  },
  {
    id: "3",
    nameEn: "Primary School Uniform & Stationery Grant",
    nameHi: "प्राथमिक विद्यालय यूनिफॉर्म व स्टेशनरी अनुदान",
    eligibilityEn: "Students of Class 1 to 5 in government schools",
    eligibilityHi: "सरकारी स्कूलों के कक्षा 1 से 5 तक के सभी बच्चे",
    amount: "₹5,000 (One-time kit)",
    deadlineEn: "July 15, 2026",
    deadlineHi: "15 जुलाई 2026"
  }
];

export default function ScholarshipsPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedSch, setSelectedSch] = useState<Scholarship | null>(null);
  const [fullName, setFullName] = useState("");
  const [college, setCollege] = useState("");
  const [marks, setMarks] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [subPage, setSubPage] = useState<"portal" | "tools">("portal");

  // --- WIZARD STATE ---
  const [showWizard, setShowWizard] = useState(true);
  const [wizardData, setWizardData] = useState({
    category: "General",
    income: 250000,
    marks: 80,
    gender: "Male"
  });
  const [matchedScholarships, setMatchedScholarships] = useState<Scholarship[] | null>(null);

  // --- SMART CALCULATORS STATE ---
  const [activeCalc, setActiveCalc] = useState<string | null>(null);
  const [matchIncome, setMatchIncome] = useState(150000); // INR
  const [matchMarks, setMatchMarks] = useState(78); // %
  const [cgpaVal, setCgpaVal] = useState(8.5);
  const [targetAttendance, setTargetAttendance] = useState(70); // present %
  const [totalClasses, setTotalClasses] = useState(40);
  const [admissionAge, setAdmissionAge] = useState(17);

  const runMatcher = () => {
    // Simple mock logic for matching
    const matches = SCHOLARSHIPS.filter(s => {
      if (s.id === "1" && (wizardData.gender !== "Female" || wizardData.marks < 75 || wizardData.income > 250000)) return false;
      if (s.id === "2" && wizardData.income > 300000) return false;
      return true;
    });
    setMatchedScholarships(matches);
    setShowWizard(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !college || !marks) return;

    setSubmitting(true);
    try {
      const data = {
        fullName,
        college,
        marks,
        fileName: fileName || "No file uploaded",
        scholarshipId: selectedSch?.id,
        scholarshipName: selectedSch?.nameEn || ""
      };

      const submission = {
        userId: user?.id || "guest",
        citizenName: user?.name || fullName || "Citizen",
        citizenPhone: user?.phone || "",
        serviceName: "Scholarships Support",
        submissionData: data,
        status: "pending",
        timestamp: new Date().toISOString(),
      };

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission)
      });
      if (!res.ok) throw new Error("Failed to submit scholarships application");
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedSch(null);
        setFullName("");
        setCollege("");
        setMarks("");
        setFileName(null);
      }, 4000);
    } catch (err) {
      console.error("Scholarships submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-5 space-y-5 animate-fadeIn pb-24 max-w-md mx-auto relative">
      {/* Background Mandala Grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] h-[340px] opacity-[0.025] pointer-events-none z-0">
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#D4AF37]" fill="currentColor">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <path d="M50 5l2 15 15-15-5 25 15-5-25 5 15 15-25-2 5 25-15-15-5 15-15-15-5 15-5-25-25 2 15-15-25-5 15-5-15-25 15 15z"/>
        </svg>
      </div>

      {/* Top Switcher Tab Bar */}
      <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl shadow-inner shrink-0 relative z-10">
        <button 
          onClick={() => setSubPage("portal")}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-black transition cursor-pointer ${
            subPage === "portal" ? "bg-[#000080] text-white shadow" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {lang === "hi" ? "छात्रवृत्ति पोर्टल" : "Scholarships"}
        </button>
        <button 
          onClick={() => {
            setSubPage("tools");
            if (!activeCalc) setActiveCalc("match");
          }}
          className={`flex-1 text-center py-2 rounded-lg text-xs font-black transition cursor-pointer ${
            subPage === "tools" ? "bg-[#000080] text-white shadow" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {lang === "hi" ? "पात्रता कैलकुलेटर" : "Calculators"}
        </button>
      </div>

      {subPage === "portal" && (
        <>
          <div className="border-b border-slate-200/80 pb-2.5 relative z-10 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-slate-100/80 transition text-[#000080]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h3 className="font-display font-extrabold text-base text-slate-900">
            {lang === "hi" ? "छात्रवृत्ति एवं प्रोत्साहन" : "Scholarships Center"}
          </h3>
          <p className="text-xs text-slate-500">
            {lang === "hi" ? "अपनी पात्रता अनुसार शैक्षणिक छात्रवृत्तियां प्राप्त करें" : "Apply for merit scholarships & textbook grants"}
          </p>
        </div>
      </div>

      {/* Scholarships list */}
      <div className="space-y-4 relative z-10">
        
        {/* WIZARD CARD */}
        {showWizard ? (
          <div className="bg-gradient-to-br from-[#000080] to-indigo-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <h4 className="font-display font-black text-lg flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">✨</span>
              {lang === "hi" ? "स्मार्ट स्कॉलरशिप मैच" : "Smart Scholarship Match"}
            </h4>
            <p className="text-xs text-blue-100 mb-5">
              {lang === "hi" ? "अपना विवरण दर्ज करें और जानें कि आप किन योजनाओं के लिए 100% योग्य हैं।" : "Enter your details to instantly find schemes you have a 100% match for."}
            </p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-blue-200 uppercase mb-1 block">Gender / लिंग</label>
                  <select 
                    value={wizardData.gender} onChange={e => setWizardData(prev => ({...prev, gender: e.target.value}))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-2.5 text-xs outline-none text-white focus:bg-white/20"
                  >
                    <option className="text-slate-800">Male</option>
                    <option className="text-slate-800">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-blue-200 uppercase mb-1 block">Category / वर्ग</label>
                  <select 
                    value={wizardData.category} onChange={e => setWizardData(prev => ({...prev, category: e.target.value}))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-2.5 text-xs outline-none text-white focus:bg-white/20"
                  >
                    <option className="text-slate-800">General</option>
                    <option className="text-slate-800">OBC</option>
                    <option className="text-slate-800">SC/ST</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-blue-200 uppercase mb-1 flex justify-between">
                  <span>Family Income / पारिवारिक आय</span>
                  <span className="font-black text-white">₹{wizardData.income.toLocaleString()}</span>
                </label>
                <input 
                  type="range" min="50000" max="1000000" step="50000" 
                  value={wizardData.income} onChange={e => setWizardData(prev => ({...prev, income: Number(e.target.value)}))}
                  className="w-full accent-[#FF9933]" 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-blue-200 uppercase mb-1 flex justify-between">
                  <span>Previous Year Marks / पिछले वर्ष के अंक</span>
                  <span className="font-black text-white">{wizardData.marks}%</span>
                </label>
                <input 
                  type="range" min="40" max="100" 
                  value={wizardData.marks} onChange={e => setWizardData(prev => ({...prev, marks: Number(e.target.value)}))}
                  className="w-full accent-[#FF9933]" 
                />
              </div>

              <button 
                onClick={runMatcher}
                className="w-full bg-[#FF9933] hover:bg-[#e68a2e] text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-[#FF9933]/30 transition"
              >
                {lang === "hi" ? "स्कॉलरशिप खोजें" : "Find My Matches"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-fadeIn">
            <div>
              <h4 className="font-display font-extrabold text-green-800 text-sm">
                {lang === "hi" ? "आपके लिए उपयुक्त योजनाएं" : "Matched For You"}
              </h4>
              <p className="text-[10px] text-green-700 font-medium">
                {lang === "hi" ? `${matchedScholarships?.length || 0} स्कॉलरशिप मिली हैं।` : `Found ${matchedScholarships?.length || 0} eligible schemes.`}
              </p>
            </div>
            <button onClick={() => setShowWizard(true)} className="text-[10px] bg-white border border-green-200 px-3 py-1.5 rounded-lg font-bold text-green-700 hover:bg-green-100 transition">
              {lang === "hi" ? "बदलें" : "Edit Filter"}
            </button>
          </div>
        )}

        {(matchedScholarships || SCHOLARSHIPS).map(sch => (
          <div 
            key={sch.id} 
            className="glass-card bg-white/95 p-5 border-gold-soft shadow-gold-premium space-y-3.5"
          >
            <div className="flex justify-between items-start border-b border-slate-100 pb-2">
              <h4 className="font-display font-extrabold text-sm text-[#0B1E3F] leading-snug">
                {lang === "hi" ? sch.nameHi : sch.nameEn}
              </h4>
              <span className="text-[9px] font-black text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full shrink-0 ml-2">
                {sch.amount}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              <span className="text-slate-400 uppercase text-[9.5px] block font-black mb-0.5">Eligibility / पात्रता:</span>
              {lang === "hi" ? sch.eligibilityHi : sch.eligibilityEn}
            </p>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === "hi" ? `अंतिम तिथि: ${sch.deadlineHi}` : `Apply Before: ${sch.deadlineEn}`}</span>
            </div>

            <button 
              onClick={() => setSelectedSch(sch)}
              className="w-full bg-[#000080] hover:bg-indigo-950 text-white text-xs font-black uppercase tracking-widest py-2.5 rounded-xl transition cursor-pointer flex justify-center items-center gap-1.5 shadow-sm"
            >
              <GraduationCap className="w-4 h-4 text-[#FF9933]" />
              <span>{lang === "hi" ? "छात्रवृत्ति के लिए आवेदन करें >" : "Apply Scholarship >"}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Application Sheet / Modal Overlay */}
      {selectedSch && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-end justify-center animate-fadeIn">
          <div className="bg-white rounded-t-3xl w-full sm:w-[410px] p-6 space-y-4 shadow-2xl max-h-[90%] overflow-y-auto border-t border-slate-200 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full mt-3"></div>
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 pt-2">
              <div>
                <h4 className="font-display font-extrabold text-sm text-[#0B1E3F]">
                  {lang === "hi" ? `आवेदन: ${selectedSch.nameHi}` : `Apply: ${selectedSch.nameEn}`}
                </h4>
                <p className="text-[10px] text-[#FF9933] font-black uppercase mt-0.5">{selectedSch.amount}</p>
              </div>
              <button 
                onClick={() => { setSelectedSch(null); setFileName(null); }} 
                className="text-slate-450 hover:text-slate-700 text-xs font-bold bg-slate-100 px-3 py-1 rounded-full animate-fadeIn"
              >
                Close
              </button>
            </div>

            {success ? (
              <div className="bg-green-50 border border-green-150 rounded-2xl p-6 text-center space-y-3 py-10 animate-fadeIn">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <h5 className="font-display font-extrabold text-green-905 text-base">
                  {lang === "hi" ? "आवेदन सफलतापूर्वक भेजा गया!" : "Application Submitted Successfully!"}
                </h5>
                <p className="text-xs text-green-700/80 leading-relaxed max-w-[240px] mx-auto">
                  {lang === "hi"
                    ? "आपका छात्रवृत्ति आवेदन प्राप्त हो गया है। हमारी सत्यापन समिति जल्द ही दस्तावेजों की जांच करेगी।"
                    : "Your application along with educational certificates are received for review."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Student Full Name / विद्यार्थी का नाम</label>
                  <input 
                    type="text" 
                    required 
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="As printed on marksheet" 
                    className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-[#000080]" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">School or College / स्कूल या कॉलेज</label>
                  <input 
                    type="text" 
                    required 
                    value={college}
                    onChange={e => setCollege(e.target.value)}
                    placeholder="School / College name" 
                    className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-[#000080]" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Percentage / प्रतिशत</label>
                    <input 
                      type="text" 
                      required 
                      value={marks}
                      onChange={e => setMarks(e.target.value)}
                      placeholder="e.g. 84.5%" 
                      className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-[#000080]" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Annual Income / पारिवारिक आय</label>
                    <select className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-[#000080]">
                      <option>Under ₹1.5 Lakh</option>
                      <option>₹1.5 Lakh - ₹3 Lakh</option>
                      <option>Above ₹3 Lakh</option>
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <input 
                    type="file" 
                    id="marksheet-upload" 
                    className="hidden" 
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileUpload} 
                  />
                  <label 
                    htmlFor="marksheet-upload" 
                    className="border border-dashed border-slate-350 bg-slate-50/50 p-4.5 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition"
                  >
                    {fileName ? (
                      <div className="text-center space-y-0.5">
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                        <span className="text-[10.5px] font-extrabold text-slate-800 block">Marksheet Attached</span>
                        <span className="text-[9.5px] font-mono text-slate-450">{fileName}</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-[#000080] mb-1.5" />
                        <span className="text-[10.5px] font-black text-slate-700">Attach Marksheet (PDF/Image)</span>
                        <span className="text-[9px] text-slate-400 mt-0.5">Max size: 2MB</span>
                      </>
                    )}
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-[#FF9933] hover:bg-[#e68a2e] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md disabled:opacity-75 cursor-pointer"
                >
                  {submitting ? "Submitting Application..." : "Confirm & Submit Application"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Guide Card */}
      <div className="glass-card bg-white/95 p-4.5 border-gold-soft shadow-gold-premium space-y-3 relative z-10">
        <h4 className="font-display font-extrabold text-xs text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
          <Info className="w-4.5 h-4.5 text-indigo-650" />
          <span>{lang === "hi" ? "आवेदन हेतु महत्वपूर्ण सूचना" : "Application Checklist Info"}</span>
        </h4>
        <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
          {lang === "hi"
            ? "सभी छात्रवृत्ति योजनाओं में बैंक खाता आधार से लिंक होना अनिवार्य है। छात्र का आधार जन सेवा कार्ड से लिंक होना चाहिए।"
            : "Bank account must be Aadhaar-linked. Make sure your Jan Seva card details match your academic registration files."}
        </p>
      </div>
        </>
      )}

      {subPage === "tools" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 animate-fadeIn relative z-10">
          <h4 className="font-display font-black text-xs text-[#000080] uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>{lang === "hi" ? "शैक्षणिक और योग्यता टूल्स" : "Academic & Eligibility Planners"}</span>
            <GraduationCap className="w-4.5 h-4.5 text-indigo-650" />
          </h4>

          {/* Tools Grid */}
          <div className="grid grid-cols-2 gap-2 text-center text-slate-755">
            {[
              { key: "eligibility", title: lang === "hi" ? "स्कॉलरशिप योग्यता" : "Eligibility Scorer" },
              { key: "gpa", title: lang === "hi" ? "CGPA प्रतिशत परिवर्तक" : "CGPA Converter" },
              { key: "attendance", title: lang === "hi" ? "उपस्थिति उपस्थिति लक्ष्य" : "Attendance Tracker" },
              { key: "age", title: lang === "hi" ? "प्रवेश आयु सीमा जाँच" : "Admission Age Check" }
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

        {/* Content Container */}
        {activeCalc && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-2 space-y-4 animate-fadeIn text-xs text-slate-700">
            
            {/* 1. Eligibility Scorer */}
            {activeCalc === "eligibility" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "पारिवारिक आय और शैक्षणिक अंकों का मिलान" : "Scholarship Eligibility Matcher"}</h5>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `शैक्षणिक अंक: ${matchMarks}%` : `Academic Score: ${matchMarks}%`}</label>
                    <input type="range" min="50" max="100" value={matchMarks} onChange={e => setMatchMarks(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `पारिवारिक आय: ₹${matchIncome.toLocaleString()}` : `Family Income: ₹${matchIncome.toLocaleString()}`}</label>
                    <input type="range" min="50000" max="400000" step="10000" value={matchIncome} onChange={e => setMatchIncome(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                </div>

                {(() => {
                  const eligibleList = [];
                  if (matchMarks >= 75 && matchIncome <= 250000) {
                    eligibleList.push(lang === "hi" ? "सरस्वती कन्या उच्च शिक्षा प्रोत्साहन" : "Saraswati Girls Higher Education Support");
                  }
                  if (matchIncome <= 300000) {
                    eligibleList.push(lang === "hi" ? "अम्बेडकर तकनीकी एवं आईटी शिक्षा सहायता" : "Ambedkar Technical & IT Education Aid");
                  }
                  return (
                    <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-lg text-slate-800 font-bold space-y-1.5">
                      <p className="text-[10px] text-slate-450 font-black uppercase">{lang === "hi" ? "योग्य छात्रवृत्ति योजनाएं" : "Matched Scholarship Programs"}</p>
                      {eligibleList.length > 0 ? (
                        eligibleList.map((sch, i) => <p key={i} className="text-green-700 font-extrabold">• {sch}</p>)
                      ) : (
                        <p className="text-red-700">{lang === "hi" ? "कोई छात्रवृत्ति योजना मैच नहीं हुई।" : "No matches found."}</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 2. CGPA to Percentile */}
            {activeCalc === "gpa" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "CGPA से प्रतिशत परिवर्तक (CBSE/State Board)" : "CGPA to Percentage Converter"}</h5>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `CGPA मूल्य: ${cgpaVal}` : `CGPA Value: ${cgpaVal}`}</label>
                  <input type="range" min="4" max="10" step="0.1" value={cgpaVal} onChange={e => setCgpaVal(Number(e.target.value))} className="w-full accent-[#000080]" />
                </div>

                {(() => {
                  const percent = (cgpaVal * 9.5).toFixed(1);
                  return (
                    <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-lg text-slate-800 font-bold text-center">
                      <p className="text-[10px] text-slate-450 font-bold uppercase">{lang === "hi" ? "समतुल्य प्रतिशत (Percentage)" : "Equivalent CBSE Percentage"}</p>
                      <p className="text-lg text-[#000080] font-black mt-1">{percent}%</p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 3. Attendance Goal Tracker */}
            {activeCalc === "attendance" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "७५% उपस्थिति लक्ष्य योजना संकेतक" : "Attendance Goal Tracker (75% Minimum)"}</h5>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `वर्तमान उपस्थित कक्षाएं: ${targetAttendance}` : `Present Classes: ${targetAttendance}`}</label>
                    <input type="range" min="10" max="100" value={targetAttendance} onChange={e => setTargetAttendance(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `कुल संचालित कक्षाएं: ${totalClasses}` : `Total Conducted Classes: ${totalClasses}`}</label>
                    <input type="range" min="20" max="120" value={totalClasses} onChange={e => setTotalClasses(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                </div>

                {(() => {
                  const currentRate = Math.round((targetAttendance / totalClasses) * 100);
                  const isSafe = currentRate >= 75;
                  const classesNeeded = Math.max(0, Math.ceil((0.75 * totalClasses - targetAttendance) / 0.25));
                  return (
                    <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-lg text-slate-800 font-bold space-y-1.5 text-center">
                      <p className="flex justify-between"><span>{lang === "hi" ? "वर्तमान उपस्थिति दर:" : "Current Attendance Rate:"}</span><span className={isSafe ? "text-green-700" : "text-red-700"}>{currentRate}%</span></p>
                      {!isSafe && <p className="text-[10px] text-red-650 mt-1">{lang === "hi" ? `(७५% प्राप्त करने के लिए अगली ${classesNeeded} कक्षाओं में लगातार उपस्थित होना आवश्यक है)` : `(Must attend next ${classesNeeded} classes straight to cross 75%)`}</p>}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 4. Admission Age Check */}
            {activeCalc === "age" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "प्रवेश आयु सीमा जाँच (Eligibility Age Limit)" : "Admission Eligibility Age Check"}</h5>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `छात्र की आयु: ${admissionAge} वर्ष` : `Candidate Age: ${admissionAge} years`}</label>
                  <input type="range" min="10" max="30" value={admissionAge} onChange={e => setAdmissionAge(Number(e.target.value))} className="w-full accent-[#000080]" />
                </div>

                {(() => {
                  const isEligible = admissionAge >= 15 && admissionAge <= 23;
                  return (
                    <div className={`p-3 rounded-lg border font-bold text-center ${isEligible ? "bg-green-50 text-green-700 border-green-150" : "bg-red-50 text-red-700 border-red-150"}`}>
                      {isEligible ? (
                        <p>{lang === "hi" ? "✓ योग्य: आयु सीमा प्रवेश शर्तों के अनुकूल है।" : "✓ Eligible: Age is within standard admission limits."}</p>
                      ) : (
                        <p>{lang === "hi" ? "✗ अपात्र: आयु प्रवेश शर्तों के अनुकूल नहीं है।" : "✗ Ineligible: Out of candidate age range."}</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

          </div>
        )}
      </div>
      )}
    </div>
  );
}
