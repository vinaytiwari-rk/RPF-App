import { Router } from "express";
import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";

export const quizRouter = Router();

const CACHE_DIR = path.join(process.cwd(), "public", "data", "quiz", "cache");
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

function createFallbackQuestions(topicTitle: string, subjectTitle: string) {
  return [
    {
      id: `fb_1`,
      questionEn: `What is the primary historical or conceptual significance of ${topicTitle} in the study of ${subjectTitle}?`,
      questionHi: `${subjectTitle} के अध्ययन में ${topicTitle} का प्राथमिक ऐतिहासिक या वैचारिक महत्व क्या है?`,
      optionsEn: [
        `It represents foundational developments and standard administrative / doctrinal evolution.`,
        `It was completely isolated from contemporary Indian cultural developments.`,
        `It had no documented socio-economic or constitutional impact.`,
        `It was exclusively localized without any regional spread.`
      ],
      optionsHi: [
        `यह आधारभूत विकास और मानक प्रशासनिक / वैचारिक विकास का प्रतिनिधित्व करता है।`,
        `यह समकालीन भारतीय सांस्कृतिक विकास से पूरी तरह अलग-थलग था।`,
        `इसका कोई प्रलेखित सामाजिक-आर्थिक या संवैधानिक प्रभाव नहीं था।`,
        `यह बिना किसी क्षेत्रीय प्रसार के केवल स्थानीय स्तर तक सीमित था।`
      ],
      correctIndex: 0,
      explanationEn: `${topicTitle} is an integral milestone under ${subjectTitle}, frequently tested in UPSC and State PSC examinations for its evolutionary impact.`,
      explanationHi: `${topicTitle}, ${subjectTitle} के अंतर्गत एक महत्वपूर्ण मील का पत्थर है, जिसका प्रभाव संघ और राज्य लोक सेवा आयोग परीक्षाओं में पूछा जाता है।`
    },
    {
      id: `fb_2`,
      questionEn: `Which of the following statements is most accurate regarding the key characteristics of ${topicTitle}?`,
      questionHi: `${topicTitle} की प्रमुख विशेषताओं के संदर्भ में निम्नलिखित में से कौन सा कथन सर्वाधिक उपयुक्त है?`,
      optionsEn: [
        `It provided structured frameworks that influenced subsequent regional and national practices.`,
        `It lacked any codified principles, empirical evidence, or formal structure.`,
        `It was rejected immediately by contemporary scholars and administrative authorities.`,
        `It ceased to have any historical or theoretical relevance in modern scholarship.`
      ],
      optionsHi: [
        `इसने ऐसे संरचित ढांचे प्रदान किए जिन्होंने बाद के क्षेत्रीय और राष्ट्रीय अभ्यासों को प्रभावित किया।`,
        `इसमें किसी भी संहिताबद्ध सिद्धांत, साक्ष्य या औपचारिक संरचना का अभाव था।`,
        `समकालीन विद्वानों और प्रशासनिक अधिकारियों द्वारा इसे तुरंत खारिज कर दिया गया था।`,
        `आधुनिक छात्रवृत्ति में इसकी कोई ऐतिहासिक या सैद्धांतिक प्रासंगिकता नहीं रही।`
      ],
      correctIndex: 0,
      explanationEn: `Standard civil services syllabi emphasize the structural continuity and legacy of ${topicTitle}.`,
      explanationHi: `मानक सिविल सेवा पाठ्यक्रम में ${topicTitle} की संरचनात्मक निरंतरता और विरासत पर विशेष बल दिया जाता है।`
    }
  ];
}

quizRouter.post("/api/quiz/generate", async (req, res) => {
  try {
    const { topicId, topicTitle, subjectTitle, count = 10 } = req.body;
    if (!topicId || !topicTitle) {
      return res.status(400).json({ error: "topicId and topicTitle are required" });
    }

    const cleanTopicId = String(topicId).replace(/[^a-zA-Z0-9_-]/g, "_");
    const cacheFile = path.join(CACHE_DIR, `${cleanTopicId}.json`);

    // Check disk cache first
    if (fs.existsSync(cacheFile)) {
      try {
        const cachedRaw = fs.readFileSync(cacheFile, "utf8");
        const cachedData = JSON.parse(cachedRaw);
        if (Array.isArray(cachedData) && cachedData.length > 0) {
          return res.json({
            topicId,
            cached: true,
            questions: cachedData
          });
        }
      } catch {
        // Continue to fresh generation if cache corrupted
      }
    }

    const ai = getGeminiClient();
    if (!ai) {
      const fallback = createFallbackQuestions(topicTitle, subjectTitle || "General Studies");
      return res.json({ topicId, cached: false, fallback: true, questions: fallback });
    }

    const prompt = `You are a senior UPSC Civil Services & State PSC exam setter.
Generate exactly ${count} high-quality, authentic Multiple Choice Questions (MCQs) for the topic: "${topicTitle}" under subject "${subjectTitle || 'General Studies'}".

Requirements:
1. Strict bilingual formatting: each question, option, and explanation MUST have both accurate English and authentic Hindi (हिंदी).
2. Exactly 4 options for each question (indices 0 to 3).
3. Exactly one unambiguous correct option.
4. Detailed analytical explanation in both English and Hindi.
5. Difficulty: UPSC Prelims / SSC CGL standard.
6. Output format: MUST BE STRICTLY a raw JSON array of objects. NO markdown formatting, NO \`\`\`json backticks, just the pure JSON array.

JSON Schema for each object:
{
  "id": "q1",
  "questionEn": "English question text here",
  "questionHi": "हिंदी प्रश्न यहाँ",
  "optionsEn": ["Option A", "Option B", "Option C", "Option D"],
  "optionsHi": ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"],
  "correctIndex": 0,
  "explanationEn": "Detailed explanation in English",
  "explanationHi": "हिंदी में विस्तृत व्याख्या"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text || "";
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```/, "").replace(/```$/, "").trim();
    }

    let parsedQuestions = JSON.parse(cleanJson);
    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      throw new Error("Invalid questions array returned");
    }

    // Standardize IDs
    parsedQuestions = parsedQuestions.map((q, idx) => ({
      ...q,
      id: `${cleanTopicId}_${idx + 1}`
    }));

    // Save to cache file asynchronously
    fs.writeFile(cacheFile, JSON.stringify(parsedQuestions, null, 2), "utf8", (err) => {
      if (err) console.warn("Failed to write quiz cache file:", err);
    });

    return res.json({
      topicId,
      cached: false,
      questions: parsedQuestions
    });
  } catch (err: any) {
    console.error("Quiz generation failed:", err?.message || err);
    const fallback = createFallbackQuestions(req.body.topicTitle || "Subject Matter", req.body.subjectTitle || "General Studies");
    return res.json({
      topicId: req.body.topicId,
      cached: false,
      fallback: true,
      questions: fallback
    });
  }
});
