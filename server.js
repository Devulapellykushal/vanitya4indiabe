#!/usr/bin/env node

/**
 * Vanitya Backend API Server
 * Enterprise-grade Node.js/Express application
 */

const createApp = require('./src/api/app');
const { config } = require('./src/core');
const { sequelize } = require('./src/infrastructure/database');

const PORT = config.server.port;
const HOST = config.server.host;

/**
 * Initialize database connection
 */
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync database in development
    if (config.isDevelopment()) {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized.');
    }
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  try {
    // Close database connection
    await sequelize.close();
    console.log('✅ Database connection closed.');
    
    // Close server
    if (server) {
      server.close(() => {
        console.log('✅ HTTP server closed.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
}

/**
 * Start the server
 */
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Create Express application
    const app = createApp();
    
    // Start HTTP server
    const server = app.listen(PORT, HOST, () => {
      console.log(`🚀 Vanitya Backend API server running:`);
      console.log(`   URL: http://${HOST}:${PORT}`);
      console.log(`   Environment: ${config.server.environment}`);
      console.log(`   Health Check: http://${HOST}:${PORT}${config.healthCheck.path}`);
      console.log(`   API Docs: http://${HOST}:${PORT}/api/v1`);
      console.log(`   Process ID: ${process.pid}`);
      console.log(`   Node.js Version: ${process.version}`);
      console.log('');
      console.log('Press Ctrl+C to stop the server');
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }
      
      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
      
      switch (error.code) {
        case 'EACCES':
          console.error(`❌ ${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`❌ ${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
    
    // Setup graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });
    
    // Handle unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });
    
    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  let server;
  startServer().then(s => { server = s; });
}

module.exports = { startServer };