import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Briefcase, MapPin, DollarSign, UploadCloud, CheckCircle, ArrowLeft, Info, Calendar } from "lucide-react";
// import axios from 'axios';
import { useAuth } from "../context/AuthContext";

interface Job {
  id: string;
  titleEn: string;
  titleHi: string;
  locEn: string;
  locHi: string;
  salary: string;
  typeEn: string;
  typeHi: string;
  company: string;
}

export default function JobsPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const isHi = lang === "hi";
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [remoteJobs, setRemoteJobs] = useState<any[]>([]);
  const [rssJobs, setRssJobs] = useState<any[]>([]);
  const [filterCity, setFilterCity] = useState<"all" | "bhopal" | "bhopal">("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [subPage, setSubPage] = useState<"portal" | "remote" | "tools">("portal");

  // --- SMART CALCULATORS STATE ---
  const [activeCalc, setActiveCalc] = useState<string | null>(null);
  const [monthlySalary, setMonthlySalary] = useState(25000); // INR
  const [epfRate, setEpfRate] = useState(12); // %
  const [resumeText, setResumeText] = useState("");
  const [targetHourlyRate, setTargetHourlyRate] = useState(15000); // monthly budget
  const [hourlyBillableHours, setHourlyBillableHours] = useState(120); // hours
  const [gratuityBaseSalary, setGratuityBaseSalary] = useState(20000);
  const [gratuityYears, setGratuityYears] = useState(5);

  const [ifscCode, setIfscCode] = useState("");
  const [ifscResult, setIfscResult] = useState<any>(null);
  const [ifscLoading, setIfscLoading] = useState(false);

  const [collegeQuery, setCollegeQuery] = useState("");
  const [collegeResults, setCollegeResults] = useState<any[]>([]);
  const [collegeLoading, setCollegeLoading] = useState(false);

  const [waybackQuery, setWaybackQuery] = useState("");
  const [waybackResult, setWaybackResult] = useState<any>(null);
  const [waybackLoading, setWaybackLoading] = useState(false);
  
  useEffect(() => {
    const fetchRssJobs = async () => {
      try {
        const res = await fetch("/api/public/jobs-feed");
        if (res.ok) {
          const d = await res.json();
          if (d.success) setRssJobs(d.data);
        }
      } catch (err) {}
    };
    fetchRssJobs();

    const fetchRemoteJobs = async () => {
      try {
        const res = await fetch("/api/public/remote-jobs");
        if (res.ok) {
          const d = await res.json();
          if (d.success && d.data?.jobs) setRemoteJobs(d.data.jobs);
        }
      } catch (err) {}
    };
    fetchRemoteJobs();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/jobs");
        if (res.ok) {
          const d = await res.json();
          setJobs(d.jobs || []);
        } else {
          throw new Error("Failed to fetch jobs");
        }
      } catch (error) {
        console.error("Backend jobs fetch error:", error);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    if (filterCity === "all") return true;
    if (filterCity === "bhopal") return job.locEn.toLowerCase().includes("bhopal");
    if (filterCity === "bhopal") return job.locEn.toLowerCase().includes("bhopal");
    return true;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !selectedJob) return;

    setSubmitting(true);
    try {
      const appData = {
        jobId: selectedJob.id,
        jobTitle: selectedJob.titleEn,
        fullName,
        phone,
        fileName: fileName || "",
        appliedAt: new Date().toISOString()
      };

      const resApp = await fetch("/api/job_applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appData)
      });
      if (!resApp.ok) throw new Error("Failed to register job application");

      // Polymorphic write to service_submissions
      const submission = {
        userId: user?.id || "guest",
        citizenName: user?.name || fullName || "Citizen",
        citizenPhone: user?.phone || phone || "",
        serviceName: "Youth Employment",
        submissionData: appData,
        status: "pending",
        timestamp: new Date().toISOString(),
      };
      
      const resSub = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission)
      });
      if (!resSub.ok) throw new Error("Failed to submit intake application");

      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedJob(null);
        setFullName("");
        setPhone("");
        setFileName(null);
      }, 3000);
    } catch (error) {
      console.error("Application submission error:", error);
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
          className={`flex-1 py-2 text-center rounded-lg text-[10px] font-black transition cursor-pointer ${
            subPage === "portal" ? "bg-[#000080] text-white shadow" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {lang === "hi" ? "लोकल जॉब्स" : "Local Jobs"}
        </button>
        <button 
          onClick={() => setSubPage("remote")}
          className={`flex-1 py-2 text-center rounded-lg text-[10px] font-black transition cursor-pointer ${
            subPage === "remote" ? "bg-[#000080] text-white shadow" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {lang === "hi" ? "रिमोट (WFH)" : "Remote Jobs"}
        </button>
        <button 
          onClick={() => {
            setSubPage("tools");
            if (!activeCalc) setActiveCalc("takehome");
          }}
          className={`flex-1 text-center py-2 rounded-lg text-[10px] font-black transition cursor-pointer ${
            subPage === "tools" ? "bg-[#000080] text-white shadow" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {lang === "hi" ? "स्मार्ट टूल्स" : "Smart Tools"}
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
            {lang === "hi" ? "रोजगार एवं प्रशिक्षण केंद्र" : "Jobs & Training HQ"}
          </h3>
          <p className="text-xs text-slate-500">
            {lang === "hi" ? "स्थानीय रोजगार खोजें और अपना बायोडाटा जमा करें" : "Browse local job vacancies and apply instantly"}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 relative z-10">
        {(["all", "bhopal", "bhopal"] as const).map(city => (
          <button 
            key={city}
            onClick={() => setFilterCity(city)}
            className={`flex-1 py-1.5 text-[10.5px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
              filterCity === city 
                ? "bg-white text-[#000080] shadow-sm border border-slate-200/30" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {city === "all" ? (lang === "hi" ? "सभी" : "All") : city === "bhopal" ? (lang === "hi" ? "भोपाल" : "Bhopal") : (lang === "hi" ? "सीहोर" : "Bhopal")}
          </button>
        ))}
      </div>

      {/* Jobs Listing */}
      <div className="space-y-4 relative z-10">
        {filteredJobs.map(job => (
          <div 
            key={job.id} 
            className="glass-card bg-white/95 p-4.5 border-gold-soft shadow-gold-premium space-y-3"
          >
            <div className="flex justify-between items-start border-b border-slate-100 pb-2">
              <div>
                <h4 className="font-display font-extrabold text-sm text-[#0B1E3F]">
                  {lang === "hi" ? job.titleHi : job.titleEn}
                </h4>
                <p className="text-[10px] text-[#FF9933] font-black uppercase tracking-wider mt-0.5">{job.company}</p>
              </div>
              <span className="text-[8.5px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {lang === "hi" ? job.typeHi : job.typeEn}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10.5px] font-bold text-slate-550 uppercase tracking-wider">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {lang === "hi" ? job.locHi : job.locEn}</span>
              <span className="flex items-center gap-0.5 text-green-750 font-black"><DollarSign className="w-3.5 h-3.5 text-green-600 shrink-0" /> {job.salary}</span>
            </div>

            <button 
              onClick={() => setSelectedJob(job)}
              className="w-full bg-[#000080] hover:bg-indigo-950 text-white text-xs font-black uppercase tracking-widest py-2.5 rounded-xl transition cursor-pointer flex justify-center items-center gap-1.5 shadow-sm"
            >
              <span>{lang === "hi" ? "नौकरी के लिए आवेदन करें >" : "Apply for Job >"}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Application Sheet / Modal Overlay */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-end justify-center animate-fadeIn">
          <div className="bg-white rounded-t-3xl w-full sm:w-[410px] p-6 space-y-4 shadow-2xl max-h-[90%] overflow-y-auto border-t border-slate-200 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full mt-3"></div>
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 pt-2">
              <div>
                <h4 className="font-display font-extrabold text-sm text-[#0B1E3F]">
                  {lang === "hi" ? `आवेदन: ${selectedJob.titleHi}` : `Apply: ${selectedJob.titleEn}`}
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{selectedJob.company}</p>
              </div>
              <button 
                onClick={() => { setSelectedJob(null); setFileName(null); }} 
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
                    ? "आपका रिज्यूम दर्ज कर लिया गया है। हमारे रिक्रूटर जल्द ही आपसे संपर्क करेंगे।"
                    : "Your resume files are securely uploaded. Recruiters will contact you within 48 hours."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Full Name / नाम</label>
                  <input 
                    type="text" 
                    required 
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="As printed on Aadhaar card" 
                    className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-[#000080]" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Mobile Number / मोबाइल</label>
                  <input 
                    type="tel" 
                    required 
                    maxLength={10}
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="99999 99999" 
                    className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-[#000080]" 
                  />
                </div>

                <div className="relative">
                  <input 
                    type="file" 
                    id="resume-upload" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload} 
                  />
                  <label 
                    htmlFor="resume-upload" 
                    className="border border-dashed border-slate-350 bg-slate-50/50 p-4.5 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition"
                  >
                    {fileName ? (
                      <div className="text-center space-y-0.5">
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                        <span className="text-[10.5px] font-extrabold text-slate-800 block">Resume Loaded</span>
                        <span className="text-[9.5px] font-mono text-slate-450">{fileName}</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-[#000080] mb-1.5" />
                        <span className="text-[10.5px] font-black text-slate-700">Upload Bio-Data / Resume (PDF)</span>
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

      {/* Free Skills Training Guides */}
      <div className="glass-card bg-white/95 p-4.5 border-gold-soft shadow-gold-premium space-y-3 relative z-10">
        <h4 className="font-display font-extrabold text-xs text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
          <Info className="w-4.5 h-4.5 text-indigo-650" />
          <span>{lang === "hi" ? "निशुल्क व्यावसायिक ट्रेनिंग गाइड" : "Vocational Study Manuals"}</span>
        </h4>
        <div className="space-y-2 text-xs">
          <div className="p-3 border border-slate-150 bg-slate-50/50 rounded-xl flex items-center justify-between hover:border-[#FF9933] transition cursor-pointer">
            <div>
              <span className="font-bold text-slate-850 block">{lang === "hi" ? "कम्प्यूटर साक्षरता पाठ्यक्रम" : "Digital Literacy Blueprints"}</span>
              <span className="text-[9.5px] text-slate-400 font-semibold">{lang === "hi" ? "बुनियादी एक्सेल और वर्ड फ़ाइल उपयोग" : "Basic office applications, forms guides"}</span>
            </div>
            <span className="bg-indigo-55 text-[9px] font-black text-white px-2 py-0.5 rounded">PDF</span>
          </div>
          <div className="p-3 border border-slate-150 bg-slate-50/50 rounded-xl flex items-center justify-between hover:border-[#FF9933] transition cursor-pointer">
            <div>
              <span className="font-bold text-slate-850 block">{lang === "hi" ? "इंटरव्यू तैयारी ब्लू-प्रिंट" : "Mock Interviews Manual"}</span>
              <span className="text-[9.5px] text-slate-400 font-semibold">{lang === "hi" ? "रिज्यूम निर्माण और आत्म-विश्वास टिप्स" : "Spoken English & placement guidelines"}</span>
            </div>
            <span className="bg-indigo-55 text-[9px] font-black text-white px-2 py-0.5 rounded">PDF</span>
          </div>
        </div>
      </div>
        </>
      )}

      {subPage === "remote" && (
        <div className="space-y-4 relative z-10">
          <div className="border-b border-slate-200/80 pb-2.5 flex items-center gap-3">
            <div>
              <h3 className="font-display font-extrabold text-base text-slate-900">
                {lang === "hi" ? "रिमोट नौकरियां (वर्क फ्रॉम होम)" : "Remote Jobs (Work From Home)"}
              </h3>
              <p className="text-[10px] text-slate-500 font-bold">
                {lang === "hi" ? "जॉबिसी (Jobicy) द्वारा प्रमाणित नौकरियां" : "Verified jobs by Jobicy API"}
              </p>
            </div>
          </div>
          {remoteJobs.length === 0 ? (
            <p className="text-xs text-slate-500 font-bold text-center animate-pulse">{lang === "hi" ? "रिमोट जॉब्स लोड हो रही हैं..." : "Loading remote jobs..."}</p>
          ) : (
            remoteJobs.map((job: any) => (
              <div 
                key={job.id} 
                className="bg-white p-4 border border-slate-200/60 rounded-xl shadow-sm space-y-2"
              >
                <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                  <div>
                    <h4 className="font-display font-extrabold text-sm text-[#0B1E3F]">
                      {job.jobTitle}
                    </h4>
                    <p className="text-[10px] text-[#FF9933] font-black uppercase tracking-wider mt-0.5">{job.companyName}</p>
                  </div>
                  <span className="text-[8.5px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                    {job.jobType}
                  </span>
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex flex-wrap gap-2">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {job.jobGeo}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /> {new Date(job.pubDate).toLocaleDateString()}</span>
                </div>
                <a 
                  href={job.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-[#FF9933] hover:bg-[#e68a2e] text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-xl transition cursor-pointer mt-2"
                >
                  {lang === "hi" ? "जॉबिसी पर अप्लाई करें >" : "Apply on Jobicy >"}
                </a>
              </div>
            ))
          )}
        </div>
      )}

      {subPage === "tools" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 animate-fadeIn relative z-10">
          <h4 className="font-display font-black text-xs text-[#000080] uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>{lang === "hi" ? "आजीविका और वेतन टूल्स" : "Livelihood & Earnings Calculators"}</span>
            <Briefcase className="w-4.5 h-4.5 text-indigo-650" />
          </h4>

          {/* Tools Grid */}
          <div className="grid grid-cols-2 gap-2 text-center text-slate-750">
            {[
            { key: "takehome", title: lang === "hi" ? "इन-हैंड सैलरी" : "Take-Home Salary" },
            { key: "ats", title: lang === "hi" ? "रिज्यूम ATS स्कोर" : "ATS Compatibility" },
            { key: "ifsc", title: lang === "hi" ? "बैंक IFSC खोज" : "Bank IFSC Finder" },
            { key: "college", title: lang === "hi" ? "कॉलेज डायरेक्टरी" : "College Finder" },
            { key: "wayback", title: lang === "hi" ? "वेबसाइट आर्काइव" : "Web Archive" },
            { key: "freelance", title: lang === "hi" ? "प्रति घंटा दर" : "Freelance Rate" },
            { key: "gratuity", title: lang === "hi" ? "ग्रेच्युटी राशि अनुमान" : "Gratuity Estimator" }
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
            
            {/* 1. Take-home Salary */}
            {activeCalc === "takehome" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "मासिक इन-हैंड वेतन गणना (टैक्स कटौती सहित)" : "India Take-Home Salary Calculator"}</h5>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `मूल मासिक वेतन (Basic): ₹${monthlySalary.toLocaleString()}` : `Monthly Gross Salary: ₹${monthlySalary.toLocaleString()}`}</label>
                    <input type="range" min="10000" max="150000" step="2500" value={monthlySalary} onChange={e => setMonthlySalary(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                </div>

                {(() => {
                  const epfContribution = Math.round(monthlySalary * (epfRate / 100));
                  const ptDeduction = monthlySalary > 15000 ? 200 : 0; // Professional Tax average
                  const netTakeHome = monthlySalary - epfContribution - ptDeduction;
                  return (
                    <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-lg text-slate-800 font-bold space-y-1.5">
                      <p className="flex justify-between"><span>{lang === "hi" ? "EPF कटौती (12%):" : "EPF Deduction (12%):"}</span><span className="text-red-700">-₹{epfContribution.toLocaleString()}</span></p>
                      <p className="flex justify-between"><span>{lang === "hi" ? "व्यवसाय कर (Prof Tax):" : "Professional Tax:"}</span><span className="text-red-700">-₹{ptDeduction.toLocaleString()}</span></p>
                      <p className="flex justify-between border-t border-indigo-200/50 pt-1.5"><span>{lang === "hi" ? "मासिक इन-हैंड वेतन:" : "Net Take-Home / Month:"}</span><span className="text-green-700">₹{netTakeHome.toLocaleString()}</span></p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 2. ATS Compatibility */}
            {activeCalc === "ats" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "रिज्यूम कीवर्ड मैचिंग (ATS Score)" : "Resume ATS Compatibility Check"}</h5>
                <p className="text-[10px] text-slate-400 font-bold">{lang === "hi" ? "नौकरी के विवरण और अपने रिज्यूम के कीवर्ड्स का मिलान करें।" : "Upload or paste your resume text to compute compatibility score against job roles."}</p>
                <div>
                  <textarea 
                    value={resumeText} 
                    onChange={e => setResumeText(e.target.value)} 
                    placeholder={lang === "hi" ? "अपना रिज्यूम टेक्स्ट या कौशल यहाँ पेस्ट करें..." : "Paste your resume skills or description here..."} 
                    className="w-full border border-slate-200 bg-white rounded p-2 text-xs font-bold min-h-[60px] outline-none" 
                  />
                </div>

                {(() => {
                  if (resumeText.trim().length === 0) return <p className="text-slate-400 text-center font-bold">{lang === "hi" ? "रिज्यूम टेक्स्ट डालें।" : "Paste details above to check."}</p>;
                  // Simple mock Jaccard similarity checking for standard skills (Excel, Word, Tally, SQL, React, Node)
                  const sampleKeywords = ["excel", "tally", "word", "office", "computer", "typing", "management", "administration"];
                  const userWords = resumeText.toLowerCase().split(/\W+/);
                  const matched = sampleKeywords.filter(w => userWords.includes(w));
                  const score = Math.round((matched.length / sampleKeywords.length) * 100);
                  
                  return (
                    <div className={`p-3 rounded-lg border font-bold text-center ${score >= 50 ? "bg-green-50 text-green-700 border-green-150" : "bg-amber-50 text-amber-700 border-amber-150"}`}>
                      <p className="text-sm font-black">{score}% Match Score</p>
                      <p className="text-[9px] mt-1 text-slate-500 font-semibold">
                        {score >= 50 
                          ? (lang === "hi" ? "✓ बढ़िया! आपका रिज्यूम बुनियादी जरूरतों से मेल खाता है।" : "✓ Looking Good! Core vocabulary matched.")
                          : (lang === "hi" ? "सुझाव: 'Excel', 'Tally', या 'Office' जैसे बुनियादी कौशल जोड़ें।" : "Advice: Include 'Excel', 'Tally', or 'Office' if applicable.")}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 3. Freelance Billing Rate */}
            {activeCalc === "freelance" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "लक्षित प्रति घंटा बिलिंग दर प्लानर" : "Freelance Hourly Rate Planner"}</h5>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `लक्षित मासिक आय: ₹${targetHourlyRate.toLocaleString()}` : `Desired Monthly Savings: ₹${targetHourlyRate.toLocaleString()}`}</label>
                    <input type="range" min="5000" max="100000" step="5000" value={targetHourlyRate} onChange={e => setTargetHourlyRate(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `दैनिक बिलिंग घंटे/माह: ${hourlyBillableHours} घंटे` : `Billable Hours / Month: ${hourlyBillableHours} hrs`}</label>
                    <input type="range" min="40" max="200" step="10" value={hourlyBillableHours} onChange={e => setHourlyBillableHours(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                </div>

                {(() => {
                  const rate = Math.round(targetHourlyRate / hourlyBillableHours);
                  return (
                    <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-lg text-slate-800 font-bold text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === "hi" ? "न्यूनतम प्रति घंटा शुल्क दर" : "Minimum Hourly Rate Required"}</p>
                      <p className="text-lg text-[#000080] font-black mt-1">₹{rate} / hour</p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 4. Gratuity Estimator */}
            {activeCalc === "gratuity" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "ग्रेच्युटी राशि अनुमान (Payment of Gratuity Act)" : "Payment of Gratuity Act Estimator"}</h5>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `मूल वेतन (Basic + DA): ₹${gratuityBaseSalary.toLocaleString()}` : `Basic + DA Salary: ₹${gratuityBaseSalary.toLocaleString()}`}</label>
                    <input type="range" min="5000" max="80000" step="2500" value={gratuityBaseSalary} onChange={e => setGratuityBaseSalary(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `कुल सेवा अवधि (वर्ष): ${gratuityYears} वर्ष` : `Service Duration: ${gratuityYears} yrs`}</label>
                    <input type="range" min="1" max="40" value={gratuityYears} onChange={e => setGratuityYears(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                </div>

                {(() => {
                  // Formula: Basic * 15 / 26 * Years (eligible if years >= 5)
                  const isEligible = gratuityYears >= 5;
                  const gratuity = isEligible ? Math.round((gratuityBaseSalary * 15 / 26) * gratuityYears) : 0;
                  return (
                    <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-lg text-slate-800 font-bold space-y-1 text-center">
                      {!isEligible ? (
                        <p className="text-red-700">{lang === "hi" ? "अपात्र: न्यूनतम ५ वर्ष की सेवा आवश्यक है।" : "Not eligible: Requires minimum 5 years of service."}</p>
                      ) : (
                        <>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === "hi" ? "संभावित ग्रेच्युटी राशि:" : "Estimated Gratuity Payable:"}</p>
                          <p className="text-lg text-green-700 font-black mt-1">₹{gratuity.toLocaleString()}</p>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 5. Bank IFSC Finder */}
            {activeCalc === "ifsc" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "बैंक IFSC और ब्रांच खोज" : "Bank IFSC & Branch Finder"}</h5>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter IFSC (e.g. SBIN0000001)" 
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    className="flex-1 border border-slate-200 bg-white rounded-lg p-2.5 text-xs font-bold outline-none uppercase"
                  />
                  <button 
                    disabled={ifscLoading || ifscCode.length < 4}
                    onClick={() => {
                      setIfscLoading(true);
                      fetch(`/api/public/ifsc/${ifscCode}`)
                        .then(r => r.json())
                        .then(d => {
                          if (d.success) setIfscResult(d.data);
                          else setIfscResult({ error: true });
                          setIfscLoading(false);
                        }).catch(() => {
                          setIfscResult({ error: true });
                          setIfscLoading(false);
                        });
                    }}
                    className="bg-[#FF9933] text-white px-4 py-2.5 rounded-lg font-black text-xs disabled:opacity-50"
                  >
                    {isHi ? "खोजें" : "Search"}
                  </button>
                </div>
                {ifscResult && !ifscResult.error && (
                  <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-lg text-slate-800 space-y-1.5 text-left">
                    <p className="font-black text-indigo-900 text-sm">{ifscResult.BANK}</p>
                    <p className="text-[10px] font-bold text-slate-600"><span className="text-slate-400">Branch:</span> {ifscResult.BRANCH}</p>
                    <p className="text-[10px] font-bold text-slate-600"><span className="text-slate-400">Address:</span> {ifscResult.ADDRESS}</p>
                    <p className="text-[10px] font-bold text-slate-600"><span className="text-slate-400">City/State:</span> {ifscResult.CITY}, {ifscResult.STATE}</p>
                    <p className="text-[10px] font-bold text-green-700 mt-2 bg-green-100 inline-block px-2 py-0.5 rounded">IFSC: {ifscResult.IFSC}</p>
                  </div>
                )}
                {ifscResult?.error && (
                  <p className="text-red-500 font-bold text-xs mt-2">{isHi ? "अमान्य IFSC कोड या बैंक नहीं मिला" : "Invalid IFSC Code or Bank Not Found"}</p>
                )}
              </div>
            )}

            {/* 6. College Finder */}
            {activeCalc === "college" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "विश्वविद्यालय एवं कॉलेज डायरेक्टरी" : "Indian Universities Directory"}</h5>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Search by name (e.g. Delhi)" 
                    value={collegeQuery}
                    onChange={(e) => setCollegeQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setCollegeLoading(true);
                        fetch(`/api/public/universities?name=${collegeQuery}`)
                          .then(r => r.json())
                          .then(d => {
                            if (d.success) setCollegeResults(d.data.slice(0, 10)); // max 10
                            setCollegeLoading(false);
                          }).catch(() => setCollegeLoading(false));
                      }
                    }}
                    className="flex-1 border border-slate-200 bg-white rounded-lg p-2.5 text-xs font-bold outline-none"
                  />
                  <button 
                    disabled={collegeLoading}
                    onClick={() => {
                      setCollegeLoading(true);
                      fetch(`/api/public/universities?name=${collegeQuery}`)
                        .then(r => r.json())
                        .then(d => {
                          if (d.success) setCollegeResults(d.data.slice(0, 10)); // max 10
                          setCollegeLoading(false);
                        }).catch(() => setCollegeLoading(false));
                    }}
                    className="bg-[#FF9933] text-white px-4 py-2.5 rounded-lg font-black text-xs disabled:opacity-50"
                  >
                    {isHi ? "खोजें" : "Search"}
                  </button>
                </div>
                {collegeLoading && <p className="text-slate-500 font-bold text-xs mt-2 animate-pulse">{isHi ? "खोज रहा है..." : "Searching..."}</p>}
                {!collegeLoading && collegeResults.length > 0 && (
                  <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                    {collegeResults.map((col, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 p-3 rounded-lg text-left">
                        <p className="font-extrabold text-sm text-[#0B1E3F]">{col.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold mb-1">{col["state-province"] || "India"}</p>
                        {col.web_pages && col.web_pages[0] && (
                          <a href={col.web_pages[0]} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-black hover:underline">
                            {col.web_pages[0]}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {!collegeLoading && collegeQuery && collegeResults.length === 0 && (
                  <p className="text-slate-400 font-bold text-xs mt-2">{isHi ? "कोई विश्वविद्यालय नहीं मिला" : "No universities found"}</p>
                )}
              </div>
            )}

            {/* 7. Wayback Machine */}
            {activeCalc === "wayback" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "वेबसाइट आर्काइव (Wayback Machine)" : "Web Archive Viewer"}</h5>
                <p className="text-[10px] text-slate-500 font-bold mb-2">
                  {lang === "hi" ? "पुरानी या बंद हो चुकी वेबसाइट का स्नैपशॉट खोजें।" : "Find historical snapshots of old or deleted websites."}
                </p>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    placeholder="https://example.gov.in" 
                    value={waybackQuery}
                    onChange={(e) => setWaybackQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && waybackQuery) {
                        setWaybackLoading(true);
                        setWaybackResult(null);
                        fetch(`/api/public/wayback?url=${encodeURIComponent(waybackQuery)}`)
                          .then(r => r.json())
                          .then(d => {
                            if (d.success && d.data) setWaybackResult(d.data);
                            else setWaybackResult({ error: true });
                            setWaybackLoading(false);
                          }).catch(() => {
                            setWaybackResult({ error: true });
                            setWaybackLoading(false);
                          });
                      }
                    }}
                    className="flex-1 border border-slate-200 bg-white rounded-lg p-2.5 text-xs font-bold outline-none"
                  />
                  <button 
                    disabled={waybackLoading || !waybackQuery}
                    onClick={() => {
                      setWaybackLoading(true);
                      setWaybackResult(null);
                      fetch(`/api/public/wayback?url=${encodeURIComponent(waybackQuery)}`)
                        .then(r => r.json())
                        .then(d => {
                          if (d.success && d.data) setWaybackResult(d.data);
                          else setWaybackResult({ error: true });
                          setWaybackLoading(false);
                        }).catch(() => {
                          setWaybackResult({ error: true });
                          setWaybackLoading(false);
                        });
                    }}
                    className="bg-[#000080] text-white px-4 py-2.5 rounded-lg font-black text-xs disabled:opacity-50"
                  >
                    {isHi ? "खोजें" : "Search"}
                  </button>
                </div>
                {waybackLoading && <p className="text-slate-500 font-bold text-xs mt-2 animate-pulse">{isHi ? "खोज रहा है..." : "Searching archives..."}</p>}
                
                {waybackResult && !waybackResult.error && (
                  <div className="bg-green-50 border border-green-150 p-3 rounded-lg text-slate-800 space-y-1.5 text-left mt-2">
                    <p className="font-black text-green-900 text-sm">{isHi ? "स्नैपशॉट मिल गया!" : "Snapshot Found!"}</p>
                    <p className="text-[10px] font-bold text-slate-600"><span className="text-slate-400">Date:</span> {waybackResult.timestamp.replace(/(\d{4})(\d{2})(\d{2}).*/, '$1-$2-$3')}</p>
                    <a 
                      href={waybackResult.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-[10px] font-black bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition"
                    >
                      {isHi ? "स्नैपशॉट देखें" : "View Snapshot"}
                    </a>
                  </div>
                )}
                
                {waybackResult?.error && (
                  <p className="text-red-500 font-bold text-xs mt-2">{isHi ? "इस लिंक का कोई पुराना रिकॉर्ड नहीं मिला।" : "No historical snapshot found for this URL."}</p>
                )}
              </div>
            )}

          </div>
        )}
      </div>
      )}
    </div>
  );
}
