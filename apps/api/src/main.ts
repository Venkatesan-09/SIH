import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { apiLimiter } from './middleware/rateLimit';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import departmentRoutes from './modules/departments/departments.routes';
import jobRoleRoutes from './modules/job-roles/job-roles.routes';
import competencyRoutes from './modules/competencies/competencies.routes';
import skillGapRoutes from './modules/skill-gaps/skill-gaps.routes';
import assessmentRoutes from './modules/assessments/assessments.routes';
import courseRoutes from './modules/courses/courses.routes';
import learningPathRoutes from './modules/learning-paths/learning-paths.routes';
import progressRoutes from './modules/progress/progress.routes';
import documentRoutes from './modules/documents/documents.routes';
import aiRoutes from './modules/ai/ai.routes';
import igotRoutes from './modules/igot/igot.routes';
import adminRoutes from './modules/admin/admin.routes';
import masterDataRoutes from './modules/master-data/master-data.routes';
import skillTwinRoutes from './modules/skilltwin/skilltwin.routes';
import recommendationRoutes from './modules/recommendations/recommendations.routes';

const app = express();

// ─── Security middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (/^http:\/\/localhost:\d+$/.test(origin) || origin === env.CORS_ORIGIN) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Logging ──────────────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── Global rate limiting ─────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Static uploads (dev only) ────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'skilltwin-api', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/job-roles', jobRoleRoutes);
app.use('/api/roles', jobRoleRoutes);
app.use('/api/competencies', competencyRoutes);
app.use('/api/skill-gaps', skillGapRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/igot', igotRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/master-data', masterDataRoutes);
app.use('/api/skilltwin', skillTwinRoutes);
app.use('/api/recommendations', recommendationRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 SkillTwin API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   AI Provider: ${env.AI_PROVIDER}`);
  console.log(`   iGOT Provider: ${env.IGOT_PROVIDER}`);
});

export default app;
