const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Withdrawal = sequelize.define('Withdrawal', {
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
  amount: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    comment: 'Withdrawal amount'
  },
  currency: {
    type: DataTypes.ENUM('USDT', 'EGD'),
    allowNull: false,
    defaultValue: 'USDT'
  },
  wallet_address: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Destination wallet address'
  },
  network: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'BEP20',
    comment: 'Blockchain network (BEP20, ERC20, etc.)'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'processing', 'completed', 'failed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  withdrawal_fee: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    defaultValue: 0,
    comment: 'Withdrawal fee charged'
  },
  net_amount: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    comment: 'Amount after deducting fees'
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
    comment: 'Gas used for transaction'
  },
  gas_price: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: true,
    comment: 'Gas price for transaction'
  },
  network_fee: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: true,
    comment: 'Network fee paid'
  },
  processed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Admin who processed the withdrawal'
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the withdrawal was processed'
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the withdrawal was approved'
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the withdrawal was completed'
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason for rejection if applicable'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Admin notes about this withdrawal'
  },
  user_balance_before: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: true,
    comment: 'User balance before withdrawal'
  },
  user_balance_after: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: true,
    comment: 'User balance after withdrawal'
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'IP address of the user who requested withdrawal'
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User agent of the client'
  },
  is_manual: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether this withdrawal was processed manually'
  },
  estimated_completion: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Estimated completion time'
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'normal',
    comment: 'Withdrawal priority level'
  }
}, {
  tableName: 'withdrawals',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['currency']
    },
    {
      fields: ['wallet_address']
    },
    {
      fields: ['transaction_hash']
    },
    {
      fields: ['processed_by']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['user_id', 'status']
    },
    {
      fields: ['user_id', 'created_at']
    },
    {
      fields: ['status', 'created_at']
    },
    {
      fields: ['currency', 'status']
    }
  ]
});

// Instance methods
Withdrawal.prototype.getFormattedAmount = function() {
  return `${this.amount} ${this.currency}`;
};

Withdrawal.prototype.getNetAmountFormatted = function() {
  return `${this.net_amount} ${this.currency}`;
};

Withdrawal.prototype.isPending = function() {
  return this.status === 'pending';
};

Withdrawal.prototype.isApproved = function() {
  return this.status === 'approved' || this.status === 'processing' || this.status === 'completed';
};

Withdrawal.prototype.isRejected = function() {
  return this.status === 'rejected';
};

Withdrawal.prototype.isCompleted = function() {
  return this.status === 'completed';
};

Withdrawal.prototype.isFailed = function() {
  return this.status === 'failed';
};

Withdrawal.prototype.canBeProcessed = function() {
  return this.status === 'pending' || this.status === 'approved';
};

Withdrawal.prototype.getProcessingTime = function() {
  if (!this.processed_at || !this.created_at) return null;
  return new Date(this.processed_at) - new Date(this.created_at);
};

module.exports = Withdrawal; 