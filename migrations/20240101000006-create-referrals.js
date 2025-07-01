'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('referrals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      referrer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'User who referred someone'
      },
      referred_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'User who was referred'
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Referral level (1 = direct, 2 = indirect, etc.)'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this referral relationship is active'
      },
      total_earned: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        defaultValue: 0,
        comment: 'Total earnings from this referral'
      },
      total_invested: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        defaultValue: 0,
        comment: 'Total amount invested by referred user'
      },
      total_staked: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        defaultValue: 0,
        comment: 'Total amount staked by referred user'
      },
      direct_cashback_paid: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        defaultValue: 0,
        comment: 'Direct cashback paid to referrer'
      },
      network_cashback_paid: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        defaultValue: 0,
        comment: 'Network cashback paid to referrer'
      },
      last_activity: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Last activity from referred user'
      },
      joined_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'When the referred user joined'
      },
      first_investment_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When the referred user made first investment'
      },
      first_staking_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When the referred user made first staking'
      },
      referral_path: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Full referral path from root to this user'
      },
      commission_rate: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false,
        defaultValue: 0.05,
        comment: 'Commission rate for this level (5% = 0.05)'
      },
      is_qualified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether the referred user has qualified for commissions'
      },
      qualification_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When the referred user qualified for commissions'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Admin notes about this referral'
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
    await queryInterface.addIndex('referrals', ['referrer_id']);
    await queryInterface.addIndex('referrals', ['referred_id']);
    await queryInterface.addIndex('referrals', ['level']);
    await queryInterface.addIndex('referrals', ['is_active']);
    await queryInterface.addIndex('referrals', ['joined_at']);
    await queryInterface.addIndex('referrals', ['created_at']);
    
    // Composite indexes for common queries
    await queryInterface.addIndex('referrals', ['referrer_id', 'level']);
    await queryInterface.addIndex('referrals', ['referrer_id', 'is_active']);
    await queryInterface.addIndex('referrals', ['referred_id', 'level']);
    await queryInterface.addIndex('referrals', ['level', 'is_active']);
    
    // Unique constraint to prevent duplicate referrals
    await queryInterface.addConstraint('referrals', {
      fields: ['referrer_id', 'referred_id'],
      type: 'unique',
      name: 'unique_referral_relationship'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('referrals');
  }
}; 