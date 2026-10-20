const fs = require('fs');

const content = fs.readFileSync('scripts/dema_responses.csv', 'utf8');

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField.trim());
      if (currentRow.length > 1 || currentRow[0] !== '') rows.push(currentRow);
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }
  return rows;
}

function extractDriveId(url) {
  if (!url) return '';
  const m = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : '';
}

function toDirectImageUrl(url) {
  const id = extractDriveId(url);
  if (id) {
    return `https://lh3.googleusercontent.com/d/${id}`;
  }
  return url || '';
}

const rows = parseCSV(content);

// Standard divisions
const defaultDivisions = [
  {
    id: "div-bph",
    name: "Badan Pengurus Harian (BPH)",
    code: "bph",
    icon: "👑",
    order: 1,
    isActive: true,
    description: "Pucuk pimpinan eksekutif presidium Dewan Mahasantri yang mengarahkan kebijakan strategis, koordinasi internal, dan tata kelola organisasi.",
    responsibilities: [
      "Memonitoring setiap kegiatan organisasi",
      "Memimpin rapat koordinasi berkala pengurus DeMa",
      "Mengadakan Bahtsul Masail dan Halal bi Halal (HBH)"
    ]
  },
  {
    id: "div-pendidikan",
    name: "Divisi Pendidikan",
    code: "pendidikan",
    icon: "📚",
    order: 2,
    isActive: true,
    description: "Mengawal dinamika akademik takhassus fiqh, pendampingan musyawarah kitab kuning, dan kajian ilmiah kontemporer.",
    responsibilities: [
      "Menyelenggarakan halaqah telaah kitab turats antar-marhalah",
      "Mendampingi penulisan karya ilmiah dan risalah tugas akhir",
      "Mengadakan seminar keilmuan fiqh dan ushul fiqh tematik"
    ]
  },
  {
    id: "div-jurnalistik",
    name: "Divisi Jurnalistik",
    code: "jurnalistik",
    icon: "✍️",
    order: 3,
    isActive: true,
    description: "Mengelola penerbitan buletin berkala, liputan warta santri, dokumentasi multimedia, dan penulisan karya jurnalistik pesantren.",
    responsibilities: [
      "Menerbitkan buletin berkala dan warta mingguan Ma'had Aly",
      "Meliput dan mendokumentasikan kegiatan akademik serta kepesantrenan",
      "Mengelola kanal publikasi resmi media sosial dan warta digital santri"
    ]
  },
  {
    id: "div-maktabah",
    name: "Divisi Maktabah (Perpustakaan)",
    code: "maktabah",
    icon: "📖",
    order: 4,
    isActive: true,
    description: "Mengelola dan memastikan kegiatan operasional maktabah berjalan dengan tertib, meliputi pengaturan sirkulasi maraji' turats klasik dan literasi kepustakaan.",
    responsibilities: [
      "Menyusun dan mengontrol tata tertib maktabah",
      "Mengontrol fasilitas dan kenyamanan ruang maktabah",
      "Pengamanan dan digitalisasi katalog arsip kitab kuning"
    ]
  },
  {
    id: "div-ibadah",
    name: "Divisi Ibadah",
    code: "ibadah",
    icon: "🕌",
    order: 5,
    isActive: true,
    description: "Mengawal kedisiplinan shalat berjamaah, wirid, tadarrus, dan amaliah kepesantrenan Ahlussunnah wal Jama'ah.",
    responsibilities: [
      "Mengawal ketertiban shalat lima waktu berjamaah di masjid",
      "Menyusun jadwal imam, muadzin, dan penceramah kultum subuh",
      "Mengkoordinir pembacaan ratib, tahlil, dan amaliah mingguan"
    ]
  },
  {
    id: "div-humas",
    name: "Divisi Humas (Hubungan Masyarakat)",
    code: "humas",
    icon: "📢",
    order: 6,
    isActive: true,
    description: "Divisi Humas bertugas menjalin dan menjaga hubungan baik dengan pihak internal maupun eksternal organisasi demi kemaslahatan santri.",
    responsibilities: [
      "Menjalin komunikasi dan silaturahmi dengan lembaga, instansi, dan ikatan alumni",
      "Melakukan penggalangan aspirasi dan relasi kemasyarakatan",
      "Mengkoordinir pengabdian santri pada masyarakat dan dakwah sosial"
    ]
  },
  {
    id: "div-sarpras",
    name: "Divisi Sarpras (Sarana & Prasarana)",
    code: "sarpras",
    icon: "🏛️",
    order: 7,
    isActive: true,
    description: "Mengelola, merawat, dan menginventarisasi sarana prasarana serta fasilitas pendukung kegiatan mahasantri.",
    responsibilities: [
      "Memelihara kebersihan dan kelayakan sarana belajar serta asrama",
      "Menginventarisasi aset dan perlengkapan inventaris organisasi",
      "Menyiapkan sarana dan kebutuhan logistik setiap agenda DeMa"
    ]
  },
  {
    id: "div-keamanan",
    name: "Divisi Keamanan",
    code: "keamanan",
    icon: "🛡️",
    order: 8,
    isActive: true,
    description: "Menjaga ketertiban, keamanan lingkungan asrama mahasantri, serta penegakan tata tertib kampus.",
    responsibilities: [
      "Mengawasi jam malam, kedisiplinan, dan perizinan keluar pondok",
      "Menegakkan disiplin tata tertib kehidupan mahasantri di asrama",
      "Melaksanakan jadwal ronda malam dan memastikan asrama kondusif"
    ]
  }
];

// Helper mapping division name to ID
function getDivisionId(divName) {
  const norm = (divName || '').toLowerCase().trim();
  if (norm.includes('bph')) return 'div-bph';
  if (norm.includes('pendidikan')) return 'div-pendidikan';
  if (norm.includes('jurnalistik')) return 'div-jurnalistik';
  if (norm.includes('maktabah') || norm.includes('perpustakaan')) return 'div-maktabah';
  if (norm.includes('ibadah')) return 'div-ibadah';
  if (norm.includes('humas')) return 'div-humas';
  if (norm.includes('sarpras')) return 'div-sarpras';
  if (norm.includes('keamanan')) return 'div-keamanan';
  return 'div-bph';
}

const seenMembers = new Set();
const members = [];

for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  const name = r[2]?.trim();
  const role = r[3]?.trim();
  const divRaw = r[4]?.trim();
  const nim = r[5]?.trim();
  const marhalah = r[6]?.trim();
  const rawPhoto = r[7]?.trim();
  const contact = r[8]?.trim();
  const bio = r[9]?.trim();
  const quote = r[10]?.trim();

  // Deduplicate by name + role
  const key = `${name.toLowerCase()}-${role.toLowerCase()}`;
  if (seenMembers.has(key)) continue;
  seenMembers.add(key);

  const divisionId = getDivisionId(divRaw);
  const isLeader = role.toLowerCase().includes('ketua') || role.toLowerCase().includes('kordinator') || role.toLowerCase().includes('koordinator');

  members.push({
    id: `mem-dema-${i}`,
    name,
    role,
    divisionId,
    nim,
    marhalah,
    photoUrl: toDirectImageUrl(rawPhoto),
    rawPhotoUrl: rawPhoto,
    instagram: contact,
    bio,
    quote,
    order: members.length + 1,
    isActive: true,
    isHighlighted: isLeader
  });
}

console.log(`Generated ${members.length} unique members from Google Sheet.`);
members.forEach((m, idx) => {
  console.log(`${idx + 1}. [${m.divisionId}] ${m.name} - ${m.role} (${m.nim}) | Photo: ${m.photoUrl}`);
});

fs.writeFileSync('scripts/formatted_dema_data.json', JSON.stringify({
  periodTitle: "Kabinet Khidmah & Intelektual 1447–1448 H / 2026–2027 M",
  tagline: "Dewan Mahasantri Ma'had Aly DDI Mangkoso",
  leadQuote: "Menghidupkan Khazanah Turats, Menggerakkan Nalar Kontemporer, Mengabdi untuk Kemaslahatan Ummat.",
  leadQuoteArabic: "العِلْمُ بِلَا عَمَلٍ كَالشَّجَرِ بِلَا ثَمَرٍ",
  divisions: defaultDivisions,
  members
}, null, 2), 'utf8');

console.log('Saved to scripts/formatted_dema_data.json');
