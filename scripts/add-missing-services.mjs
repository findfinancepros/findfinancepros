#!/usr/bin/env node
/** Adds 9 service categories referenced by firms but missing from the services
 *  table, to fix Search Console 404s on /service/[slug] and /city/[city]/[service]. */
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const services = [
  {
    slug: 'tax-services',
    label: 'Tax Services',
    description:
      'Tax preparation, compliance, and filing for businesses and individuals — from annual returns and sales tax to multi-state and cross-border work.',
  },
  {
    slug: 'advisory',
    label: 'Business Advisory',
    description:
      'General business and financial advisory: strategic planning, operational improvement, profitability reviews, and owner-operator guidance.',
  },
  {
    slug: 'audit-assurance',
    label: 'Audit & Assurance',
    description:
      'Independent audits, reviews, and compilations — including financial statement audits, employee benefit plan audits, and SOC engagements.',
  },
  {
    slug: 'estate-planning',
    label: 'Estate Planning',
    description:
      'Estate, gift, and trust planning for business owners and high-net-worth families — succession design, wealth transfer, and related tax strategy.',
  },
  {
    slug: 'insolvency',
    label: 'Insolvency & Restructuring',
    description:
      'Insolvency, restructuring, and turnaround advisory — including creditor negotiations, bankruptcy support, and distressed business guidance.',
  },
  {
    slug: 'forensic-accounting',
    label: 'Forensic Accounting',
    description:
      'Forensic accounting and litigation support — fraud investigations, economic damages analysis, and expert witness services.',
  },
  {
    slug: 'outsourced-accounting',
    label: 'Outsourced Accounting',
    description:
      'Fully outsourced accounting departments for growing businesses — day-to-day bookkeeping, month-end close, reporting, and controller-level oversight.',
  },
  {
    slug: 'wealth-management',
    label: 'Wealth Management',
    description:
      'Wealth management and investment advisory for business owners and high-net-worth individuals — portfolio planning, tax-aware investing, and retirement.',
  },
  {
    slug: 'risk-advisory',
    label: 'Risk Advisory',
    description:
      'Risk advisory, internal controls, and compliance — enterprise risk management, SOX support, internal audit, and regulatory readiness.',
  },
];

async function main() {
  const { data: existing, error: exErr } = await supabase
    .from('services')
    .select('slug');
  if (exErr) { console.error('select failed:', exErr.message); process.exit(1); }
  const existingSlugs = new Set((existing || []).map((s) => s.slug));

  const toInsert = services.filter((s) => !existingSlugs.has(s.slug));
  const skipped = services.filter((s) => existingSlugs.has(s.slug));
  for (const s of skipped) console.log(`  ✗ ${s.slug} — already exists, skipping`);

  if (!toInsert.length) { console.log('Nothing to insert'); return; }

  const { error } = await supabase.from('services').insert(toInsert);
  if (error) { console.error('insert failed:', error.message); process.exit(1); }
  console.log(`✓ Inserted ${toInsert.length} new service categories`);

  const { data: all, error: listErr } = await supabase
    .from('services')
    .select('slug,label')
    .order('label');
  if (listErr) { console.error(listErr.message); process.exit(1); }
  console.log(`\n=== services table now has ${all.length} categories ===`);
  for (const s of all) console.log(`  ${s.slug}  |  ${s.label}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
