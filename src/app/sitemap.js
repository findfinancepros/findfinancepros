import {
  getAllFirms,
  getAllCities,
  getAllServices,
  getAllIndustries,
  getAllBlogPosts,
  getCityServiceCombinations,
} from '@/lib/data';
import { isComboIndexable, isFirmIndexable } from '@/lib/seo';

export const revalidate = 3600;

export default async function sitemap() {
  const baseUrl = 'https://www.findfinancepros.com';

  const [firms, cities, services, industries, posts, { combos }] = await Promise.all([
    getAllFirms(),
    getAllCities(),
    getAllServices(),
    getAllIndustries(),
    getAllBlogPosts(),
    getCityServiceCombinations(),
  ]);

  // The hub pages were previously missing here, so the sitemap never pointed at
  // the top of each category tree. /search is deliberately absent: it's
  // noindexed (unbounded ?q= URL space).
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/cities`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/industries`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/firms`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/get-matched`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/submit`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  const blogPages = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const cityPages = cities.map((city) => ({
    url: `${baseUrl}/city/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const servicePages = services.map((service) => ({
    url: `${baseUrl}/service/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const industryPages = industries.map((industry) => ({
    url: `${baseUrl}/industry/${industry.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Only advertise profiles we actually ask Google to index — a noindexed page
  // sitting in the sitemap is a contradictory signal.
  const professionalPages = firms.filter(isFirmIndexable).map((pro) => ({
    url: `${baseUrl}/professional/${pro.slug}`,
    // Use the firm's real last-updated time so Google can tell which pages
    // actually changed (e.g. the enriched ones) and prioritize re-crawling them.
    lastModified: pro.updatedAt ? new Date(pro.updatedAt) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Only emit combos whose city and service are registered categories —
  // otherwise the resulting /city/[city]/[service] page 404s.
  const citySlugs = new Set(cities.map((c) => c.slug));
  const serviceSlugs = new Set(services.map((s) => s.slug));
  const cityServicePages = combos
    .filter((c) => citySlugs.has(c.citySlug) && serviceSlugs.has(c.serviceSlug))
    // Thin combos are noindexed on the page itself; keep the sitemap in step.
    .filter((c) => isComboIndexable(c.count))
    .map((c) => ({
      url: `${baseUrl}/city/${c.citySlug}/${c.serviceSlug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  return [...staticPages, ...cityPages, ...servicePages, ...industryPages, ...cityServicePages, ...professionalPages, ...blogPages];
}
