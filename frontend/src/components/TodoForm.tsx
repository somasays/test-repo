import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCreateTodo } from '@/hooks/useTodos';

interface TodoFormProps {
  className?: string;
}

export const TodoForm: React.FC<TodoFormProps> = ({ className = '' }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);

  const createTodoMutation = useCreateTodo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    createTodoMutation.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          setShowDescription(false);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            disabled={createTodoMutation.isPending}
          />
          
          {showDescription && (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              rows={3}
              className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
              disabled={createTodoMutation.isPending}
            />
          )}
        </div>
        
        <button
          type="submit"
          disabled={!title.trim() || createTodoMutation.isPending}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {createTodoMutation.isPending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          Add
        </button>
      </div>
      
      {!showDescription && (
        <button
          type="button"
          onClick={() => setShowDescription(true)}
          className="mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Add description
        </button>
      )}
      
      {showDescription && (
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => {
              setShowDescription(false);
              setDescription('');
            }}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Remove description
          </button>
        </div>
      )}
    </form>
  );
};