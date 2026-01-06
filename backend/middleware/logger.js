const morgan = require('morgan');

// Custom token for request ID
morgan.token('id', (req) => req.id || '-');

// Custom format
const logFormat = ':method :url :status :response-time ms - :res[content-length]';

// Development logger
const devLogger = morgan('dev');

// Production logger
const prodLogger = morgan(logFormat, {
  skip: (req, res) => res.statusCode < 400, // Only log errors in production
});

module.exports = {
  devLogger,
  prodLogger,
};

