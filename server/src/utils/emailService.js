import nodemailer from 'nodemailer';

let transporter = null;

if (process.env.EMAIL_SERVICE_ENABLED === 'true' && process.env.EMAIL_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendVerificationEmail = async ({ to, name, otp }) => {
  console.log(`\n======================================================`);
  console.log(`[EMAIL DISPATCH] University Verification Email`);
  console.log(`To: ${to} (${name})`);
  console.log(`Galgotias University Verification OTP: [ ${otp} ]`);
  console.log(`Valid for 15 minutes.`);
  console.log(`======================================================\n`);

  if (!transporter) {
    return { delivered: false, simulated: true, otp };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'G-CIRCLE <no-reply@galgotiasuniversity.ac.in>',
      to,
      subject: 'Verify your Galgotias University Email — G-CIRCLE',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E9DDCE; background-color: #FAF8F4;">
          <h2 style="color: #722F3E; margin-bottom: 8px;">G-CIRCLE</h2>
          <p style="color: #51212E; font-size: 14px; margin-top: 0;">Discover. Collaborate. Build.</p>
          <hr style="border: none; border-top: 1px solid #D8C8B6; margin: 16px 0;" />
          <p style="color: #2D151B; font-size: 16px;">Hello <strong>${name}</strong>,</p>
          <p style="color: #2D151B; line-height: 1.5;">Welcome to G-CIRCLE, the university collaboration ecosystem for Galgotias University students. Please use the verification code below to activate your account:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #FAF8F4; background-color: #722F3E; padding: 12px 28px; border-radius: 8px;">${otp}</span>
          </div>
          <p style="color: #51212E; font-size: 13px;">This OTP will expire in 15 minutes. If you did not register for G-CIRCLE, please disregard this email.</p>
        </div>
      `,
    });
    return { delivered: true, simulated: false, messageId: info.messageId, otp };
  } catch (err) {
    console.error('[EMAIL ERROR] Failed to send email via SMTP:', err.message);
    return { delivered: false, error: err.message, otp };
  }
};

export const sendPasswordResetEmail = async ({ to, name, token }) => {
  const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  console.log(`\n======================================================`);
  console.log(`[EMAIL DISPATCH] Password Reset Link`);
  console.log(`To: ${to} (${name})`);
  console.log(`Reset Link: ${resetLink}`);
  console.log(`======================================================\n`);

  if (!transporter) {
    return { delivered: false, simulated: true, resetLink };
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'G-CIRCLE <no-reply@galgotiasuniversity.ac.in>',
      to,
      subject: 'Reset your password — G-CIRCLE',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E9DDCE; background-color: #FAF8F4;">
          <h2 style="color: #722F3E;">G-CIRCLE Password Reset</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Click the button below to reset your password. This link is valid for 1 hour.</p>
          <a href="${resetLink}" style="display: inline-block; background-color: #722F3E; color: #FAF8F4; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin: 16px 0;">Reset Password</a>
        </div>
      `,
    });
    return { delivered: true, resetLink };
  } catch (err) {
    return { delivered: false, error: err.message, resetLink };
  }
};
