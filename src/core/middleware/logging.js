const morgan = require('morgan');
const config = require('../config');

/**
 * Enhanced logging middleware with structured logging support
 */
class LoggingMiddleware {
  static create() {
    const format = config.logging.format;
    const level = config.logging.level;

    // Custom token for request ID
    morgan.token('id', (req) => req.id || 'unknown');
    
    // Custom token for user ID
    morgan.token('user', (req) => req.user?.id || 'anonymous');
    
    // Custom token for response time in milliseconds
    morgan.token('response-time-ms', (req, res) => {
      const responseTime = morgan['response-time'](req, res);
      return responseTime ? `${parseFloat(responseTime).toFixed(2)}ms` : '';
    });

    let formatString;
    
    if (config.isProduction()) {
      // Production: JSON structured logging
      formatString = JSON.stringify({
        timestamp: new Date().toISOString(),
        requestId: ':id',
        method: ':method',
        url: ':url',
        status: ':status',
        responseTime: ':response-time-ms',
        contentLength: ':res[content-length]',
        userAgent: ':user-agent',
        userId: ':user',
        remoteAddr: ':remote-addr'
      });
    } else {
      // Development: Human-readable format
      formatString = ':id :method :url :status :response-time-ms - :res[content-length] :user-agent';
    }

    const options = {
      stream: {
        write: (message) => {
          if (config.isProduction()) {
            try {
              const logData = JSON.parse(message);
              console.log(JSON.stringify(logData));
            } catch (e) {
              console.log(message.trim());
            }
          } else {
            console.log(message.trim());
          }
        }
      },
      skip: (req, res) => {
        // Skip health check logs in production
        if (config.isProduction() && req.url === config.healthCheck.path) {
          return true;
        }
        return false;
      }
    };

    return morgan(formatString, options);
  }

  static requestId() {
    return (req, res, next) => {
      req.id = this.generateRequestId();
      res.setHeader('X-Request-ID', req.id);
      next();
    };
  }

  static generateRequestId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

module.exports = LoggingMiddleware;