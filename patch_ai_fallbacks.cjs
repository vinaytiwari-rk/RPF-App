const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

// Replace /api/ai/categorize block
const catStart = 'app.post("/api/ai/categorize", async (req, res) => {';
const catEndStr = 'res.status(500).json({ error: error.message || "Failed to categorize grievance" });\n    }\n  });';
const catEnd = serverCode.indexOf(catEndStr) + catEndStr.length;
const catStartIndex = serverCode.indexOf(catStart);

if (catStartIndex !== -1 && catEnd !== -1) {
  const newCat = `app.post("/api/ai/categorize", async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required" });
  }

  const safeDefault = {
    category: "Uncategorized",
    urgency: "Pending Review",
    summary: title ? title.substring(0, 50) + "..." : "Complaint under review"
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("AI Categorization skipped: No GEMINI_API_KEY provided.");
    return res.json(safeDefault);
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: \`You are an auto-triage AI for RP Foundation's Grievance Redressal system. Your task is to categorize citizens' complaints.
Analyze the following title and description of a complaint, and return a JSON object with:
1. "category": strictly one of ["Water Supply", "Roads & Transit", "Sanitation & Waste", "Education & Schools", "Healthcare Facilities", "Street Lights & Power", "Others"]
2. "urgency": strictly one of ["Low", "Medium", "High", "Critical"]
3. "summary": a single compact summary line (in Hindi if complaint is in Hindi, otherwise English).

Complaint Title: "\${title}"
Complaint Description: "\${description}"\`,
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
    // Return safe default instead of crashing frontend
    res.json(safeDefault);
  }
});`;
  
  serverCode = serverCode.substring(0, catStartIndex) + newCat + serverCode.substring(catEnd);
}

// Replace /api/ai/scheme-match block
const matchStart = 'app.post("/api/ai/scheme-match", async (req, res) => {';
const matchEndStr = 'res.status(500).json({ error: error.message || "Failed to match schemes" });\n    }\n  });';
const matchEnd = serverCode.indexOf(matchEndStr) + matchEndStr.length;
const matchStartIndex = serverCode.indexOf(matchStart);

if (matchStartIndex !== -1 && matchEnd !== -1) {
  const newMatch = `app.post("/api/ai/scheme-match", async (req, res) => {
  const { age, gender, annualIncome, occupation, state, category } = req.body;

  const safeDefault = { schemes: [] };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("AI Scheme Match skipped: No GEMINI_API_KEY provided.");
    return res.json(safeDefault);
  }

  try {
    const ai = getGeminiClient();
    const prompt = \`Formulate custom recommended Indian Government Schemes or RP Foundation scholarships for a citizen with the following details:
- Age: \${age}
- Gender: \${gender}
- Annual Income: ₹\${annualIncome}
- Occupation: \${occupation}
- State: \${state}
- Social Category/Work: \${category}

Respond with a JSON array of up to 3 highly tailored schemes. Each scheme should contain:
1. "name" (Scheme/Scholarship name in Bilingual format e.g. "Ayushman Bharat / आयुष्मान भारत")
2. "eligibility" (Why they are eligible)
3. "benefits" (Key benefits)
4. "steps" (Simple steps to apply)\`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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

    const result = JSON.parse(response.text || "[]");
    res.json({ schemes: result });
  } catch (error: any) {
    console.error("AI Scheme Match Error:", error);
    res.json(safeDefault);
  }
});`;

  serverCode = serverCode.substring(0, matchStartIndex) + newMatch + serverCode.substring(matchEnd);
}

// Write the patched file
fs.writeFileSync('server.ts', serverCode);
