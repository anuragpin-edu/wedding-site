import { NextRequest } from "next/server";

// Basic in-memory, fixed-window rate limiter. Good enough to blunt spam/abuse
// on a low-traffic wedding site. Note: on serverless this is per-instance, not
// global — for stronger guarantees you'd use a durable store (e.g. Upstash),
// but that's intentionally out of scope here.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Occasionally drop expired buckets so the map doesn't grow unbounded.
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
}

export function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export type RateResult = { ok: boolean; retryAfter: number };

// Allow `limit` requests per `windowMs` for a given key (e.g. "claim:1.2.3.4").
export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  sweep(now);
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count++;
  return { ok: true, retryAfter: 0 };
}

// Convenience: build a per-IP key and apply the limit in one call.
export function limitByIp(
  req: NextRequest,
  name: string,
  limit: number,
  windowMs: number
): RateResult {
  return rateLimit(`${name}:${getClientIp(req)}`, limit, windowMs);
}
