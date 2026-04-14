import Link from 'next/link';

function buildHref(basePath, page, extraParams = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(extraParams)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }
  if (page > 1) {
    params.set('page', String(page));
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function getPageNumbers(current, total) {
  const pages = [];
  const windowSize = 1;
  const add = (p) => {
    if (!pages.includes(p) && p >= 1 && p <= total) pages.push(p);
  };

  add(1);
  for (let i = current - windowSize; i <= current + windowSize; i++) add(i);
  add(total);

  const result = [];
  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i] - pages[i - 1] > 1) {
      result.push('…');
    }
    result.push(pages[i]);
  }
  return result;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  extraParams = {},
}) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const prevHref =
    currentPage > 1 ? buildHref(basePath, currentPage - 1, extraParams) : null;
  const nextHref =
    currentPage < totalPages
      ? buildHref(basePath, currentPage + 1, extraParams)
      : null;

  const baseBtn =
    'inline-flex items-center justify-center min-w-[40px] h-10 px-3 rounded-lg border text-sm font-body transition-colors';
  const enabled =
    'bg-white border-warm-200 text-brand-800 hover:border-warm-400 hover:bg-warm-50';
  const disabled = 'bg-warm-50 border-warm-100 text-brand-300 cursor-not-allowed';
  const active = 'bg-brand-950 border-brand-950 text-white';

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2 mt-10"
      aria-label="Pagination"
    >
      {prevHref ? (
        <Link href={prevHref} rel="prev" className={`${baseBtn} ${enabled}`}>
          ← Previous
        </Link>
      ) : (
        <span className={`${baseBtn} ${disabled}`} aria-disabled="true">
          ← Previous
        </span>
      )}

      {pageNumbers.map((p, i) =>
        p === '…' ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 text-brand-400 font-body text-sm"
          >
            …
          </span>
        ) : p === currentPage ? (
          <span
            key={p}
            className={`${baseBtn} ${active}`}
            aria-current="page"
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(basePath, p, extraParams)}
            className={`${baseBtn} ${enabled}`}
          >
            {p}
          </Link>
        )
      )}

      {nextHref ? (
        <Link href={nextHref} rel="next" className={`${baseBtn} ${enabled}`}>
          Next →
        </Link>
      ) : (
        <span className={`${baseBtn} ${disabled}`} aria-disabled="true">
          Next →
        </span>
      )}
    </nav>
  );
}

export function getPaginationSlice(items, page, perPage = 12) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(Math.max(1, parseInt(page, 10) || 1), totalPages);
  const start = (currentPage - 1) * perPage;
  const end = Math.min(start + perPage, total);
  return {
    slice: items.slice(start, end),
    currentPage,
    totalPages,
    total,
    start,
    end,
    perPage,
  };
}
