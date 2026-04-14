'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { submitLead } from '@/lib/data';

export default function GetMatchedForm({ services, cities }) {
  const searchParams = useSearchParams();
  const firmSlug = searchParams.get('firm') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  function toggleService(slug) {
    setSelectedServices((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setStatus('submitting');
    setErrorMsg('');
    try {
      await submitLead({
        name,
        email,
        phone,
        company,
        message: [
          firmSlug ? `Referred from firm: ${firmSlug}` : null,
          message || null,
        ]
          .filter(Boolean)
          .join('\n\n'),
        city,
        servicesNeeded: selectedServices,
      });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.message || 'Something went wrong. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-white border border-brand-100 rounded-xl p-8 text-center">
        <h2 className="font-display text-2xl text-brand-950 mb-3">Thanks — we got it.</h2>
        <p className="text-brand-700 font-body leading-relaxed">
          We&rsquo;ll review your request and reach out within one business day with a shortlist of finance professionals matched to your needs.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-brand-100 rounded-xl p-6 md:p-8 space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-brand-800 mb-1">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-400 text-brand-900"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-brand-800 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-400 text-brand-900"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-brand-800 mb-1">Phone (optional)</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2.5 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-400 text-brand-900"
          />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-brand-800 mb-1">Company</label>
          <input
            id="company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full px-4 py-2.5 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-400 text-brand-900"
          />
        </div>
      </div>

      <div>
        <label htmlFor="city" className="block text-sm font-medium text-brand-800 mb-1">Your city</label>
        <select
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-4 py-2.5 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-400 text-brand-900 bg-white"
        >
          <option value="">Select a city...</option>
          {cities.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}, {c.province}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="block text-sm font-medium text-brand-800 mb-2">Services needed</span>
        <div className="grid sm:grid-cols-2 gap-2">
          {services.map((s) => (
            <label
              key={s.slug}
              className="flex items-center gap-2 px-3 py-2 border border-brand-100 rounded-lg hover:border-warm-300 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={selectedServices.includes(s.slug)}
                onChange={() => toggleService(s.slug)}
                className="rounded border-brand-300 text-warm-500 focus:ring-warm-400"
              />
              <span className="text-brand-800">{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-brand-800 mb-1">
          Tell us about your business
        </label>
        <textarea
          id="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Stage, revenue, current finance setup, what's prompting the search..."
          className="w-full px-4 py-2.5 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-400 text-brand-900"
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting' || !email}
        className="w-full bg-warm-500 hover:bg-warm-600 disabled:opacity-60 text-white font-medium px-8 py-3 rounded-lg transition-colors"
      >
        {status === 'submitting' ? 'Sending...' : 'Get Matched'}
      </button>

      <p className="text-xs text-brand-500 text-center">
        We&rsquo;ll respond within one business day. No spam.
      </p>
    </form>
  );
}
