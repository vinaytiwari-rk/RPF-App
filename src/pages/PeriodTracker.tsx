import React, { useState, useEffect } from 'react';
import { Calendar, Droplet, Heart, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PeriodLog {
  id: string;
  startDate: string;
  endDate: string;
  symptoms: string[];
}

const SYMPTOMS = ['Cramps', 'Headache', 'Bloating', 'Fatigue', 'Mood Swings', 'Acne'];
const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;

const PeriodTracker: React.FC = () => {
  const [logs, setLogs] = useState<PeriodLog[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [nextPeriodPrediction, setNextPeriodPrediction] = useState<Date | null>(null);

  useEffect(() => {
    const savedLogs = localStorage.getItem('rp_period_logs');
    if (savedLogs) {
      const parsed = JSON.parse(savedLogs);
      setLogs(parsed);
      calculatePrediction(parsed);
    }
  }, []);

  const calculatePrediction = (currentLogs: PeriodLog[]) => {
    if (currentLogs.length === 0) {
      setNextPeriodPrediction(null);
      return;
    }
    
    // Sort by start date descending
    const sorted = [...currentLogs].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    const lastPeriod = new Date(sorted[0].startDate);
    
    // Simple prediction: add 28 days to the last start date
    const next = new Date(lastPeriod);
    next.setDate(next.getDate() + DEFAULT_CYCLE_LENGTH);
    setNextPeriodPrediction(next);
  };

  const handleSaveLog = () => {
    if (startDate) {
      const newLog: PeriodLog = {
        id: Date.now().toString(),
        startDate,
        endDate: endDate || startDate, // Default to start date if end date not provided
        symptoms: selectedSymptoms
      };
      
      const updated = [...logs, newLog];
      setLogs(updated);
      localStorage.setItem('rp_period_logs', JSON.stringify(updated));
      calculatePrediction(updated);
      
      // Reset form
      setStartDate('');
      setEndDate('');
      setSelectedSymptoms([]);
    }
  };

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const getDaysUntilNext = () => {
    if (!nextPeriodPrediction) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = nextPeriodPrediction.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntilNext();

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-8 h-8 text-pink-500" />
            Period & Cycle Tracker
          </h1>
          <p className="text-gray-600">Log your cycle, track symptoms, and view predictions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Prediction Card */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-1 flex flex-col items-center justify-center text-center">
          <div className="w-32 h-32 rounded-full border-4 border-pink-100 flex flex-col items-center justify-center mb-4 relative">
            <svg className="absolute inset-0 w-full h-full text-pink-500" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${Math.max(0, (28 - (daysUntil || 28)) / 28 * 300)} 300`} strokeLinecap="round" transform="rotate(-90 50 50)" />
            </svg>
            <Droplet className="w-8 h-8 text-pink-500 mb-1" />
            <span className="text-2xl font-bold text-gray-900">{daysUntil !== null ? (daysUntil > 0 ? daysUntil : 0) : '?'}</span>
            <span className="text-xs text-gray-500">Days</span>
          </div>
          
          <h2 className="text-lg font-bold text-gray-900">Next Period</h2>
          <p className="text-gray-600 text-sm mt-1">
            {nextPeriodPrediction 
              ? nextPeriodPrediction.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
              : 'Log a period to get predictions'}
          </p>
          
          {daysUntil !== null && daysUntil <= 3 && daysUntil > 0 && (
            <div className="mt-4 px-4 py-2 bg-pink-50 text-pink-700 rounded-lg text-sm font-medium">
              Your period is coming up soon.
            </div>
          )}
        </div>

        {/* Logger Card */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[var(--rp-primary)]" />
            Log Your Cycle
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input 
                type="date" 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
              <input 
                type="date" 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Symptoms
            </label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map(symptom => (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    selectedSymptoms.includes(symptom) 
                      ? 'bg-pink-100 border-pink-300 text-pink-800' 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleSaveLog}
            disabled={!startDate}
            className="w-full sm:w-auto px-6 py-2 bg-[var(--rp-primary)] text-white rounded-lg hover:bg-blue-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Log
          </button>
        </div>
      </div>

      {/* History */}
      <div className="glass-card p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Cycle History</h2>
        
        {logs.length === 0 ? (
          <p className="text-gray-500 italic text-center py-6">No cycles logged yet. Start by adding your most recent period above.</p>
        ) : (
          <div className="space-y-4">
            {[...logs].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(log => (
              <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                    <Droplet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {new Date(log.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      {log.endDate && log.endDate !== log.startDate && (
                        <>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            {new Date(log.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </>
                      )}
                    </div>
                    
                    {log.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {log.symptoms.map(s => (
                          <span key={s} className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Logged
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PeriodTracker;
