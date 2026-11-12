import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import prisma from '../../config/db.js';
import { signToken } from '../../utils/jwt.js';
import { generateOTP, sendVerificationEmail, sendPasswordResetEmail } from '../../utils/emailService.js';

const OTP_TTL_MS = 15 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_RESENDS_PER_HOUR = 5;
const OTP_MAX_ATTEMPTS = 5;
const GENERIC_RESET_MESSAGE = 'If an account exists with this email, a password reset link has been dispatched.';

const httpError = (message, statusCode) => Object.assign(new Error(message), { statusCode });

const getOtpHashSecret = () => {
  const secret = process.env.OTP_HASH_SECRET;
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw httpError('Authentication security is not configured. Please contact the administrator.', 500);
  }
  return secret;
};

const hashOtp = (email, otp) => crypto
  .createHmac('sha256', getOtpHashSecret())
  .update(`${email.toLowerCase()}:${String(otp)}`)
  .digest('hex');

const otpMatches = (email, submittedOtp, storedHash) => {
  if (typeof storedHash !== 'string' || !/^[a-f0-9]{64}$/i.test(storedHash)) return false;
  const candidate = Buffer.from(hashOtp(email, submittedOtp), 'hex');
  const stored = Buffer.from(storedHash, 'hex');
  return stored.length === candidate.length && crypto.timingSafeEqual(stored, candidate);
};

const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const sendOrCleanupRegistration = async ({ userId, verificationId, email, name, otp }) => {
  try {
    await sendVerificationEmail({ to: email, name, otp });
  } catch (error) {
    await prisma.$transaction([
      prisma.emailVerification.deleteMany({ where: { id: verificationId } }),
      prisma.user.deleteMany({ where: { id: userId, emailVerified: false } }),
    ]).catch(() => {
      // Keep the original delivery error; do not log credentials or verification data.
    });
    throw error;
  }
};

export const register = async (userData) => {
  const { name, studentId, email, password, academicYear, course, linkedin, github } = userData;
  const normalizedEmail = email.trim().toLowerCase();

  const [existingEmail, existingStudentId] = await Promise.all([
    prisma.user.findUnique({ where: { email: normalizedEmail } }),
    prisma.user.findUnique({ where: { studentId } }),
  ]);
  if (existingEmail) throw httpError('An account with this email already exists.', 409);
  if (existingStudentId) throw httpError('An account with this Student ID already exists.', 409);

  const hashedPassword = await bcrypt.hash(password, 12);
  const otp = generateOTP();
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  const otpHash = hashOtp(normalizedEmail, otp);

  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        studentId,
        email: normalizedEmail,
        password: hashedPassword,
        academicYear,
        course,
        linkedin: linkedin || null,
        github: github || null,
        emailVerified: false,
        preferences: {
          create: {
            communicationMethods: ['Voice discussions', 'Text-based communication'],
            collaborationStyle: 'Brainstorming together',
            availability: 'Flexible',
            themeMode: 'light',
            themeIntensity: 'classic',
          },
        },
      },
      select: { id: true, email: true, name: true },
    });
    const verification = await tx.emailVerification.create({
      data: { email: normalizedEmail, otpHash, token, expiresAt },
      select: { id: true },
    });
    return { user, verification };
  });

  await sendOrCleanupRegistration({
    userId: created.user.id,
    verificationId: created.verification.id,
    email: normalizedEmail,
    name,
    otp,
  });

  return {
    email: created.user.email,
    name: created.user.name,
    message: 'Registration successful. Please enter the verification code sent to your email.',
  };
};

export const verifyEmail = async ({ email, otp }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const verification = await prisma.emailVerification.findFirst({
    where: { email: normalizedEmail, verified: false },
    orderBy: { createdAt: 'desc' },
  });

  if (!verification) throw httpError('No pending verification request found for this email.', 400);
  const now = new Date();
  if (now >= verification.expiresAt) throw httpError('Verification code has expired. Please request a new one.', 400);
  if (verification.attempts >= OTP_MAX_ATTEMPTS) throw httpError('Too many failed attempts. Please request a new code.', 429);

  if (!otpMatches(normalizedEmail, otp, verification.otpHash)) {
    const updated = await prisma.emailVerification.updateMany({
      where: { id: verification.id, verified: false, attempts: { lt: OTP_MAX_ATTEMPTS } },
      data: { attempts: { increment: 1 } },
    });
    if (updated.count === 0) throw httpError('Too many failed attempts. Please request a new code.', 429);
    throw httpError('Invalid verification code.', 400);
  }

  const user = await prisma.$transaction(async (tx) => {
    const claimed = await tx.emailVerification.updateMany({
      where: {
        id: verification.id,
        verified: false,
        attempts: { lt: OTP_MAX_ATTEMPTS },
        expiresAt: { gt: now },
      },
      data: { verified: true },
    });
    if (claimed.count !== 1) throw httpError('This verification code is no longer valid. Request a new code.', 400);

    return tx.user.update({
      where: { email: normalizedEmail },
      data: { emailVerified: true },
      include: {
        preferences: true,
        skills: { include: { skill: true } },
        communicationSkills: { include: { communicationSkill: true } },
        languages: true,
      },
    });
  });

  const jwtToken = signToken({ userId: user.id, email: user.email });
  const { password: _password, ...safeUser } = user;
  return { user: safeUser, token: jwtToken };
};

export const resendOtp = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) throw httpError('If an account exists with this email, a new verification code can be requested.', 400);
  if (user.emailVerified) throw httpError('Email is already verified. Please log in.', 400);

  const now = new Date();
  const latest = await prisma.emailVerification.findFirst({
    where: { email: normalizedEmail, verified: false },
    orderBy: { createdAt: 'desc' },
  });
  if (latest && now.getTime() - latest.createdAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
    throw httpError('Please wait 60 seconds before requesting another verification code.', 429);
  }

  const recentCount = await prisma.emailVerification.count({
    where: { email: normalizedEmail, createdAt: { gte: new Date(now.getTime() - 60 * 60 * 1000) } },
  });
  if (recentCount >= OTP_MAX_RESENDS_PER_HOUR) {
    throw httpError('Too many verification-code requests. Please try again later.', 429);
  }

  const otp = generateOTP();
  const verification = await prisma.emailVerification.create({
    data: {
      email: normalizedEmail,
      otpHash: hashOtp(normalizedEmail, otp),
      token: crypto.randomBytes(32).toString('hex'),
      expiresAt: new Date(now.getTime() + OTP_TTL_MS),
    },
    select: { id: true },
  });

  try {
    await sendVerificationEmail({ to: normalizedEmail, name: user.name, otp });
  } catch (error) {
    await prisma.emailVerification.deleteMany({ where: { id: verification.id } }).catch(() => {});
    throw error;
  }

  await prisma.emailVerification.deleteMany({
    where: { email: normalizedEmail, verified: false, id: { not: verification.id } },
  });
  return { message: 'A new verification code has been sent to your email.' };
};

export const login = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      preferences: true,
      skills: { include: { skill: true } },
      communicationSkills: { include: { communicationSkill: true } },
      languages: true,
    },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw httpError('Invalid email or password.', 401);
  }
  if (!user.emailVerified) {
    throw Object.assign(httpError('Email not verified. Please verify your email before logging in.', 403), {
      requiresVerification: true,
      email: user.email,
    });
  }

  const token = signToken({ userId: user.id, email: user.email });
  const { password: _password, ...safeUser } = user;
  return { user: safeUser, token };
};

export const forgotPassword = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) return { message: GENERIC_RESET_MESSAGE };

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const record = await prisma.passwordResetToken.create({
    data: { userId: user.id, token: tokenHash, expiresAt },
    select: { id: true },
  });

  try {
    await sendPasswordResetEmail({ to: normalizedEmail, name: user.name, token: rawToken });
  } catch (error) {
    await prisma.passwordResetToken.deleteMany({ where: { id: record.id } }).catch(() => {});
    throw error;
  }

  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false, id: { not: record.id } },
    data: { used: true },
  });
  return { message: GENERIC_RESET_MESSAGE };
};

export const resetPassword = async ({ token, password }) => {
  const tokenHash = hashResetToken(token);
  const resetRecord = await prisma.passwordResetToken.findUnique({ where: { token: tokenHash } });
  const now = new Date();
  if (!resetRecord || resetRecord.used || now >= resetRecord.expiresAt) {
    throw httpError('Invalid or expired password reset token.', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.$transaction(async (tx) => {
    const claimed = await tx.passwordResetToken.updateMany({
      where: { id: resetRecord.id, used: false, expiresAt: { gt: now } },
      data: { used: true },
    });
    if (claimed.count !== 1) throw httpError('Invalid or expired password reset token.', 400);

    await tx.user.update({ where: { id: resetRecord.userId }, data: { password: hashedPassword } });
    await tx.passwordResetToken.updateMany({
      where: { userId: resetRecord.userId, used: false },
      data: { used: true },
    });
  });

  return { message: 'Password has been reset successfully. You can now log in.' };
};
