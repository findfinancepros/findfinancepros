#!/usr/bin/env node
/** Appends expanded sections to each city pricing post to hit the 800-1200 word target. */
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Extra sections to insert before the "Next step" section of each post.
const extras = {
  'fractional-cfo-cost-new-york': `
      <h2>How to evaluate a fractional CFO quote in NYC</h2>

      <p>The headline rate is rarely the most important number. What matters is <strong>effective hours per week at the right level of seniority</strong>. Two NYC quotes at $10,000/month can look identical and deliver very different work — one might be a former public-company CFO giving you 10 focused hours a week, while the other is a mid-career advisor giving you 6 hours and outsourcing much of the execution to a junior team member. Ask for the blended hourly rate, what&rsquo;s in scope vs. out, who is doing the actual work, and what the deliverable cadence looks like.</p>

      <p>Also watch the scope boundary between fractional CFO and <a href="/service/controller-services">controller services</a>. If the business doesn&rsquo;t yet have a clean monthly close, a fractional CFO spending hours fixing bookkeeping is expensive. It&rsquo;s almost always more cost-effective to pair a controller-level engagement for the blocking-and-tackling with a CFO-level engagement for strategy and forecasting.</p>

      <h2>Industry-specific notes for New York</h2>

      <p>SaaS and fintech companies in NYC often engage fractional CFOs with a specific focus on ARR reporting, bookings-to-revenue reconciliation, and SaaS metrics. Expect to pay a small premium — typically 10–15% above generalist rates — for that specialization. Real estate and fund-adjacent businesses similarly benefit from fractional CFOs with partnership accounting, waterfall modeling, and fund reporting experience. Life sciences and biotech companies, especially pre-revenue or grant-funded, often need fractional CFOs who understand R&amp;D accruals, grant accounting, and equity financing — another 10–15% premium is standard for that depth. For owner-operated services businesses, a generalist fractional CFO at the base of the range is usually more than enough.</p>
`,
  'fractional-cfo-cost-boston': `
      <h2>How to evaluate a fractional CFO quote in Boston</h2>

      <p>Headline rates in Boston don&rsquo;t mean much on their own. What actually matters is effective senior hours per week, the deliverable cadence, and who is doing the work. Two $10,000/month quotes can deliver different outcomes — one from a former public-company CFO giving 10 focused hours a week, another from a mid-career advisor giving 6 hours and farming execution out to a junior team member. Ask for the blended hourly rate, what&rsquo;s in scope vs. out, who is doing the work, and what the deliverables look like each month.</p>

      <p>Watch the line between fractional CFO and <a href="/service/controller-services">controller services</a>. A fractional CFO spending hours fixing a broken close is expensive. Most Boston businesses are better served pairing a controller-level engagement for close and reconciliation with a CFO-level engagement for strategy and FP&amp;A.</p>

      <h2>Industry-specific notes for Boston</h2>

      <p>Life sciences and biotech companies in Boston typically engage fractional CFOs with specific experience in R&amp;D accruals, grant accounting, equity financing, and clinical trial cost modeling — a 10–20% premium over generalist rates is standard for that depth. SaaS and fintech companies often want a fractional CFO fluent in ARR reporting, SaaS metrics, and Series A-through-C fundraising — expect a smaller premium here, typically 10%. For mid-market manufacturers, professional service firms, and owner-operated businesses, a generalist mid-market fractional CFO at the base of the range is usually enough. Higher education and nonprofit sub-markets have their own specialists, usually at slightly lower headline rates than commercial work.</p>
`,
  'fractional-cfo-cost-toronto': `
      <h2>How to evaluate a fractional CFO quote in Toronto</h2>

      <p>The headline monthly number is only part of the picture. What really matters is <strong>how many senior hours per week you&rsquo;re getting, at what level of experience, and with what deliverables attached</strong>. Two CAD $8,000/month quotes can look the same and deliver very different work — one might be a former public-company CFO giving you 10 focused hours, the other a generalist advisor giving you 6 hours with execution handed to a junior. Ask for blended hourly rate, scope boundaries, who&rsquo;s doing the work, and what you&rsquo;re going to see each month.</p>

      <p>Keep the scope line clear between fractional CFO and <a href="/service/controller-services">controller services</a>. If the books aren&rsquo;t closing cleanly each month, a fractional CFO spending time on reconciliations is the most expensive way to fix it. Pairing a controller for close and cleanup with a CFO for strategy is nearly always better value.</p>

      <h2>Industry-specific notes for Toronto</h2>

      <p>Canadian SaaS and fintech businesses often engage fractional CFOs with deep experience in SR&amp;ED claims, ARR and subscription metrics, and Canadian venture fundraising — expect a 10–15% premium over generalist rates. Cross-border US/Canada businesses benefit from fractional CFOs who can navigate T2 corporate tax, transfer pricing, and GILTI/Subpart F implications. Real estate, mining, and resource-adjacent businesses similarly need specialists. For most owner-operated Ontario businesses — professional services, agencies, B2B services — a generalist mid-market fractional CFO at the base of the range is more than sufficient, and the Toronto market has a particularly deep bench of those generalists.</p>
`,
  'fractional-cfo-cost-los-angeles': `
      <h2>How to evaluate a fractional CFO quote in LA</h2>

      <p>Headline rates don&rsquo;t tell you much on their own. The real question is <strong>how many senior hours per week you get, who&rsquo;s doing the work, and what you receive each month</strong>. Two $10,000/month quotes in LA can deliver very different work — a former public-company CFO giving 10 focused hours vs. a generalist giving 6 and outsourcing execution. Before signing, ask for a blended hourly rate, the boundaries of the scope, who specifically is doing the work, and what the monthly deliverables look like.</p>

      <p>Keep the scope boundary between fractional CFO and <a href="/service/controller-services">controller services</a> clear. If the monthly close is shaky, a fractional CFO cleaning books is expensive. Pairing a controller-level engagement for close with a CFO-level engagement for strategy is usually better value.</p>

      <h2>Industry-specific notes for Los Angeles</h2>

      <p>Entertainment and media companies in LA often engage fractional CFOs who understand royalty accounting, participation statements, residuals, and production cost reporting — a 15–25% premium over generalist rates is common for that specialization. Consumer brands and DTC businesses typically want fractional CFOs fluent in inventory accounting, 3PL/SKU-level reporting, and marketing ROAS modeling. Real estate and family-office-adjacent businesses need partnership accounting, waterfall, and fund-reporting experience. SaaS and fintech mirror the rest of the country on ARR and SaaS metrics. For professional services firms and owner-operated middle-market businesses, a generalist mid-market fractional CFO at the base of the LA range is usually the best fit.</p>
`,
  'fractional-cfo-cost-chicago': `
      <h2>How to evaluate a fractional CFO quote in Chicago</h2>

      <p>The headline monthly rate is only part of the story. What matters more is <strong>effective senior hours per week, who&rsquo;s doing the work, and what deliverables arrive each month</strong>. Two $8,000 quotes in Chicago can be very different — one might be a former public-company CFO giving 10 focused hours, another a generalist giving 6 with execution pushed down to a junior analyst. Ask for the blended hourly rate, the scope boundaries, who is doing the work, and what the monthly reporting cadence looks like.</p>

      <p>Keep the scope line clean between fractional CFO and <a href="/service/controller-services">controller services</a>. A fractional CFO spending time on bookkeeping cleanup is the most expensive way to fix a broken close. Most Chicago mid-market businesses are better served by pairing a controller-level engagement for close and reconciliation with a CFO-level engagement for strategy and FP&amp;A.</p>

      <h2>Industry-specific notes for Chicago</h2>

      <p>Manufacturing and industrial businesses in Chicago typically engage fractional CFOs who understand job costing, standard costing, inventory reporting, and bank/ABL covenant management — a 10–15% premium for that industry depth is normal. Construction and trades businesses need WIP schedules, surety bonding, and percentage-of-completion accounting expertise. SaaS and fintech mirror other US markets on ARR and metrics. Healthcare providers and physician groups have their own specialists around RVU-based revenue, reimbursement, and multi-location cost structures. For professional services, logistics, and distribution businesses, a generalist Chicago fractional CFO at the base of the range is usually exactly right.</p>
`,
  'fractional-cfo-cost-miami': `
      <h2>How to evaluate a fractional CFO quote in Miami</h2>

      <p>Headline rates matter less than <strong>effective senior hours per week and who is actually doing the work</strong>. Two $8,000/month quotes in Miami can produce very different results — a former public-company CFO giving 10 focused hours is a different engagement than a generalist giving 6 with junior execution. Ask every firm for the blended hourly rate, scope boundaries, who&rsquo;s doing the work, and what the monthly cadence of deliverables will look like.</p>

      <p>Keep the line clear between fractional CFO and <a href="/service/controller-services">controller services</a>. Miami has a deep CPA and controller talent pool, and pairing a controller-level engagement for close with a CFO-level engagement for strategy is almost always better value than asking one person to do both.</p>

      <h2>Industry-specific notes for Miami</h2>

      <p>Real estate, hospitality, and family-office-adjacent businesses in Miami typically engage fractional CFOs with partnership accounting, waterfall modeling, and fund reporting experience — a 10–20% premium is standard. Cross-border LatAm businesses often want fractional CFOs with US/LatAm tax, transfer pricing, and multi-entity consolidation experience, and Miami&rsquo;s bilingual bench runs unusually deep here. Fintech, crypto, and alternative asset managers have their own specialists. For professional services, e-commerce, and owner-operated middle-market businesses, a generalist Miami fractional CFO at the base of the range is usually the best fit and the best value.</p>
`,
};

async function main() {
  for (const [slug, extraHtml] of Object.entries(extras)) {
    const { data: post, error: fetchErr } = await supabase
      .from('blog_posts')
      .select('content')
      .eq('slug', slug)
      .maybeSingle();
    if (fetchErr || !post) { console.error(`fetch ${slug}:`, fetchErr?.message); continue; }

    // Insert new sections right before the final "Next step" <h2> heading.
    const marker = '<h2>Next step</h2>';
    if (!post.content.includes(marker)) {
      console.error(`  ✗ ${slug}: missing marker, skipping`);
      continue;
    }
    if (post.content.includes('How to evaluate a fractional CFO quote')) {
      console.log(`  ✗ ${slug}: already expanded`);
      continue;
    }
    const updated = post.content.replace(marker, `${extraHtml}\n      ${marker}`);

    const wordsBefore = post.content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    const wordsAfter = updated.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

    const { error: updErr } = await supabase
      .from('blog_posts')
      .update({ content: updated, updated_at: new Date().toISOString() })
      .eq('slug', slug);
    if (updErr) { console.error(`update ${slug}:`, updErr.message); continue; }

    console.log(`  ✓ ${slug}: ${wordsBefore} → ${wordsAfter} words`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
