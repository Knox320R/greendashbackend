const User = require('./User');
const StakingPackage = require('./StakingPackage');
const Staking = require('./Staking');
const Transaction = require('./Transaction');
const Withdrawal = require('./Withdrawal');
const Referral = require('./Referral');
const AdminSettings = require('./AdminSettings');

// User associations
User.hasMany(Staking, { foreignKey: 'user_id', as: 'stakings', onDelete: 'CASCADE' });
User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions', onDelete: 'CASCADE' });
User.hasMany(Withdrawal, { foreignKey: 'user_id', as: 'withdrawals', onDelete: 'CASCADE' });

// Referral associations
User.hasMany(Referral, { foreignKey: 'referrer_id', as: 'referrals', onDelete: 'CASCADE' });
User.hasMany(Referral, { foreignKey: 'referred_id', as: 'referredBy', onDelete: 'CASCADE' });

// StakingPackage associations
StakingPackage.hasMany(Staking, { foreignKey: 'package_id', as: 'stakings', onDelete: 'RESTRICT' });

// Staking associations
Staking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Staking.belongsTo(StakingPackage, { foreignKey: 'package_id', as: 'package' });

// Transaction associations
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Withdrawal associations
Withdrawal.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Referral associations
Referral.belongsTo(User, { foreignKey: 'referrer_id', as: 'referrer' });
Referral.belongsTo(User, { foreignKey: 'referred_id', as: 'referred' });

// Additional associations for better querying
User.hasMany(Staking, { foreignKey: 'approved_by', as: 'approvedStakings' });
Staking.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

Transaction.belongsTo(User, { foreignKey: 'processed_by', as: 'processor' });
User.hasMany(Transaction, { foreignKey: 'processed_by', as: 'processedTransactions' });

Withdrawal.belongsTo(User, { foreignKey: 'processed_by', as: 'processor' });
User.hasMany(Withdrawal, { foreignKey: 'processed_by', as: 'processedWithdrawals' });

module.exports = {
  User,
  StakingPackage,
  Staking,
  Transaction,
  Withdrawal,
  Referral,
  AdminSettings
}; 