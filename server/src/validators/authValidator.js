import { z } from 'zod';
import { ACADEMIC_YEARS } from '../config/constants.js';

const emailSchema = z.string().trim().toLowerCase().email('Please enter a valid email address');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Full Name must be at least 2 characters').max(100),
  studentId: z.string().trim().min(3, 'Student ID must be at least 3 characters').max(50),
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters long').max(128),
  confirmPassword: z.string(),
  academicYear: z.enum(ACADEMIC_YEARS, {
    errorMap: () => ({ message: 'Please select a valid academic year' }),
  }),
  course: z.string().trim().min(1, 'Please select your course / branch').max(100),
  linkedin: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  github: z.string().url('Please enter a valid GitHub URL').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const verifyEmailSchema = z.object({
  email: emailSchema,
  otp: z.string().trim().regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
});

export const resendOtpSchema = z.object({ email: emailSchema });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(128),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z.object({
  token: z.string().min(32, 'Reset token is invalid').max(512),
  password: z.string().min(8, 'Password must be at least 8 characters long').max(128),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
