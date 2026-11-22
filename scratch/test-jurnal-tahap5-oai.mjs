/**
 * Uji panen OAI-PMH Tahap 5 melawan server hasil build (mode lokal).
 *
 * Skrip menyuntikkan data umpan ke .jurnal-uji (30 artikel published
 * dengan datestamp tersebar, 1 artikel ditarik, 1 artikel belum terbit,
 * 1 terbitan published), menjalankan pemeriksaan semua verb dan kasus
 * galatnya, lalu memulihkan berkas data seperti semula.
 *
 * Bawaan BASE http://localhost:3100 (env TEST_BASE).
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

const BAGIAN = [
  "artikel-penelitian",
  "kajian-pustaka-turats",
  "pemikiran-bahtsul-masail"
];

function buatUmpan() {
  const naskah = [];
  for (let i = 1; i <= 30; i++) {
    const kode = `JRN-2026-${1000 + i}`;
    const tanggal =
      i <= 28
        ? `2026-01-${String(i).padStart(2, "0")}`
        : i === 29
          ? "2026-02-01"
          : "2026-02-02";
    naskah.push({
      kode,
      judul: `Artikel Panen Uji Nomor ${i}`,
      penulis: `Penulis Panen ${i}`,
      email: `panen${i}@contoh.ac.id`,
      afiliasi: "Afiliasi Panen Uji",
      abstrak: `Abstrak artikel panen uji nomor ${i} untuk pemeriksaan OAI-PMH.`,
      status: "published",
      riwayat: [
        { status: "submitted", pada: "2025-12-20T00:00:00.000Z" },
        { status: "published", pada: `${tanggal}T00:00:00.000Z` }
      ],
      dibuatPada: "2025-12-20T00:00:00.000Z",
      bagianSlug: BAGIAN[(i - 1) % 3],
      bahasa: "id",
      abstrakEn: "",
      kataKunci: ["panen", "uji-oai"],
      penulisPendamping: [],
      berkas: [],
      pernyataanAi: null
    });
  }
  naskah.push({
    kode: "JRN-2026-1099",
    judul: "Artikel Panen Ditarik Uji",
    penulis: "Penulis Panen Tarik",
    email: "panen.tarik@contoh.ac.id",
    afiliasi: "Afiliasi Panen Uji",
    abstrak: "Abstrak artikel yang ditarik untuk uji tombstone OAI.",
    status: "published",
    riwayat: [
      { status: "submitted", pada: "2025-12-20T00:00:00.000Z" },
      { status: "published", pada: "2026-01-15T00:00:00.000Z" }
    ],
    dibuatPada: "2025-12-20T00:00:00.000Z",
    bagianSlug: "artikel-penelitian",
    bahasa: "id",
    abstrakEn: "",
    kataKunci: ["panen"],
    penulisPendamping: [],
    berkas: [],
    pernyataanAi: null,
    ditarikPada: "2026-03-05T00:00:00.000Z",
    alasanTarik: "Uji penarikan OAI"
  });
  naskah.push({
    kode: "JRN-2026-1077",
    judul: "Artikel Panen Belum Terbit",
    penulis: "Penulis Panen Proses",
    email: "panen.proses@contoh.ac.id",
    afiliasi: "Afiliasi Panen Uji",
    abstrak: "Abstrak artikel yang masih dalam telaah.",
    status: "review",
    riwayat: [{ status: "submitted", pada: "2026-01-03T00:00:00.000Z" }],
    dibuatPada: "2026-01-03T00:00:00.000Z",
    bagianSlug: "artikel-penelitian",
    bahasa: "id",
    abstrakEn: "",
    kataKunci: ["panen"],
    penulisPendamping: [],
    berkas: [],
    pernyataanAi: null
  });

  const penempatan = {};
  for (let i = 1; i <= 30; i++) {
    penempatan[`JRN-2026-${1000 + i}`] = {
      issueId: "umpan-panen-1",
      urutan: i
    };
  }
  const workflow = {
    tugasCopy: [],
    tugasProduksi: [],
    berkasAlur: [],
    terbitan: [
      {
        id: "umpan-panen-1",
        slug: "vol-9-no-9-panen",
        volume: 9,
        number: 9,
        year: 2026,
        judul: "Terbitan Umpan Panen",
        uraian: null,
        status: "published",
        isCurrent: true,
        tanggalTerbit: "2026-01-01T00:00:00.000Z",
        dibuatPada: "2026-01-01T00:00:00.000Z"
      }
    ],
    penempatan,
    metrik: {}
  };
  return { naskah, workflow };
}

async function oai(query) {
  const res = await fetch(`${BASE}/jurnal/oai?${query}`);
  return { status: res.status, teks: await res.text() };
}

function hitungKemunculan(teks, pola) {
  return (teks.match(new RegExp(pola, "g")) ?? []).length;
}

const berkasCadangan = ["submissions.json", "workflow.json", "tahap5.json"];
const cadangan = new Map();
for (const nama of berkasCadangan) {
  const jalur = path.join(DATA_DIR, nama);
  cadangan.set(nama, fs.existsSync(jalur) ? fs.readFileSync(jalur, "utf8") : null);
}

try {
  const { naskah, workflow } = buatUmpan();
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(DATA_DIR, "submissions.json"),
    JSON.stringify(naskah, null, 2),
    "utf8"
  );
  fs.writeFileSync(
    path.join(DATA_DIR, "workflow.json"),
    JSON.stringify(workflow, null, 2),
    "utf8"
  );

  // Identify
  const identify = await oai("verb=Identify");
  check("Identify menjawab 200", identify.status === 200);
  check(
    "Identify menyatakan deletedRecord persistent",
    identify.teks.includes("<deletedRecord>persistent</deletedRecord>")
  );
  check(
    "Identify memuat nama repositori",
    identify.teks.includes("<repositoryName>")
  );

  // ListMetadataFormats
  const format = await oai("verb=ListMetadataFormats");
  check(
    "ListMetadataFormats memuat oai_dc",
    format.teks.includes("<metadataPrefix>oai_dc</metadataPrefix>")
  );
  const formatId = await oai(
    "verb=ListMetadataFormats&identifier=oai:uji.jurnal.mahadaly:JRN-2026-1001"
  );
  check(
    "ListMetadataFormats dengan identifier sah",
    formatId.teks.includes("oai_dc") && !formatId.teks.includes("<error")
  );
  const formatAsing = await oai(
    "verb=ListMetadataFormats&identifier=oai:uji.jurnal.mahadaly:JRN-2026-5555"
  );
  check(
    "ListMetadataFormats identifier asing idDoesNotExist",
    formatAsing.teks.includes('code="idDoesNotExist"')
  );

  // ListSets
  const sets = await oai("verb=ListSets");
  check(
    "ListSets memuat tiga bagian sebagai set",
    BAGIAN.every((b) => sets.teks.includes(`<setSpec>${b}</setSpec>`))
  );

  // ListIdentifiers dengan resumptionToken (31 rekod: 30 hidup + 1 terhapus)
  const hal1 = await oai("verb=ListIdentifiers&metadataPrefix=oai_dc");
  check(
    "ListIdentifiers halaman 1 berisi 25 kepala",
    hitungKemunculan(hal1.teks, "<header") === 25,
    `dapat ${hitungKemunculan(hal1.teks, "<header")}`
  );
  check(
    "ListIdentifiers halaman 1 completeListSize 31",
    hal1.teks.includes('completeListSize="31"')
  );
  const tokenCocok = hal1.teks.match(
    /<resumptionToken[^>]*>([^<]+)<\/resumptionToken>/
  );
  check("ListIdentifiers halaman 1 memberi resumptionToken", !!tokenCocok);
  const hal2 = await oai(
    `verb=ListIdentifiers&resumptionToken=${encodeURIComponent(tokenCocok?.[1] ?? "")}`
  );
  check(
    "ListIdentifiers halaman 2 berisi 6 kepala",
    hitungKemunculan(hal2.teks, "<header") === 6,
    `dapat ${hitungKemunculan(hal2.teks, "<header")}`
  );
  check(
    "ListIdentifiers halaman 2 token penutup kosong",
    /<resumptionToken[^>]*\/>/.test(hal2.teks) ||
      /<resumptionToken[^>]*><\/resumptionToken>/.test(hal2.teks)
  );
  check(
    "Rekod terhapus tampil sebagai header deleted",
    hal2.teks.includes('status="deleted"') &&
      hal2.teks.includes("JRN-2026-1099")
  );
  check(
    "Artikel belum terbit tidak ikut dipanen",
    !hal1.teks.includes("JRN-2026-1077") && !hal2.teks.includes("JRN-2026-1077")
  );

  // ListRecords selektif from/until
  const rentang = await oai(
    "verb=ListRecords&metadataPrefix=oai_dc&from=2026-01-10&until=2026-01-12"
  );
  check(
    "ListRecords from/until tepat 3 rekod",
    hitungKemunculan(rentang.teks, "<record>") === 3,
    `dapat ${hitungKemunculan(rentang.teks, "<record>")}`
  );
  check(
    "ListRecords memuat dc:title dan dc:creator",
    rentang.teks.includes("<dc:title>Artikel Panen Uji Nomor 10</dc:title>") &&
      rentang.teks.includes("<dc:creator>Penulis Panen 10</dc:creator>")
  );

  // ListRecords per set
  const perSet = await oai(
    "verb=ListRecords&metadataPrefix=oai_dc&set=kajian-pustaka-turats"
  );
  check(
    "ListRecords set kajian tepat 10 rekod",
    hitungKemunculan(perSet.teks, "<record>") === 10,
    `dapat ${hitungKemunculan(perSet.teks, "<record>")}`
  );

  // GetRecord
  const satu = await oai(
    "verb=GetRecord&metadataPrefix=oai_dc&identifier=oai:uji.jurnal.mahadaly:JRN-2026-1001"
  );
  check(
    "GetRecord rekod hidup memuat metadata",
    satu.teks.includes("<dc:title>Artikel Panen Uji Nomor 1</dc:title>")
  );
  const terhapus = await oai(
    "verb=GetRecord&metadataPrefix=oai_dc&identifier=oai:uji.jurnal.mahadaly:JRN-2026-1099"
  );
  check(
    "GetRecord rekod ditarik hanya header deleted",
    terhapus.teks.includes('status="deleted"') &&
      !terhapus.teks.includes("<metadata>")
  );
  const asing = await oai(
    "verb=GetRecord&metadataPrefix=oai_dc&identifier=oai:uji.jurnal.mahadaly:JRN-2026-5555"
  );
  check(
    "GetRecord asing idDoesNotExist",
    asing.teks.includes('code="idDoesNotExist"')
  );

  // Kasus galat baku
  const tanpaVerb = await oai("");
  check("Tanpa verb badVerb", tanpaVerb.teks.includes('code="badVerb"'));
  const verbAneh = await oai("verb=Ngawur");
  check("Verb asing badVerb", verbAneh.teks.includes('code="badVerb"'));
  const tanpaPrefix = await oai("verb=ListRecords");
  check(
    "ListRecords tanpa metadataPrefix badArgument",
    tanpaPrefix.teks.includes('code="badArgument"')
  );
  const prefixAneh = await oai("verb=ListRecords&metadataPrefix=mods");
  check(
    "metadataPrefix asing cannotDisseminateFormat",
    prefixAneh.teks.includes('code="cannotDisseminateFormat"')
  );
  const kosong = await oai(
    "verb=ListRecords&metadataPrefix=oai_dc&from=2030-01-01"
  );
  check(
    "Rentang kosong noRecordsMatch",
    kosong.teks.includes('code="noRecordsMatch"')
  );
  const tokenRusak = await oai(
    "verb=ListRecords&resumptionToken=tokenngawur123"
  );
  check(
    "resumptionToken rusak badArgument",
    tokenRusak.teks.includes('code="badArgument"')
  );
  const tokenCampur = await oai(
    `verb=ListRecords&resumptionToken=${encodeURIComponent(tokenCocok?.[1] ?? "")}&set=artikel-penelitian`
  );
  check(
    "resumptionToken bercampur argumen lain badArgument",
    tokenCampur.teks.includes('code="badArgument"')
  );
  const rentangTerbalik = await oai(
    "verb=ListRecords&metadataPrefix=oai_dc&from=2026-02-01&until=2026-01-01"
  );
  check(
    "from sesudah until badArgument",
    rentangTerbalik.teks.includes('code="badArgument"')
  );
  const fromRusak = await oai(
    "verb=ListRecords&metadataPrefix=oai_dc&from=ngawur"
  );
  check(
    "from rusak badArgument",
    fromRusak.teks.includes('code="badArgument"')
  );
  const getTanpaPrefix = await oai(
    "verb=GetRecord&identifier=oai:uji.jurnal.mahadaly:JRN-2026-1001"
  );
  check(
    "GetRecord tanpa metadataPrefix badArgument",
    getTanpaPrefix.teks.includes('code="badArgument"')
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

console.log(`\nOAI Tahap 5: ${pass} lulus, ${fail} gagal`);
process.exit(fail > 0 ? 1 : 0);
