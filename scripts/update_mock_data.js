const fs = require('fs');

const mockDataPath = 'src/lib/mock-data.ts';
let mockDataContent = fs.readFileSync(mockDataPath, 'utf8');

const demaJson = JSON.parse(fs.readFileSync('scripts/formatted_dema_data.json', 'utf8'));

// Find start of INITIAL_DEMA_SETTINGS
const startIndex = mockDataContent.indexOf('export const INITIAL_DEMA_SETTINGS: DemaSettings = {');
if (startIndex === -1) {
  console.error('Could not find INITIAL_DEMA_SETTINGS in mock-data.ts');
  process.exit(1);
}

const replacement = `export const INITIAL_DEMA_SETTINGS: DemaSettings = ${JSON.stringify(demaJson, null, 2)};\n`;

const newContent = mockDataContent.substring(0, startIndex) + replacement;

fs.writeFileSync(mockDataPath, newContent, 'utf8');
console.log('Successfully updated INITIAL_DEMA_SETTINGS in src/lib/mock-data.ts with real 24 members!');
