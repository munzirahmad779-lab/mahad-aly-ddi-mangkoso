// Statistik aktivitas editorial (Tahap Penutup Celah, butir S1 audit
// lanjutan 24 Nov 2026). Dihitung dari tabel peristiwa dan penugasan
// yang sudah ada: putaran menyimpan keputusan dan tanggal putus,
// penugasan menyimpan tenggat dan tanggal serah. Tidak ada tabel baru,
// tidak ada data pribadi pengunjung.
//
// Definisi yang dipakai (ditampilkan apa adanya di panel):
// - Tingkat terima: naskah berstatus copyediting/production/published
//   dibagi seluruh naskah yang sudah berkeputusan akhir alur telaah
//   (kelompok terima + declined).
// - Keputusan pertama: tanggal putus putaran paling awal per naskah.
// - Terbit: entri riwayat berstatus published.

import { listSubmissions } from "./store";
import { keadaanReviewUntukStaf } from "./review-server";

export interface JurnalStatistikEditorialView {
  totalNaskah: number;
  perStatus: Record<string, number>;
  sudahBerkeputusan: number;
  tingkatTerimaPersen: number | null;
  tingkatTolakPersen: number | null;
  medianHariKeputusanPertama: number | null;
  medianHariSampaiTerbit: number | null;
  rataRataUlasanPerNaskah: number | null;
  persenUlasanTepatWaktu: number | null;
  persenUndanganDiterima: number | null;
  totalUndangan: number;
  totalUlasanSelesai: number;
}

function selisihHari(dariIso: string, keIso: string): number | null {
  const a = new Date(dariIso).getTime();
  const b = new Date(keIso).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return null;
  return (b - a) / 86400000;
}

function median(nilai: number[]): number | null {
  if (nilai.length === 0) return null;
  const urut = [...nilai].sort((x, y) => x - y);
  const tengah = Math.floor(urut.length / 2);
  const m =
    urut.length % 2 === 1
      ? urut[tengah]
      : (urut[tengah - 1] + urut[tengah]) / 2;
  return Math.round(m * 10) / 10;
}

export async function ringkasanStatistikEditorial(): Promise<JurnalStatistikEditorialView> {
  const naskah = await listSubmissions();
  const perStatus: Record<string, number> = {};
  for (const n of naskah) {
    perStatus[n.status] = (perStatus[n.status] ?? 0) + 1;
  }
  const diterima =
    (perStatus["copyediting"] ?? 0) +
    (perStatus["production"] ?? 0) +
    (perStatus["published"] ?? 0);
  const ditolak = perStatus["declined"] ?? 0;
  const berkeputusan = diterima + ditolak;

  const hariKeputusan: number[] = [];
  const hariTerbit: number[] = [];
  let totalUndangan = 0;
  let undanganDiterima = 0;
  let ulasanSelesai = 0;
  let ulasanTepatWaktu = 0;
  let ulasanBertenggat = 0;
  let naskahBertelaah = 0;

  for (const n of naskah) {
    const keadaan = await keadaanReviewUntukStaf(n.kode);
    if (keadaan && keadaan.putaran.length > 0) {
      naskahBertelaah += 1;
      const putusan = keadaan.putaran
        .map((p) => p.diputuskanPada)
        .filter((t): t is string => Boolean(t))
        .sort();
      if (putusan.length > 0) {
        const d = selisihHari(n.dibuatPada, putusan[0]);
        if (d !== null) hariKeputusan.push(d);
      }
      for (const p of keadaan.putaran) {
        for (const a of p.penugasan) {
          if (a.status !== "cancelled") {
            totalUndangan += 1;
            if (a.status === "accepted" || a.status === "completed") {
              undanganDiterima += 1;
            }
          }
          if (a.status === "completed") {
            ulasanSelesai += 1;
            if (a.tenggat && a.diserahkanPada) {
              ulasanBertenggat += 1;
              if (new Date(a.diserahkanPada) <= new Date(a.tenggat)) {
                ulasanTepatWaktu += 1;
              }
            }
          }
        }
      }
    }
    const terbit = n.riwayat.find((r) => r.status === "published");
    if (terbit) {
      const d = selisihHari(n.dibuatPada, terbit.pada);
      if (d !== null) hariTerbit.push(d);
    }
  }

  return {
    totalNaskah: naskah.length,
    perStatus,
    sudahBerkeputusan: berkeputusan,
    tingkatTerimaPersen:
      berkeputusan > 0
        ? Math.round((diterima / berkeputusan) * 1000) / 10
        : null,
    tingkatTolakPersen:
      berkeputusan > 0
        ? Math.round((ditolak / berkeputusan) * 1000) / 10
        : null,
    medianHariKeputusanPertama: median(hariKeputusan),
    medianHariSampaiTerbit: median(hariTerbit),
    rataRataUlasanPerNaskah:
      naskahBertelaah > 0
        ? Math.round((ulasanSelesai / naskahBertelaah) * 100) / 100
        : null,
    persenUlasanTepatWaktu:
      ulasanBertenggat > 0
        ? Math.round((ulasanTepatWaktu / ulasanBertenggat) * 1000) / 10
        : null,
    persenUndanganDiterima:
      totalUndangan > 0
        ? Math.round((undanganDiterima / totalUndangan) * 1000) / 10
        : null,
    totalUndangan,
    totalUlasanSelesai: ulasanSelesai
  };
}
