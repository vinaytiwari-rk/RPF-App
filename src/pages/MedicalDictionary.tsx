import React, { useState } from 'react';
import { BookOpen, Search, Stethoscope, ChevronRight, AlertCircle, HeartPulse, Activity } from 'lucide-react';

const MOCK_DICTIONARY = [
  { term: "Hypertension", definition: "High blood pressure. A condition in which the force of the blood against the artery walls is too high.", category: "Condition" },
  { term: "Hypoglycemia", definition: "Low blood sugar, the body's main energy source.", category: "Condition" },
  { term: "Paracetamol", definition: "A common painkiller used to treat aches and pain, and to reduce a high temperature.", category: "Medication" },
  { term: "Ibuprofen", definition: "Nonsteroidal anti-inflammatory drug (NSAID) used for treating pain, fever, and inflammation.", category: "Medication" },
  { term: "CPR", definition: "Cardiopulmonary resuscitation. An emergency lifesaving procedure performed when the heart stops beating.", category: "First Aid" },
  { term: "Asthma", definition: "A condition in which a person's airways become inflamed, narrow and swell, and produce extra mucus, which makes it difficult to breathe.", category: "Condition" },
  { term: "Diabetes Mellitus", definition: "A disease in which the body's ability to produce or respond to the hormone insulin is impaired, resulting in abnormal metabolism of carbohydrates and elevated levels of glucose in the blood.", category: "Condition" },
  { term: "Heimlich Maneuver", definition: "First-aid procedure used to treat upper airway obstructions (or choking) by foreign objects.", category: "First Aid" },
  { term: "Amoxicillin", definition: "An antibiotic often used for the treatment of a number of bacterial infections.", category: "Medication" },
  { term: "Tachycardia", definition: "A heart rate that's too fast. For adults, a heart rate of more than 100 beats per minute is considered tachycardia.", category: "Symptom" }
];

export default function MedicalDictionary() {
  const [search, setSearch] = useState('');
  
  const filtered = MOCK_DICTIONARY.filter(item => 
    item.term.toLowerCase().includes(search.toLowerCase()) || 
    item.definition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-[#138808] pt-12 pb-6 px-6 text-white rounded-b-[2.5rem] shadow-md relative overflow-hidden z-10 flex-shrink-0">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl tracking-tight leading-none">Medical Dict</h1>
              <p className="text-green-100 text-[10px] font-bold uppercase tracking-wider mt-1">Health Glossary & First Aid</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-700" />
            <input 
              type="text" 
              placeholder="Search diseases, drugs, or first-aid..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white text-slate-800 placeholder-slate-400 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3 relative z-20 -mt-2">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 mb-2">
          {search ? `Found ${filtered.length} results` : "Popular Terms"}
        </p>

        {filtered.map((item, i) => (
          <div key={i} className="glass-card p-4 !rounded-2xl flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-slate-800 text-sm">{item.term}</h3>
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0
                ${item.category === 'Condition' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                  item.category === 'Medication' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                  item.category === 'First Aid' ? 'bg-rose-50 text-rose-600 border-rose-200' : 
                  'bg-slate-100 text-slate-600 border-slate-200'}`}
              >
                {item.category}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {item.definition}
            </p>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 px-4">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-500">No definitions found.</p>
            <p className="text-xs text-slate-400 mt-1">Try searching for generic names or simpler terms.</p>
          </div>
        )}
      </div>
      
      {/* Disclaimer */}
      <div className="fixed bottom-16 left-0 right-0 p-4 pointer-events-none z-30">
         <div className="bg-slate-800/80 backdrop-blur-md text-slate-200 text-[9px] p-3 rounded-xl border border-slate-700 font-semibold shadow-xl">
           <AlertCircle className="w-3 h-3 inline mr-1 text-amber-500 mb-0.5" />
           This dictionary is for informational purposes only. Do not use this as a substitute for professional medical advice. Always consult a doctor.
         </div>
      </div>
    </div>
  );
}
