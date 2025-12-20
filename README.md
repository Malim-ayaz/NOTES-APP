# Notes Application - Full Stack

A complete full-stack Notes application with user authentication and CRUD operations for notes.

## Project Overview

This project consists of:
- **Backend**: RESTful API built with Node.js, Express, SQLite, and JWT authentication
- **Frontend**: React application built with Vite, React Router, and modern React patterns

## Features

### Backend
- User authentication (signup/login) with JWT tokens
- Secure password hashing using bcryptjs
- CRUD operations for notes
- Request validation
- SQLite database
- Comprehensive test coverage

### Frontend
- User signup and login pages
- Create, read, update, and delete notes
- JWT token management
- Loading and error states
- Responsive design
- Protected routes
- Component unit tests

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create a `.env` file:
```env
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create a `.env` file:
```env
VITE_API_URL=http://localhost:3001
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

5. Open your browser and navigate to `http://localhost:3000`

## Testing

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

## API Endpoints

### Authentication
- `POST /auth/signup` - Create a new user account
- `POST /auth/login` - Login with email and password

### Notes (Requires Authentication)
- `POST /notes` - Create a new note
- `GET /notes` - Get all notes for the authenticated user
- `PUT /notes/:id` - Update a note
- `DELETE /notes/:id` - Delete a note

See the backend README for detailed API documentation.

## Technologies Used

### Backend
- Node.js
- Express.js
- SQLite3
- JSON Web Tokens (JWT)
- bcryptjs
- express-validator
- Jest & Supertest

### Frontend
- React 18
- React Router
- Vite
- Axios
- Vitest
- React Testing Library

## Development Notes

- The backend uses SQLite for simplicity - the database file (`notes.db`) is created automatically on first run
- JWT tokens are stored in localStorage on the frontend
- All API requests include the JWT token in the Authorization header
- The frontend automatically redirects to login on authentication errors
- Both backend and frontend include comprehensive error handling

## License

ISC

