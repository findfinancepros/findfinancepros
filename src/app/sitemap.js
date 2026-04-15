import {
  getAllFirms,
  getAllCities,
  getAllServices,
  getAllIndustries,
  getAllBlogPosts,
  getCityServiceCombinations,
} from '@/lib/data';

export const revalidate = 3600;

export default async function sitemap() {
  const baseUrl = 'https://findfinancepros.com';

  const [firms, cities, services, industries, posts, { combos }] = await Promise.all([
    getAllFirms(),
    getAllCities(),
    getAllServices(),
    getAllIndustries(),
    getAllBlogPosts(),
    getCityServiceCombinations(),
  ]);

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${baseUrl}/get-matched`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
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

  const professionalPages = firms.map((pro) => ({
    url: `${baseUrl}/professional/${pro.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const cityServicePages = combos.map((c) => ({
    url: `${baseUrl}/city/${c.citySlug}/${c.serviceSlug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...cityPages, ...servicePages, ...industryPages, ...cityServicePages, ...professionalPages, ...blogPages];
}
