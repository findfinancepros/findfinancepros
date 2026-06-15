#!/usr/bin/env node
// Build a review report from all enriched.json files vs current Supabase values.
// Read-only: makes NO changes to Supabase. Writes scrape-cache/<batch>-report.json
// Usage: node scripts/scrape-report.mjs [--batch batch-50.json]
import fs from 'node:fs/promises';
import path from 'node:path';
import { supabase, CACHE_DIR } from './scrape-lib.mjs';

const args = process.argv.slice(2);
const getArg = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const batchFile = getArg('--batch') || 'batch-50.json';

const ENRICH_FIELDS = ['email', 'phone', 'linkedin', 'logo_url', 'tagline', 'team_size', 'year_founded',
  'certifications', 'languages', 'min_engagement', 'service_area', 'long_description'];

const batch = JSON.parse(await fs.readFile(path.join(CACHE_DIR, batchFile), 'utf8'));

// current Supabase rows
const cur = {};
for (let i = 0; i < batch.length; i += 200) {
  const { data, error } = await supabase.from('firms').select('*').in('slug', batch.slice(i, i + 200));
  if (error) throw new Error(error.message);
  for (const r of data) cur[r.slug] = r;
}

const isEmpty = (v) => v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);

const records = [];
const failed = [];
const fillNew = Object.fromEntries(ENRICH_FIELDS.map((f) => [f, 0]));   // newly filled (was empty)
const fillChange = Object.fromEntries(ENRICH_FIELDS.map((f) => [f, 0])); // changed existing value
const flagged = [];

for (const slug of batch) {
  let e;
  try { e = JSON.parse(await fs.readFile(path.join(CACHE_DIR, slug, 'enriched.json'), 'utf8')); }
  catch {
    let reason = 'no enriched.json';
    try { const m = JSON.parse(await fs.readFile(path.join(CACHE_DIR, slug, 'meta.json'), 'utf8')); reason = m.error || (m.redirectedOffDomain ? `redirected→${m.landedUrl}` : 'thin/empty content'); } catch {}
    failed.push({ slug, reason });
    continue;
  }
  const c = cur[slug] || {};
  const changes = {};
  for (const f of ENRICH_FIELDS) {
    const nv = e[f];
    if (isEmpty(nv)) continue;
    const ov = c[f];
    if (isEmpty(ov)) { fillNew[f]++; changes[f] = { from: null, to: nv }; }
    else if (JSON.stringify(ov) !== JSON.stringify(nv)) { fillChange[f]++; changes[f] = { from: ov, to: nv }; }
  }
  if ((e.review_flags || []).length || e.confidence === 'low') {
    flagged.push({ slug, confidence: e.confidence, flags: e.review_flags || [] });
  }
  records.push({ slug, name: c.name, confidence: e.confidence, changedFields: Object.keys(changes).length, services: e.services, team: (e.team || []).length });
}

const report = { batchFile, generatedFor: batch.length, enriched: records.length, failed, fillNew, fillChange, flagged, records };
await fs.writeFile(path.join(CACHE_DIR, batchFile.replace('.json', '-report.json')), JSON.stringify(report, null, 2));

// ---- console summary ----
console.log(`\n=== ENRICHMENT REVIEW: ${batchFile} ===`);
console.log(`firms in batch: ${batch.length} | enriched: ${records.length} | failed/skipped: ${failed.length}\n`);
console.log('FIELD COVERAGE (newly filled where DB was empty  /  changed an existing value):');
for (const f of ENRICH_FIELDS) console.log(`  ${f.padEnd(18)} +${String(fillNew[f]).padStart(2)} new   ~${String(fillChange[f]).padStart(2)} changed`);
console.log(`\nFAILED / SKIPPED (${failed.length}):`);
for (const x of failed) console.log(`  ${x.slug.padEnd(26)} ${x.reason}`);
console.log(`\nFLAGGED FOR REVIEW (${flagged.length}):`);
for (const x of flagged) console.log(`  [${x.confidence}] ${x.slug}\n      - ${x.flags.join('\n      - ')}`);
const conf = records.reduce((a, r) => (a[r.confidence] = (a[r.confidence] || 0) + 1, a), {});
console.log(`\nCONFIDENCE: ${JSON.stringify(conf)}`);
console.log(`\nFull report: ${path.join(CACHE_DIR, batchFile.replace('.json', '-report.json'))}`);
