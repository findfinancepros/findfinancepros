#!/usr/bin/env node
// Stage 1 — Crawl firm websites and cache raw HTML + markdown to disk.
// Free, no AI. Resumable: skips firms already cached (unless --force).
//
// Usage:
//   node scripts/scrape-1-crawl.mjs --slugs aspire-cfo,krd-cpas    # specific firms
//   node scripts/scrape-1-crawl.mjs --limit 5                       # first N firms
//   node scripts/scrape-1-crawl.mjs                                 # ALL firms
//   add --force to re-crawl cached firms.
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import pLimit from 'p-limit';
import robotsParser from 'robots-parser';
import { supabase, slugCacheDir, resolveSameHost, categorizeLink, sleep } from './scrape-lib.mjs';

const args = process.argv.slice(2);
const getArg = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const FORCE = args.includes('--force');
const SLUGS = getArg('--slugs')?.split(',').map((s) => s.trim()).filter(Boolean) || null;
const LIMIT = getArg('--limit') ? parseInt(getArg('--limit'), 10) : null;
const CONCURRENCY = parseInt(getArg('--concurrency') || '6', 10);
const MAX_SUBPAGES = 6;          // cap extra pages per firm
const NAV_TIMEOUT = 18000;       // per-page navigation timeout
const FIRM_TIMEOUT = 70000;      // hard watchdog: abort a firm that exceeds this total
const CLOSE_TIMEOUT = 5000;      // cap context.close() so a hung browser can't stall
const PER_DOMAIN_DELAY = 800;    // politeness between requests to same site
const STEALTH = args.includes('--stealth'); // present as a real browser; wait out JS bot-challenges
const IGNORE_ROBOTS = args.includes('--ignore-robots'); // skip robots.txt disallow check (explicit opt-in)
const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const CHALLENGE_RE = /just a moment|checking your browser|verifying you are human|sgcaptcha|cf-browser-verification|enable javascript and cookies|attention required|ddos protection|cf_chl/i;

// Close a context without ever blocking forever (hung Chromium can hang .close()).
function closeQuietly(context) {
  return Promise.race([
    context.close().catch(() => {}),
    new Promise((r) => setTimeout(r, CLOSE_TIMEOUT)),
  ]);
}

const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
turndown.remove(['script', 'style', 'noscript', 'svg']);

async function fetchFirms() {
  let q = supabase.from('firms').select('slug,name,website,city_label').eq('status', 'active').not('website', 'is', null);
  if (SLUGS) q = q.in('slug', SLUGS);
  // Supabase caps at 1000/req — page through.
  const all = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await q.range(from, from + 999);
    if (error) throw new Error(error.message);
    all.push(...data);
    if (!data.length || data.length < 1000 || SLUGS) break;
  }
  return LIMIT ? all.slice(0, LIMIT) : all;
}

async function getRobots(context, origin) {
  try {
    const res = await context.request.get(`${origin}/robots.txt`, { timeout: 8000 });
    if (!res.ok()) return null;
    return robotsParser(`${origin}/robots.txt`, await res.text());
  } catch { return null; }
}

async function grabPage(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
  await page.waitForTimeout(STEALTH ? 1500 : 700); // let lazy content settle
  if (STEALTH) {
    // Give JS bot-challenges (Cloudflare / SiteGround sgcaptcha) time to auto-clear.
    for (let i = 0; i < 5; i++) {
      if (!CHALLENGE_RE.test(await page.content())) break;
      await page.waitForTimeout(2500);
    }
    try { await page.waitForLoadState('networkidle', { timeout: 6000 }); } catch {}
  }
  const html = await page.content();
  return html;
}

function cleanMarkdown(html) {
  const $ = cheerio.load(html);
  $('script, style, noscript, svg, header nav, footer, .cookie, #cookie, [role="navigation"]').remove();
  const main = $('main').html() || $('body').html() || html;
  return turndown.turndown(main).replace(/\n{3,}/g, '\n\n').trim().slice(0, 20000);
}

async function crawlFirm(browser, firm) {
  const dir = slugCacheDir(firm.slug);
  if (!FORCE) {
    try { await fs.access(`${dir}/meta.json`); return { slug: firm.slug, status: 'cached' }; } catch {}
  }
  const context = await browser.newContext(STEALTH ? {
    userAgent: CHROME_UA,
    viewport: { width: 1366, height: 900 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
    extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
    ignoreHTTPSErrors: true, // some legit firm sites have expired/misconfigured certs
  } : {
    userAgent: 'Mozilla/5.0 (compatible; FindFinanceProsBot/1.0; +https://findfinancepros.com/bot)',
    viewport: { width: 1280, height: 900 },
  });
  if (STEALTH) {
    // Mask the most obvious automation signals so soft bot-walls let us through.
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      window.chrome = window.chrome || { runtime: {} };
    });
  }
  const pages = {};
  let watchdog;
  const deadline = new Promise((_, reject) => {
    watchdog = setTimeout(() => reject(new Error(`watchdog timeout (${FIRM_TIMEOUT / 1000}s)`)), FIRM_TIMEOUT);
  });
  try {
    return await Promise.race([deadline, (async () => {
    const origin = new URL(firm.website).origin;
    const robots = IGNORE_ROBOTS ? null : await getRobots(context, origin);
    const blocked = (u) => !IGNORE_ROBOTS && robots && robots.isDisallowed(u, 'FindFinanceProsBot') === true;

    const page = await context.newPage();
    page.setDefaultTimeout(NAV_TIMEOUT);

    // 1. Homepage
    if (blocked(firm.website)) throw new Error('homepage disallowed by robots.txt');
    const homeHtml = await grabPage(page, firm.website);
    pages.home = { url: firm.website, html: homeHtml };

    // Detect acquisition / rebrand / domain change: did we land on a different host?
    const landedUrl = page.url();
    const reqHost = new URL(firm.website).hostname.replace(/^www\./, '');
    const landedHost = new URL(landedUrl).hostname.replace(/^www\./, '');
    const redirectedOffDomain = landedHost !== reqHost;

    // 2. Discover candidate subpages from homepage links
    const $ = cheerio.load(homeHtml);
    const candidates = new Map(); // category -> url (first match wins)
    $('a[href]').each((_, a) => {
      const abs = resolveSameHost($(a).attr('href'), firm.website);
      if (!abs) return;
      const cat = categorizeLink(abs, $(a).text());
      if (cat && !candidates.has(cat)) candidates.set(cat, abs);
    });

    let count = 0;
    for (const [cat, url] of candidates) {
      if (count >= MAX_SUBPAGES) break;
      if (url === firm.website || blocked(url)) continue;
      await sleep(PER_DOMAIN_DELAY);
      try {
        const html = await grabPage(page, url);
        pages[cat] = { url, html };
        count++;
      } catch (e) {
        pages[cat] = { url, error: String(e.message || e).slice(0, 200) };
      }
    }

    // Persist: raw html + cleaned markdown per page + combined corpus
    await fs.mkdir(dir, { recursive: true });
    const corpusParts = [];
    for (const [key, p] of Object.entries(pages)) {
      if (!p.html) continue;
      await fs.writeFile(`${dir}/${key}.html`, p.html);
      const md = cleanMarkdown(p.html);
      await fs.writeFile(`${dir}/${key}.md`, md);
      corpusParts.push(`\n\n===== PAGE: ${key.toUpperCase()} (${p.url}) =====\n\n${md}`);
    }
    await fs.writeFile(`${dir}/corpus.md`, corpusParts.join('\n'));
    await fs.writeFile(`${dir}/meta.json`, JSON.stringify({
      slug: firm.slug, name: firm.name, website: firm.website,
      pages: Object.fromEntries(Object.entries(pages).map(([k, p]) => [k, { url: p.url, ok: !!p.html, error: p.error || null }])),
      landedUrl, redirectedOffDomain,
      crawledAt: new Date().toISOString(),
    }, null, 2));

    return { slug: firm.slug, status: 'ok', redirectedOffDomain, landedHost, pages: Object.keys(pages).filter((k) => pages[k].html) };
    })()]);
  } catch (e) {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(`${dir}/meta.json`, JSON.stringify({
      slug: firm.slug, name: firm.name, website: firm.website,
      error: String(e.message || e).slice(0, 300), crawledAt: new Date().toISOString(),
    }, null, 2));
    return { slug: firm.slug, status: 'error', error: String(e.message || e).slice(0, 200) };
  } finally {
    clearTimeout(watchdog);
    await closeQuietly(context);
  }
}

// Don't let a stray async rejection kill the whole crawl.
process.on('unhandledRejection', (e) => console.error('unhandledRejection:', String(e).slice(0, 200)));

const RECYCLE = parseInt(getArg('--recycle') || '80', 10); // relaunch browser every N firms to bound memory

(async () => {
  const firms = await fetchFirms();
  console.log(`Crawling ${firms.length} firm(s) — concurrency ${CONCURRENCY}, browser recycle every ${RECYCLE}\n`);
  const limit = pLimit(CONCURRENCY);
  const totals = { ok: 0, cached: 0, error: 0, redirected: 0 };
  let done = 0;

  // Process in windows, each with a FRESH browser instance (closed after) so
  // Chromium memory can't accumulate across thousands of sites.
  for (let i = 0; i < firms.length; i += RECYCLE) {
    const slice = firms.slice(i, i + RECYCLE);
    let browser;
    try {
      browser = await chromium.launch({ headless: true });
      await Promise.all(slice.map((f) => limit(async () => {
        const r = await crawlFirm(browser, f);
        done++;
        if (r.status === 'ok') totals.ok++;
        else if (r.status === 'cached') totals.cached++;
        else totals.error++;
        if (r.redirectedOffDomain) totals.redirected++;
        const redir = r.redirectedOffDomain ? ` ⚠ REDIRECTED→${r.landedHost}` : '';
        const tag = r.status === 'ok' ? `ok [${r.pages.join(', ')}]${redir}` : r.status === 'cached' ? 'cached' : `ERROR ${r.error}`;
        console.log(`  [${done}/${firms.length}] ${f.slug.padEnd(28)} ${tag}`);
        return r;
      })));
    } catch (e) {
      console.error(`window ${i} failed: ${String(e).slice(0, 160)}`);
    } finally {
      if (browser) { try { await browser.close(); } catch {} }
    }
  }
  console.log(`\nDone. ok=${totals.ok} cached=${totals.cached} error=${totals.error} redirected=${totals.redirected}`);
})();
