# ADR-002: Search and Filter Architecture for Todo API

## Status
**Proposed** - Awaiting Principal Engineer Review

## Context

The Todo API currently supports basic CRUD operations and pagination, but lacks search and filter capabilities that would significantly enhance usability. Users need to be able to:

- Search todos by text content (title and description)
- Filter todos by completion status (completed, pending, all)
- Filter todos by creation and update date ranges
- Combine search and filters with existing pagination
- Maintain fast response times for typical usage patterns

The current architecture uses a three-layer pattern (Controller → Service → Model) with in-memory storage via JavaScript Map. The solution must maintain backward compatibility and follow established patterns in the codebase.

## Decision Drivers

### Technical Requirements
- **Performance**: Sub-100ms response time for typical queries
- **Scalability**: Support for datasets up to 1,000 todos efficiently
- **Maintainability**: Leverage existing architecture patterns
- **Backward Compatibility**: All existing API behavior must be preserved
- **Zero Dependencies**: Avoid external search libraries for simplicity

### Business Requirements
- **User Experience**: Intuitive search and filter interface
- **API Consistency**: Follow established REST API conventions
- **Development Velocity**: Minimize implementation complexity
- **Future Extensibility**: Foundation for advanced search features

### Constraints
- **In-Memory Storage**: Current data persistence model must be maintained
- **Single-Node Deployment**: No distributed system complexity
- **Resource Limits**: Typical Node.js memory and CPU constraints
- **Development Time**: Implementation must be feasible within sprint constraints

## Decision

### High-Level Architecture

We will implement a **modular search and filter system** that extends the existing three-layer architecture without breaking changes:

```
┌─────────────────────────────────────────────────────────┐
│                    Controller Layer                     │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │   Validation    │    │     todoController.ts       │ │
│  │   Middleware    │    │   (getAllTodos extended)    │ │
│  └─────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                                 │
                    ┌─────────────────────────────┐
                    │       Service Layer         │
                    │    todoService.ts           │
                    │  ┌─────────────────────────┐ │
                    │  │ searchAndFilterTodos()  │ │
                    │  └─────────────────────────┘ │
                    └─────────────────────────────┘
                                 │
      ┌──────────────────────────┼──────────────────────────┐
      │                          │                          │
┌─────────────┐        ┌─────────────┐        ┌─────────────┐
│SearchEngine │        │FilterEngine │        │QueryParser  │
│   Module    │        │   Module    │        │   Module    │
└─────────────┘        └─────────────┘        └─────────────┘
      │                          │                          │
      └──────────────────────────┼──────────────────────────┘
                                 │
                    ┌─────────────────────────────┐
                    │        Model Layer          │
                    │      todoModel.ts           │
                    │   (unchanged interface)     │
                    └─────────────────────────────┘
```

### Core Architectural Decisions

## 1. Search Algorithm: Custom In-Memory Implementation

**Decision**: Implement custom text search using native JavaScript string operations rather than external libraries.

**Rationale**:
- **Zero Dependencies**: Maintains simplicity and reduces security/maintenance overhead
- **Performance**: String.includes() is optimized in V8 engine for our use case
- **Control**: Full control over search behavior and future enhancements
- **Size**: Current and projected dataset sizes (< 1,000 items) don't require sophisticated indexing

**Algorithm Details**:
```typescript
// Multi-field, multi-word AND search
search(todos: Todo[], query: string): Todo[] {
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/);
  
  return todos.filter(todo => {
    const searchableText = [
      todo.title.toLowerCase(),
      (todo.description || '').toLowerCase()
    ].join(' ');
    
    // All query words must be present (AND logic)
    return queryWords.every(word => 
      searchableText.includes(word)
    );
  });
}
```

**Trade-offs**:
- ✅ Simple, fast, no dependencies
- ✅ Predictable performance characteristics
- ✅ Easy to debug and modify
- ❌ No advanced features (fuzzy matching, stemming, relevance scoring)
- ❌ Linear O(n*m) complexity (acceptable for our dataset size)

**Alternatives Considered**:
- **FlexSearch Library**: Rejected due to dependency management overhead
- **ElasticSearch**: Rejected as overkill for current requirements
- **Trie-based Index**: Rejected as premature optimization

## 2. Query Parameter Design: REST API Conventions

**Decision**: Use standard query parameters following established REST API conventions from major platforms (GitHub, Stripe, Atlassian).

**API Design**:
```
GET /api/todos?q=meeting&status=pending&created_after=2024-01-01&page=2&limit=5
```

**Parameter Specification**:
- `q`: Text search query (searches title and description)
- `status`: Completion status filter (`completed`, `pending`, `all`)
- `created_after`/`created_before`: Date range filters (ISO 8601 format)
- `updated_after`/`updated_before`: Date range filters (ISO 8601 format)
- `page`/`limit`: Existing pagination (unchanged)

**Rationale**:
- **Industry Standard**: Follows conventions from GitHub API, Stripe API
- **Intuitive**: Parameter names are self-explanatory
- **Extensible**: Easy to add new filter parameters in the future
- **Compatible**: Works with existing pagination without conflicts

**Validation Strategy**:
```typescript
export const validateSearch = [
  query('q').optional().trim().isLength({ min: 1, max: 100 }),
  query('status').optional().isIn(['completed', 'pending', 'all']),
  query('created_after').optional().isISO8601(),
  query('created_before').optional().isISO8601(),
  // Custom validator for date range logic
  query(['created_after', 'created_before']).custom((value, { req }) => {
    const after = req.query.created_after;
    const before = req.query.created_before;
    if (after && before && new Date(after) >= new Date(before)) {
      throw new Error('created_after must be before created_before');
    }
    return true;
  })
];
```

**Trade-offs**:
- ✅ Follows established conventions
- ✅ Easy to understand and use
- ✅ Extensible for future features
- ✅ Compatible with existing patterns
- ❌ Limited to simple filtering (no complex queries)
- ❌ URL length limits for complex queries

**Alternatives Considered**:
- **JSON in Query String**: Rejected due to URL encoding complexity
- **POST with Query Body**: Rejected as non-RESTful for search operations
- **GraphQL-style Queries**: Rejected as too complex for requirements

## 3. Response Format: Extended Compatibility

**Decision**: Extend existing response format with optional fields for search metadata while maintaining complete backward compatibility.

**Current Response Format** (unchanged):
```typescript
interface TodoListResponse {
  todos: TodoResponse[];
  total: number;
  page: number;
  limit: number;
}
```

**Extended Response Format**:
```typescript
interface EnhancedTodoListResponse extends TodoListResponse {
  filtered?: number;    // Total matching items before pagination
  query?: {             // Echo search parameters used
    q?: string;
    status?: string;
    created_after?: string;
    created_before?: string;
    updated_after?: string;
    updated_before?: string;
  };
}
```

**Rationale**:
- **Backward Compatibility**: Existing clients continue working unchanged
- **Search Transparency**: Users can see what filters were applied
- **Pagination Context**: `filtered` count helps with pagination logic
- **Debugging Aid**: Query echo helps with API debugging

**Implementation Strategy**:
```typescript
// Only add search metadata when search/filter parameters used
if (hasSearchOrFilterParams) {
  return {
    ...basicResponse,
    filtered: totalMatchingResults,
    query: appliedFilters
  };
} else {
  return basicResponse; // Unchanged for existing clients
}
```

**Trade-offs**:
- ✅ Complete backward compatibility
- ✅ Enhanced functionality for new clients
- ✅ Clear search result metadata
- ❌ Slightly larger response payload when filtering
- ❌ Conditional response format complexity

## 4. Modular Architecture: Separation of Concerns

**Decision**: Implement search and filter functionality as separate, composable modules within the existing service layer.

**Module Structure**:
```
src/search/
├── searchEngine.ts     # Text search implementation
├── filterEngine.ts     # Status and date filtering
├── queryParser.ts      # Query parameter parsing/validation
└── types.ts           # Search-specific type definitions
```

**Interface Design**:
```typescript
// Clean, testable interfaces
interface SearchEngine {
  search(items: Todo[], query: string, options: SearchOptions): Todo[];
}

interface FilterEngine {
  filter(items: Todo[], criteria: FilterCriteria): Todo[];
}

interface QueryParser {
  parse(queryParams: Record<string, any>): ParsedQuery;
}
```

**Integration Pattern**:
```typescript
// Service layer orchestrates modules
async searchAndFilterTodos(queryParams: any, page: number, limit: number) {
  const parsedQuery = this.queryParser.parse(queryParams);
  let { todos } = await todoModel.findAll();
  
  if (parsedQuery.searchQuery) {
    todos = this.searchEngine.search(todos, parsedQuery.searchQuery);
  }
  
  todos = this.filterEngine.filter(todos, parsedQuery.filters);
  
  // Apply pagination to filtered results
  return this.paginateResults(todos, page, limit);
}
```

**Rationale**:
- **Testability**: Each module can be unit tested independently
- **Maintainability**: Clear separation of search, filter, and parsing logic
- **Reusability**: Modules can be used in different combinations
- **Extensibility**: Easy to add new search engines or filter types

**Trade-offs**:
- ✅ Clean separation of concerns
- ✅ Highly testable architecture
- ✅ Easy to extend and maintain
- ✅ Follows existing codebase patterns
- ❌ Slightly more complex file structure
- ❌ Additional abstraction layers

**Alternatives Considered**:
- **Monolithic Service Method**: Rejected due to testing and maintenance complexity
- **External Search Service**: Rejected as overkill for current requirements
- **Database-level Search**: Not applicable with current in-memory storage

## 5. Performance Strategy: In-Memory Optimization

**Decision**: Optimize for in-memory operations with current dataset characteristics rather than implementing complex indexing or caching.

**Performance Approach**:
```typescript
class PerformanceOptimizedService {
  // Measure and log slow operations
  async searchAndFilterTodos(params: any, page: number, limit: number) {
    const startTime = performance.now();
    
    try {
      const result = await this.executeSearchAndFilter(params, page, limit);
      
      const duration = performance.now() - startTime;
      if (duration > 100) {
        console.warn(`Slow search operation: ${duration}ms for query:`, params);
      }
      
      return result;
    } catch (error) {
      console.error('Search operation failed:', error);
      throw error;
    }
  }
  
  // Graceful degradation for performance issues
  private async executeSearchAndFilter(params: any, page: number, limit: number) {
    try {
      return await this.fullSearchAndFilter(params, page, limit);
    } catch (error) {
      if (error instanceof PerformanceTimeoutError) {
        // Fall back to basic filtering without text search
        return await this.basicFilterOnly(params, page, limit);
      }
      throw error;
    }
  }
}
```

**Expected Performance Characteristics**:
- **Typical Query**: < 50ms for 1,000 todos
- **Complex Query**: < 100ms for multi-field search with filters
- **Memory Usage**: < 2MB additional for search indices
- **Concurrent Requests**: 100+ concurrent search operations

**Monitoring Strategy**:
- Log operations exceeding 100ms threshold
- Monitor memory usage trends
- Alert on error rates > 2%
- Track search result quality (zero-result queries)

**Rationale**:
- **Current Scale**: In-memory operations are optimal for < 1,000 items
- **Simplicity**: No complex caching or indexing infrastructure
- **Predictability**: Linear performance characteristics are acceptable
- **Reliability**: Fewer moving parts means fewer failure modes

**Trade-offs**:
- ✅ Simple, predictable performance
- ✅ No external dependencies or infrastructure
- ✅ Easy to debug and optimize
- ❌ Performance degrades linearly with dataset size
- ❌ No advanced optimization techniques (indexing, caching)

**Future Scalability Plan**:
- **Phase 1**: Monitor performance with real usage patterns
- **Phase 2**: Implement query result caching if needed
- **Phase 3**: Consider database integration for larger datasets
- **Phase 4**: External search engine (ElasticSearch) for advanced features

## 6. Error Handling Strategy: Graceful Degradation

**Decision**: Implement comprehensive error handling with graceful degradation rather than failing fast on search operations.

**Error Handling Levels**:
```typescript
// Level 1: Input Validation (400 Bad Request)
const validateSearchParams = (params: any): ValidationResult => {
  if (params.q && params.q.length > 100) {
    throw new ValidationError('Search query too long (max 100 characters)');
  }
  
  if (params.created_after && !isValidDate(params.created_after)) {
    throw new ValidationError('Invalid date format for created_after');
  }
  
  // Additional validation...
};

// Level 2: Operation Timeout (408 Request Timeout)
const timeoutWrapper = async <T>(
  operation: () => Promise<T>, 
  timeoutMs: number = 5000
): Promise<T> => {
  return Promise.race([
    operation(),
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new TimeoutError()), timeoutMs)
    )
  ]);
};

// Level 3: Graceful Degradation
const executeSearch = async (params: SearchParams): Promise<Todo[]> => {
  try {
    return await this.fullTextSearch(params);
  } catch (error) {
    if (error instanceof PerformanceError) {
      console.warn('Full-text search failed, falling back to simple search');
      return await this.simpleSearch(params);
    }
    throw error;
  }
};
```

**Error Categories and Responses**:
- **Validation Errors**: 400 Bad Request with detailed message
- **Performance Timeouts**: 408 Request Timeout with retry suggestion
- **System Errors**: 500 Internal Server Error with generic message
- **Degraded Performance**: 200 OK with warning header

**Rationale**:
- **User Experience**: Partial results better than complete failure
- **System Reliability**: Prevent search failures from affecting other operations
- **Debugging**: Comprehensive error logging for troubleshooting
- **Monitoring**: Error metrics for system health

**Trade-offs**:
- ✅ Robust error handling and recovery
- ✅ Good user experience even during failures
- ✅ Comprehensive error logging for debugging
- ❌ Additional complexity in error handling logic
- ❌ Potential for hiding underlying performance issues

## Implementation Timeline and Risk Mitigation

### Phase 1: Core Infrastructure (Week 1)
- **Deliverables**: SearchEngine, FilterEngine, QueryParser modules
- **Risk Mitigation**: Comprehensive unit tests, performance benchmarks
- **Success Criteria**: All modules pass tests, meet performance targets

### Phase 2: API Integration (Week 2)
- **Deliverables**: Controller updates, validation middleware, type definitions
- **Risk Mitigation**: Integration tests, backward compatibility verification
- **Success Criteria**: Existing API behavior unchanged, new features functional

### Phase 3: Testing and Optimization (Week 3)
- **Deliverables**: Performance testing, error handling, documentation
- **Risk Mitigation**: Load testing, monitoring setup, rollback plan
- **Success Criteria**: Performance targets met, comprehensive test coverage

### Rollback Plan
If critical issues arise during deployment:
1. **Feature Flag Disable**: Turn off search features via environment variable
2. **Code Rollback**: Revert to previous version if necessary  
3. **Graceful Degradation**: Return to basic pagination-only behavior
4. **Data Integrity**: No risk to existing todo data (read-only operations)

## Monitoring and Success Metrics

### Performance Metrics
- **Response Time**: P95 < 100ms, P99 < 200ms
- **Error Rate**: < 1% of search requests
- **Memory Usage**: Baseline + < 50MB for search operations
- **CPU Usage**: < 10% additional CPU load

### Usage Metrics  
- **Adoption Rate**: % of requests using search/filter parameters
- **Search Success Rate**: % of searches returning results
- **Query Patterns**: Most common search terms and filters
- **Performance Distribution**: Response time percentiles

### Quality Metrics
- **Test Coverage**: > 90% for search functionality
- **Bug Rate**: < 1 bug per 1000 search operations
- **User Satisfaction**: Feedback on search result relevance
- **System Stability**: No regressions in existing functionality

## Future Considerations

### Planned Enhancements
- **Fuzzy Search**: Levenshtein distance for typo tolerance
- **Relevance Scoring**: Rank results by match quality
- **Search Suggestions**: Auto-complete functionality
- **Advanced Filters**: Date presets, custom fields

### Architectural Evolution
- **Database Integration**: Move to persistent storage for larger datasets
- **Microservice Split**: Separate search service for scalability
- **External Search**: ElasticSearch for advanced search capabilities
- **Caching Layer**: Redis for query result caching

### Technical Debt Considerations
- **Search Index Management**: Consider pre-computed indices for large datasets
- **Query Optimization**: Implement query cost analysis and optimization
- **Memory Management**: Monitor and optimize memory usage patterns
- **Performance Profiling**: Regular performance analysis and optimization

## Conclusion

This architecture decision provides a foundation for robust search and filter functionality that:

1. **Maintains Simplicity**: Leverages existing patterns and avoids unnecessary complexity
2. **Ensures Performance**: Optimized for current dataset size and usage patterns  
3. **Preserves Compatibility**: No breaking changes to existing API behavior
4. **Enables Growth**: Provides foundation for future advanced search features
5. **Reduces Risk**: Comprehensive error handling and graceful degradation

The modular design ensures testability and maintainability while the performance-focused approach provides a responsive user experience. The decision to implement custom search logic rather than external libraries reduces dependencies and maintenance overhead while meeting current requirements.

**Key Success Factors**:
- Thorough testing at all levels (unit, integration, performance)
- Comprehensive monitoring and alerting
- Phased rollout with rollback capability
- Regular performance analysis and optimization

**Next Steps**:
1. Principal Engineer review and approval
2. Detailed implementation planning
3. Development phase execution
4. Testing and validation
5. Monitored production deployment

This ADR will be updated as implementation progresses and new considerations emerge.