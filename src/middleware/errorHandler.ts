import type { Request, Response, NextFunction } from 'express';
import { isDevelopment } from '../config';
import type { ApiResponse } from '../types/index.js';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
): void => {
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${statusCode}: ${message}`);
  if (isDevelopment && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: isDevelopment ? message : statusCode === 500 ? 'Internal Server Error' : message,
  });
};

export const notFoundHandler = (
  _req: Request,
  res: Response<ApiResponse>
): void => {
  res.status(404).json({
    success: false,
    message: 'Resource not found',
  });
};
