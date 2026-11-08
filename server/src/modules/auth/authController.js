import * as authService from './authService.js';
import {
  registerSchema,
  verifyEmailSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../../validators/authValidator.js';
import { sendSuccess } from '../../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.register(validatedData);
    return sendSuccess(res, result, result.message, 201);
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const validatedData = verifyEmailSchema.parse(req.body);
    const result = await authService.verifyEmail(validatedData);
    return sendSuccess(res, result, 'University email verified successfully.', 200);
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const validatedData = resendOtpSchema.parse(req.body);
    const result = await authService.resendOtp(validatedData.email);
    return sendSuccess(res, result, result.message, 200);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.login(validatedData);
    return sendSuccess(res, result, 'Logged in successfully.', 200);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const validatedData = forgotPasswordSchema.parse(req.body);
    const result = await authService.forgotPassword(validatedData.email);
    return sendSuccess(res, result, result.message, 200);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(validatedData);
    return sendSuccess(res, result, result.message, 200);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  return sendSuccess(res, null, 'Logged out successfully.', 200);
};
