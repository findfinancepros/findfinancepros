import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FirmGrid from '@/components/FirmGrid';
import { getAllFirms } from '@/lib/data';
import { CategoryPageViewTracker } from '@/components/AnalyticsTracker';

export const revalidate = 3600;

export const metadata = {
  title: 'Browse All Firms — FindFinancePros',
  description:
    'Browse the complete finance firms directory — fractional CFOs, FP&A consultants, controllers, and bookkeeping firms across the United States and Canada.',
  alternates: { canonical: '/firms' },
};

export default async function FirmsPage() {
  const pros = await getAllFirms();

  return (
    <>
      <CategoryPageViewTracker type="all_firms" slug="all" />
      <Navbar />

      <section className="hero-gradient text-white py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-warm-300 font-body text-sm uppercase tracking-wider mb-2">
            <Link href="/" className="hover:text-white transition-colors">Home</Link> / All Firms
          </p>
          <h1 className="font-display text-3xl md:text-5xl mb-3">
            Browse All <span className="text-warm-300">Firms</span>
          </h1>
          <p className="text-white/80 font-body text-lg">
            Explore all finance professionals listed in our directory across the United States and Canada.
          </p>
          <p className="text-white/60 font-body text-sm mt-3">
            {pros.length.toLocaleString()} firm{pros.length !== 1 ? 's' : ''} listed
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <FirmGrid pros={pros} />
        </div>
      </section>

      <Footer />
    </>
  );
}
