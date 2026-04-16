'use client';

import { useEffect } from 'react';
import {
  trackCategoryPageView,
  trackFirmProfileView,
  trackEvent,
  trackContactClick,
  trackOutboundClick,
} from '@/lib/analytics';

/** Fires a firm_profile_view event once on mount. */
export function FirmProfileViewTracker({ name, city, services }) {
  useEffect(() => {
    trackFirmProfileView(name, city, services);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

/** Fires a category_page_view event once on mount. */
export function CategoryPageViewTracker({ type, slug }) {
  useEffect(() => {
    trackCategoryPageView(type, slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

/** Fires a blog_view event once on mount. */
export function BlogViewTracker({ slug, title }) {
  useEffect(() => {
    trackEvent('blog_view', { slug, title });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

/**
 * Client-side contact link. Wraps an <a> and fires a contact_click event
 * on click without swallowing navigation.
 */
export function ContactLink({
  href,
  type, // 'website' | 'linkedin' | 'email' | 'phone'
  firmName,
  className,
  target,
  rel,
  children,
  outbound = false,
  outboundLocation = 'profile_page',
}) {
  function handleClick() {
    trackContactClick(type, firmName);
    if (outbound) {
      trackOutboundClick(href, firmName, outboundLocation);
    }
  }

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
