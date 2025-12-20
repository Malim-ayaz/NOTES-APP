# Notes App Frontend

A modern React frontend for the Notes application built with Vite, React Router, and Axios.

## Features

- User authentication (signup/login)
- Create, read, update, and delete notes
- JWT token management with automatic token attachment to requests
- Loading and error states
- Responsive design
- Protected routes

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running (see backend README)

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Configuration

Create a `.env` file in the frontend directory (optional, defaults are provided):
```env
VITE_API_URL=http://localhost:3001
```

## Running the Application

### Development Mode:
```bash
npm run dev
```

The application will start on `http://localhost:3000` (or the next available port).

### Production Build:
```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build:
```bash
npm run preview
```

## Testing

Run tests with:
```bash
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── NoteCard.jsx
│   │   ├── NoteForm.jsx
│   │   └── __tests__/       # Component tests
│   ├── pages/               # Page components
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Notes.jsx
│   │   └── __tests__/       # Page tests
│   ├── context/             # React context providers
│   │   └── AuthContext.jsx
│   ├── services/            # API services
│   │   └── api.js
│   ├── utils/               # Utility functions
│   │   └── token.js
│   ├── test/                # Test setup
│   │   └── setup.js
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Usage

1. Start the backend server (see backend README)
2. Start the frontend development server: `npm run dev`
3. Open `http://localhost:3000` in your browser
4. Sign up for a new account or login with existing credentials
5. Create, edit, and delete notes

## Features Overview

### Authentication
- **Signup**: Create a new account with username, email, and password
- **Login**: Sign in with email and password
- **Logout**: Clear session and return to login page
- **Protected Routes**: Automatically redirects to login if not authenticated

### Notes Management
- **Create**: Add new notes with title and content
- **View**: Display all notes in a responsive grid layout
- **Edit**: Update existing notes
- **Delete**: Remove notes with confirmation
- **Real-time Updates**: Notes list updates immediately after operations

### Error Handling
- Form validation errors
- API error messages displayed to users
- Automatic logout on authentication errors
- Loading states during API calls

## Technologies Used

- **React 18**: UI library
- **React Router**: Client-side routing
- **Vite**: Build tool and dev server
- **Axios**: HTTP client
- **Vitest**: Testing framework
- **React Testing Library**: Component testing utilities

