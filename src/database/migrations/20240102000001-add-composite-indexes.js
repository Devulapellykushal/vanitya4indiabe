'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Add composite index on exercises table for language pair and difficulty search
      await queryInterface.addIndex(
        'exercises',
        ['source_language', 'target_language', 'difficulty', 'unit_id'],
        {
          name: 'idx_exercises_lang_diff_unit',
          transaction
        }
      );
      console.log('✅ Added composite index on exercises (source_language, target_language, difficulty, unit_id)');
      
      // Check and add index on user_id in user_progress table if not exists
      const userProgressIndexes = await queryInterface.showIndex('user_progress');
      const hasUserIdIndex = userProgressIndexes.some(index => 
        index.fields && index.fields.some(field => 
          field.attribute === 'user_id' || field.name === 'user_id'
        )
      );
      
      if (!hasUserIdIndex) {
        await queryInterface.addIndex(
          'user_progress',
          ['user_id'],
          {
            name: 'idx_user_progress_user_id',
            transaction
          }
        );
        console.log('✅ Added index on user_progress (user_id)');
      } else {
        console.log('ℹ️ Index on user_progress.user_id already exists');
      }
      
      // Add index on exercise_id in user_progress table if not exists
      const hasExerciseIdIndex = userProgressIndexes.some(index => 
        index.fields && index.fields.some(field => 
          field.attribute === 'exercise_id' || field.name === 'exercise_id'
        )
      );
      
      if (!hasExerciseIdIndex) {
        await queryInterface.addIndex(
          'user_progress',
          ['exercise_id'],
          {
            name: 'idx_user_progress_exercise_id',
            transaction
          }
        );
        console.log('✅ Added index on user_progress (exercise_id)');
      }
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove composite index from exercises table
      await queryInterface.removeIndex(
        'exercises',
        'idx_exercises_lang_diff_unit',
        { transaction }
      );
      console.log('✅ Removed composite index from exercises table');
      
      // Remove index from user_progress table
      await queryInterface.removeIndex(
        'user_progress',
        'idx_user_progress_user_id',
        { transaction }
      );
      console.log('✅ Removed index from user_progress (user_id)');
      
      await queryInterface.removeIndex(
        'user_progress',
        'idx_user_progress_exercise_id',
        { transaction }
      );
      console.log('✅ Removed index from user_progress (exercise_id)');
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};