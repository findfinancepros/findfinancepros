'use client';

import { useMemo, useState } from 'react';
import ProfessionalCard from './ProfessionalCard';

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'newest', label: 'Newest First' },
];

function sortPros(pros, sort) {
  const copy = [...pros];
  if (sort === 'name-asc') {
    copy.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else if (sort === 'name-desc') {
    copy.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
  } else if (sort === 'newest') {
    copy.sort((a, b) => {
      const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bd - ad;
    });
  }
  return copy;
}

export default function FirmGrid({ pros, pageSize = 12 }) {
  const [sort, setSort] = useState('name-asc');
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => sortPros(pros, sort), [pros, sort]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visible = sorted.slice(start, start + pageSize);

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <p className="text-sm text-brand-600 font-body">
          Showing {sorted.length === 0 ? 0 : start + 1}-{Math.min(start + pageSize, sorted.length)} of {sorted.length}
        </p>
        <label className="flex items-center gap-2 text-sm text-brand-700 font-body">
          <span className="whitespace-nowrap">Sort by</span>
          <select
            value={sort}
            onChange={handleSortChange}
            className="bg-white border border-brand-200 rounded-lg px-3 py-2 text-sm text-brand-800 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {visible.map((pro) => (
          <ProfessionalCard key={pro.slug} pro={pro} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-brand-200 text-sm text-brand-700 hover:border-brand-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-brand-600 px-3">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border border-brand-200 text-sm text-brand-700 hover:border-brand-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
