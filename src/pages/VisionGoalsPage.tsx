import React from "react";
import {
  ShieldCheck,
  HeartHandshake,
  Briefcase,
  Users,
  Trophy,
  Stethoscope,
  GraduationCap,
  Trees,
  Dog,
  Landmark,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Building2,
  Medal,
  Award,
  Globe2,
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { openExternalLink } from "../utils/browser";

export default function VisionGoalsPage() {
  const navigate = useNavigate();
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const isHi = lang === "hi";

  const PILLARS = [
    {
      id: "employment",
      titleEn: "Employment & Rojgar Mela",
      titleHi: "रोजगार मेला एवं आजीविका",
      descEn: "Actively providing employment opportunities by organizing Rojgar Melas and connects youth directly with employers.",
      descHi: "रोजगार मेलों के आयोजन द्वारा युवाओं को सीधे प्रतिष्ठित नियोक्ताओं से जोड़कर रोजगार एवं आत्मनिर्भरता प्रदान करना।",
      icon: Briefcase,
      color: "bg-blue-50 text-[#000080] border-blue-200"
    },
    {
      id: "women",
      titleEn: "Women Upliftment & Pink E-Rickshaw",
      titleHi: "महिला सशक्तिकरण एवं पिंक ई-रिक्शा",
      descEn: "Driving financial independence for women through specialized initiatives like Pink E-Rickshaw distribution.",
      descHi: "पिंक ई-रिक्शा वितरण जैसे ऐतिहासिक कदमों से महिलाओं को सम्मानजनक आजीविका और वित्तीय स्वतंत्रता देना।",
      icon: Users,
      color: "bg-pink-50 text-pink-700 border-pink-200"
    },
    {
      id: "sports",
      titleEn: "Youth & Sports Promotion",
      titleHi: "खेलकूद एवं युवा प्रतिभा प्रोत्साहन",
      descEn: "Organizing tournaments & supporting emerging athletes so they can represent India at national & global levels.",
      descHi: "खेल प्रतियोगिताओं का आयोजन और उदीयमान खिलाड़ियों को प्रोत्साहन ताकि वे देश का नाम रोशन कर सकें।",
      icon: Trophy,
      color: "bg-amber-50 text-amber-800 border-amber-200"
    },
    {
      id: "health",
      titleEn: "Health Care & Free Camps",
      titleHi: "निःशुल्क स्वास्थ्य सेवा एवं शिविर",
      descEn: "Providing free health checkups, medicine support, and emergency medical camps for the needy.",
      descHi: "ज़रूरतमंदों के लिए निःशुल्क चिकित्सा शिविर, दवाएं और आपातकालीन स्वास्थ्य परामर्श प्रदान करना।",
      icon: Stethoscope,
      color: "bg-emerald-50 text-[#138808] border-emerald-200"
    },
    {
      id: "education",
      titleEn: "Education Aid & Youth Skill Training",
      titleHi: "शिक्षा सहायता एवं कौशल विकास",
      descEn: "Empowering students through scholarship guidance, skill training programs, and educational aid.",
      descHi: "छात्रवृत्ति, कौशल प्रशिक्षण और आधुनिक शिक्षण संसाधनों से युवाओं का भविष्य उज्ज्वल बनाना।",
      icon: GraduationCap,
      color: "bg-purple-50 text-purple-700 border-purple-200"
    },
    {
      id: "environment",
      titleEn: "Environment Safety & Tree Drives",
      titleHi: "पर्यावरण संरक्षण एवं पौधारोपण",
      descEn: "Protecting ecosystems through massive plantation drives, river conservation, and green awareness.",
      descHi: "सघन वृक्षारोपण अभियानों और पर्यावरण संरक्षण गतिविधियों द्वारा एक स्वच्छ, हरित भविष्य का निर्माण।",
      icon: Trees,
      color: "bg-green-50 text-green-700 border-green-200"
    },
    {
      id: "animal",
      titleEn: "Animal Welfare & Care",
      titleHi: "पशु कल्याण एवं चिकित्सा सेवा",
      descEn: "Rescue operations, medical assistance, and shelter support for street animals and livestock.",
      descHi: "बेसहारा और संकटग्रस्त पशुओं के लिए त्वरित चिकित्सा, आहार तथा आश्रय सहायता उपलब्ध कराना।",
      icon: Dog,
      color: "bg-orange-50 text-[#FF9933] border-orange-200"
    },
    {
      id: "culture",
      titleEn: "Indian Culture & Heritage Pride",
      titleHi: "भारतीय संस्कृति एवं विरासत का गौरव",
      descEn: "Promoting Indian philosophy, history, and community values to instill national pride in youth.",
      descHi: "भारतीय दर्शन, सनातन मूल्यों और गौरवशाली इतिहास से युवाओं को जोड़कर सांस्कृतिक गौरव जगाना।",
      icon: Landmark,
      color: "bg-indigo-50 text-indigo-800 border-indigo-200"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-28 font-sans selection:bg-orange-100">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#FF9933] via-[#000080] to-[#138808] p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl transform translate-x-12 -translate-y-12" />
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md border border-white/20 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            {isHi ? "दृष्टिकोण और उद्देश्य" : "Vision, Mission & Impact"}
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl leading-tight">
            RP Foundation (आर.पी. फाउंडेशन)
          </h1>
          <p className="text-xs text-orange-100 font-medium mt-1.5 leading-relaxed">
            {isHi 
              ? "राष्ट्र निर्माण, जन सेवा, समाज के अंतिम व्यक्ति के उत्थान और सांस्कृतिक गौरव का राष्ट्रीय संकल्प।"
              : "Dedicated to social upliftment, employment, women empowerment, health, youth sports, and national heritage."}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Founder & Managing Leadership Card */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-[#FF9933]" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="h-20 w-20 rounded-2xl border-2 border-[#FF9933] overflow-hidden bg-slate-100 shrink-0 shadow-md">
              <img 
                src="/assets/founder.png" 
                alt="Shri Rohit Pandit Ji" 
                className="h-full w-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            
            <div className="text-center sm:text-left min-w-0">
              <span className="text-[9.5px] font-black uppercase tracking-[.18em] text-[#FF9933]">
                {isHi ? "संस्थापक एवं प्रेरणास्रोत" : "Founder & Visionary Leader"}
              </span>
              <h2 className="text-xl font-black text-[#000080] mt-0.5">
                Shri Rohit Pandit Ji (श्री रोहित पंडित जी)
              </h2>
              <p className="text-xs font-bold text-slate-600 mt-1 flex items-center justify-center sm:justify-start gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#138808] shrink-0" />
                Vice Chairman & Managing Director, People's Group
              </p>
              <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                {isHi 
                  ? "पीपुल्स ग्रुप के उपाध्यक्ष एवं प्रबंध निदेशक के रूप में श्री रोहित पंडित जी के दूरदर्शी नेतृत्व में RP Foundation शिक्षा, स्वास्थ्य, रोजगार और समाज कल्याण में ऐतिहासिक परिवर्तन ला रहा है।"
                  : "Under the visionary leadership of Shri Rohit Pandit Ji, Vice Chairman & Managing Director of People's Group, RP Foundation is creating historic social upliftment across India."}
              </p>
            </div>
          </div>
        </section>

        {/* Vision & Core Motive Overview */}
        <section className="bg-gradient-to-br from-blue-50/60 via-white to-orange-50/60 rounded-3xl border border-blue-100 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-[#000080]">
            <Award className="w-5 h-5 text-[#FF9933]" />
            <h3 className="text-sm font-black uppercase tracking-wider">{isHi ? "हमारा संकल्प एवं उद्देश्य" : "Our Mission & Core Motive"}</h3>
          </div>
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {isHi
              ? "RP Foundation का मुख्य उद्देश्य समाज के प्रत्येक वर्ग, विशेषकर वंचितों और युवाओं को सक्षम बनाना है। रोजगार मेलों से आजीविका, महिलाओं को स्वावलंबी बनाने हेतु पिंक ई-रिक्शा, खिलाड़ियों को राष्ट्रीय मंच, और निःशुल्क स्वास्थ्य सेवाओं से एक सशक्त भारत का निर्माण करना हमारा ध्येय है।"
              : "RP Foundation is committed to uplifting underprivileged communities, generating employment through Rojgar Melas, supporting women via Pink E-Rickshaws, promoting young athletes for India, and providing free health care across the nation."}
          </p>
        </section>

        {/* 8 Core Pillars of RP Foundation */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#000080]">{isHi ? "RP Foundation की प्रमुख 8 कार्य क्षेत्र" : "8 Active Pillars of Action"}</h3>
            <span className="text-[10px] font-bold text-slate-400">National Initiatives</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PILLARS.map((p) => (
              <div 
                key={p.id} 
                className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition space-y-2"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${p.color}`}>
                    <p.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-xs text-slate-900 leading-snug">
                    {isHi ? p.titleHi : p.titleEn}
                  </h4>
                </div>
                <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                  {isHi ? p.descHi : p.descEn}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action (Volunteer & Join) */}
        <section className="bg-gradient-to-r from-[#000080] to-[#138808] rounded-3xl p-6 text-white text-center shadow-lg space-y-3">
          <Medal className="w-10 h-10 text-yellow-300 mx-auto" />
          <h3 className="text-lg font-black">{isHi ? "राष्ट्र निर्माण में भागीदार बनें" : "Become a Part of Nation Building"}</h3>
          <p className="text-xs text-blue-100 max-w-md mx-auto font-medium leading-relaxed">
            {isHi 
              ? "RP Foundation के साथ जुड़कर समाज सेवा, स्वास्थ्य शिविरों, पौधारोपण और रक्तदान अभियानों में अपना अमूल्य योगदान दें।"
              : "Join RP Foundation as a volunteer or supporter to contribute toward community health, sports, and societal upliftment."}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => navigate("/volunteers")}
              className="bg-gradient-to-r from-[#FF9933] to-[#F59E0B] hover:opacity-95 text-white text-xs font-black py-3 px-6 rounded-2xl shadow-md transition active:scale-95 flex items-center justify-center gap-2"
            >
              <HeartHandshake className="w-4 h-4" />
              {isHi ? "स्वयंसेवक पंजीकरण" : "Register as Volunteer"}
            </button>
            <button
              onClick={() => openExternalLink("https://therpfoundation.org", navigate, "RP Foundation Portal")}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 text-xs font-bold py-3 px-5 rounded-2xl transition active:scale-95"
            >
              {isHi ? "आधिकारिक पोर्टल" : "Official Website"}
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
