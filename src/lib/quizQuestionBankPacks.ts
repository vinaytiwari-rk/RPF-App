import type { QuizQuestion, QuizTopic } from "../data/quiz/quizQuestionBank";

export interface QuestionPack extends Omit<QuizTopic, "questions"> {
  packId: string;
  version: number;
  subject: string;
  category?: string;
  questions: (QuizQuestion & {
    subject?: string;
    type?: string;
    source?: {
      sourceId: string;
      articleUrl: string;
      publishedAt?: string;
      verifiedAt: string;
      factCheckUrl?: string;
    };
  })[];
}

interface ManifestPack {
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
  packs: ManifestPack[];
}

interface CachedPack {
  packId: string;
  version: number;
  sha256: string;
  data: QuestionPack;
  savedAt: number;
}

const DB_NAME = "samahit-question-bank";
const DB_VERSION = 1;
const STORE_NAME = "packs";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Persistent offline storage is unavailable in this browser."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "packId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open question-bank storage."));
  });
}

async function readCachedPack(packId: string): Promise<CachedPack | null> {
  let db: IDBDatabase | undefined;
  try {
    db = await openDatabase();
    return await new Promise((resolve, reject) => {
      const request = db!.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(packId);
      request.onsuccess = () => resolve((request.result as CachedPack | undefined) ?? null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  } finally {
    db?.close();
  }
}

async function writeCachedPack(pack: CachedPack): Promise<void> {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(pack);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Could not save question pack."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Question-pack save was aborted."));
    });
  } finally {
    db.close();
  }
}

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error("Secure hash verification is not supported on this device.");
  const digest = await globalThis.crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function validatePack(pack: QuestionPack, expected: ManifestPack): void {
  if (pack.packId !== expected.packId || pack.version !== expected.version) {
    throw new Error("Question pack identity or version does not match the manifest.");
  }
  if (!Array.isArray(pack.questions) || pack.questions.length !== expected.questionsCount) {
    throw new Error("Question pack count does not match the manifest.");
  }
  for (const question of pack.questions) {
    if (!question.id || !question.questionEn || !question.questionHi ||
        !Array.isArray(question.optionsEn) || question.optionsEn.length !== 4 ||
        !Array.isArray(question.optionsHi) || question.optionsHi.length !== 4 ||
        !Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex > 3) {
      throw new Error(`Invalid question structure in pack ${pack.packId}.`);
    }
  }
}

export async function loadQuestionPack(packId: string): Promise<QuestionPack | null> {
  const cached = await readCachedPack(packId);
  let manifest: QuestionBankManifest;
  try {
    const response = await fetch("/question-bank/manifest.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`);
    manifest = await response.json() as QuestionBankManifest;
  } catch {
    return cached?.data ?? null;
  }

  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.packs)) {
    return cached?.data ?? null;
  }
  const descriptor = manifest.packs.find((item) => item.packId === packId);
  if (!descriptor) return cached?.data ?? null;

  if (cached && cached.version === descriptor.version && cached.sha256 === descriptor.sha256) {
    return cached.data;
  }

  try {
    const response = await fetch(descriptor.url, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Question pack request failed: ${response.status}`);
    const buffer = await response.arrayBuffer();
    const hash = await sha256Hex(buffer);
    if (hash !== descriptor.sha256) throw new Error("Question pack integrity check failed.");
    const pack = JSON.parse(new TextDecoder().decode(buffer)) as QuestionPack;
    validatePack(pack, descriptor);
    await writeCachedPack({ packId, version: descriptor.version, sha256: hash, data: pack, savedAt: Date.now() });
    return pack;
  } catch {
    // Keep the last known-good pack available when a network update fails.
    return cached?.data ?? null;
  }
}

export function toQuizTopic(pack: QuestionPack): QuizTopic {
  return {
    id: pack.packId,
    titleEn: pack.titleEn,
    titleHi: pack.titleHi,
    descEn: pack.descEn,
    descHi: pack.descHi,
    iconName: pack.iconName,
    color: pack.color,
    badge: pack.badge,
    questionsCount: pack.questions.length,
    durationMinutes: pack.durationMinutes,
    questions: pack.questions
  };
}
