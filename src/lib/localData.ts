/** Local-first storage contract for personal utilities. */
export type LocalRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
};

const prefix = "rpf.local.";

export function localGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(prefix + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch { return fallback; }
}

export function localSet<T>(key: string, value: T): void {
  localStorage.setItem(prefix + key, JSON.stringify(value));
}

export function localRemove(key: string): void {
  localStorage.removeItem(prefix + key);
}

export function createLocalId(prefixName = "item"): string {
  const uuid = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefixName}_${uuid}`;
}
