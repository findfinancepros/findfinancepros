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

function buildNotificationHtml(lead) {
  const services = Array.isArray(lead.servicesNeeded) && lead.servicesNeeded.length
    ? lead.servicesNeeded.join(', ')
    : '';
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111">
    <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="padding:20px 24px;background:#0f172a;color:#fff">
        <h1 style="margin:0;font-size:18px">New Lead from FindFinancePros</h1>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${row('Name', lead.name)}
        ${row('Email', lead.email)}
        ${row('Phone', lead.phone)}
        ${row('Company', lead.company)}
        ${row('City', lead.city)}
        ${row('Services Needed', services)}
        ${row('Message', lead.message)}
      </table>
      <div style="padding:16px 24px;font-size:12px;color:#64748b">
        Sent automatically by FindFinancePros lead capture.
      </div>
    </div>
  </body>
</html>`;
}

function buildConfirmationHtml(lead) {
  const name = lead.name && lead.name.trim() ? lead.name.trim() : 'there';
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111">
    <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:32px">
      <h1 style="margin:0 0 16px;font-size:20px;color:#0f172a">Thanks for contacting FindFinancePros</h1>
      <p style="margin:0 0 14px;line-height:1.6;font-size:15px">Hi ${escapeHtml(name)},</p>
      <p style="margin:0 0 14px;line-height:1.6;font-size:15px">
        Thanks for reaching out. We&rsquo;ve received your request and a member of our team will review your details and be in touch within 24 hours with a shortlist of finance professionals matched to your needs.
      </p>
      <p style="margin:24px 0 0;line-height:1.6;font-size:15px">
        — The FindFinancePros Team
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 16px" />
      <p style="margin:0;font-size:12px;color:#64748b">
        FindFinancePros &middot; Matching businesses across Canada and the United States with trusted finance professionals.
      </p>
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
    email = '',
    phone = '',
    company = '',
    city = '',
    message = '',
    servicesNeeded = [],
    firmId = null,
  } = body || {};

  if (!email || typeof email !== 'string') {
    return Response.json({ ok: false, error: 'Email is required' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      { ok: false, error: 'Server is not configured for lead capture' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const payload = {
    name: name || null,
    email,
    phone: phone || null,
    company: company || null,
    message: message || null,
    firm_id: firmId || null,
    city: city || null,
    services_needed: Array.isArray(servicesNeeded) ? servicesNeeded : [],
  };

  const { error: insertError } = await supabase.from('leads').insert(payload);
  if (insertError) {
    console.error('Failed to insert lead', insertError);
    return Response.json(
      { ok: false, error: 'Could not save your request. Please try again.' },
      { status: 500 }
    );
  }

  const lead = { name, email, phone, company, city, message, servicesNeeded };

  if (resendApiKey) {
    const resend = new Resend(resendApiKey);
    try {
      await Promise.all([
        resend.emails.send({
          from: `FindFinancePros <${FROM_EMAIL}>`,
          to: NOTIFY_TO,
          replyTo: email,
          subject: 'New Lead from FindFinancePros',
          html: buildNotificationHtml(lead),
        }),
        resend.emails.send({
          from: `FindFinancePros <${FROM_EMAIL}>`,
          to: email,
          subject: 'Thanks for contacting FindFinancePros',
          html: buildConfirmationHtml(lead),
        }),
      ]);
    } catch (err) {
      console.error('Resend email failed', err);
      // Lead is already saved; surface success but log the email issue.
    }
  } else {
    console.warn('RESEND_API_KEY not set — skipping email notifications');
  }

  return Response.json({ ok: true });
}
