import React, { useState, useEffect } from 'react';
import { Activity, Droplets, HeartPulse, Scale, TrendingUp, Save, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

interface DailyVitals {
  date: string;
  steps: number;
  waterGlasses: number;
  bpSystolic: string;
  bpDiastolic: string;
  weight: string;
  height: string; // in cm
}

export default function VitalsDashboard() {
  const today = new Date().toISOString().split('T')[0];
  
  const [vitals, setVitals] = useState<DailyVitals>({
    date: today,
    steps: 0,
    waterGlasses: 0,
    bpSystolic: '',
    bpDiastolic: '',
    weight: '',
    height: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem(`@rpf_vitals_${today}`);
    if (saved) {
      setVitals(JSON.parse(saved));
    }
  }, [today]);

  const handleSave = () => {
    localStorage.setItem(`@rpf_vitals_${today}`, JSON.stringify(vitals));
    toast.success('Vitals saved successfully!', {
      icon: '✅',
      style: { borderRadius: '10px', background: '#333', color: '#fff' },
    });
  };

  // BMI Calculation
  let bmi = 0;
  let bmiCategory = '';
  let bmiColor = '';
  if (vitals.weight && vitals.height) {
    const h = Number(vitals.height) / 100;
    const w = Number(vitals.weight);
    if (h > 0 && w > 0) {
      bmi = w / (h * h);
      if (bmi < 18.5) { bmiCategory = 'Underweight'; bmiColor = 'text-blue-500'; }
      else if (bmi < 25) { bmiCategory = 'Normal'; bmiColor = 'text-emerald-500'; }
      else if (bmi < 30) { bmiCategory = 'Overweight'; bmiColor = 'text-orange-500'; }
      else { bmiCategory = 'Obese'; bmiColor = 'text-rose-500'; }
    }
  }

  const stepsGoal = 10000;
  const stepsPercent = Math.min((vitals.steps / stepsGoal) * 100, 100);
  const waterGoal = 8;
  const waterPercent = Math.min((vitals.waterGlasses / waterGoal) * 100, 100);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-emerald-600 pt-12 pb-6 px-6 text-white rounded-b-[2.5rem] shadow-md relative overflow-hidden z-10 flex-shrink-0">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl tracking-tight leading-none">Vitals Dashboard</h1>
              <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-wider mt-1">Daily Health Logger</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 relative -mt-6 z-20">
        
        {/* Quick Goals */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 !rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-orange-500" /> Steps
              </div>
              <span className="text-[10px] font-bold text-slate-400">{vitals.steps}/{stepsGoal}</span>
            </div>
            <div className="text-xl font-black text-slate-800 mb-2">{vitals.steps}</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${stepsPercent}%` }}></div>
            </div>
            <div className="flex gap-1 mt-3">
              <button onClick={() => setVitals({...vitals, steps: vitals.steps + 500})} className="flex-1 bg-orange-100 text-orange-700 text-xs font-bold py-1 rounded-md active:scale-95 transition">+500</button>
              <button onClick={() => setVitals({...vitals, steps: Math.max(0, vitals.steps - 500)})} className="flex-1 bg-slate-100 text-slate-500 text-xs font-bold py-1 rounded-md active:scale-95 transition">-500</button>
            </div>
          </div>

          <div className="glass-card p-4 !rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Droplets className="w-3 h-3 text-blue-500" /> Water
              </div>
              <span className="text-[10px] font-bold text-slate-400">{vitals.waterGlasses}/{waterGoal}</span>
            </div>
            <div className="text-xl font-black text-slate-800 mb-2">{vitals.waterGlasses} <span className="text-xs text-slate-500">gl</span></div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${waterPercent}%` }}></div>
            </div>
            <div className="flex gap-1 mt-3">
              <button onClick={() => setVitals({...vitals, waterGlasses: vitals.waterGlasses + 1})} className="flex-1 bg-blue-100 text-blue-700 text-xs font-bold py-1 rounded-md active:scale-95 transition">+1</button>
              <button onClick={() => setVitals({...vitals, waterGlasses: Math.max(0, vitals.waterGlasses - 1)})} className="flex-1 bg-slate-100 text-slate-500 text-xs font-bold py-1 rounded-md active:scale-95 transition">-1</button>
            </div>
          </div>
        </div>

        {/* Detailed Metrics Form */}
        <div className="glass-card overflow-hidden !rounded-2xl">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-500" /> Metrics Log
            </h2>
          </div>
          
          <div className="p-4 space-y-4 text-xs">
            {/* Blood Pressure */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Blood Pressure (mmHg)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" placeholder="Systolic (120)" 
                  value={vitals.bpSystolic} onChange={e => setVitals({...vitals, bpSystolic: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center font-semibold focus:outline-none focus:border-emerald-500"
                />
                <span className="text-slate-300 font-black text-lg">/</span>
                <input 
                  type="number" placeholder="Diastolic (80)" 
                  value={vitals.bpDiastolic} onChange={e => setVitals({...vitals, bpDiastolic: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* BMI Calculator */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Scale className="w-3 h-3" /> BMI Calculator</label>
              <div className="flex items-center gap-2 mb-2">
                <input 
                  type="number" placeholder="Weight (kg)" 
                  value={vitals.weight} onChange={e => setVitals({...vitals, weight: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-emerald-500"
                />
                <input 
                  type="number" placeholder="Height (cm)" 
                  value={vitals.height} onChange={e => setVitals({...vitals, height: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>
              {bmi > 0 && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Your BMI</div>
                    <div className="text-xl font-black text-slate-800">{bmi.toFixed(1)}</div>
                  </div>
                  <div className={`text-xs font-black uppercase px-3 py-1 rounded-full bg-white border border-slate-100 ${bmiColor}`}>
                    {bmiCategory}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-sm hover:bg-emerald-700 transition mt-2 flex justify-center items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Today's Vitals
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
