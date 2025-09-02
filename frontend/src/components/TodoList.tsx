import React, { useState } from 'react';
import { CheckSquare, Trash2, RefreshCw } from 'lucide-react';
import { useTodos, useDeleteCompletedTodos, useMarkAllCompleted } from '@/hooks/useTodos';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  className?: string;
}

type FilterType = 'all' | 'active' | 'completed';

export const TodoList: React.FC<TodoListProps> = ({ className = '' }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error, refetch } = useTodos(page, limit);
  const deleteCompletedMutation = useDeleteCompletedTodos();
  const markAllCompletedMutation = useMarkAllCompleted();

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setPage(1); // Reset to first page when changing filter
  };

  const handleDeleteCompleted = () => {
    if (!data?.todos.some(todo => todo.completed)) return;
    
    if (window.confirm('Are you sure you want to delete all completed todos?')) {
      deleteCompletedMutation.mutate();
    }
  };

  const handleMarkAllCompleted = () => {
    if (!data?.todos.some(todo => !todo.completed)) return;
    
    markAllCompletedMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load todos</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const todos = data?.todos || [];
  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      default:
        return true;
    }
  });

  const hasCompletedTodos = todos.some(todo => todo.completed);
  const hasActiveTodos = todos.some(todo => !todo.completed);

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header with filters and actions */}
      {todos.length > 0 && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Filter tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['all', 'active', 'completed'] as FilterType[]).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => handleFilterChange(filterType)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === filterType
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  {filterType === 'all' && (
                    <span className="ml-1 text-xs text-gray-500">({todos.length})</span>
                  )}
                  {filterType === 'active' && (
                    <span className="ml-1 text-xs text-gray-500">
                      ({todos.filter(t => !t.completed).length})
                    </span>
                  )}
                  {filterType === 'completed' && (
                    <span className="ml-1 text-xs text-gray-500">
                      ({todos.filter(t => t.completed).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Bulk actions */}
            <div className="flex gap-2">
              {hasActiveTodos && (
                <button
                  onClick={handleMarkAllCompleted}
                  disabled={markAllCompletedMutation.isPending}
                  className="px-4 py-2 bg-success-500 text-white rounded-lg hover:bg-success-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {markAllCompletedMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckSquare className="w-4 h-4" />
                  )}
                  Mark All Done
                </button>
              )}
              
              {hasCompletedTodos && (
                <button
                  onClick={handleDeleteCompleted}
                  disabled={deleteCompletedMutation.isPending}
                  className="px-4 py-2 bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {deleteCompletedMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Clear Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Todo list */}
      <div className="p-6">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-12">
            {todos.length === 0 ? (
              <div>
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No todos yet</h3>
                <p className="text-gray-500">Create your first todo to get started!</p>
              </div>
            ) : (
              <div>
                <div className="text-6xl mb-4">
                  {filter === 'completed' ? '✅' : '📋'}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {filter} todos
                </h3>
                <p className="text-gray-500">
                  {filter === 'completed'
                    ? 'Complete some todos to see them here!'
                    : 'All your todos are completed! 🎉'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.total > limit && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {Math.min((page - 1) * limit + 1, data.total)} to{' '}
              {Math.min(page * limit, data.total)} of {data.total} todos
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <span className="px-3 py-2 text-sm text-gray-900">
                Page {page} of {Math.ceil(data.total / limit)}
              </span>
              
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(data.total / limit)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};