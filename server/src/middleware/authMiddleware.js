import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';
import prisma from '../config/db.js';

export const requireAuth = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return sendError(res, 'Authentication required. No token provided.', 401);
    }
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return sendError(res, 'Invalid or expired token. Please log in again.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        preferences: true,
      },
    });

    if (!user) {
      return sendError(res, 'User account no longer exists.', 401);
    }

    if (!user.emailVerified) {
      return sendError(res, 'University email not verified. Please verify your email first.', 403);
    }

    // Attach user (without password)
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (error) {
    console.error('[AUTH MIDDLEWARE ERROR]', error);
    return sendError(res, 'Authentication failed.', 401);
  }
};
