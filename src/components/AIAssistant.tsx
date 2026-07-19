// src/components/AIAssistant.tsx
// ──────────────────────────────────────────────────────────────────────────────
//  RP AI MITR — REAL Chatbot
//  Flow:
//    1. Local keyword parser → instant structured response
//    2. If keyword match exists → reply immediately (no network call)
//    3. If NO local match → call /api/ai/chat (Gemini backend)
//    4. If Gemini fails → fetchExternalSearch (Google Search, dual-path)
//    5. Display real web links from Google when all else fails
//  Zero hardcoded dummy lines — all "Development Offline" text removed.
// ──────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from "react";
import {
  Send,
  Mic,
  Sparkles,
  Bot,
  Loader2,
  RefreshCw,
  ExternalLink,
  X,
} from "lucide-react";
import { UserProfile } from "../types";

/* ═══════════════════════════════════════════════════════════════
   Types
═══════════════════════════════════════════════════════════════ */
interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  links?: { title: string; url: string; snippet: string; displayLink: string }[];
  timestamp: string;
}

interface AIAssistantProps {
  lang: "hi" | "en";
  userProfile: UserProfile;
  onNavigateToTab: (tabId: string) => void;
}

/* ═══════════════════════════════════════════════════════════════
   Local knowledge base — keyword → structured response
═══════════════════════════════════════════════════════════════ */
interface KBEntry {
  keywords: string[];
  tabId?: string;
  responseEn: string;
  responseHi: string;
}

const KNOWLEDGE_BASE: KBEntry[] = [
  {
    keywords: ["jan seva card", "जन सेवा कार्ड", "card", "कार्ड", "kyc", "qr pass"],
    tabId: "jan_seva",
    responseEn:
      "**Jan Seva Card** is your digital identity pass from RP Foundation.\n\n📋 **Steps to Apply:**\n1. Go to *Services → Jan Seva Card*.\n2. Fill Name, DOB and upload a valid ID document.\n3. Your Aadhaar is masked for privacy — never stored as plain text.\n4. Once approved, download your QR-enabled digital pass.\n\n🚀 Navigating you there now…",
    responseHi:
      "**जन सेवा कार्ड** आरपी फाउंडेशन का आपका डिजिटल पहचान पास है।\n\n📋 **आवेदन के चरण:**\n1. *सेवाएं → जन सेवा कार्ड* पर जाएं।\n2. नाम, जन्म तिथि और वैध ID दस्तावेज़ अपलोड करें।\n3. आपका आधार गोपनीयता के लिए मास्क किया जाएगा।\n4. स्वीकृत होने पर अपना QR-युक्त डिजिटल पास डाउनलोड करें।\n\n🚀 अभी वहाँ ले जा रहा हूँ…",
  },
  {
    keywords: ["blood", "रक्त", "ब्लड", "blood donor", "रक्तदान", "donate blood", "blood bank"],
    tabId: "blood",
    responseEn:
      "**Blood Network** — Emergency or voluntary blood donation.\n\n🩸 **Request Blood:** Post your required group, hospital name and units needed.\n🩸 **Register as Donor:** Submit blood type, last donation date.\n📍 Live blood bank map available in the app.\n\n🚀 Opening Blood Network for you…",
    responseHi:
      "**रक्त नेटवर्क** — आपातकालीन या स्वैच्छिक रक्तदान।\n\n🩸 **रक्त अनुरोध:** आवश्यक ग्रुप, अस्पताल का नाम और यूनिट दर्ज करें।\n🩸 **रक्तदाता पंजीकरण:** ब्लड टाइप और अंतिम दान तिथि सबमिट करें।\n📍 लाइव ब्लड बैंक मैप ऐप में उपलब्ध है।\n\n🚀 अभी रक्त नेटवर्क खोल रहा हूँ…",
  },
  {
    keywords: ["volunteer", "स्वयंसेवक", "seva", "सेवा करना", "join", "जुड़ें"],
    tabId: "volunteer",
    responseEn:
      "**Volunteer Opportunities** at RP Foundation.\n\n🤝 **How to Join:**\n1. Go to *Services → Volunteer Opportunities*.\n2. Choose a skill: Teaching, IT, Field Work, Healthcare.\n3. Sign up for weekend drives, food camps, plantation events.\n4. Log volunteer hours and download your certificate!\n\n🚀 Taking you there…",
    responseHi:
      "**RP Foundation में स्वयंसेवक बनें।**\n\n🤝 **कैसे जुड़ें:**\n1. *सेवाएं → स्वयंसेवक अवसर* पर जाएं।\n2. कौशल श्रेणी चुनें: शिक्षण, IT, क्षेत्र कार्य, स्वास्थ्य।\n3. सप्ताहांत अभियानों, भोजन शिविरों के लिए साइन अप करें।\n4. घंटे लॉग करें और प्रमाण पत्र डाउनलोड करें!\n\n🚀 वहाँ ले जा रहा हूँ…",
  },
  {
    keywords: ["donate", "दान", "donation", "charity", "help", "₹", "rupee", "पैसा"],
    tabId: "donate",
    responseEn:
      "**Donate to RP Foundation** — Your contribution changes lives.\n\n💛 **Quick options:** ₹500 / ₹1000 / ₹5000 or a custom amount.\n📜 **80G Certificate:** Auto-generated tax-exemption PDF.\n🔄 **Monthly Recurring:** Toggle to auto-repeat your donation every month.\n\n100% transparent fund usage.\n\n🚀 Opening Donate page…",
    responseHi:
      "**आरपी फाउंडेशन को दान करें** — आपका योगदान जीवन बदलता है।\n\n💛 **त्वरित विकल्प:** ₹500 / ₹1000 / ₹5000 या कस्टम राशि।\n📜 **80G सर्टिफिकेट:** स्वत: निर्मित कर-छूट PDF।\n🔄 **मासिक पुनरावृत्ति:** हर महीने स्वचालित दान करें।\n\n🚀 दान पेज खोल रहा हूँ…",
  },
  {
    keywords: ["complaint", "grievance", "शिकायत", "problem", "समस्या", "report", "रिपोर्ट"],
    tabId: "complaint",
    responseEn:
      "**File a Grievance** — We take every complaint seriously.\n\n📝 **Steps:**\n1. Go to *Services → File Grievance*.\n2. Choose category, attach photos, GPS-tag the location.\n3. Your ticket ID is generated instantly for tracking.\n4. Admin team responds within 48 hours.\n\n🚀 Opening Grievance Portal…",
    responseHi:
      "**शिकायत दर्ज करें** — हम हर शिकायत को गंभीरता से लेते हैं।\n\n📝 **चरण:**\n1. *सेवाएं → शिकायत पंजीकरण* पर जाएं।\n2. श्रेणी चुनें, फ़ोटो अटैच करें, GPS लोकेशन टैग करें।\n3. आपका टिकट ID तुरंत ट्रैकिंग के लिए मिलेगा।\n4. एडमिन टीम 48 घंटों में जवाब देती है।\n\n🚀 शिकायत पोर्टल खोल रहा हूँ…",
  },
  {
    keywords: ["scholarship", "छात्रवृत्ति", "education", "शिक्षा", "school", "college", "student", "पढ़ाई"],
    tabId: "education",
    responseEn:
      "**Education Support** — Free textbooks, scholarships & study centers.\n\n📚 **Available:**\n• BPL Scholarship — up to ₹15,000/year for deserving students.\n• Digital Textbook Library — NCERT + RP Foundation guides.\n• Study Center Locator — find nearest free coaching.\n\nApply via *Services → Education Support*.\n\n🚀 Navigating…",
    responseHi:
      "**शिक्षा सहयोग** — मुफ़्त पाठ्यपुस्तकें, छात्रवृत्ति और अध्ययन केंद्र।\n\n📚 **उपलब्ध:**\n• BPL छात्रवृत्ति — पात्र छात्रों को ₹15,000/वर्ष तक।\n• डिजिटल पुस्तकालय — NCERT + RP Foundation गाइड।\n• अध्ययन केंद्र खोजक — निकटतम मुफ़्त कोचिंग खोजें।\n\n*सेवाएं → शिक्षा सहयोग* से आवेदन करें।\n\n🚀 ले जा रहा हूँ…",
  },
  {
    keywords: ["scheme", "योजना", "government", "सरकारी", "ayushman", "आयुष्मान", "pmay", "ration", "राशन"],
    tabId: "schemes",
    responseEn:
      "**Government Schemes** — Know your entitlements.\n\n🏛️ **Key schemes we cover:**\n• Ayushman Bharat — ₹5 lakh health cover\n• PMAY — housing subsidy for pakka homes\n• PM Kisan — ₹6000/year for farmers\n• Ration Card — eligibility & application guide\n\nUse our *Eligibility Calculator* in *Services → Government Schemes*.",
    responseHi:
      "**सरकारी योजनाएं** — अपने अधिकार जानें।\n\n🏛️ **प्रमुख योजनाएं:**\n• आयुष्मान भारत — ₹5 लाख स्वास्थ्य कवर\n• PMAY — पक्के घर के लिए सब्सिडी\n• PM किसान — किसानों को ₹6000/वर्ष\n• राशन कार्ड — पात्रता और आवेदन मार्गदर्शिका\n\n*सेवाएं → सरकारी योजनाएं* में पात्रता कैलकुलेटर उपयोग करें।",
  },
  {
    keywords: ["women", "महिला", "safety", "सुरक्षा", "helpline", "abuse", "shelter", "safe house"],
    tabId: "women",
    responseEn:
      "**Women Support** — You are not alone.\n\n🛡️ **Immediate help:**\n• Encrypted 24/7 counseling chat (private)\n• Hidden panic exit button — instantly clears session\n• Safe-house directory — nearest shelter locations\n• Helpline: **1091** (Women's Helpline)\n\nGo to *Services → Women Support* or call 1091 now.",
    responseHi:
      "**महिला सहायता** — आप अकेली नहीं हैं।\n\n🛡️ **तुरंत मदद:**\n• एन्क्रिप्टेड 24/7 काउंसलिंग चैट (निजी)\n• छुपा पैनिक बटन — सत्र तुरंत साफ़ करता है\n• आश्रय निर्देशिका — निकटतम शेल्टर\n• हेल्पलाइन: **1091** (महिला हेल्पलाइन)\n\n*सेवाएं → महिला सहायता* पर जाएं या अभी 1091 पर कॉल करें।",
  },
  {
    keywords: ["hello", "hi", "namaste", "नमस्ते", "हेलो", "hey", "help me", "मदद"],
    responseEn:
      "Namaste! 🙏 I am **RP AI Mitr** — your Jan Seva assistant.\n\nI can help you with:\n• Jan Seva Card application\n• Blood donation & emergency network\n• Government schemes (Ayushman, PMAY, etc.)\n• Volunteering, Education, Grievances, Donations\n\nJust ask me in Hindi or English — I understand both!",
    responseHi:
      "नमस्ते! 🙏 मैं **RP AI मित्र** हूँ — आपका जन सेवा सहायक।\n\nमैं इनमें मदद कर सकता हूँ:\n• जन सेवा कार्ड आवेदन\n• रक्तदान एवं आपातकालीन नेटवर्क\n• सरकारी योजनाएं (आयुष्मान, PMAY आदि)\n• स्वयंसेवा, शिक्षा, शिकायत, दान\n\nहिंदी या अंग्रेजी में पूछें — मैं दोनों समझता हूँ!",
  },
  {
    keywords: ["motive", "purpose", "dhyey", "aim", "rp foundation kya hai", "foundation kya hai", "lakshya", "laksya", "motive kya"],
    responseEn:
      "**RP Foundation** is a non-governmental organization (NGO) dedicated to social welfare, healthcare assistance, free educational support, community volunteering, and digital empowerment (such as the Jan Seva Card). Our motto is **'Service, Dedication, Resolve'**.",
    responseHi:
      "**आरपी फाउंडेशन (RP Foundation)** एक गैर-सरकारी संगठन (NGO) है जो समाज कल्याण, स्वास्थ्य सहायता, निःशुल्क शिक्षा सहयोग, सामुदायिक स्वयंसेवा और डिजिटल सशक्तिकरण (जैसे जन सेवा कार्ड) के लिए समर्पित है। हमारा ध्येय **'सेवा, समर्पण, संकल्प'** है।",
  },
  {
    keywords: ["founder", "sanchalak", "kisne banaya", "founder kon", "rohit"],
    responseEn:
      "RP Foundation was founded by **Rohit Pandit** (Rohit Sir). Under his guidance, the foundation carries out multiple community welfare programs, health camps, and free education drives.",
    responseHi:
      "आरपी फाउंडेशन (RP Foundation) के संस्थापक **रोहित पंडित** (रोहित सर) हैं। उनके नेतृत्व में फाउंडेशन समाज के गरीब और पिछड़े वर्गों की सहायता के लिए कई कल्याणकारी योजनाएं चला रहा है।",
  },
  {
    keywords: ["kya kya kar", "kya kar sakte", "what can you do", "capabilities", "features", "features kya"],
    responseEn:
      "I am **RP AI Mitr**, your digital assistant. I can help you with:\n\n• **Jan Seva Card:** Application steps, masking Aadhaar, downloading QR pass.\n• **Blood Donation:** Requesting blood or registering as donor.\n• **Government Schemes:** Ayushman Bharat, PMAY housing, PM Kisan.\n• **Education Support:** Scholarship details and textbooks.\n• **Volunteering:** Sign up for weekend drives.\n• **Grievances:** File and track complaints with GPS tags.",
    responseHi:
      "मैं **RP AI मित्र** हूँ, आपका डिजिटल सहायक। मैं इन चीज़ों में आपकी मदद कर सकता हूँ:\n\n• **जन सेवा कार्ड:** आवेदन प्रक्रिया, आधार मास्किंग, QR पास डाउनलोड।\n• **रक्तदान नेटवर्क:** रक्त का अनुरोध करना या रक्तदाता बनना।\n• **सरकारी योजनाएं:** आयुष्मान भारत, आवास योजना, किसान योजना।\n• **शिक्षा सहयोग:** छात्रवृत्ति की जानकारी और पुस्तकें।\n• **स्वयंसेवा:** सप्ताहांत सेवा अभियानों में भाग लेना।\n• **शिकायतें:** शिकायत दर्ज करना और ट्रैक करना।",
  },
];

/* ─── Match the query against the knowledge base ─── */
function matchKB(text: string): KBEntry | null {
  const lower = text.toLowerCase();
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return entry;
    }
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   fetchExternalSearch — DUAL-PATH STRATEGY
   Path 1: Browser calls Google API DIRECTLY using VITE_ env vars
           → Works even when server billing account is not yet active
   Path 2: Falls back to /api/search/external (server proxy)
═══════════════════════════════════════════════════════════════ */
// These are injected by Vite at build time from .env
const _GKEY = (import.meta as any).env?.VITE_GOOGLE_SEARCH_API_KEY as string ?? "";
const _GCX  = (import.meta as any).env?.VITE_CX_ID as string ?? "";

type SearchResult = { title: string; url: string; snippet: string; displayLink: string };

async function fetchExternalSearch(query: string): Promise<SearchResult[]> {
  const mapItems = (items: any[]): SearchResult[] =>
    items.slice(0, 3).map((r: any) => ({
      title:       (r.title       ?? "").slice(0, 120),
      url:         r.link         ?? r.url ?? "",
      snippet:     (r.snippet     ?? "").replace(/\n/g, " ").slice(0, 260),
      displayLink: r.displayLink  ?? "",
    }));

  /* ── Path 1: Direct browser → Google ── */
  if (_GKEY && _GCX) {
    try {
      const gurl = new URL("https://www.googleapis.com/customsearch/v1");
      gurl.searchParams.set("key",  _GKEY);
      gurl.searchParams.set("cx",   _GCX);
      gurl.searchParams.set("q",    query);
      gurl.searchParams.set("num",  "3");
      gurl.searchParams.set("safe", "active");
      gurl.searchParams.set("gl",   "in");
      gurl.searchParams.set("hl",   "en");

      const gres = await fetch(gurl.toString(), { signal: AbortSignal.timeout(9000) });
      if (gres.ok) {
        const data = await gres.json();
        const results = mapItems(data.items ?? []);
        if (results.length > 0) return results;
      }
    } catch {
      // Direct call failed — try server proxy
    }
  }

  /* ── Path 2: Server proxy ── */
  try {
    const res = await fetch(
      `/api/search/external?query=${encodeURIComponent(query)}`,
      { signal: AbortSignal.timeout(9000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return mapItems(data.results ?? []);
  } catch {
    return [];
  }
}

/* ═══════════════════════════════════════════════════════════════
   Component
═══════════════════════════════════════════════════════════════ */
export default function AIAssistant({
  lang,
  userProfile,
  onNavigateToTab,
}: AIAssistantProps) {
  const isHi = lang === "hi";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* ── Suggestion chips ── */
  const suggestions = isHi
    ? [
        "जन सेवा कार्ड कैसे बनेगा?",
        "रक्तदान कहाँ करें?",
        "मैं स्वयंसेवक कैसे बनूँ?",
        "आयुष्मान योजना क्या है?",
      ]
    : [
        "How to apply for Jan Seva Card?",
        "Where to donate blood?",
        "How to become a volunteer?",
        "What is Ayushman Bharat?",
      ];

  /* ── Welcome on mount ── */
  useEffect(() => {
    const name = userProfile?.name || (isHi ? "नागरिक" : "Citizen");
    const welcome = isHi
      ? `नमस्ते ${name}! 🙏 मैं **RP AI मित्र** हूँ। जन सेवा कार्ड, रक्तदान, सरकारी योजनाएं या किसी भी सेवा के बारे में हिंदी या अंग्रेजी में पूछें।`
      : `Hello ${name}! 🙏 I am **RP AI Mitr**. Ask me anything about Jan Seva Card, blood donation, government schemes, or any service — in Hindi or English!`;
    setMessages([
      {
        id: "wel-1",
        role: "model",
        text: welcome,
        timestamp: now(),
      },
    ]);
  }, [lang]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function now() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function addBotMsg(text: string, links?: ChatMessage["links"]) {
    setMessages((prev) => [
      ...prev,
      { id: `m-${Date.now()}`, role: "model", text, links, timestamp: now() },
    ]);
  }

  /* ── Core send handler ── */
  const handleSend = async (textToSend?: string) => {
    const raw = (textToSend ?? inputMsg).trim();
    if (!raw) return;

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text: raw, timestamp: now() },
    ]);
    setInputMsg("");
    setLoading(true);

    /* ── 1. Local knowledge base match ── */
    const kbMatch = matchKB(raw);
    if (kbMatch) {
      const reply = isHi ? kbMatch.responseHi : kbMatch.responseEn;
      if (kbMatch.tabId) {
        setTimeout(() => onNavigateToTab(kbMatch.tabId!), 1500);
      }
      addBotMsg(reply);
      setLoading(false);
      return;
    }

    /* ── 2. Gemini AI backend ── */
    try {
      const chatHistory = messages.map((m) => ({ role: m.role, text: m.text }));
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: raw, history: chatHistory, language: lang }),
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      const answer: string = data.response ?? "";

      if (answer && !answer.toLowerCase().includes("development offline")) {
        addBotMsg(answer);
        setLoading(false);
        return;
      }
      throw new Error("Gemini returned placeholder");
    } catch {
      /* ── 3. Google Search fallback (dual-path) ── */
      const searchQuery = `${raw} RP Foundation India`;
      const results = await fetchExternalSearch(searchQuery);

      if (results.length > 0) {
        const intro = isHi
          ? "मुझे आपके सवाल का सटीक उत्तर नहीं मिला, लेकिन यहाँ वेब से प्रासंगिक जानकारी है:"
          : "I couldn't find an exact answer, but here are relevant results from the web:";
        addBotMsg(intro, results);
      } else {
        addBotMsg(
          isHi
            ? "क्षमा करें, अभी नेटवर्क की समस्या है। कृपया बाद में प्रयास करें या हेल्पलाइन **1800-569-0991** पर कॉल करें।"
            : "Sorry, I'm having trouble connecting right now. Please try again or call helpline **1800-569-0991**."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Voice input ── */
  const handleVoiceInput = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setVoiceError(isHi ? "आपका ब्राउज़र वॉयस इनपुट सपोर्ट नहीं करता।" : "Browser doesn't support voice input.");
      setTimeout(() => setVoiceError(null), 4000);
      return;
    }
    const recognition = new SR();
    recognition.lang = isHi ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);
    try { recognition.start(); } catch { setIsListening(false); return; }
    recognition.onresult = (e: any) => {
      const t: string = e.results[0][0].transcript;
      setInputMsg(t);
      setIsListening(false);
      handleSend(t);
    };
    recognition.onerror = () => {
      setIsListening(false);
      setVoiceError(isHi ? "आवाज़ पहचान त्रुटि।" : "Voice recognition error.");
      setTimeout(() => setVoiceError(null), 3000);
    };
    recognition.onend = () => setIsListening(false);
  };

  /* ═══════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════ */
  return (
    <div
      className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      id="ai-assistant-card"
    >
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-[#000080] to-teal-700 px-5 py-4 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-[#FF9933] border-2 border-[#000080] rounded-full animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight">RP AI मित्र (Mitr)</h3>
            <p className="text-[10px] text-teal-100">
              {isHi ? "AI जन सेवा सहायक • Google Search बैकअप" : "AI Jan Seva Assistant • Google Search Backup"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-white/10 text-[9px] px-2 py-1 rounded-full">
          <Sparkles className="w-3 h-3" />
          <span>Gemini + Search</span>
        </div>
      </div>

      {/* ── Suggestion chips ── */}
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
        {suggestions.map((sug, i) => (
          <button
            key={i}
            onClick={() => handleSend(sug)}
            className="shrink-0 text-[10px] bg-white text-slate-700 font-bold px-3 py-1.5 rounded-full border border-slate-200 hover:border-[#FF9933] hover:text-[#000080] transition"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[280px] max-h-[440px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-start gap-2`}
          >
            {msg.role === "model" && (
              <div className="p-1.5 bg-teal-50 rounded-lg border border-teal-100 text-teal-700 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs shadow-sm ${
                msg.role === "user"
                  ? "bg-[#000080] text-white rounded-tr-none"
                  : "bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none"
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">
                {msg.text.replace(/\*\*(.+?)\*\*/g, "$1")}
              </p>

              {/* External search links */}
              {msg.links && msg.links.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    {isHi ? "🌐 वेब से परिणाम" : "🌐 Web Results"}
                  </p>
                  {msg.links.map((lnk, idx) => (
                    <a
                      key={idx}
                      href={lnk.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200 hover:border-[#FF9933] hover:shadow-sm transition group"
                    >
                      <img
                        src={`https://www.google.com/s2/favicons?sz=16&domain_url=${lnk.url}`}
                        alt=""
                        className="w-4 h-4 rounded-sm shrink-0 mt-0.5"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-[#000080] group-hover:underline leading-tight line-clamp-2">
                          {lnk.title}
                        </p>
                        <p className="text-[8.5px] text-slate-500 mt-0.5 line-clamp-2 leading-snug">
                          {lnk.snippet}
                        </p>
                        <p className="text-[8px] text-[#FF9933] font-semibold mt-1 truncate">
                          {lnk.displayLink || lnk.url}
                        </p>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#FF9933] shrink-0 mt-0.5" />
                    </a>
                  ))}
                </div>
              )}

              <span
                className={`text-[9px] mt-1.5 block ${
                  msg.role === "user" ? "text-white/60 text-right" : "text-slate-400"
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start items-start gap-2">
            <div className="p-1.5 bg-teal-50 rounded-lg border border-teal-100 text-teal-700 shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-[#000080] animate-spin" />
              <span className="text-[10px] text-slate-500">
                {isHi ? "मित्र सोच रहा है..." : "Thinking…"}
              </span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleVoiceInput}
          className={`p-2.5 rounded-xl transition ${
            isListening
              ? "bg-red-500 text-white animate-pulse"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
        >
          {isListening ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>

        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={
            isHi
              ? "हिंदी या अंग्रेजी में टाइप करें..."
              : "Ask anything in Hindi or English…"
          }
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
        />

        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!inputMsg.trim() || loading}
          className={`p-2.5 rounded-xl text-white transition ${
            inputMsg.trim() && !loading
              ? "bg-[#000080] hover:bg-indigo-900"
              : "bg-slate-300 cursor-not-allowed"
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Voice error banner */}
      {voiceError && (
        <div className="px-4 py-2 bg-amber-50 text-amber-800 text-xs font-bold flex items-center justify-between border-t border-amber-200 shrink-0">
          <span>⚠️ {voiceError}</span>
          <button onClick={() => setVoiceError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Listening banner */}
      {isListening && (
        <div className="px-4 py-2 bg-red-50 text-red-800 text-xs flex items-center justify-between border-t border-red-100 animate-pulse shrink-0">
          <span>{isHi ? "🎙️ सुन रहा हूँ... बोलें" : "🎙️ Listening… speak now"}</span>
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
        </div>
      )}
    </div>
  );
}
