# Notes Application - Full Stack (Production-Ready)

A scalable, production-ready full-stack Notes application with advanced features including user authentication, CRUD operations, search, pagination, and comprehensive security measures.

## 🚀 Project Overview

This project demonstrates a production-ready architecture with:
- **Backend**: RESTful API built with Node.js, Express, SQLite, JWT authentication, refresh tokens, rate limiting, and comprehensive security
- **Frontend**: Modern React application with Vite, React Router, error boundaries, optimistic updates, and token refresh handling

## ✨ Key Features

### Backend Features
- ✅ **Secure Authentication**: JWT with refresh tokens, password hashing (bcrypt)
- ✅ **Rate Limiting**: Protection against brute force and DDoS attacks
- ✅ **API Documentation**: Swagger/OpenAPI documentation
- ✅ **Search & Pagination**: Efficient note searching and paginated results
- ✅ **Input Sanitization**: XSS protection and input validation
- ✅ **Error Handling**: Centralized error handling with proper logging
- ✅ **Security Headers**: Helmet.js for security headers
- ✅ **Database Optimization**: Indexes, WAL mode, and connection management
- ✅ **Request Logging**: Morgan for request/response logging
- ✅ **Comprehensive Testing**: Unit and integration tests

### Frontend Features
- ✅ **Modern UI/UX**: Clean, responsive design with loading states
- ✅ **Search Functionality**: Real-time note search with debouncing
- ✅ **Pagination**: Efficient note pagination
- ✅ **Optimistic Updates**: Instant UI feedback
- ✅ **Token Refresh**: Automatic token refresh handling
- ✅ **Error Boundaries**: Graceful error handling
- ✅ **Protected Routes**: Route-based authentication
- ✅ **Component Testing**: Unit tests for components

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Docker & Docker Compose (optional, for containerized deployment)

### Option 1: Local Development

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:3000
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`
- API Documentation: `http://localhost:3001/api-docs`
- Health Check: `http://localhost:3001/health`

#### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:3001
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### Option 2: Docker Deployment

1. **Build and run with Docker Compose:**
```bash
docker-compose up --build
```

2. **Access the application:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- API Docs: `http://localhost:3001/api-docs`

3. **Stop the containers:**
```bash
docker-compose down
```

### Option 3: Production Build

#### Backend
```bash
cd backend
npm install
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm run build
npm run preview  # Preview production build
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Test Coverage
- Backend: Unit tests for routes, middleware, and utilities
- Frontend: Component tests with React Testing Library

## Project Structure

```
notes-app/
├── backend/
│   ├── database.js          # Database initialization
│   ├── server.js           # Express server
│   ├── middleware/
│   │   └── auth.js         # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   └── notes.js        # Notes CRUD routes
│   ├── tests/              # Backend tests
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── README.md
└── README.md
```

## 📚 API Endpoints

### Authentication
- `POST /auth/signup` - Create a new user account
- `POST /auth/login` - Login with email and password
- `POST /auth/refresh` - Refresh access token using refresh token
- `POST /auth/logout` - Logout and invalidate refresh token

### Notes (Requires Authentication)
- `POST /notes` - Create a new note
- `GET /notes?page=1&limit=10&search=term` - Get paginated notes with optional search
- `PUT /notes/:id` - Update a note
- `DELETE /notes/:id` - Delete a note

### Health & Documentation
- `GET /health` - Health check endpoint
- `GET /api-docs` - Interactive API documentation (Swagger UI)

**Full API Documentation**: Visit `http://localhost:3001/api-docs` when the backend is running.

### Authentication Flow
1. User signs up/logs in → Receives `accessToken` (15min expiry) and `refreshToken` (7 days)
2. Access token is used for API requests
3. When access token expires, frontend automatically refreshes using refresh token
4. On logout, refresh token is invalidated

## 🛠️ Technologies Used

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite3 (with WAL mode for better concurrency)
- **Authentication**: JWT (access + refresh tokens)
- **Security**: Helmet.js, express-rate-limit, bcryptjs
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI
- **Logging**: Morgan
- **Testing**: Jest & Supertest

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **Build Tool**: Vite
- **HTTP Client**: Axios (with interceptors for token refresh)
- **Testing**: Vitest, React Testing Library
- **Styling**: CSS (modular, responsive)

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds (12)
- **JWT Security**: Short-lived access tokens (15min) + long-lived refresh tokens (7 days)
- **Rate Limiting**: Prevents brute force attacks (5 attempts per 15min for auth endpoints)
- **Input Sanitization**: XSS protection and SQL injection prevention
- **Security Headers**: Helmet.js for security headers
- **CORS**: Configured for specific origins
- **Token Storage**: Secure token management with automatic refresh

## 📊 Architecture Highlights

### Backend Architecture
- **Layered Architecture**: Routes → Middleware → Controllers → Database
- **Error Handling**: Centralized error handling middleware
- **Async/Await**: Promisified database operations
- **Database Optimization**: Indexes on frequently queried columns
- **Connection Management**: Efficient database connection handling

### Frontend Architecture
- **Component-Based**: Reusable, testable components
- **Context API**: Global state management for authentication
- **Error Boundaries**: Graceful error handling
- **Optimistic Updates**: Instant UI feedback
- **Token Refresh**: Automatic token refresh on expiry

## 🚀 Production Considerations

### Scalability
- Database indexes for performance
- Pagination to handle large datasets
- Efficient search implementation
- Connection pooling ready (can be upgraded to PostgreSQL)

### Monitoring
- Health check endpoint (`/health`)
- Request logging (Morgan)
- Error logging with stack traces (development mode)

### Deployment
- Docker support for easy deployment
- Environment-based configuration
- Production build optimization
- Nginx configuration for frontend serving

## 📝 Development Notes

- **Database**: SQLite database file (`notes.db`) is created automatically on first run
- **Token Storage**: Access and refresh tokens stored in localStorage
- **Auto Refresh**: Frontend automatically refreshes expired access tokens
- **Error Handling**: Comprehensive error handling on both frontend and backend
- **API Documentation**: Available at `/api-docs` endpoint

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development|production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

## 📦 Project Structure

```
notes-app/
├── backend/
│   ├── config/          # Configuration files (Swagger)
│   ├── middleware/      # Express middleware (auth, rate limiting, logging)
│   ├── routes/          # API routes (auth, notes)
│   ├── utils/           # Utility functions (token, validation)
│   ├── tests/           # Backend tests
│   ├── database.js      # Database initialization
│   ├── server.js        # Express server
│   └── Dockerfile       # Docker configuration
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context (Auth)
│   │   ├── services/    # API services
│   │   └── utils/       # Utility functions
│   ├── Dockerfile       # Docker configuration
│   └── nginx.conf       # Nginx configuration
├── docker-compose.yml   # Docker Compose configuration
└── README.md            # This file
```

## 🎯 Future Enhancements

- [ ] Migrate to PostgreSQL for better scalability
- [ ] Add Redis for caching and session management
- [ ] Implement real-time updates with WebSockets
- [ ] Add note sharing/collaboration features
- [ ] Implement note categories/tags
- [ ] Add file attachments to notes
- [ ] Implement note export (PDF, Markdown)
- [ ] Add dark mode support
- [ ] Implement E2E tests with Playwright/Cypress

## 📄 License

ISC

