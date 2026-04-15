import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FirmGrid from '@/components/FirmGrid';
import {
  getCityBySlug,
  getServiceBySlug,
  getFirmsByCityAndService,
  getCityServiceCombinations,
  getAllCities,
  getAllServices,
} from '@/lib/data';
import Link from 'next/link';

export const revalidate = 3600;

export async function generateStaticParams() {
  const { combos } = await getCityServiceCombinations();
  return combos.map((c) => ({ city: c.citySlug, service: c.serviceSlug }));
}

export async function generateMetadata({ params }) {
  const [city, service] = await Promise.all([
    getCityBySlug(params.city),
    getServiceBySlug(params.service),
  ]);
  if (!city || !service) return {};

  return {
    title: `${service.label} in ${city.label}, ${city.province}`,
    description: `Find verified ${service.label.toLowerCase()} professionals in ${city.label}, ${city.province}. Browse firms offering ${service.label.toLowerCase()} services.`,
  };
}

export default async function CityServicePage({ params }) {
  const [city, service, pros, { byCity, byService }, allCities, allServices] =
    await Promise.all([
      getCityBySlug(params.city),
      getServiceBySlug(params.service),
      getFirmsByCityAndService(params.city, params.service),
      getCityServiceCombinations(),
      getAllCities(),
      getAllServices(),
    ]);
  if (!city || !service) return notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${service.label} in ${city.label}`,
    description: `Directory of ${service.label.toLowerCase()} professionals in ${city.label}, ${city.province}`,
    numberOfItems: pros.length,
    itemListElement: pros.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'ProfessionalService',
        name: p.name,
        description: p.description,
        areaServed: { '@type': 'City', name: city.label },
      },
    })),
  };

  const serviceMap = new Map(allServices.map((s) => [s.slug, s]));
  const cityMap = new Map(allCities.map((c) => [c.slug, c]));

  const otherServicesInCity = Array.from(byCity.get(city.slug) || [])
    .filter((slug) => slug !== service.slug && serviceMap.has(slug))
    .map((slug) => serviceMap.get(slug))
    .sort((a, b) => a.label.localeCompare(b.label));

  const otherCitiesForService = Array.from(byService.get(service.slug) || [])
    .filter((slug) => slug !== city.slug && cityMap.has(slug))
    .map((slug) => cityMap.get(slug))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <section className="hero-gradient text-white py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-warm-300 font-body text-sm uppercase tracking-wider mb-2">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            {' / '}
            <Link href="/cities" className="hover:text-white transition-colors">Cities</Link>
            {' / '}
            <Link href={`/city/${city.slug}`} className="hover:text-white transition-colors">{city.label}</Link>
            {' / '}
            <span>{service.label}</span>
          </p>
          <h1 className="font-display text-3xl md:text-5xl mb-3">
            <span className="text-warm-300">{service.label}</span> in {city.label}
          </h1>
          <p className="text-white/80 font-body text-lg">
            {city.province}, {city.country} · {pros.length} professional{pros.length !== 1 ? 's' : ''} listed
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
                No {service.label.toLowerCase()} professionals in {city.label} yet
              </h2>
              <p className="text-brand-600 font-body mb-6">
                Do you offer {service.label.toLowerCase()} services in {city.label}? Be the first to list your practice.
              </p>
              <a
                href={`mailto:fahad@findfinancepros.com?subject=List%20My%20Practice%20-%20${encodeURIComponent(service.label)}%20in%20${encodeURIComponent(city.label)}`}
                className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
              >
                List Your Practice
              </a>
            </div>
          )}
        </div>
      </section>

      {(otherServicesInCity.length > 0 || otherCitiesForService.length > 0) && (
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-6 space-y-12">
            {otherServicesInCity.length > 0 && (
              <div>
                <h2 className="font-display text-2xl text-brand-950 mb-6">
                  Other services in {city.label}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {otherServicesInCity.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/city/${city.slug}/${s.slug}`}
                      className="bg-warm-50 rounded-lg px-5 py-3 border border-warm-100 hover:border-warm-300 transition-all text-sm font-medium text-brand-800"
                    >
                      {s.label}
                      <span className="text-brand-400 ml-1 text-xs">in {city.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {otherCitiesForService.length > 0 && (
              <div>
                <h2 className="font-display text-2xl text-brand-950 mb-6">
                  {service.label} in other cities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {otherCitiesForService.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/city/${c.slug}/${service.slug}`}
                      className="bg-warm-50 rounded-lg px-5 py-3 border border-warm-100 hover:border-warm-300 transition-all text-sm font-medium text-brand-800"
                    >
                      {c.label}
                      <span className="text-brand-400 ml-1 text-xs">{c.province}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
