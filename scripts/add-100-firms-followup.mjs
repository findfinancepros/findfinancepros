#!/usr/bin/env node
/** Followup: add 5 firms to hit 30 in Toronto, Montreal, Edmonton, Ottawa, Houston. */
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function f(slug, name, contact, city, cityLabel, province, country, services, industries, description, website) {
  return { slug, name, contact: contact || 'Team', title: null, email: null, city, cityLabel, province, country, services, industries, description, website };
}

const newFirms = [
  f("sdg-accountant-toronto", "SDG Accountant", "Team", "toronto", "Toronto", "Ontario", "Canada", ["fractional-cfo", "controller-services", "tax-advisory"], ["professional-services", "technology", "real-estate", "retail"], "SDG Accountant is a Toronto chartered professional accountant firm offering outsourced CFO and controller services, tax, and accounting across the U.S. and Canada.", "https://accountingtoronto.ca"),
  f("mta-cpa-montreal", "MTA CPA Inc.", "Team", "montreal", "Montreal", "Quebec", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "MTA CPA Inc. is a Montreal South Shore chartered accounting and tax firm serving Brossard, La Prairie, Longueuil, Saint-Hubert, Saint-Lambert, and the Greater Montreal area.", "https://www.mpmt.ca"),
  f("padgett-nw-edmonton", "Padgett N.W.", "Team", "edmonton", "Edmonton", "Alberta", "Canada", ["bookkeeping", "tax-advisory", "fpa-consulting"], ["professional-services", "retail", "construction", "real-estate"], "Padgett N.W. is an Edmonton-based accounting firm serving Alberta entrepreneurs with professional bookkeeping, tax filing, accounting, and business advisory services on a monthly basis with 20+ years of experience.", "https://www.padgettnw.com"),
  f("compass-accounting-ottawa", "Compass Accounting", "Team", "ottawa", "Ottawa", "Ontario", "Canada", ["bookkeeping", "tax-advisory", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Compass Accounting provides trusted bookkeeping and financial services for startups, small businesses, and corporations in Kemptville and the Ottawa area.", "https://www.compassaccountingservices.com"),
  f("jag-cpa-houston", "JAG CPA & Co", "Team", "houston", "Houston", "Texas", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate", "technology"], "JAG CPA & Co is one of the best small business CPA firms in Houston, offering accounting and tax services including tax preparation, financial planning, and business consulting.", "https://jagcpa.com"),
];

function normName(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function normWeb(s) { if (!s) return ''; return s.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].replace(/\/$/, ''); }

async function main() {
  const { data: existing } = await sb.from('firms').select('slug, name, website');
  const existingSlugs = new Set(existing.map((f) => f.slug));
  const existingNames = new Set(existing.map((f) => normName(f.name)));
  const existingWebsites = new Set(existing.map((f) => normWeb(f.website)).filter(Boolean));

  const toInsert = [];
  for (const firm of newFirms) {
    const nn = normName(firm.name); const nw = normWeb(firm.website);
    if (existingSlugs.has(firm.slug)) { console.log(`  ✗ ${firm.name} dup slug`); continue; }
    if (existingNames.has(nn)) { console.log(`  ✗ ${firm.name} dup name`); continue; }
    if (nw && existingWebsites.has(nw)) { console.log(`  ✗ ${firm.name} dup website`); continue; }
    toInsert.push({
      slug: firm.slug, name: firm.name, contact: firm.contact, title: null, email: null,
      city: firm.city, city_label: firm.cityLabel, province: firm.province, country: firm.country,
      services: firm.services, industries: firm.industries, description: firm.description,
      website: firm.website, plan: 'free', priority_score: 0, status: 'active',
      submitted_by: 'admin', source: 'claude_code',
    });
    existingSlugs.add(firm.slug); existingNames.add(nn); if (nw) existingWebsites.add(nw);
  }

  if (toInsert.length) {
    const { error } = await sb.from('firms').insert(toInsert);
    if (error) { console.error(error.message); process.exit(1); }
    console.log(`✓ Inserted ${toInsert.length}`);
  }

  for (const c of ['toronto','vancouver','calgary','montreal','edmonton','new-york','ottawa','miami','houston','dallas']) {
    const { count } = await sb.from('firms').select('*', { count: 'exact', head: true }).eq('city', c).eq('status', 'active');
    console.log(`  ${c.padEnd(12)} ${count}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
