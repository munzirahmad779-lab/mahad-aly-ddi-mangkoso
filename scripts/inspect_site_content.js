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

  // Submissions berisi data pribadi pengirim (nama, email, nomor HP):
  // jangan pernah membuang baris mentahnya ke stdout/log. Cukup hitungan
  // dan rincian teredaksi (domain email saja, tanpa alamat utuh).
  console.log('\n=== SUBMISSIONS (ringkasan teredaksi) ===');
  const { data: subRows, error: subError } = await supabase
    .from('submissions')
    .select('status, email');
  if (subError) {
    console.error('Gagal membaca submissions:', subError.message);
    return;
  }
  const perStatus = {};
  const perDomain = {};
  for (const s of subRows || []) {
    const st = s.status || '(tanpa status)';
    perStatus[st] = (perStatus[st] || 0) + 1;
    const domain = typeof s.email === 'string' && s.email.includes('@')
      ? s.email.split('@').pop().toLowerCase()
      : '(tidak valid)';
    perDomain[domain] = (perDomain[domain] || 0) + 1;
  }
  console.log(`Total submissions: ${(subRows || []).length}`);
  console.log('Per status:', perStatus);
  console.log('Per domain email:', perDomain);
}

dumpContent();
