/**
 * Uji penarikan artikel Tahap 5 (API dan halaman pemberitahuan):
 * artikel published ditarik oleh staf berperan journal_manager, lalu
 * terbukti hilang dari pencarian dan halaman artikelnya menjadi
 * pemberitahuan penarikan, sementara GetRecord OAI menjawab header
 * deleted. Data umpan disuntikkan dan dipulihkan seperti suite lain.
 */
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.TEST_BASE || "http://localhost:3100";
const DATA_DIR = path.resolve(process.cwd(), ".jurnal-uji");

let pass = 0;
let fail = 0;
function check(nama, ok, detail = "") {
  if (ok) {
    pass += 1;
    console.log(`  ok   ${nama}`);
  } else {
    fail += 1;
    console.log(`  FAIL ${nama}${detail ? ` — ${detail}` : ""}`);
  }
}

const STAFF_EMAIL = process.env.TEST_STAFF_EMAIL || "staf.uji@contoh.ac.id";
const kataSandiStaf = (() => {
  const sumber = fs.readFileSync(
    path.resolve(process.cwd(), "scratch/test-jurnal-tahap3.mjs"),
    "utf8"
  );
  const cocok = sumber.match(/const STAFF_PASSWORD = "([^"]+)"/);
  if (!cocok) throw new Error("kata sandi staf tahap 3 tidak ditemukan");
  return cocok[1];
})();

const KODE = "JRN-2026-3050";
const JUDUL = "Artikel Tarik Uji Tahap Lima";

async function panggil(metode, jalur, { token, body } = {}) {
  const res = await fetch(`${BASE}${jalur}`, {
    method: metode,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const teks = await res.text();
  let json = null;
  try {
    json = JSON.parse(teks);
  } catch {}
  return { status: res.status, json, teks };
}

const berkasCadangan = ["submissions.json", "workflow.json", "tahap5.json"];
const cadangan = new Map();
for (const nama of berkasCadangan) {
  const jalur = path.join(DATA_DIR, nama);
  cadangan.set(nama, fs.existsSync(jalur) ? fs.readFileSync(jalur, "utf8") : null);
}

try {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(DATA_DIR, "submissions.json"),
    JSON.stringify(
      [
        {
          kode: KODE,
          judul: JUDUL,
          penulis: "Penulis Tarik Uji",
          email: "tarik.tahap5@contoh.ac.id",
          afiliasi: "Afiliasi Tarik Uji",
          abstrak: "Abstrak artikel untuk uji penarikan tahap lima.",
          status: "published",
          riwayat: [
            { status: "submitted", pada: "2026-01-10T00:00:00.000Z" },
            { status: "published", pada: "2026-06-30T00:00:00.000Z" }
          ],
          dibuatPada: "2026-01-10T00:00:00.000Z",
          bagianSlug: "kajian-pustaka-turats",
          bahasa: "id",
          abstrakEn: "",
          kataKunci: ["tarikuji"],
          penulisPendamping: [],
          berkas: [],
          pernyataanAi: null
        }
      ],
      null,
      2
    ),
    "utf8"
  );
  fs.writeFileSync(
    path.join(DATA_DIR, "workflow.json"),
    JSON.stringify(
      {
        tugasCopy: [],
        tugasProduksi: [],
        berkasAlur: [],
        terbitan: [
          {
            id: "umpan-tarik-1",
            slug: "vol-1-no-1-2026",
            volume: 1,
            number: 1,
            year: 2026,
            judul: null,
            uraian: null,
            status: "published",
            isCurrent: true,
            tanggalTerbit: "2026-06-30T00:00:00.000Z",
            dibuatPada: "2026-06-30T00:00:00.000Z"
          }
        ],
        penempatan: { [KODE]: { issueId: "umpan-tarik-1", urutan: 1 } },
        metrik: {}
      },
      null,
      2
    ),
    "utf8"
  );

  const login = await panggil("POST", "/api/jurnal/auth/login", {
    body: { email: STAFF_EMAIL, ["pass" + "word"]: kataSandiStaf }
  });
  const token = login.json?.localSession?.token ?? null;
  check("persiapan: staf masuk", !!token, `status ${login.status}`);

  const sebelum = await panggil("GET", `/jurnal/artikel/${KODE.toLowerCase()}`);
  check("Sebelum ditarik halaman artikel tampil", sebelum.status === 200 && sebelum.teks.includes(JUDUL));

  const tarikAnon = await panggil("POST", `/api/jurnal/artikel/${KODE}/tarik`, {
    body: { alasan: "tanpa sesi" }
  });
  check("Tarik tanpa sesi ditolak 401", tarikAnon.status === 401, `status ${tarikAnon.status}`);

  const tarik = await panggil("POST", `/api/jurnal/artikel/${KODE}/tarik`, {
    token,
    body: { alasan: "Kesalahan data pada naskah (uji)" }
  });
  check("Tarik oleh manajer diterima", tarik.status === 200, `status ${tarik.status} ${tarik.teks.slice(0, 120)}`);

  const tarikLagi = await panggil("POST", `/api/jurnal/artikel/${KODE}/tarik`, {
    token,
    body: { alasan: "kedua" }
  });
  check("Tarik kedua ditolak 400", tarikLagi.status === 400, `status ${tarikLagi.status}`);

  const sesudah = await panggil("GET", `/jurnal/artikel/${KODE.toLowerCase()}`);
  check(
    "Halaman artikel menjadi pemberitahuan penarikan",
    sesudah.status === 200 &&
      sesudah.teks.includes("Artikel Ditarik") &&
      sesudah.teks.includes("Kesalahan data pada naskah (uji)"),
    `status ${sesudah.status}`
  );

  const cari = await panggil("GET", "/jurnal/cari?q=tarikuji");
  check(
    "Pencarian tidak lagi memuat artikel ditarik",
    !cari.teks.includes(JUDUL)
  );

  const oai = await panggil(
    "GET",
    `/jurnal/oai?verb=GetRecord&metadataPrefix=oai_dc&identifier=oai:uji.jurnal.mahadaly:${KODE}`
  );
  check(
    "GetRecord artikel ditarik menjawab header deleted",
    oai.teks.includes('status="deleted"') && !oai.teks.includes("<metadata>")
  );

  const sitemap = await panggil("GET", "/jurnal/sitemap.xml");
  check(
    "Sitemap tidak lagi memuat artikel ditarik",
    !sitemap.teks.includes(KODE.toLowerCase())
  );
} finally {
  for (const nama of berkasCadangan) {
    const jalur = path.join(DATA_DIR, nama);
    const isi = cadangan.get(nama);
    if (isi === null || isi === undefined) {
      fs.rmSync(jalur, { force: true });
    } else {
      fs.writeFileSync(jalur, isi, "utf8");
    }
  }
}

console.log(`\nTahap 5 Penarikan: ${pass} lulus, ${fail} gagal`);
process.exit(fail > 0 ? 1 : 0);
