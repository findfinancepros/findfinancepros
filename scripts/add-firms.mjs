#!/usr/bin/env node
/**
 * Reusable script to insert firms into Supabase.
 *
 * - Checks for duplicates by name (case-insensitive) and website before inserting.
 * - Adds any new cities to the cities table if they don't already exist.
 * - Reports counts: firms added, firms skipped as duplicates, new cities added.
 *
 * Usage (CLI): node scripts/add-firms.mjs path/to/firms.json
 * Usage (import): import { addFirms } from './add-firms.mjs'; await addFirms([...]);
 *
 * Each firm object should have:
 *   slug, name, contact, title, city, city_label, province, country,
 *   services (string[]), industries (string[]), description, website, source
 */
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

export const supabase = createClient(SUPABASE_URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function normalizeName(s) {
  return (s || '').trim().toLowerCase();
}

function normalizeUrl(s) {
  if (!s) return '';
  return s.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '').replace(/^www\./, '');
}

function firmToRow(f) {
  return {
    slug: f.slug,
    name: f.name,
    contact: f.contact || null,
    title: f.title || null,
    city: f.city,
    city_label: f.city_label || f.cityLabel,
    province: f.province,
    country: f.country,
    services: f.services || [],
    industries: f.industries || [],
    description: f.description || null,
    website: f.website || null,
    linkedin: f.linkedin || null,
    plan: f.featured ? 'featured' : 'free',
    priority_score: f.featured ? 100 : 0,
    status: 'active',
    submitted_by: f.submitted_by || 'admin',
    source: f.source || 'manual',
  };
}

export async function addFirms(firms) {
  if (!Array.isArray(firms) || firms.length === 0) {
    return { added: 0, skipped: 0, citiesAdded: 0, skippedDetails: [] };
  }

  // Load existing firms (name + website + slug) for dedup.
  const { data: existing, error: existingErr } = await supabase
    .from('firms')
    .select('slug, name, website');
  if (existingErr) throw new Error(`Failed to read firms: ${existingErr.message}`);

  const existingNames = new Set(existing.map((r) => normalizeName(r.name)));
  const existingSites = new Set(existing.map((r) => normalizeUrl(r.website)).filter(Boolean));
  const existingSlugs = new Set(existing.map((r) => r.slug));

  // Load existing city slugs.
  const { data: existingCities, error: citiesErr } = await supabase
    .from('cities')
    .select('slug');
  if (citiesErr) throw new Error(`Failed to read cities: ${citiesErr.message}`);
  const existingCitySlugs = new Set(existingCities.map((c) => c.slug));

  const toInsert = [];
  const newCities = new Map();
  const skippedDetails = [];
  const seenNamesInBatch = new Set();
  const seenSitesInBatch = new Set();
  const seenSlugsInBatch = new Set();

  for (const f of firms) {
    const nName = normalizeName(f.name);
    const nSite = normalizeUrl(f.website);

    if (existingNames.has(nName) || seenNamesInBatch.has(nName)) {
      skippedDetails.push({ name: f.name, reason: 'duplicate name' });
      continue;
    }
    if (nSite && (existingSites.has(nSite) || seenSitesInBatch.has(nSite))) {
      skippedDetails.push({ name: f.name, reason: 'duplicate website' });
      continue;
    }
    if (existingSlugs.has(f.slug) || seenSlugsInBatch.has(f.slug)) {
      skippedDetails.push({ name: f.name, reason: 'duplicate slug' });
      continue;
    }

    seenNamesInBatch.add(nName);
    if (nSite) seenSitesInBatch.add(nSite);
    seenSlugsInBatch.add(f.slug);

    toInsert.push(firmToRow(f));

    const citySlug = f.city;
    if (citySlug && !existingCitySlugs.has(citySlug) && !newCities.has(citySlug)) {
      newCities.set(citySlug, {
        slug: citySlug,
        label: f.city_label || f.cityLabel || citySlug,
        province: f.province,
        country: f.country,
      });
    }
  }

  let citiesAdded = 0;
  if (newCities.size > 0) {
    const rows = Array.from(newCities.values());
    const { error } = await supabase.from('cities').insert(rows);
    if (error) throw new Error(`Failed to insert cities: ${error.message}`);
    citiesAdded = rows.length;
  }

  let added = 0;
  if (toInsert.length > 0) {
    // Insert in chunks to stay under any payload limits.
    const CHUNK = 50;
    for (let i = 0; i < toInsert.length; i += CHUNK) {
      const chunk = toInsert.slice(i, i + CHUNK);
      const { error } = await supabase.from('firms').insert(chunk);
      if (error) throw new Error(`Failed to insert firms: ${error.message}`);
      added += chunk.length;
    }
  }

  return {
    added,
    skipped: skippedDetails.length,
    citiesAdded,
    skippedDetails,
  };
}

// CLI entry point
const isMain = import.meta.url === `file://${process.argv[1]}` ||
  import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/'));

if (isMain) {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/add-firms.mjs <firms.json>');
    process.exit(1);
  }
  const raw = await readFile(file, 'utf8');
  const firms = JSON.parse(raw);
  const result = await addFirms(firms);
  console.log(`\n✓ Firms added:       ${result.added}`);
  console.log(`- Firms skipped:     ${result.skipped} (duplicates)`);
  console.log(`✓ New cities added:  ${result.citiesAdded}`);
  if (result.skippedDetails.length > 0) {
    console.log('\nSkipped:');
    for (const s of result.skippedDetails) {
      console.log(`  - ${s.name} (${s.reason})`);
    }
  }
}
