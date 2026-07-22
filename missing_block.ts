const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 300;

app.use(express.json());

// PostgreSQL Pool Connection
const dbUrl = process.env.LOCAL_DB_URL || process.env.DATABASE_URL;
const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl: dbUrl && (dbUrl.includes("localhost") || dbUrl.includes("127.0.0.")) ? false : { rejectUnauthorized: false }
});

// Lazy-loaded Gemini AI client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
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

// Unified search helper using a 4-Tier Multi-Engine Search Cluster
async function queryExternalSearch(searchQuery: string): Promise<{ title: string, link: string, url: string, snippet: string, displayLink: string }[]> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  const targetDomains = [
    "gov.in",
    "nic.in",
    "mp.gov.in",
    "bhaskar.com",
    "jagran.com",
    "ndtv.com",
    "timesofindia.indiatimes.com",
    "hindustantimes.com",
    "wikipedia.org"
  ];

  const browserHeaders = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Upgrade-Insecure-Requests": "1"
  };

  
// =============================================================================
// MISSING SUPABASE MIGRATION ENDPOINTS
// =============================================================================

// --- community_posts ---
app.get("/api/community_posts", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM community_posts ORDER BY "createdAt" DESC');
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/community_posts", async (req, res) => {
  try {
    const { authorName, authorPhone, authorRole, textEn, textHi, segment, location, imageUrl, likes, likedByMe, createdAt } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO community_posts (id, "authorName", "authorPhone", "authorRole", "textEn", "textHi", segment, location, "imageUrl", likes, "likedByMe", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [id, authorName, authorPhone, authorRole, textEn, textHi, segment, location, imageUrl, likes, likedByMe, createdAt || new Date()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/community_posts/:id", async (req, res) => {
  try {
    const { likes, likedByMe } = req.body;
    await pool.query('UPDATE community_posts SET likes = $1, "likedByMe" = $2 WHERE id = $3', [likes, likedByMe, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- support_requests (FoodSupport) ---
app.post("/api/support_requests", async (req, res) => {
  try {
    const { citizenName, citizenPhone, requestType, location, description, status, createdAt } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO support_requests (id, "citizenName", "citizenPhone", "requestType", location, description, status, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, citizenName, citizenPhone, requestType, location, description, status, createdAt || new Date()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- sos_alerts (WomenSafety) ---
app.post("/api/sos_alerts", async (req, res) => {
  try {
    const { citizenName, citizenPhone, location, status, createdAt } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO sos_alerts (id, "citizenName", "citizenPhone", location, status, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, citizenName, citizenPhone, location, status, createdAt || new Date()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- scholarships ---
app.post("/api/scholarships", async (req, res) => {
  try {
    const { studentName, phone, educationLevel, status, createdAt } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO scholarships (id, "studentName", phone, "educationLevel", status, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, studentName, phone, educationLevel, status, createdAt || new Date()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
  // TIER 1: Tavily AI (Primary)
  // ═══════════════════════════════════════════════════════════════
  if (tavilyKey) {
    try {
      console.log(`[Search/Tier-1/Tavily] Querying: "${searchQuery}"`);
      const response = await axios.post(
        "https://api.tavily.com/search",
        {
          api_key: tavilyKey,
          query: searchQuery,
          include_domains: targetDomains,
          max_results: 5
        },
        {
          timeout: 4000
        }
      );

      const items = response.data.results ?? [];
      if (items.length > 0) {
        return items.slice(0, 3).map((item: any) => {
          let host = "";
          try {
            host = new URL(item.url).hostname;
          } catch {
            host = "tavily.com";
          }
          return {
            title: (item.title ?? "").slice(0, 120),
            link: item.url ?? "",
            url: item.url ?? "",
            snippet: (item.content ?? "").replace(/\n/g, " ").slice(0, 260),
            displayLink: host
          };
        });
      }
    } catch (err: any) {
      console.warn(`[Search/Tier-1/Tavily] Failed: ${err.message}. Cascading to Tier 2...`);
    }
  } else {
    console.warn(`[Search/Tier-1/Tavily] TAVILY_API_KEY is not set. Cascading to Tier 2...`);
  }

  // ═══════════════════════════════════════════════════════════════
  // TIER 2: DuckDuckGo HTML Scraper
  // ═══════════════════════════════════════════════════════════════
  try {
    const constrainedQuery = `${searchQuery} site:gov.in`;
    console.log(`[Search/Tier-2/DDG-Scraper] Querying: "${constrainedQuery}"`);
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(constrainedQuery)}`;
    
    const response = await axios.get(ddgUrl, {
      headers: browserHeaders,
      timeout: 4500
    });

    const $ = cheerio.load(response.data);
    const results: { title: string, link: string, url: string, snippet: string, displayLink: string }[] = [];

    $(".result").each((_, el) => {
      if (results.length >= 3) return;

      const title = $(el).find(".result__title").text().trim();
      const rawLink = $(el).find(".result__url").attr("href");
      const snippet = $(el).find(".result__snippet").text().trim();

      if (title && rawLink) {
        let link = rawLink;
        if (rawLink.startsWith("//")) {
          link = "https:" + rawLink;
        } else if (rawLink.startsWith("/l/?kh=")) {
          try {
            const urlObj = new URL("https://html.duckduckgo.com" + rawLink);
            const uddg = urlObj.searchParams.get("uddg");
            if (uddg) {
              link = decodeURIComponent(uddg);
            }
          } catch {
            // fallback
          }
        }

        let host = "duckduckgo.com";
        try {
          host = new URL(link).hostname;
        } catch {
          // fallback
        }

        results.push({
          title: title.slice(0, 120),
          link,
          url: link,
          snippet: snippet.replace(/\n/g, " ").slice(0, 260),
          displayLink: host
        });
      }
    });

    if (results.length > 0) {
      return results;
    }
    console.warn(`[Search/Tier-2/DDG-Scraper] No results found or blocked. Cascading to Tier 3...`);
  } catch (err: any) {
    console.warn(`[Search/Tier-2/DDG-Scraper] Failed: ${err.message}. Cascading to Tier 3...`);
  }

  // ═══════════════════════════════════════════════════════════════
  // TIER 3: SearXNG Public Instance Cluster
  // ═══════════════════════════════════════════════════════════════
  try {
    console.log(`[Search/Tier-3/SearXNG] Dynamic instance lookup...`);
    const spaceRes = await axios.get("https://searx.space/data/instances.json", {
      timeout: 3000
    });
    const instances = spaceRes.data?.instances || {};
    const healthyUrls: string[] = [];
    for (const [domain, info] of Object.entries(instances)) {
      const details = info as any;
      if (details.http?.status_code === 200 && details.uptime?.uptimeDay > 95) {
        const url = domain.startsWith("http") ? domain : `https://${domain}`;
        healthyUrls.push(url.endsWith("/") ? url : url + "/");
      }
    }

    if (healthyUrls.length > 0) {
      // Try the top 3 healthy SearXNG instances in order
      for (const instanceUrl of healthyUrls.slice(0, 3)) {
        const searchUrl = `${instanceUrl}search`;
        try {
          console.log(`[Search/Tier-3/SearXNG] Trying instance: ${searchUrl}`);
          const res = await axios.get(searchUrl, {
            params: {
              q: `${searchQuery} site:gov.in`,
              format: "json"
            },
            headers: browserHeaders,
            timeout: 3500
          });

          if (res.data && typeof res.data === "object" && Array.isArray(res.data.results)) {
            const items = res.data.results || [];
            if (items.length > 0) {
              return items.slice(0, 3).map((item: any) => {
                let host = "searxng.org";
                try {
                  host = new URL(item.url).hostname;
                } catch {
                  // fallback
                }
                return {
                  title: (item.title ?? "").slice(0, 120),
                  link: item.url ?? "",
                  url: item.url ?? "",
                  snippet: (item.content ?? "").replace(/\n/g, " ").slice(0, 260),
                  displayLink: host
                };
              });
            }
          }
        } catch (err: any) {
          console.warn(`[Search/Tier-3/SearXNG] Instance ${searchUrl} failed: ${err.message}`);
        }
      }
    }
    console.warn(`[Search/Tier-3/SearXNG] Cluster search failed or rate-limited. Cascading to Tier 4...`);
  } catch (err: any) {
    console.warn(`[Search/Tier-3/SearXNG] Dynamic discovery failed: ${err.message}. Cascading to Tier 4...`);
  }

  // ═══════════════════════════════════════════════════════════════
  // TIER 4: Wikipedia & Open Knowledge API
  // ═══════════════════════════════════════════════════════════════
  try {
    console.log(`[Search/Tier-4/Wikipedia] Querying: "${searchQuery}"`);
    const wikiUrl = "https://en.wikipedia.org/w/api.php";
    const res = await axios.get(wikiUrl, {
      params: {
        action: "query",
        list: "search",
        srsearch: searchQuery,
        format: "json",
        utf8: 1,
        origin: "*"
      },
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
      },
      timeout: 4000
    });

    const items = res.data?.query?.search || [];
    if (items.length > 0) {
      return items.slice(0, 3).map((item: any) => ({
        title: item.title,
        link: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
        snippet: (item.snippet ?? "").replace(/<span class="searchmatch">/g, "").replace(/<\/span>/g, "").slice(0, 260),
        displayLink: "en.wikipedia.org"
      }));
    }
  } catch (err: any) {
    console.error("[Search/Tier-4/Wikipedia] Failed completely:", err.message);
  }

  return [];
}

// Helper function for elegant server-side fallback when Gemini is unavailable
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

// 1. AI Chat Endpoint
app.post("/api/ai/chat", async (req, res) => {
  const { message, history = [], language = "hi" } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Try GEMINI_API_KEY first, fallback to GOOGLE_SEARCH_API_KEY
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_SEARCH_API_KEY || process.env.VITE_GOOGLE_SEARCH_API_KEY;

  if (!apiKey || apiKey === "MOCK_KEY") {
    return handleOfflineFallback(message, language, res);
  }

  try {
    const ai = getGeminiClient();
    const systemPrompt = `You are "RP Foundation AI Mitr" (आरपी फाउंडेशन एआई मित्र), a friendly and general-purpose AI assistant.
You can answer any general questions, solve math problems, write text, explain concepts, or translate languages just like Gemini, ChatGPT, or Grok, while maintaining your identity as RP AI Mitr.
When asked about RP Foundation, guide them about its initiatives (Jan Seva Card, blood donation, volunteer opportunities, government schemes).
Always match the user's language preference (Hindi, English, or Hinglish) and keep responses clear, concise, and helpful.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.-flash",
      contents: [
        { role: "user", parts: [{ text: `System instruction: ${systemPrompt}` }] },
        ...history.map((h: any) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        })),
        { role: "user", parts: [{ text: message }] }
      ]
    });

    const replyText = response.text || "Sorry, I am unable to process that right now.";
    return res.json({ response: replyText });
  } catch (error: any) {
    console.error("Gemini Chat Error, falling back:", error);
    // Graceful fallback if Gemini API call fails due to invalid key restrictions
    return handleOfflineFallback(message, language, res);
  }
});

// 2. AI Auto-Categorize Grievance Endpoint
app.post("/api/ai/categorize", async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const safeCatDefault = {
    category: "Uncategorized",
    urgency: "Pending Review",
    summary: title ? title.substring(0, 50) + "..." : "Complaint under review"
  };

  if (!apiKey) {
    console.warn("AI Categorization skipped: No GEMINI_API_KEY provided.");
    return res.json(safeCatDefault);
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.-flash",
      contents: `You are an auto-triage AI for RP Foundation's Grievance Redressal system. Your task is to categorize citizens' complaints.
Analyze the following title and description of a complaint, and return a JSON object with:
1. "category": strictly one of ["Water Supply", "Roads & Transit", "Sanitation & Waste", "Education & Schools", "Healthcare Facilities", "Street Lights & Power", "Others"]
2. "urgency": strictly one of ["Low", "Medium", "High", "Critical"]
3. "summary": a single compact summary line (in Hindi if complaint is in Hindi, otherwise English).

Complaint Title: "${title}"
Complaint Description: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            urgency: { type: Type.STRING },
            summary: { type: Type.STRING }
          },
          required: ["category", "urgency", "summary"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("AI Categorization Error:", error);
    res.json(safeCatDefault);
  }
});

// 3. AI Government Scheme Matcher
app.post("/api/ai/scheme-match", async (req, res) => {
  const { age, gender, annualIncome, occupation, state, category } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  const safeSchemeDefault = { schemes: [] };

  if (!apiKey) {
    console.warn("AI Scheme Match skipped: No GEMINI_API_KEY provided.");
    return res.json(safeSchemeDefault);
  }

  try {
    const ai = getGeminiClient();
    const prompt = `Formulate custom recommended Indian Government Schemes or RP Foundation scholarships for a citizen with the following details:
- Age: ${age}
- Gender: ${gender}
- Annual Income: ₹${annualIncome}
- Occupation: ${occupation}
- State: ${state}
- Social Category/Work: ${category}

Respond with a JSON array of up to 3 highly tailored schemes. Each scheme should contain:
1. "name" (Scheme/Scholarship name in Bilingual format e.g. "Ayushman Bharat / आयुष्मान भारत")
2. "eligibility" (Why they are eligible)
3. "benefits" (Key benefits)
4. "steps" (Simple steps to apply)`;

    const response = await ai.models.generateContent({
      model: "gemini-2.-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              eligibility: { type: Type.STRING },
              benefits: { type: Type.STRING },
              steps: { type: Type.STRING }
            },
            required: ["name", "eligibility", "benefits", "steps"]
          }
        }
      }
    });

    const schemes = JSON.parse(response.text || "[]");
    res.json({ schemes });
  } catch (error: any) {
    console.error("Scheme Matcher Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze schemes" });
  }
});

// =============================================================================
// LOCATION SEARCH API (LOCAL GEOJSON)
// =============================================================================
let acGeoJsonData: any = null;

app.get("/api/locations/search", (req, res) => {
  const query = (req.query.q as string)?.trim().toLowerCase();
  if (!query || query.length < 2) {
    return res.json([]);
  }

  if (!acGeoJsonData) {
    try {
      const geoJsonPath = path.join(process.cwd(), "maps-master", "maps-master", "website", "docs", "data", "geojson", "ac.geojson");
      const fileContent = fs.readFileSync(geoJsonPath, "utf-8");
      acGeoJsonData = JSON.parse(fileContent);
    } catch (err) {
      console.error("Failed to load ac.geojson:", err);
      return res.status(500).json({ error: "Location data unavailable" });
    }
  }

  // Filter features matching District or AC_NAME
  const results = [];
  const seen = new Set();
  const features = acGeoJsonData.features || [];
  
  for (const feature of features) {
    const props = feature.properties;
    if (props && props.ST_NAME === "MADHYA PRADESH") {
      const dist = (props.DIST_NAME || "").toLowerCase();
      const ac = (props.AC_NAME || "").toLowerCase();
      if (dist.includes(query) || ac.includes(query)) {
        const uniqueKey = `${props.DIST_NAME}-${props.AC_NAME}`;
        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);
          results.push({
            district: props.DIST_NAME,
            vidhan_sabha: props.AC_NAME,
            sansad_kshetra: props.PC_NAME
          });
        }
      }
    }
    if (results.length >= 10) break; // limit to 10 fast results
  }

  res.json(results);
});

// =============================================================================
// OPEN GOVERNMENT DATA (data.gov.in) INTEGRATIONS
// =============================================================================

// 1. Agriculture: Mandi Prices
app.get("/api/gov/mandi-prices", async (req, res) => {
  const { state, commodity } = req.query;
  const apiKey = process.env.DATAGOV_API_KEY || "579b464db66ec23bdd000001b3bed380e8e94e615b9d89710cdd46f0";
  const resourceId = "9ef84268-d588-465a-a308-a864a43d0070"; 
  
  if (apiKey && apiKey !== "MOCK_KEY") {
    try {
      let url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=10`;
      if (state) url += `&filters[state]=${encodeURIComponent(state as string)}`;
      if (commodity) url += `&filters[commodity]=${encodeURIComponent(commodity as string)}`;
      
      const response = await axios.get(url, { timeout: 5000 });
      return res.json(response.data);
    } catch (err) {
      console.error("Mandi Prices API failed, falling back to mock");
    }
  }
  
  // Fallback Mock Data
  res.json({
    status: "ok",
    total: 3,
    records: [
      { state: state || "Madhya Pradesh", district: "Bhopal", market: "Bhopal (F&V)", commodity: commodity || "Wheat", min_price: "2200", max_price: "2450", modal_price: "2350", arrival_date: new Date().toISOString().split("T")[0] },
      { state: state || "Madhya Pradesh", district: "Sehore", market: "Sehore", commodity: commodity || "Soyabean", min_price: "4200", max_price: "4600", modal_price: "4500", arrival_date: new Date().toISOString().split("T")[0] }
    ]
  });
});

// 2. Health: Hospital Directory
app.get("/api/gov/hospitals", async (req, res) => {
  const { state, district } = req.query;
  const apiKey = process.env.DATAGOV_API_KEY || "579b464db66ec23bdd000001b3bed380e8e94e615b9d89710cdd46f0";
  const resourceId = "7924619d-71b5-4b47-b861-12c823055428"; 
  
  if (apiKey && apiKey !== "MOCK_KEY") {
    try {
      let url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=10`;
      if (state) url += `&filters[state]=${encodeURIComponent(state as string)}`;
      if (district) url += `&filters[district]=${encodeURIComponent(district as string)}`;
      
      const response = await axios.get(url, { timeout: 5000 });
      return res.json(response.data);
    } catch (err) {
      console.error("Hospitals API failed, falling back to mock");
    }
  }
  
  // Fallback Mock Data
  res.json({
    status: "ok",
    total: 2,
    records: [
      { state: state || "Madhya Pradesh", district: "Bhopal", hospital_name: "Hamidia Hospital", type: "District Hospital", address: "Royal Market Road", pincode: "462001", mobile_number: "0755-2540141" },
      { state: state || "Madhya Pradesh", district: "Bhopal", hospital_name: "AIIMS Bhopal", type: "Super Specialty", address: "Saket Nagar", pincode: "462020", mobile_number: "0755-2672322" }
    ]
  });
});

// =============================================================================
// DATABASE SCHEMA & AUTO-INITIALIZATION
// =============================================================================

async function initDatabase() {
  let client;
  try {
    console.log("Initializing local PostgreSQL schema...");
    client = await pool.connect();
    // gen_random_uuid() is built-in since PG 13 — no extension needed
    
    // Drop tables that may have wrong column casing from previous failed init
    const tablesToRecreate = ["social_posts", "campaigns", "jobs", "health_camps", "grievances", "service_submissions", "job_applications", "blood_donors", "card_applications"];
    for (const table of tablesToRecreate) {
      await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    }
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        role TEXT DEFAULT 'citizen',
        points INTEGER DEFAULT 0,
        badges INTEGER DEFAULT 0,
        "janSevaCardStatus" TEXT DEFAULT 'none',
        "janSevaCardNo" TEXT DEFAULT '',
        "isVolunteer" BOOLEAN DEFAULT false,
        "isDonor" BOOLEAN DEFAULT false,
        "onboardingCompleted" BOOLEAN DEFAULT false,
        "registeredAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create settings table
    await client.query(`
      
        CREATE TABLE IF NOT EXISTS settings (
          id VARCHAR(255) PRIMARY KEY,
          name TEXT,
          email TEXT,
          phone TEXT,
          role TEXT DEFAULT 'citizen',
          "tollFree" TEXT,
          "webUrl" TEXT,
          "founderMessageEn" TEXT,
          "founderMessageHi" TEXT
        )
      `);

      // Ensure otps table has enough space for emails
      try {
        await pool.query('ALTER TABLE otps ALTER COLUMN phone TYPE VARCHAR(255)');
      } catch(e) {
        // Table might not exist yet
      }


    // Create social_posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS social_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        author TEXT,
        role TEXT,
        avatar TEXT,
        "textEn" TEXT,
        "textHi" TEXT,
        image TEXT,
        likes INTEGER DEFAULT 0,
        "commentsCount" INTEGER DEFAULT 0,
        liked BOOLEAN DEFAULT false,
        platform TEXT,
        link TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create campaigns table
    await client.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "titleEn" TEXT,
        "titleHi" TEXT,
        "goalAmount" NUMERIC DEFAULT 0,
        "raisedAmount" NUMERIC DEFAULT 0,
        "imageUrl" TEXT,
        "coverImgUrl" TEXT,
        urgent BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create jobs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "titleEn" TEXT,
        "titleHi" TEXT,
        company TEXT,
        "locEn" TEXT,
        "locHi" TEXT,
        salary TEXT,
        "typeEn" TEXT,
        "typeHi" TEXT,
        "postedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create health_camps table
    await client.query(`
      CREATE TABLE IF NOT EXISTS health_camps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "titleEn" TEXT,
        "titleHi" TEXT,
        "dateEn" TEXT,
        "dateHi" TEXT,
        "locationEn" TEXT,
        "locationHi" TEXT,
        contact TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create camps view pointing to health_camps
    await client.query(`
      CREATE OR REPLACE VIEW camps AS 
      SELECT * FROM health_camps
    `);

    // Create grievances table
    await client.query(`
      CREATE TABLE IF NOT EXISTS grievances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT,
        description TEXT,
        category TEXT,
        urgency TEXT,
        location TEXT,
        "reportedBy" TEXT,
        status TEXT DEFAULT 'Pending',
        date TEXT,
        "aiSummary" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create service_submissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS service_submissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT,
        "serviceNameEn" TEXT,
        "serviceName" TEXT,
        "citizenName" TEXT,
        "citizenPhone" TEXT,
        "submissionData" TEXT,
        status TEXT DEFAULT 'pending',
        latitude NUMERIC,
        longitude NUMERIC,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create volunteers table
    await client.query(`
      DROP TABLE IF EXISTS volunteers CASCADE;
      CREATE TABLE IF NOT EXISTS volunteers (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        registration_number VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        full_name TEXT,
        father_husband_name TEXT,
        mother_name TEXT,
        dob DATE,
        mobile VARCHAR(20) UNIQUE,
        email VARCHAR(255) UNIQUE,
        education JSONB,
        blood_group VARCHAR(10),
        skills JSONB,
        reason_for_joining TEXT,
        availability VARCHAR(100),
        national_id_1 VARCHAR(50),
        national_id_2 VARCHAR(50),
        country VARCHAR(100),
        state VARCHAR(100),
        city VARCHAR(100),
        address TEXT,
        pincode VARCHAR(20),
        area_locality VARCHAR(255),
        sansad_kshetra VARCHAR(255),
        vidhan_sabha VARCHAR(255),
        ward_no VARCHAR(255),
        "registeredAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create job_applications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "jobId" TEXT,
        "jobTitle" TEXT,
        "fullName" TEXT,
        phone TEXT,
        resume TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create blood_donors table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blood_donors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT,
        "bloodGroup" TEXT,
        phone TEXT,
        location TEXT,
        verified BOOLEAN DEFAULT true,
        distance TEXT,
        "lastDonated" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create card_applications table (Jan Seva Card)
    await client.query(`
      CREATE TABLE IF NOT EXISTS card_applications (
        "userId" VARCHAR(255) PRIMARY KEY,
        name TEXT,
        gender TEXT,
        dob TEXT,
        address TEXT,
        "idType" TEXT,
        "idNumber" TEXT,
        status TEXT DEFAULT 'pending',
        "cardNo" TEXT DEFAULT '',
        "submittedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Seed default social posts if empty
    const postsCount = await client.query("SELECT COUNT(*) FROM social_posts");
    if (parseInt(postsCount.rows[0].count, 10) === 0) {
      console.log("Seeding default social_posts into PostgreSQL...");
      const DEFAULT_POSTS = [
        {
          author: "Rohit Pandit",
          role: "Founder, RP Foundation",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
          textEn: "Sharing highlights from our weekend tree plantation drive in Karond, Bhopal. Over 500 saplings planted! 🌳 Let's build a greener tomorrow.",
          textHi: "करौंद, भोपाल में हमारे सप्ताहांत वृक्षारोपण अभियान की कुछ झलकियाँ। 500 से अधिक पौधे लगाए गए! 🌳 आइए एक हरित कल का निर्माण करें।",
          image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
          likes: 412,
          commentsCount: 18,
          liked: false,
          platform: "instagram",
          link: "https://www.instagram.com/therohitpandit/"
        },
        {
          author: "RP Foundation",
          role: "Official Page",
          avatar: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80",
          textEn: "Successful free eye checkup camp conducted today at Sehore district. Over 200 patients received free consultations and medicines. 🩺💙",
          textHi: "सीहोर जिला अस्पताल में आज सफल निःशुल्क नेत्र जांच शिविर आयोजित किया गया। 200 से अधिक मरीजों को निःशुल्क परामर्श और दवाएं दी गईं। 🩺💙",
          image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
          likes: 580,
          commentsCount: 34,
          liked: false,
          platform: "facebook",
          link: "https://www.facebook.com/rpfofficial"
        }
      ];
      for (const p of DEFAULT_POSTS) {
        await client.query(
          `INSERT INTO social_posts (author, role, avatar, "textEn", "textHi", image, likes, "commentsCount", liked, platform, link) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [p.author, p.role, p.avatar, p.textEn, p.textHi, p.image, p.likes, p.commentsCount, p.liked, p.platform, p.link]
        );
      }
    }

    console.log("PostgreSQL schema initialization completed successfully.");
  } catch (err: any) {
    console.error("Database connection or schema init error (non-fatal):", err.message);
  } finally {
    if (client) {
      client.release();
    }
  }
}


// =============================================================================
// AUTHENTICATION ENDPOINTS
// =============================================================================

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'appapi.therpfoundation.org',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'no-reply@appapi.therpfoundation.org',
      pass: process.env.SMTP_PASSWORD || 'therpfoundation@321',
    },
  });

  app.post("/api/auth/login-email", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !email.includes("@")) return res.status(400).json({ error: "Invalid email" });
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS otps (
          phone VARCHAR(255) PRIMARY KEY,
          otp VARCHAR(10) NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await pool.query(
        `INSERT INTO otps (phone, otp, "createdAt") VALUES ($1, $2, CURRENT_TIMESTAMP) 
         ON CONFLICT (phone) DO UPDATE SET otp = EXCLUDED.otp, "createdAt" = CURRENT_TIMESTAMP`,
        [email, otp]
      );
      
      console.log(`[EMAIL] Sending OTP for ${email} is: ${otp}`);
      
      await transporter.sendMail({
        from: '"RP Foundation" <' + (process.env.SMTP_USER || 'no-reply@appapi.therpfoundation.org') + '>',
        to: email,
        subject: "Your Jan Seva Login OTP",
        text: `Your OTP for RP Foundation Jan Seva is: ${otp}. It is valid for 10 minutes.`,
        html: `<b>Your OTP for RP Foundation Jan Seva is: <span style="color: #FF9933; font-size: 1.5em;">${otp}</span></b><br/><p>It is valid for 10 minutes.</p>`,
      });
      
      res.json({ success: true, message: "OTP sent" });
    } catch (err) {
      console.error("Email send error:", err);
      res.status(500).json({ error: err.message });
    }
  });

app.post("/api/auth/login", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length !== 10) return res.status(400).json({ error: "Invalid phone number" });
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create otps table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otps (
        phone VARCHAR(255) PRIMARY KEY,
        otp VARCHAR(10) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Save to DB (UPSERT)
    await pool.query(
      `INSERT INTO otps (phone, otp, "createdAt") VALUES ($1, $2, CURRENT_TIMESTAMP) 
       ON CONFLICT (phone) DO UPDATE SET otp = EXCLUDED.otp, "createdAt" = CURRENT_TIMESTAMP`,
      [phone, otp]
    );
        console.log(`
  ===============================
  [SMS] Sending OTP for ${phone} is: ${otp}
  ===============================
  `);
      
      try {
        const MSG91_AUTHKEY = "552233Aul3uTNSZ6a5de34bP1";
        const MSG91_SENDER = "RPFApp";
        const url = `https://control.msg91.com/api/v5/otp?authkey=${MSG91_AUTHKEY}&mobile=91${phone}&otp=${otp}&sender=${MSG91_SENDER}`;
        
        const axios = require('axios');
        await axios.get(url);
      } catch (smsErr: any) {
        console.error("MSG91 Error:", smsErr?.response?.data || smsErr.message);
      }
    
    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/verify", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const result = await pool.query('SELECT * FROM otps WHERE phone = $1 AND otp = $2', [phone, otp]);
    if (result.rows.length > 0) {
      await pool.query('DELETE FROM otps WHERE phone = $1', [phone]);
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid OTP" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
