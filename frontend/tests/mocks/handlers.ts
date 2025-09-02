import { http, HttpResponse } from 'msw';
import { Todo, CreateTodoRequest, TodoListResponse, TodoStats } from '@/types/todo';

// Mock data
let mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Learn React',
    description: 'Study React fundamentals and hooks',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Build Todo App',
    description: 'Create a full-stack todo application',
    completed: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const handlers = [
  // Get todos
  http.get('/api/todos', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTodos = mockTodos.slice(startIndex, endIndex);

    const response: TodoListResponse = {
      todos: paginatedTodos,
      total: mockTodos.length,
      page,
      limit,
    };

    return HttpResponse.json({
      success: true,
      data: response,
      message: 'Todos retrieved successfully',
    });
  }),

  // Get todo by ID
  http.get('/api/todos/:id', ({ params }) => {
    const todo = mockTodos.find(t => t.id === params.id);
    
    if (!todo) {
      return HttpResponse.json(
        {
          success: false,
          error: `Todo with id ${params.id} not found`,
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: todo,
      message: 'Todo retrieved successfully',
    });
  }),

  // Create todo
  http.post('/api/todos', async ({ request }) => {
    const todoData = await request.json() as CreateTodoRequest;
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      title: todoData.title,
      description: todoData.description,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockTodos.unshift(newTodo);

    return HttpResponse.json({
      success: true,
      data: newTodo,
      message: 'Todo created successfully',
    }, { status: 201 });
  }),

  // Update todo
  http.put('/api/todos/:id', async ({ params, request }) => {
    const updateData = await request.json();
    const todoIndex = mockTodos.findIndex(t => t.id === params.id);
    
    if (todoIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: `Todo with id ${params.id} not found`,
        },
        { status: 404 }
      );
    }

    const updatedTodo: Todo = {
      ...mockTodos[todoIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    mockTodos[todoIndex] = updatedTodo;

    return HttpResponse.json({
      success: true,
      data: updatedTodo,
      message: 'Todo updated successfully',
    });
  }),

  // Delete todo
  http.delete('/api/todos/:id', ({ params }) => {
    const todoIndex = mockTodos.findIndex(t => t.id === params.id);
    
    if (todoIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: `Todo with id ${params.id} not found`,
        },
        { status: 404 }
      );
    }

    mockTodos.splice(todoIndex, 1);

    return HttpResponse.json({
      success: true,
      message: 'Todo deleted successfully',
    });
  }),

  // Get stats
  http.get('/api/todos/stats', () => {
    const stats: TodoStats = {
      total: mockTodos.length,
      completed: mockTodos.filter(t => t.completed).length,
      pending: mockTodos.filter(t => !t.completed).length,
    };

    return HttpResponse.json({
      success: true,
      data: stats,
      message: 'Todo stats retrieved successfully',
    });
  }),

  // Delete completed todos
  http.delete('/api/todos/completed/all', () => {
    const completedCount = mockTodos.filter(t => t.completed).length;
    mockTodos = mockTodos.filter(t => !t.completed);

    return HttpResponse.json({
      success: true,
      data: { deletedCount: completedCount },
      message: `${completedCount} completed todos deleted successfully`,
    });
  }),

  // Mark all as completed
  http.put('/api/todos/completed/all', () => {
    const pendingTodos = mockTodos.filter(t => !t.completed);
    const updatedCount = pendingTodos.length;

    mockTodos = mockTodos.map(todo => ({
      ...todo,
      completed: true,
      updatedAt: new Date().toISOString(),
    }));

    return HttpResponse.json({
      success: true,
      data: { updatedCount },
      message: `${updatedCount} todos marked as completed`,
    });
  }),
];