import { Router, Response } from 'express';
import { prisma } from '../../config/prisma';
import { authGuard, AuthRequest } from '../../middleware/authGuard';

const router = Router();

router.get('/', authGuard, async (_req: AuthRequest, res: Response) => {
  const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
  res.json({ departments });
});

router.get('/:id', authGuard, async (req: AuthRequest, res: Response) => {
  const dept = await prisma.department.findUniqueOrThrow({ where: { id: req.params['id'] } });
  res.json({ department: dept });
});

export default router;
