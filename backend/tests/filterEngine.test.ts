import { describe, it, expect, beforeEach } from 'vitest';
import { FilterEngine } from '../src/services/search/filterEngine.js';
import { Todo } from '../src/types/todo.js';
import { FilterCriteria, ValidationResult } from '../src/types/search.js';

describe('FilterEngine', () => {
  let filterEngine: FilterEngine;
  let testTodos: Todo[];

  beforeEach(() => {
    filterEngine = new FilterEngine();
    
    // Create test data with various statuses and dates
    testTodos = [
      {
        id: '1',
        title: 'Completed task 1',
        description: 'Already done',
        completed: true,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-02T10:00:00Z'),
      },
      {
        id: '2',
        title: 'Pending task 1',
        description: 'Still working on it',
        completed: false,
        createdAt: new Date('2024-01-05T10:00:00Z'),
        updatedAt: new Date('2024-01-06T10:00:00Z'),
      },
      {
        id: '3',
        title: 'Completed task 2',
        description: 'Another done task',
        completed: true,
        createdAt: new Date('2024-01-10T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      },
      {
        id: '4',
        title: 'Pending task 2',
        description: 'Need to finish this',
        completed: false,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-16T10:00:00Z'),
      },
      {
        id: '5',
        title: 'Old completed task',
        description: 'Finished long ago',
        completed: true,
        createdAt: new Date('2023-12-01T10:00:00Z'),
        updatedAt: new Date('2023-12-02T10:00:00Z'),
      },
      {
        id: '6',
        title: 'Recent pending task',
        description: 'Just started',
        completed: false,
        createdAt: new Date('2024-02-01T10:00:00Z'),
        updatedAt: new Date('2024-02-01T10:00:00Z'),
      }
    ];
  });

  describe('filter', () => {
    it('should return all todos when no filter criteria provided', () => {
      const criteria: FilterCriteria = {};
      const result = filterEngine.filter(testTodos, criteria);
      
      expect(result).toHaveLength(6);
      expect(result).toEqual(testTodos);
    });

    it('should filter todos by completed status', () => {
      const criteria: FilterCriteria = {
        status: 'completed'
      };
      const result = filterEngine.filter(testTodos, criteria);
      
      expect(result).toHaveLength(3);
      expect(result.every(todo => todo.completed)).toBe(true);
      expect(result.map(todo => todo.id)).toEqual(expect.arrayContaining(['1', '3', '5']));
    });

    it('should filter todos by pending status', () => {
      const criteria: FilterCriteria = {
        status: 'pending'
      };
      const result = filterEngine.filter(testTodos, criteria);
      
      expect(result).toHaveLength(3);
      expect(result.every(todo => !todo.completed)).toBe(true);
      expect(result.map(todo => todo.id)).toEqual(expect.arrayContaining(['2', '4', '6']));
    });

    it('should return all todos when status is "all"', () => {
      const criteria: FilterCriteria = {
        status: 'all'
      };
      const result = filterEngine.filter(testTodos, criteria);
      
      expect(result).toHaveLength(6);
      expect(result).toEqual(testTodos);
    });

    it('should filter todos created after a specific date', () => {
      const criteria: FilterCriteria = {
        createdAfter: new Date('2024-01-04T00:00:00Z')
      };
      const result = filterEngine.filter(testTodos, criteria);
      
      expect(result).toHaveLength(4);
      expect(result.map(todo => todo.id)).toEqual(expect.arrayContaining(['2', '3', '4', '6']));
    });

    it('should filter todos created before a specific date', () => {
      const criteria: FilterCriteria = {
        createdBefore: new Date('2024-01-10T00:00:00Z')
      };
      const result = filterEngine.filter(testTodos, criteria);
      
      expect(result).toHaveLength(3);
      expect(result.map(todo => todo.id)).toEqual(expect.arrayContaining(['1', '2', '5']));
    });

    it('should filter todos updated after a specific date', () => {
      const criteria: FilterCriteria = {
        updatedAfter: new Date('2024-01-10T00:00:00Z')
      };
      const result = filterEngine.filter(testTodos, criteria);
      
      expect(result).toHaveLength(3);
      expect(result.map(todo => todo.id)).toEqual(expect.arrayContaining(['3', '4', '6']));
    });

    it('should filter todos updated before a specific date', () => {
      const criteria: FilterCriteria = {
        updatedBefore: new Date('2024-01-10T00:00:00Z')
      };
      const result = filterEngine.filter(testTodos, criteria);
      
      expect(result).toHaveLength(3);
      expect(result.map(todo => todo.id)).toEqual(expect.arrayContaining(['1', '2', '5']));
    });

    it('should filter todos within a date range (created)', () => {
      const criteria: FilterCriteria = {
        createdAfter: new Date('2024-01-01T00:00:00Z'),
        createdBefore: new Date('2024-01-15T23:59:59Z')
      };
      const result = filterEngine.filter(testTodos, criteria);
      
      expect(result).toHaveLength(4);
      expect(result.map(todo => todo.id)).toEqual(expect.arrayContaining(['1', '2', '3', '4']));
    });

    it('should apply multiple filters with AND logic', () => {
      const criteria: FilterCriteria = {
        status: 'completed',
        createdAfter: new Date('2024-01-01T00:00:00Z')
      };
      const result = filterEngine.filter(testTodos, criteria);
      
      expect(result).toHaveLength(2);
      expect(result.every(todo => todo.completed)).toBe(true);
      expect(result.map(todo => todo.id)).toEqual(expect.arrayContaining(['1', '3']));
    });

    it('should handle edge case where date range excludes all todos', () => {
      const criteria: FilterCriteria = {
        createdAfter: new Date('2025-01-01T00:00:00Z')
      };
      const result = filterEngine.filter(testTodos, criteria);
      
      expect(result).toHaveLength(0);
    });

    it('should handle empty todo array', () => {
      const criteria: FilterCriteria = {
        status: 'completed'
      };
      const result = filterEngine.filter([], criteria);
      
      expect(result).toHaveLength(0);
    });

    it('should handle todos with same created and updated dates', () => {
      const singleDateTodo: Todo = {
        id: '7',
        title: 'Same date todo',
        completed: false,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      };
      
      const criteria: FilterCriteria = {
        createdAfter: new Date('2024-01-01T09:00:00Z'),
        updatedBefore: new Date('2024-01-01T11:00:00Z')
      };
      
      const result = filterEngine.filter([singleDateTodo], criteria);
      expect(result).toHaveLength(1);
    });

    it('should maintain original order of todos in results', () => {
      const criteria: FilterCriteria = {
        status: 'completed'
      };
      const result = filterEngine.filter(testTodos, criteria);
      
      // Should maintain original order: id 1, 3, 5
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('3');
      expect(result[2].id).toBe('5');
    });
  });

  describe('validateCriteria', () => {
    it('should validate empty criteria as valid', () => {
      const criteria: FilterCriteria = {};
      const result = filterEngine.validateCriteria(criteria);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should validate valid status criteria', () => {
      const criteria: FilterCriteria = {
        status: 'completed'
      };
      const result = filterEngine.validateCriteria(criteria);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should validate valid date criteria', () => {
      const criteria: FilterCriteria = {
        createdAfter: new Date('2024-01-01T00:00:00Z'),
        createdBefore: new Date('2024-12-31T23:59:59Z')
      };
      const result = filterEngine.validateCriteria(criteria);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should invalidate criteria where createdAfter is after createdBefore', () => {
      const criteria: FilterCriteria = {
        createdAfter: new Date('2024-12-31T00:00:00Z'),
        createdBefore: new Date('2024-01-01T00:00:00Z')
      };
      const result = filterEngine.validateCriteria(criteria);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('createdAfter must be before createdBefore');
    });

    it('should invalidate criteria where updatedAfter is after updatedBefore', () => {
      const criteria: FilterCriteria = {
        updatedAfter: new Date('2024-12-31T00:00:00Z'),
        updatedBefore: new Date('2024-01-01T00:00:00Z')
      };
      const result = filterEngine.validateCriteria(criteria);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('updatedAfter must be before updatedBefore');
    });

    it('should allow same dates for before/after criteria', () => {
      const sameDate = new Date('2024-01-01T00:00:00Z');
      const criteria: FilterCriteria = {
        createdAfter: sameDate,
        createdBefore: sameDate
      };
      const result = filterEngine.validateCriteria(criteria);
      
      expect(result.isValid).toBe(true);
    });

    it('should validate multiple criteria and collect all errors', () => {
      const criteria: FilterCriteria = {
        createdAfter: new Date('2024-12-31T00:00:00Z'),
        createdBefore: new Date('2024-01-01T00:00:00Z'),
        updatedAfter: new Date('2024-12-31T00:00:00Z'),
        updatedBefore: new Date('2024-01-01T00:00:00Z')
      };
      const result = filterEngine.validateCriteria(criteria);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain('createdAfter must be before createdBefore');
      expect(result.errors).toContain('updatedAfter must be before updatedBefore');
    });
  });

  describe('performance', () => {
    it('should handle large dataset efficiently', () => {
      // Create a larger dataset
      const largeTodos: Todo[] = [];
      for (let i = 0; i < 1000; i++) {
        largeTodos.push({
          id: `todo-${i}`,
          title: `Task ${i}`,
          description: `Description ${i}`,
          completed: i % 2 === 0,
          createdAt: new Date(2024, 0, 1 + (i % 30)), // Spread across January
          updatedAt: new Date(2024, 0, 1 + (i % 30) + 1), // Updated next day
        });
      }

      const criteria: FilterCriteria = {
        status: 'completed',
        createdAfter: new Date('2024-01-15T00:00:00Z')
      };

      const startTime = performance.now();
      const result = filterEngine.filter(largeTodos, criteria);
      const endTime = performance.now();

      expect(result.length).toBeGreaterThan(0);
      expect(result.every(todo => todo.completed)).toBe(true);
      expect(endTime - startTime).toBeLessThan(50); // Should complete in under 50ms
    });
  });
});