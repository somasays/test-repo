import { NextFunction } from 'express';
import { todoService } from '../services/todoService.js';
import { 
  TypedRequest, 
  TypedResponse, 
  PaginatedRequest 
} from '../types/express.js';
import { 
  CreateTodoRequest, 
  UpdateTodoRequest, 
  ApiResponse, 
  TodoResponse, 
  TodoListResponse 
} from '../types/todo.js';
import { createNotFoundError } from '../utils/appError.js';

export class TodoController {
  async getAllTodos(
    req: PaginatedRequest,
    res: TypedResponse<ApiResponse<TodoListResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 10;

      const result = await todoService.getAllTodos(page, limit);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Todos retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getTodoById(
    req: TypedRequest,
    res: TypedResponse<ApiResponse<TodoResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const todo = await todoService.getTodoById(id);

      if (!todo) {
        throw createNotFoundError('Todo', id);
      }

      res.status(200).json({
        success: true,
        data: todo,
        message: 'Todo retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async createTodo(
    req: TypedRequest<CreateTodoRequest>,
    res: TypedResponse<ApiResponse<TodoResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const todoData = req.body;
      const newTodo = await todoService.createTodo(todoData);

      res.status(201).json({
        success: true,
        data: newTodo,
        message: 'Todo created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTodo(
    req: TypedRequest<UpdateTodoRequest>,
    res: TypedResponse<ApiResponse<TodoResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedTodo = await todoService.updateTodo(id, updateData);

      res.status(200).json({
        success: true,
        data: updatedTodo,
        message: 'Todo updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTodo(
    req: TypedRequest,
    res: TypedResponse<ApiResponse<null>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await todoService.deleteTodo(id);

      res.status(200).json({
        success: true,
        message: 'Todo deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCompletedTodos(
    _req: TypedRequest,
    res: TypedResponse<ApiResponse<{ deletedCount: number }>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await todoService.deleteCompletedTodos();

      res.status(200).json({
        success: true,
        data: result,
        message: `${result.deletedCount} completed todos deleted successfully`
      });
    } catch (error) {
      next(error);
    }
  }

  async getTodoStats(
    _req: TypedRequest,
    res: TypedResponse<ApiResponse<{ total: number; completed: number; pending: number }>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await todoService.getTodoStats();

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Todo stats retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllCompleted(
    _req: TypedRequest,
    res: TypedResponse<ApiResponse<{ updatedCount: number }>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await todoService.markAllCompleted();

      res.status(200).json({
        success: true,
        data: result,
        message: `${result.updatedCount} todos marked as completed`
      });
    } catch (error) {
      next(error);
    }
  }
}

export const todoController = new TodoController();