// ─────────────────────────────────────────────────────────────────────────────
// Backend alur Tahap 4 MODE LOKAL — SERVER ONLY.
//
// Menyimpan tugas copyediting, tugas produksi, metadata berkas tahap,
// terbitan, penempatan artikel, dan metrik harian di
// .jurnal-uji/workflow.json (lihat store-local.ts), akun petugas dari
// daftar akun uji lokal, dan artikel publik dari catatan naskah lokal.
// ─────────────────────────────────────────────────────────────────────────────

import { randomUUID } from "crypto";
import {
  daftarSemuaAkunLokal,
  listLokal,
  muatDataAlurLokal,
  simpanDataAlurLokal,
  type BerkasAlurLokal,
  type TugasCopyLokal,
  type TugasProduksiLokal
} from "./store-local";
import type {
  AlurBackend,
  ArtikelPublikInternal,
  BerkasAlurInternal,
  PenempatanInternal,
  TerbitanInternal,
  TugasCopyInternal,
  TugasProduksiInternal
} from "./alur-internal";

function tugasCopyKeInternal(t: TugasCopyLokal): TugasCopyInternal {
  return {
    id: t.id,
    kode: t.kode,
    copyeditorUserId: null,
    copyeditorEmail: t.copyeditorEmail,
    copyeditorNama: t.copyeditorNama,
    ditugaskanOleh: t.ditugaskanOleh,
    status: t.status as TugasCopyInternal["status"],
    catatan: t.catatan,
    berkasHasilId: t.berkasHasilId,
    persetujuanPenulisPada: t.persetujuanPenulisPada,
    dibuatPada: t.dibuatPada,
    selesaiPada: t.selesaiPada
  };
}

function tugasProduksiKeInternal(t: TugasProduksiLokal): TugasProduksiInternal {
  return {
    id: t.id,
    kode: t.kode,
    layoutUserId: null,
    layoutEmail: t.layoutEmail,
    layoutNama: t.layoutNama,
    ditugaskanOleh: t.ditugaskanOleh,
    status: t.status as TugasProduksiInternal["status"],
    catatan: t.catatan,
    proofStatus: t.proofStatus,
    proofCatatan: t.proofCatatan,
    proofPada: t.proofPada,
    siapPada: t.siapPada,
    dibuatPada: t.dibuatPada
  };
}

function berkasKeInternal(b: BerkasAlurLokal): BerkasAlurInternal {
  return {
    id: b.id,
    kode: b.kode,
    tahap: b.tahap,
    jenis: b.jenis,
    namaAsli: b.namaAsli,
    mime: b.mime,
    ukuran: b.ukuran,
    bucket: b.bucket,
    kunci: b.kunci,
    diunggahOleh: b.diunggahOleh,
    diunggahPada: b.diunggahPada
  };
}

function terbitanKeInternal(
  t: Awaited<ReturnType<typeof muatDataAlurLokal>>["terbitan"][number]
): TerbitanInternal {
  return {
    id: t.id,
    slug: t.slug,
    volume: t.volume,
    number: t.number,
    year: t.year,
    judul: t.judul,
    uraian: t.uraian,
    status: t.status,
    isCurrent: t.isCurrent,
    tanggalTerbit: t.tanggalTerbit,
    dibuatPada: t.dibuatPada
  };
}

function tanggalHariIni(): string {
  return new Date().toISOString().slice(0, 10);
}

export const alurBackendLokal: AlurBackend = {
  async daftarPetugas(peran) {
    const akun = await daftarSemuaAkunLokal();
    return akun
      .filter((a) => a.peran.includes(peran))
      .map((a) => ({
        userId: null,
        email: a.email,
        nama: a.nama,
        afiliasi: a.afiliasi
      }))
      .sort((a, b) => a.email.localeCompare(b.email));
  },

  async ambilTugasCopy(kode) {
    const data = await muatDataAlurLokal();
    const target = kode.trim().toUpperCase();
    return data.tugasCopy
      .filter((t) => t.kode === target)
      .map(tugasCopyKeInternal)
      .sort((a, b) => (a.dibuatPada < b.dibuatPada ? -1 : 1));
  },

  async buatTugasCopy({ kode, petugas, ditugaskanOleh, catatan }) {
    const data = await muatDataAlurLokal();
    const baru: TugasCopyLokal = {
      id: randomUUID(),
      kode: kode.trim().toUpperCase(),
      copyeditorEmail: petugas.email.toLowerCase(),
      copyeditorNama: petugas.nama,
      ditugaskanOleh,
      status: "assigned",
      catatan,
      berkasHasilId: null,
      persetujuanPenulisPada: null,
      dibuatPada: new Date().toISOString(),
      selesaiPada: null
    };
    data.tugasCopy.push(baru);
    await simpanDataAlurLokal();
    return tugasCopyKeInternal(baru);
  },

  async ubahTugasCopy(id, patch) {
    const data = await muatDataAlurLokal();
    const target = data.tugasCopy.find((t) => t.id === id);
    if (!target) throw new Error("Tugas copyediting tidak ditemukan.");
    if (patch.status !== undefined) target.status = patch.status;
    if (patch.berkasHasilId !== undefined) {
      target.berkasHasilId = patch.berkasHasilId;
    }
    if (patch.persetujuanPenulisPada !== undefined) {
      target.persetujuanPenulisPada = patch.persetujuanPenulisPada;
    }
    if (patch.selesaiPada !== undefined) target.selesaiPada = patch.selesaiPada;
    await simpanDataAlurLokal();
  },

  async ambilTugasProduksi(kode) {
    const data = await muatDataAlurLokal();
    const target = kode.trim().toUpperCase();
    return data.tugasProduksi
      .filter((t) => t.kode === target)
      .map(tugasProduksiKeInternal)
      .sort((a, b) => (a.dibuatPada < b.dibuatPada ? -1 : 1));
  },

  async buatTugasProduksi({ kode, petugas, ditugaskanOleh, catatan }) {
    const data = await muatDataAlurLokal();
    const baru: TugasProduksiLokal = {
      id: randomUUID(),
      kode: kode.trim().toUpperCase(),
      layoutEmail: petugas.email.toLowerCase(),
      layoutNama: petugas.nama,
      ditugaskanOleh,
      status: "assigned",
      catatan,
      proofStatus: "menunggu",
      proofCatatan: null,
      proofPada: null,
      siapPada: null,
      dibuatPada: new Date().toISOString()
    };
    data.tugasProduksi.push(baru);
    await simpanDataAlurLokal();
    return tugasProduksiKeInternal(baru);
  },

  async ubahTugasProduksi(id, patch) {
    const data = await muatDataAlurLokal();
    const target = data.tugasProduksi.find((t) => t.id === id);
    if (!target) throw new Error("Tugas produksi tidak ditemukan.");
    if (patch.status !== undefined) target.status = patch.status;
    if (patch.proofStatus !== undefined) target.proofStatus = patch.proofStatus;
    if (patch.proofCatatan !== undefined) {
      target.proofCatatan = patch.proofCatatan;
    }
    if (patch.proofPada !== undefined) target.proofPada = patch.proofPada;
    if (patch.siapPada !== undefined) target.siapPada = patch.siapPada;
    await simpanDataAlurLokal();
  },

  async simpanBerkasAlur({ kode, tahap, jenis, berkas, diunggahOleh }) {
    const data = await muatDataAlurLokal();
    const target = kode.trim().toUpperCase();
    // Galley per jenis bersifat tunggal: unggahan baru menggantikan
    // galley lama jenis yang sama (mis. sesudah penulis meminta koreksi).
    if (tahap === "galley") {
      data.berkasAlur = data.berkasAlur.filter(
        (b) => !(b.kode === target && b.jenis === jenis)
      );
    }
    const baru: BerkasAlurLokal = {
      id: randomUUID(),
      kode: target,
      tahap,
      jenis,
      kategori: berkas.kategori,
      namaAsli: berkas.namaAsli,
      mime: berkas.mime,
      ukuran: berkas.ukuran,
      bucket: berkas.bucket,
      kunci: berkas.kunci,
      diunggahOleh,
      diunggahPada: new Date().toISOString()
    };
    data.berkasAlur.push(baru);
    await simpanDataAlurLokal();
    return berkasKeInternal(baru);
  },

  async ambilBerkasAlur(kode) {
    const data = await muatDataAlurLokal();
    const target = kode.trim().toUpperCase();
    return data.berkasAlur
      .filter((b) => b.kode === target)
      .map(berkasKeInternal)
      .sort((a, b) => (a.diunggahPada < b.diunggahPada ? -1 : 1));
  },

  async daftarTerbitan() {
    const data = await muatDataAlurLokal();
    return data.terbitan
      .map(terbitanKeInternal)
      .sort((a, b) => (a.dibuatPada < b.dibuatPada ? 1 : -1));
  },

  async ambilTerbitanBySlug(slug) {
    const data = await muatDataAlurLokal();
    const target = data.terbitan.find(
      (t) => t.slug === slug.trim().toLowerCase()
    );
    return target ? terbitanKeInternal(target) : null;
  },

  async buatTerbitan(input) {
    const data = await muatDataAlurLokal();
    const baru = {
      id: randomUUID(),
      slug: input.slug,
      volume: input.volume,
      number: input.number,
      year: input.year,
      judul: input.judul,
      uraian: input.uraian,
      status: "draft" as const,
      isCurrent: false,
      tanggalTerbit: null,
      dibuatPada: new Date().toISOString()
    };
    data.terbitan.push(baru);
    await simpanDataAlurLokal();
    return terbitanKeInternal(baru);
  },

  async ubahTerbitan(id, patch) {
    const data = await muatDataAlurLokal();
    const target = data.terbitan.find((t) => t.id === id);
    if (!target) throw new Error("Terbitan tidak ditemukan.");
    if (patch.isCurrent === true) {
      for (const t of data.terbitan) t.isCurrent = false;
    }
    if (patch.volume !== undefined) target.volume = patch.volume;
    if (patch.number !== undefined) target.number = patch.number;
    if (patch.year !== undefined) target.year = patch.year;
    if (patch.judul !== undefined) target.judul = patch.judul;
    if (patch.uraian !== undefined) target.uraian = patch.uraian;
    if (patch.status !== undefined) target.status = patch.status;
    if (patch.isCurrent !== undefined) target.isCurrent = patch.isCurrent;
    if (patch.tanggalTerbit !== undefined) {
      target.tanggalTerbit = patch.tanggalTerbit;
    }
    await simpanDataAlurLokal();
  },

  async ambilPenempatanSemua() {
    const data = await muatDataAlurLokal();
    return Object.entries(data.penempatan).map<PenempatanInternal>(
      ([kode, p]) => ({ kode, issueId: p.issueId, urutan: p.urutan })
    );
  },

  async tetapkanPenempatan(kode, issueId, urutan) {
    const data = await muatDataAlurLokal();
    data.penempatan[kode.trim().toUpperCase()] = { issueId, urutan };
    await simpanDataAlurLokal();
  },

  async hapusPenempatan(kode) {
    const data = await muatDataAlurLokal();
    delete data.penempatan[kode.trim().toUpperCase()];
    await simpanDataAlurLokal();
  },

  async catatMetrik(kode, jenis) {
    const data = await muatDataAlurLokal();
    const target = kode.trim().toUpperCase();
    const tanggal = tanggalHariIni();
    const perKode = data.metrik[target] ?? {};
    const hari = perKode[tanggal] ?? { views: 0, downloads: 0 };
    hari[jenis] += 1;
    perKode[tanggal] = hari;
    data.metrik[target] = perKode;
    await simpanDataAlurLokal();
  },

  async daftarArtikelPublik() {
    const [daftar, data] = await Promise.all([listLokal(), muatDataAlurLokal()]);
    const hasil: ArtikelPublikInternal[] = [];
    for (const n of daftar) {
      if (n.status !== "published") continue;
      const penempatan = data.penempatan[n.kode];
      const galley = data.berkasAlur
        .filter((b) => b.kode === n.kode && b.tahap === "galley")
        .map((b) => ({
          jenis: (b.jenis === "galley_html" ? "html" : "pdf") as
            | "pdf"
            | "html",
          bucket: b.bucket,
          kunci: b.kunci,
          mime: b.mime
        }));
      hasil.push({
        kode: n.kode,
        judul: n.judul,
        penulis: [
          {
            nama: n.penulis,
            afiliasi: n.afiliasi,
            orcid: null
          },
          ...(n.penulisPendamping ?? []).map((p) => ({
            nama: p.nama,
            afiliasi: p.afiliasi,
            orcid: p.orcid ?? null
          }))
        ],
        afiliasiUtama: n.afiliasi,
        bagianSlug: n.bagianSlug ?? null,
        abstrak: n.abstrak,
        abstrakEn: n.abstrakEn ?? "",
        kataKunci: n.kataKunci ?? [],
        halaman: null,
        bahasa: n.bahasa ?? "id",
        doi: null,
        lisensi: "CC BY 4.0",
        pernyataanAi: n.pernyataanAi ?? null,
        issueId: penempatan?.issueId ?? null,
        urutan: penempatan?.urutan ?? 0,
        galley
      });
    }
    return hasil;
  }
};
