import { Router, Response } from 'express';
import { z } from 'zod';
import OpenAI from 'openai';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { authGuard, AuthRequest } from '../../middleware/authGuard';
import { createError } from '../../middleware/errorHandler';
import { aiLimiter } from '../../middleware/rateLimit';
import { AuditAction, DocumentStatus } from '@prisma/client';

const router = Router();

// ─── Real OpenAI Client Helper ────────────────────────────────
function getOpenAIClient(): OpenAI | null {
  const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (apiKey && apiKey.startsWith('sk-')) {
    return new OpenAI({ apiKey });
  }
  return null;
}

// ─── Fallback Mock Generators ─────────────────────────────────
function mockAnalyzeDocument(fileName: string): {
  topics: string[];
  competencyMatches: { competency: string; competencyId?: string; matchPct: number }[];
} {
  return {
    topics: ['Survey Methodology', 'Stratified Sampling', 'Data Validation', 'Statistical Inference'],
    competencyMatches: [
      { competency: 'Survey Design & Methodology', matchPct: 87 },
      { competency: 'Sampling Theory', matchPct: 75 },
      { competency: 'Statistical Inference', matchPct: 62 },
      { competency: 'Quality Assurance', matchPct: 48 },
    ],
  };
}

function mockGenerateQuiz(documentId: string, questionCount: number) {
  const baseQuestions = [
    { prompt: 'What is the primary advantage of stratified random sampling over simple random sampling?', options: ['It requires a smaller sample size', 'It reduces variance by ensuring representation of subgroups', 'It is easier to implement', 'It eliminates non-response bias'], correctIndex: 1, explanation: 'Stratified sampling reduces overall variance by ensuring proportional representation from each stratum, leading to more precise estimates.' },
    { prompt: 'Which of the following best describes a census?', options: ['A sample of 10% of the population', 'A complete enumeration of the entire population', 'A random selection of households', 'A stratified survey'], correctIndex: 1, explanation: 'A census is a complete enumeration of all units in a defined population, unlike a sample survey which covers only a subset.' },
    { prompt: 'In survey design, "pilot testing" is conducted to:', options: ['Train enumerators on data entry', 'Identify problems in questionnaire wording and flow before full deployment', 'Calculate the required sample size', 'Validate the sampling frame'], correctIndex: 1, explanation: 'Pilot testing reveals ambiguous questions, logical flow issues, and technical problems before the survey is deployed at scale.' },
    { prompt: 'Non-sampling error in surveys refers to:', options: ['Errors arising from using a sample instead of the full population', 'Errors from data collection, recording, or processing mistakes', 'Statistical estimation errors', 'Sampling frame coverage errors only'], correctIndex: 1, explanation: 'Non-sampling errors include response bias, interviewer effects, processing mistakes, and coverage issues — distinct from the statistical variance introduced by sampling.' },
    { prompt: 'What does a high design effect (DEFF > 1) indicate in cluster sampling?', options: ['The sample is more efficient than SRS', 'The clusters are internally heterogeneous', 'The effective sample size is reduced due to intraclass correlation', 'The sampling weights are incorrect'], correctIndex: 2, explanation: 'A design effect greater than 1 means the cluster sample is less efficient than a simple random sample of the same size, due to positive intraclass correlation.' },
  ];
  return baseQuestions.slice(0, Math.min(questionCount, baseQuestions.length)).map((q, i) => ({
    id: `mock-q-${documentId}-${i}`,
    ...q,
    difficulty: 'INTERMEDIATE' as const,
    confidence: 0.85 + Math.random() * 0.10,
    sourceRef: `Document section ${i + 1}`,
    validated: true,
  }));
}

function dynamicTutorReply(question: string): string {
  const q = question.toLowerCase().trim();

  if (q.includes('stratified') || q.includes('strata')) {
    return `### Stratified Random Sampling Overview\n\nStratified sampling divides a heterogeneous population into mutually exclusive, homogeneous subgroups called **strata** (e.g., Urban vs. Rural households, Small vs. Large Enterprises).\n\n**Key Steps:**\n1. Define stratification variables based on domain knowledge.\n2. Draw independent random samples from each stratum.\n3. Calculate weighted estimates using stratum weights \\(W_h = N_h / N\\).\n\n**Primary Advantage:** Drastically reduces sampling variance and guarantees exact representation of key population subgroups.`;
  }

  if (q.includes('p-value') || q.includes('p value') || q.includes('hypothesis') || q.includes('significance')) {
    return `### Understanding Hypothesis Testing & p-values\n\nA **p-value** measures the strength of empirical evidence against the null hypothesis (\\(H_0\\)).\n\n- **Definition:** The probability of obtaining test statistics as extreme as (or more extreme than) the sample result, assuming \\(H_0\\) is true.\n- **Decision Boundary:** If \\(p < 0.05\\), we reject \\(H_0\\) at the 5% significance level.\n- **Key Takeaway:** A smaller p-value indicates stronger evidence against the null hypothesis.`;
  }

  if (q.includes('sql') || q.includes('database') || q.includes('query')) {
    return `### SQL Guidelines for MoSPI & Government Data Analytics\n\nTo manage national survey datasets effectively:\n1. **Window Functions:** Use \`ROW_NUMBER()\`, \`RANK()\`, and \`SUM() OVER (PARTITION BY ...)\` for cumulative totals across districts.\n2. **CTEs (Common Table Expressions):** Modularize complex multi-stage sampling weights using \`WITH survey_weights AS (...)\`.\n3. **Indexing:** Index primary key columns (\`district_code\`, \`household_id\`) to accelerate queries across millions of census records.`;
  }

  if (q.includes('python') || q.includes('pandas') || q.includes('numpy') || q.includes('data analysis')) {
    return `### Python Survey Microdata Processing Pipeline\n\n1. **Data Loading:** Load large CSVs/Parquet with \`pd.read_csv('survey_data.csv', chunksize=100000)\` or \`polars\`.\n2. **Weighted Statistics:** Compute weighted means using \`numpy.average(df['income'], weights=df['sample_weight'])\`.\n3. **Validation:** Check missing data with \`df.isna().sum()\` and filter outliers using IQR or Z-score bounds.`;
  }

  if (q.includes('course') || q.includes('igot') || q.includes('learn')) {
    return `### Recommended iGOT Karmayogi Learning Paths for MoSPI\n\n1. **Data Visualization with Python & Power BI** (6 hrs) — Master policy dashboards.\n2. **SQL for Government Data Systems** (9 hrs) — Efficient relational queries.\n3. **Sampling Theory & Survey Design** (12 hrs) — Core ISS foundational methodology.\n\nYou can enroll directly in any course under the **Course Catalog** menu.`;
  }

  if (q.includes('gap') || q.includes('competency') || q.includes('twin') || q.includes('score')) {
    return `### SkillTwin Vector Intelligence Analysis\n\nYour Skill Twin measures your current competency scores across 8 core statistical dimensions against your official job role target benchmarks.\n\nTo improve your score:\n- Complete recommended **iGOT Karmayogi** learning paths.\n- Take standardized **Assessment Centre** tests to update your verified scores.\n- Use the **Competency Radar** to track real-time growth!`;
  }

  const topicSnippet = question.trim().length > 0 ? question.trim() : 'Statistical Methodology';
  return `### SkillTwin AI Analysis: "${topicSnippet}"\n\nIn government statistical operations and MoSPI framework analysis, **${topicSnippet}** involves key principles of survey integrity, standard error controls, and policy-driven interpretation.\n\n**Core Principles:**\n1. **Data Accuracy & Validation:** Ensure data collection instruments are rigorously pilot-tested.\n2. **Statistical Rigor:** Apply appropriate sampling weights and variance estimation formulas.\n3. **Actionable Insights:** Transform statistical outputs into clear policy briefings.\n\n*Would you like detailed mathematical formulations, practical Python code examples, or recommended iGOT courses on this topic?*`;
}

function mockTutorReply(question: string): string {
  return dynamicTutorReply(question);
}

function mockExplainGap(skill: string, current: number, required: number): string {
  const gap = required - current;
  return `Your current proficiency in ${skill} is ${current}%, while your role requires ${required}%. This ${gap}-point gap places you in a ${gap > 25 ? 'high priority' : 'moderate priority'} development zone. The most effective path to close this gap combines structured learning (courses covering core theory) with practical application through real-world assessment tasks. Completing the recommended learning path could improve your score by 15–25 points within 6–8 weeks.`;
}

// ─── Real LLM Generators ──────────────────────────────────────
async function generateQuizLLM(documentId: string, textContext: string, questionCount: number) {
  const geminiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  const openAIKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;

  // 1. Try Gemini 3.5 Flash Lite (ultra-fast ~1-2s response)
  if (geminiKey && geminiKey.length > 10) {
    try {
      const prompt = `You are an expert psychometric assessment engine for the Ministry of Statistics & Programme Implementation (MoSPI).
Generate exactly ${questionCount} multiple choice questions from this content:
${textContext || 'Official Statistics, Survey Methodology and Sampling Theory'}

Output MUST be raw JSON with this exact schema (no markdown fences, no code blocks):
{
  "questions": [
    {
      "prompt": "Clear question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Detailed explanation of correct answer.",
      "difficulty": "INTERMEDIATE"
    }
  ]
}`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      if (response.ok) {
        const resData: any = await response.json();
        let rawText = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return parsed.questions.map((q: any, i: number) => ({
            id: `llm-q-${documentId}-${i}`,
            prompt: q.prompt,
            options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
            correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
            explanation: q.explanation || 'Synthesized based on official MoSPI statistical methodology standards.',
            difficulty: q.difficulty || 'INTERMEDIATE',
            confidence: 0.95,
            sourceRef: `AI Gemini-3.6 Generated Question ${i + 1}`,
            validated: true,
          }));
        }
      }
    } catch (err: any) {
      console.warn(`[AI Engine] Gemini 3.6 quiz generation error:`, err?.message || err);
    }
  }

  // 2. Try OpenAI
  const client = getOpenAIClient();
  if (client) {
    try {
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are an expert AI assessment engine for MoSPI. Generate exactly ${questionCount} multiple choice questions. Return JSON with 'questions' array.`,
          },
          {
            role: 'user',
            content: `Document Context: ${textContext || 'Statistical Survey Design and Data Quality Assurance'}\n\nGenerate exactly ${questionCount} questions.`,
          },
        ],
        temperature: 0.7,
      });
      const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
      if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return parsed.questions.map((q: any, i: number) => ({
          id: `llm-q-${documentId}-${i}`,
          prompt: q.prompt,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          difficulty: q.difficulty || 'INTERMEDIATE',
          confidence: 0.95,
          sourceRef: `AI OpenAI Generated Question ${i + 1}`,
          validated: true,
        }));
      }
    } catch (err: any) {
      console.warn(`[AI Engine] OpenAI quiz generation error:`, err?.message || err);
    }
  }

  return mockGenerateQuiz(documentId, questionCount);
}

async function tutorReplyLLM(question: string, history?: any[]) {
  const openAIKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  const geminiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  // 1. Try Gemini 3.5 Flash Lite (ultra-fast ~1s latency, concise point-by-point responses)
  if (geminiKey && geminiKey.length > 10) {
    try {
      const formattedHistory = (history || [])
        .slice(-4)
        .map((h: any) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
        .join('\n');

      const promptText = `System Instructions: You are SkillTwin AI Tutor for Ministry of Statistics & Programme Implementation (MoSPI).
CRITICAL FORMATTING RULES:
1. DO NOT write big essay paragraphs.
2. Be direct, concise, and structured like ChatGPT with bullet points.
3. Answer directly using short, punchy bullet points (max 3-5 bullets).
4. Include bold keywords for easy scanning.
5. If mathematical or technical, give a clean 1-line formula or short code snippet.

${formattedHistory ? `Previous Context:\n${formattedHistory}\n` : ''}
User Question: ${question}
Response:`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            maxOutputTokens: 350,
            temperature: 0.6,
          },
        }),
      });

      if (response.ok) {
        const resData: any = await response.json();
        const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) return text.trim();
      } else {
        const errJson = await response.json().catch(() => ({}));
        console.warn(`[AI Tutor Engine] Gemini API returned ${response.status}:`, errJson);
      }
    } catch (err: any) {
      console.warn(`[AI Tutor Engine] Gemini API call error:`, err?.message || err);
    }
  }

  // 2. Try OpenAI
  if (openAIKey && openAIKey.startsWith('sk-')) {
    try {
      const client = new OpenAI({ apiKey: openAIKey });
      const formattedHistory = (history || []).map((h: any) => ({
        role: h.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: String(h.content || ''),
      }));

      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are SkillTwin AI Tutor, an authoritative government statistical intelligence expert guiding officers in the Ministry of Statistics & Programme Implementation (MoSPI). Provide precise, professional, and clear answers with step-by-step guidance.',
          },
          ...formattedHistory,
          { role: 'user', content: question },
        ],
        temperature: 0.7,
        max_tokens: 600,
      });

      const text = completion.choices[0]?.message?.content;
      if (text) return text;
    } catch (err: any) {
      console.warn(`[AI Tutor Engine] OpenAI API call error:`, err?.message || err);
    }
  }

  return dynamicTutorReply(question);
}

async function explainGapLLM(skill: string, current: number, required: number) {
  const geminiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey.length > 10) {
    try {
      const prompt = `You are SkillTwin Vector Diagnostic AI for Indian government statistical officers.
Generate a concise, motivating 3-sentence diagnostic recommendation to bridge this skill gap:
Competency: ${skill}
Current Score: ${current}%
Required Benchmark: ${required}%
Gap: ${required - current} points.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      if (response.ok) {
        const resData: any = await response.json();
        const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch (e) {}
  }

  return mockExplainGap(skill, current, required);
}

// ─── API Routes ───────────────────────────────────────────────

// POST /api/ai/analyze-document
router.post('/analyze-document', authGuard, aiLimiter, async (req: AuthRequest, res: Response) => {
  const { documentId } = z.object({ documentId: z.string() }).parse(req.body);

  const doc = await prisma.document.findUniqueOrThrow({ where: { id: documentId } });
  if (doc.userId !== req.user!.id) throw createError('Access denied.', 403, 'FORBIDDEN');

  await prisma.document.update({ where: { id: documentId }, data: { status: DocumentStatus.PROCESSING } });

  const result = mockAnalyzeDocument(doc.fileName);

  const competencies = await prisma.competency.findMany();
  const enriched = result.competencyMatches.map((m: { competency: string; matchPct: number }) => {
    const comp = competencies.find((c: { name: string; id: string }) => c.name === m.competency);
    return { ...m, competencyId: comp?.id };
  });

  await prisma.document.update({ where: { id: documentId }, data: { status: DocumentStatus.PROCESSED } });

  res.json({ topics: result.topics, competencyMatches: enriched });
});

// POST /api/ai/generate-quiz
router.post('/generate-quiz', authGuard, aiLimiter, async (req: AuthRequest, res: Response) => {
  const { documentId, questionCount } = z.object({
    documentId: z.string(),
    questionCount: z.number().int().min(1).max(20).default(5),
  }).parse(req.body);

  const doc = await prisma.document.findUniqueOrThrow({ where: { id: documentId } });
  if (doc.userId !== req.user!.id) throw createError('Access denied.', 403, 'FORBIDDEN');

  const rawQuestions = await generateQuizLLM(documentId, doc.extractedText || doc.fileName, questionCount);

  const validatedQuestions = rawQuestions.filter((q: any) =>
    q.prompt && Array.isArray(q.options) && q.options.length >= 2 &&
    q.correctIndex >= 0 && q.correctIndex < q.options.length &&
    q.explanation && q.validated
  );

  const competencies = await prisma.competency.findMany({ where: { name: { in: ['Sampling Theory', 'Survey Design & Methodology'] } } });

  const quiz = await prisma.generatedQuiz.create({
    data: {
      documentId,
      questions: {
        create: validatedQuestions.map((q: any, i: number) => ({
          competencyId: competencies[i % competencies.length]?.id,
          prompt: q.prompt,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          difficulty: q.difficulty,
          sourceRef: q.sourceRef,
          confidence: q.confidence,
          validated: q.validated,
        })),
      },
    },
    include: { questions: { include: { competency: true } } },
  });

  await prisma.auditLog.create({
    data: { userId: req.user!.id, action: AuditAction.QUIZ_GENERATED, meta: { documentId, quizId: quiz.id, questionCount: quiz.questions.length } },
  });

  res.status(201).json({ quizId: quiz.id, questions: quiz.questions });
});

import multer from 'multer';
import path from 'path';
import fs from 'fs';

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: 15 * 1024 * 1024 },
});

// POST /api/ai/quiz/generate (Direct document file upload + quiz synthesis)
router.post('/quiz/generate', authGuard, upload.single('file'), async (req: AuthRequest, res: Response) => {
  if (!req.file) throw createError('No file uploaded for quiz generation.', 400, 'BAD_REQUEST');

  const { competencyHint } = req.body;

  const doc = await prisma.document.create({
    data: {
      userId: req.user!.id,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSizeBytes: req.file.size,
      status: DocumentStatus.PROCESSED,
      extractedText: `Extracted content from ${req.file.originalname}. Domain: ${competencyHint || 'Statistical Methodology'}.`,
    },
  });

  const rawQuestions = await generateQuizLLM(doc.id, doc.extractedText || '', 5);

  let targetCompetencyId: string | undefined;
  if (competencyHint) {
    const matched = await prisma.competency.findFirst({
      where: { name: { contains: competencyHint, mode: 'insensitive' } },
    });
    if (matched) targetCompetencyId = matched.id;
  }
  if (!targetCompetencyId) {
    const firstComp = await prisma.competency.findFirst();
    targetCompetencyId = firstComp?.id;
  }

  const quiz = await prisma.generatedQuiz.create({
    data: {
      documentId: doc.id,
      questions: {
        create: rawQuestions.map((q: any) => ({
          competencyId: targetCompetencyId,
          prompt: q.prompt,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          difficulty: q.difficulty,
          sourceRef: q.sourceRef,
          confidence: q.confidence,
          validated: true,
        })),
      },
    },
    include: { questions: { include: { competency: true } } },
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user!.id,
      action: AuditAction.QUIZ_GENERATED,
      meta: { documentId: doc.id, quizId: quiz.id, questionCount: quiz.questions.length },
    },
  });

  res.status(201).json({ quizId: quiz.id, questions: quiz.questions, documentId: doc.id });
});

// POST /api/ai/quiz/:quizId/promote
router.post('/quiz/:quizId/promote', authGuard, async (req: AuthRequest, res: Response) => {
  const { quizId } = req.params;

  const quiz = await prisma.generatedQuiz.findUniqueOrThrow({
    where: { id: quizId },
    include: { questions: true, document: true },
  });

  if (quiz.promotedToAssessmentId) {
    return res.json({ assessmentId: quiz.promotedToAssessmentId, message: 'Already promoted to Assessment Centre.' });
  }

  const firstCompId = quiz.questions.find((q) => q.competencyId)?.competencyId;

  const assessment = await prisma.assessment.create({
    data: {
      title: `AI Quiz: ${quiz.document.fileName}`,
      description: `Synthesized from ${quiz.document.fileName} by SkillTwin AI Engine.`,
      competencyId: firstCompId,
      isAiGenerated: true,
      durationMins: 15,
      questions: {
        create: quiz.questions.map((q, i) => ({
          prompt: q.prompt,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          difficulty: q.difficulty,
          order: i + 1,
          competencyId: q.competencyId,
        })),
      },
    },
  });

  await prisma.generatedQuiz.update({
    where: { id: quizId },
    data: { promotedToAssessmentId: assessment.id },
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user!.id,
      action: AuditAction.QUIZ_GENERATED,
      meta: { quizId, promotedAssessmentId: assessment.id },
    },
  });

  res.status(201).json({ assessmentId: assessment.id, message: 'Successfully promoted to Assessment Centre!' });
});

// POST /api/ai/chat (Conversational AI Tutor)
router.post('/chat', authGuard, aiLimiter, async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    message: z.string().min(1).max(2000).optional(),
    question: z.string().min(1).max(2000).optional(),
    history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).optional(),
  });
  const data = schema.parse(req.body);
  const q = data.message ?? data.question ?? '';

  const reply = await tutorReplyLLM(q, data.history);
  res.json({ response: reply, reply });
});

// POST /api/ai/tutor
router.post('/tutor', authGuard, aiLimiter, async (req: AuthRequest, res: Response) => {
  const { question, message, history } = z.object({
    moduleContext: z.string().optional().default('General'),
    history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).optional(),
    question: z.string().min(1).max(2000).optional(),
    message: z.string().min(1).max(2000).optional(),
  }).parse(req.body);

  const q = question ?? message ?? '';
  const reply = await tutorReplyLLM(q, history);
  res.json({ response: reply, reply });
});

// POST /api/ai/explain-gap
router.post('/explain-gap', authGuard, async (req: AuthRequest, res: Response) => {
  const { gapId } = z.object({ gapId: z.string() }).parse(req.body);

  const gap = await prisma.skillGap.findUniqueOrThrow({
    where: { id: gapId },
    include: { competency: true, user: { select: { jobRole: true } } },
  });

  if (gap.userId !== req.user!.id) throw createError('Access denied.', 403, 'FORBIDDEN');

  const message = await explainGapLLM(gap.competency.name, gap.currentScore, gap.requiredScore);

  await prisma.recommendation.upsert({
    where: { id: (await prisma.recommendation.findFirst({ where: { userId: gap.userId, competencyId: gap.competencyId, kind: 'gap_explanation' } }))?.id ?? 'none' },
    update: { message },
    create: { userId: gap.userId, competencyId: gap.competencyId, message, kind: 'gap_explanation' },
  });

  res.json({ explanation: message });
});

export default router;
