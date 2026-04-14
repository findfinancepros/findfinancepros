import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfessionalCard from '@/components/ProfessionalCard';
import SearchBar from '@/components/SearchBar';
import {
  getAllFirms,
  getFeaturedFirms,
  getAllCities,
  getAllServices,
  getAllIndustries,
} from '@/lib/data';

export const revalidate = 3600;

export default async function Home() {
  const [featured, allFirms, cities, services, industries] = await Promise.all([
    getFeaturedFirms(),
    getAllFirms(),
    getAllCities(),
    getAllServices(),
    getAllIndustries(),
  ]);

  // Stats derived from active firms
  const firmCount = allFirms.length;
  const citySet = new Set(allFirms.map((f) => f.city).filter(Boolean));
  const countrySet = new Set(allFirms.map((f) => f.country).filter(Boolean));
  const cityCount = citySet.size;
  const countryCount = countrySet.size;

  // Firm counts per taxonomy slug
  const cityFirmCounts = allFirms.reduce((acc, f) => {
    if (f.city) acc[f.city] = (acc[f.city] || 0) + 1;
    return acc;
  }, {});
  const serviceFirmCounts = allFirms.reduce((acc, f) => {
    (f.services || []).forEach((s) => {
      acc[s] = (acc[s] || 0) + 1;
    });
    return acc;
  }, {});
  const industryFirmCounts = allFirms.reduce((acc, f) => {
    (f.industries || []).forEach((s) => {
      acc[s] = (acc[s] || 0) + 1;
    });
    return acc;
  }, {});

  // Top industries by firm count
  const topIndustries = [...industries]
    .sort((a, b) => (industryFirmCounts[b.slug] || 0) - (industryFirmCounts[a.slug] || 0))
    .slice(0, 8);

  // Top cities per country by firm count (6 each)
  const canadaCitiesTop = cities
    .filter((c) => c.country === 'Canada')
    .sort((a, b) => (cityFirmCounts[b.slug] || 0) - (cityFirmCounts[a.slug] || 0))
    .slice(0, 6);
  const usCitiesTop = cities
    .filter((c) => c.country === 'United States')
    .sort((a, b) => (cityFirmCounts[b.slug] || 0) - (cityFirmCounts[a.slug] || 0))
    .slice(0, 6);

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient text-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="font-display text-4xl md:text-6xl leading-tight mb-6 fade-in">
            Find the Right <span className="text-warm-300">Finance Professional</span> for Your Business
          </h1>
          <p className="font-body text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 fade-in stagger-1">
            Browse fractional CFOs, FP&A consultants, controllers, and bookkeeping firms across Canada and the United States.
          </p>
          <div className="max-w-xl mx-auto fade-in stagger-2">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-warm-50 border-y border-warm-100 py-8 md:py-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-4 md:gap-8 text-center">
            <div>
              <div className="font-display text-3xl md:text-5xl text-warm-600 mb-1">
                {firmCount}+
              </div>
              <div className="text-xs md:text-sm uppercase tracking-wider text-brand-600 font-medium">
                Finance Professionals
              </div>
            </div>
            <div className="border-x border-warm-200">
              <div className="font-display text-3xl md:text-5xl text-warm-600 mb-1">
                {cityCount}
              </div>
              <div className="text-xs md:text-sm uppercase tracking-wider text-brand-600 font-medium">
                {cityCount === 1 ? 'City' : 'Cities'}
              </div>
            </div>
            <div>
              <div className="font-display text-3xl md:text-5xl text-warm-600 mb-1">
                {countryCount}
              </div>
              <div className="text-xs md:text-sm uppercase tracking-wider text-brand-600 font-medium">
                {countryCount === 1 ? 'Country' : 'Countries'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Professionals */}
      {featured.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="font-display text-3xl text-brand-950 mb-2">Featured Professionals</h2>
            <p className="text-brand-600 font-body mb-8">Verified and highly rated finance experts</p>
            <div className="grid md:grid-cols-2 gap-6">
              {featured.map((pro) => (
                <ProfessionalCard key={pro.slug} pro={pro} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      <section id="services" className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-3xl text-brand-950 mb-2">Browse by Service</h2>
          <p className="text-brand-600 font-body mb-8">Find the right type of finance support for your business</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service) => {
              const count = serviceFirmCounts[service.slug] || 0;
              return (
                <Link
                  key={service.slug}
                  href={`/service/${service.slug}`}
                  className="group p-6 bg-warm-50 rounded-xl border border-warm-100 card-hover"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-display text-lg text-brand-950 group-hover:text-brand-600 transition-colors">
                      {service.label}
                    </h3>
                    <span className="text-xs font-medium text-warm-700 bg-white border border-warm-200 rounded-full px-2 py-0.5 whitespace-nowrap">
                      {count} firm{count === 1 ? '' : 's'}
                    </span>
                  </div>
                  <p className="text-sm text-brand-700 leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-3xl text-brand-950 mb-2">Browse by Industry</h2>
          <p className="text-brand-600 font-body mb-8">Find finance professionals with expertise in your sector</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topIndustries.map((industry) => {
              const count = industryFirmCounts[industry.slug] || 0;
              return (
                <Link
                  key={industry.slug}
                  href={`/industry/${industry.slug}`}
                  className="group p-6 bg-warm-50 rounded-xl border border-warm-100 card-hover"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-display text-lg text-brand-950 group-hover:text-brand-600 transition-colors">
                      {industry.label}
                    </h3>
                    <span className="text-xs font-medium text-warm-700 bg-white border border-warm-200 rounded-full px-2 py-0.5 whitespace-nowrap">
                      {count} firm{count === 1 ? '' : 's'}
                    </span>
                  </div>
                  <p className="text-sm text-brand-700 leading-relaxed line-clamp-3">
                    {industry.description}
                  </p>
                </Link>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/industries"
              className="inline-block text-brand-600 hover:text-brand-800 font-medium text-sm"
            >
              View All Industries →
            </Link>
          </div>
        </div>
      </section>

      {/* Cities */}
      <section id="cities" className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-3xl text-brand-950 mb-2">Browse by City</h2>
          <p className="text-brand-600 font-body mb-8">Finance professionals in major markets across North America</p>

          <div className="mb-8">
            <h3 className="text-sm uppercase tracking-wider text-brand-500 font-medium mb-4">Canada</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {canadaCitiesTop.map((city) => {
                const count = cityFirmCounts[city.slug] || 0;
                return (
                  <Link
                    key={city.slug}
                    href={`/city/${city.slug}`}
                    className="bg-white rounded-lg px-5 py-3 border border-brand-100 hover:border-brand-300 hover:shadow-md transition-all text-sm font-medium text-brand-800 flex items-center justify-between gap-2"
                  >
                    <span>
                      {city.label}
                      <span className="text-brand-400 ml-1 text-xs">{city.province}</span>
                    </span>
                    <span className="text-xs text-warm-600 font-semibold">{count}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm uppercase tracking-wider text-brand-500 font-medium mb-4">United States</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {usCitiesTop.map((city) => {
                const count = cityFirmCounts[city.slug] || 0;
                return (
                  <Link
                    key={city.slug}
                    href={`/city/${city.slug}`}
                    className="bg-white rounded-lg px-5 py-3 border border-brand-100 hover:border-brand-300 hover:shadow-md transition-all text-sm font-medium text-brand-800 flex items-center justify-between gap-2"
                  >
                    <span>
                      {city.label}
                      <span className="text-brand-400 ml-1 text-xs">{city.province}</span>
                    </span>
                    <span className="text-xs text-warm-600 font-semibold">{count}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/cities"
              className="inline-block text-brand-600 hover:text-brand-800 font-medium text-sm"
            >
              View All Cities →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA / Contact */}
      <section id="contact" className="py-16 md:py-20 hero-gradient text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl mb-4">
            Need Help Finding the Right <span className="text-warm-300">Finance Professional</span>?
          </h2>
          <p className="text-white/80 font-body mb-8 text-lg">
            Tell us about your business and we will match you with the right expert. Free, no obligation.
          </p>
          <Link
            href="/get-matched"
            className="inline-block bg-warm-500 hover:bg-warm-600 text-white font-medium px-10 py-4 rounded-lg transition-colors text-base"
          >
            Get Matched
          </Link>
        </div>
      </section>

      {/* Are You a Finance Professional? */}
      <section className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl text-brand-950 mb-4">Are You a Finance Professional?</h2>
          <p className="text-brand-700 font-body mb-8 text-lg leading-relaxed">
            Join the FindFinancePros directory and get discovered by business owners looking for exactly your expertise. Free basic listing included.
          </p>
          <a
            href="mailto:fahad@findfinancepros.com?subject=List%20My%20Practice"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-medium px-10 py-4 rounded-lg transition-colors text-base"
          >
            List Your Practice
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
