import fs from "fs";
import { createClient } from "@supabase/supabase-js";

// Read env variables
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
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSeed() {
  console.log("=== MEMULAI SEEDING DATA KE SUPABASE ===");

  // 1. Seed Site Content (Generik)
  const siteContents = [
    {
      key: "home.hero",
      group_name: "home",
      label: "Hero Section",
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
      key: "footer",
      group_name: "footer",
      label: "Footer Settings",
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
        copyrightText: "© 2026 Ma'had Aly DDI Mangkoso. Hak Cipta Dilindungi.",
        tagline: "Mewarisi Khazanah Turats • Menjaga Sanad Ulama Nusantara",
        showAdminLink: true,
        adminLinkLabel: "🔒 Masuk Panel Redaksi (Admin)",
        adminLinkUrl: "/admin",
        footerBgColor: "#0b4a25",
        footerTextColor: "#f4e8c1",
        columnLayout: 4
      }
    }
  ];

  for (const item of siteContents) {
    const { error } = await supabase.from("site_content").upsert(item, { onConflict: "key" });
    if (error) console.log(`Site content ${item.key}:`, error.message);
    else console.log(`✅ Site content '${item.key}' tersimpan`);
  }

  // 2. Seed Categories
  const categories = [
    { nama: "Fiqh Muamalah Kontemporer", slug: "fiqh-muamalah-kontemporer", deskripsi: "Transaksi keuangan modern & fintech syariah", icon: "wallet", urutan: 1, is_published: true },
    { nama: "Fiqh Medis & Bioetika", slug: "fiqh-medis-bioetika", deskripsi: "Hukum kedokteran & teknologi medis", icon: "heart-pulse", urutan: 2, is_published: true },
    { nama: "Fiqh Digital & AI", slug: "fiqh-digital-teknologi", deskripsi: "Etika AI & aset digital", icon: "cpu", urutan: 3, is_published: true },
    { nama: "Fiqh Lingkungan & Green Economy", slug: "fiqh-lingkungan", deskripsi: "Konservasi alam & maqashid bi'ah", icon: "leaf", urutan: 4, is_published: true }
  ];

  for (const cat of categories) {
    const { error } = await supabase.from("categories").upsert(cat, { onConflict: "slug" });
    if (error) console.log(`Category ${cat.slug}:`, error.message);
    else console.log(`✅ Kategori '${cat.nama}' tersimpan`);
  }

  // 3. Seed Articles
  const articles = [
    {
      title: "Tinjauan Fiqh Mu'asarah atas Smart Contract dan Aset Kripto",
      slug: "tinjauan-fiqh-muasarah-smart-contract-aset-kripto",
      excerpt: "Analisis komparatif akad muamalah klasik terhadap validitas smart contract berbasis blockchain dan cryptocurrency.",
      content: "Perkembangan teknologi blockchain dan aset kripto menghadirkan diskursus intensif di kalangan fukaha kontemporer. Smart contract pada dasarnya adalah protokol komputer yang memfasilitasi dan memverifikasi pelaksanaan kontrak secara otomatis.",
      status: "published",
      author_name: "Ahmad Yusuf Mubarak",
      author_role: "Mahasantri Marhalah Ula (M.1)",
      views: 342,
      tags: ["Fiqh Muamalah", "Smart Contract", "Kripto"]
    },
    {
      title: "Bioetika Islam dalam Transplantasi Organ dan Rekayasa Genetika",
      slug: "bioetika-islam-transplantasi-organ-rekayasa-genetika",
      excerpt: "Kajian maqashid syariah terhadap batasan intervensi teknologi medis modern dalam pemeliharaan jiwa dan keturunan.",
      content: "Kemajuan teknologi kedokteran dalam bidang transplantasi organ dan rekayasa genetika membuka peluang penyelamatan jiwa manusia sekaligus memunculkan dilema etis.",
      status: "published",
      author_name: "Muhammad Fauzan",
      author_role: "Mahasantri Marhalah Ula",
      views: 289,
      tags: ["Fiqh Medis", "Bioetika", "Transplantasi"]
    }
  ];

  for (const art of articles) {
    const { error } = await supabase.from("articles").upsert(art, { onConflict: "slug" });
    if (error) console.log(`Article ${art.slug}:`, error.message);
    else console.log(`✅ Artikel '${art.title.slice(0, 30)}...' tersimpan`);
  }

  console.log("=== SEEDING SELESAI ===");
}

runSeed();
