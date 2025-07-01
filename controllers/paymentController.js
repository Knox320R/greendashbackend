const { User, Transaction, Withdrawal } = require('../models');
const { validationResult } = require('express-validator');
const { updateBalance } = require('./userController');
const { ethers } = require('ethers');

// Generate payment address for USDT BEP-20
const generatePaymentAddress = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    // Validate amount is positive decimal
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    // Generate unique payment ID
    const paymentId = `PAY_${Date.now()}_${userId}`;
    
    // Use the admin's Binance wallet address
    const paymentAddress = process.env.BINANCE_WALLET_ADDRESS;
    
    if (!paymentAddress) {
      return res.status(500).json({
        success: false,
        message: 'Payment address not configured'
      });
    }

    // Create pending transaction record
    const transaction = await Transaction.create({
      user_id: userId,
      transaction_type: 'token_purchase',
      amount: paymentAmount,
      currency: 'USDT',
      status: 'pending',
      description: `USDT payment for EGD tokens - ${paymentId}`,
      reference_id: paymentId,
      reference_type: 'payment',
      wallet_address: paymentAddress,
      metadata: {
        payment_id: paymentId,
        expected_amount: paymentAmount,
        payment_address: paymentAddress,
        network: 'BEP20'
      }
    });

    res.json({
      success: true,
      message: 'Payment address generated successfully',
      data: {
        payment_id: paymentId,
        payment_address: paymentAddress,
        amount: paymentAmount,
        network: 'BEP20',
        currency: 'USDT',
        transaction_id: transaction.id,
        qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${paymentAddress}`
      }
    });
  } catch (error) {
    console.error('Generate payment address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate payment address'
    });
  }
};

// Verify payment (admin function)
const verifyPayment = async (req, res) => {
  try {
    const { transaction_id, transaction_hash, block_number } = req.body;

    // Validate transaction_id is integer
    const transactionId = parseInt(transaction_id);
    if (isNaN(transactionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID'
      });
    }

    // Validate block_number is integer if provided
    const blockNumber = block_number ? parseInt(block_number) : null;
    if (block_number && isNaN(blockNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid block number'
      });
    }

    const transaction = await Transaction.findByPk(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Transaction is not pending'
      });
    }

    // Verify transaction on blockchain
    const provider = new ethers.JsonRpcProvider(process.env.BSC_RPC_URL);
    const tx = await provider.getTransaction(transaction_hash);
    
    if (!tx) {
      return res.status(400).json({
        success: false,
        message: 'Transaction not found on blockchain'
      });
    }

    // Verify transaction details with proper decimal arithmetic
    const expectedAmount = parseFloat(transaction.amount);
    const actualAmount = parseFloat(ethers.formatUnits(tx.value, 18)); // USDT has 18 decimals

    if (Math.abs(actualAmount - expectedAmount) > 0.01) { // Allow 0.01 USDT difference
      return res.status(400).json({
        success: false,
        message: 'Payment amount mismatch'
      });
    }

    // Update transaction status
    await transaction.update({
      status: 'completed',
      transaction_hash: transaction_hash,
      block_number: blockNumber,
      processed_by: req.user.id,
      processed_at: new Date()
    });

    // Calculate EGD tokens to be credited with proper decimal arithmetic
    const egdTokenPrice = parseFloat(process.env.EGD_TOKEN_PRICE || 0.01);
    const egdTokens = Number((expectedAmount / egdTokenPrice).toFixed(8));

    // Update user balance with proper decimal arithmetic
    const user = await User.findByPk(transaction.user_id);
    const currentEgdBalance = parseFloat(user.egd_balance || 0);
    const newEgdBalance = Number((currentEgdBalance + egdTokens).toFixed(8));
    const currentTotalInvested = parseFloat(user.total_invested || 0);
    const newTotalInvested = Number((currentTotalInvested + expectedAmount).toFixed(8));

    await user.update({ 
      egd_balance: newEgdBalance,
      total_invested: newTotalInvested
    });

    // Create EGD credit transaction
    await Transaction.create({
      user_id: transaction.user_id,
      transaction_type: 'token_purchase',
      amount: egdTokens,
      currency: 'EGD',
      status: 'completed',
      description: `EGD tokens credited for USDT payment`,
      reference_id: transaction.reference_id,
      reference_type: 'payment',
      balance_before: currentEgdBalance,
      balance_after: newEgdBalance,
      exchange_rate: egdTokenPrice
    });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        egd_tokens_credited: egdTokens,
        new_balance: newEgdBalance
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
};

// Convert EGD tokens to USDT
const convertTokens = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { amount } = req.body;
    const userId = req.user.id;

    // Validate amount is positive decimal
    const conversionAmount = parseFloat(amount);
    if (isNaN(conversionAmount) || conversionAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    const user = await User.findByPk(userId);
    const currentEgdBalance = parseFloat(user.egd_balance || 0);
    
    if (currentEgdBalance < conversionAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient EGD token balance'
      });
    }

    // Calculate USDT equivalent with proper decimal arithmetic
    const egdTokenPrice = parseFloat(process.env.EGD_TOKEN_PRICE || 0.01);
    const usdtAmount = Number((conversionAmount * egdTokenPrice).toFixed(8));

    // Deduct EGD tokens
    const newEgdBalance = parseFloat(user.egd_balance) - conversionAmount;
    await user.update({ egd_balance: newEgdBalance });

    // Add USDT balance
    const newUsdtBalance = parseFloat(user.usdt_balance || 0) + usdtAmount;
    await user.update({ usdt_balance: newUsdtBalance });

    // Create EGD deduction transaction
    await Transaction.create({
      user_id: userId,
      transaction_type: 'token_conversion',
      amount: conversionAmount,
      currency: 'EGD',
      status: 'completed',
      description: `EGD tokens converted to USDT`,
      balance_before: user.egd_balance,
      balance_after: newEgdBalance,
      exchange_rate: egdTokenPrice
    });

    // Create USDT credit transaction
    await Transaction.create({
      user_id: userId,
      transaction_type: 'token_conversion',
      amount: usdtAmount,
      currency: 'USDT',
      status: 'completed',
      description: `USDT credited from EGD conversion`,
      balance_before: user.usdt_balance,
      balance_after: newUsdtBalance,
      exchange_rate: 1 / egdTokenPrice
    });

    res.json({
      success: true,
      message: 'Tokens converted successfully',
      data: {
        egd_converted: conversionAmount,
        usdt_received: usdtAmount,
        new_egd_balance: newEgdBalance,
        new_usdt_balance: newUsdtBalance
      }
    });
  } catch (error) {
    console.error('Convert tokens error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert tokens'
    });
  }
};

// Request withdrawal
const requestWithdrawal = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { amount, currency, wallet_address, network = 'BEP20' } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    if (!wallet_address) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required'
      });
    }

    // Validate wallet address format
    if (!ethers.isAddress(wallet_address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format'
      });
    }

    const user = await User.findByPk(userId);
    
    // Check sufficient balance
    const balanceField = currency === 'USDT' ? 'usdt_balance' : 'egd_balance';
    if (user[balanceField] < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${currency} balance`
      });
    }

    // Calculate withdrawal fee (if any)
    const withdrawalFee = 0; // No fee for now
    const netAmount = amount - withdrawalFee;

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      user_id: userId,
      amount: amount,
      currency: currency,
      wallet_address: wallet_address,
      network: network,
      withdrawal_fee: withdrawalFee,
      net_amount: netAmount,
      user_balance_before: user[balanceField],
      user_balance_after: user[balanceField] - amount,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    // Deduct balance immediately
    const newBalance = parseFloat(user[balanceField]) - amount;
    await user.update({ 
      [balanceField]: newBalance,
      total_withdrawn: parseFloat(user.total_withdrawn || 0) + amount
    });

    // Create transaction record
    await Transaction.create({
      user_id: userId,
      transaction_type: 'withdrawal_request',
      amount: amount,
      currency: currency,
      status: 'pending',
      description: `Withdrawal request for ${currency}`,
      reference_id: withdrawal.id.toString(),
      reference_type: 'withdrawal',
      wallet_address: wallet_address,
      balance_before: user[balanceField],
      balance_after: newBalance
    });

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: {
        withdrawal_id: withdrawal.id,
        amount: amount,
        net_amount: netAmount,
        fee: withdrawalFee,
        wallet_address: wallet_address,
        network: network,
        new_balance: newBalance
      }
    });
  } catch (error) {
    console.error('Request withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit withdrawal request'
    });
  }
};

// Get user's withdrawal requests
const getWithdrawals = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    const whereClause = { user_id: userId };
    if (status) whereClause.status = status;

    const { count, rows: withdrawals } = await Withdrawal.findAndCountAll({
      where: whereClause,
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
    console.error('Get withdrawals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get withdrawals'
    });
  }
};

// Get withdrawal details
const getWithdrawalDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const withdrawal = await Withdrawal.findOne({
      where: { id, user_id: userId }
    });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found'
      });
    }

    res.json({
      success: true,
      data: { withdrawal }
    });
  } catch (error) {
    console.error('Get withdrawal details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get withdrawal details'
    });
  }
};

// Process withdrawal (admin function)
const processWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, transaction_hash, notes } = req.body;

    const withdrawal = await Withdrawal.findByPk(id);
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found'
      });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal is not pending'
      });
    }

    if (action === 'approve') {
      // Approve withdrawal
      await withdrawal.update({
        status: 'approved',
        approved_at: new Date(),
        processed_by: req.user.id,
        notes: notes
      });

      // Update transaction status
      await Transaction.update(
        { status: 'processing' },
        { 
          where: { 
            reference_id: withdrawal.id.toString(),
            reference_type: 'withdrawal'
          }
        }
      );

      res.json({
        success: true,
        message: 'Withdrawal approved successfully'
      });
    } else if (action === 'reject') {
      // Reject withdrawal and refund
      await withdrawal.update({
        status: 'rejected',
        processed_by: req.user.id,
        notes: notes
      });

      // Refund the amount to user
      const user = await User.findByPk(withdrawal.user_id);
      const balanceField = withdrawal.currency === 'USDT' ? 'usdt_balance' : 'egd_balance';
      const newBalance = parseFloat(user[balanceField]) + withdrawal.amount;
      await user.update({ 
        [balanceField]: newBalance,
        total_withdrawn: parseFloat(user.total_withdrawn || 0) - withdrawal.amount
      });

      // Update transaction status
      await Transaction.update(
        { status: 'failed' },
        { 
          where: { 
            reference_id: withdrawal.id.toString(),
            reference_type: 'withdrawal'
          }
        }
      );

      // Create refund transaction
      await Transaction.create({
        user_id: withdrawal.user_id,
        transaction_type: 'refund',
        amount: withdrawal.amount,
        currency: withdrawal.currency,
        status: 'completed',
        description: `Withdrawal refund - ${notes}`,
        reference_id: withdrawal.id.toString(),
        reference_type: 'withdrawal',
        balance_before: user[balanceField],
        balance_after: newBalance,
        processed_by: req.user.id
      });

      res.json({
        success: true,
        message: 'Withdrawal rejected and amount refunded'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }
  } catch (error) {
    console.error('Process withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process withdrawal'
    });
  }
};

module.exports = {
  generatePaymentAddress,
  verifyPayment,
  convertTokens,
  requestWithdrawal,
  getWithdrawals,
  getWithdrawalDetails,
  processWithdrawal
}; 