import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Phone, Heart, Users, Clock, ShieldAlert, CheckCircle, Smartphone, Award, RefreshCw, X, Play, HelpCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";

export default function SeniorsPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user } = useAuth();
  const [subPage, setSubPage] = useState<"portal" | "tools">("portal");
  const [success, setSuccess] = useState(false);
  const [service, setService] = useState("Companion");
  
  const [elderName, setElderName] = useState("");
  const [requestDetails, setRequestDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        elderName,
        assistanceType: service,
        details: requestDetails
      };
      const submission = {
        userId: user?.id || "guest",
        citizenName: user?.name || "Citizen",
        citizenPhone: user?.phone || "",
        serviceName: "Senior Support",
        submissionData: data,
        status: "pending",
        timestamp: new Date().toISOString(),
      };
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission)
      });
      if (res.ok) {
        setSuccess(true);
        setElderName("");
        setRequestDetails("");
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Seniors submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Smart Calculators States ---
  const [activeCalc, setActiveCalc] = useState<string | null>(null);

  // 1. Pension Eligibility States
  const [pensionAge, setPensionAge] = useState(65);
  const [pensionIncome, setPensionIncome] = useState(15000);
  const [pensionCategory, setPensionCategory] = useState("BPL");

  // 2. FD Maturity States
  const [fdAmount, setFdAmount] = useState(100000);
  const [fdYears, setFdYears] = useState(5);
  const [fdRate, setFdRate] = useState(8.2); // Senior specific high interest rate default

  // 3. Hydration Planner Weight State
  const [seniorWeight, setSeniorWeight] = useState(65);

  // 4. Fall Risk Quiz States
  const [fallQ1, setFallQ1] = useState(0);
  const [fallQ2, setFallQ2] = useState(0);
  const [fallQ3, setFallQ3] = useState(0);

  // 5. Wills Asset Splitter States
  const [assetTotal, setAssetTotal] = useState(500000);
  const [numHeirs, setNumHeirs] = useState(3);

  // 6. SOS Safety Heartbeat Delay States
  const [sosCountdown, setSosCountdown] = useState(5);
  const [sosActive, setSosActive] = useState(false);
  const [sosIntervalId, setSosIntervalId] = useState<NodeJS.Timeout | null>(null);

  // 7. Reflex Game States
  const [gameStatus, setGameStatus] = useState<"idle" | "waiting" | "ready" | "clicked">("idle");
  const [gameBg, setGameBg] = useState("bg-slate-100");
  const [gameMsg, setGameMsg] = useState("Click Start to Play");
  const [reflexStartTime, setReflexStartTime] = useState<number | null>(null);
  const [reflexResult, setReflexResult] = useState<number | null>(null);
  const [gameTimerId, setGameTimerId] = useState<NodeJS.Timeout | null>(null);

  // 8. Daily Steps & Active Target
  const [dailySteps, setDailySteps] = useState(3000);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (sosIntervalId) clearInterval(sosIntervalId);
      if (gameTimerId) clearTimeout(gameTimerId);
    };
  }, [sosIntervalId, gameTimerId]);

  // SOS Countdown Handler
  const startSosCountdown = () => {
    setSosActive(true);
    setSosCountdown(5);
    const id = setInterval(() => {
      setSosCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          alert(lang === "hi" ? "🚨 आपातकालीन अलार्म भेजा गया!" : "🚨 Emergency Alarm Dispatched!");
          setSosActive(false);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
    setSosIntervalId(id);
  };

  const cancelSosCountdown = () => {
    if (sosIntervalId) {
      clearInterval(sosIntervalId);
      setSosIntervalId(null);
    }
    setSosActive(false);
    setSosCountdown(5);
    alert(lang === "hi" ? "सुरक्षित: आपातकालीन संदेश रद्द कर दिया गया है।" : "Safe: Emergency dispatch cancelled.");
  };

  // Reflex Game handlers
  const startReflexGame = () => {
    setGameStatus("waiting");
    setGameBg("bg-red-500 text-white");
    setGameMsg(lang === "hi" ? "हरा रंग दिखने का इंतज़ार करें..." : "Wait for green color...");
    setReflexResult(null);

    const delay = 1500 + Math.random() * 3000;
    const tId = setTimeout(() => {
      setGameStatus("ready");
      setGameBg("bg-green-600 text-white");
      setGameMsg(lang === "hi" ? "अभी दबाएं!" : "CLICK NOW!");
      setReflexStartTime(performance.now());
    }, delay);
    setGameTimerId(tId);
  };

  const handleGameClick = () => {
    if (gameStatus === "waiting") {
      if (gameTimerId) clearTimeout(gameTimerId);
      setGameStatus("idle");
      setGameBg("bg-slate-100 text-slate-800");
      setGameMsg(lang === "hi" ? "बहुत जल्दी दबा दिया! फिर से प्रयास करें।" : "Too early! Try again.");
    } else if (gameStatus === "ready" && reflexStartTime) {
      const clickTime = performance.now();
      const diff = Math.round(clickTime - reflexStartTime);
      setReflexResult(diff);
      setGameStatus("clicked");
      setGameBg("bg-slate-100 text-slate-800");
      setGameMsg(lang === "hi" ? `बधाई! आपकी प्रतिक्रिया का समय: ${diff}ms` : `Congratulations! Your reaction time: ${diff}ms`);
    }
  };

  return (
    <div className="p-5 space-y-5 animate-fadeIn pb-24 max-w-md mx-auto">
      {/* Overview Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-5 shadow-sm space-y-2">
        <h3 className="font-display font-extrabold text-base text-[#000080] flex items-center gap-1.5">
          <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
          {lang === "hi" ? "वरिष्ठ नागरिक सेवा केंद्र" : "Senior Citizen Support Care"}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed font-semibold">
          {lang === "hi" 
            ? "हमारे आदरणीय बुजुर्गों के लिए विशेष सेवाएँ। आप घर बैठे चिकित्सा सहायता, भोजन वितरण, या बातचीत के लिए साथी स्वयंसेवक का अनुरोध कर सकते हैं।" 
            : "Specialized services dedicated to our respected elders. Request a volunteer companion, home health checks, or logistics aid directly at your doorstep."}
        </p>
      </div>

      {/* Navigation Switcher */}
      <div className="flex bg-slate-200 p-1 rounded-xl max-w-md mx-auto">
        <button 
          onClick={() => setSubPage("portal")}
          className={`flex-1 py-2 text-xs font-black rounded-lg transition-all uppercase tracking-wider ${subPage === "portal" ? "bg-[#000080] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
        >
          {lang === "hi" ? "सेवा पोर्टल" : "Service Portal"}
        </button>
        <button 
          onClick={() => {
            setSubPage("tools");
            if (!activeCalc) setActiveCalc("pension");
          }}
          className={`flex-1 py-2 text-xs font-black rounded-lg transition-all uppercase tracking-wider ${subPage === "tools" ? "bg-[#000080] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
        >
          {lang === "hi" ? "पात्रता एवं टूल्स" : "Calculators"}
        </button>
      </div>

      {subPage === "portal" ? (
        <>
          {/* Services Options Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "Companion", title: lang === "hi" ? "साथी स्वयंसेवक" : "Call Companion", desc: lang === "hi" ? "बातचीत व मदद हेतु" : "Someone to talk & assist" },
              { key: "Aid", title: lang === "hi" ? "गृह सहायता" : "Doorstep Aid", desc: lang === "hi" ? "राशन व चिकित्सा आपूर्ति" : "Medical/Food delivery" }
            ].map(s => (
              <button 
                key={s.key}
                onClick={() => setService(s.key)}
                className={`p-4 rounded-xl border text-left transition flex flex-col gap-1.5 cursor-pointer ${
                  service === s.key ? "border-[#000080] bg-indigo-50/50 shadow-sm" : "border-slate-200 bg-white"
                }`}
              >
                <span className="text-xs font-black text-slate-800">{s.title}</span>
                <span className="text-[9.5px] text-slate-400 font-bold leading-normal">{s.desc}</span>
              </button>
            ))}
          </div>

          {/* Request Form */}
          <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h4 className="font-display font-black text-xs text-[#000080] uppercase tracking-widest border-b border-slate-100 pb-2">
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
                  <input 
                    type="text" 
                    required 
                    value={elderName}
                    onChange={e => setElderName(e.target.value)}
                    placeholder="e.g. Ram Lal ji" 
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-indigo-500 font-bold bg-slate-50" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                    {lang === "hi" ? "आवश्यकता विवरण" : "Details of Request"}
                  </label>
                  <textarea 
                    required
                    value={requestDetails}
                    onChange={e => setRequestDetails(e.target.value)}
                    placeholder={lang === "hi" ? "सहायता का प्रकार..." : "Describe details, e.g. need medicine delivery"} 
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-xs min-h-[70px] outline-none focus:border-indigo-500 font-bold bg-slate-50" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-[#000080] text-white font-bold py-3.5 rounded-xl text-xs shadow-md hover:bg-indigo-950 transition disabled:opacity-50 uppercase tracking-wider font-display"
                >
                  {submitting ? "Submitting..." : (lang === "hi" ? "अनुरोध सबमिट करें" : "Submit Care Request")}
                </button>
              </form>
            )}
          </div>
        </>
      ) : (
        /* --- SMART TOOLS & CALCULATORS PAGE VIEW --- */
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="font-display font-black text-xs text-[#000080] uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>{lang === "hi" ? "बुजुर्ग कल्याण स्मार्ट टूल्स" : "Smart Care Calculators"}</span>
            <Award className="w-4.5 h-4.5 text-[#000080]" />
          </h4>

          {/* Tools Select Grid */}
          <div className="grid grid-cols-2 gap-2 text-center">
            {[
              { key: "pension", title: lang === "hi" ? "पेंशन पात्रता" : "Pension Checker" },
              { key: "fd", title: lang === "hi" ? "FD रिटर्न ब्याज" : "FD Calculator" },
              { key: "hydration", title: lang === "hi" ? "जल सेवन प्लान" : "Senior Hydration" },
              { key: "fall", title: lang === "hi" ? "गिरने का जोखिम" : "Fall Risk Index" },
              { key: "wills", title: lang === "hi" ? "वसीयत संपत्ति बंटवारा" : "Asset Splitter" },
              { key: "sos", title: lang === "hi" ? "SOS अलार्म डिले" : "Emergency Delay" },
              { key: "game", title: lang === "hi" ? "याददाश्त रिफ्लेक्स" : "Reflex Trainer" },
              { key: "steps", title: lang === "hi" ? "गतिशीलता लक्ष्य" : "Mobility Step Tracker" }
            ].map(tool => (
              <button
                key={tool.key}
                onClick={() => setActiveCalc(tool.key)}
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
            
            {/* 1. Pension Checker */}
            {activeCalc === "pension" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "वृद्धावस्था पेंशन पात्रता" : "IGNOAPS Pension Eligibility"}</h5>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `आयु: ${pensionAge} वर्ष` : `Age: ${pensionAge} yrs`}</label>
                    <input type="range" min="50" max="100" value={pensionAge} onChange={e => setPensionAge(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `वार्षिक आय: ₹${pensionIncome}` : `Annual Income: ₹${pensionIncome}`}</label>
                    <input type="range" min="10000" max="100000" step="5000" value={pensionIncome} onChange={e => setPensionIncome(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? "राशन कार्ड श्रेणी" : "Poverty Line Card Status"}</label>
                    <select value={pensionCategory} onChange={e => setPensionCategory(e.target.value)} className="w-full border border-slate-200 rounded p-2 text-xs font-bold bg-white">
                      <option value="BPL">BPL / Antyodaya</option>
                      <option value="APL">APL / Non-BPL</option>
                    </select>
                  </div>
                </div>

                {/* Calculation Logic */}
                {(() => {
                  const eligible = pensionAge >= 60 && pensionCategory === "BPL";
                  const amount = pensionAge >= 80 ? 500 : 200;
                  return (
                    <div className={`p-3 rounded-lg border font-bold text-center ${eligible ? "bg-green-50 text-green-700 border-green-150" : "bg-red-50 text-red-700 border-red-150"}`}>
                      {eligible ? (
                        <p>{lang === "hi" ? `बधाई! आप पात्र हैं। मासिक पेंशन: ₹${amount}` : `Eligible! Monthly Pension: ₹${amount}`}</p>
                      ) : (
                        <p>{lang === "hi" ? "अपात्र (IGNOAPS के लिए आयु 60+ और BPL कार्ड आवश्यक है)" : "Not Eligible (Requires age 60+ and BPL card)"}</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 2. FD Return Calculator */}
            {activeCalc === "fd" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "वरिष्ठ नागरिक FD ब्याज कैलकुलेटर" : "Senior Citizen FD Returns"}</h5>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `जमा राशि: ₹${fdAmount.toLocaleString()}` : `Deposit Amount: ₹${fdAmount.toLocaleString()}`}</label>
                    <input type="range" min="10000" max="500000" step="10000" value={fdAmount} onChange={e => setFdAmount(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `अवधि: ${fdYears} वर्ष` : `Duration: ${fdYears} years`}</label>
                    <input type="range" min="1" max="10" value={fdYears} onChange={e => setFdYears(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                </div>

                {/* Calculation */}
                {(() => {
                  const rate = 8.2; // 0.5% premium for seniors applied
                  const maturity = Math.round(fdAmount * Math.pow(1 + rate/100, fdYears));
                  const interest = maturity - fdAmount;
                  return (
                    <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-slate-800 font-bold space-y-1">
                      <p className="flex justify-between"><span>{lang === "hi" ? "वरिष्ठ ब्याज दर:" : "Senior Interest Rate:"}</span><span className="text-[#000080]">{rate}%</span></p>
                      <p className="flex justify-between"><span>{lang === "hi" ? "अर्जित ब्याज:" : "Interest Earned:"}</span><span className="text-[#000080]">₹{interest.toLocaleString()}</span></p>
                      <p className="flex justify-between border-t border-indigo-200/50 pt-1"><span>{lang === "hi" ? "परिपक्वता मूल्य:" : "Maturity Value:"}</span><span className="text-green-700">₹{maturity.toLocaleString()}</span></p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 3. Hydration Planner */}
            {activeCalc === "hydration" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "जल सेवन मात्रा योजना" : "Senior Hydration Intake"}</h5>
                <p className="text-[10px] text-slate-400 font-semibold">{lang === "hi" ? "बुजुर्गों में प्यास की कमी को रोकने के लिए निर्देशित दैनिक पानी" : "Ensures proper hydration in elders based on physical weight"}</p>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `शरीर का वजन: ${seniorWeight} kg` : `Body Weight: ${seniorWeight} kg`}</label>
                  <input type="range" min="40" max="120" value={seniorWeight} onChange={e => setSeniorWeight(Number(e.target.value))} className="w-full accent-[#000080]" />
                </div>

                {(() => {
                  const liters = (seniorWeight * 30 / 1000).toFixed(1);
                  const glasses = Math.round(Number(liters) / 0.25);
                  return (
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-blue-800 font-bold text-center">
                      <p className="text-lg text-blue-900 font-black">{liters} Liters / Day</p>
                      <p className="text-[10px] text-blue-600 mt-1">{lang === "hi" ? `(लगभग ${glasses} गिलास पानी दिन भर में)` : `(Equivalent to approx. ${glasses} glasses)`}</p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 4. Fall Risk Quiz */}
            {activeCalc === "fall" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "सजगता: गिरने का जोखिम स्तर" : "Fall Risk Index Score"}</h5>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10.5px] text-slate-600 font-bold block mb-1">{lang === "hi" ? "1. क्या पिछले साल कोई गिरावट आई थी?" : "1. Any history of falls in past year?"}</label>
                    <div className="flex gap-2">
                      <button onClick={() => setFallQ1(2)} className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${fallQ1 === 2 ? "bg-red-500 text-white border-red-500" : "bg-white text-slate-700"}`}>Yes</button>
                      <button onClick={() => setFallQ1(0)} className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${fallQ1 === 0 ? "bg-green-600 text-white border-green-600" : "bg-white text-slate-700"}`}>No</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10.5px] text-slate-600 font-bold block mb-1">{lang === "hi" ? "2. क्या चलते समय लाठी/सहारे की आवश्यकता होती है?" : "2. Need support/walking stick to walk?"}</label>
                    <div className="flex gap-2">
                      <button onClick={() => setFallQ2(2)} className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${fallQ2 === 2 ? "bg-red-500 text-white border-red-500" : "bg-white text-slate-700"}`}>Yes</button>
                      <button onClick={() => setFallQ2(0)} className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${fallQ2 === 0 ? "bg-green-600 text-white border-green-600" : "bg-white text-slate-700"}`}>No</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10.5px] text-slate-600 font-bold block mb-1">{lang === "hi" ? "3. क्या चक्कर आने या संतुलन खोने की समस्या है?" : "3. Experience dizziness or balance issues?"}</label>
                    <div className="flex gap-2">
                      <button onClick={() => setFallQ3(2)} className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${fallQ3 === 2 ? "bg-red-500 text-white border-red-500" : "bg-white text-slate-700"}`}>Yes</button>
                      <button onClick={() => setFallQ3(0)} className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${fallQ3 === 0 ? "bg-green-600 text-white border-green-600" : "bg-white text-slate-700"}`}>No</button>
                    </div>
                  </div>
                </div>

                {(() => {
                  const score = fallQ1 + fallQ2 + fallQ3;
                  const level = score >= 4 ? (lang === "hi" ? "🚨 उच्च जोखिम" : "🚨 High Risk") : score >= 2 ? (lang === "hi" ? "⚠️ मध्यम जोखिम" : "⚠️ Moderate Risk") : (lang === "hi" ? "✅ सुरक्षित/कम जोखिम" : "✅ Safe/Low Risk");
                  return (
                    <div className={`p-3 rounded-lg border font-bold text-center ${score >= 4 ? "bg-red-50 text-red-700 border-red-150" : score >= 2 ? "bg-amber-50 text-amber-700 border-amber-150" : "bg-green-50 text-green-700 border-green-150"}`}>
                      <p className="text-sm font-black">{level}</p>
                      <p className="text-[9.5px] mt-1 font-semibold text-slate-500">
                        {score >= 4 
                          ? (lang === "hi" ? "सलाह: घर में रेलिंग लगवाएं और फर्श सूखा रखें।" : "Advice: Install grab-bars and keep floors dry.")
                          : (lang === "hi" ? "सलाह: सक्रिय रहें और रोजाना हल्का व्यायाम करें।" : "Advice: Keep active and do light leg exercises daily.")}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 5. Asset Splitter */}
            {activeCalc === "wills" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "वसीयत संपत्ति बंटवारा प्लानर" : "Asset Split Planner"}</h5>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `कुल संपत्ति: ₹${assetTotal.toLocaleString()}` : `Total Asset Value: ₹${assetTotal.toLocaleString()}`}</label>
                    <input type="range" min="100000" max="1000000" step="50000" value={assetTotal} onChange={e => setAssetTotal(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `उत्तराधिकारियों की संख्या: ${numHeirs}` : `Number of Beneficiaries: ${numHeirs}`}</label>
                    <input type="range" min="1" max="10" value={numHeirs} onChange={e => setNumHeirs(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                </div>

                {(() => {
                  const share = Math.round(assetTotal / numHeirs);
                  return (
                    <div className="bg-[#000080]/5 border border-[#000080]/15 p-3 rounded-lg text-slate-800 font-bold text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === "hi" ? "समान हिस्सेदारी" : "Equal Share Per Heir"}</p>
                      <p className="text-lg text-[#000080] font-black mt-1">₹{share.toLocaleString()}</p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 6. SOS Safety Heartbeat Delay */}
            {activeCalc === "sos" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "स्मार्ट SOS अलार्म टाइमर" : "Smart Safety Heartbeat Delay"}</h5>
                <p className="text-[10px] text-slate-450 font-bold">{lang === "hi" ? "आपातकालीन ट्रिगर होने से पहले ५ सेकंड का विलंब (दुर्घटना रोकने के लिए)" : "A 5-second countdown to cancel accidental clicks before SOS dispatch"}</p>
                
                {sosActive ? (
                  <div className="bg-red-50 border border-red-150 p-4 rounded-xl text-center space-y-3">
                    <p className="text-xs font-black text-red-650 animate-pulse">{lang === "hi" ? "🚨 आपातकालीन सूचना भेजी जा रही है..." : "🚨 DISPATCHING SOS REMINDER..."}</p>
                    <p className="text-4xl font-black text-red-700">{sosCountdown}</p>
                    <button onClick={cancelSosCountdown} className="w-full py-2 bg-green-600 text-white font-bold rounded-lg text-xs uppercase tracking-wide">
                      {lang === "hi" ? "रद्द करें (मैं सुरक्षित हूँ)" : "Cancel (I am Safe)"}
                    </button>
                  </div>
                ) : (
                  <button onClick={startSosCountdown} className="w-full py-4 bg-red-600 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2">
                    <ShieldAlert className="w-4 h-4 animate-bounce" />
                    <span>{lang === "hi" ? "परीक्षण: आपातकालीन SOS दबाएं" : "Test: Press Emergency SOS"}</span>
                  </button>
                )}
              </div>
            )}

            {/* 7. Memory/Reflex Game */}
            {activeCalc === "game" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "बुजुर्ग प्रतिक्रिया व याददाश्त परीक्षण" : "Cognitive Reflex Trainer"}</h5>
                <p className="text-[9.5px] text-slate-450 font-semibold">{lang === "hi" ? "मानसिक सतर्कता और सजगता बनाए रखने के लिए रिफ्लेक्स परीक्षण" : "Measures cognitive reflexes and brain alert state"}</p>
                
                <div 
                  onClick={handleGameClick}
                  className={`w-full h-32 rounded-xl flex flex-col items-center justify-center font-black cursor-pointer shadow-inner transition-colors duration-200 border border-slate-200/50 ${gameBg}`}
                >
                  <p className="text-sm text-center px-4 leading-normal">{gameMsg}</p>
                  {reflexResult !== null && (
                    <p className="text-xs text-green-700 font-extrabold mt-2">Score: {reflexResult} ms</p>
                  )}
                </div>

                {gameStatus === "idle" && (
                  <button onClick={startReflexGame} className="w-full py-2 bg-[#000080] text-white font-bold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{lang === "hi" ? "गेम शुरू करें" : "Start Test"}</span>
                  </button>
                )}
              </div>
            )}

            {/* 8. Daily Steps Mobility */}
            {activeCalc === "steps" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{lang === "hi" ? "वरिष्ठ गतिशीलता लक्ष्य ट्रैकर" : "Senior Mobility step helper"}</h5>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">{lang === "hi" ? `दैनिक कदम: ${dailySteps} कदम` : `Steps walked: ${dailySteps} steps`}</label>
                  <input type="range" min="500" max="8000" step="500" value={dailySteps} onChange={e => setDailySteps(Number(e.target.value))} className="w-full accent-[#000080]" />
                </div>

                {(() => {
                  const calories = Math.round(dailySteps * 0.04);
                  const km = (dailySteps * 0.0007).toFixed(2);
                  const targetOk = dailySteps >= 3000;
                  return (
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1.5 text-slate-700 font-bold">
                      <p className="flex justify-between"><span>{lang === "hi" ? "तय दूरी:" : "Estimated Distance:"}</span><span>{km} km</span></p>
                      <p className="flex justify-between"><span>{lang === "hi" ? "ऊर्जा बर्न:" : "Calories burned:"}</span><span>{calories} kcal</span></p>
                      <p className={`text-center py-1.5 px-2 rounded-md font-bold mt-1 text-[10px] ${targetOk ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                        {targetOk 
                          ? (lang === "hi" ? "🎉 शानदार! वरिष्ठ नागरिकों के लिए पर्याप्त दैनिक लक्ष्य प्राप्त।" : "🎉 Amazing! Achieved safe active walking target.")
                          : (lang === "hi" ? "कम से कम ३,००० कदम चलने का प्रयास करें।" : "Try to reach at least 3,000 steps daily.")}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
      )}

    </div>
  );
}
