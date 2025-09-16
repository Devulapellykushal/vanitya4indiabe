const Joi = require('joi');

// User validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(255).required(),
  password: Joi.string().min(6).max(100).required(),
  currentLanguage: Joi.string().length(2).optional(),
  targetLanguage: Joi.string().length(2).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

// Exercise validation schemas
const exerciseSubmissionSchema = Joi.object({
  exerciseId: Joi.string().uuid().required(),
  answer: Joi.string().required(),
  responseTime: Joi.number().integer().min(0).optional(),
  hintUsed: Joi.boolean().optional(),
  audioPlayed: Joi.boolean().optional()
});

const exerciseGenerationSchema = Joi.object({
  sourceLanguage: Joi.string().length(2).required(),
  targetLanguage: Joi.string().length(2).required(),
  difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
  exerciseType: Joi.string().valid('translation', 'transliteration', 'listening', 'speaking', 'matching').required(),
  unitId: Joi.string().max(50).required(),
  count: Joi.number().integer().min(1).max(10).optional()
});

const audioGenerationSchema = Joi.object({
  text: Joi.string().required(),
  language: Joi.string().length(2).required()
});

// STT validation schemas
const sttSubmissionSchema = Joi.object({
  audioFile: Joi.any().required(), // File validation handled by multer
  language: Joi.string().length(2).required(),
  exerciseId: Joi.string().uuid().optional()
});

// Admin validation schemas
const configUpdateSchema = Joi.object({
  SARVAM_API_KEY: Joi.string().optional(),
  AI4BHARAT_API_KEY: Joi.string().optional(),
  DEFAULT_SOURCE_LANG: Joi.string().length(2).optional(),
  DEFAULT_TARGET_LANG: Joi.string().length(2).optional(),
  SARVAM_FREE_CREDITS: Joi.number().integer().min(0).optional()
});

// Recommender validation schemas
const nextExerciseSchema = Joi.object({
  sourceLanguage: Joi.string().length(2).optional(),
  targetLanguage: Joi.string().length(2).optional(),
  excludeTypes: Joi.array().items(Joi.string()).optional()
});

// Common validation schemas
const uuidParamSchema = Joi.object({
  id: Joi.string().uuid().required()
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('ASC', 'DESC').optional()
});

module.exports = {
  // Auth schemas
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  
  // Exercise schemas
  exerciseSubmissionSchema,
  exerciseGenerationSchema,
  audioGenerationSchema,
  
  // STT schemas
  sttSubmissionSchema,
  
  // Admin schemas
  configUpdateSchema,
  
  // Recommender schemas
  nextExerciseSchema,
  
  // Common schemas
  uuidParamSchema,
  paginationSchema
};