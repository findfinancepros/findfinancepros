// Shared helpers for the firm enrichment pipeline.
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export const CACHE_DIR = 'scrape-cache';

// Pages we try to find and crawl on each firm site, by keyword in the link href/text.
export const PAGE_KEYWORDS = {
  services: ['service', 'what-we-do', 'solutions', 'expertise', 'practice'],
  team: ['team', 'our-team', 'people', 'staff', 'leadership', 'who-we-are', 'attorneys', 'advisors'],
  about: ['about', 'about-us', 'company', 'firm', 'why-us'],
  contact: ['contact', 'contact-us', 'get-in-touch', 'locations', 'offices'],
  pricing: ['pricing', 'price', 'fees', 'plans', 'packages', 'cost'],
};

export function slugCacheDir(slug) {
  return `${CACHE_DIR}/${slug}`;
}

// Normalize a URL to absolute form against a base; returns null if invalid/off-host.
export function resolveSameHost(href, baseUrl) {
  try {
    const u = new URL(href, baseUrl);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    const baseHost = new URL(baseUrl).hostname.replace(/^www\./, '');
    const host = u.hostname.replace(/^www\./, '');
    if (host !== baseHost) return null;
    u.hash = '';
    return u.toString();
  } catch {
    return null;
  }
}

export function categorizeLink(href, text) {
  const hay = `${href} ${text || ''}`.toLowerCase();
  for (const [cat, kws] of Object.entries(PAGE_KEYWORDS)) {
    if (kws.some((k) => hay.includes(k))) return cat;
  }
  return null;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
