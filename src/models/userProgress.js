module.exports = (sequelize, DataTypes) => {
  const UserProgress = sequelize.define('UserProgress', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    exerciseId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'exercise_id',
      references: {
        model: 'exercises',
        key: 'id'
      }
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    correct: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastAnswer: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'last_answer'
    },
    responseTimeMs: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'response_time_ms',
      validate: {
        min: 0
      }
    },
    needsRetry: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'needs_retry'
    },
    hintUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'hint_used'
    },
    audioPlayed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'audio_played'
    },
    isVoice: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_voice'
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_progress',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'exercise_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['exercise_id']
      },
      {
        fields: ['correct']
      },
      {
        fields: ['needs_retry']
      }
    ]
  });

  // Instance methods
  UserProgress.prototype.recordAttempt = async function(answer, responseTime, isCorrect) {
    this.attempts += 1;
    this.lastAnswer = answer;
    this.responseTimeMs = responseTime;
    this.correct = isCorrect;
    this.timestamp = new Date();
    
    // Set retry flag if incorrect and this is not the first attempt
    if (!isCorrect && this.attempts > 1) {
      this.needsRetry = true;
    } else if (isCorrect) {
      this.needsRetry = false;
    }
    
    await this.save();
  };

  UserProgress.prototype.useHint = async function() {
    this.hintUsed = true;
    await this.save();
  };

  UserProgress.prototype.playAudio = async function() {
    this.audioPlayed = true;
    await this.save();
  };

  // Class methods
  UserProgress.getUserStats = async function(userId) {
    const stats = await this.findAll({
      where: { userId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalExercises'],
        [sequelize.fn('SUM', sequelize.cast(sequelize.col('correct'), 'integer')), 'correctAnswers'],
        [sequelize.fn('AVG', sequelize.col('response_time_ms')), 'avgResponseTime'],
        [sequelize.fn('SUM', sequelize.col('attempts')), 'totalAttempts']
      ],
      raw: true
    });

    return stats[0] || {
      totalExercises: 0,
      correctAnswers: 0,
      avgResponseTime: 0,
      totalAttempts: 0
    };
  };

  UserProgress.getUserProgressByUnit = async function(userId, unitId) {
    return this.findAll({
      where: { userId },
      include: [{
        association: 'exercise',
        where: { unitId },
        attributes: ['id', 'unitId', 'difficulty', 'exerciseType']
      }],
      order: [['timestamp', 'DESC']]
    });
  };

  UserProgress.getRetriesNeeded = async function(userId) {
    return this.findAll({
      where: {
        userId,
        needsRetry: true
      },
      include: [{
        association: 'exercise',
        attributes: ['id', 'originalQuestion', 'difficulty', 'exerciseType']
      }]
    });
  };

  return UserProgress;
};