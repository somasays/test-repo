import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextFunction, Request, Response } from 'express';
import { todoController } from '../src/controllers/todoController.js';
import { todoService } from '../src/services/todoService.js';
import { AppError } from '../src/utils/appError.js';

// Mock the todo service
vi.mock('../src/services/todoService.js', () => ({
  todoService: {
    getAllTodos: vi.fn(),
    getTodoById: vi.fn(),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
    deleteCompletedTodos: vi.fn(),
    getTodoStats: vi.fn(),
    markAllCompleted: vi.fn(),
    searchAndFilterTodos: vi.fn()
  }
}));

describe('TodoController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let mockStatus: any;
  let mockJson: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup response mocks
    mockStatus = vi.fn().mockReturnThis();
    mockJson = vi.fn().mockReturnThis();
    
    req = {};
    res = {
      status: mockStatus,
      json: mockJson
    };
    next = vi.fn();
  });

  describe('getAllTodos', () => {
    it('should return all todos with default pagination', async () => {
      const mockResult = {
        todos: [
          { id: '1', title: 'Todo 1', completed: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
        ],
        total: 1,
        page: 1,
        limit: 10
      };

      (todoService.getAllTodos as any).mockResolvedValue(mockResult);
      req.query = {};

      await todoController.getAllTodos(req as any, res as any, next);

      expect(todoService.getAllTodos).toHaveBeenCalledWith(1, 10);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Todos retrieved successfully'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return todos with custom pagination', async () => {
      const mockResult = {
        todos: [
          { id: '1', title: 'Todo 1', completed: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
        ],
        total: 20,
        page: 2,
        limit: 5
      };

      (todoService.getAllTodos as any).mockResolvedValue(mockResult);
      req.query = { page: '2', limit: '5' };

      await todoController.getAllTodos(req as any, res as any, next);

      expect(todoService.getAllTodos).toHaveBeenCalledWith(2, 5);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Todos retrieved successfully'
      });
    });

    it('should handle invalid pagination parameters gracefully', async () => {
      const mockResult = {
        todos: [],
        total: 0,
        page: 1,
        limit: 10
      };

      (todoService.getAllTodos as any).mockResolvedValue(mockResult);
      req.query = { page: 'invalid', limit: 'invalid' };

      await todoController.getAllTodos(req as any, res as any, next);

      expect(todoService.getAllTodos).toHaveBeenCalledWith(1, 10); // Should fall back to defaults
    });

    it('should handle zero and negative pagination parameters', async () => {
      const mockResult = {
        todos: [],
        total: 0,
        page: 1,
        limit: -5
      };

      (todoService.getAllTodos as any).mockResolvedValue(mockResult);
      req.query = { page: '0', limit: '-5' };

      await todoController.getAllTodos(req as any, res as any, next);

      // Controller uses parsed values directly, doesn't validate them (that's the service's job)
      expect(todoService.getAllTodos).toHaveBeenCalledWith(1, -5); // 0 becomes 1 due to ||, -5 is kept as is
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Service error');
      (todoService.getAllTodos as any).mockRejectedValue(error);
      req.query = {};

      await todoController.getAllTodos(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
    });
  });

  describe('getTodoById', () => {
    it('should return todo by id', async () => {
      const mockTodo = {
        id: '1',
        title: 'Test Todo',
        completed: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      (todoService.getTodoById as any).mockResolvedValue(mockTodo);
      req.params = { id: '1' };

      await todoController.getTodoById(req as any, res as any, next);

      expect(todoService.getTodoById).toHaveBeenCalledWith('1');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockTodo,
        message: 'Todo retrieved successfully'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw not found error when todo does not exist', async () => {
      (todoService.getTodoById as any).mockResolvedValue(null);
      req.params = { id: 'non-existent' };

      await todoController.getTodoById(req as any, res as any, next);

      expect(todoService.getTodoById).toHaveBeenCalledWith('non-existent');
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();

      const calledError = (next as any).mock.calls[0][0];
      expect(calledError.message).toBe('Todo with id non-existent not found');
      expect(calledError.statusCode).toBe(404);
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Service error');
      (todoService.getTodoById as any).mockRejectedValue(error);
      req.params = { id: '1' };

      await todoController.getTodoById(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
    });
  });

  describe('createTodo', () => {
    it('should create a new todo', async () => {
      const todoData = { title: 'New Todo', description: 'Description' };
      const mockCreatedTodo = {
        id: '1',
        title: 'New Todo',
        description: 'Description',
        completed: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      (todoService.createTodo as any).mockResolvedValue(mockCreatedTodo);
      req.body = todoData;

      await todoController.createTodo(req as any, res as any, next);

      expect(todoService.createTodo).toHaveBeenCalledWith(todoData);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedTodo,
        message: 'Todo created successfully'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should create todo without description', async () => {
      const todoData = { title: 'New Todo' };
      const mockCreatedTodo = {
        id: '1',
        title: 'New Todo',
        completed: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      (todoService.createTodo as any).mockResolvedValue(mockCreatedTodo);
      req.body = todoData;

      await todoController.createTodo(req as any, res as any, next);

      expect(todoService.createTodo).toHaveBeenCalledWith(todoData);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedTodo,
        message: 'Todo created successfully'
      });
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Service error');
      (todoService.createTodo as any).mockRejectedValue(error);
      req.body = { title: 'New Todo' };

      await todoController.createTodo(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
    });
  });

  describe('updateTodo', () => {
    it('should update todo successfully', async () => {
      const updateData = { title: 'Updated Todo', completed: true };
      const mockUpdatedTodo = {
        id: '1',
        title: 'Updated Todo',
        completed: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      (todoService.updateTodo as any).mockResolvedValue(mockUpdatedTodo);
      req.params = { id: '1' };
      req.body = updateData;

      await todoController.updateTodo(req as any, res as any, next);

      expect(todoService.updateTodo).toHaveBeenCalledWith('1', updateData);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedTodo,
        message: 'Todo updated successfully'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should update only title', async () => {
      const updateData = { title: 'Updated Title' };
      const mockUpdatedTodo = {
        id: '1',
        title: 'Updated Title',
        completed: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      (todoService.updateTodo as any).mockResolvedValue(mockUpdatedTodo);
      req.params = { id: '1' };
      req.body = updateData;

      await todoController.updateTodo(req as any, res as any, next);

      expect(todoService.updateTodo).toHaveBeenCalledWith('1', updateData);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedTodo,
        message: 'Todo updated successfully'
      });
    });

    it('should update only completed status', async () => {
      const updateData = { completed: true };
      const mockUpdatedTodo = {
        id: '1',
        title: 'Original Title',
        completed: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      (todoService.updateTodo as any).mockResolvedValue(mockUpdatedTodo);
      req.params = { id: '1' };
      req.body = updateData;

      await todoController.updateTodo(req as any, res as any, next);

      expect(todoService.updateTodo).toHaveBeenCalledWith('1', updateData);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should call next with error when service throws', async () => {
      const error = new AppError('Todo with id 1 not found', 404);
      (todoService.updateTodo as any).mockRejectedValue(error);
      req.params = { id: '1' };
      req.body = { title: 'Updated Title' };

      await todoController.updateTodo(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
    });
  });

  describe('deleteTodo', () => {
    it('should delete todo successfully', async () => {
      (todoService.deleteTodo as any).mockResolvedValue(undefined);
      req.params = { id: '1' };

      await todoController.deleteTodo(req as any, res as any, next);

      expect(todoService.deleteTodo).toHaveBeenCalledWith('1');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Todo deleted successfully'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error when todo does not exist', async () => {
      const error = new AppError('Todo with id non-existent not found', 404);
      (todoService.deleteTodo as any).mockRejectedValue(error);
      req.params = { id: 'non-existent' };

      await todoController.deleteTodo(req as any, res as any, next);

      expect(todoService.deleteTodo).toHaveBeenCalledWith('non-existent');
      expect(next).toHaveBeenCalledWith(error);
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Service error');
      (todoService.deleteTodo as any).mockRejectedValue(error);
      req.params = { id: '1' };

      await todoController.deleteTodo(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
    });
  });

  describe('deleteCompletedTodos', () => {
    it('should delete completed todos successfully', async () => {
      const mockResult = { deletedCount: 3 };
      (todoService.deleteCompletedTodos as any).mockResolvedValue(mockResult);

      await todoController.deleteCompletedTodos(req as any, res as any, next);

      expect(todoService.deleteCompletedTodos).toHaveBeenCalledWith();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: '3 completed todos deleted successfully'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle when no completed todos exist', async () => {
      const mockResult = { deletedCount: 0 };
      (todoService.deleteCompletedTodos as any).mockResolvedValue(mockResult);

      await todoController.deleteCompletedTodos(req as any, res as any, next);

      expect(todoService.deleteCompletedTodos).toHaveBeenCalledWith();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: '0 completed todos deleted successfully'
      });
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Service error');
      (todoService.deleteCompletedTodos as any).mockRejectedValue(error);

      await todoController.deleteCompletedTodos(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
    });
  });

  describe('getTodoStats', () => {
    it('should return todo statistics', async () => {
      const mockStats = { total: 10, completed: 3, pending: 7 };
      (todoService.getTodoStats as any).mockResolvedValue(mockStats);

      await todoController.getTodoStats(req as any, res as any, next);

      expect(todoService.getTodoStats).toHaveBeenCalledWith();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockStats,
        message: 'Todo stats retrieved successfully'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return zero stats when no todos exist', async () => {
      const mockStats = { total: 0, completed: 0, pending: 0 };
      (todoService.getTodoStats as any).mockResolvedValue(mockStats);

      await todoController.getTodoStats(req as any, res as any, next);

      expect(todoService.getTodoStats).toHaveBeenCalledWith();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockStats,
        message: 'Todo stats retrieved successfully'
      });
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Service error');
      (todoService.getTodoStats as any).mockRejectedValue(error);

      await todoController.getTodoStats(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
    });
  });

  describe('markAllCompleted', () => {
    it('should mark all todos as completed', async () => {
      const mockResult = { updatedCount: 5 };
      (todoService.markAllCompleted as any).mockResolvedValue(mockResult);

      await todoController.markAllCompleted(req as any, res as any, next);

      expect(todoService.markAllCompleted).toHaveBeenCalledWith();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: '5 todos marked as completed'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle when no todos need updating', async () => {
      const mockResult = { updatedCount: 0 };
      (todoService.markAllCompleted as any).mockResolvedValue(mockResult);

      await todoController.markAllCompleted(req as any, res as any, next);

      expect(todoService.markAllCompleted).toHaveBeenCalledWith();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: '0 todos marked as completed'
      });
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Service error');
      (todoService.markAllCompleted as any).mockRejectedValue(error);

      await todoController.markAllCompleted(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle missing request params gracefully', async () => {
      req.params = {}; // Empty params object instead of undefined

      await todoController.getTodoById(req as any, res as any, next);

      expect(todoService.getTodoById).toHaveBeenCalledWith(undefined);
      expect(next).toHaveBeenCalled(); // Should propagate error from service or handle null response
    });

    it('should handle undefined request body gracefully', async () => {
      req.body = undefined;

      await todoController.createTodo(req as any, res as any, next);

      expect(todoService.createTodo).toHaveBeenCalledWith(undefined);
      expect(next).toHaveBeenCalled(); // Should propagate error from service
    });

    it('should handle malformed query parameters', async () => {
      const mockResult = {
        todos: [],
        total: 0,
        page: 1,
        limit: 10
      };

      (todoService.getAllTodos as any).mockResolvedValue(mockResult);
      req.query = { page: 'not-a-number', limit: 'also-not-a-number', other: 'param' };

      await todoController.getAllTodos(req as any, res as any, next);

      expect(todoService.getAllTodos).toHaveBeenCalledWith(1, 10); // Should fallback to defaults
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should handle extremely large pagination values', async () => {
      const mockResult = {
        todos: [],
        total: 0,
        page: 1,
        limit: 10
      };

      (todoService.getAllTodos as any).mockResolvedValue(mockResult);
      req.query = { page: '999999999999', limit: '999999999999' };

      await todoController.getAllTodos(req as any, res as any, next);

      expect(todoService.getAllTodos).toHaveBeenCalledWith(999999999999, 999999999999);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should handle empty object update data', async () => {
      const mockUpdatedTodo = {
        id: '1',
        title: 'Original Title',
        completed: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02'
      };

      (todoService.updateTodo as any).mockResolvedValue(mockUpdatedTodo);
      req.params = { id: '1' };
      req.body = {};

      await todoController.updateTodo(req as any, res as any, next);

      expect(todoService.updateTodo).toHaveBeenCalledWith('1', {});
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should handle special characters in IDs', async () => {
      const specialId = 'todo-with-special-chars-!@#$%';
      (todoService.getTodoById as any).mockResolvedValue(null);
      req.params = { id: specialId };

      await todoController.getTodoById(req as any, res as any, next);

      expect(todoService.getTodoById).toHaveBeenCalledWith(specialId);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should handle null and undefined values in request bodies', async () => {
      const todoData = { title: null, description: undefined };
      const mockCreatedTodo = {
        id: '1',
        title: null,
        description: undefined,
        completed: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      (todoService.createTodo as any).mockResolvedValue(mockCreatedTodo);
      req.body = todoData;

      await todoController.createTodo(req as any, res as any, next);

      expect(todoService.createTodo).toHaveBeenCalledWith(todoData);
      expect(mockStatus).toHaveBeenCalledWith(201);
    });
  });

  describe('getAllTodos with search and filter', () => {
    it('should call searchAndFilterTodos when search parameters are provided', async () => {
      req.query = { q: 'meeting', status: 'pending', page: '1', limit: '10' };
      
      const mockSearchResult = {
        todos: [
          {
            id: '1',
            title: 'Meeting with team',
            description: 'Weekly sync',
            completed: false,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
          }
        ],
        total: 5,
        filtered: 1,
        page: 1,
        limit: 10,
        query: { q: 'meeting', status: 'pending' }
      };

      (todoService.searchAndFilterTodos as any).mockResolvedValue(mockSearchResult);
      
      await todoController.getAllTodos(req as any, res as any, next);
      
      expect(todoService.searchAndFilterTodos).toHaveBeenCalledWith(req.query, 1, 10);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockSearchResult,
        message: 'Todos retrieved successfully'
      });
    });

    it('should call searchAndFilterTodos when status filter is provided', async () => {
      req.query = { status: 'completed' };
      
      const mockSearchResult = {
        todos: [],
        total: 5,
        filtered: 2,
        page: 1,
        limit: 10,
        query: { status: 'completed' }
      };

      (todoService.searchAndFilterTodos as any).mockResolvedValue(mockSearchResult);
      
      await todoController.getAllTodos(req as any, res as any, next);
      
      expect(todoService.searchAndFilterTodos).toHaveBeenCalledWith(req.query, 1, 10);
      expect(todoService.getAllTodos).not.toHaveBeenCalled();
    });

    it('should call searchAndFilterTodos when date filters are provided', async () => {
      req.query = { 
        created_after: '2024-01-01T00:00:00.000Z',
        created_before: '2024-12-31T23:59:59.999Z'
      };
      
      const mockSearchResult = {
        todos: [],
        total: 5,
        filtered: 3,
        page: 1,
        limit: 10,
        query: { 
          created_after: '2024-01-01T00:00:00.000Z',
          created_before: '2024-12-31T23:59:59.999Z'
        }
      };

      (todoService.searchAndFilterTodos as any).mockResolvedValue(mockSearchResult);
      
      await todoController.getAllTodos(req as any, res as any, next);
      
      expect(todoService.searchAndFilterTodos).toHaveBeenCalledWith(req.query, 1, 10);
    });

    it('should call regular getAllTodos when no search/filter parameters are provided', async () => {
      req.query = { page: '2', limit: '5' };
      
      const mockResult = {
        todos: [],
        total: 5,
        page: 2,
        limit: 5
      };

      (todoService.getAllTodos as any).mockResolvedValue(mockResult);
      
      await todoController.getAllTodos(req as any, res as any, next);
      
      expect(todoService.getAllTodos).toHaveBeenCalledWith(2, 5);
      expect(todoService.searchAndFilterTodos).not.toHaveBeenCalled();
    });

    it('should handle combined search and filter parameters', async () => {
      req.query = { 
        q: 'project',
        status: 'pending',
        created_after: '2024-01-01T00:00:00.000Z',
        page: '2',
        limit: '15'
      };
      
      const mockSearchResult = {
        todos: [],
        total: 10,
        filtered: 3,
        page: 2,
        limit: 15,
        query: { 
          q: 'project',
          status: 'pending',
          created_after: '2024-01-01T00:00:00.000Z'
        }
      };

      (todoService.searchAndFilterTodos as any).mockResolvedValue(mockSearchResult);
      
      await todoController.getAllTodos(req as any, res as any, next);
      
      expect(todoService.searchAndFilterTodos).toHaveBeenCalledWith(req.query, 2, 15);
    });

    it('should handle search/filter errors properly', async () => {
      req.query = { q: 'meeting' };
      const error = new AppError('Search failed', 500);
      
      (todoService.searchAndFilterTodos as any).mockRejectedValue(error);
      
      await todoController.getAllTodos(req as any, res as any, next);
      
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should detect search parameters correctly with undefined status', async () => {
      req.query = { status: undefined, q: 'meeting' };
      
      const mockSearchResult = {
        todos: [],
        total: 5,
        filtered: 1,
        page: 1,
        limit: 10,
        query: { q: 'meeting' }
      };

      (todoService.searchAndFilterTodos as any).mockResolvedValue(mockSearchResult);
      
      await todoController.getAllTodos(req as any, res as any, next);
      
      expect(todoService.searchAndFilterTodos).toHaveBeenCalled();
    });
  });

  describe('Priority Support in API', () => {
    describe('createTodo with priority', () => {
      it('should create todo with HIGH priority', async () => {
        const todoData = { 
          title: 'High priority task',
          description: 'Very important task',
          priority: 'HIGH' as const
        };
        
        const mockCreatedTodo = {
          id: '1',
          title: 'High priority task',
          description: 'Very important task',
          completed: false,
          priority: 'HIGH' as const,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        };

        (todoService.createTodo as any).mockResolvedValue(mockCreatedTodo);
        req.body = todoData;

        await todoController.createTodo(req as any, res as any, next);

        expect(todoService.createTodo).toHaveBeenCalledWith(todoData);
        expect(mockStatus).toHaveBeenCalledWith(201);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          data: mockCreatedTodo,
          message: 'Todo created successfully'
        });
      });

      it('should create todo with MEDIUM priority by default', async () => {
        const todoData = { 
          title: 'Default priority task',
          description: 'Task without specified priority'
        };
        
        const mockCreatedTodo = {
          id: '2',
          title: 'Default priority task',
          description: 'Task without specified priority',
          completed: false,
          priority: 'MEDIUM' as const,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        };

        (todoService.createTodo as any).mockResolvedValue(mockCreatedTodo);
        req.body = todoData;

        await todoController.createTodo(req as any, res as any, next);

        expect(todoService.createTodo).toHaveBeenCalledWith(todoData);
        expect(mockStatus).toHaveBeenCalledWith(201);
      });

      it('should create todo with specified LOW priority', async () => {
        const todoData = { 
          title: 'Low priority task',
          priority: 'LOW' as const
        };
        
        const mockCreatedTodo = {
          id: '3',
          title: 'Low priority task',
          completed: false,
          priority: 'LOW' as const,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        };

        (todoService.createTodo as any).mockResolvedValue(mockCreatedTodo);
        req.body = todoData;

        await todoController.createTodo(req as any, res as any, next);

        expect(todoService.createTodo).toHaveBeenCalledWith(todoData);
        expect(mockStatus).toHaveBeenCalledWith(201);
      });
    });

    describe('updateTodo with priority', () => {
      it('should update todo priority from MEDIUM to HIGH', async () => {
        const updateData = { 
          priority: 'HIGH' as const 
        };
        
        const mockUpdatedTodo = {
          id: '1',
          title: 'Updated task',
          description: 'Task description',
          completed: false,
          priority: 'HIGH' as const,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T12:00:00.000Z'
        };

        (todoService.updateTodo as any).mockResolvedValue(mockUpdatedTodo);
        req.params = { id: '1' };
        req.body = updateData;

        await todoController.updateTodo(req as any, res as any, next);

        expect(todoService.updateTodo).toHaveBeenCalledWith('1', updateData);
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          data: mockUpdatedTodo,
          message: 'Todo updated successfully'
        });
      });

      it('should update todo priority along with other fields', async () => {
        const updateData = { 
          title: 'Updated high priority task',
          completed: true,
          priority: 'HIGH' as const 
        };
        
        const mockUpdatedTodo = {
          id: '2',
          title: 'Updated high priority task',
          description: 'Task description',
          completed: true,
          priority: 'HIGH' as const,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T12:00:00.000Z'
        };

        (todoService.updateTodo as any).mockResolvedValue(mockUpdatedTodo);
        req.params = { id: '2' };
        req.body = updateData;

        await todoController.updateTodo(req as any, res as any, next);

        expect(todoService.updateTodo).toHaveBeenCalledWith('2', updateData);
        expect(mockStatus).toHaveBeenCalledWith(200);
      });
    });

    describe('getAllTodos with priority filtering', () => {
      it('should filter todos by HIGH priority', async () => {
        req.query = { priority: 'HIGH' };
        
        const mockSearchResult = {
          todos: [
            {
              id: '1',
              title: 'High priority task 1',
              description: 'Important task',
              completed: false,
              priority: 'HIGH' as const,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            },
            {
              id: '2',
              title: 'High priority task 2',
              description: 'Another important task',
              completed: true,
              priority: 'HIGH' as const,
              createdAt: '2024-01-01T01:00:00.000Z',
              updatedAt: '2024-01-01T01:30:00.000Z'
            }
          ],
          total: 10,
          filtered: 2,
          page: 1,
          limit: 10,
          query: { priority: 'HIGH' }
        };

        (todoService.searchAndFilterTodos as any).mockResolvedValue(mockSearchResult);
        
        await todoController.getAllTodos(req as any, res as any, next);
        
        expect(todoService.searchAndFilterTodos).toHaveBeenCalledWith(req.query, 1, 10);
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          data: mockSearchResult,
          message: 'Todos retrieved successfully'
        });
      });

      it('should filter todos by MEDIUM priority', async () => {
        req.query = { priority: 'MEDIUM' };
        
        const mockSearchResult = {
          todos: [
            {
              id: '3',
              title: 'Medium priority task',
              completed: false,
              priority: 'MEDIUM' as const,
              createdAt: '2024-01-01T02:00:00.000Z',
              updatedAt: '2024-01-01T02:00:00.000Z'
            }
          ],
          total: 10,
          filtered: 1,
          page: 1,
          limit: 10,
          query: { priority: 'MEDIUM' }
        };

        (todoService.searchAndFilterTodos as any).mockResolvedValue(mockSearchResult);
        
        await todoController.getAllTodos(req as any, res as any, next);
        
        expect(todoService.searchAndFilterTodos).toHaveBeenCalledWith(req.query, 1, 10);
      });

      it('should combine priority filter with status filter', async () => {
        req.query = { priority: 'HIGH', status: 'pending' };
        
        const mockSearchResult = {
          todos: [
            {
              id: '1',
              title: 'High priority pending task',
              completed: false,
              priority: 'HIGH' as const,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            }
          ],
          total: 10,
          filtered: 1,
          page: 1,
          limit: 10,
          query: { priority: 'HIGH', status: 'pending' }
        };

        (todoService.searchAndFilterTodos as any).mockResolvedValue(mockSearchResult);
        
        await todoController.getAllTodos(req as any, res as any, next);
        
        expect(todoService.searchAndFilterTodos).toHaveBeenCalledWith(req.query, 1, 10);
      });

      it('should combine priority filter with text search', async () => {
        req.query = { priority: 'LOW', q: 'cleanup' };
        
        const mockSearchResult = {
          todos: [
            {
              id: '4',
              title: 'Cleanup old files',
              description: 'Remove unnecessary files',
              completed: false,
              priority: 'LOW' as const,
              createdAt: '2024-01-01T03:00:00.000Z',
              updatedAt: '2024-01-01T03:00:00.000Z'
            }
          ],
          total: 10,
          filtered: 1,
          page: 1,
          limit: 10,
          query: { priority: 'LOW', q: 'cleanup' }
        };

        (todoService.searchAndFilterTodos as any).mockResolvedValue(mockSearchResult);
        
        await todoController.getAllTodos(req as any, res as any, next);
        
        expect(todoService.searchAndFilterTodos).toHaveBeenCalledWith(req.query, 1, 10);
      });

      it('should combine priority with all other filters', async () => {
        req.query = { 
          priority: 'HIGH',
          status: 'completed',
          q: 'project',
          created_after: '2024-01-01T00:00:00.000Z',
          page: '2',
          limit: '5'
        };
        
        const mockSearchResult = {
          todos: [],
          total: 15,
          filtered: 0,
          page: 2,
          limit: 5,
          query: { 
            priority: 'HIGH',
            status: 'completed',
            q: 'project',
            created_after: '2024-01-01T00:00:00.000Z'
          }
        };

        (todoService.searchAndFilterTodos as any).mockResolvedValue(mockSearchResult);
        
        await todoController.getAllTodos(req as any, res as any, next);
        
        expect(todoService.searchAndFilterTodos).toHaveBeenCalledWith(req.query, 2, 5);
      });
    });

    describe('getTodoById with priority', () => {
      it('should return todo with priority information', async () => {
        const mockTodo = {
          id: '1',
          title: 'High priority task',
          description: 'Very important',
          completed: false,
          priority: 'HIGH' as const,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        };

        (todoService.getTodoById as any).mockResolvedValue(mockTodo);
        req.params = { id: '1' };

        await todoController.getTodoById(req as any, res as any, next);

        expect(todoService.getTodoById).toHaveBeenCalledWith('1');
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          data: mockTodo,
          message: 'Todo retrieved successfully'
        });
      });
    });

    describe('priority validation scenarios', () => {
      it('should handle creation with invalid priority gracefully', async () => {
        // This would typically be caught by validation middleware
        // but testing the flow if invalid data reaches the controller
        const todoData = { 
          title: 'Task with invalid priority',
          priority: 'URGENT' as any // Invalid priority
        };

        // Mock service would receive this and either:
        // 1. Reject it (if validation is in service)
        // 2. Process it (if validation is only in middleware)
        const mockCreatedTodo = {
          id: '1',
          title: 'Task with invalid priority',
          completed: false,
          priority: 'MEDIUM' as const, // Service might default to MEDIUM
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        };

        (todoService.createTodo as any).mockResolvedValue(mockCreatedTodo);
        req.body = todoData;

        await todoController.createTodo(req as any, res as any, next);

        expect(todoService.createTodo).toHaveBeenCalledWith(todoData);
      });
    });
  });
});