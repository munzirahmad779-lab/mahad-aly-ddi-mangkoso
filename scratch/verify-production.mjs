/**
 * Verifikasi terhadap database PRODUKSI (Supabase asli) — hanya baca + satu
 * percobaan tulis yang memang WAJAR ditolak Row-Level Security karena
 * SUPABASE_SERVICE_ROLE_KEY tidak diset pada mesin ini.
 *
 * Tujuannya membuktikan dua hal:
 *   1. Alur baca/pratinjau berjalan normal di data sungguhan.
 *   2. Penolakan RLS ditangkap dengan pesan yang jelas (bukan error misterius),
 *      dan TIDAK ada satu baris pun yang berubah saat penolakan terjadi.
 */
const BASE = process.env.TEST_BASE || "http://127.0.0.1:3102";
const SUPABASE_URL = "https://ymxijorgoucpsxgcvtgu.supabase.co";
const ANON_KEY = "sb_publishable_8Y6NE0t_5z4Jo2u3G50bbQ_e1qTTOB-";

let pass = 0;
let fail = 0;
function check(name, ok, detail = "") {
  if (ok) {
    pass += 1;
    console.log(`  ok   ${name}`);
  } else {
    fail += 1;
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const REST_HEADERS = { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` };

async function snapshot() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?select=key,value,updated_at`, {
    headers: REST_HEADERS
  });
  const rows = await res.json();
  const map = new Map(rows.map((row) => [row.key, row]));

  const colRes = await fetch(`${SUPABASE_URL}/rest/v1/collections?select=collection_type,data,order_index`, {
    headers: REST_HEADERS
  });
  const cols = await colRes.json();

  return {
    keys: [...map.keys()].sort(),
    siteSettings: map.get("site_settings")?.value,
    dema: map.get("dema_settings")?.value,
    history: map.get("profile.history")?.value,
    collections: cols,
    updatedAt: Object.fromEntries([...map.entries()].map(([k, v]) => [k, v.updated_at]))
  };
}

async function main() {
  for (let i = 0; i < 30; i += 1) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) break;
    } catch {
      /* belum siap */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log("=== 1. Status panel terhadap database produksi ===");
  const statusRes = await fetch(`${BASE}/api/admin/sync/sheets`, {
    headers: { Authorization: "Bearer guest-local-token" }
  });
  const statusJson = await statusRes.json();
  check("GET status 200", statusRes.status === 200);
  check("serviceRoleConfigured = false (memang belum diset)", statusJson.serviceRoleConfigured === false, String(statusJson.serviceRoleConfigured));
  check("4 modul terdaftar", Array.isArray(statusJson.data) && statusJson.data.length === 4);
  const catalogStatus = statusJson.data.filter((s) => s.module !== "dema");
  check(
    "katalog baru belum tersinkron di produksi",
    catalogStatus.every((s) => s.itemCount === 0),
    JSON.stringify(statusJson.data.map((s) => [s.module, s.itemCount]))
  );
  check(
    "DeMa terbaca 24 anggota dari database asli",
    statusJson.data.find((s) => s.module === "dema")?.itemCount === 24,
    JSON.stringify(statusJson.data.find((s) => s.module === "dema"))
  );

  console.log("\n=== 2. Snapshot produksi SEBELUM ===");
  const before = await snapshot();
  console.log(`  kunci site_content : ${before.keys.length} → ${before.keys.join(", ")}`);
  console.log(`  anggota DeMa       : ${before.dema.members.length}`);
  console.log(`  collections        : ${before.collections.length}`);
  check("tanggal pendirian Mona utuh", before.siteSettings.establishedDate === "10 Ramadhani 1439 H / 25 Mei 2018 M");
  check("Ketua DeMa = IMRAN", before.dema.members[0].name === "IMRAN");
  check("DeMa berjumlah 24", before.dema.members.length === 24);

  console.log("\n=== 3. Pratinjau memakai data sungguhan (tidak menulis apa pun) ===");
  const csv = [
    '"Nama Lengkap","Gelar & Jabatan","Link Foto Google Drive","Bidang Keahlian","Nomor Urut","Status Aktif"',
    '"AGH. Prof. Dr. M. Faried Wadjedy, MA","Guru Besar Fiqh & Tafsir","https://drive.google.com/open?id=1XB1mGiYGxf3Mz_foEzihcZz6bwIEVzaL","Ushul Fikih","1","Aktif"'
  ].join("\r\n");

  const previewRes = await fetch(`${BASE}/api/admin/sync/sheets`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer guest-local-token" },
    body: JSON.stringify({ action: "preview", module: "masyayikh", csvContent: csv })
  });
  const previewJson = await previewRes.json();
  check("pratinjau 200", previewRes.status === 200, JSON.stringify(previewJson).slice(0, 200));
  check("1 baris terbaca", previewJson.count === 1);
  check(
    "foto Drive → CDN",
    String(previewJson.previewItems?.[0]?.photoUrl).startsWith("https://lh3.googleusercontent.com/d/"),
    String(previewJson.previewItems?.[0]?.photoUrl)
  );

  console.log("\n=== 4. Percobaan simpan tanpa Service Role Key (harus ditolak rapi) ===");
  const syncRes = await fetch(`${BASE}/api/admin/sync/sheets`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer guest-local-token" },
    body: JSON.stringify({ action: "sync", module: "masyayikh", csvContent: csv })
  });
  const syncJson = await syncRes.json();
  check("ditolak dengan status 503", syncRes.status === 503, `status ${syncRes.status}: ${syncJson.error}`);
  check(
    "pesan menyebut SUPABASE_SERVICE_ROLE_KEY",
    String(syncJson.error || "").includes("SUPABASE_SERVICE_ROLE_KEY"),
    String(syncJson.error).slice(0, 220)
  );
  check(
    "pesan menyebut Row-Level Security",
    /row-level security/i.test(String(syncJson.error || "")),
    String(syncJson.error).slice(0, 220)
  );

  console.log("\n=== 5. Snapshot produksi SESUDAH — tidak boleh berubah ===");
  const after = await snapshot();
  check("jumlah kunci sama", after.keys.length, before.keys.length);
  check("daftar kunci sama", JSON.stringify(after.keys), JSON.stringify(before.keys));
  check("site_settings identik", JSON.stringify(after.siteSettings), JSON.stringify(before.siteSettings));
  check("dema_settings identik", JSON.stringify(after.dema), JSON.stringify(before.dema));
  check("profile.history identik", JSON.stringify(after.history), JSON.stringify(before.history));
  check("collections identik", JSON.stringify(after.collections), JSON.stringify(before.collections));
  check("tidak ada baris baru tercipta", !after.keys.includes("masyayikh_list"));
  check("kunci backup pun tidak tercipta", !after.keys.some((k) => k.startsWith("backup_before_sync_")));

  console.log(`\n──────────────────────────────\n  LULUS: ${pass}   GAGAL: ${fail}\n──────────────────────────────\n`);
  if (fail > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error("Kesalahan:", error);
  process.exitCode = 1;
});
