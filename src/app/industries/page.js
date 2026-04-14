import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAllIndustries, getAllFirms } from '@/lib/data';

export const revalidate = 3600;

export const metadata = {
  title: 'All Industries — Browse Finance Professionals by Sector',
  description:
    'Browse finance professionals by industry expertise. Find fractional CFOs, FP&A consultants, controllers, and bookkeeping firms with experience in your sector.',
  alternates: { canonical: '/industries' },
};

export default async function IndustriesPage() {
  const [industries, allFirms] = await Promise.all([getAllIndustries(), getAllFirms()]);

  const industryFirmCounts = allFirms.reduce((acc, f) => {
    (f.industries || []).forEach((s) => {
      acc[s] = (acc[s] || 0) + 1;
    });
    return acc;
  }, {});

  const sorted = [...industries].sort(
    (a, b) => (industryFirmCounts[b.slug] || 0) - (industryFirmCounts[a.slug] || 0)
  );

  return (
    <>
      <Navbar />

      <section className="hero-gradient text-white py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-warm-300 font-body text-sm uppercase tracking-wider mb-2">
            <Link href="/" className="hover:text-white transition-colors">Home</Link> / Industries
          </p>
          <h1 className="font-display text-3xl md:text-5xl mb-3">
            All <span className="text-warm-300">Industries</span>
          </h1>
          <p className="text-white/80 font-body text-lg">
            {industries.length} industries with finance experts on FindFinancePros
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((industry) => {
              const count = industryFirmCounts[industry.slug] || 0;
              return (
                <Link
                  key={industry.slug}
                  href={`/industry/${industry.slug}`}
                  className="group p-6 bg-warm-50 rounded-xl border border-warm-100 card-hover"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h2 className="font-display text-lg text-brand-950 group-hover:text-brand-600 transition-colors">
                      {industry.label}
                    </h2>
                    <span className="text-xs font-medium text-warm-700 bg-white border border-warm-200 rounded-full px-2 py-0.5 whitespace-nowrap">
                      {count} firm{count === 1 ? '' : 's'}
                    </span>
                  </div>
                  <p className="text-sm text-brand-700 leading-relaxed">
                    {industry.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
