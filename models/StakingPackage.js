const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StakingPackage = sequelize.define('StakingPackage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  min_stake_amount: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    comment: 'Minimum stake amount in USDT'
  },
  max_stake_amount: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    comment: 'Maximum stake amount in USDT'
  },
  daily_yield_percentage: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: false,
    comment: 'Daily yield percentage (e.g., 0.05 for 5%)'
  },
  lock_period_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 365,
    comment: 'Lock period in days'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether this package is available for staking'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Display order for packages'
  }
}, {
  tableName: 'staking_packages',
  timestamps: true,
  indexes: [
    {
      fields: ['is_active']
    },
    {
      fields: ['sort_order']
    }
  ]
});

// Instance methods
StakingPackage.prototype.isAvailable = function() {
  return this.is_active;
};

StakingPackage.prototype.getDailyReward = function(stakeAmount) {
  return (Number(stakeAmount) * Number(this.daily_yield_percentage)) / 100;
};

StakingPackage.prototype.getTotalReward = function(stakeAmount) {
  const dailyReward = this.getDailyReward(stakeAmount);
  return dailyReward * this.lock_period_days;
};

StakingPackage.prototype.getAPY = function() {
  return (this.daily_yield_percentage * 365);
};

module.exports = StakingPackage; 