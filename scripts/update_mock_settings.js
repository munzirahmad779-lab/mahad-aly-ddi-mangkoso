const fs = require('fs');
const path = require('path');

const mockPath = path.join(__dirname, '..', 'src', 'lib', 'mock-data.ts');
let file = fs.readFileSync(mockPath, 'utf8');

const dbSettings = JSON.parse(fs.readFileSync(path.join(__dirname, 'db_site_settings.json'), 'utf8'));

// Replace establishedDate
file = file.replace(/establishedDate:\s*"[^"]*",/, 'establishedDate: ' + JSON.stringify(dbSettings.establishedDate) + ',');

// Replace visi
file = file.replace(/visi:\s*"[^"]*",/, 'visi: ' + JSON.stringify(dbSettings.visi) + ',');

// Replace misi
file = file.replace(/misi:\s*\[[\s\S]*?\],/, 'misi: ' + JSON.stringify(dbSettings.misi, null, 2) + ',');

// Replace historyContent
file = file.replace(/historyContent:\s*"[^"]*",/, 'historyContent: ' + JSON.stringify(dbSettings.historyContent) + ',');

// Replace historyArabic
file = file.replace(/historyArabic:\s*"[^"]*",/, 'historyArabic: ' + JSON.stringify(dbSettings.historyArabic) + ',');

fs.writeFileSync(mockPath, file, 'utf8');
console.log('Successfully updated src/lib/mock-data.ts with authentic admin settings');
