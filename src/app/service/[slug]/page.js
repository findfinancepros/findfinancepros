import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FirmGrid from '@/components/FirmGrid';
import {
  getAllServices,
  getServiceBySlug,
  getFirmsByService,
  getAllCities,
  getCityServiceCombinations,
} from '@/lib/data';
import Link from 'next/link';
import { CategoryPageViewTracker } from '@/components/AnalyticsTracker';

export const revalidate = 3600;

export async function generateStaticParams() {
  const services = await getAllServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const service = await getServiceBySlug(params.slug);
  if (!service) return {};

  return {
    title: `${service.label} Services — Find ${service.label} Professionals`,
    description: `${service.description} Browse verified ${service.label.toLowerCase()} professionals across Canada and the United States.`,
    alternates: { canonical: `/service/${service.slug}` },
  };
}

export default async function ServicePage({ params }) {
  const [service, pros, cities, { byService }] = await Promise.all([
    getServiceBySlug(params.slug),
    getFirmsByService(params.slug),
    getAllCities(),
    getCityServiceCombinations(),
  ]);
  if (!service) return notFound();

  const citySet = byService.get(service.slug) || new Set();
  const citiesForService = cities.filter((c) => citySet.has(c.slug));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${service.label} Professionals`,
    description: service.description,
    numberOfItems: pros.length,
    itemListElement: pros.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'ProfessionalService',
        name: p.name,
        description: p.description,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryPageViewTracker type="service" slug={service.slug} />
      <Navbar />

      <section className="hero-gradient text-white py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-warm-300 font-body text-sm uppercase tracking-wider mb-2">
            <Link href="/" className="hover:text-white transition-colors">Home</Link> / Services
          </p>
          <h1 className="font-display text-3xl md:text-5xl mb-3">
            <span className="text-warm-300">{service.label}</span> Professionals
          </h1>
          <p className="text-white/80 font-body text-lg max-w-2xl">
            {service.description}
          </p>
          <p className="text-white/60 font-body text-sm mt-3">
            {pros.length} professional{pros.length !== 1 ? 's' : ''} listed
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          {pros.length > 0 ? (
            <FirmGrid pros={pros} />
          ) : (
            <div className="text-center py-16">
              <h2 className="font-display text-2xl text-brand-950 mb-3">
                No {service.label.toLowerCase()} professionals listed yet
              </h2>
              <p className="text-brand-600 font-body mb-6">
                Do you offer {service.label.toLowerCase()} services? Be the first to list your practice.
              </p>
              <a
                href={`mailto:fahad@findfinancepros.com?subject=List%20My%20Practice%20-%20${service.label}`}
                className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
              >
                List Your Practice
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Browse by city for this service — internal linking */}
      {citiesForService.length > 0 && (
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="font-display text-2xl text-brand-950 mb-6">
              Find {service.label} by City
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {citiesForService.map((city) => (
                <Link
                  key={city.slug}
                  href={`/city/${city.slug}/${service.slug}`}
                  className="bg-warm-50 rounded-lg px-5 py-3 border border-warm-100 hover:border-warm-300 transition-all text-sm font-medium text-brand-800"
                >
                  {city.label}
                  <span className="text-brand-400 ml-1 text-xs">{city.province}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
