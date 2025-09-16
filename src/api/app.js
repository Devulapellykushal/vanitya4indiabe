const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const { config, middleware } = require('../core');
const v1Router = require('./v1');

/**
 * Express application factory with proper middleware setup
 */
function createApp() {
  const app = express();

  // Trust proxy for rate limiting behind reverse proxy
  if (config.server.trustProxy) {
    app.set('trust proxy', 1);
  }

  // Request ID middleware (should be first)
  app.use(middleware.LoggingMiddleware.requestId());

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // Compression middleware
  app.use(compression());

  // CORS configuration
  app.use(cors({
    origin: config.server.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID']
  }));

  // Body parsing middleware
  app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging middleware
  app.use(middleware.LoggingMiddleware.create());

  // Metrics collection middleware
  app.use(middleware.MetricsMiddleware.collect());

  // Global rate limiting
  app.use('/api/', middleware.RateLimitingMiddleware.createApiLimiter());

  // Health check endpoint (before other routes)
  app.get(config.healthCheck.path, middleware.MetricsMiddleware.healthCheck());

  // API routes
  app.use('/api/v1', v1Router);

  // Metrics endpoint (for monitoring)
  app.get('/metrics', (req, res) => {
    const metrics = middleware.MetricsMiddleware.getMetrics();
    res.json(metrics);
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Vanitya Backend API',
      version: '1.0.0',
      environment: config.server.environment,
      timestamp: new Date().toISOString(),
      endpoints: {
        health: config.healthCheck.path,
        api: '/api/v1',
        metrics: '/metrics'
      }
    });
  });

  // 404 handler
  app.use(middleware.ErrorHandler.notFound());

  // Global error handler (must be last)
  app.use(middleware.ErrorHandler.handle());

  return app;
}

module.exports = createApp;