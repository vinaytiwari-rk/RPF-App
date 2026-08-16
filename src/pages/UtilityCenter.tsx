import React, { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Calculator, CheckCircle2, Clock3, Compass, HeartPulse, ListChecks, MessageSquare, Play, RotateCcw, Sparkles, Timer, Wind } from "lucide-react";

type Lang = "en" | "hi";
const MORSE: Record<string, string> = { A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..", "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----." };

function Card({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center"><Icon className="w-5 h-5" /></div><h2 className="font-extrabold text-slate-900">{title}</h2></div>{children}</section>;
}

const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
const buttonClass = "rounded-xl bg-[#000080] text-white px-4 py-2.5 text-sm font-bold active:scale-95 transition";

export default function UtilityCenter() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const isHi = lang === "hi";
  const [bmiWeight, setBmiWeight] = useState(70); const [bmiHeight, setBmiHeight] = useState(170);
  const bmi = useMemo(() => bmiHeight > 0 ? bmiWeight / ((bmiHeight / 100) ** 2) : 0, [bmiWeight, bmiHeight]);
  const [bill, setBill] = useState(1000); const [tip, setTip] = useState(10); const [people, setPeople] = useState(2);
  const perPerson = people > 0 ? (bill * (1 + tip / 100)) / people : 0;
  const [decision, setDecision] = useState(isHi ? "निर्णय लेने के लिए दबाएँ" : "Press to decide");
  const decide = () => setDecision([isHi ? "हाँ" : "Yes", isHi ? "नहीं" : "No", isHi ? "शायद" : "Maybe"][Math.floor(Math.random() * 3)]);
  const [morseText, setMorseText] = useState("");
  const morse = useMemo(() => morseText.toUpperCase().split(" ").map(word => word.split("").map(c => MORSE[c] || "").join(" ")).join(" / "), [morseText]);
  const [pomodoro, setPomodoro] = useState(25 * 60); const [pomodoroRunning, setPomodoroRunning] = useState(false); const pomodoroRef = useRef<number | null>(null);
  useEffect(() => { if (!pomodoroRunning) return; pomodoroRef.current = window.setInterval(() => setPomodoro(v => v > 0 ? v - 1 : 25 * 60), 1000); return () => { if (pomodoroRef.current) window.clearInterval(pomodoroRef.current); }; }, [pomodoroRunning]);
  const [breathing, setBreathing] = useState(false); const [breathPhase, setBreathPhase] = useState(isHi ? "तैयार" : "Ready");
  useEffect(() => { if (!breathing) return; let i = 0; const phases = isHi ? ["सांस लें", "रोकें", "सांस छोड़ें", "रोकें"] : ["Inhale", "Hold", "Exhale", "Hold"]; setBreathPhase(phases[0]); const id = window.setInterval(() => { i = (i + 1) % phases.length; setBreathPhase(phases[i]); }, 4000); return () => window.clearInterval(id); }, [breathing, isHi]);
  const [habit, setHabit] = useState<boolean[]>(() => { try { return JSON.parse(localStorage.getItem("@rpf_utility_habit") || "[]"); } catch { return []; } });
  const toggleHabit = (i: number) => setHabit(prev => { const next = [...prev]; next[i] = !next[i]; localStorage.setItem("@rpf_utility_habit", JSON.stringify(next)); return next; });
  const [fastingStart, setFastingStart] = useState<string | null>(null); const [fastingNow, setFastingNow] = useState(Date.now());
  useEffect(() => { if (!fastingStart) return; const id = window.setInterval(() => setFastingNow(Date.now()), 1000); return () => window.clearInterval(id); }, [fastingStart]);
  const fastingHours = fastingStart ? (fastingNow - Number(fastingStart)) / 3600000 : 0;
  const [typing, setTyping] = useState(""); const sample = "RPF Foundation community service makes a difference.";
  const [typingStart, setTypingStart] = useState<number | null>(null); const wpm = typingStart && typing.length ? Math.round((typing.trim().split(/\s+/).length / Math.max(1, (Date.now() - typingStart) / 60000))) : 0;
  const [calculation, setCalculation] = useState("");
  const calculate = () => { try { if (!/^[0-9+\-*/().%\s]+$/.test(calculation)) return; setCalculation(String(Function(`"use strict"; return (${calculation})`)())); } catch { setCalculation(isHi ? "अमान्य गणना" : "Invalid calculation"); } };
  const resetPomodoro = () => { setPomodoroRunning(false); setPomodoro(25 * 60); };
  const format = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return <div className="p-4 flex-1 min-h-screen bg-slate-50 pb-28 space-y-4">
    <header className="pt-3"><div className="flex items-center gap-2 text-[#000080]"><Sparkles className="w-5 h-5"/><span className="text-xs font-black uppercase tracking-widest">RPF Utility Engine</span></div><h1 className="text-2xl font-black text-slate-900 mt-1">{isHi ? "दैनिक उपयोगिता केंद्र" : "Daily Utility Center"}</h1><p className="text-sm text-slate-500 mt-1">{isHi ? "ऑफलाइन-first छोटे tools, एक ही जगह।" : "Offline-first practical tools, in one place."}</p></header>
    <Card title={isHi ? "BMI Calculator" : "BMI Calculator"} icon={HeartPulse}><div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold text-slate-600">{isHi ? "वजन (kg)" : "Weight (kg)"}<input className={inputClass} type="number" value={bmiWeight} onChange={e => setBmiWeight(Number(e.target.value))}/></label><label className="text-xs font-bold text-slate-600">{isHi ? "ऊंचाई (cm)" : "Height (cm)"}<input className={inputClass} type="number" value={bmiHeight} onChange={e => setBmiHeight(Number(e.target.value))}/></label></div><div className="rounded-xl bg-slate-50 p-4 text-center"><div className="text-3xl font-black text-[#000080]">{bmi.toFixed(1)}</div><div className="text-xs font-bold text-slate-500">{bmi < 18.5 ? (isHi ? "कम" : "Underweight") : bmi < 25 ? (isHi ? "सामान्य" : "Normal") : bmi < 30 ? (isHi ? "अधिक" : "Overweight") : (isHi ? "उच्च" : "Obesity")}</div></div></Card>
    <Card title={isHi ? "Split Bill" : "Split Bill"} icon={Calculator}><div className="grid grid-cols-3 gap-2"><input className={inputClass} type="number" value={bill} onChange={e => setBill(Number(e.target.value))}/><input className={inputClass} type="number" value={tip} onChange={e => setTip(Number(e.target.value))}/><input className={inputClass} type="number" value={people} onChange={e => setPeople(Number(e.target.value))}/></div><div className="text-center text-sm font-black">{isHi ? "प्रति व्यक्ति" : "Per person"}: ₹{perPerson.toFixed(2)}</div></Card>
    <Card title={isHi ? "Pomodoro Timer" : "Pomodoro Timer"} icon={Timer}><div className="text-center"><div className="text-5xl font-black tabular-nums text-[#000080]">{format(pomodoro)}</div><div className="flex justify-center gap-2 mt-4"><button className={buttonClass} onClick={() => setPomodoroRunning(v => !v)}><Play className="inline w-4 h-4 mr-1"/>{pomodoroRunning ? (isHi ? "रोकें" : "Pause") : (isHi ? "शुरू" : "Start")}</button><button className="rounded-xl border px-4 py-2.5 text-sm font-bold" onClick={resetPomodoro}><RotateCcw className="inline w-4 h-4 mr-1"/>Reset</button></div></div></Card>
    <Card title={isHi ? "Breathing Meditator" : "Breathing Meditator"} icon={Wind}><div className={`mx-auto w-32 h-32 rounded-full bg-indigo-50 border-4 border-indigo-200 flex items-center justify-center text-center font-black text-indigo-700 ${breathing ? "animate-pulse scale-110" : ""} transition-transform duration-[4000ms]`}>{breathPhase}</div><div className="text-center mt-4"><button className={buttonClass} onClick={() => setBreathing(v => !v)}>{breathing ? "Stop" : "Start"}</button></div></Card>
    <Card title={isHi ? "Decision Maker" : "Decision Maker"} icon={Compass}><div className="text-center"><div className="text-xl font-black text-slate-800 min-h-8">{decision}</div><button className={`${buttonClass} mt-3`} onClick={decide}>{isHi ? "निर्णय लें" : "Decide"}</button></div></Card>
    <Card title={isHi ? "Morse Code" : "Morse Code"} icon={MessageSquare}><textarea className={`${inputClass} min-h-20`} value={morseText} onChange={e => setMorseText(e.target.value)} placeholder={isHi ? "अंग्रेज़ी text लिखें..." : "Type English text..."}/><div className="rounded-xl bg-slate-900 text-white p-3 text-sm font-mono break-words min-h-12">{morse || "... --- ..."}</div></Card>
    <Card title={isHi ? "Habit Tracker" : "Habit Tracker"} icon={ListChecks}><div className="grid grid-cols-7 gap-2">{Array.from({ length: 7 }, (_, i) => <button key={i} onClick={() => toggleHabit(i)} className={`aspect-square rounded-xl text-xs font-black ${habit[i] ? "bg-green-500 text-white" : "bg-slate-100 text-slate-500"}`}>{i + 1}</button>)}</div><p className="text-xs text-slate-500 font-semibold">{habit.filter(Boolean).length}/7 {isHi ? "दिन पूरे" : "days completed"}</p></Card>
    <Card title={isHi ? "Fasting Tracker" : "Fasting Tracker"} icon={Clock3}><div className="text-center"><div className="text-3xl font-black text-[#000080]">{fastingHours.toFixed(2)}h</div><button className={`${buttonClass} mt-3`} onClick={() => setFastingStart(fastingStart ? null : String(Date.now()))}>{fastingStart ? (isHi ? "समाप्त करें" : "End Fast") : (isHi ? "उपवास शुरू करें" : "Start Fast")}</button></div></Card>
    <Card title={isHi ? "Typing Speed Test" : "Typing Speed Test"} icon={CheckCircle2}><p className="text-sm font-semibold text-slate-600">{sample}</p><textarea className={`${inputClass} min-h-24`} value={typing} onFocus={() => !typingStart && setTypingStart(Date.now())} onChange={e => setTyping(e.target.value)} placeholder="Start typing..."/><div className="text-center text-sm font-black">{wpm} WPM</div></Card>
    <Card title={isHi ? "Quick Calculator" : "Quick Calculator"} icon={Calculator}><div className="flex gap-2"><input className={inputClass} value={calculation} onChange={e => setCalculation(e.target.value)} placeholder="25*4+10"/><button className={buttonClass} onClick={calculate}>=</button></div></Card>
  </div>;
}
