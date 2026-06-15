#!/usr/bin/env node
// Stage 2 — Deterministic extraction from cached HTML. Free, no AI.
// Pulls email, phone, linkedin, logo, social links, and schema.org JSON-LD.
// Writes scrape-cache/<slug>/extracted-deterministic.json
//
// Usage: node scripts/scrape-2-extract-deterministic.mjs [--slugs a,b]
import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { CACHE_DIR } from './scrape-lib.mjs';

const args = process.argv.slice(2);
const getArg = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const ONLY = getArg('--slugs')?.split(',').map((s) => s.trim()) || null;

// Body-text email regex. The TLD is constrained to a known set so a glued
// location word can't extend it (e.g. "info@bellevuecpa.ca" + "Whitby").
const TLD = 'com|org|net|ca|io|co|us|uk|biz|info|cpa|llc|tax|group|ventures|consulting|accountants|partners|finance|edu|gov';
const EMAIL_RE = new RegExp(`\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.(?:${TLD})(?![A-Za-z])`, 'gi');
const PHONE_RE = /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
const JUNK_EMAIL = /(example|sentry|wixpress|\.png|\.jpg|\.gif|@2x|domain\.com|email@)/i;

function uniq(arr) { return [...new Set(arr)]; }

function extractFromHtml(html, baseHost) {
  const $ = cheerio.load(html);
  const out = { emails: [], phones: [], socials: {}, logo: null, jsonld: [] };

  // mailto / tel links (most reliable)
  $('a[href^="mailto:"]').each((_, a) => {
    const e = ($(a).attr('href') || '').replace(/^mailto:/i, '').split('?')[0].trim();
    if (e && !JUNK_EMAIL.test(e)) out.emails.push(e.toLowerCase());
  });
  $('a[href^="tel:"]').each((_, a) => {
    let t = ($(a).attr('href') || '').replace(/^tel:/i, '').trim();
    try { t = decodeURIComponent(t); } catch {}   // tel:(281)%20440 -> (281) 440
    t = t.replace(/\s+/g, ' ').trim();
    if (t) out.phones.push(t);
  });

  // social links
  $('a[href]').each((_, a) => {
    const href = $(a).attr('href') || '';
    const m = href.match(/(linkedin|twitter|x\.com|facebook|instagram|youtube)\.com/i);
    if (m) {
      const net = m[1].toLowerCase().replace('x.com', 'twitter');
      if (!out.socials[net]) out.socials[net] = href.split('?')[0];
    }
  });

  // logo: og:image then apple-touch / favicon
  out.logo = $('meta[property="og:image"]').attr('content')
    || $('link[rel="apple-touch-icon"]').attr('href')
    || $('link[rel="icon"]').attr('href') || null;

  // body-text emails/phones as fallback
  const text = $('body').text();
  (text.match(EMAIL_RE) || []).forEach((e) => { if (!JUNK_EMAIL.test(e)) out.emails.push(e.toLowerCase()); });
  (text.match(PHONE_RE) || []).forEach((p) => out.phones.push(p.trim()));

  // schema.org JSON-LD
  $('script[type="application/ld+json"]').each((_, s) => {
    try { out.jsonld.push(JSON.parse($(s).contents().text())); } catch {}
  });

  return out;
}

function pickFromJsonLd(blocks) {
  const flat = [];
  const walk = (n) => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (n && typeof n === 'object') { flat.push(n); if (n['@graph']) walk(n['@graph']); }
  };
  blocks.forEach(walk);
  const org = flat.find((n) => /Organization|LocalBusiness|ProfessionalService|Accounting/i.test(JSON.stringify(n['@type'] || '')));
  const people = flat.filter((n) => /Person/i.test(JSON.stringify(n['@type'] || '')))
    .map((p) => ({ name: p.name, title: p.jobTitle })).filter((p) => p.name);
  const founded = flat.map((n) => n.foundingDate).find(Boolean);
  let address = null;
  const a = org?.address || flat.map((n) => n.address).find(Boolean);
  if (a && typeof a === 'object') {
    address = [a.streetAddress, a.addressLocality, a.addressRegion, a.postalCode].filter(Boolean).join(', ');
  }
  return {
    orgName: org?.name || null,
    orgPhone: org?.telephone || null,
    orgEmail: org?.email || null,
    address,
    foundingYear: founded ? String(founded).slice(0, 4) : null,
    people,
  };
}

async function processFirm(slug) {
  const dir = path.join(CACHE_DIR, slug);
  let meta;
  try { meta = JSON.parse(await fs.readFile(path.join(dir, 'meta.json'), 'utf8')); } catch { return null; }
  if (meta.error && !meta.pages) return { slug, skipped: meta.error };

  const baseHost = meta.website ? new URL(meta.website).hostname.replace(/^www\./, '') : '';
  const agg = { emails: [], phones: [], socials: {}, logo: null, jsonld: [] };
  const htmlFiles = (await fs.readdir(dir)).filter((f) => f.endsWith('.html'));
  for (const hf of htmlFiles) {
    const html = await fs.readFile(path.join(dir, hf), 'utf8');
    const e = extractFromHtml(html, baseHost);
    agg.emails.push(...e.emails); agg.phones.push(...e.phones);
    Object.assign(agg.socials, { ...e.socials, ...agg.socials });
    if (!agg.logo && e.logo) agg.logo = e.logo;
    agg.jsonld.push(...e.jsonld);
  }
  const ld = pickFromJsonLd(agg.jsonld);

  // Prefer on-domain emails
  const emails = uniq(agg.emails);
  const onDomain = emails.filter((e) => e.endsWith('@' + baseHost) || e.includes(baseHost.split('.')[0]));
  const result = {
    slug,
    email: ld.orgEmail || onDomain[0] || emails[0] || null,
    all_emails: emails.slice(0, 8),
    phone: ld.orgPhone || uniq(agg.phones)[0] || null,
    all_phones: uniq(agg.phones).slice(0, 5),
    linkedin: agg.socials.linkedin || null,
    socials: agg.socials,
    logo_url: agg.logo && meta.website ? new URL(agg.logo, meta.website).toString() : agg.logo,
    address: ld.address || null,
    year_founded: ld.foundingYear || null,
    jsonld_people: ld.people.slice(0, 12),
    jsonld_org_name: ld.orgName || null,
  };
  await fs.writeFile(path.join(dir, 'extracted-deterministic.json'), JSON.stringify(result, null, 2));
  return result;
}

(async () => {
  const slugs = ONLY || (await fs.readdir(CACHE_DIR)).filter(async (d) => true);
  const list = ONLY || (await fs.readdir(CACHE_DIR, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);
  let n = 0;
  for (const slug of list) {
    const r = await processFirm(slug);
    if (!r) continue;
    n++;
    if (r.skipped) { console.log(`  ${slug.padEnd(26)} skipped (${r.skipped})`); continue; }
    console.log(`  ${slug.padEnd(26)} email=${r.email || '-'} phone=${r.phone || '-'} li=${r.linkedin ? 'y' : '-'} people=${r.jsonld_people.length} founded=${r.year_founded || '-'}`);
  }
  console.log(`\nDeterministic extraction done for ${n} firm(s).`);
})();
