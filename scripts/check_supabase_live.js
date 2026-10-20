const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const idx = trimmed.indexOf('=');
  if (idx !== -1) {
    const k = trimmed.slice(0, idx).trim();
    const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    env[k] = v;
  }
});

console.log('Supabase URL:', env.NEXT_PUBLIC_SUPABASE_URL);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  // 1. site_content keys
  const { data: siteContent, error: scErr } = await supabase.from('site_content').select('key, updated_at');
  console.log('site_content keys:', siteContent);
  if (scErr) console.log('scErr:', scErr);

  // 2. collections (masyayikh / sarana)
  const { data: collections, error: colErr } = await supabase.from('collections').select('id, collection_type, data, updated_at');
  console.log('collections count:', collections ? collections.length : 0);
  if (collections) {
    collections.forEach(c => console.log('Collection:', c.collection_type, c.data?.name || c.data?.title, 'Updated:', c.updated_at));
  }

  // 3. check about_page in site_content
  const { data: aboutPage } = await supabase.from('site_content').select('value, updated_at').eq('key', 'about_page').single();
  if (aboutPage) {
    console.log('About page updated_at:', aboutPage.updated_at);
    console.log('About page in DB:', JSON.stringify(aboutPage.value).slice(0, 400));
  }

  // 4. check media
  const { data: media } = await supabase.from('media').select('id, filename, url, created_at').order('created_at', { ascending: false }).limit(10);
  console.log('Recent media in DB:', media);
}

check();
