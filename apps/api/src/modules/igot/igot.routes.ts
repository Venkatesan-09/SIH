import { Router, Response } from 'express';
import { authGuard, AuthRequest } from '../../middleware/authGuard';
import { roleGuard } from '../../middleware/authGuard';
import { Role } from '@prisma/client';

const router = Router();

// Mock iGOT data — IMPLEMENTATION DECISION: always isMock:true until RealIGOTProvider exists (§11)
const MOCK_STATUS = {
  active: true,
  lastSyncedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  syncedCourses: 847,
  progressSyncPct: 94.2,
  isMock: true, // MUST remain true until RealIGOTProvider is implemented
  logs: [
    { id: 'log-1', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), type: 'success', message: 'Course catalog sync completed: 847 courses updated' },
    { id: 'log-2', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5000).toISOString(), type: 'success', message: 'Progress sync: 2,340/2,480 employee records updated' },
    { id: 'log-3', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), type: 'error', message: 'API timeout for batch 12 — retried successfully after 30s' },
    { id: 'log-4', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), type: 'success', message: 'Competency mapping sync: 17 competencies aligned' },
    { id: 'log-5', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), type: 'info', message: 'Scheduled sync initiated' },
  ],
};

const MOCK_COURSES = [
  { id: 'igot-dv-001', title: 'Data Visualization with Python & Power BI', provider: 'iGOT Karmayogi', durationHrs: 6, rating: 4.3 },
  { id: 'igot-sql-002', title: 'SQL for Government Data Systems', provider: 'iGOT Karmayogi', durationHrs: 9, rating: 4.4 },
  { id: 'igot-ml-003', title: 'Machine Learning for Statistical Applications', provider: 'iGOT Karmayogi', durationHrs: 15, rating: 4.8 },
  { id: 'igot-py-004', title: 'Python for Data Analysis', provider: 'iGOT Karmayogi', durationHrs: 10, rating: 4.6 },
];

// GET /api/igot/status — Admin only
router.get('/status', authGuard, roleGuard(Role.ADMIN), (_req: AuthRequest, res: Response) => {
  res.json(MOCK_STATUS);
});

// GET /api/igot/courses — Auth required
router.get('/courses', authGuard, (_req: AuthRequest, res: Response) => {
  res.json({ courses: MOCK_COURSES, isMock: true });
});

// GET /api/igot/courses/:id
router.get('/courses/:id', authGuard, (req: AuthRequest, res: Response) => {
  const course = MOCK_COURSES.find(c => c.id === req.params['id']);
  if (!course) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'iGOT course not found.' } });
  res.json({ course, isMock: true });
});

export default router;
