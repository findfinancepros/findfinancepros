#!/usr/bin/env node
/** Batch 4 followup: fill Philadelphia, Orlando, Detroit to meet 10-firm target. */
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
  // Philadelphia (+6)
  f("cpaphilly-phila", "CPA Philly", "Team", "philadelphia", "Philadelphia", "Pennsylvania", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "CPA Philly is a full-service Certified Public Accounting Firm in Philadelphia specializing in tax and accounting services for small businesses.", "https://www.cpaphilly.com"),
  f("bestphillycpa", "Center City CPA Philadelphia", "Team", "philadelphia", "Philadelphia", "Pennsylvania", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Center City CPA provides Philadelphia accounting and tax services to businesses and individuals in the Center City area.", "https://www.bestphillycpa.com"),
  f("pwr-phila", "PWR Accounting & Tax Advisor", "Team", "philadelphia", "Philadelphia", "Pennsylvania", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "PWR Accounting & Tax Advisor is an award-winning small Northeast Philadelphia CPA firm helping individuals, small businesses, and startups build, manage, preserve, and transition wealth.", "https://pwrcpa.com"),
  f("spina-phila", "Spina CPA", "Team", "philadelphia", "Philadelphia", "Pennsylvania", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["real-estate", "professional-services"], "Spina CPA is a Philadelphia accounting and real estate consulting firm providing tax, accounting, and advisory services.", "https://spinacpa.com"),
  f("amro-azazi-phila", "Amro Azazi CPA", "Amro Azazi", "philadelphia", "Philadelphia", "Pennsylvania", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Amro Azazi CPA, PC is a client-centered Philadelphia CPA firm providing insightful financial partnership, tax, accounting, and advisory services.", "https://www.amroazazi.com"),
  f("engage-phila", "Engage CPAs", "Team", "philadelphia", "Philadelphia", "Pennsylvania", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Engage CPAs is a Philadelphia and Collegeville, PA certified public accounting firm providing tax, accounting, and advisory services.", "https://engagecpas.com"),
  f("fxduffy-phila", "F.X. Duffy & Company", "Team", "philadelphia", "Philadelphia", "Pennsylvania", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "F.X. Duffy & Company, Inc. is located in East Falls, Philadelphia serving the tri-state area for almost 50 years with six professionals serving 300 business accounts.", "https://fxduffy.com"),
  f("keiluhn-phila", "Christopher J. Keiluhn CPA", "Christopher J. Keiluhn", "philadelphia", "Philadelphia", "Pennsylvania", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Christopher J. Keiluhn, CPA LLC is a Philadelphia trusted CPA partner providing tax, accounting, and advisory services.", "https://phillytaxcpa.com"),

  // Orlando (+6)
  f("orlandocpa-orl", "Orlando CPA Maitland", "Team", "orlando", "Orlando", "Florida", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Orlando CPA is a Maitland CPA and tax preparation firm providing accounting and tax services to Orlando-area businesses.", "https://orlandocpa.net"),
  f("cpaorlando", "CPA Orlando", "Team", "orlando", "Orlando", "Florida", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "CPA Orlando is an Orlando CPA firm providing tax, accounting, and advisory services to local businesses.", "https://cpaorlando.net"),
  f("aia-cpa-orl", "Ana Ivonne Aviles CPA", "Ana Ivonne Aviles", "orlando", "Orlando", "Florida", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Ana Ivonne Aviles, CPA LLC is an Orlando and Clermont FL accounting firm with a commitment to affordable, personalized service offering tax planning, management consulting, bookkeeping, and payroll.", "https://www.aiacpa.com"),
  f("moss-krusick-orl", "Moss Krusick & Associates", "Team", "orlando", "Orlando", "Florida", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "Moss, Krusick & Associates is a Winter Park, FL Orlando-area CPA firm providing tax, audit, and advisory services.", "https://mosskrusick.com"),
  f("wilder-orl", "Wilder Accounting CPA", "Team", "orlando", "Orlando", "Florida", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Wilder Accounting CPA has offices in Oviedo/Winter Springs and Baldwin Park/Orlando with 100+ years of combined accounting, tax strategy, and financial planning expertise in Central Florida.", "https://wilderaccountingcpa.com"),
  f("baldwin-orl", "Baldwin Accounting CPA", "Team", "orlando", "Orlando", "Florida", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Baldwin Accounting CPA is a full-service Orlando accounting firm with 22+ years of experience offering on-site and online financial services to small and medium-sized businesses and international clients.", "https://baldwinaccountingcpa.com"),
  f("cpaaccounting-orl", "CPA Accounting Orlando", "Team", "orlando", "Orlando", "Florida", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "CPA Accounting is an Orlando tax and accounting firm providing expert services to local businesses.", "https://www.cpaaccounting.biz"),
  f("kane-orl", "Kane & Associates", "Team", "orlando", "Orlando", "Florida", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "Kane & Associates is a Winter Park, FL Orlando-area full-service CPA firm offering a broad range of services for business owners, executives, and independent professionals.", "https://kane-cpa.com"),
  f("babione-orl", "Babione Kuehler & Company", "Team", "orlando", "Orlando", "Florida", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "Babione Kuehler & Company is an Orlando, FL accounting firm providing tax, audit, and advisory services to local businesses.", "https://www.bkc-cpa.net"),
  f("kdk-orl", "KDK Accountancy", "Team", "orlando", "Orlando", "Florida", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "KDK Accountancy Corporation is an independent Winter Park CPA firm established in 1960 serving clients across Central Florida including Altamonte Springs, Winter Park, Maitland, and Orlando.", "https://kdkcpa.com"),

  // Detroit (+2 to be safe)
  f("rehmann-detroit", "Rehmann", "Team", "detroit", "Detroit", "Michigan", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["manufacturing", "professional-services", "real-estate"], "Rehmann is a Michigan-based top-60 US CPA firm with a Detroit office providing tax, audit, wealth, and advisory services.", "https://www.rehmann.com"),
  f("uhycpa-detroit", "UHY Advisors - Detroit", "Team", "detroit", "Detroit", "Michigan", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["manufacturing", "professional-services", "real-estate"], "UHY Advisors is a top-40 US CPA firm with a Detroit office providing tax, audit, and consulting services.", "https://uhy-us.com"),
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
  const MAX = 23; // remaining budget
  const { data: existing } = await sb.from('firms').select('slug, name, website');
  const existingSlugs = new Set(existing.map((r) => r.slug));
  const existingNames = new Set(existing.map((r) => normName(r.name)));
  const existingWebsites = new Set(existing.map((r) => normWeb(r.website)).filter(Boolean));

  const passed = [];
  for (const c of CANDIDATES) {
    if (existingSlugs.has(c.slug)) { console.log(`  ✗ ${c.name} dup slug`); continue; }
    if (existingNames.has(normName(c.name))) { console.log(`  ✗ ${c.name} dup name`); continue; }
    const w = normWeb(c.website); if (w && existingWebsites.has(w)) { console.log(`  ✗ ${c.name} dup website`); continue; }
    passed.push(c);
  }

  const alive = await pmap(passed, 10, async (c) => (await headCheck(c.website)) ? c : null);
  const live = alive.filter(Boolean);
  for (const c of passed) if (!live.includes(c)) console.log(`  ☠ ${c.name} — ${c.website}`);

  const withEmail = await pmap(live, 8, async (c) => ({ ...c, email: await findEmail(c.website) }));
  console.log(`\n${withEmail.filter((x) => x.email).length}/${withEmail.length} have email`);

  const toInsert = withEmail.slice(0, MAX).map((c) => ({
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
    console.log(`✓ Inserted ${toInsert.length}, with email: ${toInsert.filter((x) => x.email).length}`);
  }

  for (const c of ['philadelphia','orlando','detroit','washington-dc','fort-worth','baltimore','pittsburgh','st-louis','cleveland','cincinnati']) {
    const { count } = await sb.from('firms').select('*', { count: 'exact', head: true }).eq('city', c).eq('status', 'active');
    console.log(`  ${c.padEnd(16)} ${count}`);
  }
  const { count: total } = await sb.from('firms').select('*', { count: 'exact', head: true }).eq('status', 'active');
  console.log(`Total: ${total}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
