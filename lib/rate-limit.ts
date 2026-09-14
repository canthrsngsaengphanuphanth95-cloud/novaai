const buckets = new Map<string, { count: number; resetAt: number }>();
export function rateLimit(key: string, limit = 30, windowMs = 60_000) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) { buckets.set(key, { count: 1, resetAt: now + windowMs }); return { ok: true }; }
  if (b.count >= limit) return { ok: false };
  b.count++; return { ok: true };
}