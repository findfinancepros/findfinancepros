#!/usr/bin/env node
/** Fill remaining Boston/Chicago/LA firms to reach 30 per city. */
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const newFirms = [
  // Boston +3
  { slug: "gray-gray-gray-boston", name: "Gray, Gray & Gray LLP", contact: "Team", title: "CPA", email: null, city: "boston", cityLabel: "Boston", province: "Massachusetts", country: "United States", services: ["fractional-cfo", "tax-advisory", "fpa-consulting"], industries: ["manufacturing", "real-estate", "technology", "life-sciences"], description: "Gray, Gray & Gray is an 80-year-old Top 200 independent Boston-area CPA firm headquartered in Canton, MA, providing tax, audit, advisory, private wealth management, and investment banking services across New England.", website: "https://www.gggllp.com" },
  { slug: "ryter-company-boston", name: "Ryter & Company", contact: "Team", title: "CPA", email: null, city: "boston", cityLabel: "Boston", province: "Massachusetts", country: "United States", services: ["tax-advisory", "bookkeeping", "fpa-consulting"], industries: ["professional-services", "real-estate", "retail", "healthcare"], description: "Ryter & Company is a Boston CPA firm established in 1995 at 50 Congress Street providing business and individual accounting, tax, QuickBooks, IRS resolution, business formation, and financial planning services.", website: "https://www.rytercpa.com" },
  { slug: "peck-cpa-boston", name: "Peck Associates CPA", contact: "Team", title: "CPA", email: "info@peckcpa.com", city: "boston", cityLabel: "Boston", province: "Massachusetts", country: "United States", services: ["tax-advisory", "bookkeeping", "controller-services"], industries: ["technology", "life-sciences", "professional-services"], description: "Peck Associates is a Needham, MA Boston-area accounting firm providing small business accounting, QuickBooks, tax, audit, IRS representation, and budgeting and forecasting for technology, life sciences, and family-owned businesses.", website: "https://peckcpa.com" },

  // Chicago +3
  { slug: "founders-cpa-chicago", name: "Founders CPA", contact: "Team", title: "CPA", email: null, city: "chicago", cityLabel: "Chicago", province: "Illinois", country: "United States", services: ["fractional-cfo", "bookkeeping", "tax-advisory"], industries: ["technology", "saas", "fintech"], description: "Founders CPA is a Chicago boutique accounting firm at 850 W Jackson Blvd providing scalable accounting-as-a-service, tax, and CFO services for venture-backed tech, FinTech, blockchain/crypto, and SaaS startups.", website: "https://www.founderscpa.com" },
  { slug: "iacctax-chicago", name: "iAcctax", contact: "Team", title: "CPA", email: "info@iacctax.com", city: "chicago", cityLabel: "Chicago", province: "Illinois", country: "United States", services: ["fractional-cfo", "bookkeeping", "tax-advisory"], industries: ["professional-services", "retail", "healthcare", "real-estate"], description: "iAcctax is a Chicago accounting firm with offices at 1132 Wabash Ave and Deerfield providing accounting, payroll, CFO services, audits, business valuation, succession planning, and IRS representation for businesses and individuals.", website: "https://www.iacctax.com" },
  { slug: "fred-lundin-cpa-chicago", name: "Fred Lundin CPA", contact: "Fred Lundin", title: "CPA", email: "fred@fredlundincpa.com", city: "chicago", cityLabel: "Chicago", province: "Illinois", country: "United States", services: ["fractional-cfo", "bookkeeping", "tax-advisory"], industries: ["ecommerce", "retail", "technology", "professional-services"], description: "Fred Lundin CPA is a Chicago firm at 500 S Clinton Street providing full-service bookkeeping, business and personal tax, fractional CFO services, and accounting software implementation with specialization in e-commerce and small business data analytics.", website: "https://fredlundincpa.com" },

  // LA +2
  { slug: "accuretta-la", name: "Accuretta Inc.", contact: "Team", title: "CPA", email: "info@accurettacpas.com", city: "los-angeles", cityLabel: "Los Angeles", province: "California", country: "United States", services: ["fractional-cfo", "bookkeeping", "tax-advisory"], industries: ["professional-services", "real-estate", "retail", "healthcare"], description: "Accuretta is a Sherman Oaks CPA firm serving the Los Angeles area for nearly 20 years with small business accounting, part-time CFO services, business valuation, succession planning, tax planning, and IRS problem resolution.", website: "https://www.accurettacpas.com" },
  { slug: "rose-figueroa-la", name: "Rose, Figueroa & Associates", contact: "Team", title: "CPA", email: "info@rfcpa.la", city: "los-angeles", cityLabel: "Los Angeles", province: "California", country: "United States", services: ["fractional-cfo", "bookkeeping", "tax-advisory"], industries: ["professional-services", "retail", "real-estate", "healthcare"], description: "Rose, Figueroa & Associates is a Sherman Oaks CPA firm at 15490 Ventura Blvd providing small business accounting, controller and CFO services, cash flow management, tax planning, IRS resolution, and QuickBooks support.", website: "https://www.rfcpa.la" },
];

function normName(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function normWebsite(s) { if (!s) return ''; return s.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, ''); }

async function main() {
  const { data: existing } = await supabase.from('firms').select('slug, name, website');
  const existingSlugs = new Set(existing.map((f) => f.slug));
  const existingNames = new Set(existing.map((f) => normName(f.name)));
  const existingWebsites = new Set(existing.map((f) => normWebsite(f.website)).filter(Boolean));

  const toInsert = [];
  const skipped = [];
  for (const firm of newFirms) {
    const nn = normName(firm.name);
    const nw = normWebsite(firm.website);
    if (existingSlugs.has(firm.slug)) skipped.push({ name: firm.name, reason: 'dup slug' });
    else if (existingNames.has(nn)) skipped.push({ name: firm.name, reason: 'dup name' });
    else if (nw && existingWebsites.has(nw)) skipped.push({ name: firm.name, reason: 'dup website' });
    else {
      toInsert.push({
        slug: firm.slug, name: firm.name, contact: firm.contact || null, title: firm.title || null,
        email: firm.email || null, city: firm.city, city_label: firm.cityLabel,
        province: firm.province, country: firm.country, services: firm.services || [],
        industries: firm.industries || [], description: firm.description || null,
        website: firm.website || null, plan: 'free', priority_score: 0, status: 'active',
        submitted_by: 'admin', source: 'claude_code',
      });
      existingSlugs.add(firm.slug); existingNames.add(nn); if (nw) existingWebsites.add(nw);
    }
  }

  if (skipped.length) skipped.forEach((s) => console.log(`  ✗ ${s.name} — ${s.reason}`));
  if (!toInsert.length) { console.log('Nothing to insert'); return; }

  const { error } = await supabase.from('firms').insert(toInsert);
  if (error) { console.error('Insert failed:', error.message); process.exit(1); }
  console.log(`✓ Inserted ${toInsert.length} firms`);

  for (const c of ['boston', 'chicago', 'los-angeles']) {
    const { count } = await supabase.from('firms').select('*', { count: 'exact', head: true }).eq('city', c);
    console.log(`  ${c}: ${count}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
