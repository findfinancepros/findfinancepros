#!/usr/bin/env node
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const firms = [];
let from = 0;
const PAGE = 1000;
while (true) {
  const { data, error } = await supabase
    .from('firms')
    .select('slug,name,website,city,city_label,country,province,services,email')
    .range(from, from + PAGE - 1);
  if (error) { console.error(error); break; }
  if (!data || data.length === 0) break;
  firms.push(...data);
  if (data.length < PAGE) break;
  from += PAGE;
}

const total = firms.length;
const byCountry = {};
const byService = {};
const byCity = {};
const withEmail = firms.filter((f) => f.email).length;

firms.forEach((f) => {
  byCountry[f.country] = (byCountry[f.country] || 0) + 1;
  const key = f.city_label || f.city;
  byCity[key] = (byCity[key] || 0) + 1;
  (f.services || []).forEach((s) => {
    byService[s] = (byService[s] || 0) + 1;
  });
});

console.log(`TOTAL: ${total}`);
console.log(`WITH_EMAIL: ${withEmail}`);
console.log('\n=== BY COUNTRY ===');
Object.entries(byCountry).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`${k}: ${v}`));

console.log('\n=== BY SERVICE ===');
Object.entries(byService).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`${k}: ${v}`));

console.log('\n=== TOP 40 CITIES ===');
Object.entries(byCity).sort((a, b) => b[1] - a[1]).slice(0, 40).forEach(([k, v]) => console.log(`${k}: ${v}`));

// Dump existing slugs/names/domains for dedup
const dedupRows = firms.map((f) => ({
  slug: f.slug,
  name: (f.name || '').toLowerCase(),
  domain: (f.website || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '').toLowerCase(),
}));
import('fs').then((fs) => {
  fs.writeFileSync('scripts/.dedup.json', JSON.stringify(dedupRows));
  console.log(`\nDedup file written: ${dedupRows.length} rows`);
  process.exit(0);
});
