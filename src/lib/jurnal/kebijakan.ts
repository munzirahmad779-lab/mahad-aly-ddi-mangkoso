// ─────────────────────────────────────────────────────────────────────────────
// Halaman kebijakan jurnal — isi diambil dari SUSUNAN-ISI-JURNAL.md.
//
// Status seluruh isi: USULAN yang menunggu keputusan pimpinan (Mudir
// Muh. Faried Wadjedy bersama Katib Muhammad Aydi Syam). Nama pengisi
// jabatan dewan redaksi sengaja dikosongkan menunggu SK. Jangan mengubah
// status usulan ini di halaman; halaman menampilkannya apa adanya
// sebagai versi uji.
// ─────────────────────────────────────────────────────────────────────────────

export interface HalamanKebijakan {
  slug: string;
  judul: string;
  ringkasan: string;
  bagian: { subjudul?: string; paragraf?: string[]; butir?: string[] }[];
}

export const HALAMAN_KEBIJAKAN: HalamanKebijakan[] = [
  {
    slug: "tentang",
    judul: "Tentang Jurnal",
    ringkasan:
      "Identitas, penerbit, dan jadwal terbit jurnal (usulan, menunggu keputusan pimpinan).",
    bagian: [
      {
        paragraf: [
          "Turatsuna: Jurnal Fiqh, Ushul Fiqh, dan Kajian Turats adalah nama usulan utama untuk jurnal ilmiah Ma'had Aly DDI Mangkoso. Nama cadangan yang disiapkan adalah Al-Mursyid: Jurnal Studi Fiqh dan Ushul Fiqh serta Jurnal Fiqh dan Ushul Fiqh Ma'had Aly DDI Mangkoso. Nama resmi ditetapkan lewat keputusan pimpinan.",
          "Jurnal diterbitkan oleh Lembaga Jurnal Ma'had Aly DDI Mangkoso, dengan takhasus yang menjadi jangkar adalah Fiqh dan Ushul Fiqh sesuai SK Dirjen Pendidikan Islam No. 2971 Tahun 2018."
        ]
      },
      {
        subjudul: "Jadwal dan bahasa",
        butir: [
          "Terbit 2 kali setahun, usulan Juni dan Desember, minimal 5 artikel per terbitan",
          "Bahasa naskah: Bahasa Indonesia, Bahasa Arab, dan Bahasa Inggris",
          "e-ISSN diajukan ke BRIN sesudah situs publik memuat minimal 5 artikel teks penuh",
          "DOI diaktifkan per artikel sesudah e-ISSN terbit"
        ]
      },
      {
        subjudul: "Sistem pengelolaan",
        paragraf: [
          "Jurnal dikelola dengan sistem manajemen jurnal open-access satu jurnal yang mencakup alur submisi, telaah sejawat double-blind, copyediting, produksi, dan penerbitan terbitan, dengan metadata Dublin Core, OAI-PMH, dan DOI Crossref; sistem ini dirancang untuk memenuhi persyaratan e-ISSN BRIN, pendaftaran Garuda, dan akreditasi ARJUNA/SINTA. Sistem ini bukan OJS dan tidak mengklaim seluruh fitur OJS."
        ]
      }
    ]
  },
  {
    slug: "fokus-ruang-lingkup",
    judul: "Fokus dan Ruang Lingkup",
    ringkasan:
      "Bidang kajian yang ditampung jurnal sesuai takhasus Ma'had Aly DDI Mangkoso.",
    bagian: [
      {
        paragraf: [
          "Jurnal menampung kajian sesuai takhasus Ma'had Aly DDI Mangkoso dan bidang pendukungnya:"
        ],
        butir: [
          "Fiqh dan Ushul Fiqh (bidang utama)",
          "Kajian kitab turats dan khazanah pesantren",
          "Bahtsul Masa'il dan fiqh kontemporer"
        ]
      }
    ]
  },
  {
    slug: "dewan-redaksi",
    judul: "Dewan Redaksi",
    ringkasan:
      "Kerangka jabatan dewan redaksi. Nama pengisi jabatan diisi lewat SK pimpinan dan masih kosong pada versi uji ini.",
    bagian: [
      {
        paragraf: [
          "Susunan berikut adalah kerangka jabatan. Nama personal diisi lewat SK pimpinan; pada versi uji ini seluruh nama sengaja dikosongkan."
        ],
        butir: [
          "Penanggung Jawab: Mudir Ma'had Aly DDI Mangkoso (jabatan) — nama menunggu SK",
          "Pimpinan Redaksi: 1 orang dosen atau muhadir, syaratnya aktif menulis dan paham gaya selingkung — nama menunggu SK",
          "Redaksi Pelaksana: 1 sampai 2 orang, mengurus alur naskah harian dan korespondensi penulis — nama menunggu SK",
          "Penyunting Ahli (Editor): 3 sampai 5 orang sesuai bidang ruang lingkup — nama menunggu SK",
          "Mitra Bestari (Reviewer): minimal 5 orang dari minimal 2 institusi berbeda di luar Ma'had Aly DDI Mangkoso — nama menunggu SK",
          "Pengelola Situs dan Sistem Jurnal: 1 orang, mengurus terbitan, metadata, dan indeksasi — nama menunggu SK",
          "Tata Usaha: 1 orang, mengurus arsip SK, berita acara review, dan bukti terbit — nama menunggu SK"
        ]
      },
      {
        subjudul: "Syarat yang tidak bisa ditawar",
        butir: [
          "Proses review terdokumentasi",
          "Reviewer luar institusi ada sejak terbitan pertama",
          "Tidak ada satu orang pun yang memegang seluruh alur sendirian"
        ]
      }
    ]
  },
  {
    slug: "pedoman-penulis",
    judul: "Pedoman Penulis",
    ringkasan:
      "Ketentuan penulisan dan pengiriman naskah bagi penulis.",
    bagian: [
      {
        butir: [
          "Jenis naskah: hasil penelitian, kajian pustaka atau turats, dan pemikiran konseptual sesuai ruang lingkup",
          "Panjang naskah 5.000 sampai 8.000 kata di luar daftar pustaka",
          "Abstrak dua bahasa (Indonesia dan Inggris, atau Arab dan Inggris untuk naskah Arab), 150 sampai 250 kata, disertai 3 sampai 5 kata kunci",
          "Gaya sitasi catatan kaki Chicago 17 dan daftar pustaka, mengikuti pedoman penulisan Ma'had Aly yang berlaku",
          "Transliterasi Arab-Latin mengikuti pedoman kampus",
          "Naskah orisinal, belum pernah terbit, dan tidak sedang diajukan ke jurnal lain; penulis menandatangani pernyataan orisinalitas",
          "Batas kesamaan naskah diperiksa redaksi sebelum review; angka batas diputuskan pimpinan redaksi",
          "Kebijakan AI wajib: penulis menyatakan pemakaian AI bila ada (alat apa, untuk apa); AI tidak boleh dicantumkan sebagai penulis; naskah yang daftar pustakanya tidak bisa diverifikasi ditolak"
        ]
      },
      {
        subjudul: "Alur editorial",
        butir: [
          "Penulis mengirim naskah lewat formulir Kirim Naskah dan menerima kode lacak",
          "Cek awal redaksi: kesesuaian ruang lingkup, kelengkapan, dan kesamaan (maksimal 14 hari)",
          "Telaah sejawat buta ganda oleh minimal 2 reviewer; identitas penulis dan reviewer saling disembunyikan",
          "Keputusan diterima, revisi kecil, revisi besar, atau ditolak tercatat di panel dan terlihat penulis lewat Lacak Naskah",
          "Penyuntingan bahasa dan gaya selingkung, lalu terbit pada jadwal terbitan",
          "Sesudah terbit naskah masuk OAI-PMH, didaftarkan DOI, dan diajukan ke Garuda serta Google Scholar"
        ]
      }
    ]
  },
  {
    slug: "etika-publikasi",
    judul: "Etika Publikasi",
    ringkasan:
      "Asas etika publikasi yang mengikuti COPE dan aturan redaksi yang berlaku di web kampus.",
    bagian: [
      {
        butir: [
          "Etika publikasi mengikuti asas COPE: kejujuran sitasi, larangan plagiarisme dan publikasi ganda, konflik kepentingan dinyatakan, data dan sumber bisa ditelusuri",
          "Koreksi diterbitkan sebagai catatan resmi; naskah yang terbukti melanggar etika ditarik dengan pengumuman, bukan dihapus diam-diam",
          "Larangan yang sudah berlaku di web kampus ikut berlaku di jurnal: tidak ada sitasi Ibnu Qayyim, Ibnu Taimiyah, dan yang sefaham dengan keduanya sebagai rujukan otoritas; bila naskah bersandar pada mereka, redaksi meminta pengganti sumber klasik yang setara"
        ]
      }
    ]
  },
  {
    slug: "biaya-lisensi",
    judul: "Biaya dan Lisensi",
    ringkasan: "Biaya penulis dan lisensi penerbitan (usulan).",
    bagian: [
      {
        butir: [
          "Biaya: Rp0. Jurnal tidak memungut biaya submisi, biaya pemrosesan, maupun biaya publikasi (APC Rp0) dari penulis pada semua tahap.",
          "Lisensi usulan: CC BY 4.0; hak cipta tetap pada penulis dan jurnal memegang hak terbit pertama"
        ]
      }
    ]
  }
];

export function halamanKebijakan(slug: string): HalamanKebijakan | undefined {
  return HALAMAN_KEBIJAKAN.find((h) => h.slug === slug);
}
