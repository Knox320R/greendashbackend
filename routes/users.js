const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticateToken, requireVerification } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const profileValidation = [
  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
];

const passwordChangeValidation = [
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required'),
  body('new_password')
    .isLength({ min: 3 })
    .withMessage('New password must be at least 6 characters long')
];

// All routes require authentication
router.use(authenticateToken);

// Profile management
router.get('/profile', userController.getProfile);
router.put('/profile', profileValidation, userController.updateProfile);
router.put('/change-password', passwordChangeValidation, userController.changePassword);

// Dashboard and statistics
router.get('/dashboard', userController.getDashboard);
router.get('/referral-stats', userController.getReferralStats);

// Transaction history
router.get('/transactions', userController.getTransactions);

// Staking history
router.get('/stakings', userController.getStakings);

module.exports = router; 