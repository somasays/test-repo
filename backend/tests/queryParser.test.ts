import { describe, it, expect, beforeEach } from 'vitest';
import { QueryParser } from '../src/services/search/queryParser.js';
import { ParsedQuery, ValidationResult } from '../src/types/search.js';

describe('QueryParser', () => {
  let queryParser: QueryParser;

  beforeEach(() => {
    queryParser = new QueryParser();
  });

  describe('parse', () => {
    it('should parse empty query parameters', () => {
      const queryParams = {};
      const result = queryParser.parse(queryParams);

      expect(result.searchQuery).toBeUndefined();
      expect(result.filters).toEqual({});
      expect(result.pagination).toEqual({});
    });

    it('should parse search query parameter', () => {
      const queryParams = {
        q: 'meeting project'
      };
      const result = queryParser.parse(queryParams);

      expect(result.searchQuery).toBe('meeting project');
      expect(result.filters).toEqual({});
    });

    it('should parse status filter parameter', () => {
      const queryParams = {
        status: 'completed'
      };
      const result = queryParser.parse(queryParams);

      expect(result.searchQuery).toBeUndefined();
      expect(result.filters.status).toBe('completed');
    });

    it('should parse created date filter parameters', () => {
      const queryParams = {
        created_after: '2024-01-01T00:00:00.000Z',
        created_before: '2024-12-31T23:59:59.999Z'
      };
      const result = queryParser.parse(queryParams);

      expect(result.filters.createdAfter).toEqual(new Date('2024-01-01T00:00:00.000Z'));
      expect(result.filters.createdBefore).toEqual(new Date('2024-12-31T23:59:59.999Z'));
    });

    it('should parse updated date filter parameters', () => {
      const queryParams = {
        updated_after: '2024-01-01T00:00:00.000Z',
        updated_before: '2024-12-31T23:59:59.999Z'
      };
      const result = queryParser.parse(queryParams);

      expect(result.filters.updatedAfter).toEqual(new Date('2024-01-01T00:00:00.000Z'));
      expect(result.filters.updatedBefore).toEqual(new Date('2024-12-31T23:59:59.999Z'));
    });

    it('should parse pagination parameters', () => {
      const queryParams = {
        page: '2',
        limit: '5'
      };
      const result = queryParser.parse(queryParams);

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
    });

    it('should parse all parameters together', () => {
      const queryParams = {
        q: 'urgent task',
        status: 'pending',
        created_after: '2024-01-01T00:00:00.000Z',
        created_before: '2024-12-31T23:59:59.999Z',
        updated_after: '2024-06-01T00:00:00.000Z',
        updated_before: '2024-06-30T23:59:59.999Z',
        page: '3',
        limit: '15'
      };
      const result = queryParser.parse(queryParams);

      expect(result.searchQuery).toBe('urgent task');
      expect(result.filters).toEqual({
        status: 'pending',
        createdAfter: new Date('2024-01-01T00:00:00.000Z'),
        createdBefore: new Date('2024-12-31T23:59:59.999Z'),
        updatedAfter: new Date('2024-06-01T00:00:00.000Z'),
        updatedBefore: new Date('2024-06-30T23:59:59.999Z')
      });
      expect(result.pagination).toEqual({
        page: 3,
        limit: 15
      });
    });

    it('should handle string pagination values', () => {
      const queryParams = {
        page: 'invalid',
        limit: 'also-invalid'
      };
      const result = queryParser.parse(queryParams);

      expect(result.pagination.page).toBeUndefined();
      expect(result.pagination.limit).toBeUndefined();
    });

    it('should handle invalid date strings', () => {
      const queryParams = {
        created_after: 'invalid-date',
        updated_before: 'also-invalid'
      };
      const result = queryParser.parse(queryParams);

      expect(result.filters.createdAfter).toBeUndefined();
      expect(result.filters.updatedBefore).toBeUndefined();
    });

    it('should trim search query strings', () => {
      const queryParams = {
        q: '  meeting project  '
      };
      const result = queryParser.parse(queryParams);

      expect(result.searchQuery).toBe('meeting project');
    });

    it('should handle empty search query string', () => {
      const queryParams = {
        q: '   '
      };
      const result = queryParser.parse(queryParams);

      expect(result.searchQuery).toBeUndefined();
    });

    it('should handle status parameter with all values', () => {
      const testCases = [
        { status: 'completed', expected: 'completed' },
        { status: 'pending', expected: 'pending' },
        { status: 'all', expected: 'all' },
        { status: 'invalid', expected: undefined }
      ];

      testCases.forEach(testCase => {
        const result = queryParser.parse({ status: testCase.status });
        expect(result.filters.status).toBe(testCase.expected);
      });
    });

    it('should handle numeric pagination values', () => {
      const queryParams = {
        page: 1,
        limit: 10
      };
      const result = queryParser.parse(queryParams);

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should ignore unknown query parameters', () => {
      const queryParams = {
        q: 'search',
        unknown_param: 'should be ignored',
        another_unknown: 123
      };
      const result = queryParser.parse(queryParams);

      expect(result.searchQuery).toBe('search');
      expect(result.filters).toEqual({});
      expect(result.pagination).toEqual({});
    });
  });

  describe('validate', () => {
    it('should validate empty query parameters', () => {
      const queryParams = {};
      const result = queryParser.validate(queryParams);

      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should validate valid search query', () => {
      const queryParams = {
        q: 'meeting project'
      };
      const result = queryParser.validate(queryParams);

      expect(result.isValid).toBe(true);
    });

    it('should invalidate search query that is too long', () => {
      const longQuery = 'a'.repeat(101); // 101 characters
      const queryParams = {
        q: longQuery
      };
      const result = queryParser.validate(queryParams);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Search query must be 100 characters or less');
    });

    it('should validate valid status values', () => {
      const validStatuses = ['completed', 'pending', 'all'];
      
      validStatuses.forEach(status => {
        const result = queryParser.validate({ status });
        expect(result.isValid).toBe(true);
      });
    });

    it('should invalidate invalid status values', () => {
      const queryParams = {
        status: 'invalid_status'
      };
      const result = queryParser.validate(queryParams);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Status must be one of: completed, pending, all');
    });

    it('should validate valid date formats', () => {
      const queryParams = {
        created_after: '2024-01-01T00:00:00.000Z',
        created_before: '2024-12-31T23:59:59.999Z',
        updated_after: '2024-06-01T10:30:00.000Z',
        updated_before: '2024-06-30T14:45:00.000Z'
      };
      const result = queryParser.validate(queryParams);

      expect(result.isValid).toBe(true);
    });

    it('should invalidate invalid date formats', () => {
      const queryParams = {
        created_after: 'invalid-date',
        updated_before: '2024-13-45' // Invalid date
      };
      const result = queryParser.validate(queryParams);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('created_after must be a valid ISO 8601 date');
      expect(result.errors).toContain('updated_before must be a valid ISO 8601 date');
    });

    it('should validate date range logic', () => {
      const queryParams = {
        created_after: '2024-12-31T00:00:00.000Z',
        created_before: '2024-01-01T00:00:00.000Z' // After is after before
      };
      const result = queryParser.validate(queryParams);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('created_after must be before created_before');
    });

    it('should validate pagination values', () => {
      const queryParams = {
        page: '0', // Invalid - must be >= 1
        limit: '101' // Invalid - must be <= 100
      };
      const result = queryParser.validate(queryParams);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Page must be a positive integer');
      expect(result.errors).toContain('Limit must be between 1 and 100');
    });

    it('should collect multiple validation errors', () => {
      const queryParams = {
        q: 'a'.repeat(101),
        status: 'invalid',
        created_after: 'invalid-date',
        page: '-1',
        limit: '200'
      };
      const result = queryParser.validate(queryParams);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(5);
    });

    it('should handle special characters in search query safely', () => {
      const queryParams = {
        q: 'search with <script>alert("xss")</script>'
      };
      const result = queryParser.validate(queryParams);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Search query contains invalid characters');
    });

    it('should allow valid special characters in search query', () => {
      const queryParams = {
        q: 'meeting #123 @john task-name task_name item.txt'
      };
      const result = queryParser.validate(queryParams);

      expect(result.isValid).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle null and undefined values', () => {
      const queryParams = {
        q: null,
        status: undefined,
        page: null
      };
      const result = queryParser.parse(queryParams);

      expect(result.searchQuery).toBeUndefined();
      expect(result.filters.status).toBeUndefined();
      expect(result.pagination.page).toBeUndefined();
    });

    it('should handle array values (first element)', () => {
      const queryParams = {
        q: ['first query', 'second query'],
        status: ['completed', 'pending']
      };
      const result = queryParser.parse(queryParams);

      expect(result.searchQuery).toBe('first query');
      expect(result.filters.status).toBe('completed');
    });

    it('should handle boolean values for status', () => {
      const queryParams = {
        status: true // Should be ignored
      };
      const result = queryParser.parse(queryParams);

      expect(result.filters.status).toBeUndefined();
    });
  });
});