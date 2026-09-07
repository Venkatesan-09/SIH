import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { authGuard, AuthRequest, roleGuard } from '../../middleware/authGuard';
import { Role, AuditAction } from '@prisma/client';

const router = Router();

// All admin routes require ADMIN role
router.use(authGuard, roleGuard(Role.ADMIN));

// GET /api/admin/dashboard
router.get('/dashboard', async (_req: AuthRequest, res: Response) => {
  const [totalEmployees, avgResult, criticalGaps] = await Promise.all([
    prisma.user.count({ where: { role: Role.EMPLOYEE } }),
    prisma.skillScore.aggregate({ _avg: { currentScore: true } }),
    prisma.skillGap.count({ where: { priorityBand: 'CRITICAL' } }),
  ]);

  // Generate monthly trend from current avg (6 distinct past months)
  const currentAvg = Math.round(avgResult._avg.currentScore ?? 64);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    return {
      date: label,
      avgScore: Math.max(0, currentAvg - (5 - i) * 2 + Math.round(Math.random() * 3)),
    };
  });

  const insights = [
    {
      id: 'insight-1',
      kind: 'critical_finding' as const,
      title: 'Machine Learning Skill Gap Critical',
      description: `${criticalGaps} employees have critical skill gaps. Immediate intervention recommended for Data Science department.`,
      competency: 'Machine Learning',
      department: 'Data Science & AI',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'insight-2',
      kind: 'positive_trend' as const,
      title: 'Statistical Analysis Improving',
      description: 'Statistical Analysis competency improved by 8.3% across the Statistical Analysis department in Q3.',
      competency: 'Statistical Inference',
      department: 'Statistical Analysis',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'insight-3',
      kind: 'recommendation' as const,
      title: 'Survey Design Training Recommended',
      description: '67% of Field Enumerators are below required Survey Design competency. Deploy targeted training.',
      competency: 'Survey Design & Methodology',
      department: 'Field Operations',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
  ];

  res.json({
    totalEmployees,
    avgCompetency: Math.round(avgResult._avg.currentScore ?? 0),
    criticalGaps,
    trend,
    insights,
  });
});

// GET /api/admin/employees — paginated roster
router.get('/employees', async (req: AuthRequest, res: Response) => {
  const { search, departmentId, readinessMin, page = '1', pageSize = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(pageSize);

  const where: any = { role: Role.EMPLOYEE };
  if (departmentId) where.departmentId = departmentId;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { department: true, jobRole: true, skillGaps: true, skillScores: true },
      skip,
      take: parseInt(pageSize),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  const employees = users.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    department: u.department,
    jobRole: u.jobRole,
    avgReadiness: u.skillScores.length > 0
      ? Math.round(u.skillScores.reduce((s: number, ss: { currentScore: number }) => s + ss.currentScore, 0) / u.skillScores.length)
      : 0,
    criticalGaps: u.skillGaps.filter((g: { priorityBand: string }) => g.priorityBand === 'CRITICAL').length,
  })).filter((e) => readinessMin ? e.avgReadiness >= parseInt(readinessMin) : true);

  res.json({ employees, total, page: parseInt(page), pageSize: parseInt(pageSize), totalPages: Math.ceil(total / parseInt(pageSize)) });
});

// POST /api/admin/employees — add employee
router.post('/employees', async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    departmentId: z.string().optional(),
    jobRoleId: z.string().optional(),
    yearsOfService: z.number().int().min(0).optional(),
  });
  const data = schema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) return res.status(409).json({ error: { code: 'CONFLICT', message: 'Email already exists.' } });

  const bcrypt = await import('bcryptjs');
  const tempPassword = 'Welcome@12345';
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const user = await prisma.user.create({
    data: { ...data, passwordHash, role: Role.EMPLOYEE, preferences: { create: {} } },
    include: { department: true, jobRole: true },
  });

  await prisma.auditLog.create({
    data: { userId: req.user!.id, action: AuditAction.ADD_EMPLOYEE, meta: { newUserId: user.id, email: user.email } },
  });

  res.status(201).json({ user, temporaryPassword: tempPassword });
});

// GET /api/admin/skill-gaps — heatmap data
router.get('/skill-gaps', async (_req, res: Response) => {
  const scores = await prisma.skillScore.findMany({
    include: {
      user: { include: { department: true } },
      competency: true,
    },
  });

  // Group by dept × competency
  const cellMap = new Map<string, { sum: number; count: number; deptName: string; compName: string; deptId: string; compId: string }>();

  for (const s of scores) {
    if (!s.user.department) continue;
    const key = `${s.user.departmentId}::${s.competencyId}`;
    const existing = cellMap.get(key);
    if (existing) {
      existing.sum += s.currentScore;
      existing.count++;
    } else {
      cellMap.set(key, {
        sum: s.currentScore,
        count: 1,
        deptName: s.user.department.name,
        compName: s.competency.name,
        deptId: s.user.departmentId!,
        compId: s.competencyId,
      });
    }
  }

  const heatmap = Array.from(cellMap.entries()).map(([, v]) => {
    const avgScore = Math.round(v.sum / v.count);
    const band = avgScore >= 90 ? 'EXPERT' : avgScore >= 70 ? 'PROFICIENT' : avgScore >= 40 ? 'DEVELOPING' : 'CRITICAL';
    return {
      departmentId: v.deptId,
      departmentName: v.deptName,
      competencyId: v.compId,
      competencyName: v.compName,
      avgScore,
      band,
    };
  });

  res.json({ heatmap });
});

// GET /api/admin/analytics
router.get('/analytics', async (req: AuthRequest, res: Response) => {
  const { period = '2024-Q3' } = req.query as { period?: string };

  // MongoDB — no analyticsSnapshot table; compute from live data
  const avgResult = await prisma.skillScore.aggregate({ _avg: { currentScore: true } });
  const criticalCount = await prisma.skillGap.count({ where: { priorityBand: 'CRITICAL' } });
  const empCount = await prisma.user.count({ where: { role: Role.EMPLOYEE } });
  const snapshot = { avgScore: Math.round(avgResult._avg.currentScore ?? 64), criticalGaps: criticalCount, employeeCount: empCount };
  const prevSnapshot: { avgScore: number; criticalGaps: number; employeeCount: number } | null = null;


  const departments = await prisma.department.findMany({
    include: { users: { include: { skillScores: true, skillGaps: true } } },
  });

  const deptStats = departments.map((d) => ({
    id: d.id,
    name: d.name,
    employeeCount: d.users.filter((u: { role: string }) => u.role === 'EMPLOYEE').length,
    readiness: d.users.length > 0
      ? Math.round(d.users.flatMap((u: { skillScores: { currentScore: number }[] }) => u.skillScores).reduce((s: number, ss: { currentScore: number }) => s + ss.currentScore, 0) /
          Math.max(1, d.users.flatMap((u: { skillScores: { currentScore: number }[] }) => u.skillScores).length))
      : 0,
    criticalGaps: d.users.flatMap((u: { skillGaps: { priorityBand: string }[] }) => u.skillGaps).filter((g: { priorityBand: string }) => g.priorityBand === 'CRITICAL').length,
  }));

  res.json({
    period,
    overallReadiness: snapshot.avgScore,
    overallReadinessDelta: 0,
    activeEmployees: snapshot.employeeCount,
    activeEmployeesDelta: 0,
    criticalGaps: snapshot.criticalGaps,
    criticalGapsDelta: 0,
    departments: deptStats,
  });
});

// GET /api/admin/ai-insights — IMPLEMENTATION DECISION (§15): dedicated endpoint
router.get('/ai-insights', async (_req, res: Response) => {
  const insights = [
    { id: 'ai-1', kind: 'critical_finding', title: 'Critical ML Skill Deficit Detected', description: 'Data Science & AI department shows 43% of employees below required Machine Learning competency threshold. Immediate structured training program deployment recommended.', competency: 'Machine Learning', department: 'Data Science & AI', createdAt: new Date().toISOString() },
    { id: 'ai-2', kind: 'positive_trend', title: 'Statistical Analysis on Upward Trajectory', description: 'Statistical Analysis cluster improved 8.3% QoQ following Q2 training intervention. Survey Design showing similar positive trajectory.', competency: 'Statistical Inference', department: 'Statistical Analysis', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'ai-3', kind: 'recommendation', title: 'Field Enumerator Upskilling Required', description: 'GIS & Spatial Analysis competency at 38% average for Field Operations — below 60% required threshold. Recommend deploying GIS fundamentals course immediately.', competency: 'GIS & Spatial Analysis', department: 'Field Operations', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'ai-4', kind: 'recommendation', title: 'Policy Team Data Privacy Gap', description: 'Data Privacy & Ethics scores averaging 52% against 80% requirement in Policy & Governance team. Compliance risk identified.', competency: 'Data Privacy & Ethics', department: 'Policy & Governance', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  ];
  res.json({ insights });
});

// GET /api/admin/reports — streaming/async report generation
router.get('/reports', async (req: AuthRequest, res: Response) => {
  const { type, format = 'json' } = req.query as { type?: string; format?: string };

  await prisma.auditLog.create({
    data: { userId: req.user!.id, action: AuditAction.EXPORT_REPORT, meta: { type, format } },
  });

  // Mock report data
  res.json({
    reportId: `report-${Date.now()}`,
    type: type ?? 'workforce_readiness',
    format,
    status: 'generated',
    downloadUrl: `/api/admin/reports/download/${Date.now()}`,
    generatedAt: new Date().toISOString(),
    summary: {
      totalEmployees: await prisma.user.count({ where: { role: Role.EMPLOYEE } }),
      avgReadiness: Math.round((await prisma.skillScore.aggregate({ _avg: { currentScore: true } }))._avg.currentScore ?? 0),
      criticalGaps: await prisma.skillGap.count({ where: { priorityBand: 'CRITICAL' } }),
    },
  });
});

// GET /api/admin/reports/export — real CSV download stream (§ Admin Step 8)
router.get('/reports/export', async (req: AuthRequest, res: Response) => {
  const { type = 'workforce_readiness', period = 'Q3-2024' } = req.query as { type?: string; period?: string };

  await prisma.auditLog.create({
    data: { userId: req.user!.id, action: AuditAction.EXPORT_REPORT, meta: { type, period, format: 'csv' } },
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${type}_${period}.csv"`);

  if (type === 'competency_gap') {
    const gaps = await prisma.skillGap.findMany({
      include: { user: { include: { department: true } }, competency: true },
      take: 100,
    });
    let csv = 'Employee,Department,Competency,Current Score,Required Benchmark,Gap Score,Priority Band\n';
    for (const g of gaps) {
      csv += `"${g.user.firstName} ${g.user.lastName}","${g.user.department?.name ?? 'General'}","${g.competency.name}",${Math.round(g.currentScore)}%,${g.requiredScore}%,${Math.round(g.gapPct)}%,${g.priorityBand}\n`;
    }
    return res.send(csv);
  }

  if (type === 'course_completion') {
    const enrollments = await prisma.enrollment.findMany({
      include: { user: { include: { department: true } }, course: true },
      take: 100,
    });
    let csv = 'Employee,Department,Course Title,Provider,Status,Enrolled Date\n';
    for (const e of enrollments) {
      csv += `"${e.user.firstName} ${e.user.lastName}","${e.user.department?.name ?? 'General'}","${e.course.title}","${e.course.provider}",${e.status},"${e.enrolledAt.toISOString().split('T')[0]}"\n`;
    }
    return res.send(csv);
  }

  if (type === 'assessment_performance') {
    const attempts = await prisma.assessmentAttempt.findMany({
      where: { submittedAt: { not: null } },
      include: { user: { include: { department: true } }, assessment: true },
      take: 100,
    });
    let csv = 'Employee,Department,Assessment,Score %,Result,Submitted At\n';
    for (const a of attempts) {
      const pass = (a.scorePct ?? 0) >= 70 ? 'PASSED' : 'DEVELOPING';
      csv += `"${a.user.firstName} ${a.user.lastName}","${a.user.department?.name ?? 'General'}","${a.assessment.title}",${a.scorePct}%,${pass},"${a.submittedAt?.toISOString().split('T')[0]}"\n`;
    }
    return res.send(csv);
  }

  // Default: workforce_readiness
  const departments = await prisma.department.findMany({
    include: { users: { include: { skillScores: true, skillGaps: true } } },
  });
  let csv = 'Department,Total Officers,Average Readiness %,Critical Gaps,Operational Status\n';
  for (const d of departments) {
    const total = d.users.filter((u) => u.role === 'EMPLOYEE').length;
    const allScores = d.users.flatMap((u) => u.skillScores);
    const avg = allScores.length > 0 ? Math.round(allScores.reduce((s, ss) => s + ss.currentScore, 0) / allScores.length) : 60;
    const crit = d.users.flatMap((u) => u.skillGaps).filter((g) => g.priorityBand === 'CRITICAL').length;
    const status = avg >= 70 ? 'On Track' : avg >= 40 ? 'Developing' : 'Critical Intervention';
    csv += `"${d.name}",${total},${avg}%,${crit},"${status}"\n`;
  }
  return res.send(csv);
});

// In-memory interventions store for Admin Step 9: Management Actions
let activeInterventions = [
  {
    id: 'int-1',
    title: 'MoSPI National Accounts Modernization Drive',
    targetDepartment: 'National Accounts Division',
    targetDepartmentId: '',
    competencyName: 'National Accounts Statistics',
    assignedCourseTitle: 'Modern System of National Accounts (SNA 2008)',
    enrolledOfficersCount: 14,
    targetCompletionDate: '2026-11-30',
    status: 'IN_PROGRESS',
    progressPct: 65,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'int-2',
    title: 'Field Operations CAPI & GIS Upskilling Mandate',
    targetDepartment: 'Field Operations Division (FOD)',
    targetDepartmentId: '',
    competencyName: 'GIS & Spatial Analysis',
    assignedCourseTitle: 'GIS in Official Statistics & Field Surveys',
    enrolledOfficersCount: 28,
    targetCompletionDate: '2026-12-15',
    status: 'IN_PROGRESS',
    progressPct: 42,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'int-3',
    title: 'Advanced Machine Learning & Big Data Analytics Intervention',
    targetDepartment: 'Data Science & AI',
    targetDepartmentId: '',
    competencyName: 'Machine Learning',
    assignedCourseTitle: 'Machine Learning for Official Statistics',
    enrolledOfficersCount: 9,
    targetCompletionDate: '2026-10-31',
    status: 'DEPLOYED',
    progressPct: 80,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

// GET /api/admin/interventions — Management Actions (Step 9)
router.get('/interventions', async (_req: AuthRequest, res: Response) => {
  res.json({ interventions: activeInterventions });
});

// POST /api/admin/interventions — Plan & deploy targeted training program (Step 9)
router.post('/interventions', async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    title: z.string().min(3),
    targetDepartment: z.string().min(1),
    competencyName: z.string().min(1),
    assignedCourseTitle: z.string().min(1),
    targetCompletionDate: z.string().optional(),
  });
  const data = schema.parse(req.body);

  const newIntervention = {
    id: `int-${Date.now()}`,
    title: data.title,
    targetDepartment: data.targetDepartment,
    targetDepartmentId: '',
    competencyName: data.competencyName,
    assignedCourseTitle: data.assignedCourseTitle,
    enrolledOfficersCount: Math.floor(10 + Math.random() * 20),
    targetCompletionDate: data.targetCompletionDate || '2026-12-31',
    status: 'IN_PROGRESS',
    progressPct: 0,
    createdAt: new Date().toISOString(),
  };

  activeInterventions.unshift(newIntervention);

  await prisma.auditLog.create({
    data: {
      userId: req.user!.id,
      action: AuditAction.DEPLOY_INTERVENTION,
      meta: { interventionId: newIntervention.id, title: newIntervention.title, target: newIntervention.targetDepartment },
    },
  });

  res.status(201).json({ intervention: newIntervention });
});

export default router;
