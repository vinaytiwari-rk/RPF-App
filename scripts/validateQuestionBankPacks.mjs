#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const packsRoot = path.join(root, "data", "question-bank", "packs");
const sourcesPath = path.join(root, "data", "question-bank", "sources.json");
const target = 50000;
const errors = [];
const warnings = [];
const allIds = new Map();
const normalizedQuestions = new Map();
const subjectCounts = new Map();
const sourceCounts = new Map();
let total = 0;
let currentAffairs = 0;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith(".json") ? [full] : [];
  });
}
function fail(message) { errors.push(message); }
function norm(value) { return String(value ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim(); }

let sourceIds = new Set();
try {
  const registry = JSON.parse(fs.readFileSync(sourcesPath, "utf8"));
  sourceIds = new Set((registry.sources ?? []).map((source) => source.id));
} catch (error) {
  fail(`Cannot read source registry: ${error.message}`);
}

const files = walk(packsRoot);
for (const file of files) {
  let pack;
  try { pack = JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (error) { fail(`${path.relative(root, file)}: invalid JSON: ${error.message}`); continue; }
  if (!pack || typeof pack !== "object" || !Array.isArray(pack.questions)) {
    fail(`${path.relative(root, file)}: expected an object with a questions array`);
    continue;
  }
  if (!pack.packId || !pack.subject || !pack.version) fail(`${path.relative(root, file)}: packId, subject, and version are required`);
  for (const [index, q] of pack.questions.entries()) {
    const where = `${path.relative(root, file)} question #${index + 1}`;
    total++;
    if (!q.id || typeof q.id !== "string") fail(`${where}: id is required`);
    else if (allIds.has(q.id)) fail(`${where}: duplicate id "${q.id}" also in ${allIds.get(q.id)}`);
    else allIds.set(q.id, where);
    for (const key of ["questionEn", "questionHi", "explanationEn", "explanationHi"]) {
      if (typeof q[key] !== "string" || !q[key].trim()) fail(`${where}: ${key} is required`);
    }
    for (const key of ["optionsEn", "optionsHi"]) {
      if (!Array.isArray(q[key]) || q[key].length !== 4 || q[key].some((option) => typeof option !== "string" || !option.trim())) {
        fail(`${where}: ${key} must contain exactly four non-empty options`);
      }
    }
    if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) fail(`${where}: correctIndex must be 0..3`);
    if (Array.isArray(q.optionsEn) && Array.isArray(q.optionsHi) && q.optionsEn.length === 4 && q.optionsHi.length === 4) {
      // The English and Hindi arrays must preserve option-to-option alignment.
      if (q.optionsEn.length !== q.optionsHi.length) fail(`${where}: bilingual options do not align`);
    }
    const key = norm(q.questionEn || q.questionHi);
    if (key) {
      if (normalizedQuestions.has(key)) warnings.push(`${where}: possible duplicate question text; also in ${normalizedQuestions.get(key)}`);
      else normalizedQuestions.set(key, where);
    }
    const subject = q.subject || pack.subject || "uncategorized";
    subjectCounts.set(subject, (subjectCounts.get(subject) ?? 0) + 1);
    if (q.type === "current_affairs" || pack.category === "current_affairs") {
      currentAffairs++;
      const source = q.source;
      if (!source || !source.sourceId || !source.articleUrl || !source.verifiedAt) {
        fail(`${where}: current-affairs questions require source.sourceId, source.articleUrl, and source.verifiedAt`);
      } else {
        if (!sourceIds.has(source.sourceId)) fail(`${where}: unknown sourceId "${source.sourceId}"`);
        if (!/^https:\/\//i.test(source.articleUrl)) fail(`${where}: articleUrl must use HTTPS`);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(source.verifiedAt)) fail(`${where}: verifiedAt must be YYYY-MM-DD`);
        sourceCounts.set(source.sourceId, (sourceCounts.get(source.sourceId) ?? 0) + 1);
      }
    }
  }
  if (Number.isInteger(pack.questionCount) && pack.questionCount !== pack.questions.length) {
    fail(`${path.relative(root, file)}: questionCount does not match questions.length`);
  }
}

console.log("SAMAHIT Question Bank Validation");
console.log(`Packs found: ${files.length}`);
console.log(`Questions found: ${total}`);
console.log(`Current-affairs questions: ${currentAffairs}`);
console.log(`Target: ${target} (remaining: ${Math.max(0, target - total)})`);
console.log("By subject:", Object.fromEntries([...subjectCounts.entries()].sort()));
console.log("By source:", Object.fromEntries([...sourceCounts.entries()].sort()));
for (const warning of warnings) console.warn("WARNING:", warning);
for (const error of errors) console.error("ERROR:", error);
if (total < target) console.warn(`TARGET NOT MET: ${target - total} more reviewed questions are needed; do not label the bank 50,000+ yet.`);
if (errors.length) process.exit(1);
if (!files.length) console.warn("No question packs exist yet. Add reviewed pack JSON files under data/question-bank/packs/.");
