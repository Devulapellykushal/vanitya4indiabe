const { Exercise, UserProgress, User, Translation, Transliteration, TTSEntry } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { 
  exerciseSubmissionSchema, 
  exerciseGenerationSchema, 
  audioGenerationSchema,
  paginationSchema,
  uuidParamSchema 
} = require('../utils/validation');
const mlService = require('../services/mlService');
const exerciseQueue = require('../jobs/exerciseQueue');

// @desc    Fetch exercises for user
// @route   GET /api/exercises/fetch
// @access  Private
const fetchExercises = asyncHandler(async (req, res) => {
  // Validate query parameters
  const { error, value } = paginationSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(d => ({ field: d.context.key, message: d.message }))
    });
  }

  const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = value;
  const offset = (page - 1) * limit;

  const user = await User.findByPk(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Get exercises for user's language pair
  const exercises = await Exercise.findAndCountAll({
    where: {
      sourceLanguage: user.currentLanguage,
      targetLanguage: user.targetLanguage,
      status: 'processed'
    },
    include: [
      {
        association: 'userProgress',
        where: { userId: user.id },
        required: false,
        attributes: ['attempts', 'correct', 'needsRetry', 'hintUsed']
      },
      {
        association: 'translations',
        required: false,
        attributes: ['translatedText', 'confidence']
      },
      {
        association: 'transliterations',
        required: false,
        attributes: ['transliteratedText', 'confidence']
      },
      {
        association: 'ttsEntries',
        required: false,
        where: { status: 'completed' },
        attributes: ['audioUrl', 'durationMs']
      }
    ],
    order: [[sortBy, sortOrder]],
    limit,
    offset,
    distinct: true
  });

  res.json({
    exercises: exercises.rows,
    pagination: {
      page,
      limit,
      total: exercises.count,
      pages: Math.ceil(exercises.count / limit)
    }
  });
});

// @desc    Submit exercise answer
// @route   POST /api/exercises/submit
// @access  Private
const submitExercise = asyncHandler(async (req, res) => {
  // Validate request body
  const { error, value } = exerciseSubmissionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(d => ({ field: d.context.key, message: d.message }))
    });
  }

  const { exerciseId, answer, responseTime, hintUsed = false, audioPlayed = false } = value;
  const userId = req.user.userId;

  // Get exercise
  const exercise = await Exercise.findByPk(exerciseId);
  if (!exercise) {
    return res.status(404).json({ error: 'Exercise not found' });
  }

  // Get user
  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if answer is correct
  const isCorrect = answer.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();

  // Handle hearts system
  let heartUsed = false;
  if (!isCorrect) {
    const heartUsedSuccessfully = await user.useHeart();
    heartUsed = heartUsedSuccessfully;
    
    if (!heartUsedSuccessfully) {
      return res.status(400).json({
        error: 'No hearts remaining',
        heartsRemaining: user.hearts
      });
    }
  }

  // Find or create user progress
  const [userProgress, created] = await UserProgress.findOrCreate({
    where: { userId, exerciseId },
    defaults: {
      userId,
      exerciseId,
      attempts: 0,
      correct: false
    }
  });

  // Record the attempt
  await userProgress.recordAttempt(answer, responseTime, isCorrect);

  // Update hint and audio flags if used
  if (hintUsed) {
    await userProgress.useHint();
  }
  if (audioPlayed) {
    await userProgress.playAudio();
  }

  // Update user streak
  if (isCorrect) {
    user.streak += 1;
    await user.save();
  } else if (userProgress.attempts === 1) {
    // Only reset streak on first wrong attempt
    user.streak = 0;
    await user.save();
  }

  // Prepare response
  const response = {
    correct: isCorrect,
    attempts: userProgress.attempts,
    explanation: isCorrect ? null : exercise.explanation,
    correctAnswer: isCorrect ? null : exercise.correctAnswer,
    heartUsed,
    heartsRemaining: user.hearts,
    streak: user.streak
  };

  // If incorrect and user has hearts, allow retry
  if (!isCorrect && user.hearts > 0) {
    response.canRetry = true;
    response.hint = exercise.hint;
  }

  res.json(response);
});

// @desc    Generate new exercises
// @route   POST /api/exercises/generate
// @access  Private
const generateExercises = asyncHandler(async (req, res) => {
  // Validate request body
  const { error, value } = exerciseGenerationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(d => ({ field: d.context.key, message: d.message }))
    });
  }

  const { sourceLanguage, targetLanguage, difficulty, exerciseType, unitId, count = 1 } = value;

  try {
    // Call ML service to generate exercises
    const generatedExercises = await mlService.generateExercises({
      sourceLanguage,
      targetLanguage,
      difficulty,
      exerciseType,
      unitId,
      count
    });

    // Create exercise records in database
    const exercises = [];
    for (const exerciseData of generatedExercises.exercises) {
      const exercise = await Exercise.create({
        unitId,
        sourceLanguage,
        targetLanguage,
        difficulty,
        exerciseType,
        originalQuestion: exerciseData.question,
        originalOptions: exerciseData.options,
        correctAnswer: exerciseData.correctAnswer,
        hint: exerciseData.hint,
        explanation: exerciseData.explanation,
        sarvamGeneratedJson: exerciseData,
        status: 'pending'
      });

      exercises.push(exercise);

      // Queue background processing for translations, transliterations, and TTS
      await exerciseQueue.add('processExercise', {
        exerciseId: exercise.id,
        exerciseType,
        sourceLanguage,
        targetLanguage
      });
    }

    res.status(201).json({
      message: `${exercises.length} exercises generated successfully`,
      exercises: exercises.map(ex => ex.toJSON()),
      processingStatus: 'Translations and audio generation queued'
    });

  } catch (error) {
    console.error('Exercise generation error:', error);
    res.status(500).json({
      error: 'Failed to generate exercises',
      details: error.message
    });
  }
});

// @desc    Generate audio for exercise
// @route   POST /api/exercises/:id/audio
// @access  Private
const generateAudio = asyncHandler(async (req, res) => {
  // Validate params
  const { error: paramError, value: paramValue } = uuidParamSchema.validate(req.params);
  if (paramError) {
    return res.status(400).json({
      error: 'Invalid exercise ID'
    });
  }

  // Validate request body
  const { error, value } = audioGenerationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(d => ({ field: d.context.key, message: d.message }))
    });
  }

  const { id } = paramValue;
  const { text, language } = value;

  // Get exercise
  const exercise = await Exercise.findByPk(id);
  if (!exercise) {
    return res.status(404).json({ error: 'Exercise not found' });
  }

  try {
    // Call ML service to generate TTS
    const ttsResult = await mlService.generateTTS({
      text,
      language
    });

    // Create TTS entry
    const ttsEntry = await TTSEntry.create({
      exerciseId: id,
      text,
      language,
      audioUrl: ttsResult.audio_url,
      durationMs: ttsResult.duration_ms,
      codec: ttsResult.codec || 'mp3',
      provider: 'ml-service',
      status: 'completed'
    });

    res.json({
      message: 'Audio generated successfully',
      audio: {
        url: ttsEntry.audioUrl,
        duration: ttsEntry.durationMs,
        codec: ttsEntry.codec
      }
    });

  } catch (error) {
    console.error('Audio generation error:', error);
    res.status(500).json({
      error: 'Failed to generate audio',
      details: error.message
    });
  }
});

// @desc    Get exercise by ID
// @route   GET /api/exercises/:id
// @access  Private
const getExercise = asyncHandler(async (req, res) => {
  // Validate params
  const { error, value } = uuidParamSchema.validate(req.params);
  if (error) {
    return res.status(400).json({
      error: 'Invalid exercise ID'
    });
  }

  const { id } = value;
  const userId = req.user.userId;

  const exercise = await Exercise.findByPk(id, {
    include: [
      {
        association: 'userProgress',
        where: { userId },
        required: false,
        attributes: ['attempts', 'correct', 'needsRetry', 'hintUsed', 'audioPlayed']
      },
      {
        association: 'translations',
        required: false,
        attributes: ['translatedText', 'confidence']
      },
      {
        association: 'transliterations',
        required: false,
        attributes: ['transliteratedText', 'confidence']
      },
      {
        association: 'ttsEntries',
        required: false,
        where: { status: 'completed' },
        attributes: ['audioUrl', 'durationMs', 'codec']
      }
    ]
  });

  if (!exercise) {
    return res.status(404).json({ error: 'Exercise not found' });
  }

  res.json({ exercise });
});

module.exports = {
  fetchExercises,
  submitExercise,
  generateExercises,
  generateAudio,
  getExercise
};