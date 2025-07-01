const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Referral = sequelize.define('Referral', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  referrer_id: {
    type: DataTypes.INTEGER,
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
    type: DataTypes.INTEGER,
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
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Referral level (1 = direct, 2 = indirect, etc.)'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether this referral relationship is active'
  },
  total_earned: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total earnings from this referral'
  },
  total_invested: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total amount invested by referred user'
  },
  total_staked: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total amount staked by referred user'
  },
  direct_cashback_paid: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    defaultValue: 0,
    comment: 'Direct cashback paid to referrer'
  },
  network_cashback_paid: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    defaultValue: 0,
    comment: 'Network cashback paid to referrer'
  },
  last_activity: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last activity from referred user'
  },
  joined_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'When the referred user joined'
  },
  first_investment_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the referred user made first investment'
  },
  first_staking_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the referred user made first staking'
  },
  referral_path: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Full referral path from root to this user'
  },
  commission_rate: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: false,
    defaultValue: 0.05,
    comment: 'Commission rate for this level (5% = 0.05)'
  },
  is_qualified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether the referred user has qualified for commissions'
  },
  qualification_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the referred user qualified for commissions'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Admin notes about this referral'
  },
}, {
  tableName: 'referrals',
  timestamps: true,
  indexes: [
    {
      fields: ['referrer_id']
    },
    {
      fields: ['referred_id']
    },
    {
      fields: ['level']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['joined_at']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['referrer_id', 'level']
    },
    {
      fields: ['referrer_id', 'is_active']
    },
    {
      fields: ['referred_id', 'level']
    },
    {
      fields: ['level', 'is_active']
    }
  ]
});

// Instance methods
Referral.prototype.getCommissionAmount = function(investmentAmount) {
  return (investmentAmount * this.commission_rate);
};

Referral.prototype.isDirectReferral = function() {
  return this.level === 1;
};

Referral.prototype.isIndirectReferral = function() {
  return this.level > 1;
};

Referral.prototype.getReferralPathArray = function() {
  if (!this.referral_path) return [];
  return this.referral_path.split(',').map(id => parseInt(id.trim()));
};

Referral.prototype.setReferralPath = function(pathArray) {
  this.referral_path = pathArray.join(',');
};

Referral.prototype.qualify = function() {
  this.is_qualified = true;
  this.qualification_date = new Date();
};

module.exports = Referral; 