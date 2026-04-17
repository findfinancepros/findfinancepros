#!/usr/bin/env node
/**
 * Syncs cities from the firms table into the cities lookup table.
 * Finds all unique city/city_label/province/country combos in firms
 * and upserts them into the cities table.
 */
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !KEY) {
  console.error('Missing Supabase env vars in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('Syncing cities from firms table...\n');

  // Get all unique city combos from active firms.
  // Supabase caps every request at 1000 rows, so we page through.
  const firms = [];
  let from = 0;
  while (true) {
    const to = from + 999;
    const { data, error } = await supabase
      .from('firms')
      .select('city, city_label, province, country')
      .eq('status', 'active')
      .range(from, to);
    if (error) {
      console.error('Failed to fetch firms:', error.message);
      process.exit(1);
    }
    const rows = data || [];
    firms.push(...rows);
    if (rows.length < 1000) break;
    from += 1000;
  }
  console.log(`Scanned ${firms.length} active firm rows.`);

  // Deduplicate by city slug
  const cityMap = new Map();
  for (const f of firms) {
    if (!cityMap.has(f.city)) {
      cityMap.set(f.city, {
        slug: f.city,
        label: f.city_label,
        province: f.province,
        country: f.country,
      });
    }
  }

  const cityRows = Array.from(cityMap.values());
  console.log(`Found ${cityRows.length} unique cities in firms table.`);

  // Get existing cities
  const { data: existingCities } = await supabase.from('cities').select('slug');
  const existingSlugs = new Set((existingCities || []).map((c) => c.slug));

  const newCities = cityRows.filter((c) => !existingSlugs.has(c.slug));

  if (!newCities.length) {
    console.log('All cities already exist in cities table. Nothing to do.');
    return;
  }

  console.log(`\nInserting ${newCities.length} new cities:`);
  newCities.forEach((c) => console.log(`  + ${c.label} (${c.province}, ${c.country})`));

  const { error } = await supabase.from('cities').upsert(cityRows, { onConflict: 'slug' });

  if (error) {
    console.error('\n✗ Failed to upsert cities:', error.message);
    process.exit(1);
  }

  // Verify
  const { count } = await supabase
    .from('cities')
    .select('*', { count: 'exact', head: true });

  console.log(`\n✓ Cities table now has ${count} rows.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
