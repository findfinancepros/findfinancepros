#!/usr/bin/env node
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const OLD = 'top-fractional-cfo-firms-toronto-2026';
const { data: byOld } = await supa.from('blog_posts').select('slug,title,date').eq('slug', OLD).maybeSingle();
console.log('old slug present in blog_posts?', byOld ? 'YES' : 'NO');
if (byOld) console.log('  →', byOld);

console.log('\n=== posts with toronto in slug or title ===');
const { data: matches } = await supa
  .from('blog_posts')
  .select('slug,title,date')
  .or('slug.ilike.%toronto%,title.ilike.%toronto%')
  .order('date', { ascending: false });
for (const p of matches || []) console.log(`  ${p.date} — ${p.slug}\n    ${p.title}`);
