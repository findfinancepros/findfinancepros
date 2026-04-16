import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAllFirms, getFirmBySlug, getCityServiceCombinations } from '@/lib/data';
import Link from 'next/link';

export const revalidate = 3600;

export async function generateStaticParams() {
  const firms = await getAllFirms();
  return firms.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const pro = await getFirmBySlug(params.slug);
  if (!pro) return {};

  return {
    title: `${pro.name} — ${pro.cityLabel}, ${pro.province}`,
    description: pro.description,
    alternates: { canonical: `/professional/${pro.slug}` },
  };
}

export default async function ProfessionalPage({ params }) {
  const [pro, { byCity }] = await Promise.all([
    getFirmBySlug(params.slug),
    getCityServiceCombinations(),
  ]);
  if (!pro) return notFound();

  const serviceLabels = pro.serviceLabels || [];
  const cityServices = byCity.get(pro.city) || new Set();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: pro.name,
    description: pro.description,
    areaServed: {
      '@type': 'City',
      name: pro.cityLabel,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: pro.province,
      },
    },
    url: pro.website,
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
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            {' / '}
            <Link href={`/city/${pro.city}`} className="hover:text-white transition-colors">{pro.cityLabel}</Link>
          </p>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl mb-2">{pro.name}</h1>
              <p className="text-warm-300 font-body text-lg">{pro.contact} · {pro.title}</p>
              <p className="text-white/70 font-body mt-1">
                {pro.cityLabel}, {pro.province} · {pro.country}
              </p>
            </div>
            {pro.featured && (
              <span className="bg-warm-500 text-white text-sm font-medium px-4 py-2 rounded-full">
                Featured Professional
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl p-8 border border-brand-100">
                <h2 className="font-display text-2xl text-brand-950 mb-4">About</h2>
                <p className="text-brand-800 font-body leading-relaxed text-base">
                  {pro.description}
                </p>

                <h3 className="font-display text-xl text-brand-950 mt-8 mb-4">Services</h3>
                <div className="flex flex-wrap gap-2">
                  {serviceLabels.map((s) => {
                    const href = cityServices.has(s.slug)
                      ? `/city/${pro.city}/${s.slug}`
                      : `/service/${s.slug}`;
                    return (
                      <Link
                        key={s.slug}
                        href={href}
                        className="text-sm bg-brand-50 text-brand-700 px-4 py-2 rounded-full border border-brand-100 hover:border-brand-300 transition-colors"
                      >
                        {s.label}
                      </Link>
                    );
                  })}
                </div>

                <h3 className="font-display text-xl text-brand-950 mt-8 mb-4">Industries Served</h3>
                <div className="flex flex-wrap gap-2">
                  {pro.industries.map((industry) => (
                    <span
                      key={industry}
                      className="text-sm bg-warm-50 text-warm-700 px-4 py-2 rounded-full border border-warm-100 capitalize"
                    >
                      {industry.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-brand-100">
                <h3 className="font-display text-lg text-brand-950 mb-4">Get in Touch</h3>
                <div className="space-y-3">
                  {pro.website && pro.website !== 'https://example.com' && (
                    <a
                      href={pro.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-brand-600 hover:bg-brand-700 text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm"
                    >
                      Visit Website
                    </a>
                  )}
                  {pro.linkedin && (
                    <a
                      href={pro.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-midnight-700 hover:bg-midnight-800 text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm"
                    >
                      LinkedIn Profile
                    </a>
                  )}
                  <Link
                    href={`/get-matched?firm=${encodeURIComponent(pro.slug)}`}
                    className="block w-full text-center bg-warm-500 hover:bg-warm-600 text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm"
                  >
                    Request Introduction
                  </Link>
                </div>
              </div>

              <div className="bg-warm-50 rounded-xl p-6 border border-warm-100">
                <h3 className="font-display text-lg text-brand-950 mb-2">Location</h3>
                <p className="text-brand-700 font-body text-sm">
                  {pro.cityLabel}, {pro.province}
                </p>
                <p className="text-brand-500 font-body text-sm">{pro.country}</p>
                <Link
                  href={`/city/${pro.city}`}
                  className="text-brand-600 hover:text-brand-700 font-medium text-sm mt-3 inline-block"
                >
                  View all professionals in {pro.cityLabel} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
