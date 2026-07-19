interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

export function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();

  if (now - lastCleanup > CLEANUP_INTERVAL) {
    cleanup();
    lastCleanup = now;
  }

  const windowMs = windowSeconds * 1000;
  const resetAt = now + windowMs;

  const existing = store.get(key);

  if (existing && now < existing.resetAt) {
    existing.count += 1;
    const remaining = Math.max(0, limit - existing.count);
    return {
      success: existing.count <= limit,
      remaining,
      resetAt: existing.resetAt,
    };
  }

  const entry: RateLimitEntry = { count: 1, resetAt };
  store.set(key, entry);

  return { success: true, remaining: limit - 1, resetAt };
}
