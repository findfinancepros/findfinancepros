#!/usr/bin/env node
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Services table
const { data: services, error: sErr } = await supabase
  .from('services')
  .select('slug,label,description')
  .order('slug');
if (sErr) throw sErr;
console.log('=== services table ===');
for (const s of services) console.log(`  ${s.slug}  |  ${s.label}`);

// All unique service slugs used across firms (paginated)
const seen = new Map(); // slug -> count
let from = 0;
const PAGE = 1000;
while (true) {
  const { data, error } = await supabase
    .from('firms')
    .select('services')
    .eq('status', 'active')
    .range(from, from + PAGE - 1);
  if (error) throw error;
  const rows = data || [];
  for (const row of rows) {
    for (const s of row.services || []) {
      seen.set(s, (seen.get(s) || 0) + 1);
    }
  }
  if (rows.length < PAGE) break;
  from += PAGE;
}

const svcTableSlugs = new Set(services.map((s) => s.slug));
const missing = [];
for (const [slug, count] of [...seen.entries()].sort((a, b) => b[1] - a[1])) {
  if (!svcTableSlugs.has(slug)) missing.push({ slug, count });
}

console.log(`\n=== used slugs on firms (total ${seen.size}, firms referencing: ${[...seen.values()].reduce((a,b) => a+b, 0)}) ===`);
for (const [slug, count] of [...seen.entries()].sort((a, b) => b[1] - a[1])) {
  const marker = svcTableSlugs.has(slug) ? ' ' : 'X';
  console.log(`  [${marker}] ${slug}  (${count} firms)`);
}

console.log(`\n=== missing service categories (${missing.length}) ===`);
for (const m of missing) console.log(`  ${m.slug}  (${m.count} firms)`);
