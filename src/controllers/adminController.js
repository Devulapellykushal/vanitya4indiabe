const { asyncHandler } = require('../middleware/errorHandler');
const { configUpdateSchema } = require('../utils/validation');
const config = require('../config');
const { APIUsage, User, Exercise } = require('../models');

// @desc    Update configuration
// @route   POST /api/admin/config/update
// @access  Admin only
const updateConfig = asyncHandler(async (req, res) => {
  // Validate request body
  const { error, value } = configUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(d => ({ field: d.context.key, message: d.message }))
    });
  }

  // Update configuration
  config.update(value);

  // Log the configuration update
  await APIUsage.recordUsage({
    provider: 'admin',
    endpoint: '/admin/config/update',
    creditsUsed: 0,
    responseStatus: 200,
    requestPayload: { updatedKeys: Object.keys(value) },
    userId: req.user.userId
  });

  res.json({
    message: 'Configuration updated successfully',
    updatedFields: Object.keys(value)
  });
});

// @desc    Get current configuration (non-sensitive)
// @route   GET /api/admin/config
// @access  Admin only
const getConfig = asyncHandler(async (req, res) => {
  const safeConfig = {
    DEFAULT_SOURCE_LANG: config.get('DEFAULT_SOURCE_LANG'),
    DEFAULT_TARGET_LANG: config.get('DEFAULT_TARGET_LANG'),
    SARVAM_FREE_CREDITS: config.get('SARVAM_FREE_CREDITS'),
    SARVAM_API_URL: config.get('SARVAM_API_URL'),
    ML_SERVICE_URL: config.get('ML_SERVICE_URL'),
    NODE_ENV: config.get('NODE_ENV'),
    // Don't expose sensitive keys
    SARVAM_API_KEY: config.get('SARVAM_API_KEY') ? '***' : null,
    AI4BHARAT_API_KEY: config.get('AI4BHARAT_API_KEY') ? '***' : null
  };

  res.json({
    config: safeConfig
  });
});

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Admin only
const getStats = asyncHandler(async (req, res) => {
  const timeframe = req.query.timeframe || '24h';

  // Get user statistics
  const totalUsers = await User.count();
  const activeUsers = await User.count({
    where: {
      isActive: true,
      lastActivity: {
        [require('sequelize').Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    }
  });

  // Get exercise statistics
  const totalExercises = await Exercise.count();
  const processedExercises = await Exercise.count({
    where: { status: 'processed' }
  });
  const pendingExercises = await Exercise.count({
    where: { status: 'pending' }
  });

  // Get API usage statistics
  const apiStats = await Promise.all([
    APIUsage.getUsageStats('sarvam', timeframe),
    APIUsage.getUsageStats('ai4bharat', timeframe),
    APIUsage.getUsageStats('ml-service', timeframe)
  ]);

  res.json({
    users: {
      total: totalUsers,
      active: activeUsers,
      activePercentage: totalUsers > 0 ? (activeUsers / totalUsers * 100).toFixed(2) : 0
    },
    exercises: {
      total: totalExercises,
      processed: processedExercises,
      pending: pendingExercises,
      processedPercentage: totalExercises > 0 ? (processedExercises / totalExercises * 100).toFixed(2) : 0
    },
    apiUsage: {
      sarvam: apiStats[0],
      ai4bharat: apiStats[1],
      mlService: apiStats[2]
    },
    timeframe
  });
});

// @desc    Get API usage analytics
// @route   GET /api/admin/analytics/api-usage
// @access  Admin only
const getAPIAnalytics = asyncHandler(async (req, res) => {
  const { provider, timeframe = '24h' } = req.query;

  if (provider) {
    // Get stats for specific provider
    const stats = await APIUsage.getUsageStats(provider, timeframe);
    res.json({ provider, stats, timeframe });
  } else {
    // Get stats for all providers
    const providers = ['sarvam', 'ai4bharat', 'ml-service'];
    const allStats = {};

    for (const prov of providers) {
      allStats[prov] = await APIUsage.getUsageStats(prov, timeframe);
    }

    res.json({ stats: allStats, timeframe });
  }
});

// @desc    Get user analytics
// @route   GET /api/admin/analytics/users
// @access  Admin only
const getUserAnalytics = asyncHandler(async (req, res) => {
  const { sequelize } = require('../models');

  // User registration trends (last 30 days)
  const registrationTrends = await User.findAll({
    attributes: [
      [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: {
      createdAt: {
        [sequelize.Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    },
    group: [sequelize.fn('DATE', sequelize.col('created_at'))],
    order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
    raw: true
  });

  // Language preferences
  const languageStats = await User.findAll({
    attributes: [
      'currentLanguage',
      'targetLanguage',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['currentLanguage', 'targetLanguage'],
    raw: true
  });

  // User levels
  const levelStats = await User.findAll({
    attributes: [
      'level',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['level'],
    raw: true
  });

  res.json({
    registrationTrends,
    languagePreferences: languageStats,
    levelDistribution: levelStats
  });
});

// @desc    Manage users (list, activate, deactivate)
// @route   GET/PUT /api/admin/users
// @access  Admin only
const manageUsers = asyncHandler(async (req, res) => {
  if (req.method === 'GET') {
    // List users with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const users = await User.findAndCountAll({
      attributes: ['id', 'email', 'name', 'provider', 'level', 'hearts', 'streak', 'isActive', 'lastActivity', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      users: users.rows,
      pagination: {
        page,
        limit,
        total: users.count,
        pages: Math.ceil(users.count / limit)
      }
    });
  } else if (req.method === 'PUT') {
    // Update user status
    const { userId, isActive } = req.body;

    if (!userId || typeof isActive !== 'boolean') {
      return res.status(400).json({
        error: 'userId and isActive (boolean) are required'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ isActive });

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user.id,
        email: user.email,
        isActive: user.isActive
      }
    });
  }
});

module.exports = {
  updateConfig,
  getConfig,
  getStats,
  getAPIAnalytics,
  getUserAnalytics,
  manageUsers
};