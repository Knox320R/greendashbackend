const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Staking = sequelize.define('Staking', {
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
  package_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'staking_packages',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  stake_amount: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    comment: 'Amount of EGD tokens staked'
  },
  daily_yield_percentage: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: false,
    comment: 'Daily yield percentage at the time of staking'
  },
  daily_reward_amount: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    comment: 'Daily reward amount in EGD tokens'
  },
  total_rewards_earned: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total rewards earned so far'
  },
  total_rewards_claimed: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total rewards claimed by user'
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'When staking started'
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Expected end date (start_date + lock_period_days)'
  },
  unlock_date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Date when staking can be unlocked'
  },
  last_reward_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last date when rewards were calculated'
  },
  next_reward_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Next date when rewards will be calculated'
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled', 'paused'),
    allowNull: false,
    defaultValue: 'active'
  },
  is_locked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether the staking is still locked'
  },
  lock_period_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 365
  },
  days_elapsed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Number of days elapsed since staking started'
  },
  days_remaining: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 365,
    comment: 'Number of days remaining until unlock'
  },
  completion_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Percentage of staking period completed'
  },
  transaction_hash: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Blockchain transaction hash for the staking'
  },
  payment_method: {
    type: DataTypes.ENUM('usdt_bep20', 'egd_tokens'),
    allowNull: false,
    defaultValue: 'usdt_bep20'
  },
  payment_amount: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    comment: 'Amount paid in USDT or EGD'
  },
  payment_currency: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'USDT'
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether the staking has been approved by admin'
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Admin notes about this staking'
  },
  referral_bonus_paid: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    defaultValue: 0,
    comment: 'Referral bonus paid for this staking'
  },
  network_bonus_paid: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    defaultValue: 0,
    comment: 'Network bonus paid for this staking'
  }
}, {
  tableName: 'stakings',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['package_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['start_date']
    },
    {
      fields: ['end_date']
    },
    {
      fields: ['is_approved']
    },
    {
      fields: ['transaction_hash']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['user_id', 'status']
    },
    {
      fields: ['package_id', 'status']
    },
    {
      fields: ['user_id', 'created_at']
    }
  ]
});

// Instance methods
Staking.prototype.calculateRewards = function() {
  const now = new Date();
  const startDate = new Date(this.start_date);
  const daysElapsed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  
  this.days_elapsed = Math.min(daysElapsed, this.lock_period_days);
  this.days_remaining = Math.max(0, this.lock_period_days - this.days_elapsed);
  this.completion_percentage = (this.days_elapsed / this.lock_period_days) * 100;
  
  // Calculate total rewards earned
  this.total_rewards_earned = (this.stake_amount * this.daily_yield_percentage * this.days_elapsed) / 100;
  
  return this.total_rewards_earned;
};

Staking.prototype.canUnlock = function() {
  return new Date() >= new Date(this.unlock_date) && this.status === 'active';
};

Staking.prototype.getUnclaimedRewards = function() {
  return this.total_rewards_earned - this.total_rewards_claimed;
};

Staking.prototype.isExpired = function() {
  return new Date() > new Date(this.end_date);
};

module.exports = Staking; 