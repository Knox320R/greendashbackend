'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stakings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      package_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'staking_packages',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      stake_amount: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        comment: 'Amount of EGD tokens staked'
      },
      daily_yield_percentage: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false,
        comment: 'Daily yield percentage at the time of staking'
      },
      daily_reward_amount: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        comment: 'Daily reward amount in EGD tokens'
      },
      total_rewards_earned: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        defaultValue: 0,
        comment: 'Total rewards earned so far'
      },
      total_rewards_claimed: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        defaultValue: 0,
        comment: 'Total rewards claimed by user'
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'When staking started'
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Expected end date (start_date + lock_period_days)'
      },
      unlock_date: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Date when staking can be unlocked'
      },
      last_reward_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Last date when rewards were calculated'
      },
      next_reward_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Next date when rewards will be calculated'
      },
      status: {
        type: Sequelize.ENUM('active', 'completed', 'cancelled', 'paused'),
        allowNull: false,
        defaultValue: 'active'
      },
      is_locked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether the staking is still locked'
      },
      lock_period_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 365
      },
      days_elapsed: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of days elapsed since staking started'
      },
      days_remaining: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 365,
        comment: 'Number of days remaining until unlock'
      },
      completion_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Percentage of staking period completed'
      },
      transaction_hash: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Blockchain transaction hash for the staking'
      },
      payment_method: {
        type: Sequelize.ENUM('usdt_bep20', 'egd_tokens'),
        allowNull: false,
        defaultValue: 'usdt_bep20'
      },
      payment_amount: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        comment: 'Amount paid in USDT or EGD'
      },
      payment_currency: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'USDT'
      },
      is_approved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether the staking has been approved by admin'
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Admin notes about this staking'
      },
      referral_bonus_paid: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        defaultValue: 0,
        comment: 'Referral bonus paid for this staking'
      },
      network_bonus_paid: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        defaultValue: 0,
        comment: 'Network bonus paid for this staking'
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
    await queryInterface.addIndex('stakings', ['user_id']);
    await queryInterface.addIndex('stakings', ['package_id']);
    await queryInterface.addIndex('stakings', ['status']);
    await queryInterface.addIndex('stakings', ['start_date']);
    await queryInterface.addIndex('stakings', ['end_date']);
    await queryInterface.addIndex('stakings', ['is_approved']);
    await queryInterface.addIndex('stakings', ['transaction_hash']);
    await queryInterface.addIndex('stakings', ['created_at']);
    
    // Composite indexes for common queries
    await queryInterface.addIndex('stakings', ['user_id', 'status']);
    await queryInterface.addIndex('stakings', ['package_id', 'status']);
    await queryInterface.addIndex('stakings', ['user_id', 'created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('stakings');
  }
}; 