// Rate limiter sliding-window in-memory per kunci (IP atau IP+route).
// Cukup untuk satu instance Node; bukan pengganti WAF edge (Cloudflare),
// tapi menutup celah spam pada endpoint publik di lapisan aplikasi.

type Bucket = { hits: number[]; };

const buckets = new Map<string, Bucket>();

// Cegah kebocoran memori: buang bucket idle setiap 10 menit
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
const BUCKET_TTL_MS = 30 * 60 * 1000;
let lastCleanup = Date.now();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    lastCleanup = now;
    for (const [k, b] of buckets) {
      const lastHit = b.hits[b.hits.length - 1] || 0;
      if (now - lastHit > BUCKET_TTL_MS) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key) || { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0];
    buckets.set(key, bucket);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000))
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return {
    allowed: true,
    remaining: limit - bucket.hits.length,
    retryAfterSeconds: 0
  };
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip")?.split(",")[0]?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
      retryAfter: result.retryAfterSeconds
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(result.retryAfterSeconds)
      }
    }
  );
}
