import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js';
import { todoService } from '../src/services/todoService.js';

describe('Search Performance Tests', () => {
  beforeEach(async () => {
    // Clear all todos before each test
    await todoService.clearAllTodos();

    // Create a moderate dataset for performance testing
    for (let i = 1; i <= 50; i++) {
      await todoService.createTodo({
        title: `Task ${i} for project alpha`,
        description: `Description for task ${i} with some keywords and team collaboration`
      });
    }
  });

  it('should handle search requests under 100ms', async () => {
    const startTime = performance.now();
    
    const response = await request(app)
      .get('/api/todos?q=project')
      .expect(200);
    
    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(response.body.success).toBe(true);
    expect(response.body.data.todos).toBeDefined();
    expect(response.body.data.filtered).toBeGreaterThan(0);
    expect(duration).toBeLessThan(100); // Performance requirement

    console.log(`Search query completed in ${duration.toFixed(2)}ms`);
  });

  it('should handle complex search and filter under 100ms', async () => {
    const startTime = performance.now();
    
    const response = await request(app)
      .get('/api/todos?q=team&status=pending&page=1&limit=20')
      .expect(200);
    
    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(response.body.success).toBe(true);
    expect(response.body.data.todos).toBeDefined();
    expect(duration).toBeLessThan(100); // Performance requirement

    console.log(`Complex search query completed in ${duration.toFixed(2)}ms`);
  });

  it('should handle concurrent search requests efficiently', async () => {
    const searchPromises = [];
    
    // Launch 5 concurrent search requests
    for (let i = 0; i < 5; i++) {
      searchPromises.push(
        request(app)
          .get(`/api/todos?q=task&page=1&limit=10`)
          .expect(200)
      );
    }

    const startTime = performance.now();
    const responses = await Promise.all(searchPromises);
    const endTime = performance.now();
    const totalDuration = endTime - startTime;

    // All requests should complete
    expect(responses).toHaveLength(5);
    responses.forEach(response => {
      expect(response.body.success).toBe(true);
      expect(response.body.data.todos).toBeDefined();
    });

    // Average per request should be reasonable
    const averagePerRequest = totalDuration / 5;
    expect(averagePerRequest).toBeLessThan(100);

    console.log(`5 concurrent searches completed in ${totalDuration.toFixed(2)}ms (avg: ${averagePerRequest.toFixed(2)}ms per request)`);
  });

  it('should handle empty search results quickly', async () => {
    const startTime = performance.now();
    
    const response = await request(app)
      .get('/api/todos?q=nonexistent')
      .expect(200);
    
    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(response.body.data.todos).toHaveLength(0);
    expect(response.body.data.filtered).toBe(0);
    expect(duration).toBeLessThan(50); // Should be very fast for no results

    console.log(`Empty search query completed in ${duration.toFixed(2)}ms`);
  });
});