export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TodoListResponse {
  todos: Todo[];
  total: number;
  page: number;
  limit: number;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
}

export interface BulkActionResponse {
  deletedCount?: number;
  updatedCount?: number;
}