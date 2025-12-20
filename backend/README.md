# Notes App Backend

A RESTful API backend for a Notes application built with Node.js, Express, SQLite, and JWT authentication.

## Features

- User authentication (signup/login) with JWT tokens
- Secure password hashing using bcryptjs
- CRUD operations for notes
- Request validation using express-validator
- SQLite database for data persistence
- CORS enabled for frontend integration

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory (optional, defaults are provided):
```env
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
```

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:3001` (or the PORT specified in your .env file).

## API Endpoints

### Authentication

#### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### Notes

All note endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

#### POST /notes
Create a new note.

**Request Body:**
```json
{
  "title": "My First Note",
  "content": "This is the content of my note"
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "title": "My First Note",
  "content": "This is the content of my note",
  "created_at": "2024-01-01 12:00:00",
  "updated_at": "2024-01-01 12:00:00"
}
```

#### GET /notes
Get all notes for the authenticated user.

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "title": "My First Note",
    "content": "This is the content of my note",
    "created_at": "2024-01-01 12:00:00",
    "updated_at": "2024-01-01 12:00:00"
  }
]
```

#### PUT /notes/:id
Update an existing note.

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content"
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Updated Title",
  "content": "Updated content",
  "created_at": "2024-01-01 12:00:00",
  "updated_at": "2024-01-01 13:00:00"
}
```

#### DELETE /notes/:id
Delete a note.

**Response:**
```json
{
  "message": "Note deleted successfully"
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message here"
}
```

Or for validation errors:
```json
{
  "errors": [
    {
      "msg": "Validation error message",
      "param": "fieldName",
      "location": "body"
    }
  ]
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (invalid token or user not found)
- `404` - Not Found (note not found)
- `500` - Internal Server Error

## Testing

Run tests with:
```bash
npm test
```

## Database

The application uses SQLite database (`notes.db`) which is automatically created on first run. The database file will be created in the backend directory.

## Project Structure

```
backend/
├── database.js          # Database initialization and connection
├── server.js            # Express server setup
├── middleware/
│   └── auth.js         # JWT authentication middleware
├── routes/
│   ├── auth.js         # Authentication routes
│   └── notes.js        # Notes CRUD routes
├── tests/              # Test files
├── package.json
└── README.md
```

