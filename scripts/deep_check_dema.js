const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function inspectAllKeys() {
  const { data } = await supabase.from('site_content').select('*');
  for (const r of data) {
    const val = typeof r.value === 'string' ? JSON.parse(r.value) : r.value;
    const str = JSON.stringify(val);
    console.log(`=== KEY: ${r.key} | updated_at: ${r.updated_at} | size: ${str.length} ===`);
    if (r.key === 'dema_settings') {
      console.log('dema_settings content:', JSON.stringify(val, null, 2));
    } else if (str.includes('dema') || str.includes('anggota') || str.includes('pengurus') || str.includes('divisi')) {
      console.log(`Found mention of dema/anggota/pengurus in ${r.key}:`, str.substring(0, 500));
    }
  }
}

inspectAllKeys();
