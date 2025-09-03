import { todoModel } from '../models/todoModel.js';
import { 
  Todo, 
  CreateTodoRequest, 
  UpdateTodoRequest, 
  TodoResponse, 
  TodoListResponse,
  SearchTodoListResponse
} from '../types/todo.js';
import { SearchEngine } from './search/searchEngine.js';
import { FilterEngine } from './search/filterEngine.js';
import { QueryParser } from './search/queryParser.js';

export class TodoService {
  private searchEngine = new SearchEngine();
  private filterEngine = new FilterEngine();
  private queryParser = new QueryParser();

  private mapTodoToResponse(todo: Todo): TodoResponse {
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      priority: todo.priority,
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

  async searchAndFilterTodos(
    queryParams: Record<string, any>,
    page: number = 1,
    limit: number = 10
  ): Promise<SearchTodoListResponse> {
    // Parse and validate query
    const parsedQuery = this.queryParser.parse(queryParams);
    
    // Get all todos from model
    const { todos, total } = await todoModel.findAll();
    
    let filteredTodos = todos;
    
    // Apply text search if query provided
    if (parsedQuery.searchQuery) {
      filteredTodos = this.searchEngine.search(
        filteredTodos, 
        parsedQuery.searchQuery,
        { fields: ['title', 'description'] }
      );
    }
    
    // Apply filters
    filteredTodos = this.filterEngine.filter(filteredTodos, parsedQuery.filters);
    
    // Calculate totals
    const filtered = filteredTodos.length;
    
    // Apply pagination to filtered results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTodos = filteredTodos.slice(startIndex, endIndex);
    
    // Build query object for response (only include non-empty values)
    const responseQuery: Record<string, any> = {};
    if (parsedQuery.searchQuery) {
      responseQuery.q = parsedQuery.searchQuery;
    }
    if (parsedQuery.filters.status && parsedQuery.filters.status !== 'all') {
      responseQuery.status = parsedQuery.filters.status;
    }
    if (parsedQuery.filters.priority) {
      responseQuery.priority = parsedQuery.filters.priority;
    }
    if (parsedQuery.filters.createdAfter) {
      responseQuery.created_after = parsedQuery.filters.createdAfter.toISOString();
    }
    if (parsedQuery.filters.createdBefore) {
      responseQuery.created_before = parsedQuery.filters.createdBefore.toISOString();
    }
    if (parsedQuery.filters.updatedAfter) {
      responseQuery.updated_after = parsedQuery.filters.updatedAfter.toISOString();
    }
    if (parsedQuery.filters.updatedBefore) {
      responseQuery.updated_before = parsedQuery.filters.updatedBefore.toISOString();
    }

    return {
      todos: paginatedTodos.map(this.mapTodoToResponse),
      total,
      filtered,
      page,
      limit,
      query: Object.keys(responseQuery).length > 0 ? responseQuery : {}
    };
  }
}

export const todoService = new TodoService();