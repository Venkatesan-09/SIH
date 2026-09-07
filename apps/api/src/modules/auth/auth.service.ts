import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { createError } from '../../middleware/errorHandler';
import { RegisterDto, LoginDto } from './auth.schemas';
import { AuditAction, Role } from '@prisma/client';

const HASH_ROUNDS = 12;

function signAccessToken(payload: { sub: string; email: string; role: Role }): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_TTL } as any);
}

function signRefreshToken(sub: string): string {
  return jwt.sign({ sub }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_TTL } as any);
}

function safeUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    departmentId: user.departmentId,
    jobRoleId: user.jobRoleId,
    yearsOfService: user.yearsOfService,
    highestQualification: user.highestQualification ?? null,
    specialization: user.specialization ?? null,
    onboardingStatus: user.onboardingStatus ?? (user.skillTwinGenerated ? 'COMPLETED' : user.roleCompleted ? 'ASSESSMENT_REQUIRED' : user.profileCompleted ? 'ROLE_REQUIRED' : 'PROFILE_REQUIRED'),
    profileCompleted: !!user.profileCompleted,
    roleCompleted: !!user.roleCompleted,
    assessmentCompleted: !!user.assessmentCompleted,
    skillTwinGenerated: !!user.skillTwinGenerated,
    department: user.department ?? null,
    jobRole: user.jobRole ?? null,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
  };
}

export async function register(dto: RegisterDto) {
  const existing = await prisma.user.findUnique({ where: { email: dto.email } });
  if (existing) throw createError('Email already registered.', 409, 'EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(dto.password, HASH_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      departmentId: dto.departmentId ?? null,
      jobRoleId: dto.jobRoleId ?? null,
      yearsOfService: dto.yearsOfService ?? null,
      preferences: { create: {} },
    },
    include: { department: true, jobRole: true },
  });

  await prisma.auditLog.create({
    data: { userId: user.id, action: AuditAction.REGISTER, meta: { email: user.email } },
  });

  // Seed initial skill scores from role requirements
  if (user.jobRoleId) {
    await seedInitialSkillScores(user.id, user.jobRoleId, user.yearsOfService ?? 0);
  }

  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken(user.id);

  return { user: safeUser(user), accessToken, refreshToken };
}

export async function login(dto: LoginDto, ipAddress?: string) {
  const user = await prisma.user.findUnique({
    where: { email: dto.email },
    include: { department: true, jobRole: true },
  });

  if (!user) throw createError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');

  const valid = await bcrypt.compare(dto.password, user.passwordHash);
  if (!valid) throw createError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');

  await prisma.auditLog.create({
    data: { userId: user.id, action: AuditAction.LOGIN, meta: { email: user.email }, ipAddress },
  });

  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken(user.id);

  return { user: safeUser(user), accessToken, refreshToken };
}

export async function refreshTokens(token: string) {
  let payload: { sub: string };
  try {
    payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string };
  } catch {
    throw createError('Invalid or expired refresh token.', 401, 'UNAUTHORIZED');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw createError('User not found.', 401, 'UNAUTHORIZED');

  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const newRefreshToken = signRefreshToken(user.id);

  return { accessToken, refreshToken: newRefreshToken };
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { department: true, jobRole: true },
  });
  if (!user) throw createError('User not found.', 404, 'NOT_FOUND');
  return safeUser(user);
}

/** Seed initial SkillScore rows from role requirements and years-of-service heuristic */
async function seedInitialSkillScores(userId: string, jobRoleId: string, yearsOfService: number) {
  const roleComps = await prisma.roleCompetency.findMany({
    where: { jobRoleId },
    include: { competency: true },
  });

  for (const rc of roleComps) {
    // Experience component: 10 pts per year capped at 60
    const experienceComponent = Math.min(60, yearsOfService * 10);
    const selfComponent = 50; // neutral starting self-assessment
    const assessmentComponent = 0; // no assessments taken yet
    const trainingComponent = 0;

    const currentScore = Math.round(
      assessmentComponent * 0.60 +
      selfComponent * 0.20 +
      experienceComponent * 0.10 +
      trainingComponent * 0.10
    );

    const existing = await prisma.skillScore.findFirst({ where: { userId, competencyId: rc.competencyId } });
    if (!existing) {
      await prisma.skillScore.create({
        data: { userId, competencyId: rc.competencyId, assessmentComponent, selfComponent, experienceComponent, trainingComponent, currentScore, trend: 0 },
      });
    }

    const gapPct = Math.max(0, rc.requiredScore - currentScore);
    const priorityScore = Math.round((gapPct / 100) * 50 + (rc.importance / 100) * 35 + 15);
    const priorityBand = priorityScore >= 80 ? 'CRITICAL' : priorityScore >= 60 ? 'HIGH' : priorityScore >= 35 ? 'MODERATE' : 'LOW';

    const existingGap = await prisma.skillGap.findFirst({ where: { userId, competencyId: rc.competencyId } });
    if (!existingGap) {
      await prisma.skillGap.create({
        data: { userId, competencyId: rc.competencyId, currentScore, requiredScore: rc.requiredScore, gapPct, priorityScore, priorityBand: priorityBand as any },
      });
    }
  }
}
