import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SubmitFirmForm from '@/components/SubmitFirmForm';
import { getAllServices, getAllIndustries } from '@/lib/data';

export const revalidate = 3600;

export const metadata = {
  title: 'List Your Firm — FindFinancePros',
  description:
    'List your accounting firm on FindFinancePros and add your finance firm to a directory covering fractional CFOs, FP&A consultants, controllers, and bookkeepers across the United States and Canada. Free to list.',
  alternates: { canonical: '/submit' },
};

export default async function SubmitPage() {
  const [services, industries] = await Promise.all([getAllServices(), getAllIndustries()]);

  return (
    <>
      <Navbar />

      <section className="hero-gradient text-white py-14 md:py-20">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-warm-300 font-body text-sm uppercase tracking-wider mb-2">
            <Link href="/" className="hover:text-white transition-colors">Home</Link> / List Your Firm
          </p>
          <h1 className="font-display text-3xl md:text-5xl mb-3">
            List Your <span className="text-warm-300">Firm</span>
          </h1>
          <p className="text-white/80 font-body text-lg">
            Add your finance firm to the largest directory of finance professionals in the United States and Canada. Free to list.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-6">
          <SubmitFirmForm services={services} industries={industries} />
        </div>
      </section>

      <Footer />
    </>
  );
}
