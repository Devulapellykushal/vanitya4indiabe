'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Enable UUID extension
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'email'
      },
      provider_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      prefs: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      current_language: {
        type: Sequelize.STRING(10),
        defaultValue: 'hi'
      },
      target_language: {
        type: Sequelize.STRING(10),
        defaultValue: 'te'
      },
      level: {
        type: Sequelize.STRING(20),
        defaultValue: 'beginner'
      },
      hearts: {
        type: Sequelize.INTEGER,
        defaultValue: 5
      },
      max_hearts: {
        type: Sequelize.INTEGER,
        defaultValue: 5
      },
      streak: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      last_activity: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_admin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

    // Create exercises table
    await queryInterface.createTable('exercises', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true
      },
      unit_id: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      source_language: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      target_language: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      difficulty: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      exercise_type: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      original_question: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      original_options: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      correct_answer: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      hint: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      explanation: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sarvam_generated_json: {
        type: Sequelize.JSONB,
        allowNull: true
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

    // Create indexes for exercises
    await queryInterface.addIndex('exercises', ['unit_id']);
    await queryInterface.addIndex('exercises', ['source_language', 'target_language']);
    await queryInterface.addIndex('exercises', ['difficulty']);
    await queryInterface.addIndex('exercises', ['status']);
    await queryInterface.addIndex('exercises', ['exercise_type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('exercises');
    await queryInterface.dropTable('users');
  }
};