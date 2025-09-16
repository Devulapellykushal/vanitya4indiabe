module.exports = (sequelize, DataTypes) => {
  const APIUsage = sequelize.define('APIUsage', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    provider: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['sarvam', 'ai4bharat', 'aksharamukha', 'ml-service']]
      }
    },
    endpoint: {
      type: DataTypes.STRING,
      allowNull: true
    },
    creditsUsed: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      field: 'credits_used',
      validate: {
        min: 0
      }
    },
    creditsRemaining: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'credits_remaining',
      validate: {
        min: 0
      }
    },
    requestPayload: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'request_payload'
    },
    responseStatus: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'response_status'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_message'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'api_usage',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        fields: ['provider']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['response_status']
      }
    ]
  });

  // Class methods
  APIUsage.recordUsage = async function(data) {
    return this.create({
      provider: data.provider,
      endpoint: data.endpoint,
      creditsUsed: data.creditsUsed || 1,
      creditsRemaining: data.creditsRemaining,
      requestPayload: data.requestPayload,
      responseStatus: data.responseStatus,
      errorMessage: data.errorMessage,
      userId: data.userId
    });
  };

  APIUsage.getUsageStats = async function(provider, timeframe = '24h') {
    const timeMap = {
      '1h': 1,
      '24h': 24,
      '7d': 24 * 7,
      '30d': 24 * 30
    };

    const hours = timeMap[timeframe] || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const stats = await this.findAll({
      where: {
        provider,
        createdAt: {
          [sequelize.Sequelize.Op.gte]: since
        }
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalRequests'],
        [sequelize.fn('SUM', sequelize.col('credits_used')), 'totalCredits'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN response_status >= 400 THEN 1 END')), 'errorCount'],
        [sequelize.fn('AVG', sequelize.col('credits_used')), 'avgCreditsPerRequest']
      ],
      raw: true
    });

    return stats[0] || {
      totalRequests: 0,
      totalCredits: 0,
      errorCount: 0,
      avgCreditsPerRequest: 0
    };
  };

  APIUsage.getUserUsage = async function(userId, provider = null, timeframe = '24h') {
    const timeMap = {
      '1h': 1,
      '24h': 24,
      '7d': 24 * 7,
      '30d': 24 * 30
    };

    const hours = timeMap[timeframe] || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const where = {
      userId,
      createdAt: {
        [sequelize.Sequelize.Op.gte]: since
      }
    };

    if (provider) {
      where.provider = provider;
    }

    return this.findAll({
      where,
      attributes: [
        'provider',
        [sequelize.fn('COUNT', sequelize.col('id')), 'requests'],
        [sequelize.fn('SUM', sequelize.col('credits_used')), 'credits']
      ],
      group: ['provider'],
      raw: true
    });
  };

  APIUsage.checkRateLimit = async function(userId, provider, maxRequests = 100, timeWindow = '1h') {
    const timeMap = {
      '1h': 1,
      '24h': 24,
      '7d': 24 * 7
    };

    const hours = timeMap[timeWindow] || 1;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const count = await this.count({
      where: {
        userId,
        provider,
        createdAt: {
          [sequelize.Sequelize.Op.gte]: since
        }
      }
    });

    return {
      allowed: count < maxRequests,
      currentCount: count,
      maxRequests,
      timeWindow
    };
  };

  return APIUsage;
};