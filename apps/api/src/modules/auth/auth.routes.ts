import { Router, Request, Response } from 'express';
import { registerSchema, loginSchema, refreshSchema } from './auth.schemas';
import * as authService from './auth.service';
import { authGuard, AuthRequest } from '../../middleware/authGuard';
import { authLimiter } from '../../middleware/rateLimit';
import { AuditAction } from '@prisma/client';
import { prisma } from '../../config/prisma';

const router = Router();

// POST /api/auth/register
router.post('/register', authLimiter, async (req: Request, res: Response) => {
  const dto = registerSchema.parse(req.body);
  const result = await authService.register(dto);
  res
    .cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(201)
    .json({ user: result.user, accessToken: result.accessToken });
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  const dto = loginSchema.parse(req.body);
  const ip = req.ip ?? req.socket.remoteAddress;
  const result = await authService.login(dto, ip);
  res
    .cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({ user: result.user, accessToken: result.accessToken });
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No refresh token provided.' } });
  }
  const result = await authService.refreshTokens(token);
  res
    .cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({ accessToken: result.accessToken });
});

// GET /api/auth/me
router.get('/me', authGuard, async (req: AuthRequest, res: Response) => {
  const user = await authService.me(req.user!.id);
  res.json({ user });
});

// POST /api/auth/logout
router.post('/logout', authGuard, async (req: AuthRequest, res: Response) => {
  await prisma.auditLog.create({
    data: { userId: req.user!.id, action: AuditAction.LOGOUT },
  });
  res.clearCookie('refreshToken').status(204).send();
});

export default router;
