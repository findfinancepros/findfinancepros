import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSortedPosts, blogCategories } from '@/data/blog';

export const metadata = {
  title: 'Blog — Guides & Insights for Finance Leaders',
  description:
    'Guides, insights, and comparisons to help business owners and finance leaders navigate fractional CFO services, FP&A, controllership, and bookkeeping.',
  alternates: { canonical: 'https://findfinancepros.com/blog' },
  openGraph: {
    title: 'FindFinancePros Blog',
    description:
      'Guides and insights for business owners hiring finance professionals.',
    url: 'https://findfinancepros.com/blog',
    type: 'website',
  },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogIndexPage() {
  const posts = getSortedPosts();

  return (
    <>
      <Navbar />

      <section className="hero-gradient text-white py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-warm-300 font-body text-sm uppercase tracking-wider mb-2">
            <Link href="/" className="hover:text-white transition-colors">Home</Link> / Blog
          </p>
          <h1 className="font-display text-3xl md:text-5xl mb-3">
            Guides &amp; <span className="text-warm-300">Insights</span>
          </h1>
          <p className="text-white/80 font-body text-lg max-w-2xl">
            Practical writing for business owners and finance leaders — from hiring a fractional CFO to navigating FP&amp;A, controllership, and bookkeeping.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6">
          {posts.length > 0 ? (
            <div className="space-y-8">
              {posts.map((post) => {
                const category = blogCategories[post.category];
                return (
                  <article
                    key={post.slug}
                    className="bg-white border border-warm-100 rounded-xl p-6 md:p-8 hover:border-warm-300 transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-3 text-xs font-body text-brand-500 mb-3">
                      {category && (
                        <span className="inline-block bg-warm-100 text-brand-800 px-2.5 py-1 rounded uppercase tracking-wider font-medium">
                          {category.label}
                        </span>
                      )}
                      <span>{formatDate(post.date)}</span>
                      <span aria-hidden>·</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl text-brand-950 mb-3 leading-tight">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="hover:text-brand-700 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-brand-700 font-body leading-relaxed mb-4">
                      {post.metaDescription}
                    </p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-block text-sm font-medium text-brand-700 hover:text-brand-900 transition-colors"
                    >
                      Read article →
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="font-display text-2xl text-brand-950 mb-3">
                Posts coming soon
              </h2>
              <p className="text-brand-600 font-body">
                We&rsquo;re working on the first round of articles. Check back shortly.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
