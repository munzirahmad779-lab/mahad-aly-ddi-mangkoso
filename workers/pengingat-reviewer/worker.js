// Worker cron pengingat tenggat reviewer jurnal (Tahap Penutup Celah).
//
// Worker kecil TERPISAH dari aplikasi Next.js, sesuai rancangan audit
// lanjutan 24 Nov 2026: Cron Trigger adalah fitur Workers. Tugasnya
// hanya memanggil rute internal jurnal sekali sehari dengan rahasia
// bersama; seluruh logika tahap dan idempotensi tinggal di aplikasi.
//
// Pasang (sesudah go-live, akun Cloudflare Munzir):
//   1. Isi nama Worker dan jadwal di wrangler.toml folder ini.
//   2. Buat secret:  wrangler secret put CRON_SECRET
//      Nilainya harus sama persis dengan env JURNAL_CRON_SECRET pada
//      Worker situs utama. Nilai tidak pernah ditulis di berkas ini.
//   3. wrangler deploy
// Cron berjalan dalam UTC: "0 1 * * *" = 01:00 UTC = 09:00 WITA.

export default {
  async scheduled(event, env, ctx) {
    const url =
      env.TARGET_URL ||
      "https://mahadaly-ddimangkoso.ac.id/api/jurnal/internal/pengingat";
    const kirim = fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.CRON_SECRET}` }
    }).then(async (res) => {
      const badan = await res.text();
      console.log(`Pengingat jurnal: HTTP ${res.status} ${badan.slice(0, 300)}`);
      if (!res.ok) throw new Error(`Rute pengingat menjawab ${res.status}`);
    });
    ctx.waitUntil(kirim);
  }
};
