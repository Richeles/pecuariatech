import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface CacheEntry { key: string; data: any; timestamp: number; ttl: number; }
interface PecuariaTechDB extends DBSchema { offline_data: { key: string; value: CacheEntry; }; }

const DB_NAME = 'pecuariatech_cache';
const STORE_NAME = 'offline_data';
const DB_VERSION = 1;
let dbPromise: Promise<IDBPDatabase<PecuariaTechDB>> | null = null;

function initDB(): Promise<IDBPDatabase<PecuariaTechDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PecuariaTechDB>(DB_NAME, DB_VERSION, {
      upgrade(db) { if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'key' }); },
    });
  }
  return dbPromise;
}

export async function setCache(key: string, data: any, ttlMs: number = 24 * 60 * 60 * 1000): Promise<void> {
  const db = await initDB();
  await db.put(STORE_NAME, { key, data, timestamp: Date.now(), ttl: ttlMs });
}

export async function getCache<T = any>(key: string): Promise<T | null> {
  const db = await initDB();
  const entry = await db.get(STORE_NAME, key);
  if (entry && Date.now() - entry.timestamp < entry.ttl) return entry.data as T;
  return null;
}

export async function clearExpiredCache(): Promise<void> {
  const db = await initDB();
  const all = await db.getAll(STORE_NAME);
  const now = Date.now();
  for (const entry of all) if (now - entry.timestamp >= entry.ttl) await db.delete(STORE_NAME, entry.key);
}
