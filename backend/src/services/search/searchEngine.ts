import { Todo } from '../../types/todo.js';
import { SearchOptions } from '../../types/search.js';

export class SearchEngine {
  /**
   * Search todos based on query string and options
   * @param todos - Array of todos to search
   * @param query - Search query string
   * @param options - Search configuration options
   * @returns Filtered array of todos matching the search criteria
   */
  search(todos: Todo[], query: string, options: SearchOptions): Todo[] {
    // Handle empty query - return all todos
    if (!query || query.trim() === '') {
      return todos;
    }

    // Handle empty todo array
    if (!todos || todos.length === 0) {
      return [];
    }

    // Normalize and parse query
    const normalizedQuery = this.normalizeQuery(query, options);
    const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 0);

    // If no valid query words after normalization, return all todos
    if (queryWords.length === 0) {
      return todos;
    }

    // Filter todos based on search criteria
    return todos.filter(todo => {
      const searchableText = this.buildSearchableText(todo, options);
      
      // All query words must be found (AND logic)
      return queryWords.every(word => searchableText.includes(word));
    });
  }

  /**
   * Normalize search query based on options
   * @param query - Raw search query
   * @param options - Search options
   * @returns Normalized query string
   */
  private normalizeQuery(query: string, options: SearchOptions): string {
    let normalized = query.trim();
    
    if (!options.caseSensitive) {
      normalized = normalized.toLowerCase();
    }
    
    return normalized;
  }

  /**
   * Build searchable text from todo based on specified fields
   * @param todo - Todo object to extract text from
   * @param options - Search options specifying which fields to include
   * @returns Combined searchable text from specified fields
   */
  private buildSearchableText(todo: Todo, options: SearchOptions): string {
    const textParts: string[] = [];

    options.fields.forEach(field => {
      const value = todo[field];
      if (value !== undefined && value !== null) {
        const stringValue = String(value);
        textParts.push(options.caseSensitive ? stringValue : stringValue.toLowerCase());
      }
    });

    return textParts.join(' ');
  }
}