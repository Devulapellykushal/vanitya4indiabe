/**
 * Validation utilities for exercise generation
 * Validates input parameters and output exercises
 */

const { getValidExerciseTypes, getValidDifficultyLevels } = require('../prompts/sarvamExercisePrompt');

/**
 * Validate exercise generation parameters
 * @param {Object} params
 * @param {string} params.source_language
 * @param {string} params.target_language
 * @param {string} params.difficulty
 * @param {number} params.count
 * @param {string} params.exercise_type
 * @param {string} [params.unit_id]
 * @throws {Error} - If any parameter is invalid
 */
function validateExerciseParams(params) {
  const errors = [];

  // Check required fields
  if (!params.source_language || typeof params.source_language !== 'string') {
    errors.push('source_language is required and must be a string');
  }

  if (!params.target_language || typeof params.target_language !== 'string') {
    errors.push('target_language is required and must be a string');
  }

  // Validate difficulty
  const validDifficulties = getValidDifficultyLevels();
  if (!params.difficulty || !validDifficulties.includes(params.difficulty)) {
    errors.push(`difficulty must be one of: ${validDifficulties.join(', ')}`);
  }

  // Validate count
  if (typeof params.count !== 'number' || params.count < 1 || params.count > 50) {
    errors.push('count must be a number between 1 and 50');
  }

  // Validate exercise type
  const validTypes = getValidExerciseTypes();
  if (!params.exercise_type || !validTypes.includes(params.exercise_type)) {
    errors.push(`exercise_type must be one of: ${validTypes.join(', ')}`);
  }

  // Optional unit_id validation
  if (params.unit_id !== undefined && typeof params.unit_id !== 'string') {
    errors.push('unit_id must be a string if provided');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid exercise parameters: ${errors.join('; ')}`);
  }
}

/**
 * Validate a single exercise item
 * @param {Object} item - Exercise item to validate
 * @param {number} index - Index in array for error reporting
 * @returns {Object} - Validated and sanitized item
 * @throws {Error} - If item is invalid
 */
function validateExerciseItem(item, index) {
  const errors = [];
  const requiredFields = [
    'id',
    'unit_id', 
    'source_language',
    'target_language',
    'difficulty',
    'exercise_type',
    'original_question',
    'answer_options',
    'correct_answer'
  ];

  // Check required fields
  for (const field of requiredFields) {
    if (item[field] === undefined || item[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Exercise item ${index}: ${errors.join('; ')}`);
  }

  // Validate specific field types and constraints
  if (typeof item.id !== 'string' || item.id.length === 0) {
    errors.push('id must be a non-empty string');
  }

  if (typeof item.original_question !== 'string' || item.original_question.length === 0) {
    errors.push('original_question must be a non-empty string');
  }

  // Validate answer_options
  if (!Array.isArray(item.answer_options)) {
    errors.push('answer_options must be an array');
  } else {
    if (item.answer_options.length !== 4) {
      errors.push('answer_options must contain exactly 4 options');
    }
    
    const uniqueOptions = new Set(item.answer_options);
    if (uniqueOptions.size !== item.answer_options.length) {
      errors.push('answer_options must contain unique values');
    }

    for (let i = 0; i < item.answer_options.length; i++) {
      if (typeof item.answer_options[i] !== 'string' || item.answer_options[i].length === 0) {
        errors.push(`answer_options[${i}] must be a non-empty string`);
      }
    }
  }

  // Validate correct_answer
  if (typeof item.correct_answer !== 'string') {
    errors.push('correct_answer must be a string');
  } else if (Array.isArray(item.answer_options) && !item.answer_options.includes(item.correct_answer)) {
    errors.push('correct_answer must be one of the answer_options');
  }

  // Validate audio_enabled
  if (item.audio_enabled !== undefined) {
    if (typeof item.audio_enabled !== 'boolean') {
      // Try to convert
      item.audio_enabled = item.audio_enabled === true || item.audio_enabled === 'true';
    }

    // Check consistency with exercise type
    const shouldHaveAudio = item.exercise_type && item.exercise_type.startsWith('listen_');
    if (shouldHaveAudio && !item.audio_enabled) {
      console.warn(`Exercise item ${index}: listen_* type should have audio_enabled=true`);
    }
  } else {
    // Set default based on exercise type
    item.audio_enabled = item.exercise_type && item.exercise_type.startsWith('listen_');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid exercise item ${index}: ${errors.join('; ')}`);
  }

  // Return sanitized item
  return {
    id: item.id,
    unit_id: item.unit_id,
    source_language: item.source_language,
    target_language: item.target_language,
    difficulty: item.difficulty,
    exercise_type: item.exercise_type,
    original_question: item.original_question.trim(),
    answer_options: item.answer_options.map(opt => opt.trim()),
    correct_answer: item.correct_answer.trim(),
    audio_enabled: item.audio_enabled
  };
}

/**
 * Validate an array of exercise items
 * @param {Array} items - Array of exercise items
 * @returns {Array} - Array of validated and sanitized items
 * @throws {Error} - If any item is invalid
 */
function validateExerciseItems(items) {
  if (!Array.isArray(items)) {
    throw new Error('Exercise items must be an array');
  }

  if (items.length === 0) {
    throw new Error('Exercise items array cannot be empty');
  }

  const validatedItems = [];
  
  for (let i = 0; i < items.length; i++) {
    const validated = validateExerciseItem(items[i], i);
    validatedItems.push(validated);
  }

  return validatedItems;
}

/**
 * Check if a string is a valid UUID
 * @param {string} str - String to check
 * @returns {boolean} - True if valid UUID
 */
function isValidUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

module.exports = {
  validateExerciseParams,
  validateExerciseItem,
  validateExerciseItems,
  isValidUUID
};