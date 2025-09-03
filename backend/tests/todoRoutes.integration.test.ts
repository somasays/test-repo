import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js';
import { todoService } from '../src/services/todoService.js';

describe('Todo Routes Integration Tests', () => {
  beforeEach(async () => {
    // Clear all todos before each test
    await todoService.clearAllTodos();
  });

  afterEach(async () => {
    // Clean up after each test
    await todoService.clearAllTodos();
  });

  describe('GET /api/todos', () => {
    it('should return empty list when no todos exist', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          todos: [],
          total: 0,
          page: 1,
          limit: 10
        },
        message: 'Todos retrieved successfully'
      });
    });

    it('should return todos with default pagination', async () => {
      // Create test todos
      await todoService.createTodo({ title: 'Todo 1' });
      await todoService.createTodo({ title: 'Todo 2' });

      const response = await request(app)
        .get('/api/todos')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.todos).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(10);
      expect(response.body.message).toBe('Todos retrieved successfully');
    });

    it('should return todos with custom pagination', async () => {
      // Create 5 test todos
      for (let i = 1; i <= 5; i++) {
        await todoService.createTodo({ title: `Todo ${i}` });
      }

      const response = await request(app)
        .get('/api/todos')
        .query({ page: 2, limit: 2 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.todos).toHaveLength(2);
      expect(response.body.data.total).toBe(5);
      expect(response.body.data.page).toBe(2);
      expect(response.body.data.limit).toBe(2);
    });

    it('should return validation error for invalid pagination parameters', async () => {
      const response = await request(app)
        .get('/api/todos')
        .query({ page: 0, limit: -1 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.error).toContain('Page must be a positive integer');
    });

    it('should return validation error for limit exceeding maximum', async () => {
      const response = await request(app)
        .get('/api/todos')
        .query({ page: 1, limit: 150 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Limit must be between 1 and 100');
    });
  });

  describe('GET /api/todos/:id', () => {
    it('should return todo by valid id', async () => {
      const created = await todoService.createTodo({ 
        title: 'Test Todo', 
        description: 'Test Description' 
      });

      const response = await request(app)
        .get(`/api/todos/${created.id}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          id: created.id,
          title: 'Test Todo',
          description: 'Test Description',
          completed: false,
          priority: 'MEDIUM', // Default priority
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        },
        message: 'Todo retrieved successfully'
      });
    });

    it('should return 404 for non-existent id', async () => {
      const response = await request(app)
        .get('/api/todos/non-existent-id')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Todo with id non-existent-id not found',
        message: 'An error occurred'
      });
    });
  });

  describe('GET /api/todos/stats', () => {
    it('should return stats for empty todo list', async () => {
      const response = await request(app)
        .get('/api/todos/stats')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          total: 0,
          completed: 0,
          pending: 0
        },
        message: 'Todo stats retrieved successfully'
      });
    });

    it('should return correct stats for mixed todos', async () => {
      const todo1 = await todoService.createTodo({ title: 'Todo 1' });
      await todoService.createTodo({ title: 'Todo 2' });
      await todoService.updateTodo(todo1.id, { completed: true });

      const response = await request(app)
        .get('/api/todos/stats')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          total: 2,
          completed: 1,
          pending: 1
        },
        message: 'Todo stats retrieved successfully'
      });
    });
  });

  describe('POST /api/todos', () => {
    it('should create new todo with valid data', async () => {
      const todoData = {
        title: 'New Todo',
        description: 'New Description'
      };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        title: 'New Todo',
        description: 'New Description',
        completed: false
      });
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.updatedAt).toBeDefined();
      expect(response.body.message).toBe('Todo created successfully');
    });

    it('should create todo without description', async () => {
      const todoData = { title: 'Todo without description' };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Todo without description');
      expect(response.body.data.description).toBeUndefined();
      expect(response.body.data.completed).toBe(false);
    });

    it('should return validation error for missing title', async () => {
      const todoData = { description: 'Description without title' };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.error).toContain('Title is required');
    });

    it('should return validation error for empty title', async () => {
      const todoData = { title: '', description: 'Valid description' };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Title is required');
    });

    it('should return validation error for title exceeding max length', async () => {
      const todoData = { title: 'a'.repeat(201) };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Title must be between 1 and 200 characters');
    });

    it('should return validation error for description exceeding max length', async () => {
      const todoData = { 
        title: 'Valid title',
        description: 'a'.repeat(1001)
      };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Description must not exceed 1000 characters');
    });

    it('should handle special characters in title and description', async () => {
      const todoData = {
        title: 'Special chars: !@#$%^&*()',
        description: 'Unicode: 你好世界 🌍 café naïve résumé'
      };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(todoData.title);
      expect(response.body.data.description).toBe(todoData.description);
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update todo with valid data', async () => {
      const created = await todoService.createTodo({ title: 'Original Title' });

      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
        completed: true
      };

      const response = await request(app)
        .put(`/api/todos/${created.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: created.id,
        title: 'Updated Title',
        description: 'Updated Description',
        completed: true
      });
      expect(response.body.message).toBe('Todo updated successfully');
    });

    it('should update only title', async () => {
      const created = await todoService.createTodo({ 
        title: 'Original Title',
        description: 'Original Description'
      });

      const response = await request(app)
        .put(`/api/todos/${created.id}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.data.title).toBe('Updated Title');
      expect(response.body.data.description).toBe('Original Description');
      expect(response.body.data.completed).toBe(false);
    });

    it('should update only completed status', async () => {
      const created = await todoService.createTodo({ title: 'Test Todo' });

      const response = await request(app)
        .put(`/api/todos/${created.id}`)
        .send({ completed: true })
        .expect(200);

      expect(response.body.data.title).toBe('Test Todo');
      expect(response.body.data.completed).toBe(true);
    });

    it('should return 404 for non-existent todo', async () => {
      const response = await request(app)
        .put('/api/todos/non-existent-id')
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Todo with id non-existent-id not found');
    });

    it('should return validation error for invalid title', async () => {
      const created = await todoService.createTodo({ title: 'Original Title' });

      const response = await request(app)
        .put(`/api/todos/${created.id}`)
        .send({ title: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Title cannot be empty');
    });

    it('should return validation error for invalid completed value', async () => {
      const created = await todoService.createTodo({ title: 'Original Title' });

      const response = await request(app)
        .put(`/api/todos/${created.id}`)
        .send({ completed: 'not-a-boolean' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Completed must be a boolean value');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete existing todo', async () => {
      const created = await todoService.createTodo({ title: 'To Be Deleted' });

      const response = await request(app)
        .delete(`/api/todos/${created.id}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Todo deleted successfully'
      });

      // Verify todo was deleted
      const deletedTodo = await todoService.getTodoById(created.id);
      expect(deletedTodo).toBeNull();
    });

    it('should return 404 for non-existent todo', async () => {
      const response = await request(app)
        .delete('/api/todos/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Todo with id non-existent-id not found');
    });
  });

  describe('DELETE /api/todos/completed/all', () => {
    it('should delete all completed todos', async () => {
      const todo1 = await todoService.createTodo({ title: 'Todo 1' });
      const todo2 = await todoService.createTodo({ title: 'Todo 2' });
      const todo3 = await todoService.createTodo({ title: 'Todo 3' });

      // Mark 2 todos as completed
      await todoService.updateTodo(todo1.id, { completed: true });
      await todoService.updateTodo(todo3.id, { completed: true });

      const response = await request(app)
        .delete('/api/todos/completed/all')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: { deletedCount: 2 },
        message: '2 completed todos deleted successfully'
      });

      // Verify only pending todo remains
      const remainingTodos = await todoService.getAllTodos();
      expect(remainingTodos.total).toBe(1);
      expect(remainingTodos.todos[0].id).toBe(todo2.id);
    });

    it('should handle when no completed todos exist', async () => {
      await todoService.createTodo({ title: 'Pending Todo 1' });
      await todoService.createTodo({ title: 'Pending Todo 2' });

      const response = await request(app)
        .delete('/api/todos/completed/all')
        .expect(200);

      expect(response.body.data.deletedCount).toBe(0);
      expect(response.body.message).toBe('0 completed todos deleted successfully');
    });
  });

  describe('PUT /api/todos/completed/all', () => {
    it('should mark all pending todos as completed', async () => {
      await todoService.createTodo({ title: 'Todo 1' });
      await todoService.createTodo({ title: 'Todo 2' });
      const todo3 = await todoService.createTodo({ title: 'Todo 3' });
      
      // Mark one as already completed
      await todoService.updateTodo(todo3.id, { completed: true });

      const response = await request(app)
        .put('/api/todos/completed/all')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: { updatedCount: 2 },
        message: '2 todos marked as completed'
      });

      // Verify all todos are completed
      const stats = await todoService.getTodoStats();
      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(3);
      expect(stats.pending).toBe(0);
    });

    it('should handle when all todos are already completed', async () => {
      const todo1 = await todoService.createTodo({ title: 'Todo 1' });
      const todo2 = await todoService.createTodo({ title: 'Todo 2' });

      // Mark all as completed
      await todoService.updateTodo(todo1.id, { completed: true });
      await todoService.updateTodo(todo2.id, { completed: true });

      const response = await request(app)
        .put('/api/todos/completed/all')
        .expect(200);

      expect(response.body.data.updatedCount).toBe(0);
      expect(response.body.message).toBe('0 todos marked as completed');
    });

    it('should handle empty todo list', async () => {
      const response = await request(app)
        .put('/api/todos/completed/all')
        .expect(200);

      expect(response.body.data.updatedCount).toBe(0);
      expect(response.body.message).toBe('0 todos marked as completed');
    });
  });

  describe('404 handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/todos/unknown-endpoint')
        .expect(404);

      expect(response.body.success).toBe(false);
      // This route is treated as a GET by ID, so it returns "Todo with id ... not found"
      expect(response.body.error).toContain('Todo with id unknown-endpoint not found');
    });

    it('should return 404 for unknown HTTP methods', async () => {
      const response = await request(app)
        .patch('/api/todos')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Content-Type', 'application/json')
        .send('{ "title": "Invalid JSON" ')
        .expect(500); // Express body-parser errors are handled as 500 by our error handler

      // Express should handle malformed JSON and return appropriate error
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Internal server error');
    });

    it('should handle large request payloads', async () => {
      const largeTitle = 'a'.repeat(10000); // Much larger than allowed

      const response = await request(app)
        .post('/api/todos')
        .send({ title: largeTitle })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Title must be between 1 and 200 characters');
    });
  });

  describe('CORS and security headers', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should include security headers from Helmet', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(200);

      // Helmet should add various security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });

  describe('health check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        environment: expect.any(String),
        timestamp: expect.any(String)
      });

      // Validate timestamp format
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(Date.now() - 10000); // Within last 10 seconds
    });
  });

  describe('complex integration scenarios', () => {
    it('should handle full CRUD lifecycle', async () => {
      // Create
      const createResponse = await request(app)
        .post('/api/todos')
        .send({ title: 'Lifecycle Test', description: 'Test Description' })
        .expect(201);

      const todoId = createResponse.body.data.id;

      // Read
      await request(app)
        .get(`/api/todos/${todoId}`)
        .expect(200);

      // Update
      await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ title: 'Updated Lifecycle Test', completed: true })
        .expect(200);

      // Verify update
      const updatedResponse = await request(app)
        .get(`/api/todos/${todoId}`)
        .expect(200);

      expect(updatedResponse.body.data.title).toBe('Updated Lifecycle Test');
      expect(updatedResponse.body.data.completed).toBe(true);

      // Delete
      await request(app)
        .delete(`/api/todos/${todoId}`)
        .expect(200);

      // Verify deletion
      await request(app)
        .get(`/api/todos/${todoId}`)
        .expect(404);
    });

    it('should handle concurrent operations', async () => {
      // Create multiple todos concurrently
      const createPromises = Array.from({ length: 5 }, (_, i) =>
        request(app)
          .post('/api/todos')
          .send({ title: `Concurrent Todo ${i + 1}` })
      );

      const createResponses = await Promise.all(createPromises);
      
      // All should succeed
      createResponses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Verify all were created
      const listResponse = await request(app)
        .get('/api/todos')
        .expect(200);

      expect(listResponse.body.data.total).toBe(5);
    });

    it('should maintain data consistency across operations', async () => {
      // Create initial todos
      const todo1 = await request(app)
        .post('/api/todos')
        .send({ title: 'Todo 1' });
      const todo2 = await request(app)
        .post('/api/todos')
        .send({ title: 'Todo 2' });
      
      const todoId1 = todo1.body.data.id;
      const todoId2 = todo2.body.data.id;

      // Mark one as completed
      await request(app)
        .put(`/api/todos/${todoId1}`)
        .send({ completed: true });

      // Check stats
      let statsResponse = await request(app)
        .get('/api/todos/stats')
        .expect(200);

      expect(statsResponse.body.data).toEqual({
        total: 2,
        completed: 1,
        pending: 1
      });

      // Delete completed todos
      await request(app)
        .delete('/api/todos/completed/all')
        .expect(200);

      // Check final stats
      statsResponse = await request(app)
        .get('/api/todos/stats')
        .expect(200);

      expect(statsResponse.body.data).toEqual({
        total: 1,
        completed: 0,
        pending: 1
      });

      // Verify remaining todo
      const remainingResponse = await request(app)
        .get(`/api/todos/${todoId2}`)
        .expect(200);

      expect(remainingResponse.body.data.title).toBe('Todo 2');
      expect(remainingResponse.body.data.completed).toBe(false);
    });
  });

  describe('GET /api/todos with search and filter', () => {
    let testTodos: any[];

    beforeEach(async () => {
      // Create test todos for search and filter testing
      const todo1 = await request(app)
        .post('/api/todos')
        .send({ title: 'Meeting with team', description: 'Weekly sync discussion' })
        .expect(201);

      const todo2 = await request(app)
        .post('/api/todos')
        .send({ title: 'Code review session', description: 'Review pull requests' })
        .expect(201);

      const todo3 = await request(app)
        .post('/api/todos')
        .send({ title: 'Team standup', description: 'Daily standup with development team' })
        .expect(201);

      const todo4 = await request(app)
        .post('/api/todos')
        .send({ title: 'Update documentation', description: 'Add API examples' })
        .expect(201);

      // Mark some todos as completed
      await request(app)
        .put(`/api/todos/${todo2.body.data.id}`)
        .send({ completed: true })
        .expect(200);

      await request(app)
        .put(`/api/todos/${todo4.body.data.id}`)
        .send({ completed: true })
        .expect(200);

      testTodos = [todo1.body.data, todo2.body.data, todo3.body.data, todo4.body.data];
    });

    it('should search todos by query parameter', async () => {
      const response = await request(app)
        .get('/api/todos?q=team')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.todos).toHaveLength(2);
      expect(response.body.data.filtered).toBe(2);
      expect(response.body.data.total).toBe(4);
      expect(response.body.data.query.q).toBe('team');

      const titles = response.body.data.todos.map((todo: any) => todo.title);
      expect(titles).toEqual(expect.arrayContaining([
        'Meeting with team',
        'Team standup'
      ]));
    });

    it('should filter todos by status', async () => {
      const response = await request(app)
        .get('/api/todos?status=completed')
        .expect(200);

      expect(response.body.data.todos).toHaveLength(2);
      expect(response.body.data.filtered).toBe(2);
      expect(response.body.data.query.status).toBe('completed');
      
      response.body.data.todos.forEach((todo: any) => {
        expect(todo.completed).toBe(true);
      });
    });

    it('should filter todos by pending status', async () => {
      const response = await request(app)
        .get('/api/todos?status=pending')
        .expect(200);

      expect(response.body.data.todos).toHaveLength(2);
      expect(response.body.data.filtered).toBe(2);
      expect(response.body.data.query.status).toBe('pending');
      
      response.body.data.todos.forEach((todo: any) => {
        expect(todo.completed).toBe(false);
      });
    });

    it('should combine search and filter', async () => {
      const response = await request(app)
        .get('/api/todos?q=team&status=pending')
        .expect(200);

      expect(response.body.data.todos).toHaveLength(2);
      expect(response.body.data.filtered).toBe(2);
      expect(response.body.data.query).toEqual({
        q: 'team',
        status: 'pending'
      });

      // Both pending todos that contain "team"
      const titles = response.body.data.todos.map((todo: any) => todo.title);
      expect(titles).toEqual(expect.arrayContaining([
        'Meeting with team',
        'Team standup'
      ]));
      
      response.body.data.todos.forEach((todo: any) => {
        expect(todo.completed).toBe(false);
      });
    });

    it('should handle date range filtering', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      const response = await request(app)
        .get(`/api/todos?created_after=${oneHourAgo.toISOString()}&created_before=${oneHourLater.toISOString()}`)
        .expect(200);

      expect(response.body.data.todos).toHaveLength(4);
      expect(response.body.data.filtered).toBe(4);
      expect(response.body.data.query.created_after).toBe(oneHourAgo.toISOString());
      expect(response.body.data.query.created_before).toBe(oneHourLater.toISOString());
    });

    it('should apply pagination to filtered results', async () => {
      const response = await request(app)
        .get('/api/todos?status=all&page=1&limit=2')
        .expect(200);

      expect(response.body.data.todos).toHaveLength(2);
      expect(response.body.data.filtered).toBe(4);
      expect(response.body.data.total).toBe(4);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(2);
    });

    it('should return empty results when no matches', async () => {
      const response = await request(app)
        .get('/api/todos?q=nonexistent')
        .expect(200);

      expect(response.body.data.todos).toHaveLength(0);
      expect(response.body.data.filtered).toBe(0);
      expect(response.body.data.total).toBe(4);
      expect(response.body.data.query.q).toBe('nonexistent');
    });

    it('should validate search query parameters', async () => {
      // Test query too long
      const longQuery = 'a'.repeat(101);
      await request(app)
        .get(`/api/todos?q=${longQuery}`)
        .expect(400);

      // Test invalid status
      await request(app)
        .get('/api/todos?status=invalid')
        .expect(400);

      // Test invalid date format
      await request(app)
        .get('/api/todos?created_after=invalid-date')
        .expect(400);
    });

    it('should validate date range logic', async () => {
      // created_after must be before created_before
      await request(app)
        .get('/api/todos?created_after=2024-12-31T00:00:00.000Z&created_before=2024-01-01T00:00:00.000Z')
        .expect(400);
    });

    it('should handle special characters in search safely', async () => {
      // Test that dangerous characters are rejected
      await request(app)
        .get('/api/todos?q=<script>alert("xss")</script>')
        .expect(400);
    });

    it('should allow valid special characters in search', async () => {
      const response = await request(app)
        .get('/api/todos?q=API')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.query.q).toBe('API');
    });

    it('should maintain backward compatibility for basic requests', async () => {
      // Request without search/filter params should work exactly as before
      const response = await request(app)
        .get('/api/todos?page=1&limit=10')
        .expect(200);

      expect(response.body.data.todos).toHaveLength(4);
      expect(response.body.data.total).toBe(4);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(10);
      // Should not have search metadata for backward compatibility
      expect(response.body.data.filtered).toBeUndefined();
      expect(response.body.data.query).toBeUndefined();
    });

    it('should perform case-insensitive search', async () => {
      const response = await request(app)
        .get('/api/todos?q=TEAM')
        .expect(200);

      expect(response.body.data.todos).toHaveLength(2);
      expect(response.body.data.query.q).toBe('TEAM');
    });

    it('should handle multi-word search queries', async () => {
      const response = await request(app)
        .get('/api/todos?q=development team')
        .expect(200);

      expect(response.body.data.todos).toHaveLength(1);
      expect(response.body.data.todos[0].title).toBe('Team standup');
    });
  });
});