// Worker cron rekap bacaan malam web Ma'had Aly (perintah user
// 26 Nov 2026: web mengotomatisasi sendiri rekap bacaan tiap tengah
// malam).
//
// Worker kecil TERPISAH dari aplikasi Next.js, meniru pola
// workers/pengingat-reviewer: Cron Trigger adalah fitur Workers.
// Tugasnya hanya memanggil rute internal situs sekali sehari dengan
// rahasia bersama; seluruh logika rekap dan idempotensi tinggal di
// aplikasi Next.js (src/lib/analytics/rekap-malam.ts).
//
// Pasang (akun Cloudflare Munzir):
//   1. Isi nama Worker dan jadwal di wrangler.toml folder ini.
//   2. Buat secret:  wrangler secret put REKAP_CRON_SECRET
//      Nilainya harus sama persis dengan env REKAP_CRON_SECRET pada
//      Worker situs utama. Nilai tidak pernah ditulis di berkas ini.
//   3. wrangler deploy
// Cron berjalan dalam UTC: "0 16 * * *" = 16:00 UTC = 00:00 WITA.

export default {
  async scheduled(event, env, ctx) {
    const url =
      env.TARGET_URL ||
      "https://mahadaly-ddimangkoso.ac.id/api/analytics/internal/rekap-malam";
    const kirim = fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.REKAP_CRON_SECRET}` }
    }).then(async (res) => {
      const badan = await res.text();
      console.log(`Rekap bacaan malam: HTTP ${res.status} ${badan.slice(0, 300)}`);
      if (!res.ok) throw new Error(`Rute rekap malam menjawab ${res.status}`);
    });
    ctx.waitUntil(kirim);
  }
};
