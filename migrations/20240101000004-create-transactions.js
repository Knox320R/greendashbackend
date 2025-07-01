'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('transactions', {
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
      transaction_type: {
        type: Sequelize.ENUM(
          'staking_payment',
          'staking_reward',
          'referral_bonus',
          'network_bonus',
          'universal_bonus',
          'performance_bonus',
          'viral_bonus',
          'token_purchase',
          'token_sale',
          'withdrawal_request',
          'withdrawal_approved',
          'withdrawal_rejected',
          'token_conversion',
          'fee_collection',
          'refund'
        ),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
        comment: 'Transaction amount'
      },
      currency: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'EGD',
        comment: 'Currency of the transaction (EGD, USDT, etc.)'
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'cancelled', 'processing'),
        allowNull: false,
        defaultValue: 'pending'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Human-readable description of the transaction'
      },
      reference_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Reference to related entity (staking_id, withdrawal_id, etc.)'
      },
      reference_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Type of reference (staking, withdrawal, etc.)'
      },
      wallet_address: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Wallet address involved in the transaction'
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
        comment: 'Gas used for blockchain transaction'
      },
      gas_price: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
        comment: 'Gas price for blockchain transaction'
      },
      network_fee: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
        comment: 'Network fee paid'
      },
      platform_fee: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
        comment: 'Platform fee collected'
      },
      exchange_rate: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
        comment: 'Exchange rate at the time of transaction'
      },
      balance_before: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
        comment: 'User balance before transaction'
      },
      balance_after: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
        comment: 'User balance after transaction'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Additional transaction metadata'
      },
      processed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Admin who processed this transaction'
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When the transaction was processed'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Admin notes about this transaction'
      },
      is_manual: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether this transaction was created manually by admin'
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'IP address of the user who initiated the transaction'
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User agent of the client'
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
    await queryInterface.addIndex('transactions', ['user_id']);
    await queryInterface.addIndex('transactions', ['transaction_type']);
    await queryInterface.addIndex('transactions', ['currency']);
    await queryInterface.addIndex('transactions', ['status']);
    await queryInterface.addIndex('transactions', ['transaction_hash']);
    await queryInterface.addIndex('transactions', ['wallet_address']);
    await queryInterface.addIndex('transactions', ['created_at']);
    
    // Composite indexes for common queries
    await queryInterface.addIndex('transactions', ['user_id', 'transaction_type']);
    await queryInterface.addIndex('transactions', ['user_id', 'status']);
    await queryInterface.addIndex('transactions', ['user_id', 'created_at']);
    await queryInterface.addIndex('transactions', ['transaction_type', 'status']);
    await queryInterface.addIndex('transactions', ['currency', 'status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('transactions');
  }
}; 