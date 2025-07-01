'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('staking_packages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      min_stake_amount: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        comment: 'Minimum stake amount in USDT'
      },
      max_stake_amount: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        comment: 'Maximum stake amount in USDT'
      },
      daily_yield_percentage: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false,
        comment: 'Daily yield percentage (e.g., 0.05 for 5%)'
      },
      lock_period_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 365,
        comment: 'Lock period in days'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this package is available for staking'
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Display order for packages'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('staking_packages', ['is_active']);
    await queryInterface.addIndex('staking_packages', ['sort_order']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('staking_packages');
  }
}; 