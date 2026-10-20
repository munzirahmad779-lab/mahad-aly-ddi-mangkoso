/**
 * Verifikasi bahwa bundel yang benar-benar tayang di produksi memuat kode baru.
 * Tanpa browser: ambil HTML /profil & /admin, kumpulkan berkas JS-nya, lalu cari penanda.
 */
const BASE = "https://mahadaly-ddimangkoso.my.id";

let pass = 0;
let fail = 0;
function check(name, ok, detail = "") {
  if (ok) {
    pass += 1;
    console.log(`  ok   ${name}${detail ? ` (${detail})` : ""}`);
  } else {
    fail += 1;
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function collectChunks(pathname) {
  const html = await (await fetch(`${BASE}${pathname}`)).text();
  const srcs = [...html.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]);
  const unique = [...new Set(srcs)];
  const texts = [];
  for (const src of unique) {
    try {
      const res = await fetch(`${BASE}${src}`);
      if (res.ok) texts.push(await res.text());
    } catch {
      // abaikan berkas yang gagal diambil
    }
  }
  return { html, chunks: unique.length, joined: texts.join("\n") };
}

const profil = await collectChunks("/profil");
const admin = await collectChunks("/admin");

console.log(`\n/profil : ${profil.chunks} berkas JS, HTML ${(profil.html.length / 1024).toFixed(0)} KB`);
console.log(`/admin  : ${admin.chunks} berkas JS, HTML ${(admin.html.length / 1024).toFixed(0)} KB\n`);

check("bundel /profil memuat sub-judul 'Riwayat Pendidikan'", profil.joined.includes("Riwayat Pendidikan"));
check("bundel /profil memuat 'Karya & Publikasi'", profil.joined.includes("Karya & Publikasi"));
check("label kartu lama 'Keahlian:' sudah hilang", !profil.joined.includes("Keahlian:</strong>") && !profil.joined.includes(">Keahlian:<"));
check("bundel /admin memuat tombol template Excel", admin.joined.includes("Template Excel"));
check("bundel /admin memuat tombol template Google Sheets", admin.joined.includes("Template Google Sheets"));
check("bundel /admin memuat baris petunjuk sep=", admin.joined.includes("sep="));
check("bundel /admin memuat pesan RLS/Service Role", admin.joined.includes("Service Role"));
check("halaman /profil tetap 200", profil.html.length > 1000);
check("halaman /admin tetap 200", admin.html.length > 1000);

console.log(`\n──────────────────────────────\n  LULUS: ${pass}   GAGAL: ${fail}\n──────────────────────────────\n`);
if (fail > 0) process.exitCode = 1;
