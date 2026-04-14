export const blogCategories = {
  guides: { label: 'Guides', description: 'In-depth guides for business owners' },
  insights: { label: 'Insights', description: 'Industry insights and analysis' },
  comparisons: { label: 'Comparisons', description: 'Compare options and approaches' },
};

export const blogPosts = [
  {
    slug: 'what-does-a-fractional-cfo-do',
    title: 'What Does a Fractional CFO Do? A Complete Guide for Business Owners',
    metaDescription:
      'A fractional CFO gives growing businesses senior financial leadership without the cost of a full-time hire. Learn what they do, when to hire one, and how to choose the right fit.',
    author: 'FindFinancePros Editorial',
    authorTitle: 'Editorial Team',
    date: '2026-04-14',
    readTime: '6 min read',
    category: 'guides',
    tags: ['fractional CFO', 'finance leadership', 'small business'],
    content: `
      <p>A fractional CFO is a senior finance executive who works with your business on a part-time, contract, or retainer basis. They provide the strategic financial leadership of a full-time Chief Financial Officer — cash flow planning, forecasting, investor reporting, board-level decision support — without the full-time salary, equity, and benefits cost. For most businesses between roughly $2M and $50M in revenue, a fractional CFO is the most efficient way to professionalize the finance function before committing to a permanent hire.</p>
      <p>This is a placeholder article. Full guide content will be published soon, covering when to hire a fractional CFO, typical engagement structures, what to expect in the first 90 days, and how fractional CFOs differ from controllers, bookkeepers, and FP&amp;A consultants. In the meantime, you can browse verified fractional CFOs on FindFinancePros or get matched with a professional who fits your industry and stage.</p>
    `,
    relatedServices: ['fractional-cfo', 'fpa-consulting', 'controller-services'],
    relatedCities: ['toronto', 'vancouver', 'new-york', 'chicago'],
    relatedIndustries: ['technology', 'manufacturing', 'professional-services'],
  },
];

export function getPostBySlug(slug) {
  return blogPosts.find((p) => p.slug === slug);
}

export function getSortedPosts() {
  return [...blogPosts].sort((a, b) => (a.date < b.date ? 1 : -1));
}
