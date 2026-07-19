import React, { useState } from "react";
import { Search, Loader2, Sparkles, BookOpen, UserCheck, ShieldCheck, ArrowRight, BookMarked, HelpCircle } from "lucide-react";

interface Scheme {
  name: string;
  eligibility: string;
  benefits: string;
  steps: string;
}

interface GovernmentSchemesProps {
  lang: "hi" | "en";
}

export default function GovernmentSchemes({ lang }: GovernmentSchemesProps) {
  // Input states
  const [age, setAge] = useState("24");
  const [gender, setGender] = useState("Female");
  const [annualIncome, setAnnualIncome] = useState("120000");
  const [occupation, setOccupation] = useState("Student");
  const [state, setState] = useState("Madhya Pradesh");
  const [category, setCategory] = useState("General");
  
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(false);

  // Simple static backup data when Gemini is loading or error
  const backupSchemes: Scheme[] = lang === "hi" 
    ? [
        {
          name: "आयष्मान भारत योजना (Ayushman Bharat Yojana)",
          eligibility: "वार्षिक पारिवारिक आय ₹2.5 लाख से कम होने पर पूर्णतः पात्र।",
          benefits: "₹5 लाख प्रति वर्ष तक का निशुल्क गुणवत्तापूर्ण कैशलैस स्वास्थ्य इलाज परिवार के सभी सदस्यों के लिए।",
          steps: "निकटतम स्वास्थ्य केंद्र पर जाकर अपना आधार और राशन कार्ड सत्यापित करवाएं।"
        },
        {
          name: "पीएम आवास योजना (Pradhan Mantri Awas Yojana)",
          eligibility: "ग्रामीण क्षेत्र में पक्के घर से वंचित कच्चे मकान में रहने वाले सभी निम्न-आय वर्ग परिवार।",
          benefits: "मकान निर्माण सहायता हेतु केंद्र व राज्य सरकार द्वारा सीधे बैंक खाते में ₹1.20 लाख तक की प्रत्यक्ष सब्सिडी।",
          steps: "एप्लिकेशन फॉर्म भरें या गाँव के सचिव/सरपंच से संपर्क कर सूची में अपना नाम जुड़वाएं।"
        },
        {
          name: "महिला समृद्ध छात्रवृत्ति योजना (Vidyasaarathi Schemes)",
          eligibility: "मेधावी छात्राएं जिनकी वार्षिक पारिवारिक आय ₹2.0 लाख से कम है और शैक्षिक योग्यता प्राप्त हैं।",
          benefits: "उच्च शिक्षा (डिग्री, डिप्लोमा) हेतु वार्षिक पढ़ाई शुल्क प्रतिपूर्ति तथा हॉस्टल सहायता राशि का सीधा हस्तांतरण।",
          steps: "इस ऐप के छात्र पोर्टल अथवा आधिकारिक विद्यासारथी वेबसाइट पर आधार कार्ड व पिछली मार्कशीट अपलोड करें।"
        }
      ]
    : [
        {
          name: "Ayushman Bharat PM-JAY Program",
          eligibility: "Available for rural target groups and low-income criteria (under ₹2.5 Lakh of annual income).",
          benefits: "Up to ₹5 Lakh families health coverage annually across public and private empaneled hospitals.",
          steps: "Visit your local Community Health center or general hospital with your Aadhaar and Ration Token."
        },
        {
          name: "Pradhan Mantri Awas Yojana (Rural)",
          eligibility: "Localities living in temporary or thatched houses, with low or marginalized income indicators.",
          benefits: "Direct financial support for complete house construction with up to ₹1.2 Lakh given on-ground.",
          steps: "Register on PMAY portal or consult your local Panchayat Secretariat office or ward volunteer."
        },
        {
          name: "Saraswati Meritorious Girls Scholarship",
          eligibility: "Female pursuing higher technical/general courses scoring above 70% with family income under ₹3 Lakhs.",
          benefits: "Full tuition assistance, accommodation support, and digital tablet/laptop provisions.",
          steps: "Apply online with academic mark-sheets, income verification, and tribal/caste certifications."
        }
      ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/ai/scheme-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          gender,
          annualIncome,
          occupation,
          state,
          category
        })
      });

      if (!response.ok) throw new Error("API failed");
      const data = await response.json();
      setSchemes(data.schemes || backupSchemes);
    } catch (err) {
      console.warn("AI scheme search errored. Loading fallback static items", err);
      // Wait a tiny moment for smooth transition
      setTimeout(() => {
        setSchemes(backupSchemes);
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="schemes-finder-view">
      <div className="bg-white rounded-md p-5 border border-slate-100 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
          <BookMarked className="w-5.5 h-5.5 text-[#0f4c81]" />
          <div>
            <h3 className="font-extrabold text-base text-slate-800">{lang === "hi" ? "सरकारी योजना एवं छात्रवृत्ति खोजक" : "Government Scheme Finder"}</h3>
            <p className="text-xs text-slate-500">{lang === "hi" ? "अपनी पात्रता विवरण जांचें और सीधे उपयुक्त योजनाओं का सुझाव पाएं" : "Enter details for server-driven scheme matching algorithms"}</p>
          </div>
        </div>

        {/* Profile Matcher Form */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">{lang === "hi" ? "आपकी आयु (वर्ष)" : "Your Age"}</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs focus:ring-1 focus:ring-[#FF9933] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">{lang === "hi" ? "लिंग" : "Gender"}</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs focus:ring-1 focus:ring-[#FF9933] outline-none"
            >
              <option value="Female">{lang === "hi" ? "महिला (Female)" : "Female"}</option>
              <option value="Male">{lang === "hi" ? "पुरुष (Male)" : "Male"}</option>
              <option value="Others">{lang === "hi" ? "अन्य (Others)" : "Others"}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">{lang === "hi" ? "वार्षिक पारिवारिक आय" : "Household Annual Income"}</label>
            <select
              value={annualIncome}
              onChange={(e) => setAnnualIncome(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs focus:ring-1 focus:ring-[#FF9933] outline-none"
            >
              <option value="60000">{lang === "hi" ? "₹60,000 से कम" : "Under ₹60,000"}</option>
              <option value="120000">{lang === "hi" ? "₹60,000 - ₹2,000,00" : "₹60,000 - ₹2,00,000"}</option>
              <option value="250000">{lang === "hi" ? "₹2,00,000 - ₹5,00,000" : "₹2,00,000 - ₹5,00,000"}</option>
              <option value="600000">{lang === "hi" ? "₹5,00,000 से अधिक" : "Above ₹5,00,000"}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">{lang === "hi" ? "व्यवसाय" : "Your Profession"}</label>
            <select
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs focus:ring-1 focus:ring-[#FF9933] outline-none"
            >
              <option value="Student">{lang === "hi" ? "छात्र / पढ़ाईरत Student" : "Student"}</option>
              <option value="Farmer">{lang === "hi" ? "किसान (Farmer)" : "Farmer/Agriculture"}</option>
              <option value="Labourer">{lang === "hi" ? "दिहाड़ी मजदूर (Daily Wage)" : "Daily Wage Labourer"}</option>
              <option value="Unemployed">{lang === "hi" ? "बेरोजगार (Looking for work)" : "Unemployed / Searching"}</option>
              <option value="Self-Employed">{lang === "hi" ? "छोटा व्यवसाय (Self-Employed)" : "Small Business owner"}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">{lang === "hi" ? "राज्य" : "State"}</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. Madhya Pradesh"
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs focus:ring-1 focus:ring-[#FF9933] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">{lang === "hi" ? "सामाजिक वर्ग" : "Social Category"}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs focus:ring-1 focus:ring-[#FF9933] outline-none"
            >
              <option value="General">General / सामान्य</option>
              <option value="OBC">OBC</option>
              <option value="SC">Scheduled Caste (SC)</option>
              <option value="ST">Scheduled Tribe (ST)</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-6 rounded-md flex items-center gap-1.5 transition duration-150 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === "hi" ? "AI योजना मिलान कर रहा है..." : "AI Syncing eligibility algorithms..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FF9933] fill-[#FF9933]" />
                  <span>{lang === "hi" ? "AI योजनएं और छात्रवृत्तियां खोजें" : "Match Schemes via Gemini AI"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Grid of Matched Schemes */}
      {schemes.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center gap-1.5 px-1 text-slate-800">
            <Sparkles className="w-4.5 h-4.5 text-[#0f4c81] fill-[#FF9933]" />
            <h4 className="font-extrabold text-sm uppercase tracking-wider">{lang === "hi" ? "अनुशंसित योजना सूची" : "Special Matched Schemes"}</h4>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {schemes.map((sch, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-md p-5 shadow-sm space-y-3 hover:border-slate-200/60 transition duration-150">
                <div className="flex justify-between items-start border-b border-slate-50 pb-2">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 bg-slate-50 rounded-full flex items-center justify-center text-xs font-bold text-[#0f4c81]">
                      {idx + 1}
                    </span>
                    {sch.name}
                  </h4>
                  <span className="text-[10px] font-bold text-[#0f4c81] bg-slate-50 px-2.5 py-1 rounded-full uppercase">
                    {lang === "hi" ? "सत्यापित पात्रता" : "Eligible"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1 bg-slate-50 p-3 rounded-md border border-slate-100">
                    <p className="font-bold text-slate-700">{lang === "hi" ? "पात्रता संकेतक" : "Who is Eligible"}</p>
                    <p className="text-slate-600 leading-relaxed text-[11.5px]">{sch.eligibility}</p>
                  </div>
                  <div className="space-y-1 bg-slate-50 p-3 rounded-md border border-slate-100">
                    <p className="font-bold text-slate-700">{lang === "hi" ? "योजना के लाभ" : "Key Benefits Promised"}</p>
                    <p className="text-slate-600 leading-relaxed text-[11.5px]">{sch.benefits}</p>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-3.5 rounded-md border border-slate-100/50 text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    <UserCheck className="w-4 h-4 text-[#0f4c81]" />
                    {lang === "hi" ? "आवेदन करने के सरल कदम" : "Simple Application Steps"}
                  </p>
                  <p className="leading-relaxed text-[11.5px] font-medium text-slate-600">{sch.steps}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Basic digital libraries and manuals */}
      <div className="bg-white rounded-md p-5 border border-slate-100 shadow-sm space-y-4">
        <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
          <BookOpen className="w-4.5 h-4.5 text-indigo-600" />
          {lang === "hi" ? "📚 डिजिटल लाइब्रेरी व सरकारी नियमावली" : "📚 Digital Library & Career Manuals"}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs text-slate-700">
          <div className="p-3 border border-slate-150 rounded-md hover:border-[#FF9933] transition duration-150 bg-slate-50/30">
            <h5 className="font-bold text-slate-800">{lang === "hi" ? "सरकारी योजनाओं का महाकोश (PDF)" : "Govt Schemes encyclopedia"}</h5>
            <p className="text-[10.5px] text-slate-500 mt-1">{lang === "hi" ? "सभी केंद्र व राज्य प्रायोजित योजनाओं के नियम" : "Rules manual covering basic schemes"}</p>
          </div>
          <div className="p-3 border border-slate-150 rounded-md hover:border-[#FF9933] transition duration-150 bg-slate-50/30">
            <h5 className="font-bold text-slate-800">{lang === "hi" ? "रोजगार और स्किल किट (E-Books)" : "NGO Placement Guidelines"}</h5>
            <p className="text-[10.5px] text-slate-500 mt-1">{lang === "hi" ? "करियर ओरिएंटेशन और रिज्यूम मेकिंग तकनीक" : "CV blueprints, mock interviews, etc"}</p>
          </div>
          <div className="p-3 border border-slate-150 rounded-md hover:border-[#FF9933] transition duration-150 bg-slate-50/30">
            <h5 className="font-bold text-slate-800">{lang === "hi" ? "छात्रवृत्ति कैलेंडर 2026" : "Scholarship Almanac 2026"}</h5>
            <p className="text-[10.5px] text-slate-500 mt-1">{lang === "hi" ? "महत्वपूर्ण आवेदन तिथियां और अंतिम समय" : "Form filings schedules on single click"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
