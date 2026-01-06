require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { initDatabase } = require('./database');
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const { apiLimiter } = require('./middleware/rateLimiter');
const { devLogger, prodLogger } = require('./middleware/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(NODE_ENV === 'production' ? prodLogger : devLogger);

// Rate limiting
app.use('/api/', apiLimiter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Initialize database
initDatabase()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

// Routes
app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;

