import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from './authController.js';

const router = Router();

const createLimiter = (windowMs, limit, message) => rateLimit({
  windowMs,
  limit,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message },
});

const registerLimiter = createLimiter(15 * 60 * 1000, 5, 'Too many registration attempts. Please try again later.');
const verifyLimiter = createLimiter(15 * 60 * 1000, 10, 'Too many verification attempts. Please try again later.');
const resendLimiter = createLimiter(60 * 60 * 1000, 5, 'Too many verification-code requests. Please try again later.');
const loginLimiter = createLimiter(15 * 60 * 1000, 10, 'Too many login attempts. Please try again later.');
const forgotLimiter = createLimiter(60 * 60 * 1000, 5, 'Too many password-reset requests. Please try again later.');
const resetLimiter = createLimiter(15 * 60 * 1000, 10, 'Too many password-reset attempts. Please try again later.');

router.post('/register', registerLimiter, authController.register);
router.post('/verify-email', verifyLimiter, authController.verifyEmail);
router.post('/resend-otp', resendLimiter, authController.resendOtp);
router.post('/login', loginLimiter, authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', forgotLimiter, authController.forgotPassword);
router.post('/reset-password', resetLimiter, authController.resetPassword);

export default router;
