"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envValidation = void 0;
let Joi;
try {
    Joi = require('joi');
}
catch {
    Joi = null;
}
exports.envValidation = Joi ? Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    PORT: Joi.number().default(3000),
    HOST: Joi.string().default('0.0.0.0'),
    DATABASE_URL: Joi.string().optional(),
    DB_HOST: Joi.string().default('localhost'),
    DB_PORT: Joi.number().default(5432),
    DB_USERNAME: Joi.string().default('postgres'),
    DB_PASSWORD: Joi.string().allow('').default('postgres'),
    DB_NAME: Joi.string().default('vanitya'),
    DB_SSL: Joi.string().valid('true', 'false').default('false'),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRATION: Joi.string().default('24h'),
    REDIS_URL: Joi.string().default('redis://localhost:6379'),
    REDIS_HOST: Joi.string().default('localhost'),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_PASSWORD: Joi.string().optional(),
    REDIS_DB: Joi.number().default(0),
    SARVAM_API_KEY: Joi.string().optional(),
    SARVAM_API_URL: Joi.string().default('https://api.sarvam.ai/v1'),
    AI4BHARAT_API_KEY: Joi.string().optional(),
    AI4BHARAT_API_URL: Joi.string().default('https://api.ai4bharat.org'),
    OPENAI_API_KEY: Joi.string().optional(),
    OPENAI_MODEL: Joi.string().default('gpt-4o-mini'),
    OPENAI_TTS_MODEL: Joi.string().default('tts-1'),
    ML_SERVICE_URL: Joi.string().default('http://localhost:8000'),
    RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
    RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
    CORS_ORIGIN: Joi.string().default('*')
}) : undefined;
//# sourceMappingURL=env.validation.js.map