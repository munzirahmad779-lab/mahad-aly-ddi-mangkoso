/**
 * Mock Supabase lokal untuk pengujian end-to-end TANPA menyentuh database produksi.
 *
 * Meniru bagian API yang dipakai aplikasi:
 *   - GoTrue   : GET  /auth/v1/user
 *   - PostgREST: GET/POST /rest/v1/<tabel>
 *
 * State awal di-seed dari snapshot produksi (scratch/baseline/db-before.json)
 * sehingga pengujian sekaligus membuktikan data asli (24 DeMa, sejarah Mona)
 * tidak terganggu.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = Number(process.env.MOCK_PORT || 54321);

const SERVICE_KEY = "test-service-role-key";
const ANON_KEY = "test-anon-key";

/** Nilai site_content hasil seed + hasil tulis endpoint sinkronisasi. */
const siteContent = new Map();
/** Baris tabel collections. */
let collections = [];

// ── Seed: fixture lokal, jika tidak ada ambil dari Supabase asli (hanya BACA) ──
const baselinePath = path.resolve(process.cwd(), "scratch/baseline/db-before.json");
const LIVE_URL = process.env.SEED_SUPABASE_URL || "https://ymxijorgoucpsxgcvtgu.supabase.co";
const LIVE_KEY = process.env.SEED_SUPABASE_ANON_KEY || "sb_publishable_8Y6NE0t_5z4Jo2u3G50bbQ_e1qTTOB-";

const groupOf = {
  site_settings: ["settings", "Site Settings"],
  dema_settings: ["dema", "Konten Dewan Mahasantri (DeMa)"],
  "profile.history": ["profile", "Sejarah & Visi Misi Lembaga"],
  header: ["layout", "Header & Navbar Settings"],
  footer: ["footer", "Footer Settings"]
};

try {
  let rows = [];

  if (fs.existsSync(baselinePath)) {
    const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8").replace(/^\uFEFF/, ""));
    rows = Object.entries(baseline)
      .filter(([key]) => key !== "collections")
      .map(([key, value]) => ({ key, value }));
    const rawCollections = baseline.collections;
    collections = Array.isArray(rawCollections)
      ? rawCollections
      : Array.isArray(rawCollections?.value)
      ? rawCollections.value
      : [];
  } else {
    const headers = { apikey: LIVE_KEY, Authorization: `Bearer ${LIVE_KEY}` };
    const [contentRes, collectionRes] = await Promise.all([
      fetch(`${LIVE_URL}/rest/v1/site_content?select=key,value`, { headers }),
      fetch(`${LIVE_URL}/rest/v1/collections?select=id,collection_type,data,order_index`, { headers })
    ]);
    rows = await contentRes.json();
    collections = await collectionRes.json();
    if (!Array.isArray(rows) || !Array.isArray(collections)) {
      throw new Error("respons Supabase tidak berbentuk larik");
    }
  }

  for (const row of rows) {
    if (!row?.key) continue;
    const [group, label] = groupOf[row.key] || ["misc", row.key];
    siteContent.set(row.key, {
      key: row.key,
      group_name: group,
      label,
      value: row.value,
      updated_at: new Date().toISOString()
    });
  }
  console.log(`[mock] seed: ${siteContent.size} site_content, ${collections.length} collections`);
} catch (error) {
  console.warn(`[mock] seed gagal (${error.message}) — mulai kosong`);
}

// ── Utilitas ─────────────────────────────────────────────────────────────
function corsHeaders(extra = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers":
      "apikey,authorization,content-type,prefer,accept,accept-profile,content-profile,x-client-info,range,x-supabase-api-version",
    "Access-Control-Expose-Headers": "content-range,content-profile",
    ...extra
  };
}

function sendJson(res, status, body, extraHeaders = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, corsHeaders({ "Content-Type": "application/json", ...extraHeaders }));
  res.end(payload);
}

function parseFilters(searchParams) {
  const filters = [];
  for (const [rawKey, rawValue] of searchParams.entries()) {
    if (["select", "order", "limit", "offset", "on_conflict", "columns"].includes(rawKey)) continue;
    const match = rawValue.match(/^eq\.(.*)$/);
    if (match) filters.push({ column: rawKey, value: match[1] });
  }
  return filters;
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });
}

// ── Server ───────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const segments = url.pathname.split("/").filter(Boolean);

  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  // ── Inspeksi state (khusus pengujian) ──────────────────────────────────
  if (url.pathname === "/__state") {
    sendJson(res, 200, {
      siteContent: Object.fromEntries([...siteContent.entries()].map(([k, v]) => [k, v.value])),
      collections
    });
    return;
  }

  // ── GoTrue: verifikasi token ───────────────────────────────────────────
  if (url.pathname === "/auth/v1/user") {
    const auth = req.headers["authorization"] || "";
    if (!auth.startsWith("Bearer ")) {
      sendJson(res, 401, { msg: "Missing authorization" });
      return;
    }
    sendJson(res, 200, {
      id: "user-test-1",
      aud: "authenticated",
      role: "authenticated",
      email: "tester@mahadaly.test",
      user_metadata: {},
      app_metadata: {}
    });
    return;
  }

  if (url.pathname === "/auth/v1/token") {
    sendJson(res, 200, {
      access_token: "test-access-token",
      token_type: "bearer",
      expires_in: 3600,
      refresh_token: "test-refresh",
      user: { id: "user-test-1", email: "tester@mahadaly.test" }
    });
    return;
  }

  // ── PostgREST ──────────────────────────────────────────────────────────
  if (segments[0] === "rest" && segments[1] === "v1") {
    const table = segments[2];
    const accept = String(req.headers["accept"] || "");
    const wantsSingle = accept.includes("vnd.pgrst.object+json");
    const filters = parseFilters(url.searchParams);

    if (req.method === "GET") {
      if (table === "site_content") {
        const keyFilter = filters.find((f) => f.column === "key");
        if (keyFilter) {
          const row = siteContent.get(keyFilter.value);
          if (!row) {
            if (wantsSingle) {
              sendJson(res, 406, {
                code: "PGRST116",
                message: `JSON object requested, multiple (or no) rows returned`,
                details: "The result contains 0 rows"
              });
              return;
            }
            sendJson(res, 200, []);
            return;
          }
          sendJson(res, 200, wantsSingle ? row : [row]);
          return;
        }
        sendJson(res, 200, [...siteContent.values()]);
        return;
      }

      if (table === "users") {
        sendJson(res, 200, wantsSingle ? { role: "super_admin", is_active: true } : [{ role: "super_admin", is_active: true }]);
        return;
      }

      if (table === "collections") {
        const typeFilter = filters.find((f) => f.column === "collection_type");
        const rows = typeFilter
          ? collections.filter((row) => row.collection_type === typeFilter.value)
          : collections;
        sendJson(res, 200, rows);
        return;
      }

      // Tabel lain: kosong (aplikasi menangani larik kosong dengan baik)
      sendJson(res, 200, []);
      return;
    }

    if (req.method === "POST" && table === "site_content") {
      const raw = await readBody(req);
      let parsed;
      try {
        parsed = JSON.parse(raw || "[]");
      } catch {
        sendJson(res, 400, { message: "invalid JSON body" });
        return;
      }
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      for (const row of rows) {
        if (!row?.key) continue;
        siteContent.set(row.key, {
          key: row.key,
          group_name: row.group_name ?? "misc",
          label: row.label ?? row.key,
          value: row.value,
          updated_at: row.updated_at ?? new Date().toISOString()
        });
      }
      console.log(`[mock] upsert site_content: ${rows.map((r) => r.key).join(", ")}`);
      sendJson(res, 201, []);
      return;
    }

    // Mutasi lain: diterima tanpa efek
    sendJson(res, 201, []);
    return;
  }

  sendJson(res, 404, { message: `mock: route tidak dikenal ${req.method} ${url.pathname}` });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[mock] Supabase palsu berjalan di http://127.0.0.1:${PORT}`);
  console.log(`[mock] service key: ${SERVICE_KEY}`);
  console.log(`[mock] anon key   : ${ANON_KEY}`);
});

export { PORT, SERVICE_KEY, ANON_KEY };
