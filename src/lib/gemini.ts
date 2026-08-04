import { queryExternalSearch } from './externalSearch.js';
import { GoogleGenAI, Type } from '@google/genai';

// Lazy-loaded Gemini AI client helper
let aiClient: GoogleGenAI | null = null;
export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_SEARCH_API_KEY || process.env.VITE_GOOGLE_SEARCH_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY or GOOGLE_SEARCH_API_KEY environment variable is not set. AI Features will use mock mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

export // Helper function for elegant server-side fallback when Gemini is unavailable
async function handleOfflineFallback(message: string, language: string, res: any) {
  const query = message.toLowerCase();
  
  // Auto-detect Hindi (either Devanagari or common Hinglish words)
  const hasDevanagari = /[\u0900-\u097F]/.test(message);
  const commonHinglish = ["kya", "hai", "kaise", "kab", "karo", "naam", "sewa", "chahiye", "chal", "raha", "hoga", "apna", "banao", "madad", "namaste", "namaskar", "aaj"];
  const isHinglish = commonHinglish.some(word => query.includes(word));
  const isHi = language === "hi" || hasDevanagari || isHinglish;

  // General Status Check ("aaj kya chal raha hai" / "today")
  if (query.includes("aaj") || query.includes("today") || query.includes("kya chal") || query.includes("status") || query.includes("whats up")) {
    const reply = isHi
      ? "नमस्ते! आज आरपी फाउंडेशन के तहत **पर्यावरण संरक्षण अभियान**, **निःशुल्क स्वास्थ्य जांच शिविर**, और **जन सेवा कार्ड पंजीकरण** की सेवाएं सक्रिय रूप से चल रही हैं। आप इनमें से किस सेवा के बारे में जानकारी प्राप्त करना चाहते हैं?"
      : "Hello! Today at the RP Foundation, our **Environment Protection Drive**, **Free Health Checkup Camps**, and **Jan Seva Card Registrations** are actively running. Which service would you like to know more about?";
    return res.json({ response: reply });
  }

  // RP Foundation Motive / Purpose Check
  if (query.includes("motive") || query.includes("purpose") || query.includes("dhyey") || query.includes("aim") || (query.includes("rp") && query.includes("kya")) || (query.includes("foundation") && query.includes("kya"))) {
    const reply = isHi
      ? "**आरपी फाउंडेशन (RP Foundation)** एक गैर-सरकारी संगठन (NGO) है जो समाज कल्याण, स्वास्थ्य सहायता, निःशुल्क शिक्षा सहयोग, सामुदायिक स्वयंसेवा और डिजिटल सशक्तिकरण (जैसे जन सेवा कार्ड) के लिए समर्पित है। हमारा ध्येय **'सेवा, समर्पण, संकल्प'** है।"
      : "**RP Foundation** is a non-governmental organization (NGO) dedicated to social welfare, healthcare assistance, educational support, community volunteering, and digital empowerment (such as the Jan Seva Card). Our motto is **'Service, Dedication, Resolve'**.";
    return res.json({ response: reply });
  }

  // Founder Check
  if (query.includes("founder") || query.includes("sanchalak") || query.includes("kisne banaya") || query.includes("founder kon") || query.includes("rohit")) {
    const reply = isHi
      ? "आरपी फाउंडेशन (RP Foundation) के संस्थापक **रोहित पंडित** (रोहित सर) हैं। उनके नेतृत्व में फाउंडेशन समाज के गरीब और पिछड़े वर्गों की सहायता के लिए कई कल्याणकारी योजनाएं चला रहा है।"
      : "RP Foundation was founded by **Rohit Pandit** (Rohit Sir). Under his guidance, the foundation carries out multiple community welfare programs, health camps, and free education drives.";
    return res.json({ response: reply });
  }

  // 1. Simple Keyword Matcher on server side
  if (query.includes("card") || query.includes("कार्ड") || query.includes("jan seva") || query.includes("जन सेवा")) {
    const reply = isHi 
      ? "**जन सेवा कार्ड** आरपी फाउंडेशन का आपका digital identity pass है।\n\n📋 **आवेदन के चरण:**\n1. Go to *Services → Jan Seva Card*.\n2. Fill Name, DOB and upload a valid ID document.\n3. Your Aadhaar is masked for privacy.\n4. Once approved, download your QR-enabled digital pass."
      : "**Jan Seva Card** is your digital identity pass from RP Foundation.\n\n📋 **Steps to Apply:**\n1. Go to *Services → Jan Seva Card*.\n2. Fill Name, DOB and upload a valid ID document.\n3. Your Aadhaar is masked for privacy — never stored as plain text.\n4. Once approved, download your QR-enabled digital pass.";
    return res.json({ response: reply });
  }

  if (query.includes("blood") || query.includes("रक्त") || query.includes("ब्लड") || query.includes("donor")) {
    const reply = isHi
      ? "**रक्त नेटवर्क (Blood Network)** — आपातकालीन या स्वैच्छिक रक्तदान।\n\n🩸 **रक्त अनुरोध:** आवश्यक ग्रुप, अस्पताल का नाम और यूनिट दर्ज करें।\n🩸 **रक्तदाता पंजीकरण:** ब्लड टाइप और अंतिम दान तिथि सबमिट करें।"
      : "**Blood Network** — Emergency or voluntary blood donation.\n\n🩸 **Request Blood:** Post your required group, hospital name and units needed.\n🩸 **Register as Donor:** Submit blood type, last donation date.";
    return res.json({ response: reply });
  }

  if (query.includes("volunteer") || query.includes("स्वयंसेवक") || query.includes("seva")) {
    const reply = isHi
      ? "**RP Foundation में स्वयंसेवक बनें।**\n\n🤝 **कैसे जुड़ें:**\n1. *सेवाएं → स्वयंसेवक अवसर* पर जाएं।\n2. कौशल श्रेणी चुनें: शिक्षण, IT, क्षेत्र कार्य, स्वास्थ्य।\n3. सप्ताहांत अभियानों, भोजन शिविरों के लिए साइन अप करें।"
      : "**Volunteer Opportunities** at RP Foundation.\n\n🤝 **How to Join:**\n1. Go to *Services → Volunteer Opportunities*.\n2. Choose a skill: Teaching, IT, Field Work, Healthcare.\n3. Sign up for weekend drives, food camps, plantation events.";
    return res.json({ response: reply });
  }

  if (query.includes("donate") || query.includes("दान") || query.includes("donation")) {
    const reply = isHi
      ? "**आरपी फाउंडेशन को दान करें** — आपका योगदान जीवन बदलता है।\n\n💛 **त्वरित विकल्प:** ₹500 / ₹1000 / ₹5000 या कस्टम राशि।\n📜 **80G सर्टिफिकेट:** स्वत: निर्मित कर-छूट PDF।"
      : "**Donate to RP Foundation** — Your contribution changes lives.\n\n💛 **Quick options:** ₹500 / ₹1000 / ₹5000 or a custom amount.\n📜 **80G Certificate:** Auto-generated tax-exemption PDF.";
    return res.json({ response: reply });
  }
  // 2. Web Search Fallback using unified query helper
  try {
    const results = await queryExternalSearch(message);
    if (results && results.length > 0) {
      let reply = isHi 
        ? "मुझे इसके बारे में वेब से ये परिणाम मिले हैं:\n\n" 
        : "I found the following results from the web:\n\n";
      results.forEach((r: any) => {
        reply += `🔗 **[${r.title}](${r.link})**\n${r.snippet}\n\n`;
      });
      return res.json({ response: reply });
    }
  } catch (e) {
    // Ignore search errors and fall through
  }

  // Default fallback answer
  const defaultReply = isHi
    ? "नमस्ते! मैं आपकी खोज में सहायता करने की कोशिश कर रहा हूँ। अधिक विशिष्ट प्रश्न पूछें (जैसे 'जन सेवा कार्ड कैसे प्राप्त करें' या 'रक्तदान कैसे करें') या हमारी हेल्पलाइन **1800-569-0991** पर कॉल करें।"
    : "Hello! I am trying to assist you with your search. Please ask a more specific question (e.g. 'how to get jan seva card' or 'how to donate blood') or call our helpline at **1800-569-0991**.";
  return res.json({ response: defaultReply });
}
export { Type };
