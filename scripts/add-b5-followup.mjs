#!/usr/bin/env node
/** Batch 2 followup: fill KC, Richmond, SLC, San Diego to 10+. */
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

function f(slug, name, contact, city, cityLabel, province, country, services, industries, description, website) {
  return { slug, name, contact: contact || 'Team', city, cityLabel, province, country, services, industries, description, website };
}

const CANDIDATES = [
  // Kansas City
  f("taxesplus-kc", "TaxesPlus Kansas City", "Team", "kansas-city", "Kansas City", "Missouri", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "TaxesPlus is a full-service Kansas City accounting and tax preparation firm providing comprehensive accounting and tax support for small businesses throughout the metro area.", "https://taxesplus.com"),
  f("horizon-cpa-kc", "Horizon CPA Kansas City", "Team", "kansas-city", "Kansas City", "Missouri", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Horizon CPA is a full-service tax, accounting, and business consulting firm located in North Kansas City, MO and Prairie Village, KS.", "https://www.overmyhorizon.com"),
  f("kcfirm-kc", "Kansas City CPA Firm", "Team", "kansas-city", "Kansas City", "Missouri", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "Kansas City CPA Firm provides tax, audit, and advisory services to businesses in the Kansas City area.", "https://cpafirmkansascity.com"),

  // Richmond
  f("eebrown-rva", "E.E. Brown & Associates", "Team", "richmond", "Richmond", "Virginia", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "E. E. Brown & Associates, PLLC is a full-service North Richmond, VA CPA firm providing personalized accounting services for small businesses.", "https://www.eebrowncpa.com"),
  f("brown-edwards-rva", "Brown Edwards CPA - Richmond", "Team", "richmond", "Richmond", "Virginia", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "manufacturing", "real-estate"], "Brown Edwards CPA is a Richmond, VA CPA firm providing tax, audit, and advisory services.", "https://becpas.com/contact/richmond"),
  f("capital-tax-rva", "Capital Tax Partners", "Team", "richmond", "Richmond", "Virginia", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Capital Tax Partners, Inc. is a small CPA firm based in the Richmond and Tri-Cities area with 25+ years of experience offering financial and tax services.", "https://www.capitaltaxva.com"),
  f("rue-rva", "Rue & Associates", "Team", "richmond", "Richmond", "Virginia", "United States", ["tax-advisory", "fpa-consulting", "bookkeeping"], ["professional-services", "retail", "real-estate"], "Rue & Associates is an accounting and business consulting firm delivering financial and tax services to individuals and businesses in Richmond for almost four decades.", "https://www.ruecpa.com"),

  // Salt Lake City
  f("paramount-slc", "Paramount Tax Salt Lake", "Team", "salt-lake-city", "Salt Lake City", "Utah", "United States", ["tax-advisory", "bookkeeping"], ["professional-services", "retail"], "Paramount Tax is a Salt Lake City small business CPA firm providing tax, accounting, and advisory services.", "https://paramount.tax/salt-lake-city/cpa/small-business-cpa"),

  // San Diego
  f("profitwise-sd", "Profitwise Accounting", "Team", "san-diego", "San Diego", "California", "United States", ["fractional-cfo", "bookkeeping", "tax-advisory"], ["professional-services", "retail", "technology"], "Profitwise Accounting Services is a full-service, cloud-based accounting and consulting firm helping San Diego small businesses through bookkeeping, taxation, payroll, and CFO-level services.", "https://www.profitwiseaccounting.com"),
  f("yenor-sd", "Yenor and Associates CPA", "Team", "san-diego", "San Diego", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Yenor and Associates, CPA provides tailored accounting solutions for small and mid-sized San Diego businesses with user-friendly, professional accounting services.", "https://www.yenorandassociates.com"),
  f("sdcpa-com-sd", "San Diego CPA Services", "Team", "san-diego", "San Diego", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "San Diego CPA Services provides small business accounting, tax, and advisory services to San Diego businesses.", "https://sandiegocpa.com"),

  // Seattle (extras in case)
  f("opsahl-dawson-sea", "Opsahl Dawson", "Team", "seattle", "Seattle", "Washington", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["real-estate", "professional-services", "manufacturing"], "Opsahl Dawson is a Seattle CPA firm providing tax, audit, and advisory services to middle-market businesses.", "https://www.opsahldawson.com"),

  // Denver extras
  f("anton-collins-den", "Anton Collins Mitchell", "Team", "denver", "Denver", "Colorado", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["real-estate", "technology", "professional-services"], "Anton Collins Mitchell (ACM) is a Denver CPA firm providing tax, audit, and advisory services to Colorado businesses.", "https://www.acmllp.com"),
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
  const MAX = 28;
  const { data: existing } = await sb.from('firms').select('slug, name, website');
  const existingSlugs = new Set(existing.map((r) => r.slug));
  const existingNames = new Set(existing.map((r) => normName(r.name)));
  const existingWebsites = new Set(existing.map((r) => normWeb(r.website)).filter(Boolean));

  const passed = [];
  for (const c of CANDIDATES) {
    if (existingSlugs.has(c.slug)) { console.log(`  ✗ ${c.name} dup slug`); continue; }
    if (existingNames.has(normName(c.name))) { console.log(`  ✗ ${c.name} dup name`); continue; }
    const w = normWeb(c.website); if (w && existingWebsites.has(w)) { console.log(`  ✗ ${c.name} dup web`); continue; }
    passed.push(c);
  }
  const alive = await pmap(passed, 10, async (c) => (await headCheck(c.website)) ? c : null);
  const live = alive.filter(Boolean);
  for (const c of passed) if (!live.includes(c)) console.log(`  ☠ ${c.name} — ${c.website}`);
  const withEmail = await pmap(live, 8, async (c) => ({ ...c, email: await findEmail(c.website) }));
  console.log(`${withEmail.filter((x) => x.email).length}/${withEmail.length} have email`);

  const toInsert = withEmail.slice(0, MAX).map((c) => ({
    slug: c.slug, name: c.name, contact: c.contact || null, title: null, email: c.email || null,
    city: c.city, city_label: c.cityLabel, province: c.province, country: c.country,
    services: c.services, industries: c.industries, description: c.description, website: c.website,
    plan: 'free', priority_score: 0, status: 'active', submitted_by: 'admin', source: 'claude_code',
  }));
  if (toInsert.length) {
    const { error } = await sb.from('firms').insert(toInsert);
    if (error) { console.error(error.message); process.exit(1); }
    console.log(`✓ Inserted ${toInsert.length}, with email: ${toInsert.filter((x) => x.email).length}`);
  }
  for (const c of ['kansas-city','raleigh','richmond','salt-lake-city','seattle','denver','phoenix','austin','san-diego','minneapolis']) {
    const { count } = await sb.from('firms').select('*', { count: 'exact', head: true }).eq('city', c).eq('status', 'active');
    console.log(`  ${c.padEnd(16)} ${count}`);
  }
  const { count: total } = await sb.from('firms').select('*', { count: 'exact', head: true }).eq('status', 'active');
  console.log(`Total: ${total}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
