import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { HandHelping, MapPin, CheckCircle, Apple, ArrowLeft, Info, Calendar, Users, Award, Calculator, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";

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
      console.error("Food Support submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // --- SMART CALCULATORS STATE ---
  const [activeCalc, setActiveCalc] = useState<string | null>(null);

  // 1. Ration Estimator States
  const [calcMembers, setCalcMembers] = useState(4);
  const [calcDays, setCalcDays] = useState(15);

  // 2. Food Waste States
  const [wasteRoti, setWasteRoti] = useState(2); // count
  const [wasteRice, setWasteRice] = useState(200); // grams
  const [wasteVeggies, setWasteVeggies] = useState(150); // grams

  // 3. Camp Volume States
  const [stockWeight, setStockWeight] = useState(500); // kg (rice/flour)
  const [campGuests, setCampGuests] = useState(150); // persons/day

  // 4. Water Footprint States
  const [plateRice, setPlateRice] = useState(150); // grams
  const [plateDal, setPlateDal] = useState(100); // grams
  const [platePaneer, setPlatePaneer] = useState(0); // grams

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn max-w-md mx-auto pb-24">
      {/* Header Area */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 pt-6 pb-6 px-5 relative overflow-hidden shrink-0 text-white shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
        <div className="relative z-10 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition border border-white/15"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="font-display font-extrabold text-sm sm:text-base leading-none">
              {lang === "hi" ? "आहार और पोषण सहायता" : "Food & Hunger Relief"}
            </h3>
            <p className="text-[10px] text-orange-100 font-bold mt-1 uppercase tracking-wider">
              RP Foundation Nutrition Mission
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-5 pb-0 shrink-0">
        <div className="bg-white border border-slate-200 p-1 rounded-xl flex gap-1 shadow-sm">
          <button 
            onClick={() => setActiveTab("ration")}
            className={`flex-1 text-center py-2 rounded-lg text-xs font-black transition cursor-pointer ${
              activeTab === "ration" ? "bg-[#000080] text-white" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {lang === "hi" ? "सूखा राशन किट" : "Dry Ration Kit"}
          </button>
          <button 
            onClick={() => setActiveTab("kitchens")}
            className={`flex-1 text-center py-2 rounded-lg text-xs font-black transition cursor-pointer ${
              activeTab === "kitchens" ? "bg-[#000080] text-white" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {lang === "hi" ? "सामुदायिक रसोई" : "Community Kitchens"}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 space-y-5">
        
        {activeTab === "ration" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Form Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Apple className="w-5 h-5 text-orange-500" />
                <h4 className="font-display font-black text-xs text-[#000080] uppercase tracking-wider">
                  {lang === "hi" ? "राशन किट टोकन आवेदन" : "Apply for Ration Tokens"}
                </h4>
              </div>

              {success ? (
                <div className="bg-green-50 text-green-700 border border-green-150 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-bold text-green-800">{lang === "hi" ? "टोकन सफलतापूर्वक जारी!" : "Ration Token Generated!"}</p>
                    <p className="text-[10px] text-green-600 font-normal mt-0.5">
                      {lang === "hi" ? "अपना टोकन कोड लेकर राहत शिविर में पहुंचें।" : "Bring your generated code to claim the dry ration kit."}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Ration Card No. / राशन कार्ड</label>
                      <input 
                        type="text" 
                        required
                        value={rationCard}
                        onChange={e => setRationCard(e.target.value)}
                        placeholder="BPL-998877"
                        className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Members / सदस्य</label>
                      <input 
                        type="number" 
                        required
                        value={familyMembers}
                        onChange={e => setFamilyMembers(e.target.value)}
                        placeholder="e.g. 4"
                        className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="col-span-2">
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
                    className="w-full bg-[#000080] hover:bg-indigo-950 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md disabled:opacity-75 cursor-pointer font-display"
                  >
                    {submitting ? "Processing Request..." : "Apply & Generate Ration Token"}
                  </button>
                </form>
              )}
            </div>

            {/* Changed from brown text-amber-900 bg-amber-50 to clean slate theme */}
            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex gap-3 text-slate-800 shadow-sm">
              <Info className="w-5 h-5 text-indigo-650 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-xs font-black uppercase tracking-wider block text-[#000080]">{lang === "hi" ? "वितरण दिशानिर्देश" : "Distribution Guidelines"}</span>
                <p className="text-[10px] leading-relaxed opacity-90 font-bold text-slate-600">
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
                className="bg-white p-4.5 border border-slate-200 shadow-sm rounded-2xl space-y-3"
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
                    <span className="text-slate-750 normal-case font-extrabold">{lang === "hi" ? ctr.addressHi : ctr.addressEn}</span>
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

        {/* --- SMART TOOLS & CALCULATORS SECTION --- */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="font-display font-black text-xs text-[#000080] uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>{lang === "hi" ? "आहार और राशन योजना टूल्स" : "Ration Planning Calculators"}</span>
            <Calculator className="w-4.5 h-4.5 text-[#FF9933]" />
          </h4>

          {/* Tools Select Grid */}
          <div className="grid grid-cols-2 gap-2 text-center">
            {[
              { key: "estimator", title: lang === "hi" ? "परिवार राशन अनुमान" : "Family Ration Estimator" },
              { key: "waste", title: lang === "hi" ? "भोजन बर्बादी नुकसान" : "Food Waste Estimator" },
              { key: "camp", title: lang === "hi" ? "राहत कैंप भंडार सीमा" : "Camp Stock Sustainability" },
              { key: "footprint", title: lang === "hi" ? "भोजन जल फुटप्रिंट" : "Plate Water Footprint" }
            ].map(tool => (
              <button
                key={tool.key}
                onClick={() => setActiveCalc(activeCalc === tool.key ? null : tool.key)}
                className={`p-2.5 rounded-xl text-[10.5px] font-bold border transition ${
                  activeCalc === tool.key ? "bg-[#000080] text-white border-[#000080]" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {tool.title}
              </button>
            ))}
          </div>

          {/* Calculators Content Container */}
          {activeCalc && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-2 space-y-4 animate-fadeIn text-xs">
              
              {/* 1. Family Ration Estimator */}
              {activeCalc === "estimator" && (
                <div className="space-y-3">
                  <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "परिवार आकार पोषण आवश्यकता" : "Family Nutritional Grain Requirements"}</h5>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `परिवार के सदस्य: ${calcMembers}` : `Family Members: ${calcMembers}`}</label>
                      <input type="range" min="1" max="12" value={calcMembers} onChange={e => setCalcMembers(Number(e.target.value))} className="w-full accent-[#000080]" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `राशन अवधि: ${calcDays} दिन` : `Ration Duration: ${calcDays} days`}</label>
                      <input type="range" min="7" max="45" step="1" value={calcDays} onChange={e => setCalcDays(Number(e.target.value))} className="w-full accent-[#000080]" />
                    </div>
                  </div>

                  {(() => {
                    // Standard Indian dietary guideline: ~400g grains (wheat/rice) + 80g dal per person per day
                    const totalGrains = ((calcMembers * 0.4) * calcDays).toFixed(1);
                    const totalDal = ((calcMembers * 0.08) * calcDays).toFixed(1);
                    return (
                      <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-slate-800 font-bold space-y-1.5">
                        <p className="flex justify-between"><span>{lang === "hi" ? "गेहूं/चावल आवश्यकता:" : "Wheat & Rice Needed:"}</span><span className="text-[#000080]">{totalGrains} kg</span></p>
                        <p className="flex justify-between border-t border-indigo-200/50 pt-1.5"><span>{lang === "hi" ? "दाल (Proteins) आवश्यकता:" : "Pulses/Dal Needed:"}</span><span className="text-green-700">{totalDal} kg</span></p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 2. Food Waste Estimator */}
              {activeCalc === "waste" && (
                <div className="space-y-3">
                  <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "भोजन बर्बादी वित्तीय व CO2 हानि" : "Food Waste Economic & Carbon Loss"}</h5>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `बर्बाद रोटियां: ${wasteRoti}` : `Wasted Rotis/Bread: ${wasteRoti}`}</label>
                      <input type="range" min="0" max="10" value={wasteRoti} onChange={e => setWasteRoti(Number(e.target.value))} className="w-full accent-[#000080]" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `बर्बाद चावल: ${wasteRice}g` : `Wasted Rice: ${wasteRice}g`}</label>
                      <input type="range" min="0" max="1000" step="50" value={wasteRice} onChange={e => setWasteRice(Number(e.target.value))} className="w-full accent-[#000080]" />
                    </div>
                  </div>

                  {(() => {
                    const priceSaved = (wasteRoti * 5) + (wasteRice * 0.05); // roti @ ₹5, rice @ ₹50/kg
                    const co2Saved = ((wasteRoti * 0.15) + (wasteRice * 0.002)).toFixed(2); // CO2 emission estimate
                    return (
                      <div className="bg-red-50 border border-red-150 p-3 rounded-lg text-slate-800 font-bold space-y-1.5">
                        <p className="flex justify-between"><span>{lang === "hi" ? "नष्ट मूल्य हानि:" : "Financial Loss Value:"}</span><span className="text-red-700">₹{priceSaved.toLocaleString()}</span></p>
                        <p className="flex justify-between border-t border-red-200/50 pt-1.5"><span>{lang === "hi" ? "कार्बन पदचिह्न (CO2):" : "Carbon Footprint (CO2):"}</span><span className="text-red-700">{co2Saved} kg CO2</span></p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 3. Camp Stock Sustainability */}
              {activeCalc === "camp" && (
                <div className="space-y-3">
                  <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "राहत कैंप अनाज भंडारण सीमा" : "Camp Ration Stock Sustainability"}</h5>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `कैंप कुल स्टॉक: ${stockWeight} kg` : `Total Stock Weight: ${stockWeight} kg`}</label>
                      <input type="range" min="100" max="2500" step="50" value={stockWeight} onChange={e => setStockWeight(Number(e.target.value))} className="w-full accent-[#000080]" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `दैनिक आगंतुक: ${campGuests} लोग/दिन` : `Daily Guests Intake: ${campGuests}/day`}</label>
                      <input type="range" min="20" max="500" step="10" value={campGuests} onChange={e => setCampGuests(Number(e.target.value))} className="w-full accent-[#000080]" />
                    </div>
                  </div>

                  {(() => {
                    const dailyDemand = campGuests * 0.35; // 350g grains per cooked meal
                    const daysRemaining = Math.floor(stockWeight / dailyDemand);
                    return (
                      <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-amber-900 font-bold text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === "hi" ? "स्टॉक स्थिरता (दिन)" : "Rations Sustainability Duration"}</p>
                        <p className="text-lg text-amber-800 font-black mt-1">{daysRemaining} {lang === "hi" ? "दिन" : "Days"}</p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 4. Plate Water Footprint */}
              {activeCalc === "footprint" && (
                <div className="space-y-3">
                  <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "खाद्य थाली का जल पदचिह्न" : "Water Footprint of Food Portions"}</h5>
                  <p className="text-[9.5px] text-slate-400 font-semibold">{lang === "hi" ? "विभिन्न भोजन उत्पादन में उपभोग किए जाने वाले पानी (लीटर) की गणना" : "Computes virtual water volume consumed to grow your food portions"}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `चावल मात्रा: ${plateRice}g` : `Rice Quantity: ${plateRice}g`}</label>
                      <input type="range" min="0" max="400" step="50" value={plateRice} onChange={e => setPlateRice(Number(e.target.value))} className="w-full accent-[#000080]" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `दाल मात्रा: ${plateDal}g` : `Dal/Lentils Quantity: ${plateDal}g`}</label>
                      <input type="range" min="0" max="250" step="25" value={plateDal} onChange={e => setPlateDal(Number(e.target.value))} className="w-full accent-[#000080]" />
                    </div>
                  </div>

                  {(() => {
                    // factors: 1kg rice = 2500L, 1kg dal = 1250L
                    const totalWater = Math.round((plateRice * 2.5) + (plateDal * 1.25));
                    return (
                      <div className="bg-blue-50 border border-blue-150 p-3 rounded-lg text-blue-800 font-bold text-center">
                        <p className="text-[10px] text-blue-500 uppercase">{lang === "hi" ? "कुल प्रयुक्त जल" : "Virtual Water Consumed"}</p>
                        <p className="text-lg font-black text-[#000080] mt-1">{totalWater} Liters</p>
                      </div>
                    );
                  })()}
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
