const { User, Exercise, UserProgress, RLState } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { nextExerciseSchema } = require('../utils/validation');

// @desc    Get next recommended exercise
// @route   GET /api/recommender/next
// @access  Private
const getNextExercise = asyncHandler(async (req, res) => {
  // Validate query parameters
  const { error, value } = nextExerciseSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(d => ({ field: d.context.key, message: d.message }))
    });
  }

  const userId = req.user.userId;
  const { sourceLanguage, targetLanguage, excludeTypes = [] } = value;

  // Get user and their RL state
  const user = await User.findByPk(userId, {
    include: [{
      association: 'rlState',
      required: false
    }]
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Use provided languages or user's preferences
  const srcLang = sourceLanguage || user.currentLanguage;
  const tgtLang = targetLanguage || user.targetLanguage;

  // Get user's RL state or create one
  let rlState = user.rlState;
  if (!rlState) {
    rlState = await RLState.initializeForUser(userId);
  }

  // Get exercises that need retry first (highest priority)
  const retryExercises = await UserProgress.getRetriesNeeded(userId);
  
  if (retryExercises.length > 0) {
    // Return a retry exercise
    const retryExercise = retryExercises[0];
    return res.json({
      exercise: retryExercise.exercise,
      reason: 'retry',
      message: 'This exercise needs a retry based on previous incorrect attempts.',
      retryAttempt: retryExercise.attempts
    });
  }

  // Use RL algorithm to select next exercise type
  const selectedArm = rlState.selectArm();
  
  if (!selectedArm) {
    // Fallback to basic recommendation
    return await fallbackRecommendation(res, srcLang, tgtLang, excludeTypes, user);
  }

  // Parse the selected arm (format: "exerciseType_difficulty")
  const [exerciseType, difficulty] = selectedArm.split('_');

  // Skip if this type is excluded
  if (excludeTypes.includes(exerciseType)) {
    return await fallbackRecommendation(res, srcLang, tgtLang, excludeTypes, user);
  }

  // Find exercises of the recommended type that user hasn't completed
  const completedExerciseIds = await UserProgress.findAll({
    where: { 
      userId,
      correct: true
    },
    attributes: ['exerciseId']
  }).then(results => results.map(r => r.exerciseId));

  let whereClause = {
    sourceLanguage: srcLang,
    targetLanguage: tgtLang,
    exerciseType,
    difficulty,
    status: 'processed'
  };

  if (completedExerciseIds.length > 0) {
    const { Op } = require('sequelize');
    whereClause.id = { [Op.notIn]: completedExerciseIds };
  }

  const recommendedExercise = await Exercise.findOne({
    where: whereClause,
    include: [
      {
        association: 'translations',
        required: false,
        attributes: ['translatedText', 'confidence']
      },
      {
        association: 'ttsEntries',
        required: false,
        where: { status: 'completed' },
        attributes: ['audioUrl', 'durationMs']
      }
    ],
    order: [['createdAt', 'ASC']] // Older exercises first
  });

  if (!recommendedExercise) {
    // No exercises found for recommended type, fallback
    return await fallbackRecommendation(res, srcLang, tgtLang, excludeTypes, user);
  }

  res.json({
    exercise: recommendedExercise,
    reason: 'rl_recommendation',
    message: `Recommended based on ${rlState.algorithm} algorithm.`,
    selectedArm,
    algorithmDetails: {
      algorithm: rlState.algorithm,
      epsilon: rlState.epsilon,
      totalPulls: rlState.totalPulls,
      armStats: rlState.getArmStats().find(stat => stat.arm === selectedArm)
    }
  });
});

// @desc    Record exercise outcome for RL learning
// @route   POST /api/recommender/feedback
// @access  Private
const recordFeedback = asyncHandler(async (req, res) => {
  const { exerciseId, exerciseType, difficulty, correct, responseTime } = req.body;
  const userId = req.user.userId;

  if (!exerciseId || !exerciseType || !difficulty || typeof correct !== 'boolean') {
    return res.status(400).json({
      error: 'exerciseId, exerciseType, difficulty, and correct (boolean) are required'
    });
  }

  // Get user's RL state
  const rlState = await RLState.findOne({ where: { userId } });
  if (!rlState) {
    return res.status(404).json({ error: 'RL state not found for user' });
  }

  // Calculate reward based on correctness and response time
  let reward = correct ? 1 : 0;
  
  // Bonus for quick correct answers (under 10 seconds)
  if (correct && responseTime && responseTime < 10000) {
    reward += 0.2;
  }
  
  // Penalty for very slow answers (over 60 seconds)
  if (responseTime && responseTime > 60000) {
    reward -= 0.1;
  }

  // Ensure reward is between 0 and 1
  reward = Math.max(0, Math.min(1, reward));

  // Update RL state
  const arm = `${exerciseType}_${difficulty}`;
  await rlState.updateArm(arm, reward);

  res.json({
    message: 'Feedback recorded successfully',
    arm,
    reward,
    updatedStats: rlState.getArmStats().find(stat => stat.arm === arm)
  });
});

// @desc    Get user's learning analytics
// @route   GET /api/recommender/analytics
// @access  Private
const getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  // Get user's RL state
  const rlState = await RLState.findOne({ where: { userId } });
  
  if (!rlState) {
    return res.status(404).json({ error: 'RL state not found for user' });
  }

  // Get user progress statistics
  const userStats = await UserProgress.getUserStats(userId);
  
  // Get recent progress
  const recentProgress = await UserProgress.findAll({
    where: { userId },
    include: [{
      association: 'exercise',
      attributes: ['exerciseType', 'difficulty', 'originalQuestion']
    }],
    order: [['timestamp', 'DESC']],
    limit: 10
  });

  res.json({
    rlState: {
      algorithm: rlState.algorithm,
      totalPulls: rlState.totalPulls,
      epsilon: rlState.epsilon,
      armStats: rlState.getArmStats()
    },
    userStats,
    recentProgress: recentProgress.map(progress => ({
      exerciseType: progress.exercise.exerciseType,
      difficulty: progress.exercise.difficulty,
      correct: progress.correct,
      attempts: progress.attempts,
      timestamp: progress.timestamp
    }))
  });
});

// Helper function for fallback recommendation
async function fallbackRecommendation(res, srcLang, tgtLang, excludeTypes, user) {
  const { Op } = require('sequelize');
  
  // Get user's completed exercises
  const completedExerciseIds = await UserProgress.findAll({
    where: { 
      userId: user.id,
      correct: true
    },
    attributes: ['exerciseId']
  }).then(results => results.map(r => r.exerciseId));

  let whereClause = {
    sourceLanguage: srcLang,
    targetLanguage: tgtLang,
    status: 'processed'
  };

  if (excludeTypes.length > 0) {
    whereClause.exerciseType = { [Op.notIn]: excludeTypes };
  }

  if (completedExerciseIds.length > 0) {
    whereClause.id = { [Op.notIn]: completedExerciseIds };
  }

  // Prefer user's current level, fallback to beginner
  const preferredDifficulties = [user.level, 'beginner', 'intermediate', 'advanced']
    .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

  for (const difficulty of preferredDifficulties) {
    const exercise = await Exercise.findOne({
      where: { ...whereClause, difficulty },
      include: [
        {
          association: 'translations',
          required: false,
          attributes: ['translatedText', 'confidence']
        },
        {
          association: 'ttsEntries',
          required: false,
          where: { status: 'completed' },
          attributes: ['audioUrl', 'durationMs']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    if (exercise) {
      return res.json({
        exercise,
        reason: 'fallback',
        message: `Fallback recommendation based on user level: ${difficulty}.`
      });
    }
  }

  // No exercises found
  return res.status(404).json({
    error: 'No suitable exercises found',
    message: 'All available exercises have been completed or excluded.'
  });
}

module.exports = {
  getNextExercise,
  recordFeedback,
  getAnalytics
};