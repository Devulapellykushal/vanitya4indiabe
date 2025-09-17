'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Check if column already exists
      const tableDescription = await queryInterface.describeTable('user_progress');
      
      if (!tableDescription.is_voice) {
        // Add is_voice column to user_progress table
        await queryInterface.addColumn(
          'user_progress',
          'is_voice',
          {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
          },
          { transaction }
        );
        
        console.log('✅ Added is_voice column to user_progress table');
      } else {
        console.log('ℹ️ is_voice column already exists in user_progress table');
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
      // Remove is_voice column from user_progress table
      const tableDescription = await queryInterface.describeTable('user_progress');
      
      if (tableDescription.is_voice) {
        await queryInterface.removeColumn('user_progress', 'is_voice', { transaction });
        console.log('✅ Removed is_voice column from user_progress table');
      }
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};