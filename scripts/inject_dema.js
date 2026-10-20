const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function injectDema() {
  const demaData = JSON.parse(fs.readFileSync('scripts/formatted_dema_data.json', 'utf8'));

  console.log(`Writing ${demaData.members.length} members and ${demaData.divisions.length} divisions to Supabase site_content...`);

  const { data, error } = await supabase.from('site_content').upsert(
    {
      key: 'dema_settings',
      group_name: 'dema',
      label: 'Konten Dewan Mahasantri (DeMa)',
      value: demaData,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'key' }
  );

  if (error) {
    console.error('Supabase write error:', error);
    process.exit(1);
  }

  console.log('SUCCESS! Real DeMa data from Google Sheet is now permanently in Supabase PostgreSQL.');
}

injectDema();
