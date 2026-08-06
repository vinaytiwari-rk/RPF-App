import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, MapPin, Camera, CheckCircle, Clock, Loader2, 
  Video, Mic, Play, Square, Image as ImageIcon, Volume2, Trash2, Eye 
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useOutletContext } from "react-router-dom";

export default function Grievances() {
  const { grievances, addGrievance } = useApp();
  const { user } = useAuth();
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const isHi = lang === "hi";

  const [tab, setTab] = useState<"file" | "track">("file");
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
    // Simulate audio file creation
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

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn">
      {/* Header Area */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 pt-6 pb-6 px-5 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl text-white tracking-wide">
              {isHi ? "शिकायत निवारण पोर्टल" : "Grievance Portal"}
            </h2>
            <p className="text-xs text-orange-100 mt-0.5">
              {isHi ? "समस्या दर्ज करें और निवारण ट्रैक करें" : "Report issues & track resolution"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <button 
          onClick={() => setTab("file")}
          className={`flex-1 py-3 text-xs font-bold transition border-b-2 ${
            tab === "file" ? "border-orange-500 text-orange-700" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {isHi ? "शिकायत दर्ज करें" : "File Complaint"}
        </button>
        <button 
          onClick={() => setTab("track")}
          className={`flex-1 py-3 text-xs font-bold transition border-b-2 ${
            tab === "track" ? "border-orange-500 text-orange-700" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {isHi ? `स्थिति ट्रैक करें (${grievances.length})` : `Track Status (${grievances.length})`}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {tab === "file" && (
          <div className="space-y-4 animate-fadeIn">
            {submitted ? (
              <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center space-y-3 shadow-sm">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-display font-bold text-green-800 text-lg">
                  {isHi ? "शिकायत दर्ज की गई" : "Grievance Submitted"}
                </h3>
                <p className="text-xs text-green-700 leading-relaxed max-w-[250px] mx-auto">
                  {isHi 
                    ? "आपकी शिकायत सफलतापूर्वक दर्ज कर ली गई है और संबंधित विभाग को भेज दी गई है।"
                    : "Your complaint has been successfully registered and forwarded to the concerned department."}
                </p>
                <div className="bg-green-100 text-green-800 font-mono text-xs py-1.5 px-3 rounded-full inline-block mt-2">
                  Ticket: {ticketId}
                </div>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-xs font-bold text-slate-500 block mx-auto underline"
                >
                  {isHi ? "एक और शिकायत दर्ज करें" : "File another complaint"}
                </button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-650 uppercase tracking-wider mb-2">
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
                        onClick={() => setCategory(cat.id)}
                        className={`py-2.5 px-3 rounded-lg text-xs font-bold text-left border transition ${
                          category === cat.id 
                            ? "border-orange-500 bg-orange-55/40 text-orange-850" 
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {isHi ? cat.hi : cat.en}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-650 uppercase tracking-wider mb-1.5">
                    {isHi ? "विषय / शीर्षक" : "Subject / Title"}
                  </label>
                  <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={isHi ? "समस्या का संक्षिप्त विवरण..." : "Short summary of the issue..."} 
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-655 uppercase tracking-wider mb-1.5">
                    {isHi ? "विवरण" : "Detailed Description"}
                  </label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={isHi ? "समस्या के बारे में विस्तार से लिखें..." : "Describe the issue in detail..."} 
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm min-h-[90px] focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-650 uppercase tracking-wider mb-1.5">
                    {isHi ? "स्थान (Location)" : "Location"}
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder={isHi ? "पता या लैंडमार्क दर्ज करें..." : "Address or landmark"} 
                      className="flex-1 border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                    />
                    <button 
                      onClick={() => setLocation("Bhopal City Ward 15")}
                      className="bg-slate-100 border border-slate-300 px-3.5 rounded-lg hover:bg-slate-200 transition"
                      title={isHi ? "वर्तमान स्थान चुनें" : "Select current location"}
                    >
                      <MapPin className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* Media Attachment Hub */}
                <div className="space-y-3.5 pt-2 border-t border-slate-100">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    {isHi ? "मीडिया साक्ष्य संलग्न करें (Attachments)" : "Attach Media Evidence"}
                  </label>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Image Attachment */}
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, "image")}
                        id="image-file-input" 
                        className="hidden" 
                      />
                      <label 
                        htmlFor="image-file-input" 
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed cursor-pointer text-center h-20 transition ${
                          imageUrl ? "border-green-500 bg-green-50/50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        {uploading === "image" ? (
                          <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                        ) : imageUrl ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-600 mb-1" />
                            <span className="text-[9px] text-green-700 font-bold truncate w-full">{isHi ? "फोटो संलग्न" : "Image Attached"}</span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-5 h-5 text-slate-400 mb-1" />
                            <span className="text-[9px] text-slate-600 font-bold">{isHi ? "फोटो जोड़ें" : "Add Image"}</span>
                          </>
                        )}
                      </label>
                      {imageUrl && (
                        <button 
                          onClick={() => setImageUrl("")}
                          className="absolute -top-1.5 -right-1.5 bg-red-100 text-red-700 rounded-full p-1 border border-red-200"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>

                    {/* Video Attachment */}
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="video/*" 
                        onChange={(e) => handleFileUpload(e, "video")}
                        id="video-file-input" 
                        className="hidden" 
                      />
                      <label 
                        htmlFor="video-file-input" 
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed cursor-pointer text-center h-20 transition ${
                          videoUrl ? "border-green-500 bg-green-50/50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        {uploading === "video" ? (
                          <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                        ) : videoUrl ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-600 mb-1" />
                            <span className="text-[9px] text-green-700 font-bold truncate w-full">{isHi ? "वीडियो संलग्न" : "Video Attached"}</span>
                          </>
                        ) : (
                          <>
                            <Video className="w-5 h-5 text-slate-400 mb-1" />
                            <span className="text-[9px] text-slate-600 font-bold">{isHi ? "वीडियो जोड़ें" : "Add Video"}</span>
                          </>
                        )}
                      </label>
                      {videoUrl && (
                        <button 
                          onClick={() => setVideoUrl("")}
                          className="absolute -top-1.5 -right-1.5 bg-red-100 text-red-700 rounded-full p-1 border border-red-200"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>

                    {/* Audio Attachment */}
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="audio/*" 
                        onChange={(e) => handleFileUpload(e, "audio")}
                        id="audio-file-input" 
                        className="hidden" 
                      />
                      <label 
                        htmlFor="audio-file-input" 
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed cursor-pointer text-center h-20 transition ${
                          audioUrl ? "border-green-500 bg-green-50/50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        {uploading === "audio" ? (
                          <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                        ) : audioUrl ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-600 mb-1" />
                            <span className="text-[9px] text-green-700 font-bold truncate w-full">{isHi ? "ऑडियो संलग्न" : "Audio Attached"}</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-5 h-5 text-slate-400 mb-1" />
                            <span className="text-[9px] text-slate-600 font-bold">{isHi ? "ऑडियो जोड़ें" : "Add Audio"}</span>
                          </>
                        )}
                      </label>
                      {audioUrl && (
                        <button 
                          onClick={() => setAudioUrl("")}
                          className="absolute -top-1.5 -right-1.5 bg-red-100 text-red-700 rounded-full p-1 border border-red-200"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Audio Recording Simulation Panel */}
                  <div className="bg-slate-100 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-slate-450"}`}></div>
                      <span className="text-xs font-bold text-slate-700 font-mono">
                        {isRecording ? `Recording... 0:${recordSeconds.toString().padStart(2, "0")}` : (isHi ? "आवाज शिकायत रिकॉर्डर" : "Voice Complaint Recorder")}
                      </span>
                    </div>

                    {isRecording ? (
                      <button 
                        onClick={stopRecording} 
                        className="bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition"
                      >
                        <Square className="w-4.5 h-4.5 fill-white" />
                      </button>
                    ) : (
                      <button 
                        onClick={startRecording}
                        className="bg-orange-500 text-white rounded-full p-2 hover:bg-orange-600 transition"
                      >
                        <Mic className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </div>

                  {/* Audio Preview if attached */}
                  {audioUrl && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-orange-600" />
                      <audio src={audioUrl} controls className="flex-1 h-8 text-xs focus:outline-none" />
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={!category || !title || !description || !location || submitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isHi ? "शिकायत सबमिट करें" : "Submit Grievance"}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "track" && (
          <div className="space-y-4 animate-fadeIn">
            {grievances.length === 0 ? (
              <div className="text-center text-xs text-slate-400 p-8">
                {isHi ? "कोई पंजीकृत शिकायत नहीं मिली।" : "No registered grievances found."}
              </div>
            ) : (
              grievances.map(g => (
                <div key={g.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      ID: {g.id.slice(-6).toUpperCase()} • {g.createdAt ? new Date(g.createdAt).toLocaleDateString() : "Just now"}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      g.status === "Resolved" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {g.status}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-display font-bold text-slate-900 text-sm leading-snug">{g.title}</h4>
                    <p className="text-[11px] text-slate-600 mt-1">{g.description}</p>
                  </div>

                  {/* Attached Media Previews in Tracking Card */}
                  {((g as any).imageUrl || (g as any).videoUrl || (g as any).audioUrl) && (
                    <div className="border-t border-slate-100 pt-2.5 space-y-2">
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest block">
                        {isHi ? "संलग्न साक्ष्य (Attached Evidence)" : "Attached Evidence"}
                      </span>
                      
                      <div className="flex flex-col gap-2">
                        {/* Image Preview */}
                        {(g as any).imageUrl && (
                          <div className="relative rounded-lg overflow-hidden border border-slate-200 max-h-32 bg-slate-50 flex items-center justify-center">
                            <img 
                              src={(g as any).imageUrl} 
                              alt="Grievance evidence" 
                              className="object-contain max-h-32 w-full" 
                            />
                          </div>
                        )}

                        {/* Video Player */}
                        {(g as any).videoUrl && (
                          <div className="rounded-lg overflow-hidden border border-slate-200 bg-black">
                            <video src={(g as any).videoUrl} controls className="w-full max-h-40" />
                          </div>
                        )}

                        {/* Audio Note Player */}
                        {(g as any).audioUrl && (
                          <div className="bg-slate-55 rounded-lg p-2 flex items-center gap-2 border border-slate-200">
                            <Volume2 className="w-4 h-4 text-slate-600" />
                            <audio src={(g as any).audioUrl} controls className="flex-1 h-7 text-xs focus:outline-none" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
                    <span>{isHi ? `आवेदक: ${g.citizenName}` : `Reporter: ${g.citizenName}`}</span>
                    <span className="font-mono text-slate-450 uppercase">{g.category}</span>
                  </div>
                  
                  {g.status !== "Resolved" && (
                    <div className="bg-amber-50/50 rounded-lg p-2.5 border border-amber-100/50 flex items-center gap-2 mt-2">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-[9.5px] font-bold text-slate-700 leading-snug">
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
      </div>
    </div>
  );
}
