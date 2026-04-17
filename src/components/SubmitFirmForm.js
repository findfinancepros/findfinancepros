'use client';

import { useRef, useState } from 'react';
import { trackFormStart, trackEvent } from '@/lib/analytics';

const MAX_DESCRIPTION = 500;

export default function SubmitFirmForm({ services, industries }) {
  const [form, setForm] = useState({
    name: '',
    website: '',
    contact: '',
    title: '',
    email: '',
    phone: '',
    linkedin: '',
    cityLabel: '',
    province: '',
    country: '',
    description: '',
  });
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const formStartedRef = useRef(false);
  function handleFormStart() {
    if (formStartedRef.current) return;
    formStartedRef.current = true;
    trackFormStart('firm_submission');
  }

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }
  function toggleIn(list, setList, slug) {
    setList(list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug]);
  }
  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.website.trim()) errs.website = 'Required';
    else {
      try {
        const u = new URL(form.website);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') errs.website = 'Must be http(s)';
      } catch { errs.website = 'Invalid URL'; }
    }
    if (!form.contact.trim()) errs.contact = 'Required';
    if (!form.email.trim()) errs.email = 'Required';
    if (!form.cityLabel.trim()) errs.cityLabel = 'Required';
    if (!form.province.trim()) errs.province = 'Required';
    if (!form.country) errs.country = 'Required';
    if (!form.description.trim()) errs.description = 'Required';
    else if (form.description.length > MAX_DESCRIPTION) errs.description = `${MAX_DESCRIPTION} char max`;
    if (selectedServices.length === 0) errs.services = 'Pick at least one service';
    if (form.linkedin.trim()) {
      try {
        const u = new URL(form.linkedin);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') errs.linkedin = 'Must be http(s)';
      } catch { errs.linkedin = 'Invalid URL'; }
    }
    return errs;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setErrorMsg('Please fix the highlighted fields.');
      return;
    }
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/submit-firm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          services: selectedServices,
          industries: selectedIndustries,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      trackEvent('firm_submission', { form_name: 'firm_submission' });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.message || 'Something went wrong. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-white border border-brand-100 rounded-xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-warm-100 text-warm-600 mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-display text-2xl text-brand-950 mb-3">Thank you!</h2>
        <p className="text-brand-700 font-body leading-relaxed">
          Your submission has been received and will be reviewed shortly. Once approved, your firm will appear in the directory.
        </p>
      </div>
    );
  }

  const inputCls = (err) =>
    `w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-400 text-brand-900 ${
      err ? 'border-red-400' : 'border-brand-200'
    }`;
  const labelCls = 'block text-sm font-medium text-brand-800 mb-1';
  const reqStar = <span className="text-red-500">*</span>;
  const charsLeft = MAX_DESCRIPTION - form.description.length;

  return (
    <form
      onSubmit={onSubmit}
      onFocus={handleFormStart}
      className="bg-white border border-brand-100 rounded-xl p-6 md:p-8 space-y-5"
      noValidate
    >
      <div>
        <label htmlFor="name" className={labelCls}>Firm name {reqStar}</label>
        <input id="name" type="text" value={form.name} onChange={update('name')} className={inputCls(fieldErrors.name)} />
      </div>

      <div>
        <label htmlFor="website" className={labelCls}>Website URL {reqStar}</label>
        <input id="website" type="url" value={form.website} onChange={update('website')} placeholder="https://" className={inputCls(fieldErrors.website)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact" className={labelCls}>Contact person {reqStar}</label>
          <input id="contact" type="text" value={form.contact} onChange={update('contact')} className={inputCls(fieldErrors.contact)} />
        </div>
        <div>
          <label htmlFor="title" className={labelCls}>Contact title</label>
          <input id="title" type="text" value={form.title} onChange={update('title')} placeholder="e.g., Managing Partner" className={inputCls()} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className={labelCls}>Email {reqStar}</label>
          <input id="email" type="email" value={form.email} onChange={update('email')} className={inputCls(fieldErrors.email)} />
        </div>
        <div>
          <label htmlFor="phone" className={labelCls}>Phone</label>
          <input id="phone" type="tel" value={form.phone} onChange={update('phone')} className={inputCls()} />
        </div>
      </div>

      <div>
        <label htmlFor="linkedin" className={labelCls}>LinkedIn URL</label>
        <input id="linkedin" type="url" value={form.linkedin} onChange={update('linkedin')} placeholder="https://linkedin.com/..." className={inputCls(fieldErrors.linkedin)} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="cityLabel" className={labelCls}>City {reqStar}</label>
          <input id="cityLabel" type="text" value={form.cityLabel} onChange={update('cityLabel')} className={inputCls(fieldErrors.cityLabel)} />
        </div>
        <div>
          <label htmlFor="province" className={labelCls}>Province / State {reqStar}</label>
          <input id="province" type="text" value={form.province} onChange={update('province')} className={inputCls(fieldErrors.province)} />
        </div>
        <div>
          <label htmlFor="country" className={labelCls}>Country {reqStar}</label>
          <select id="country" value={form.country} onChange={update('country')} className={`${inputCls(fieldErrors.country)} bg-white`}>
            <option value="">Select...</option>
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelCls}>
          Description {reqStar}
          <span className={`ml-2 text-xs font-normal ${charsLeft < 0 ? 'text-red-500' : 'text-brand-500'}`}>
            {charsLeft} characters left
          </span>
        </label>
        <textarea
          id="description"
          rows={4}
          maxLength={MAX_DESCRIPTION}
          value={form.description}
          onChange={update('description')}
          placeholder="Briefly describe your firm and the services you offer"
          className={inputCls(fieldErrors.description)}
        />
      </div>

      <div>
        <span className={labelCls}>Services offered {reqStar}</span>
        <div className="grid sm:grid-cols-2 gap-2">
          {services.map((s) => (
            <label
              key={s.slug}
              className="flex items-center gap-2 px-3 py-2 border border-brand-100 rounded-lg hover:border-warm-300 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={selectedServices.includes(s.slug)}
                onChange={() => toggleIn(selectedServices, setSelectedServices, s.slug)}
                className="rounded border-brand-300 text-warm-500 focus:ring-warm-400"
              />
              <span className="text-brand-800">{s.label}</span>
            </label>
          ))}
        </div>
        {fieldErrors.services && <p className="text-xs text-red-600 mt-1">{fieldErrors.services}</p>}
      </div>

      <div>
        <span className={labelCls}>Industries served (optional)</span>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
          {industries.map((ind) => (
            <label
              key={ind.slug}
              className="flex items-center gap-2 px-3 py-2 border border-brand-100 rounded-lg hover:border-warm-300 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={selectedIndustries.includes(ind.slug)}
                onChange={() => toggleIn(selectedIndustries, setSelectedIndustries, ind.slug)}
                className="rounded border-brand-300 text-warm-500 focus:ring-warm-400"
              />
              <span className="text-brand-800">{ind.label}</span>
            </label>
          ))}
        </div>
      </div>

      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full bg-warm-500 hover:bg-warm-600 disabled:opacity-60 text-white font-medium px-8 py-3 rounded-lg transition-colors"
      >
        {status === 'submitting' ? 'Submitting...' : 'Submit Firm'}
      </button>

      <p className="text-xs text-brand-500 text-center">
        Free to list. We&rsquo;ll review your submission within one business day.
      </p>
    </form>
  );
}
