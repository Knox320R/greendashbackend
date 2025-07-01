const express = require('express');
const { body, query } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const { authenticateToken, requireVerification, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const paymentAddressValidation = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least 1 USDT')
];

const convertTokensValidation = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least 1 EGD token')
];

const withdrawalValidation = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least 1'),
  body('currency')
    .isIn(['USDT', 'EGD'])
    .withMessage('Currency must be USDT or EGD'),
  body('wallet_address')
    .isEthereumAddress()
    .withMessage('Please enter a valid wallet address'),
  body('network')
    .optional()
    .isIn(['BEP20', 'ERC20', 'TRC20'])
    .withMessage('Network must be BEP20, ERC20, or TRC20')
];

const verifyPaymentValidation = [
  body('transaction_id')
    .isInt({ min: 1 })
    .withMessage('Valid transaction ID is required'),
  body('transaction_hash')
    .isHexadecimal()
    .isLength({ min: 64, max: 66 })
    .withMessage('Valid transaction hash is required'),
  body('block_number')
    .isInt({ min: 1 })
    .withMessage('Valid block number is required')
];

const processWithdrawalValidation = [
  body('action')
    .isIn(['approve', 'reject'])
    .withMessage('Action must be approve or reject'),
  body('transaction_hash')
    .optional()
    .isHexadecimal()
    .isLength({ min: 64, max: 66 })
    .withMessage('Valid transaction hash is required'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

// Protected routes (require authentication)
router.use(authenticateToken);
router.use(requireVerification);

// Payment operations
router.post('/generate-address', paymentAddressValidation, paymentController.generatePaymentAddress);
router.post('/convert-tokens', convertTokensValidation, paymentController.convertTokens);

// Withdrawal operations
router.post('/withdraw', withdrawalValidation, paymentController.requestWithdrawal);
router.get('/withdrawals', paymentController.getWithdrawals);
router.get('/withdrawals/:id', paymentController.getWithdrawalDetails);

// Admin routes (require admin privileges)
router.post('/verify-payment', requireAdmin, verifyPaymentValidation, paymentController.verifyPayment);
router.post('/withdrawals/:id/process', requireAdmin, processWithdrawalValidation, paymentController.processWithdrawal);

module.exports = router; 