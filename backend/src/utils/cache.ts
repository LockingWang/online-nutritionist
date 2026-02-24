/**
 * 簡易記憶體快取（TTL）
 * 用於 API 與 AI 回應快取，減少重複查詢與 OpenAI 呼叫
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

const defaultTtlMs = 60 * 1000; // 60 秒

/**
 * 取得快取，過期則回傳 undefined
 */
export function get<T>(key: string): T | undefined {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

/**
 * 寫入快取
 * @param ttlMs 存活時間（毫秒），預設 60 秒
 */
export function set<T>(key: string, value: T, ttlMs: number = defaultTtlMs): void {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * 刪除快取（用於更新後失效）
 */
export function del(key: string): void {
  store.delete(key);
}

/**
 * 刪除符合前綴的所有 key（例如 user:xxx 相關）
 */
export function delByPrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
