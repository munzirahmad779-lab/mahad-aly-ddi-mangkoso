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

const rows = parseCSV(content);
console.log('=== DIVISIONS DETECTED IN FORM ===');
const divMap = new Map();

for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  const divRaw = r[4]?.trim();
  const isLeader = r[11]?.trim();
  const customDiv = r[12]?.trim();
  const icon = r[13]?.trim();
  const slug = r[14]?.trim();
  const desc = r[15]?.trim();
  const proker = r[16]?.trim();

  if (!divMap.has(divRaw)) {
    divMap.set(divRaw, {
      name: customDiv || divRaw,
      icon: icon || '',
      slug: slug || '',
      desc: desc || '',
      proker: proker || '',
      count: 0,
      members: []
    });
  }
  const d = divMap.get(divRaw);
  d.count++;
  d.members.push({
    name: r[2]?.trim(),
    role: r[3]?.trim(),
    nim: r[5]?.trim(),
    marhalah: r[6]?.trim(),
    photoUrl: r[7]?.trim(),
    instagram: r[8]?.trim(),
    bio: r[9]?.trim(),
    quote: r[10]?.trim(),
  });
  if (customDiv && !d.name) d.name = customDiv;
  if (icon && !d.icon) d.icon = icon;
  if (slug && !d.slug) d.slug = slug;
  if (desc && !d.desc) d.desc = desc;
  if (proker && !d.proker) d.proker = proker;
}

for (const [key, val] of divMap.entries()) {
  console.log(`\nDivisi Key: [${key}] (${val.count} anggota)`);
  console.log(` - Nama Resmi: ${val.name}`);
  console.log(` - Ikon: ${val.icon || '(default)'}`);
  console.log(` - Slug: ${val.slug || '(default)'}`);
  if (val.desc) console.log(` - Deskripsi: ${val.desc.substring(0, 100)}...`);
  if (val.proker) console.log(` - Proker: ${val.proker.substring(0, 100)}...`);
  console.log(` - Anggota (${val.members.length}):`);
  val.members.forEach((m, idx) => {
    console.log(`    ${idx + 1}. ${m.name} (${m.role}) - ${m.nim}`);
  });
}
