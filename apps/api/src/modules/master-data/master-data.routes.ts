import { Router, Response } from 'express';
import { prisma } from '../../config/prisma';
import { authGuard, AuthRequest } from '../../middleware/authGuard';

const router = Router();

// Static lists for standardized education and experience brackets
export const EDUCATION_QUALIFICATIONS = [
  { category: 'Undergraduate', code: 'B_STAT', name: 'Bachelor of Statistics (B.Stat)' },
  { category: 'Undergraduate', code: 'BSC_STAT', name: 'B.Sc Statistics' },
  { category: 'Undergraduate', code: 'BSC_MATH', name: 'B.Sc Mathematics' },
  { category: 'Undergraduate', code: 'BSC_CS', name: 'B.Sc Computer Science' },
  { category: 'Undergraduate', code: 'BTECH_BE', name: 'B.Tech / B.E in Engineering/CS' },
  { category: 'Undergraduate', code: 'BA_ECON', name: 'B.A Economics' },
  { category: 'Undergraduate', code: 'UG_OTHER', name: 'Other Bachelor Degree' },
  { category: 'Postgraduate', code: 'M_STAT', name: 'Master of Statistics (M.Stat)' },
  { category: 'Postgraduate', code: 'MSC_STAT', name: 'M.Sc Statistics' },
  { category: 'Postgraduate', code: 'MSC_MATH', name: 'M.Sc Mathematics' },
  { category: 'Postgraduate', code: 'MSC_DS', name: 'M.Sc Data Science' },
  { category: 'Postgraduate', code: 'MA_ECON', name: 'M.A Economics / Econometrics' },
  { category: 'Postgraduate', code: 'MCA', name: 'Master of Computer Applications (MCA)' },
  { category: 'Postgraduate', code: 'MTECH_ME', name: 'M.Tech / M.E' },
  { category: 'Postgraduate', code: 'PG_OTHER', name: 'Other Master Degree' },
  { category: 'Professional', code: 'PGD_DA', name: 'PG Diploma in Data Analytics' },
  { category: 'Professional', code: 'PGD_STAT', name: 'PG Diploma in Applied Statistics' },
  { category: 'Professional', code: 'PROF_CERT', name: 'Professional Data/AI Certification' },
  { category: 'Professional', code: 'PROF_OTHER', name: 'Other Professional Qualification' },
];

export const EXPERIENCE_LEVELS = [
  { code: '0_2', label: '0–2 Years', minYears: 0, maxYears: 2, defaultYears: 1 },
  { code: '3_5', label: '3–5 Years', minYears: 3, maxYears: 5, defaultYears: 4 },
  { code: '6_10', label: '6–10 Years', minYears: 6, maxYears: 10, defaultYears: 8 },
  { code: '10_PLUS', label: '10+ Years', minYears: 10, maxYears: 35, defaultYears: 12 },
];

// GET /api/master-data/departments
router.get('/departments', authGuard, async (_req: AuthRequest, res: Response) => {
  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { jobRoles: true, users: true } } },
  });
  res.json({ departments });
});

// GET /api/master-data/education
router.get('/education', authGuard, async (_req: AuthRequest, res: Response) => {
  res.json({ education: EDUCATION_QUALIFICATIONS });
});

// GET /api/master-data/experience-levels
router.get('/experience-levels', authGuard, async (_req: AuthRequest, res: Response) => {
  res.json({ experienceLevels: EXPERIENCE_LEVELS });
});

// GET /api/master-data/roles — filterable by departmentId
router.get('/roles', authGuard, async (req: AuthRequest, res: Response) => {
  const { departmentId } = req.query as { departmentId?: string };
  const roles = await prisma.jobRole.findMany({
    where: departmentId ? { departmentId } : undefined,
    include: {
      department: true,
      roleCompetencies: {
        include: { competency: true },
        orderBy: { requiredScore: 'desc' },
      },
    },
    orderBy: { title: 'asc' },
  });
  res.json({ roles });
});

// GET /api/master-data/competencies
router.get('/competencies', authGuard, async (_req: AuthRequest, res: Response) => {
  const competencies = await prisma.competency.findMany({
    orderBy: [{ cluster: 'asc' }, { name: 'asc' }],
  });
  res.json({ competencies });
});

export default router;
