const nodemailer = require('nodemailer');
const {
  buildWelcomeEmail,
  buildOtpEmail,
  buildBookingNotificationEmail,
  buildBookingConfirmedEmail,
} = require('./emailTemplates');

let transporter;

const getEnvValue = (...keys) => {
  const match = keys.find((key) => process.env[key]);
  return match ? process.env[match] : undefined;
};

const mailConfig = () => ({
  host: getEnvValue('MAIL_HOST', 'spring.mail.host'),
  port: getEnvValue('MAIL_PORT', 'spring.mail.port'),
  user: getEnvValue('MAIL_USER', 'MAIL_USERNAME', 'spring.mail.username'),
  password: getEnvValue('MAIL_PASSWORD', 'MAIL_PASS', 'spring.mail.password'),
  fromName: getEnvValue('MAIL_FROM_NAME') || 'PathFinderSL',
  fromAddress:
    getEnvValue('MAIL_FROM_ADDRESS') ||
    getEnvValue('MAIL_USER', 'MAIL_USERNAME', 'spring.mail.username'),
});

const isMailConfigured = () =>
  Boolean(
    mailConfig().host &&
      mailConfig().port &&
      mailConfig().user &&
      mailConfig().password
  );

const getTransporter = () => {
  if (!transporter) {
    const config = mailConfig();
    transporter = nodemailer.createTransport({
      host: config.host,
      port: Number(config.port),
      secure: false,
      requireTLS: true,
      auth: {
        user: config.user,
        pass: config.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return transporter;
};

const sendMail = async ({ to, subject, html, text, attachments = [] }) => {
  if (!isMailConfigured()) {
    throw new Error('Mail service is not configured');
  }

  const config = mailConfig();

  return getTransporter().sendMail({
    from: {
      name: config.fromName,
      address: config.fromAddress,
    },
    to,
    subject,
    html,
    text,
    attachments,
  });
};

const sendWelcomeEmail = async (user) => {
  const profileUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/profile`;
  const message = buildWelcomeEmail({ user, profileUrl });
  return sendMail({ to: user.email, ...message });
};

const sendPasswordOtpEmail = async ({ user, otp, portal }) => {
  const portalLabel = portal === 'admin' ? 'admin portal' : 'traveler account';
  const expiresInMinutes = Number(process.env.OTP_EXPIRY_MINUTES || 10);
  const message = buildOtpEmail({ user, otp, expiresInMinutes, portalLabel });
  return sendMail({ to: user.email, ...message });
};

// Send booking pending notification to admin
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'hasindut2@gmail.com';

const sendBookingNotificationToAdmin = async ({ order, items, user }) => {
  const message = buildBookingNotificationEmail({ order, items, user });
  return sendMail({ to: ADMIN_EMAIL, ...message });
};

// Send booking confirmed thank-you to customer
const sendBookingConfirmedToUser = async ({ order, items, user }) => {
  const message = buildBookingConfirmedEmail({ order, items, user });
  return sendMail({ to: user.email, ...message });
};

module.exports = {
  isMailConfigured,
  sendWelcomeEmail,
  sendPasswordOtpEmail,
  sendBookingNotificationToAdmin,
  sendBookingConfirmedToUser,
};
