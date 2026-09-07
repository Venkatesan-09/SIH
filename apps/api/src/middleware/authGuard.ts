import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { createError } from './errorHandler';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

/**
 * authGuard — verifies JWT access token from Authorization: Bearer header
 * Attaches req.user = { id, email, role } for downstream use
 */
export async function authGuard(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError('No authorization token provided.', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.slice(7);

  let payload: { sub: string; email: string; role: Role };
  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as typeof payload;
  } catch {
    throw createError('Invalid or expired access token.', 401, 'UNAUTHORIZED');
  }

  // Verify user still exists (guards against deleted accounts)
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    throw createError('User account not found.', 401, 'UNAUTHORIZED');
  }

  req.user = user;
  next();
}

/**
 * roleGuard — must be used AFTER authGuard
 * Enforces role-based access control server-side (§18)
 */
export function roleGuard(...allowedRoles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createError('Not authenticated.', 401, 'UNAUTHORIZED');
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw createError(
        `Access denied. Requires one of: ${allowedRoles.join(', ')}`,
        403,
        'FORBIDDEN'
      );
    }
    next();
  };
}
