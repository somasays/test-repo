import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import todoRoutes from './routes/todoRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { todoService } from './services/todoService.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/todos', todoRoutes);

// 404 handler for unknown routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Initialize server
const startServer = async (): Promise<void> => {
  try {
    // Seed database with sample data in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Seeding database with sample todos...');
      await todoService.seedTodos();
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📖 API Documentation available at http://localhost:${PORT}/api/todos`);
      console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server if this file is run directly (not imported for testing)
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, startServer };