/**
 * ==============================================================================
 * MA'HAD ALY DDI MANGKOSO — SKRIP PEMBUATAN STRUKTUR FOLDER GOOGLE DRIVE
 * ==============================================================================
 * 
 * Petunjuk Penggunaan (Cukup 3 Langkah - 10 Detik):
 * 1. Buka browser dan kunjungi https://script.google.com
 * 2. Klik "New Project" (Proyek Baru), lalu hapus kode yang ada dan tempel seluruh kode di bawah ini.
 * 3. Klik tombol "Run" (Jalankan) di bagian atas.
 * 
 * Selesai! Seluruh struktur folder akan otomatis dibuat di Google Drive Anda
 * dengan izin berbagi "Siapa saja yang memiliki tautan" sehingga AI dan website
 * Ma'had Aly dapat langsung mengakses dan memindahkan gambar.
 * ==============================================================================
 */

function setupMahadAlyFolders() {
  const masterFolderName = "📁 [Ma'had Aly DDI Mangkoso] Aset Website & Media";
  
  // Periksa apakah folder utama sudah ada
  const existingFolders = DriveApp.getFoldersByName(masterFolderName);
  let masterFolder;
  
  if (existingFolders.hasNext()) {
    masterFolder = existingFolders.next();
    Logger.log("Folder utama sudah ada: " + masterFolder.getUrl());
  } else {
    masterFolder = DriveApp.createFolder(masterFolderName);
    masterFolder.setDescription("Folder master aset gambar & dokumen website resmi Ma'had Aly DDI Mangkoso untuk integrasi AI Website Editor.");
    Logger.log("Folder utama berhasil dibuat: " + masterFolder.getUrl());
  }

  // Atur izin berbagi folder utama: Siapa saja yang memiliki link bisa melihat (VIEWER)
  try {
    masterFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {
    Logger.log("Catatan izin sharing: " + e.message);
  }

  // Daftar subfolder standar yang dibutuhkan website
  const subFolders = [
    {
      name: "01_Masyayikh",
      desc: "Khusus foto dewan Masyayikh, Anregurutta, dan dosen pengampu kitab. Format penamaan file: Nama_Lengkap.jpg (Contoh: Dr_KH_Muhammad_Asad.jpg)"
    },
    {
      name: "02_Sarana_Fasilitas",
      desc: "Foto sarana kampus: perpustakaan, asrama, ruang kuliah, laboratorium falak. (Contoh: Perpustakaan_Khazanah_Turats.jpg)"
    },
    {
      name: "03_Hero_Beranda",
      desc: "Foto spanduk utama, latar belakang hero beranda, dan banner santri beresolusi tinggi."
    },
    {
      name: "04_Kalam_Hikmah",
      desc: "Foto profil Anregurutta K.H. Abd. Rahman Ambo Dalle dan gambar kaligrafi muttashil."
    },
    {
      name: "05_Program_Wakaf_Donasi",
      desc: "Foto dan brosur program wakaf pembangunan laboratorium, pembebasan tanah, atau beasiswa."
    },
    {
      name: "06_PMB_Brosur",
      desc: "Flyer resmi penerimaan mahasantri baru (PMB), alur pendaftaran, dan syarat seleksi."
    },
    {
      name: "07_Berita_Artikel",
      desc: "Foto sampul liputan warta, dokumentasi seminar, wisuda, dan artikel mimbar mahasantri."
    },
    {
      name: "08_Dokumen_Acuan_AI",
      desc: "Google Docs atau file teks berisi naskah sambutan resmi, SK, dan materi untuk acuan prompt AI."
    }
  ];

  const results = [];

  for (let i = 0; i < subFolders.length; i++) {
    const item = subFolders[i];
    const subIter = masterFolder.getFoldersByName(item.name);
    let subFolder;

    if (subIter.hasNext()) {
      subFolder = subIter.next();
    } else {
      subFolder = masterFolder.createFolder(item.name);
      subFolder.setDescription(item.desc);
    }

    try {
      subFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) {}

    results.push({
      folder: item.name,
      url: subFolder.getUrl(),
      id: subFolder.getId()
    });
  }

  Logger.log("================ HASIL PEMBUATAN FOLDER ================");
  Logger.log("TAUTAN MASTER FOLDER: " + masterFolder.getUrl());
  for (let j = 0; j < results.length; j++) {
    Logger.log("👉 " + results[j].folder + " : " + results[j].url);
  }
  Logger.log("========================================================");
  
  return {
    masterUrl: masterFolder.getUrl(),
    subFolders: results
  };
}
