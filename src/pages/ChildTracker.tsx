import React, { useState, useEffect } from 'react';
import { Baby, Calendar, CheckCircle2, Circle, Clock, Camera, Plus, Trash2 } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  monthAge: number;
  completed: boolean;
  completedDate?: string;
  notes?: string;
}

interface ChildProfile {
  name: string;
  birthDate: string;
  gender: string;
}

const DEFAULT_MILESTONES: Milestone[] = [
  { id: 'm1', title: 'Smiles at people', monthAge: 2, completed: false },
  { id: 'm2', title: 'Coos, makes gurgling sounds', monthAge: 2, completed: false },
  { id: 'm3', title: 'Turns head toward sounds', monthAge: 2, completed: false },
  { id: 'm4', title: 'Babbles with expression', monthAge: 4, completed: false },
  { id: 'm5', title: 'Reaches for toy with one hand', monthAge: 4, completed: false },
  { id: 'm6', title: 'Rolls over from tummy to back', monthAge: 4, completed: false },
  { id: 'm7', title: 'Responds to own name', monthAge: 6, completed: false },
  { id: 'm8', title: 'Sits without support', monthAge: 6, completed: false },
  { id: 'm9', title: 'Crawls', monthAge: 9, completed: false },
  { id: 'm10', title: 'Pulls to stand', monthAge: 9, completed: false },
  { id: 'm11', title: 'Says "mama" or "dada"', monthAge: 12, completed: false },
  { id: 'm12', title: 'Walks holding on to furniture', monthAge: 12, completed: false },
  { id: 'm13', title: 'Takes first steps independently', monthAge: 15, completed: false },
];

const ChildTracker: React.FC = () => {
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>(DEFAULT_MILESTONES);
  
  // Setup forms
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupName, setSetupName] = useState('');
  const [setupDate, setSetupDate] = useState('');

  useEffect(() => {
    const savedProfile = localStorage.getItem('rp_child_profile');
    const savedMilestones = localStorage.getItem('rp_child_milestones');
    
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      setIsSettingUp(true);
    }
    
    if (savedMilestones) {
      setMilestones(JSON.parse(savedMilestones));
    }
  }, []);

  const handleSaveProfile = () => {
    if (setupName && setupDate) {
      const newProfile = { name: setupName, birthDate: setupDate, gender: 'Not specified' };
      setProfile(newProfile);
      localStorage.setItem('rp_child_profile', JSON.stringify(newProfile));
      setIsSettingUp(false);
    }
  };

  const toggleMilestone = (id: string) => {
    const updated = milestones.map(m => {
      if (m.id === id) {
        return { 
          ...m, 
          completed: !m.completed, 
          completedDate: !m.completed ? new Date().toISOString() : undefined 
        };
      }
      return m;
    });
    setMilestones(updated);
    localStorage.setItem('rp_child_milestones', JSON.stringify(updated));
  };

  const getAgeString = () => {
    if (!profile) return '';
    const birth = new Date(profile.birthDate);
    const now = new Date();
    
    let months = (now.getFullYear() - birth.getFullYear()) * 12;
    months -= birth.getMonth();
    months += now.getMonth();
    
    if (months < 0) return 'Not born yet';
    if (months === 0) return 'Newborn';
    if (months < 12) return `${months} Months Old`;
    
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    return `${years} Years, ${remMonths} Months Old`;
  };

  // Group milestones by month age
  const groupedMilestones = milestones.reduce((acc, curr) => {
    if (!acc[curr.monthAge]) acc[curr.monthAge] = [];
    acc[curr.monthAge].push(curr);
    return acc;
  }, {} as Record<number, Milestone[]>);

  if (isSettingUp) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn max-w-2xl mx-auto space-y-6">
        <div className="glass-card p-8 rounded-2xl text-center">
          <Baby className="w-16 h-16 text-[var(--rp-saffron)] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Child Tracker</h1>
          <p className="text-gray-600 mb-8">Let's set up a profile to start tracking developmental milestones.</p>
          
          <div className="space-y-4 text-left max-w-sm mx-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Child's Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--rp-saffron)]"
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
                placeholder="E.g., Emma"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--rp-saffron)]"
                value={setupDate}
                onChange={(e) => setSetupDate(e.target.value)}
              />
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={!setupName || !setupDate}
              className="w-full mt-4 px-6 py-2 bg-[var(--rp-saffron)] text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50"
            >
              Start Tracking
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Baby className="w-8 h-8 text-[var(--rp-saffron)]" />
            Child Milestone Tracker
          </h1>
          <p className="text-gray-600">Track development, milestones, and memories.</p>
        </div>
      </div>

      {profile && (
        <div className="glass-card p-6 rounded-2xl flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 shadow-inner">
            <Baby className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
            <div className="flex items-center gap-4 mt-2 text-gray-600">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(profile.birthDate).toLocaleDateString()}</span>
              <span className="flex items-center gap-1 font-medium text-[var(--rp-primary)]"><Clock className="w-4 h-4" /> {getAgeString()}</span>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Developmental Milestones</h2>
        
        <div className="space-y-8">
          {Object.entries(groupedMilestones).map(([monthStr, monthMilestones]) => {
            const months = parseInt(monthStr);
            return (
              <div key={months} className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[var(--rp-saffron)] text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                    {months} Months
                  </div>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {monthMilestones.map(milestone => (
                    <div 
                      key={milestone.id} 
                      onClick={() => toggleMilestone(milestone.id)}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        milestone.completed 
                          ? 'bg-orange-50 border-orange-200' 
                          : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <button className={`mt-0.5 flex-shrink-0 transition-colors ${milestone.completed ? 'text-[var(--rp-saffron)]' : 'text-gray-300'}`}>
                        {milestone.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                      </button>
                      <div>
                        <p className={`font-medium ${milestone.completed ? 'text-gray-900' : 'text-gray-700'}`}>
                          {milestone.title}
                        </p>
                        {milestone.completed && milestone.completedDate && (
                          <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Achieved on {new Date(milestone.completedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChildTracker;
