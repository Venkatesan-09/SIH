import { Router, Response } from 'express';
import { prisma } from '../../config/prisma';
import { authGuard, AuthRequest } from '../../middleware/authGuard';

const router = Router();

// Proficiency levels helper based on requirements:
// 0–20: Novice, 21–40: Basic, 41–60: Developing, 61–80: Proficient, 81–100: Advanced
function getProficiencyLevel(score: number): 'Novice' | 'Basic' | 'Developing' | 'Proficient' | 'Advanced' {
  if (score <= 20) return 'Novice';
  if (score <= 40) return 'Basic';
  if (score <= 60) return 'Developing';
  if (score <= 80) return 'Proficient';
  return 'Advanced';
}

// Priority calculation helper:
// Gap >= 30: Critical, Gap 20-29: High, Gap 10-19: Medium, Gap 1-9: Low, Gap <= 0: No Gap
function getPriority(gap: number): 'Critical' | 'High' | 'Medium' | 'Low' | 'No Gap' {
  if (gap >= 30) return 'Critical';
  if (gap >= 20) return 'High';
  if (gap >= 10) return 'Medium';
  if (gap >= 1) return 'Low';
  return 'No Gap';
}

// GET /api/skilltwin/me — Full SkillTwin Profile with deterministic scores, benchmarks, and radar metrics
router.get('/me', authGuard, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.user!.id },
    include: {
      department: true,
      jobRole: {
        include: {
          roleCompetencies: {
            include: { competency: true },
            orderBy: { requiredScore: 'desc' },
          },
        },
      },
      skillScores: { include: { competency: true } },
      skillGaps: { include: { competency: true } },
    },
  });

  // If user has a jobRole, ensure roleCompetencies are mapped
  let roleCompetencies = user.jobRole?.roleCompetencies || [];

  // Fallback: If roleCompetencies array was empty (e.g. newly assigned role before seed), fetch directly
  if (roleCompetencies.length === 0 && user.jobRoleId) {
    roleCompetencies = await prisma.roleCompetency.findMany({
      where: { jobRoleId: user.jobRoleId },
      include: { competency: true },
      orderBy: { requiredScore: 'desc' },
    });
  }

  // If still empty (role without specific mappings yet), fall back to general core competencies
  if (roleCompetencies.length === 0) {
    const fallbackComps = await prisma.competency.findMany({
      take: 6,
      orderBy: { name: 'asc' },
    });
    roleCompetencies = fallbackComps.map((c) => ({
      id: `gen-${c.id}`,
      jobRoleId: user.jobRoleId || 'general',
      competencyId: c.id,
      requiredScore: 75,
      importance: 80,
      competency: c,
    })) as any;
  }

  // Auto-seed missing baseline skill scores for these competencies if user hasn't taken tests yet
  const years = user.yearsOfService ?? 3;
  const experienceComponent = Math.min(60, years * 10);
  const selfComponent = 50;
  const baselineScore = Math.round(selfComponent * 0.20 + experienceComponent * 0.10);

  for (const rc of roleCompetencies) {
    const existing = await prisma.skillScore.findFirst({
      where: { userId: user.id, competencyId: rc.competencyId },
    });
    if (!existing) {
      await prisma.skillScore.create({
        data: {
          userId: user.id,
          competencyId: rc.competencyId,
          assessmentComponent: 0,
          selfComponent,
          experienceComponent,
          trainingComponent: 0,
          currentScore: baselineScore,
          trend: 0,
        },
      });
    }

    const existingGap = await prisma.skillGap.findFirst({
      where: { userId: user.id, competencyId: rc.competencyId },
    });
    if (!existingGap) {
      const gapPct = Math.max(0, rc.requiredScore - baselineScore);
      const priorityScore = Math.round((gapPct / 100) * 50 + (rc.importance / 100) * 35 + 15);
      const priorityBand = priorityScore >= 80 ? 'CRITICAL' : priorityScore >= 60 ? 'HIGH' : priorityScore >= 35 ? 'MODERATE' : 'LOW';
      await prisma.skillGap.create({
        data: {
          userId: user.id,
          competencyId: rc.competencyId,
          currentScore: baselineScore,
          requiredScore: rc.requiredScore,
          gapPct,
          priorityScore,
          priorityBand: priorityBand as any,
        },
      });
    }
  }

  // Reload fresh scores and gaps — scoped to the current role's competencies only
  const roleCompetencyIds = roleCompetencies.map((rc) => rc.competencyId);
  const freshScores = await prisma.skillScore.findMany({
    where: { userId: user.id, competencyId: { in: roleCompetencyIds } },
    include: { competency: true },
  });
  const freshGaps = await prisma.skillGap.findMany({
    where: { userId: user.id, competencyId: { in: roleCompetencyIds } },
    include: { competency: true },
  });

  const scoreMap = new Map(freshScores.map((s) => [s.competencyId, s]));
  const gapMap = new Map(freshGaps.map((g) => [g.competencyId, g]));

  const competencies = roleCompetencies.map((rc) => {
    const scoreObj = scoreMap.get(rc.competencyId);
    const gapObj = gapMap.get(rc.competencyId);

    const currentScore = scoreObj?.currentScore ?? baselineScore;
    const requiredScore = rc.requiredScore;
    const gap = Math.max(0, requiredScore - currentScore);
    const proficiencyLevel = getProficiencyLevel(currentScore);
    const priority = getPriority(gap);

    return {
      competencyId: rc.competencyId,
      competencyName: rc.competency.name,
      cluster: rc.competency.cluster,
      currentScore,
      requiredScore,
      gap,
      proficiencyLevel,
      priority,
      importance: rc.importance,
      assessmentComponent: scoreObj?.assessmentComponent ?? 0,
      experienceComponent: scoreObj?.experienceComponent ?? 0,
      selfComponent: scoreObj?.selfComponent ?? 50,
      trainingComponent: scoreObj?.trainingComponent ?? 0,
      trend: scoreObj?.trend ?? 0,
    };
  });

  // Calculate radar chart series & summary indicators
  const avgCurrentScore = competencies.length > 0
    ? Math.round(competencies.reduce((acc, c) => acc + c.currentScore, 0) / competencies.length)
    : 0;
  const avgRequiredScore = competencies.length > 0
    ? Math.round(competencies.reduce((acc, c) => acc + c.requiredScore, 0) / competencies.length)
    : 75;

  const strengths = competencies.filter((c) => c.gap === 0 || c.currentScore >= c.requiredScore);
  const skillGaps = competencies.filter((c) => c.gap > 0).sort((a, b) => b.gap - a.gap);

  res.json({
    skillTwin: {
      userId: user.id,
      employeeName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      department: user.department?.name || 'Statistical Cadre',
      jobRole: user.jobRole?.title || 'Statistical Officer',
      yearsOfService: user.yearsOfService ?? 3,
      onboardingStatus: user.onboardingStatus,
      skillTwinGenerated: user.skillTwinGenerated,
      avgCurrentScore,
      avgRequiredScore,
      readinessPct: avgRequiredScore > 0 ? Math.min(100, Math.round((avgCurrentScore / avgRequiredScore) * 100)) : 0,
      competencies,
      strengths,
      skillGaps,
      radarData: competencies.slice(0, 8).map((c) => ({
        label: c.competencyName,
        value: c.currentScore,
        required: c.requiredScore,
      })),
    },
  });
});

// POST /api/skilltwin/generate — Finalize SkillTwin generation step (Step 5 -> 6 -> Dashboard)
router.post('/generate', authGuard, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      skillTwinGenerated: true,
      onboardingStatus: 'COMPLETED',
    },
    include: { department: true, jobRole: true },
  });

  res.json({
    success: true,
    message: 'SkillTwin successfully generated and finalized.',
    onboardingStatus: 'COMPLETED',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      onboardingStatus: user.onboardingStatus,
      skillTwinGenerated: user.skillTwinGenerated,
    },
  });
});

export default router;
