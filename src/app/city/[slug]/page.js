import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfessionalCard from '@/components/ProfessionalCard';
import {
  getAllCities,
  getCityBySlug,
  getFirmsByCity,
  getAllServices,
} from '@/lib/data';
import Link from 'next/link';

export const revalidate = 3600;

export async function generateStaticParams() {
  const cities = await getAllCities();
  return cities.map((city) => ({ slug: city.slug }));
}

export async function generateMetadata({ params }) {
  const city = await getCityBySlug(params.slug);
  if (!city) return {};

  return {
    title: `Finance Professionals in ${city.label}, ${city.province}`,
    description: `Find fractional CFOs, FP&A consultants, controllers, and bookkeeping firms in ${city.label}, ${city.province}. Browse verified finance professionals.`,
  };
}

export default async function CityPage({ params }) {
  const [city, pros, allServices] = await Promise.all([
    getCityBySlug(params.slug),
    getFirmsByCity(params.slug),
    getAllServices(),
  ]);
  if (!city) return notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Finance Professionals in ${city.label}`,
    description: `Directory of finance professionals in ${city.label}, ${city.province}`,
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
            <Link href="/" className="hover:text-white transition-colors">Home</Link> / Cities
          </p>
          <h1 className="font-display text-3xl md:text-5xl mb-3">
            Finance Professionals in <span className="text-warm-300">{city.label}</span>
          </h1>
          <p className="text-white/80 font-body text-lg">
            {city.province}, {city.country} · {pros.length} professional{pros.length !== 1 ? 's' : ''} listed
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          {pros.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {pros.map((pro) => (
                <ProfessionalCard key={pro.slug} pro={pro} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="font-display text-2xl text-brand-950 mb-3">No listings in {city.label} yet</h2>
              <p className="text-brand-600 font-body mb-6">
                Are you a finance professional in {city.label}? Be the first to list your practice.
              </p>
              <a
                href={`mailto:fahad@findfinancepros.com?subject=List%20My%20Practice%20-%20${encodeURIComponent(city.label)}`}
                className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
              >
                List Your Practice
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Related services section for internal linking */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-2xl text-brand-950 mb-6">
            Finance Services in {city.label}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {allServices.slice(0, 4).map((service) => (
              <Link
                key={service.slug}
                href={`/service/${service.slug}`}
                className="p-4 bg-warm-50 rounded-lg border border-warm-100 hover:border-warm-300 transition-all text-sm"
              >
                <span className="font-medium text-brand-800">{service.label}</span>
                <span className="text-brand-500 block mt-1">in {city.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
