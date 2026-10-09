#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const arg = process.argv[2];
const inputPath = arg ? path.resolve(arg) : "";
const outputRoot = path.join(root, "data", "question-bank", "packs");
const maxQuestions = Number(process.env.QUIZ_PACK_SIZE || 500);

if (!arg) {
  console.error("Usage: node scripts/importQuestionBankBatch.mjs <approved-questions.jsonl>");
  console.error('Only records with reviewStatus="approved" are imported.');
  process.exit(2);
}
if (!Number.isInteger(maxQuestions) || maxQuestions < 1 || maxQuestions > 1000) {
  console.error("QUIZ_PACK_SIZE must be an integer between 1 and 1000.");
  process.exit(2);
}
if (!fs.existsSync(inputPath)) {
  console.error("Input file not found: " + inputPath);
  process.exit(2);
}

function slug(value) {
  return String(value).normalize("NFKD").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "subject";
}
function requiredString(record, key, lineNo) {
  if (typeof record[key] !== "string" || !record[key].trim()) {
    throw new Error("line " + lineNo + ": " + key + " must be a non-empty string");
  }
}
function validateQuestion(q, lineNo) {
  for (const key of ["id", "subject", "topic", "questionEn", "questionHi", "explanationEn", "explanationHi"]) {
    requiredString(q, key, lineNo);
  }
  for (const key of ["optionsEn", "optionsHi"]) {
    if (!Array.isArray(q[key]) || q[key].length !== 4 || q[key].some((v) => typeof v !== "string" || !v.trim())) {
      throw new Error("line " + lineNo + ": " + key + " must contain exactly four non-empty strings");
    }
  }
  if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) {
    throw new Error("line " + lineNo + ": correctIndex must be an integer from 0 to 3");
  }
  if (q.type === "current_affairs") {
    if (!q.source || !q.source.sourceId || !/^https:\/\//i.test(q.source.articleUrl || "") ||
        !/^\d{4}-\d{2}-\d{2}$/.test(q.source.verifiedAt || "")) {
      throw new Error("line " + lineNo + ": current affairs requires sourceId, HTTPS articleUrl, and verifiedAt YYYY-MM-DD");
    }
  }
  if (q.reviewStatus !== "approved") {
    throw new Error("line " + lineNo + ": question " + q.id + " is not approved; drafts are never imported");
  }
  if (q.originalityConfirmed !== true) {
    throw new Error("line " + lineNo + ": question " + q.id + " must set originalityConfirmed=true");
  }
}

const records = [];
const seenIds = new Set();
const seenText = new Set();
const lines = fs.readFileSync(inputPath, "utf8").split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
  const raw = lines[i].trim();
  if (!raw || raw.startsWith("#")) continue;
  let q;
  try { q = JSON.parse(raw); }
  catch (error) { throw new Error("line " + (i + 1) + ": invalid JSON: " + error.message); }
  validateQuestion(q, i + 1);
  if (seenIds.has(q.id)) throw new Error("line " + (i + 1) + ": duplicate ID " + q.id);
  seenIds.add(q.id);
  const normalized = q.questionEn.normalize("NFKC").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (seenText.has(normalized)) throw new Error("line " + (i + 1) + ": duplicate English question text");
  seenText.add(normalized);
  records.push(q);
}
if (!records.length) {
  console.error("No approved questions found; no packs written.");
  process.exit(1);
}

const grouped = new Map();
for (const q of records) {
  const key = slug(q.subject);
  if (!grouped.has(key)) grouped.set(key, []);
  grouped.get(key).push(q);
}
let created = 0;
for (const [subjectSlug, questions] of grouped) {
  const subjectDir = path.join(outputRoot, subjectSlug);
  const sequencePattern = new RegExp("^" + subjectSlug + "-([0-9]{3})[.]json$");
  const existingSequences = fs.existsSync(subjectDir)
    ? fs.readdirSync(subjectDir).map((name) => {
        const match = name.match(sequencePattern);
        return match ? Number(match[1]) : 0;
      })
    : [];
  let nextSequence = Math.max(0, ...existingSequences) + 1;
  for (let offset = 0; offset < questions.length; offset += maxQuestions) {
    const batch = questions.slice(offset, offset + maxQuestions);
    const sequence = String(nextSequence++).padStart(3, "0");
    const packId = subjectSlug + "-" + sequence;
    const destination = path.join(outputRoot, subjectSlug, packId + ".json");
    if (fs.existsSync(destination)) {
      throw new Error("Refusing to overwrite existing pack: " + path.relative(root, destination));
    }
    const first = batch[0];
    const pack = {
      packId: packId,
      version: 1,
      subject: first.subject,
      category: batch.some((q) => q.type === "current_affairs") ? "current_affairs" : "general",
      titleEn: first.subject,
      titleHi: first.subjectHi || first.subject,
      descEn: "Original, reviewed practice questions for " + first.subject + ".",
      descHi: (first.subjectHi || first.subject) + " के लिए मौलिक, समीक्षित अभ्यास प्रश्न।",
      iconName: "BookOpen",
      color: "from-emerald-600 to-teal-600",
      durationMinutes: Math.max(5, Math.ceil(batch.length * 0.8)),
      questionCount: batch.length,
      questions: batch.map((record) => {
        const q = { ...record };
        delete q.reviewStatus;
        delete q.originalityConfirmed;
        delete q.subjectHi;
        delete q.reviewer;
        q.review = { status: "approved", reviewer: record.reviewer || "editorial-review" };
        return q;
      })
    };
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, JSON.stringify(pack, null, 2) + "\n", { flag: "wx" });
    created += batch.length;
    console.log("Wrote " + path.relative(root, destination) + " (" + batch.length + " questions)");
  }
}
const packCount = [...grouped.values()].reduce((sum, questions) => sum + Math.ceil(questions.length / maxQuestions), 0);
console.log("Imported " + created + " approved questions into " + packCount + " packs.");
console.log("Run npm run quiz:bank:validate and npm run quiz:bank:manifest before publishing.");
