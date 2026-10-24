const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function investigate() {
  console.log('================================================================');
  console.log('1. DATA USER AUTH (NON-SUPER ADMIN)');
  console.log('================================================================');
  const { data: authData } = await supabase.auth.admin.listUsers();
  const users = authData?.users || [];

  const nonSuper = users.filter(u => u.email !== 'munzirahmad779@gmail.com');
  console.log(`Total akun admin non-super admin: ${nonSuper.length}`);
  
  nonSuper.forEach((u, i) => {
    let witaStr = 'Belum pernah login';
    if (u.last_sign_in_at) {
      const dt = new Date(u.last_sign_in_at);
      const witaTime = new Date(dt.getTime() + 8 * 3600000);
      witaStr = witaTime.toISOString().replace('T', ' ').slice(0, 19) + ' WITA';
    }
    console.log(`${i+1}. Email: ${u.email.padEnd(28)} | Nama: ${(u.user_metadata?.nama_lengkap || 'Tanpa Nama').padEnd(16)} | Last Sign In: ${witaStr}`);
  });

  console.log('\n================================================================');
  console.log('2. CEK TABEL-TABEL DATABASE YANG BERUBAH 22-23 OKTOBER');
  console.log('================================================================');
  
  // Articles
  const { data: articles } = await supabase.from('articles').select('id, title, author_name, created_at, updated_at').order('created_at', { ascending: false }).limit(10);
  console.log('\n--- Artikel Terbaru ---');
  (articles || []).forEach(a => {
    console.log(`[${a.created_at}] "${a.title}" oleh ${a.author_name}`);
  });

  // News
  const { data: news } = await supabase.from('news').select('id, judul, tipe, created_at, updated_at').order('created_at', { ascending: false }).limit(10);
  console.log('\n--- Berita Terbaru ---');
  (news || []).forEach(n => {
    console.log(`[${n.created_at}] "${n.judul}" (${n.tipe})`);
  });

  // Theses
  const { data: theses } = await supabase.from('theses').select('id, judul, penulis, created_at').order('created_at', { ascending: false }).limit(10);
  console.log('\n--- Skripsi Terbaru ---');
  (theses || []).forEach(t => {
    console.log(`[${t.created_at}] "${t.judul}" oleh ${t.penulis}`);
  });

  // Submissions
  const { data: subs } = await supabase.from('submissions').select('id, judul, nama, status, created_at').order('created_at', { ascending: false }).limit(10);
  console.log('\n--- Naskah/Submissions Terbaru ---');
  (subs || []).forEach(s => {
    console.log(`[${s.created_at}] "${s.judul}" dari ${s.nama} [Status: ${s.status}]`);
  });

  // Site Content updated_at
  const { data: siteContents } = await supabase.from('site_content').select('key, group_name, updated_at').order('updated_at', { ascending: false });
  console.log('\n--- Site Content Updated Antara 22 - 23 Okt ---');
  (siteContents || []).forEach(sc => {
    console.log(`Key: ${sc.key.padEnd(25)} | Updated: ${sc.updated_at}`);
  });

  console.log('\n================================================================');
  console.log('3. RIWAYAT ACTIVITY LOGS (22 - 23 OKT 2026)');
  console.log('================================================================');
  const { data: logRow } = await supabase.from('site_content').select('value').eq('key', 'activity_logs').single();
  const logs = logRow?.value || [];
  const logs2223 = logs.filter(l => l.timestamp && (l.timestamp.includes('22 Okt 2026') || l.timestamp.includes('23 Okt 2026')));
  console.log(`Total log aktivitas tercatat (22-23 Okt 2026): ${logs2223.length}`);
  logs2223.forEach((l, i) => {
    console.log(`${i+1}. [${l.timestamp}] Pelaku: "${l.user}" | Aksi: "${l.action}" | Target: "${l.target}"`);
  });
}

investigate().catch(console.error);
