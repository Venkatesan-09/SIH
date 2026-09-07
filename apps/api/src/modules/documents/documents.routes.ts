import { Router, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { prisma } from '../../config/prisma';
import { authGuard, AuthRequest } from '../../middleware/authGuard';
import { createError } from '../../middleware/errorHandler';
import { env } from '../../config/env';
import { AuditAction, DocumentStatus } from '@prisma/client';

const router = Router();

// Allowed MIME types (§26 — MIME-type allowlist)
const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
]);

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
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(createError('Unsupported file type. Upload PDF, DOCX, or PPTX only.', 415, 'UNSUPPORTED_MEDIA_TYPE') as any);
    }
  },
});

// POST /api/documents — upload
router.post('/', authGuard, upload.single('file'), async (req: AuthRequest, res: Response) => {
  if (!req.file) throw createError('No file uploaded.', 400, 'BAD_REQUEST');

  const doc = await prisma.document.create({
    data: {
      userId: req.user!.id,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSizeBytes: req.file.size,
      status: DocumentStatus.UPLOADED,
    },
  });

  await prisma.auditLog.create({
    data: { userId: req.user!.id, action: AuditAction.DOCUMENT_UPLOAD, meta: { documentId: doc.id, fileName: doc.fileName } },
  });

  res.status(201).json({ document: doc });
});

// GET /api/documents
router.get('/', authGuard, async (req: AuthRequest, res: Response) => {
  const documents = await prisma.document.findMany({
    where: { userId: req.user!.id },
    orderBy: { uploadedAt: 'desc' },
  });
  res.json({ documents });
});

// GET /api/documents/:id
router.get('/:id', authGuard, async (req: AuthRequest, res: Response) => {
  const doc = await prisma.document.findUniqueOrThrow({ where: { id: req.params['id'] } });
  if (doc.userId !== req.user!.id) throw createError('Access denied.', 403, 'FORBIDDEN');
  res.json({ document: doc });
});

export default router;
