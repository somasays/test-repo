import { ParsedQuery, ValidationResult, FilterCriteria } from '../../types/search.js';
import { PaginationParams, Priority, isPriority } from '../../types/todo.js';

export class QueryParser {
  /**
   * Parse query parameters into structured query object
   * @param queryParams - Raw query parameters from request
   * @returns Parsed query with search, filters, and pagination
   */
  parse(queryParams: Record<string, any>): ParsedQuery {
    const searchQuery = this.parseSearchQuery(queryParams.q);
    const filters = this.parseFilters(queryParams);
    const pagination = this.parsePagination(queryParams);

    return {
      searchQuery,
      filters,
      pagination
    };
  }

  /**
   * Validate query parameters
   * @param queryParams - Raw query parameters to validate
   * @returns Validation result with errors if any
   */
  validate(queryParams: Record<string, any>): ValidationResult {
    const errors: string[] = [];

    // Validate search query
    this.validateSearchQuery(queryParams.q, errors);

    // Validate status
    this.validateStatus(queryParams.status, errors);

    // Validate priority
    this.validatePriority(queryParams.priority, errors);

    // Validate date parameters
    this.validateDateParameters(queryParams, errors);

    // Validate pagination
    this.validatePagination(queryParams, errors);

    // Validate date range logic
    this.validateDateRangeLogic(queryParams, errors);

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Parse search query parameter
   * @param q - Search query parameter
   * @returns Parsed search query or undefined
   */
  private parseSearchQuery(q: any): string | undefined {
    if (!q) return undefined;

    // Handle array values (take first element)
    const queryValue = Array.isArray(q) ? q[0] : q;
    
    if (typeof queryValue !== 'string') return undefined;

    const trimmed = queryValue.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  /**
   * Parse filter parameters
   * @param queryParams - Raw query parameters
   * @returns Parsed filter criteria
   */
  private parseFilters(queryParams: Record<string, any>): FilterCriteria {
    const filters: FilterCriteria = {};

    // Parse status
    const status = this.parseStatus(queryParams.status);
    if (status) {
      filters.status = status;
    }

    // Parse priority
    const priority = this.parsePriority(queryParams.priority);
    if (priority) {
      filters.priority = priority;
    }

    // Parse date filters
    const createdAfter = this.parseDate(queryParams.created_after);
    if (createdAfter) {
      filters.createdAfter = createdAfter;
    }

    const createdBefore = this.parseDate(queryParams.created_before);
    if (createdBefore) {
      filters.createdBefore = createdBefore;
    }

    const updatedAfter = this.parseDate(queryParams.updated_after);
    if (updatedAfter) {
      filters.updatedAfter = updatedAfter;
    }

    const updatedBefore = this.parseDate(queryParams.updated_before);
    if (updatedBefore) {
      filters.updatedBefore = updatedBefore;
    }

    return filters;
  }

  /**
   * Parse pagination parameters
   * @param queryParams - Raw query parameters
   * @returns Parsed pagination parameters
   */
  private parsePagination(queryParams: Record<string, any>): PaginationParams {
    const pagination: PaginationParams = {};

    const page = this.parseInteger(queryParams.page);
    if (page !== undefined) {
      pagination.page = page;
    }

    const limit = this.parseInteger(queryParams.limit);
    if (limit !== undefined) {
      pagination.limit = limit;
    }

    return pagination;
  }

  /**
   * Parse status parameter
   * @param status - Status parameter value
   * @returns Valid status or undefined
   */
  private parseStatus(status: any): 'completed' | 'pending' | 'all' | undefined {
    if (!status) return undefined;

    // Handle array values (take first element)
    const statusValue = Array.isArray(status) ? status[0] : status;
    
    if (typeof statusValue !== 'string') return undefined;

    const validStatuses = ['completed', 'pending', 'all'];
    return validStatuses.includes(statusValue) ? statusValue as 'completed' | 'pending' | 'all' : undefined;
  }

  /**
   * Parse priority parameter
   * @param priority - Priority parameter value
   * @returns Valid priority or undefined
   */
  private parsePriority(priority: any): Priority | undefined {
    if (!priority) return undefined;

    // Handle array values (take first element)
    const priorityValue = Array.isArray(priority) ? priority[0] : priority;
    
    if (typeof priorityValue !== 'string') return undefined;

    return isPriority(priorityValue) ? priorityValue : undefined;
  }

  /**
   * Parse date parameter
   * @param date - Date parameter value
   * @returns Parsed date or undefined
   */
  private parseDate(date: any): Date | undefined {
    if (!date) return undefined;

    try {
      const dateValue = Array.isArray(date) ? date[0] : date;
      if (typeof dateValue !== 'string') return undefined;

      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    } catch {
      return undefined;
    }
  }

  /**
   * Parse integer parameter
   * @param value - Value to parse as integer
   * @returns Parsed integer or undefined
   */
  private parseInteger(value: any): number | undefined {
    if (value === null || value === undefined) return undefined;

    let numValue: number;
    if (typeof value === 'number') {
      numValue = value;
    } else if (typeof value === 'string') {
      numValue = parseInt(value, 10);
    } else {
      return undefined;
    }

    return isNaN(numValue) ? undefined : numValue;
  }

  /**
   * Validate search query parameter
   * @param q - Search query to validate
   * @param errors - Array to collect errors
   */
  private validateSearchQuery(q: any, errors: string[]): void {
    if (!q) return;

    const queryValue = Array.isArray(q) ? q[0] : q;
    if (typeof queryValue !== 'string') return;

    // Check length
    if (queryValue.length > 100) {
      errors.push('Search query must be 100 characters or less');
    }

    // Check for dangerous characters (basic XSS protection)
    if (/<[^>]*>/.test(queryValue)) {
      errors.push('Search query contains invalid characters');
    }
  }

  /**
   * Validate status parameter
   * @param status - Status to validate
   * @param errors - Array to collect errors
   */
  private validateStatus(status: any, errors: string[]): void {
    if (!status) return;

    const statusValue = Array.isArray(status) ? status[0] : status;
    if (typeof statusValue !== 'string') return;

    const validStatuses = ['completed', 'pending', 'all'];
    if (!validStatuses.includes(statusValue)) {
      errors.push('Status must be one of: completed, pending, all');
    }
  }

  /**
   * Validate priority parameter
   * @param priority - Priority to validate
   * @param errors - Array to collect errors
   */
  private validatePriority(priority: any, errors: string[]): void {
    if (!priority) return;

    const priorityValue = Array.isArray(priority) ? priority[0] : priority;
    if (typeof priorityValue !== 'string') {
      errors.push('Priority must be one of: HIGH, MEDIUM, LOW');
      return;
    }

    if (!isPriority(priorityValue)) {
      errors.push('Priority must be one of: HIGH, MEDIUM, LOW');
    }
  }

  /**
   * Validate date parameters
   * @param queryParams - Query parameters to validate
   * @param errors - Array to collect errors
   */
  private validateDateParameters(queryParams: Record<string, any>, errors: string[]): void {
    const dateFields = [
      { param: 'created_after', name: 'created_after' },
      { param: 'created_before', name: 'created_before' },
      { param: 'updated_after', name: 'updated_after' },
      { param: 'updated_before', name: 'updated_before' }
    ];

    dateFields.forEach(({ param, name }) => {
      const value = queryParams[param];
      if (!value) return;

      const dateValue = Array.isArray(value) ? value[0] : value;
      if (typeof dateValue !== 'string') return;

      try {
        const parsed = new Date(dateValue);
        if (isNaN(parsed.getTime())) {
          errors.push(`${name} must be a valid ISO 8601 date`);
        }
      } catch {
        errors.push(`${name} must be a valid ISO 8601 date`);
      }
    });
  }

  /**
   * Validate pagination parameters
   * @param queryParams - Query parameters to validate
   * @param errors - Array to collect errors
   */
  private validatePagination(queryParams: Record<string, any>, errors: string[]): void {
    // Validate page
    if (queryParams.page !== undefined && queryParams.page !== null) {
      const page = this.parseInteger(queryParams.page);
      if (page === undefined || page < 1) {
        errors.push('Page must be a positive integer');
      }
    }

    // Validate limit
    if (queryParams.limit !== undefined && queryParams.limit !== null) {
      const limit = this.parseInteger(queryParams.limit);
      if (limit === undefined || limit < 1 || limit > 100) {
        errors.push('Limit must be between 1 and 100');
      }
    }
  }

  /**
   * Validate date range logic
   * @param queryParams - Query parameters to validate
   * @param errors - Array to collect errors
   */
  private validateDateRangeLogic(queryParams: Record<string, any>, errors: string[]): void {
    // Validate created date range
    const createdAfter = this.parseDate(queryParams.created_after);
    const createdBefore = this.parseDate(queryParams.created_before);

    if (createdAfter && createdBefore && createdAfter > createdBefore) {
      errors.push('created_after must be before created_before');
    }

    // Validate updated date range
    const updatedAfter = this.parseDate(queryParams.updated_after);
    const updatedBefore = this.parseDate(queryParams.updated_before);

    if (updatedAfter && updatedBefore && updatedAfter > updatedBefore) {
      errors.push('updated_after must be before updated_before');
    }
  }
}