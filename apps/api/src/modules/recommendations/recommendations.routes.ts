import { Router, Response } from 'express';
import { prisma } from '../../config/prisma';
import { authGuard, AuthRequest } from '../../middleware/authGuard';

const router = Router();

// GET /api/recommendations/me — Personalized learning recommendations based on actual database gaps
router.get('/me', authGuard, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.user!.id },
    include: {
      jobRole: {
        include: {
          roleCompetencies: { include: { competency: true } },
        },
      },
      skillScores: { include: { competency: true } },
      skillGaps: { include: { competency: true } },
    },
  });

  const gaps = await prisma.skillGap.findMany({
    where: { userId: req.user!.id, gapPct: { gt: 0 } },
    include: { competency: true },
    orderBy: { priorityScore: 'desc' },
  });

  if (gaps.length === 0) {
    return res.json({
      recommendations: [],
      message: 'No competency gaps detected. All role benchmarks are fulfilled!',
    });
  }

  const gapCompIds = gaps.map((g) => g.competencyId);

  // Retrieve courses matching these specific competencies
  const relevantCourses = await prisma.course.findMany({
    where: {
      courseSkills: { some: { competencyId: { in: gapCompIds } } },
    },
    include: {
      courseSkills: { include: { competency: true } },
    },
    take: 10,
  });

  const recommendations = gaps.map((gap) => {
    const matchedCourse = relevantCourses.find((c) =>
      c.courseSkills.some((cs) => cs.competencyId === gap.competencyId)
    );

    const gapDiff = Math.max(1, Math.round(gap.requiredScore - gap.currentScore));
    const roleTitle = user.jobRole?.title || 'Operational Staff';

    return {
      id: `rec-${gap.id}`,
      competencyId: gap.competencyId,
      competencyName: gap.competency.name,
      currentScore: Math.round(gap.currentScore),
      requiredScore: gap.requiredScore,
      gap: gapDiff,
      priority: gap.priorityBand,
      recommendedLearning: matchedCourse?.title || `Advanced Mastery: ${gap.competency.name}`,
      courseId: matchedCourse?.id || null,
      provider: matchedCourse?.provider || 'INTERNAL',
      durationHrs: matchedCourse?.durationHrs || 6,
      reason: `Your ${gap.competency.name} proficiency is ${Math.round(gap.currentScore)}%, while the ${roleTitle} benchmark requires ${gap.requiredScore}%.`,
      expectedOutcome: `Bridge the ${gapDiff}-point deficit and elevate competency to Proficient benchmark.`,
    };
  });

  res.json({ recommendations });
});

export default router;
