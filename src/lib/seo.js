// Single source of truth for which pages we ask Google to index.
//
// Background: Google crawled all ~3,600 URLs and indexed none of them
// ("Crawled - currently not indexed"). On a young domain, a large block of
// thin, heavily-overlapping programmatic pages drags the whole site below
// Google's quality threshold. So we keep every page live for users but only
// submit the substantive ones for indexing.
//
// Both the sitemap and each page's `robots` metadata read these helpers, so a
// page can never be noindexed yet still advertised in the sitemap (a
// contradiction Google treats as a quality signal in its own right).

/** A city+service page needs at least this many firms to be worth indexing. */
export const MIN_FIRMS_FOR_COMBO_INDEX = 3;

/** A firm profile needs a write-up at least this long to be worth indexing. */
export const MIN_LONG_DESCRIPTION_CHARS = 300;

/**
 * City+service combos below the threshold list one or two firms that already
 * appear on the firm's own profile and on the parent city page, so they add no
 * information Google can't get elsewhere.
 */
export function isComboIndexable(firmCount) {
  return (firmCount || 0) >= MIN_FIRMS_FOR_COMBO_INDEX;
}

/**
 * A firm profile without a real write-up is just contact details wrapped in
 * our template — near-identical to every other unenriched profile.
 */
export function isFirmIndexable(pro) {
  const text = (pro?.longDescription || '').trim();
  return text.length >= MIN_LONG_DESCRIPTION_CHARS;
}

/** Metadata spread for a page we want crawled and followed but not indexed. */
export const NOINDEX = { robots: { index: false, follow: true } };
