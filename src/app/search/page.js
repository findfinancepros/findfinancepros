import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfessionalCard from '@/components/ProfessionalCard';
import SearchBar from '@/components/SearchBar';
import { searchFirms } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Search Finance Professionals',
  description: 'Search fractional CFOs, FP&A consultants, controllers, and bookkeeping firms across Canada and the United States.',
};

export default async function SearchPage({ searchParams }) {
  const q = (searchParams?.q || '').trim();
  const results = q ? await searchFirms(q) : [];

  return (
    <>
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
                {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{q}&rdquo;
              </p>
              {results.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {results.map((pro) => (
                    <ProfessionalCard key={pro.slug} pro={pro} />
                  ))}
                </div>
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
