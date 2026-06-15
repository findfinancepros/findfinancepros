import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAllFirms, getFirmBySlug, getFirmsByCity, getCityServiceCombinations } from '@/lib/data';
import { industries as allIndustries } from '@/data/directory';
import Link from 'next/link';
import {
  FirmProfileViewTracker,
  ContactLink,
} from '@/components/AnalyticsTracker';
import FirmInquiryForm from '@/components/FirmInquiryForm';

export const revalidate = 3600;

export async function generateStaticParams() {
  const firms = await getAllFirms();
  return firms.map((p) => ({ slug: p.slug }));
}

const industryLabel = (slug) =>
  allIndustries.find((i) => i.slug === slug)?.label || slug.replace(/-/g, ' ');

export async function generateMetadata({ params }) {
  const pro = await getFirmBySlug(params.slug);
  if (!pro) return {};

  const svc = (pro.serviceLabels || []).slice(0, 3).map((s) => s.label).join(', ');
  const title = svc
    ? `${pro.name} — ${svc} in ${pro.cityLabel}, ${pro.province}`
    : `${pro.name} — ${pro.cityLabel}, ${pro.province}`;
  const base = pro.tagline ? `${pro.tagline}. ` : '';
  const description = `${base}${pro.longDescription || pro.description || ''}`
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 158);

  return {
    title,
    description,
    alternates: { canonical: `/professional/${pro.slug}` },
    openGraph: {
      title,
      description,
      url: `/professional/${pro.slug}`,
      type: 'profile',
      siteName: 'Find Finance Pros',
      ...(pro.logoUrl ? { images: [{ url: pro.logoUrl }] } : {}),
    },
    twitter: { card: 'summary', title, description },
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
  const aboutParas = (pro.longDescription || pro.description || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Related firms in the same city for internal linking / crawl depth.
  const cityFirms = await getFirmsByCity(pro.city);
  const relatedFirms = cityFirms
    .filter((f) => f.slug !== pro.slug)
    .slice(0, 5);

  // Team members can occasionally be missing a name in the source data; drop those.
  const team = (pro.team || []).filter((m) => m && typeof m.name === 'string' && m.name.trim());

  const serviceHref = (slug) =>
    cityServices.has(slug) ? `/city/${pro.city}/${slug}` : `/service/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `https://findfinancepros.com/professional/${pro.slug}#firm`,
    name: pro.name,
    description: pro.longDescription || pro.description,
    url: pro.website,
    ...(pro.logoUrl ? { logo: pro.logoUrl, image: pro.logoUrl } : {}),
    ...(pro.email ? { email: pro.email } : {}),
    ...(pro.phone ? { telephone: pro.phone } : {}),
    ...(pro.yearFounded ? { foundingDate: String(pro.yearFounded) } : {}),
    ...(pro.languages?.length ? { knowsLanguage: pro.languages } : {}),
    ...(serviceLabels.length ? { knowsAbout: serviceLabels.map((s) => s.label) } : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality: pro.cityLabel,
      addressRegion: pro.province,
      addressCountry: pro.country,
    },
    areaServed: {
      '@type': 'City',
      name: pro.cityLabel,
      containedInPlace: { '@type': 'AdministrativeArea', name: pro.province },
    },
    ...(team.length
      ? { employee: team.map((m) => ({ '@type': 'Person', name: m.name, jobTitle: m.title || undefined })) }
      : {}),
    ...(serviceLabels.length
      ? {
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: `${pro.name} Services`,
            itemListElement: serviceLabels.map((s) => ({
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: s.label },
            })),
          },
        }
      : {}),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://findfinancepros.com' },
      { '@type': 'ListItem', position: 2, name: pro.cityLabel, item: `https://findfinancepros.com/city/${pro.city}` },
      { '@type': 'ListItem', position: 3, name: pro.name },
    ],
  };

  const Stat = ({ label, value }) => (
    <div className="text-center md:text-left">
      <p className="font-display text-2xl text-brand-900">{value}</p>
      <p className="text-brand-500 text-xs uppercase tracking-wider">{label}</p>
    </div>
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <FirmProfileViewTracker
        name={pro.name}
        city={pro.cityLabel}
        services={serviceLabels.map((s) => s.slug)}
      />
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient text-white py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <nav aria-label="Breadcrumb" className="text-warm-300 font-body text-sm uppercase tracking-wider mb-3">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            {' / '}
            <Link href={`/city/${pro.city}`} className="hover:text-white transition-colors">{pro.cityLabel}</Link>
            {' / '}
            <span className="text-white/60">{pro.name}</span>
          </nav>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="max-w-3xl">
              <h1 className="font-display text-3xl md:text-5xl mb-3">{pro.name}</h1>
              {pro.tagline && (
                <p className="text-warm-200 font-body text-lg md:text-xl mb-3">{pro.tagline}</p>
              )}
              <p className="text-white/70 font-body">
                {pro.contact}{pro.title ? ` · ${pro.title}` : ''} · {pro.cityLabel}, {pro.province}, {pro.country}
              </p>
              {(pro.certifications?.length > 0 || pro.freeConsultation) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {pro.certifications.map((c) => (
                    <span key={c} className="bg-white/10 border border-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">{c}</span>
                  ))}
                  {pro.freeConsultation && (
                    <span className="bg-warm-500 text-white text-xs font-medium px-3 py-1 rounded-full">Free consultation</span>
                  )}
                </div>
              )}
            </div>
            {pro.featured && (
              <span className="bg-warm-500 text-white text-sm font-medium px-4 py-2 rounded-full">
                Featured Professional
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      {(pro.yearFounded || pro.teamSize || pro.serviceArea) && (
        <section className="bg-white border-b border-brand-100">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap gap-10 items-center justify-center md:justify-start">
            {pro.yearFounded && <Stat label="Founded" value={pro.yearFounded} />}
            {pro.teamSize && <Stat label="Team" value={`${pro.teamSize}+`} />}
            {serviceLabels.length > 0 && <Stat label="Services" value={serviceLabels.length} />}
            {pro.serviceArea && (
              <div className="text-center md:text-left">
                <p className="font-display text-base text-brand-900">{pro.serviceArea}</p>
                <p className="text-brand-500 text-xs uppercase tracking-wider">Service area</p>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="md:col-span-2 space-y-8">
              <div className="bg-white rounded-xl p-8 border border-brand-100">
                <h2 className="font-display text-2xl text-brand-950 mb-4">About {pro.name}</h2>
                <div className="space-y-4">
                  {aboutParas.map((para, i) => (
                    <p key={i} className="text-brand-800 font-body leading-relaxed text-base">{para}</p>
                  ))}
                </div>

                <h3 className="font-display text-xl text-brand-950 mt-8 mb-4">Services</h3>
                <div className="flex flex-wrap gap-2">
                  {serviceLabels.map((s) => (
                    <Link
                      key={s.slug}
                      href={serviceHref(s.slug)}
                      className="text-sm bg-brand-50 text-brand-700 px-4 py-2 rounded-full border border-brand-100 hover:border-brand-300 transition-colors"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>

                <h3 className="font-display text-xl text-brand-950 mt-8 mb-4">Industries Served</h3>
                <div className="flex flex-wrap gap-2">
                  {pro.industries.map((industry) => (
                    <Link
                      key={industry}
                      href={`/industry/${industry}`}
                      className="text-sm bg-warm-50 text-warm-700 px-4 py-2 rounded-full border border-warm-100 hover:border-warm-300 transition-colors capitalize"
                    >
                      {industryLabel(industry)}
                    </Link>
                  ))}
                </div>

                {pro.minEngagement && (
                  <>
                    <h3 className="font-display text-xl text-brand-950 mt-8 mb-3">Pricing</h3>
                    <p className="text-brand-800 font-body leading-relaxed">{pro.minEngagement}</p>
                  </>
                )}
              </div>

              {team.length > 0 && (
                <div className="bg-white rounded-xl p-8 border border-brand-100">
                  <h2 className="font-display text-2xl text-brand-950 mb-6">Team &amp; Leadership</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {team.map((m) => (
                      <div key={m.name} className="flex items-start gap-3 p-4 rounded-lg bg-brand-50/60 border border-brand-100">
                        <div className="w-11 h-11 rounded-full bg-brand-200 text-brand-800 flex items-center justify-center font-display text-lg shrink-0">
                          {m.name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-brand-950">{m.name}</p>
                          <p className="text-brand-600 text-sm">
                            {m.title}{m.credentials ? ` · ${m.credentials}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-brand-100">
                <h3 className="font-display text-lg text-brand-950 mb-4">Get in Touch</h3>
                <div className="space-y-3">
                  {pro.website && pro.website !== 'https://example.com' && (
                    <ContactLink
                      href={pro.website}
                      type="website"
                      firmName={pro.name}
                      outbound
                      outboundLocation="profile_page"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-brand-600 hover:bg-brand-700 text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm"
                    >
                      Visit Website
                    </ContactLink>
                  )}
                  {pro.phone && (
                    <ContactLink
                      href={`tel:${String(pro.phone).replace(/[^+\d]/g, '')}`}
                      type="phone"
                      firmName={pro.name}
                      className="block w-full text-center bg-brand-50 hover:bg-brand-100 text-brand-800 font-medium px-6 py-3 rounded-lg transition-colors text-sm border border-brand-100"
                    >
                      {pro.phone}
                    </ContactLink>
                  )}
                  {pro.email && (
                    <ContactLink
                      href={`mailto:${pro.email}`}
                      type="email"
                      firmName={pro.name}
                      className="block w-full text-center bg-warm-600 hover:bg-warm-700 text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm"
                    >
                      Email
                    </ContactLink>
                  )}
                  {pro.linkedin && (
                    <ContactLink
                      href={pro.linkedin}
                      type="linkedin"
                      firmName={pro.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-midnight-700 hover:bg-midnight-800 text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm"
                    >
                      LinkedIn Profile
                    </ContactLink>
                  )}
                  <FirmInquiryForm
                    firmName={pro.name}
                    firmSlug={pro.slug}
                    firmEmail={pro.email || null}
                    firmCity={pro.cityLabel}
                  />
                </div>
              </div>

              {(pro.certifications?.length > 0 || pro.languages?.length > 0 || pro.serviceArea) && (
                <div className="bg-white rounded-xl p-6 border border-brand-100 text-sm">
                  <h3 className="font-display text-lg text-brand-950 mb-3">At a Glance</h3>
                  {pro.certifications?.length > 0 && (
                    <p className="text-brand-700 mb-1"><span className="text-brand-500">Credentials:</span> {pro.certifications.join(', ')}</p>
                  )}
                  {pro.languages?.length > 0 && (
                    <p className="text-brand-700 mb-1"><span className="text-brand-500">Languages:</span> {pro.languages.join(', ')}</p>
                  )}
                  {pro.serviceArea && (
                    <p className="text-brand-700"><span className="text-brand-500">Serves:</span> {pro.serviceArea}</p>
                  )}
                </div>
              )}

              <div className="bg-warm-50 rounded-xl p-6 border border-warm-100">
                <h3 className="font-display text-lg text-brand-950 mb-2">Location</h3>
                <p className="text-brand-700 font-body text-sm">{pro.cityLabel}, {pro.province}</p>
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

          {/* Internal linking: related firms in the same city */}
          {relatedFirms.length > 0 && (
            <div className="mt-12 pt-8 border-t border-brand-100">
              <h2 className="font-display text-2xl text-brand-950 mb-6">Other finance professionals in {pro.cityLabel}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedFirms.map((f) => (
                  <Link
                    key={f.slug}
                    href={`/professional/${f.slug}`}
                    className="block bg-white rounded-xl p-5 border border-brand-100 hover:border-brand-300 transition-colors"
                  >
                    <p className="font-display text-lg text-brand-950">{f.name}</p>
                    {f.tagline && <p className="text-brand-600 text-sm mt-1 line-clamp-2">{f.tagline}</p>}
                    <p className="text-brand-400 text-xs mt-2 uppercase tracking-wider">{f.cityLabel}, {f.province}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
