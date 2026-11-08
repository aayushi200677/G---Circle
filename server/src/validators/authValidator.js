import { z } from 'zod';
import { ALLOWED_EMAIL_DOMAIN, ACADEMIC_YEARS, COURSES } from '../config/constants.js';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Full Name must be at least 2 characters'),
  studentId: z.string().trim().min(3, 'Student ID must be at least 3 characters'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address')
    .refine((val) => val.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`), {
      message: 'Please use your official Galgotias University email address (@galgotiasuniversity.ac.in).',
    }),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string(),
  academicYear: z.enum(ACADEMIC_YEARS, {
    errorMap: () => ({ message: 'Please select a valid academic year' }),
  }),
  course: z.string().min(1, 'Please select your course / branch'),
  linkedin: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  github: z.string().optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  otp: z.string().trim().length(6, 'OTP must be 6 digits'),
});

export const resendOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address')
    .refine((val) => val.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`), {
      message: 'Please use your official Galgotias University email address (@galgotiasuniversity.ac.in).',
    }),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address')
    .refine((val) => val.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`), {
      message: 'Please use your official Galgotias University email address.',
    }),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
