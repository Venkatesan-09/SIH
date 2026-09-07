import { Router, Response } from 'express';
import { prisma } from '../../config/prisma';
import { authGuard, AuthRequest } from '../../middleware/authGuard';

const router = Router();

router.get('/', authGuard, async (req: AuthRequest, res: Response) => {
  const { departmentId } = req.query as { departmentId?: string };
  const jobRoles = await prisma.jobRole.findMany({
    where: departmentId ? { departmentId } : undefined,
    include: { department: true, roleCompetencies: { include: { competency: true } } },
    orderBy: { title: 'asc' },
  });
  res.json({ jobRoles });
});

router.get('/:id', authGuard, async (req: AuthRequest, res: Response) => {
  const jobRole = await prisma.jobRole.findUniqueOrThrow({
    where: { id: req.params['id'] },
    include: { department: true, roleCompetencies: { include: { competency: true } } },
  });
  res.json({ jobRole });
});

// GET /api/roles/:id/competencies — required competencies for a specific job role
router.get('/:id/competencies', authGuard, async (req: AuthRequest, res: Response) => {
  const roleCompetencies = await prisma.roleCompetency.findMany({
    where: { jobRoleId: req.params['id'] },
    include: { competency: true, jobRole: true },
    orderBy: { requiredScore: 'desc' },
  });
  res.json({ roleCompetencies });
});

export default router;
