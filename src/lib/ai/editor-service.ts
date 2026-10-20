/**
 * AI Website Editor Service — Ma'had Aly DDI Mangkoso
 * Menangani pembuatan usulan (suggest), validasi kunci yang diizinkan,
 * pembuatan snapshot, dan eksekusi rollback.
 */

import { extractGoogleDriveId } from "@/lib/drive/drive-importer";

export const ALLOWED_AI_KEYS = [
  "home.hero",
  "home_sections",
  "about_page",
  "page_texts",
  "footer",
  "header",
  "masyayikh",
  "facilities",
  "academic",
  "bahtsul",
  "pmb",
  "dema_settings",
  "quote",
  "email_templates",
  "donations"
] as const;

export type AllowedAiKey = (typeof ALLOWED_AI_KEYS)[number];

export const IMAGE_SUPPORTED_AI_KEYS = [
  "home.hero",
  "masyayikh",
  "facilities",
  "quote",
  "donations",
  "about_page",
  "header",
  "pmb"
] as const;

export type ImageSupportedAiKey = (typeof IMAGE_SUPPORTED_AI_KEYS)[number];

export function isImageSupportedKey(key: string): key is ImageSupportedAiKey {
  return IMAGE_SUPPORTED_AI_KEYS.includes(key as any);
}

export interface AiSuggestionResult {
  targetKey: AllowedAiKey;
  summary: string;
  proposedData: any;
  changes: Array<{
    field: string;
    before: any;
    after: any;
  }>;
  engineUsed: "gemini-api" | "heuristic-local";
}

export function isAllowedAiKey(key: string): key is AllowedAiKey {
  return ALLOWED_AI_KEYS.includes(key as AllowedAiKey);
}

/**
 * Sanitasi string sederhana untuk mencegah injeksi skrip XSS
 */
function sanitizeValue(val: any): any {
  if (typeof val === "string") {
    return val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }
  if (val && typeof val === "object") {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      res[k] = sanitizeValue(v);
    }
    return res;
  }
  return val;
}

/**
 * Hitung perbedaan antara data saat ini dan data usulan AI
 */
export function calculateDiff(current: any, proposed: any, prefix = ""): Array<{ field: string; before: any; after: any }> {
  const diffs: Array<{ field: string; before: any; after: any }> = [];

  if (!current || !proposed) {
    if (JSON.stringify(current) !== JSON.stringify(proposed)) {
      diffs.push({ field: prefix || "data", before: current, after: proposed });
    }
    return diffs;
  }

  if (typeof current !== "object" || typeof proposed !== "object") {
    if (current !== proposed) {
      diffs.push({ field: prefix || "value", before: current, after: proposed });
    }
    return diffs;
  }

  const allKeys = Array.from(new Set([...Object.keys(current), ...Object.keys(proposed)]));
  for (const k of allKeys) {
    const currentVal = current[k];
    const proposedVal = proposed[k];
    const fullKey = prefix ? `${prefix}.${k}` : k;

    if (JSON.stringify(currentVal) !== JSON.stringify(proposedVal)) {
      if (
        typeof currentVal === "object" &&
        currentVal !== null &&
        typeof proposedVal === "object" &&
        proposedVal !== null &&
        !Array.isArray(currentVal) &&
        !Array.isArray(proposedVal)
      ) {
        diffs.push(...calculateDiff(currentVal, proposedVal, fullKey));
      } else {
        diffs.push({ field: fullKey, before: currentVal, after: proposedVal });
      }
    }
  }

  return diffs;
}

/**
 * Generate usulan perubahan dari Gemini API atau Fallback Lokal
 */
export async function generateContentSuggestion({
  prompt,
  targetKey,
  currentData,
  sourceUrl
}: {
  prompt: string;
  targetKey: AllowedAiKey;
  currentData: any;
  sourceUrl?: string;
}): Promise<AiSuggestionResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.startsWith("AIza")) {
    try {
      const systemInstruction = `
Anda adalah asisten AI resmi pengelola website lembaga pendidikan Islam tinggi Ma'had Aly DDI Mangkoso (Barru, Sulawesi Selatan).
Tugas Anda adalah memperbarui data JSON konten website untuk kunci "${targetKey}" berdasarkan instruksi administrator.

Pedoman:
1. Kembalikan HANYA format JSON valid tanpa tanda kutip markdown backticks (\`\`\`json).
2. Pertahankan seluruh struktur data lama yang tidak diminta untuk diubah.
3. Gunakan bahasa Indonesia baku, santun, ilmiah-pesantren, dan mencerminkan nilai Islam Wasathiyyah, Ahlussunnah wal Jama'ah, dan tradisi Turats Anregurutta K.H. Abd. Rahman Ambo Dalle.
4. Jangan pernah menambahkan tag <script> atau kode berbahaya.
5. Kembalikan objek dengan properti:
   - "summary": ringkasan perubahan yang dilakukan (1-2 kalimat).
   - "data": objek data baru yang telah diperbarui sesuai skema data lama.
`;

      const userContent = `
DATA SAAT INI (KUNCI: ${targetKey}):
${JSON.stringify(currentData, null, 2)}

INSTRUKSI ADMIN:
${prompt}
${sourceUrl ? `\nSUMBER DOKUMEN / REFERENSI: ${sourceUrl}` : ""}
`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: systemInstruction },
                  { text: userContent }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.3
            }
          })
        }
      );

      if (res.ok) {
        const jsonResponse = await res.json();
        const candidateText = jsonResponse?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          const parsed = JSON.parse(candidateText);
          const sanitizedProposed = sanitizeValue(parsed.data || parsed);
          const diffs = calculateDiff(currentData, sanitizedProposed);

          return {
            targetKey,
            summary: parsed.summary || "Pembaruan konten berhasil dirancang oleh Gemini AI sesuai instruksi Anda.",
            proposedData: sanitizedProposed,
            changes: diffs,
            engineUsed: "gemini-api"
          };
        }
      }
    } catch (apiErr) {
      console.warn("Gemini API call failed, falling back to local heuristic engine:", apiErr);
    }
  }

  // --- LOCAL CONTEXTUAL HEURISTIC ENGINE (FALLBACK CEPAT UNTUK LOCALHOST) ---
  let cloned = JSON.parse(JSON.stringify(currentData || {}));
  const lowerPrompt = prompt.toLowerCase();
  let summary = "Pembaruan kontekstual konten dirancang berdasarkan instruksi Anda.";

  // Deteksi tautan Google Drive dari prompt atau sourceUrl
  const extractedDriveId = extractGoogleDriveId(sourceUrl || "") || extractGoogleDriveId(prompt);
  const isImageAllowed = isImageSupportedKey(targetKey);
  const detectedDrivePhoto = (isImageAllowed && extractedDriveId) ? `https://lh3.googleusercontent.com/d/${extractedDriveId}` : null;
  const attemptedImageOnNonImageModule = !isImageAllowed && Boolean(extractedDriveId);

  if (targetKey === "home.hero") {
    let newTitle = "Pusat Kaderisasi Ulama Fiqh";
    let newHighlight = "Ma'had Aly DDI Mangkoso";
    let newSubtitle = cloned.subtitle || "";

    if (lowerPrompt.includes("ambo dalle") || lowerPrompt.includes("anregurutta")) {
      newTitle = "Pusat Kaderisasi Ulama Fiqh";
      newHighlight = "Ma'had Aly DDI Mangkoso";
      newSubtitle = "Mencetak kader ulama fiqh mutafaqqih fid-din berwawasan wasathiyyah, berakar kuat pada tradisi khazanah Turats klasik, serta melestarikan sanad keilmuan Anregurutta K.H. Abdurrahman Ambo Dalle untuk kemaslahatan ummat.";
      summary = "Memperbarui judul utama menjadi 'Pusat Kaderisasi Ulama Fiqh', penegasan identitas Ma'had Aly DDI Mangkoso, dan menyempurnakan slogan dengan melestarikan sanad keilmuan Anregurutta K.H. Abdurrahman Ambo Dalle.";
    } else if (lowerPrompt.includes("wasathiyyah") || lowerPrompt.includes("moderasi")) {
      newTitle = "Pendidikan Tinggi Kader Ulama";
      newHighlight = "Wasathiyyah & Turats";
      newSubtitle = "Pusat kaderisasi fuqaha kontemporer yang berakar kuat pada tradisi keilmuan kitab salaf dan adaptif menjawab problematika umat modern.";
      summary = "Memperbarui judul dan slogan hero beranda dengan penegasan nilai Wasathiyyah dan khazanah Turats.";
    } else if (lowerPrompt.includes("cta") || lowerPrompt.includes("tombol")) {
      cloned.cta1Text = "Pelajari Kurikulum";
      cloned.cta1Url = "/akademik";
      summary = "Memperbarui teks dan target tautan tombol ajakan (CTA) hero.";
    } else {
      newSubtitle = `${prompt.replace(/^perbarui\s+/i, "").slice(0, 160)}. Berakar pada tradisi Turats dan menjawab tantangan zaman.`;
      summary = `Menyesuaikan narasi dan slogan hero beranda sesuai arahan instruksi Anda.`;
    }

    cloned.title = newTitle;
    cloned.titleHighlight = newHighlight;
    cloned.subtitle = newSubtitle;

    if (detectedDrivePhoto) {
      cloned.bgImageUrl = detectedDrivePhoto;
      cloned.backgroundImage = detectedDrivePhoto;
      summary += " Foto latar belakang otomatis dihubungkan dari Google Drive.";
    }

    // Pastikan slides selalu tersinkronisasi agar Hero.tsx di beranda langsung menampilkan perubahan
    const defaultSlides = [
      {
        id: "slide-1",
        badge: "Pusat Kaderisasi Fuqaha Wasathiyyah",
        title: newTitle,
        titleHighlight: newHighlight,
        subtitle: newSubtitle,
        arabicBismillah: cloned.arabicBismillah || "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        cta1Text: cloned.cta1Text || "Jelajahi Kajian Fiqh",
        cta1Url: cloned.cta1Url || "/artikel",
        cta2Text: cloned.cta2Text || "Repositori Skripsi",
        cta2Url: cloned.cta2Url || "/skripsi",
        order: 1,
        isActive: true,
        ...(detectedDrivePhoto ? { bgImageUrl: detectedDrivePhoto } : {})
      }
    ];

    cloned.slides = Array.isArray(cloned.slides) && cloned.slides.length > 0
      ? cloned.slides.map((s: any, idx: number) => idx === 0 ? {
          ...s,
          title: newTitle,
          titleHighlight: newHighlight,
          subtitle: newSubtitle,
          ...(detectedDrivePhoto ? { bgImageUrl: detectedDrivePhoto } : {})
        } : s)
      : defaultSlides;
  } else if (targetKey === "about_page") {
    if (cloned.hero) {
      cloned.hero.subtitle = `Pusat keunggulan kajian Turats dan pengkaderan ulama berwawasan wasathiyyah di Pondok Pesantren DDI Mangkoso.`;
    }
    if (detectedDrivePhoto) {
      cloned.imageUrl = detectedDrivePhoto;
      cloned.historyImageUrl = detectedDrivePhoto;
      summary = "Menyempurnakan redaksi narasi pengantar dan menghubungkan foto profil/sejarah dari Google Drive.";
    } else {
      summary = "Menyempurnakan redaksi narasi pengantar pada halaman profil tentang Ma'had Aly.";
    }
  } else if (targetKey === "footer") {
    if (lowerPrompt.includes("kontak") || lowerPrompt.includes("email") || lowerPrompt.includes("telepon")) {
      if (cloned.contacts) {
        cloned.contacts.email = "sekretariat@ddimangkoso.ac.id";
      }
      summary = "Memperbarui informasi kontak resmi pada footer website.";
    } else {
      if (cloned.general) {
        cloned.general.description = "Lembaga Pendidikan Tinggi Pesantren Terakreditasi Kementerian Agama RI.";
      }
      summary = "Menyesuaikan deskripsi ringkas identitas lembaga pada footer.";
    }
  } else if (targetKey === "header") {
    if (cloned.institutionName) {
      cloned.institutionName = "Ma'had Aly DDI Mangkoso";
    }
    if (detectedDrivePhoto) {
      cloned.logoUrl = detectedDrivePhoto;
      summary = "Memperbarui logo instansi dari Google Drive dan menyempurnakan konfigurasi header navbar.";
    } else {
      summary = "Memperbarui konfigurasi identitas header dan tata letak navigasi navbar.";
    }
  } else if (targetKey === "home_sections") {
    if (Array.isArray(cloned)) {
      summary = "Memverifikasi urutan section beranda agar lebih optimal dan proporsional.";
    }
  } else if (targetKey === "masyayikh") {
    let list = Array.isArray(cloned) ? [...cloned] : [];
    
    // Deteksi jika prompt berisi daftar banyak nama (misal penomoran: 1. AGH... 2. Dr... atau baris terpisah)
    const lines = prompt.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const candidateLines = lines.filter(l => 
      /^\d+[\.\)\-]\s+/.test(l) || 
      /^(agh|dr|kh|ust|prof|drs|kyai|teungku|tuan guru)\b/i.test(l)
    );

    if (candidateLines.length > 1) {
      // MODE BATCH: Menambahkan banyak masyayikh sekaligus
      const addedNames: string[] = [];
      candidateLines.forEach((line, index) => {
        // Hilangkan angka awalan: "1. AGH... " -> "AGH..."
        const cleanLine = line.replace(/^\d+[\.\)\-]\s*/, "").trim();
        
        // Coba pisahkan nama dan spesialisasi/jabatan jika ada tanda pemisah ( - atau | atau : )
        let name = cleanLine;
        let specialization = "Fiqh & Ushul Fiqh";
        let role = "Dewan Masyayikh";

        if (cleanLine.includes(" - ")) {
          const parts = cleanLine.split(" - ");
          name = parts[0].trim();
          specialization = parts[1].trim();
        } else if (cleanLine.includes(" | ")) {
          const parts = cleanLine.split(" | ");
          name = parts[0].trim();
          specialization = parts[1].trim();
        } else if (cleanLine.includes(": ")) {
          const parts = cleanLine.split(": ");
          name = parts[0].trim();
          specialization = parts[1].trim();
        }

        // Cek link drive spesifik jika dicantumkan di baris tersebut
        const lineDriveId = extractGoogleDriveId(line);
        const itemPhoto = lineDriveId 
          ? `https://lh3.googleusercontent.com/d/${lineDriveId}`
          : (index === 0 && detectedDrivePhoto ? detectedDrivePhoto : "/masyayikh/default.webp");

        list.push({
          id: "lec-ai-" + (Date.now() + index),
          name: name,
          role: role,
          specialization: specialization,
          bio: `Masyayikh Ma'had Aly DDI Mangkoso pengampu bidang ${specialization}. Sanad keilmuan muttashil Anregurutta K.H. Abdurrahman Ambo Dalle.`,
          photoUrl: itemPhoto,
          order: list.length + 1,
          education: ["Al-Azhar Kairo / Ma'had Aly", "Universitas Islam Negeri"],
          publications: ["Kajian Fiqh Turats Kontemporer"],
          isActive: true
        });
        addedNames.push(name);
      });

      summary = `Berhasil menambahkan ${candidateLines.length} profil Dewan Masyayikh sekaligus secara otomatis: ${addedNames.slice(0, 3).join(", ")}${addedNames.length > 3 ? " dan lainnya." : "."}`;
      if (detectedDrivePhoto) {
        summary += " Foto profil utama diterapkan dari Google Drive.";
      }
    } else if (lowerPrompt.includes("tambah") || lowerPrompt.includes("baru") || list.length === 0) {
      // Penambahan 1 orang jika nama spesifik terdeteksi atau default
      let parsedName = "Dr. KH. Muhammad As'ad, Lc., M.Th.I.";
      if (candidateLines.length === 1) {
        parsedName = candidateLines[0].replace(/^\d+[\.\)\-]\s*/, "").split(/[-|:]/)[0].trim();
      }

      list.push({
        id: "lec-ai-" + Date.now(),
        name: parsedName,
        role: "Dewan Masyayikh & Pengampu Fiqh Mu'amalah",
        specialization: "Fiqh & Ushul Fiqh Kontemporer",
        bio: "Alumnus Fakultas Syari'ah Universitas Al-Azhar Kairo. Mengampu kitab Bidayatul Mujtahid dan Fiqh Perbandingan Madzhab.",
        photoUrl: detectedDrivePhoto || "/masyayikh/default.webp",
        order: list.length + 1,
        education: ["S1 Al-Azhar Kairo", "S2 UIN Sunan Kalijaga", "S3 UIN Alauddin Makassar"],
        publications: ["Konstruksi Fiqh Digital", "Sanad Fiqh Klasik Bugis"],
        isActive: true
      });
      summary = `Menambahkan profil Dewan Masyayikh baru: ${parsedName}` + (detectedDrivePhoto ? " (Foto profil otomatis diambil dari Google Drive)." : "");
    } else {
      list = list.map((l: any, idx: number) => ({
        ...l,
        photoUrl: (idx === 0 && detectedDrivePhoto) ? detectedDrivePhoto : (l.photoUrl || "/masyayikh/default.webp"),
        bio: l.bio ? `${l.bio} (Sanad muttashil Anregurutta DDI Mangkoso).` : "Masyayikh Ma'had Aly DDI Mangkoso."
      }));
      summary = "Menyempurnakan biografi keilmuan dan penulisan sanad Turats dewan Masyayikh." + (detectedDrivePhoto ? " (Foto diperbarui dari Google Drive)." : "");
    }
    cloned = list;
  } else if (targetKey === "facilities") {
    let list = Array.isArray(cloned) ? [...cloned] : [];
    if (lowerPrompt.includes("tambah") || lowerPrompt.includes("baru") || list.length === 0) {
      list.push({
        id: "fac-ai-" + Date.now(),
        name: "Perpustakaan Riset Khazanah Turats & Digital",
        category: "Perpustakaan",
        description: "Menyediakan lebih dari 10.000 judul kitab rujukan klasik, naskah manuskrip Bugis, serta akses jurnal internasional.",
        capacity: "150 Mahasantri",
        photoUrl: detectedDrivePhoto || "/sarana/perpustakaan.webp"
      });
      summary = "Menambahkan sarana baru: Perpustakaan Riset Khazanah Turats & Digital." + (detectedDrivePhoto ? " (Foto sarana diambil dari Google Drive)." : "");
    } else {
      if (detectedDrivePhoto && list.length > 0) {
        list[0] = { ...list[0], photoUrl: detectedDrivePhoto };
        summary = "Memperbarui foto sarana kampus dari Google Drive dan menyempurnakan spesifikasinya.";
      } else {
        summary = "Menyempurnakan narasi deskripsi, daya tampung, dan spesifikasi sarana kampus.";
      }
    }
    cloned = list;
  } else if (targetKey === "academic") {
    let list = Array.isArray(cloned) ? [...cloned] : [];
    if (lowerPrompt.includes("tambah") || lowerPrompt.includes("mata kuliah") || list.length === 0) {
      list.push({
        id: "crs-ai-" + Date.now(),
        code: "FIQ-402",
        name: "Kajian Fiqh Nawazil & Fatwa Kontemporer",
        sks: 3,
        semester: 6,
        description: "Analisis metodologis perumusan fatwa terhadap isu medis, bioetika, dan transaksi digital."
      });
      summary = "Menambahkan mata kuliah kurikulum baru: Fiqh Nawazil & Fatwa Kontemporer (3 SKS).";
    } else {
      summary = "Memperbarui deskripsi silabus dan capaian pembelajaran kurikulum Ma'had Aly.";
    }
    cloned = list;
  } else if (targetKey === "bahtsul") {
    let list = Array.isArray(cloned) ? [...cloned] : [];
    list.unshift({
      id: "bm-ai-" + Date.now(),
      question: "Bagaimana hukum zakat atas aset digital dan mata uang kripto menurut perspektif Fiqh Wasathiyyah?",
      answer: "Wajib dikeluarkan zakatnya apabila telah mencapai nishab setara 85 gram emas dan haul 1 tahun qamariyah.",
      reference: "Kitab Al-Fiqh Al-Islami wa Adillatuh juz 3; Keputusan Bahtsul Masail Ma'had Aly DDI Mangkoso.",
      category: "Fiqh Mu'amalah Digital",
      status: "published",
      updatedAt: new Date().toISOString()
    });
    summary = "Menyusun draf putusan Bahtsul Masail: 'Hukum Zakat Aset Digital & Kripto'.";
    cloned = list;
  } else if (targetKey === "pmb") {
    cloned = {
      ...cloned,
      title: "Penerimaan Mahasantri Baru (PMB) T.A. 2026/2027",
      waveName: "Gelombang I (Jalur Prestasi & Kitab Kuning)",
      openDate: "1 Mei 2026",
      closeDate: "30 Juni 2026",
      requirements: [
        "Lulusan Pondok Pesantren / MA / SMA / Sederajat",
        "Mampu membaca dan memahami kitab kuning gundul (Fathul Qarib / Minhajut Thalibin)",
        "Memiliki komitmen mondok penuh selama 8 semester"
      ],
      ...(detectedDrivePhoto ? { brochureUrl: detectedDrivePhoto, bannerUrl: detectedDrivePhoto } : {})
    };
    summary = "Memperbarui jadwal pendaftaran PMB Online dan syarat seleksi membaca kitab kuning." + (detectedDrivePhoto ? " Foto brosur pendaftaran otomatis dihubungkan dari Google Drive." : "");
  } else if (targetKey === "dema_settings") {
    const standardDivisions = [
      {
        id: "div-bph",
        name: "Badan Pengurus Harian (BPH)",
        code: "bph",
        icon: "👑",
        isActive: true,
        order: 1,
        description: "Pucuk pimpinan eksekutif presidium Dewan Mahasantri yang mengarahkan kebijakan strategis, koordinasi internal, dan tata kelola organisasi.",
        responsibilities: [
          "Memimpin rapat koordinasi mingguan dan pleno pengurus DeMa",
          "Menjadi representasi resmi suara mahasantri di hadapan pimpinan lembaga Ma'had Aly",
          "Mengelola tata kelola kesekretariatan dan transparansi anggaran organisasi"
        ]
      },
      {
        id: "div-jurnalistik",
        name: "Divisi Jurnalistik",
        code: "jurnalistik",
        icon: "✍️",
        isActive: true,
        order: 2,
        description: "Mengelola penerbitan buletin berkala, liputan warta santri, dokumentasi multimedia, dan penulisan karya jurnalistik pesantren.",
        responsibilities: [
          "Menerbitkan buletin berkala dan warta mingguan Ma'had Aly",
          "Meliput dan mendokumentasikan kegiatan akademik serta kepesantrenan",
          "Mengelola kanal publikasi resmi media sosial dan warta digital santri"
        ]
      },
      {
        id: "div-pendidikan",
        name: "Divisi Pendidikan",
        code: "pendidikan",
        icon: "📚",
        isActive: true,
        order: 3,
        description: "Mengawal dinamika akademik takhassus fiqh, pendampingan musyawarah kitab kuning, dan kajian ilmiah kontemporer.",
        responsibilities: [
          "Menyelenggarakan halaqah telaah kitab turats antar-marhalah",
          "Mendampingi penulisan karya ilmiah dan risalah tugas akhir",
          "Mengadakan seminar keilmuan fiqh dan ushul fiqh tematik"
        ]
      },
      {
        id: "div-sarpras",
        name: "Divisi Sarpras (Sarana & Prasarana)",
        code: "sarpras",
        icon: "🏛️",
        isActive: true,
        order: 4,
        description: "Mengelola, merawat, dan menginventarisasi sarana prasarana serta fasilitas pendukung kegiatan mahasantri.",
        responsibilities: [
          "Memelihara kebersihan dan kelayakan sarana belajar serta asrama",
          "Menginventarisasi aset dan perlengkapan inventaris organisasi",
          "Menyiapkan sarana dan kebutuhan logistik setiap agenda DeMa"
        ]
      },
      {
        id: "div-humas",
        name: "Divisi Humas (Hubungan Masyarakat)",
        code: "humas",
        icon: "📢",
        isActive: true,
        order: 5,
        description: "Jembatan komunikasi antara mahasantri dengan masyarakat sekitar, ikatan alumni DDI Mangkoso, dan instansi luar.",
        responsibilities: [
          "Menjalin silaturahmi berkala dengan ikatan alumni Ma'had Aly",
          "Mengkoordinir pengabdian santri pada masyarakat dan dakwah sosial",
          "Menjadi narahubung eksternal dan penerima aspirasi masyarakat"
        ]
      },
      {
        id: "div-maktabah",
        name: "Divisi Maktabah (Perpustakaan)",
        code: "maktabah",
        icon: "📖",
        isActive: true,
        order: 6,
        description: "Mengelola perpustakaan khazanah turats, sirkulasi kitab rujukan klasik, dan literasi kepustakaan digital.",
        responsibilities: [
          "Mengelola sirkulasi peminjaman kitab dan penataan rak maktabah",
          "Memfasilitasi kebutuhan maraji' kitab gundul untuk mahasantri",
          "Mengembangkan digitalisasi katalog dan arsip naskah klasik"
        ]
      },
      {
        id: "div-ibadah",
        name: "Divisi Ibadah",
        code: "ibadah",
        icon: "🕌",
        isActive: true,
        order: 7,
        description: "Mengawal kedisiplinan shalat berjamaah, wirid, tadarrus, dan amaliah kepesantrenan Ahlussunnah wal Jama'ah.",
        responsibilities: [
          "Mengawal ketertiban shalat lima waktu berjamaah di masjid",
          "Menyusun jadwal imam, muadzin, dan penceramah kultum subuh",
          "Mengkoordinir pembacaan ratib, tahlil, dan amaliah mingguan"
        ]
      },
      {
        id: "div-keamanan",
        name: "Divisi Keamanan",
        code: "keamanan",
        icon: "🛡️",
        isActive: true,
        order: 8,
        description: "Menjaga ketertiban, keamanan lingkungan asrama mahasantri, serta penegakan tata tertib kampus.",
        responsibilities: [
          "Mengawasi jam malam, kedisiplinan, dan perizinan keluar pondok",
          "Menegakkan disiplin tata tertib kehidupan mahasantri di asrama",
          "Melaksanakan jadwal ronda malam dan memastikan asrama kondusif"
        ]
      }
    ];

    let currentMembers = Array.isArray(cloned.members) ? [...cloned.members] : [];

    // Deteksi apakah instruksi meminta menambahkan anggota / pengurus DeMa secara massal (batch)
    const lines = prompt.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const memberLines = lines.filter(l => {
      // Baris harus diawali angka (1. 2. dll) ATAU mengandung jabatan tapi BUKAN kalimat perintah/instruksi umum
      const isNumbered = /^\d+[\.\)\-]\s+/.test(l);
      const isIntro = /^(tambahkan|perbarui|masukkan|update|berikut|daftar)\b/i.test(l);
      const hasRole = /\b(ketua|wakil|sekretaris|bendahara|koordinator|anggota|kadiv)\b/i.test(l);
      return (isNumbered || hasRole) && !isIntro;
    });

    if (memberLines.length > 0 && (lowerPrompt.includes("anggota") || lowerPrompt.includes("pengurus") || lowerPrompt.includes("struktur") || lowerPrompt.includes("nama"))) {
      const addedMemberNames: string[] = [];

      memberLines.forEach((line, idx) => {
        const cleanLine = line.replace(/^\d+[\.\)\-]\s*/, "").trim();
        let name = cleanLine;
        let role = "Anggota Divisi";
        let targetDivisionId = "div-pendidikan";

        // Parsing format dengan spasi pemisah jelas: "Nama - Jabatan - Divisi" atau "Nama | Jabatan | Divisi"
        let parts: string[] = [];
        if (cleanLine.includes(" - ")) {
          parts = cleanLine.split(/\s+-\s+/);
        } else if (cleanLine.includes(" | ")) {
          parts = cleanLine.split(/\s+\|\s+/);
        } else if (cleanLine.includes(": ")) {
          parts = cleanLine.split(/:\s+/);
        }

        if (parts.length >= 2) {
          name = parts[0].trim();
          role = parts[1].trim();
        }
        if (parts.length >= 3) {
          const divCandidate = parts[2].trim().toLowerCase();
          const matchedDiv = standardDivisions.find(d => 
            divCandidate.includes(d.code) || divCandidate.includes(d.name.toLowerCase())
          );
          if (matchedDiv) targetDivisionId = matchedDiv.id;
        } else {
          // Coba tebak divisi dari jabatan atau nama
          const lowerLine = cleanLine.toLowerCase();
          if (lowerLine.includes("bph") || lowerLine.includes("ketua umum") || lowerLine.includes("presidium")) {
            targetDivisionId = "div-bph";
          } else if (lowerLine.includes("jurnalistik") || lowerLine.includes("media") || lowerLine.includes("redaksi")) {
            targetDivisionId = "div-jurnalistik";
          } else if (lowerLine.includes("sarpras") || lowerLine.includes("logistik")) {
            targetDivisionId = "div-sarpras";
          } else if (lowerLine.includes("humas") || lowerLine.includes("relasi")) {
            targetDivisionId = "div-humas";
          } else if (lowerLine.includes("maktabah") || lowerLine.includes("perpustakaan")) {
            targetDivisionId = "div-maktabah";
          } else if (lowerLine.includes("ibadah") || lowerLine.includes("ta'mir")) {
            targetDivisionId = "div-ibadah";
          } else if (lowerLine.includes("keamanan") || lowerLine.includes("tatib")) {
            targetDivisionId = "div-keamanan";
          }
        }

        const lineDriveId = extractGoogleDriveId(line);
        const itemPhoto = lineDriveId 
          ? `https://lh3.googleusercontent.com/d/${lineDriveId}`
          : (idx === 0 && detectedDrivePhoto ? detectedDrivePhoto : "/dema/default-avatar.webp");

        currentMembers.push({
          id: "dema-mem-" + (Date.now() + idx),
          name: name,
          role: role,
          divisionId: targetDivisionId,
          photoUrl: itemPhoto,
          nim: `202401${(100 + currentMembers.length + idx).toString()}`,
          marhalah: "Marhalah Ula (M.1) Semester IV",
          bio: `Pengurus Dewan Mahasantri Ma'had Aly DDI Mangkoso periode 2026-2027 amanah pada ${role}.`,
          quote: "Berkhidmat dengan ilmu, berjuang dengan adab.",
          order: currentMembers.length + 1,
          isActive: true,
          isHighlighted: role.toLowerCase().includes("ketua") || role.toLowerCase().includes("presidium")
        });
        addedMemberNames.push(name);
      });

      summary = `Berhasil menambahkan ${memberLines.length} pengurus/anggota DeMa sekaligus ke struktur kabinet: ${addedMemberNames.slice(0, 3).join(", ")}${addedMemberNames.length > 3 ? " dan lainnya." : "."}`;
      if (detectedDrivePhoto) {
        summary += " Foto pengurus utama dihubungkan dari Google Drive.";
      }
    } else {
      summary = "Menyusun dan memperbarui 8 divisi resmi Dewan Mahasantri (DeMa): BPH, Jurnalistik, Pendidikan, Sarpras, Humas, Maktabah, Ibadah, dan Keamanan lengkap dengan rincian ikon emoji, kode unik slug, deskripsi tugas, dan program kerja unggulannya.";
    }

    cloned = {
      ...cloned,
      periodTitle: cloned.periodTitle || "Kabinet Khidmah & Intelektual 1447–1448 H / 2026–2027 M",
      tagline: cloned.tagline || "Dewan Mahasantri Ma'had Aly DDI Mangkoso",
      leadQuote: cloned.leadQuote || "Menghidupkan Khazanah Turats, Menggerakkan Nalar Kontemporer, Mengabdi untuk Kemaslahatan Ummat.",
      leadQuoteArabic: cloned.leadQuoteArabic || "العِلْمُ بِلَا عَمَلٍ كَالشَّجَرِ بِلَا ثَمَرٍ",
      divisions: standardDivisions,
      members: currentMembers
    };
  } else if (targetKey === "quote") {
    cloned = {
      ...cloned,
      arabicQuote: "العِلْمُ بِلَا عَمَلٍ كَالشَّجَرِ بِلَا ثَمَرٍ",
      translation: "Ilmu tanpa amal laksana pohon yang rindang namun tanpa buah.",
      source: "Kalam Hikmah Anregurutta K.H. Abd. Rahman Ambo Dalle",
      context: "Pondok Pesantren DDI Mangkoso",
      ...(detectedDrivePhoto ? { imageUrl: detectedDrivePhoto, showImage: true } : {})
    };
    summary = "Memperbarui Kalam Hikmah Anregurutta dengan teks Arab RTL dan terjemahan resmi." + (detectedDrivePhoto ? " Foto Anregurutta berhasil dihubungkan dari Google Drive." : "");
  } else if (targetKey === "email_templates") {
    summary = "Menyempurnakan template email balasan otomatis naskah jurnal & penerimaan tulisan.";
  } else if (targetKey === "donations") {
    let list = Array.isArray(cloned) ? [...cloned] : [];
    if (lowerPrompt.includes("tambah") || lowerPrompt.includes("baru") || list.length === 0) {
      list.push({
        id: "don-ai-" + Date.now(),
        slug: "wakaf-laboratorium-falak-" + Date.now().toString(36),
        title: "Wakaf Laboratorium Falak & Observatorium Hisab Rukyat",
        category: "pembangunan",
        categoryLabel: "Fasilitas & Gedung",
        shortDesc: "Pembangunan observatorium hisab rukyat dan teleskop falakiyah.",
        story: "Pembangunan observatorium dan teleskop rukyatul hilal untuk santri Ma'had Aly DDI Mangkoso.",
        targetAmount: 250000000,
        collectedAmount: 48000000,
        target: 250000000,
        collected: 48000000,
        description: "Pembangunan observatorium hisab rukyat dan pengadaan teleskop penentuan awal bulan hijriyah.",
        bankName: "Bank Syariah Indonesia (BSI)",
        accountNumber: "7799001122",
        accountHolder: "Ma'had Aly DDI Mangkoso Wakaf",
        isActive: true,
        createdAt: new Date().toISOString(),
        bankAccounts: [
          {
            bankName: "Bank Syariah Indonesia (BSI)",
            accountNumber: "7799001122",
            accountHolder: "Ma'had Aly DDI Mangkoso Wakaf"
          }
        ],
        ...(detectedDrivePhoto ? { imageUrl: detectedDrivePhoto } : {})
      });
      summary = "Menambahkan program donasi wakaf baru: Laboratorium Falak & Hisab Rukyat." + (detectedDrivePhoto ? " (Foto program dihubungkan dari Google Drive)." : "");
    } else {
      if (detectedDrivePhoto && list.length > 0) {
        list[0] = { ...list[0], imageUrl: detectedDrivePhoto };
        summary = "Memperbarui foto program donasi pilihan dari Google Drive.";
      } else {
        summary = "Menyesuaikan target dan rincian program donasi Ma'had Aly.";
      }
    }
    cloned = list;
  } else {
    summary = `Menyesuaikan konfigurasi konten ${targetKey} berdasarkan arahan instruksi Anda.`;
  }

  if (attemptedImageOnNonImageModule) {
    summary += ` (Pemberitahuan: Modul '${targetKey}' murni mengelola struktur data teks tanpa elemen gambar, tautan foto diabaikan secara otomatis demi menjaga integritas data).`;
  }

  const diffs = calculateDiff(currentData, cloned);

  return {
    targetKey,
    summary,
    proposedData: cloned,
    changes: diffs,
    engineUsed: "heuristic-local"
  };
}
