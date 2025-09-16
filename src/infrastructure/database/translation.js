module.exports = (sequelize, DataTypes) => {
  const Translation = sequelize.define('Translation', {
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
    originalText: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'original_text'
    },
    translatedText: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'translated_text'
    },
    confidence: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 0,
        max: 1
      }
    },
    provider: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'ml-service',
      validate: {
        isIn: [['sarvam', 'ai4bharat', 'ml-service']]
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'translations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['exercise_id']
      },
      {
        fields: ['source_language', 'target_language']
      },
      {
        fields: ['provider']
      }
    ]
  });

  return Translation;
};