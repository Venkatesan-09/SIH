import { Router, Response } from 'express';
import { prisma } from '../../config/prisma';
import { authGuard, AuthRequest } from '../../middleware/authGuard';

const router = Router();

// GET /api/progress
router.get('/', authGuard, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  // Resolve current role's competency IDs so we scope all data to the active role
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      jobRoleId: true,
      jobRole: {
        select: {
          roleCompetencies: { select: { competencyId: true } },
        },
      },
    },
  });
  const roleCompetencyIds = currentUser?.jobRole?.roleCompetencies.map((rc) => rc.competencyId) ?? [];

  // Competency growth over time — scoped to current role competencies only
  const skillScores = await prisma.skillScore.findMany({
    where: {
      userId,
      ...(roleCompetencyIds.length > 0 ? { competencyId: { in: roleCompetencyIds } } : {}),
    },
    include: { competency: true },
    orderBy: { updatedAt: 'asc' },
  });

  // Simulate monthly growth series from current score and trend
  const now = new Date();
  const growthSeries = Array.from({ length: 6 }, (_: unknown, i: number) => {
    const date = new Date(now);
    date.setMonth(date.getMonth() - (5 - i));
    const avgScore = skillScores.length > 0
      ? skillScores.reduce((sum: number, s: { currentScore: number; trend: number }) => sum + Math.max(0, s.currentScore - s.trend * (5 - i) * 0.5), 0) / skillScores.length
      : 0;
    return { date: date.toISOString().slice(0, 7), score: Math.round(avgScore) };
  });


  // Total hours from progress records
  const progressRecords = await prisma.progress.findMany({ where: { userId } });
  const totalHours = progressRecords.reduce((sum: number, p: { hoursLogged: number }) => sum + p.hoursLogged, 0);

  // Assessment scores
  const attempts = await prisma.assessmentAttempt.findMany({
    where: { userId, submittedAt: { not: null } },
    include: { assessment: true },
    orderBy: { submittedAt: 'desc' },
    take: 10,
  });
  const assessmentScores = attempts.map((a: { assessment: { title: string }; scorePct: number | null; submittedAt: Date | null; startedAt: Date }) => ({
    assessmentTitle: a.assessment.title,
    scorePct: a.scorePct ?? 0,
    date: (a.submittedAt ?? a.startedAt).toISOString(),
  }));

  // Completed courses
  const completedEnrollments = await prisma.enrollment.findMany({
    where: { userId, status: 'COMPLETED' },
    include: { course: { include: { courseSkills: { include: { competency: true } } } } },
    orderBy: { completedAt: 'desc' },
  });
  const completedCourses = completedEnrollments.map((e: { course: any }) => e.course);

  res.json({ growthSeries, totalHours, assessmentScores, completedCourses });
});

export default router;
