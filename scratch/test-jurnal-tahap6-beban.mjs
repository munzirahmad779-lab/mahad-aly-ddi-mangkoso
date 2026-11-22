/**
 * Uji beban kewajaran Tahap 6: halaman publik dan panen OAI dipukul
 * bersamaan dalam jumlah terukur melawan server hasil build port 3100
 * (mode lokal, satu proses Node di VM bersama). Angka yang dilaporkan
 * adalah waktu tanggap apa adanya: indikatif untuk lingkungan VM ini,
 * BUKAN angka kapasitas produksi.
 */
const BASE = process.env.TEST_BASE || "http://localhost:3100";
const PER_JALUR = Number(process.env.LOAD_N || 30);
const KONKUREN = Number(process.env.LOAD_C || 10);

const JALUR = [
  ["beranda /jurnal", "/jurnal"],
  ["pencarian /jurnal/cari?q=fiqh", "/jurnal/cari?q=fiqh"],
  ["pengumuman /jurnal/pengumuman", "/jurnal/pengumuman"],
  ["OAI Identify", "/jurnal/oai?verb=Identify"],
  ["OAI ListRecords", "/jurnal/oai?verb=ListRecords&metadataPrefix=oai_dc"],
  ["sitemap /jurnal/sitemap.xml", "/jurnal/sitemap.xml"]
];

async function pukul(url) {
  const t0 = performance.now();
  try {
    const res = await fetch(`${BASE}${url}`);
    await res.arrayBuffer();
    return { ms: performance.now() - t0, status: res.status };
  } catch (e) {
    return { ms: performance.now() - t0, status: 0, galat: String(e) };
  }
}

async function jalankanJalur(nama, url, jumlah, konkuren) {
  const hasil = [];
  let indeks = 0;
  async function pekerja() {
    while (indeks < jumlah) {
      indeks += 1;
      hasil.push(await pukul(url));
    }
  }
  const t0 = performance.now();
  await Promise.all(Array.from({ length: konkuren }, pekerja));
  const totalMs = performance.now() - t0;
  const ms = hasil.map((h) => h.ms).sort((a, b) => a - b);
  const sukses = hasil.filter((h) => h.status === 200).length;
  const rata = ms.reduce((a, b) => a + b, 0) / ms.length;
  const p95 = ms[Math.min(ms.length - 1, Math.floor(ms.length * 0.95))];
  return {
    nama,
    jumlah: hasil.length,
    sukses,
    rataMs: Math.round(rata),
    p95Ms: Math.round(p95),
    maksMs: Math.round(ms[ms.length - 1]),
    totalDetik: (totalMs / 1000).toFixed(1),
    rps: (hasil.length / (totalMs / 1000)).toFixed(1)
  };
}

// Semua jalur berjalan bersamaan (antar jalur pun paralel), supaya
// bebannya campuran seperti panen dan kunjungan yang datang serentak.
const hasil = await Promise.all(
  JALUR.map(([nama, url]) => jalankanJalur(nama, url, PER_JALUR, KONKUREN))
);
console.log(
  `Uji beban: ${PER_JALUR} permintaan per jalur, konkurensi ${KONKUREN} per jalur, ${JALUR.length} jalur serentak.`
);
for (const h of hasil) {
  console.log(
    `  ${h.nama}: ${h.sukses}/${h.jumlah} status 200, rata-rata ${h.rataMs} ms, p95 ${h.p95Ms} ms, maks ${h.maksMs} ms, ${h.rps} req/detik`
  );
}
const semuaSukses = hasil.every((h) => h.sukses === h.jumlah);
console.log(semuaSukses ? "BEBAN: semua permintaan menjawab 200." : "BEBAN: ada permintaan gagal.");
process.exitCode = semuaSukses ? 0 : 1;
