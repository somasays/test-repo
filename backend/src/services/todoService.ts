import { todoModel } from '../models/todoModel.js';
import { 
  Todo, 
  CreateTodoRequest, 
  UpdateTodoRequest, 
  TodoResponse, 
  TodoListResponse 
} from '../types/todo.js';

export class TodoService {
  private mapTodoToResponse(todo: Todo): TodoResponse {
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString()
    };
  }

  async getAllTodos(page: number = 1, limit: number = 10): Promise<TodoListResponse> {
    const { todos, total } = await todoModel.findAll(page, limit);
    
    return {
      todos: todos.map(this.mapTodoToResponse),
      total,
      page,
      limit
    };
  }

  async getTodoById(id: string): Promise<TodoResponse | null> {
    const todo = await todoModel.findById(id);
    return todo ? this.mapTodoToResponse(todo) : null;
  }

  async createTodo(todoData: CreateTodoRequest): Promise<TodoResponse> {
    const todo = await todoModel.create(todoData);
    return this.mapTodoToResponse(todo);
  }

  async updateTodo(id: string, updateData: UpdateTodoRequest): Promise<TodoResponse> {
    const todo = await todoModel.update(id, updateData);
    return this.mapTodoToResponse(todo);
  }

  async deleteTodo(id: string): Promise<void> {
    await todoModel.delete(id);
  }

  async deleteCompletedTodos(): Promise<{ deletedCount: number }> {
    const deletedCount = await todoModel.deleteCompleted();
    return { deletedCount };
  }

  async getTodoStats(): Promise<{ total: number; completed: number; pending: number }> {
    return await todoModel.getStats();
  }

  async markAllCompleted(): Promise<{ updatedCount: number }> {
    const { todos } = await todoModel.findAll();
    const pendingTodos = todos.filter(todo => !todo.completed);
    
    for (const todo of pendingTodos) {
      await todoModel.update(todo.id, { completed: true });
    }

    return { updatedCount: pendingTodos.length };
  }

  // For testing
  async clearAllTodos(): Promise<void> {
    await todoModel.clear();
  }

  async seedTodos(): Promise<void> {
    await todoModel.seed();
  }
}

export const todoService = new TodoService();