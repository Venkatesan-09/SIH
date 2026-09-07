import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { authGuard, AuthRequest } from '../../middleware/authGuard';
import { EnrollmentStatus } from '@prisma/client';

const router = Router();

const generateSchema = z.object({
  competencyId: z.string().optional(),
  title: z.string().optional(),
});

// GET /api/learning-paths
router.get('/', authGuard, async (req: AuthRequest, res: Response) => {
  const paths = await prisma.learningPath.findMany({
    where: { userId: req.user!.id },
    include: {
      items: {
        include: { course: { include: { courseSkills: { include: { competency: true } } } } },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ paths });
});

// POST /api/learning-paths/generate
router.post('/generate', authGuard, async (req: AuthRequest, res: Response) => {
  const { competencyId, title } = generateSchema.parse(req.body);

  let targetCompetency: any = null;
  if (competencyId) {
    targetCompetency = await prisma.competency.findUnique({
      where: { id: competencyId },
    });
  }

  // Find top gaps for this user (or for this competency)
  const gapFilter = competencyId ? { competencyId } : { gapPct: { gt: 0 } };
  let gaps = await prisma.skillGap.findMany({
    where: { userId: req.user!.id, ...gapFilter },
    orderBy: { priorityScore: 'desc' },
    take: 3,
    include: { competency: true },
  });

  // If user requested a specific competency but hasn't had a gap generated for it yet, synthesize one
  if (gaps.length === 0 && targetCompetency) {
    gaps = [
      {
        id: `synth-${targetCompetency.id}`,
        userId: req.user!.id,
        competencyId: targetCompetency.id,
        currentScore: 25,
        requiredScore: 80,
        gapPct: 55,
        priorityScore: 85,
        priorityBand: 'CRITICAL',
        competency: targetCompetency,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
    ];
  } else if (gaps.length === 0) {
    // If no specific gap was found at all, pick the first available competency
    const anyComp = await prisma.competency.findFirst();
    if (anyComp) {
      targetCompetency = anyComp;
      gaps = [
        {
          id: `synth-${anyComp.id}`,
          userId: req.user!.id,
          competencyId: anyComp.id,
          currentScore: 30,
          requiredScore: 80,
          gapPct: 50,
          priorityScore: 75,
          priorityBand: 'HIGH',
          competency: anyComp,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any,
      ];
    } else {
      return res.status(400).json({
        error: { code: 'NO_GAPS', message: 'No skill gaps or competencies found to generate a learning path for.' },
      });
    }
  }

  const enrolledCourseIds = (await prisma.enrollment.findMany({
    where: { userId: req.user!.id },
    select: { courseId: true },
  })).map((e: { courseId: string }) => e.courseId);

  // Select best-matching courses per gap competency, prioritized from Beginner -> Intermediate -> Advanced
  const coursesForPath: { courseId: string; order: number }[] = [];
  let order = 0;

  for (const gap of gaps) {
    // Look up directly matching courses or courses with matching names
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { courseSkills: { some: { competencyId: gap.competencyId } } },
          { title: { contains: gap.competency.name.split(' ')[0], mode: 'insensitive' } },
        ],
        id: { notIn: [...enrolledCourseIds, ...coursesForPath.map(c => c.courseId)] },
      },
      orderBy: [
        { rating: 'desc' },
      ],
      take: 4,
    });

    for (const course of courses) {
      coursesForPath.push({ courseId: course.id, order: order++ });
    }
  }

  // Fallback: if no courses directly matched, attach top general statistical and Python courses
  if (coursesForPath.length === 0) {
    const generalCourses = await prisma.course.findMany({
      where: {
        id: { notIn: [...enrolledCourseIds, ...coursesForPath.map(c => c.courseId)] },
      },
      orderBy: { rating: 'desc' },
      take: 3,
    });

    for (const course of generalCourses) {
      coursesForPath.push({ courseId: course.id, order: order++ });
    }
  }

  if (coursesForPath.length === 0) {
    const fallbackCourses = await prisma.course.findMany({ take: 3, orderBy: { rating: 'desc' } });
    for (const course of fallbackCourses) {
      coursesForPath.push({ courseId: course.id, order: order++ });
    }
  }

  // Sort matching courses progressively: Beginner -> Intermediate -> Advanced
  const diffOrder: Record<string, number> = {
    BEGINNER: 1,
    INTERMEDIATE: 2,
    ADVANCED: 3,
  };

  const selectedCourseRecords = await prisma.course.findMany({
    where: { id: { in: coursesForPath.map(c => c.courseId) } },
  });

  selectedCourseRecords.sort((a, b) => {
    const diffA = diffOrder[a.difficulty] || 2;
    const diffB = diffOrder[b.difficulty] || 2;
    return diffA - diffB;
  });

  const orderedCoursesForPath = selectedCourseRecords.map((c, idx) => ({
    courseId: c.id,
    order: idx,
  }));

  const primaryGap = gaps[0]!;
  const rationale = `Progressive learning path for ${primaryGap.competency.name}. Architected across Beginner, Intermediate, and Advanced/Master milestones to close your competency deficit and elevate operational precision to official standards.`;

  const path = await prisma.learningPath.create({
    data: {
      userId: req.user!.id,
      title: title ?? `${primaryGap.competency.name} Development Path`,
      rationale,
      items: {
        create: (orderedCoursesForPath.length > 0 ? orderedCoursesForPath : coursesForPath).map(c => ({
          courseId: c.courseId,
          order: c.order,
          status: EnrollmentStatus.NOT_STARTED,
        })),
      },
    },
    include: {
      items: {
        include: { course: { include: { courseSkills: { include: { competency: true } } } } },
        orderBy: { order: 'asc' },
      },
    },
  });

  res.status(201).json({ path });
});

// GET /api/learning-paths/:id
router.get('/:id', authGuard, async (req: AuthRequest, res: Response) => {
  const path = await prisma.learningPath.findUniqueOrThrow({
    where: { id: req.params['id'] },
    include: {
      items: {
        include: {
          course: {
            include: {
              courseSkills: { include: { competency: true } },
            },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (path.userId !== req.user!.id) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied.' } });
  }

  res.json({ path, learningPath: path });
});

// PATCH /api/learning-paths/:pathId/items/:itemId — update item status
router.patch('/:pathId/items/:itemId', authGuard, async (req: AuthRequest, res: Response) => {
  const { status } = z.object({ status: z.nativeEnum(EnrollmentStatus) }).parse(req.body);

  const item = await prisma.learningPathItem.findUniqueOrThrow({
    where: { id: req.params['itemId'] },
    include: { learningPath: true },
  });

  if (item.learningPath.userId !== req.user!.id) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied.' } });
  }

  const updated = await prisma.learningPathItem.update({
    where: { id: req.params['itemId'] },
    data: { status },
  });

  res.json({ item: updated });
});

export default router;
