'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import SearchBar from './SearchBar';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const pathname = usePathname();
  const showSearch = pathname !== '/';
  const mobileSearchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile search on route change
  useEffect(() => {
    setMobileSearchOpen(false);
    setOpen(false);
  }, [pathname]);

  // Autofocus mobile search input when it opens
  useEffect(() => {
    if (mobileSearchOpen && mobileSearchRef.current) {
      const input = mobileSearchRef.current.querySelector('input');
      if (input) input.focus();
    }
  }, [mobileSearchOpen]);

  return (
    <nav
      className={`bg-brand-950 text-white sticky top-0 z-50 transition-shadow duration-200 ${
        scrolled ? 'shadow-lg shadow-black/20' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="font-display text-xl tracking-tight shrink-0">
          Find<span className="text-warm-300">Finance</span>Pros
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm font-body flex-1 justify-end">
          <Link href="/services" className="hover:text-warm-300 transition-colors">Services</Link>
          <Link href="/industries" className="hover:text-warm-300 transition-colors">Industries</Link>
          <Link href="/cities" className="hover:text-warm-300 transition-colors">Cities</Link>
          <Link href="/blog" className="hover:text-warm-300 transition-colors">Blog</Link>
          {showSearch && (
            <SearchBar
              compact
              limit={5}
              placeholder="Search firms..."
              className="w-[220px] lg:w-[250px]"
            />
          )}
          <Link
            href="/get-matched"
            className="bg-warm-500 hover:bg-warm-600 text-white px-5 py-2 rounded-lg transition-colors font-medium shrink-0"
          >
            Get Matched
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-2">
          {showSearch && (
            <button
              className="text-white p-1"
              onClick={() => setMobileSearchOpen((v) => !v)}
              aria-label="Toggle search"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileSearchOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 17a6.5 6.5 0 100-13 6.5 6.5 0 000 13z" />
                )}
              </svg>
            </button>
          )}
          <button
            className="text-white p-1"
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
      </div>

      {/* Mobile search expanded */}
      {showSearch && mobileSearchOpen && (
        <div ref={mobileSearchRef} className="md:hidden px-6 pb-4">
          <SearchBar compact limit={5} placeholder="Search firms..." className="w-full" />
        </div>
      )}

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-6 pb-4 space-y-3 text-sm font-body">
          <Link href="/services" className="block hover:text-warm-300" onClick={() => setOpen(false)}>Services</Link>
          <Link href="/industries" className="block hover:text-warm-300" onClick={() => setOpen(false)}>Industries</Link>
          <Link href="/cities" className="block hover:text-warm-300" onClick={() => setOpen(false)}>Cities</Link>
          <Link href="/blog" className="block hover:text-warm-300" onClick={() => setOpen(false)}>Blog</Link>
          <Link
            href="/get-matched"
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
