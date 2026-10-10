const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');

dotenv.config();

const CACHE_DIR = path.join(process.cwd(), 'public', 'data', 'quiz', 'cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("ERROR: GEMINI_API_KEY is not defined in .env!");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

// Load catalog
const catalogPath = path.join(process.cwd(), 'src', 'data', 'quiz', 'quizCatalog.ts');
const catalogContent = fs.readFileSync(catalogPath, 'utf8');

// Extract GK_EXAM_SUBJECTS JSON from ts file
const match = catalogContent.match(/export const GK_EXAM_SUBJECTS: CatalogSubject\[\] = (\[[\s\S]*?\]);/);
if (!match) {
  console.error("Could not parse GK_EXAM_SUBJECTS from quizCatalog.ts");
  process.exit(1);
}

const subjects = JSON.parse(match[1]);

// Priority subjects for Option A
const PRIORITY_SUBJECT_IDS = [
  "ancient_history",
  "modern_history",
  "polity_constitution",
  "biology",
  "physics",
  "chemistry"
];

// Allow CLI filter: node scripts/batchGenerateQuizzes.cjs ancient_history or limit
const targetSubjectId = process.argv[2] && process.argv[2] !== '--all' ? process.argv[2] : null;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithRetry(topic, subjectTitle, maxRetries = 3) {
  const prompt = `You are a senior UPSC Civil Services and State PSC examination setter.
Generate exactly 10 high-quality, authentic Multiple Choice Questions (MCQs) for the topic: "${topic.titleEn}" under subject "${subjectTitle}".

Requirements:
1. Strict bilingual formatting: each question, option, and explanation MUST have both accurate English and authentic Hindi (हिंदी).
2. Exactly 4 options for each question (indices 0 to 3).
3. Exactly one unambiguous correct option.
4. Detailed analytical explanation in both English and Hindi.
5. Difficulty: UPSC Prelims / SSC CGL standard.
6. Output format: MUST BE STRICTLY a raw JSON array of objects. NO markdown formatting, NO \`\`\`json backticks, just pure valid JSON.

JSON Schema:
[
  {
    "id": "q1",
    "questionEn": "English question text",
    "questionHi": "हिंदी प्रश्न पाठ",
    "optionsEn": ["Option A", "Option B", "Option C", "Option D"],
    "optionsHi": ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"],
    "correctIndex": 0,
    "explanationEn": "Detailed analytical explanation in English",
    "explanationHi": "हिंदी में विस्तृत विश्लेषणात्मक व्याख्या"
  }
]`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const modelToUse = attempt === 1 ? 'gemini-3.8-flash' : 'gemini-3.5-flash-lite';
      const response = await ai.models.generateContent({
        model: modelToUse,
        contents: prompt,
        config: {
          temperature: 0.3,
          responseMimeType: 'application/json'
        }
      });

      let clean = (response.text || "").trim();
      if (clean.startsWith("```json")) {
        clean = clean.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (clean.startsWith("```")) {
        clean = clean.replace(/^```/, "").replace(/```$/, "").trim();
      }

      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((q, i) => ({
          ...q,
          id: `${topic.id}_${i + 1}`
        }));
      }
      throw new Error("Invalid questions array returned");
    } catch (err) {
      console.warn(`[Attempt ${attempt}/${maxRetries}] Error generating ${topic.titleEn}: ${err.message}`);
      if (attempt < maxRetries) {
        const backoff = attempt * 5000;
        console.log(`Waiting ${backoff / 1000}s before retry...`);
        await sleep(backoff);
      } else {
        throw err;
      }
    }
  }
}

async function runBatch() {
  console.log("==================================================");
  console.log("🚀 STARTING OPTION A: PRIORITY SUBJECTS MCQ BATCH");
  console.log("==================================================");

  let subjectsToProcess = subjects.filter(s => {
    if (targetSubjectId) return s.id === targetSubjectId;
    return PRIORITY_SUBJECT_IDS.includes(s.id);
  });

  let totalGenerated = 0;
  let totalSkipped = 0;

  for (const subj of subjectsToProcess) {
    console.log(`\n📚 SUBJECT: ${subj.titleHi} (${subj.titleEn}) - [${subj.topics.length} topics]`);

    for (let i = 0; i < subj.topics.length; i++) {
      const topic = subj.topics[i];
      const cleanTopicId = String(topic.id).replace(/[^a-zA-Z0-9_-]/g, "_");
      const cacheFile = path.join(CACHE_DIR, `${cleanTopicId}.json`);

      // Check if already cached
      if (fs.existsSync(cacheFile)) {
        try {
          const existing = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
          if (Array.isArray(existing) && existing.length >= 5) {
            console.log(`  [${i + 1}/${subj.topics.length}] ⏩ SKIPPED (Already cached): ${topic.titleEn}`);
            totalSkipped++;
            continue;
          }
        } catch {
          // Re-generate if corrupt
        }
      }

      console.log(`  [${i + 1}/${subj.topics.length}] ⚙️ Generating: ${topic.titleEn}...`);
      try {
        const questions = await generateWithRetry(topic, subj.titleEn);
        fs.writeFileSync(cacheFile, JSON.stringify(questions, null, 2), 'utf8');
        console.log(`  [${i + 1}/${subj.topics.length}] ✅ SAVED: ${topic.titleEn} (${questions.length} MCQs)`);
        totalGenerated++;

        // Delay 4.2s to strictly stay under 15 RPM free/flash quota
        await sleep(4200);
      } catch (err) {
        console.error(`  [${i + 1}/${subj.topics.length}] ❌ FAILED: ${topic.titleEn} -> ${err.message}`);
        // Small pause before next
        await sleep(2000);
      }
    }
  }

  console.log("\n==================================================");
  console.log(`🎉 BATCH COMPLETE: ${totalGenerated} Topics Generated, ${totalSkipped} Already Cached`);
  console.log("==================================================");
}

runBatch().catch(console.error);
