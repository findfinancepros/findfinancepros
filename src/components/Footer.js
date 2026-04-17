import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-white/70 font-body">
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8">
          <div className="col-span-2 md:col-span-4">
            <h3 className="font-display text-lg text-white mb-3">
              Find<span className="text-warm-300">Finance</span>Pros
            </h3>
            <p className="text-sm leading-relaxed">
              The directory for fractional CFOs, FP&A consultants, controllers, and bookkeeping firms across the United States and Canada.
            </p>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-white font-medium mb-3 text-sm uppercase tracking-wider">Blog</h4>
            <div className="space-y-2 text-sm">
              <Link href="/blog" className="block text-warm-300 hover:text-warm-200 transition-colors">Read Our Blog →</Link>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-white font-medium mb-3 text-sm uppercase tracking-wider">Services</h4>
            <div className="space-y-2 text-sm">
              <Link href="/service/fractional-cfo" className="block hover:text-warm-300 transition-colors">Fractional CFO</Link>
              <Link href="/service/fpa-consulting" className="block hover:text-warm-300 transition-colors">FP&A Consulting</Link>
              <Link href="/service/controller-services" className="block hover:text-warm-300 transition-colors">Controller Services</Link>
              <Link href="/services" className="block text-warm-300 hover:text-warm-200 transition-colors">All Services →</Link>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-white font-medium mb-3 text-sm uppercase tracking-wider">Industries</h4>
            <div className="space-y-2 text-sm">
              <Link href="/industry/manufacturing" className="block hover:text-warm-300 transition-colors">Manufacturing</Link>
              <Link href="/industry/technology" className="block hover:text-warm-300 transition-colors">Technology</Link>
              <Link href="/industry/healthcare" className="block hover:text-warm-300 transition-colors">Healthcare</Link>
              <Link href="/industries" className="block text-warm-300 hover:text-warm-200 transition-colors">All Industries →</Link>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-white font-medium mb-3 text-sm uppercase tracking-wider">Top Cities</h4>
            <div className="space-y-2 text-sm">
              <Link href="/city/toronto" className="block hover:text-warm-300 transition-colors">Toronto</Link>
              <Link href="/city/new-york" className="block hover:text-warm-300 transition-colors">New York</Link>
              <Link href="/city/vancouver" className="block hover:text-warm-300 transition-colors">Vancouver</Link>
              <Link href="/cities" className="block text-warm-300 hover:text-warm-200 transition-colors">All Cities →</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-4 text-xs text-center">
          © {new Date().getFullYear()} FindFinancePros. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
