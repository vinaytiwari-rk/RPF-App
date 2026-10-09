#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const inputPath = path.resolve(process.argv[2] ?? "");
const outputRoot = path.join(root, "data", "question-bank", "packs");
const maxQuestions = Number(process.env.QUIZ_PACK_SIZE ?? 500);

if (!process.argv[2]) {
  console.error("Usage: node scripts/importQuestionBankBatch.mjs <approved-questions.jsonl>");
  console.error("Only reviewed records with reviewStatus=\"approved\" are imported.");
  process.exit(2);
}
if (!Number.isInteger(maxQuestions) || maxQuestions < 1 || maxQuestions > 1000) {
  console.error("QUIZ_PACK_SIZE must be an integer between 1 and 1000.");
  process.exit(2);
}
if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(2);
}

function slug(value) {
  return String(value).normalize("NFKD").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "subject";
}
function requiredString(record, key, lineNo) {
  if (typeof record[key] !== "string" || !record[key].trim()) {
    throw new Error(`line ${lineNo}: ${key} must be a non-empty string`);
  }
}
function validateQuestion(q, lineNo) {
  for (const key of ["id", "subject", "topic", "questionEn", "questionHi", "explanationEn", "explanationHi"]) {
    requiredString(q, key, lineNo);
  }
  for (const key of ["optionsEn", "optionsHi"]) {
    if (!Array.isArray(q[key]) || q[key].length !== 4 || q[key].some((v) => typeof v !== "string" || !v.trim())) {
      throw new Error(`line ${lineNo}: ${key} must contain exactly four non-empty strings`);
    }
  }
  if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) {
    throw new Error(`line ${lineNo}: correctIndex must be an integer from 0 to 3`);
  }
  if (q.type === "current_affairs") {
    if (!q.source?.sourceId || !/^https:\/\//i.test(q.source?.articleUrl ?? "") ||
        !/^\d{4}-\d{2}-\d{2}$/.test(q.source?.verifiedAt ?? "")) {
      throw new Error(`line ${lineNo}: current affairs requires sourceId, HTTPS articleUrl, and verifiedAt YYYY-MM-DD`);
    }
  }
  if (q.reviewStatus !== "approved") {
    throw new Error(`line ${lineNo}: question ${q.id} is not approved; drafts are never imported`);
  }
  if (q.originalityConfirmed !== true) {
    throw new Error(`line ${lineNo}: question ${q.id} must set originalityConfirmed=true`);
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
  catch (error) { throw new Error(`line ${i + 1}: invalid JSON: ${error.message}`); }
  validateQuestion(q, i + 1);
  if (seenIds.has(q.id)) throw new Error(`line ${i + 1}: duplicate ID ${q.id}`);
  seenIds.add(q.id);
  const normalized = q.questionEn.normalize("NFKC").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (seenText.has(normalized)) throw new Error(`line ${i + 1}: duplicate English question text`);
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
  for (let offset = 0; offset < questions.length; offset += maxQuestions) {
    const batch = questions.slice(offset, offset + maxQuestions);
    const firstId = String(Math.floor(offset / maxQuestions) + 1).padStart(3, "0");
    const packId = `${subjectSlug}-${firstId}`;
    const destination = path.join(outputRoot, subjectSlug, `${packId}.json`);
    if (fs.existsSync(destination)) {
      throw new Error(`Refusing to overwrite existing pack: ${path.relative(root, destination)}`);
    }
    const first = batch[0];
    const pack = {
      packId,
      version: 1,
      subject: first.subject,
      category: batch.some((q) => q.type === "current_affairs") ? "current_affairs" : "general",
      titleEn: first.subject,
      titleHi: first.subjectHi || first.subject,
      descEn: `Original, reviewed practice questions for ${first.subject}.`,
      descHi: `${first.subjectHi || first.subject} के लिए मौलिक, समीक्षित अभ्यास प्रश्न।`,
      iconName: "BookOpen",
      color: "from-emerald-600 to-teal-600",
      durationMinutes: Math.max(5, Math.ceil(batch.length * 0.8)),
      questionCount: batch.length,
      questions: batch.map(({ reviewStatus, originalityConfirmed, subjectHi, topic, reviewer, ...q }) => ({
        ...q,
        subject: q.subject,
        topic,
        review: { status: "approved", reviewer: reviewer || "editorial-review" }
      }))
    };
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, JSON.stringify(pack, null, 2) + "\n", { flag: "wx" });
    created += batch.length;
    console.log(`Wrote ${path.relative(root, destination)} (${batch.length} questions)`);
  }
}
console.log(`Imported ${created} approved questions into ${[...grouped.values()].reduce((n, q) => n + Math.ceil(q.length / maxQuestions), 0)} packs.`);
console.log("Run npm run quiz:bank:validate and npm run quiz:bank:manifest before publishing.");
