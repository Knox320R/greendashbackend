const { User, Referral, Transaction, Staking } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { updateBalance } = require('./userController');

// Get user's referral network
const getReferralNetwork = async (req, res) => {
  try {
    const userId = req.user.id;
    const { level = 1, page = 1, limit = 20 } = req.params;
    
    // Validate pagination parameters
    const levelNum = parseInt(level);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    if (isNaN(levelNum) || levelNum < 1 || levelNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Invalid level (must be between 1 and 5)'
      });
    }

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page number'
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid limit (must be between 1 and 100)'
      });
    }

    const whereClause = { referrer_id: userId, is_active: true };
    if (levelNum) whereClause.level = levelNum;

    const { count, rows: referrals } = await Referral.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'referred',
          attributes: ['id', 'email', 'first_name', 'last_name', 'created_at', 'egd_balance', 'total_invested', 'is_email_verified']
        }
      ],
      order: [['joined_at', 'DESC']],
      limit: limitNum,
      offset: offset
    });

    // Calculate statistics for this level with proper decimal arithmetic
    const levelStats = await Referral.findAll({
      where: { referrer_id: userId, level: levelNum },
      include: [
        {
          model: User,
          as: 'referred',
          attributes: ['total_invested', 'egd_balance']
        }
      ]
    });

    const totalInvested = levelStats.reduce((sum, ref) => {
      return Number((sum + parseFloat(ref.referred.total_invested || 0)).toFixed(8));
    }, 0);

    const totalEarnings = levelStats.reduce((sum, ref) => {
      return Number((sum + parseFloat(ref.total_earned || 0)).toFixed(8));
    }, 0);

    res.json({
      success: true,
      data: {
        referrals,
        level: levelNum,
        statistics: {
          total_referrals: count,
          total_invested: totalInvested,
          total_earnings: totalEarnings
        },
        pagination: {
          current_page: pageNum,
          total_pages: Math.ceil(count / limitNum),
          total_items: count,
          items_per_page: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get referral network error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral network'
    });
  }
};

// Get referral statistics
const getReferralStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all referrals by level
    const referralsByLevel = await Referral.findAll({
      where: { referrer_id: userId, is_active: true },
      include: [
        {
          model: User,
          as: 'referred',
          attributes: ['id', 'email', 'first_name', 'last_name', 'created_at', 'egd_balance', 'total_invested', 'is_email_verified']
        }
      ],
      order: [['level', 'ASC'], ['joined_at', 'DESC']]
    });

    // Group by level with proper decimal arithmetic
    const levelStats = {};
    for (let i = 1; i <= 5; i++) {
      const levelReferrals = referralsByLevel.filter(ref => ref.level === i);
      const totalInvested = levelReferrals.reduce((sum, ref) => {
        return Number((sum + parseFloat(ref.referred.total_invested || 0)).toFixed(8));
      }, 0);
      const totalEarnings = levelReferrals.reduce((sum, ref) => {
        return Number((sum + parseFloat(ref.total_earned || 0)).toFixed(8));
      }, 0);

      levelStats[i] = {
        count: levelReferrals.length,
        total_invested: totalInvested,
        total_earnings: totalEarnings,
        referrals: levelReferrals
      };
    }

    // Calculate overall statistics with proper decimal arithmetic
    const totalReferrals = referralsByLevel.length;
    const totalInvested = referralsByLevel.reduce((sum, ref) => {
      return Number((sum + parseFloat(ref.referred.total_invested || 0)).toFixed(8));
    }, 0);
    const totalEarnings = referralsByLevel.reduce((sum, ref) => {
      return Number((sum + parseFloat(ref.total_earned || 0)).toFixed(8));
    }, 0);

    // Get recent referrals
    const recentReferrals = referralsByLevel.slice(0, 10);

    res.json({
      success: true,
      data: {
        overall: {
          total_referrals: totalReferrals,
          total_invested: totalInvested,
          total_earnings: totalEarnings
        },
        by_level: levelStats,
        recent_referrals: recentReferrals
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

// Get referral earnings history
const getReferralEarnings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type } = req.query;
    
    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page number'
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid limit (must be between 1 and 100)'
      });
    }

    const whereClause = { user_id: userId };
    if (type) {
      whereClause.transaction_type = type;
    } else {
      whereClause.transaction_type = {
        [Op.in]: ['referral_bonus', 'network_bonus', 'universal_bonus', 'performance_bonus', 'viral_bonus']
      };
    }

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: limitNum,
      offset: offset
    });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          current_page: pageNum,
          total_pages: Math.ceil(count / limitNum),
          total_items: count,
          items_per_page: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get referral earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral earnings'
    });
  }
};

// Process direct cashback (when user makes investment)
const processDirectCashback = async (userId, investmentAmount) => {
  try {
    const user = await User.findByPk(userId);
    if (!user || !user.referred_by) {
      return null;
    }

    // Find referrer
    const referrer = await User.findOne({ where: { referral_code: user.referred_by } });
    if (!referrer) {
      return null;
    }

    // Find referral relationship
    const referral = await Referral.findOne({
      where: { referrer_id: referrer.id, referred_id: userId, level: 1 }
    });

    if (!referral) {
      return null;
    }

    // Calculate direct cashback (10% of investment)
    const cashbackAmount = investmentAmount * 0.10;

    // Update referral earnings
    await referral.update({
      total_earned: parseFloat(referral.total_earned || 0) + cashbackAmount,
      direct_cashback_paid: parseFloat(referral.direct_cashback_paid || 0) + cashbackAmount,
      total_invested: parseFloat(referral.total_invested || 0) + investmentAmount
    });

    // Credit USDT to referrer
    const newUsdtBalance = parseFloat(referrer.usdt_balance || 0) + cashbackAmount;
    await referrer.update({ usdt_balance: newUsdtBalance });

    // Create transaction record
    await Transaction.create({
      user_id: referrer.id,
      transaction_type: 'referral_bonus',
      amount: cashbackAmount,
      currency: 'USDT',
      status: 'completed',
      description: `Direct cashback from ${user.email} investment`,
      reference_id: userId.toString(),
      reference_type: 'user',
      balance_before: referrer.usdt_balance,
      balance_after: newUsdtBalance
    });

    return {
      referrer_id: referrer.id,
      amount: cashbackAmount,
      level: 1
    };
  } catch (error) {
    console.error('Process direct cashback error:', error);
    return null;
  }
};

// Process network cashback (for levels 2-5)
const processNetworkCashback = async (userId, investmentAmount) => {
  try {
    const user = await User.findByPk(userId);
    if (!user || !user.referred_by) {
      return [];
    }

    const results = [];
    let currentUserId = userId;
    let level = 1;

    // Traverse up the referral chain (max 5 levels)
    while (level <= 5 && currentUserId) {
      const currentUser = await User.findByPk(currentUserId);
      if (!currentUser || !currentUser.referred_by) {
        break;
      }

      const referrer = await User.findOne({ where: { referral_code: currentUser.referred_by } });
      if (!referrer) {
        break;
      }

      level++;

      // Find referral relationship
      const referral = await Referral.findOne({
        where: { referrer_id: referrer.id, referred_id: userId, level: level }
      });

      if (!referral) {
        // Create referral relationship if it doesn't exist
        await Referral.create({
          referrer_id: referrer.id,
          referred_id: userId,
          level: level,
          commission_rate: getCommissionRate(level),
          referral_path: await buildReferralPath(referrer.id, userId)
        });
      }

      // Calculate network cashback based on level
      const cashbackRate = getCommissionRate(level);
      const cashbackAmount = investmentAmount * cashbackRate;

      if (cashbackAmount > 0) {
        // Update referral earnings
        await referral.update({
          total_earned: parseFloat(referral.total_earned || 0) + cashbackAmount,
          network_cashback_paid: parseFloat(referral.network_cashback_paid || 0) + cashbackAmount,
          total_invested: parseFloat(referral.total_invested || 0) + investmentAmount
        });

        // Credit USDT to referrer
        const newUsdtBalance = parseFloat(referrer.usdt_balance || 0) + cashbackAmount;
        await referrer.update({ usdt_balance: newUsdtBalance });

        // Create transaction record
        await Transaction.create({
          user_id: referrer.id,
          transaction_type: 'network_bonus',
          amount: cashbackAmount,
          currency: 'USDT',
          status: 'completed',
          description: `Level ${level} network cashback from ${user.email} investment`,
          reference_id: userId.toString(),
          reference_type: 'user',
          balance_before: referrer.usdt_balance,
          balance_after: newUsdtBalance
        });

        results.push({
          referrer_id: referrer.id,
          amount: cashbackAmount,
          level: level
        });
      }

      currentUserId = referrer.id;
    }

    return results;
  } catch (error) {
    console.error('Process network cashback error:', error);
    return [];
  }
};

// Process universal cashback (10% of platform fees distributed to all token holders)
const processUniversalCashback = async (feeAmount) => {
  try {
    // Get all users with EGD tokens
    const usersWithTokens = await User.findAll({
      where: {
        egd_balance: { [Op.gt]: 0 }
      },
      attributes: ['id', 'egd_balance']
    });

    if (usersWithTokens.length === 0) {
      return;
    }

    // Calculate total EGD tokens in circulation
    const totalEgdTokens = usersWithTokens.reduce((sum, user) => {
      return sum + parseFloat(user.egd_balance || 0);
    }, 0);

    if (totalEgdTokens <= 0) {
      return;
    }

    // Calculate universal cashback amount (10% of fees)
    const universalCashbackAmount = feeAmount * 0.10;

    // Distribute to each user proportionally
    for (const user of usersWithTokens) {
      const userShare = (parseFloat(user.egd_balance) / totalEgdTokens) * universalCashbackAmount;
      
      if (userShare > 0) {
        // Credit USDT to user
        const newUsdtBalance = parseFloat(user.usdt_balance || 0) + userShare;
        await user.update({ usdt_balance: newUsdtBalance });

        // Create transaction record
        await Transaction.create({
          user_id: user.id,
          transaction_type: 'universal_bonus',
          amount: userShare,
          currency: 'USDT',
          status: 'completed',
          description: 'Universal cashback from platform fees',
          balance_before: user.usdt_balance,
          balance_after: newUsdtBalance
        });
      }
    }
  } catch (error) {
    console.error('Process universal cashback error:', error);
  }
};

// Process performance cashback (weekly/monthly targets)
const processPerformanceCashback = async (userId, period = 'weekly') => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return null;
    }

    let targetAmount, cashbackAmount;
    const now = new Date();
    let startDate;

    if (period === 'weekly') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      targetAmount = 10000; // $10,000 weekly target
      cashbackAmount = 100; // $100 USDT
    } else if (period === 'monthly') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      targetAmount = 100000; // $100,000 monthly target
      cashbackAmount = 1000; // $1,000 USDT
    }

    // Calculate total activity in the period
    const totalActivity = await Transaction.sum('amount', {
      where: {
        user_id: userId,
        transaction_type: { [Op.in]: ['staking_payment', 'token_purchase'] },
        created_at: { [Op.gte]: startDate }
      }
    });

    if (totalActivity >= targetAmount) {
      // Credit performance cashback
      const newUsdtBalance = parseFloat(user.usdt_balance || 0) + cashbackAmount;
      await user.update({ usdt_balance: newUsdtBalance });

      // Create transaction record
      await Transaction.create({
        user_id: userId,
        transaction_type: 'performance_bonus',
        amount: cashbackAmount,
        currency: 'USDT',
        status: 'completed',
        description: `${period} performance cashback`,
        balance_before: user.usdt_balance,
        balance_after: newUsdtBalance
      });

      return {
        period,
        target_amount: targetAmount,
        actual_amount: totalActivity,
        cashback_amount: cashbackAmount
      };
    }

    return null;
  } catch (error) {
    console.error('Process performance cashback error:', error);
    return null;
  }
};

// Helper function to get commission rate by level
const getCommissionRate = (level) => {
  const rates = {
    1: 0.05, // 5%
    2: 0.03, // 3%
    3: 0.02, // 2%
    4: 0.01, // 1%
    5: 0.005 // 0.5%
  };
  return rates[level] || 0;
};

// Helper function to build referral path
const buildReferralPath = async (referrerId, referredId) => {
  try {
    const path = [referrerId];
    let currentUserId = referrerId;

    while (path.length < 5) {
      const user = await User.findByPk(currentUserId);
      if (!user || !user.referred_by) {
        break;
      }

      const parent = await User.findOne({ where: { referral_code: user.referred_by } });
      if (!parent) {
        break;
      }

      path.unshift(parent.id);
      currentUserId = parent.id;
    }

    return path.join(',');
  } catch (error) {
    console.error('Build referral path error:', error);
    return '';
  }
};

// Get referral link
const getReferralLink = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const referralLink = user.getReferralLink();

    res.json({
      success: true,
      data: {
        referral_code: user.referral_code,
        referral_link: referralLink
      }
    });
  } catch (error) {
    console.error('Get referral link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral link'
    });
  }
};

module.exports = {
  getReferralNetwork,
  getReferralStats,
  getReferralEarnings,
  processDirectCashback,
  processNetworkCashback,
  processUniversalCashback,
  processPerformanceCashback,
  getReferralLink
}; 