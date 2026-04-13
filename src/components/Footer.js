import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-white/70 font-body">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display text-lg text-white mb-3">
              Find<span className="text-warm-300">Finance</span>Pros
            </h3>
            <p className="text-sm leading-relaxed">
              The directory for fractional CFOs, FP&A consultants, controllers, and bookkeeping firms across Canada and the United States.
            </p>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3 text-sm uppercase tracking-wider">Services</h4>
            <div className="space-y-2 text-sm">
              <Link href="/service/fractional-cfo" className="block hover:text-warm-300 transition-colors">Fractional CFO</Link>
              <Link href="/service/fpa-consulting" className="block hover:text-warm-300 transition-colors">FP&A Consulting</Link>
              <Link href="/service/controller-services" className="block hover:text-warm-300 transition-colors">Controller Services</Link>
              <Link href="/service/bookkeeping" className="block hover:text-warm-300 transition-colors">Bookkeeping</Link>
              <Link href="/service/power-bi-automation" className="block hover:text-warm-300 transition-colors">Power BI & Automation</Link>
              <Link href="/service/quality-of-earnings" className="block hover:text-warm-300 transition-colors">Quality of Earnings</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3 text-sm uppercase tracking-wider">Industries</h4>
            <div className="space-y-2 text-sm">
              <Link href="/industry/manufacturing" className="block hover:text-warm-300 transition-colors">Manufacturing</Link>
              <Link href="/industry/technology" className="block hover:text-warm-300 transition-colors">Technology</Link>
              <Link href="/industry/healthcare" className="block hover:text-warm-300 transition-colors">Healthcare</Link>
              <Link href="/industry/professional-services" className="block hover:text-warm-300 transition-colors">Professional Services</Link>
              <Link href="/industry/real-estate" className="block hover:text-warm-300 transition-colors">Real Estate</Link>
              <Link href="/industry/construction" className="block hover:text-warm-300 transition-colors">Construction</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3 text-sm uppercase tracking-wider">Top Cities</h4>
            <div className="space-y-2 text-sm">
              <Link href="/city/toronto" className="block hover:text-warm-300 transition-colors">Toronto</Link>
              <Link href="/city/vancouver" className="block hover:text-warm-300 transition-colors">Vancouver</Link>
              <Link href="/city/calgary" className="block hover:text-warm-300 transition-colors">Calgary</Link>
              <Link href="/city/chicago" className="block hover:text-warm-300 transition-colors">Chicago</Link>
              <Link href="/city/new-york" className="block hover:text-warm-300 transition-colors">New York</Link>
              <Link href="/city/montreal" className="block hover:text-warm-300 transition-colors">Montreal</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-xs text-center">
          © {new Date().getFullYear()} FindFinancePros. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
