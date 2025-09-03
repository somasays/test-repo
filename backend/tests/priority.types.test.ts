import { describe, test, expect } from 'vitest';
import { 
  Priority,
  CreateTodoRequest,
  UpdateTodoRequest,
  Todo,
  TodoResponse,
  isPriority,
  validatePriority,
  comparePriorities 
} from '../src/types/todo.js';

describe('Priority Type System', () => {
  describe('Priority type validation', () => {
    test('should validate HIGH priority', () => {
      const priority: Priority = 'HIGH';
      expect(priority).toBe('HIGH');
      expect(isPriority('HIGH')).toBe(true);
    });

    test('should validate MEDIUM priority', () => {
      const priority: Priority = 'MEDIUM';
      expect(priority).toBe('MEDIUM');
      expect(isPriority('MEDIUM')).toBe(true);
    });

    test('should validate LOW priority', () => {
      const priority: Priority = 'LOW';
      expect(priority).toBe('LOW');
      expect(isPriority('LOW')).toBe(true);
    });

    test('should reject invalid priority values', () => {
      expect(isPriority('URGENT')).toBe(false);
      expect(isPriority('high')).toBe(false);  // case sensitive
      expect(isPriority('medium')).toBe(false);
      expect(isPriority('low')).toBe(false);
      expect(isPriority('')).toBe(false);
      expect(isPriority(null)).toBe(false);
      expect(isPriority(undefined)).toBe(false);
      expect(isPriority(123)).toBe(false);
      expect(isPriority({})).toBe(false);
    });
  });

  describe('validatePriority function', () => {
    test('should return validation result for valid priorities', () => {
      expect(validatePriority('HIGH')).toEqual({ isValid: true });
      expect(validatePriority('MEDIUM')).toEqual({ isValid: true });
      expect(validatePriority('LOW')).toEqual({ isValid: true });
    });

    test('should return validation error for invalid priorities', () => {
      expect(validatePriority('URGENT')).toEqual({
        isValid: false,
        error: 'Priority must be one of: HIGH, MEDIUM, LOW'
      });
      expect(validatePriority('high')).toEqual({
        isValid: false,
        error: 'Priority must be one of: HIGH, MEDIUM, LOW'
      });
      expect(validatePriority('')).toEqual({
        isValid: false,
        error: 'Priority must be one of: HIGH, MEDIUM, LOW'
      });
    });

    test('should handle null and undefined gracefully', () => {
      expect(validatePriority(null)).toEqual({
        isValid: false,
        error: 'Priority must be one of: HIGH, MEDIUM, LOW'
      });
      expect(validatePriority(undefined)).toEqual({
        isValid: false,
        error: 'Priority must be one of: HIGH, MEDIUM, LOW'
      });
    });
  });

  describe('comparePriorities function', () => {
    test('should return correct comparison values for priority ordering', () => {
      // HIGH > MEDIUM > LOW
      expect(comparePriorities('HIGH', 'MEDIUM')).toBe(-1); // HIGH comes first
      expect(comparePriorities('HIGH', 'LOW')).toBe(-1);    // HIGH comes first
      expect(comparePriorities('MEDIUM', 'LOW')).toBe(-1);  // MEDIUM comes first
      
      expect(comparePriorities('MEDIUM', 'HIGH')).toBe(1);  // MEDIUM comes after HIGH
      expect(comparePriorities('LOW', 'HIGH')).toBe(1);     // LOW comes after HIGH
      expect(comparePriorities('LOW', 'MEDIUM')).toBe(1);   // LOW comes after MEDIUM
      
      expect(comparePriorities('HIGH', 'HIGH')).toBe(0);    // Equal
      expect(comparePriorities('MEDIUM', 'MEDIUM')).toBe(0); // Equal
      expect(comparePriorities('LOW', 'LOW')).toBe(0);       // Equal
    });
  });
});

describe('Updated Todo Interfaces with Priority', () => {
  describe('CreateTodoRequest interface', () => {
    test('should accept priority in create request', () => {
      const request: CreateTodoRequest = {
        title: 'Test todo',
        description: 'Test description',
        priority: 'HIGH'
      };

      expect(request.priority).toBe('HIGH');
    });

    test('should work without priority (optional)', () => {
      const request: CreateTodoRequest = {
        title: 'Test todo',
        description: 'Test description'
      };

      expect(request.priority).toBeUndefined();
    });
  });

  describe('UpdateTodoRequest interface', () => {
    test('should accept priority in update request', () => {
      const request: UpdateTodoRequest = {
        priority: 'LOW'
      };

      expect(request.priority).toBe('LOW');
    });

    test('should work with all optional fields including priority', () => {
      const request: UpdateTodoRequest = {
        title: 'Updated title',
        description: 'Updated description',
        completed: true,
        priority: 'MEDIUM'
      };

      expect(request.priority).toBe('MEDIUM');
    });
  });

  describe('Todo interface', () => {
    test('should include priority field in Todo interface', () => {
      const todo: Todo = {
        id: 'test-id',
        title: 'Test todo',
        description: 'Test description',
        completed: false,
        priority: 'HIGH',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(todo.priority).toBe('HIGH');
    });

    test('should enforce priority as required field', () => {
      // This test ensures priority is required in Todo interface
      // TypeScript compilation will fail if priority is missing
      const todo: Todo = {
        id: 'test-id',
        title: 'Test todo',
        completed: false,
        priority: 'MEDIUM', // This is required
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(todo.priority).toBe('MEDIUM');
    });
  });

  describe('TodoResponse interface', () => {
    test('should include priority field in TodoResponse interface', () => {
      const response: TodoResponse = {
        id: 'test-id',
        title: 'Test todo',
        description: 'Test description',
        completed: false,
        priority: 'LOW',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };

      expect(response.priority).toBe('LOW');
    });
  });
});