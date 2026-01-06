# Notes API - Backend

A production-ready RESTful API for managing notes with user authentication, built with Node.js, Express, and SQLite.

## Features

- JWT Authentication with Refresh Tokens
- Rate Limiting (Protection against brute force attacks)
- Input Validation & Sanitization
- Search & Pagination
- API Documentation (Swagger/OpenAPI)
- Comprehensive Error Handling
- Request Logging
- Security Headers (Helmet.js)
- Database Optimization (Indexes, WAL mode)

## Quick Start

### Prerequisites
- Node.js v18 or higher
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables:
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:3000
```

4. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:3001/api-docs`
- **Health Check**: `http://localhost:3001/health`

## API Endpoints

### Authentication

#### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "abc123...",
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
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "abc123...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "abc123..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/logout
Logout and invalidate refresh token.

**Request Body:**
```json
{
  "refreshToken": "abc123..."
}
```

### Notes (Requires Authentication)

All note endpoints require authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <accessToken>
```

#### POST /notes
Create a new note.

**Request Body:**
```json
{
  "title": "My First Note",
  "content": "This is the content of my note."
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "title": "My First Note",
  "content": "This is the content of my note.",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

#### GET /notes
Get paginated notes with optional search.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Notes per page (default: 10, max: 100)
- `search` (optional): Search term for title or content

**Example:**
```
GET /notes?page=1&limit=10&search=important
```

**Response:**
```json
{
  "notes": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Important Note",
      "content": "Content here...",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### PUT /notes/:id
Update a note.

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
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T01:00:00.000Z"
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

## Security Features

### Rate Limiting
- **Auth endpoints**: 5 requests per 15 minutes per IP
- **General API**: 100 requests per 15 minutes per IP

### Password Requirements
- Minimum 6 characters
- Must contain at least one uppercase letter, one lowercase letter, and one number

### Token Expiry
- **Access Token**: 15 minutes
- **Refresh Token**: 7 days

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/expired token)
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

## Testing

Run tests:
```bash
npm test
```

Test coverage includes:
- Authentication endpoints
- Notes CRUD operations
- Error handling
- Validation

## Database Schema

### users
- `id` (INTEGER PRIMARY KEY)
- `username` (TEXT UNIQUE NOT NULL)
- `email` (TEXT UNIQUE NOT NULL)
- `password` (TEXT NOT NULL) - Hashed with bcrypt
- `created_at` (DATETIME)

### notes
- `id` (INTEGER PRIMARY KEY)
- `user_id` (INTEGER NOT NULL) - Foreign key to users
- `title` (TEXT NOT NULL)
- `content` (TEXT NOT NULL)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### refresh_tokens
- `id` (INTEGER PRIMARY KEY)
- `user_id` (INTEGER NOT NULL) - Foreign key to users
- `token` (TEXT UNIQUE NOT NULL)
- `expires_at` (DATETIME NOT NULL)
- `created_at` (DATETIME)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `3001` |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## Production Deployment

### Using Docker

```bash
docker build -t notes-api .
docker run -p 3001:3001 -e JWT_SECRET=your-secret notes-api
```

### Environment Setup

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure `FRONTEND_URL` for your frontend domain
4. Consider using a production database (PostgreSQL)

## License

ISC
