import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogGrid from '@/components/BlogGrid';
import { getAllBlogPosts } from '@/lib/data';

export const revalidate = 3600;

export const metadata = {
  title: 'Blog — Guides & Insights for Finance Leaders',
  description:
    'Guides, insights, and comparisons to help business owners and finance leaders navigate fractional CFO services, FP&A, controllership, and bookkeeping.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'FindFinancePros Blog',
    description:
      'Guides and insights for business owners hiring finance professionals.',
    url: 'https://www.findfinancepros.com/blog',
    type: 'website',
  },
};

export default async function BlogIndexPage() {
  const posts = await getAllBlogPosts();

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
          <p className="text-white/80 font-body text-lg max-w-2xl mb-4">
            Useful guides for business owners, executives, and sponsors — from hiring a fractional CFO to understanding FP&amp;A, controllership, and bookkeeping.
          </p>
          <p className="text-warm-300 font-body text-sm uppercase tracking-wider">
            {posts.length} {posts.length === 1 ? 'article' : 'articles'}
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-warm-50/40">
        <div className="max-w-6xl mx-auto px-6">
          {posts.length > 0 ? (
            <BlogGrid posts={posts} />
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
