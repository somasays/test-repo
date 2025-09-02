import axios from 'axios';
import { 
  Todo, 
  CreateTodoRequest, 
  UpdateTodoRequest, 
  ApiResponse, 
  TodoListResponse,
  TodoStats,
  BulkActionResponse
} from '@/types/todo';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const todoApi = {
  // Get all todos with pagination
  getTodos: async (page = 1, limit = 10): Promise<TodoListResponse> => {
    const response = await api.get<ApiResponse<TodoListResponse>>(`/todos?page=${page}&limit=${limit}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch todos');
    }
    return response.data.data;
  },

  // Get todo by ID
  getTodoById: async (id: string): Promise<Todo> => {
    const response = await api.get<ApiResponse<Todo>>(`/todos/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch todo');
    }
    return response.data.data;
  },

  // Create new todo
  createTodo: async (todoData: CreateTodoRequest): Promise<Todo> => {
    const response = await api.post<ApiResponse<Todo>>('/todos', todoData);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create todo');
    }
    return response.data.data;
  },

  // Update todo
  updateTodo: async (id: string, updateData: UpdateTodoRequest): Promise<Todo> => {
    const response = await api.put<ApiResponse<Todo>>(`/todos/${id}`, updateData);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update todo');
    }
    return response.data.data;
  },

  // Delete todo
  deleteTodo: async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse<null>>(`/todos/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete todo');
    }
  },

  // Get todo statistics
  getTodoStats: async (): Promise<TodoStats> => {
    const response = await api.get<ApiResponse<TodoStats>>('/todos/stats');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch stats');
    }
    return response.data.data;
  },

  // Delete all completed todos
  deleteCompletedTodos: async (): Promise<BulkActionResponse> => {
    const response = await api.delete<ApiResponse<BulkActionResponse>>('/todos/completed/all');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to delete completed todos');
    }
    return response.data.data;
  },

  // Mark all todos as completed
  markAllCompleted: async (): Promise<BulkActionResponse> => {
    const response = await api.put<ApiResponse<BulkActionResponse>>('/todos/completed/all');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to mark all as completed');
    }
    return response.data.data;
  },
};