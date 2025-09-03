# ADR-003: Todo Priority System Implementation

## Status
**Proposed** - Awaiting Principal Engineer approval

## Context

The todo application currently lacks a priority system for categorizing tasks by importance/urgency. Users need the ability to:
- Assign priority levels to todos (High, Medium, Low)
- Filter todos by priority level
- Sort todos by priority
- Maintain a sensible default priority for new todos

This enhancement is requested in Issue #5 and must maintain full backward compatibility with the existing API.

## Decision

We will implement a **3-level string enum priority system** with the following characteristics:

### Priority Levels
- **HIGH**: Critical tasks requiring immediate attention
- **MEDIUM**: Standard tasks with normal scheduling (default)
- **LOW**: Nice-to-have tasks that can be deferred

### Technical Implementation
- **String Enum**: `enum TodoPriority { HIGH = 'high', MEDIUM = 'medium', LOW = 'low' }`
- **Default Priority**: `MEDIUM` for both new todos and existing todos during migration
- **API Integration**: Full integration with existing search and filter system
- **Backward Compatibility**: All existing API endpoints continue working without changes

## Alternatives Considered

### 1. Numeric Priority System
```typescript
enum TodoPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3
}
```
**Rejected because:**
- Less intuitive in API responses (users see numbers instead of clear text)
- Requires additional mapping for frontend display
- More error-prone for API consumers

### 2. 4-Level Priority System (Eisenhower Matrix)
```typescript
enum TodoPriority {
  CRITICAL = 'critical',    // Urgent + Important
  HIGH = 'high',           // Important + Not Urgent
  MEDIUM = 'medium',       // Urgent + Not Important  
  LOW = 'low'             // Not Urgent + Not Important
}
```
**Rejected because:**
- Over-engineering for the current use case
- Too complex for typical todo usage patterns
- Can lead to priority inflation and analysis paralysis

### 3. No Default Priority (Required Field)
**Rejected because:**
- Breaks backward compatibility
- Forces users to make priority decisions for every todo
- Adds friction to todo creation process

## Architecture Integration

### Type System Enhancement
```typescript
// New priority enum
export enum TodoPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

// Enhanced Todo interface
export interface Todo {
  id: string;
  title: string;
  description?: string | undefined;
  completed: boolean;
  priority: TodoPriority;  // NEW
  createdAt: Date;
  updatedAt: Date;
}
```

### Search System Integration
The priority system integrates seamlessly with the existing search architecture:

```typescript
// Enhanced search query interface
export interface SearchQuery {
  q?: string;
  status?: 'completed' | 'pending' | 'all';
  priority?: 'high' | 'medium' | 'low' | 'all';  // NEW
  created_after?: string;
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
}

// Enhanced filter criteria
export interface FilterCriteria {
  status?: 'completed' | 'pending' | 'all';
  priority?: TodoPriority | 'all';  // NEW
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
}
```

### Migration Strategy
```typescript
// Automatic migration for existing todos
migrateExistingTodos() {
  this.todos.forEach((todo, id) => {
    if (!todo.priority) {
      todo.priority = TodoPriority.MEDIUM;
      todo.updatedAt = new Date();
    }
  });
}
```

## Implementation Considerations

### Sorting Logic
Priority-aware sorting with fallback to creation date:
```typescript
const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };

todos.sort((a, b) => {
  const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
  if (priorityDiff !== 0) return priorityDiff;
  return b.createdAt.getTime() - a.createdAt.getTime();
});
```

### Validation Strategy
- Priority is optional in all update operations (maintains existing priority if not provided)
- Strict validation for priority values: must be one of 'high', 'medium', 'low'
- Default to 'medium' for new todos when priority not specified

### Performance Impact
- **Minimal storage overhead**: 6-8 additional bytes per todo (string storage)
- **Negligible query performance impact**: Priority filtering uses same patterns as existing status filtering
- **Sorting performance**: O(n log n) with priority comparison - same complexity as current date-based sorting

## Consequences

### Positive
- ✅ **Enhanced User Experience**: Users can prioritize and organize todos effectively
- ✅ **Seamless Integration**: Works naturally with existing search and filter system
- ✅ **Full Backward Compatibility**: No breaking changes to existing API
- ✅ **Intuitive API**: String-based priorities are self-documenting
- ✅ **Extensible**: Can easily add more priority levels in future if needed
- ✅ **TypeScript Safety**: Strong typing prevents invalid priority values

### Negative
- ⚠️ **Minor Storage Increase**: Each todo requires additional priority field storage
- ⚠️ **API Complexity**: Adds another query parameter and response field
- ⚠️ **Migration Requirement**: Existing todos need priority assignment (handled automatically)

### Risks and Mitigation
- **Risk**: Priority inflation (everything becomes high priority)
  - **Mitigation**: Medium default encourages thoughtful priority assignment
- **Risk**: Breaking changes during implementation
  - **Mitigation**: Comprehensive backward compatibility testing
- **Risk**: Performance degradation with complex sorting
  - **Mitigation**: Priority sorting uses same O(n log n) pattern as existing date sorting

## Implementation Verification

### Quality Gates
- [ ] All existing tests continue passing
- [ ] New priority functionality has 95%+ test coverage
- [ ] API documentation updated with priority parameters
- [ ] Migration tested with existing data
- [ ] Performance benchmarks maintained
- [ ] TypeScript compilation clean with strict mode

### Testing Strategy
- **Unit Tests**: Priority enum, model operations, sorting logic
- **Integration Tests**: API endpoints with priority parameters
- **Backward Compatibility Tests**: Existing API calls without priority parameter
- **Migration Tests**: Automatic priority assignment for existing todos

## References
- **Issue**: #5 - Add Priority System for Todos
- **Research Documentation**: GitHub Issue #5 comments
- **Implementation Plan**: GitHub Issue #5 comments
- **Related ADR**: ADR-002 (Search Filter Architecture) - Priority system extends existing filter patterns

---

**Author**: SWE Subagent  
**Date**: 2025-01-03  
**Reviewers**: Principal Engineer (pending)