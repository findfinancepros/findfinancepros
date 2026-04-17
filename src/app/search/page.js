import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfessionalCard from '@/components/ProfessionalCard';
import Pagination, { getPaginationSlice } from '@/components/Pagination';
import SearchBar from '@/components/SearchBar';
import { searchFirms } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Search Finance Professionals',
  description: 'Search fractional CFOs, FP&A consultants, controllers, and bookkeeping firms across the United States and Canada.',
  alternates: { canonical: '/search' },
};

export default async function SearchPage({ searchParams }) {
  const q = (searchParams?.q || '').trim();
  const results = q ? await searchFirms(q) : [];

  const basePath = '/search';
  const {
    slice: pageItems,
    currentPage,
    totalPages,
    total,
    start,
    end,
  } = getPaginationSlice(results, searchParams?.page, 12);
  const extraParams = q ? { q } : {};
  const buildUrl = (p) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const prevUrl = currentPage > 1 ? buildUrl(currentPage - 1) : null;
  const nextUrl = currentPage < totalPages ? buildUrl(currentPage + 1) : null;

  return (
    <>
      {prevUrl && <link rel="prev" href={prevUrl} />}
      {nextUrl && <link rel="next" href={nextUrl} />}
      <Navbar />

      <section className="hero-gradient text-white py-14 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-warm-300 font-body text-sm uppercase tracking-wider mb-2">
            <Link href="/" className="hover:text-white transition-colors">Home</Link> / Search
          </p>
          <h1 className="font-display text-3xl md:text-5xl mb-6">
            Search <span className="text-warm-300">Finance Professionals</span>
          </h1>
          <SearchBar />
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          {q ? (
            <>
              <p className="text-brand-600 font-body mb-8">
                {total > 0 ? (
                  <>
                    Showing {start + 1}-{end} of {total} professional
                    {total !== 1 ? 's' : ''} for &ldquo;{q}&rdquo;
                  </>
                ) : (
                  <>0 results for &ldquo;{q}&rdquo;</>
                )}
              </p>
              {results.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    {pageItems.map((pro) => (
                      <ProfessionalCard key={pro.slug} pro={pro} />
                    ))}
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    basePath={basePath}
                    extraParams={extraParams}
                  />
                </>
              ) : (
                <div className="text-center py-16">
                  <h2 className="font-display text-2xl text-brand-950 mb-3">
                    No matches for &ldquo;{q}&rdquo;
                  </h2>
                  <p className="text-brand-600 font-body mb-6">
                    Try a different search, browse by city or service, or let us help you find the right match.
                  </p>
                  <Link
                    href="/get-matched"
                    className="inline-block bg-warm-500 hover:bg-warm-600 text-white font-medium px-8 py-3 rounded-lg transition-colors"
                  >
                    Get Matched
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-brand-600 font-body">
              Type a firm name, city, or keyword to begin.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
