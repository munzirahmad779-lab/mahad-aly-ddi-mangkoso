const fs = require('fs');
const https = require('https');

const docId = '1j7LoqiPoaSN5lxFE60VmEb8cAyz7dkbs6prMzmYOMz8';
const url = `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv`;

function download(targetUrl) {
  https.get(targetUrl, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log('Redirecting to location...');
      download(res.headers.location);
      return;
    }
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      fs.writeFileSync('scripts/dema_responses.csv', data, 'utf8');
      console.log('Successfully saved to scripts/dema_responses.csv, total length:', data.length);
      const lines = data.split('\n');
      console.log('Total rows:', lines.length);
      console.log('Header:', lines[0]);
      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        console.log(`Row ${i}:`, lines[i].substring(0, 150));
      }
    });
  }).on('error', err => console.error('Download error:', err.message));
}

download(url);
