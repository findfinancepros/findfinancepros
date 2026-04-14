import { Suspense } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GetMatchedForm from '@/components/GetMatchedForm';
import { getAllServices, getAllCities } from '@/lib/data';

export const revalidate = 3600;

export const metadata = {
  title: 'Get Matched with a Finance Professional',
  description: 'Tell us about your business and we will match you with the right fractional CFO, FP&A consultant, controller, or bookkeeper. Free, no obligation.',
};

export default async function GetMatchedPage() {
  const [services, cities] = await Promise.all([getAllServices(), getAllCities()]);

  return (
    <>
      <Navbar />

      <section className="hero-gradient text-white py-14 md:py-20">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-warm-300 font-body text-sm uppercase tracking-wider mb-2">
            <Link href="/" className="hover:text-white transition-colors">Home</Link> / Get Matched
          </p>
          <h1 className="font-display text-3xl md:text-5xl mb-3">
            Get Matched with a <span className="text-warm-300">Finance Pro</span>
          </h1>
          <p className="text-white/80 font-body text-lg">
            Tell us about your business and we&rsquo;ll introduce you to the right finance professionals. Free, no obligation, no spam.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-6">
          <Suspense fallback={<div className="text-brand-500">Loading form...</div>}>
            <GetMatchedForm services={services} cities={cities} />
          </Suspense>
        </div>
      </section>

      <Footer />
    </>
  );
}
