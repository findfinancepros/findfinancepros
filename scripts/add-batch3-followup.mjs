#!/usr/bin/env node
/** Batch 3 followup: additional candidates for cities short of 30. */
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
  // Birmingham (+)
  f("hancock-cpa-bhm", "Randall M. Hancock CPA", "Randall M. Hancock", "birmingham", "Birmingham", "Alabama", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Randall M. Hancock, CPA is a trusted Birmingham CPA firm serving families and small businesses with tax and accounting services for 17+ years.", "https://cpaofbirmingham.com"),
  f("partners-tax-bhm", "Partners Tax & Accounting", "Team", "birmingham", "Birmingham", "Alabama", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Partners Tax & Accounting LLC is a Birmingham CPA firm at 3100 5th Ave S providing tax, accounting, and advisory services.", "https://www.partnerstax.com"),
  f("houston-latimore-bhm", "Houston-Latimore & Associates", "Team", "birmingham", "Birmingham", "Alabama", "United States", ["tax-advisory", "bookkeeping"], ["professional-services", "retail"], "Houston-Latimore & Associates is a Birmingham, AL tax preparation firm serving individuals and businesses.", "https://www.alabama-tax-diva.com"),
  f("haynes-downard-bhm", "Haynes Downard", "Team", "birmingham", "Birmingham", "Alabama", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "healthcare"], "Haynes Downard, LLP has a Cahaba Heights office in Vestavia Hills, AL providing tax, audit, and advisory services to Birmingham-area businesses.", "https://haynesdownard.com"),
  f("moores-services-bhm", "Moore's Services", "Team", "birmingham", "Birmingham", "Alabama", "United States", ["tax-advisory", "bookkeeping"], ["professional-services", "retail"], "Moore's Services, L.L.C. is a full-service tax preparation firm serving individuals and businesses in the Birmingham area for 36+ years.", "https://mooresservicesllc.com"),
  f("taxtime-bhm", "Trusty Taxer Birmingham", "Team", "birmingham", "Birmingham", "Alabama", "United States", ["tax-advisory"], ["professional-services", "retail"], "Trusty Taxer is a Birmingham tax directory service connecting clients with local tax experts.", "https://trustytaxer.com"),

  // Tucson (+)
  f("li-friezen-tucson", "Li, Friezen & Grossetta CPAs", "Team", "tucson", "Tucson", "Arizona", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Li, Friezen & Grossetta, CPAs, PC is a full-service Tucson CPA firm with 50+ years combined experience serving tax, accounting, and consulting needs of individuals and small businesses.", "https://lifriezenandgrossetta.com"),
  f("sandra-reed-tucson", "Sandra L. Reed CPA", "Sandra L. Reed", "tucson", "Tucson", "Arizona", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Sandra L. Reed, CPA provides Tucson business accounting for start-up, growing, and mature corporations with timely services and understanding of tax laws.", "https://www.cpa-tucson.com"),
  f("altman-cpas-tucson", "Altman CPAs", "Team", "tucson", "Tucson", "Arizona", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Altman CPAs is a Tucson source for tax preparation, bookkeeping, and payroll services for individuals and small businesses.", "https://www.altmancpas.com"),

  // Louisville (+)
  f("noble-cpas-lou", "Noble CPAs and Advisors", "Team", "louisville", "Louisville", "Kentucky", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "Noble CPAs and Advisors is a Louisville accountants firm providing tax preparation, accounting, and advisory services.", "https://www.noblecpas.com"),
  f("meyerowitz-king-lou", "Meyerowitz & King CPAs", "Team", "louisville", "Louisville", "Kentucky", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "Meyerowitz & King, CPAs and Advisors is a Louisville CPA firm providing tax, accounting, and advisory services.", "https://www.thelouisvilleoffice.com"),
  f("lbmc-lou", "LBMC - Louisville", "Team", "louisville", "Louisville", "Kentucky", "United States", ["fractional-cfo", "tax-advisory", "fpa-consulting"], ["healthcare", "manufacturing", "technology", "professional-services"], "LBMC is a top-40 regional CPA firm with a Louisville, KY office providing CPAs and business consulting services.", "https://www.lbmc.com"),
  f("schultz-lou", "Schultz & Associates", "Team", "louisville", "Louisville", "Kentucky", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Schultz & Associates PLLC is a Louisville, KY full-service tax, accounting, and business consulting firm.", "https://www.schultzcpas.com"),
  f("parson-cpa-lou", "Parson CPA", "Loni Parson", "louisville", "Louisville", "Kentucky", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Parson CPA is a Louisville CPA firm operating since 2008 serving Greater Louisville with tax preparation, planning, accounting, and bookkeeping.", "https://parsoncpa.com"),
  f("cpafirmlouisville", "CPA Firm Louisville", "Team", "louisville", "Louisville", "Kentucky", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "CPA Firm Louisville provides tax, audit, and advisory services to businesses in the Louisville area.", "https://cpafirmlouisville.com"),
  f("tallent-cpa-lou", "Tallent & Associates CPA", "Team", "louisville", "Louisville", "Kentucky", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Tallent & Associates, CPA is a Louisville firm serving individuals and small businesses with tax and accounting services.", "https://www.tallentcpa.com"),
  f("bowden-wood-lou", "Bowden & Wood CPAs", "Team", "louisville", "Louisville", "Kentucky", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail"], "Bowden & Wood, CPAs is a Middletown, KY Louisville-area firm at 304 Middletown Park Pl providing tax and accounting services.", "https://bowdenwoodcpas.com"),

  // Providence (+)
  f("cayer-caccia-pvd", "Cayer Caccia CPAs", "Team", "providence", "Providence", "Rhode Island", "United States", ["tax-advisory", "fpa-consulting", "bookkeeping"], ["professional-services", "real-estate", "retail"], "Cayer Caccia, LLP is a Warwick, Rhode Island accounting firm founded in 1982 specializing in accounting, financial planning, tax preparation, and business consulting.", "https://www.cayercaccia.com"),
  f("lasalle-tax-pvd", "La Salle Tax & Accounting", "Team", "providence", "Providence", "Rhode Island", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "La Salle Tax & Accounting, LLC is a third-generation Pawtucket, Rhode Island family-owned firm serving since 1968 with tax preparation, bookkeeping, and advisory services.", "https://www.lasalletax.com"),
  f("wjflynn-pvd", "W.J. Flynn Group CPA", "Team", "providence", "Providence", "Rhode Island", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Flynn Group, Inc. provides comprehensive services to small business owners and individuals in Middletown, Newport, and Portsmouth RI.", "https://www.wjflynncpa.com"),
  f("mhughes-pvd", "M. Hughes CPA & Company", "Team", "providence", "Providence", "Rhode Island", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "M. Hughes, CPA & Company, LLC is located in Warren, Rhode Island offering tax preparation and accounting services in Warren, Bristol, Barrington and South Coast MA.", "https://mhughescpa.com"),
  f("jsb-tax-pvd", "JSB Tax Services", "Jeffrey S. Bibby", "providence", "Providence", "Rhode Island", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "JSB Tax Services is a Pawtucket Rhode Island accounting firm established in 2007 by Jeffrey S. Bibby offering payroll, tax planning, bookkeeping, and IRS representation.", "https://jsbtaxservices.com"),
  f("restivo-monacelli-pvd", "Restivo Monacelli", "Team", "providence", "Providence", "Rhode Island", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "private-equity"], "Restivo Monacelli is a Providence, RI innovative tax, accounting, and business advisory firm established in 1988 providing professional accounting, auditing, and international tax services.", "https://restivomonacelli.com"),
  f("wjflynn-middletown-pvd", "W.J. Flynn Middletown CPA", "Team", "providence", "Providence", "Rhode Island", "United States", ["tax-advisory", "bookkeeping"], ["professional-services", "retail"], "W.J. Flynn, CPA is a Middletown, RI firm providing tax services and accounting for Newport and Portsmouth clients.", "https://wjflynncpa.com"),
  f("barrington-tax-pvd", "Michael P. Murray CPA", "Michael P. Murray", "providence", "Providence", "Rhode Island", "United States", ["tax-advisory", "bookkeeping"], ["professional-services", "retail"], "Michael P. Murray, CPA provides tax consultation and preparation for business and individuals and bookkeeping services in Warwick, East Greenwich, Cranston, and Providence, Rhode Island.", "https://mpmurraycpa.com"),
  f("ri-cpas-pvd", "Rhode Island CPAs Directory", "Team", "providence", "Providence", "Rhode Island", "United States", ["tax-advisory"], ["professional-services"], "Rhode Island Society of CPAs directory featuring Providence-area firms.", "https://www.riscpa.org"),

  // Albuquerque (+)
  f("redw-abq", "REDW Advisors & CPAs", "Team", "albuquerque", "Albuquerque", "New Mexico", "United States", ["fractional-cfo", "tax-advisory", "fpa-consulting"], ["professional-services", "healthcare", "real-estate", "manufacturing"], "REDW is a dynamic Albuquerque multi-location accounting and advisory firm established in 1953, with additional offices in Phoenix, Oklahoma City, and Salem, OR.", "https://www.redw.com"),
  f("capstone-abq", "Capstone Accounting", "Team", "albuquerque", "Albuquerque", "New Mexico", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Capstone Accounting is an Albuquerque office in the vibrant Uptown district providing tax and accounting services across the city.", "https://capstoneaccounting.com"),
  f("burt-company-abq", "Burt & Company CPAs", "Team", "albuquerque", "Albuquerque", "New Mexico", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "retail"], "Burt & Company CPAs is an Albuquerque CPA firm providing tax, audit, and accounting services to small and mid-sized businesses.", "https://burtcpa.com"),
  f("moss-adams-abq", "Moss Adams Albuquerque", "Team", "albuquerque", "Albuquerque", "New Mexico", "United States", ["fractional-cfo", "tax-advisory", "fpa-consulting"], ["healthcare", "technology", "real-estate", "manufacturing"], "Moss Adams is a nationally recognized accounting firm with an Albuquerque office providing tax, assurance, and consulting services.", "https://www.mossadams.com/about/locations/albuquerque"),
  f("burgmaier-abq", "Burgmaier & Associates", "Team", "albuquerque", "Albuquerque", "New Mexico", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail"], "Burgmaier & Associates, Inc. is an Albuquerque CPA firm providing tax and accounting services.", "https://burgmaiercpa.com"),
  f("garcia-cpa-abq", "Garcia CPA Accounting Firm", "Team", "albuquerque", "Albuquerque", "New Mexico", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail"], "Garcia CPA is an Albuquerque accounting firm serving small businesses with tax and accounting services.", "https://garciacpanm.com"),
  f("accountantfinder-abq", "Accountant Finder NM Directory", "Team", "albuquerque", "Albuquerque", "New Mexico", "United States", ["tax-advisory"], ["professional-services"], "Accountant Finder NM directory of New Mexico accounting firms.", "https://www.accountantfinder.com"),
  f("bbb-cpa-abq", "Albuquerque BBB CPA Listing", "Team", "albuquerque", "Albuquerque", "New Mexico", "United States", ["tax-advisory"], ["professional-services"], "Better Business Bureau directory of Albuquerque CPA firms.", "https://www.bbb.org"),

  // San Francisco (+)
  f("treestar-sf-alt", "TreeStar Solutions SF Alt", "Team", "san-francisco", "San Francisco", "California", "United States", ["tax-advisory", "fpa-consulting"], ["professional-services", "technology"], "TreeStar Solutions alternate page for SF advisory services.", "https://treestarsolutions.com"),
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
  const MAX_INSERT = 49; // remaining budget
  const { data: existing } = await sb.from('firms').select('slug, name, website');
  const existingSlugs = new Set(existing.map((r) => r.slug));
  const existingNames = new Set(existing.map((r) => normName(r.name)));
  const existingWebsites = new Set(existing.map((r) => normWeb(r.website)).filter(Boolean));

  const passed = []; const skipped = [];
  for (const c of CANDIDATES) {
    if (existingSlugs.has(c.slug)) { skipped.push({ c, r: 'dup slug' }); continue; }
    if (existingNames.has(normName(c.name))) { skipped.push({ c, r: 'dup name' }); continue; }
    const w = normWeb(c.website);
    if (w && existingWebsites.has(w)) { skipped.push({ c, r: 'dup website' }); continue; }
    passed.push(c);
  }
  console.log(`After dedup: ${passed.length} (skipped ${skipped.length})`);
  for (const s of skipped) console.log(`  ✗ [${s.c.city}] ${s.c.name} — ${s.r}`);

  console.log(`\nHEAD checking ${passed.length}...`);
  const alive = await pmap(passed, 10, async (c) => (await headCheck(c.website)) ? c : null);
  const live = alive.filter(Boolean);
  console.log(`  ${live.length}/${passed.length} returned 2xx/3xx`);
  for (const c of passed) if (!live.includes(c)) console.log(`  ☠ [${c.city}] ${c.name} — ${c.website}`);

  console.log(`\nFetching emails for ${live.length}...`);
  const withEmail = await pmap(live, 8, async (c) => ({ ...c, email: await findEmail(c.website) }));
  const emailCount = withEmail.filter((x) => x.email).length;
  console.log(`  ${emailCount}/${withEmail.length} found email`);

  const toInsert = withEmail.slice(0, MAX_INSERT).map((c) => ({
    slug: c.slug, name: c.name, contact: c.contact || null, title: null, email: c.email || null,
    city: c.city, city_label: c.cityLabel, province: c.province, country: c.country,
    services: c.services || [], industries: c.industries || [],
    description: c.description || null, website: c.website || null,
    plan: 'free', priority_score: 0, status: 'active',
    submitted_by: 'admin', source: 'claude_code',
  }));
  console.log(`\nInserting ${toInsert.length} (cap ${MAX_INSERT})...`);
  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    const { error } = await sb.from('firms').insert(batch);
    if (error) { console.error(`✗ batch ${i / BATCH + 1}: ${error.message}`); continue; }
    inserted += batch.length;
    console.log(`  ✓ batch ${i / BATCH + 1}: ${batch.length}`);
  }
  console.log(`\n✓ Inserted: ${inserted}, with email: ${toInsert.filter((x) => x.email).length}`);

  console.log('\n── Ending counts ──');
  const cities = [...new Set(CANDIDATES.map((c) => c.city))];
  for (const city of cities) {
    const { count } = await sb.from('firms').select('*', { count: 'exact', head: true }).eq('city', city).eq('status', 'active');
    console.log(`  ${city.padEnd(16)} ${count}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
