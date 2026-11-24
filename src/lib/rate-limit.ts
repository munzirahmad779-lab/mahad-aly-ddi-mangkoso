// Rate limiter bersama berbasis RPC Supabase (fungsi rate_limit_hit,
// jendela tetap, hanya service_role). Penyimpanan bersama membuat batas
// berlaku konsisten antar isolat Workers, bukan per proses.
// Cadangan: logika sliding-window in-memory di bawah, dipakai hanya bila
// RPC gagal atau klien admin tidak tersedia, supaya endpoint publik tidak
// pernah terbuka tanpa batas sama sekali. Bukan pengganti WAF edge
// (Cloudflare), tapi menutup celah spam di lapisan aplikasi.

import { supabaseAdmin } from "@/lib/supabase/server";

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

function checkRateLimitInMemory(
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

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  try {
    const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
    const { data, error } = await supabaseAdmin.rpc("rate_limit_hit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row || typeof row.allowed !== "boolean") {
      throw new Error("Respons RPC rate_limit_hit tidak dikenal.");
    }
    return {
      allowed: row.allowed,
      remaining: typeof row.remaining === "number" ? row.remaining : 0,
      retryAfterSeconds:
        typeof row.retry_after_seconds === "number" ? row.retry_after_seconds : 0
    };
  } catch (err) {
    console.error(
      "[rate-limit] RPC rate_limit_hit gagal, jatuh ke pembatas in-memory:",
      err
    );
    return checkRateLimitInMemory(key, limit, windowMs);
  }
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
