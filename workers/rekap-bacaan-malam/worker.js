// Worker cron rekap bacaan web Ma'had Aly (perintah user 26 Nov 2026:
// web mengotomatisasi sendiri rekap bacaan tiap tengah malam;
// 27 Nov 2026 ditambah rekap email pagi, menggantikan skrip luar di
// VM Muse).
//
// Worker kecil TERPISAH dari aplikasi Next.js, meniru pola
// workers/pengingat-reviewer: Cron Trigger adalah fitur Workers.
// Tugasnya hanya memanggil rute internal situs dengan rahasia
// bersama; seluruh logika rekap dan idempotensi tinggal di aplikasi
// Next.js (src/lib/analytics/rekap-malam.ts dan rekap-email.ts).
//
// Dua jadwal (UTC; WITA = UTC+8):
//   "0 16 * * *" = 00:00 WITA -> snapshot bacaan tengah malam
//   "0 22 * * *" = 06:00 WITA -> rekap email pagi
// Cabang dipilih dari event.cron supaya satu Worker melayani dua
// jadwal tanpa tumpang tindih.
//
// Pasang (akun Cloudflare Munzir):
//   1. Isi nama Worker dan jadwal di wrangler.toml folder ini.
//   2. Buat secret:  wrangler secret put REKAP_CRON_SECRET
//      Nilainya harus sama persis dengan env REKAP_CRON_SECRET pada
//      Worker situs utama. Nilai tidak pernah ditulis di berkas ini.
//   3. wrangler deploy

export default {
  async scheduled(event, env, ctx) {
    const urlEmail =
      env.TARGET_URL_EMAIL ||
      "https://mahadaly-ddimangkoso.ac.id/api/analytics/internal/rekap-email";
    const urlMalam =
      env.TARGET_URL ||
      "https://mahadaly-ddimangkoso.ac.id/api/analytics/internal/rekap-malam";
    const url = event.cron === "0 22 * * *" ? urlEmail : urlMalam;
    const kirim = fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.REKAP_CRON_SECRET}` }
    }).then(async (res) => {
      const badan = await res.text();
      console.log(`Rekap terjadwal (${event.cron}): HTTP ${res.status} ${badan.slice(0, 300)}`);
      if (!res.ok) throw new Error(`Rute rekap menjawab ${res.status}`);
    });
    ctx.waitUntil(kirim);
  }
};
