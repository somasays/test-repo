import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { todoApi } from '@/services/api';
import { CreateTodoRequest, UpdateTodoRequest } from '@/types/todo';
import toast from 'react-hot-toast';

// Query keys for consistent cache management
export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...todoKeys.lists(), page, limit] as const,
  detail: (id: string) => [...todoKeys.all, 'detail', id] as const,
  stats: () => [...todoKeys.all, 'stats'] as const,
};

export const useTodos = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: todoKeys.list(page, limit),
    queryFn: () => todoApi.getTodos(page, limit),
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useTodo = (id: string) => {
  return useQuery({
    queryKey: todoKeys.detail(id),
    queryFn: () => todoApi.getTodoById(id),
    enabled: !!id,
  });
};

export const useTodoStats = () => {
  return useQuery({
    queryKey: todoKeys.stats(),
    queryFn: todoApi.getTodoStats,
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (todoData: CreateTodoRequest) => todoApi.createTodo(todoData),
    onSuccess: () => {
      // Invalidate and refetch todos list and stats
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoKeys.stats() });
      toast.success('Todo created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create todo');
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoRequest }) =>
      todoApi.updateTodo(id, data),
    onSuccess: (updatedTodo) => {
      // Update the specific todo in cache
      queryClient.setQueryData(todoKeys.detail(updatedTodo.id), updatedTodo);
      
      // Update the todo in lists cache
      queryClient.setQueriesData(
        { queryKey: todoKeys.lists() },
        (oldData: any) => {
          if (!oldData?.todos) return oldData;
          
          return {
            ...oldData,
            todos: oldData.todos.map((todo: any) =>
              todo.id === updatedTodo.id ? updatedTodo : todo
            ),
          };
        }
      );

      // Invalidate stats to reflect changes
      queryClient.invalidateQueries({ queryKey: todoKeys.stats() });
      
      toast.success('Todo updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update todo');
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => todoApi.deleteTodo(id),
    onSuccess: (_, deletedId) => {
      // Remove todo from lists cache
      queryClient.setQueriesData(
        { queryKey: todoKeys.lists() },
        (oldData: any) => {
          if (!oldData?.todos) return oldData;
          
          return {
            ...oldData,
            todos: oldData.todos.filter((todo: any) => todo.id !== deletedId),
            total: oldData.total - 1,
          };
        }
      );

      // Remove from detail cache
      queryClient.removeQueries({ queryKey: todoKeys.detail(deletedId) });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: todoKeys.stats() });
      
      toast.success('Todo deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete todo');
    },
  });
};

export const useDeleteCompletedTodos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: todoApi.deleteCompletedTodos,
    onSuccess: (result) => {
      // Invalidate and refetch all queries
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
      
      toast.success(`${result.deletedCount} completed todos deleted!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete completed todos');
    },
  });
};

export const useMarkAllCompleted = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: todoApi.markAllCompleted,
    onSuccess: (result) => {
      // Invalidate and refetch all queries
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
      
      toast.success(`${result.updatedCount} todos marked as completed!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark all as completed');
    },
  });
};