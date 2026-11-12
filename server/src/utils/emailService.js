import nodemailer from 'nodemailer';

let transporter;

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]));

const getTransporter = () => {
  if (process.env.EMAIL_SERVICE_ENABLED !== 'true') {
    const error = new Error('Email delivery is unavailable. Please try again later.');
    error.statusCode = 503;
    throw error;
  }

  const { EMAIL_HOST, EMAIL_USER, EMAIL_PASS } = process.env;
  const port = Number.parseInt(process.env.EMAIL_PORT || '587', 10);
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS || !Number.isInteger(port)) {
    const error = new Error('Email delivery is not configured. Please contact the administrator.');
    error.statusCode = 503;
    throw error;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port,
      secure: port === 465,
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });
  }
  return transporter;
};

const send = async (message) => {
  try {
    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    await getTransporter().sendMail({ ...message, from });
  } catch (cause) {
    // Do not log SMTP details, message content, OTPs, or reset URLs.
    const error = new Error('We could not deliver the email. Please try again later.');
    error.statusCode = 503;
    error.cause = cause;
    throw error;
  }
};

const getClientUrl = () => {
  const raw = process.env.CLIENT_URL || 'http://localhost:5173';
  let url;
  try {
    url = new URL(raw);
  } catch {
    const error = new Error('The password-reset client URL is not configured correctly.');
    error.statusCode = 500;
    throw error;
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    const error = new Error('The password-reset client URL must use HTTP or HTTPS.');
    error.statusCode = 500;
    throw error;
  }
  return url.origin;
};

export const generateOTP = () => String(cryptoRandomInt(0, 1_000_000)).padStart(6, '0');

// Imported lazily through Node's built-in crypto module to keep this file dependency-light.
import { randomInt as cryptoRandomInt } from 'node:crypto';

export const sendVerificationEmail = async ({ to, name, otp }) => {
  const safeName = escapeHtml(name || 'there');
  await send({
    to,
    subject: 'Verify your email address — G-Circle',
    text: `Hello ${name || 'there'}, your G-Circle verification code is ${otp}. It expires in 15 minutes. If you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:28px;color:#172033">
        <h2 style="color:#087FF5">G-Circle</h2>
        <p>Hello <strong>${safeName}</strong>,</p>
        <p>Use this verification code to complete your G-Circle registration:</p>
        <p style="font-size:30px;font-weight:700;letter-spacing:7px;padding:16px;background:#EAF4FF;text-align:center;border-radius:8px">${otp}</p>
        <p>This code expires in 15 minutes. If you did not request it, you can ignore this email.</p>
        <p style="color:#64748b;font-size:12px">Discover. Collaborate. Build.</p>
      </div>`,
  });
};

export const sendPasswordResetEmail = async ({ to, name, token }) => {
  const safeName = escapeHtml(name || 'there');
  const resetUrl = new URL('/reset-password', getClientUrl());
  resetUrl.searchParams.set('token', token);
  const resetLink = resetUrl.toString();

  await send({
    to,
    subject: 'Reset your G-Circle password',
    text: `Hello ${name || 'there'}, use this link to reset your G-Circle password. It expires in 1 hour: ${resetLink}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:28px;color:#172033">
        <h2 style="color:#087FF5">G-Circle password reset</h2>
        <p>Hello <strong>${safeName}</strong>,</p>
        <p>We received a request to reset your password. This link expires in one hour.</p>
        <p><a href="${escapeHtml(resetLink)}" style="display:inline-block;background:#087FF5;color:#fff;text-decoration:none;padding:12px 22px;border-radius:7px">Reset password</a></p>
        <p>If you did not request a password reset, you can ignore this email.</p>
      </div>`,
  });
};
