import React from "react";
import {
  ArrowLeft,
  HeartPulse,
  GraduationCap,
  Briefcase,
  Users,
  Leaf,
  Droplets,
  Sparkles,
  Target,
  ChevronRight,
  MapPin,
  HeartHandshake,
  Compass,
  ShieldCheck,
  Award
} from "lucide-react";
import { motion } from "motion/react";
import { useNavigate, useOutletContext } from "react-router-dom";

type Lang = "en" | "hi";

const pillars = [
  {
    icon: HeartPulse,
    titleEn: "Healthcare Accessibility",
    titleHi: "स्वास्थ्य सेवा पहुंच",
    descEn: "Free medical health camps, mobile diagnostic vans, preventive care, and emergency blood donation networks across rural & urban communities.",
    descHi: "ग्रामीण और शहरी समुदायों में मुफ्त चिकित्सा शिविर, मोबाइल डायग्नोस्टिक वैन, और आपातकालीन रक्त नेटवर्क।",
    accent: "text-[#DC2626] bg-red-500/10 border border-red-500/20"
  },
  {
    icon: Briefcase,
    titleEn: "Employment & Skill Building",
    titleHi: "रोजगार एवं कौशल विकास",
    descEn: "Vocational training workshops, career counseling, resume building tools, and connecting local youth with sustainable employment opportunities.",
    descHi: "व्यावसायिक प्रशिक्षण कार्यशालाएं, करियर परामर्श, और युवाओं को टिकाऊ रोजगार के अवसरों से जोड़ना।",
    accent: "text-[#167C5A] bg-emerald-500/10 border border-emerald-500/20"
  },
  {
    icon: Users,
    titleEn: "Women Self-Reliance",
    titleHi: "महिला स्वावलंबन एवं सशक्तिकरण",
    descEn: "Financial independence initiatives, skill development, micro-entrepreneurship support, and clean mobility assistance.",
    descHi: "वित्तीय स्वतंत्रता पहल, कौशल विकास, सूक्ष्म-उद्यमिता सहायता, और स्वच्छ गतिशीलता सहायता।",
    accent: "text-[#D97706] bg-amber-500/10 border border-amber-500/20"
  },
  {
    icon: GraduationCap,
    titleEn: "Education & Literacy Aid",
    titleHi: "शिक्षा और साक्षरता सहायता",
    descEn: "Supporting underprivileged students with essential learning kits, digital literacy programs, and merit scholarship guidance.",
    descHi: "वंचित छात्रों को आवश्यक शिक्षण किट, डिजिटल साक्षरता कार्यक्रम और छात्रवृत्ति सहायता।",
    accent: "text-[#14213D] bg-slate-500/10 border border-slate-500/20"
  },
  {
    icon: Leaf,
    titleEn: "Environmental Sustainability",
    titleHi: "पर्यावरण संरक्षण एवं स्वच्छता",
    descEn: "Community tree plantation drives, clean water awareness, sanitation campaigns, and eco-friendly waste management practices.",
    descHi: "सामुदायिक वृक्षारोपण अभियान, स्वच्छ जल जागरूकता, और पर्यावरण के अनुकूल स्वच्छता अभियान।",
    accent: "text-[#167C5A] bg-emerald-500/10 border border-emerald-500/20"
  },
  {
    icon: ShieldCheck,
    titleEn: "Grievance & Public Support",
    titleHi: "शिकायत समाधान और जन सेवा",
    descEn: "Transparent public grievance filing system, Jan Seva Card identity benefits, and direct volunteer support on the ground.",
    descHi: "पारदर्शी जन शिकायत प्रणाली, जन सेवा कार्ड लाभ, और जमीनी स्तर पर स्वयंसेवक सहायता।",
    accent: "text-[#D97706] bg-amber-500/10 border border-amber-500/20"
  }
];

export default function VisionGoalsPage() {
  const nav = useNavigate();
  const { lang } = useOutletContext<{ lang: Lang }>();
  const hi = lang === "hi";

  return (
    <main className="min-h-full bg-transparent pb-16 text-[#14213D]">
      <div className="mx-auto max-w-3xl px-4 py-4 space-y-5 sm:px-6">
        
        {/* Back Button */}
        <button
          onClick={() => nav(-1)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 px-3.5 py-1.5 text-xs font-bold text-[#14213D] shadow-2xs hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          {hi ? "वापस" : "Back to Home"}
        </button>

        {/* Hero Banner */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[28px] border border-amber-200/80 bg-gradient-to-br from-amber-500/10 via-white to-emerald-500/10 p-6 sm:p-7 shadow-xs"
        >
          <div className="flex items-center gap-2 text-[#D97706]">
            <Sparkles className="h-4 w-4" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest">
              RP Foundation Charter
            </span>
          </div>

          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#14213D] tracking-tight leading-snug">
            {hi ? "एक सशक्त समाज, सबके लिए अवसर" : "Empowerment Beyond Assistance: Our Strategic Vision"}
          </h1>

          <p className="mt-2.5 text-xs sm:text-[13.5px] leading-relaxed text-slate-600 font-medium">
            {hi
              ? "आरपी फाउंडेशन का लक्ष्य समाज के अंतिम व्यक्ति तक स्वास्थ्य, रोजगार, शिक्षा और न्यायसंगत जन सुविधाओं को पहुंचाना है। हमारा दृष्टिकोण केवल क्षणिक सहायता नहीं, बल्कि दीर्घकालिक आत्मनिर्भरता का निर्माण करना है।"
              : "RP Foundation is driven by a commitment to build self-reliance, dignity, and sustainable social infrastructure across communities in India."}
          </p>
        </motion.section>

        {/* Core Vision Narrative Statement */}
        <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-[#167C5A]">
            <Compass className="h-5 w-5" />
            <h2 className="text-lg sm:text-xl font-bold text-[#14213D]">
              {hi ? "हमारा मार्गदर्शक दर्शन" : "Our Core Philosophy"}
            </h2>
          </div>
          <p className="text-xs sm:text-[13px] leading-relaxed text-slate-600 font-medium">
            {hi
              ? "सच्चा सामाजिक परिवर्तन केवल योजनाओं के कागजों से नहीं आता, बल्कि जब हम ज़मीनी स्तर पर नागरिकों को सीधे स्वास्थ्य, कौशल और शिकायतों के समाधान से जोड़ते हैं। आरपी फाउंडेशन एक ऐसा समन्वित मॉडल प्रस्तुत करता है जहाँ हर पहल दूसरी पहल को मजबूत करती है।"
              : "True social development connects individual welfare with structured, transparent community systems. When health care, employment, education, and grievance resolution operate in harmony, support turns into permanent capability."}
          </p>
        </section>

        {/* Areas of Impact Section */}
        <section className="space-y-3">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#D97706]">
              {hi ? "प्रभाव के 6 मुख्य स्तंभ" : "Pillars of Action"}
            </p>
            <h2 className="mt-0.5 text-xl font-bold text-[#14213D]">
              {hi ? "कार्य के मुख्य क्षेत्र" : "Strategic Action Pillars"}
            </h2>
          </div>

          <div className="space-y-3">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.titleEn}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="rounded-[20px] border border-slate-200/80 bg-white p-4.5 shadow-2xs flex items-start gap-4"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${p.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-[15px] font-bold text-[#14213D]">
                      {hi ? p.titleHi : p.titleEn}
                    </h3>
                    <p className="text-[12px] sm:text-[12.5px] leading-relaxed text-slate-600 font-medium">
                      {hi ? p.descHi : p.descEn}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Flagship Initiative Highlight */}
        <section className="overflow-hidden rounded-[24px] border border-amber-200/80 bg-gradient-to-r from-amber-50 to-white p-5 sm:p-6 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-[#D97706]">
            <Award className="h-5 w-5" />
            <span className="text-[10.5px] font-extrabold uppercase tracking-widest">
              {hi ? "प्रमुख पहल" : "Flagship Initiative"}
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#14213D]">
            {hi ? "पिंक ई-रिक्शा महिला स्वावलंबन योजना" : "Pink E-Rickshaw Empowerment Model"}
          </h3>
          <p className="text-xs sm:text-[13px] leading-relaxed text-slate-600 font-medium">
            {hi
              ? "महिलाओं को वित्तीय स्वतंत्रता और सुरक्षित परिवहन से जोड़ने वाली एक क्रांतिकारी पहल। भोपाल एवं अन्य शहरों में कई महिलाओं को आत्मनिर्भर जीवन और सम्मानजनक आजीविका प्रदान की गई है।"
              : "Combining women's economic independence with clean, green urban mobility—transitioning from one-time assistance to sustainable daily earning opportunities."}
          </p>
        </section>

        {/* Footer Call to Action */}
        <section className="rounded-[24px] border border-slate-200/80 bg-[#14213D] p-5 sm:p-6 text-white text-center space-y-3">
          <h3 className="text-lg font-bold text-white">
            {hi ? "संस्थापक के विचारों को जानें" : "Connect With Our Leadership"}
          </h3>
          <p className="text-xs leading-relaxed text-slate-300 font-medium max-w-lg mx-auto">
            {hi
              ? "संस्थापक रोहित पंडित जी के विज़न और आरपी फाउंडेशन के स्वयंसेवकों की यात्रा के बारे में पढ़ें।"
              : "Discover the personal journey, values, and vision of Founder Rohit Pandit."}
          </p>
          <button
            onClick={() => nav("/founder-message")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-[#14213D] hover:bg-amber-400 transition-all shadow-sm"
          >
            {hi ? "संस्थापक का संदेश पढ़ें" : "Read Founder's Message"} <ChevronRight className="h-4 w-4" />
          </button>
        </section>

      </div>
    </main>
  );
}
