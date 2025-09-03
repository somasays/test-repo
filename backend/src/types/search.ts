import { Todo, Priority } from './todo.js';
import { PaginationParams } from './todo.js';

// Search-related query parameters
export interface SearchQuery {
  q?: string;
  status?: 'completed' | 'pending' | 'all';
  priority?: Priority;
  created_after?: string;
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
}

// Combined search and pagination request
export interface SearchRequest extends PaginationParams {
  query: SearchQuery & PaginationParams;
}

// Filter criteria for internal processing
export interface FilterCriteria {
  status?: 'completed' | 'pending' | 'all';
  priority?: Priority;
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
}

// Search options for configuring search behavior
export interface SearchOptions {
  caseSensitive?: boolean;
  fuzzyMatch?: boolean;
  fields: (keyof Todo)[];
}

// Parsed query object after processing request parameters
export interface ParsedQuery {
  searchQuery?: string;
  filters: FilterCriteria;
  pagination: PaginationParams;
}

// Enhanced todo list response with search metadata
export interface SearchableFields {
  title: string;
  description?: string;
}

// Validation result for query parsing
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

// Performance metrics for monitoring
export interface SearchMetrics {
  totalQueries: number;
  averageResponseTime: number;
  zeroResultQueries: number;
  popularQueries: Map<string, number>;
}

// Enhanced response type that extends existing TodoListResponse
export interface SearchTodoListResponse {
  todos: import('./todo.js').TodoResponse[];
  total: number;
  filtered?: number;    // Total after filtering, before pagination
  page: number;
  limit: number;
  query?: SearchQuery;  // Echo back search parameters
}