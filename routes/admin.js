const express = require('express');
const { body, query } = require('express-validator');
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Validation middleware
const createPackageValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Package name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('stake_amount')
    .isFloat({ min: 1 })
    .withMessage('Stake amount must be at least 1'),
  body('daily_yield_percentage')
    .isFloat({ min: 0.0001, max: 10 })
    .withMessage('Daily yield must be between 0.0001% and 10%'),
  body('lock_period_days')
    .optional()
    .isInt({ min: 1, max: 3650 })
    .withMessage('Lock period must be between 1 and 3650 days'),
  body('min_stake_amount')
    .isFloat({ min: 1 })
    .withMessage('Minimum stake amount must be at least 1'),
  body('max_stake_amount')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Maximum stake amount must be at least 1'),
  body('is_promotional')
    .optional()
    .isBoolean()
    .withMessage('is_promotional must be a boolean'),
  body('promotional_expires_at')
    .optional()
    .isISO8601()
    .withMessage('Promotional expiry must be a valid date'),
  body('max_participants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max participants must be at least 1'),
  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer')
];

const updateUserValidation = [
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean'),
  body('is_admin')
    .optional()
    .isBoolean()
    .withMessage('is_admin must be a boolean'),
  body('is_email_verified')
    .optional()
    .isBoolean()
    .withMessage('is_email_verified must be a boolean'),
  body('egd_balance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('EGD balance must be non-negative'),
  body('usdt_balance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('USDT balance must be non-negative')
];

// Dashboard and statistics
router.get('/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id', updateUserValidation, adminController.updateUser);

// Staking package management
router.get('/packages', adminController.getAllStakingPackages);
router.post('/packages', createPackageValidation, adminController.createStakingPackage);
router.put('/packages/:id', adminController.updateStakingPackage);
router.delete('/packages/:id', adminController.deleteStakingPackage);

// Staking management
router.get('/stakings', adminController.getAllStakings);

// Transaction management
router.get('/transactions', adminController.getAllTransactions);

// Withdrawal management
router.get('/withdrawals', adminController.getAllWithdrawals);

module.exports = router; 