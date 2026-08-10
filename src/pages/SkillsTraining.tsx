import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, CheckCircle, Award, BookOpen, Clock, Star, PlayCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const COURSES = [
  {
    id: "c1",
    title: { en: "Digital Literacy & Computer Basics", hi: "कंप्यूटर और डिजिटल साक्षरता" },
    instructor: "RP Foundation IT Team",
    duration: "4 Hours",
    rating: 4.8,
    progress: 60,
    modules: [
      { id: "m1", title: { en: "Introduction to Computers", hi: "कंप्यूटर का परिचय" }, duration: "45 min", completed: true },
      { id: "m2", title: { en: "Using the Internet Safely", hi: "इंटरनेट का सुरक्षित उपयोग" }, duration: "50 min", completed: true },
      { id: "m3", title: { en: "Email & Communication", hi: "ईमेल और संचार" }, duration: "40 min", completed: false },
      { id: "m4", title: { en: "Basic Word Processing", hi: "बेसिक वर्ड प्रोसेसिंग" }, duration: "60 min", completed: false },
    ]
  },
  {
    id: "c2",
    title: { en: "Organic Farming Techniques", hi: "जैविक खेती की तकनीकें" },
    instructor: "Dr. Sharma (Agri Expert)",
    duration: "3.5 Hours",
    rating: 4.9,
    progress: 100,
    modules: [
      { id: "m1", title: { en: "Soil Health Basics", hi: "मिट्टी के स्वास्थ्य की मूल बातें" }, duration: "40 min", completed: true },
      { id: "m2", title: { en: "Natural Fertilizers", hi: "प्राकृतिक उर्वरक" }, duration: "45 min", completed: true },
      { id: "m3", title: { en: "Pest Management", hi: "कीट प्रबंधन" }, duration: "50 min", completed: true },
    ]
  }
];

export default function SkillsTraining() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const navigate = useNavigate();
  const isHi = lang === "hi";

  const [activeCourseId, setActiveCourseId] = useState<string>("c1");
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<Record<string, number>>({
    "c1": 60,
    "c2": 100
  });
  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>({
    "c1-m1": true, "c1-m2": true, "c1-m3": false, "c1-m4": false,
    "c2-m1": true, "c2-m2": true, "c2-m3": true
  });
  const [showCertificate, setShowCertificate] = useState(false);

  const activeCourse = COURSES.find(c => c.id === activeCourseId)!;
  const progress = progressData[activeCourseId] || 0;

  const handlePlayVideo = (moduleId: string) => {
    setPlayingVideo(moduleId);
    
    // Simulate watching video for 3 seconds then completing it
    setTimeout(() => {
      setPlayingVideo(null);
      
      const key = `${activeCourseId}-${moduleId}`;
      if (!completedModules[key]) {
        const newCompleted = { ...completedModules, [key]: true };
        setCompletedModules(newCompleted);
        
        // Recalculate progress
        const total = activeCourse.modules.length;
        const completedCount = activeCourse.modules.filter(m => newCompleted[`${activeCourseId}-${m.id}`]).length;
        const newProgress = Math.round((completedCount / total) * 100);
        
        setProgressData(prev => ({ ...prev, [activeCourseId]: newProgress }));
        
        if (newProgress === 100) {
          setTimeout(() => setShowCertificate(true), 500);
        }
      }
    }, 3000);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans text-slate-800 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-4 py-4 flex items-center shadow-md sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="mr-3 p-2 bg-white/10 rounded-full hover:bg-white/20 transition active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display font-extrabold text-lg">{isHi ? "कौशल प्रशिक्षण केंद्र" : "Skill Training Academy"}</h1>
          <p className="text-[10px] text-blue-100 font-medium">{isHi ? "सीखें और बढ़ें" : "Learn & Grow"}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-5 space-y-6">
        
        {/* Course Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {COURSES.map(course => (
            <button 
              key={course.id}
              onClick={() => setActiveCourseId(course.id)}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
                activeCourseId === course.id ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {isHi ? course.title.hi : course.title.en}
            </button>
          ))}
        </div>

        {/* Active Course Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-br from-indigo-900 to-blue-900 p-6 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <span className="bg-blue-500/30 border border-blue-400/30 text-blue-100 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md mb-2 inline-block">Free Certification</span>
                <h2 className="text-xl font-display font-black text-white leading-tight">
                  {isHi ? activeCourse.title.hi : activeCourse.title.en}
                </h2>
                <p className="text-blue-200 text-xs mt-2 font-medium flex items-center gap-1">
                  <span className="w-5 h-5 rounded-full bg-blue-100/20 flex items-center justify-center font-bold text-[10px]">RP</span>
                  {activeCourse.instructor}
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 mt-5 text-white/80 text-[10px] font-semibold relative z-10">
              <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-300" /> {activeCourse.duration}</div>
              <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {activeCourse.rating}</div>
            </div>
          </div>
          
          {/* Progress Section */}
          <div className="p-5 border-b border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-sm text-slate-800">{isHi ? "आपकी प्रगति" : "Your Progress"}</h3>
              <span className="font-black text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
              />
            </div>
            {progress === 100 && (
              <button onClick={() => setShowCertificate(true)} className="mt-4 w-full bg-amber-100 text-amber-800 border border-amber-300 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-amber-200 transition">
                <Award className="w-4 h-4" />
                {isHi ? "प्रमाणपत्र डाउनलोड करें" : "Download Certificate"}
              </button>
            )}
          </div>

          {/* Curriculum */}
          <div className="p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              {isHi ? "पाठ्यक्रम" : "Curriculum"}
            </h3>
            
            <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-[15px] before:w-0.5 before:bg-slate-100">
              {activeCourse.modules.map((mod, idx) => {
                const isCompleted = completedModules[`${activeCourseId}-${mod.id}`];
                const isPlaying = playingVideo === mod.id;

                return (
                  <div key={mod.id} className="relative flex gap-4 bg-white z-10">
                    <div className="shrink-0 mt-1">
                      {isCompleted ? (
                        <div className="w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center shadow-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div className={`flex-1 border rounded-xl p-3 flex justify-between items-center transition ${isCompleted ? 'border-green-100 bg-green-50/30' : 'border-slate-200 hover:border-blue-300 bg-slate-50'}`}>
                      <div>
                        <h4 className={`font-bold text-xs ${isCompleted ? 'text-slate-800' : 'text-slate-700'}`}>
                          {isHi ? mod.title.hi : mod.title.en}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-1">
                          <PlayCircle className="w-3 h-3 text-slate-400" /> {mod.duration}
                        </p>
                      </div>
                      <button 
                        onClick={() => handlePlayVideo(mod.id)}
                        disabled={isPlaying || isCompleted}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow-sm ${
                          isPlaying ? 'bg-blue-100 text-blue-600' : 
                          isCompleted ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 hover:shadow-md'
                        }`}
                      >
                        {isPlaying ? <Loader2 className="w-4 h-4 animate-spin" /> : (isCompleted ? <CheckCircle className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />)}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Certificate Modal */}
      <AnimatePresence>
        {showCertificate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative"
            >
              <div className="absolute inset-0 bg-amber-50/50 mix-blend-multiply pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
              <div className="p-6 text-center relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ring-8 ring-amber-100">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h2 className="font-display font-extrabold text-2xl text-slate-800 mb-1">
                  {isHi ? "बधाई हो!" : "Congratulations!"}
                </h2>
                <p className="text-slate-600 text-sm font-medium mb-6">
                  {isHi ? "आपने यह कोर्स सफलतापूर्वक पूरा कर लिया है।" : "You have successfully completed this course."}
                </p>
                
                <div className="border-4 border-double border-amber-200 p-4 rounded-xl bg-white space-y-2 mb-6 shadow-inner">
                  <p className="text-[10px] uppercase font-black tracking-widest text-amber-600">Certificate of Completion</p>
                  <p className="font-display font-extrabold text-slate-800 text-lg leading-tight">
                    {isHi ? activeCourse.title.hi : activeCourse.title.en}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500">Issued by RP Foundation</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowCertificate(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition">
                    {isHi ? "बंद करें" : "Close"}
                  </button>
                  <button onClick={() => setShowCertificate(false)} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-md">
                    {isHi ? "सेव करें" : "Save PDF"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
