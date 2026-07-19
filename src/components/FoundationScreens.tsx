import React from "react";
import { 
  Info, 
  User, 
  Compass, 
  Users, 
  Briefcase, 
  FileCheck, 
  Mail, 
  Building, 
  Image as ImageIcon, 
  Share2,
  ExternalLink,
  ChevronRight,
  Shield,
  Heart,
  BookOpen,
  Eye,
  TreePine,
  Activity,
  Award
} from "lucide-react";

interface FoundationScreensProps {
  lang: "hi" | "en";
  activeScreen: string; // "about" | "founder" | "vision" | "leadership" | "initiatives" | "transparency" | "contact" | "partners" | "gallery" | "social"
  onSelectScreen: (screenId: string) => void;
}

export default function FoundationScreens({ lang, activeScreen, onSelectScreen }: FoundationScreensProps) {
  // Navigation tabs definition for the 10 required screens
  const screensList = [
    { id: "about", icon: Info, titleEn: "About RP Foundation", titleHi: "फाउंडेशन के बारे में" },
    { id: "founder", icon: User, titleEn: "Founder Message", titleHi: "संस्थापक का संदेश" },
    { id: "vision", icon: Compass, titleEn: "Vision & Mission", titleHi: "दृष्टि और ध्येय" },
    { id: "leadership", icon: Users, titleEn: "Leadership", titleHi: "हमारा नेतृत्व" },
    { id: "initiatives", icon: Briefcase, titleEn: "Initiatives", titleHi: "मुख्य सामाजिक पहल" },
    { id: "transparency", icon: FileCheck, titleEn: "Transparency & Reports", titleHi: "पारदर्शिता और रिपोर्ट" },
    { id: "contact", icon: Mail, titleEn: "Contact Us", titleHi: "संपर्क करें" },
    { id: "partners", icon: Building, titleEn: "Partner Organizations", titleHi: "भागीदार संगठन" },
    { id: "gallery", icon: ImageIcon, titleEn: "Media Gallery", titleHi: "मीडिया गैलरी" },
    { id: "social", icon: Share2, titleEn: "Social Media Hub", titleHi: "सोशल मीडिया हब" },
  ];

  const activeTitle = screensList.find(s => s.id === activeScreen);

  return (
    <div className="space-y-4" id="foundation-container">
      {/* 10 Screen Top Horizontal Scrolling Switcher */}
      <div className="bg-white border border-slate-150 rounded-md p-2.5 shadow-2xs">
        <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider px-1">
          {lang === "hi" ? "फाउंडेशन निर्देशिका" : "Foundation Directory"}
        </p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {screensList.map((screen) => {
            const IconComponent = screen.icon;
            const isSelected = activeScreen === screen.id;
            return (
              <button
                key={screen.id}
                onClick={() => onSelectScreen(screen.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold transition shrink-0 cursor-pointer border ${
                  isSelected 
                    ? "bg-[#0f4c81] border-[#0f4c81] text-white shadow-sm" 
                    : "bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100"
                }`}
                id={`btn-screen-${screen.id}`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{lang === "hi" ? screen.titleHi : screen.titleEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Screen Content Render Viewport */}
      <div className="bg-white border border-slate-150 rounded-md p-5 shadow-xs min-h-[400px]">
        {/* About RP Foundation */}
        {activeScreen === "about" && (
          <div className="space-y-4 animate-fadeIn" id="screen-about-content">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 bg-slate-50 rounded-md flex items-center justify-center text-[#0f4c81]">
                <Info className="w-5 h-5 text-[#0f4c81]" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-900">
                  {lang === "hi" ? "आरपी फाउंडेशन के बारे में" : "About RP Foundation"}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Official Foundation Portal</p>
              </div>
            </div>

            <div className="text-xs text-slate-650 leading-relaxed space-y-3.5 font-medium">
              <p>
                {lang === "hi"
                  ? "आरपी फाउंडेशन (रोहित पंडित फाउंडेशन) एक समर्पित गैर-लाभकारी सामाजिक संस्था है। इसकी स्थापना समाज के कमजोर और वंचित वर्गों को समान अवसर, गुणवत्तापूर्ण स्वास्थ्य सेवाएं और शैक्षिक समर्थन प्रदान करने के उद्देश्य से की गई है।"
                  : "The RP Foundation (Rohit Pandit Foundation) is a dedicated non-profit social organization. It has been established to empower underprivileged and marginalized sections of society by providing equal opportunities, qualitative healthcare services, and educational support."}
              </p>
              <p>
                {lang === "hi"
                  ? "फाउंडेशन मुख्य रूप से मध्य प्रदेश के भोपाल और सीहोर ग्रामीण क्षेत्रों में अपनी कल्याणकारी गतिविधियों का संचालन करता है। हम सामाजिक उन्नति और सतत विकास के लक्ष्यों को प्राप्त करने के लिए समाज के अंतिम व्यक्ति तक पहुँचने के लिए कटिबद्ध हैं।"
                  : "The foundation primarily operates its welfare initiatives across Bhopal and Sehore rural sectors in Madhya Pradesh. We are committed to reaching the last mile of society to enable continuous social upliftment and achieve key sustainable community goals."}
              </p>
              <div className="bg-slate-50/60 rounded-md p-4 border border-slate-100/70 space-y-2">
                <h4 className="font-bold text-xs text-[#0f4c81] flex items-center gap-1">
                  <Building className="w-4 h-4 text-[#0f4c81]" />
                  {lang === "hi" ? "आधिकारिक और रणनीतिक भागीदार" : "Official Strategic Partner"}
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {lang === "hi"
                    ? "पीपुल्स ग्रुप और पीपुल्स यूनिवर्सिटी (People's University, Bhopal) आरपी फाउंडेशन के मुख्य रणनीतिक स्वास्थ्य और शिक्षा सहयोगी हैं। इस मजबूत साझेदारी के माध्यम से हम चिकित्सा शिविरों और नागरिक सहायता का कुशलतापूर्वक संचालन करते हैं।"
                    : "People's Group and People's University (Bhopal) serve as the cornerstone strategic healthcare and educational partners of the RP Foundation. This powerful collaboration enables smooth operation of clinical camps and civic support loops."}
                </p>
              </div>
              <div className="pt-2">
                <a 
                  href="https://therpfoundation.org/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1 text-[#0f4c81] font-bold text-xs hover:underline"
                >
                  <span>{lang === "hi" ? "आधिकारिक वेबसाइट पर जाएं" : "Visit Official Website"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Founder Message */}
        {activeScreen === "founder" && (
          <div className="space-y-4 animate-fadeIn" id="screen-founder-content">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 bg-slate-50 rounded-md flex items-center justify-center text-[#0f4c81]">
                <User className="w-5 h-5 text-[#0f4c81]" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-900">
                  {lang === "hi" ? "संस्थापक का संदेश" : "Founder's Message"}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Rohit Pandit — Founder, RP Foundation</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-650 leading-relaxed">
              <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start bg-slate-50/70 p-4 rounded-md border border-slate-150">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-[#0f4c81] font-extrabold text-xl shrink-0 border-2 border-[#FF9933] shadow-xs">
                  RP
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{lang === "hi" ? "रोहित पंडित" : "Rohit Pandit"}</h4>
                  <p className="text-[10px] text-[#0f4c81] font-bold mb-1.5">{lang === "hi" ? "संस्थापक, आरपी फाउंडेशन" : "Founder, RP Foundation"}</p>
                  <p className="italic text-slate-600 font-medium text-[11px]">
                    {lang === "hi"
                      ? "\"सच्ची सेवा वही है जो समाज के सबसे कमजोर व्यक्ति तक पहुंचे और उसके जीवन में सकारात्मक परिवर्तन लाए। हम पीपुल्स यूनिवर्सिटी के साथ मिलकर इसी सेवा संकल्प को धरातल पर उतार रहे हैं।\""
                      : "\"True social service is that which reaches the most vulnerable individual in society and drives tangible betterment. Together with People's University, we are materializing this service pledge on the ground.\""}
                  </p>
                </div>
              </div>

              <div className="space-y-3 font-medium">
                <p>
                  {lang === "hi"
                    ? "प्रिय नागरिकों और स्वयंसेवकों, हमारा लक्ष्य केवल एक संस्था चलाना नहीं है, बल्कि समाज में एक ऐसा तंत्र स्थापित करना है जहाँ हर कोई एक-दूसरे की मदद के लिए तत्पर रहे। स्वास्थ्य, शिक्षा और पर्यावरण संरक्षण के प्रति हमारी प्रतिबद्धता अडिग है।"
                    : "Dear citizens and volunteers, our vision goes beyond running an organization; it is about building an empathetic ecosystem where everyone steps forward to aid one another. Our dedication towards health, education, and nature conservation remains absolute."}
                </p>
                <p>
                  {lang === "hi"
                    ? "पीपुल्स ग्रुप के नेतृत्व में हमारा अटूट विश्वास है कि शिक्षा और उन्नत स्वास्थ्य सेवा हर वर्ग की पहुँच में होनी चाहिए। मैं आप सभी से जनसेवा के इस महा-अभियान में जुड़कर स्वयंसेवक बनने और समाज के निर्माण में सहयोग देने की अपील करता हूँ।"
                    : "Backed by the institutional support of People's Group, we firmly believe that advanced healthcare and education must be within everyone's grasp. I appeal to all of you to join this collective journey as active volunteers and contributors."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Vision & Mission */}
        {activeScreen === "vision" && (
          <div className="space-y-4 animate-fadeIn" id="screen-vision-content">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 bg-slate-50 rounded-md flex items-center justify-center text-[#0f4c81]">
                <Compass className="w-5 h-5 text-[#0f4c81]" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-900">
                  {lang === "hi" ? "दृष्टि और ध्येय" : "Vision & Mission"}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Our Core Ideals & Direction</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-1 text-xs">
              <div className="bg-slate-50/50 p-4 rounded-md border border-slate-100 space-y-2">
                <h4 className="font-bold text-xs text-[#0f4c81] flex items-center gap-1">
                  <Compass className="w-4 h-4 text-[#0f4c81]" />
                  {lang === "hi" ? "हमारा दृष्टिकोण (Our Vision)" : "Our Vision"}
                </h4>
                <p className="text-slate-650 leading-relaxed font-medium">
                  {lang === "hi"
                    ? "एक ऐसे समावेशी, स्वस्थ और शिक्षित समाज का निर्माण करना जहाँ हर नागरिक के पास गरिमा के साथ जीने, गुणवत्तापूर्ण स्वास्थ्य सेवाएं प्राप्त करने और अपनी पूर्ण क्षमता के अनुसार बढ़ने के समान अवसर हों।"
                    : "To foster an inclusive, healthy, and educated society where every individual possesses equal opportunities to live with dignity, access premium healthcare, and grow to their absolute potential."}
                </p>
              </div>

              <div className="bg-indigo-50/50 p-4 rounded-md border border-indigo-100 space-y-2">
                <h4 className="font-bold text-xs text-indigo-900 flex items-center gap-1">
                  <Award className="w-4 h-4 text-indigo-600" />
                  {lang === "hi" ? "हमारा मिशन (Our Mission)" : "Our Mission"}
                </h4>
                <p className="text-slate-650 leading-relaxed font-medium">
                  {lang === "hi"
                    ? "रणनीतिक साझेदारों (पीपुल्स यूनिवर्सिटी) और समर्पित स्वयंसेवकों के सहयोग से ग्रामीण एवं वंचित क्षेत्रों में जमीनी स्तर पर स्वास्थ्य जांच, छात्रवृत्तियों, वृक्षारोपण और जन-सहायता के पारदर्शी कार्यक्रमों को प्रभावी ढंग से लागू करना।"
                    : "To execute transparent, grassroots social welfare programs in clinical relief, merit sponsoring, environmental protection, and peer mutual aid by leveraging our strategic alliance with People's University and our volunteer network."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Leadership */}
        {activeScreen === "leadership" && (
          <div className="space-y-4 animate-fadeIn" id="screen-leadership-content">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 bg-slate-50 rounded-md flex items-center justify-center text-[#0f4c81]">
                <Users className="w-5 h-5 text-[#0f4c81]" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-900">
                  {lang === "hi" ? "फाउंडेशन नेतृत्व" : "Foundation Leadership"}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Governing Council & Advisors</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="border border-slate-150 rounded-md p-4 bg-white space-y-2 flex gap-3.5 items-start">
                <div className="w-11 h-11 bg-[#FF9933] text-white font-extrabold rounded-full flex items-center justify-center shrink-0 border border-[#0f4c81]">
                  RP
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{lang === "hi" ? "रोहित पंडित" : "Rohit Pandit"}</h4>
                  <p className="text-[10px] text-[#0f4c81] font-bold">{lang === "hi" ? "संस्थापक और मुख्य न्यासी" : "Founder & Chief Trustee"}</p>
                  <p className="text-slate-500 text-[10.5px] mt-1 leading-relaxed">
                    {lang === "hi"
                      ? "पीपुल्स ग्रुप के नेतृत्व से जुड़े रोहित पंडित ग्रामीण विकास, सुलभ चिकित्सा और जनभागीदारी में पूर्ण निष्ठा के साथ सक्रिय सामाजिक कार्य कर रहे हैं।"
                      : "Associated with People's Group leadership, Rohit Pandit actively guides the strategic welfare and healthcare initiatives of the foundation with a citizen-centric vision."}
                  </p>
                </div>
              </div>

              <div className="border border-slate-150 rounded-md p-4 bg-slate-50/50 space-y-1">
                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  {lang === "hi" ? "रणनीतिक सलाहकार परिषद" : "Strategic Advisory Council"}
                </h4>
                <p className="text-slate-550 leading-relaxed font-medium">
                  {lang === "hi"
                    ? "पीपुल्स यूनिवर्सिटी के वरिष्ठ चिकित्सा विशेषज्ञों, शिक्षाविदों और प्रशासनिक समाज सेवकों का एक प्रतिष्ठित समूह जो फाउंडेशन के कार्यक्रमों की गुणवत्ता और पारदर्शिता की नियमित समीक्षा करता है।"
                    : "Comprises distinguished senior medical directors, academic deans from People's University, and senior administrative consultants who continuously govern program impact and execution guidelines."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Initiatives */}
        {activeScreen === "initiatives" && (
          <div className="space-y-4 animate-fadeIn" id="screen-initiatives-content">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 bg-slate-50 rounded-md flex items-center justify-center text-[#0f4c81]">
                <Briefcase className="w-5 h-5 text-[#0f4c81]" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-900">
                  {lang === "hi" ? "मुख्य सामाजिक पहल" : "Core Initiatives"}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Our Key Areas of Grassroots Action</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {[
                {
                  icon: Activity,
                  color: "text-[#0f4c81] bg-slate-50",
                  titleEn: "Aarogya Seva (Healthcare Camps)",
                  titleHi: "आरोग्य सेवा (निःशुल्क स्वास्थ्य शिविर)",
                  descEn: "Organizing modern medical diagnostic camps, pediatric screenings, and free distribution of necessary medicines in remote rural blocks.",
                  descHi: "दूरदराज के ग्रामीण इलाकों में चिकित्सा जांच शिविरों, बच्चों के स्क्रीनिंग शिविरों और पीपुल्स अस्पताल के माध्यम से निशुल्क दवाओं का वितरण।"
                },
                {
                  icon: BookOpen,
                  color: "text-blue-600 bg-blue-50",
                  titleEn: "Shiksha Vardhan (Education Sponsoring)",
                  titleHi: "शिक्षा वर्धन (छात्रवृत्ति एवं कंप्यूटर लैब)",
                  descEn: "Providing educational aid to bright students from underprivileged backgrounds, distributing learning resource packs, and supporting school libraries.",
                  descHi: "प्रतिभावान ग्रामीण बच्चों को वित्तीय छात्रवृत्ति सहायता प्रदान करना, शिक्षण सामग्री पैकेट और स्कूलों में कंप्यूटर लैब की स्थापना।"
                },
                {
                  icon: TreePine,
                  color: "text-teal-600 bg-teal-50",
                  titleEn: "Paryavaran Suraksha (Afforestation)",
                  titleHi: "पर्यावरण सुरक्षा (वृक्षारोपण अभियान)",
                  descEn: "Active community tree plantation campaigns, green energy adoption, and local water body conservation awareness in target blocks.",
                  descHi: "सीहोर और आसपास के क्षेत्रों में बड़े पैमाने पर सामुदायिक वृक्षारोपण अभियान, सौर प्रकाश स्थापना और जल संरक्षण जन जागरूकता।"
                },
                {
                  icon: Heart,
                  color: "text-red-600 bg-red-50",
                  titleEn: "Jan Bhagidari (Mutual Civic Aid)",
                  titleHi: "जन भागीदारी (नागरिक सहयोग मंच)",
                  descEn: "Coordinating peer-to-peer blood donation networks, winter blanket distributions, and primary crisis relief during seasonal distress.",
                  descHi: "ब्लड डोनर समन्वय नेटवर्क, सर्दियों में कंबलों का वितरण, आपातकालीन संकट और आपदा के समय त्वरित नागरिक सहायता उपलब्ध कराना।"
                }
              ].map((init, idx) => {
                const IconComp = init.icon;
                return (
                  <div key={idx} className="flex gap-3 p-3 bg-slate-50/70 border border-slate-150 rounded-md transition hover:border-[#FF9933]">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${init.color}`}>
                      <IconComp className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs">{lang === "hi" ? init.titleHi : init.titleEn}</h4>
                      <p className="text-slate-600 text-[10.5px] mt-0.5 leading-relaxed font-medium">{lang === "hi" ? init.descHi : init.descEn}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Transparency & Reports */}
        {activeScreen === "transparency" && (
          <div className="space-y-4 animate-fadeIn" id="screen-transparency-content">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 bg-slate-50 rounded-md flex items-center justify-center text-[#0f4c81]">
                <FileCheck className="w-5 h-5 text-[#0f4c81]" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-900">
                  {lang === "hi" ? "पारदर्शिता और रिपोर्ट" : "Transparency & Reports"}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">100% Verified Operational Accountability</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-medium">
              <p className="text-slate-650 leading-relaxed">
                {lang === "hi"
                  ? "आरपी फाउंडेशन वित्तीय पारदर्शिता और सामाजिक जवाबदेही के उच्चतम मानकों का पालन करता है। प्रत्येक वित्तीय वर्ष के खातों का विधिवत ऑडिट चार्टर्ड अकाउंटेंट्स द्वारा किया जाता है।"
                  : "The RP Foundation maintains the absolute highest standards of financial integrity and social accountability. Audits of accounts are continuously carried out by independent certified Chartered Accountants."}
              </p>

              {/* Strict content rule: No fake stats. Show admin dashboard notice */}
              <div className="border border-amber-200/90 bg-amber-50/40 rounded-md p-4 space-y-2 text-center relative overflow-hidden shadow-2xs">
                <div className="absolute top-0 right-0 bg-amber-500 text-[8px] text-white px-2 py-0.5 font-bold uppercase tracking-wide rounded-bl-xl">
                  {lang === "hi" ? "सुरक्षित सिंक" : "Secure Sync"}
                </div>
                <div className="w-9 h-9 bg-amber-150 rounded-full flex items-center justify-center text-amber-700 mx-auto">
                  <Shield className="w-5 h-5" />
                </div>
                <p className="font-display font-black text-xs text-amber-955 mt-1">
                  {lang === "hi" ? "डेटा आरपी फाउंडेशन एडमिन डैशबोर्ड से सिंक किया जाएगा" : "Data will be populated from RP Foundation Admin Dashboard"}
                </p>
                <p className="text-[10px] text-slate-500 leading-relaxed px-2">
                  {lang === "hi"
                    ? "वार्षिक बजट ब्रेकडाउन, दाताओं की रसीदें, ऑडिट रिपोर्ट और ब्लॉक-वार विकास खर्च सीधे प्रशासनिक डेटाबेस से प्रदर्शित किए जाएंगे।"
                    : "Annual audited balance sheets, detailed donor statistics, resource allocation flowcharts, and municipal spending metrics will stream live from the admin panel."}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-md border border-slate-150 text-[10px] font-mono text-slate-550 flex justify-between items-center">
                <span>Income Tax registration status:</span>
                <span className="font-bold text-slate-700">80G & 12A Certified</span>
              </div>
            </div>
          </div>
        )}

        {/* Contact Us */}
        {activeScreen === "contact" && (
          <div className="space-y-4 animate-fadeIn" id="screen-contact-content">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 bg-slate-50 rounded-md flex items-center justify-center text-[#0f4c81]">
                <Mail className="w-5 h-5 text-[#0f4c81]" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-900">
                  {lang === "hi" ? "संपर्क करें" : "Contact Us"}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Reach Our Central Welfare Office</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 border border-slate-150 rounded-md p-4 space-y-2.5">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {lang === "hi" ? "केंद्रीय कार्यालय पता" : "Central Office Address"}
                  </p>
                  <p className="font-bold text-slate-800 text-[11px] mt-0.5">
                    {lang === "hi" ? "आरपी फाउंडेशन कल्याण प्रभाग, भोपाल / सीहोर क्षेत्र, मध्य प्रदेश, भारत" : "RP Foundation Welfare Division, Bhopal / Sehore Block, Madhya Pradesh, India"}
                  </p>
                </div>

                <div className="border-t border-slate-200/50 pt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {lang === "hi" ? "ईमेल संपर्क (Central)" : "Central Email ID"}
                    </p>
                    <p className="font-mono text-[11px] font-semibold text-[#0f4c81]">admin@therpfoundation.org</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {lang === "hi" ? "रणनीतिक भागीदार ईमेल" : "Strategic Partner Liaison"}
                    </p>
                    <p className="font-mono text-[11px] font-semibold text-indigo-700">admin@peoplesuniversity.in</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/40 p-4 border border-slate-100/60 rounded-md text-center space-y-1.5">
                <h4 className="font-bold text-[#0f4c81] text-xs">{lang === "hi" ? "एक संदेश भेजें" : "Send a Direct Query"}</h4>
                <p className="text-[10.5px] text-slate-600 leading-normal">
                  {lang === "hi" 
                    ? "नागरिक शिकायतों, कैंप भागीदारी, छात्रवृत्ति पूछताछ या दान से संबंधित मुद्दों के लिए हमारे प्रतिनिधि 24 घंटे में उत्तर देंगे।"
                    : "For queries regarding student scholarships, blood campaigns, diagnostic card verification, or donation compliance, write to our nodal officer."}
                </p>
                <div className="pt-1.5">
                  <a 
                    href="mailto:admin@peoplesuniversity.in?subject=RP%20Foundation%20Enquiry" 
                    className="inline-flex bg-[#0f4c81] hover:bg-[#0f4c81] text-white font-bold text-[10px] px-3.5 py-1.5 rounded-md transition cursor-pointer"
                  >
                    {lang === "hi" ? "सीधा ईमेल भेजें" : "Launch Mail Client"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Partner Organizations */}
        {activeScreen === "partners" && (
          <div className="space-y-4 animate-fadeIn" id="screen-partners-content">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 bg-slate-50 rounded-md flex items-center justify-center text-[#0f4c81]">
                <Building className="w-5 h-5 text-[#0f4c81]" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-900">
                  {lang === "hi" ? "रणनीतिक भागीदार संगठन" : "Strategic Partner Organizations"}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Academic & Medical Collaborators</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs leading-relaxed">
              <div className="border border-slate-150 rounded-md p-4 bg-white space-y-2.5">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-display font-black text-slate-900 text-sm">
                      {lang === "hi" ? "पीपुल्स ग्रुप और पीपुल्स यूनिवर्सिटी" : "People's Group & People's University"}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold">Bhopal, Madhya Pradesh</p>
                  </div>
                  <span className="bg-slate-50 text-[#0f4c81] text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-100">
                    {lang === "hi" ? "प्रमुख चिकित्सा भागीदार" : "Anchor Partner"}
                  </span>
                </div>
                <p className="text-slate-650 text-[11px] font-medium">
                  {lang === "hi"
                    ? "पीपुल्स ग्रुप मध्य भारत का एक अत्यंत प्रतिष्ठित शैक्षणिक और चिकित्सा समूह है। पीपुल्स यूनिवर्सिटी और पीपुल्स मेडिकल कॉलेज अस्पताल आरपी फाउंडेशन की कल्याणकारी गतिविधियों, मोतियाबिंद जांच शिविरों और चिकित्सा सहायता में डॉक्टरों, स्वयंसेवकों और रियायती दरों पर नैदानिक बुनियादी ढांचा प्रदान करते हैं।"
                    : "People's Group is a leading medical and educational conglomerate in Central India. Its flagship institution, People's University, operates high-quality hospitals and diagnostic laboratories. In alignment with RP Foundation, they supply board-certified doctors, student volunteers, and medical infrastructure for rural diagnostic health camps."}
                </p>
                <div className="pt-1.5 flex justify-between items-center border-t border-slate-100">
                  <span className="text-[9px] font-mono text-slate-400">Website: https://www.peoplesuniversity.edu.in</span>
                  <a 
                    href="https://www.peoplesuniversity.edu.in" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[#0f4c81] hover:underline font-bold text-[10.5px] flex items-center gap-0.5"
                  >
                    <span>{lang === "hi" ? "साइट देखें" : "Visit Site"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Media Gallery */}
        {activeScreen === "gallery" && (
          <div className="space-y-4 animate-fadeIn" id="screen-gallery-content">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 bg-slate-50 rounded-md flex items-center justify-center text-[#0f4c81]">
                <ImageIcon className="w-5 h-5 text-[#0f4c81]" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-900">
                  {lang === "hi" ? "मीडिया गैलरी" : "Media Gallery"}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Verified Ground Activity Photographs</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="relative h-24 bg-slate-100 rounded-md overflow-hidden border border-slate-200">
                    <img 
                      src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=250" 
                      alt="Health Camp Diagnostic" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-[9px] text-slate-500 text-center truncate leading-none">Diagnostic Camp Partnership</p>
                </div>
                <div className="space-y-1.5">
                  <div className="relative h-24 bg-slate-100 rounded-md overflow-hidden border border-slate-200">
                    <img 
                      src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=250" 
                      alt="Educational Distribution" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-[9px] text-slate-500 text-center truncate leading-none">School Textbook Sponsoring</p>
                </div>
              </div>

              {/* Strict content rule: Show admin dashboard notice */}
              <div className="bg-slate-50 rounded-md p-3 border border-slate-150 text-center text-slate-550 text-[10px]">
                <p className="font-bold text-slate-700">
                  {lang === "hi" ? "गैलरी सिंक सूचना" : "Media Gallery Sync"}
                </p>
                <p className="mt-1">
                  {lang === "hi" 
                    ? "✓ आधिकारिक कार्यक्रम मीडिया गैलरी आरपी फाउंडेशन एडमिन डैशबोर्ड से सीधे सिंक की जाएगी।"
                    : "✓ Official event media gallery will be synchronized from the RP Foundation Admin Dashboard."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Social Media Hub */}
        {activeScreen === "social" && (
          <div className="space-y-4 animate-fadeIn" id="screen-social-content">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 bg-slate-50 rounded-md flex items-center justify-center text-[#0f4c81]">
                <Share2 className="w-5 h-5 text-[#0f4c81]" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-900">
                  {lang === "hi" ? "सोशल मीडिया हब" : "Social Media Hub"}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Follow Verified Public Channels</p>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <p className="text-slate-600 font-medium">
                {lang === "hi"
                  ? "आरपी फाउंडेशन और संस्थापक रोहित पंडित के सत्यापित अपडेट्स के लिए हमारे आधिकारिक सोशल मीडिया प्लेटफॉर्म से जुड़ें:"
                  : "Connect with our official verified digital platforms for live welfare announcements from Founder Rohit Pandit:"}
              </p>

              <div className="space-y-2">
                {[
                  { channel: "Official Website", handle: "therpfoundation.org", link: "https://therpfoundation.org/" },
                  { channel: "Official X", handle: "@rpfoundation15", link: "https://x.com/rpfoundation15" },
                  { channel: "Official Facebook", handle: "RP Foundation", link: "https://www.facebook.com/rpfofficial/" },
                  { channel: "Official Instagram", handle: "@rpfoundationofficial", link: "https://www.instagram.com/rpfoundationofficial/" }
                ].map((soc, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50/70 p-3 rounded-md border border-slate-150">
                    <div>
                      <span className="font-bold text-slate-800 text-[11px] block">{soc.channel}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{soc.handle}</span>
                    </div>
                    <a 
                      href={soc.link} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[#0f4c81] hover:underline text-[10.5px] font-bold flex items-center gap-0.5"
                    >
                      <span>{lang === "hi" ? "खोलें" : "Follow"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
