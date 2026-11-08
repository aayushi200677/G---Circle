import { ZodError } from 'zod';
import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  try {
    console.error('[SERVER ERROR]', err?.message || err);
  } catch (_) {}

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, formattedErrors[0]?.message || 'Validation failed', 400, formattedErrors);
  }

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    const target = err.meta?.target ? ` (${err.meta.target.join(', ')})` : '';
    return sendError(res, `A record with this information already exists${target}.`, 409);
  }

  // Prisma foreign key error
  if (err.code === 'P2003') {
    return sendError(res, 'Referenced record was not found.', 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  return sendError(res, message, statusCode);
};
