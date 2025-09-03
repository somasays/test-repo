import { Todo, Priority } from '../../types/todo.js';
import { FilterCriteria, ValidationResult } from '../../types/search.js';

export class FilterEngine {
  /**
   * Filter todos based on criteria
   * @param todos - Array of todos to filter
   * @param criteria - Filter criteria to apply
   * @returns Filtered array of todos matching the criteria
   */
  filter(todos: Todo[], criteria: FilterCriteria): Todo[] {
    if (!todos || todos.length === 0) {
      return [];
    }

    let filteredTodos = todos;

    // Apply status filter
    if (criteria.status && criteria.status !== 'all') {
      filteredTodos = this.filterByStatus(filteredTodos, criteria.status);
    }

    // Apply priority filter
    if (criteria.priority) {
      filteredTodos = this.filterByPriority(filteredTodos, criteria.priority);
    }

    // Apply created date filters
    if (criteria.createdAfter || criteria.createdBefore) {
      filteredTodos = this.filterByDateRange(
        filteredTodos,
        'createdAt',
        criteria.createdAfter,
        criteria.createdBefore
      );
    }

    // Apply updated date filters
    if (criteria.updatedAfter || criteria.updatedBefore) {
      filteredTodos = this.filterByDateRange(
        filteredTodos,
        'updatedAt',
        criteria.updatedAfter,
        criteria.updatedBefore
      );
    }

    return filteredTodos;
  }

  /**
   * Validate filter criteria
   * @param criteria - Filter criteria to validate
   * @returns Validation result indicating if criteria is valid
   */
  validateCriteria(criteria: FilterCriteria): ValidationResult {
    const errors: string[] = [];

    // Validate created date range
    if (criteria.createdAfter && criteria.createdBefore) {
      if (criteria.createdAfter > criteria.createdBefore) {
        errors.push('createdAfter must be before createdBefore');
      }
    }

    // Validate updated date range
    if (criteria.updatedAfter && criteria.updatedBefore) {
      if (criteria.updatedAfter > criteria.updatedBefore) {
        errors.push('updatedAfter must be before updatedBefore');
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Filter todos by completion status
   * @param todos - Todos to filter
   * @param status - Status to filter by
   * @returns Filtered todos
   */
  private filterByStatus(todos: Todo[], status: 'completed' | 'pending'): Todo[] {
    return todos.filter(todo => {
      switch (status) {
        case 'completed':
          return todo.completed;
        case 'pending':
          return !todo.completed;
        default:
          return true;
      }
    });
  }

  /**
   * Filter todos by priority
   * @param todos - Todos to filter
   * @param priority - Priority to filter by
   * @returns Filtered todos
   */
  private filterByPriority(todos: Todo[], priority: Priority): Todo[] {
    return todos.filter(todo => {
      return todo.priority === priority;
    });
  }

  /**
   * Filter todos by date range
   * @param todos - Todos to filter
   * @param field - Date field to filter on ('createdAt' or 'updatedAt')
   * @param after - Filter for dates after this value
   * @param before - Filter for dates before this value
   * @returns Filtered todos
   */
  private filterByDateRange(
    todos: Todo[],
    field: 'createdAt' | 'updatedAt',
    after?: Date,
    before?: Date
  ): Todo[] {
    return todos.filter(todo => {
      const todoDate = todo[field];
      let matches = true;

      if (after && todoDate < after) {
        matches = false;
      }

      if (before && todoDate > before) {
        matches = false;
      }

      return matches;
    });
  }
}