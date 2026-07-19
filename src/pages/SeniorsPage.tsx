import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Phone, Heart, Users, Clock, ShieldAlert, CheckCircle } from "lucide-react";

export default function SeniorsPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const [success, setSuccess] = useState(false);
  const [service, setService] = useState("Companion");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="p-5 space-y-5 animate-fadeIn pb-24">
      {/* Overview Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-5 shadow-sm space-y-2">
        <h3 className="font-display font-extrabold text-base text-chakra-navy flex items-center gap-1.5">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          {lang === "hi" ? "वरिष्ठ नागरिक सेवा केंद्र" : "Senior Citizen Support Care"}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          {lang === "hi" 
            ? "हमारे आदरणीय बुजुर्गों के लिए विशेष सेवाएँ। आप घर बैठे चिकित्सा सहायता, भोजन वितरण, या बातचीत के लिए साथी स्वयंसेवक का अनुरोध कर सकते हैं।" 
            : "Specialized services dedicated to our respected elders. Request a volunteer companion, home health checks, or logistics aid directly at your doorstep."}
        </p>
      </div>

      {/* Services Options Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: "Companion", title: lang === "hi" ? "साथी स्वयंसेवक" : "Call Companion", desc: lang === "hi" ? "बातचीत व मदद हेतु" : "Someone to talk & assist", color: "bg-amber-500 text-white" },
          { key: "Aid", title: lang === "hi" ? "गृह सहायता" : "Doorstep Aid", desc: lang === "hi" ? "राशन व चिकित्सा आपूर्ति" : "Medical/Food delivery", color: "bg-green-600 text-white" }
        ].map(s => (
          <button 
            key={s.key}
            onClick={() => setService(s.key)}
            className={`p-4 rounded-xl border text-left transition flex flex-col gap-1.5 cursor-pointer ${
              service === s.key ? "border-indigo-600 bg-indigo-50/50 shadow-sm" : "border-slate-200 bg-white"
            }`}
          >
            <span className="text-xs font-bold text-slate-800">{s.title}</span>
            <span className="text-[9px] text-slate-400 font-semibold leading-normal">{s.desc}</span>
          </button>
        ))}
      </div>

      {/* Request Form */}
      <div className="glass-card bg-white/95 p-5 border-gold-soft shadow-gold-premium space-y-4">
        <h4 className="font-display font-bold text-xs text-chakra-navy uppercase tracking-widest border-b border-slate-100 pb-2">
          {lang === "hi" ? "सेवा अनुरोध पत्र" : "Request Dispatch Care"}
        </h4>

        {success ? (
          <div className="bg-green-50 text-green-700 border border-green-150 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold text-green-800">{lang === "hi" ? "अनुरोध प्राप्त हुआ!" : "Request Registered!"}</p>
              <p className="text-[10px] text-green-600 font-normal mt-0.5">
                {lang === "hi" ? "एक स्वयंसेवक अगले २४ घंटों में आपसे संपर्क करेगा।" : "A certified volunteer will reach out to you within 24 hours."}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                {lang === "hi" ? "बुजुर्ग का नाम" : "Elder's Full Name"}
              </label>
              <input type="text" required placeholder="e.g. Ram Lal ji" className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-indigo-500 font-bold" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                {lang === "hi" ? "आवश्यकता विवरण" : "Details of Request"}
              </label>
              <textarea placeholder={lang === "hi" ? "सहायता का प्रकार..." : "Describe details, e.g. need medicine delivery"} className="w-full border border-slate-200 rounded-lg p-2.5 text-xs min-h-[70px] outline-none focus:border-indigo-500 font-bold" />
            </div>

            <button type="submit" className="w-full bg-[#000080] text-white font-bold py-3 rounded-lg text-xs shadow-md hover:bg-indigo-950 transition">
              {lang === "hi" ? "अनुरोध सबमिट करें" : "Submit Care Request"}
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
