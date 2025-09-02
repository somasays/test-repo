import { v4 as uuidv4 } from 'uuid';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../types/todo.js';
import { createNotFoundError } from '../utils/appError.js';

class TodoModel {
  private todos: Map<string, Todo> = new Map();

  async findAll(page: number = 1, limit: number = 10): Promise<{ todos: Todo[]; total: number }> {
    const allTodos = Array.from(this.todos.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const todos = allTodos.slice(startIndex, endIndex);
    
    return {
      todos,
      total: allTodos.length
    };
  }

  async findById(id: string): Promise<Todo | null> {
    return this.todos.get(id) || null;
  }

  async create(todoData: CreateTodoRequest): Promise<Todo> {
    const now = new Date();
    const todo: Todo = {
      id: uuidv4(),
      title: todoData.title,
      description: todoData.description,
      completed: false,
      createdAt: now,
      updatedAt: now
    };

    this.todos.set(todo.id, todo);
    return todo;
  }

  async update(id: string, updateData: UpdateTodoRequest): Promise<Todo> {
    const existingTodo = this.todos.get(id);
    if (!existingTodo) {
      throw createNotFoundError('Todo', id);
    }

    const updatedTodo: Todo = {
      ...existingTodo,
      ...updateData,
      updatedAt: new Date()
    };

    this.todos.set(id, updatedTodo);
    return updatedTodo;
  }

  async delete(id: string): Promise<void> {
    const exists = this.todos.has(id);
    if (!exists) {
      throw createNotFoundError('Todo', id);
    }

    this.todos.delete(id);
  }

  async deleteCompleted(): Promise<number> {
    const completedTodos = Array.from(this.todos.entries())
      .filter(([, todo]) => todo.completed);
    
    completedTodos.forEach(([id]) => this.todos.delete(id));
    return completedTodos.length;
  }

  async getStats(): Promise<{ total: number; completed: number; pending: number }> {
    const allTodos = Array.from(this.todos.values());
    const completed = allTodos.filter(todo => todo.completed).length;
    
    return {
      total: allTodos.length,
      completed,
      pending: allTodos.length - completed
    };
  }

  // For testing purposes
  async clear(): Promise<void> {
    this.todos.clear();
  }

  // Seed with sample data
  async seed(): Promise<void> {
    const sampleTodos = [
      {
        title: 'Learn TypeScript',
        description: 'Master TypeScript fundamentals and advanced features'
      },
      {
        title: 'Build Todo App',
        description: 'Create a full-stack todo application with React and Express'
      },
      {
        title: 'Write Tests',
        description: 'Add comprehensive test coverage for the application'
      }
    ];

    for (const todoData of sampleTodos) {
      await this.create(todoData);
    }
  }
}

// Export singleton instance
export const todoModel = new TodoModel();