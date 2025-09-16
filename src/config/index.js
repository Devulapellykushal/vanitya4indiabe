const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

class Config {
  constructor() {
    this.config = {};
    this.loadConfig();
  }

  loadConfig() {
    // Load environment variables
    require('dotenv').config();

    // Load base config from YAML
    const configPath = path.join(__dirname, '../../config/vanitya-config.yml');
    if (fs.existsSync(configPath)) {
      const yamlContent = fs.readFileSync(configPath, 'utf8');
      const yamlConfig = yaml.parse(yamlContent);
      this.config = { ...yamlConfig };
    }

    // Override with environment variables
    this.config = {
      ...this.config,
      
      // Server config
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: parseInt(process.env.PORT) || 3000,
      JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key',
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

      // Database config
      DATABASE_URL: process.env.DATABASE_URL,
      DB_HOST: process.env.DB_HOST || 'localhost',
      DB_PORT: parseInt(process.env.DB_PORT) || 5432,
      DB_NAME: process.env.DB_NAME || 'vanitya_dev',
      DB_USER: process.env.DB_USER || 'postgres',
      DB_PASSWORD: process.env.DB_PASSWORD || 'password',

      // Redis config
      REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
      REDIS_HOST: process.env.REDIS_HOST || 'localhost',
      REDIS_PORT: parseInt(process.env.REDIS_PORT) || 6379,

      // ML Service config
      ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://ml-service:8000',
      ML_SERVICE_TIMEOUT: parseInt(process.env.ML_SERVICE_TIMEOUT) || 30000,

      // API Keys - override YAML with env vars if provided
      SARVAM_API_KEY: process.env.SARVAM_API_KEY || this.config.SARVAM_API_KEY,
      AI4BHARAT_API_KEY: process.env.AI4BHARAT_API_KEY,
      SARVAM_API_URL: process.env.SARVAM_API_URL || this.config.SARVAM_API_URL,

      // Upload config
      MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
      UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',

      // Rate limiting
      RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
      RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

      // Default languages
      DEFAULT_SOURCE_LANG: process.env.DEFAULT_SOURCE_LANG || this.config.DEFAULT_SOURCE_LANG || 'hi',
      DEFAULT_TARGET_LANG: process.env.DEFAULT_TARGET_LANG || this.config.DEFAULT_TARGET_LANG || 'te',
    };
  }

  get(key) {
    return this.config[key];
  }

  getAll() {
    return { ...this.config };
  }

  update(updates) {
    this.config = { ...this.config, ...updates };
  }

  isDevelopment() {
    return this.config.NODE_ENV === 'development';
  }

  isProduction() {
    return this.config.NODE_ENV === 'production';
  }

  isTest() {
    return this.config.NODE_ENV === 'test';
  }
}

module.exports = new Config();