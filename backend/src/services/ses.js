'use strict';

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

// ── Client setup ──────────────────────────────────────────────────────────────

const ses = new SESClient({ region: process.env.AWS_REGION });

const SENDER = process.env.SES_SENDER_EMAIL;

// ── Status display helpers ────────────────────────────────────────────────────

const STATUS_LABELS = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved ✓',
  rejected: 'Rejected ✗',
};

const STATUS_COLORS = {
  submitted: '#4F46E5',
  under_review: '#D97706',
  approved: '#059669',
  rejected: '#DC2626',
};

// ── Email builder ─────────────────────────────────────────────────────────────

function buildEmailBody({ claimId, newStatus, adjusterNotes }) {
  const label = STATUS_LABELS[newStatus] || newStatus;
  const color = STATUS_COLORS[newStatus] || '#374151';
  const notesSection = adjusterNotes
    ? `
      <tr>
        <td style="padding:16px 24px 0;">
          <p style="margin:0;font-size:14px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">
            Adjuster Notes
          </p>
          <p style="margin:8px 0 0;font-size:15px;color:#374151;line-height:1.6;">
            ${adjusterNotes}
          </p>
        </td>
      </tr>`
    : '';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0"
               style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1E1B4B;padding:28px 24px;">
              <h1 style="margin:0;font-size:22px;color:#fff;letter-spacing:-.01em;">
                ClaimIQ
              </h1>
              <p style="margin:4px 0 0;font-size:13px;color:#A5B4FC;">
                Claim Status Update
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:24px 24px 8px;">
              <p style="margin:0;font-size:15px;color:#374151;">
                Your claim status has been updated. Here are the details:
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px 0;">
              <p style="margin:0;font-size:14px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">
                Claim ID
              </p>
              <p style="margin:4px 0 0;font-size:15px;color:#111827;font-family:monospace;">
                ${claimId}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px 0;">
              <p style="margin:0;font-size:14px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">
                New Status
              </p>
              <span style="display:inline-block;margin-top:6px;padding:4px 14px;border-radius:999px;
                           background:${color}20;color:${color};font-size:14px;font-weight:700;">
                ${label}
              </span>
            </td>
          </tr>
          ${notesSection}
          <!-- Footer -->
          <tr>
            <td style="padding:32px 24px 28px;border-top:1px solid #E5E7EB;margin-top:24px;">
              <p style="margin:0;font-size:13px;color:#9CA3AF;">
                This is an automated notification from ClaimIQ. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    'ClaimIQ — Claim Status Update',
    '================================',
    `Claim ID    : ${claimId}`,
    `New Status  : ${label}`,
    adjusterNotes ? `Notes       : ${adjusterNotes}` : '',
    '',
    'This is an automated notification from ClaimIQ.',
  ]
    .filter(Boolean)
    .join('\n');

  return { html, text };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Send a status-update notification email via AWS SES.
 *
 * @param {Object} params
 * @param {string} params.toEmail       — recipient address
 * @param {string} params.claimId
 * @param {string} params.newStatus     — submitted | under_review | approved | rejected
 * @param {string} [params.adjusterNotes]
 */
async function sendStatusUpdateEmail({ toEmail, claimId, newStatus, adjusterNotes }) {
  if (!SENDER) throw new Error('SES_SENDER_EMAIL environment variable is not set');

  const { html, text } = buildEmailBody({ claimId, newStatus, adjusterNotes });

  try {
    await ses.send(
      new SendEmailCommand({
        Source: SENDER,
        Destination: { ToAddresses: [toEmail] },
        Message: {
          Subject: {
            Data: `ClaimIQ — Claim ${claimId} status updated to: ${STATUS_LABELS[newStatus] || newStatus}`,
            Charset: 'UTF-8',
          },
          Body: {
            Html: { Data: html, Charset: 'UTF-8' },
            Text: { Data: text, Charset: 'UTF-8' },
          },
        },
      }),
    );
    console.log(`[ses] Status update email sent to ${toEmail} for claim ${claimId}`);
  } catch (err) {
    // Log but don't crash the request — email is a non-critical side-effect
    console.error('[ses] sendStatusUpdateEmail error:', err);
    throw new Error(`Failed to send status email: ${err.message}`);
  }
}

module.exports = { sendStatusUpdateEmail };
