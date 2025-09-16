const multer = require('multer');
const path = require('path');
const { asyncHandler } = require('../middleware/errorHandler');
const { sttSubmissionSchema } = require('../utils/validation');
const mlService = require('../services/mlService');
const config = require('../config');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.get('UPLOAD_DIR') || 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `audio-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept audio files only
  if (file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.get('MAX_FILE_SIZE') // 10MB default
  }
});

// @desc    Submit audio for speech-to-text
// @route   POST /api/stt/submit
// @access  Private
const submitAudio = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'Audio file is required'
    });
  }

  // Validate request body
  const { error, value } = sttSubmissionSchema.validate({
    ...req.body,
    audioFile: req.file
  });
  
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(d => ({ field: d.context.key, message: d.message }))
    });
  }

  const { language, exerciseId } = value;

  try {
    // Call ML service for speech-to-text
    const sttResult = await mlService.speechToText({
      audioFile: req.file,
      language
    });

    // Clean up uploaded file
    const fs = require('fs');
    try {
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.warn('Failed to cleanup uploaded file:', cleanupError);
    }

    const response = {
      text: sttResult.text,
      confidence: sttResult.confidence,
      language,
      processingTime: sttResult.processing_time_ms
    };

    // If exerciseId is provided, check if the transcribed text matches the expected answer
    if (exerciseId) {
      const { Exercise } = require('../models');
      const exercise = await Exercise.findByPk(exerciseId);
      
      if (exercise) {
        const isMatch = sttResult.text.toLowerCase().trim() === 
                       exercise.correctAnswer.toLowerCase().trim();
        response.matchesExpected = isMatch;
        response.expectedAnswer = exercise.correctAnswer;
      }
    }

    res.json(response);

  } catch (error) {
    // Clean up uploaded file on error
    const fs = require('fs');
    try {
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.warn('Failed to cleanup uploaded file:', cleanupError);
    }

    console.error('STT processing error:', error);
    res.status(500).json({
      error: 'Failed to process audio',
      details: error.message
    });
  }
});

// @desc    Get supported languages for STT
// @route   GET /api/stt/languages
// @access  Private
const getSupportedLanguages = asyncHandler(async (req, res) => {
  // This would typically come from the ML service
  const supportedLanguages = [
    { code: 'hi', name: 'Hindi' },
    { code: 'te', name: 'Telugu' },
    { code: 'ta', name: 'Tamil' },
    { code: 'bn', name: 'Bengali' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'mr', name: 'Marathi' },
    { code: 'or', name: 'Odia' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'ur', name: 'Urdu' },
    { code: 'en', name: 'English' }
  ];

  res.json({
    languages: supportedLanguages
  });
});

module.exports = {
  submitAudio,
  getSupportedLanguages,
  upload
};