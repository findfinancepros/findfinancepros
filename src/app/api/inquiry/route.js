import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const NOTIFY_TO = 'fahad@findfinancepros.com';
const FROM_EMAIL = 'noreply@findfinancepros.com';

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
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#334;vertical-align:top;width:160px">${escapeHtml(label)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#111;white-space:pre-wrap">${display}</td>
    </tr>`;
}

function buildInquiryHtml({ visitorName, visitorEmail, visitorPhone, message, firmName, firmCity, firmEmail }) {
  const noEmailNote = firmEmail
    ? ''
    : `<div style="padding:14px 24px;background:#fff7ed;color:#9a3412;font-size:13px;border-bottom:1px solid #fed7aa">
         No email on file for ${escapeHtml(firmName)} — manual routing needed.
       </div>`;
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111">
    <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="padding:20px 24px;background:#0e221c;color:#fff">
        <h1 style="margin:0;font-size:18px">New Inquiry via FindFinancePros</h1>
        <p style="margin:6px 0 0;font-size:13px;color:#d4a853">For: ${escapeHtml(firmName)}${firmCity ? ` — ${escapeHtml(firmCity)}` : ''}</p>
      </div>
      ${noEmailNote}
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${row('Name', visitorName)}
        ${row('Email', visitorEmail)}
        ${row('Phone', visitorPhone)}
        ${row('Message', message)}
      </table>
      <div style="padding:16px 24px;font-size:12px;color:#64748b">
        Sent automatically by FindFinancePros firm inquiry form.
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
    visitorName = '',
    visitorEmail = '',
    visitorPhone = '',
    message = '',
    firmName = '',
    firmSlug = '',
    firmEmail: clientFirmEmail = null,
    firmCity = '',
  } = body || {};

  if (!visitorName || !visitorName.trim()) {
    return Response.json({ ok: false, error: 'Name is required' }, { status: 400 });
  }
  if (!visitorEmail || typeof visitorEmail !== 'string') {
    return Response.json({ ok: false, error: 'Email is required' }, { status: 400 });
  }
  if (!message || !message.trim()) {
    return Response.json({ ok: false, error: 'Message is required' }, { status: 400 });
  }
  if (!firmSlug || typeof firmSlug !== 'string') {
    return Response.json({ ok: false, error: 'Firm is required' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      { ok: false, error: 'Server is not configured for inquiries' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Look up firm by slug to get authoritative id and email — don't trust client.
  const { data: firmRow } = await supabase
    .from('firms')
    .select('id, email, name, city_label')
    .eq('slug', firmSlug)
    .maybeSingle();

  const firmId = firmRow?.id || null;
  const firmEmail = firmRow?.email || null;
  const resolvedFirmName = firmRow?.name || firmName;
  const resolvedFirmCity = firmRow?.city_label || firmCity;

  const { error: insertError } = await supabase.from('leads').insert({
    name: visitorName || null,
    email: visitorEmail,
    phone: visitorPhone || null,
    company: null,
    message: message || null,
    firm_id: firmId,
    city: resolvedFirmCity || null,
    services_needed: [],
  });
  if (insertError) {
    console.error('Failed to insert inquiry lead', insertError);
    return Response.json(
      { ok: false, error: 'Could not save your inquiry. Please try again.' },
      { status: 500 }
    );
  }

  if (resendApiKey) {
    const resend = new Resend(resendApiKey);
    const html = buildInquiryHtml({
      visitorName,
      visitorEmail,
      visitorPhone,
      message,
      firmName: resolvedFirmName,
      firmCity: resolvedFirmCity,
      firmEmail,
    });

    const subject = firmEmail
      ? `New Inquiry via FindFinancePros - ${visitorName}`
      : `New Inquiry for ${resolvedFirmName} - ${visitorName}`;

    const to = firmEmail ? [firmEmail] : [NOTIFY_TO];
    const bcc = firmEmail ? [NOTIFY_TO] : undefined;

    try {
      await resend.emails.send({
        from: `FindFinancePros <${FROM_EMAIL}>`,
        to,
        bcc,
        replyTo: visitorEmail,
        subject,
        html,
      });
    } catch (err) {
      console.error('Resend inquiry email failed', err);
      // Lead is saved; don't fail the request on email error.
    }
  } else {
    console.warn('RESEND_API_KEY not set — skipping inquiry email');
  }

  return Response.json({ ok: true });
}
