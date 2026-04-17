#!/usr/bin/env node
/** Batch 3 followup: finish Jacksonville, Memphis, Des Moines to 10+. */
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

function f(slug, name, contact, city, cityLabel, province, country, services, industries, description, website) {
  return { slug, name, contact: contact || 'Team', city, cityLabel, province, country, services, industries, description, website };
}

const CANDIDATES = [
  // Jacksonville
  f("pivot-cpas-jax", "Pivot CPAs", "Team", "jacksonville", "Jacksonville", "Florida", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "retail"], "Pivot CPAs is the largest locally-owned certified public accounting and business consulting firm in Northeast Florida, based in Ponte Vedra serving Jacksonville and the region.", "https://www.pivotcpas.com"),
  f("coastal-cpa-jax", "Coastal CPA Group", "Team", "jacksonville", "Jacksonville", "Florida", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["healthcare", "professional-services"], "Coastal CPA Group, PA is a Jacksonville boutique tax and accounting firm serving professional practices including doctors, attorneys, architects, and engineers.", "https://coastalcpagroup.com"),
  f("orange-park-cpa", "Williams & Williams CPA Orange Park", "Team", "jacksonville", "Jacksonville", "Florida", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Williams & Williams CPA Firm is an Orange Park, FL Jacksonville-area firm offering tax services including federal, state, and local tax returns and tax liability determination.", "https://orangeparkcpa.com"),
  f("avery-jax", "Avery Accounting", "Team", "jacksonville", "Jacksonville", "Florida", "United States", ["tax-advisory", "bookkeeping"], ["professional-services", "retail"], "Avery Accounting serves Jacksonville, Orange Park, Ponte Vedra, and surrounding areas with tax preparation and IRS debt resolution services.", "https://avery-accounting.com"),

  // Memphis
  f("mcbryde-mem", "Mark W McBryde CPA", "Mark W McBryde", "memphis", "Memphis", "Tennessee", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Mark W McBryde CPA is a full-service Germantown, TN Memphis-area accounting firm serving individuals and businesses since 1999 with accounting, tax prep, payroll, and bookkeeping.", "https://markmcbrydecpa.com"),
  f("bob-browder-mem", "Bob Browder CPA", "Bob Browder", "memphis", "Memphis", "Tennessee", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Bob Browder CPA serves West Tennessee cities including Germantown, Bartlett, Arlington, Lakeland, and Cordova with tax and accounting services.", "https://bobbrowdercpa.com"),
  f("harvill-mem", "Jason Alan Harvill CPA", "Jason Alan Harvill", "memphis", "Memphis", "Tennessee", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Jason Alan Harvill, CPA serves Germantown, Memphis, TN offering tax planning, preparation, and accounting services.", "https://jaharvillcpa.com"),

  // Des Moines
  f("rge-dsm", "RGE & Associates", "Team", "des-moines", "Des Moines", "Iowa", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "RGE & Associates provides financial services to businesses in Des Moines and the surrounding Ankeny and Norwalk areas.", "https://www.rgecpa.com"),
  f("pittman-dsm", "Pittman & Company", "Team", "des-moines", "Des Moines", "Iowa", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Pittman & Company, LLP is a family-owned Urbandale, IA full-service accounting firm serving Des Moines for 35+ years.", "https://www.pittmancpa.com"),
  f("rw-tax-dsm", "RW Tax Advisors", "Team", "des-moines", "Des Moines", "Iowa", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "RW Tax Advisors, P.C. is a certified public accounting firm located in Ankeny, Iowa providing tax, accounting, and payroll services to Des Moines-area businesses.", "https://www.rwtaxadvisors.com"),
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
function extractEmail(text, d) {
  if (!text) return null;
  const matches = [...new Set(text.match(EMAIL_RX) || [])];
  const valid = matches.filter((e) => !BAD_PREFIX.test(e) && !BAD_DOMAIN.test(e));
  if (!valid.length) return null;
  if (d) { const local = valid.find((e) => e.toLowerCase().endsWith('@' + d)); if (local) return local; }
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
  for (const c of passed) if (!live.includes(c)) console.log(`  ☠ ${c.name} — ${c.website}`);
  const withEmail = await pmap(live, 8, async (c) => ({ ...c, email: await findEmail(c.website) }));
  console.log(`${withEmail.filter((x) => x.email).length}/${withEmail.length} have email`);

  const toInsert = withEmail.slice(0, 29).map((c) => ({
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
  for (const c of ['nashville','charlotte','tampa','portland','indianapolis','columbus','milwaukee','memphis','jacksonville','des-moines']) {
    const { count } = await sb.from('firms').select('*', { count: 'exact', head: true }).eq('city', c).eq('status', 'active');
    console.log(`  ${c.padEnd(16)} ${count}`);
  }
  const { count: total } = await sb.from('firms').select('*', { count: 'exact', head: true }).eq('status', 'active');
  console.log(`Total: ${total}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
