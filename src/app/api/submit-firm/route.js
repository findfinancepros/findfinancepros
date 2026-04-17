import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const NOTIFY_TO = 'fahad@findfinancepros.com';
const FROM_EMAIL = 'noreply@findfinancepros.com';

const SPAM_RX = /\b(viagra|cialis|casino|escort|payday\s*loan|buy\s*followers|cheap\s*seo|link\s*building\s*service|cryptocurrency\s*investment)\b/i;

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function row(label, value) {
  const display = value && String(value).trim() ? escapeHtml(value) : '<em style="color:#888">—</em>';
  return `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#334;vertical-align:top;width:180px">${escapeHtml(label)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#111;white-space:pre-wrap">${display}</td>
    </tr>`;
}

function slugify(name) {
  const base = (name || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  const suffix = Math.random().toString(36).slice(2, 8);
  return base ? `${base}-${suffix}` : `firm-${suffix}`;
}

function isValidUrl(s) {
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch { return false; }
}

function buildNotificationHtml(firm) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111">
    <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="padding:20px 24px;background:#0e221c;color:#fff">
        <h1 style="margin:0;font-size:18px">New Firm Submission</h1>
        <p style="margin:6px 0 0;font-size:13px;color:#d4a853">${escapeHtml(firm.name)}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${row('Firm Name', firm.name)}
        ${row('Website', firm.website)}
        ${row('Contact', `${firm.contact || ''}${firm.title ? ` — ${firm.title}` : ''}`)}
        ${row('Email', firm.email)}
        ${row('Phone', firm.phone)}
        ${row('LinkedIn', firm.linkedin)}
        ${row('Location', `${firm.cityLabel}, ${firm.province}, ${firm.country}`)}
        ${row('Services', (firm.services || []).join(', '))}
        ${row('Industries', (firm.industries || []).join(', '))}
        ${row('Description', firm.description)}
        ${row('Slug', firm.slug)}
      </table>
      <div style="padding:16px 24px;font-size:12px;color:#64748b">
        Submitted via the public List Your Firm form. Status: <strong>pending_review</strong>. Update the firm row in Supabase to <code>status = 'active'</code> to publish it.
      </div>
    </div>
  </body>
</html>`;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    name = '',
    website = '',
    contact = '',
    title = '',
    email = '',
    phone = '',
    linkedin = '',
    city = '',
    cityLabel = '',
    province = '',
    country = '',
    description = '',
    services = [],
    industries = [],
  } = body || {};

  const requireText = (v) => typeof v === 'string' && v.trim().length > 0;

  if (!requireText(name)) return Response.json({ ok: false, error: 'Firm name is required' }, { status: 400 });
  if (!requireText(website) || !isValidUrl(website)) return Response.json({ ok: false, error: 'A valid website URL is required' }, { status: 400 });
  if (!requireText(contact)) return Response.json({ ok: false, error: 'Contact person name is required' }, { status: 400 });
  if (!requireText(email)) return Response.json({ ok: false, error: 'Email is required' }, { status: 400 });
  if (!requireText(cityLabel)) return Response.json({ ok: false, error: 'City is required' }, { status: 400 });
  if (!requireText(province)) return Response.json({ ok: false, error: 'Province/State is required' }, { status: 400 });
  if (!requireText(country) || !['United States', 'Canada'].includes(country)) {
    return Response.json({ ok: false, error: 'Country must be United States or Canada' }, { status: 400 });
  }
  if (!requireText(description)) return Response.json({ ok: false, error: 'Description is required' }, { status: 400 });
  if (description.length > 500) return Response.json({ ok: false, error: 'Description must be 500 characters or fewer' }, { status: 400 });
  if (!Array.isArray(services) || services.length === 0) {
    return Response.json({ ok: false, error: 'At least one service is required' }, { status: 400 });
  }
  if (SPAM_RX.test(description) || SPAM_RX.test(name)) {
    return Response.json({ ok: false, error: 'Submission rejected' }, { status: 400 });
  }
  const linkCount = (description.match(/https?:\/\//gi) || []).length;
  if (linkCount > 2) {
    return Response.json({ ok: false, error: 'Description contains too many links' }, { status: 400 });
  }
  if (linkedin && !isValidUrl(linkedin)) {
    return Response.json({ ok: false, error: 'LinkedIn must be a valid URL' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json({ ok: false, error: 'Server is not configured for submissions' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const citySlug = (city || cityLabel)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const slug = slugify(name);

  const firm = {
    slug,
    name: name.trim(),
    contact: contact.trim() || null,
    title: title.trim() || null,
    email: email.trim(),
    phone: phone.trim() || null,
    linkedin: linkedin.trim() || null,
    website: website.trim(),
    city: citySlug,
    city_label: cityLabel.trim(),
    province: province.trim(),
    country,
    services,
    industries,
    description: description.trim(),
    status: 'pending_review',
    plan: 'free',
    priority_score: 0,
    submitted_by: email.trim(),
    source: 'public_submit',
  };

  const { error: insertError } = await supabase.from('firms').insert(firm);
  if (insertError) {
    console.error('Failed to insert firm submission', insertError);
    return Response.json({ ok: false, error: 'Could not save your submission. Please try again.' }, { status: 500 });
  }

  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: `FindFinancePros <${FROM_EMAIL}>`,
        to: NOTIFY_TO,
        replyTo: email.trim(),
        subject: `New Firm Submission — ${name.trim()}`,
        html: buildNotificationHtml({
          ...firm,
          cityLabel: firm.city_label,
          services,
          industries,
        }),
      });
    } catch (err) {
      console.error('Resend submission email failed', err);
      // Submission saved; don't fail the request on email error.
    }
  } else {
    console.warn('RESEND_API_KEY not set — skipping submission email');
  }

  return Response.json({ ok: true });
}
