/**
 * ══════════════════════════════════════════════════════════════════════════
 *  SPREADSHEET SYNC ENGINE — Library inti (isomorphic / aman untuk server & browser)
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Berisi:
 *  1. Konversi tautan Google Drive → CDN `lh3.googleusercontent.com`
 *  2. Parser CSV tangguh (RFC 4180: tanda kutip, kutip ganda, CRLF, BOM, baris kosong)
 *  3. Resolusi URL Google Sheets → { sheetId, sheetName, gid }
 *  4. Registry 4 modul (Masyayikh, Kurikulum, Sarana, DeMa) + pemetaan header
 *  5. Normalizer baris → tipe data aplikasi (Lecturer, Course, Facility, DemaMember)
 *  6. Pembuat template CSV siap unduh
 *
 * Tidak ada dependensi Node.js / DOM di sini agar bisa dipakai di Route Handler
 * maupun langsung di komponen panel admin (unduh template tanpa round-trip).
 */

import type {
  Course,
  DemaDivision,
  DemaMember,
  Facility,
  Lecturer,
  SheetSyncModuleId
} from "@/lib/types";

// ══════════════════════════════════════════════════════════════════════════
// 1. GOOGLE DRIVE → GOOGLE CDN (lh3.googleusercontent.com)
// ══════════════════════════════════════════════════════════════════════════

/** Panjang minimal ID file Google Drive yang valid (ID asli 33–44 karakter). */
const DRIVE_ID_MIN_LENGTH = 10;

/**
 * Ekstrak ID file dari berbagai varian tautan Google Drive.
 * Mengenali:
 *   - https://drive.google.com/open?id=FILE_ID
 *   - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *   - https://drive.google.com/file/d/FILE_ID
 *   - https://drive.google.com/uc?id=FILE_ID&export=download
 *   - https://drive.google.com/uc?export=download&id=FILE_ID
 *   - https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000
 *   - https://drive.google.com/drive/folders/FILE_ID
 *   - https://drive.google.com/u/0/d/FILE_ID
 *   - https://lh3.googleusercontent.com/d/FILE_ID
 *   - https://drive.usercontent.google.com/download?id=FILE_ID
 *   - FILE_ID mentah (tempel ID saja)
 */
export function extractGoogleDriveFileId(url: string | undefined | null): string | null {
  if (!url || typeof url !== "string") return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  // Pola 1: parameter ?id= / &id= (open, uc, thumbnail, download, usercontent)
  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam?.[1] && matchIdParam[1].length >= DRIVE_ID_MIN_LENGTH) {
    return matchIdParam[1];
  }

  // Pola 2: bentuk path /file/d/FILE_ID, /d/FILE_ID, /folders/FILE_ID
  const matchPath = trimmed.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/);
  if (matchPath?.[1] && matchPath[1].length >= DRIVE_ID_MIN_LENGTH) {
    return matchPath[1];
  }

  const matchFolder = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (matchFolder?.[1] && matchFolder[1].length >= DRIVE_ID_MIN_LENGTH) {
    return matchFolder[1];
  }

  // Pola 3: hanya ID mentah tanpa spasi / garis miring / titik
  if (/^[a-zA-Z0-9_-]{20,80}$/.test(trimmed) && !trimmed.includes(".")) {
    return trimmed;
  }

  return null;
}

/**
 * Konversi tautan Google Drive → CDN resmi Google User Content.
 *
 * `https://lh3.googleusercontent.com/d/FILE_ID` merender gambar secara instan:
 * tanpa login, tanpa halaman perantara "virus scan", dan tanpa kuota unduhan.
 *
 * Tautan non-Drive dikembalikan apa adanya (di-trim) agar URL Supabase Storage,
 * Cloudflare R2, Unsplash, atau CDN lain tetap berfungsi.
 */
export function convertGoogleDriveToCDN(url: string | undefined | null): string {
  if (!url || typeof url !== "string") return "";

  const trimmed = url.trim();
  if (!trimmed) return "";

  // Sudah berupa CDN Google / bukan tautan Google Drive → biarkan
  const isDriveHost =
    /drive\.google\.com/i.test(trimmed) ||
    /drive\.usercontent\.google\.com/i.test(trimmed) ||
    /docs\.google\.com/i.test(trimmed);

  if (!isDriveHost) {
    // Tautan lh3 yang sudah jadi tetap dipakai, tetapi buang embel-embel ukuran
    // (=w1000, =s400) agar Next/Image tidak salah menganggapnya file statis.
    if (/lh3\.googleusercontent\.com/i.test(trimmed)) {
      return trimmed.replace(/=(?:w|h|s)\d+.*$/i, "");
    }
    return trimmed;
  }

  const fileId = extractGoogleDriveFileId(trimmed);
  if (!fileId) return trimmed;

  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

/**
 * Varian yang lebih permisif: menerima ID file mentah (tanpa URL) dan
 * mengubahnya menjadi CDN. Dipakai saat admin hanya menempelkan ID.
 */
export function normalizePhotoUrl(url: string | undefined | null): string {
  const raw = (url || "").trim();
  if (!raw) return "";
  if (/^[a-zA-Z0-9_-]{20,80}$/.test(raw) && !raw.includes(".")) {
    return `https://lh3.googleusercontent.com/d/${raw}`;
  }
  return convertGoogleDriveToCDN(raw);
}

// ══════════════════════════════════════════════════════════════════════════
// 2. PARSER CSV TAHAN BANTING
// ══════════════════════════════════════════════════════════════════════════

/** Deteksi delimiter dominan pada baris pertama (menghormati tanda kutip). */
function detectDelimiter(text: string): string {
  const candidates = [",", ";", "\t", "|"];
  const counts = new Map<string, number>(candidates.map((c) => [c, 0]));

  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (inQuotes) continue;
    if (ch === "\n" || ch === "\r") break;
    if (counts.has(ch)) {
      counts.set(ch, (counts.get(ch) ?? 0) + 1);
    }
  }

  let best = ",";
  let bestCount = -1;
  for (const candidate of candidates) {
    const count = counts.get(candidate) ?? 0;
    if (count > bestCount) {
      best = candidate;
      bestCount = count;
    }
  }
  return best;
}

/**
 * Parser CSV state-machine (RFC 4180).
 * - Mendukung koma/semicolon/tab sebagai delimiter (auto-detect)
 * - Mendukung koma di dalam tanda kutip: "Dr. KH. Lukman, Lc., M.A."
 * - Mendukung escaped quote: ""Khutbah" Jumat"
 * - Mendukung baris baru di dalam sel (alamat / biografi multi-baris)
 * - Menoleransi BOM, CR/LF/CRLF, dan baris kosong di tengah/akhir data
 */
export function parseCsv(text: string): string[][] {
  if (!text || typeof text !== "string") return [];

  const source = text.replace(/^\uFEFF/, "");
  const delimiter = detectDelimiter(source);

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const pushRow = () => {
    row.push(field);
    // Buang baris yang seluruh selnya kosong (baris kosong / pemisah visual)
    if (row.some((cell) => cell.trim().length > 0)) {
      rows.push(row.map((cell) => cell.trim()));
    }
    row = [];
    field = "";
  };

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];

    if (inQuotes) {
      if (ch === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"' && field.trim().length === 0) {
      // Tanda kutip pembuka (boleh didahului spasi)
      inQuotes = true;
      field = "";
      continue;
    }

    if (ch === delimiter) {
      row.push(field);
      field = "";
      continue;
    }

    if (ch === "\r") {
      // CRLF → biarkan \n yang menutup baris; CR tunggal → tutup baris
      if (source[i + 1] !== "\n") pushRow();
      continue;
    }

    if (ch === "\n") {
      pushRow();
      continue;
    }

    field += ch;
  }

  if (field.length > 0 || row.length > 0) pushRow();

  // Excel menulis baris petunjuk "sep=;" di awal berkas — jangan dianggap data
  const firstCell = rows[0]?.[0] ?? "";
  const looksLikeSepHint =
    /^sep=.$/i.test(firstCell) || (/^sep=$/i.test(firstCell) && (rows[0]?.length ?? 0) <= 2);
  if (rows.length > 0 && looksLikeSepHint) {
    rows.shift();
  }

  return rows;
}

/** Normalisasi nama header: "Bobot SKS" → "bobotsks", "Semester (1 s/d 8)" → "semester1sd8" */
function normalizeHeader(value: string): string {
  return (value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// ══════════════════════════════════════════════════════════════════════════
// 3. REGISTRY MODUL SPREADSHEET
// ══════════════════════════════════════════════════════════════════════════

export interface SheetColumnDef {
  /** Kunci internal */
  key: string;
  /** Judul kolom resmi di spreadsheet */
  label: string;
  /** Varian header yang tetap dikenali */
  aliases: string[];
  /** Wajib terisi agar baris dianggap valid */
  required?: boolean;
  /** Contoh isi untuk template */
  example: string;
  hint?: string;
}

export interface SheetModuleDef {
  id: SheetSyncModuleId;
  label: string;
  emoji: string;
  /** Halaman publik yang menampilkan data */
  target: string;
  description: string;
  /** Key utama di tabel `site_content` */
  siteContentKey: string;
  /** Key alias (kompatibilitas PASAL 5: lecturers_data / courses_data / facilities_data) */
  aliasKeys: string[];
  columns: SheetColumnDef[];
}

const MASYAYIKH_COLUMNS: SheetColumnDef[] = [
  {
    key: "nama",
    label: "Nama Lengkap",
    aliases: ["nama", "nama lengkap dan gelar", "nama dosen", "nama masyayikh"],
    required: true,
    example: "AGH. Prof. Dr. M. Faried Wadjedy, MA",
    hint: "Nama lengkap beserta gelar"
  },
  {
    key: "jabatan",
    label: "Gelar & Jabatan",
    aliases: ["jabatan", "gelar", "gelar jabatan", "gelar & jabatan struktural"],
    example: "Mudir Ma'had Aly / Dosen Senior"
  },
  {
    key: "peran",
    label: "Peran/Tugas Mengajar",
    aliases: ["peran", "tugas", "peran tugas", "tugas mengajar", "bidang tugas"],
    example: "Pengampu Fiqh Turats & Ushul Fiqh"
  },
  {
    key: "foto_drive",
    label: "Link Foto Google Drive",
    aliases: ["foto", "link foto", "link foto google drive", "foto drive", "url foto", "photo", "foto url"],
    example: "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz012345/view?usp=sharing",
    hint: "Link share Google Drive (Siapa saja yang memiliki link)"
  },
  {
    key: "keahlian",
    label: "Bidang Keahlian",
    aliases: ["keahlian", "bidang keahlian", "fokus keilmuan", "expertise"],
    example: "Kutubut Turats, Ushul Fikih, Fatwa Kontemporer"
  },
  {
    key: "pendidikan",
    label: "Riwayat Pendidikan",
    aliases: ["pendidikan", "riwayat pendidikan", "riwayat studi", "pendidikan talaqqi"],
    example: "S1 Al-Azhar Kairo • S2 UIN Alauddin • S3 UIN Jakarta",
    hint: "Pisahkan dengan tanda • (bullet)"
  },
  {
    key: "publikasi",
    label: "Karya/Publikasi",
    aliases: ["publikasi", "karya", "karya publikasi", "karya ilmiah", "buku"],
    example: "Fiqh Muqaran • Risalah Wasathiyyah",
    hint: "Pisahkan dengan tanda • (bullet)"
  },
  {
    key: "urutan",
    label: "Nomor Urut",
    aliases: ["urutan", "nomor urut", "no urut", "no", "order", "sort"],
    example: "1"
  },
  {
    key: "status",
    label: "Status Aktif",
    aliases: ["status", "status aktif", "aktif", "keterangan"],
    example: "Aktif",
    hint: "Aktif / Non-Aktif"
  }
];

const KURIKULUM_COLUMNS: SheetColumnDef[] = [
  {
    key: "kode",
    label: "Kode Matkul",
    aliases: ["kode", "kode matkul", "kode mata kuliah", "kode mk", "kode mk/matkul"],
    required: true,
    example: "FIQ-101"
  },
  {
    key: "nama",
    label: "Nama Mata Kuliah",
    aliases: ["nama", "nama mata kuliah", "mata kuliah", "matkul", "nama matkul"],
    required: true,
    example: "Qawa'id Fiqhiyyah Kontemporer"
  },
  {
    key: "sks",
    label: "Bobot SKS",
    aliases: ["sks", "bobot sks", "bobot", "kredit", "kredit sks"],
    example: "3"
  },
  {
    key: "semester",
    label: "Semester (1 s/d 8)",
    aliases: ["semester", "semester 1 s/d 8", "smtr", "smst", "sem"],
    example: "1"
  },
  {
    key: "dosen",
    label: "Dosen Pengampu",
    aliases: ["dosen", "dosen pengampu", "pengampu", "nama dosen"],
    example: "AGH. Prof. Dr. M. Faried Wadjedy, MA"
  },
  {
    key: "kitab_rujukan",
    label: "Kitab Rujukan",
    aliases: ["kitab", "kitab rujukan", "kitab wajib", "maraji", "maraji kitab", "marajik", "rujukan", "buku utama"],
    example: "Al-Asybah wan Nazha'ir karya Imam As-Suyuthi"
  },
  {
    key: "deskripsi",
    label: "Deskripsi Singkat",
    aliases: ["deskripsi", "deskripsi singkat", "ringkasan", "silabus", "capaian pembelajaran"],
    example: "Kaidah-kaidah fikih asasiyah dan penerapannya pada kasus kontemporer."
  },
  {
    key: "sifat",
    label: "Sifat",
    aliases: ["sifat", "sifat matkul", "jenis", "status matkul", "wajib pilihan"],
    example: "Wajib",
    hint: "Wajib / Pilihan"
  },
  {
    key: "kitab_pendukung",
    label: "Kitab Pendukung",
    aliases: ["kitab pendukung", "buku pendukung", "support book", "kitab sekunder"],
    example: "Hasyiyah al-Bajuri"
  }
];

const SARANA_COLUMNS: SheetColumnDef[] = [
  {
    key: "nama",
    label: "Nama Fasilitas",
    aliases: ["nama", "nama fasilitas", "sarana", "nama sarana", "fasilitas"],
    required: true,
    example: "Maktabah Turats & E-Library Syekh Hasan"
  },
  {
    key: "kategori",
    label: "Kategori",
    aliases: ["kategori", "kategori fasilitas", "jenis", "tipe", "kategori masjid maktabah asrama lab"],
    example: "Maktabah",
    hint: "Masjid / Maktabah / Asrama / Ruang Kuliah / Laboratorium"
  },
  {
    key: "foto_drive",
    label: "Link Foto Google Drive",
    aliases: ["foto", "link foto", "link foto google drive", "foto drive", "url foto", "photo"],
    example: "https://drive.google.com/open?id=1AbCdEfGhIjKlMnOpQrStUvWxYz012345"
  },
  {
    key: "deskripsi",
    label: "Deskripsi Ringkas",
    aliases: ["deskripsi", "deskripsi ringkas", "keterangan", "penjelasan"],
    example: "Ruang baca ber-AC dengan koleksi 5.000 jilid kitab turats dan akses e-library."
  },
  {
    key: "kapasitas",
    label: "Kapasitas",
    aliases: ["kapasitas", "daya tampung", "kapasitas mahasantri", "capacity"],
    example: "120 Mahasantri"
  },
  {
    key: "urutan",
    label: "Nomor Urut",
    aliases: ["urutan", "nomor urut", "no urut", "no", "order"],
    example: "1"
  }
];

const DEMA_COLUMNS: SheetColumnDef[] = [
  {
    key: "timestamp",
    label: "Timestamp",
    aliases: ["timestamp", "waktu", "waktu pengisian", "tanggal"],
    example: "2026-10-20 08:15:22"
  },
  {
    key: "nama",
    label: "Nama Lengkap",
    aliases: ["nama", "nama lengkap", "nama pengurus"],
    required: true,
    example: "IMRAN"
  },
  {
    key: "nim",
    label: "NIM",
    aliases: ["nim", "nomor induk mahasantri", "nomor induk", "stambuk"],
    example: "144629"
  },
  {
    key: "marhalah",
    label: "Semester / Marhalah",
    aliases: ["semester", "marhalah", "semester marhalah", "semester/marhalah", "kelas"],
    example: "Semester VI / Marhalah Tsalis"
  },
  {
    key: "divisi",
    label: "Divisi / Amanah",
    aliases: ["divisi", "amanah", "divisi amanah", "jabatan", "divisi / amanah"],
    example: "Ketua Dema"
  },
  {
    key: "foto_drive",
    label: "Link Foto Google Drive",
    aliases: ["foto", "link foto", "link foto google drive", "foto drive", "url foto", "photo"],
    example: "https://drive.google.com/open?id=1XB1mGiYGxf3Mz_foEzihcZz6bwIEVzaL"
  },
  {
    key: "whatsapp",
    label: "Nomor WhatsApp",
    aliases: ["whatsapp", "nomor whatsapp", "no whatsapp", "wa", "hp", "telepon", "no hp"],
    example: "082196923170"
  },
  {
    key: "instagram",
    label: "Akun Instagram",
    aliases: ["instagram", "akun instagram", "ig", "username instagram"],
    example: "@imranmuhjafar"
  },
  {
    key: "bio",
    label: "Biografi Singkat",
    aliases: ["bio", "biografi", "biografi singkat", "tentang"],
    example: "Mahasantri Marhalah Tsalis, fokus Ushul Fiqih dan Tafsir."
  },
  {
    key: "quote",
    label: "Motto Hidup / Kutipan",
    aliases: ["motto", "motto hidup", "kutipan", "quote", "motto hidup / kutipan"],
    example: "Ikhlas, Lillah, Billah, Fillah."
  }
];

export const SHEET_MODULES: SheetModuleDef[] = [
  {
    id: "masyayikh",
    label: "Masyayikh & Dewan Dosen",
    emoji: "👳",
    target: "/profil#masyayikh",
    description: "Kartu dosen & masyayikh pengampu beserta foto, keahlian, pendidikan, dan karya.",
    siteContentKey: "masyayikh_list",
    aliasKeys: ["lecturers_data"],
    columns: MASYAYIKH_COLUMNS
  },
  {
    id: "kurikulum",
    label: "Kurikulum & Mata Kuliah",
    emoji: "📚",
    target: "/akademik",
    description: "Mata kuliah 8 semester lengkap dengan SKS, dosen pengampu, dan maraji' kitab.",
    siteContentKey: "courses_list",
    aliasKeys: ["courses_data"],
    columns: KURIKULUM_COLUMNS
  },
  {
    id: "sarana",
    label: "Sarana & Prasarana",
    emoji: "🏛️",
    target: "/profil#sarana",
    description: "Galeri fasilitas kampus: masjid, maktabah, asrama, ruang kuliah, dan laboratorium.",
    siteContentKey: "sarana_list",
    aliasKeys: ["facilities_data"],
    columns: SARANA_COLUMNS
  },
  {
    id: "dema",
    label: "DeMa (Dewan Mahasantri)",
    emoji: "👑",
    target: "/dema",
    description: "Pengurus Dewan Mahasantri beserta NIM, amanah divisi, foto, dan motto.",
    siteContentKey: "dema_settings",
    aliasKeys: [],
    columns: DEMA_COLUMNS
  }
];

/** Cari definisi modul berdasarkan id; mengembalikan null bila tidak dikenal. */
export function getSheetModule(id: string | null | undefined): SheetModuleDef | null {
  if (!id) return null;
  return SHEET_MODULES.find((m) => m.id === id) ?? null;
}

/** Daftar id modul yang valid — dipakai untuk validasi body API. */
export const SHEET_MODULE_IDS: SheetSyncModuleId[] = SHEET_MODULES.map((m) => m.id);

// ══════════════════════════════════════════════════════════════════════════
// 4. PEMETAAN HEADER → BARIS OBJEK
// ══════════════════════════════════════════════════════════════════════════

export interface ParsedSheet {
  /** Header asli dari file/URL */
  headers: string[];
  /** Satu objek per baris data, key = kunci internal kolom */
  records: Record<string, string>[];
  /** Kolom wajib yang tidak ditemukan pada header */
  missingRequired: string[];
  /** Header yang tidak dikenali (sebagai saran pemetaan) */
  unknownHeaders: string[];
  /** Peringatan non-fatal: baris dengan jumlah kolom tidak sejajar header */
  warnings: string[];
  /** Baris berisi data yang dibuang karena kolom wajibnya kosong */
  droppedRows: { row: number; reason: string }[];
}

interface HeaderMatch {
  key: string;
  score: number;
}

/**
 * Cocokkan satu header spreadsheet ke kolom internal.
 * Skor: 4 = persis, 3 = salah satu mengawali yang lain, 2 = mengandung.
 */
function matchHeader(rawHeader: string, module: SheetModuleDef): HeaderMatch | null {
  const normalized = normalizeHeader(rawHeader);
  if (!normalized) return null;

  let best: HeaderMatch | null = null;

  for (const column of module.columns) {
    const candidates = [column.key, column.label, ...column.aliases]
      .map(normalizeHeader)
      .filter((candidate) => candidate.length >= 2);

    for (const candidate of candidates) {
      let score = 0;
      if (normalized === candidate) {
        score = 4;
      } else if (candidate.length >= 4 && (normalized.startsWith(candidate) || candidate.startsWith(normalized))) {
        score = 3;
      } else if (candidate.length >= 4 && normalized.includes(candidate)) {
        score = 2;
      }

      if (score > 0 && (!best || score > best.score)) {
        best = { key: column.key, score };
      }
    }
  }

  return best;
}

/**
 * Ubah teks CSV menjadi baris objek sesuai skema modul.
 * Baris tanpa kolom wajib otomatis dibuang (mis. baris catatan/judul di atas tabel).
 */
export function parseSheetCsv(csvText: string, module: SheetModuleDef): ParsedSheet {
  const grid = parseCsv(csvText);
  const missingRequired = module.columns
    .filter((c) => c.required)
    .map((c) => c.label);

  if (grid.length === 0) {
    return {
      headers: [],
      records: [],
      missingRequired,
      unknownHeaders: [],
      warnings: [],
      droppedRows: []
    };
  }

  // Cari baris header: baris pertama yang memetakan minimal 1 kolom wajib
  let headerRowIndex = 0;
  let mapping: (HeaderMatch | null)[] = [];

  for (let i = 0; i < Math.min(grid.length, 10); i += 1) {
    const candidateMapping = grid[i].map((cell) => matchHeader(cell, module));
    const matchedRequired = new Set(
      candidateMapping
        .filter((m): m is HeaderMatch => Boolean(m))
        .map((m) => m.key)
        .filter((key) => module.columns.some((c) => c.key === key && c.required))
    );
    if (matchedRequired.size > 0) {
      headerRowIndex = i;
      mapping = candidateMapping;
      break;
    }
    if (i === Math.min(grid.length, 10) - 1) {
      headerRowIndex = 0;
      mapping = candidateMapping;
    }
  }

  const headers = grid[headerRowIndex] ?? [];
  const records: Record<string, string>[] = [];
  const warnings: string[] = [];
  const droppedRows: { row: number; reason: string }[] = [];
  const usedKeys = new Set<string>();

  for (let rowIndex = headerRowIndex + 1; rowIndex < grid.length; rowIndex += 1) {
    const row = grid[rowIndex];

    // Deteksi baris "meluber": koma tanpa tanda kutip membuat kolom bergeser
    if (headers.length > 1 && row.length > headers.length) {
      warnings.push(
        `Baris ${rowIndex + 1} memiliki ${row.length} kolom (header ${headers.length}). ` +
          `Kemungkinan ada isi sel yang mengandung koma tanpa tanda kutip — bungkus dengan "..." agar tidak bergeser.`
      );
    }

    const record: Record<string, string> = {};

    row.forEach((cell, columnIndex) => {
      const match = mapping[columnIndex];
      if (!match) return;
      // Kolom ganda: pertahankan nilai pertama yang tidak kosong
      if (record[match.key] && record[match.key].trim().length > 0) return;
      record[match.key] = cell;
    });

    // Wajib terisi
    const missingInRow = module.columns
      .filter((c) => c.required && (record[c.key] || "").trim().length === 0)
      .map((c) => c.label);

    if (missingInRow.length > 0) {
      // Baris berisi data tetapi kolom wajibnya kosong → catat agar admin tahu
      if (Object.values(record).some((value) => value.trim().length > 0)) {
        droppedRows.push({
          row: rowIndex + 1,
          reason: `Kolom wajib kosong: ${missingInRow.join(", ")}`
        });
      }
      continue;
    }

    if (Object.values(record).every((value) => value.trim().length === 0)) continue;

    records.push(record);
    mapping.forEach((m) => {
      if (m) usedKeys.add(m.key);
    });
  }

  const missingRequiredNow = module.columns
    .filter((c) => c.required && !usedKeys.has(c.key))
    .map((c) => c.label);

  const unknownHeaders = headers.filter((header, index) => {
    const normalized = normalizeHeader(header);
    if (!normalized) return false;
    return !mapping[index];
  });

  return {
    headers,
    records,
    missingRequired: missingRequiredNow,
    unknownHeaders,
    warnings,
    droppedRows
  };
}

// ══════════════════════════════════════════════════════════════════════════
// 5. HELPER NORMALISASI NILAI
// ══════════════════════════════════════════════════════════════════════════

function clean(value: string | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

/** Pecah daftar dengan pemisah •, ·, |, titik koma, atau baris baru. */
function splitList(value: string | undefined): string[] {
  if (!value) return [];
  const parts = value
    .split(/[•·|;\n\r]+/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter((part) => part.length > 0);

  return Array.from(new Set(parts));
}

function parseInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const match = value.match(/-?\d+/);
  if (!match) return fallback;
  const parsed = Number.parseInt(match[0], 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Status aktif: default aktif kecuali jelas-jelas dinonaktifkan. */
function parseActiveStatus(value: string | undefined): boolean {
  const normalized = normalizeHeader(value || "");
  if (!normalized) return true;
  if (/(nonaktif|tidakaktif|tidak|inactive|false|off|0)/.test(normalized)) return false;
  return true;
}

/** Petakan kategori sarana ke kosakata baku. */
function normalizeFacilityCategory(value: string | undefined): string {
  const normalized = normalizeHeader(value || "");
  if (!normalized) return "Lainnya";
  if (/masjid|musholla|mushala|musalla/.test(normalized)) return "Masjid";
  if (/maktabah|perpustakaan|pustaka|library|elibrary/.test(normalized)) return "Maktabah";
  if (/asrama|ma'had|mahad|kamar|dorm/.test(normalized)) return "Asrama";
  if (/lab|laboratorium/.test(normalized)) return "Laboratorium";
  if (/ruangkuliah|kelas|classroom|ruangbelajar/.test(normalized)) return "Ruang Kuliah";
  if (/aula|gedung|hall/.test(normalized)) return "Aula";
  return clean(value) || "Lainnya";
}

/** Petakan sifat matkul ke Wajib / Pilihan. */
function normalizeCourseType(value: string | undefined): string {
  const normalized = normalizeHeader(value || "");
  if (!normalized) return "Wajib";
  if (/pilihan|optional|elektif|elective/.test(normalized)) return "Pilihan";
  if (/wajib|mandatory|core/.test(normalized)) return "Wajib";
  return clean(value) || "Wajib";
}

/** Buang tanda @ di awal username Instagram. */
function normalizeInstagram(value: string | undefined): string {
  const cleaned = clean(value);
  if (!cleaned) return "";
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return cleaned.replace(/^@+/, "@");
}

/**
 * Inferensi divisi DeMa dari teks "Divisi / Amanah".
 * Dicocokkan dengan daftar divisi yang ada; bila gagal, pakai kata kunci jabatan.
 */
function inferDivisionId(
  divisiText: string,
  divisionIdHint: string,
  divisions: DemaDivision[] | undefined
): string {
  const raw = clean(divisiText);
  const normalized = normalizeHeader(raw);
  const hint = clean(divisionIdHint);

  // 1. Hint id eksplisit (mis. "div-bph")
  if (hint && (!divisions || divisions.some((d) => d.id === hint))) {
    return hint;
  }

  // 2. Cocokkan dengan nama/kode divisi yang terdaftar
  if (Array.isArray(divisions) && divisions.length > 0) {
    for (const division of divisions) {
      const code = normalizeHeader(division.code || "");
      const name = normalizeHeader(division.name || "");
      if (code.length >= 3 && normalized.includes(code)) return division.id;
      if (name.length >= 4 && normalized.includes(name)) return division.id;
    }

    // 3. Cocokkan potongan kata kunci nama divisi
    for (const division of divisions) {
      const name = normalizeHeader(division.name || "");
      const tokens = name.match(/[a-z]{4,}/g) || [];
      if (tokens.some((token) => normalized.includes(token))) return division.id;
    }
  }

  // 4. Fallback kata kunci jabatan
  if (/(ketua|wakil|sekretaris|bendahara|bph|presidium|pimpinan)/.test(normalized)) {
    const bph = divisions?.find((d) => d.code === "bph" || d.id === "div-bph");
    return bph?.id ?? "div-bph";
  }

  return "";
}

// ══════════════════════════════════════════════════════════════════════════
// 6. NORMALIZER PER MODUL
// ══════════════════════════════════════════════════════════════════════════

export interface NormalizeResult<T> {
  items: T[];
  /** Baris yang dibuang beserta alasannya */
  skipped: { row: number; reason: string }[];
}

export function normalizeMasyayikhRows(
  records: Record<string, string>[]
): NormalizeResult<Lecturer> {
  const skipped: { row: number; reason: string }[] = [];
  const items: Lecturer[] = [];

  records.forEach((record, index) => {
    const name = clean(record.nama);
    if (!name) {
      skipped.push({ row: index + 2, reason: "Nama kosong" });
      return;
    }

    const order = parseInteger(record.urutan, index + 1);
    const rawPhotoUrl = clean(record.foto_drive);

    items.push({
      id: `lec-sync-${order}-${index + 1}`,
      name,
      title: clean(record.jabatan) || "Dewan Masyayikh",
      role: clean(record.peran) || clean(record.jabatan) || "Dosen Pengampu",
      photoUrl: normalizePhotoUrl(rawPhotoUrl),
      rawPhotoUrl: rawPhotoUrl || undefined,
      expertise: clean(record.keahlian),
      education: splitList(record.pendidikan),
      publications: splitList(record.publikasi),
      order,
      isActive: parseActiveStatus(record.status),
      source: "spreadsheet"
    });
  });

  items.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  return { items, skipped };
}

export function normalizeKurikulumRows(
  records: Record<string, string>[]
): NormalizeResult<Course> {
  const skipped: { row: number; reason: string }[] = [];
  const items: Course[] = [];

  records.forEach((record, index) => {
    const name = clean(record.nama);
    const code = clean(record.kode);
    if (!name) {
      skipped.push({ row: index + 2, reason: "Nama mata kuliah kosong" });
      return;
    }

    const semesterRaw = parseInteger(record.semester, 1);
    const semester = Math.min(8, Math.max(1, semesterRaw));
    const credits = Math.max(0, parseInteger(record.sks, 2));

    items.push({
      id: `crs-sync-${code || index + 1}`,
      code: code || undefined,
      name,
      semester,
      credits,
      lecturer: clean(record.dosen) || "Dewan Masyaikh",
      description: clean(record.deskripsi),
      mainBook: clean(record.kitab_rujukan),
      supportBook: clean(record.kitab_pendukung),
      type: normalizeCourseType(record.sifat),
      order: index + 1,
      source: "spreadsheet"
    });
  });

  items.sort(
    (a, b) =>
      a.semester - b.semester ||
      (a.code || "").localeCompare(b.code || "") ||
      a.name.localeCompare(b.name)
  );

  return { items, skipped };
}

export function normalizeSaranaRows(
  records: Record<string, string>[]
): NormalizeResult<Facility> {
  const skipped: { row: number; reason: string }[] = [];
  const items: Facility[] = [];

  records.forEach((record, index) => {
    const name = clean(record.nama);
    if (!name) {
      skipped.push({ row: index + 2, reason: "Nama fasilitas kosong" });
      return;
    }

    const order = parseInteger(record.urutan, index + 1);
    const rawPhotoUrl = clean(record.foto_drive);

    items.push({
      id: `fac-sync-${order}-${index + 1}`,
      name,
      category: normalizeFacilityCategory(record.kategori),
      photoUrl: normalizePhotoUrl(rawPhotoUrl),
      rawPhotoUrl: rawPhotoUrl || undefined,
      description: clean(record.deskripsi),
      capacity: clean(record.kapasitas) || undefined,
      order,
      source: "spreadsheet"
    });
  });

  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
  return { items, skipped };
}

export interface DemaNormalizeOptions {
  divisions?: DemaDivision[];
  /** Anggota lama — dipakai untuk mempertahankan ID, foto, dan penanda highlight. */
  existingMembers?: DemaMember[];
}

export function normalizeDemaRows(
  records: Record<string, string>[],
  options: DemaNormalizeOptions = {}
): NormalizeResult<DemaMember> {
  const skipped: { row: number; reason: string }[] = [];
  const items: DemaMember[] = [];
  const existing = Array.isArray(options.existingMembers) ? options.existingMembers : [];

  const normalizeKey = (value: string) => normalizeHeader(value);

  records.forEach((record, index) => {
    const name = clean(record.nama);
    if (!name) {
      skipped.push({ row: index + 2, reason: "Nama pengurus kosong" });
      return;
    }

    const previous = existing.find(
      (member) =>
        normalizeKey(member.name) === normalizeKey(name) ||
        (member.nim && clean(record.nim) && clean(member.nim) === clean(record.nim))
    );

    const rawPhotoUrl = clean(record.foto_drive) || clean(previous?.rawPhotoUrl);
    const photoUrl = normalizePhotoUrl(rawPhotoUrl) || previous?.photoUrl || "";

    const divisionId =
      inferDivisionId(record.divisi || "", "", options.divisions) ||
      previous?.divisionId ||
      "div-bph";

    items.push({
      id: previous?.id ?? `mem-sync-${index + 1}`,
      name,
      role: clean(record.divisi) || clean(previous?.role) || "Anggota",
      divisionId,
      nim: clean(record.nim) || clean(previous?.nim),
      marhalah: clean(record.marhalah) || clean(previous?.marhalah),
      photoUrl,
      rawPhotoUrl: rawPhotoUrl || undefined,
      instagram: normalizeInstagram(record.instagram) || previous?.instagram,
      phone: clean(record.whatsapp) || previous?.phone,
      bio: clean(record.bio) || clean(previous?.bio),
      quote: clean(record.quote) || clean(previous?.quote),
      order: parseInteger(clean(record.urutan), index + 1),
      isActive: true,
      isHighlighted: previous?.isHighlighted ?? false
    });
  });

  // Urutan BPH diutamakan
  items.sort((a, b) => a.order - b.order);

  return { items, skipped };
}

// ══════════════════════════════════════════════════════════════════════════
// 7. TEMPLATE CSV SIAP UNDUH
// ══════════════════════════════════════════════════════════════════════════

type CsvDialect = "excel" | "sheets";

/** Bungkus sel hanya bila perlu agar berkas enak dibaca di Notepad/Sheets. */
function csvCell(value: string, delimiter: string): string {
  const normalized = (value ?? "").replace(/\r\n/g, "\n");
  const needsQuote =
    normalized.includes(delimiter) ||
    normalized.includes('"') ||
    /[\r\n]/.test(normalized) ||
    /^\s|\s$/.test(normalized);
  return needsQuote ? `"${normalized.replace(/"/g, '""')}"` : normalized;
}

/**
 * Bangun teks template CSV (baris judul + 1 baris contoh).
 *
 * - `excel`  : pemisah titik koma + baris petunjuk `sep=;` + BOM UTF-8.
 *   Baris `sep=;` membuat Excel ( termasuk versi berbahasa Indonesia yang
 *   pemisah daftarnya `;` ) langsung memecah kolom dengan benar, tidak lagi
 *   menumpuk semuanya di kolom A.
 * - `sheets` : pemisah koma + BOM, untuk Google Sheets / Numbers.
 *
 * Kedua varian tetap dapat diunggah balik ke panel karena parser mendeteksi
 * pemisah secara otomatis dan mengabaikan baris `sep=`.
 */
export function buildCsvTemplate(module: SheetModuleDef, dialect: CsvDialect = "excel"): string {
  const delimiter = dialect === "excel" ? ";" : ",";
  const header = module.columns.map((c) => csvCell(c.label, delimiter)).join(delimiter);
  const example = module.columns.map((c) => csvCell(c.example, delimiter)).join(delimiter);
  const sepHint = dialect === "excel" ? `sep=${delimiter}\r\n` : "";
  return `\uFEFF${sepHint}${header}\r\n${example}\r\n`;
}

/** Nama berkas: template-masyayikh-excel.csv / template-masyayikh-google-sheets.csv */
export function buildCsvTemplateFileName(
  module: SheetModuleDef,
  dialect: CsvDialect = "excel"
): string {
  const suffix = dialect === "excel" ? "excel" : "google-sheets";
  return `template-${module.id}-${suffix}.csv`;
}

// ══════════════════════════════════════════════════════════════════════════
// 8. RESOLUSI URL GOOGLE SHEETS
// ══════════════════════════════════════════════════════════════════════════

export interface SheetSource {
  /** ID spreadsheet */
  sheetId: string;
  /** Nama tab (opsional) */
  sheetName?: string;
  /** GID tab (opsional, alternatif nama) */
  gid?: string;
  /** URL CSV siap unduh */
  csvUrl: string;
}

const SHEET_ID_PATTERN = /\/spreadsheets\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]{20,})/;

/**
 * Terima beragam bentuk tautan Google Sheets lalu bangun URL unduh CSV (gviz).
 *  - https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=0
 *  - https://docs.google.com/spreadsheets/d/SHEET_ID/gviz/tq?tqx=out:csv&sheet=NAMA
 *  - https://docs.google.com/spreadsheets/d/e/PUB_ID/pub?output=csv   (langsung dipakai)
 *  - SHEET_ID mentah
 */
export function resolveSheetSource(input: string, sheetName?: string): SheetSource | null {
  const trimmed = (input || "").trim();
  if (!trimmed) return null;

  // Sudah berupa URL CSV publik (published to web)
  if (/^https?:\/\//i.test(trimmed) && /(output=csv|tqx=out:csv|format=csv)/i.test(trimmed)) {
    const parsed = new URL(trimmed);
    const nameFromUrl = parsed.searchParams.get("sheet") || undefined;
    const gidFromUrl = parsed.searchParams.get("gid") || undefined;
    const idMatch = trimmed.match(SHEET_ID_PATTERN);
    return {
      sheetId: idMatch?.[1] || "published-csv",
      sheetName: sheetName || nameFromUrl,
      gid: gidFromUrl,
      csvUrl: trimmed
    };
  }

  let sheetId = "";
  let gid: string | undefined;

  if (/^https?:\/\//i.test(trimmed)) {
    const idMatch = trimmed.match(SHEET_ID_PATTERN);
    if (!idMatch) return null;
    sheetId = idMatch[1];

    const gidFromHash = trimmed.match(/[#&?]gid=(\d+)/);
    if (gidFromHash) gid = gidFromHash[1];

    const nameFromQuery = trimmed.match(/[?&]sheet=([^&]+)/);
    if (nameFromQuery?.[1] && !sheetName) {
      sheetName = decodeURIComponent(nameFromQuery[1].replace(/\+/g, " "));
    }
  } else if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    sheetId = trimmed;
  } else {
    return null;
  }

  const params = new URLSearchParams({ tqx: "out:csv" });
  if (sheetName && sheetName.trim()) {
    params.set("sheet", sheetName.trim());
  } else if (gid) {
    params.set("gid", gid);
  }
  params.set("headers", "1");

  return {
    sheetId,
    sheetName: sheetName?.trim() || undefined,
    gid,
    csvUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?${params.toString()}`
  };
}
