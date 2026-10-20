const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function dumpContent() {
  const { data, error } = await supabase.from('site_content').select('*');
  if (error) {
    console.error(error);
    return;
  }
  for (const row of data) {
    console.log(`=== KEY: ${row.key} (Updated: ${row.updated_at}) ===`);
    const val = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
    if (row.key === 'ai_content_snapshots') {
      console.log(`Snapshots count: ${Array.isArray(val) ? val.length : 0}`);
      if (Array.isArray(val)) {
        val.forEach((s, idx) => {
          console.log(`  [${idx}] id: ${s.id}, timestamp: ${s.timestamp}, summary: ${s.summary}`);
        });
      }
    } else {
      console.log(JSON.stringify(val, null, 2).substring(0, 1000));
    }
  }

  console.log('\n=== SUBMISSIONS ===');
  const subs = await supabase.from('submissions').select('*');
  console.log(JSON.stringify(subs.data, null, 2));
}

dumpContent();
