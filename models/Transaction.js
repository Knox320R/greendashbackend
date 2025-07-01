const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  transaction_type: {
    type: DataTypes.ENUM(
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
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    comment: 'Transaction amount'
  },
  currency: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'EGD',
    comment: 'Currency of the transaction (EGD, USDT, etc.)'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled', 'processing'),
    allowNull: false,
    defaultValue: 'pending'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Human-readable description of the transaction'
  },
  reference_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Reference to related entity (staking_id, withdrawal_id, etc.)'
  },
  reference_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Type of reference (staking, withdrawal, etc.)'
  },
  wallet_address: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Wallet address involved in the transaction'
  },
  transaction_hash: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Blockchain transaction hash'
  },
  block_number: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Block number on blockchain'
  },
  gas_used: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: true,
    comment: 'Gas used for blockchain transaction'
  },
  gas_price: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: true,
    comment: 'Gas price for blockchain transaction'
  },
  network_fee: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: true,
    comment: 'Network fee paid'
  },
  platform_fee: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: true,
    comment: 'Platform fee collected'
  },
  exchange_rate: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: true,
    comment: 'Exchange rate at the time of transaction'
  },
  balance_before: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: true,
    comment: 'User balance before transaction'
  },
  balance_after: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: true,
    comment: 'User balance after transaction'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional transaction metadata'
  },
  processed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Admin who processed this transaction'
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the transaction was processed'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Admin notes about this transaction'
  },
  is_manual: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether this transaction was created manually by admin'
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'IP address of the user who initiated the transaction'
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User agent of the client'
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['transaction_type']
    },
    {
      fields: ['currency']
    },
    {
      fields: ['status']
    },
    {
      fields: ['transaction_hash']
    },
    {
      fields: ['wallet_address']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['user_id', 'transaction_type']
    },
    {
      fields: ['user_id', 'status']
    },
    {
      fields: ['user_id', 'created_at']
    },
    {
      fields: ['transaction_type', 'status']
    },
    {
      fields: ['currency', 'status']
    }
  ]
});

// Instance methods
Transaction.prototype.getFormattedAmount = function() {
  return `${this.amount} ${this.currency}`;
};

Transaction.prototype.isBlockchainTransaction = function() {
  return this.transaction_hash && this.block_number;
};

Transaction.prototype.isPending = function() {
  return this.status === 'pending' || this.status === 'processing';
};

Transaction.prototype.isCompleted = function() {
  return this.status === 'completed';
};

Transaction.prototype.isFailed = function() {
  return this.status === 'failed' || this.status === 'cancelled';
};

module.exports = Transaction; 