import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Activity, Calculator, CheckCircle2, Clock3, Compass, HeartPulse, ListChecks, MessageSquare, Smartphone, Timer, Wind, Sparkles, CloudSun } from "lucide-react";

const sections = [
  {
    title: "Daily essentials",
    hi: "दैनिक आवश्यकताएँ",
    tools: [
      { id: "daily-hub", title: "Daily Hub", hi: "दैनिक हब", desc: "Weather, AQI and useful daily information", descHi: "मौसम, AQI और रोज़मर्रा की उपयोगी जानकारी", icon: CloudSun, route: "/daily" },
      { id: "quick-calculator", title: "Quick Calculator", hi: "क्विक कैलकुलेटर", desc: "Simple offline arithmetic", descHi: "सरल ऑफलाइन गणना", icon: Calculator, route: "/utilities/quick-calculator" },
      { id: "split-bill", title: "Split Bill", hi: "बिल बांटें", desc: "Split amount with tip", descHi: "टिप सहित बिल बांटें", icon: Calculator, route: "/utilities/split-bill" },
      { id: "decision-maker", title: "Decision Maker", hi: "निर्णय सहायक", desc: "Make a quick yes/no/maybe decision", descHi: "जल्दी हाँ/नहीं/शायद निर्णय लें", icon: Compass, route: "/utilities/decision-maker" },
    ],
  },
  {
    title: "Focus & wellbeing",
    hi: "फोकस और वेलनेस",
    tools: [
      { id: "pomodoro", title: "Pomodoro Timer", hi: "पोमोडोरो टाइमर", desc: "Focus and break timer", descHi: "फोकस और ब्रेक टाइमर", icon: Timer, route: "/utilities/pomodoro" },
      { id: "breathing-meditator", title: "Breathing Meditator", hi: "ब्रीदिंग मेडिटेटर", desc: "Guided breathing cycles", descHi: "निर्देशित श्वास अभ्यास", icon: Wind, route: "/utilities/breathing-meditator" },
      { id: "habit-tracker", title: "Habit Tracker", hi: "हैबिट ट्रैकर", desc: "Track daily habits locally", descHi: "दैनिक आदतें स्थानीय रूप से ट्रैक करें", icon: ListChecks, route: "/utilities/habit-tracker" },
      { id: "fasting-tracker", title: "Fasting Tracker", hi: "फास्टिंग ट्रैकर", desc: "Track elapsed fasting time", descHi: "फास्टिंग का बीता समय ट्रैक करें", icon: Clock3, route: "/utilities/fasting-tracker" },
    ],
  },
  {
    title: "Learning & tests",
    hi: "लर्निंग और टेस्ट",
    tools: [
      { id: "morse-code", title: "Morse Code", hi: "मोर्स कोड", desc: "Convert text to Morse code", descHi: "टेक्स्ट को मोर्स कोड में बदलें", icon: MessageSquare, route: "/utilities/morse-code" },
      { id: "typing-speed", title: "Typing Speed Test", hi: "टाइपिंग स्पीड टेस्ट", desc: "Measure typing speed locally", descHi: "टाइपिंग स्पीड स्थानीय रूप से मापें", icon: CheckCircle2, route: "/utilities/typing-speed" },
    ],
  },
  {
    title: "Phone utilities",
    hi: "फोन यूटिलिटीज",
    tools: [
      { id: "device-tools", title: "Phone Device Tools", hi: "फोन डिवाइस टूल्स", desc: "Flashlight, compass, sensors and tests", descHi: "फ्लैशलाइट, कंपास, सेंसर और टेस्ट", icon: Smartphone, route: "/device-tools" },
    ],
  },
  {
    title: "Health utility",
    hi: "स्वास्थ्य यूटिलिटी",
    tools: [
      { id: "bmi-calculator", title: "BMI Calculator", hi: "BMI कैलकुलेटर", desc: "Calculate BMI offline", descHi: "ऑफलाइन BMI की गणना करें", icon: HeartPulse, route: "/utilities/bmi-calculator" },
    ],
  },
];

export default function UtilityCenter() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const navigate = useNavigate();
  const hi = lang === "hi";

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-28">
      <header className="pt-3">
        <div className="flex items-center gap-2 text-[#000080]">
          <Sparkles className="h-5 w-5" />
          <span className="text-xs font-black uppercase tracking-widest">RPF Daily Utility</span>
        </div>
        <h1 className="mt-1 text-2xl font-black text-slate-900">
          {hi ? "दैनिक उपयोगिता केंद्र" : "Daily Utility Center"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {hi ? "पहले से बने utilities को एक ही जगह से खोलें।" : "Access the app's existing everyday utilities from one place."}
        </p>
      </header>

      <div className="mt-5 space-y-6">
        {sections.map((section) => (
          <section key={section.title}>
            <div className="mb-2 flex items-center gap-2 px-1">
              <Activity className="h-4 w-4 text-[#FF9933]" />
              <h2 className="text-sm font-black text-[#000080]">{hi ? section.hi : section.title}</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {section.tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => navigate(tool.route)}
                    className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition active:scale-[.98] hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-slate-900">{hi ? tool.hi : tool.title}</h3>
                      <p className="mt-1 text-xs font-medium text-slate-500">{hi ? tool.descHi : tool.desc}</p>
                    </div>
                    <span className="text-lg text-slate-300">›</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
