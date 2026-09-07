import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { authGuard, AuthRequest } from '../../middleware/authGuard';
import { CourseProvider, QuestionDifficulty } from '@prisma/client';
import { getCourseCurriculum } from './course-curriculum.data';

const router = Router();

// GET /api/courses — filterable catalogue
router.get('/', authGuard, async (req: AuthRequest, res: Response) => {
  const { competencyId, provider, difficulty } = req.query as Record<string, string | undefined>;
  const courses = await prisma.course.findMany({
    where: {
      ...(competencyId ? { courseSkills: { some: { competencyId } } } : {}),
      ...(provider ? { provider: provider as CourseProvider } : {}),
      ...(difficulty ? { difficulty: difficulty as QuestionDifficulty } : {}),
    },
    include: { courseSkills: { include: { competency: true } } },
    orderBy: { rating: 'desc' },
  });
  const coursesWithCurriculum = courses.map((course) => {
    const curriculum = (course as any).syllabus || getCourseCurriculum(course.title, course.provider, course.difficulty);
    return {
      ...course,
      curriculum,
    };
  });

  res.json({ courses: coursesWithCurriculum });
});

// POST /api/courses — create a new course (Trainer/Admin/Instructor)
router.post('/', authGuard, async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    provider: z.nativeEnum(CourseProvider).default(CourseProvider.INTERNAL),
    difficulty: z.nativeEnum(QuestionDifficulty).default(QuestionDifficulty.INTERMEDIATE),
    durationHrs: z.number().positive().default(5),
    url: z.string().url().optional(),
    rating: z.number().min(0).max(5).default(4.5),
    competencyIds: z.array(z.string()).optional().default([]),
  });

  const data = schema.parse(req.body);
  const { competencyIds, ...courseData } = data;

  const course = await prisma.course.create({
    data: {
      ...courseData,
      courseSkills: {
        create: competencyIds.map((cid) => ({
          competencyId: cid,
          weight: 75,
        })),
      },
    },
    include: { courseSkills: { include: { competency: true } } },
  });

  res.status(201).json({ course });
});

// GET /api/courses/enrolled — courses the user has enrolled in
router.get('/enrolled', authGuard, async (req: AuthRequest, res: Response) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: req.user!.id },
    include: {
      course: {
        include: {
          courseSkills: { include: { competency: true } },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  });

  const courses = enrollments.map(e => ({
    ...e.course,
    enrollmentId: e.id,
    enrollmentStatus: e.status,
    enrolledAt: e.enrolledAt,
    completedAt: e.completedAt,
  }));

  res.json({ courses, enrollments });
});

// GET /api/courses/recommended — AI-matched recommendations for current user
router.get('/recommended', authGuard, async (req: AuthRequest, res: Response) => {
  const gaps = await prisma.skillGap.findMany({
    where: { userId: req.user!.id, gapPct: { gt: 0 } },
    orderBy: { priorityScore: 'desc' },
    take: 5,
    select: { competencyId: true },
  });

  const courseIds = gaps.map((g: { competencyId: string }) => g.competencyId);
  if (courseIds.length === 0) {
    return res.json({ courses: [], rationale: 'No skill gaps detected — your competencies are on track!' });
  }

  const enrolledCourseIds = (await prisma.enrollment.findMany({
    where: { userId: req.user!.id },
    select: { courseId: true },
  })).map((e: { courseId: string }) => e.courseId);

  const courses = await prisma.course.findMany({
    where: {
      courseSkills: { some: { competencyId: { in: courseIds }, weight: { gte: 60 } } },
      id: { notIn: enrolledCourseIds },
    },
    include: { courseSkills: { include: { competency: true } } },
    orderBy: { rating: 'desc' },
    take: 10,
  });

  res.json({
    courses,
    rationale: `Showing courses that address your top ${courseIds.length} skill gap${courseIds.length > 1 ? 's' : ''}.`,
  });
});

// GET /api/courses/:id
router.get('/:id', authGuard, async (req: AuthRequest, res: Response) => {
  const course = await prisma.course.findUniqueOrThrow({
    where: { id: req.params['id'] },
    include: { courseSkills: { include: { competency: true } } },
  });

  const curriculum = (course as any).syllabus || getCourseCurriculum(course.title, course.provider, course.difficulty);

  const [enrollment, progress] = await Promise.all([
    prisma.enrollment.findFirst({
      where: { userId: req.user!.id, courseId: course.id },
    }),
    prisma.progress.findFirst({
      where: { userId: req.user!.id, courseId: course.id },
    }),
  ]);

  res.json({
    course: {
      ...course,
      curriculum,
    },
    enrollment,
    progress,
    isEnrolled: !!enrollment,
  });
});

// POST /api/courses/:id/enroll (enroll in a course)
router.post('/:id/enroll', authGuard, async (req: AuthRequest, res: Response) => {
  const courseId = req.params['id']!;
  const existing = await prisma.enrollment.findFirst({ where: { userId: req.user!.id, courseId } });
  const enrollment = existing ?? await prisma.enrollment.create({
    data: { userId: req.user!.id, courseId, status: 'IN_PROGRESS' },
  });

  // Track progress record
  const existingProg = await prisma.progress.findFirst({
    where: { userId: req.user!.id, courseId },
  });
  if (!existingProg) {
    await prisma.progress.create({
      data: { userId: req.user!.id, courseId, pct: 10, hoursLogged: 1 },
    });
  }

  res.status(201).json({ enrollment });
});

// POST /api/courses/:id/progress — advance progress or mark course completed
router.post('/:id/progress', authGuard, async (req: AuthRequest, res: Response) => {
  const courseId = req.params['id']!;
  const { pct = 100, completed = false, hoursLogged = 2 } = req.body ?? {};

  let enrollment = await prisma.enrollment.findFirst({ where: { userId: req.user!.id, courseId } });
  if (!enrollment) {
    enrollment = await prisma.enrollment.create({
      data: { userId: req.user!.id, courseId, status: completed ? 'COMPLETED' : 'IN_PROGRESS' },
    });
  } else if (completed) {
    enrollment = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  }

  const existingProg = await prisma.progress.findFirst({ where: { userId: req.user!.id, courseId } });
  if (existingProg) {
    await prisma.progress.update({
      where: { id: existingProg.id },
      data: { pct: Math.min(100, pct), hoursLogged: { increment: hoursLogged } },
    });
  } else {
    await prisma.progress.create({
      data: { userId: req.user!.id, courseId, pct, hoursLogged },
    });
  }

  res.json({ enrollment, status: enrollment.status });
});

export default router;
