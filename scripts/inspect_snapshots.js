const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function inspectSnapshots() {
  const { data, error } = await supabase.from('site_content').select('*').eq('key', 'ai_content_snapshots').single();
  if (error) {
    console.error(error);
    return;
  }
  const snapshots = Array.isArray(data.value) ? data.value : JSON.parse(data.value);
  console.log(`Found ${snapshots.length} snapshots`);
  snapshots.forEach((s, idx) => {
    console.log(`\n--- Snapshot ${idx} [${s.id}] ---`);
    console.log(`Timestamp: ${s.timestamp}`);
    console.log(`Summary: ${s.summary}`);
    console.log(`Target Key: ${s.targetKey}`);
    console.log(`Previous Value:`, JSON.stringify(s.previousValue).substring(0, 200));
    console.log(`New Value:`, JSON.stringify(s.newValue).substring(0, 200));
  });
}

inspectSnapshots();
