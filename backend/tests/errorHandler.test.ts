import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandler, notFoundHandler } from '../src/middleware/errorHandler.js';
import { AppError } from '../src/utils/appError.js';

describe('Error Handler Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let mockStatus: any;
  let mockJson: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup response mocks
    mockStatus = vi.fn().mockReturnThis();
    mockJson = vi.fn().mockReturnThis();
    
    req = {
      url: '/api/test',
      method: 'GET',
      originalUrl: '/api/test'
    };
    res = {
      status: mockStatus,
      json: mockJson
    };
    next = vi.fn();

    // Spy on console.error
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('errorHandler', () => {
    it('should handle AppError with custom status and message', () => {
      const appError = new AppError('Todo not found', 404);

      errorHandler(appError, req as Request, res as Response, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', {
        message: 'Todo not found',
        stack: expect.any(String),
        url: '/api/test',
        method: 'GET',
        timestamp: expect.any(String)
      });

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Todo not found',
        message: 'An error occurred'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle AppError with default status code', () => {
      const appError = new AppError('Custom error message');

      errorHandler(appError, req as Request, res as Response, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', expect.objectContaining({
        message: 'Custom error message',
        url: '/api/test',
        method: 'GET'
      }));

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Custom error message',
        message: 'An error occurred'
      });
    });

    it('should handle ValidationError', () => {
      const validationError = new Error('Invalid input data');
      validationError.name = 'ValidationError';

      errorHandler(validationError, req as Request, res as Response, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', expect.objectContaining({
        message: 'Invalid input data',
        url: '/api/test',
        method: 'GET'
      }));

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid input data',
        message: 'Validation failed'
      });
    });

    it('should handle generic Error with 500 status', () => {
      const genericError = new Error('Database connection failed');

      errorHandler(genericError, req as Request, res as Response, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', expect.objectContaining({
        message: 'Database connection failed',
        url: '/api/test',
        method: 'GET'
      }));

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        message: 'Something went wrong'
      });
    });

    it('should handle error without message', () => {
      const error = new Error();

      errorHandler(error, req as Request, res as Response, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', expect.objectContaining({
        message: '',
        url: '/api/test',
        method: 'GET'
      }));

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        message: 'Something went wrong'
      });
    });

    it('should log error details including timestamp', () => {
      const appError = new AppError('Test error', 400);
      const timestampBefore = Date.now();

      errorHandler(appError, req as Request, res as Response, next);

      const logCall = consoleErrorSpy.mock.calls[0][1];
      const loggedTimestamp = new Date(logCall.timestamp).getTime();
      const timestampAfter = Date.now();

      expect(loggedTimestamp).toBeGreaterThanOrEqual(timestampBefore);
      expect(loggedTimestamp).toBeLessThanOrEqual(timestampAfter);
      expect(logCall.message).toBe('Test error');
      expect(logCall.url).toBe('/api/test');
      expect(logCall.method).toBe('GET');
      expect(logCall.stack).toBeDefined();
    });

    it('should handle different HTTP methods in logging', () => {
      req.method = 'POST';
      req.url = '/api/todos';
      const appError = new AppError('Post error', 400);

      errorHandler(appError, req as Request, res as Response, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', expect.objectContaining({
        method: 'POST',
        url: '/api/todos'
      }));
    });

    it('should handle AppError with different status codes', () => {
      const testCases = [
        { statusCode: 400, message: 'Bad Request' },
        { statusCode: 401, message: 'Unauthorized' },
        { statusCode: 403, message: 'Forbidden' },
        { statusCode: 404, message: 'Not Found' },
        { statusCode: 409, message: 'Conflict' },
        { statusCode: 422, message: 'Unprocessable Entity' }
      ];

      testCases.forEach(({ statusCode, message }) => {
        vi.clearAllMocks();
        mockStatus = vi.fn().mockReturnThis();
        mockJson = vi.fn().mockReturnThis();
        res.status = mockStatus;
        res.json = mockJson;

        const appError = new AppError(message, statusCode);
        errorHandler(appError, req as Request, res as Response, next);

        expect(mockStatus).toHaveBeenCalledWith(statusCode);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          error: message,
          message: 'An error occurred'
        });
      });
    });

    it('should handle errors with very long messages', () => {
      const longMessage = 'a'.repeat(1000);
      const appError = new AppError(longMessage, 400);

      errorHandler(appError, req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: longMessage,
        message: 'An error occurred'
      });
    });

    it('should handle errors with special characters', () => {
      const specialMessage = 'Error with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const appError = new AppError(specialMessage, 400);

      errorHandler(appError, req as Request, res as Response, next);

      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: specialMessage,
        message: 'An error occurred'
      });
    });

    it('should handle errors with unicode characters', () => {
      const unicodeMessage = 'Error with unicode: 你好世界 🌍 café naïve résumé';
      const appError = new AppError(unicodeMessage, 400);

      errorHandler(appError, req as Request, res as Response, next);

      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: unicodeMessage,
        message: 'An error occurred'
      });
    });

    it('should handle null and undefined error properties gracefully', () => {
      const error = new Error();
      (error as any).message = null;
      (error as any).stack = undefined;

      errorHandler(error, req as Request, res as Response, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', expect.objectContaining({
        message: null,
        stack: undefined,
        url: '/api/test',
        method: 'GET'
      }));

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        message: 'Something went wrong'
      });
    });
  });

  describe('notFoundHandler', () => {
    it('should create AppError and call next for unknown routes', () => {
      req.originalUrl = '/api/unknown-route';

      notFoundHandler(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      
      const calledError = (next as any).mock.calls[0][0];
      expect(calledError.message).toBe('Route /api/unknown-route not found');
      expect(calledError.statusCode).toBe(404);
      expect(calledError.isOperational).toBe(true);
    });

    it('should handle different unknown routes', () => {
      const testRoutes = [
        '/api/nonexistent',
        '/unknown/path',
        '/api/todos/invalid-action',
        '/api/users',
        '/'
      ];

      testRoutes.forEach(route => {
        vi.clearAllMocks();
        req.originalUrl = route;

        notFoundHandler(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        
        const calledError = (next as any).mock.calls[0][0];
        expect(calledError.message).toBe(`Route ${route} not found`);
        expect(calledError.statusCode).toBe(404);
      });
    });

    it('should handle routes with query parameters', () => {
      req.originalUrl = '/api/todos?page=1&limit=10';

      notFoundHandler(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      
      const calledError = (next as any).mock.calls[0][0];
      expect(calledError.message).toBe('Route /api/todos?page=1&limit=10 not found');
    });

    it('should handle routes with special characters', () => {
      req.originalUrl = '/api/todos/special-chars-!@#$%^&*()';

      notFoundHandler(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      
      const calledError = (next as any).mock.calls[0][0];
      expect(calledError.message).toBe('Route /api/todos/special-chars-!@#$%^&*() not found');
    });

    it('should handle empty or undefined originalUrl', () => {
      req.originalUrl = '';

      notFoundHandler(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      
      const calledError = (next as any).mock.calls[0][0];
      expect(calledError.message).toBe('Route  not found');
    });

    it('should not call res.status or res.json directly', () => {
      req.originalUrl = '/api/unknown';

      notFoundHandler(req as Request, res as Response, next);

      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration scenarios', () => {
    it('should handle notFoundHandler followed by errorHandler', () => {
      req.originalUrl = '/api/nonexistent';

      // First call notFoundHandler
      notFoundHandler(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = (next as any).mock.calls[0][0];

      // Then call errorHandler with the created error
      vi.clearAllMocks();
      errorHandler(error, req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Route /api/nonexistent not found',
        message: 'An error occurred'
      });
    });

    it('should properly chain error handling in middleware stack', () => {
      const middlewareError = new AppError('Validation failed', 422);

      // Simulate error thrown in middleware and caught by errorHandler
      errorHandler(middlewareError, req as Request, res as Response, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', expect.objectContaining({
        message: 'Validation failed'
      }));
      
      expect(mockStatus).toHaveBeenCalledWith(422);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        message: 'An error occurred'
      });
      
      // Error handler should not call next - it's the final handler
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle when req.url is undefined', () => {
      req.url = undefined;
      req.method = undefined;
      const error = new Error('Test error');

      errorHandler(error, req as Request, res as Response, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', expect.objectContaining({
        url: undefined,
        method: undefined
      }));
    });

    it('should handle circular reference in error object', () => {
      const error = new Error('Test error') as any;
      error.circular = error; // Create circular reference

      // Should not throw during JSON serialization in logging
      expect(() => {
        errorHandler(error, req as Request, res as Response, next);
      }).not.toThrow();

      expect(mockStatus).toHaveBeenCalledWith(500);
    });

    it('should handle when error.stack is not available', () => {
      const error = new Error('Test error');
      delete (error as any).stack;

      errorHandler(error, req as Request, res as Response, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', expect.objectContaining({
        stack: undefined
      }));
    });
  });
});