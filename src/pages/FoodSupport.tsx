import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { HandHelping, MapPin, CheckCircle, Apple, ArrowLeft, Info, Calendar, Users, Award } from "lucide-react";
// import axios from 'axios';
import { useAuth } from "../context/AuthContext";

interface KitchenCenter {
  id: string;
  nameEn: string;
  nameHi: string;
  addressEn: string;
  addressHi: string;
  timingEn: string;
  timingHi: string;
  status: "active" | "inactive";
}

const CENTERS: KitchenCenter[] = [
  {
    id: "1",
    nameEn: "Sehore Community Kitchen (Rasoi 1)",
    nameHi: "सीहोर सामुदायिक रसोई (रसोई 1)",
    addressEn: "Near Bus Stand, Sehore",
    addressHi: "बस स्टैंड के पास, सीहोर",
    timingEn: "11:30 AM - 2:30 PM Daily",
    timingHi: "दोपहर 11:30 से 2:30 बजे (रोजाना)",
    status: "active"
  },
  {
    id: "2",
    nameEn: "Karond Chauraha Rasoi Point",
    nameHi: "करौंद चौराहा रसोई पॉइंट",
    addressEn: "Near RP Foundation Office, Bhopal",
    addressHi: "आरपी फाउंडेशन कार्यालय के पास, भोपाल",
    timingEn: "12:00 PM - 3:00 PM Daily",
    timingHi: "दोपहर 12:00 से 3:00 बजे (रोजाना)",
    status: "active"
  }
];

export default function FoodSupport() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"ration" | "kitchens">("ration");
  
  // Ration Form states
  const [rationCard, setRationCard] = useState("");
  const [familyMembers, setFamilyMembers] = useState("4");
  const [rationType, setRationType] = useState("Dry Ration Kit (15 Days)");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rationCard) return;

    setSubmitting(true);
    try {
      const data = {
        rationCard,
        familyMembers: parseInt(familyMembers, 10) || 4,
        rationType
      };

      const submission = {
        userId: user?.id || "guest",
        citizenName: user?.name || "Citizen",
        citizenPhone: user?.phone || "",
        serviceName: "Food Support",
        submissionData: data,
        status: "pending",
        timestamp: new Date().toISOString(),
      };

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission)
      });
      if (!res.ok) throw new Error("Failed to submit food support request");
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setRationCard("");
      }, 4000);
    } catch (err) {
      console.error("Supabase Food Support submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn max-w-md mx-auto">
      {/* Header Area */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 pt-6 pb-6 px-5 relative overflow-hidden shrink-0 text-white shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
        <div className="relative z-10 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-display font-extrabold text-xl tracking-wide">
              {lang === "hi" ? "भोजन व पोषण सहायता" : "Food & Nutrition Aid"}
            </h2>
            <p className="text-xs text-orange-100 mt-0.5">
              {lang === "hi" ? "सूखा राशन किट आवेदन और सामुदायिक रसोई" : "Apply for dry ration kits & browse local community kitchens"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm shrink-0">
        <button 
          onClick={() => setActiveTab("ration")}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition border-b-2 cursor-pointer ${
            activeTab === "ration" ? "border-orange-500 text-orange-650" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {lang === "hi" ? "राशन किट आवेदन" : "Request Ration Kit"}
        </button>
        <button 
          onClick={() => setActiveTab("kitchens")}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition border-b-2 cursor-pointer ${
            activeTab === "kitchens" ? "border-orange-500 text-orange-650" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {lang === "hi" ? "सामुदायिक रसोई" : "Rasoi Centers"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        
        {activeTab === "ration" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="glass-card bg-white/95 p-5 border-gold-soft shadow-gold-premium space-y-4">
              <h4 className="font-display font-extrabold text-xs text-slate-850 uppercase tracking-widest border-b border-slate-100 pb-2">
                {lang === "hi" ? "सूखा राशन किट पंजीकरण" : "Dry Ration Kit Registration"}
              </h4>

              {success ? (
                <div className="bg-green-50 border border-green-150 rounded-2xl p-5 text-center space-y-2 py-8 animate-fadeIn">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <h5 className="font-display font-extrabold text-green-905 text-sm">
                    {lang === "hi" ? "राशन अनुरोध स्वीकार किया गया!" : "Ration Request Registered!"}
                  </h5>
                  <p className="text-xs text-green-700/80 leading-relaxed">
                    {lang === "hi" 
                      ? "आपका टोकन नंबर उत्पन्न हो गया है। राशन वितरण शिविर पर जाकर अपना जन सेवा कार्ड दिखाकर किट प्राप्त करें।"
                      : "Dry ration token issued. Present your Digital Jan Seva card at the distribution outpost to claim your kit."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Ration Card No. / राशन कार्ड नंबर</label>
                    <input 
                      type="text" 
                      required 
                      value={rationCard}
                      onChange={e => setRationCard(e.target.value)}
                      placeholder="e.g. MPH46200921" 
                      className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-orange-500" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Family Members / सदस्य संख्या</label>
                      <input 
                        type="number" 
                        required 
                        value={familyMembers}
                        onChange={e => setFamilyMembers(e.target.value)}
                        placeholder="e.g. 4" 
                        className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-orange-500" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Kit Type / किट प्रकार</label>
                      <select 
                        value={rationType}
                        onChange={e => setRationType(e.target.value)}
                        className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-orange-500"
                      >
                        <option>Dry Ration Kit (15 Days)</option>
                        <option>Wheat & Rice Only</option>
                        <option>Baby Nutrition Pack</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-[#000080] hover:bg-indigo-950 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md disabled:opacity-75 cursor-pointer"
                  >
                    {submitting ? "Processing Request..." : "Apply & Generate Ration Token"}
                  </button>
                </form>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-900">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-xs font-black uppercase tracking-wider block">Distribution Guidelines</span>
                <p className="text-[10px] leading-relaxed opacity-90 font-medium">
                  {lang === "hi"
                    ? "राशन किट वितरण प्रत्येक माह के दूसरे व चौथे शनिवार को आरपी फाउंडेशन राहत शिविरों से किया जाता है।"
                    : "Ration kits can be claimed every 2nd and 4th Saturday of the month. Aadhaar linkage of family members is verified on spot."}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "kitchens" && (
          <div className="space-y-4 animate-fadeIn">
            {CENTERS.map(ctr => (
              <div 
                key={ctr.id}
                className="glass-card bg-white/95 p-4.5 border-gold-soft shadow-gold-premium space-y-3"
              >
                <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                  <div>
                    <h4 className="font-display font-extrabold text-xs sm:text-sm text-slate-850">
                      {lang === "hi" ? ctr.nameHi : ctr.nameEn}
                    </h4>
                    <span className="text-[9px] text-[#FF9933] font-bold uppercase tracking-wider mt-0.5 block">{lang === "hi" ? "मुफ़्त पक्का भोजन" : "Free Cooked Meal"}</span>
                  </div>
                  <span className="text-[8.5px] font-black text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full uppercase">
                    Active
                  </span>
                </div>

                <div className="space-y-1.5 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-755 normal-case font-extrabold">{lang === "hi" ? ctr.addressHi : ctr.addressEn}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lang === "hi" ? ctr.timingHi : ctr.timingEn}</span>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-150 text-[10px] text-slate-600 font-semibold leading-relaxed">
                  {lang === "hi"
                    ? "नोट: भोजन प्राप्त करने के लिए किसी पूर्व पंजीकरण की आवश्यकता नहीं है। अपना जन सेवा कार्ड साथ रखें।"
                    : "Note: No prior registration needed. Showcase your Jan Seva Card QR code on arrival at the kitchen desk."}
                </div>
              </div>
            ))}

            {/* Visual Simulated Map Widget */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden h-40 relative bg-slate-100 flex items-center justify-center shadow-inner">
              {/* Mock map graphic details */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="absolute w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping left-1/3 top-1/2"></div>
              <div className="absolute w-2 h-2 bg-orange-600 rounded-full left-1/3 top-1/2"></div>
              <div className="absolute w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping right-1/4 top-1/3"></div>
              <div className="absolute w-2 h-2 bg-orange-600 rounded-full right-1/4 top-1/3"></div>
              <span className="font-sans text-[10.5px] font-black uppercase text-slate-450 tracking-wider relative z-10 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#FF9933]" />
                <span>Simulated Map View</span>
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
