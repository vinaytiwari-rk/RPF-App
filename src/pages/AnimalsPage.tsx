import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Info, AlertCircle, Camera, CheckCircle, Heart, Calculator, Award } from "lucide-react";
import { motion } from "motion/react";

export default function AnimalsPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const [reported, setReported] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReported(true);
    setTimeout(() => setReported(false), 4000);
  };

  // --- SMART CALCULATORS STATE ---
  const [activeCalc, setActiveCalc] = useState<string | null>(null);

  // 1. Cattle Feed portion States
  const [cattleWeight, setCattleWeight] = useState(350); // kg
  const [milkYield, setMilkYield] = useState(10); // liters/day

  // 2. Pet Human Age States
  const [petType, setPetType] = useState("dog_medium");
  const [petAge, setPetAge] = useState(3);

  // 3. Livestock Water Requirement States
  const [ambientTemp, setAmbientTemp] = useState(30); // degrees C

  // 4. Animal Gestation States
  const [gestationType, setGestationType] = useState("cow");
  const [conceptionDate, setConceptionDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // 5. Pet Daily Calories (RER/MER) States
  const [petWeight, setPetWeight] = useState(10); // kg

  return (
    <div className="p-5 space-y-5 animate-fadeIn pb-24 max-w-md mx-auto">
      {/* Overview Card (Removed brown styling to meet clean guidelines) */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-200/50 rounded-2xl p-5 shadow-sm space-y-2">
        <h3 className="font-display font-extrabold text-base text-[#000080] flex items-center gap-1.5">
          <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
          {lang === "hi" ? "पशु कल्याण और संरक्षण" : "Animal Welfare Services"}
        </h3>
        <p className="text-xs text-slate-650 leading-relaxed font-semibold">
          {lang === "hi" 
            ? "बेसहारा और घायल पशुओं के उपचार और आश्रय के लिए। आप बीमार या चोटिल आवारा पशुओं की रिपोर्ट कर सकते हैं, हमारी रेस्क्यू टीम तुरंत सहायता करेगी।" 
            : "Emergency relief, rescue, and shelter assistance for stray or injured animals. File reports to dispatch our veterinary team directly."}
        </p>
      </div>

      {/* Report Stray Form */}
      <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <h4 className="font-display font-black text-xs text-[#000080] uppercase tracking-widest border-b border-slate-100 pb-2">
          {lang === "hi" ? "घायल पशु की रिपोर्ट करें" : "Report Injured Stray"}
        </h4>

        {reported ? (
          <div className="bg-green-50 text-green-700 border border-green-150 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold text-green-800">{lang === "hi" ? "शिकायत दर्ज हुई!" : "Incident Reported!"}</p>
              <p className="text-[10px] text-green-600 font-normal mt-0.5">
                {lang === "hi" ? "हमारी पशु एम्बुलेंस और रेस्क्यू टीम जल्द ही पहुंचेगी।" : "Our stray rescue ambulance is notified and will dispatch shortly."}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                {lang === "hi" ? "पशु का प्रकार" : "Animal Type"}
              </label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-indigo-500 font-bold">
                <option>{lang === "hi" ? "गाय (Cow)" : "Cow"}</option>
                <option>{lang === "hi" ? "कुत्ता (Dog)" : "Dog"}</option>
                <option>{lang === "hi" ? "बिल्ली (Cat)" : "Cat"}</option>
                <option>{lang === "hi" ? "अन्य (Other)" : "Other"}</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                {lang === "hi" ? "चोट/बीमारी का विवरण" : "Condition Description"}
              </label>
              <textarea required placeholder={lang === "hi" ? "जैसे - पैर में फ्रैक्चर है..." : "e.g. fractured leg, bleeding"} className="w-full border border-slate-200 rounded-lg p-2.5 text-xs min-h-[70px] outline-none focus:border-indigo-500 font-bold bg-slate-50" />
            </div>

            <div className="border border-dashed border-slate-350 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition">
              <Camera className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-[10px] font-bold text-slate-500">{lang === "hi" ? "तस्वीर अपलोड करें (वैकल्पिक)" : "Upload Photo (Optional)"}</span>
            </div>

            <button type="submit" className="w-full bg-[#000080] hover:bg-indigo-950 text-white font-bold py-3.5 rounded-xl text-xs shadow-md transition uppercase tracking-wider font-display">
              {lang === "hi" ? "रिपोर्ट भेजें" : "Submit Incident Report"}
            </button>
          </form>
        )}
      </div>

      {/* --- SMART TOOLS & CALCULATORS SECTION --- */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="font-display font-black text-xs text-[#000080] uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center justify-between">
          <span>{lang === "hi" ? "पशु स्वास्थ्य एवं पोषण टूल्स" : "Animal Care Calculators"}</span>
          <Calculator className="w-4.5 h-4.5 text-indigo-650" />
        </h4>

        {/* Tools Select Grid */}
        <div className="grid grid-cols-2 gap-2 text-center">
          {[
            { key: "feed", title: lang === "hi" ? "पशु आहार कैलकुलेटर" : "Cattle Feed Portions" },
            { key: "age", title: lang === "hi" ? "पालतू उम्र परिवर्तक" : "Pet Human Age" },
            { key: "water", title: lang === "hi" ? "पशु पानी आवश्यकता" : "Livestock Water" },
            { key: "gestation", title: lang === "hi" ? "गर्भाधान कैलेंडर" : "Pregnancy Calendar" },
            { key: "calories", title: lang === "hi" ? "दैनिक कैलोरी (RER/MER)" : "Pet Daily Calories" }
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
            
            {/* 1. Cattle Feed portion Estimator */}
            {activeCalc === "feed" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "मवेशी आहार अनुपात कैलकुलेटर" : "Dry & Green Fodder Portion Planner"}</h5>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `मवेशी का वजन: ${cattleWeight} kg` : `Cattle Weight: ${cattleWeight} kg`}</label>
                    <input type="range" min="150" max="600" step="10" value={cattleWeight} onChange={e => setCattleWeight(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `दैनिक दूध उत्पादन: ${milkYield} L/day` : `Daily Milk Yield: ${milkYield} L/day`}</label>
                    <input type="range" min="0" max="30" value={milkYield} onChange={e => setMilkYield(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                </div>

                {(() => {
                  // Standard recommendation: Dry Matter (DM) = 2.5% of body weight
                  const totalDM = cattleWeight * 0.025;
                  const dryFodder = Math.round(totalDM * 0.5); // 50% dry fodder
                  const greenFodder = Math.round(totalDM * 1.5); // Green fodder contains water, so 3x wet multiplier
                  const concentrate = Math.round(1.5 + (milkYield * 0.35)); // 1.5kg maintenance + 0.35kg per L milk
                  return (
                    <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-slate-800 font-bold space-y-1.5">
                      <p className="flex justify-between"><span>{lang === "hi" ? "सूखा चारा (Dry Fodder):" : "Dry Fodder Required:"}</span><span className="text-[#000080]">{dryFodder} kg/day</span></p>
                      <p className="flex justify-between"><span>{lang === "hi" ? "हरा चारा (Green Fodder):" : "Green Fodder Required:"}</span><span className="text-[#000080]">{greenFodder} kg/day</span></p>
                      <p className="flex justify-between border-t border-indigo-200/50 pt-1.5"><span>{lang === "hi" ? "पशु आहार दाना (Concentrate):" : "Concentrate Feed Required:"}</span><span className="text-green-700">{concentrate} kg/day</span></p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 2. Pet Human Age Converter */}
            {activeCalc === "age" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "पालतू पशु इंसानी उम्र परिवर्तक" : "Pet to Human Age Equivalence"}</h5>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? "पालतू जानवर" : "Pet Category"}</label>
                    <select value={petType} onChange={e => setPetType(e.target.value)} className="w-full border border-slate-200 rounded p-2 text-xs font-bold bg-white">
                      <option value="dog_small">Small Dog (&lt;10kg)</option>
                      <option value="dog_medium">Medium Dog (10-25kg)</option>
                      <option value="dog_large">Large Dog (&gt;25kg)</option>
                      <option value="cat">Cat</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `पालतू उम्र: ${petAge} वर्ष` : `Pet Age: ${petAge} years`}</label>
                    <input type="range" min="1" max="20" value={petAge} onChange={e => setPetAge(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                </div>

                {(() => {
                  let humanAge = 0;
                  if (petType === "cat") {
                    humanAge = petAge === 1 ? 15 : petAge === 2 ? 24 : 24 + (petAge - 2) * 4;
                  } else {
                    const mult = petType === "dog_large" ? 7.5 : petType === "dog_medium" ? 6 : 5;
                    humanAge = petAge === 1 ? 15 : petAge === 2 ? 24 : 24 + Math.round((petAge - 2) * mult);
                  }
                  return (
                    <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-lg text-slate-800 font-bold text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === "hi" ? "तुलनात्मक इंसानी उम्र" : "Equivalent Human Years"}</p>
                      <p className="text-xl text-[#000080] font-black mt-1">{humanAge} {lang === "hi" ? "वर्ष" : "years old"}</p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 3. Livestock Water Requirement */}
            {activeCalc === "water" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "तापमान-आधारित मवेशी जल आवश्यकता" : "Livestock Daily Water Needs"}</h5>
                <p className="text-[10px] text-slate-400 font-bold">{lang === "hi" ? "गर्मियों के मौसम में मवेशियों के लिए आवश्यक पानी का पूर्वानुमान" : "Projects recommended water intake based on daily ambient temperature"}</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `औसत तापमान: ${ambientTemp}°C` : `Ambient Temp: ${ambientTemp}°C`}</label>
                    <input type="range" min="15" max="48" value={ambientTemp} onChange={e => setAmbientTemp(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `मवेशी का वजन: ${cattleWeight} kg` : `Cattle Weight: ${cattleWeight} kg`}</label>
                    <input type="range" min="150" max="600" step="10" value={cattleWeight} onChange={e => setCattleWeight(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                </div>

                {(() => {
                  // standard factor: temp > 35 requires ~20% more water
                  const tempFactor = ambientTemp > 35 ? 1.25 : ambientTemp > 25 ? 1.05 : 0.9;
                  const waterLiters = Math.round(cattleWeight * 0.1 * tempFactor);
                  return (
                    <div className="bg-blue-50 border border-blue-150 p-3 rounded-lg text-blue-800 font-bold text-center">
                      <p className="text-lg text-blue-900 font-black">{waterLiters} Liters / Day</p>
                      <p className="text-[9.5px] text-blue-500 mt-1">{lang === "hi" ? "मवेशियों को छायादार ठंडी जगह पर पानी पिलाएं।" : "Provide cool shade and replenish troughs frequently."}</p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 4. Animal Gestation (Pregnancy) Calendar */}
            {activeCalc === "gestation" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "पशु गर्भाधान एवं प्रसव तिथि प्लानर" : "Livestock Gestation Calculator"}</h5>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? "पशु का प्रकार" : "Livestock Category"}</label>
                    <select value={gestationType} onChange={e => setGestationType(e.target.value)} className="w-full border border-slate-200 rounded p-2 text-xs font-bold bg-white">
                      <option value="cow">{lang === "hi" ? "गाय (283 दिन)" : "Cow (283 days)"}</option>
                      <option value="buffalo">{lang === "hi" ? "भैंस (310 दिन)" : "Buffalo (310 days)"}</option>
                      <option value="goat">{lang === "hi" ? "बकरी/भेड़ (150 दिन)" : "Goat/Sheep (150 days)"}</option>
                      <option value="dog">{lang === "hi" ? "कुतिया (63 दिन)" : "Dog (63 days)"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? "गर्भाधान/संभोग की तारीख" : "Conception/Insemination Date"}</label>
                    <input type="date" value={conceptionDate} onChange={e => setConceptionDate(e.target.value)} className="w-full border border-slate-200 rounded p-2 text-xs font-bold bg-white" />
                  </div>
                </div>

                {(() => {
                  const daysMap: Record<string, number> = { cow: 283, buffalo: 310, goat: 150, dog: 63 };
                  const duration = daysMap[gestationType] || 283;
                  const conc = new Date(conceptionDate);
                  const edd = new Date(conc.getTime() + duration * 24 * 60 * 60 * 1000);
                  return (
                    <div className="bg-green-50 border border-green-150 p-3 rounded-lg text-slate-800 font-bold space-y-1">
                      <p className="flex justify-between"><span>{lang === "hi" ? "गर्भाधान अवधि:" : "Gestation Period:"}</span><span>{duration} {lang === "hi" ? "दिन" : "days"}</span></p>
                      <p className="flex justify-between border-t border-green-200/55 pt-1"><span>{lang === "hi" ? "संभावित प्रसव तारीख:" : "Expected Delivery Date:"}</span><span className="text-green-700">{edd.toLocaleDateString()}</span></p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 5. Pet Calories (RER/MER) */}
            {activeCalc === "calories" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "कुत्ता/बिल्ली दैनिक कैलोरी (RER/MER)" : "Pet Resting & Active Energy Needs"}</h5>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `पालतू पशु का वजन: ${petWeight} kg` : `Pet Weight: ${petWeight} kg`}</label>
                  <input type="range" min="2" max="60" value={petWeight} onChange={e => setPetWeight(Number(e.target.value))} className="w-full accent-[#000080]" />
                </div>

                {(() => {
                  // RER = 70 * (weight ^ 0.75)
                  const rer = Math.round(70 * Math.pow(petWeight, 0.75));
                  const mer = Math.round(rer * 1.6); // Active adult multiplier
                  return (
                    <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-slate-800 font-bold space-y-1.5">
                      <p className="flex justify-between"><span>{lang === "hi" ? "न्यूनतम आराम कैलोरी (RER):" : "Resting Energy (RER):"}</span><span className="text-[#000080]">{rer} kcal/day</span></p>
                      <p className="flex justify-between border-t border-indigo-200/50 pt-1.5"><span>{lang === "hi" ? "सक्रिय दैनिक कैलोरी (MER):" : "Active Adult Daily (MER):"}</span><span className="text-green-700">{mer} kcal/day</span></p>
                    </div>
                  );
                })()}
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}
