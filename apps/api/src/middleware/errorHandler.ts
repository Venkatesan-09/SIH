import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Global error handler — normalizes all errors to { error: { code, message } }
 * Stack traces are NEVER sent to the client (§26)
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors → 422
  if (err instanceof ZodError) {
    const validationError = fromZodError(err);
    res.status(422).json({
      error: { code: 'VALIDATION_ERROR', message: validationError.message },
    });
    return;
  }

  // Prisma known errors
  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        error: { code: 'CONFLICT', message: 'A record with this value already exists.' },
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Record not found.' },
      });
      return;
    }
  }

  // Custom app errors with statusCode
  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_SERVER_ERROR';
  const message =
    statusCode === 500 ? 'An internal server error occurred.' : err.message;

  // Log full error server-side (never to client)
  if (statusCode === 500) {
    console.error('[ERROR]', err);
  }

  res.status(statusCode).json({ error: { code, message } });
}

/** Helper to create typed app errors */
export function createError(
  message: string,
  statusCode: number,
  code: string
): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  err.code = code;
  return err;
}
