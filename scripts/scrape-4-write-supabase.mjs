#!/usr/bin/env node
// Stage 4 — Write enriched records to Supabase. Backs up current rows first.
// Default is DRY-RUN (prints what would change). Pass --apply to write.
//
//   node scripts/scrape-4-write-supabase.mjs --batch batch-50.json            # dry run
//   node scripts/scrape-4-write-supabase.mjs --batch batch-50.json --apply     # write
//   add --inactivate slug1,slug2  to set those firms status=inactive
import fs from 'node:fs/promises';
import path from 'node:path';
import { supabase, CACHE_DIR } from './scrape-lib.mjs';

const args = process.argv.slice(2);
const getArg = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const APPLY = args.includes('--apply');
const batchFile = getArg('--batch') || 'batch-50.json';
const inactivate = new Set((getArg('--inactivate') || '').split(',').map((s) => s.trim()).filter(Boolean));
const inactivateFile = getArg('--inactivate-file');

// -- em-dash / en-dash sanitizer (user wants minimal em-dashes) ---------------
function deDash(v) {
  if (typeof v !== 'string') return v;
  let s = v
    .replace(/\s*—\s*/g, ', ')   // em dash -> comma
    .replace(/(\d)\s*–\s*(\d)/g, '$1 to $2') // en dash between numbers -> "to"
    .replace(/\s*–\s*/g, '-')    // other en dash -> hyphen
    .replace(/,\s*,/g, ',')           // collapse double commas
    .replace(/\s+,/g, ',')
    .replace(/,\s*\./g, '.')          // ", ." -> "."
    .replace(/\s{2,}/g, ' ')
    .trim();
  return s;
}
const deDashDeep = (v) => Array.isArray(v) ? v.map(deDashDeep)
  : (v && typeof v === 'object') ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deDashDeep(x)]))
  : deDash(v);

const isEmpty = (v) => v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);

const batch = JSON.parse(await fs.readFile(path.join(CACHE_DIR, batchFile), 'utf8'));
const inactivateList = inactivateFile
  ? JSON.parse(await fs.readFile(path.join(CACHE_DIR, inactivateFile), 'utf8'))
  : [];

// current rows (for both the write batch and the inactivate list, so all are backed up)
const cur = {};
const allSlugs = [...new Set([...batch, ...inactivateList])];
for (let i = 0; i < allSlugs.length; i += 200) {
  const { data, error } = await supabase.from('firms').select('*').in('slug', allSlugs.slice(i, i + 200));
  if (error) throw new Error(error.message);
  for (const r of data) cur[r.slug] = r;
}

// ---- backup ----
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(CACHE_DIR, 'backups');
await fs.mkdir(backupDir, { recursive: true });
const backupPath = path.join(backupDir, `firms-backup-${batchFile.replace('.json', '')}-${stamp}.json`);
await fs.writeFile(backupPath, JSON.stringify(Object.values(cur), null, 2));
console.log(`Backup of ${Object.keys(cur).length} current rows -> ${backupPath}\n`);

// Additive enrichment fields: only set when DB empty OR scraped value present (never null-out).
const ADD_FIELDS = ['email', 'phone', 'linkedin', 'logo_url', 'tagline', 'team_size', 'year_founded',
  'certifications', 'languages', 'min_engagement', 'pricing_notes', 'service_area', 'long_description',
  'team', 'free_consultation', 'accepts_new_clients'];
// Scraped-wins fields (may have existing values; backup protects them).
const OVERWRITE_FIELDS = ['description', 'services', 'industries'];

let writes = 0, skips = 0;
for (const slug of batch) {
  const c = cur[slug];
  if (!c) { console.log(`  ${slug}: not in DB, skip`); continue; }
  let e;
  try { e = deDashDeep(JSON.parse(await fs.readFile(path.join(CACHE_DIR, slug, 'enriched.json'), 'utf8'))); }
  catch { console.log(`  ${slug}: no enriched.json, skip`); skips++; continue; }

  const upd = {};
  for (const f of ADD_FIELDS) if (!isEmpty(e[f])) upd[f] = e[f];
  for (const f of OVERWRITE_FIELDS) if (!isEmpty(e[f])) upd[f] = e[f];
  // contact/title: only improve, don't clobber a real name with "Team"
  if (e.contact && e.contact !== 'Team') upd.contact = e.contact;
  if (e.title) upd.title = e.title;
  upd.verified_website = true;
  upd.updated_at = new Date().toISOString();

  if (inactivate.has(slug)) {
    upd.status = 'inactive';
    upd.notes = `${c.notes ? c.notes + ' | ' : ''}Auto-inactivated ${stamp}: ${(e.review_flags || []).join('; ')}`.slice(0, 1000);
  }

  const changedKeys = Object.keys(upd).filter((k) => !['verified_website', 'updated_at'].includes(k));
  console.log(`  ${slug.padEnd(26)} ${inactivate.has(slug) ? '[INACTIVATE] ' : ''}set: ${changedKeys.join(', ')}`);

  if (APPLY) {
    const { error } = await supabase.from('firms').update(upd).eq('slug', slug);
    if (error) { console.log(`     ERROR: ${error.message}`); skips++; continue; }
    writes++;
  }
}

// ---- inactivate redirected/acquired firms (from --inactivate-file) ----
let inactivated = 0;
for (const slug of inactivateList) {
  const c = cur[slug];
  if (!c) continue;
  if (c.status === 'inactive') continue;
  let reason = 'website redirects off-domain (likely acquired/rebranded)';
  try {
    const m = JSON.parse(await fs.readFile(path.join(CACHE_DIR, slug, 'meta.json'), 'utf8'));
    if (m.landedUrl) reason = `website now redirects to ${m.landedUrl} (likely acquired/rebranded)`;
  } catch {}
  const upd = {
    status: 'inactive',
    notes: `${c.notes ? c.notes + ' | ' : ''}Auto-inactivated ${stamp}: ${reason}`.slice(0, 1000),
    updated_at: new Date().toISOString(),
  };
  console.log(`  [INACTIVATE] ${slug.padEnd(26)} ${reason.slice(0, 60)}`);
  if (APPLY) {
    const { error } = await supabase.from('firms').update(upd).eq('slug', slug);
    if (error) { console.log(`     ERROR: ${error.message}`); continue; }
    inactivated++;
  }
}

console.log(`\n${APPLY ? 'WROTE' : 'DRY-RUN (no writes)'}: ${APPLY ? writes : batch.length} firms enriched, ${APPLY ? inactivated : inactivateList.length} inactivated. skipped=${skips}`);
console.log(`Restore if needed from: ${backupPath}`);
if (!APPLY) console.log('\nRe-run with --apply to write.');
