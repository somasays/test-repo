import { body, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/todo.js';

export const validateCreateTodo = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters')
];

export const validateUpdateTodo = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean value')
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,!?#@]*$/)
    .withMessage('Search query contains invalid characters'),
  query('status')
    .optional()
    .isIn(['completed', 'pending', 'all'])
    .withMessage('Status must be one of: completed, pending, all'),
  query('created_after')
    .optional()
    .isISO8601({ strict: true })
    .withMessage('created_after must be a valid ISO 8601 date'),
  query('created_before')
    .optional()
    .isISO8601({ strict: true })
    .withMessage('created_before must be a valid ISO 8601 date'),
  query('updated_after')
    .optional()
    .isISO8601({ strict: true })
    .withMessage('updated_after must be a valid ISO 8601 date'),
  query('updated_before')
    .optional()
    .isISO8601({ strict: true })
    .withMessage('updated_before must be a valid ISO 8601 date'),
  // Custom validator for date range logic
  query()
    .custom((value, { req }) => {
      const createdAfter = req.query.created_after;
      const createdBefore = req.query.created_before;
      const updatedAfter = req.query.updated_after;
      const updatedBefore = req.query.updated_before;

      // Validate created date range
      if (createdAfter && createdBefore) {
        const after = new Date(createdAfter as string);
        const before = new Date(createdBefore as string);
        if (after >= before) {
          throw new Error('created_after must be before created_before');
        }
      }

      // Validate updated date range
      if (updatedAfter && updatedBefore) {
        const after = new Date(updatedAfter as string);
        const before = new Date(updatedBefore as string);
        if (after >= before) {
          throw new Error('updated_after must be before updated_before');
        }
      }

      return true;
    })
];

export const handleValidationErrors = (
  req: Request,
  res: Response<ApiResponse<null>>,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg).join(', ');
    res.status(400).json({
      success: false,
      error: errorMessages,
      message: 'Validation failed'
    });
    return;
  }
  next();
};