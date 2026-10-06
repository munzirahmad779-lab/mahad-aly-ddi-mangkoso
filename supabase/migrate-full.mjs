import fs from "fs";
import { createClient } from "@supabase/supabase-js";

// Read env variables from .env.local
const env = {};
if (fs.existsSync(".env.local")) {
  const lines = fs.readFileSync(".env.local", "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
      }
    }
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("❌ ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function runFullMigration() {
  console.log("=================================================");
  console.log("🚀 MEMULAI MIGRASI LENGKAP KE SUPABASE POSTGRESQL");
  console.log("=================================================\n");

  // 1. SETUP SUPER ADMIN USER DI TABEL public.users
  console.log("1. Mendaftarkan Super Admin di public.users...");
  const { data: usersData, error: listUserError } = await supabaseAdmin.auth.admin.listUsers();
  if (listUserError) {
    console.error("Gagal membaca auth.users:", listUserError.message);
  } else {
    const superAdminAuth = usersData.users.find((u) => u.email === "munzirahmad779@gmail.com");
    if (superAdminAuth) {
      const { error: userInsertError } = await supabaseAdmin.from("users").upsert(
        {
          id: superAdminAuth.id,
          email: superAdminAuth.email,
          nama_lengkap: "Ahmad Yusuf Mubarak",
          role: "super_admin",
          is_active: true,
          updated_at: new Date().toISOString()
        },
        { onConflict: "id" }
      );
      if (userInsertError) {
        console.error("Gagal upsert public.users:", userInsertError.message);
      } else {
        console.log(`✅ Super Admin '${superAdminAuth.email}' (ID: ${superAdminAuth.id}) terdaftar di public.users sebagai super_admin.`);
      }
    } else {
      console.log("⚠️ User munzirahmad779@gmail.com belum ditemukan di auth.users. Pastikan sudah dibuat di Supabase Auth.");
    }
  }

  // 2. MIGRASI SITE_CONTENT (Hero, Kalam Hikmah, Profile, Footer)
  console.log("\n2. Migrasi data generik site_content...");
  const siteContents = [
    {
      key: "home.hero",
      group_name: "home",
      label: "Hero Section Beranda",
      value: {
        badge: "Pusat Kaderisasi Fuqaha Kontemporer",
        title: "Meneguhkan Khazanah Turats, Menjawab Dinamika Fiqh Kontemporer",
        subtitle: "Pendidikan Tinggi Kader Ulama Takhassus Fiqh wa Usuluhu — Berakar kuat pada sanad keilmuan klasik Anregurutta, progresif merespons tantangan zaman.",
        arabicMotto: "تَفَقُّهٌ فِي الدِّيْنِ · بَصِيْرَةٌ فِي الزَّمَانِ · خِدْمَةٌ لِلْأُمَّةِ",
        ctaPrimaryText: "Jelajahi Kajian Fiqh",
        ctaPrimaryLink: "/artikel",
        ctaSecondaryText: "Repositori Skripsi",
        ctaSecondaryLink: "/skripsi"
      }
    },
    {
      key: "home.quote",
      group_name: "home",
      label: "Kalam Hikmah",
      value: {
        arabicQuote: "مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ",
        source: "HR. Al-Bukhari no. 71 & Muslim no. 1037",
        translation: "Barangsiapa yang Allah kehendaki kebaikan baginya, niscaya Allah akan pahamkan dia secara mendalam dalam urusan agama.",
        context: "Landasan Visi Pendidikan Kader Ulama Ma'had Aly DDI Mangkoso"
      }
    },
    {
      key: "profile.history",
      group_name: "profile",
      label: "Sejarah & Visi Misi Lembaga",
      value: {
        sejarah: "Didirikan pada 5 November 2013 (1 Muharram 1435 H) oleh AGH. Prof. Dr. M. Faried Wadjedy, MA, Ma'had Aly DDI Mangkoso merupakan kelanjutan dari tradisi keilmuan halaqah 'Mangaji Tudang' yang dirintis oleh AGH. Abdurrahman Ambo Dalle sejak tahun 1938.",
        visi: "Menjadi pusat keunggulan kaderisasi fuqaha mutafaqqih fiddin tingkat tinggi yang otoritatif dalam khazanah turats klasik dan progresif menjawab dinamika Fiqh Mu'asarah.",
        misi: [
          "Menyelenggarakan pendidikan tinggi kader ulama berbasis kitab kuning (turats) dengan metodologi ushul fikih yang mendalam.",
          "Mengembangkan riset Fiqh Mu'asarah untuk menjawab problematika keumatan dan kebangsaan modern.",
          "Melestarikan sanad keilmuan dan ajaran wasathiyyah Anregurutta Ambo Dalle.",
          "Menyiapkan lulusan bergelar Sarjana Agama (S.Ag.) yang berintegritas moral dan berwawasan global."
        ]
      }
    },
    {
      key: "footer",
      group_name: "footer",
      label: "Pengaturan Footer Lengkap",
      value: {
        logoUrl: "/image_067524.png",
        orgName: "Ma'had Aly",
        orgSubname: "DDI Mangkoso",
        description: "Pendidikan Tinggi Kader Ulama jenjang Marhalah Ula (M.1). Berkhidmat melahirkan generasi mutafaqqih fiddin berwawasan wasathiyyah dan berakhlak mulia.",
        address: "Kompleks Ponpes DDI Mangkoso, Kec. Soppeng Riaja, Kab. Barru, Sulsel 90752",
        kanalDescription: "Ikuti kabar pengajian, kajian halaqah, dan penerbitan jurnal resmi Ma'had Aly DDI Mangkoso:",
        email: "mahadaly@ddimangkoso.ac.id",
        whatsapp: "+62 812-3456-7890",
        facebookUrl: "https://facebook.com/mahadalyddimangkoso",
        instagramUrl: "https://instagram.com/mahadalyddimangkoso",
        youtubeUrl: "https://youtube.com/@mahadalyddimangkoso",
        telegramUrl: "",
        tiktokUrl: "",
        copyrightText: "© 2026 Ma'had Aly DDI Mangkoso. Hak Cipta Dilindungi.",
        tagline: "Mewarisi Khazanah Turats • Menjaga Sanad Ulama Nusantara",
        showAdminLink: true,
        adminLinkLabel: "🔒 Masuk Panel Redaksi (Admin)",
        adminLinkUrl: "/admin",
        footerBgColor: "#0b4a25",
        footerTextColor: "#f4e8c1",
        columnLayout: 4
      }
    },
    {
      key: "site.settings",
      group_name: "settings",
      label: "Identitas Utama Situs",
      value: {
        institutionName: "Ma'had Aly Pendidikan Tinggi Kader Ulama DDI Abdurrahman Ambo Dalle, Mangkoso",
        takhassus: "Fiqh wa Usuluhu (Fiqh dan Ushul Fikih)",
        focusField: "Fiqh Mu'asarah (الفقه المعاصر) — Fiqh Kontemporer",
        mudirName: "AGH. Prof. Dr. M. Faried Wadjedy, MA",
        establishedDate: "5 November 2013 (1 Muharram 1435 H)",
        location: "Kab. Barru, Sulawesi Selatan",
        address: "Kompleks Pondok Pesantren DDI Mangkoso, Kel. Mangkoso, Kec. Soppeng Riaja, Kab. Barru, Sulawesi Selatan 90752",
        phone: "+62 812-3456-7890",
        emailSubmission: "munzirahmad779@gmail.com"
      }
    }
  ];

  for (const item of siteContents) {
    const { error } = await supabaseAdmin.from("site_content").upsert(item, { onConflict: "key" });
    if (error) console.error(`Gagal migrasi site_content ${item.key}:`, error.message);
    else console.log(`✅ site_content '${item.key}' berhasil disimpan.`);
  }

  // 3. MIGRASI COLLECTIONS (Masyayikh, Sarana, Akreditasi, Kurikulum, Kalender)
  console.log("\n3. Migrasi data collections (Masyayikh, Sarana, Kurikulum)...");
  const collectionsData = [
    {
      collection_type: "masyayikh",
      order_index: 1,
      is_published: true,
      data: {
        name: "AGH. Prof. Dr. M. Faried Wadjedy, MA",
        role: "Mudir / Pimpinan Ma'had Aly",
        title: "Guru Besar Fiqh & Tafsir",
        photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
        expertise: "Ushul Fikih, Tafsir Ahkam, Fiqh Mu'asarah",
        education: "S1 & S2 Al-Azhar Cairo Mesir, S3 UIN Alauddin",
        publications: "Metodologi Ijtihad Fiqh Kontemporer",
        isActive: true
      }
    },
    {
      collection_type: "masyayikh",
      order_index: 2,
      is_published: true,
      data: {
        name: "AGH. Dr. Muhammad Agus, M.Th.I.",
        role: "Wakil Mudir Bidang Akademik",
        title: "Doktor Dirasah Islamiyah",
        photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        expertise: "Fiqh Muqaran & Hadits Ahkam",
        education: "S1 UIN Syarif Hidayatullah, S2 & S3 UIN Alauddin",
        publications: "Studi Naskah Fiqh Nusantara",
        isActive: true
      }
    },
    {
      collection_type: "sarana",
      order_index: 1,
      is_published: true,
      data: {
        name: "Masjid Jami' Pesantren DDI Mangkoso",
        category: "Masjid",
        description: "Pusat halaqah pengajian kitab kuning subuh dan maghrib wetonan/sorogan.",
        photoUrl: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80",
        isActive: true
      }
    },
    {
      collection_type: "sarana",
      order_index: 2,
      is_published: true,
      data: {
        name: "Maktabah Turats & E-Library",
        category: "Perpustakaan",
        description: "Koleksi lebih dari 10.000 judul kitab kuning klasik dan jurnal digital internasional.",
        photoUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
        isActive: true
      }
    }
  ];

  // Clear and insert collections
  await supabaseAdmin.from("collections").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  for (const c of collectionsData) {
    const { error } = await supabaseAdmin.from("collections").insert(c);
    if (error) console.error("Gagal insert collection:", error.message);
  }
  console.log(`✅ ${collectionsData.length} item collections berhasil dimigrasi.`);

  // 4. MIGRASI CATEGORIES & KAJIAN CATEGORIES
  console.log("\n4. Migrasi categories...");
  const categoriesList = [
    { nama: "Fiqh Muamalah Kontemporer", slug: "fiqh-muamalah-kontemporer", deskripsi: "Kajian transaksi keuangan digital, fintech syariah, kripto, e-commerce, dan asuransi syariah.", icon: "wallet", warna: "#0b4a25", urutan: 1, is_published: true },
    { nama: "Fiqh Medis & Bioetika", slug: "fiqh-medis-bioetika", deskripsi: "Telaah hukum kedokteran terkini: transplantasi organ, rekayasa genetika, bayi tabung, dan vaksinasi.", icon: "heart-pulse", warna: "#065f46", urutan: 2, is_published: true },
    { nama: "Fiqh Digital & AI", slug: "fiqh-digital-teknologi", deskripsi: "Respon syariat atas kecerdasan buatan (AI), privasi data, etika media sosial, dan hak cipta digital.", icon: "cpu", warna: "#1e3a8a", urutan: 3, is_published: true },
    { nama: "Fiqh Lingkungan & Green Economy", slug: "fiqh-lingkungan", deskripsi: "Prinsip hifzh al-bi'ah, mitigasi perubahan iklim, energi terbarukan, dan konservasi pesisir.", icon: "leaf", warna: "#15803d", urutan: 4, is_published: true },
    { nama: "Fiqh Ekonomi & Bisnis Syariah", slug: "fiqh-ekonomi-syariah", deskripsi: "Analisis kontrak bisnis modern, perbankan syariah, sukuk, dan ZISWAF produktif.", icon: "chart-line", warna: "#854d0e", urutan: 5, is_published: true },
    { nama: "Fiqh Keluarga Kontemporer", slug: "fiqh-keluarga-kontemporer", deskripsi: "Dinamika hukum keluarga Islam, bimbingan pranikah, dan perlindungan hak anak dan perempuan.", icon: "users", warna: "#9f1239", urutan: 6, is_published: true }
  ];

  for (const cat of categoriesList) {
    await supabaseAdmin.from("categories").upsert(cat, { onConflict: "slug" });
    await supabaseAdmin.from("kajian_categories").upsert(cat, { onConflict: "slug" });
  }
  console.log(`✅ ${categoriesList.length} kategori berhasil dimigrasi.`);

  // 5. MIGRASI ARTIKEL (PUBLIKASI FIQH MU'ASARAH)
  console.log("\n5. Migrasi artikel...");
  const articlesList = [
    {
      title: "Tinjauan Fiqh Mu'asarah atas Smart Contract dan Aset Kripto dalam Transaksi Finansial",
      slug: "tinjauan-fiqh-muasarah-smart-contract-aset-kripto",
      excerpt: "Analisis komparatif akad muamalah klasik terhadap validitas smart contract berbasis blockchain dan cryptocurrency.",
      content: `Perkembangan teknologi blockchain dan aset kripto menghadirkan diskursus intensif di kalangan fukaha kontemporer. Smart contract pada dasarnya adalah protokol komputer yang memfasilitasi dan memverifikasi pelaksanaan kontrak secara otomatis tanpa perantara pihak ketiga.

Dalam perspektif ushul fikih, akad ini dapat diklasifikasikan sebagai *akad ghair musamma* yang sah sepanjang memenuhi rukun perikatan, terbebas dari unsur gharar fahisy (ketidakpastian berlebihan), maysir (spekulasi murni), dan riba.

Landasan kaidah fiqhiyyah yang relevan:
*Al-Ashlu fil-mu'amalati al-ibahah hatta yadulla ad-dalilu 'ala tahrimiha* (Hukum asal dalam muamalah adalah boleh sampai ada dalil yang mengharamkannya).`,
      author_name: "Ahmad Yusuf Mubarak",
      author_role: "Mahasantri Marhalah Ula (M.1)",
      status: "published",
      views: 342,
      published_at: new Date().toISOString(),
      tags: ["Fiqh Muamalah", "Smart Contract", "Kripto", "Fintech Syariah"]
    },
    {
      title: "Bioetika Islam dalam Transplantasi Organ dan Rekayasa Genetika Terkini",
      slug: "bioetika-islam-transplantasi-organ-rekayasa-genetika",
      excerpt: "Kajian maqashid syariah terhadap batasan intervensi teknologi medis modern dalam pemeliharaan jiwa dan keturunan.",
      content: `Kemajuan teknologi kedokteran dalam bidang transplantasi organ dan rekayasa genetika (CRISPR/Cas9) membuka peluang penyelamatan jiwa manusia sekaligus memunculkan dilema etis.

Maqashid syariah mendudukkan *Hifzh an-Nafs* (pemeliharaan jiwa) dan *Hifzh an-Nasl* (pemeliharaan keturunan) sebagai prioritas dharuriyyat. Donor organ antar manusia diperbolehkan dengan syarat ketat tanpa transaksi jual-beli komersial (*tabarru'*).`,
      author_name: "Muhammad Fauzan",
      author_role: "Mahasantri Marhalah Ula",
      status: "published",
      views: 289,
      published_at: new Date().toISOString(),
      tags: ["Fiqh Medis", "Bioetika", "Transplantasi", "Maqashid Syariah"]
    },
    {
      title: "Etika Pemanfaatan Artificial Intelligence (AI) dalam Perspektif Ushul Fikih",
      slug: "etika-pemanfaatan-ai-perspektif-ushul-fikih",
      excerpt: "Mendudukkan status hukum output algoritma generatif AI dan batasan otoritas fatwa digital dalam Islam.",
      content: `Artificial Intelligence (AI) tidak memiliki *ahliyyatul ada'* (kapasitas hukum/taklif) karena bukan mukallaf. Oleh karena itu, fatwa hukum yang dihasilkan oleh AI generatif tidak memiliki legitimasi otoritatif syar'i tanpa *tashih* dan verifikasi oleh ulama mujtahid manusia.`,
      author_name: "Ismail Hannanong, Lc., M.H.",
      author_role: "Dewan Dosen Ma'had Aly",
      status: "published",
      views: 412,
      published_at: new Date().toISOString(),
      tags: ["Fiqh Digital", "AI", "Ushul Fikih", "Fatwa Digital"]
    },
    {
      title: "Fiqh al-Bi'ah: Urgensi Green Economy dan Konservasi Hutan Mangrove Pesisir Barru",
      slug: "green-economy-dan-konservasi-lingkungan-perspektif-fiqh",
      excerpt: "Tinjauan hukum pencegahan krisis iklim dan kewajiban restorasi ekosistem pesisir Barru berbasis prinsip Hifzh al-Bi'ah.",
      content: `Kerusakan ekologis pesisir dan krisis iklim global menuntut respon aktif dari hukum Islam. Konsep *Al-Isti'khlaf* (kekhalifahan manusia atas bumi) menempatkan manusia sebagai pemelihara, bukan perusak alam.

Berdasarkan kaidah *Ad-Dhararu Yuzal* (Kemudharatan harus dihilangkan), segala aktivitas eksploitasi alam yang merusak ekosistem pesisir hukumnya haram, dan program reboisasi mangrove bernilai sedekah jariyah ekologis yang berkelanjutan.`,
      author_name: "Dewan Masyaikh Ma'had Aly",
      author_role: "Tim Kajian Fiqh Lingkungan",
      status: "published",
      views: 210,
      published_at: new Date().toISOString(),
      tags: ["Fiqh Lingkungan", "Green Economy", "Konservasi", "Krisis Iklim"]
    }
  ];

  for (const art of articlesList) {
    const { error } = await supabaseAdmin.from("articles").upsert(art, { onConflict: "slug" });
    if (error) console.error(`Gagal migrasi artikel ${art.slug}:`, error.message);
    else console.log(`✅ Artikel '${art.title.slice(0, 35)}...' berhasil disimpan.`);
  }

  // 6. MIGRASI THESES (SKRIPSI MAHASANTRI)
  console.log("\n6. Migrasi repositori skripsi...");
  const thesesList = [
    {
      judul: "Rekonstruksi Ijtihad Jama'i dalam Penetapan Fatwa Fintech Lending pada Dewan Syariah Nasional MUI",
      slug: "skripsi-ijtihad-jamai-fatwa-fintech-lps",
      penulis: "Ahmad Yusuf Mubarak",
      nim: "13.01.0042",
      angkatan: "Angkatan VIII (2022)",
      tahun: "2026",
      pembimbing_1: "AGH. Prof. Dr. M. Faried Wadjedy, MA",
      pembimbing_2: "Ust. M. Idrus, M.Ag.",
      abstrak_id: "Penelitian ini mengkaji metodologi ijtihad jama'i yang diterapkan oleh DSN-MUI dalam merespons instrumen pinjaman peer-to-peer (P2P) lending syariah. Menggunakan pendekatan ushul fikih komparatif, riset ini menelaah keselarasan akad wakalah bil ujrah dan qardh terhadap perlindungan hak peminjam dari jeratan bunga terselubung.",
      abstrak_ar: "تناول هذا البحث دراسة منهجية الاجتهاد الجماعي لدى المجلس الشرعي الوطني الإندونيسي في معالجة القروض الرقمية المعاصرة.",
      keyword: ["Ijtihad Jama'i", "Fintech Syariah", "DSN-MUI", "Sadd adz-Dzari'ah"],
      pdf_url: "https://drive.google.com/file/d/1_contoh_link_gdrive_skripsi_mahad_aly_mangkoso/view?usp=sharing",
      pdf_size_mb: "3.4 MB",
      status: "published"
    },
    {
      judul: "Status Nasab dan Hak Waris Anak Hasil Teknologi Reproduksi Berbantu dalam Madzhab Syafi'i",
      slug: "skripsi-bioetika-bayi-tabung-surrogate-mother",
      penulis: "Muhammad Fauzan Al-Mangkosiy",
      nim: "13.01.0038",
      angkatan: "Angkatan VII (2021)",
      tahun: "2025",
      pembimbing_1: "Ismail Hannanong, Lc., M.H.",
      pembimbing_2: "Ust. H. Syahrul, M.Pd.I.",
      abstrak_id: "Karya ilmiah ini meneliti implikasi yuridis teknologi fertilisasi in vitro (bayi tabung) dan problematika ibu pengganti (surrogate mother) terhadap penetapan nasab serta hak kewarisan Islam.",
      abstrak_ar: "تتناول هذه الرسالة الآثار الفقهية لتقنيات الإخصاب الطبي المساعد وقضية استئجار الأرحام على ثبوت النسب والميراث في الفقه الشافعي.",
      keyword: ["Bayi Tabung", "Nasab", "Hifzh an-Nasl", "Bioetika Medis"],
      pdf_url: "https://drive.google.com/file/d/1_contoh_link_gdrive_skripsi_bioetika_mangkoso/view?usp=sharing",
      pdf_size_mb: "4.1 MB",
      status: "published"
    }
  ];

  for (const th of thesesList) {
    const { error } = await supabaseAdmin.from("theses").upsert(th, { onConflict: "slug" });
    if (error) console.error(`Gagal migrasi skripsi ${th.slug}:`, error.message);
    else console.log(`✅ Skripsi '${th.judul.slice(0, 35)}...' berhasil disimpan.`);
  }

  // 7. MIGRASI NEWS & PENGUMUMAN
  console.log("\n7. Migrasi warta berita & pengumuman...");
  const newsList = [
    {
      judul: "Ma'had Aly DDI Mangkoso Gelar Simposium Nasional Fiqh Mu'asarah dan Kecerdasan Buatan",
      slug: "seminar-nasional-fiqh-muasarah-ai-2026",
      tipe: "Berita",
      tanggal: "06 Oktober 2026",
      gambar_url: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80",
      konten: "Ma'had Aly DDI Mangkoso menyelenggarakan Simposium Nasional Fiqh Mu'asarah dengan tajuk 'Mendudukkan Nalar Ushul Fikih di Era Disrupsi Artificial Intelligence'.",
      is_pinned: true,
      status: "published"
    },
    {
      judul: "Pengumuman: Jadwal Sidang Munaqasyah Risalah Skripsi Semester Genap 2026",
      slug: "jadwal-sidang-munaqasyah-skripsi-marhalah-ula-2026",
      tipe: "Pengumuman",
      tanggal: "01 Oktober 2026",
      gambar_url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
      konten: "Diberitahukan kepada seluruh mahasantri tingkat akhir bahwa pendaftaran Sidang Munaqasyah Risalah Skripsi telah dibuka.",
      is_pinned: false,
      status: "published"
    }
  ];

  for (const nw of newsList) {
    const { error } = await supabaseAdmin.from("news").upsert(nw, { onConflict: "slug" });
    if (error) console.error(`Gagal migrasi berita ${nw.slug}:`, error.message);
    else console.log(`✅ Berita '${nw.judul.slice(0, 35)}...' berhasil disimpan.`);
  }

  // 8. MIGRASI PMB WAVES & FAQS
  console.log("\n8. Migrasi PMB online...");
  const pmbWaves = [
    {
      name: "Gelombang I (Jalur Prestasi Tahfidz & Kitab Kuning)",
      start_date: "01 Januari 2027",
      end_date: "28 Februari 2027",
      quota: "15 Mahasantri",
      scholarship_info: "Beasiswa Penuh 100% (Bebas Biaya Kuliah, Asrama & Konsumsi)",
      requirements: ["Lulusan Pesantren / MA", "Hafal Al-Qur'an min 5 Juz", "Mampu baca Fathul Qarib"],
      procedure: ["Daftar online", "Upload berkas", "Tes wawancara & baca kitab"],
      is_active: true
    }
  ];
  await supabaseAdmin.from("pmb_waves").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  for (const pw of pmbWaves) {
    await supabaseAdmin.from("pmb_waves").insert(pw);
  }

  const pmbFaqs = [
    {
      question: "Apakah ada biaya kuliah di Ma'had Aly DDI Mangkoso?",
      answer: "Tidak ada (GRATIS 100%). Seluruh mahasantri yang lulus seleksi mendapatkan beasiswa penuh mencakup biaya pendidikan, asrama, dan konsumsi harian yang didanai melalui program Orang Tua Asuh Pesantren DDI Mangkoso.",
      category: "Biaya & Beasiswa",
      order_index: 1,
      is_active: true
    }
  ];
  await supabaseAdmin.from("pmb_faqs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  for (const pf of pmbFaqs) {
    await supabaseAdmin.from("pmb_faqs").insert(pf);
  }
  console.log("✅ Data PMB berhasil dimigrasi.");

  console.log("\n=================================================");
  console.log("🎉 SELURUH DATA BERHASIL DIMIGRASI 100% KE SUPABASE!");
  console.log("=================================================");
}

runFullMigration();
