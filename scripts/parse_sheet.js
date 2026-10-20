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
      if (currentRow.length > 1 || currentRow[0] !== '') {
        rows.push(currentRow);
      }
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

const parsed = parseCSV(content);
console.log('Parsed rows total:', parsed.length);
console.log('Headers:', parsed[0]);
for (let i = 1; i < parsed.length; i++) {
  const r = parsed[i];
  console.log(`[${i}] Name: "${r[2]}" | Role: "${r[3]}" | Div: "${r[4]}" | NIM: "${r[5]}" | Tingkat: "${r[6]}" | Photo: "${r[7]}" | WA: "${r[8]}" | Bio: "${r[9]?.substring(0, 30)}..." | Quote: "${r[10]}"`);
}
