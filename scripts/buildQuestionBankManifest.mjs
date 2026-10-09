#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import process from "node:process";

const root = process.cwd();
const sourceRoot = path.join(root, "data", "question-bank", "packs");
const publicRoot = path.join(root, "public", "question-bank");
const manifestPath = path.join(publicRoot, "manifest.json");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith(".json") ? [full] : [];
  });
}

const files = walk(sourceRoot);
if (!files.length) {
  console.error("No question packs found. Add reviewed JSON files under data/question-bank/packs/.");
  process.exit(1);
}

const packs = [];
for (const file of files) {
  const raw = fs.readFileSync(file);
  const pack = JSON.parse(raw.toString("utf8"));
  if (!pack.packId || !pack.subject || !Number.isInteger(pack.version) || !Array.isArray(pack.questions)) {
    throw new Error(`Invalid pack metadata in ${path.relative(root, file)}`);
  }
  const relative = path.relative(sourceRoot, file).split(path.sep).join("/");
  const output = path.join(publicRoot, "packs", relative);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.copyFileSync(file, output);
  packs.push({
    packId: pack.packId,
    version: pack.version,
    subject: pack.subject,
    category: pack.category ?? "general",
    titleEn: pack.titleEn ?? pack.subject,
    titleHi: pack.titleHi ?? pack.subject,
    descEn: pack.descEn ?? "",
    descHi: pack.descHi ?? "",
    iconName: pack.iconName ?? "BookOpen",
    color: pack.color ?? "from-emerald-600 to-teal-600",
    badge: pack.badge ?? "",
    questionsCount: pack.questions.length,
    durationMinutes: pack.durationMinutes ?? 10,
    url: `/question-bank/packs/${relative}`,
    sha256: crypto.createHash("sha256").update(raw).digest("hex"),
    sizeBytes: raw.byteLength
  });
}
packs.sort((a, b) => a.packId.localeCompare(b.packId));
const manifest = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  targetQuestionCount: 50000,
  actualQuestionCount: packs.reduce((sum, pack) => sum + pack.questionsCount, 0),
  packs
};
fs.mkdirSync(publicRoot, { recursive: true });
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Question bank manifest generated: ${packs.length} packs, ${manifest.actualQuestionCount} questions.`);
console.log(`Target 50,000+: ${manifest.actualQuestionCount >= 50000 ? "MET" : "NOT MET"} (${Math.max(0, 50000 - manifest.actualQuestionCount)} questions remaining).`);
