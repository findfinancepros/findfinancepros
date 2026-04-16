'use client';

/**
 * Google Analytics 4 event tracking utilities.
 *
 * All helpers are no-ops when gtag is not loaded (SSR, ad-blockers, tests),
 * so they're safe to call from any component.
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function gtagAvailable() {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Generic event wrapper — use this for one-off events that don't have a
 * dedicated helper below.
 */
export function trackEvent(eventName, params = {}) {
  if (!gtagAvailable()) return;
  window.gtag('event', eventName, params);
}

/** Fires when user first focuses into any field of a form. */
export function trackFormStart(formName) {
  trackEvent('form_start', { form_name: formName });
}

/** Fires on a successful form submission. */
export function trackFormSubmission(formName) {
  trackEvent('form_submission', { form_name: formName });
}

/** Fires when a user executes a search. */
export function trackSearch(query, resultsCount) {
  trackEvent('search', {
    search_term: query,
    results_count: resultsCount,
  });
}

/** Fires when a user clicks an outbound link to a firm's website. */
export function trackOutboundClick(url, firmName, location) {
  trackEvent('outbound_click', {
    url,
    firm_name: firmName,
    click_location: location, // 'card', 'profile_page', 'search_result', etc.
  });
}

/** Fires when a firm profile page loads. */
export function trackFirmProfileView(firmName, city, services) {
  trackEvent('firm_profile_view', {
    firm_name: firmName,
    city,
    services: Array.isArray(services) ? services.join(',') : services,
  });
}

/** Fires when a category page (city / service / industry) loads. */
export function trackCategoryPageView(type, slug) {
  trackEvent('category_page_view', {
    category_type: type, // 'city' | 'service' | 'industry' | 'city_service'
    slug,
  });
}

/** Fires when a user clicks a contact link (email, linkedin, website, phone). */
export function trackContactClick(type, firmName) {
  trackEvent('contact_click', {
    contact_type: type, // 'email' | 'linkedin' | 'website' | 'phone'
    firm_name: firmName,
  });
}
