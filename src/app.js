const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const config = require('./config');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const exerciseRoutes = require('./routes/exercises');
const sttRoutes = require('./routes/stt');
const adminRoutes = require('./routes/admin');
const recommenderRoutes = require('./routes/recommender');

const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Logging middleware
if (!config.isTest()) {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', apiLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.get('NODE_ENV'),
    version: require('../package.json').version
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/stt', sttRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recommender', recommenderRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Vanitya Backend API',
    version: '1.0.0',
    endpoints: {
      auth: {
        POST: ['/api/auth/register', '/api/auth/login', '/api/auth/reset']
      },
      exercises: {
        GET: ['/api/exercises/fetch'],
        POST: ['/api/exercises/submit', '/api/exercises/generate', '/api/exercises/:id/audio']
      },
      stt: {
        POST: ['/api/stt/submit']
      },
      admin: {
        POST: ['/api/admin/config/update']
      },
      recommender: {
        GET: ['/api/recommender/next']
      }
    }
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;