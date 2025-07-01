const { AdminSettings, StakingPackage, Staking, User, Transaction } = require('../models');
const { validationResult } = require('express-validator');
const { updateBalance } = require('./userController');
const moment = require('moment');

// Get all available staking packages
const getStakingPackages = async (req, res) => {
  try {
    const packages = await StakingPackage.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC']]
    });

    // Add calculated fields
    const packagesWithCalculations = packages.map(pkg => {
      const packageData = pkg.toJSON();
      packageData.apy = pkg.getAPY();
      packageData.is_available = pkg.isAvailable();
      return packageData;
    });

    const admin_settings = await AdminSettings.findAll({})

    res.json({
      success: true,
      data: { packages: packagesWithCalculations, admin_settings }
    });
  } catch (error) {
    console.error('Get staking packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get staking packages'
    });
  }
};

// Get specific staking package
const getStakingPackage = async (req, res) => {
  try {
    const { id } = req.params;

    const package = await StakingPackage.findByPk(id);
    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Staking package not found'
      });
    }

    const packageData = package.toJSON();
    packageData.apy = package.getAPY();
    packageData.is_available = package.isAvailable();

    res.json({
      success: true,
      data: { package: packageData }
    });
  } catch (error) {
    console.error('Get staking package error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get staking package'
    });
  }
};

// Create new staking
const createStaking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { package_id, stake_amount, payment_tx_hash, payment_method = 'usdt_bep20' } = req.body;
    const userId = req.user.id;
    // Validate package_id is integer
    const packageId = parseInt(package_id);
    if (isNaN(packageId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package ID'
      });
    }
    // Validate payment_amount is positive decimal
    if (isNaN(stake_amount) || stake_amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      });
    }
    
    // Get staking package
    const stakingPackage = await StakingPackage.findByPk(packageId);
    if (!stakingPackage) {
      return res.status(404).json({
        success: false,
        message: 'Staking package not found'
      });
    }
    
    if (!stakingPackage.isAvailable()) {
      return res.status(400).json({
        success: false,
        message: 'Staking package is not available'
      });
    }
    
    // Validate payment amount against package limits
    const minAmount = parseFloat(stakingPackage.min_stake_amount);
    const maxAmount = stakingPackage.max_stake_amount ? parseFloat(stakingPackage.max_stake_amount) : null;
    
    if (stake_amount < minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum staking amount is ${minAmount} USDT`
      });
    }
    
    if (maxAmount && stake_amount > maxAmount) {
      return res.status(400).json({
        success: false,
        message: `Maximum staking amount is ${maxAmount} USDT`
      });
    }
    
    // Calculate EGD tokens to be staked (use proper decimal arithmetic)
    const admin_settings = await AdminSettings.findOne({where: { title: "token_price" }})
    const egdTokenPrice = parseFloat(admin_settings.value || '0.01');
    const payment_amount = Number((stake_amount * egdTokenPrice).toFixed(8));

    // Check if user has sufficient balance for EGD tokens
    // const user = await User.findByPk(userId);
    // if (payment_method === 'egd_tokens' && parseFloat(user.egd_balance) < egdTokensToStake) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Insufficient EGD token balance'
    //   });
    // }

    // Calculate dates using proper date arithmetic
    const startDate = new Date();
    const endDate = moment().add(stakingPackage.lock_period_days, 'days').toDate();
    const unlockDate = moment().add(stakingPackage.lock_period_days, 'days').toDate();
    const nextRewardDate = moment().add(1, 'day').startOf('day').toDate();
    // Create staking record with proper data types
    const staking = await Staking.create({
      user_id: userId,
      package_id: packageId,
      stake_amount: stake_amount,
      daily_yield_percentage: stakingPackage.daily_yield_percentage,
      daily_reward_amount: (stakingPackage.getDailyReward(stake_amount).toFixed(8)),
      payment_method,
      payment_amount,
      payment_currency: 'USDT',
      lock_period_days: parseInt(stakingPackage.lock_period_days),
      start_date: startDate,
      end_date: endDate,
      unlock_date: unlockDate,
      next_reward_date: nextRewardDate,
      status: 'active',
      is_locked: true,
      days_elapsed: 0,
      days_remaining: parseInt(stakingPackage.lock_period_days),
      completion_percentage: 0.00
    });

    const user = await User.findByPk(userId)
    const newTotalInvested = (parseFloat(user.total_invested || 0) + parseFloat(stake_amount)).toFixed(8);
    console.log(user.total_invested, stake_amount, newTotalInvested);
    await user.update({
      total_invested: newTotalInvested
    });
    
    // Create transaction record
    await Transaction.create({
      user_id: userId,
      transaction_type: 'staking_payment',
      amount: payment_amount,
      currency: 'USDT',
      status: 'completed',
      description: `Staking payment for ${stakingPackage.name} package`,
      reference_id: staking.id.toString(),
      reference_type: 'staking',
      transaction_hash: payment_tx_hash,
      balance_before: parseFloat(user.usdt_balance || 0),
      balance_after: parseFloat(user.usdt_balance || 0)
    });

    res.status(201).json({
      success: true,
      message: 'Staking created successfully',
      data: {
        staking: {
          id: staking.id,
          stake_amount: staking.stake_amount,
          daily_reward_amount: staking.daily_reward_amount,
          start_date: staking.start_date,
          unlock_date: staking.unlock_date,
          status: staking.status
        },
        package: {
          name: stakingPackage.name,
          daily_yield_percentage: stakingPackage.daily_yield_percentage,
          apy: stakingPackage.getAPY()
        }
      }
    });
  } catch (error) {
    console.error('Create staking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create staking'
    });
  }
};

// Get user's staking details
const getStakingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const staking = await Staking.findOne({
      where: { id, user_id: userId },
      include: [
        {
          model: StakingPackage,
          as: 'package'
        }
      ]
    });

    if (!staking) {
      return res.status(404).json({
        success: false,
        message: 'Staking not found'
      });
    }

    // Calculate current rewards
    staking.calculateRewards();

    const stakingData = staking.toJSON();
    stakingData.unclaimed_rewards = staking.getUnclaimedRewards();
    stakingData.can_unlock = staking.canUnlock();
    stakingData.is_expired = staking.isExpired();

    res.json({
      success: true,
      data: { staking: stakingData }
    });
  } catch (error) {
    console.error('Get staking details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get staking details'
    });
  }
};

// Claim staking rewards
const claimRewards = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const staking = await Staking.findOne({
      where: { id, user_id: userId, status: 'active' }
    });

    if (!staking) {
      return res.status(404).json({
        success: false,
        message: 'Active staking not found'
      });
    }

    // Calculate current rewards
    const totalEarned = staking.calculateRewards();
    const unclaimedRewards = staking.getUnclaimedRewards();

    if (unclaimedRewards <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No rewards to claim'
      });
    }

    // Update staking record
    await staking.update({
      total_rewards_claimed: parseFloat(staking.total_rewards_claimed || 0) + unclaimedRewards,
      last_reward_date: new Date()
    });

    // Update user EGD balance
    const user = await User.findByPk(userId);
    const newEgdBalance = parseFloat(user.egd_balance || 0) + unclaimedRewards;
    await user.update({ 
      egd_balance: newEgdBalance,
      total_earned: parseFloat(user.total_earned || 0) + unclaimedRewards
    });

    // Create transaction record
    await Transaction.create({
      user_id: userId,
      transaction_type: 'staking_reward',
      amount: unclaimedRewards,
      currency: 'EGD',
      status: 'completed',
      description: `Staking rewards claimed from ${staking.id}`,
      reference_id: staking.id.toString(),
      reference_type: 'staking',
      balance_before: user.egd_balance,
      balance_after: newEgdBalance
    });

    res.json({
      success: true,
      message: 'Rewards claimed successfully',
      data: {
        claimed_amount: unclaimedRewards,
        new_balance: newEgdBalance
      }
    });
  } catch (error) {
    console.error('Claim rewards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to claim rewards'
    });
  }
};

// Unlock staking (after lock period)
const unlockStaking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const staking = await Staking.findOne({
      where: { id, user_id: userId, status: 'active' }
    });

    if (!staking) {
      return res.status(404).json({
        success: false,
        message: 'Active staking not found'
      });
    }

    if (!staking.canUnlock()) {
      return res.status(400).json({
        success: false,
        message: 'Staking is still locked'
      });
    }

    // Calculate final rewards
    const totalEarned = staking.calculateRewards();
    const unclaimedRewards = staking.getUnclaimedRewards();

    // Update staking status
    await staking.update({
      status: 'completed',
      is_locked: false,
      total_rewards_earned: totalEarned,
      total_rewards_claimed: parseFloat(staking.total_rewards_claimed || 0) + unclaimedRewards
    });

    // Return staked amount to user
    const user = await User.findByPk(userId);
    const newEgdBalance = parseFloat(user.egd_balance || 0) + staking.stake_amount + unclaimedRewards;
    await user.update({ egd_balance: newEgdBalance });

    // Create transaction for returned staked amount
    await Transaction.create({
      user_id: userId,
      transaction_type: 'staking_completion',
      amount: staking.stake_amount,
      currency: 'EGD',
      status: 'completed',
      description: `Staked amount returned from completed staking ${staking.id}`,
      reference_id: staking.id.toString(),
      reference_type: 'staking',
      balance_before: user.egd_balance,
      balance_after: newEgdBalance
    });

    // Create transaction for final rewards if any
    if (unclaimedRewards > 0) {
      await Transaction.create({
        user_id: userId,
        transaction_type: 'staking_reward',
        amount: unclaimedRewards,
        currency: 'EGD',
        status: 'completed',
        description: `Final rewards from completed staking ${staking.id}`,
        reference_id: staking.id.toString(),
        reference_type: 'staking'
      });
    }

    res.json({
      success: true,
      message: 'Staking unlocked successfully',
      data: {
        returned_amount: staking.stake_amount,
        final_rewards: unclaimedRewards,
        new_balance: newEgdBalance
      }
    });
  } catch (error) {
    console.error('Unlock staking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlock staking'
    });
  }
};

// Calculate staking rewards (for display)
const calculateStakingRewards = async (req, res) => {
  try {
    const { package_id, amount } = req.query;

    const stakingPackage = await StakingPackage.findByPk(package_id);
    if (!stakingPackage) {
      return res.status(404).json({
        success: false,
        message: 'Staking package not found'
      });
    }

    const egdTokenPrice = parseFloat(process.env.EGD_TOKEN_PRICE || 0.01);
    const egdTokens = amount / egdTokenPrice;
    const dailyReward = stakingPackage.getDailyReward(egdTokens);
    const totalReward = stakingPackage.getTotalReward(egdTokens);
    const apy = stakingPackage.getAPY();

    res.json({
      success: true,
      data: {
        egd_tokens: egdTokens,
        daily_reward,
        total_reward,
        apy,
        lock_period_days: stakingPackage.lock_period_days
      }
    });
  } catch (error) {
    console.error('Calculate rewards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate rewards'
    });
  }
};

module.exports = {
  getStakingPackages,
  getStakingPackage,
  createStaking,
  getStakingDetails,
  claimRewards,
  unlockStaking,
  calculateStakingRewards
}; 