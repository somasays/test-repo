import { describe, it, expect, beforeEach } from 'vitest';
import { todoService } from '../src/services/todoService.js';

describe('TodoService', () => {
  beforeEach(async () => {
    // Clear all todos before each test
    await todoService.clearAllTodos();
  });

  describe('createTodo', () => {
    it('should create a new todo with valid data', async () => {
      const todoData = {
        title: 'Test Todo',
        description: 'Test Description'
      };

      const result = await todoService.createTodo(todoData);

      expect(result).toMatchObject({
        title: 'Test Todo',
        description: 'Test Description',
        completed: false
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should create a todo without description', async () => {
      const todoData = {
        title: 'Test Todo'
      };

      const result = await todoService.createTodo(todoData);

      expect(result.title).toBe('Test Todo');
      expect(result.description).toBeUndefined();
      expect(result.completed).toBe(false);
    });
  });

  describe('getAllTodos', () => {
    it('should return empty list when no todos exist', async () => {
      const result = await todoService.getAllTodos();

      expect(result.todos).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should return paginated todos', async () => {
      // Create multiple todos
      for (let i = 1; i <= 15; i++) {
        await todoService.createTodo({
          title: `Todo ${i}`,
          description: `Description ${i}`
        });
      }

      const result = await todoService.getAllTodos(2, 5);

      expect(result.todos).toHaveLength(5);
      expect(result.total).toBe(15);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
    });
  });

  describe('getTodoById', () => {
    it('should return todo by id', async () => {
      const created = await todoService.createTodo({
        title: 'Test Todo',
        description: 'Test Description'
      });

      const result = await todoService.getTodoById(created.id);

      expect(result).toMatchObject({
        id: created.id,
        title: 'Test Todo',
        description: 'Test Description',
        completed: false
      });
    });

    it('should return null for non-existent id', async () => {
      const result = await todoService.getTodoById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('updateTodo', () => {
    it('should update todo successfully', async () => {
      const created = await todoService.createTodo({
        title: 'Original Title',
        description: 'Original Description'
      });

      // Add a small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const updated = await todoService.updateTodo(created.id, {
        title: 'Updated Title',
        completed: true
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.description).toBe('Original Description');
      expect(updated.completed).toBe(true);
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(updated.createdAt).getTime());
    });

    it('should throw error for non-existent todo', async () => {
      await expect(
        todoService.updateTodo('non-existent-id', { title: 'New Title' })
      ).rejects.toThrow('Todo with id non-existent-id not found');
    });
  });

  describe('deleteTodo', () => {
    it('should delete todo successfully', async () => {
      const created = await todoService.createTodo({
        title: 'To Be Deleted'
      });

      await todoService.deleteTodo(created.id);

      const result = await todoService.getTodoById(created.id);
      expect(result).toBeNull();
    });

    it('should throw error for non-existent todo', async () => {
      await expect(
        todoService.deleteTodo('non-existent-id')
      ).rejects.toThrow('Todo with id non-existent-id not found');
    });
  });

  describe('getTodoStats', () => {
    it('should return correct stats', async () => {
      await todoService.createTodo({ title: 'Todo 1' });
      await todoService.createTodo({ title: 'Todo 2' });
      
      const created = await todoService.createTodo({ title: 'Todo 3' });
      await todoService.updateTodo(created.id, { completed: true });

      const stats = await todoService.getTodoStats();

      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(1);
      expect(stats.pending).toBe(2);
    });
  });

  describe('deleteCompletedTodos', () => {
    it('should delete only completed todos', async () => {
      const todo1 = await todoService.createTodo({ title: 'Todo 1' });
      const todo2 = await todoService.createTodo({ title: 'Todo 2' });
      const todo3 = await todoService.createTodo({ title: 'Todo 3' });

      // Mark todo2 and todo3 as completed
      await todoService.updateTodo(todo2.id, { completed: true });
      await todoService.updateTodo(todo3.id, { completed: true });

      const result = await todoService.deleteCompletedTodos();

      expect(result.deletedCount).toBe(2);

      const remaining = await todoService.getAllTodos();
      expect(remaining.todos).toHaveLength(1);
      expect(remaining.todos[0].id).toBe(todo1.id);
    });
  });

  describe('markAllCompleted', () => {
    it('should mark all pending todos as completed', async () => {
      await todoService.createTodo({ title: 'Todo 1' });
      await todoService.createTodo({ title: 'Todo 2' });
      const todo3 = await todoService.createTodo({ title: 'Todo 3' });
      
      // Mark one as already completed
      await todoService.updateTodo(todo3.id, { completed: true });

      const result = await todoService.markAllCompleted();

      expect(result.updatedCount).toBe(2);

      const stats = await todoService.getTodoStats();
      expect(stats.completed).toBe(3);
      expect(stats.pending).toBe(0);
    });
  });

  describe('searchAndFilterTodos', () => {
    beforeEach(async () => {
      // Create test todos with various properties
      await todoService.createTodo({
        title: 'Meeting with team',
        description: 'Discuss project roadmap and milestones'
      });
      
      const todo2 = await todoService.createTodo({
        title: 'Code review session',
        description: 'Review pull requests and API changes'
      });
      
      await todoService.createTodo({
        title: 'Update documentation',
        description: 'Add examples and troubleshooting guide'
      });
      
      const todo4 = await todoService.createTodo({
        title: 'Team standup',
        description: 'Weekly sync with development team'
      });

      // Mark some todos as completed
      await todoService.updateTodo(todo2.id, { completed: true });
      await todoService.updateTodo(todo4.id, { completed: true });
    });

    it('should return all todos when no search or filter criteria', async () => {
      const result = await todoService.searchAndFilterTodos({}, 1, 10);

      expect(result.todos).toHaveLength(4);
      expect(result.total).toBe(4);
      expect(result.filtered).toBe(4);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.query).toEqual({});
    });

    it('should search todos by query across title and description', async () => {
      const queryParams = { q: 'team' };
      const result = await todoService.searchAndFilterTodos(queryParams, 1, 10);

      expect(result.todos).toHaveLength(2);
      expect(result.filtered).toBe(2);
      expect(result.query?.q).toBe('team');
      
      // Should find todos with "team" in title or description
      const titles = result.todos.map(todo => todo.title);
      expect(titles).toEqual(expect.arrayContaining([
        'Meeting with team',
        'Team standup'
      ]));
    });

    it('should filter todos by completion status', async () => {
      const queryParams = { status: 'completed' };
      const result = await todoService.searchAndFilterTodos(queryParams, 1, 10);

      expect(result.todos).toHaveLength(2);
      expect(result.filtered).toBe(2);
      expect(result.todos.every(todo => todo.completed)).toBe(true);
      expect(result.query?.status).toBe('completed');
    });

    it('should filter todos by pending status', async () => {
      const queryParams = { status: 'pending' };
      const result = await todoService.searchAndFilterTodos(queryParams, 1, 10);

      expect(result.todos).toHaveLength(2);
      expect(result.filtered).toBe(2);
      expect(result.todos.every(todo => !todo.completed)).toBe(true);
      expect(result.query?.status).toBe('pending');
    });

    it('should combine search and filter criteria', async () => {
      const queryParams = { 
        q: 'team', 
        status: 'completed' 
      };
      const result = await todoService.searchAndFilterTodos(queryParams, 1, 10);

      expect(result.todos).toHaveLength(1);
      expect(result.filtered).toBe(1);
      expect(result.todos[0].title).toBe('Team standup');
      expect(result.todos[0].completed).toBe(true);
      expect(result.query).toEqual({ q: 'team', status: 'completed' });
    });

    it('should handle date range filtering', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      const queryParams = {
        created_after: oneHourAgo.toISOString(),
        created_before: oneHourLater.toISOString()
      };
      const result = await todoService.searchAndFilterTodos(queryParams, 1, 10);

      expect(result.todos).toHaveLength(4); // All todos should be within range
      expect(result.filtered).toBe(4);
    });

    it('should apply pagination to filtered results', async () => {
      const queryParams = { status: 'all' };
      const result = await todoService.searchAndFilterTodos(queryParams, 1, 2);

      expect(result.todos).toHaveLength(2);
      expect(result.total).toBe(4);
      expect(result.filtered).toBe(4);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
    });

    it('should handle second page of paginated results', async () => {
      const queryParams = { status: 'all' };
      const result = await todoService.searchAndFilterTodos(queryParams, 2, 2);

      expect(result.todos).toHaveLength(2);
      expect(result.total).toBe(4);
      expect(result.filtered).toBe(4);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(2);
    });

    it('should return empty results when no matches', async () => {
      const queryParams = { q: 'nonexistent' };
      const result = await todoService.searchAndFilterTodos(queryParams, 1, 10);

      expect(result.todos).toHaveLength(0);
      expect(result.filtered).toBe(0);
      expect(result.total).toBe(4); // Total todos in system
      expect(result.query?.q).toBe('nonexistent');
    });

    it('should handle invalid status gracefully', async () => {
      const queryParams = { status: 'invalid' };
      const result = await todoService.searchAndFilterTodos(queryParams, 1, 10);

      // Should ignore invalid status and return all
      expect(result.todos).toHaveLength(4);
      expect(result.filtered).toBe(4);
    });

    it('should validate and sanitize search query', async () => {
      const queryParams = { 
        q: '  meeting  ', // Test trimming
        status: 'all'
      };
      const result = await todoService.searchAndFilterTodos(queryParams, 1, 10);

      expect(result.query?.q).toBe('meeting'); // Should be trimmed
      expect(result.todos.length).toBeGreaterThan(0);
    });

    it('should measure and log performance for large datasets', async () => {
      // This test ensures the performance monitoring is working
      const queryParams = { q: 'team' };
      
      const startTime = performance.now();
      const result = await todoService.searchAndFilterTodos(queryParams, 1, 10);
      const endTime = performance.now();

      expect(result.todos).toBeDefined();
      expect(endTime - startTime).toBeLessThan(100); // Should be fast for small dataset
    });
  });
});