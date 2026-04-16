'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { trackSearch } from '@/lib/analytics';

export default function SearchBar({
  className = '',
  placeholder = 'Search firms, cities, services...',
  compact = false,
  limit = 8,
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function onClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Debounced search
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      const esc = q.replace(/[%_,]/g, (m) => `\\${m}`);
      const pattern = `%${esc}%`;
      const { data, error } = await supabase
        .from('firms')
        .select('slug, name, city_label, province')
        .eq('status', 'active')
        .or(`name.ilike.${pattern},city_label.ilike.${pattern},description.ilike.${pattern}`)
        .order('priority_score', { ascending: false })
        .order('name', { ascending: true })
        .limit(limit);
      setLoading(false);
      if (!error) {
        setResults(data || []);
        setOpen(true);
      }
    }, 180);
    return () => clearTimeout(handle);
  }, [query]);

  function onSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    trackSearch(q, results.length);
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <form onSubmit={onSubmit}>
        {compact ? (
          <div className="relative">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-500 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 17a6.5 6.5 0 100-13 6.5 6.5 0 000 13z" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim() && setOpen(true)}
              placeholder={placeholder}
              className="w-full bg-white/90 text-brand-900 placeholder-brand-500 rounded-lg pl-9 pr-3 py-1.5 text-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-warm-400 focus:bg-white"
              aria-label="Search firms"
            />
          </div>
        ) : (
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && setOpen(true)}
            placeholder={placeholder}
            className="w-full bg-white/95 text-brand-900 placeholder-brand-400 rounded-lg px-5 py-3 border border-white/30 focus:outline-none focus:ring-2 focus:ring-warm-400"
            aria-label="Search firms"
          />
        )}
      </form>

      {open && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-brand-100 z-20 text-left overflow-hidden">
          {loading && (
            <div className="px-5 py-3 text-sm text-brand-500">Searching...</div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-5 py-3 text-sm text-brand-500">No matches for &ldquo;{query}&rdquo;</div>
          )}
          {!loading && results.map((r) => (
            <a
              key={r.slug}
              href={`/professional/${r.slug}`}
              className="block px-5 py-3 hover:bg-warm-50 border-b border-brand-50 last:border-b-0"
            >
              <div className="font-medium text-brand-900 text-sm">{r.name}</div>
              <div className="text-xs text-brand-500">{r.city_label}, {r.province}</div>
            </a>
          ))}
          {!loading && results.length > 0 && (
            <a
              href={`/search?q=${encodeURIComponent(query.trim())}`}
              className="block px-5 py-3 bg-brand-50 hover:bg-brand-100 text-sm text-brand-700 font-medium"
            >
              See all results for &ldquo;{query}&rdquo; →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
