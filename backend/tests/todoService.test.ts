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

      const updated = await todoService.updateTodo(created.id, {
        title: 'Updated Title',
        completed: true
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.description).toBe('Original Description');
      expect(updated.completed).toBe(true);
      expect(updated.updatedAt).not.toBe(updated.createdAt);
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
});