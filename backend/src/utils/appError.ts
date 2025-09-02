export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export const createNotFoundError = (resource: string, id: string): AppError => {
  return new AppError(`${resource} with id ${id} not found`, 404);
};

export const createValidationError = (message: string): AppError => {
  return new AppError(`Validation error: ${message}`, 400);
};

export const createConflictError = (message: string): AppError => {
  return new AppError(`Conflict: ${message}`, 409);
};