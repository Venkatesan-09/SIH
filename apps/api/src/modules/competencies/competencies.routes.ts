import { Router, Response } from 'express';
import { prisma } from '../../config/prisma';
import { authGuard, AuthRequest } from '../../middleware/authGuard';

const router = Router();

// GET /api/competencies/me — current user's skill scores
router.get('/me', authGuard, async (req: AuthRequest, res: Response) => {
  const skillScores = await prisma.skillScore.findMany({
    where: { userId: req.user!.id },
    include: { competency: true },
    orderBy: { currentScore: 'asc' },
  });
  res.json({ skillScores });
});

// GET /api/competencies — full catalogue
router.get('/', authGuard, async (_req: AuthRequest, res: Response) => {
  const competencies = await prisma.competency.findMany({ orderBy: { cluster: 'asc' } });
  res.json({ competencies });
});

// GET /api/competencies/:id
router.get('/:id', authGuard, async (req: AuthRequest, res: Response) => {
  const competency = await prisma.competency.findUniqueOrThrow({
    where: { id: req.params['id'] },
  });

  // Include this user's role competency requirement if available
  let roleCompetency = null;
  if (req.user) {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { jobRoleId: true } });
    if (user?.jobRoleId) {
      roleCompetency = await prisma.roleCompetency.findFirst({
        where: { jobRoleId: user.jobRoleId, competencyId: competency.id },
      });
    }
  }

  res.json({ competency, roleCompetency });
});

export default router;
