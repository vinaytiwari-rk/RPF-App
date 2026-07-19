import React, { useState } from "react";
import { AlertTriangle, MapPin, Camera, CheckCircle, Clock, Loader2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

export default function Grievances() {
  const { grievances, addGrievance } = useApp();
  const { user } = useAuth();

  const [tab, setTab] = useState<"file" | "track">("file");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!category || !title || !description || !location) return;
    setSubmitting(true);
    try {
      const generatedId = `GRV-${Math.floor(10000 + Math.random() * 90000)}`;
      await addGrievance({
        title,
        description,
        category,
        urgency: "Medium",
        citizenName: user?.name || "Citizen",
      });
      setTicketId(generatedId);
      setSubmitted(true);
      setTitle("");
      setDescription("");
      setLocation("");
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
            <h2 className="font-display font-extrabold text-xl text-white tracking-wide">Grievance Portal</h2>
            <p className="text-xs text-orange-100 mt-0.5">Report issues & track resolution</p>
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
          File Complaint
        </button>
        <button 
          onClick={() => setTab("track")}
          className={`flex-1 py-3 text-xs font-bold transition border-b-2 ${
            tab === "track" ? "border-orange-500 text-orange-700" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Track Status ({grievances.length})
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
                <h3 className="font-display font-bold text-green-800 text-lg">Grievance Submitted</h3>
                <p className="text-xs text-green-700 leading-relaxed max-w-[250px] mx-auto">
                  Your complaint has been successfully registered and forwarded to the concerned department.
                </p>
                <div className="bg-green-100 text-green-800 font-mono text-xs py-1.5 px-3 rounded-full inline-block mt-2">
                  Ticket Registered in Firestore
                </div>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-xs font-bold text-slate-500 block mx-auto underline"
                >
                  File another complaint
                </button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-2">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Civic Infrastructure", "Health Services", "Education", "Water & Sanitation", "Electricity", "Other"].map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`py-2 px-3 rounded-lg text-xs font-bold text-left border transition ${
                          category === cat 
                            ? "border-orange-500 bg-orange-50 text-orange-800" 
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Subject / Title</label>
                  <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Short summary of the issue..." 
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue in detail..." 
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Location</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Address or landmark" 
                      className="flex-1 border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                    />
                    <button className="bg-slate-100 border border-slate-300 p-3 rounded-lg hover:bg-slate-200 transition">
                      <MapPin className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition">
                  <Camera className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-[11px] font-bold text-slate-600">Attach Photo (Optional)</span>
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={!category || !title || !description || !location || submitting}
                  className="w-full bg-[#FF9933] text-white font-bold py-3.5 rounded-lg shadow-md hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Submit Grievance</span>
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "track" && (
          <div className="space-y-4 animate-fadeIn">
            {grievances.length === 0 ? (
              <div className="text-center text-xs text-slate-400 p-8">No registered grievances found in Firestore.</div>
            ) : (
              grievances.map(g => (
                <div key={g.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      ID: {g.id.slice(-6).toUpperCase()} • {g.createdAt ? new Date(g.createdAt).toLocaleDateString() : "Just now"}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                      g.status === "Resolved" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {g.status}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-slate-800 text-sm">{g.title}</h4>
                  <p className="text-[11px] text-slate-650 mt-1">{g.description}</p>
                  <div className="text-[10px] text-slate-450 mt-1.5">Reporter: {g.citizenName}</div>
                  
                  {g.status !== "Resolved" && (
                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] font-bold text-slate-600">Assigned to Municipal Dept. Est resolution: 48hrs</span>
                      </div>
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
