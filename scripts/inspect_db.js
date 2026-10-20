const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(url, key);

async function inspect() {
  console.log('--- SCANNING SUPABASE PRODUCTION DATABASE ---');
  
  const knownTables = ['site_content', 'collections', 'articles', 'theses', 'news', 'users', 'audit_log', 'submissions', 'subscriber', 'categories', 'tags'];
  
  for (const t of knownTables) {
    const { data, count, error } = await supabase.from(t).select('*', { count: 'exact' });
    if (error) {
      console.log('Table ' + t + ': Error - ' + error.message);
    } else {
      console.log('Table ' + t + ': ' + count + ' rows');
      if (t === 'site_content') {
        data.forEach(r => {
          const valStr = JSON.stringify(r.value || {});
          console.log('  - key: ' + r.key + ', updated_at: ' + r.updated_at + ', size: ' + valStr.length + ' chars');
          if (r.key === 'dema_settings' || r.key === 'ai_content_snapshots') {
            console.log('    detail: ' + valStr.substring(0, 200));
          }
        });
      } else if (t === 'articles' || t === 'news' || t === 'theses') {
        data.forEach(r => {
          console.log('  - [' + t + '] id: ' + r.id + ', title: ' + (r.title || r.judul) + ', author: ' + (r.author || r.penulis || r.user_id) + ', created_at: ' + r.created_at + ', updated_at: ' + r.updated_at);
        });
      } else if (t === 'collections') {
        data.forEach(r => {
          console.log('  - [collections] id: ' + r.id + ', type: ' + r.type + ', name: ' + (r.name || r.title || r.nama) + ', updated_at: ' + r.updated_at);
        });
      } else if (t === 'users') {
        data.forEach(r => {
          console.log('  - [users] id: ' + r.id + ', email: ' + r.email + ', role: ' + r.role + ', nama: ' + (r.nama || r.name));
        });
      }
    }
  }
}

inspect();
