import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { authGuard, AuthRequest } from '../../middleware/authGuard';
import { recomputeSkillScore } from '../competencies/competency.engine';
import { createError } from '../../middleware/errorHandler';
import { aiProvider } from '../ai/ai.provider';

const router = Router();

const submitSchema = z.object({
  attemptId: z.string().optional(),
  answers: z.array(z.object({
    questionId: z.string(),
    selectedIndex: z.number().int().min(0),
  })),
});

// POST /api/assessments/generate — Generate role-specific assessment via real AI (Gemini 3.5)
router.post('/generate', authGuard, async (req: AuthRequest, res: Response) => {
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
    },
  });

  if (!user.jobRole) {
    throw createError('Please select your department and job role before generating an assessment.', 400, 'ROLE_REQUIRED');
  }

  const roleTitle = user.jobRole.title;
  const deptName = user.department?.name || 'Statistical Cadre';
  const comps = user.jobRole.roleCompetencies.map((rc) => ({
    id: rc.competencyId,
    name: rc.competency.name,
    requiredScore: rc.requiredScore,
  }));

  // Generate questions via real AI (Gemini 3.5 Flash Lite)
  const generatedQuestions = await aiProvider.generateRoleAssessment({
    roleTitle,
    departmentName: deptName,
    competencies: comps,
    questionCount: 5,
  });

  // Create assessment in MongoDB
  const assessment = await prisma.assessment.create({
    data: {
      title: `${roleTitle} AI Competency Diagnostic`,
      description: `Targeted AI diagnostic assessment evaluating core competencies for ${roleTitle} in ${deptName}.`,
      durationMins: 15,
      isAiGenerated: true,
      competencyId: comps[0]?.id || null,
      questions: {
        create: generatedQuestions.map((q, idx) => ({
          prompt: q.prompt,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          difficulty: q.difficulty,
          order: idx + 1,
          competencyId: q.competencyId || comps[0]?.id || null,
        })),
      },
    },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          prompt: true,
          options: true,
          difficulty: true,
          order: true,
          competencyId: true,
        },
      },
    },
  });

  res.status(201).json({
    assessment: {
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      durationMins: assessment.durationMins,
      questions: assessment.questions,
    },
  });
});

// GET /api/assessments — catalogue
router.get('/', authGuard, async (_req, res: Response) => {
  const assessments = await prisma.assessment.findMany({
    include: { competency: true, _count: { select: { questions: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({
    assessments: assessments.map((a) => ({
      ...a, questionCount: a._count.questions, _count: undefined,
    })),
  });
});

// GET /api/assessments/:id — with questions (no correctIndex)
router.get('/:id', authGuard, async (req: AuthRequest, res: Response) => {
  const assessment = await prisma.assessment.findUniqueOrThrow({
    where: { id: req.params['id'] },
    include: {
      competency: true,
      questions: {
        orderBy: { order: 'asc' },
        select: {
          id: true, prompt: true, options: true, difficulty: true, order: true,
          assessmentId: true, competencyId: true,
          // correctIndex intentionally excluded
        },
      },
    },
  });
  res.json({
    assessment,
    title: assessment.title,
    questions: assessment.questions,
  });
});

// GET /api/assessments/:id/questions — alias matching AssessmentAttemptPage call
router.get('/:id/questions', authGuard, async (req: AuthRequest, res: Response) => {
  const assessment = await prisma.assessment.findUniqueOrThrow({
    where: { id: req.params['id'] },
    include: {
      competency: true,
      questions: {
        orderBy: { order: 'asc' },
        select: {
          id: true, prompt: true, options: true, difficulty: true, order: true,
          assessmentId: true, competencyId: true,
          // correctIndex intentionally excluded
        },
      },
    },
  });
  res.json({
    title: assessment.title,
    durationMins: assessment.durationMins,
    questions: assessment.questions,
  });
});

// POST /api/assessments/:id/start
router.post('/:id/start', authGuard, async (req: AuthRequest, res: Response) => {
  const attempt = await prisma.assessmentAttempt.create({
    data: { userId: req.user!.id, assessmentId: req.params['id']! },
  });
  res.status(201).json({ attemptId: attempt.id });
});

// POST /api/assessments/:id/submit — server-side scoring only (§19, §26)
router.post('/:id/submit', authGuard, async (req: AuthRequest, res: Response) => {
  const { attemptId, answers } = submitSchema.parse(req.body);

  const assessment = await prisma.assessment.findUnique({
    where: { id: req.params['id']! },
    include: { questions: { select: { competencyId: true } } },
  });

  if (!assessment) {
    throw createError('Assessment not found.', 404, 'NOT_FOUND');
  }

  let attempt = attemptId
    ? await prisma.assessmentAttempt.findFirst({
        where: { id: attemptId, userId: req.user!.id, assessmentId: req.params['id'] },
      })
    : await prisma.assessmentAttempt.findFirst({
        where: { userId: req.user!.id, assessmentId: req.params['id'], submittedAt: null },
        orderBy: { startedAt: 'desc' },
      });

  if (!attempt) {
    attempt = await prisma.assessmentAttempt.create({
      data: { userId: req.user!.id, assessmentId: req.params['id']! },
    });
  }

  if (attempt.submittedAt) throw createError('Assessment already submitted.', 409, 'CONFLICT');

  const questions = await prisma.question.findMany({
    where: { assessmentId: req.params['id'] },
  });

  const answerMap = new Map(answers.map((a: { questionId: string; selectedIndex: number }) => [a.questionId, a.selectedIndex]));

  let correctCount = 0;
  const resolvedAttemptId = attempt.id;
  const answerRecords = questions.map((q) => {
    const selected = answerMap.get(q.id) ?? -1;
    const isCorrect = selected === q.correctIndex;
    if (isCorrect) correctCount++;
    return { attemptId: resolvedAttemptId, questionId: q.id, selectedIndex: selected, isCorrect };
  });

  const scorePct = Math.round((correctCount / questions.length) * 100);

  await prisma.$transaction([
    prisma.answer.createMany({ data: answerRecords }),
    prisma.assessmentAttempt.update({
      where: { id: resolvedAttemptId },
      data: { submittedAt: new Date(), scorePct, correctCount, totalCount: questions.length },
    }),
  ]);

  // Calculate and update competency-specific scores based on question performance
  const compQuestionMap = new Map<string, { total: number; correct: number }>();
  for (const a of answerRecords) {
    const q = questions.find((item) => item.id === a.questionId);
    if (q?.competencyId) {
      const cur = compQuestionMap.get(q.competencyId) || { total: 0, correct: 0 };
      cur.total += 1;
      if (a.isCorrect) cur.correct += 1;
      compQuestionMap.set(q.competencyId, cur);
    }
  }

  // Update scores for all assessed competencies
  for (const [compId, stats] of compQuestionMap.entries()) {
    const compPct = Math.round((stats.correct / stats.total) * 100);
    const existing = await prisma.skillScore.findFirst({
      where: { userId: req.user!.id, competencyId: compId },
    });
    if (existing) {
      await prisma.skillScore.updateMany({
        where: { userId: req.user!.id, competencyId: compId },
        data: { assessmentComponent: compPct, lastAssessedAt: new Date() },
      });
    } else {
      await prisma.skillScore.create({
        data: {
          userId: req.user!.id,
          competencyId: compId,
          assessmentComponent: compPct,
          selfComponent: 50,
          experienceComponent: 0,
          trainingComponent: 0,
          currentScore: Math.round(compPct * 0.60 + 50 * 0.20),
          lastAssessedAt: new Date(),
        },
      });
    }
    await recomputeSkillScore(req.user!.id, compId);
  }

  // If assessment has a primary competency not in individual question map
  if (assessment?.competencyId && !compQuestionMap.has(assessment.competencyId)) {
    const existing = await prisma.skillScore.findFirst({
      where: { userId: req.user!.id, competencyId: assessment.competencyId },
    });
    if (existing) {
      await prisma.skillScore.updateMany({
        where: { userId: req.user!.id, competencyId: assessment.competencyId },
        data: { assessmentComponent: scorePct, lastAssessedAt: new Date() },
      });
    } else {
      await prisma.skillScore.create({
        data: {
          userId: req.user!.id,
          competencyId: assessment.competencyId,
          assessmentComponent: scorePct,
          selfComponent: 50,
          experienceComponent: 0,
          trainingComponent: 0,
          currentScore: Math.round(scorePct * 0.60 + 50 * 0.20),
          lastAssessedAt: new Date(),
        },
      });
    }
    await recomputeSkillScore(req.user!.id, assessment.competencyId);
  }

  // Advance user onboarding state
  await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      assessmentCompleted: true,
      onboardingStatus: 'SKILLTWIN_REQUIRED',
    },
  });

  res.json({
    scorePct,
    correctCount,
    totalCount: questions.length,
    attemptId: resolvedAttemptId,
    onboardingStatus: 'SKILLTWIN_REQUIRED',
  });
});

// GET /api/assessments/:id/results
router.get('/:id/results', authGuard, async (req: AuthRequest, res: Response) => {
  const attempt = await prisma.assessmentAttempt.findFirst({
    where: { assessmentId: req.params['id'], userId: req.user!.id },
    include: {
      answers: { include: { question: { include: { competency: true } } } },
      assessment: { include: { competency: true } },
    },
    orderBy: { submittedAt: 'desc' },
  });

  if (!attempt || !attempt.submittedAt) {
    throw createError('No completed attempt found.', 404, 'NOT_FOUND');
  }

  const correctAnswers = attempt.answers.filter(a => a.isCorrect);
  const wrongAnswers = attempt.answers.filter(a => !a.isCorrect);

  const strengthComps = [...new Set(correctAnswers.map(a => a.question.competency).filter(Boolean))];
  const weakComps = [...new Set(wrongAnswers.map(a => a.question.competency).filter(Boolean))];
  res.json({
    attemptId: attempt.id,
    scorePct: attempt.scorePct,
    correctCount: attempt.correctCount,
    totalCount: attempt.totalCount,
    strengths: [...new Set(correctAnswers.map((a: { question: { competency: any } }) => a.question.competency).filter(Boolean))],
    weakAreas: [...new Set(wrongAnswers.map((a: { question: { competency: any } }) => a.question.competency).filter(Boolean))],
    aiInsight: `Your score of ${attempt.scorePct}% shows ${
      (attempt.scorePct ?? 0) >= 70 ? 'strong' : 'developing'
    } competency. Focus on the weak areas identified below to accelerate your skill growth.`,
    questions: attempt.answers.map((a: { question: any; selectedIndex: number; isCorrect: boolean }) => ({
      id: a.question.id,
      prompt: a.question.prompt,
      options: a.question.options,
      correctIndex: a.question.correctIndex,
      explanation: a.question.explanation,
      selectedIndex: a.selectedIndex,
      isCorrect: a.isCorrect,
    })),
  });
});

export default router;
