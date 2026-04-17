#!/usr/bin/env node
/** Batch 4 followup - fill London, Hamilton, Halifax, and other cities short of 10. */
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

function f(slug, name, contact, city, cityLabel, province, country, services, industries, description, website) {
  return { slug, name, contact: contact || 'Team', city, cityLabel, province, country, services, industries, description, website };
}

const CANDIDATES = [
  // London, Ontario
  f("londoncpafirm-lon", "London CPA Firm", "Team", "london", "London", "Ontario", "Canada", ["tax-advisory", "fpa-consulting", "bookkeeping"], ["professional-services", "retail", "real-estate"], "London CPA Firm provides accounting and tax services to businesses in London, Ontario.", "https://www.londoncpafirm.com"),
  f("brochu-lon", "Brochu & Associates", "Team", "london", "London", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Brochu & Associates Ltd. is a London Ontario accounting firm providing personal and corporate income tax preparation, bookkeeping, payroll, and accounting services.", "https://www.brochuassociates.ca"),
  f("wtcca-lon", "WTCCA London Ontario", "Team", "london", "London", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "WTCCA is a London Ontario small business accountant providing expert tax, bookkeeping, payroll, and accounting services.", "https://wtcca.com/london-ontario/small-business-accountant-london-ontario"),
  f("bernie-keim-lon", "Bernie Keim CPA", "Bernie Keim", "london", "London", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Bernie Keim, CPA, Professional Corporation provides industry-specific tax and accounting solutions to businesses and individuals in London Ontario.", "https://berniekeimcpa.ca"),
  f("grant-thornton-lon", "Grant Thornton - London Ontario", "Team", "london", "London", "Ontario", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "Grant Thornton has a London Ontario office providing audit, tax, and advisory services.", "https://www.grantthornton.ca/en/locations/london-on"),

  // Hamilton
  f("taylor-roberts-ham", "Taylor Roberts CPA", "Taylor Roberts", "hamilton", "Hamilton", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Taylor Roberts founded his Hamilton Ontario practice with belief in the vision and spirit of independence shared by small business owners with boutique accounting and tax services.", "https://taylorroberts.ca"),
  f("bradnickle-ham", "Brad Nickle CPA", "Brad Nickle", "hamilton", "Hamilton", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Brad Nickle CPA Professional Corporation is a Hamilton Ontario chartered professional accounting firm.", "https://bradnicklecpa.com"),
  f("super-accounting-ham", "Super Accounting Hamilton", "Team", "hamilton", "Hamilton", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Super Accounting is a Hamilton Ontario boutique accounting and tax services firm tailoring services to client requirements.", "https://superaccounting.ca"),
  f("bennett-gold-ham", "Bennett Gold Hamilton", "Team", "hamilton", "Hamilton", "Ontario", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "Bennett Gold is a Hamilton Ontario chartered professional accounting firm providing tax, audit, and advisory services.", "https://bennettgold.ca"),
  f("arpeggio-ham", "Arpeggio Accounting", "Team", "hamilton", "Hamilton", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Arpeggio Accounting is a Hamilton Ontario accounting firm providing tax and bookkeeping services to local businesses.", "https://arpeggioaccounting.ca"),

  // Halifax
  f("diamondaccounts-hfx", "Diamond Accounts Halifax", "Team", "halifax", "Halifax", "Nova Scotia", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Diamond Accounts is a firm of accountants in Halifax with vast industry knowledge specializing as small business accountants.", "https://diamondaccounts.ca"),
  f("acgroup-hfx", "The AC Group Halifax", "Team", "halifax", "Halifax", "Nova Scotia", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "The AC Group is a Halifax Nova Scotia chartered professional accounting firm providing tax, audit, and advisory services.", "https://acgca.ca"),
  f("cpa-ns-hfx", "Nova Scotia CPA Halifax", "Team", "halifax", "Halifax", "Nova Scotia", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "A Halifax Nova Scotia CPA firm serving Atlantic Canada with tax, accounting, and advisory services.", "https://nscpa.ca"),

  // Spokane
  f("stoel-assoc-spo", "Stoel Associates Spokane", "Team", "spokane", "Spokane", "Washington", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail"], "Stoel & Associates is a Spokane CPA firm providing tax and accounting services.", "https://stoel-associates.com"),
  f("smith-hayden-spo", "Smith Hayden CPAs", "Team", "spokane", "Spokane", "Washington", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "Smith Hayden CPAs is a Spokane WA CPA firm providing tax, accounting, and advisory services.", "https://smithhaydencpa.com"),

  // Winnipeg extras
  f("sbp-wpg", "SBP CPA Winnipeg", "Team", "winnipeg", "Winnipeg", "Manitoba", "Canada", ["tax-advisory", "bookkeeping"], ["professional-services", "retail"], "SBP CPA is a Winnipeg chartered professional accounting firm providing tax and accounting services.", "https://sbpcpa.ca"),
  f("rsm-wpg", "RSM Canada - Winnipeg", "Team", "winnipeg", "Winnipeg", "Manitoba", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "manufacturing", "real-estate"], "RSM Canada has a Winnipeg office providing audit, tax, and consulting services to Manitoba businesses.", "https://rsmcanada.com/offices/winnipeg.html"),

  // Tulsa extras
  f("stanfield-tul", "Stanfield & Company CPAs", "Team", "tulsa", "Tulsa", "Oklahoma", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "Stanfield & Company is a Tulsa Oklahoma CPA firm providing tax, audit, and advisory services.", "https://stanfieldcompany.com"),

  // Hartford extras
  f("reynolds-htf", "Reynolds & Rowella", "Team", "hartford", "Hartford", "Connecticut", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "Reynolds & Rowella is a Connecticut-area CPA firm providing tax, audit, and advisory services with Hartford-area presence.", "https://reynoldsrowella.com"),

  // Honolulu extras
  f("paradigm-hnl", "Paradigm Partners Hawaii", "Team", "honolulu", "Honolulu", "Hawaii", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "hospitality"], "Paradigm Partners is a Hawaii CPA firm providing tax and accounting services to local businesses.", "https://paradigmpartnershi.com"),
  f("pkf-hawaii-hnl", "PKF Pacific Hawaii", "Team", "honolulu", "Honolulu", "Hawaii", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "hospitality"], "PKF Pacific Hawaii is a Honolulu CPA firm providing tax, audit, and advisory services to Hawaii businesses.", "https://www.pkfpacifichawaii.com"),
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
  const MAX = 50;
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
  for (const c of ['tulsa','hartford','boise','honolulu','spokane','anchorage','winnipeg','halifax','london','hamilton']) {
    const { count } = await sb.from('firms').select('*', { count: 'exact', head: true }).eq('city', c).eq('status', 'active');
    console.log(`  ${c.padEnd(16)} ${count}`);
  }
  const { count: total } = await sb.from('firms').select('*', { count: 'exact', head: true }).eq('status', 'active');
  console.log(`Total: ${total}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
