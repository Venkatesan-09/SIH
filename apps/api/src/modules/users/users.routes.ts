import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { authGuard, AuthRequest } from '../../middleware/authGuard';
import { createError } from '../../middleware/errorHandler';
import { AuditAction } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();

// GET /api/users/me — current user profile
router.get('/me', authGuard, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.user!.id },
    include: { department: true, jobRole: true, preferences: true },
  });
  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

// Helper to format safe user object with onboarding flags
function formatSafeUser(user: any) {
  const { passwordHash: _, ...safe } = user;
  return {
    ...safe,
    onboardingStatus: safe.onboardingStatus ?? (safe.skillTwinGenerated ? 'COMPLETED' : safe.roleCompleted ? 'ASSESSMENT_REQUIRED' : safe.profileCompleted ? 'ROLE_REQUIRED' : 'PROFILE_REQUIRED'),
  };
}

// PATCH /api/users/me/profile — Step 2: Complete Profile
router.patch('/me/profile', authGuard, async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    highestQualification: z.string().min(1, 'Highest qualification is required').optional(),
    specialization: z.string().optional(),
    yearsOfService: z.number().int().min(0).optional(),
    departmentId: z.string().optional(),
  });

  const data = schema.parse(req.body);

  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: req.user!.id },
    select: { id: true, jobRoleId: true },
  });

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...data,
      profileCompleted: true,
      onboardingStatus: currentUser.jobRoleId ? 'ASSESSMENT_REQUIRED' : 'ROLE_REQUIRED',
    },
    include: { department: true, jobRole: true },
  });

  res.json({ user: formatSafeUser(user) });
});

// PATCH /api/users/me/role — Step 3: Select Department & Job Role
router.patch('/me/role', authGuard, async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    departmentId: z.string().min(1, 'Department is required'),
    jobRoleId: z.string().min(1, 'Job role is required'),
  });

  const { departmentId, jobRoleId } = schema.parse(req.body);

  // Validate existence
  await prisma.department.findUniqueOrThrow({ where: { id: departmentId } });
  const role = await prisma.jobRole.findUniqueOrThrow({
    where: { id: jobRoleId },
    include: { roleCompetencies: { include: { competency: true } } },
  });

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      departmentId,
      jobRoleId,
      roleCompleted: true,
      onboardingStatus: 'ASSESSMENT_REQUIRED',
    },
    include: { department: true, jobRole: true },
  });

  // ── Role Switch: purge stale gaps & scores from any previous role ────────
  // Keep only records whose competencyId belongs to the new role.
  const newCompetencyIds = role.roleCompetencies.map((rc) => rc.competencyId);

  await prisma.skillGap.deleteMany({
    where: { userId: user.id, competencyId: { notIn: newCompetencyIds } },
  });
  await prisma.skillScore.deleteMany({
    where: { userId: user.id, competencyId: { notIn: newCompetencyIds } },
  });

  // ── Seed baseline skill scores and initial gaps for the new role ──────────
  const years = user.yearsOfService ?? 3;
  for (const rc of role.roleCompetencies) {
    const experienceComponent = Math.min(60, years * 10);
    const selfComponent = 50;
    const currentScore = Math.round(selfComponent * 0.20 + experienceComponent * 0.10);

    const existingScore = await prisma.skillScore.findFirst({
      where: { userId: user.id, competencyId: rc.competencyId },
    });

    if (existingScore) {
      await prisma.skillScore.update({
        where: { id: existingScore.id },
        data: { experienceComponent, currentScore },
      });
    } else {
      await prisma.skillScore.create({
        data: {
          userId: user.id,
          competencyId: rc.competencyId,
          assessmentComponent: 0,
          selfComponent,
          experienceComponent,
          trainingComponent: 0,
          currentScore,
          trend: 0,
        },
      });
    }

    const gapPct = Math.max(0, rc.requiredScore - currentScore);
    const priorityScore = Math.round((gapPct / 100) * 50 + (rc.importance / 100) * 35 + 15);
    const priorityBand = priorityScore >= 80 ? 'CRITICAL' : priorityScore >= 60 ? 'HIGH' : priorityScore >= 35 ? 'MODERATE' : 'LOW';

    const existingGap = await prisma.skillGap.findFirst({
      where: { userId: user.id, competencyId: rc.competencyId },
    });

    if (existingGap) {
      await prisma.skillGap.update({
        where: { id: existingGap.id },
        data: { currentScore, requiredScore: rc.requiredScore, gapPct, priorityScore, priorityBand: priorityBand as any },
      });
    } else {
      await prisma.skillGap.create({
        data: {
          userId: user.id,
          competencyId: rc.competencyId,
          currentScore,
          requiredScore: rc.requiredScore,
          gapPct,
          priorityScore,
          priorityBand: priorityBand as any,
        },
      });
    }
  }

  res.json({ user: formatSafeUser(user), competencies: role.roleCompetencies });
});

// PATCH /api/users/me — general update (backward compatibility)
router.patch('/me', authGuard, async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    departmentId: z.string().optional(),
    jobRoleId: z.string().optional(),
    yearsOfService: z.number().int().min(0).optional(),
    highestQualification: z.string().optional(),
    specialization: z.string().optional(),
  });
  const data = schema.parse(req.body);

  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: req.user!.id },
    select: { id: true, firstName: true, jobRoleId: true },
  });

  const profileCompleted = !!(data.firstName || currentUser.firstName);
  const roleCompleted = !!(data.jobRoleId || currentUser.jobRoleId);

  const onboardingStatus = roleCompleted
    ? 'ASSESSMENT_REQUIRED'
    : profileCompleted
    ? 'ROLE_REQUIRED'
    : 'PROFILE_REQUIRED';

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...data,
      ...(data.firstName ? { profileCompleted: true } : {}),
      ...(data.jobRoleId ? { roleCompleted: true, onboardingStatus: 'ASSESSMENT_REQUIRED' } : {}),
    },
    include: { department: true, jobRole: true },
  });

  // If job role is updated/set, calibrate and seed skill scores & gaps
  if (user.jobRoleId) {
    const years = user.yearsOfService ?? 0;
    const roleComps = await prisma.roleCompetency.findMany({
      where: { jobRoleId: user.jobRoleId },
    });

    // ── Purge stale data from any previous role ───────────────────────────
    const newIds = roleComps.map((rc) => rc.competencyId);
    await prisma.skillGap.deleteMany({
      where: { userId: user.id, competencyId: { notIn: newIds } },
    });
    await prisma.skillScore.deleteMany({
      where: { userId: user.id, competencyId: { notIn: newIds } },
    });

    for (const rc of roleComps) {
      const experienceComponent = Math.min(60, years * 10);
      const selfComponent = 50;
      const currentScore = Math.round(selfComponent * 0.20 + experienceComponent * 0.10);

      const existingScore = await prisma.skillScore.findFirst({ where: { userId: user.id, competencyId: rc.competencyId } });
      if (existingScore) {
        await prisma.skillScore.update({ where: { id: existingScore.id }, data: { experienceComponent, currentScore } });
      } else {
        await prisma.skillScore.create({
          data: {
            userId: user.id,
            competencyId: rc.competencyId,
            assessmentComponent: 0,
            selfComponent,
            experienceComponent,
            trainingComponent: 0,
            currentScore,
            trend: 0,
          },
        });
      }

      const gapPct = Math.max(0, rc.requiredScore - currentScore);
      const priorityScore = Math.round((gapPct / 100) * 50 + (rc.importance / 100) * 35 + 15);
      const priorityBand = priorityScore >= 80 ? 'CRITICAL' : priorityScore >= 60 ? 'HIGH' : priorityScore >= 35 ? 'MODERATE' : 'LOW';

      const existingGap = await prisma.skillGap.findFirst({ where: { userId: user.id, competencyId: rc.competencyId } });
      if (existingGap) {
        await prisma.skillGap.update({ where: { id: existingGap.id }, data: { currentScore, requiredScore: rc.requiredScore, gapPct, priorityScore, priorityBand: priorityBand as any } });
      } else {
        await prisma.skillGap.create({
          data: {
            userId: user.id,
            competencyId: rc.competencyId,
            currentScore,
            requiredScore: rc.requiredScore,
            gapPct,
            priorityScore,
            priorityBand: priorityBand as any,
          },
        });
      }
    }
  }

  res.json({ user: formatSafeUser(user) });
});

// GET /api/users/me/preferences — retrieve user preferences
router.get('/me/preferences', authGuard, async (req: AuthRequest, res: Response) => {
  let prefs = await prisma.userPreferences.findUnique({
    where: { userId: req.user!.id },
  });

  if (!prefs) {
    prefs = await prisma.userPreferences.create({
      data: { userId: req.user!.id },
    });
  }

  res.json({ preferences: prefs });
});

// PATCH /api/users/me/preferences — settings page
router.patch('/me/preferences', authGuard, async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
    assessmentReminders: z.boolean().optional(),
    twoFactorEnabled: z.boolean().optional(),
    dataSharing: z.boolean().optional(),
    personalizationLevel: z.number().int().min(1).max(3).optional(),
    predictiveModeling: z.boolean().optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
    language: z.string().optional(),
  });
  const data = schema.parse(req.body);

  const prefs = await prisma.userPreferences.upsert({
    where: { userId: req.user!.id },
    update: data,
    create: { userId: req.user!.id, ...data },
  });

  await prisma.auditLog.create({
    data: { userId: req.user!.id, action: AuditAction.SETTINGS_CHANGED },
  });

  res.json({ preferences: prefs });
});

// PATCH /api/users/me/password — change password
router.patch('/me/password', authGuard, async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(12).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
  });
  const { currentPassword, newPassword } = schema.parse(req.body);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw createError('Current password is incorrect.', 401, 'INVALID_CREDENTIALS');

  const newHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: req.user!.id }, data: { passwordHash: newHash } });
  await prisma.auditLog.create({ data: { userId: req.user!.id, action: AuditAction.PASSWORD_CHANGED } });

  res.json({ message: 'Password changed successfully.' });
});

export default router;
