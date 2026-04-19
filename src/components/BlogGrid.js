'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'city-guides', label: 'City Guides' },
  { value: 'pricing-guides', label: 'Pricing Guides' },
  { value: 'insights', label: 'Insights' },
];

const FILTER_LABELS = {
  'city-guides': 'City Guides',
  'pricing-guides': 'Pricing Guides',
  'insights': 'Insights',
};

function deriveFilterCategory(slug) {
  if (slug.startsWith('top-finance-firms-')) return 'city-guides';
  if (slug.startsWith('fractional-cfo-cost-')) return 'pricing-guides';
  return 'insights';
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function excerpt(text, max = 120) {
  if (!text) return '';
  if (text.length <= max) return text;
  const truncated = text.slice(0, max);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${(lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated).trim()}…`;
}

export default function BlogGrid({ posts }) {
  const [filter, setFilter] = useState('all');

  const postsWithCategory = useMemo(
    () =>
      posts.map((p) => ({
        ...p,
        filterCategory: deriveFilterCategory(p.slug),
      })),
    [posts]
  );

  const counts = useMemo(() => {
    const c = { all: postsWithCategory.length, 'city-guides': 0, 'pricing-guides': 0, 'insights': 0 };
    for (const p of postsWithCategory) c[p.filterCategory] = (c[p.filterCategory] || 0) + 1;
    return c;
  }, [postsWithCategory]);

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? postsWithCategory
        : postsWithCategory.filter((p) => p.filterCategory === filter),
    [postsWithCategory, filter]
  );

  return (
    <div>
      <div
        className="flex flex-wrap gap-2 mb-8 border-b border-warm-100 pb-4"
        role="tablist"
        aria-label="Filter posts by category"
      >
        {FILTERS.map((opt) => {
          const active = filter === opt.value;
          const count = counts[opt.value] ?? 0;
          return (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(opt.value)}
              className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-colors border ${
                active
                  ? 'bg-brand-800 border-brand-800 text-white'
                  : 'bg-white border-warm-200 text-brand-700 hover:border-warm-400 hover:text-brand-900'
              }`}
            >
              {opt.label}
              <span
                className={`ml-2 text-xs ${
                  active ? 'text-warm-200' : 'text-brand-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col bg-white border border-warm-100 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-warm-300 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs font-body mb-3">
                <span className="inline-block bg-warm-100 text-brand-800 px-2.5 py-1 rounded uppercase tracking-wider font-medium">
                  {FILTER_LABELS[post.filterCategory]}
                </span>
                <span className="text-brand-500">{formatDate(post.date)}</span>
              </div>

              <h2 className="font-display text-xl md:text-2xl text-brand-950 mb-3 leading-tight">
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-brand-700 transition-colors"
                >
                  {post.title}
                </Link>
              </h2>

              <p className="text-brand-700 font-body text-sm leading-relaxed mb-5 flex-grow">
                {excerpt(post.metaDescription, 120)}
              </p>

              <Link
                href={`/blog/${post.slug}`}
                className="inline-block text-sm font-medium text-brand-700 group-hover:text-warm-700 transition-colors mt-auto"
              >
                Read article →
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-warm-200 rounded-xl">
          <h2 className="font-display text-xl text-brand-950 mb-2">
            No articles in this category yet
          </h2>
          <p className="text-brand-600 font-body text-sm">
            Try a different filter or browse all posts.
          </p>
        </div>
      )}
    </div>
  );
}
