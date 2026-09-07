import { prisma } from '../../config/prisma';

/**
 * Deterministic competency score formula (§19):
 * currentScore = assessment*0.60 + self*0.20 + experience*0.10 + training*0.10
 *
 * Weights are intentionally NOT hardcoded as magic numbers — they come from
 * a single source of truth here so changing them only requires editing this file.
 * IMPLEMENTATION DECISION (§20): expose via config table in a future iteration.
 */
const WEIGHTS = {
  assessment: 0.60,
  self: 0.20,
  experience: 0.10,
  training: 0.10,
} as const;

export function computeScore(components: {
  assessmentComponent: number;
  selfComponent: number;
  experienceComponent: number;
  trainingComponent: number;
}): number {
  const raw =
    components.assessmentComponent * WEIGHTS.assessment +
    components.selfComponent * WEIGHTS.self +
    components.experienceComponent * WEIGHTS.experience +
    components.trainingComponent * WEIGHTS.training;
  return Math.round(Math.min(100, Math.max(0, raw)));
}

/**
 * Recomputes SkillScore for a user+competency pair, then triggers gap recompute.
 * Called after: assessment submission, course completion, self-assessment update.
 * NEVER called by the AI service — AI only reads scores, never writes them.
 */
export async function recomputeSkillScore(userId: string, competencyId: string): Promise<void> {
  const current = await prisma.skillScore.findFirst({
    where: { userId, competencyId },
  });

  if (!current) return; // no score record yet — nothing to recompute

  const prevScore = current.currentScore;
  const newScore = computeScore({
    assessmentComponent: current.assessmentComponent,
    selfComponent: current.selfComponent,
    experienceComponent: current.experienceComponent,
    trainingComponent: current.trainingComponent,
  });
  const trend = newScore - prevScore;

  await prisma.skillScore.updateMany({
    where: { userId, competencyId },
    data: { currentScore: newScore, trend, lastAssessedAt: new Date() },
  });

  // Cascade to gap recompute
  await recomputeSkillGap(userId, competencyId);
}

/**
 * Gap engine formula (§20):
 * gapPct = max(0, required - current)
 * priorityScore = (gapPct/100)*0.5 + (importance/100)*0.35 + recencyFactor*0.15
 */
const GAP_WEIGHTS = {
  severity: 0.5,
  importance: 0.35,
  recency: 0.15,
} as const;

function computeRecencyFactor(lastAssessedAt: Date | null): number {
  if (!lastAssessedAt) return 0.4; // never assessed → low recency confidence
  const daysSince = (Date.now() - lastAssessedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince <= 30) return 1.0;
  if (daysSince >= 180) return 0.4;
  // linear interpolation between 30d (1.0) and 180d (0.4)
  return 1.0 - ((daysSince - 30) / 150) * 0.6;
}

export async function recomputeSkillGap(userId: string, competencyId: string): Promise<void> {
  const [score, roleComp] = await Promise.all([
    prisma.skillScore.findFirst({ where: { userId, competencyId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { jobRoleId: true } }).then(async (u: { jobRoleId: string | null } | null) => {
      if (!u?.jobRoleId) return null;
      return prisma.roleCompetency.findFirst({
        where: { jobRoleId: u.jobRoleId, competencyId },
      });
    }),
  ]);

  if (!score || !roleComp) return; // can't compute without both

  const currentScore = score.currentScore;
  const requiredScore = roleComp.requiredScore;
  const gapPct = Math.max(0, requiredScore - currentScore);

  const recencyFactor = computeRecencyFactor(score.lastAssessedAt);
  const rawPriority =
    (gapPct / 100) * GAP_WEIGHTS.severity +
    (roleComp.importance / 100) * GAP_WEIGHTS.importance +
    recencyFactor * GAP_WEIGHTS.recency;
  const priorityScore = Math.round(rawPriority * 100);

  const priorityBand =
    priorityScore >= 80 ? 'CRITICAL' :
    priorityScore >= 60 ? 'HIGH' :
    priorityScore >= 35 ? 'MODERATE' : 'LOW';

  const existingGap = await prisma.skillGap.findFirst({ where: { userId, competencyId } });
  if (existingGap) {
    await prisma.skillGap.updateMany({
      where: { userId, competencyId },
      data: { currentScore, requiredScore, gapPct, priorityScore, priorityBand: priorityBand as any, computedAt: new Date() },
    });
  } else {
    await prisma.skillGap.create({
      data: { userId, competencyId, currentScore, requiredScore, gapPct, priorityScore, priorityBand: priorityBand as any },
    });
  }
}
