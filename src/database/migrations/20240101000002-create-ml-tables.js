'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create translations table
    await queryInterface.createTable('translations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true
      },
      exercise_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'exercises',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      source_language: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      target_language: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      original_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      translated_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      confidence: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      provider: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'ml-service'
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create transliterations table
    await queryInterface.createTable('transliterations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true
      },
      exercise_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'exercises',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      source_script: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      target_script: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      original_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      transliterated_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      confidence: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      provider: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'ml-service'
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create tts_entries table
    await queryInterface.createTable('tts_entries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true
      },
      exercise_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'exercises',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      language: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      audio_url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      duration_ms: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      codec: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: 'mp3'
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      provider: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'ml-service'
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: 'pending'
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create rl_states table
    await queryInterface.createTable('rl_states', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      algorithm: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'epsilon-greedy'
      },
      epsilon: {
        type: Sequelize.FLOAT,
        defaultValue: 0.1
      },
      arm_weights: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      arm_counts: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      rewards: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      total_pulls: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      last_reward: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      last_action: {
        type: Sequelize.STRING,
        allowNull: true
      },
      exploration_rate: {
        type: Sequelize.FLOAT,
        defaultValue: 0.5
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create indexes
    await queryInterface.addIndex('translations', ['exercise_id']);
    await queryInterface.addIndex('translations', ['source_language', 'target_language']);
    await queryInterface.addIndex('translations', ['provider']);

    await queryInterface.addIndex('transliterations', ['exercise_id']);
    await queryInterface.addIndex('transliterations', ['source_script', 'target_script']);
    await queryInterface.addIndex('transliterations', ['provider']);

    await queryInterface.addIndex('tts_entries', ['exercise_id']);
    await queryInterface.addIndex('tts_entries', ['language']);
    await queryInterface.addIndex('tts_entries', ['provider']);
    await queryInterface.addIndex('tts_entries', ['status']);

    await queryInterface.addIndex('rl_states', ['user_id'], { unique: true });
    await queryInterface.addIndex('rl_states', ['algorithm']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('rl_states');
    await queryInterface.dropTable('tts_entries');
    await queryInterface.dropTable('transliterations');
    await queryInterface.dropTable('translations');
  }
};