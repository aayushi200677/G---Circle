import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../../config/db.js';
import { ALLOWED_EMAIL_DOMAIN } from '../../config/constants.js';
import { signToken } from '../../utils/jwt.js';
import { generateOTP, sendVerificationEmail, sendPasswordResetEmail } from '../../utils/emailService.js';

export const register = async (userData) => {
  const { name, studentId, email, password, academicYear, course, linkedin, github } = userData;

  if (!email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
    const error = new Error('Please use your official Galgotias University email address (@galgotiasuniversity.ac.in).');
    error.statusCode = 400;
    throw error;
  }

  // Check unique constraints
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    const error = new Error('An account with this university email already exists.');
    error.statusCode = 409;
    throw error;
  }

  const existingStudentId = await prisma.user.findUnique({ where: { studentId } });
  if (existingStudentId) {
    const error = new Error('An account with this Student ID already exists.');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOTP();
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  // Store verification token
  await prisma.emailVerification.create({
    data: {
      email,
      otp,
      token,
      expiresAt,
    },
  });

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      studentId,
      email,
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
    include: {
      preferences: true,
    },
  });

  // Send verification email
  await sendVerificationEmail({ to: email, name, otp });

  return {
    email: user.email,
    name: user.name,
    message: 'Registration successful. Please enter the verification OTP sent to your university email.',
  };
};

export const verifyEmail = async ({ email, otp }) => {
  const verification = await prisma.emailVerification.findFirst({
    where: {
      email,
      verified: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!verification) {
    const error = new Error('No pending verification request found for this email.');
    error.statusCode = 400;
    throw error;
  }

  if (new Date() > verification.expiresAt) {
    const error = new Error('Verification OTP has expired. Please request a new one.');
    error.statusCode = 400;
    throw error;
  }

  if (verification.attempts >= 5) {
    const error = new Error('Too many failed attempts. Please request a new OTP.');
    error.statusCode = 429;
    throw error;
  }

  if (verification.otp !== otp) {
    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { attempts: { increment: 1 } },
    });
    const error = new Error('Invalid OTP. Please check and try again.');
    error.statusCode = 400;
    throw error;
  }

  // Mark verification completed
  await prisma.emailVerification.update({
    where: { id: verification.id },
    data: { verified: true },
  });

  // Update user emailVerified
  const user = await prisma.user.update({
    where: { email },
    data: { emailVerified: true },
    include: {
      preferences: true,
      skills: { include: { skill: true } },
      communicationSkills: { include: { communicationSkill: true } },
      languages: true,
    },
  });

  const jwtToken = signToken({ userId: user.id, email: user.email });
  const { password, ...safeUser } = user;

  return {
    user: safeUser,
    token: jwtToken,
  };
};

export const resendOtp = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.emailVerified) {
    const error = new Error('Email is already verified. Please log in.');
    error.statusCode = 400;
    throw error;
  }

  const otp = generateOTP();
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.emailVerification.create({
    data: {
      email,
      otp,
      token,
      expiresAt,
    },
  });

  await sendVerificationEmail({ to: email, name: user.name, otp });
  return { message: 'A new verification OTP has been sent to your university email.' };
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      preferences: true,
      skills: { include: { skill: true } },
      communicationSkills: { include: { communicationSkill: true } },
      languages: true,
    },
  });

  if (!user) {
    const error = new Error('Invalid university email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid university email or password.');
    error.statusCode = 401;
    throw error;
  }

  if (!user.emailVerified) {
    const error = new Error('University email not verified. Please verify your email before logging in.');
    error.statusCode = 403;
    error.requiresVerification = true;
    error.email = user.email;
    throw error;
  }

  const token = signToken({ userId: user.id, email: user.email });
  const { password: _, ...safeUser } = user;

  return {
    user: safeUser,
    token,
  };
};

export const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // For security, still return success message
    return { message: 'If an account exists with this email, a password reset link has been dispatched.' };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  await sendPasswordResetEmail({ to: email, name: user.name, token });
  return { message: 'If an account exists with this email, a password reset link has been dispatched.' };
};

export const resetPassword = async ({ token, password }) => {
  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetRecord || resetRecord.used || new Date() > resetRecord.expiresAt) {
    const error = new Error('Invalid or expired password reset token.');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: resetRecord.userId },
    data: { password: hashedPassword },
  });

  await prisma.passwordResetToken.update({
    where: { id: resetRecord.id },
    data: { used: true },
  });

  return { message: 'Password has been reset successfully. You can now log in.' };
};
