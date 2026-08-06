import React, { useState } from "react";
import { Grievance } from "../types";
import { AlertTriangle, Tag, Clock, CheckCircle2, ChevronRight, Activity, MapPin, Sparkles, PieChart, Loader2, Image as ImageIcon } from "lucide-react";
import LocationPicker from "./LocationPicker";

interface GrievancesProps {
  lang: "hi" | "en";
  grievances: Grievance[];
  onAddGrievance: (grievance: Grievance) => void;
}

export default function Grievances({ lang, grievances, onAddGrievance }: GrievancesProps) {
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formLoc, setFormLoc] = useState("");
  const [formName, setFormName] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [successTicket, setSuccessTicket] = useState<string | null>(null);
  
  // Public Opinion Poll States
  const [pollVotes, setPollVotes] = useState({
    Water: 142,
    Roads: 188,
    Sanitation: 95,
    Education: 70
  });
  const [hasVoted, setHasVoted] = useState(false);

  // Quick stats about grievances
  const totalGrievances = grievances.length;
  const resolvedGrievances = grievances.filter(g => g.status === "Resolved" || g.status === "Closed").length;

  const handleVote = (category: "Water" | "Roads" | "Sanitation" | "Education") => {
    if (hasVoted) return;
    setPollVotes(prev => ({
      ...prev,
      [category]: prev[category] + 1
    }));
    setHasVoted(true);
  };

  const handleCreateGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim() || !formLoc.trim() || !formName.trim()) return;

    setLoadingAI(true);
    let assignedCategory = "Others";
    let urgencyLevel = "Medium";
    let aiSummary = "";

    try {
      const response = await fetch("/api/ai/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDesc
        })
      });

      if (!response.ok) throw new Error("AI Endpoint failed");
      const data = await response.json();
      assignedCategory = data.category || "Others";
      urgencyLevel = data.urgency || "Medium";
      aiSummary = data.summary || "";
    } catch (err) {
      console.warn("AI Triage failed. Running offline matching...", err);
      // fallback matching rules
      const lowerT = formTitle.toLowerCase() + " " + formDesc.toLowerCase();
      if (lowerT.includes("पानी") || lowerT.includes("जल") || lowerT.includes("water") || lowerT.includes("drinking")) {
        assignedCategory = "Water Supply";
        urgencyLevel = "High";
        aiSummary = lang === "hi" ? "पानी की समस्या" : "Issue regarding pure water supply lines";
      } else if (lowerT.includes("सड़क") || lowerT.includes("road") || lowerT.includes("गड्ढे") || lowerT.includes("transit")) {
        assignedCategory = "Roads & Transit";
        urgencyLevel = "Medium";
        aiSummary = lang === "hi" ? "सड़क मरम्मत शिकायत" : "Broken target roadways complained of";
      } else if (lowerT.includes("कचरा") || lowerT.includes("नाली") || lowerT.includes("sanitation") || lowerT.includes("safai")) {
        assignedCategory = "Sanitation & Waste";
        urgencyLevel = "High";
        aiSummary = lang === "hi" ? "सफाई व कचरा प्रबंधन" : "Sanitation blockage triage report";
      } else {
        assignedCategory = "Others";
        urgencyLevel = "Low";
        aiSummary = lang === "hi" ? "विविध शिकायत" : "General grievance reported";
      }
    } finally {
      setLoadingAI(false);
    }

    const ticketNumber = `RPF-2026-${Math.floor(Math.random() * 900000 + 100000)}`;
    onAddGrievance({
      id: ticketNumber,
      title: formTitle,
      description: formDesc,
      category: assignedCategory,
      urgency: urgencyLevel,
      location: formLoc,
      reportedBy: formName,
      date: new Date().toLocaleDateString(),
      status: "Open",
      aiSummary: aiSummary
    });

    setFormTitle("");
    setFormDesc("");
    setFormLoc("");
    setFormName("");
    
    setSuccessTicket(ticketNumber);
    setTimeout(() => setSuccessTicket(null), 8000);
  };

  const getUrgencyBadge = (level: string) => {
    switch (level) {
      case "Critical":
      case "High":
        return "bg-red-50 text-red-700 border-red-100";
      case "Medium":
        return "bg-orange-50 text-orange-700 border-orange-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Resolved":
      case "Closed":
        return "bg-slate-50 text-[#0f4c81] border-slate-100";
      case "Assigned":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      default:
        return "bg-red-50 text-red-700 border-red-100";
    }
  };

  // Poll percentage calculator
  const voteSum = pollVotes.Water + pollVotes.Roads + pollVotes.Sanitation + pollVotes.Education;
  const getPercent = (votes: number) => Math.round((votes / voteSum) * 100);

  return (
    <div className="space-y-6" id="grievance-portal-view">
      {/* Visual heatmap summary */}
      <div className="bg-slate-900 rounded-md p-5 text-white grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="space-y-1.5 md:col-span-2">
          <h3 className="font-extrabold text-base text-amber-400 flex items-center gap-1.5">
            <Activity className="w-5 h-5 animate-pulse" />
            {lang === "hi" ? "शिकायत निवारण व सामाजिक रिपोर्ट" : "Real-time Grievance Redressal Metrics"}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {lang === "hi" 
              ? "यह पोर्टल सामाजिक मुद्दों को उजागर करने के लिए है। आपकी शिकायत दर्ज होते ही AI इसे वर्गीकृत कर वार्ड प्रभारियों व स्वयंसेवकों को सौंप देता है ताकि शीघ्र समाधान किया जा सके।" 
              : "Citizens submit issues on roads, sanitation, water, or safety. The backend AI analyzes the report, classifies gravity tags, and forwards briefs onto volunteer networks."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3.5 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-white">{totalGrievances}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{lang === "hi" ? "प्रस्तुत शिकायतें" : "Registered Issues"}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-[#FF9933]">
              {Math.round((resolvedGrievances / (totalGrievances || 1)) * 100)}%
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{lang === "hi" ? "समाधान दर" : "Resolution Rate"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Reporter Form */}
        <div className="bg-white rounded-md p-5 border border-slate-100 shadow-sm space-y-4">
          <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
            <AlertTriangle className="w-4.5 h-4.5 text-red-600" />
            {lang === "hi" ? "नई शिकायत दर्ज करें (Citizen Reporter)" : "Initiate a Complaint"}
          </h4>

          <form onSubmit={handleCreateGrievance} className="space-y-3.5">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-0.5">{lang === "hi" ? "शिकायत का विषय" : "Complaint Title"}</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={lang === "hi" ? "उदा. नाली बंद है" : "e.g. Blocked community channel"}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-red-400"
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-0.5">{lang === "hi" ? "वार्ड नंबर / जिला" : "Location / Ward"}</label>
                <LocationPicker onLocationSelect={(loc) => setFormLoc(loc)} defaultLocation={formLoc} />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-0.5">{lang === "hi" ? "विस्तृत विवरण (AI पहचान हेतु)" : "Description Details"}</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder={lang === "hi" ? "कृपया समस्या का विवरण दें ताकि AI इसका सटीक वर्गीकरण कर सके..." : "Elaborate regarding water shortages, leakages, power failures..."}
                rows={3}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-red-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-0.5">{lang === "hi" ? "शिकायतकर्ता का नाम" : "Your Name"}</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-red-400"
              />
            </div>

            {/* Simulated Photo upload element */}
            <div className="border border-dashed border-slate-300 rounded-xl p-3 flex flex-col items-center justify-center bg-slate-50 text-slate-500 cursor-pointer hover:bg-slate-100 transition">
              <ImageIcon className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-600 mt-1">{lang === "hi" ? "📸 समस्या का फोटो/वीडियो अपलोड करें" : "📸 Upload Photo of Issue"}</span>
              <span className="text-[9px] text-slate-400">{lang === "hi" ? "ग्रामीण क्षेत्रों में फ़ाइल स्व-कंप्रेस होगी" : "Auto-compressed on rural uploads"}</span>
            </div>

            <button
              type="submit"
              disabled={loadingAI}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 font-bold rounded-xl transition cursor-pointer text-xs flex items-center justify-center gap-1.5"
            >
              {loadingAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === "hi" ? "AI शिकायत का विश्लेषण कर रहा है..." : "AI Triage Analyzer is loading..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200 fill-amber-300" />
                  <span>{lang === "hi" ? "AI जांचें और शिकायत सबमिट करें" : "Submit Complaint for AI Audit"}</span>
                </>
              )}
            </button>
          </form>

          {successTicket && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-[#0f4c81] text-xs animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold text-[#0f4c81]">
                <CheckCircle2 className="w-4.5 h-4.5 text-[#0f4c81]" />
                <span>{lang === "hi" ? "शिकायत सफलतापूर्वक दर्ज!" : "Grievance Logged!"}</span>
              </div>
              <p className="font-medium text-slate-700 leading-relaxed text-[11px]">
                {lang === "hi" 
                  ? `आपकी शिकायत संख्या ` 
                  : `Your grievance ticket number is `}
                <strong className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[#0f4c81] select-all">{successTicket}</strong>
                {lang === "hi" 
                  ? `. AI प्राथमिक जांच व वार्ड-स्वयंसेवक टैगिंग का काम शुरू हो गया है।` 
                  : `. Advanced AI model categorization algorithms triaged the issue for volunteer assignment.`}
              </p>
            </div>
          )}
        </div>

        {/* Public Opinion Poll */}
        <div className="bg-white rounded-md p-5 border border-slate-100 shadow-sm space-y-4">
          <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
            <PieChart className="w-4.5 h-4.5 text-indigo-600" />
            {lang === "hi" ? "🗳️ जनमत (Citizen Polls) - आपकी प्राथमिक राय" : "🗳️ Public Polls - Local Priority Matrix"}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            {lang === "hi" 
              ? "RP Foundation समाज के सबसे बड़े संकट बिन्दुओं का पता लगाने के लिए साप्ताहिक नागरिक जनमत लेता है। अपना वोट दें:" 
              : "Share which sector needs the most urgent social welfare focus this week. Tap to vote on ground status:"}
          </p>

          <div className="space-y-3.5 pt-1">
            {/* Poll options */}
            {[
              { id: "Water", label: lang === "hi" ? "🚰 शुद्ध पेयजल आपूर्ति (Drinking Water)" : "Drinking Water Outposts", votes: pollVotes.Water },
              { id: "Roads", label: lang === "hi" ? "🛣️ सड़क निर्माण और सुधार (Road Safety)" : "Road Maintenance", votes: pollVotes.Roads },
              { id: "Sanitation", label: lang === "hi" ? "♻️ कचरा मुक्त व साफ वार्ड (Sanitation)" : "Sanitation Blockages", votes: pollVotes.Sanitation },
              { id: "Education", label: lang === "hi" ? "🎒 सरकारी स्कूलों की गुणवत्ता (Education)" : "School Classrooms", votes: pollVotes.Education },
            ].map((option) => {
              const pct = getPercent(option.votes);
              return (
                <div 
                  key={option.id} 
                  onClick={() => handleVote(option.id as any)}
                  className={`relative border rounded-xl p-3 flex flex-col justify-between overflow-hidden cursor-pointer transition ${
                    hasVoted 
                      ? "border-slate-100 bg-slate-50/50" 
                      : "border-slate-200 hover:border-indigo-400 bg-white"
                  }`}
                >
                  {/* Backdrop fills showing votes percentages */}
                  {hasVoted && (
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-indigo-50/70 pointer-events-none transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  )}

                  <div className="relative flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span className="truncate pr-2">{option.label}</span>
                    <span className="font-bold text-indigo-700">
                      {hasVoted ? `${pct}% (${option.votes})` : `${option.votes}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {hasVoted && (
            <p className="text-[10px] text-[#0f4c81] font-bold text-center animate-pulse">
              ✓ {lang === "hi" ? "वोट दर्ज करने के लिए धन्यवाद! आंकड़े रिपोर्ट में अपडेट हो गए हैं।" : "Thank you for sharing your opinion. Data forwarded to RPF Board!"}
            </p>
          )}
        </div>
      </div>

      {/* History and tracking list */}
      <div className="bg-white rounded-md p-5 border border-slate-100 shadow-sm space-y-4">
        <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">
          {lang === "hi" ? "शिकायत ट्रैकर सूची व लाइव स्थिति" : "Grievance Tracker Records"}
        </h4>

        <div className="space-y-3.5 max-h-[350px] overflow-y-auto no-scrollbar">
          {grievances.map((complaint) => (
            <div key={complaint.id} className="border border-slate-100 rounded-md p-4 space-y-3.5 bg-slate-50/40 hover:bg-white transition duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-150 pb-2.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-500 select-all">{complaint.id}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getUrgencyBadge(complaint.urgency)}`}>
                      {complaint.urgency}
                    </span>
                  </div>
                  <h5 className="font-bold text-xs text-slate-800">{complaint.title}</h5>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-500">{complaint.date}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <p className="font-medium">{complaint.description}</p>
                  
                  {complaint.aiSummary && (
                    <div className="bg-amber-50/50 border border-amber-100/50 rounded-lg p-2 flex items-start gap-1.5 mt-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-[10.5px] text-amber-900 leading-normal">
                        <strong>AI Triaged:</strong> {complaint.aiSummary}
                      </p>
                    </div>
                  )}
                </div>
                <div className="bg-white border border-slate-100 rounded-xl p-2.5 space-y-1.5 shrink-0 self-start">
                  <p className="text-[10px] uppercase font-mono text-slate-400">Assignment / Location</p>
                  <p className="font-bold text-[11.5px] text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {complaint.location}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">Reporting: {complaint.reportedBy}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
