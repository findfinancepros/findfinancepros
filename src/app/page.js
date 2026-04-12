import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfessionalCard from '@/components/ProfessionalCard';
import { professionals, cities, services } from '@/data/directory';

export default function Home() {
  const featured = professionals.filter((p) => p.featured);
  const recent = professionals.filter((p) => !p.featured).slice(0, 4);

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient text-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="font-display text-4xl md:text-6xl leading-tight mb-6 fade-in">
            Find the Right <span className="text-warm-300">Finance Professional</span> for Your Business
          </h1>
          <p className="font-body text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 fade-in stagger-1">
            Browse fractional CFOs, FP&A consultants, controllers, and bookkeeping firms across Canada and the United States.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in stagger-2">
            <Link
              href="#services"
              className="bg-warm-500 hover:bg-warm-600 text-white font-medium px-8 py-3 rounded-lg transition-colors text-base"
            >
              Browse by Service
            </Link>
            <Link
              href="#cities"
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-8 py-3 rounded-lg transition-colors text-base backdrop-blur-sm border border-white/20"
            >
              Browse by City
            </Link>
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
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/service/${service.slug}`}
                className="group p-6 bg-warm-50 rounded-xl border border-warm-100 card-hover"
              >
                <h3 className="font-display text-lg text-brand-950 mb-2 group-hover:text-brand-600 transition-colors">
                  {service.label}
                </h3>
                <p className="text-sm text-brand-700 leading-relaxed line-clamp-3">
                  {service.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cities */}
      <section id="cities" className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-3xl text-brand-950 mb-2">Browse by City</h2>
          <p className="text-brand-600 font-body mb-8">Finance professionals in major markets across North America</p>

          <div className="mb-8">
            <h3 className="text-sm uppercase tracking-wider text-brand-500 font-medium mb-4">Canada</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {cities
                .filter((c) => c.country === 'Canada')
                .map((city) => (
                  <Link
                    key={city.slug}
                    href={`/city/${city.slug}`}
                    className="bg-white rounded-lg px-5 py-3 border border-brand-100 hover:border-brand-300 hover:shadow-md transition-all text-sm font-medium text-brand-800"
                  >
                    {city.label}
                    <span className="text-brand-400 ml-1 text-xs">{city.province}</span>
                  </Link>
                ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm uppercase tracking-wider text-brand-500 font-medium mb-4">United States</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {cities
                .filter((c) => c.country === 'United States')
                .map((city) => (
                  <Link
                    key={city.slug}
                    href={`/city/${city.slug}`}
                    className="bg-white rounded-lg px-5 py-3 border border-brand-100 hover:border-brand-300 hover:shadow-md transition-all text-sm font-medium text-brand-800"
                  >
                    {city.label}
                    <span className="text-brand-400 ml-1 text-xs">{city.province}</span>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-3xl text-brand-950 mb-2">Recently Added</h2>
          <p className="text-brand-600 font-body mb-8">New professionals joining the directory</p>
          <div className="grid md:grid-cols-2 gap-6">
            {recent.map((pro) => (
              <ProfessionalCard key={pro.slug} pro={pro} />
            ))}
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
          <a
            href="mailto:fahad@findfinancepros.com?subject=Get%20Matched%20Request"
            className="inline-block bg-warm-500 hover:bg-warm-600 text-white font-medium px-10 py-4 rounded-lg transition-colors text-base"
          >
            Contact Us to Get Matched
          </a>
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
