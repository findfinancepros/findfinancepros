#!/usr/bin/env node
/** Batch 3 final fill attempt — remaining candidates for close-to-30 cities. */
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function f(slug, name, contact, city, cityLabel, province, country, services, industries, description, website) {
  return { slug, name, contact: contact || 'Team', city, cityLabel, province, country, services, industries, description, website };
}

const CANDIDATES = [
  // Tucson
  f("thomas-scott-tucson", "Thomas E. Scott CPA", "Thomas E. Scott", "tucson", "Tucson", "Arizona", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Thomas E. Scott CPA is a Tucson specialty practice focusing on small businesses and individuals needing bookkeeping, tax planning, and tax preparation services.", "https://www.tescottcpa.com"),
  f("david-clements-tucson", "David D. Clements CPA", "David D. Clements", "tucson", "Tucson", "Arizona", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "David D. Clements CPA is an experienced Tucson certified public accounting firm licensed in AZ serving Tucson and surrounding communities since 1992.", "https://www.davidclementscpa.com"),

  // Providence
  f("jason-smith-pvd", "Jason E. Smith CPA", "Jason E. Smith", "providence", "Providence", "Rhode Island", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Jason E. Smith, CPA is a Cranston, Rhode Island accounting and tax firm serving individuals and businesses throughout Rhode Island since 2008.", "https://jasonesmithcpa.com"),

  // Albuquerque
  f("cottonwood-abq", "The Cottonwood Group", "Team", "albuquerque", "Albuquerque", "New Mexico", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "The Cottonwood Group is an Albuquerque CPA practice providing tax preparation, planning, bookkeeping, and accounting services to small businesses and individuals.", "https://cottonwoodgrp.com"),

  // Birmingham — run out of strong candidates; trying niche firms
  f("moores-svc-bhm", "Moore's Services", "Team", "birmingham", "Birmingham", "Alabama", "United States", ["tax-advisory"], ["professional-services"], "Moore's Services L.L.C. is a Birmingham tax preparation firm serving individuals and businesses for 36+ years.", "https://www.moores-services.com"),

  // Louisville
  f("ward-cpa-lou", "Matthew L. Ward CPA", "Matthew L. Ward", "louisville", "Louisville", "Kentucky", "United States", ["fractional-cfo", "tax-advisory", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Matthew L. Ward, CPA is a veteran-owned Louisville practice with 25+ years of specialized experience focusing on proactive tax planning and long-term advisory for small business owners.", "https://matthewwardcpa.com"),

  // San Francisco
  f("dimovtax-sf", "Dimov Tax San Francisco", "Team", "san-francisco", "San Francisco", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "technology", "real-estate"], "Dimov Tax Specialists San Francisco provides tax, accounting, and bookkeeping services to businesses and individuals in the Bay Area.", "https://dimovtax.com/locations/cpa-san-francisco-ca"),
];

function normName(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function normWeb(s) { if (!s) return ''; return s.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].replace(/\/$/, ''); }
const UA = 'Mozilla/5.0 (compatible; FindFinanceProsBot/1.0)';
const TIMEOUT = 8000;
async function timedFetch(url, opts = {}) {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try { return await fetch(url, { ...opts, signal: ctrl.signal, headers: { 'User-Agent': UA, ...(opts.headers || {}) } }); } finally { clearTimeout(t); }
}
async function headCheck(url) {
  try { const r = await timedFetch(url, { method: 'HEAD', redirect: 'follow' }); if (r.status >= 200 && r.status < 400) return true; const g = await timedFetch(url, { method: 'GET', redirect: 'follow' }); return g.status >= 200 && g.status < 400; }
  catch { try { const g = await timedFetch(url, { method: 'GET', redirect: 'follow' }); return g.status >= 200 && g.status < 400; } catch { return false; } }
}
const EMAIL_RX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const BAD_PREFIX = /^(example|sample|test|user|name|first\.last|your|someone|noreply|no-reply)@/i;
const BAD_DOMAIN = /(example\.com|sentry\.io|wixpress\.com|2x\.png|godaddy\.com|squarespace\.com)/i;
function extractEmail(text, preferredDomain) {
  if (!text) return null;
  const matches = [...new Set(text.match(EMAIL_RX) || [])];
  const valid = matches.filter((e) => !BAD_PREFIX.test(e) && !BAD_DOMAIN.test(e));
  if (!valid.length) return null;
  if (preferredDomain) { const local = valid.find((e) => e.toLowerCase().endsWith('@' + preferredDomain)); if (local) return local; }
  return valid[0];
}
async function findEmail(baseUrl) {
  const domain = normWeb(baseUrl);
  const tries = [baseUrl, baseUrl.replace(/\/$/, '') + '/contact', baseUrl.replace(/\/$/, '') + '/contact-us', baseUrl.replace(/\/$/, '') + '/about', baseUrl.replace(/\/$/, '') + '/about-us'];
  for (const url of tries) {
    try { const res = await timedFetch(url, { method: 'GET', redirect: 'follow' }); if (!res.ok) continue; const text = await res.text(); const email = extractEmail(text, domain); if (email) return email; } catch {}
  }
  return null;
}
async function pmap(items, concurrency, fn) {
  const results = new Array(items.length); let i = 0;
  await Promise.all(Array(Math.min(concurrency, items.length)).fill(0).map(async () => { while (i < items.length) { const idx = i++; results[idx] = await fn(items[idx], idx); } }));
  return results;
}

async function main() {
  const { data: existing } = await sb.from('firms').select('slug, name, website');
  const existingSlugs = new Set(existing.map((r) => r.slug));
  const existingNames = new Set(existing.map((r) => normName(r.name)));
  const existingWebsites = new Set(existing.map((r) => normWeb(r.website)).filter(Boolean));

  const passed = [];
  for (const c of CANDIDATES) {
    if (existingSlugs.has(c.slug) || existingNames.has(normName(c.name))) continue;
    const w = normWeb(c.website); if (w && existingWebsites.has(w)) continue;
    passed.push(c);
  }

  const alive = await pmap(passed, 10, async (c) => (await headCheck(c.website)) ? c : null);
  const live = alive.filter(Boolean);
  for (const c of passed) if (!live.includes(c)) console.log(`  ☠ [${c.city}] ${c.name} — ${c.website}`);

  const withEmail = await pmap(live, 8, async (c) => ({ ...c, email: await findEmail(c.website) }));
  console.log(`\n${withEmail.filter((x) => x.email).length}/${withEmail.length} have email`);

  const toInsert = withEmail.map((c) => ({
    slug: c.slug, name: c.name, contact: c.contact || null, title: null, email: c.email || null,
    city: c.city, city_label: c.cityLabel, province: c.province, country: c.country,
    services: c.services || [], industries: c.industries || [],
    description: c.description || null, website: c.website || null,
    plan: 'free', priority_score: 0, status: 'active',
    submitted_by: 'admin', source: 'claude_code',
  }));
  if (toInsert.length) {
    const { error } = await sb.from('firms').insert(toInsert);
    if (error) { console.error(error.message); process.exit(1); }
    console.log(`✓ Inserted ${toInsert.length}`);
  }
  for (const c of ['las-vegas','atlanta','sacramento','birmingham','tucson','louisville','providence','albuquerque','san-francisco']) {
    const { count } = await sb.from('firms').select('*', { count: 'exact', head: true }).eq('city', c).eq('status', 'active');
    console.log(`  ${c.padEnd(16)} ${count}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
