import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfessionalCard from '@/components/ProfessionalCard';
import {
  getAllIndustries,
  getIndustryBySlug,
  getFirmsByIndustry,
  getAllCities,
  getAllServices,
} from '@/lib/data';
import Link from 'next/link';

export const revalidate = 3600;

export async function generateStaticParams() {
  const industries = await getAllIndustries();
  return industries.map((ind) => ({ slug: ind.slug }));
}

export async function generateMetadata({ params }) {
  const industry = await getIndustryBySlug(params.slug);
  if (!industry) return {};

  return {
    title: `Finance Firms for ${industry.label}`,
    description: `${industry.description} Browse verified finance professionals serving the ${industry.label.toLowerCase()} industry across Canada and the United States.`,
  };
}

export default async function IndustryPage({ params }) {
  const [industry, pros, services, cities] = await Promise.all([
    getIndustryBySlug(params.slug),
    getFirmsByIndustry(params.slug),
    getAllServices(),
    getAllCities(),
  ]);
  if (!industry) return notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Finance Professionals for ${industry.label}`,
    description: industry.description,
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
      <Navbar />

      <section className="hero-gradient text-white py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-warm-300 font-body text-sm uppercase tracking-wider mb-2">
            <Link href="/" className="hover:text-white transition-colors">Home</Link> / Industries
          </p>
          <h1 className="font-display text-3xl md:text-5xl mb-3">
            Finance Firms for <span className="text-warm-300">{industry.label}</span>
          </h1>
          <p className="text-white/80 font-body text-lg max-w-2xl">
            {industry.description}
          </p>
          <p className="text-white/60 font-body text-sm mt-3">
            {pros.length} professional{pros.length !== 1 ? 's' : ''} listed
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
              <h2 className="font-display text-2xl text-brand-950 mb-3">
                No {industry.label.toLowerCase()} professionals listed yet
              </h2>
              <p className="text-brand-600 font-body mb-6">
                Do you serve the {industry.label.toLowerCase()} industry? Be the first to list your practice.
              </p>
              <a
                href={`mailto:fahad@findfinancepros.com?subject=List%20My%20Practice%20-%20${industry.label}`}
                className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
              >
                List Your Practice
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Browse by Service — internal linking */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-2xl text-brand-950 mb-6">
            Related Services
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/service/${service.slug}`}
                className="bg-warm-50 rounded-lg px-5 py-3 border border-warm-100 hover:border-warm-300 transition-all text-sm font-medium text-brand-800"
              >
                {service.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by City — internal linking */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-2xl text-brand-950 mb-6">
            Find {industry.label} Firms by City
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={`/city/${city.slug}`}
                className="bg-warm-50 rounded-lg px-5 py-3 border border-warm-100 hover:border-warm-300 transition-all text-sm font-medium text-brand-800"
              >
                {city.label}
                <span className="text-brand-400 ml-1 text-xs">{city.province}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
