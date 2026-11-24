// ─────────────────────────────────────────────────────────────────────────────
// Fasad alur Tahap 4 jurnal — SERVER ONLY.
//
// Aturan bisnis copyediting, produksi, dan terbitan ditegakkan di sini,
// di atas backend lokal atau Supabase (dipilih menurut mode data fasad
// store), mengikuti pola fasad review-server.ts Tahap 3:
// - Copyediting: editor membuat tugas untuk copyeditor terdaftar atau
//   untuk dirinya sendiri; petugas mengunggah berkas hasil sunting;
//   penulis menyetujui dari Naskah Saya; perpindahan ke production
//   berjalan lewat tabel transisi status yang ada.
// - Produksi: tugas layout membuat galley PDF dan HTML; sesudah kedua
//   galley ada, penulis mem-proofread (setujui atau minta koreksi);
//   editor menandai siap terbit hanya sesudah proof disetujui.
// - Terbitan: staf membuat terbitan, menetapkan artikel berstatus
//   production dengan urutan daftar isi, dan menerbitkan; penerbitan
//   menggerakkan artikel ke published lewat tabel transisi dan mengisi
//   tanggal terbit.
// - Publik: hanya artikel published di dalam terbitan published yang
//   pernah keluar dari fungsi publik di berkas ini.
// Setiap peristiwa dicatat ke linimasa naskah lewat fasad store.
// ─────────────────────────────────────────────────────────────────────────────

import {
  catatPeristiwaNaskah,
  getJurnalDataMode,
  getSubmission,
  listSubmissions,
  updateSubmissionStatus
} from "./store";
import { labelBagian, type JurnalBerkasMeta } from "./wizard";
import {
  JURNAL_COPY_TASK_LABEL_ID,
  JURNAL_ISSUE_STATUS_LABEL_ID,
  JURNAL_PRODUCTION_TASK_LABEL_ID,
  JURNAL_PROOF_LABEL_ID,
  labelTerbitan,
  slugDariKode,
  type JurnalAlurPenulisView,
  type JurnalArtikelPublik,
  type JurnalGalleyJenis,
  type JurnalPetugasOption,
  type JurnalTerbitanPublik,
  type JurnalTerbitanView,
  type JurnalTugasCopyView,
  type JurnalTugasProduksiView
} from "./alur";
import type { AlurBackend, BerkasAlurInternal } from "./alur-internal";
import { alurBackendLokal } from "./alur-local";
import { alurBackendSupabase } from "./alur-supabase";
import {
  notifArtikelTerbit,
  notifPermintaanProofread,
  notifPersetujuanCopyediting
} from "./notifikasi";

async function backend(): Promise<AlurBackend> {
  return (await getJurnalDataMode()) === "supabase"
    ? alurBackendSupabase
    : alurBackendLokal;
}

export interface PelakuAlur {
  userId: string | null;
  email: string;
  nama?: string | null;
}

function labelPelaku(p: PelakuAlur): { userId: string | null; label: string } {
  return { userId: p.userId, label: p.email };
}

const STATUS_AKTIF_COPY = ["assigned", "in_progress", "author_review"];
const STATUS_AKTIF_PRODUKSI = [
  "assigned",
  "galley_ready",
  "proofreading",
  "author_proof"
];

// ── Pilihan petugas ─────────────────────────────────────────────────────

export async function daftarPetugasTahap(
  peran: "copyeditor" | "layout_editor"
): Promise<JurnalPetugasOption[]> {
  return (await backend()).daftarPetugas(peran);
}

async function selesaikanPetugas(
  peran: "copyeditor" | "layout_editor",
  emailDiminta: string | null | undefined,
  actor: PelakuAlur
): Promise<JurnalPetugasOption> {
  const email = (emailDiminta ?? "").trim().toLowerCase();
  if (!email || email === actor.email.toLowerCase()) {
    // Dikerjakan editor sendiri: pelaku staf adalah petugasnya.
    return {
      userId: actor.userId,
      email: actor.email.toLowerCase(),
      nama: actor.nama?.trim() || actor.email,
      afiliasi: ""
    };
  }
  const tersedia = await (await backend()).daftarPetugas(peran);
  const petugas = tersedia.find((p) => p.email.toLowerCase() === email);
  if (!petugas) {
    throw new Error(
      peran === "copyeditor"
        ? "Alamat itu belum terdaftar sebagai copyeditor. Pilih copyeditor yang sudah terdaftar, atau kerjakan sendiri."
        : "Alamat itu belum terdaftar sebagai layout editor. Pilih layout editor yang sudah terdaftar, atau kerjakan sendiri."
    );
  }
  return petugas;
}

// ── Tampilan keadaan alur satu naskah untuk staf ────────────────────────

export interface KeadaanAlurStaf {
  copyediting: JurnalTugasCopyView[];
  produksi: JurnalTugasProduksiView[];
  penempatan: { issueSlug: string; issueLabel: string; urutan: number } | null;
}

function berkasKeView(b: BerkasAlurInternal) {
  return {
    id: b.id,
    jenis: b.jenis,
    namaAsli: b.namaAsli,
    mime: b.mime,
    ukuran: b.ukuran,
    diunggahPada: b.diunggahPada
  };
}

export async function keadaanAlurUntukStaf(
  kode: string
): Promise<KeadaanAlurStaf | null> {
  const b = await backend();
  const naskah = await getSubmission(kode);
  if (!naskah) return null;
  const [tugasCopy, tugasProduksi, berkas, penempatanSemua, terbitan] =
    await Promise.all([
      b.ambilTugasCopy(kode),
      b.ambilTugasProduksi(kode),
      b.ambilBerkasAlur(kode),
      b.ambilPenempatanSemua(),
      b.daftarTerbitan()
    ]);
  const penempatan = penempatanSemua.find(
    (p) => p.kode === kode.trim().toUpperCase()
  );
  const terbitanTujuan = penempatan
    ? terbitan.find((t) => t.id === penempatan.issueId)
    : undefined;
  return {
    copyediting: tugasCopy.map((t) => {
      const hasil =
        berkas.filter((f) => f.tahap === "copyedit").pop() ?? null;
      return {
        id: t.id,
        kode: t.kode,
        status: t.status,
        statusLabel: JURNAL_COPY_TASK_LABEL_ID[t.status],
        copyeditorEmail: t.copyeditorEmail,
        copyeditorNama: t.copyeditorNama,
        catatan: t.catatan,
        berkasHasil:
          t.status !== "assigned" && hasil ? berkasKeView(hasil) : null,
        persetujuanPenulisPada: t.persetujuanPenulisPada,
        dibuatPada: t.dibuatPada,
        selesaiPada: t.selesaiPada
      };
    }),
    produksi: tugasProduksi.map((t) => {
      const pdf =
        berkas.filter((f) => f.jenis === "galley_pdf").pop() ?? null;
      const html =
        berkas.filter((f) => f.jenis === "galley_html").pop() ?? null;
      return {
        id: t.id,
        kode: t.kode,
        status: t.status,
        statusLabel: JURNAL_PRODUCTION_TASK_LABEL_ID[t.status],
        layoutEmail: t.layoutEmail,
        layoutNama: t.layoutNama,
        catatan: t.catatan,
        galleyPdf: pdf ? berkasKeView(pdf) : null,
        galleyHtml: html ? berkasKeView(html) : null,
        proofStatus: t.proofStatus,
        proofLabel: JURNAL_PROOF_LABEL_ID[t.proofStatus],
        proofCatatan: t.proofCatatan,
        proofPada: t.proofPada,
        siapPada: t.siapPada,
        dibuatPada: t.dibuatPada
      };
    }),
    penempatan:
      penempatan && terbitanTujuan
        ? {
            issueSlug: terbitanTujuan.slug,
            issueLabel: labelTerbitan(terbitanTujuan),
            urutan: penempatan.urutan
          }
        : null
  };
}

// ── Copyediting ─────────────────────────────────────────────────────────

export async function buatTugasCopyediting(
  kode: string,
  input: { copyeditorEmail?: string | null; catatan?: string | null },
  actor: PelakuAlur
): Promise<{ id: string }> {
  const b = await backend();
  const naskah = await getSubmission(kode);
  if (!naskah) throw new Error("Naskah tidak ditemukan.");
  if (naskah.status !== "copyediting") {
    throw new Error(
      `Tugas copyediting hanya dibuat saat naskah berstatus copyediting (status sekarang: ${naskah.status}).`
    );
  }
  const ada = await b.ambilTugasCopy(kode);
  if (ada.some((t) => STATUS_AKTIF_COPY.includes(t.status))) {
    throw new Error(
      "Masih ada tugas copyediting yang berjalan untuk naskah ini."
    );
  }
  const petugas = await selesaikanPetugas(
    "copyeditor",
    input.copyeditorEmail,
    actor
  );
  const dibuat = await b.buatTugasCopy({
    kode,
    petugas,
    ditugaskanOleh: actor.userId,
    catatan: input.catatan?.trim() || null
  });
  await catatPeristiwaNaskah(
    kode,
    `Tugas copyediting dibuat untuk ${petugas.nama} (${petugas.email}).`,
    labelPelaku(actor),
    "copyediting_assigned"
  );
  return { id: dibuat.id };
}

export async function daftarkanHasilCopyediting(
  kode: string,
  tugasId: string,
  berkas: JurnalBerkasMeta,
  actor: PelakuAlur,
  actorAdalahStaf: boolean
): Promise<void> {
  const b = await backend();
  const naskah = await getSubmission(kode);
  if (!naskah) throw new Error("Naskah tidak ditemukan.");
  if (naskah.status !== "copyediting") {
    throw new Error("Naskah tidak lagi berada pada tahap copyediting.");
  }
  const tugas = (await b.ambilTugasCopy(kode)).find((t) => t.id === tugasId);
  if (!tugas) throw new Error("Tugas copyediting tidak ditemukan.");
  if (
    !actorAdalahStaf &&
    tugas.copyeditorEmail.toLowerCase() !== actor.email.toLowerCase()
  ) {
    throw new Error("Hanya copyeditor yang ditugaskan yang dapat mengunggah hasil suntingan tugas ini.");
  }
  if (!STATUS_AKTIF_COPY.includes(tugas.status)) {
    throw new Error("Tugas copyediting ini sudah selesai atau dibatalkan.");
  }
  const tersimpan = await b.simpanBerkasAlur({
    kode,
    tahap: "copyedit",
    jenis: "copyedited",
    berkas,
    diunggahOleh: actor.email
  });
  await b.ubahTugasCopy(tugas.id, {
    status: "author_review",
    berkasHasilId: tersimpan.id
  });
  await catatPeristiwaNaskah(
    kode,
    "Hasil copyediting diunggah; menunggu persetujuan penulis.",
    labelPelaku(actor),
    "copyediting_uploaded"
  );
  // Email permintaan persetujuan copyediting ke penulis (Tahap 6).
  await notifPersetujuanCopyediting({
    kode,
    judul: naskah.judul,
    penulis: naskah.penulis,
    email: naskah.email
  });
}

export async function setujuiCopyeditingOlehPenulis(
  kode: string,
  ownerEmail: string
): Promise<void> {
  const b = await backend();
  const naskah = await getSubmission(kode);
  if (!naskah) throw new Error("Naskah tidak ditemukan.");
  if (naskah.email.toLowerCase() !== ownerEmail.toLowerCase()) {
    throw new Error("Naskah ini bukan milik akun Anda.");
  }
  const tugas = (await b.ambilTugasCopy(kode)).find(
    (t) => t.status === "author_review"
  );
  if (!tugas) {
    throw new Error(
      "Tidak ada hasil copyediting yang menunggu persetujuan Anda pada naskah ini."
    );
  }
  const sekarang = new Date().toISOString();
  await b.ubahTugasCopy(tugas.id, {
    status: "completed",
    persetujuanPenulisPada: sekarang,
    selesaiPada: sekarang
  });
  await catatPeristiwaNaskah(
    kode,
    "Penulis menyetujui hasil copyediting.",
    { userId: null, label: ownerEmail },
    "copyediting_author_approved"
  );
}

// ── Produksi ────────────────────────────────────────────────────────────

export async function buatTugasProduksi(
  kode: string,
  input: { layoutEmail?: string | null; catatan?: string | null },
  actor: PelakuAlur
): Promise<{ id: string }> {
  const b = await backend();
  const naskah = await getSubmission(kode);
  if (!naskah) throw new Error("Naskah tidak ditemukan.");
  if (naskah.status !== "production") {
    throw new Error(
      `Tugas produksi hanya dibuat saat naskah berstatus production (status sekarang: ${naskah.status}).`
    );
  }
  const ada = await b.ambilTugasProduksi(kode);
  if (
    ada.some(
      (t) => STATUS_AKTIF_PRODUKSI.includes(t.status) || t.status === "ready"
    )
  ) {
    throw new Error("Masih ada tugas produksi yang berjalan untuk naskah ini.");
  }
  const petugas = await selesaikanPetugas(
    "layout_editor",
    input.layoutEmail,
    actor
  );
  const dibuat = await b.buatTugasProduksi({
    kode,
    petugas,
    ditugaskanOleh: actor.userId,
    catatan: input.catatan?.trim() || null
  });
  await catatPeristiwaNaskah(
    kode,
    `Tugas produksi dibuat untuk ${petugas.nama} (${petugas.email}).`,
    labelPelaku(actor),
    "production_assigned"
  );
  return { id: dibuat.id };
}

export async function daftarkanGalley(
  kode: string,
  tugasId: string,
  jenis: JurnalGalleyJenis,
  berkas: JurnalBerkasMeta,
  actor: PelakuAlur,
  actorAdalahStaf: boolean
): Promise<void> {
  const b = await backend();
  const naskah = await getSubmission(kode);
  if (!naskah) throw new Error("Naskah tidak ditemukan.");
  if (naskah.status !== "production") {
    throw new Error("Naskah tidak lagi berada pada tahap produksi.");
  }
  const tugas = (await b.ambilTugasProduksi(kode)).find(
    (t) => t.id === tugasId
  );
  if (!tugas) throw new Error("Tugas produksi tidak ditemukan.");
  if (
    !actorAdalahStaf &&
    tugas.layoutEmail.toLowerCase() !== actor.email.toLowerCase()
  ) {
    throw new Error("Hanya layout editor yang ditugaskan yang dapat mengunggah galley tugas ini.");
  }
  if (tugas.status === "ready" || tugas.status === "cancelled") {
    throw new Error("Tugas produksi ini sudah ditutup.");
  }
  await b.simpanBerkasAlur({
    kode,
    tahap: "galley",
    jenis: jenis === "pdf" ? "galley_pdf" : "galley_html",
    berkas,
    diunggahOleh: actor.email
  });
  const semua = await b.ambilBerkasAlur(kode);
  const punyaPdf = semua.some((f) => f.jenis === "galley_pdf");
  const punyaHtml = semua.some((f) => f.jenis === "galley_html");
  if (punyaPdf && punyaHtml) {
    // Kedua galley lengkap: giliran penulis mem-proofread. Bukti proof
    // sebelumnya gugur karena galley berubah.
    await b.ubahTugasProduksi(tugas.id, {
      status: "author_proof",
      proofStatus: "menunggu",
      proofCatatan: null,
      proofPada: null
    });
    await catatPeristiwaNaskah(
      kode,
      "Galley PDF dan HTML lengkap; menunggu proofread penulis.",
      labelPelaku(actor),
      "galley_ready"
    );
    // Email permintaan proofread ke penulis (Tahap 6).
    await notifPermintaanProofread({
      kode,
      judul: naskah.judul,
      penulis: naskah.penulis,
      email: naskah.email
    });
  } else {
    await b.ubahTugasProduksi(tugas.id, { status: "galley_ready" });
    await catatPeristiwaNaskah(
      kode,
      `Galley ${jenis.toUpperCase()} diunggah.`,
      labelPelaku(actor),
      "galley_uploaded"
    );
  }
}

export async function proofOlehPenulis(
  kode: string,
  input: { keputusan: "setujui" | "koreksi"; catatan?: string | null },
  ownerEmail: string
): Promise<void> {
  const b = await backend();
  const naskah = await getSubmission(kode);
  if (!naskah) throw new Error("Naskah tidak ditemukan.");
  if (naskah.email.toLowerCase() !== ownerEmail.toLowerCase()) {
    throw new Error("Naskah ini bukan milik akun Anda.");
  }
  const tugas = (await b.ambilTugasProduksi(kode)).find(
    (t) => t.status === "author_proof"
  );
  if (!tugas) {
    throw new Error(
      "Tidak ada galley yang menunggu proofread Anda pada naskah ini."
    );
  }
  const sekarang = new Date().toISOString();
  if (input.keputusan === "setujui") {
    await b.ubahTugasProduksi(tugas.id, {
      proofStatus: "disetujui",
      proofCatatan: input.catatan?.trim() || null,
      proofPada: sekarang
    });
    await catatPeristiwaNaskah(
      kode,
      "Penulis menyetujui proof galley.",
      { userId: null, label: ownerEmail },
      "proof_approved"
    );
  } else {
    const catatan = input.catatan?.trim();
    if (!catatan) {
      throw new Error(
        "Permintaan koreksi wajib disertai catatan bagian yang perlu diperbaiki."
      );
    }
    await b.ubahTugasProduksi(tugas.id, {
      status: "galley_ready",
      proofStatus: "koreksi",
      proofCatatan: catatan,
      proofPada: sekarang
    });
    await catatPeristiwaNaskah(
      kode,
      `Penulis meminta koreksi galley: ${catatan}`,
      { userId: null, label: ownerEmail },
      "proof_correction"
    );
  }
}

export async function tandaiSiapTerbit(
  kode: string,
  tugasId: string,
  actor: PelakuAlur
): Promise<void> {
  const b = await backend();
  const tugas = (await b.ambilTugasProduksi(kode)).find(
    (t) => t.id === tugasId
  );
  if (!tugas) throw new Error("Tugas produksi tidak ditemukan.");
  if (tugas.status !== "author_proof" || tugas.proofStatus !== "disetujui") {
    throw new Error(
      "Galley hanya dapat ditandai siap terbit sesudah penulis menyetujui proof."
    );
  }
  await b.ubahTugasProduksi(tugas.id, {
    status: "ready",
    siapPada: new Date().toISOString()
  });
  await catatPeristiwaNaskah(
    kode,
    "Galley dinyatakan siap terbit oleh editor.",
    labelPelaku(actor),
    "production_ready"
  );
}

// ── Tampilan penulis untuk Naskah Saya ──────────────────────────────────

export async function alurUntukPenulis(
  kode: string
): Promise<JurnalAlurPenulisView> {
  const b = await backend();
  const [tugasCopy, tugasProduksi, berkas] = await Promise.all([
    b.ambilTugasCopy(kode),
    b.ambilTugasProduksi(kode),
    b.ambilBerkasAlur(kode)
  ]);
  const copyAktif =
    tugasCopy.filter((t) => t.status !== "cancelled").pop() ?? null;
  const hasilCopy = berkas.filter((f) => f.tahap === "copyedit").pop() ?? null;
  const produksiAktif =
    tugasProduksi.filter((t) => t.status !== "cancelled").pop() ?? null;
  return {
    copyediting: copyAktif
      ? {
          tugasId: copyAktif.id,
          status: copyAktif.status,
          statusLabel: JURNAL_COPY_TASK_LABEL_ID[copyAktif.status],
          berkasHasil:
            copyAktif.status !== "assigned" && hasilCopy
              ? {
                  namaAsli: hasilCopy.namaAsli,
                  diunggahPada: hasilCopy.diunggahPada
                }
              : null,
          perluPersetujuan: copyAktif.status === "author_review"
        }
      : null,
    produksi: produksiAktif
      ? {
          tugasId: produksiAktif.id,
          status: produksiAktif.status,
          statusLabel: JURNAL_PRODUCTION_TASK_LABEL_ID[produksiAktif.status],
          punyaPdf: berkas.some((f) => f.jenis === "galley_pdf"),
          punyaHtml: berkas.some((f) => f.jenis === "galley_html"),
          proofStatus: produksiAktif.proofStatus,
          proofLabel: JURNAL_PROOF_LABEL_ID[produksiAktif.proofStatus],
          perluProof: produksiAktif.status === "author_proof"
        }
      : null
  };
}

// ── Terbitan (staf) ─────────────────────────────────────────────────────

export async function daftarTerbitanStaf(): Promise<JurnalTerbitanView[]> {
  const b = await backend();
  const [terbitan, penempatan, naskah] = await Promise.all([
    b.daftarTerbitan(),
    b.ambilPenempatanSemua(),
    listSubmissions()
  ]);
  const petaNaskah = new Map(naskah.map((n) => [n.kode, n]));
  return terbitan.map((t) => ({
    id: t.id,
    slug: t.slug,
    volume: t.volume,
    number: t.number,
    year: t.year,
    label: labelTerbitan(t),
    judul: t.judul,
    uraian: t.uraian,
    status: t.status,
    statusLabel: JURNAL_ISSUE_STATUS_LABEL_ID[t.status],
    isCurrent: t.isCurrent,
    tanggalTerbit: t.tanggalTerbit,
    dibuatPada: t.dibuatPada,
    artikel: penempatan
      .filter((p) => p.issueId === t.id)
      .sort((a, z) => a.urutan - z.urutan)
      .map((p) => ({
        kode: p.kode,
        judul: petaNaskah.get(p.kode)?.judul ?? p.kode,
        statusNaskah: petaNaskah.get(p.kode)?.status ?? "",
        urutan: p.urutan
      }))
  }));
}

// Naskah yang boleh ditetapkan ke terbitan: berstatus production dan
// belum berada di terbitan lain yang sudah published.
export async function daftarArtikelSiapTetapkan(): Promise<
  { kode: string; judul: string; penulis: string }[]
> {
  const semua = await listSubmissions();
  return semua
    .filter((n) => n.status === "production")
    .map((n) => ({ kode: n.kode, judul: n.judul, penulis: n.penulis }));
}

export async function buatTerbitanBaru(
  input: {
    volume: number | null;
    number: number | null;
    year: number;
    judul: string | null;
    uraian: string | null;
  },
  actor: PelakuAlur
): Promise<JurnalTerbitanView> {
  const b = await backend();
  const ada = await b.daftarTerbitan();
  const dasar =
    input.volume != null && input.number != null
      ? `vol-${input.volume}-no-${input.number}-${input.year}`
      : `terbitan-${input.year}-${ada.length + 1}`;
  let slug = dasar;
  let i = 2;
  while (ada.some((t) => t.slug === slug)) {
    slug = `${dasar}-${i}`;
    i += 1;
  }
  const dibuat = await b.buatTerbitan({ ...input, slug });
  void actor;
  const [tampilan] = (await daftarTerbitanStaf()).filter(
    (t) => t.id === dibuat.id
  );
  return tampilan;
}

export async function ubahTerbitanStaf(
  slug: string,
  patch: {
    volume?: number | null;
    number?: number | null;
    year?: number;
    judul?: string | null;
    uraian?: string | null;
    tanggalTerbit?: string | null;
  }
): Promise<void> {
  const b = await backend();
  const terbitan = await b.ambilTerbitanBySlug(slug);
  if (!terbitan) throw new Error("Terbitan tidak ditemukan.");
  if (terbitan.status === "published") {
    throw new Error("Terbitan yang sudah terbit tidak dapat disunting lagi.");
  }
  await b.ubahTerbitan(terbitan.id, patch);
}

export async function tetapkanArtikelKeTerbitan(
  slug: string,
  kode: string,
  urutan: number,
  actor: PelakuAlur
): Promise<void> {
  const b = await backend();
  const terbitan = await b.ambilTerbitanBySlug(slug);
  if (!terbitan) throw new Error("Terbitan tidak ditemukan.");
  if (terbitan.status === "published") {
    throw new Error("Terbitan yang sudah terbit tidak menerima artikel baru.");
  }
  const naskah = await getSubmission(kode);
  if (!naskah) throw new Error("Naskah tidak ditemukan.");
  if (naskah.status !== "production") {
    throw new Error(
      `Hanya artikel berstatus production yang dapat ditetapkan ke terbitan (status sekarang: ${naskah.status}).`
    );
  }
  await b.tetapkanPenempatan(kode, terbitan.id, urutan);
  await catatPeristiwaNaskah(
    kode,
    `Artikel ditetapkan ke ${labelTerbitan(terbitan)} pada urutan ${urutan}.`,
    labelPelaku(actor),
    "issue_assigned"
  );
}

export async function lepaskanArtikelDariTerbitan(
  slug: string,
  kode: string,
  actor: PelakuAlur
): Promise<void> {
  const b = await backend();
  const terbitan = await b.ambilTerbitanBySlug(slug);
  if (!terbitan) throw new Error("Terbitan tidak ditemukan.");
  if (terbitan.status === "published") {
    throw new Error("Artikel pada terbitan yang sudah terbit tidak dapat dilepas.");
  }
  const penempatan = (await b.ambilPenempatanSemua()).find(
    (p) => p.kode === kode.trim().toUpperCase() && p.issueId === terbitan.id
  );
  if (!penempatan) throw new Error("Artikel tidak berada pada terbitan ini.");
  await b.hapusPenempatan(kode);
  await catatPeristiwaNaskah(
    kode,
    `Penempatan artikel pada ${labelTerbitan(terbitan)} dilepas.`,
    labelPelaku(actor),
    "issue_unassigned"
  );
}

export async function terbitkanTerbitan(
  slug: string,
  actor: PelakuAlur
): Promise<{ diterbitkan: string[] }> {
  const b = await backend();
  const terbitan = await b.ambilTerbitanBySlug(slug);
  if (!terbitan) throw new Error("Terbitan tidak ditemukan.");
  if (terbitan.status === "published") {
    throw new Error("Terbitan ini sudah diterbitkan.");
  }
  const penempatan = (await b.ambilPenempatanSemua())
    .filter((p) => p.issueId === terbitan.id)
    .sort((a, z) => a.urutan - z.urutan);
  if (penempatan.length === 0) {
    throw new Error(
      "Terbitan belum memiliki artikel. Tetapkan minimal satu artikel berstatus production terlebih dahulu."
    );
  }
  const label = labelTerbitan(terbitan);
  const diterbitkan: string[] = [];
  for (const p of penempatan) {
    const naskah = await getSubmission(p.kode);
    if (!naskah) continue;
    if (naskah.status === "published") {
      diterbitkan.push(p.kode);
      continue;
    }
    if (naskah.status !== "production") {
      throw new Error(
        `Artikel ${p.kode} berstatus ${naskah.status}; hanya artikel production yang dapat diterbitkan. Periksa kembali daftar isi.`
      );
    }
    // Perpindahan status berjalan lewat tabel transisi Tahap Keamanan
    // (production ke published) dan menulis linimasa beserta tanggal
    // terbit pada backend Supabase.
    await updateSubmissionStatus(
      p.kode,
      "published",
      labelPelaku(actor),
      `Diterbitkan dalam ${label}.`
    );
    diterbitkan.push(p.kode);
    // Email pemberitahuan terbit ke penulis (Tahap 6), memuat tautan
    // artikel dan DOI yang tercatat sesudah penerbitan.
    const sesudah = await getSubmission(p.kode);
    await notifArtikelTerbit({
      naskah: {
        kode: p.kode,
        judul: naskah.judul,
        penulis: naskah.penulis,
        email: naskah.email
      },
      slugArtikel: slugDariKode(p.kode),
      doi: sesudah?.doi ?? naskah.doi ?? null
    });
  }
  await b.ubahTerbitan(terbitan.id, {
    status: "published",
    tanggalTerbit: new Date().toISOString(),
    isCurrent: true
  });
  return { diterbitkan };
}

// ── Permukaan publik ────────────────────────────────────────────────────
// Gerbangnya satu: artikel tampil hanya bila naskahnya published DAN
// terbitannya published. Artikel pada terbitan draf, artikel yang belum
// diterbitkan, dan kode yang tidak dikenal semuanya tidak ditemukan.

async function kumpulkanPublik(): Promise<{
  terbitan: JurnalTerbitanPublik[];
  artikel: JurnalArtikelPublik[];
}> {
  const b = await backend();
  const [terbitanSemua, artikelInternal] = await Promise.all([
    b.daftarTerbitan(),
    b.daftarArtikelPublik()
  ]);
  const terbitanPublik = terbitanSemua.filter(
    (t) => t.status === "published"
  );
  const petaTerbitan = new Map(terbitanPublik.map((t) => [t.id, t]));
  const artikel: JurnalArtikelPublik[] = [];
  for (const a of artikelInternal) {
    if (!a.issueId) continue;
    const t = petaTerbitan.get(a.issueId);
    if (!t) continue;
    artikel.push({
      slug: slugDariKode(a.kode),
      kode: a.kode,
      judul: a.judul,
      penulis: a.penulis,
      afiliasiUtama: a.afiliasiUtama,
      bagianLabel: labelBagian(a.bagianSlug),
      bagianSlug: a.bagianSlug ?? "",
      abstrak: a.abstrak,
      abstrakEn: a.abstrakEn,
      kataKunci: a.kataKunci,
      halaman: a.halaman,
      halamanMulai: a.halamanMulai,
      halamanSelesai: a.halamanSelesai,
      referensi: a.referensi,
      bahasa: a.bahasa,
      tanggalTerbit: t.tanggalTerbit ?? "",
      doi: a.doi,
      lisensi: a.lisensi,
      pernyataanAi: a.pernyataanAi,
      terbitanSlug: t.slug,
      terbitanLabel: labelTerbitan(t),
      volume: t.volume,
      nomor: t.number,
      tahun: t.year,
      urutan: a.urutan,
      punyaPdf: a.galley.some((g) => g.jenis === "pdf"),
      punyaHtml: a.galley.some((g) => g.jenis === "html")
    });
  }
  artikel.sort((x, z) => x.urutan - z.urutan);
  const terbitan: JurnalTerbitanPublik[] = terbitanPublik
    .map((t) => ({
      slug: t.slug,
      label: labelTerbitan(t),
      volume: t.volume,
      nomor: t.number,
      tahun: t.year,
      judul: t.judul,
      uraian: t.uraian,
      tanggalTerbit: t.tanggalTerbit,
      isCurrent: t.isCurrent,
      artikel: artikel.filter((a) => a.terbitanSlug === t.slug)
    }))
    .sort((x, z) => (x.tanggalTerbit ?? "") < (z.tanggalTerbit ?? "") ? 1 : -1);
  return { terbitan, artikel };
}

export async function daftarTerbitanPublik(): Promise<JurnalTerbitanPublik[]> {
  return (await kumpulkanPublik()).terbitan;
}

export async function artikelPublikDariSlug(
  slug: string
): Promise<JurnalArtikelPublik | null> {
  const kode = slug.trim().toUpperCase();
  if (!/^JRN-\d{4}-(\d{4}|\d{6})$/.test(kode)) return null;
  const { artikel } = await kumpulkanPublik();
  return artikel.find((a) => a.kode === kode) ?? null;
}

export async function galleyPublikDariSlug(
  slug: string,
  jenis: JurnalGalleyJenis
): Promise<{ bucket: string; kunci: string; mime: string } | null> {
  const publik = await artikelPublikDariSlug(slug);
  if (!publik) return null;
  const b = await backend();
  const internal = (await b.daftarArtikelPublik()).find(
    (a) => a.kode === publik.kode
  );
  const galley = internal?.galley.find((g) => g.jenis === jenis);
  return galley
    ? { bucket: galley.bucket, kunci: galley.kunci, mime: galley.mime }
    : null;
}

export async function catatKunjunganArtikel(kode: string): Promise<void> {
  try {
    await (await backend()).catatMetrik(kode, "views");
  } catch (err) {
    // Metrik tidak pernah menggagalkan halaman publik.
    console.warn(
      "[jurnal] Gagal mencatat kunjungan artikel:",
      err instanceof Error ? err.message : err
    );
  }
}

export async function catatUnduhanArtikel(kode: string): Promise<void> {
  try {
    await (await backend()).catatMetrik(kode, "downloads");
  } catch (err) {
    console.warn(
      "[jurnal] Gagal mencatat unduhan artikel:",
      err instanceof Error ? err.message : err
    );
  }
}
