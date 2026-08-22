import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, MapPin, Camera, CheckCircle, Clock, Loader2, 
  Video, Mic, Play, Square, Image as ImageIcon, Volume2, Trash2, Eye,
  Building2, Globe2, ShieldCheck, FileText, ChevronRight, Sparkles, PhoneCall
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useOutletContext, useNavigate } from "react-router-dom";
import { openExternalLink } from "../utils/browser";

export default function Grievances() {
  const { grievances, addGrievance } = useApp();
  const { user } = useAuth();
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const navigate = useNavigate();
  const isHi = lang === "hi";

  const [tab, setTab] = useState<"file" | "gov" | "track" | "community">("file");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Media states
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  
  const [uploading, setUploading] = useState<"image" | "video" | "audio" | null>(null);
  
  // Audio Recording simulation
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recIntervalId, setRecIntervalId] = useState<any>(null);

  useEffect(() => {
    return () => {
      if (recIntervalId) clearInterval(recIntervalId);
    };
  }, [recIntervalId]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordSeconds(0);
    const interval = setInterval(() => {
      setRecordSeconds(prev => prev + 1);
    }, 1000);
    setRecIntervalId(interval);
  };

  const stopRecording = () => {
    if (recIntervalId) {
      clearInterval(recIntervalId);
      setRecIntervalId(null);
    }
    setIsRecording(false);
    setAudioUrl("/uploads/simulated-audio-note.mp3");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video" | "audio") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(type);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("@rpf_token");
      const res = await fetch("/api/upload/image", { 
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token || ""}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (type === "image") setImageUrl(data.url);
        if (type === "video") setVideoUrl(data.url);
        if (type === "audio") setAudioUrl(data.url);
      } else {
        const errData = await res.json();
        alert(errData.error || (isHi ? "अपलोड विफल रहा" : "Upload failed"));
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert(isHi ? "फाइल अपलोड करते समय त्रुटि हुई" : "Error uploading file");
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async () => {
    if (!category || !title || !description || !location) return;
    setSubmitting(true);
    try {
      const generatedId = `GRV-${Math.floor(10000 + Math.random() * 90000)}`;
      await addGrievance({
        title,
        description,
        category,
        location,
        urgency: "Medium",
        citizenName: user?.name || "Citizen",
        audioUrl,
        videoUrl,
        imageUrl
      } as any);
      setTicketId(generatedId);
      setSubmitted(true);
      
      // Reset form fields
      setTitle("");
      setDescription("");
      setLocation("");
      setCategory("");
      setImageUrl("");
      setVideoUrl("");
      setAudioUrl("");
    } catch (err) {
      console.error("Error submitting grievance:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const GOV_GRIEVANCE_WEBSITES = [
    {
      id: "cpgrams",
      title: "CPGRAMS Public Grievance Portal",
      titleHi: "सीपीजीआरएएमएस लोक शिकायत पोर्टल",
      desc: "Centralized Public Grievance Redress & Monitoring System by Govt of India.",
      descHi: "भारत सरकार का केंद्रीय लोक शिकायत निवारण एवं निगरानी पोर्टल।",
      url: "https://pgportal.gov.in/",
      badge: "Official Central Gov"
    },
    {
      id: "cmhelpline",
      title: "MP CM Helpline 181 Portal",
      titleHi: "एम.पी. सीएम हेल्पलाइन 181",
      desc: "Madhya Pradesh state 24x7 citizen grievance redressal portal.",
      descHi: "मध्य प्रदेश राज्य 24x7 नागरिक शिकायत निवारण पोर्टल।",
      url: "https://cmhelpline.mp.gov.in/",
      badge: "MP State Govt"
    },
    {
      id: "consumer",
      title: "National Consumer Helpline",
      titleHi: "राष्ट्रीय उपभोक्ता हेल्पलाइन",
      desc: "Official portal for consumer complaints, disputes & grievance resolution.",
      descHi: "उपभोक्ता शिकायतों और विवादों के निवारण का आधिकारिक पोर्टल।",
      url: "https://consumerhelpline.gov.in/",
      badge: "Consumer Rights"
    },
    {
      id: "rti",
      title: "RTI Online Portal",
      titleHi: "आरटीआई ऑनलाइन पोर्टल",
      desc: "File Right to Information applications online directly to central ministries.",
      descHi: "केन्द्रीय मंत्रालयों में ऑनलाइन आरटीआई आवेदन दर्ज करें।",
      url: "https://rtionline.gov.in/",
      badge: "Right to Info"
    },
    {
      id: "nhrc",
      title: "National Human Rights Commission",
      titleHi: "राष्ट्रीय मानव अधिकार आयोग",
      desc: "Human rights violation complaint & grievance redressal portal.",
      descHi: "मानवाधिकार उल्लंघन शिकायत निवारण पोर्टल।",
      url: "https://nhrc.nic.in/",
      badge: "Human Rights"
    }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans selection:bg-orange-100 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700 pt-6 pb-6 px-5 relative overflow-hidden shrink-0 shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-sm border border-white/30 text-white">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-[.18em] text-orange-100 bg-white/15 px-2 py-0.5 rounded-full border border-white/20">
              Samahit Care
            </span>
            <h2 className="font-black text-xl text-white tracking-tight mt-1">
              {isHi ? "लोक शिकायत निवारण हब" : "Public Grievance Portal"}
            </h2>
            <p className="text-xs text-orange-100 font-medium">
              {isHi ? "स्थानीय शिकायत दर्ज करें या सरकारी शिकायत पोर्टल खोलें" : "File local complaints or access official Govt portals"}
            </p>
          </div>
        </div>
      </div>

      {/* Modern Tab Selection */}
      <div className="flex bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm overflow-x-auto scrollbar-hide">
        <button 
          onClick={() => setTab("file")}
          className={`flex-1 min-w-[120px] py-3 text-xs font-black transition border-b-2 uppercase tracking-wider ${
            tab === "file" ? "border-orange-500 text-orange-600 bg-orange-50/40" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {isHi ? "स्थानीय फ़ॉर्म (Local)" : "Local Complaint"}
        </button>

        <button 
          onClick={() => setTab("gov")}
          className={`flex-1 min-w-[120px] py-3 text-xs font-black transition border-b-2 uppercase tracking-wider ${
            tab === "gov" ? "border-[#000080] text-[#000080] bg-blue-50/40" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {isHi ? "सरकारी पोर्टल (Websites)" : "Govt Portals"}
        </button>

        <button 
          onClick={() => setTab("track")}
          className={`flex-1 min-w-[110px] py-3 text-xs font-black transition border-b-2 uppercase tracking-wider ${
            tab === "track" ? "border-emerald-600 text-emerald-700 bg-emerald-50/40" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {isHi ? `ट्रैक (${grievances.length})` : `Track (${grievances.length})`}
        </button>

        <button 
          onClick={() => setTab("community")}
          className={`flex-1 min-w-[110px] py-3 text-xs font-black transition border-b-2 uppercase tracking-wider ${
            tab === "community" ? "border-purple-600 text-purple-700 bg-purple-50/40" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {isHi ? "समुदाय" : "Community"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-28">
        {/* Tab 1: Local Complaint Form (Samahit & RPF Foundation) */}
        {tab === "file" && (
          <div className="space-y-4 animate-fadeIn">
            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl text-center space-y-3 shadow-sm">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-2 text-emerald-600">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-black text-emerald-900 text-lg">
                  {isHi ? "स्थानीय शिकायत दर्ज की गई" : "Local Grievance Submitted"}
                </h3>
                <p className="text-xs text-emerald-700 leading-relaxed max-w-[280px] mx-auto font-medium">
                  {isHi 
                    ? "आपकी शिकायत सफलतापूर्वक दर्ज कर ली गई है। RP Foundation टीम एवं संबंधित अधिकारियों द्वारा त्वरित कार्यवाही की जाएगी।"
                    : "Your local grievance has been recorded successfully. The RP Foundation field team & officials will process it."}
                </p>
                <div className="bg-emerald-100 text-emerald-800 font-mono text-xs font-bold py-1.5 px-3 rounded-full inline-block mt-2">
                  Ticket: {ticketId}
                </div>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-xs font-bold text-slate-500 block mx-auto underline"
                >
                  {isHi ? "एक और शिकायत दर्ज करें" : "File another local complaint"}
                </button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[9px] font-black uppercase tracking-[.18em] text-orange-600">Option 1: In-App Direct Submission</span>
                  <h3 className="text-base font-black text-slate-900">{isHi ? "स्थानीय नागरिक शिकायत फ़ॉर्म" : "Local Citizen Grievance Form"}</h3>
                  <p className="text-xs text-slate-500 font-medium">Report issues directly to RP Foundation & local ward representatives.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2">
                    {isHi ? "श्रेणी (Category)" : "Category"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "Civic Infrastructure", en: "Infrastructure", hi: "बुनियादी ढांचा" },
                      { id: "Health Services", en: "Health Care", hi: "स्वास्थ्य सेवा" },
                      { id: "Education", en: "Education", hi: "शिक्षा" },
                      { id: "Water & Sanitation", en: "Water & Waste", hi: "जल एवं अपशिष्ट" },
                      { id: "Electricity", en: "Electricity", hi: "बिजली" },
                      { id: "Other", en: "Other", hi: "अन्य" }
                    ].map(cat => (
                      <button 
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold text-left border transition ${
                          category === cat.id 
                            ? "border-orange-500 bg-orange-50 text-orange-700 font-black shadow-sm" 
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {isHi ? cat.hi : cat.en}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    {isHi ? "विषय / शीर्षक" : "Subject / Title"}
                  </label>
                  <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={isHi ? "समस्या का संक्षिप्त विवरण..." : "Short summary of the issue..."} 
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    {isHi ? "विवरण" : "Detailed Description"}
                  </label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={isHi ? "समस्या के बारे में विस्तार से लिखें..." : "Describe the issue in detail..."} 
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs font-medium min-h-[90px] focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    {isHi ? "स्थान (Location)" : "Location"}
                  </label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={isHi ? "पता, वार्ड नंबर या लैंडमार्क..." : "Address, Ward No. or Landmark"} 
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                  />
                </div>

                {/* Media Evidence */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider">
                    {isHi ? "मीडिया साक्ष्य (Attachments)" : "Attach Media Evidence"}
                  </label>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="relative">
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "image")} id="image-file-input" className="hidden" />
                      <label htmlFor="image-file-input" className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed cursor-pointer text-center h-20 transition ${imageUrl ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"}`}>
                        {uploading === "image" ? <Loader2 className="w-5 h-5 text-orange-500 animate-spin" /> : imageUrl ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <Camera className="w-5 h-5 text-slate-400" />}
                        <span className="text-[9px] text-slate-600 font-bold mt-1">{imageUrl ? (isHi ? "फोटो संलग्न" : "Attached") : (isHi ? "फोटो जोड़ें" : "Add Image")}</span>
                      </label>
                    </div>

                    <div className="relative">
                      <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, "video")} id="video-file-input" className="hidden" />
                      <label htmlFor="video-file-input" className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed cursor-pointer text-center h-20 transition ${videoUrl ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"}`}>
                        {uploading === "video" ? <Loader2 className="w-5 h-5 text-orange-500 animate-spin" /> : videoUrl ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <Video className="w-5 h-5 text-slate-400" />}
                        <span className="text-[9px] text-slate-600 font-bold mt-1">{videoUrl ? (isHi ? "वीडियो संलग्न" : "Attached") : (isHi ? "वीडियो जोड़ें" : "Add Video")}</span>
                      </label>
                    </div>

                    <div className="relative">
                      <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, "audio")} id="audio-file-input" className="hidden" />
                      <label htmlFor="audio-file-input" className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed cursor-pointer text-center h-20 transition ${audioUrl ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"}`}>
                        {uploading === "audio" ? <Loader2 className="w-5 h-5 text-orange-500 animate-spin" /> : audioUrl ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <Mic className="w-5 h-5 text-slate-400" />}
                        <span className="text-[9px] text-slate-600 font-bold mt-1">{audioUrl ? (isHi ? "ऑडियो संलग्न" : "Attached") : (isHi ? "ऑडियो जोड़ें" : "Add Audio")}</span>
                      </label>
                    </div>
                  </div>

                  {/* Voice Recorder */}
                  <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-slate-400"}`} />
                      <span className="text-xs font-bold text-slate-700 font-mono">
                        {isRecording ? `Recording... 0:${recordSeconds.toString().padStart(2, "0")}` : (isHi ? "आवाज शिकायत रिकॉर्डर" : "Voice Recorder")}
                      </span>
                    </div>
                    {isRecording ? (
                      <button type="button" onClick={stopRecording} className="bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition">
                        <Square className="w-4 h-4 fill-white" />
                      </button>
                    ) : (
                      <button type="button" onClick={startRecording} className="bg-orange-500 text-white rounded-full p-2 hover:bg-orange-600 transition">
                        <Mic className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {audioUrl && (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-orange-600 shrink-0" />
                      <audio src={audioUrl} controls className="flex-1 h-8 text-xs focus:outline-none" />
                    </div>
                  )}
                </div>

                <button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={!category || !title || !description || !location || submitting}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold py-3.5 rounded-2xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isHi ? "स्थानीय शिकायत सबमिट करें" : "Submit Local Grievance"}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Official Government Public Grievance Portals (Websites Option) */}
        {tab === "gov" && (
          <div className="space-y-3.5 animate-fadeIn">
            <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-3xl space-y-1 mb-4">
              <span className="text-[9px] font-black uppercase tracking-[.18em] text-[#000080]">Option 2: Official Government Web Portals</span>
              <h3 className="text-sm font-black text-slate-900">{isHi ? "सरकारी लोक शिकायत पोर्टल" : "Official Public Grievance Portals"}</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {isHi 
                  ? "केंद्रीय एवं राज्य सरकार के आधिकारिक जन-शिकायत निवारण पोर्टल। क्लिक करके सीधे सुरक्षित रूप से खोलें।"
                  : "Launch official Union & State government public grievance redress portals securely inside Samahit."}
              </p>
            </div>

            {GOV_GRIEVANCE_WEBSITES.map((site) => (
              <button
                key={site.id}
                type="button"
                onClick={() => openExternalLink(site.url, navigate, site.title)}
                className="w-full bg-white rounded-3xl p-4 flex items-center gap-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition text-left active:scale-[.99]"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#000080] border border-blue-100 flex items-center justify-center shrink-0 shadow-inner">
                  <Building2 className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-slate-900 leading-snug truncate">
                      {isHi ? site.titleHi : site.title}
                    </h4>
                    <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#000080] border border-blue-100">
                      {site.badge}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-2">
                    {isHi ? site.descHi : site.desc}
                  </p>
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Tab 3: Track Submitted Grievances */}
        {tab === "track" && (
          <div className="space-y-4 animate-fadeIn">
            {grievances.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs font-bold text-slate-400">
                {isHi ? "कोई पंजीकृत शिकायत नहीं मिली।" : "No registered grievances found."}
              </div>
            ) : (
              grievances.map(g => (
                <div key={g.id} className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                      ID: {g.id.slice(-6).toUpperCase()} • {g.createdAt ? new Date(g.createdAt).toLocaleDateString() : "Just now"}
                    </span>
                    <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      g.status === "Resolved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {g.status}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-black text-slate-900 text-sm leading-snug">{g.title}</h4>
                    <p className="text-[11px] text-slate-600 mt-1 font-medium">{g.description}</p>
                  </div>

                  {((g as any).imageUrl || (g as any).videoUrl || (g as any).audioUrl) && (
                    <div className="border-t border-slate-100 pt-2.5 space-y-2">
                      <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block">
                        {isHi ? "संलग्न साक्ष्य" : "Attached Evidence"}
                      </span>
                      
                      <div className="flex flex-col gap-2">
                        {(g as any).imageUrl && (
                          <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-32 bg-slate-50 flex items-center justify-center">
                            <img src={(g as any).imageUrl} alt="Grievance evidence" className="object-contain max-h-32 w-full" />
                          </div>
                        )}
                        {(g as any).videoUrl && (
                          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-black">
                            <video src={(g as any).videoUrl} controls className="w-full max-h-40" />
                          </div>
                        )}
                        {(g as any).audioUrl && (
                          <div className="bg-slate-50 rounded-2xl p-2 flex items-center gap-2 border border-slate-200">
                            <Volume2 className="w-4 h-4 text-slate-600 shrink-0" />
                            <audio src={(g as any).audioUrl} controls className="flex-1 h-7 text-xs focus:outline-none" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-[10px] font-bold text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
                    <span>{isHi ? `आवेदक: ${g.citizenName}` : `Reporter: ${g.citizenName}`}</span>
                    <span className="font-mono text-slate-500 uppercase">{g.category}</span>
                  </div>
                  
                  {g.status !== "Resolved" && (
                    <div className="bg-amber-50 rounded-2xl p-2.5 border border-amber-200 flex items-center gap-2 mt-2">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="text-[10px] font-bold text-amber-900 leading-snug">
                        {isHi 
                          ? "नगर पालिका विभाग को आवंटित। निवारण का अनुमानित समय: ४८ घंटे।" 
                          : "Assigned to Municipal Dept. Est resolution: 48hrs."}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Real Community Grievances ONLY (Fake mock comments completely removed!) */}
        {tab === "community" && (
          <div className="space-y-4 animate-fadeIn">
            {grievances.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-purple-400 mx-auto" />
                <p className="text-xs font-black text-slate-800">{isHi ? "कोई समुदाय शिकायत नहीं मिली" : "No community grievances registered yet"}</p>
                <p className="text-[11px] text-slate-500 font-medium">Real complaints submitted by citizens will appear here for public tracking.</p>
              </div>
            ) : (
              grievances.map((g) => (
                <div key={g.id} className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                        {g.citizenName || "Citizen"} • {g.createdAt ? new Date(g.createdAt).toLocaleDateString() : "Recently"}
                      </span>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-100">
                        {g.category || "General"}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm leading-snug">{g.title}</h4>
                      <p className="text-[11px] font-medium text-slate-600 mt-0.5">{g.description}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
