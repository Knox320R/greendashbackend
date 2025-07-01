'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('withdrawals', {
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
      amount: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        comment: 'Withdrawal amount'
      },
      currency: {
        type: Sequelize.ENUM('USDT', 'EGD'),
        allowNull: false,
        defaultValue: 'USDT'
      },
      wallet_address: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Destination wallet address'
      },
      network: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'BEP20',
        comment: 'Blockchain network (BEP20, ERC20, etc.)'
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'processing', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      withdrawal_fee: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        defaultValue: 0,
        comment: 'Withdrawal fee charged'
      },
      net_amount: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        comment: 'Amount after deducting fees'
      },
      transaction_hash: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Blockchain transaction hash'
      },
      block_number: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Block number on blockchain'
      },
      gas_used: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
        comment: 'Gas used for transaction'
      },
      gas_price: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
        comment: 'Gas price for transaction'
      },
      network_fee: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
        comment: 'Network fee paid'
      },
      processed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Admin who processed the withdrawal'
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When the withdrawal was processed'
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When the withdrawal was approved'
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When the withdrawal was completed'
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Reason for rejection if applicable'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Admin notes about this withdrawal'
      },
      user_balance_before: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
        comment: 'User balance before withdrawal'
      },
      user_balance_after: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
        comment: 'User balance after withdrawal'
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'IP address of the user who requested withdrawal'
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User agent of the client'
      },
      is_manual: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether this withdrawal was processed manually'
      },
      estimated_completion: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Estimated completion time'
      },
      priority: {
        type: Sequelize.ENUM('low', 'normal', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'normal',
        comment: 'Withdrawal priority level'
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
    await queryInterface.addIndex('withdrawals', ['user_id']);
    await queryInterface.addIndex('withdrawals', ['status']);
    await queryInterface.addIndex('withdrawals', ['currency']);
    await queryInterface.addIndex('withdrawals', ['wallet_address']);
    await queryInterface.addIndex('withdrawals', ['transaction_hash']);
    await queryInterface.addIndex('withdrawals', ['processed_by']);
    await queryInterface.addIndex('withdrawals', ['created_at']);
    
    // Composite indexes for common queries
    await queryInterface.addIndex('withdrawals', ['user_id', 'status']);
    await queryInterface.addIndex('withdrawals', ['user_id', 'created_at']);
    await queryInterface.addIndex('withdrawals', ['status', 'created_at']);
    await queryInterface.addIndex('withdrawals', ['currency', 'status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('withdrawals');
  }
}; 