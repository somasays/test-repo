# Todo App - Modern Full-Stack Application

A modern, responsive todo application built with React, TypeScript, and Express. This project demonstrates best practices for building full-stack applications with proper separation of concerns, comprehensive testing, and production-ready configuration.

## 🚀 Features

- ✅ **Modern Tech Stack**: React 18, TypeScript, Express, Tailwind CSS
- 🎨 **Clean UI/UX**: Responsive design with smooth animations
- 🔧 **Production Ready**: Docker support, proper error handling, logging
- 🧪 **Comprehensive Testing**: Unit tests with Vitest and React Testing Library
- 📱 **Responsive Design**: Works perfectly on desktop and mobile
- ⚡ **Fast Development**: Hot reload, TypeScript support, modern tooling
- 🔍 **Type Safe**: Full TypeScript coverage for both frontend and backend
- 📊 **Smart Features**: Todo statistics, bulk operations, pagination

## 📋 Todo Features

- Create, read, update, and delete todos
- Mark todos as completed/incomplete
- Add optional descriptions to todos
- Filter todos by status (all, active, completed)
- Bulk operations (mark all complete, delete completed)
- Real-time statistics and progress tracking
- Pagination for large todo lists
- Persistent storage (in-memory with plans for database integration)

## 🏗️ Architecture

This project follows modern full-stack architecture patterns:

### Backend (Express + TypeScript)
- **Layered Architecture**: Controllers → Services → Models
- **Proper Error Handling**: Custom error classes and global error middleware
- **Input Validation**: Express-validator for request validation
- **Type Safety**: Comprehensive TypeScript types
- **Testing**: Vitest with comprehensive test coverage

### Frontend (React + TypeScript)
- **Component-Driven**: Reusable, testable components
- **State Management**: React Query for server state, React hooks for local state
- **Modern Patterns**: Custom hooks, proper error boundaries
- **Styling**: Tailwind CSS with custom design system
- **Testing**: React Testing Library with MSW for API mocking

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library with modern hooks
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Server state management and caching
- **Axios** - HTTP client with interceptors
- **React Hot Toast** - Toast notifications
- **Lucide React** - Modern icon library

### Backend
- **Express** - Web framework for Node.js
- **TypeScript** - Type safety for server-side code
- **Express Validator** - Input validation middleware
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **UUID** - Unique identifier generation

### Testing
- **Vitest** - Modern testing framework (faster than Jest)
- **React Testing Library** - Component testing utilities
- **MSW** - Mock Service Worker for API mocking
- **Supertest** - HTTP assertion library for backend testing

### Development Tools
- **ESLint** - Code linting with TypeScript support
- **Prettier** - Code formatting (via ESLint integration)
- **TSX** - TypeScript execution for development
- **Concurrently** - Run multiple commands concurrently

## 📁 Project Structure

```
todo-app-monorepo/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Custom middleware
│   │   ├── models/            # Data models
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utility functions
│   │   └── server.ts          # Server entry point
│   ├── tests/                 # Backend tests
│   └── package.json
│
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API services
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utility functions
│   │   ├── App.tsx            # Main App component
│   │   └── main.tsx           # React entry point
│   ├── tests/                 # Frontend tests
│   │   ├── mocks/             # MSW mock handlers
│   │   └── setup.ts           # Test setup
│   ├── index.html             # HTML template
│   └── package.json
│
├── docker-compose.yml         # Docker orchestration
├── package.json              # Root workspace configuration
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd claude-scaffolding
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment templates
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   
   # Update values if needed (defaults work for development)
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both:
   - Backend API: http://localhost:3001
   - Frontend app: http://localhost:5173

5. **Open your browser**
   Navigate to http://localhost:5173 to use the application.

## 📜 Available Scripts

### Root Level Commands
```bash
npm run dev              # Start both frontend and backend in development
npm run build            # Build both applications for production
npm run test             # Run tests for both applications
npm run test:watch       # Run tests in watch mode
npm run lint             # Lint all code
npm run lint:fix         # Fix linting issues
npm clean                # Clean build artifacts
```

### Backend Commands
```bash
cd backend
npm run dev              # Start backend in development mode
npm run build            # Build for production
npm start                # Start production server
npm test                 # Run backend tests
npm run test:coverage    # Run tests with coverage
```

### Frontend Commands
```bash
cd frontend
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm test                 # Run frontend tests
npm run test:ui          # Run tests with UI
```

## 🧪 Testing

The project includes comprehensive testing setup for both frontend and backend:

### Backend Testing
- **Unit Tests**: Service layer and utility functions
- **Integration Tests**: API endpoints with supertest
- **Test Coverage**: Automated coverage reporting

```bash
cd backend
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run with coverage report
```

### Frontend Testing
- **Component Tests**: React Testing Library for UI components
- **Hook Tests**: Custom hook testing
- **API Mocking**: MSW for realistic API mocking
- **User Interaction Testing**: Comprehensive user event testing

```bash
cd frontend
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Run with Vitest UI
npm run test:coverage    # Run with coverage report
```

## 🐳 Docker Deployment

The application includes Docker support for easy deployment:

### Development with Docker
```bash
docker-compose up --build
```

### Production Docker Build
```bash
# Build images
docker-compose -f docker-compose.yml build

# Run in production mode
docker-compose -f docker-compose.yml up -d
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
DEBUG=true
```

**Frontend (frontend/.env)**
```env
VITE_API_URL=http://localhost:3001/api
```

### TypeScript Configuration
- Strict mode enabled for both frontend and backend
- Path mapping for clean imports
- Modern ES2020+ target for optimal performance

### ESLint Configuration
- Modern flat config format
- TypeScript-aware rules
- React hooks linting
- Consistent code style enforcement

## 📊 API Endpoints

The backend provides a RESTful API:

### Todos
- `GET /api/todos` - Get paginated todos
- `GET /api/todos/:id` - Get specific todo
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

### Bulk Operations
- `GET /api/todos/stats` - Get todo statistics
- `PUT /api/todos/completed/all` - Mark all todos as completed
- `DELETE /api/todos/completed/all` - Delete all completed todos

### Health Check
- `GET /health` - Server health check

## 🎨 Design System

The application uses a custom design system built with Tailwind CSS:

### Colors
- **Primary**: Blue theme for main actions
- **Success**: Green for completed states
- **Danger**: Red for destructive actions
- **Warning**: Orange for attention states

### Components
- Consistent spacing and typography
- Smooth animations and transitions
- Responsive design patterns
- Accessible color contrasts

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Environment Setup
1. Update environment variables for production
2. Set up proper CORS origins
3. Configure reverse proxy if needed
4. Set up monitoring and logging

### Deployment Options
- **Docker**: Use provided Docker configuration
- **Static Hosting**: Frontend can be deployed to Netlify, Vercel, etc.
- **Server Hosting**: Backend can be deployed to any Node.js hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Write tests for new features
- Follow the existing code style
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built following modern React and Express best practices
- Inspired by TodoMVC architecture patterns
- Uses industry-standard tools and libraries
- Designed for educational and production use

## 📞 Support

For questions or issues:
1. Check the existing issues in the repository
2. Create a new issue with detailed description
3. Follow the contributing guidelines

---

**Happy coding!** 🎉