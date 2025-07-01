const { User, Staking, Transaction, Referral } = require('../models');
const { validationResult } = require('express-validator');
const { StakingPackage } = require('../models');
const { Op } = require('sequelize');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'email_verification_token', 'reset_password_token'] },
      include: [
        {
          model: Staking,
          as: 'stakings',
          where: { status: 'active' },
          required: false,
          include: [
            {
              model: StakingPackage,
              as: 'package'
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { first_name, last_name, phone, country, city, timezone, language, wallet_address } = req.body;

    const updated_ata = {};
    if (first_name) updated_ata.first_name = first_name;
    if (last_name) updated_ata.last_name = last_name;
    if (phone) updated_ata.phone = phone;
    if (country) updated_ata.country = country;
    if (wallet_address) updated_ata.wallet_address= wallet_address;
    if (city) updated_ata.city = city;
    if (timezone) updated_ata.timezone = timezone;
    if (language) updated_ata.language = language;

    const newuser = await req.user.update(updated_ata);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: newuser
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { current_password, new_password } = req.body;

    // Verify current password
    const isValidPassword = await req.user.comparePassword(current_password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    await req.user.update({ password: new_password });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Get user dashboard data
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    // Get active stakings
    const activeStakings = await Staking.findAll({
      where: { user_id: userId, status: 'active' },
      include: [
        {
          model: StakingPackage,
          as: 'package'
        }
      ]
    });

    // Calculate total staked amount with proper decimal arithmetic
    const totalStaked = activeStakings.reduce((sum, staking) => {
      return Number((sum + parseFloat(staking.stake_amount || 0)).toFixed(8));
    }, 0);

    // Calculate total rewards earned with proper decimal arithmetic
    const totalRewardsEarned = activeStakings.reduce((sum, staking) => {
      return Number((sum + parseFloat(staking.total_rewards_earned || 0)).toFixed(8));
    }, 0);

    // Calculate total rewards claimed with proper decimal arithmetic
    const totalRewardsClaimed = activeStakings.reduce((sum, staking) => {
      return Number((sum + parseFloat(staking.total_rewards_claimed || 0)).toFixed(8));
    }, 0);

    // Get recent transactions
    const recentTransactions = await Transaction.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 10
    });

    // Get referral statistics
    const directReferrals = await Referral.count({
      where: { referrer_id: userId, level: 1, is_active: true }
    });

    const totalReferralEarnings = await Referral.sum('total_earned', {
      where: { referrer_id: userId, is_active: true }
    });

    // Get user's referral network
    const referralNetwork = await Referral.findAll({
      where: { referrer_id: userId, is_active: true },
      include: [
        {
          model: User,
          as: 'referred',
          attributes: ['id', 'first_name', 'last_name', 'email', 'created_at']
        }
      ],
      order: [['joined_at', 'DESC']],
      limit: 20
    });

    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          referral_code: req.user.referral_code,
          egd_balance: parseFloat(req.user.egd_balance || 0),
          usdt_balance: parseFloat(req.user.usdt_balance || 0),
          total_invested: parseFloat(req.user.total_invested || 0),
          total_earned: parseFloat(req.user.total_earned || 0),
          total_withdrawn: parseFloat(req.user.total_withdrawn || 0)
        },
        staking: {
          total_staked: totalStaked,
          total_rewards_earned: totalRewardsEarned,
          total_rewards_claimed: totalRewardsClaimed,
          active_stakings: activeStakings.length
        },
        referrals: {
          direct_referrals: directReferrals,
          total_earnings: parseFloat(totalReferralEarnings || 0),
          network: referralNetwork
        },
        transactions: recentTransactions
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data'
    });
  }
};

// Get user transactions
const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { user_id: req.user.id };
    if (type) whereClause.transaction_type = type;
    if (status) whereClause.status = status;

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions'
    });
  }
};

// Get user stakings
const getStakings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { user_id: req.user.id };
    if (status) whereClause.status = status;

    const { count, rows: stakings } = await Staking.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: StakingPackage,
          as: 'package'
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        stakings,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get stakings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stakings'
    });
  }
};

// Get referral statistics
const getReferralStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get direct referrals
    const directReferrals = await Referral.findAll({
      where: { referrer_id: userId, level: 1, is_active: true },
      include: [
        {
          model: User,
          as: 'referred',
          attributes: ['id', 'first_name', 'last_name', 'email', 'created_at', 'egd_balance', 'total_invested']
        }
      ],
      order: [['joined_at', 'DESC']]
    });

    // Get indirect referrals (level 2-5)
    const indirectReferrals = await Referral.findAll({
      where: { 
        referrer_id: userId, 
        level: { [Op.between]: [2, 5] },
        is_active: true 
      },
      include: [
        {
          model: User,
          as: 'referred',
          attributes: ['id', 'first_name', 'last_name', 'email', 'created_at', 'egd_balance', 'total_invested']
        }
      ],
      order: [['level', 'ASC'], ['joined_at', 'DESC']]
    });

    // Calculate statistics
    const totalDirectReferrals = directReferrals.length;
    const totalIndirectReferrals = indirectReferrals.length;
    const totalReferrals = totalDirectReferrals + totalIndirectReferrals;

    const directEarnings = directReferrals.reduce((sum, ref) => sum + parseFloat(ref.total_earned || 0), 0);
    const indirectEarnings = indirectReferrals.reduce((sum, ref) => sum + parseFloat(ref.total_earned || 0), 0);
    const totalEarnings = directEarnings + indirectEarnings;

    const totalInvestedByReferrals = directReferrals.reduce((sum, ref) => {
      return sum + parseFloat(ref.referred.total_invested || 0);
    }, 0);

    res.json({
      success: true,
      data: {
        statistics: {
          total_referrals,
          direct_referrals: totalDirectReferrals,
          indirect_referrals: totalIndirectReferrals,
          total_earnings,
          direct_earnings: directEarnings,
          indirect_earnings: indirectEarnings,
          total_invested_by_referrals: totalInvestedByReferrals
        },
        direct_referrals: directReferrals,
        indirect_referrals: indirectReferrals
      }
    });
  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral statistics'
    });
  }
};

// Update user balance (internal use)
const updateBalance = async (userId, amount, currency, type = 'add') => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const balanceField = currency === 'USDT' ? 'usdt_balance' : 'egd_balance';
    const currentBalance = parseFloat(user[balanceField] || 0);
    
    let newBalance;
    if (type === 'add') {
      newBalance = currentBalance + parseFloat(amount);
    } else if (type === 'subtract') {
      newBalance = currentBalance - parseFloat(amount);
      if (newBalance < 0) {
        throw new Error('Insufficient balance');
      }
    } else {
      newBalance = parseFloat(amount);
    }

    await user.update({ [balanceField]: newBalance });

    return newBalance;
  } catch (error) {
    console.error('Update balance error:', error);
    throw error;
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getDashboard,
  getTransactions,
  getStakings,
  getReferralStats,
  updateBalance
}; 