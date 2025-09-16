'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create user_progress table
    await queryInterface.createTable('user_progress', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
      attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      correct: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      last_answer: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      response_time_ms: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      needs_retry: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      hint_used: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      audio_played: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create api_usage table
    await queryInterface.createTable('api_usage', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true
      },
      provider: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      endpoint: {
        type: Sequelize.STRING,
        allowNull: true
      },
      credits_used: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      credits_remaining: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      request_payload: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      response_status: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create indexes
    await queryInterface.addIndex('user_progress', ['user_id', 'exercise_id'], { unique: true });
    await queryInterface.addIndex('user_progress', ['user_id']);
    await queryInterface.addIndex('user_progress', ['exercise_id']);
    await queryInterface.addIndex('user_progress', ['correct']);
    await queryInterface.addIndex('user_progress', ['needs_retry']);

    await queryInterface.addIndex('api_usage', ['provider']);
    await queryInterface.addIndex('api_usage', ['created_at']);
    await queryInterface.addIndex('api_usage', ['user_id']);
    await queryInterface.addIndex('api_usage', ['response_status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('api_usage');
    await queryInterface.dropTable('user_progress');
  }
};