import type { QuizTopic } from "../data/quiz/quizQuestionBank";

export interface QuestionPackDescriptor {
  packId: string;
  version: number;
  subject: string;
  category?: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  iconName: string;
  color: string;
  badge?: string;
  questionsCount: number;
  durationMinutes: number;
  url: string;
  sha256: string;
  sizeBytes: number;
}

interface QuestionBankManifest {
  schemaVersion: number;
  generatedAt?: string;
  targetQuestionCount?: number;
  actualQuestionCount?: number;
  packs: QuestionPackDescriptor[];
}

const MANIFEST_URL = "/question-bank/manifest.json";
const MANIFEST_CACHE_KEY = "samahit-question-bank-manifest-v1";

function isManifest(value: unknown): value is QuestionBankManifest {
  if (!value || typeof value !== "object") return false;
  const candidate = value as QuestionBankManifest;
  return candidate.schemaVersion === 1 && Array.isArray(candidate.packs) &&
    candidate.packs.every((pack) =>
      typeof pack.packId === "string" &&
      Number.isInteger(pack.version) &&
      typeof pack.titleEn === "string" &&
      typeof pack.titleHi === "string" &&
      Number.isInteger(pack.questionsCount) &&
      typeof pack.url === "string" &&
      typeof pack.sha256 === "string"
    );
}

function readCachedManifest(): QuestionBankManifest | null {
  try {
    const raw = globalThis.localStorage?.getItem(MANIFEST_CACHE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isManifest(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function getManifest(): Promise<QuestionBankManifest | null> {
  try {
    const response = await fetch(MANIFEST_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`);
    const manifest: unknown = await response.json();
    if (!isManifest(manifest)) throw new Error("Invalid question-bank manifest.");
    try {
      globalThis.localStorage?.setItem(MANIFEST_CACHE_KEY, JSON.stringify(manifest));
    } catch {
      // The manifest remains usable for this session if local storage is unavailable.
    }
    return manifest;
  } catch {
    return readCachedManifest();
  }
}

export async function listQuestionPackTopics(): Promise<QuizTopic[]> {
  const manifest = await getManifest();
  if (!manifest) return [];
  return manifest.packs.map((pack) => ({
    id: pack.packId,
    titleEn: pack.titleEn,
    titleHi: pack.titleHi,
    descEn: pack.descEn,
    descHi: pack.descHi,
    iconName: pack.iconName || "BookOpen",
    color: pack.color || "from-emerald-600 to-teal-600",
    badge: pack.badge,
    questionsCount: pack.questionsCount,
    durationMinutes: pack.durationMinutes || 10,
    questions: []
  }));
}

export async function getQuestionBankManifestSummary(): Promise<{
  actualQuestionCount: number;
  targetQuestionCount: number;
  packCount: number;
}> {
  const manifest = await getManifest();
  return {
    actualQuestionCount: manifest?.actualQuestionCount ?? 0,
    targetQuestionCount: manifest?.targetQuestionCount ?? 50000,
    packCount: manifest?.packs.length ?? 0
  };
}
