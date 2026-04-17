#!/usr/bin/env node
/** Batch 3: Add firms to Birmingham, Tucson, Louisville, Providence, Albuquerque, San Francisco. */
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
  // ── Birmingham (aim 12) ────────────────────────────────────────────
  f("hughett-sanders-birmingham", "Hughett Sanders", "Team", "birmingham", "Birmingham", "Alabama", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "Hughett Sanders, LLC is a third-generation full-service Birmingham, Alabama CPA firm providing accounting, bookkeeping, auditing, tax preparation, tax and management consulting, and fraud investigation.", "https://cpabhm.com"),
  f("bruce-downs-birmingham", "Bruce Downs CPA", "Bruce Downs", "birmingham", "Birmingham", "Alabama", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Bruce Downs, CPA is a Birmingham full-service accounting firm and Certified QuickBooks ProAdvisor specializing in the complete spectrum of accounting and tax concerns for new and small businesses.", "https://www.brucedownscpa.com"),
  f("kassouf-birmingham", "Kassouf & Co.", "Team", "birmingham", "Birmingham", "Alabama", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["healthcare", "professional-services", "real-estate", "manufacturing"], "Kassouf & Co., PC was established in 1931 in Birmingham with four locations across Alabama and Louisiana, affiliated with CPAmerica providing tax, audit, and advisory services.", "https://ww3.kassouf.com"),
  f("strategic-tax-birmingham", "Strategic Tax & Accounting", "Team", "birmingham", "Birmingham", "Alabama", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Strategic Tax & Accounting, LLC is a Birmingham CPA firm at 2120 16th Ave S providing tax, accounting, and advisory services to individuals and small businesses.", "https://strategictaxllc.com"),
  f("banks-finley-white-birmingham", "Banks, Finley, White & Company", "Team", "birmingham", "Birmingham", "Alabama", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "healthcare", "construction"], "Banks, Finley, White & Company is a Birmingham accounting firm with multiple locations providing audit, tax, and advisory services.", "https://bfwcpa.com"),
  f("aprio-birmingham", "Aprio - Birmingham", "Team", "birmingham", "Birmingham", "Alabama", "United States", ["fractional-cfo", "tax-advisory", "fpa-consulting"], ["technology", "healthcare", "real-estate", "manufacturing"], "Aprio is a premier business advisory and accounting firm helping Birmingham clients since 1952 with tax, audit, and advisory services.", "https://www.aprio.com/locations/birmingham-al/"),

  // ── Tucson (aim 20) ────────────────────────────────────────────────
  f("hutchison-cpa-tucson", "Travis Hutchison CPA", "Travis Hutchison", "tucson", "Tucson", "Arizona", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Travis Hutchison CPA PLLC is a full-service tax, accounting, and business consulting firm located in Tucson, AZ serving small businesses.", "https://www.hutchisoncpa.com"),
  f("azswcpa-tucson", "AZ Southwest CPA Services", "Team", "tucson", "Tucson", "Arizona", "United States", ["tax-advisory", "fpa-consulting", "bookkeeping"], ["professional-services", "retail", "real-estate"], "AZSWCPA Services, PLLC is a Tucson client-focused CPA firm specializing in business, personal, and trust/estate accounting, tax services, and closely-held business valuations.", "https://azswcpa.com"),
  f("jtc-cpas-tucson", "JTC CPAs - Tucson", "Team", "tucson", "Tucson", "Arizona", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "JTC CPAs is a Tucson premier accounting firm specializing in providing top-notch financial services for small businesses.", "https://www.jtccpas.com"),
  f("oase-cpa-tucson", "David Oase CPA", "David Oase", "tucson", "Tucson", "Arizona", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "David Oase CPA provides innovative, efficient financial solutions for Tucson businesses from payroll to tax preparation.", "https://tucsoncpa.com"),
  f("desert-rose-tucson", "Desert Rose Tax & Accounting", "Team", "tucson", "Tucson", "Arizona", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Desert Rose Tax & Accounting is a trusted Tucson CPA firm helping small businesses and professionals with expert tax planning, bookkeeping, and financial strategies tailored for growth.", "https://www.desertrosetax.com"),
  f("osiris-cpa-tucson", "Osiris CPA", "Team", "tucson", "Tucson", "Arizona", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Osiris CPA, PLLC offers Tucson businesses everything from thorough business tax preparation to meticulous bookkeeping services.", "https://www.osiriscpa.com"),
  f("rvrcpa-tucson", "Robert V. Ramirez CPA", "Robert V. Ramirez", "tucson", "Tucson", "Arizona", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Robert V. Ramirez CPA, PLLC is a full-service tax, accounting, and business consulting firm in Northwest Tucson serving Oro Valley, Marana, and surrounding communities for 25+ years.", "https://www.rvrcpa.com"),
  f("clearview-tucson", "Clear View Business Solutions", "Team", "tucson", "Tucson", "Arizona", "United States", ["fractional-cfo", "tax-advisory", "bookkeeping"], ["professional-services", "retail", "real-estate"], "Clear View Business Solutions is a Tucson-area small business financial advisory, tax services, accounting, and bookkeeping firm with 20+ years serving hundreds of business owners.", "https://www.clrvw.com"),
  f("johnlebbs-tucson", "John Lebbs CPA", "John Lebbs", "tucson", "Tucson", "Arizona", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "John Lebbs CPA, PLLC serves Oro Valley, Marana, Tucson, and surrounding communities with tax, bookkeeping, payroll, and tax planning services.", "https://www.johnlebbscpa.com"),
  f("david-rogers-tucson", "David F. Rogers CPA", "David F. Rogers", "tucson", "Tucson", "Arizona", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "David F. Rogers, CPA, PLLC is a full-service tax, accounting, and business consulting firm located in Oro Valley, AZ.", "https://www.davidrogerscpa.com"),
  f("bmc-cpa-tucson", "BMC CPA Services", "Team", "tucson", "Tucson", "Arizona", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "BMC CPA offers Tucson certified public accountant services including tax, accounting, and advisory services for businesses.", "https://www.bmc-cpa.com"),
  f("randa-cpas-tucson", "R&A CPAs", "Team", "tucson", "Tucson", "Arizona", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing", "healthcare"], "R&A CPAs is a Tucson domestic and international public accounting firm providing comprehensive accounting and consulting services.", "https://randacpas.com"),
  f("pinpointe-tucson-alt", "Pinpointe Accounting Alt", "Team", "tucson", "Tucson", "Arizona", "United States", ["bookkeeping", "tax-advisory"], ["professional-services", "retail"], "Pinpointe Accounting Services provides Tucson businesses with bookkeeping and tax services.", "https://pinpointeaccounting.com"),

  // ── Louisville (aim 20) ────────────────────────────────────────────
  f("ackerman-cpas-louisville", "Ackerman CPAs", "Team", "louisville", "Louisville", "Kentucky", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Ackerman CPAs is a locally owned Louisville CPA firm providing tax and accounting services to small businesses, individuals, and startups in Louisville, Kentucky and surrounding areas.", "https://ack.cpa"),
  f("grace-cpa-louisville", "Grace CPA", "Team", "louisville", "Louisville", "Kentucky", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Grace CPA, PSC provides Louisville businesses with quality accounting services, strategic tax planning, small business accounting, cloud accounting, outsourced bookkeeping, payroll, and QuickBooks setup.", "https://www.grace-cpa.com"),
  f("harding-shymanski-louisville", "Harding, Shymanski & Company", "Team", "louisville", "Louisville", "Kentucky", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing", "healthcare"], "Harding, Shymanski & Company, P.S.C. is a Louisville CPA firm at 101 S 5th Street serving clients from the Highlands, Germantown, Clifton, St. Matthews, Jeffersontown, and Prospect corridor.", "https://hsccpa.com"),
  f("commonwealth-accounting-louisville", "Commonwealth Accounting Services", "Team", "louisville", "Louisville", "Kentucky", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Commonwealth Accounting Services is a Louisville CPA firm serving Jeffersontown, St. Matthews, Middletown, Oldham County, and Southern Indiana with year-round support.", "https://www.commonwealthaccountingservices.com"),
  f("bpa-louisville", "Bluegrass Professional Associates", "Matthew L. Ward", "louisville", "Louisville", "Kentucky", "United States", ["fractional-cfo", "tax-advisory", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Bluegrass Professional Associates is a Louisville Jeffersontown firm led by Matthew L. Ward, CPA with 25+ years specializing in proactive tax planning, advisory, and fractional CFO services.", "https://bpa.tax"),
  f("louis-roth-louisville", "Louis T. Roth & Co.", "Team", "louisville", "Louisville", "Kentucky", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "Louis T. Roth & Co. PLLC is a Louisville, KY accounting firm providing tax, audit, and business advisory services.", "https://www.ltroth.com"),
  f("financial-landing-louisville", "Financial Landing CPAs", "Team", "louisville", "Louisville", "Kentucky", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Financial Landing, CPAs, Inc. is a Louisville full-service CPA firm providing tax, accounting, and business consulting services.", "https://www.financiallandingcpas.com"),
  f("amick-louisville", "Amick & Company", "Team", "louisville", "Louisville", "Kentucky", "United States", ["tax-advisory", "fpa-consulting", "bookkeeping"], ["professional-services", "retail", "real-estate"], "Amick & Company is a Louisville full-service tax, accounting, and business consulting firm.", "https://www.amickonline.com"),
  f("grace-cpa-lou-alt", "Grace CPA Louisville", "Team", "louisville", "Louisville", "Kentucky", "United States", ["tax-advisory", "bookkeeping"], ["professional-services", "retail"], "Grace CPA alt.", "https://grace-cpa.com"),
  f("kycpa-louisville", "KyCPA Find a CPA Louisville", "Team", "louisville", "Louisville", "Kentucky", "United States", ["tax-advisory", "bookkeeping"], ["professional-services"], "Kentucky Society of Certified Public Accountants directory of Louisville firms.", "https://www.kycpa.org"),
  f("bechtler-louisville-alt", "Bechtler Parker Watts Louisville", "Team", "louisville", "Louisville", "Kentucky", "United States", ["tax-advisory", "bookkeeping"], ["professional-services"], "Bechtler Parker & Watts provides Louisville businesses with tax and accounting services.", "https://bpwcpa.com"),

  // ── Providence (aim 20) ────────────────────────────────────────────
  f("kevin-carter-cpa-providence", "Kevin D. Carter CPA", "Kevin D. Carter", "providence", "Providence", "Rhode Island", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Kevin D. Carter CPA is a Warwick RI CPA firm serving Warwick, Cranston, and the Greater Providence area with bookkeeping, startup help, and company tax preparation.", "https://www.kevincartercpa.com"),
  f("edsimpson-cpa-providence", "Edward M. Simpson CPA", "Edward M. Simpson", "providence", "Providence", "Rhode Island", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Edward M. Simpson, CPA is an East Providence RI firm personally handling business and individual accounting and income tax services with expertise in small, family-owned businesses.", "https://www.edsimpsoncpa.com"),
  f("jessica-ratcliffe-providence", "Jessica L. Ratcliffe CPA", "Jessica L. Ratcliffe", "providence", "Providence", "Rhode Island", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Jessica L. Ratcliffe CPA & Associates is a Cranston RI firm offering income tax compliance, tax preparation, tax planning, bookkeeping, and accounting services for small businesses.", "https://www.jessicaratcliffecpa.com"),
  f("ricci-cpa-providence", "Anthony V. Ricci CPA", "Anthony V. Ricci", "providence", "Providence", "Rhode Island", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Anthony V. Ricci, CPA, Inc. is a Warwick RI CPA firm providing tax, accounting, and business advisory services.", "https://ariccicpa.com"),
  f("warwick-cpa-providence", "Warwick Financial Accountants", "Team", "providence", "Providence", "Rhode Island", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Financial Accountants in Warwick, RI provides tax and accounting services to Rhode Island individuals and businesses.", "https://www.warwickcpa.com"),
  f("damiano-cpa-providence", "Damiano CPA", "Team", "providence", "Providence", "Rhode Island", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Damiano CPA is a Rhode Island-based Warwick full-service accounting and financial services firm specializing in tax prep and small business tax filings.", "https://www.damianocpa.com"),
  f("fradin-cpa-providence", "Fradin & Company", "Team", "providence", "Providence", "Rhode Island", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Fradin & Company, Ltd is a Warwick, RI CPA firm providing tax, accounting, and advisory services.", "https://www.fradincpa.com"),
  f("oliveira-cpas-providence", "Oliveira CPAs", "Team", "providence", "Providence", "Rhode Island", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Oliveira CPAs is an East Providence RI CPA firm providing tax, accounting, and business advisory services.", "https://oliveiracpas.com"),
  f("cherry-bekaert-providence", "Cherry Bekaert - Providence", "Team", "providence", "Providence", "Rhode Island", "United States", ["fractional-cfo", "tax-advisory", "fpa-consulting"], ["technology", "healthcare", "professional-services", "manufacturing"], "Cherry Bekaert Providence office provides advisory, assurance, tax, and accounting solutions.", "https://www.cbh.com/locations/cpa-accounting-firm-in-providence-ri/"),
  f("lockey-pierce-providence", "Lockey & Pierce CPAs", "Team", "providence", "Providence", "Rhode Island", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail"], "Lockey & Pierce, CPAs LLC is a full-service accounting firm serving Providence and surrounding communities with tax and accounting services, bookkeeping, and payroll.", "https://lockeypiercecpas.com"),
  f("charland-marciano-providence", "Charland, Marciano & Company", "Team", "providence", "Providence", "Rhode Island", "United States", ["tax-advisory", "fpa-consulting", "bookkeeping"], ["professional-services", "real-estate", "retail"], "Charland, Marciano & Company, CPAs was formed in 1982 offering financial advisory, trust and estate planning, tax preparation, financial planning, bookkeeping, and cash flow management in Providence RI.", "https://www.charlandmarciano.com"),

  // ── Albuquerque (aim 20) ───────────────────────────────────────────
  f("montgomery-cpa-abq", "Montgomery CPA", "Team", "albuquerque", "Albuquerque", "New Mexico", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Montgomery, CPA LLC is an Albuquerque firm aiding small ventures and individual taxpayers since 1995, serving Rio Rancho and Los Lunas.", "https://www.montgomery.cpa"),
  f("kim-cpa-abq", "Kim & Associates", "Team", "albuquerque", "Albuquerque", "New Mexico", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["healthcare", "real-estate", "professional-services", "retail"], "Kim & Associates CPAs has locations in Albuquerque and Santa Fe providing customized accounting services for closely-held businesses, physicians, attorneys, real estate professionals, and local retail.", "https://www.kimcpasnm.com"),
  f("affinity-abq", "Affinity Accounting & Tax", "Team", "albuquerque", "Albuquerque", "New Mexico", "United States", ["bookkeeping", "tax-advisory", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Affinity Accounting & Tax specializes in bookkeeping, payroll, and tax preparation for individuals and small businesses across Albuquerque, Rio Rancho, Santa Fe, and nationwide.", "https://www.affinityaccountingtax.com"),
  f("robert-clark-cpa-abq", "Jennifer Griffith CPA", "Jennifer Griffith", "albuquerque", "Albuquerque", "New Mexico", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Jennifer Griffith, CPA is an Albuquerque full-service tax, accounting, and business consulting firm (formerly Robert Clark CPA).", "https://www.robertclarkcpa.com"),
  f("crossstate-abq", "Cross State Tax and Financial", "Team", "albuquerque", "Albuquerque", "New Mexico", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Cross State Tax and Financial, LLC is an Albuquerque, NM tax and financial services firm providing comprehensive tax preparation, planning, and accounting services.", "https://crossstatetax.com"),
  f("kuderik-abq", "Kuderik and Associates CPAs", "Team", "albuquerque", "Albuquerque", "New Mexico", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Kuderik and Associates CPAs is a trusted accounting firm serving Santa Fe, Albuquerque, and surrounding communities with financial services for small business owners and individuals.", "https://www.kuderikcpa.com"),
  f("radcliff-abq", "Radcliff Financial Works", "Team", "albuquerque", "Albuquerque", "New Mexico", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Radcliff Financial Works, LLC is a Rio Rancho NM full-service tax, accounting, and business consulting firm.", "https://www.radcliff.works"),
  f("o2-cpa-abq", "O2 CPA Consulting Group", "Team", "albuquerque", "Albuquerque", "New Mexico", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "O2 CPA Consulting Group is a boutique Albuquerque accounting firm specializing in tax and financial services to small businesses and individuals throughout New Mexico.", "https://www.o2cpaconsulting.com"),
  f("cla-abq", "CLA - Albuquerque", "Team", "albuquerque", "Albuquerque", "New Mexico", "United States", ["fractional-cfo", "tax-advisory", "fpa-consulting"], ["professional-services", "real-estate", "healthcare", "technology"], "CLA (CliftonLarsonAllen) Albuquerque provides wealth advisory, audit, tax, consulting, and outsourcing services to New Mexico businesses.", "https://www.claconnect.com/en/locations/new-mexico/offices/cla-albuquerque"),
  f("nm-cpa-firm", "New Mexico Society CPA Directory", "Team", "albuquerque", "Albuquerque", "New Mexico", "United States", ["tax-advisory"], ["professional-services"], "New Mexico Society of CPAs directory of Albuquerque-area firms.", "https://www.nmcpa.org"),

  // ── San Francisco (aim 8) ──────────────────────────────────────────
  f("navolio-tallman-sf", "Navolio & Tallman", "Team", "san-francisco", "San Francisco", "California", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "private-equity", "real-estate", "technology"], "Navolio & Tallman LLP is a boutique San Francisco CPA firm offering accounting, audit, tax planning, business advisory, and bill-pay services.", "https://ntllp.cpa"),
  f("gga-cpa-sf", "GGA CPA LLP", "Team", "san-francisco", "San Francisco", "California", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["private-equity", "professional-services", "real-estate"], "GGA CPA, LLP is a premier boutique San Francisco Bay Area accounting firm serving high-net-worth families and their closely held businesses.", "https://www.gga.cpa"),
  f("bolglobal-sf", "B.O.L. Global CPA", "Team", "san-francisco", "San Francisco", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "B.O.L. Global, Inc. was founded in 2002 to provide residents and businesses of Laurel Heights, the Richmond District, and the greater San Francisco Bay Area with a streamlined accounting experience.", "https://www.bolglobalcpa.com"),
  f("sdmayer-sf", "SD Mayer", "Team", "san-francisco", "San Francisco", "California", "United States", ["fractional-cfo", "tax-advisory", "fpa-consulting"], ["technology", "professional-services", "real-estate", "private-equity"], "SD Mayer is a top San Francisco Bay Area public accounting and advisory services firm offering tax, audit, and outsourced accounting.", "https://www.sdmayer.com"),
  f("baycpa-sf", "Bay CPA Firm", "Team", "san-francisco", "San Francisco", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Bay CPA Firm is a San Francisco CPA accounting firm providing tax, accounting, and advisory services to Bay Area businesses.", "https://www.baycpafirm.com"),
  f("harryjeung-sf", "Harry K. Jeung CPA", "Harry K. Jeung", "san-francisco", "San Francisco", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Harry K. Jeung, CPA is a SF Bay Area accountants and CPA firm providing accounting, tax preparation, and bookkeeping for individuals and businesses.", "https://harryjeungcpa.com"),
  f("treestar-sf", "TreeStar Solutions", "Team", "san-francisco", "San Francisco", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "technology"], "TreeStar Solutions is a San Francisco CPA firm with tax accountants and CFO advisory services, serving women-owned and cannabis businesses.", "https://www.treestarsolutions.com"),
  f("basta-sf", "Basta & Company", "Team", "san-francisco", "San Francisco", "California", "United States", ["fractional-cfo", "bookkeeping", "fpa-consulting"], ["professional-services", "technology", "retail"], "Basta & Company helps San Francisco companies optimize business systems, maximize resources, solve financial challenges, and accelerate growth with part-time virtual CFO services.", "https://www.bastacpa.com"),
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
  console.log(`Candidates: ${CANDIDATES.length}`);

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

  const toInsert = withEmail.slice(0, 100).map((c) => ({
    slug: c.slug, name: c.name, contact: c.contact || null, title: null, email: c.email || null,
    city: c.city, city_label: c.cityLabel, province: c.province, country: c.country,
    services: c.services || [], industries: c.industries || [],
    description: c.description || null, website: c.website || null,
    plan: 'free', priority_score: 0, status: 'active',
    submitted_by: 'admin', source: 'claude_code',
  }));

  console.log(`\nInserting ${toInsert.length}...`);
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
