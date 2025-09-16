module.exports = (sequelize, DataTypes) => {
  const TTSEntry = sequelize.define('TTSEntry', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    language: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    audioUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'audio_url'
    },
    durationMs: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'duration_ms',
      validate: {
        min: 0
      }
    },
    codec: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'mp3'
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'file_size',
      validate: {
        min: 0
      }
    },
    provider: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'ml-service',
      validate: {
        isIn: [['sarvam', 'ml-service']]
      }
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'completed', 'error']]
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'tts_entries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['exercise_id']
      },
      {
        fields: ['language']
      },
      {
        fields: ['provider']
      },
      {
        fields: ['status']
      }
    ]
  });

  // Instance methods
  TTSEntry.prototype.markCompleted = async function(audioUrl, durationMs, codec = 'mp3', fileSize = null) {
    this.audioUrl = audioUrl;
    this.durationMs = durationMs;
    this.codec = codec;
    this.fileSize = fileSize;
    this.status = 'completed';
    await this.save();
  };

  TTSEntry.prototype.markError = async function(error) {
    this.status = 'error';
    this.metadata = {
      ...this.metadata,
      error: error.message,
      errorTimestamp: new Date().toISOString()
    };
    await this.save();
  };

  // Class methods
  TTSEntry.findByLanguage = function(language, options = {}) {
    return this.findAll({
      where: {
        language,
        status: 'completed'
      },
      ...options
    });
  };

  TTSEntry.findPending = function(options = {}) {
    return this.findAll({
      where: {
        status: 'pending'
      },
      ...options
    });
  };

  return TTSEntry;
};