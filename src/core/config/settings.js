const path = require('path');
const fs = require('fs');

/**
 * Centralized configuration management for Vanitya Backend API
 * Supports multiple environments with proper validation and type safety
 */
class Config {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.loadEnvironmentConfig();
    this.validateRequiredConfig();
  }

  loadEnvironmentConfig() {
    // Load environment-specific configuration
    const envFile = path.join(__dirname, '../../../config/environments', `${this.env}.env`);
    if (fs.existsSync(envFile)) {
      require('dotenv').config({ path: envFile });
    }

    // Load base .env file as fallback
    const baseEnvFile = path.join(__dirname, '../../../.env');
    if (fs.existsSync(baseEnvFile)) {
      require('dotenv').config({ path: baseEnvFile });
    }
  }

  validateRequiredConfig() {
    const required = [
      'PORT',
      'DATABASE_URL',
      'JWT_SECRET'
    ];

    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  // Server Configuration
  get server() {
    return {
      port: parseInt(process.env.PORT || '3000', 10),
      host: process.env.HOST || '0.0.0.0',
      environment: this.env,
      corsOrigin: process.env.CORS_ORIGIN || '*',
      trustProxy: process.env.TRUST_PROXY === 'true'
    };
  }

  // Database Configuration
  get database() {
    return {
      url: process.env.DATABASE_URL,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'vanitya',
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      dialect: 'postgres',
      ssl: process.env.DB_SSL === 'true',
      pool: {
        max: parseInt(process.env.DB_POOL_MAX || '10', 10),
        min: parseInt(process.env.DB_POOL_MIN || '0', 10),
        acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10),
        idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10)
      },
      logging: this.env === 'development' ? console.log : false
    };
  }

  // Authentication Configuration
  get auth() {
    return {
      jwtSecret: process.env.JWT_SECRET,
      jwtExpiration: process.env.JWT_EXPIRATION || '24h',
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10)
    };
  }

  // Redis Configuration
  get redis() {
    return {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'vanitya:',
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100
    };
  }

  // External API Configuration
  get externalApis() {
    return {
      sarvam: {
        url: process.env.SARVAM_API_URL || 'https://api.sarvam.ai/v1',
        key: process.env.SARVAM_API_KEY,
        timeout: parseInt(process.env.SARVAM_TIMEOUT || '30000', 10),
        credits: parseInt(process.env.SARVAM_CREDITS || '900', 10)
      },
      ai4bharat: {
        url: process.env.AI4BHARAT_API_URL || 'https://api.ai4bharat.org',
        key: process.env.AI4BHARAT_API_KEY,
        timeout: parseInt(process.env.AI4BHARAT_TIMEOUT || '30000', 10)
      },
      aksharamukha: {
        url: process.env.AKSHARAMUKHA_URL || 'https://aksharamukha.appspot.com',
        key: process.env.AKSHARAMUKHA_API_KEY,
        timeout: parseInt(process.env.AKSHARAMUKHA_TIMEOUT || '15000', 10)
      },
      mlService: {
        url: process.env.ML_SERVICE_URL || 'http://localhost:8000',
        timeout: parseInt(process.env.ML_SERVICE_TIMEOUT || '60000', 10)
      }
    };
  }

  // Rate Limiting Configuration
  get rateLimiting() {
    return {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
      skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true',
      skipFailedRequests: process.env.RATE_LIMIT_SKIP_FAILED === 'true'
    };
  }

  // Logging Configuration
  get logging() {
    return {
      level: process.env.LOG_LEVEL || (this.env === 'production' ? 'info' : 'debug'),
      format: process.env.LOG_FORMAT || 'combined',
      filePath: process.env.LOG_FILE_PATH,
      maxSize: process.env.LOG_MAX_SIZE || '100m',
      maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10)
    };
  }

  // Application-specific Configuration
  get app() {
    return {
      languages: {
        supported: (process.env.SUPPORTED_LANGUAGES || 'hi,te,kn,ta,ml,en').split(','),
        defaultSource: process.env.DEFAULT_SOURCE_LANGUAGE || 'hi',
        defaultTarget: process.env.DEFAULT_TARGET_LANGUAGE || 'te'
      },
      game: {
        heartsInitial: parseInt(process.env.GAME_HEARTS_INITIAL || '5', 10),
        heartsDeductWrong: parseInt(process.env.GAME_HEARTS_DEDUCT || '1', 10),
        retryMaxAttempts: parseInt(process.env.GAME_RETRY_MAX || '3', 10)
      },
      upload: {
        maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '10485760', 10), // 10MB
        allowedMimeTypes: (process.env.UPLOAD_ALLOWED_TYPES || 'audio/wav,audio/mp3,audio/ogg').split(',')
      }
    };
  }

  // Health Check Configuration
  get healthCheck() {
    return {
      path: process.env.HEALTH_CHECK_PATH || '/health',
      timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000', 10)
    };
  }

  // Utility methods
  isDevelopment() {
    return this.env === 'development';
  }

  isProduction() {
    return this.env === 'production';
  }

  isTesting() {
    return this.env === 'test';
  }

  get(key, defaultValue = null) {
    return process.env[key] || defaultValue;
  }
}

module.exports = new Config();