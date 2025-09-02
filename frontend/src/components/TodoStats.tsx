import React from 'react';
import { CheckCircle, Circle, BarChart3 } from 'lucide-react';
import { useTodoStats } from '@/hooks/useTodos';

export const TodoStats: React.FC = () => {
  const { data: stats, isLoading, error } = useTodoStats();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          Failed to load statistics
        </div>
      </div>
    );
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-primary-500" />
        <h2 className="text-lg font-semibold text-gray-900">Todo Statistics</h2>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Circle className="w-5 h-5 text-gray-400" />
            <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
          </div>
          <p className="text-sm text-gray-600">Total</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-success-500" />
            <span className="text-2xl font-bold text-success-600">{stats.completed}</span>
          </div>
          <p className="text-sm text-gray-600">Completed</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Circle className="w-5 h-5 text-warning-500" />
            <span className="text-2xl font-bold text-warning-600">{stats.pending}</span>
          </div>
          <p className="text-sm text-gray-600">Pending</p>
        </div>
      </div>

      {stats.total > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Completion Rate</span>
            <span className="text-sm font-medium text-gray-900">{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-success-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      )}

      {stats.total === 0 && (
        <div className="text-center text-gray-500 py-4">
          No todos yet. Create one to get started!
        </div>
      )}
    </div>
  );
};