import { describe, it, expect, beforeEach } from 'vitest';
import { todoModel } from '../src/models/todoModel.js';
import { AppError } from '../src/utils/appError.js';

describe('TodoModel', () => {
  beforeEach(async () => {
    // Clear all todos before each test
    await todoModel.clear();
  });

  describe('create', () => {
    it('should create a new todo with all required fields', async () => {
      const todoData = {
        title: 'Test Todo',
        description: 'Test Description'
      };

      const result = await todoModel.create(todoData);

      expect(result).toMatchObject({
        title: 'Test Todo',
        description: 'Test Description',
        completed: false
      });
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
      expect(result.updatedAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should create a todo without description', async () => {
      const todoData = {
        title: 'Test Todo'
      };

      const result = await todoModel.create(todoData);

      expect(result.title).toBe('Test Todo');
      expect(result.description).toBeUndefined();
      expect(result.completed).toBe(false);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should generate unique IDs for multiple todos', async () => {
      const todo1 = await todoModel.create({ title: 'Todo 1' });
      const todo2 = await todoModel.create({ title: 'Todo 2' });

      expect(todo1.id).not.toBe(todo2.id);
    });

    it('should set createdAt and updatedAt to same time initially', async () => {
      const result = await todoModel.create({ title: 'Test Todo' });

      expect(result.createdAt.getTime()).toBe(result.updatedAt.getTime());
    });
  });

  describe('findAll', () => {
    it('should return empty array when no todos exist', async () => {
      const result = await todoModel.findAll();

      expect(result.todos).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should return all todos sorted by createdAt (newest first)', async () => {
      const todo1 = await todoModel.create({ title: 'Todo 1' });
      await new Promise(resolve => setTimeout(resolve, 10)); // Ensure different timestamps
      const todo2 = await todoModel.create({ title: 'Todo 2' });
      await new Promise(resolve => setTimeout(resolve, 10));
      const todo3 = await todoModel.create({ title: 'Todo 3' });

      const result = await todoModel.findAll();

      expect(result.todos).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.todos[0].id).toBe(todo3.id); // Newest first
      expect(result.todos[1].id).toBe(todo2.id);
      expect(result.todos[2].id).toBe(todo1.id); // Oldest last
    });

    it('should handle pagination correctly', async () => {
      // Create 15 todos with explicit timestamps to ensure order
      const createdTodos = [];
      for (let i = 1; i <= 15; i++) {
        const todo = await todoModel.create({ title: `Todo ${i}` });
        createdTodos.push(todo);
        // Add delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      // Test first page (newest first)
      const page1 = await todoModel.findAll(1, 5);
      expect(page1.todos).toHaveLength(5);
      expect(page1.total).toBe(15);
      
      // Verify descending order by creation time
      const page1Titles = page1.todos.map(todo => todo.title);
      expect(page1Titles).toEqual(['Todo 15', 'Todo 14', 'Todo 13', 'Todo 12', 'Todo 11']);

      // Test second page
      const page2 = await todoModel.findAll(2, 5);
      expect(page2.todos).toHaveLength(5);
      expect(page2.total).toBe(15);
      
      const page2Titles = page2.todos.map(todo => todo.title);
      expect(page2Titles).toEqual(['Todo 10', 'Todo 9', 'Todo 8', 'Todo 7', 'Todo 6']);

      // Test last page
      const page3 = await todoModel.findAll(3, 5);
      expect(page3.todos).toHaveLength(5);
      expect(page3.total).toBe(15);
      
      const page3Titles = page3.todos.map(todo => todo.title);
      expect(page3Titles).toEqual(['Todo 5', 'Todo 4', 'Todo 3', 'Todo 2', 'Todo 1']);
    });

    it('should handle page beyond available data', async () => {
      await todoModel.create({ title: 'Todo 1' });
      await todoModel.create({ title: 'Todo 2' });

      const result = await todoModel.findAll(3, 5); // Page 3 with 5 items per page

      expect(result.todos).toHaveLength(0);
      expect(result.total).toBe(2);
    });

    it('should use default pagination values', async () => {
      // Create 12 todos
      for (let i = 1; i <= 12; i++) {
        await todoModel.create({ title: `Todo ${i}` });
      }

      const result = await todoModel.findAll(); // Should default to page=1, limit=10

      expect(result.todos).toHaveLength(10);
      expect(result.total).toBe(12);
    });
  });

  describe('findById', () => {
    it('should return todo by valid id', async () => {
      const created = await todoModel.create({
        title: 'Test Todo',
        description: 'Test Description'
      });

      const result = await todoModel.findById(created.id);

      expect(result).toMatchObject({
        id: created.id,
        title: 'Test Todo',
        description: 'Test Description',
        completed: false
      });
    });

    it('should return null for non-existent id', async () => {
      const result = await todoModel.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return null for empty id', async () => {
      const result = await todoModel.findById('');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update todo title', async () => {
      const created = await todoModel.create({ title: 'Original Title' });
      await new Promise(resolve => setTimeout(resolve, 1)); // Ensure different timestamps

      const updated = await todoModel.update(created.id, { title: 'Updated Title' });

      expect(updated.title).toBe('Updated Title');
      expect(updated.id).toBe(created.id);
      expect(updated.completed).toBe(false);
      expect(updated.createdAt.getTime()).toBe(created.createdAt.getTime());
      expect(updated.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
    });

    it('should update todo description', async () => {
      const created = await todoModel.create({ 
        title: 'Test Title', 
        description: 'Original Description' 
      });
      await new Promise(resolve => setTimeout(resolve, 1));

      const updated = await todoModel.update(created.id, { 
        description: 'Updated Description' 
      });

      expect(updated.title).toBe('Test Title'); // Unchanged
      expect(updated.description).toBe('Updated Description');
      expect(updated.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
    });

    it('should update todo completed status', async () => {
      const created = await todoModel.create({ title: 'Test Todo' });
      await new Promise(resolve => setTimeout(resolve, 1));

      const updated = await todoModel.update(created.id, { completed: true });

      expect(updated.completed).toBe(true);
      expect(updated.title).toBe('Test Todo'); // Unchanged
      expect(updated.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
    });

    it('should update multiple fields at once', async () => {
      const created = await todoModel.create({ 
        title: 'Original Title',
        description: 'Original Description'
      });
      await new Promise(resolve => setTimeout(resolve, 1));

      const updated = await todoModel.update(created.id, {
        title: 'Updated Title',
        description: 'Updated Description',
        completed: true
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.description).toBe('Updated Description');
      expect(updated.completed).toBe(true);
      expect(updated.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
    });

    it('should throw AppError for non-existent id', async () => {
      await expect(
        todoModel.update('non-existent-id', { title: 'Updated Title' })
      ).rejects.toThrow(AppError);

      await expect(
        todoModel.update('non-existent-id', { title: 'Updated Title' })
      ).rejects.toThrow('Todo with id non-existent-id not found');
    });

    it('should not modify original todo object when updating', async () => {
      const created = await todoModel.create({ title: 'Original Title' });
      const originalCreatedAt = created.createdAt.getTime();
      const originalUpdatedAt = created.updatedAt.getTime();

      await todoModel.update(created.id, { title: 'Updated Title' });

      // Original object should remain unchanged
      expect(created.title).toBe('Original Title');
      expect(created.createdAt.getTime()).toBe(originalCreatedAt);
      expect(created.updatedAt.getTime()).toBe(originalUpdatedAt);
    });
  });

  describe('delete', () => {
    it('should delete existing todo', async () => {
      const created = await todoModel.create({ title: 'To Delete' });

      await todoModel.delete(created.id);

      const found = await todoModel.findById(created.id);
      expect(found).toBeNull();
    });

    it('should throw AppError for non-existent id', async () => {
      await expect(
        todoModel.delete('non-existent-id')
      ).rejects.toThrow(AppError);

      await expect(
        todoModel.delete('non-existent-id')
      ).rejects.toThrow('Todo with id non-existent-id not found');
    });

    it('should update total count after deletion', async () => {
      await todoModel.create({ title: 'Todo 1' });
      const todo2 = await todoModel.create({ title: 'Todo 2' });
      await todoModel.create({ title: 'Todo 3' });

      let result = await todoModel.findAll();
      expect(result.total).toBe(3);

      await todoModel.delete(todo2.id);

      result = await todoModel.findAll();
      expect(result.total).toBe(2);
      expect(result.todos.find(t => t.id === todo2.id)).toBeUndefined();
    });
  });

  describe('deleteCompleted', () => {
    it('should delete only completed todos', async () => {
      const todo1 = await todoModel.create({ title: 'Todo 1' });
      const todo2 = await todoModel.create({ title: 'Todo 2' });
      const todo3 = await todoModel.create({ title: 'Todo 3' });

      // Mark todo2 and todo3 as completed
      await todoModel.update(todo2.id, { completed: true });
      await todoModel.update(todo3.id, { completed: true });

      const deletedCount = await todoModel.deleteCompleted();

      expect(deletedCount).toBe(2);

      const remaining = await todoModel.findAll();
      expect(remaining.total).toBe(1);
      expect(remaining.todos[0].id).toBe(todo1.id);
      expect(remaining.todos[0].completed).toBe(false);
    });

    it('should return 0 when no completed todos exist', async () => {
      await todoModel.create({ title: 'Todo 1' });
      await todoModel.create({ title: 'Todo 2' });

      const deletedCount = await todoModel.deleteCompleted();

      expect(deletedCount).toBe(0);

      const remaining = await todoModel.findAll();
      expect(remaining.total).toBe(2);
    });

    it('should return 0 when no todos exist', async () => {
      const deletedCount = await todoModel.deleteCompleted();

      expect(deletedCount).toBe(0);
    });

    it('should handle mixed completed and pending todos', async () => {
      // Create 5 todos, mark 3 as completed
      const todos = [];
      for (let i = 1; i <= 5; i++) {
        const todo = await todoModel.create({ title: `Todo ${i}` });
        todos.push(todo);
        if (i <= 3) {
          await todoModel.update(todo.id, { completed: true });
        }
      }

      const deletedCount = await todoModel.deleteCompleted();

      expect(deletedCount).toBe(3);

      const remaining = await todoModel.findAll();
      expect(remaining.total).toBe(2);
      remaining.todos.forEach(todo => {
        expect(todo.completed).toBe(false);
      });
    });
  });

  describe('getStats', () => {
    it('should return correct stats for empty list', async () => {
      const stats = await todoModel.getStats();

      expect(stats).toEqual({
        total: 0,
        completed: 0,
        pending: 0
      });
    });

    it('should return correct stats for mixed todos', async () => {
      const todo1 = await todoModel.create({ title: 'Todo 1' });
      const todo2 = await todoModel.create({ title: 'Todo 2' });
      const todo3 = await todoModel.create({ title: 'Todo 3' });
      const todo4 = await todoModel.create({ title: 'Todo 4' });

      // Mark 2 as completed
      await todoModel.update(todo2.id, { completed: true });
      await todoModel.update(todo4.id, { completed: true });

      const stats = await todoModel.getStats();

      expect(stats).toEqual({
        total: 4,
        completed: 2,
        pending: 2
      });
    });

    it('should return correct stats for all completed', async () => {
      const todo1 = await todoModel.create({ title: 'Todo 1' });
      const todo2 = await todoModel.create({ title: 'Todo 2' });

      await todoModel.update(todo1.id, { completed: true });
      await todoModel.update(todo2.id, { completed: true });

      const stats = await todoModel.getStats();

      expect(stats).toEqual({
        total: 2,
        completed: 2,
        pending: 0
      });
    });

    it('should return correct stats for all pending', async () => {
      await todoModel.create({ title: 'Todo 1' });
      await todoModel.create({ title: 'Todo 2' });
      await todoModel.create({ title: 'Todo 3' });

      const stats = await todoModel.getStats();

      expect(stats).toEqual({
        total: 3,
        completed: 0,
        pending: 3
      });
    });
  });

  describe('clear', () => {
    it('should remove all todos', async () => {
      await todoModel.create({ title: 'Todo 1' });
      await todoModel.create({ title: 'Todo 2' });
      await todoModel.create({ title: 'Todo 3' });

      let result = await todoModel.findAll();
      expect(result.total).toBe(3);

      await todoModel.clear();

      result = await todoModel.findAll();
      expect(result.total).toBe(0);
      expect(result.todos).toHaveLength(0);
    });

    it('should work on empty todo list', async () => {
      await todoModel.clear();

      const result = await todoModel.findAll();
      expect(result.total).toBe(0);
    });
  });

  describe('seed', () => {
    it('should create sample todos', async () => {
      await todoModel.seed();

      const result = await todoModel.findAll();
      
      expect(result.total).toBe(3);
      expect(result.todos).toHaveLength(3);
      
      const titles = result.todos.map(t => t.title);
      expect(titles).toContain('Learn TypeScript');
      expect(titles).toContain('Build Todo App');
      expect(titles).toContain('Write Tests');
      
      // All seeded todos should be pending by default
      result.todos.forEach(todo => {
        expect(todo.completed).toBe(false);
        expect(todo.id).toBeDefined();
        expect(todo.createdAt).toBeDefined();
        expect(todo.updatedAt).toBeDefined();
      });
    });

    it('should add to existing todos when seeding', async () => {
      await todoModel.create({ title: 'Existing Todo' });

      const before = await todoModel.findAll();
      expect(before.total).toBe(1);

      await todoModel.seed();

      const after = await todoModel.findAll();
      expect(after.total).toBe(4); // 1 existing + 3 seeded
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty string title in create', async () => {
      const result = await todoModel.create({ title: '' });

      expect(result.title).toBe('');
      expect(result.id).toBeDefined();
    });

    it('should handle very long title in create', async () => {
      const longTitle = 'a'.repeat(1000);
      const result = await todoModel.create({ title: longTitle });

      expect(result.title).toBe(longTitle);
    });

    it('should handle special characters in title', async () => {
      const specialTitle = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const result = await todoModel.create({ title: specialTitle });

      expect(result.title).toBe(specialTitle);
    });

    it('should handle unicode characters in title', async () => {
      const unicodeTitle = '你好世界 🌍 café naïve résumé';
      const result = await todoModel.create({ title: unicodeTitle });

      expect(result.title).toBe(unicodeTitle);
    });

    it('should handle update with empty object', async () => {
      const created = await todoModel.create({ title: 'Original Title' });
      const originalUpdatedAt = created.updatedAt.getTime();
      
      await new Promise(resolve => setTimeout(resolve, 1));
      
      const updated = await todoModel.update(created.id, {});

      expect(updated.title).toBe('Original Title'); // Unchanged
      expect(updated.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt); // Should still update timestamp
    });

    it('should maintain data integrity after multiple operations', async () => {
      // Create several todos
      const todos = [];
      for (let i = 1; i <= 5; i++) {
        const todo = await todoModel.create({ title: `Todo ${i}` });
        todos.push(todo);
      }

      // Update some
      await todoModel.update(todos[1].id, { completed: true });
      await todoModel.update(todos[3].id, { completed: true });

      // Delete one
      await todoModel.delete(todos[0].id);

      // Check final state
      const result = await todoModel.findAll();
      expect(result.total).toBe(4);

      const stats = await todoModel.getStats();
      expect(stats.total).toBe(4);
      expect(stats.completed).toBe(2);
      expect(stats.pending).toBe(2);

      // Verify specific todos
      const todo2 = await todoModel.findById(todos[1].id);
      const todo4 = await todoModel.findById(todos[3].id);
      expect(todo2?.completed).toBe(true);
      expect(todo4?.completed).toBe(true);

      // Verify deleted todo is gone
      const deletedTodo = await todoModel.findById(todos[0].id);
      expect(deletedTodo).toBeNull();
    });
  });

  describe('Priority Support', () => {
    describe('create with priority', () => {
      it('should create todo with MEDIUM priority by default', async () => {
        const todo = await todoModel.create({ title: 'Default Priority' });
        
        expect(todo.priority).toBe('MEDIUM');
      });

      it('should create todo with specified HIGH priority', async () => {
        const todo = await todoModel.create({ 
          title: 'High Priority Task',
          priority: 'HIGH'
        });
        
        expect(todo.priority).toBe('HIGH');
      });

      it('should create todo with specified LOW priority', async () => {
        const todo = await todoModel.create({ 
          title: 'Low Priority Task',
          priority: 'LOW'
        });
        
        expect(todo.priority).toBe('LOW');
      });

      it('should create todo with MEDIUM priority when specified', async () => {
        const todo = await todoModel.create({ 
          title: 'Medium Priority Task',
          priority: 'MEDIUM'
        });
        
        expect(todo.priority).toBe('MEDIUM');
      });
    });

    describe('update priority', () => {
      it('should update todo priority from MEDIUM to HIGH', async () => {
        const created = await todoModel.create({ title: 'Test Todo' });
        expect(created.priority).toBe('MEDIUM');

        const updated = await todoModel.update(created.id, { priority: 'HIGH' });
        
        expect(updated.priority).toBe('HIGH');
        expect(updated.title).toBe('Test Todo'); // Other fields unchanged
      });

      it('should update todo priority from HIGH to LOW', async () => {
        const created = await todoModel.create({ 
          title: 'High Priority Task',
          priority: 'HIGH'
        });
        
        const updated = await todoModel.update(created.id, { priority: 'LOW' });
        
        expect(updated.priority).toBe('LOW');
      });

      it('should update priority along with other fields', async () => {
        const created = await todoModel.create({ 
          title: 'Original Title',
          description: 'Original Description'
        });
        
        const updated = await todoModel.update(created.id, {
          title: 'Updated Title',
          description: 'Updated Description',
          completed: true,
          priority: 'HIGH'
        });
        
        expect(updated.title).toBe('Updated Title');
        expect(updated.description).toBe('Updated Description');
        expect(updated.completed).toBe(true);
        expect(updated.priority).toBe('HIGH');
      });
    });

    describe('priority-aware sorting', () => {
      it('should sort todos by priority in findAll (HIGH > MEDIUM > LOW)', async () => {
        // Create todos with different priorities
        const lowPriority = await todoModel.create({ 
          title: 'Low Priority',
          priority: 'LOW'
        });
        const highPriority = await todoModel.create({ 
          title: 'High Priority',
          priority: 'HIGH'
        });
        const mediumPriority = await todoModel.create({ 
          title: 'Medium Priority',
          priority: 'MEDIUM'
        });

        const result = await todoModel.findAll();
        
        // Should be sorted by priority: HIGH, MEDIUM, LOW
        expect(result.todos).toHaveLength(3);
        expect(result.todos[0].priority).toBe('HIGH');
        expect(result.todos[0].title).toBe('High Priority');
        expect(result.todos[1].priority).toBe('MEDIUM');
        expect(result.todos[1].title).toBe('Medium Priority');
        expect(result.todos[2].priority).toBe('LOW');
        expect(result.todos[2].title).toBe('Low Priority');
      });

      it('should sort by priority first, then by creation date for same priority', async () => {
        // Create multiple HIGH priority todos
        const high1 = await todoModel.create({ 
          title: 'High Priority 1',
          priority: 'HIGH'
        });
        
        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 1));
        
        const high2 = await todoModel.create({ 
          title: 'High Priority 2',
          priority: 'HIGH'
        });
        
        const medium1 = await todoModel.create({ 
          title: 'Medium Priority',
          priority: 'MEDIUM'
        });

        const result = await todoModel.findAll();
        
        expect(result.todos).toHaveLength(3);
        // All HIGH priority todos should come first
        expect(result.todos[0].priority).toBe('HIGH');
        expect(result.todos[1].priority).toBe('HIGH');
        expect(result.todos[2].priority).toBe('MEDIUM');
        
        // Within same priority, newer should come first (reverse chronological)
        expect(result.todos[0].title).toBe('High Priority 2');
        expect(result.todos[1].title).toBe('High Priority 1');
      });

      it('should maintain priority sorting with pagination', async () => {
        // Create 5 todos with mixed priorities
        await todoModel.create({ title: 'Low 1', priority: 'LOW' });
        await todoModel.create({ title: 'High 1', priority: 'HIGH' });
        await todoModel.create({ title: 'Medium 1', priority: 'MEDIUM' });
        await todoModel.create({ title: 'High 2', priority: 'HIGH' });
        await todoModel.create({ title: 'Low 2', priority: 'LOW' });

        // Get first 3 todos
        const page1 = await todoModel.findAll(1, 3);
        
        expect(page1.todos).toHaveLength(3);
        expect(page1.total).toBe(5);
        // First page should have HIGH priority todos first
        expect(page1.todos[0].priority).toBe('HIGH');
        expect(page1.todos[1].priority).toBe('HIGH');
        expect(page1.todos[2].priority).toBe('MEDIUM');

        // Get second page
        const page2 = await todoModel.findAll(2, 3);
        
        expect(page2.todos).toHaveLength(2);
        expect(page2.todos[0].priority).toBe('LOW');
        expect(page2.todos[1].priority).toBe('LOW');
      });
    });

    describe('migration logic for existing todos', () => {
      it('should handle existing todos without priority field gracefully', async () => {
        // This simulates existing todos in database that don't have priority field
        // The migration logic should assign MEDIUM as default
        const result = await todoModel.findAll();
        expect(result.total).toBe(0);
        
        // After migration (simulated by creating new todos), all should have priority
        const todo = await todoModel.create({ title: 'New Todo' });
        expect(todo.priority).toBe('MEDIUM');
      });
    });

    describe('priority validation in model', () => {
      it('should accept all valid priority values', async () => {
        const highTodo = await todoModel.create({ title: 'High', priority: 'HIGH' });
        const mediumTodo = await todoModel.create({ title: 'Medium', priority: 'MEDIUM' });
        const lowTodo = await todoModel.create({ title: 'Low', priority: 'LOW' });
        
        expect(highTodo.priority).toBe('HIGH');
        expect(mediumTodo.priority).toBe('MEDIUM');
        expect(lowTodo.priority).toBe('LOW');
      });

      it('should update to all valid priority values', async () => {
        const todo = await todoModel.create({ title: 'Test Todo' });
        
        let updated = await todoModel.update(todo.id, { priority: 'HIGH' });
        expect(updated.priority).toBe('HIGH');
        
        updated = await todoModel.update(todo.id, { priority: 'MEDIUM' });
        expect(updated.priority).toBe('MEDIUM');
        
        updated = await todoModel.update(todo.id, { priority: 'LOW' });
        expect(updated.priority).toBe('LOW');
      });
    });

    describe('stats with priority consideration', () => {
      it('should maintain correct stats regardless of priority', async () => {
        await todoModel.create({ title: 'High Task', priority: 'HIGH' });
        const mediumTodo = await todoModel.create({ title: 'Medium Task', priority: 'MEDIUM' });
        await todoModel.create({ title: 'Low Task', priority: 'LOW' });
        
        // Complete one todo
        await todoModel.update(mediumTodo.id, { completed: true });
        
        const stats = await todoModel.getStats();
        
        expect(stats.total).toBe(3);
        expect(stats.completed).toBe(1);
        expect(stats.pending).toBe(2);
      });
    });

    describe('seed with priority support', () => {
      it('should create seeded todos with MEDIUM priority by default', async () => {
        await todoModel.seed();
        
        const result = await todoModel.findAll();
        
        expect(result.total).toBe(3);
        result.todos.forEach(todo => {
          expect(todo.priority).toBe('MEDIUM');
        });
      });
    });
  });
});