'use client';

import { useState } from 'react';
import { trackFormStart, trackEvent } from '@/lib/analytics';

export default function FirmInquiryForm({ firmName, firmSlug, firmEmail, firmCity }) {
  const defaultMessage = `Hi, I found ${firmName} on FindFinancePros and would like to learn more about your services.`;

  const [open, setOpen] = useState(false);
  const [startFired, setStartFired] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: defaultMessage,
  });

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleFocus() {
    if (!startFired) {
      trackFormStart('firm_inquiry');
      setStartFired(true);
    }
  }

  function toggleOpen() {
    setOpen((v) => !v);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorName: form.name,
          visitorEmail: form.email,
          visitorPhone: form.phone,
          message: form.message,
          firmName,
          firmSlug,
          firmEmail,
          firmCity,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      trackEvent('form_submission', {
        form_name: 'firm_inquiry',
        firm_name: firmName,
        firm_slug: firmSlug,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const successMessage = firmEmail
    ? `Your inquiry has been sent! ${firmName} will be in touch shortly.`
    : `Your inquiry has been received! We'll connect you with ${firmName} shortly.`;

  return (
    <div>
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={open}
        className="block w-full text-center bg-warm-500 hover:bg-warm-600 text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm"
      >
        {open ? 'Close' : 'Request Introduction'}
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="bg-brand-950 text-white rounded-lg p-5 relative">
            <button
              type="button"
              onClick={toggleOpen}
              aria-label="Close form"
              className="absolute top-3 right-3 text-white/60 hover:text-warm-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {submitted ? (
              <div className="py-4 text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-warm-500/20 text-warm-300 mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-display text-lg mb-1">Thanks!</p>
                <p className="text-white/80 text-sm leading-relaxed">{successMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3" onFocus={handleFocus}>
                <h4 className="font-display text-lg text-warm-300 mb-2 pr-8">
                  Contact {firmName}
                </h4>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/60 mb-1" htmlFor="inquiry-name">
                    Name <span className="text-warm-300">*</span>
                  </label>
                  <input
                    id="inquiry-name"
                    type="text"
                    required
                    value={form.name}
                    onChange={update('name')}
                    className="w-full bg-brand-900 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-warm-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/60 mb-1" htmlFor="inquiry-email">
                    Email <span className="text-warm-300">*</span>
                  </label>
                  <input
                    id="inquiry-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={update('email')}
                    className="w-full bg-brand-900 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-warm-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/60 mb-1" htmlFor="inquiry-phone">
                    Phone
                  </label>
                  <input
                    id="inquiry-phone"
                    type="tel"
                    value={form.phone}
                    onChange={update('phone')}
                    className="w-full bg-brand-900 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-warm-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/60 mb-1" htmlFor="inquiry-message">
                    Message <span className="text-warm-300">*</span>
                  </label>
                  <textarea
                    id="inquiry-message"
                    required
                    rows={4}
                    value={form.message}
                    onChange={update('message')}
                    className="w-full bg-brand-900 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-warm-400 focus:outline-none resize-none"
                  />
                </div>

                {error && (
                  <p className="text-sm text-warm-300 bg-warm-500/10 border border-warm-500/20 rounded px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-warm-500 hover:bg-warm-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
                >
                  {submitting ? 'Sending…' : 'Send Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
