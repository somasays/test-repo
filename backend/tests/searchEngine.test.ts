import { describe, it, expect, beforeEach } from 'vitest';
import { SearchEngine } from '../src/services/search/searchEngine.js';
import { Todo } from '../src/types/todo.js';
import { SearchOptions } from '../src/types/search.js';

describe('SearchEngine', () => {
  let searchEngine: SearchEngine;
  let testTodos: Todo[];

  beforeEach(() => {
    searchEngine = new SearchEngine();
    
    // Create test data
    testTodos = [
      {
        id: '1',
        title: 'Meeting with team',
        description: 'Discuss project roadmap',
        completed: false,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      },
      {
        id: '2',
        title: 'Review code changes',
        description: 'Check pull requests for API improvements',
        completed: true,
        createdAt: new Date('2024-01-02T10:00:00Z'),
        updatedAt: new Date('2024-01-02T10:00:00Z'),
      },
      {
        id: '3',
        title: 'Update documentation',
        description: 'Add API examples and troubleshooting guide',
        completed: false,
        createdAt: new Date('2024-01-03T10:00:00Z'),
        updatedAt: new Date('2024-01-03T10:00:00Z'),
      },
      {
        id: '4',
        title: 'Team Meeting',
        description: 'Weekly standup with development team',
        completed: false,
        createdAt: new Date('2024-01-04T10:00:00Z'),
        updatedAt: new Date('2024-01-04T10:00:00Z'),
      },
      {
        id: '5',
        title: 'Code Review Session',
        description: 'Review new features before deployment with team',
        completed: true,
        createdAt: new Date('2024-01-05T10:00:00Z'),
        updatedAt: new Date('2024-01-05T10:00:00Z'),
      },
      {
        id: '6',
        title: 'Empty description todo',
        completed: false,
        createdAt: new Date('2024-01-06T10:00:00Z'),
        updatedAt: new Date('2024-01-06T10:00:00Z'),
      }
    ];
  });

  describe('search', () => {
    it('should find todos matching single word query in title', () => {
      const options: SearchOptions = {
        fields: ['title']
      };
      const result = searchEngine.search(testTodos, 'meeting', options);
      
      expect(result).toHaveLength(2);
      expect(result.map(todo => todo.id)).toEqual(expect.arrayContaining(['1', '4']));
    });

    it('should find todos matching single word query in description', () => {
      const options: SearchOptions = {
        fields: ['description']
      };
      const result = searchEngine.search(testTodos, 'API', options);
      
      expect(result).toHaveLength(2);
      expect(result.map(todo => todo.id)).toEqual(expect.arrayContaining(['2', '3']));
    });

    it('should find todos matching query across title and description fields', () => {
      const options: SearchOptions = {
        fields: ['title', 'description']
      };
      const result = searchEngine.search(testTodos, 'team', options);
      
      expect(result).toHaveLength(3);
      expect(result.map(todo => todo.id)).toEqual(expect.arrayContaining(['1', '4', '5']));
    });

    it('should perform case-insensitive search by default', () => {
      const options: SearchOptions = {
        fields: ['title', 'description']
      };
      const result = searchEngine.search(testTodos, 'MEETING', options);
      
      expect(result).toHaveLength(2);
      expect(result.map(todo => todo.id)).toEqual(expect.arrayContaining(['1', '4']));
    });

    it('should perform case-sensitive search when specified', () => {
      const options: SearchOptions = {
        fields: ['title', 'description'],
        caseSensitive: true
      };
      const result = searchEngine.search(testTodos, 'MEETING', options);
      
      expect(result).toHaveLength(0);
    });

    it('should find todos matching multi-word query with AND logic', () => {
      const options: SearchOptions = {
        fields: ['title', 'description']
      };
      const result = searchEngine.search(testTodos, 'team meeting', options);
      
      expect(result).toHaveLength(2);
      expect(result.map(todo => todo.id)).toEqual(expect.arrayContaining(['1', '4']));
    });

    it('should handle queries with extra whitespace', () => {
      const options: SearchOptions = {
        fields: ['title', 'description']
      };
      const result = searchEngine.search(testTodos, '  team   meeting  ', options);
      
      expect(result).toHaveLength(2);
      expect(result.map(todo => todo.id)).toEqual(expect.arrayContaining(['1', '4']));
    });

    it('should return empty array for no matches', () => {
      const options: SearchOptions = {
        fields: ['title', 'description']
      };
      const result = searchEngine.search(testTodos, 'nonexistent', options);
      
      expect(result).toHaveLength(0);
    });

    it('should handle empty query gracefully', () => {
      const options: SearchOptions = {
        fields: ['title', 'description']
      };
      const result = searchEngine.search(testTodos, '', options);
      
      expect(result).toEqual(testTodos);
    });

    it('should handle todos with undefined description fields', () => {
      const options: SearchOptions = {
        fields: ['title', 'description']
      };
      const result = searchEngine.search(testTodos, 'empty', options);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('6');
    });

    it('should handle empty todo array', () => {
      const options: SearchOptions = {
        fields: ['title', 'description']
      };
      const result = searchEngine.search([], 'anything', options);
      
      expect(result).toHaveLength(0);
    });

    it('should support partial matching within words', () => {
      const options: SearchOptions = {
        fields: ['title', 'description']
      };
      const result = searchEngine.search(testTodos, 'docu', options);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });

    it('should return results in original order when no sorting specified', () => {
      const options: SearchOptions = {
        fields: ['title', 'description']
      };
      const result = searchEngine.search(testTodos, 'review', options);
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('2'); // Should maintain original order
      expect(result[1].id).toBe('5');
    });

    it('should handle special characters in search query', () => {
      // Add a todo with special characters for this test
      const todosWithSpecial = [...testTodos, {
        id: '7',
        title: 'Fix bug #123',
        description: 'Handle edge case with @mentions',
        completed: false,
        createdAt: new Date('2024-01-07T10:00:00Z'),
        updatedAt: new Date('2024-01-07T10:00:00Z'),
      }];

      const options: SearchOptions = {
        fields: ['title', 'description']
      };
      const result = searchEngine.search(todosWithSpecial, '#123', options);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('7');
    });

    it('should require all words to match in multi-word search (AND logic)', () => {
      const options: SearchOptions = {
        fields: ['title', 'description']
      };
      const result = searchEngine.search(testTodos, 'meeting project nonexistent', options);
      
      expect(result).toHaveLength(0);
    });
  });

  describe('performance', () => {
    it('should handle large dataset efficiently', () => {
      // Create a larger dataset
      const largeTodos: Todo[] = [];
      for (let i = 0; i < 1000; i++) {
        largeTodos.push({
          id: `todo-${i}`,
          title: `Task ${i} for project alpha`,
          description: `Description for task ${i} with some keywords`,
          completed: i % 2 === 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      const options: SearchOptions = {
        fields: ['title', 'description']
      };

      const startTime = performance.now();
      const result = searchEngine.search(largeTodos, 'project', options);
      const endTime = performance.now();

      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });
  });
});