const path = require('path');
const fs = require('fs');

const bannerPath = path.join(__dirname, '..', 'assets', 'account-banner.svg');
const bannerCid = 'pathfindersl-banner';

const buildAttachments = () => {
  if (!fs.existsSync(bannerPath)) {
    return [];
  }

  return [
    {
      filename: 'pathfindersl-banner.svg',
      path: bannerPath,
      cid: bannerCid,
    },
  ];
};

const wrapEmail = ({ preheader, eyebrow, title, intro, body, footer, ctaLabel, ctaUrl }) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f8fb;font-family:Arial,Helvetica,sans-serif;color:#16303d;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f8fb;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 45px rgba(8,35,52,0.12);">
            <tr>
              <td style="background:linear-gradient(135deg,#003b4d 0%,#015f73 60%,#f4a261 100%);padding:20px 24px 0;">
                <img src="cid:${bannerCid}" alt="PathFinderSL" style="display:block;width:100%;height:auto;border-radius:20px 20px 0 0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:32px 36px 12px;">
                <p style="margin:0 0 14px;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:#0b7285;font-weight:700;">${eyebrow}</p>
                <h1 style="margin:0 0 14px;font-size:30px;line-height:1.2;color:#102a43;">${title}</h1>
                <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#486581;">${intro}</p>
                ${body}
                ${
                  ctaLabel && ctaUrl
                    ? `<p style="margin:28px 0 10px;"><a href="${ctaUrl}" style="display:inline-block;padding:14px 24px;border-radius:999px;background:#ff7f50;color:#ffffff;text-decoration:none;font-weight:700;">${ctaLabel}</a></p>`
                    : ''
                }
              </td>
            </tr>
            <tr>
              <td style="padding:8px 36px 30px;font-size:13px;line-height:1.7;color:#7b8794;">
                ${footer}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const buildWelcomeEmail = ({ user, profileUrl }) => {
  const subject = 'Welcome to PathFinderSL';
  const html = wrapEmail({
    preheader: 'Your PathFinderSL account is ready.',
    eyebrow: 'Welcome aboard',
    title: `Hi ${user.full_name}, your PathFinderSL account is live.`,
    intro:
      'Thanks for joining PathFinderSL. Your traveler profile is ready, and you can now explore hotels, personalize your profile, and manage your future bookings from one place.',
    body: `
      <div style="background:#f8fbfd;border:1px solid #dde7ee;border-radius:20px;padding:20px;margin:0 0 18px;">
        <p style="margin:0 0 10px;font-size:15px;line-height:1.6;color:#243b53;">Here is what you can do next:</p>
        <ul style="margin:0;padding-left:20px;color:#486581;font-size:15px;line-height:1.8;">
          <li>Complete your traveler profile with nationality, location, and a profile photo.</li>
          <li>Browse Sri Lankan stays and save your favorite places.</li>
          <li>Come back anytime with your secure user login.</li>
        </ul>
      </div>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#486581;">If you did not create this account, please contact the PathFinderSL support team immediately.</p>
    `,
    footer:
      'Safe travels,<br /><strong style="color:#102a43;">The PathFinderSL Team</strong>',
    ctaLabel: 'Open My Profile',
    ctaUrl: profileUrl,
  });

  const text = [
    `Hi ${user.full_name},`,
    '',
    'Welcome to PathFinderSL. Your account is ready.',
    'You can now update your profile, explore hotels, and manage your travel plans.',
    '',
    `Profile: ${profileUrl}`,
    '',
    'The PathFinderSL Team',
  ].join('\n');

  return { subject, html, text, attachments: buildAttachments() };
};

const buildOtpEmail = ({ user, otp, expiresInMinutes, portalLabel }) => {
  const subject = 'Your PathFinderSL password reset OTP';
  const html = wrapEmail({
    preheader: 'Use this OTP to reset your PathFinderSL password.',
    eyebrow: 'Security check',
    title: 'Password reset request received',
    intro: `We received a request to reset the password for your ${portalLabel}. Use the one-time password below to continue.`,
    body: `
      <div style="margin:0 0 20px;padding:22px;border-radius:22px;background:linear-gradient(135deg,#003b4d 0%,#0b7285 100%);text-align:center;">
        <p style="margin:0 0 10px;font-size:13px;letter-spacing:1.6px;text-transform:uppercase;color:#d9f3fb;">One-time password</p>
        <p style="margin:0;font-size:34px;letter-spacing:10px;color:#ffffff;font-weight:800;">${otp}</p>
      </div>
      <div style="background:#fff8f2;border:1px solid #f8d2b7;border-radius:18px;padding:18px;margin:0 0 18px;">
        <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#7c2d12;"><strong>This code expires in ${expiresInMinutes} minutes.</strong></p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#9a3412;">If you did not request this reset, you can ignore this email and your password will stay unchanged.</p>
      </div>
    `,
    footer:
      'For your security, never share this OTP with anyone.<br /><strong style="color:#102a43;">PathFinderSL Security</strong>',
  });

  const text = [
    `Hi ${user.full_name},`,
    '',
    `Use this OTP to reset your ${portalLabel} password: ${otp}`,
    `This OTP expires in ${expiresInMinutes} minutes.`,
    '',
    'If you did not request a reset, you can ignore this message.',
  ].join('\n');

  return { subject, html, text, attachments: buildAttachments() };
};

// ── Booking notification to admin ────────────────────────────────────────────
// Sent immediately when a user checks out (order status = pending)
const buildBookingNotificationEmail = ({ order, items, user }) => {
  const subject = `[PathFinderSL] New Booking — ${order.order_number}`;
  const orderedAt = new Date(order.created_at).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Build item rows for the table (inline images via <img> tags)
  const itemRows = items
    .map((item, idx) => {
      const imgCell = item.item_image
        ? `<img src="${item.item_image}" alt="${item.item_name}" width="64" height="64"
              style="object-fit:cover;border-radius:8px;display:block;" />`
        : `<div style="width:64px;height:64px;border-radius:8px;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-size:22px;">${item.item_type === 'hotel' ? '🏨' : '🎭'}</div>`;

      const dates = item.check_in
        ? `${item.check_in} → ${item.check_out || '?'}`
        : item.event_date || '—';

      const guests = `${item.adult_count || 0} adult${(item.adult_count || 0) !== 1 ? 's' : ''}${
        (item.child_count || 0) > 0 ? `, ${item.child_count} child${(item.child_count || 0) !== 1 ? 'ren' : ''}` : ''
      }`;

      const typeBadge =
        item.item_type === 'hotel'
          ? `<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-size:11px;font-weight:700;">HOTEL</span>`
          : `<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:#dcfce7;color:#15803d;font-size:11px;font-weight:700;">ACTIVITY</span>`;

      return `
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:12px 10px;vertical-align:middle;text-align:center;font-size:13px;color:#64748b;">${idx + 1}</td>
          <td style="padding:12px 10px;vertical-align:middle;">${imgCell}</td>
          <td style="padding:12px 10px;vertical-align:middle;">
            <strong style="font-size:14px;color:#0b2e45;">${item.item_name}</strong><br/>
            ${typeBadge}
          </td>
          <td style="padding:12px 10px;vertical-align:middle;font-size:13px;color:#475569;">${dates}</td>
          <td style="padding:12px 10px;vertical-align:middle;font-size:13px;color:#475569;">${guests}</td>
          <td style="padding:12px 10px;vertical-align:middle;font-size:14px;font-weight:700;color:#0e4d6a;text-align:right;">${item.currency || order.currency} ${parseFloat(item.unit_price || 0).toLocaleString()}</td>
        </tr>`;
    })
    .join('');

  const html = wrapEmail({
    preheader: `New booking ${order.order_number} from ${user.full_name}`,
    eyebrow: '🔔 New Booking Received',
    title: `Order ${order.order_number}`,
    intro: `A new booking has been submitted and is awaiting your confirmation.`,
    body: `
      <!-- Customer Info -->
      <div style="background:#f0f7fa;border:1px solid #c3dde8;border-radius:16px;padding:18px 20px;margin:0 0 20px;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#0e4d6a;">Customer Details</p>
        <table role="presentation" cellspacing="0" cellpadding="0" style="font-size:14px;color:#334155;width:100%;">
          <tr><td style="padding:3px 0;width:110px;color:#64748b;">Name</td><td style="padding:3px 0;font-weight:600;">${user.full_name}</td></tr>
          <tr><td style="padding:3px 0;color:#64748b;">Email</td><td style="padding:3px 0;">${user.email}</td></tr>
          <tr><td style="padding:3px 0;color:#64748b;">Ordered at</td><td style="padding:3px 0;">${orderedAt}</td></tr>
          ${order.notes ? `<tr><td style="padding:3px 0;color:#64748b;">Notes</td><td style="padding:3px 0;">${order.notes}</td></tr>` : ''}
        </table>
      </div>

      <!-- Items Table -->
      <div style="border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;margin:0 0 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;border-collapse:collapse;">
          <thead>
            <tr style="background:#0e4d6a;">
              <th style="padding:10px;color:#ffffff;font-weight:700;font-size:12px;">#</th>
              <th style="padding:10px;color:#ffffff;font-weight:700;font-size:12px;text-align:left;">Image</th>
              <th style="padding:10px;color:#ffffff;font-weight:700;font-size:12px;text-align:left;">Item</th>
              <th style="padding:10px;color:#ffffff;font-weight:700;font-size:12px;text-align:left;">Dates</th>
              <th style="padding:10px;color:#ffffff;font-weight:700;font-size:12px;text-align:left;">Guests</th>
              <th style="padding:10px;color:#ffffff;font-weight:700;font-size:12px;text-align:right;">Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
      </div>

      <!-- Total -->
      <div style="background:linear-gradient(135deg,#0b2e45,#0e4d6a);border-radius:14px;padding:16px 20px;margin:0 0 20px;display:flex;justify-content:space-between;align-items:center;">
        <span style="color:rgba(255,255,255,0.75);font-size:14px;font-weight:600;">Total Amount</span>
        <span style="color:#f2c06a;font-size:20px;font-weight:800;">${order.currency} ${parseFloat(order.total_amount).toLocaleString()}</span>
      </div>
      <div style="background:#fff8ed;border:1px solid #f8d2a0;border-radius:12px;padding:14px 18px;margin:0 0 10px;">
        <p style="margin:0;font-size:13px;color:#92400e;">⚠️ This booking is <strong>PENDING</strong>. Please review and confirm or cancel it in the admin panel.</p>
      </div>
    `,
    footer: 'PathFinderSL Admin — do not reply to this notification.',
    ctaLabel: 'Go to Admin Panel',
    ctaUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/orders`,
  });

  const text = [
    `New Booking: ${order.order_number}`,
    `Customer: ${user.full_name} <${user.email}>`,
    `Ordered at: ${orderedAt}`,
    '',
    'Items:',
    ...items.map(
      (i, idx) =>
        `${idx + 1}. ${i.item_name} (${i.item_type}) | ${i.check_in ? `${i.check_in} → ${i.check_out || '?'}` : i.event_date || 'N/A'} | Adults: ${i.adult_count}, Children: ${i.child_count || 0} | ${i.currency || order.currency} ${parseFloat(i.unit_price).toLocaleString()}`
    ),
    '',
    `Total: ${order.currency} ${parseFloat(order.total_amount).toLocaleString()}`,
  ].join('\n');

  return { subject, html, text, attachments: buildAttachments() };
};

// ── Booking confirmed thank-you to customer ──────────────────────────────────
// Sent when admin changes order status to 'confirmed'
const buildBookingConfirmedEmail = ({ order, items, user }) => {
  const subject = `Your PathFinderSL Booking is Confirmed! 🎉 — ${order.order_number}`;
  const orderedAt = new Date(order.created_at).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const itemRows = items
    .map((item, idx) => {
      const imgCell = item.item_image
        ? `<img src="${item.item_image}" alt="${item.item_name}" width="64" height="64"
              style="object-fit:cover;border-radius:8px;display:block;" />`
        : `<div style="width:64px;height:64px;border-radius:8px;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-size:22px;">${item.item_type === 'hotel' ? '🏨' : '🎭'}</div>`;

      const dates = item.check_in
        ? `${item.check_in} → ${item.check_out || '?'}`
        : item.event_date || '—';

      const guests = `${item.adult_count || 0} adult${(item.adult_count || 0) !== 1 ? 's' : ''}${
        (item.child_count || 0) > 0 ? `, ${item.child_count} child${(item.child_count || 0) !== 1 ? 'ren' : ''}` : ''
      }`;

      const typeBadge =
        item.item_type === 'hotel'
          ? `<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-size:11px;font-weight:700;">HOTEL</span>`
          : `<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:#dcfce7;color:#15803d;font-size:11px;font-weight:700;">ACTIVITY</span>`;

      return `
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:12px 10px;vertical-align:middle;text-align:center;font-size:13px;color:#64748b;">${idx + 1}</td>
          <td style="padding:12px 10px;vertical-align:middle;">${imgCell}</td>
          <td style="padding:12px 10px;vertical-align:middle;">
            <strong style="font-size:14px;color:#0b2e45;">${item.item_name}</strong><br/>
            ${typeBadge}
          </td>
          <td style="padding:12px 10px;vertical-align:middle;font-size:13px;color:#475569;">${dates}</td>
          <td style="padding:12px 10px;vertical-align:middle;font-size:13px;color:#475569;">${guests}</td>
          <td style="padding:12px 10px;vertical-align:middle;font-size:14px;font-weight:700;color:#0e4d6a;text-align:right;">${item.currency || order.currency} ${parseFloat(item.unit_price || 0).toLocaleString()}</td>
        </tr>`;
    })
    .join('');

  const html = wrapEmail({
    preheader: `Great news! Your booking ${order.order_number} has been confirmed.`,
    eyebrow: '✅ Booking Confirmed',
    title: `Your trip is booked, ${user.full_name}!`,
    intro: `We're thrilled to confirm your booking. Your order <strong>${order.order_number}</strong> has been reviewed and confirmed by our team. Get ready for an amazing Sri Lanka experience!`,
    body: `
      <!-- Confirmation badge -->
      <div style="text-align:center;margin:0 0 24px;">
        <div style="display:inline-block;background:linear-gradient(135deg,#059669,#10b981);border-radius:999px;padding:10px 28px;">
          <span style="color:#ffffff;font-size:15px;font-weight:700;letter-spacing:0.05em;">✓ CONFIRMED</span>
        </div>
      </div>

      <!-- Order summary -->
      <div style="background:#f0f7fa;border:1px solid #c3dde8;border-radius:16px;padding:18px 20px;margin:0 0 20px;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#0e4d6a;">Booking Summary</p>
        <table role="presentation" cellspacing="0" cellpadding="0" style="font-size:14px;color:#334155;width:100%;">
          <tr><td style="padding:3px 0;width:130px;color:#64748b;">Order Number</td><td style="padding:3px 0;font-weight:700;color:#0e4d6a;">${order.order_number}</td></tr>
          <tr><td style="padding:3px 0;color:#64748b;">Booking Date</td><td style="padding:3px 0;">${orderedAt}</td></tr>
          <tr><td style="padding:3px 0;color:#64748b;">Status</td><td style="padding:3px 0;"><span style="color:#059669;font-weight:700;">Confirmed ✓</span></td></tr>
          ${order.notes ? `<tr><td style="padding:3px 0;color:#64748b;">Your Notes</td><td style="padding:3px 0;">${order.notes}</td></tr>` : ''}
        </table>
      </div>

      <!-- Items Table -->
      <div style="border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;margin:0 0 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;border-collapse:collapse;">
          <thead>
            <tr style="background:#0e4d6a;">
              <th style="padding:10px;color:#ffffff;font-weight:700;font-size:12px;">#</th>
              <th style="padding:10px;color:#ffffff;font-weight:700;font-size:12px;text-align:left;">Image</th>
              <th style="padding:10px;color:#ffffff;font-weight:700;font-size:12px;text-align:left;">Item</th>
              <th style="padding:10px;color:#ffffff;font-weight:700;font-size:12px;text-align:left;">Dates</th>
              <th style="padding:10px;color:#ffffff;font-weight:700;font-size:12px;text-align:left;">Guests</th>
              <th style="padding:10px;color:#ffffff;font-weight:700;font-size:12px;text-align:right;">Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
      </div>

      <!-- Total quotation box -->
      <div style="background:linear-gradient(135deg,#0b2e45,#0e4d6a);border-radius:14px;padding:20px 24px;margin:0 0 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="color:rgba(255,255,255,0.7);font-size:13px;">Subtotal (${items.length} item${items.length !== 1 ? 's' : ''})</td>
            <td style="text-align:right;color:#ffffff;font-size:14px;">${order.currency} ${parseFloat(order.total_amount).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding-top:10px;color:#f2c06a;font-size:16px;font-weight:800;">Total Payable</td>
            <td style="padding-top:10px;text-align:right;color:#f2c06a;font-size:22px;font-weight:800;">${order.currency} ${parseFloat(order.total_amount).toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <!-- Next steps -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:16px 20px;margin:0 0 10px;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#14532d;">What happens next?</p>
        <ul style="margin:0;padding-left:18px;color:#166534;font-size:13px;line-height:1.9;">
          <li>Our team will reach out with further details for your booking.</li>
          <li>For hotel bookings — check-in details will be sent separately.</li>
          <li>For activities — you'll receive timing and meeting-point info.</li>
          <li>Have questions? Reply to this email or message us on WhatsApp.</li>
        </ul>
      </div>
    `,
    footer:
      'Thank you for choosing PathFinderSL. We look forward to making your Sri Lanka journey unforgettable!<br /><br /><strong style="color:#102a43;">The PathFinderSL Team</strong>',
    ctaLabel: 'View My Booking',
    ctaUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders`,
  });

  const text = [
    `Hi ${user.full_name},`,
    '',
    `Great news! Your booking ${order.order_number} has been CONFIRMED.`,
    '',
    `Booking Summary:`,
    `  Order: ${order.order_number}`,
    `  Date: ${orderedAt}`,
    `  Status: Confirmed`,
    '',
    'Items:',
    ...items.map(
      (i, idx) =>
        `  ${idx + 1}. ${i.item_name} (${i.item_type}) | ${i.check_in ? `${i.check_in} → ${i.check_out || '?'}` : i.event_date || 'N/A'} | Adults: ${i.adult_count}, Children: ${i.child_count || 0} | ${i.currency || order.currency} ${parseFloat(i.unit_price).toLocaleString()}`
    ),
    '',
    `Total: ${order.currency} ${parseFloat(order.total_amount).toLocaleString()}`,
    '',
    'Thank you for choosing PathFinderSL!',
    'The PathFinderSL Team',
  ].join('\n');

  return { subject, html, text, attachments: buildAttachments() };
};

module.exports = {
  buildWelcomeEmail,
  buildOtpEmail,
  buildBookingNotificationEmail,
  buildBookingConfirmedEmail,
};
