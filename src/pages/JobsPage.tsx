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
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filterCity, setFilterCity] = useState<"all" | "bhopal" | "sehore">("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
        console.error("Supabase jobs fetch error:", error);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    if (filterCity === "all") return true;
    if (filterCity === "bhopal") return job.locEn.toLowerCase().includes("bhopal");
    if (filterCity === "sehore") return job.locEn.toLowerCase().includes("sehore");
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
      console.error("Supabase application submission error:", error);
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
        {(["all", "bhopal", "sehore"] as const).map(city => (
          <button 
            key={city}
            onClick={() => setFilterCity(city)}
            className={`flex-1 py-1.5 text-[10.5px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
              filterCity === city 
                ? "bg-white text-[#000080] shadow-sm border border-slate-200/30" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {city === "all" ? (lang === "hi" ? "सभी" : "All") : city === "bhopal" ? (lang === "hi" ? "भोपाल" : "Bhopal") : (lang === "hi" ? "सीहोर" : "Sehore")}
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

    </div>
  );
}
