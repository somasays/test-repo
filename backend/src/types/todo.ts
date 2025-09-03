export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Todo {
  id: string;
  title: string;
  description?: string | undefined;
  completed: boolean;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  priority?: Priority;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
}

export interface TodoResponse {
  id: string;
  title: string;
  description?: string | undefined;
  completed: boolean;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface TodoListResponse {
  todos: TodoResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface SearchTodoListResponse {
  todos: TodoResponse[];
  total: number;
  filtered?: number;    // Total after filtering, before pagination
  page: number;
  limit: number;
  query?: Record<string, any>;  // Echo back search parameters
}

// Priority validation and utility functions
export interface PriorityValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Type guard to check if a value is a valid Priority
 * @param value - Value to check
 * @returns True if value is a valid Priority
 */
export function isPriority(value: any): value is Priority {
  return typeof value === 'string' && ['HIGH', 'MEDIUM', 'LOW'].includes(value);
}

/**
 * Validate priority value and return validation result
 * @param value - Priority value to validate
 * @returns Validation result with error message if invalid
 */
export function validatePriority(value: any): PriorityValidationResult {
  if (isPriority(value)) {
    return { isValid: true };
  }
  return {
    isValid: false,
    error: 'Priority must be one of: HIGH, MEDIUM, LOW'
  };
}

/**
 * Compare two priorities for sorting (HIGH > MEDIUM > LOW)
 * @param a - First priority
 * @param b - Second priority
 * @returns -1 if a has higher priority, 1 if b has higher priority, 0 if equal
 */
export function comparePriorities(a: Priority, b: Priority): number {
  const priorityOrder: Record<Priority, number> = {
    'HIGH': 0,
    'MEDIUM': 1,
    'LOW': 2
  };
  
  const orderA = priorityOrder[a];
  const orderB = priorityOrder[b];
  
  if (orderA < orderB) return -1;
  if (orderA > orderB) return 1;
  return 0;
}