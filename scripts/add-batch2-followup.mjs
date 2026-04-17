#!/usr/bin/env node
/** Followup: fill Omaha/OKC/Birmingham to reach 30 (with 9 firm budget remaining). */
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
  // Omaha +3
  f("schroer-cpa-omaha", "Schroer and Associates", "Team", "omaha", "Omaha", "Nebraska", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Schroer and Associates P.C. is a full-service accounting firm with offices in Council Bluffs, Glenwood, Avoca, and Omaha providing year-round tax, financial, and business planning.", "https://schroer-cpa.com"),
  f("bland-cpa-omaha", "Bland & Associates", "Team", "omaha", "Omaha", "Nebraska", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "manufacturing", "real-estate"], "Bland & Associates, P.C. has over 40 years of expertise and is Nebraska's first 100% employee-owned CPA firm, offering tax, accounting, and advisory services to Omaha-area clients.", "https://blandcpa.com"),
  f("hayes-cpa-omaha", "Hayes CPA", "Team", "omaha", "Omaha", "Nebraska", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Hayes CPA provides tax, accounting, and business advisory services to Omaha-area small businesses and individuals.", "https://hayes.cpa"),

  // OKC +5
  f("kriskcpa-okc", "Kris Keiser CPA", "Kris Keiser", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["bookkeeping", "tax-advisory", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Kris Keiser, CPA/MBA provides Oklahoma City bookkeeping and accounting services to the whole OKC metro area including Mustang, Moore, and surrounding communities.", "https://www.kriskcpa.com"),
  f("wrightmcafee-okc", "Wright, McAfee & Co. CPAs", "Team", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "Wright, McAfee & Co. CPAs has been serving Oklahoma City for 30+ years with a full range of accounting, tax, and small business consulting services since 1983.", "https://www.wrightmcafeecpa.com"),
  f("tedweber-okc", "Ted A Weber CPA", "Ted A. Weber", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Ted A Weber, CPA is a full-service tax, accounting, and business consulting firm located in Mustang, OK serving the Oklahoma City metro.", "https://www.tedwebercpa.com"),
  f("accountantpartners-okc", "Accountant Partners OKC", "Team", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["bookkeeping", "tax-advisory", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Accountant Partners provides Oklahoma City small business accounting, bookkeeping, and tax services to businesses across the OKC metro.", "https://accountantpartners.com/small-business-accountant-oklahoma-city"),
  f("cpatool-okc", "CPATool Oklahoma", "Team", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["tax-advisory", "bookkeeping"], ["professional-services", "retail"], "CPATool is a directory and service for Oklahoma public accounting firms providing tax and accounting resources.", "https://www.cpatool.com"),

  // Birmingham +1
  f("brothers-cpa-hoover", "Brothers CPA Splash", "Team", "birmingham", "Birmingham", "Alabama", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Brothers CPA, PC is a professional tax and accounting firm in Birmingham, Alabama providing a full-service CPA, tax, and accounting services to Birmingham-area clients.", "https://www.brotherscpa.com/"),
];

function normName(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function normWeb(s) { if (!s) return ''; return s.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].replace(/\/$/, ''); }

const UA = 'Mozilla/5.0 (compatible; FindFinanceProsBot/1.0)';
const TIMEOUT = 8000;
async function timedFetch(url, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try { return await fetch(url, { ...opts, signal: ctrl.signal, headers: { 'User-Agent': UA, ...(opts.headers || {}) } }); }
  finally { clearTimeout(t); }
}
async function headCheck(url) {
  try {
    const res = await timedFetch(url, { method: 'HEAD', redirect: 'follow' });
    if (res.status >= 200 && res.status < 400) return true;
    const g = await timedFetch(url, { method: 'GET', redirect: 'follow' });
    return g.status >= 200 && g.status < 400;
  } catch {
    try { const g = await timedFetch(url, { method: 'GET', redirect: 'follow' }); return g.status >= 200 && g.status < 400; }
    catch { return false; }
  }
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
    try { const res = await timedFetch(url, { method: 'GET', redirect: 'follow' }); if (!res.ok) continue; const text = await res.text(); const email = extractEmail(text, domain); if (email) return email; }
    catch {}
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
  const skipped = [];
  for (const c of CANDIDATES) {
    if (existingSlugs.has(c.slug)) { skipped.push({ c, r: 'dup slug' }); continue; }
    if (existingNames.has(normName(c.name))) { skipped.push({ c, r: 'dup name' }); continue; }
    const w = normWeb(c.website);
    if (w && existingWebsites.has(w)) { skipped.push({ c, r: 'dup website' }); continue; }
    passed.push(c);
  }
  for (const s of skipped) console.log(`  ✗ [${s.c.city}] ${s.c.name} — ${s.r}`);

  const alive = await pmap(passed, 9, async (c) => (await headCheck(c.website)) ? c : null);
  const live = alive.filter(Boolean);
  for (const c of passed) if (!live.includes(c)) console.log(`  ☠ [${c.city}] ${c.name} — ${c.website}`);

  const withEmail = await pmap(live, 8, async (c) => ({ ...c, email: await findEmail(c.website) }));
  const emailCount = withEmail.filter((x) => x.email).length;
  console.log(`  ${emailCount} / ${withEmail.length} have email`);

  const toInsert = withEmail.map((c) => ({
    slug: c.slug, name: c.name, contact: c.contact, title: null, email: c.email || null,
    city: c.city, city_label: c.cityLabel, province: c.province, country: c.country,
    services: c.services, industries: c.industries, description: c.description, website: c.website,
    plan: 'free', priority_score: 0, status: 'active', submitted_by: 'admin', source: 'claude_code',
  }));

  if (toInsert.length) {
    const { error } = await sb.from('firms').insert(toInsert);
    if (error) { console.error(error.message); process.exit(1); }
    console.log(`✓ Inserted ${toInsert.length}`);
  }

  for (const c of ['las-vegas','atlanta','sacramento','omaha','oklahoma-city','birmingham']) {
    const { count } = await sb.from('firms').select('*', { count: 'exact', head: true }).eq('city', c).eq('status', 'active');
    console.log(`  ${c.padEnd(16)} ${count}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
