import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Heart, Activity, CheckCircle, Navigation, Award, Calendar, 
  MapPin, Dumbbell, Droplets, Clock, Plus, ShieldAlert, 
  Smile, User, Zap, BookOpen, Volume2, Search, Bell, AlertCircle, Loader2, Trash2
} from "lucide-react";
import { 
  assessSymptoms, calculateBmiValue, calculateWellnessValue, 
  getBpStatus, getSugarStatus, getPregnancyGestation, getChildGrowthStatus 
} from "../utils/healthCalculators";
import PrescriptionScanner from "../components/PrescriptionScanner";

export default function HealthCare() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const isHi = lang === "hi";

  const [activeTab, setActiveTab] = useState<"assess" | "tracker" | "welfare" | "clinical" | "tools">("assess");

  // --- SMART CALCULATORS STATE ---
  const [activeCalc, setActiveCalc] = useState<string | null>(null);
  const [systolicBP, setSystolicBP] = useState(120);
  const [diastolicBP, setDiastolicBP] = useState(80);
  const [sugarFasting, setSugarFasting] = useState(90);
  const [pregnancyMonths, setPregnancyMonths] = useState(3);
  const [dueDateIssueDate, setDueDateIssueDate] = useState("");
  const [kidAgeYears, setKidAgeYears] = useState(2);
  const [kidWeightKg, setKidWeightKg] = useState(12);
  const [dailyCaloriesGoal, setDailyCaloriesGoal] = useState(2000);
  const [burnActivityMins, setBurnActivityMins] = useState(30);

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
  const [medicines, setMedicines] = useState<any[]>([]);
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

  // Medical Dictionary states
  const [dictQuery, setDictQuery] = useState("");
  const [dictResult, setDictResult] = useState<any>(null);
  const [dictLoading, setDictLoading] = useState(false);

  // Load health data from database
  const fetchVitals = async () => {
    try {
      const token = localStorage.getItem("@rpf_token");
      const res = await fetch("/api/health-vitals", {
        headers: { "Authorization": `Bearer ${token || ""}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          setStepCount(d.steps);
          setWaterCount(d.water_cups);
          setCalorieCount(d.calories);
          setExerciseMinCount(d.exercise_mins);
          setWeight(d.weight ? d.weight.toString() : "");
          setHeight(d.height ? d.height.toString() : "");
          setBmiResult(d.bmi ? Number(d.bmi) : null);
          setSleepHours(d.sleep_hours ? d.sleep_hours.toString() : "7");
          setHeartRate(d.heart_rate || 72);
          setSleepCycle(d.sleep_cycle || "7h 15m");
          setPeriodDay(d.period_day || 12);
          setOvulationDay((d.period_day || 12) + 2);
          setPregnancyWeek(d.pregnancy_week || 8);
        }
      }
    } catch (err) {
      console.error("Error loading health vitals:", err);
    }
  };

  const saveVitals = async (updates: any) => {
    try {
      const token = localStorage.getItem("@rpf_token");
      await fetch("/api/health-vitals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ""}`
        },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error("Error saving health vitals:", err);
    }
  };

  const fetchMedications = async () => {
    try {
      const token = localStorage.getItem("@rpf_token");
      const res = await fetch("/api/medications", {
        headers: { "Authorization": `Bearer ${token || ""}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setMedicines(json.data || []);
        }
      }
    } catch (err) {
      console.error("Error loading medications:", err);
    }
  };

  const addMedication = async () => {
    if (!newMedName) return;
    try {
      const token = localStorage.getItem("@rpf_token");
      const res = await fetch("/api/medications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ""}`
        },
        body: JSON.stringify({ name: newMedName, alarm_time: newMedTime })
      });
      if (res.ok) {
        fetchMedications();
        setNewMedName("");
      }
    } catch (err) {
      console.error("Error adding medication:", err);
    }
  };

  const toggleMed = async (id: string) => {
    try {
      const token = localStorage.getItem("@rpf_token");
      const res = await fetch(`/api/medications/${id}/toggle`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token || ""}` }
      });
      if (res.ok) {
        fetchMedications();
      }
    } catch (err) {
      console.error("Error toggling medication:", err);
    }
  };

  const deleteMedication = async (id: string) => {
    try {
      const token = localStorage.getItem("@rpf_token");
      const res = await fetch(`/api/medications/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token || ""}` }
      });
      if (res.ok) {
        fetchMedications();
      }
    } catch (err) {
      console.error("Error deleting medication:", err);
    }
  };

  const fetchPediatric = async () => {
    try {
      const token = localStorage.getItem("@rpf_token");
      const res = await fetch("/api/pediatric", {
        headers: { "Authorization": `Bearer ${token || ""}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          if (json.profile) {
            setChildAge(json.profile.child_age || "3");
            setChildWeight(json.profile.child_weight || "14");
          }
          if (json.vaccines) {
            setVaccineAlerts(prev => prev.map(vacc => {
              const matches = json.vaccines.find((v: any) => v.vaccine_name === vacc.name);
              return { ...vacc, done: matches ? matches.done : false };
            }));
          }
        }
      }
    } catch (err) {
      console.error("Error loading pediatric data:", err);
    }
  };

  const savePediatricProfile = async (age: string, weightVal: string) => {
    try {
      const token = localStorage.getItem("@rpf_token");
      await fetch("/api/pediatric", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ""}`
        },
        body: JSON.stringify({ child_age: age, child_weight: weightVal })
      });
    } catch (err) {
      console.error("Error saving pediatric profile:", err);
    }
  };

  const toggleVaccine = async (name: string, doneVal: boolean) => {
    try {
      const token = localStorage.getItem("@rpf_token");
      await fetch("/api/pediatric/vaccine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ""}`
        },
        body: JSON.stringify({ vaccine_name: name, done: doneVal })
      });
      fetchPediatric();
    } catch (err) {
      console.error("Error toggling vaccine:", err);
    }
  };

  useEffect(() => {
    fetchVitals();
    fetchMedications();
    fetchPediatric();
  }, []);

  const searchDictionary = async () => {
    if (!dictQuery.trim()) return;
    setDictLoading(true);
    try {
      const res = await fetch(`/api/health/dictionary?query=${encodeURIComponent(dictQuery)}`);
      const json = await res.json();
      if (json.success) setDictResult(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setDictLoading(false);
    }
  };

  // Symptoms submission handler
  const handleAssess = () => {
    if (symptoms.length === 0) return;
    setAssessing(true);
    setTimeout(() => {
      setAssessing(false);
      setDiagnosedDisease(assessSymptoms(symptoms, isHi));
    }, 1500);
  };

  // BMI calculator
  const calculateBmi = () => {
    const calculated = calculateBmiValue(weight, height);
    if (calculated !== null) {
      setBmiResult(calculated);
      saveVitals({ weight: parseFloat(weight), height: parseFloat(height), bmi: calculated });
    }
  };

  // Fitness score calculator
  const calculateWellnessScore = () => {
    const score = calculateWellnessValue(sleepHours, exerciseMin, waterCups);
    setWellnessScore(score);
    saveVitals({ sleep_hours: parseFloat(sleepHours) || 0 });
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
      saveVitals({ steps: 8420, heart_rate: 78, sleep_cycle: "7h 45m (Deep: 2h)" });
    }, 2000);
  };

  // Log food/calories
  const logMeal = (calories: number) => {
    setCalorieCount(prev => {
      const updated = prev + calories;
      saveVitals({ calories: updated });
      return updated;
    });
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
          { id: "clinical", en: "Clinical Hub", hi: "क्लीनिकल हब" },
          { id: "tools", en: "Calculators", hi: "कैलकुलेटर" }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              if (tab.id === "tools" && !activeCalc) {
                setActiveCalc("bp");
              }
            }}
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
            {/* Manual Vitals Log Panel */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-md space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
              
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  {isHi ? "दैनिक स्वास्थ्य वाइटल्स लॉग" : "Daily Health Vitals Log"}
                </h4>
                <span className="text-[8.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Manual Entry
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[9.5px] text-slate-400 block font-bold uppercase mb-1">{isHi ? "कदम (Steps)" : "Steps Count"}</label>
                  <input 
                    type="number" 
                    value={stepCount} 
                    onChange={e => setStepCount(Number(e.target.value))} 
                    className="w-full bg-white/10 border border-white/10 rounded-xl p-2 text-white font-bold outline-none focus:border-emerald-500" 
                  />
                </div>
                <div>
                  <label className="text-[9.5px] text-slate-400 block font-bold uppercase mb-1">{isHi ? "हृदय गति (HR)" : "Heart Rate (bpm)"}</label>
                  <input 
                    type="number" 
                    value={heartRate} 
                    onChange={e => setHeartRate(Number(e.target.value))} 
                    className="w-full bg-white/10 border border-white/10 rounded-xl p-2 text-white font-bold outline-none focus:border-emerald-500" 
                  />
                </div>
                <div>
                  <label className="text-[9.5px] text-slate-400 block font-bold uppercase mb-1">{isHi ? "नींद चक्र" : "Sleep Duration"}</label>
                  <input 
                    type="text" 
                    value={sleepCycle} 
                    onChange={e => setSleepCycle(e.target.value)} 
                    className="w-full bg-white/10 border border-white/10 rounded-xl p-2 text-white font-bold outline-none focus:border-emerald-500" 
                  />
                </div>
                <div>
                  <label className="text-[9.5px] text-slate-400 block font-bold uppercase mb-1">{isHi ? "व्यायाम (मिनट)" : "Exercise (mins)"}</label>
                  <input 
                    type="number" 
                    value={exerciseMinCount} 
                    onChange={e => setExerciseMinCount(Number(e.target.value))} 
                    className="w-full bg-white/10 border border-white/10 rounded-xl p-2 text-white font-bold outline-none focus:border-emerald-500" 
                  />
                </div>
              </div>

              {syncingVitals ? (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 py-1.5">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-450" />
                  <span>{isHi ? "सुरक्षित किया जा रहा है..." : "Saving health vitals..."}</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSyncingVitals(true);
                    setTimeout(() => {
                      setSyncingVitals(false);
                      saveVitals({ 
                        steps: stepCount, 
                        heart_rate: heartRate, 
                        sleep_cycle: sleepCycle, 
                        exercise_mins: exerciseMinCount 
                      });
                      alert(isHi ? "वाइटल्स सफलतापूर्वक अपडेट किए गए!" : "Vitals saved successfully!");
                    }, 1000);
                  }}
                  className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-2 rounded-xl text-xs shadow-sm transition"
                >
                  {isHi ? "वाइटल्स लॉग सुरक्षित करें" : "Save Health Vitals"}
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
                  onClick={() => {
                    const val = Math.min(8, waterCount + 1);
                    setWaterCount(val);
                    saveVitals({ water_cups: val });
                  }}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs transition"
                >
                  {isHi ? "+1 कप पानी पिएं" : "+1 Cup Water"}
                </button>
                <button
                  onClick={() => {
                    setWaterCount(0);
                    saveVitals({ water_cups: 0 });
                  }}
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
              <button 
                onClick={() => savePediatricProfile(childAge, childWeight)}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-xl text-xs transition mt-2"
              >
                {isHi ? "शिशु प्रोफ़ाइल सहेजें" : "Save Child Profile"}
              </button>

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
                      onClick={() => toggleVaccine(alert.name, !alert.done)}
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
                  { name: "Bhopal District General Hospital", spec: "General Medicine, Emergency, Surgery", dist: "1.2 km" },
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

            {/* Smart Prescription Scanner */}
            <PrescriptionScanner 
              lang={lang} 
              onMedsExtracted={(meds) => {
                const token = localStorage.getItem("@rpf_token");
                meds.forEach(async (medName, index) => {
                  const times = ["08:00 AM", "02:00 PM", "09:00 PM"];
                  const time = times[index % times.length];
                  
                  try {
                    const res = await fetch("/api/medications", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token || ""}`
                      },
                      body: JSON.stringify({ name: medName, alarm_time: time })
                    });
                    if (res.ok) fetchMedications();
                  } catch (e) {
                    console.error(e);
                  }
                });
                alert(isHi ? "दवाइयाँ ट्रैकर में जोड़ दी गई हैं!" : "Medicines added to tracker!");
              }} 
            />

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
                  <div key={med.id || idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{med.name}</span>
                      <span className="text-[9.5px] font-bold text-slate-400 block mt-0.5">🔔 Alarm: {med.time || med.alarm_time}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleMed(med.id)}
                        className={`text-[9.5px] font-black px-2.5 py-1.5 rounded-xl border transition ${
                          med.taken 
                            ? "bg-green-150 border-green-200 text-green-700 font-bold" 
                            : "bg-white border-slate-200 text-slate-650 hover:bg-slate-100 font-bold"
                        }`}
                      >
                        {med.taken ? (isHi ? "✓ ले ली गई" : "✓ Taken") : (isHi ? "मार्क करें" : "Mark Taken")}
                      </button>
                      <button 
                        onClick={() => deleteMedication(med.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-650 p-1.5 rounded-xl border border-red-200 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Medical Dictionary Search */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-4">
              <h4 className="font-display font-bold text-xs text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <BookOpen className="w-4.5 h-4.5 text-indigo-600" />
                {isHi ? "मेडिकल डिक्शनरी" : "AI Medical Dictionary"}
              </h4>
              <p className="text-[10px] text-slate-500">
                {isHi ? "बीमारियों, दवाओं और लक्षणों के बारे में खोजें" : "Search for diseases, drugs, or medical terminology."}
              </p>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={dictQuery}
                  onChange={(e) => setDictQuery(e.target.value)}
                  placeholder={isHi ? "उदा. Diabetes, Paracetamol..." : "e.g. Hypertension, Paracetamol..."} 
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 font-medium bg-slate-50"
                  onKeyDown={(e) => e.key === 'Enter' && searchDictionary()}
                />
                <button 
                  onClick={searchDictionary}
                  disabled={dictLoading || !dictQuery.trim()}
                  className="bg-indigo-600 text-white rounded-xl px-4 py-3 font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {dictLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </button>
              </div>

              {dictResult && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3 mt-4 animate-fadeIn">
                  <h5 className="font-black text-indigo-900 text-sm uppercase tracking-wide">{dictResult.term}</h5>
                  <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                    {dictResult.definition}
                  </p>
                  
                  {dictResult.symptoms && dictResult.symptoms.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-indigo-800 uppercase block mb-1">Common Symptoms</span>
                      <ul className="list-disc pl-5 text-[11px] text-slate-700 space-y-0.5">
                        {dictResult.symptoms.map((sym: string, i: number) => <li key={i}>{sym}</li>)}
                      </ul>
                    </div>
                  )}

                  {dictResult.treatments && dictResult.treatments.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-indigo-800 uppercase block mb-1">General Treatments</span>
                      <ul className="list-disc pl-5 text-[11px] text-slate-700 space-y-0.5">
                        {dictResult.treatments.map((trt: string, i: number) => <li key={i}>{trt}</li>)}
                      </ul>
                    </div>
                  )}
                  
                  <div className="bg-amber-50 border border-amber-200 p-2 rounded flex gap-2 items-start mt-3">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-amber-800 font-bold leading-tight">
                      Disclaimer: This information is AI-generated for educational purposes only and is not medical advice.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {activeTab === "tools" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="font-display font-black text-xs text-[#000080] uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>{isHi ? "स्वास्थ्य संकेतक और योजना टूल्स" : "Health Indicators & Care Planners"}</span>
            <Heart className="w-4.5 h-4.5 text-red-500 animate-pulse" />
          </h4>

          {/* Tools Grid */}
          <div className="grid grid-cols-2 gap-2 text-center text-slate-750">
            {[
              { key: "bp", title: isHi ? "ब्लड प्रेशर संकेतक" : "Blood Pressure Risk" },
              { key: "diabetes", title: isHi ? "ब्लड शुगर जांच" : "Diabetes Risk Check" },
              { key: "pregnancy", title: isHi ? "गर्भावस्था प्रसव कैलकुलेटर" : "Pregnancy Planner" },
              { key: "growth", title: isHi ? "बाल विकास वजन इंडेक्स" : "Child Growth Index" }
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

        {/* Content Container */}
        {activeCalc && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-2 space-y-4 animate-fadeIn text-xs text-slate-700">
            
            {/* 1. Hypertension Risk */}
            {activeCalc === "bp" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{isHi ? "रक्तचाप (BP) श्रेणी एवं हृदय जोखिम निर्धारक" : "Hypertension (BP) Classification"}</h5>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{isHi ? `सिस्टोलिक (Systolic): ${systolicBP} mmHg` : `Systolic BP: ${systolicBP} mmHg`}</label>
                    <input type="range" min="90" max="180" value={systolicBP} onChange={e => setSystolicBP(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{isHi ? `डायस्टोलिक (Diastolic): ${diastolicBP} mmHg` : `Diastolic BP: ${diastolicBP} mmHg`}</label>
                    <input type="range" min="60" max="110" value={diastolicBP} onChange={e => setDiastolicBP(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                </div>

                {(() => {
                  const { status, advice, color } = getBpStatus(systolicBP, diastolicBP, isHi);
                  return (
                    <div className={`p-3 rounded-lg border font-bold text-center ${color}`}>
                      <p className="text-xs font-black">{status}</p>
                      <p className="text-[9.5px] mt-1 text-slate-500 font-semibold">{advice}</p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 2. Diabetes Risk Check */}
            {activeCalc === "diabetes" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{isHi ? "फास्टिंग ब्लड ग्लूकोज (शुगर) जाँच" : "Fasting Blood Sugar Risk Assessor"}</h5>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">{isHi ? `फास्टिंग शुगर: ${sugarFasting} mg/dL` : `Fasting Glucose: ${sugarFasting} mg/dL`}</label>
                  <input type="range" min="70" max="250" value={sugarFasting} onChange={e => setSugarFasting(Number(e.target.value))} className="w-full accent-[#000080]" />
                </div>

                {(() => {
                  const { status, advice, color } = getSugarStatus(sugarFasting, isHi);
                  return (
                    <div className={`p-3 rounded-lg border font-bold text-center ${color}`}>
                      <p className="text-xs font-black">{status}</p>
                      <p className="text-[9.5px] mt-1 text-slate-500 font-semibold">{advice}</p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 3. Pregnancy Planner */}
            {activeCalc === "pregnancy" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{isHi ? "गर्भावस्था प्रसव तिथि और माइलस्टोन कैलकुलेटर" : "Pregnancy Due Date & Milestone Planner"}</h5>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">{isHi ? "अंतिम मासिक धर्म (LMP) की तारीख" : "Last Menstrual Period (LMP) Date"}</label>
                  <input type="date" value={dueDateIssueDate} onChange={e => setDueDateIssueDate(e.target.value)} className="w-full border border-slate-200 rounded p-2 text-xs font-bold bg-white" />
                </div>

                {(() => {
                  const data = getPregnancyGestation(dueDateIssueDate);
                  if (!data) return <p className="text-slate-400 text-center font-bold">{isHi ? "तारीख चुनें।" : "Select date above."}</p>;
                  
                  return (
                    <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-lg text-slate-800 font-bold space-y-1.5">
                      <p className="flex justify-between"><span>{isHi ? "संभावित प्रसव तिथि (EDD):" : "Estimated Due Date:"}</span><span className="text-[#000080]">{data.edd}</span></p>
                      <p className="flex justify-between"><span>{isHi ? "वर्तमान गर्भकाल सप्ताह:" : "Current Gestation:"}</span><span className="text-green-700">{data.weeks} weeks</span></p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 4. Child Growth Index */}
            {activeCalc === "growth" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{isHi ? "बाल विकास वजन सूचकांक (WHO मानकों के आधार पर)" : "Pediatric Weight-for-Age Assessor"}</h5>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{isHi ? `बच्चे की आयु: ${kidAgeYears} वर्ष` : `Child Age: ${kidAgeYears} yrs`}</label>
                    <input type="range" min="1" max="5" value={kidAgeYears} onChange={e => setKidAgeYears(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{isHi ? `बच्चे का वजन: ${kidWeightKg} किलो` : `Child Weight: ${kidWeightKg} kg`}</label>
                    <input type="range" min="5" max="25" value={kidWeightKg} onChange={e => setKidWeightKg(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                </div>

                {(() => {
                  const { status, color, standardWeight } = getChildGrowthStatus(kidAgeYears, kidWeightKg, isHi);
                  return (
                    <div className={`p-3 rounded-lg border font-bold text-center ${color}`}>
                      <p className="text-xs font-black">{status}</p>
                      <p className="text-[9px] text-slate-500 mt-1 font-semibold">{isHi ? `(इस आयु के लिए मानक वजन: ~${standardWeight.toFixed(1)} किलो)` : `(Standard median weight for this age: ~${standardWeight.toFixed(1)} kg)`}</p>
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
