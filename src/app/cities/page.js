import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAllCities, getAllFirms } from '@/lib/data';

export const revalidate = 3600;

export const metadata = {
  title: 'All Cities — Browse Finance Professionals by Location',
  description:
    'Browse finance professionals across every city we cover in the United States and Canada. Fractional CFOs, FP&A consultants, controllers, and bookkeeping firms organized by province and state.',
  alternates: { canonical: '/cities' },
};

export default async function CitiesPage() {
  const [cities, allFirms] = await Promise.all([getAllCities(), getAllFirms()]);

  const cityFirmCounts = allFirms.reduce((acc, f) => {
    if (f.city) acc[f.city] = (acc[f.city] || 0) + 1;
    return acc;
  }, {});

  // Group: country -> province -> cities[]
  const grouped = cities.reduce((acc, c) => {
    const country = c.country || 'Other';
    const province = c.province || 'Other';
    acc[country] = acc[country] || {};
    acc[country][province] = acc[country][province] || [];
    acc[country][province].push(c);
    return acc;
  }, {});

  const countryOrder = ['Canada', 'United States'];
  const orderedCountries = [
    ...countryOrder.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !countryOrder.includes(c)),
  ];

  return (
    <>
      <Navbar />

      <section className="hero-gradient text-white py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-warm-300 font-body text-sm uppercase tracking-wider mb-2">
            <Link href="/" className="hover:text-white transition-colors">Home</Link> / Cities
          </p>
          <h1 className="font-display text-3xl md:text-5xl mb-3">
            All <span className="text-warm-300">Cities</span>
          </h1>
          <p className="text-white/80 font-body text-lg">
            Finance professionals across {cities.length} cities in the United States and Canada
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          {orderedCountries.map((country) => {
            const provinces = grouped[country];
            const provinceNames = Object.keys(provinces).sort();
            return (
              <div key={country}>
                <h2 className="font-display text-2xl md:text-3xl text-brand-950 mb-6 border-b border-warm-200 pb-3">
                  {country}
                </h2>
                <div className="space-y-8">
                  {provinceNames.map((province) => {
                    const provinceCities = [...provinces[province]].sort((a, b) =>
                      a.label.localeCompare(b.label)
                    );
                    return (
                      <div key={province}>
                        <h3 className="text-sm uppercase tracking-wider text-brand-500 font-medium mb-3">
                          {province}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {provinceCities.map((city) => {
                            const count = cityFirmCounts[city.slug] || 0;
                            return (
                              <Link
                                key={city.slug}
                                href={`/city/${city.slug}`}
                                className="bg-white rounded-lg px-5 py-3 border border-brand-100 hover:border-brand-300 hover:shadow-md transition-all text-sm font-medium text-brand-800 flex items-center justify-between gap-2"
                              >
                                <span>{city.label}</span>
                                <span className="text-xs text-warm-600 font-semibold">{count}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </>
  );
}
