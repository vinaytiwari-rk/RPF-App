/**
 * Local-first persistence boundary.
 *
 * IndexedDB is preferred for utility records because it is asynchronous and
 * scales beyond localStorage. A small localStorage fallback keeps basic
 * utilities functional in restricted WebViews/private browsing contexts.
 */
export type LocalStoreRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
};

const DB_NAME = "rpf-local";
const DB_VERSION = 1;
const STORE_NAME = "records";
const FALLBACK_PREFIX = "rpf.local.record.";

function hasIndexedDb(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open local database"));
  });
}

function fallbackKey(id: string): string {
  return `${FALLBACK_PREFIX}${id}`;
}

export async function localStorePut<T extends LocalStoreRecord>(record: T): Promise<void> {
  if (!hasIndexedDb()) {
    localStorage.setItem(fallbackKey(record.id), JSON.stringify(record));
    return;
  }
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Unable to save local record"));
  });
  db.close();
}

export async function localStoreGet<T extends LocalStoreRecord>(id: string): Promise<T | null> {
  if (!hasIndexedDb()) {
    const raw = localStorage.getItem(fallbackKey(id));
    return raw ? (JSON.parse(raw) as T) : null;
  }
  const db = await openDb();
  const value = await new Promise<T | null>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error("Unable to read local record"));
  });
  db.close();
  return value;
}

export async function localStoreDelete(id: string): Promise<void> {
  if (!hasIndexedDb()) {
    localStorage.removeItem(fallbackKey(id));
    return;
  }
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Unable to delete local record"));
  });
  db.close();
}

export async function localStoreList<T extends LocalStoreRecord>(): Promise<T[]> {
  if (!hasIndexedDb()) {
    const records: T[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key?.startsWith(FALLBACK_PREFIX)) continue;
      const raw = localStorage.getItem(key);
      if (raw) records.push(JSON.parse(raw) as T);
    }
    return records;
  }
  const db = await openDb();
  const values = await new Promise<T[]>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error ?? new Error("Unable to list local records"));
  });
  db.close();
  return values;
}
