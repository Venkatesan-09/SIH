import { Router, Response } from 'express';
import { prisma } from '../../config/prisma';
import { authGuard, AuthRequest } from '../../middleware/authGuard';
import { roleGuard } from '../../middleware/authGuard';
import { Role } from '@prisma/client';

const router = Router();

// GET /api/skill-gaps — own gaps (EMPLOYEE) or any user (ADMIN with ?userId=)
// Only returns gaps for competencies that belong to the user's CURRENT job role.
router.get('/', authGuard, async (req: AuthRequest, res: Response) => {
  const isAdmin = req.user!.role === Role.ADMIN;
  const targetUserId = isAdmin && req.query['userId']
    ? String(req.query['userId'])
    : req.user!.id;

  // Resolve the target user's current job role so we can scope the gaps.
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      jobRoleId: true,
      jobRole: {
        select: {
          roleCompetencies: { select: { competencyId: true } },
        },
      },
    },
  });

  // Build competency filter: if the user has a role, scope gaps to that role only.
  const roleCompetencyIds = targetUser?.jobRole?.roleCompetencies.map((rc) => rc.competencyId) ?? [];

  const where: any = { userId: targetUserId };
  if (roleCompetencyIds.length > 0) {
    where.competencyId = { in: roleCompetencyIds };
  }

  const gaps = await prisma.skillGap.findMany({
    where,
    include: { competency: true },
    orderBy: { priorityScore: 'desc' },
  });

  res.json({ gaps });
});

import { getSkillIntelligence } from './skill-gap-intelligence.data';

// GET /api/skill-gaps/:id — single gap + AI explanation + skillScore breakdown + AI Intelligence Dossier
router.get('/:id', authGuard, async (req: AuthRequest, res: Response) => {
  const gap = await prisma.skillGap.findUniqueOrThrow({
    where: { id: req.params['id'] },
    include: { competency: true, user: { select: { jobRole: true } } },
  });

  // Authorization: employees can only see their own gaps
  if (req.user!.role !== Role.ADMIN && gap.userId !== req.user!.id) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied.' } });
  }

  // Fetch linked SkillScore breakdown
  const skillScore = await prisma.skillScore.findFirst({
    where: { userId: gap.userId, competencyId: gap.competencyId },
  });

  // Structured AI Intelligence: What, Why, When, and key curriculum topics
  const intelligence = getSkillIntelligence(gap.competency.name, gap.competency.cluster);

  // Check for cached AI explanation, or generate a deterministic one
  let cached = await prisma.recommendation.findFirst({
    where: { userId: gap.userId, competencyId: gap.competencyId, kind: 'gap_explanation' },
    orderBy: { createdAt: 'desc' },
  });

  if (!cached) {
    const gapDiff = Math.max(0, gap.requiredScore - gap.currentScore);
    const text = `Your current proficiency in ${gap.competency.name} is ${Math.round(gap.currentScore)}%, while your role requires ${gap.requiredScore}%. This ${Math.round(gapDiff)}-point deficit places this competency in the ${gap.priorityBand.toLowerCase()} priority zone. We recommend completing targeted coursework and assessments to elevate your score to required operational standards.`;
    cached = await prisma.recommendation.create({
      data: {
        userId: gap.userId,
        competencyId: gap.competencyId,
        message: text,
        kind: 'gap_explanation',
      },
    });
  }

  res.json({ gap, skillScore, explanation: cached?.message ?? null, intelligence });
});

export default router;
