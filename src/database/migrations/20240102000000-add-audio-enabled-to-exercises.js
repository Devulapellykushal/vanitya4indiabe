'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Check if column already exists
      const tableDescription = await queryInterface.describeTable('exercises');
      
      if (!tableDescription.audio_enabled) {
        // Add audio_enabled column to exercises table
        await queryInterface.addColumn(
          'exercises',
          'audio_enabled',
          {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
          },
          { transaction }
        );
        
        console.log('✅ Added audio_enabled column to exercises table');
      } else {
        console.log('ℹ️ audio_enabled column already exists in exercises table');
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
      // Remove audio_enabled column from exercises table
      const tableDescription = await queryInterface.describeTable('exercises');
      
      if (tableDescription.audio_enabled) {
        await queryInterface.removeColumn('exercises', 'audio_enabled', { transaction });
        console.log('✅ Removed audio_enabled column from exercises table');
      }
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};