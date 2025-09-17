module.exports = (sequelize, DataTypes) => {
  const Exercise = sequelize.define('Exercise', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    unitId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'unit_id'
    },
    sourceLanguage: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'source_language'
    },
    targetLanguage: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'target_language'
    },
    difficulty: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['beginner', 'intermediate', 'advanced']]
      }
    },
    exerciseType: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: 'exercise_type',
      validate: {
        isIn: [['translation', 'transliteration', 'listening', 'speaking', 'matching']]
      }
    },
    originalQuestion: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'original_question'
    },
    originalOptions: {
      type: DataTypes.JSONB,
      allowNull: false,
      field: 'original_options',
      validate: {
        isValidOptions(value) {
          if (!Array.isArray(value) || value.length < 2) {
            throw new Error('Options must be an array with at least 2 items');
          }
        }
      }
    },
    correctAnswer: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'correct_answer'
    },
    audioEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'audio_enabled'
    },
    hint: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sarvamGeneratedJson: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'sarvam_generated_json'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'processed', 'error']]
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'exercises',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['unit_id']
      },
      {
        fields: ['source_language', 'target_language']
      },
      {
        fields: ['difficulty']
      },
      {
        fields: ['status']
      },
      {
        fields: ['exercise_type']
      }
    ]
  });

  // Instance methods
  Exercise.prototype.markAsProcessed = async function() {
    this.status = 'processed';
    await this.save();
  };

  Exercise.prototype.markAsError = async function(error) {
    this.status = 'error';
    this.metadata = {
      ...this.metadata,
      error: error.message,
      errorTimestamp: new Date().toISOString()
    };
    await this.save();
  };

  Exercise.prototype.updateMetadata = async function(updates) {
    this.metadata = {
      ...this.metadata,
      ...updates
    };
    await this.save();
  };

  // Class methods
  Exercise.findByLanguagePair = function(sourceLanguage, targetLanguage, options = {}) {
    return this.findAll({
      where: {
        sourceLanguage,
        targetLanguage,
        status: 'processed'
      },
      ...options
    });
  };

  Exercise.findByDifficulty = function(difficulty, options = {}) {
    return this.findAll({
      where: {
        difficulty,
        status: 'processed'
      },
      ...options
    });
  };

  Exercise.findByUnit = function(unitId, options = {}) {
    return this.findAll({
      where: {
        unitId,
        status: 'processed'
      },
      ...options
    });
  };

  return Exercise;
};