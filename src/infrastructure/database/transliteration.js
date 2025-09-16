module.exports = (sequelize, DataTypes) => {
  const Transliteration = sequelize.define('Transliteration', {
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
    sourceScript: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'source_script'
    },
    targetScript: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'target_script'
    },
    originalText: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'original_text'
    },
    transliteratedText: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'transliterated_text'
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
        isIn: [['aksharamukha', 'ai4bharat', 'ml-service']]
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'transliterations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['exercise_id']
      },
      {
        fields: ['source_script', 'target_script']
      },
      {
        fields: ['provider']
      }
    ]
  });

  return Transliteration;
};