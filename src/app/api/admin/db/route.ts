import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/admin-guard";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

// Gerbang tulis database terpusat. Semua operasi tulis admin harus lewat sini
// memakai Service Role di server — BUKAN langsung dari browser dengan anon key.
// - Autentikasi: wajib super_admin / editor (guest token hanya berlaku localhost).
// - Allowlist tabel: menutup akses ke tabel di luar daftar (auth, storage, dsb).
// - Operasi & kolom match tervalidasi untuk mencegah injection pola query.

const ALLOWED_TABLES = new Set([
  "articles",
  "categories",
  "theses",
  "news",
  "submissions",
  "collections",
  "site_settings",
  "site_content",
  "users"
]);

const ALLOWED_OPS = new Set(["insert", "update", "delete", "upsert"]);

const ALLOWED_MATCH_COLUMNS = new Set(["id", "slug", "key", "email"]);

export async function POST(request: Request) {
  try {
    const rl = checkRateLimit(`db:${getClientIp(request)}`, 120, 60 * 1000);
    if (!rl.allowed) return rateLimitResponse(rl);

    const auth = await requireRole(request, ["super_admin", "editor"]);
    if (!auth.ok) {
      return auth.response;
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
    }

    const { table, op, payload, match } = body as {
      table?: string;
      op?: string;
      payload?: Record<string, unknown>;
      match?: Record<string, unknown>;
    };

    if (!table || !ALLOWED_TABLES.has(table)) {
      return NextResponse.json(
        { error: `Tabel "${table}" tidak diizinkan.` },
        { status: 403 }
      );
    }
    if (!op || !ALLOWED_OPS.has(op)) {
      return NextResponse.json({ error: `Operasi "${op}" tidak dikenal.` }, { status: 400 });
    }
    if (op !== "delete" && (!payload || typeof payload !== "object")) {
      return NextResponse.json({ error: "Payload wajib diisi." }, { status: 400 });
    }
    if ((op === "update" || op === "delete") && (!match || typeof match !== "object")) {
      return NextResponse.json(
        { error: "Operasi update/delete wajib menyertakan match." },
        { status: 400 }
      );
    }

    // Validasi kolom match: hanya kolom kunci yang boleh dipakai sebagai filter
    let matchEntries: [string, unknown][] = [];
    if (match) {
      matchEntries = Object.entries(match);
      if (matchEntries.length === 0) {
        return NextResponse.json(
          { error: "Match tidak boleh kosong (mencegah update/delete massal)." },
          { status: 400 }
        );
      }
      for (const [col] of matchEntries) {
        if (!ALLOWED_MATCH_COLUMNS.has(col)) {
          return NextResponse.json(
            { error: `Kolom filter "${col}" tidak diizinkan.` },
            { status: 403 }
          );
        }
        if (typeof match[col] !== "string" && typeof match[col] !== "number") {
          return NextResponse.json(
            { error: `Nilai filter "${col}" harus string atau angka.` },
            { status: 400 }
          );
        }
      }
    }

    // Batasi ukuran payload (mencegah abuse memori/DB)
    if (payload && JSON.stringify(payload).length > 5_000_000) {
      return NextResponse.json({ error: "Payload terlalu besar." }, { status: 413 });
    }

    let data: unknown = null;
    let error: { message: string } | null = null;

    if (op === "insert") {
      ({ data, error } = await supabaseAdmin.from(table).insert(payload!).select());
    } else if (op === "upsert") {
      ({ data, error } = await supabaseAdmin.from(table).upsert(payload!).select());
    } else if (op === "update") {
      let q = supabaseAdmin.from(table).update(payload!);
      for (const [col, val] of matchEntries) {
        q = q.eq(col, val as string);
      }
      ({ data, error } = await q.select());
    } else {
      let q = supabaseAdmin.from(table).delete();
      for (const [col, val] of matchEntries) {
        q = q.eq(col, val as string);
      }
      ({ data, error } = await q.select());
    }

    if (error) {
      console.error(`API /api/admin/db ${op} ${table} error:`, error.message);
      return NextResponse.json(
        { error: `Gagal menyimpan ke database: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("API /api/admin/db error:", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Kesalahan server internal." },
      { status: 500 }
    );
  }
}
