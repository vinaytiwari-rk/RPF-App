import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Heart, Activity, ShieldAlert, Plus, CheckCircle, Navigation, Award, Calendar, MapPin } from "lucide-react";

export default function HealthCamps() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const [success, setSuccess] = useState(false);
  const [assistanceSubmitted, setAssistanceSubmitted] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"camps" | "assistance">("camps");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleAssistance = (e: React.FormEvent) => {
    e.preventDefault();
    setAssistanceSubmitted(true);
    setTimeout(() => setAssistanceSubmitted(false), 4000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn">
      {/* Header Area */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-650 pt-6 pb-6 px-5 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl text-white tracking-wide">
              {lang === "hi" ? "स्वास्थ्य शिविर व सेवाएं" : "Health Services Hub"}
            </h2>
            <p className="text-xs text-blue-100 mt-0.5">
              {lang === "hi" ? "निशुल्क जांच शिविर व चिकित्सा सहायता" : "Free medical camps & financial treatments assistance"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <button 
          onClick={() => setSelectedTab("camps")}
          className={`flex-1 py-3 text-xs font-bold transition border-b-2 ${
            selectedTab === "camps" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {lang === "hi" ? "स्वास्थ्य शिविर" : "Diagnostic Camps"}
        </button>
        <button 
          onClick={() => setSelectedTab("assistance")}
          className={`flex-1 py-3 text-xs font-bold transition border-b-2 ${
            selectedTab === "assistance" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {lang === "hi" ? "चिकित्सा सहायता" : "Medical Aid"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {selectedTab === "camps" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Camp listing */}
            <div className="glass-card bg-white/95 p-4 border-gold-soft shadow-gold-premium space-y-3">
              <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                <div>
                  <h4 className="font-display font-bold text-sm text-[#0B1E3F]">
                    {lang === "hi" ? "निशुल्क हृदय एवं नेत्र जांच शिविर" : "Free Heart & Eye Diagnostic Camp"}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Sehore Block</p>
                </div>
                <span className="text-[8px] font-bold text-blue-700 bg-blue-100/50 border border-blue-200 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === "hi"
                  ? "पीपुल्स हॉस्पिटल के विशेषज्ञ डॉक्टरों द्वारा निशुल्क हृदय स्वास्थ्य, ईसीजी, मधुमेह और नेत्र दृष्टि की जांच की जाएगी।"
                  : "Free consultation, ECG, diabetes, and vision checkups by specialist doctors from People's Hospital."}
              </p>
              <div className="flex flex-col gap-1.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {lang === "hi" ? "आगामी रविवार, सुबह 9:00 बजे" : "Next Sunday, 9:00 AM"}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {lang === "hi" ? "सामुदायिक स्वास्थ्य केंद्र, सीहोर" : "Community Health Center, Sehore"}</span>
              </div>

              {success ? (
                <div className="bg-green-50 text-green-700 border border-green-150 p-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 justify-center">
                  <CheckCircle className="w-4.5 h-4.5" />
                  <span>{lang === "hi" ? "पंजीकरण सफलतापूर्वक पूर्ण हुआ!" : "Successfully Registered for Camp!"}</span>
                </div>
              ) : (
                <button 
                  onClick={() => setSuccess(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-xs shadow-md transition"
                >
                  {lang === "hi" ? "शिविर में शामिल होने के लिए रजिस्टर करें" : "Register Free For Diagnostic Camp"}
                </button>
              )}
            </div>
          </div>
        )}

        {selectedTab === "assistance" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="glass-card bg-white/95 p-5 border-gold-soft shadow-gold-premium space-y-4">
              <h4 className="font-display font-bold text-xs text-chakra-navy uppercase tracking-widest border-b border-slate-100 pb-2">
                {lang === "hi" ? "चिकित्सा उपचार वित्तीय सहायता आवेदन" : "Apply for Treatment Financial Aid"}
              </h4>

              {assistanceSubmitted ? (
                <div className="bg-green-50 text-green-700 border border-green-150 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-bold text-green-800">{lang === "hi" ? "आवेदन सबमिट हुआ!" : "Application Received!"}</p>
                    <p className="text-[10px] text-green-600 font-normal mt-0.5">
                      {lang === "hi" ? "हमारी टीम समीक्षा के लिए जल्द ही आपसे संपर्क करेगी।" : "Our review board will contact you shortly after checking documents."}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAssistance} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                      {lang === "hi" ? "मरीज़ का नाम" : "Patient's Full Name"}
                    </label>
                    <input type="text" required placeholder="e.g. Ramesh Kumar" className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-500 font-bold" />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                      {lang === "hi" ? "अस्पताल का नाम व बीमारी" : "Hospital Name & Diagnosis"}
                    </label>
                    <input type="text" required placeholder="e.g. District General, Heart surgery" className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-500 font-bold" />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                      {lang === "hi" ? "आवश्यक अनुमानित सहायता राशि (₹)" : "Estimated Amount Required (₹)"}
                    </label>
                    <input type="number" required placeholder="e.g. 50000" className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-500 font-bold" />
                  </div>

                  <button type="submit" className="w-full bg-[#000080] text-white font-bold py-3 rounded-lg text-xs shadow-md hover:bg-blue-950 transition">
                    {lang === "hi" ? "सहायता आवेदन सबमिट करें" : "Submit Financial Aid Request"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
