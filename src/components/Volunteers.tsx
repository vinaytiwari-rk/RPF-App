import React, { useState } from "react";
import { Camp, UserProfile } from "../types";
import { Award, Users, BookOpen, Clock, Heart, Calendar, Plus, CheckCircle, ShieldAlert, Sparkles, Navigation } from "lucide-react";

interface VolunteersProps {
  lang: "hi" | "en";
  profile: UserProfile;
  camps: Camp[];
  onParticipateCamp: (campId: string) => void;
  onRegisterVolunteer: (skills: string) => void;
}

export default function Volunteers({ lang, profile, camps, onParticipateCamp, onRegisterVolunteer }: VolunteersProps) {
  const [success, setSuccess] = useState(false);
  const [skillsSelected, setSkillsSelected] = useState<string[]>([]);
  const [custSkills, setCustSkills] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const skillsList = [
    lang === "hi" ? "बच्चों को पढ़ाना (Teaching children)" : "Teaching rural children",
    lang === "hi" ? "चिकित्सकीय परामर्श (Medical Consulting)" : "Medical consultations / Health camps",
    lang === "hi" ? "कानूनी सलाह (Legal counseling)" : "Legal & citizenship coaching",
    lang === "hi" ? "पर्यावरण / वृक्षारोपण (Afforestation)" : "Tree plantation & Environmental setups",
    lang === "hi" ? "राशन/राहत वितरण (Distribution Management)" : "Logistics & Food aid distributions",
    lang === "hi" ? "डिजिटल साक्षरता/मार्केटिंग (Digital setups)" : "Digital literacy teaching / Tech support",
  ];

  const handleSkillToggle = (skill: string) => {
    if (skillsSelected.includes(skill)) {
      setSkillsSelected(prev => prev.filter(s => s !== skill));
    } else {
      setSkillsSelected(prev => [...prev, skill]);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSkills = [...skillsSelected];
    if (custSkills.trim()) finalSkills.push(custSkills.trim());

    if (finalSkills.length === 0) {
      setErrorMsg(lang === "hi" ? "कृपया कम से कम एक सेवा कौशल चुनें!" : "Please choose at least one skill donation category!");
      setTimeout(() => setErrorMsg(null), 5000);
      return;
    }

    setErrorMsg(null);
    onRegisterVolunteer(finalSkills.join(", "));
    setRegSuccess(true);
    setSkillsSelected([]);
    setCustSkills("");
    setTimeout(() => setRegSuccess(false), 4000);
  };

  const handleParticipate = (campId: string) => {
    onParticipateCamp(campId);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6" id="volunteers-command-view">
      {/* Intro info banner */}
      <div className="bg-gradient-to-r from-[#07142A] via-[#0B1E3F] to-[#122A54] text-white rounded-2xl p-5 border border-[#D4AF37]/30 shadow-md space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-teal-400 bg-teal-950 px-2.5 py-1 rounded-full uppercase tracking-widest">
            {lang === "hi" ? "स्वयंसेवक केंद्र" : "Volunteer HQ"}
          </span>
          <span className="text-xs text-amber-400 font-bold font-mono">
            {lang === "hi" ? `वर्तमान रैंक: ${profile.badge}` : `Current rank: ${profile.badge}`}
          </span>
        </div>
        <h3 className="font-extrabold text-base text-slate-100">
          {lang === "hi" ? "🤝 श्रमदान और कौशल दान (Donate Time & Skills)" : "🤝 Dedicate Time & Skill Donations"}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          {lang === "hi" 
            ? "मदद केवल पैसों से नहीं होती, बल्कि आपके कीमती समय और ज्ञान से भी हो सकती है। अपने कौशल (जैसे पढ़ाना, प्राथमिक चिकित्सा, कानूनी राय या वितरण में हाथ बंटाना) दान करें। सामाजिक सेवा अभियानों में भाग लेने पर आपके 'प्रभाव पॉइंट्स' बढ़ते हैं जिससे आपका जन सेवा कार्ड मेडल अनलॉक होता है।" 
            : "Social service thrives when neighbors share their time and knowledge. Donate clinical advice, textbook guides, basic legal counseling, or logistics support. Joining camps elevates your impact score and unlocks higher ranks (Gold/Platinum) on your Digital Jan Seva card."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Volunteer and Skill selection form */}
        <div className="glass-card bg-white/95 p-5 border-gold-soft shadow-gold-premium space-y-4">
          <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
            <Award className="w-5 h-5 text-[#0f4c81]" />
            {lang === "hi" ? "कौशल दान (Skill Donation) पंजीकरण" : "Register Your Service Skills"}
          </h4>

          {profile.role === "Active Volunteer" ? (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
              <p className="font-bold text-xs text-[#0f4c81] flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-[#0f4c81]" />
                {lang === "hi" ? "आप एक सक्रिय स्वयंसेवक हैं!" : "You are registered as Active Volunteer!"}
              </p>
              <p className="text-[11.5px] text-slate-600 leading-relaxed">
                {lang === "hi" 
                  ? "आरपी फाउंडेशन परिवार में शामिल होने के लिए आभार। अपनी पसंदीदा श्रेणी के आगामी शिविरों में 'शामिल होना' चुनें और पॉइंट्स बटोरे।" 
                  : "Thank you for supporting community welfare. Participate in active campaigns below to boost your global score."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <p className="text-xs text-slate-500 font-medium">
                {lang === "hi" ? "कौन सा कौशल दान करना चाहते हैं? (बहुचेयन करें):" : "Choose the skill categories you can provide:"}
              </p>
              
              <div className="grid grid-cols-1 gap-2">
                {skillsList.map((skill, idx) => {
                  const selected = skillsSelected.includes(skill);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`text-left text-xs font-semibold px-3 py-2.5 rounded-xl border transition ${
                        selected 
                          ? "bg-slate-50 border-[#FF9933] text-[#0f4c81] shadow-sm" 
                          : "bg-slate-50 hover:bg-slate-105 border-slate-200 text-slate-600"
                      }`}
                    >
                      {selected ? "✓ " : "+ "} {skill}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{lang === "hi" ? "कोई अन्य कौशल जो आप साझा करना चाहते हैं" : "Any other civic support"}</label>
                <input
                  type="text"
                  value={custSkills}
                  onChange={(e) => setCustSkills(e.target.value)}
                  placeholder="e.g. driving rescue mini-van, food packer, translation help"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#FF9933] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0f4c81] hover:bg-[#0f4c81] text-white py-2 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                {lang === "hi" ? "सक्रिय स्वयंसेवक के रूप में जोड़े" : "Commit to Skill Volunteerism"}
              </button>
            </form>
          )}

          {errorMsg && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-1.5 text-amber-900 text-xs animate-fadeIn font-semibold">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {regSuccess && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-1.5 text-[#0f4c81] text-xs animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-[#0f4c81]" />
              <span>{lang === "hi" ? "बधाई हो! आप आरपी फाउंडेशन स्वयंसेवक दल में शामिल हो गए हैं।" : "Welcome to the RP Volunteer corps!"}</span>
            </div>
          )}
        </div>

        {/* List of active campaigns */}
        <div className="glass-card bg-white/95 p-5 border-gold-soft shadow-gold-premium space-y-4">
          <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
            <Calendar className="w-4.5 h-4.5 text-indigo-600" />
            {lang === "hi" ? "आगामी सामाजिक अभियान (Camps & Drives)" : "Upcoming Camp Events"}
          </h4>

          <div className="space-y-3.5 max-h-[350px] overflow-y-auto no-scrollbar">
            {camps.map((camp) => (
              <div key={camp.id} className="border border-slate-205 rounded-xl p-3.5 space-y-2.5 bg-slate-50/50 hover:bg-white transition duration-150">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] font-bold text-[#0f4c81] bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full uppercase">
                    {camp.type}
                  </span>
                  <span className="text-[10px] text-slate-550 font-mono font-bold">{camp.date}</span>
                </div>

                <div className="space-y-1">
                  <h5 className="font-bold text-xs text-slate-800 leading-snug">{camp.title}</h5>
                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-slate-400" />
                    {camp.location}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-xs">
                  <span className="text-amber-600 font-bold flex items-center gap-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-300" />
                    +{camp.pointsReward} Points
                  </span>
                  
                  <button
                    onClick={() => handleParticipate(camp.id)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition duration-150 cursor-pointer"
                  >
                    {lang === "hi" ? "शामिल हों (Participate)" : "Participate"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {success && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-[#0f4c81] text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-[#0f4c81]" />
              <span>{lang === "hi" ? "भागीदारी दर्ज हो गई है! +15 प्रभाव पॉइंट्स आपके जन सेवा कार्ड में जुड़ चुके हैं।" : "Camp participation saved! +15 impact points credited to your member account."}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
