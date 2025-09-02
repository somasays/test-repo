import React, { useState } from 'react';
import { Check, Edit2, Trash2, Save, X } from 'lucide-react';
import { Todo } from '@/types/todo';
import { useUpdateTodo, useDeleteTodo } from '@/hooks/useTodos';

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');

  const updateTodoMutation = useUpdateTodo();
  const deleteTodoMutation = useDeleteTodo();

  const handleToggleComplete = () => {
    updateTodoMutation.mutate({
      id: todo.id,
      data: { completed: !todo.completed },
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;

    updateTodoMutation.mutate(
      {
        id: todo.id,
        data: {
          title: editTitle.trim(),
          description: editDescription.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      deleteTodoMutation.mutate(todo.id);
    }
  };

  const isLoading = updateTodoMutation.isPending || deleteTodoMutation.isPending;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all ${
      isLoading ? 'opacity-50' : ''
    } ${todo.completed ? 'opacity-75' : ''} animate-fade-in`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggleComplete}
          disabled={isLoading}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            todo.completed
              ? 'bg-success-500 border-success-500 text-white'
              : 'border-gray-300 hover:border-success-500'
          }`}
        >
          {todo.completed && <Check className="w-4 h-4" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                disabled={isLoading}
              />
            </div>
          ) : (
            <div>
              <h3
                className={`font-medium text-gray-900 ${
                  todo.completed ? 'line-through text-gray-500' : ''
                }`}
              >
                {todo.title}
              </h3>
              {todo.description && (
                <p
                  className={`mt-1 text-sm text-gray-600 ${
                    todo.completed ? 'line-through' : ''
                  }`}
                >
                  {todo.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                <span>Created: {new Date(todo.createdAt).toLocaleDateString()}</span>
                {todo.updatedAt !== todo.createdAt && (
                  <span>Updated: {new Date(todo.updatedAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={!editTitle.trim() || isLoading}
                className="p-2 text-success-600 hover:bg-success-50 rounded-md transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                disabled={isLoading}
                className="p-2 text-primary-600 hover:bg-primary-50 rounded-md transition-colors disabled:opacity-50"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="p-2 text-danger-600 hover:bg-danger-50 rounded-md transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};