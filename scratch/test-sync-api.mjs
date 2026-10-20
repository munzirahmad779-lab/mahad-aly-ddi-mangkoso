/**
 * Uji end-to-end endpoint /api/admin/sync/sheets terhadap:
 *   • Next.js dev server (http://127.0.0.1:3100)
 *   • Mock Supabase   (http://127.0.0.1:54321) — berisi snapshot data produksi
 *
 * Data uji dibangun dari data ASLI (2 masyayikh, 3 sarana yang ada di tabel
 * collections + 24 anggota DeMa), sehingga tidak ada orang/fasilitas fiktif.
 */
const BASE = process.env.TEST_BASE || "http://127.0.0.1:3100";
const MOCK = process.env.TEST_MOCK || "http://127.0.0.1:54321";

let pass = 0;
let fail = 0;

function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    pass += 1;
    console.log(`  ok   ${name}`);
  } else {
    fail += 1;
    console.log(`  FAIL ${name}\n       expected: ${e}\n       actual:   ${a}`);
  }
}

function checkTruthy(name, value, hint = "") {
  if (value) {
    pass += 1;
    console.log(`  ok   ${name}`);
  } else {
    fail += 1;
    console.log(`  FAIL ${name}${hint ? ` — ${hint}` : ""}`);
  }
}

const AUTH = { "Content-Type": "application/json", Authorization: "Bearer guest-local-token" };

async function post(body, withAuth = true) {
  const res = await fetch(`${BASE}/api/admin/sync/sheets`, {
    method: "POST",
    headers: withAuth ? AUTH : { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function state() {
  const res = await fetch(`${MOCK}/__state`);
  return res.json();
}

/** Ubah larik objek menjadi CSV (semua sel dikutip agar aman terhadap koma). */
function toCsv(headers, rows) {
  const quote = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  return [headers.map(quote).join(","), ...rows.map((row) => row.map(quote).join(","))].join("\r\n");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log("Menunggu server siap...");
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const res = await fetch(`${BASE}/api/health`, { method: "GET" });
      if (res.ok) break;
    } catch {
      /* belum siap */
    }
    await sleep(1000);
  }

  const seeded = await state();
  const realLecturers = seeded.collections.filter((row) => row.collection_type === "masyayikh");
  const realFacilities = seeded.collections.filter((row) => row.collection_type === "sarana");
  const realDema = seeded.siteContent.dema_settings;

  console.log(`\nKonteks: ${realLecturers.length} masyayikh, ${realFacilities.length} sarana, ${realDema.members.length} DeMa`);

  // ── CSV Masyayikh dari data asli ────────────────────────────────────────
  const drivePhoto = realDema.members[0].rawPhotoUrl;
  const storagePhoto = realLecturers[1].data.photoUrl;

  const masyayikhCsv = toCsv(
    [
      "Nama Lengkap",
      "Gelar & Jabatan",
      "Peran/Tugas Mengajar",
      "Link Foto Google Drive",
      "Bidang Keahlian",
      "Riwayat Pendidikan",
      "Karya/Publikasi",
      "Nomor Urut",
      "Status Aktif"
    ],
    realLecturers.map((row, index) => [
      row.data.name,
      row.data.title,
      row.data.role,
      index === 0 ? drivePhoto : storagePhoto,
      row.data.expertise,
      (row.data.education || []).join(" • "),
      (row.data.publications || []).join(" • "),
      row.order_index || index + 1,
      row.data.isActive === false ? "Non-Aktif" : "Aktif"
    ])
  );

  // ── CSV Kurikulum (isi nyata kurikulum 8 semester) ──────────────────────
  const kurikulumCsv = toCsv(
    [
      "Kode Matkul",
      "Nama Mata Kuliah",
      "Bobot SKS",
      "Semester (1 s/d 8)",
      "Dosen Pengampu",
      "Kitab Rujukan",
      "Deskripsi Singkat",
      "Sifat"
    ],
    [
      ["MK-101", "Mabadi' Ushul Fiqh & Madkhal Ila al-Fiqh", "3", "1", "Ust. M. Idrus, M.Ag.", "Al-Waraqat & Syarah Al-Mahalli", "Pengantar metodologi istinbath hukum dasar.", "Wajib"],
      ["MK-102", "Dirasah Matan Fathul Qarib al-Mujib", "4", "1", "Dewan Masyaikh", "Fathul Qarib al-Mujib", "Kajian bab ibadah dan thaharah secara talaqqi.", "Wajib"],
      ["MK-301", "Ushul Fiqh Lanjutan: Jam'ul Jawami'", "4", "3", "AGH. Prof. Dr. M. Faried Wadjedy, MA", "Jam'ul Jawami' lil Imam as-Subki", "Kaidah dalil qath'i-zhanni dan rekonstruksi ijtihad.", "Wajib"],
      ["MK-302", 'Fiqh Muamalah Kontemporer & Fintech', "3", "5", "Ust. M. Idrus, M.Ag.", "Fathul Mu'in", "Transaksi digital dan fintech syariah.", "Pilihan"],
      // baris dengan kolom tidak lengkap → harus dilewati, bukan merusak proses
      ["", "Baris tanpa kode (harus dilewati)", "2", "9", "", "", "", ""]
    ]
  );

  // ── CSV Sarana dari data asli ──────────────────────────────────────────
  const saranaCsv = toCsv(
    ["Nama Fasilitas", "Kategori", "Link Foto Google Drive", "Deskripsi Ringkas", "Kapasitas", "Nomor Urut"],
    realFacilities.map((row, index) => [
      row.data.name,
      row.data.category,
      index === 0 ? drivePhoto : row.data.photoUrl || "",
      row.data.description,
      index === 0 ? "500 Mahasantri" : "",
      index + 1
    ])
  );

  // ── CSV DeMa dari 2 pengurus asli ──────────────────────────────────────
  const demaCsv = toCsv(
    [
      "Timestamp",
      "Nama Lengkap",
      "NIM",
      "Semester / Marhalah",
      "Divisi / Amanah",
      "Link Foto Google Drive",
      "Nomor WhatsApp",
      "Akun Instagram",
      "Biografi Singkat",
      "Motto Hidup / Kutipan"
    ],
    realDema.members.slice(0, 2).map((member) => [
      "2026-10-20 08:00",
      member.name,
      member.nim || "",
      member.marhalah || "",
      member.role || "",
      member.rawPhotoUrl || member.photoUrl || "",
      member.phone || "",
      member.instagram || "",
      member.bio || "",
      member.quote || ""
    ])
  );

  // ══ 1. Otorisasi ═══════════════════════════════════════════════════════
  console.log("\n=== 1. Otorisasi ===");
  const noAuth = await post({ action: "preview", module: "masyayikh", csvContent: masyayikhCsv }, false);
  check("tanpa token → 401", noAuth.status, 401);

  const badModule = await post({ action: "preview", module: "tidak-ada", csvContent: masyayikhCsv });
  check("modul tidak dikenal → 400", badModule.status, 400);

  // ══ 2. Pratinjau Masyayikh ═════════════════════════════════════════════
  console.log("\n=== 2. Pratinjau (Preview) Masyayikh ===");
  const previewLec = await post({ action: "preview", module: "masyayikh", csvContent: masyayikhCsv });
  check("status 200", previewLec.status, 200);
  check("previewMode", previewLec.json.previewMode, true);
  check("jumlah baris", previewLec.json.count, realLecturers.length);
  check("previewItems ada", Array.isArray(previewLec.json.previewItems), true);
  checkTruthy(
    "foto Drive → CDN lh3",
    previewLec.json.previewItems[0].photoUrl.startsWith("https://lh3.googleusercontent.com/d/"),
    previewLec.json.previewItems[0].photoUrl
  );
  checkTruthy(
    "foto Supabase tidak diubah",
    previewLec.json.previewItems[1].photoUrl.includes("/storage/v1/object/public/") &&
      !previewLec.json.previewItems[1].photoUrl.includes("lh3.googleusercontent.com"),
    previewLec.json.previewItems[1].photoUrl
  );
  const stateAfterPreview = await state();
  check("preview TIDAK menulis database", stateAfterPreview.siteContent.masyayikh_list, undefined);

  // ══ 3. Simpan Masyayikh ════════════════════════════════════════════════
  console.log("\n=== 3. Simpan & Publikasikan Masyayikh ===");
  const syncLec = await post({ action: "sync", module: "masyayikh", csvContent: masyayikhCsv, sheetName: "Masyayikh" });
  check("status 200", syncLec.status, 200);
  check("previewMode false", syncLec.json.previewMode, false);
  check("jumlah tersimpan", syncLec.json.count, realLecturers.length);
  checkTruthy("pesan sukses berisi jumlah", /Berhasil menyinkronkan/.test(syncLec.json.message || ""), syncLec.json.message);

  const afterLec = await state();
  check("key masyayikh_list terbentuk", Array.isArray(afterLec.siteContent.masyayikh_list?.items), true);
  check("jumlah item di DB", afterLec.siteContent.masyayikh_list.items.length, realLecturers.length);
  check(
    "alias lecturers_data ikut tertulis",
    afterLec.siteContent.lecturers_data.items.length,
    realLecturers.length
  );
  check(
    "foto tersimpan sebagai CDN",
    afterLec.siteContent.masyayikh_list.items[0].photoUrl.startsWith("https://lh3.googleusercontent.com/d/"),
    true
  );
  check(
    "URL asli tetap disimpan",
    afterLec.siteContent.masyayikh_list.items[0].rawPhotoUrl,
    drivePhoto
  );
  check("meta.source terisi", afterLec.siteContent.masyayikh_list.meta.source, "Upload CSV — Masyayikh");
  checkTruthy("meta.syncedBy terisi", Boolean(afterLec.siteContent.masyayikh_list.meta.syncedBy), JSON.stringify(afterLec.siteContent.masyayikh_list.meta));
  check(
    "pendidikan terbaca sebagai larik",
    Array.isArray(afterLec.siteContent.masyayikh_list.items[0].education),
    true
  );
  check("audit log tercatat", Array.isArray(afterLec.siteContent.activity_logs), true);
  checkTruthy(
    "audit menyebut masyayikh",
    JSON.stringify(afterLec.siteContent.activity_logs?.[0] || {}).toLowerCase().includes("masyayikh"),
    JSON.stringify(afterLec.siteContent.activity_logs?.[0] || {})
  );

  // ══ 4. Integritas data asli ════════════════════════════════════════════
  console.log("\n=== 4. Data asli tidak terganggu ===");
  check("site_settings tetap utuh", afterLec.siteContent.site_settings.establishedDate, "10 Ramadhani 1439 H / 25 Mei 2018 M");
  checkTruthy(
    "visi tetap utuh",
    String(afterLec.siteContent.site_settings.visi).includes("Mencetak ulama yang berkarakter")
  );
  check("DeMa tetap 24 anggota", afterLec.siteContent.dema_settings.members.length, 24);
  check("Divisi DeMa tetap 8", afterLec.siteContent.dema_settings.divisions.length, 8);
  check("Ketua DeMa tetap IMRAN", afterLec.siteContent.dema_settings.members[0].name, "IMRAN");
  check("collections masyayikh tidak dihapus", afterLec.collections.filter((r) => r.collection_type === "masyayikh").length, realLecturers.length);
  check("collections sarana tidak dihapus", afterLec.collections.filter((r) => r.collection_type === "sarana").length, realFacilities.length);

  // ══ 5. Backup & rollback ═══════════════════════════════════════════════
  console.log("\n=== 5. Backup otomatis & rollback 1 klik ===");
  const oneRowCsv = toCsv(
    ["Nama Lengkap", "Gelar & Jabatan", "Nomor Urut", "Status Aktif"],
    [[realLecturers[0].data.name, realLecturers[0].data.title, "1", "Aktif"]]
  );
  const syncSecond = await post({ action: "sync", module: "masyayikh", csvContent: oneRowCsv });
  check("sinkron kedua → 1 baris", syncSecond.json.count, 1);

  const afterSecond = await state();
  checkTruthy("backup_before_sync_masyayikh terbentuk", Boolean(afterSecond.siteContent.backup_before_sync_masyayikh), "backup kosong");
  check(
    "backup menyimpan versi sebelumnya (2 baris)",
    afterSecond.siteContent.backup_before_sync_masyayikh.previous.items.length,
    realLecturers.length
  );

  const rollback = await post({ action: "rollback", module: "masyayikh" });
  check("rollback 200", rollback.status, 200);
  const afterRollback = await state();
  check("data dipulihkan ke 2 baris", afterRollback.siteContent.masyayikh_list.items.length, realLecturers.length);
  check("alias ikut dipulihkan", afterRollback.siteContent.lecturers_data.items.length, realLecturers.length);

  // ══ 6. Kurikulum ══════════════════════════════════════════════════════
  console.log("\n=== 6. Kurikulum & Mata Kuliah ===");
  const syncKur = await post({ action: "sync", module: "kurikulum", csvContent: kurikulumCsv });
  check("status 200", syncKur.status, 200);
  check("4 matkul valid (1 baris rusak dilewati)", syncKur.json.count, 4);
  checkTruthy("ada peringatan baris dilewati", (syncKur.json.warnings || []).length > 0, JSON.stringify(syncKur.json.warnings));

  const afterKur = await state();
  const items = afterKur.siteContent.courses_list.items;
  check("courses_list terbentuk", items.length, 4);
  check("alias courses_data terbentuk", afterKur.siteContent.courses_data.items.length, 4);
  check("semester dikelompokkan", items.map((c) => c.semester), [1, 1, 3, 5]);
  check("kode matkul tersimpan", items[0].code, "MK-101");
  check("sifat Pilihan", items.find((c) => c.code === "MK-302").type, "Pilihan");
  check("kitab rujukan → mainBook", items[0].mainBook, "Al-Waraqat & Syarah Al-Mahalli");

  // ══ 7. Sarana ═════════════════════════════════════════════════════════
  console.log("\n=== 7. Sarana & Prasarana ===");
  const syncSar = await post({ action: "sync", module: "sarana", csvContent: saranaCsv });
  check("status 200", syncSar.status, 200);
  check("jumlah sarana", syncSar.json.count, realFacilities.length);
  const afterSar = await state();
  check("sarana_list terbentuk", afterSar.siteContent.sarana_list.items.length, realFacilities.length);
  check("alias facilities_data", afterSar.siteContent.facilities_data.items.length, realFacilities.length);
  check("kapasitas tersimpan", afterSar.siteContent.sarana_list.items[0].capacity, "500 Mahasantri");

  // ══ 8. DeMa (merge aman) ══════════════════════════════════════════════
  console.log("\n=== 8. DeMa — merge tanpa merusak divisi ===");
  const syncDema = await post({ action: "sync", module: "dema", csvContent: demaCsv });
  check("status 200", syncDema.status, 200);
  check("2 pengurus", syncDema.json.count, 2);

  const afterDema = await state();
  check("members diperbarui", afterDema.siteContent.dema_settings.members.length, 2);
  check("divisi TETAP 8", afterDema.siteContent.dema_settings.divisions.length, 8);
  check(
    "periodTitle tidak hilang",
    afterDema.siteContent.dema_settings.periodTitle,
    realDema.periodTitle
  );
  check("foto DeMa jadi CDN", afterDema.siteContent.dema_settings.members[0].photoUrl.startsWith("https://lh3.googleusercontent.com/d/"), true);
  check("meta.lastSync ada", Boolean(afterDema.siteContent.dema_settings.lastSync), true);

  const demaRollback = await post({ action: "rollback", module: "dema" });
  check("rollback DeMa 200", demaRollback.status, 200);
  const afterDemaRollback = await state();
  check("24 anggota DeMa kembali", afterDemaRollback.siteContent.dema_settings.members.length, 24);
  check("Ketua kembali IMRAN", afterDemaRollback.siteContent.dema_settings.members[0].name, "IMRAN");

  // ══ 9. Ketahanan / pesan galat ════════════════════════════════════════
  console.log("\n=== 9. Penanganan galat ===");
  const emptyCsv = await post({ action: "sync", module: "masyayikh", csvContent: "Nama Lengkap,Gelar & Jabatan\r\n" });
  check("CSV tanpa data → 400", emptyCsv.status, 400);
  checkTruthy("pesan menyarankan template", /template/i.test(emptyCsv.json.error || ""), emptyCsv.json.error);

  const wrongColumns = await post({ action: "sync", module: "masyayikh", csvContent: "Gelar,Jabatan\r\nMudir,Senior\r\n" });
  check("kolom wajib hilang → 400", wrongColumns.status, 400);
  checkTruthy("pesan menyebut kolom wajib", /Nama Lengkap/.test(wrongColumns.json.error || ""), wrongColumns.json.error);

  const noSource = await post({ action: "sync", module: "masyayikh" });
  check("tanpa sumber data → 400", noSource.status, 400);

  const badUrl = await post({ action: "sync", module: "masyayikh", sheetUrl: "https://example.com/bukan-sheet" });
  check("URL bukan Google Sheets → 400", badUrl.status, 400);

  const privateSheet = await post({
    action: "sync",
    module: "masyayikh",
    sheetUrl: "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
  });
  checkTruthy(
    "URL publik tanpa kolom cocok ditolak dengan pesan jelas",
    privateSheet.status === 400 || privateSheet.status === 502,
    `status ${privateSheet.status}: ${privateSheet.json.error}`
  );

  const status = await fetch(`${BASE}/api/admin/sync/sheets?module=masyayikh`, { headers: AUTH });
  const statusJson = await status.json();
  check("GET status 200", status.status, 200);
  check("status memuat jumlah item", statusJson.data.itemCount, realLecturers.length);
  checkTruthy("status memuat waktu sinkron", Boolean(statusJson.data.syncedAt), JSON.stringify(statusJson.data));

  console.log(`\n──────────────────────────────\n  LULUS: ${pass}   GAGAL: ${fail}\n──────────────────────────────\n`);
  if (fail > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error("Kesalahan tak tertangani:", error);
  process.exitCode = 1;
});
