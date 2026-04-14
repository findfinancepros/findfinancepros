#!/usr/bin/env node
/**
 * Seeds firms, cities, services, industries, and blog_posts from the
 * file-based data modules into Supabase.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local to bypass RLS on writes.
 */
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { professionals, cities, services, industries } from '../src/data/directory.js';
import { blogPosts } from '../src/data/blog.js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !KEY) {
  console.error('Missing Supabase env vars in .env.local');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '\n⚠  SUPABASE_SERVICE_ROLE_KEY not set; using anon key. Seeding will likely fail due to RLS.\n'
  );
}

const supabase = createClient(SUPABASE_URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function firmToRow(p) {
  return {
    slug: p.slug,
    name: p.name,
    contact: p.contact || null,
    title: p.title || null,
    city: p.city,
    city_label: p.cityLabel,
    province: p.province,
    country: p.country,
    services: p.services || [],
    industries: p.industries || [],
    description: p.description || null,
    website: p.website || null,
    linkedin: p.linkedin || null,
    plan: p.featured ? 'featured' : 'free',
    priority_score: p.featured ? 100 : 0,
    status: 'active',
    submitted_by: 'admin',
    source: 'seed',
  };
}

function blogToRow(b) {
  return {
    slug: b.slug,
    title: b.title,
    meta_description: b.metaDescription || null,
    author: b.author || null,
    author_title: b.authorTitle || null,
    date: b.date || null,
    read_time: b.readTime || null,
    category: b.category || null,
    tags: b.tags || [],
    content: b.content || null,
    related_services: b.relatedServices || [],
    related_cities: b.relatedCities || [],
    related_industries: b.relatedIndustries || [],
  };
}

async function upsert(table, rows, onConflict = 'slug') {
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) {
    console.error(`✗ ${table}: ${error.message}`);
    return false;
  }
  console.log(`✓ ${table}: upserted ${rows.length} rows`);
  return true;
}

async function verifyCount(table) {
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });
  if (error) {
    console.error(`  ${table}: count failed — ${error.message}`);
    return;
  }
  console.log(`  ${table}: ${count} rows`);
}

async function main() {
  console.log('Seeding lookup tables...');
  await upsert('cities', cities);
  await upsert('services', services);
  await upsert('industries', industries);

  console.log('\nSeeding firms...');
  await upsert('firms', professionals.map(firmToRow));

  console.log('\nSeeding blog posts...');
  await upsert('blog_posts', blogPosts.map(blogToRow));

  console.log('\nVerification (row counts):');
  for (const t of ['cities', 'services', 'industries', 'firms', 'blog_posts']) {
    await verifyCount(t);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
