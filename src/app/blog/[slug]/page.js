import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  blogCategories,
  getAllServices,
  getAllCities,
  getAllIndustries,
} from '@/lib/data';

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) return {};
  const url = `https://www.findfinancepros.com/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.metaDescription,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function BlogPostPage({ params }) {
  const [post, services, cities, industries] = await Promise.all([
    getBlogPostBySlug(params.slug),
    getAllServices(),
    getAllCities(),
    getAllIndustries(),
  ]);
  if (!post) return notFound();

  const category = blogCategories[post.category];
  const url = `https://www.findfinancepros.com/blog/${post.slug}`;

  const relatedServices = (post.relatedServices || [])
    .map((slug) => services.find((s) => s.slug === slug))
    .filter(Boolean);
  const relatedCities = (post.relatedCities || [])
    .map((slug) => cities.find((c) => c.slug === slug))
    .filter(Boolean);
  const relatedIndustries = (post.relatedIndustries || [])
    .map((slug) => industries.find((i) => i.slug === slug))
    .filter(Boolean);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'FindFinancePros',
      url: 'https://www.findfinancepros.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: post.tags?.join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <section className="hero-gradient text-white py-14 md:py-20">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-warm-300 font-body text-sm uppercase tracking-wider mb-3">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            {' / '}
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            {' / '}
            <span className="text-white/70 normal-case tracking-normal">{post.title}</span>
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs font-body text-white/70 mb-4">
            {category && (
              <span className="inline-block bg-warm-500/20 text-warm-200 border border-warm-300/30 px-2.5 py-1 rounded uppercase tracking-wider font-medium">
                {category.label}
              </span>
            )}
            <span>{formatDate(post.date)}</span>
            <span aria-hidden>·</span>
            <span>{post.readTime}</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl mb-4 leading-tight">
            {post.title}
          </h1>
          <p className="text-white/80 font-body">
            By <span className="text-white">{post.author}</span>
            {post.authorTitle && <span className="text-white/60">, {post.authorTitle}</span>}
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <article
          className="max-w-2xl mx-auto px-6 font-body text-brand-900 text-lg leading-relaxed prose-article"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </section>

      {(relatedServices.length > 0 || relatedCities.length > 0 || relatedIndustries.length > 0) && (
        <section className="py-12 md:py-16 bg-white border-t border-warm-100">
          <div className="max-w-4xl mx-auto px-6 space-y-10">
            {relatedServices.length > 0 && (
              <div>
                <h2 className="font-display text-2xl text-brand-950 mb-4">Related Services</h2>
                <div className="flex flex-wrap gap-3">
                  {relatedServices.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/service/${s.slug}`}
                      className="bg-warm-50 rounded-lg px-5 py-3 border border-warm-100 hover:border-warm-300 transition-all text-sm font-medium text-brand-800"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {relatedCities.length > 0 && (
              <div>
                <h2 className="font-display text-2xl text-brand-950 mb-4">Related Cities</h2>
                <div className="flex flex-wrap gap-3">
                  {relatedCities.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/city/${c.slug}`}
                      className="bg-warm-50 rounded-lg px-5 py-3 border border-warm-100 hover:border-warm-300 transition-all text-sm font-medium text-brand-800"
                    >
                      {c.label}
                      {c.province && <span className="text-brand-400 ml-1 text-xs">{c.province}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {relatedIndustries.length > 0 && (
              <div>
                <h2 className="font-display text-2xl text-brand-950 mb-4">Related Industries</h2>
                <div className="flex flex-wrap gap-3">
                  {relatedIndustries.map((i) => (
                    <Link
                      key={i.slug}
                      href={`/industry/${i.slug}`}
                      className="bg-warm-50 rounded-lg px-5 py-3 border border-warm-100 hover:border-warm-300 transition-all text-sm font-medium text-brand-800"
                    >
                      {i.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="py-14 md:py-20 hero-gradient text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl mb-3">
            Find a <span className="text-warm-300">Finance Professional</span>
          </h2>
          <p className="text-white/80 font-body text-lg mb-6">
            Browse verified fractional CFOs, FP&amp;A consultants, controllers, and bookkeeping firms — or get matched with the right fit for your business.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/get-matched"
              className="bg-warm-500 hover:bg-warm-600 text-white font-medium px-8 py-3 rounded-lg transition-colors"
            >
              Get Matched
            </Link>
            <Link
              href="/#services"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-8 py-3 rounded-lg transition-colors"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
