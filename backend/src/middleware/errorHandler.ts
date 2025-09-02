import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';
import { ApiResponse } from '../types/todo.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response<ApiResponse<null>>,
  next: NextFunction
): void => {
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      message: 'An error occurred'
    });
    return;
  }

  // Handle validation errors from express-validator
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: err.message,
      message: 'Validation failed'
    });
    return;
  }

  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'Something went wrong'
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response<ApiResponse<null>>,
  next: NextFunction
): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};