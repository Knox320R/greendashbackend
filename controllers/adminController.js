const { AdminSettings, User, StakingPackage, Staking, Transaction, Withdrawal, Referral } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const moment = require('moment');

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { is_active: true } });
    const verifiedUsers = await User.count({ where: { is_email_verified: true } });
    const newUsersToday = await User.count({
      where: {
        created_at: {
          [Op.gte]: moment().startOf('day').toDate()
        }
      }
    });

    // Staking statistics
    const totalStakings = await Staking.count();
    const activeStakings = await Staking.count({ where: { status: 'active' } });
    const totalStakedAmount = await Staking.sum('stake_amount', { where: { status: 'active' } });
    const totalRewardsPaid = await Staking.sum('total_rewards_claimed');

    // Financial statistics
    const totalInvested = await User.sum('total_invested');
    const totalEarned = await User.sum('total_earned');
    const totalWithdrawn = await User.sum('total_withdrawn');

    // Transaction statistics
    const totalTransactions = await Transaction.count();
    const pendingTransactions = await Transaction.count({ where: { status: 'pending' } });
    const completedTransactions = await Transaction.count({ where: { status: 'completed' } });

    // Withdrawal statistics
    const pendingWithdrawals = await Withdrawal.count({ where: { status: 'pending' } });
    const totalWithdrawalAmount = await Withdrawal.sum('amount', { where: { status: 'pending' } });

    // Recent activities
    const recentUsers = await User.findAll({
      order: [['created_at', 'DESC']],
      limit: 10,
      attributes: ['id', 'email', 'first_name', 'last_name', 'created_at', 'is_email_verified']
    });

    const recentStakings = await Staking.findAll({
      include: [
        { model: User, as: 'user', attributes: ['email', 'first_name', 'last_name'] },
        { model: StakingPackage, as: 'package', attributes: ['name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 10,
      attributes: ['id', 'start_date', 'end_date', 'last_reward_date', 'status', 'payment_amount', 'created_at']
    });

    const recentTransactions = await Transaction.findAll({
      include: [
        { model: User, as: 'user', attributes: ['email', 'first_name', 'last_name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 10,
      attributes: ['id', 'transaction_type', 'amount', 'status', 'created_at']
    });

    const adminSettings = await AdminSettings.findAll();

    res.json({
      success: true,
      data: {
        adminSettings,
        users: {
          total: totalUsers,
          active: activeUsers,
          verified: verifiedUsers,
          new_today: newUsersToday
        },
        staking: {
          total: totalStakings,
          active: activeStakings,
          total_staked: parseFloat(totalStakedAmount || 0),
          total_rewards_paid: parseFloat(totalRewardsPaid || 0)
        },
        financial: {
          total_invested: parseFloat(totalInvested || 0),
          total_earned: parseFloat(totalEarned || 0),
          total_withdrawn: parseFloat(totalWithdrawn || 0)
        },
        transactions: {
          total: totalTransactions,
          pending: pendingTransactions,
          completed: completedTransactions
        },
        withdrawals: {
          pending: pendingWithdrawals,
          pending_amount: parseFloat(totalWithdrawalAmount || 0)
        },
        recent_activities: {
          users: recentUsers,
          stakings: recentStakings,
          transactions: recentTransactions
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics'
    });
  }
};

// Get all users (admin)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, verified } = req.query;
    
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

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { email: { [Op.like]: `%${search}%` } },
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { referral_code: { [Op.like]: `%${search}%` } }
      ];
    }
    if (status === 'active') whereClause.is_active = true;
    if (status === 'inactive') whereClause.is_active = false;
    if (verified === 'true') whereClause.is_email_verified = true;
    if (verified === 'false') whereClause.is_email_verified = false;

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'email', 'first_name', 'last_name', 'phone', 'wallet_address', 'total_invested', 'egd_balance', 'last_login', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: limitNum,
      offset: offset
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current_page: pageNum,
          total_pages: Math.ceil(count / limitNum),
          total_items: count,
          items_per_page: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
};

// Get user details (admin)
const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate user ID is integer
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'email_verification_token', 'reset_password_token'] },
      include: [
        {
          model: Staking,
          as: 'stakings',
          include: [{ model: StakingPackage, as: 'package' }]
        },
        {
          model: Transaction,
          as: 'transactions',
          limit: 20,
          order: [['created_at', 'DESC']]
        },
        {
          model: Withdrawal,
          as: 'withdrawals',
          limit: 20,
          order: [['created_at', 'DESC']]
        },
        {
          model: Referral,
          as: 'referrals',
          include: [{ model: User, as: 'referred', attributes: ['id', 'email', 'first_name', 'last_name'] }]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user details'
    });
  }
};

// Update user (admin)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, is_admin, is_email_verified, egd_balance, usdt_balance, notes } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updated_ata = {};
    if (typeof is_active === 'boolean') updated_ata.is_active = is_active;
    if (typeof is_admin === 'boolean') updated_ata.is_admin = is_admin;
    if (typeof is_email_verified === 'boolean') updated_ata.is_email_verified = is_email_verified;
    if (egd_balance !== undefined) updated_ata.egd_balance = egd_balance;
    if (usdt_balance !== undefined) updated_ata.usdt_balance = usdt_balance;

    await user.update(updated_ata);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// Create staking package (admin)
const createStakingPackage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      stake_amount,
      daily_yield_percentage,
      lock_period_days = 365,
      min_stake_amount,
      max_stake_amount,
      is_promotional = false,
      promotional_expires_at,
      max_participants,
      sort_order = 0,
      features,
      terms_conditions
    } = req.body;

    const package = await StakingPackage.create({
      name,
      description,
      stake_amount,
      daily_yield_percentage,
      lock_period_days,
      min_stake_amount,
      max_stake_amount,
      is_promotional,
      promotional_expires_at,
      max_participants,
      sort_order,
      features,
      terms_conditions,
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Staking package created successfully',
      data: { package }
    });
  } catch (error) {
    console.error('Create staking package error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create staking package'
    });
  }
};

// Update staking package (admin)
const updateStakingPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const updated_ata = req.body;

    const package = await StakingPackage.findByPk(id);
    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Staking package not found'
      });
    }

    await package.update(updated_ata);

    res.json({
      success: true,
      message: 'Staking package updated successfully',
      data: { package }
    });
  } catch (error) {
    console.error('Update staking package error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update staking package'
    });
  }
};

// Delete staking package (admin)
const deleteStakingPackage = async (req, res) => {
  try {
    const { id } = req.params;

    const package = await StakingPackage.findByPk(id);
    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Staking package not found'
      });
    }

    // Check if package has active stakings
    const activeStakings = await Staking.count({ where: { package_id: id, status: 'active' } });
    if (activeStakings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete package with active stakings'
      });
    }

    await package.destroy();

    res.json({
      success: true,
      message: 'Staking package deleted successfully'
    });
  } catch (error) {
    console.error('Delete staking package error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete staking package'
    });
  }
};

// Get all staking packages (admin)
const getAllStakingPackages = async (req, res) => {
  try {
    const packages = await StakingPackage.findAll({
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'email', 'first_name', 'last_name']
        }
      ]
    });

    res.json({
      success: true,
      data: { packages }
    });
  } catch (error) {
    console.error('Get all staking packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get staking packages'
    });
  }
};

// Get all stakings (admin)
const getAllStakings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, user_id } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (user_id) whereClause.user_id = user_id;

    const { count, rows: stakings } = await Staking.findAndCountAll({
      where: whereClause,
      // include: [
      //   { model: User, as: 'user', attributes: ['id', 'email', 'first_name', 'last_name'] },
      //   { model: StakingPackage, as: 'package' }
      // ],
      attributes: ['id', 'user_id', 'package_id', 'stake_amount', 'start_date', 'transaction_hash'],
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
    console.error('Get all stakings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stakings'
    });
  }
};

// Get all transactions (admin)
const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, user_id } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (type) whereClause.transaction_type = type;
    if (status) whereClause.status = status;
    if (user_id) whereClause.user_id = user_id;

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'first_name', 'last_name'] }
      ],
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
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions'
    });
  }
};

// Get all withdrawals (admin)
const getAllWithdrawals = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, currency } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (currency) whereClause.currency = currency;

    const { count, rows: withdrawals } = await Withdrawal.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'first_name', 'last_name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        withdrawals,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all withdrawals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get withdrawals'
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUser,
  createStakingPackage,
  updateStakingPackage,
  deleteStakingPackage,
  getAllStakingPackages,
  getAllStakings,
  getAllTransactions,
  getAllWithdrawals
}; 