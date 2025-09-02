import { Router } from 'express';
import { todoController } from '../controllers/todoController.js';
import { 
  validateCreateTodo, 
  validateUpdateTodo, 
  validatePagination, 
  handleValidationErrors 
} from '../middleware/validation.js';

const router = Router();

// GET /api/todos - Get all todos with pagination
router.get(
  '/',
  validatePagination,
  handleValidationErrors,
  todoController.getAllTodos.bind(todoController)
);

// GET /api/todos/stats - Get todo statistics
router.get(
  '/stats',
  todoController.getTodoStats.bind(todoController)
);

// GET /api/todos/:id - Get todo by ID
router.get(
  '/:id',
  todoController.getTodoById.bind(todoController)
);

// POST /api/todos - Create new todo
router.post(
  '/',
  validateCreateTodo,
  handleValidationErrors,
  todoController.createTodo.bind(todoController)
);

// PUT /api/todos/:id - Update todo
router.put(
  '/:id',
  validateUpdateTodo,
  handleValidationErrors,
  todoController.updateTodo.bind(todoController)
);

// DELETE /api/todos/:id - Delete todo
router.delete(
  '/:id',
  todoController.deleteTodo.bind(todoController)
);

// DELETE /api/todos/completed/all - Delete all completed todos
router.delete(
  '/completed/all',
  todoController.deleteCompletedTodos.bind(todoController)
);

// PUT /api/todos/completed/all - Mark all todos as completed
router.put(
  '/completed/all',
  todoController.markAllCompleted.bind(todoController)
);

export default router;