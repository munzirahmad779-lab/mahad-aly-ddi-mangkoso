const https = require('https');
const docId = '1j7LoqiPoaSN5lxFE60VmEb8cAyz7dkbs6prMzmYOMz8';

https.get(`https://docs.google.com/spreadsheets/d/${docId}/htmlview`, (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const regex = /id="sheet-button-[^"]+"><a[^>]*>(.*?)<\/a>/g;
    let match;
    const tabs = [];
    while ((match = regex.exec(d)) !== null) {
      tabs.push(match[1]);
    }
    console.log('Sheet Tabs:', tabs);
  });
});
