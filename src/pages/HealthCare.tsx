import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Heart, Activity, CheckCircle, Navigation, Award, Calendar, 
  MapPin, Dumbbell, Droplets, Clock, Plus, ShieldAlert, 
  Smile, User, Zap, BookOpen, Volume2, Search, Bell, AlertCircle
} from "lucide-react";

export default function HealthCare() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const isHi = lang === "hi";

  const [activeTab, setActiveTab] = useState<"assess" | "tracker" | "welfare" | "clinical">("assess");

  // Symptoms Assessment states
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [diagnosedDisease, setDiagnosedDisease] = useState("");
  const [assessing, setAssessing] = useState(false);

  // BMI states
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmiResult, setBmiResult] = useState<number | null>(null);

  // Physical score inputs
  const [sleepHours, setSleepHours] = useState("7");
  const [exerciseMin, setExerciseMin] = useState("30");
  const [waterCups, setWaterCups] = useState("5");
  const [wellnessScore, setWellnessScore] = useState<number | null>(null);

  // Fitness Trackers states
  const [stepCount, setStepCount] = useState(4200);
  const [waterCount, setWaterCount] = useState(4); // in cups
  const [calorieCount, setCalorieCount] = useState(1200);
  const [exerciseMinCount, setExerciseMinCount] = useState(20);
  const [syncingVitals, setSyncingVitals] = useState(false);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [heartRate, setHeartRate] = useState(72);
  const [sleepCycle, setSleepCycle] = useState("7h 15m");

  // Medication Tracker states
  const [medicines, setMedicines] = useState([
    { name: "Metformin 500mg", time: "09:00 AM", taken: false },
    { name: "Atorvastatin 10mg", time: "09:00 PM", taken: false }
  ]);
  const [newMedName, setNewMedName] = useState("");
  const [newMedTime, setNewMedTime] = useState("08:00 AM");

  // Women's Health cycles
  const [periodDay, setPeriodDay] = useState(12);
  const [ovulationDay, setOvulationDay] = useState(14);
  const [pregnancyWeek, setPregnancyWeek] = useState(8);

  // Mental Health meditation
  const [meditating, setMeditating] = useState(false);
  const [medSeconds, setMedSeconds] = useState(60);
  const [medInterval, setMedInterval] = useState<any>(null);

  // Pediatric Growth Calculator
  const [childAge, setChildAge] = useState("3"); // years
  const [childWeight, setChildWeight] = useState("14"); // kg
  const [vaccineAlerts, setVaccineAlerts] = useState([
    { name: "MMR Vaccine", date: "Due in 15 days", done: false },
    { name: "DPT Booster", date: "Due in 3 months", done: false }
  ]);

  // Symptoms submission handler
  const handleAssess = () => {
    if (symptoms.length === 0) return;
    setAssessing(true);
    setTimeout(() => {
      setAssessing(false);
      if (symptoms.includes("fever") && symptoms.includes("cough")) {
        setDiagnosedDisease(isHi ? "सामान्य इन्फ्लुएंजा / फ्लू (आराम करें और तरल पदार्थ लें)" : "Mild Influenza / Flu (Rest & Stay Hydrated)");
      } else if (symptoms.includes("headache") && symptoms.includes("fatigue")) {
        setDiagnosedDisease(isHi ? "तनाव जनित सिरदर्द (हाइड्रेटेड रहें, विश्राम करें)" : "Tension Headache / Fatigue (Dehydration/Stress)");
      } else {
        setDiagnosedDisease(isHi ? "हल्के लक्षण (चिकित्सक से परामर्श लें)" : "Mild Symptoms (Monitor & Consult Seva center doctor)");
      }
    }, 1500);
  };

  // BMI calculator
  const calculateBmi = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // to meters
    if (w > 0 && h > 0) {
      setBmiResult(parseFloat((w / (h * h)).toFixed(1)));
    }
  };

  // Fitness score calculator
  const calculateWellnessScore = () => {
    const sleep = parseFloat(sleepHours) || 0;
    const ex = parseFloat(exerciseMin) || 0;
    const water = parseFloat(waterCups) || 0;
    
    // Weighted wellness calculation
    let score = (sleep * 5) + (ex * 1.5) + (water * 5);
    setWellnessScore(Math.min(100, Math.round(score)));
  };

  // Sync Vitals simulation
  const syncDevice = () => {
    setSyncingVitals(true);
    setTimeout(() => {
      setSyncingVitals(false);
      setDeviceConnected(true);
      setStepCount(8420);
      setHeartRate(78);
      setSleepCycle("7h 45m (Deep: 2h)");
    }, 2000);
  };

  // Log food/calories
  const logMeal = (calories: number) => {
    setCalorieCount(prev => prev + calories);
  };

  // Add medication
  const addMedication = () => {
    if (!newMedName) return;
    setMedicines(prev => [...prev, { name: newMedName, time: newMedTime, taken: false }]);
    setNewMedName("");
  };

  // Toggle med taken
  const toggleMed = (idx: number) => {
    setMedicines(prev => prev.map((med, i) => i === idx ? { ...med, taken: !med.taken } : med));
  };

  // Guided Meditation countdown
  useEffect(() => {
    if (meditating && medSeconds > 0) {
      const timer = setInterval(() => {
        setMedSeconds(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (medSeconds === 0) {
      setMeditating(false);
      setMedSeconds(60);
    }
  }, [meditating, medSeconds]);

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn font-sans">
      {/* Header Area */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 pt-6 pb-6 px-5 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl text-white tracking-wide">
              {isHi ? "आर.पी. स्वास्थ्य सेवा केंद्र" : "Health Care Portal"}
            </h2>
            <p className="text-xs text-blue-100 mt-0.5 font-bold">
              {isHi ? "प्रीमियम स्वास्थ्य मापन, स्त्री स्वास्थ्य व शिशु सुरक्षा" : "Premium health assessments, step counters & trackers"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm overflow-x-auto no-scrollbar justify-between">
        {[
          { id: "assess", en: "Assessments", hi: "स्वास्थ्य मापन" },
          { id: "tracker", en: "Fitness Log", hi: "दैनिक ट्रैकर" },
          { id: "welfare", en: "Family Care", hi: "पारिवारिक सुरक्षा" },
          { id: "clinical", en: "Clinical Hub", hi: "क्लीनिकल हब" }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3.5 px-2 text-[10px] uppercase tracking-wider font-extrabold text-center transition border-b-2 whitespace-nowrap ${
              activeTab === tab.id ? "border-blue-600 text-blue-800" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {isHi ? tab.hi : tab.en}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        
        {/* ==================== TAB 1: PREMIUM ASSESSMENTS ==================== */}
        {activeTab === "assess" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Symptoms Assessment */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-4">
              <h4 className="font-display font-bold text-xs text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-4.5 h-4.5 text-blue-600" />
                {isHi ? "लक्षण स्व-मूल्यांकन (Symptoms Assessment)" : "Premium Symptoms Assessment"}
              </h4>

              <p className="text-[11px] text-slate-500 font-bold leading-normal">
                {isHi ? "अपने लक्षणों का चयन करें और तत्काल सलाह प्राप्त करें:" : "Select your current symptoms to evaluate fitness advisories:"}
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  { id: "fever", en: "Fever", hi: "बुखार" },
                  { id: "cough", en: "Cough", hi: "खांसी" },
                  { id: "headache", en: "Headache", hi: "सिरदर्द" },
                  { id: "fatigue", en: "Fatigue / Body Ache", hi: "थकान / बदन दर्द" },
                  { id: "nausea", en: "Nausea", hi: "मतली" }
                ].map(sym => (
                  <button
                    key={sym.id}
                    onClick={() => {
                      if (symptoms.includes(sym.id)) {
                        setSymptoms(prev => prev.filter(s => s !== sym.id));
                      } else {
                        setSymptoms(prev => [...prev, sym.id]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition ${
                      symptoms.includes(sym.id) 
                        ? "bg-blue-50 border-blue-500 text-blue-700" 
                        : "bg-white border-slate-200 text-slate-650"
                    }`}
                  >
                    {isHi ? sym.hi : sym.en}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                {assessing ? (
                  <div className="flex items-center gap-2 justify-center py-2 text-xs font-bold text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>{isHi ? "लक्षणों का विश्लेषण हो रहा है..." : "Analyzing symptoms..."}</span>
                  </div>
                ) : diagnosedDisease ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 space-y-2">
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider block">Assessment Recommendation</span>
                    <p className="text-xs font-bold text-slate-800 leading-snug">{diagnosedDisease}</p>
                    <button 
                      onClick={() => { setDiagnosedDisease(""); setSymptoms([]); }}
                      className="text-[10px] text-blue-700 font-bold underline"
                    >
                      {isHi ? "पुनः जांचें" : "Reset Assessment"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAssess}
                    disabled={symptoms.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition disabled:opacity-50"
                  >
                    {isHi ? "लक्षण विश्लेषण सबमिट करें" : "Assess Health Metrics Now"}
                  </button>
                )}
              </div>
            </div>

            {/* BMI Calculator */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-4">
              <h4 className="font-display font-bold text-xs text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Activity className="w-4.5 h-4.5 text-emerald-600" />
                {isHi ? "बॉडी मास इंडेक्स (BMI Calculator)" : "BMI & Body Index Calculator"}
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                    {isHi ? "वजन (Weight - KG)" : "Weight (KG)"}
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 70"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                    {isHi ? "लंबाई (Height - CM)" : "Height (CM)"}
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="e.g. 175"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              {bmiResult !== null && (
                <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider block">Your BMI</span>
                    <span className="text-lg font-black text-slate-800">{bmiResult}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-800">
                    {bmiResult < 18.5 ? (isHi ? "अंडरवेट (Underweight)" : "Underweight")
                      : bmiResult < 24.9 ? (isHi ? "सामान्य वजन (Normal)" : "Normal")
                      : (isHi ? "ओवरवेट (Overweight)" : "Overweight")}
                  </span>
                </div>
              )}

              <button
                onClick={calculateBmi}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                {isHi ? "बीएमआई की गणना करें" : "Calculate BMI Index"}
              </button>
            </div>

            {/* Health Score Questionnaire */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-4">
              <h4 className="font-display font-bold text-xs text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Award className="w-4.5 h-4.5 text-indigo-650" />
                {isHi ? "स्वास्थ्य व फिटनेस स्कोर कैलकुलेटर" : "Physical Health Score Evaluation"}
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                    {isHi ? "नींद के घंटे (Sleep Hours / Day)" : "Daily Sleep Hours"}
                  </label>
                  <input
                    type="number"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                    {isHi ? "व्यायाम का समय (Exercise Minutes / Day)" : "Daily Exercise (Minutes)"}
                  </label>
                  <input
                    type="number"
                    value={exerciseMin}
                    onChange={(e) => setExerciseMin(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                    {isHi ? "पानी का सेवन (Water Glasses / Day)" : "Daily Water Intake (Glasses)"}
                  </label>
                  <input
                    type="number"
                    value={waterCups}
                    onChange={(e) => setWaterCups(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              {wellnessScore !== null && (
                <div className="bg-indigo-50 border border-indigo-150 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider block">Wellness Index Score</span>
                    <span className="text-xl font-black text-indigo-900">{wellnessScore} / 100</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-850">
                    {wellnessScore > 80 ? (isHi ? "उत्कृष्ट (Excellent)" : "Excellent")
                      : wellnessScore > 50 ? (isHi ? "मध्यम (Good)" : "Good")
                      : (isHi ? "ध्यान देने की आवश्यकता (Needs Improvement)" : "Needs Attention")}
                  </span>
                </div>
              )}

              <button
                onClick={calculateWellnessScore}
                className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                {isHi ? "हेल्थ स्कोर निकालें" : "Evaluate Health Score"}
              </button>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: DAILY FITNESS LOG ==================== */}
        {activeTab === "tracker" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Wearable Sync Panel */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4.5 text-white shadow-md space-y-3.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
              
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  {isHi ? "स्मार्ट वियरेबल सिंक" : "Wearable Smart Band Sync"}
                </h4>
                <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full ${
                  deviceConnected ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-slate-700 text-slate-350"
                }`}>
                  {deviceConnected ? (isHi ? "सिंक किया गया" : "Synced") : (isHi ? "असंयोजित" : "Not Synced")}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                  <span className="text-[8.5px] text-slate-400 block font-bold uppercase">{isHi ? "कदम" : "Steps"}</span>
                  <span className="text-sm font-black text-white">{stepCount}</span>
                </div>
                <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                  <span className="text-[8.5px] text-slate-400 block font-bold uppercase">{isHi ? "हृदय गति" : "Heart Rate"}</span>
                  <span className="text-sm font-black text-rose-400">{heartRate} bpm</span>
                </div>
                <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                  <span className="text-[8.5px] text-slate-400 block font-bold uppercase">{isHi ? "नींद" : "Sleep Cycle"}</span>
                  <span className="text-xs font-black text-blue-400 truncate block mt-0.5">{sleepCycle}</span>
                </div>
              </div>

              {syncingVitals ? (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 py-1.5">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>{isHi ? "डिवाइस से डेटा सिंक हो रहा है..." : "Syncing band parameters..."}</span>
                </div>
              ) : (
                <button
                  onClick={syncDevice}
                  className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-2 rounded-xl text-xs shadow-sm transition"
                >
                  {isHi ? "वियरेबल डिवाइस से सिंक करें" : "Simulate Wearable Device Sync"}
                </button>
              )}
            </div>

            {/* Drink Water Tracker */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h4 className="font-display font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Droplets className="w-4.5 h-4.5 text-blue-500 fill-blue-50" />
                  {isHi ? "जल सेवन ट्रैकर (Water Tracker)" : "Water Intake Log"}
                </h4>
                <span className="text-xs font-black text-blue-700">{waterCount} / 8 Cups</span>
              </div>

              <div className="flex justify-center gap-1.5 py-2">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-6 h-8 rounded-b-md border-2 transition ${
                      i < waterCount ? "bg-blue-500 border-blue-600" : "bg-slate-50 border-slate-300"
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setWaterCount(prev => Math.min(8, prev + 1))}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs transition"
                >
                  {isHi ? "+1 कप पानी पिएं" : "+1 Cup Water"}
                </button>
                <button
                  onClick={() => setWaterCount(0)}
                  className="bg-slate-100 border border-slate-300 hover:bg-slate-200 px-3 py-2.5 rounded-xl text-xs font-bold transition text-slate-600"
                >
                  {isHi ? "रीसेट" : "Reset"}
                </button>
              </div>
            </div>

            {/* Food Intake & Calorie Tracker */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h4 className="font-display font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Dumbbell className="w-4.5 h-4.5 text-orange-600" />
                  {isHi ? "दैनिक कैलोरी व भोजन लॉग" : "Food Logs & Calorie Tracker"}
                </h4>
                <span className="text-xs font-black text-orange-600">{calorieCount} kCal / 2000 Target</span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Quick Log Meals:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => logMeal(350)}
                    className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-xl text-[10px] font-bold transition"
                  >
                    🍳 {isHi ? "नाश्ता (+350)" : "Breakfast (+350)"}
                  </button>
                  <button 
                    onClick={() => logMeal(650)}
                    className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-xl text-[10px] font-bold transition"
                  >
                    🍲 {isHi ? "दोपहर (+650)" : "Lunch (+650)"}
                  </button>
                  <button 
                    onClick={() => logMeal(500)}
                    className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-xl text-[10px] font-bold transition"
                  >
                    🍛 {isHi ? "रात (+500)" : "Dinner (+500)"}
                  </button>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-orange-650" />
                  <span className="text-[10px] font-bold text-slate-700">{isHi ? `व्यायाम समय: ${exerciseMinCount} मिनट` : `Exercise progress: ${exerciseMinCount} mins`}</span>
                </div>
                <button
                  onClick={() => {
                    setExerciseMinCount(prev => prev + 15);
                    setCalorieCount(prev => Math.max(0, prev - 150));
                  }}
                  className="bg-white border border-orange-200 px-3 py-1 rounded-lg text-[9.5px] font-black text-orange-600 transition shadow-2xs hover:bg-orange-100/50"
                >
                  {isHi ? "+15 मिनट वर्कआउट" : "+15 mins Workout"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: FAMILY & WELFARE CARE ==================== */}
        {activeTab === "welfare" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Women's Health Hub */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-4">
              <h4 className="font-display font-bold text-xs text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Zap className="w-4.5 h-4.5 text-pink-500" />
                {isHi ? "महिला स्वास्थ्य सुरक्षा (Women's Health)" : "Women's Health & Cycle Tracking"}
              </h4>

              <div className="space-y-3">
                <div className="bg-pink-50/50 border border-pink-100 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-bold">{isHi ? "मासिक धर्म चक्र" : "Menstrual Cycle"}</span>
                    <span className="text-pink-700 font-black">{isHi ? `दिन ${periodDay}` : `Day ${periodDay} of 28`}</span>
                  </div>
                  <input 
                    type="range" min="1" max="28" 
                    value={periodDay} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setPeriodDay(val);
                      setOvulationDay(val + 2);
                    }}
                    className="w-full accent-pink-500" 
                  />
                  <div className="flex justify-between text-[9px] text-pink-600 font-bold uppercase tracking-widest pt-1">
                    <span>{isHi ? "सुरक्षित अवधि" : "Safe Period"}</span>
                    <span>{isHi ? `संभावित ओव्यूलेशन: दिन ${ovulationDay}` : `Est. Ovulation: Day ${ovulationDay}`}</span>
                  </div>
                </div>

                <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <span className="text-[8.5px] font-black text-rose-700 uppercase tracking-wider block">{isHi ? "गर्भावस्था ट्रैकर" : "Pregnancy Progress Tracker"}</span>
                    <span className="text-xs font-black text-slate-800">{isHi ? `सप्ताह ${pregnancyWeek}` : `Week ${pregnancyWeek} (First Trimester)`}</span>
                  </div>
                  <button 
                    onClick={() => setPregnancyWeek(prev => prev + 1)}
                    className="bg-white border border-rose-200 px-3 py-1 rounded-lg text-[9px] font-black text-rose-600 transition"
                  >
                    +1 Week
                  </button>
                </div>
              </div>
            </div>

            {/* Mental Health Hub */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-4">
              <h4 className="font-display font-bold text-xs text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Smile className="w-4.5 h-4.5 text-purple-600" />
                {isHi ? "मानसिक स्वास्थ्य व योग केंद्र" : "Mental Health & Meditation"}
              </h4>

              <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold text-slate-600">
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl space-y-1">
                  <span className="block text-base">🧘</span>
                  <span>{isHi ? "प्राणायाम योग मुद्रा" : "Pranayama Yoga Pose"}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl space-y-1">
                  <span className="block text-base">🔋</span>
                  <span>{isHi ? "तनाव स्तर परीक्षण" : "Anxiety/Stress Test"}</span>
                </div>
              </div>

              <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black text-purple-700 uppercase tracking-wider block">{isHi ? "ध्यान टाइमर (Meditation Timer)" : "Guided Meditation Timer"}</span>
                  <span className="text-sm font-mono font-black text-slate-800">00:{medSeconds.toString().padStart(2, "0")}</span>
                </div>

                {meditating ? (
                  <button
                    onClick={() => { setMeditating(false); setMedSeconds(60); }}
                    className="bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={() => setMeditating(true)}
                    className="bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                  >
                    Start Timer
                  </button>
                )}
              </div>
            </div>

            {/* Paediatric Care */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-4">
              <h4 className="font-display font-bold text-xs text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <User className="w-4.5 h-4.5 text-teal-650" />
                {isHi ? "शिशु सुरक्षा व टीकाकरण (Paediatric)" : "Paediatric Care & Growth Tracker"}
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9.5px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                    {isHi ? "शिशु की उम्र (वर्ष)" : "Child's Age (Years)"}
                  </label>
                  <input
                    type="number"
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[9.5px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                    {isHi ? "शिशु का वजन (KG)" : "Child's Weight (KG)"}
                  </label>
                  <input
                    type="number"
                    value={childWeight}
                    onChange={(e) => setChildWeight(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              {/* Vaccine Alerts list */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest block">{isHi ? "टीकाकरण समय-सारणी" : "Immunization Alerts"}</span>
                {vaccineAlerts.map((alert, idx) => (
                  <div key={idx} className="bg-teal-50/50 border border-teal-100 rounded-xl p-2.5 flex justify-between items-center text-[11px]">
                    <div>
                      <span className="font-bold text-teal-900 block">{alert.name}</span>
                      <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">{alert.date}</span>
                    </div>
                    <button 
                      onClick={() => setVaccineAlerts(prev => prev.map((item, i) => i === idx ? { ...item, done: !item.done } : item))}
                      className={`text-[9px] font-black px-2 py-1 rounded-lg border transition ${
                        alert.done 
                          ? "bg-green-100 border-green-200 text-green-700" 
                          : "bg-white border-teal-200 text-teal-600"
                      }`}
                    >
                      {alert.done ? "✓ Done" : "Mark Done"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: CLINICAL DIRECTORY ==================== */}
        {activeTab === "clinical" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Nearby Hospital Finder */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-4">
              <h4 className="font-display font-bold text-xs text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <MapPin className="w-4.5 h-4.5 text-red-500" />
                {isHi ? "निकटतम चिकित्सालय (Nearby Hospitals)" : "Nearby Hospitals & Clinics"}
              </h4>

              <div className="space-y-3">
                {[
                  { name: "Sehore District General Hospital", spec: "General Medicine, Emergency, Surgery", dist: "1.2 km" },
                  { name: "People's Seva Health Center", spec: "Diagnostics, Pediatric care, Dental", dist: "3.5 km" },
                  { name: "Apex Trauma Care & Cardiac Center", spec: "Specialist Surgery, Cardiology", dist: "4.8 km" }
                ].map((hosp, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-800 text-xs block leading-tight">{hosp.name}</span>
                      <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full shrink-0">{hosp.dist}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold">{hosp.spec}</p>
                    <button 
                      onClick={() => alert(`Navigating to ${hosp.name}...`)}
                      className="text-[9.5px] font-black text-blue-650 flex items-center gap-1 hover:underline pt-1"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{isHi ? "मार्गदर्शन प्राप्त करें" : "Get Directions"}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Medication & Drugs Compliance Tracker */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-4">
              <h4 className="font-display font-bold text-xs text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Clock className="w-4.5 h-4.5 text-blue-750" />
                {isHi ? "दवा ट्रैकर व रिमाइंडर" : "Medication Tracker & Alarms"}
              </h4>

              {/* Medicine Add form */}
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  placeholder={isHi ? "दवा का नाम..." : "Medicine name..."} 
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-bold"
                />
                <select 
                  value={newMedTime}
                  onChange={(e) => setNewMedTime(e.target.value)}
                  className="border border-slate-200 rounded-xl px-2 py-2 text-[10px] outline-none font-bold"
                >
                  <option value="08:00 AM">08:00 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="09:00 PM">09:00 PM</option>
                </select>
                <button 
                  onClick={addMedication}
                  className="bg-blue-600 text-white rounded-xl px-3 py-2 text-xs font-bold hover:bg-blue-700 transition"
                >
                  Add
                </button>
              </div>

              {/* List of current medicines */}
              <div className="space-y-2 pt-1">
                {medicines.map((med, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{med.name}</span>
                      <span className="text-[9.5px] font-bold text-slate-400 block mt-0.5">🔔 Alarm: {med.time}</span>
                    </div>
                    
                    <button 
                      onClick={() => toggleMed(idx)}
                      className={`text-[9.5px] font-black px-2.5 py-1.5 rounded-xl border transition ${
                        med.taken 
                          ? "bg-green-100 border-green-200 text-green-700" 
                          : "bg-white border-slate-200 text-slate-650 hover:bg-slate-100"
                      }`}
                    >
                      {med.taken ? (isHi ? "✓ ले ली गई" : "✓ Taken") : (isHi ? "मार्क करें" : "Mark Taken")}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
