'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-brand-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-xl tracking-tight">
          Find<span className="text-warm-300">Finance</span>Pros
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8 text-sm font-body">
          <Link href="/#services" className="hover:text-warm-300 transition-colors">Services</Link>
          <Link href="/#industries" className="hover:text-warm-300 transition-colors">Industries</Link>
          <Link href="/#cities" className="hover:text-warm-300 transition-colors">Cities</Link>
          <Link
            href="/#contact"
            className="bg-warm-500 hover:bg-warm-600 text-white px-5 py-2 rounded-lg transition-colors font-medium"
          >
            Get Matched
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-6 pb-4 space-y-3 text-sm font-body">
          <Link href="/#services" className="block hover:text-warm-300" onClick={() => setOpen(false)}>Services</Link>
          <Link href="/#industries" className="block hover:text-warm-300" onClick={() => setOpen(false)}>Industries</Link>
          <Link href="/#cities" className="block hover:text-warm-300" onClick={() => setOpen(false)}>Cities</Link>
          <Link
            href="/#contact"
            className="block bg-warm-500 text-white text-center px-5 py-2 rounded-lg"
            onClick={() => setOpen(false)}
          >
            Get Matched
          </Link>
        </div>
      )}
    </nav>
  );
}
